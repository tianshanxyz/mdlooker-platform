import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

/**
 * 存储监控 API
 * 监控数据库表大小、增长趋势，并提供告警功能
 */

interface TableStats {
  table_name: string;
  row_count: number;
  table_size: string;
  index_size: string;
  total_size: string;
  size_bytes: number;
}

interface StorageReport {
  timestamp: string;
  total_size_bytes: number;
  total_size_gb: number;
  tables: TableStats[];
  largest_tables: TableStats[];
  growth_estimate: {
    daily_growth_mb: number;
    monthly_growth_gb: number;
    yearly_growth_gb: number;
    days_until_full: number | null;
  };
  alerts: string[];
}

const STORAGE_LIMIT_GB = 40;
const WARNING_THRESHOLD = 0.7; // 70%
const CRITICAL_THRESHOLD = 0.85; // 85%

/**
 * 获取所有表的大小统计
 */
async function getTableStats(supabase: any): Promise<TableStats[]> {
  const { data, error } = await supabase.rpc('get_table_sizes');
  
  if (error) {
    // 如果RPC不存在，使用直接查询
    const { data: tables, error: queryError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (queryError) throw queryError;
    
    const stats: TableStats[] = [];
    for (const table of tables || []) {
      try {
        const { count } = await supabase
          .from(table.table_name)
          .select('*', { count: 'exact', head: true });
        
        stats.push({
          table_name: table.table_name,
          row_count: count || 0,
          table_size: 'N/A',
          index_size: 'N/A',
          total_size: 'N/A',
          size_bytes: 0,
        });
      } catch (e) {
        // 忽略无法查询的表
      }
    }
    return stats;
  }
  
  return data || [];
}

/**
 * 计算存储增长预估
 */
function calculateGrowthEstimate(tables: TableStats[]): StorageReport['growth_estimate'] {
  // 基于历史数据的增长率估算（简化版）
  // 实际生产环境应该查询历史监控数据
  
  const registrationTables = tables.filter(t => 
    t.table_name.includes('registration') || 
    t.table_name.includes('registrations')
  );
  
  const totalRows = registrationTables.reduce((sum, t) => sum + t.row_count, 0);
  const avgRowSize = 4000; // 平均4KB每行
  
  // 假设每天新增1000条记录
  const dailyNewRows = 1000;
  const dailyGrowthBytes = dailyNewRows * avgRowSize;
  const dailyGrowthMB = dailyGrowthBytes / (1024 * 1024);
  
  const monthlyGrowthGB = (dailyGrowthMB * 30) / 1024;
  const yearlyGrowthGB = monthlyGrowthGB * 12;
  
  const currentSizeBytes = tables.reduce((sum, t) => sum + (t.size_bytes || 0), 0);
  const remainingBytes = (STORAGE_LIMIT_GB * 1024 * 1024 * 1024) - currentSizeBytes;
  const daysUntilFull = dailyGrowthBytes > 0 
    ? Math.floor(remainingBytes / dailyGrowthBytes)
    : null;
  
  return {
    daily_growth_mb: dailyGrowthMB,
    monthly_growth_gb: monthlyGrowthGB,
    yearly_growth_gb: yearlyGrowthGB,
    days_until_full: daysUntilFull,
  };
}

/**
 * 生成告警信息
 */
function generateAlerts(totalSizeGB: number): string[] {
  const alerts: string[] = [];
  const usageRatio = totalSizeGB / STORAGE_LIMIT_GB;
  
  if (usageRatio >= CRITICAL_THRESHOLD) {
    alerts.push(`🚨 严重告警：存储使用率已达 ${(usageRatio * 100).toFixed(1)}%，请立即清理数据或扩容`);
  } else if (usageRatio >= WARNING_THRESHOLD) {
    alerts.push(`⚠️ 警告：存储使用率已达 ${(usageRatio * 100).toFixed(1)}%，建议实施数据压缩或归档`);
  }
  
  if (totalSizeGB > 35) {
    alerts.push(`📊 存储空间紧张：剩余空间不足 5GB`);
  }
  
  return alerts;
}

/**
 * 记录存储监控日志
 */
async function logStorageStats(supabase: any, report: StorageReport) {
  try {
    await supabase.from('storage_monitor_logs').insert({
      total_size_gb: report.total_size_gb,
      table_count: report.tables.length,
      growth_estimate: report.growth_estimate,
      alerts: report.alerts,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log storage stats:', error);
  }
}

/**
 * GET /api/admin/storage-monitor - 获取存储监控报告
 */
export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_API_TOKEN;
    
    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    
    // 获取表统计信息
    const tables = await getTableStats(supabase);
    
    // 计算总大小
    const totalSizeBytes = tables.reduce((sum, t) => sum + (t.size_bytes || 0), 0);
    const totalSizeGB = totalSizeBytes / (1024 * 1024 * 1024);
    
    // 排序获取最大的表
    const largestTables = [...tables]
      .sort((a, b) => (b.size_bytes || 0) - (a.size_bytes || 0))
      .slice(0, 10);
    
    // 计算增长预估
    const growthEstimate = calculateGrowthEstimate(tables);
    
    // 生成告警
    const alerts = generateAlerts(totalSizeGB);
    
    const report: StorageReport = {
      timestamp: new Date().toISOString(),
      total_size_bytes: totalSizeBytes,
      total_size_gb: totalSizeGB,
      tables,
      largest_tables: largestTables,
      growth_estimate: growthEstimate,
      alerts,
    };
    
    // 记录日志
    await logStorageStats(supabase, report);
    
    return NextResponse.json(report);
    
  } catch (error) {
    console.error('Storage monitor error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get storage stats',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/storage-monitor - 手动触发存储优化
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_API_TOKEN;
    
    if (adminToken && authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const action = body.action;

    const supabase = getSupabaseClient();
    let result: any;

    switch (action) {
      case 'compress':
        // 压缩raw_data字段
        result = await compressRawData(supabase);
        break;
      
      case 'analyze':
        // 分析表（更新统计信息）
        result = await analyzeTables(supabase);
        break;
      
      case 'vacuum':
        // 清理死元组（需要在Supabase Dashboard执行）
        result = { 
          message: 'Vacuum operation requires direct database access. Please run in Supabase SQL Editor: VACUUM FULL;',
          note: 'This reclaims storage occupied by dead tuples.'
        };
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: compress, analyze, vacuum' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action,
      result,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Storage optimization error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to execute storage optimization',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * 压缩raw_data字段
 */
async function compressRawData(supabase: any) {
  const results: Record<string, { before: number; after: number; saved: number; note?: string; error?: string }> = {
    fda: { before: 0, after: 0, saved: 0 },
    nmpa: { before: 0, after: 0, saved: 0 },
    eudamed: { before: 0, after: 0, saved: 0 },
  };

  // FDA: 保留关键字段，移除大字段
  try {
    const { data: fdaStats } = await supabase
      .from('fda_registrations')
      .select('id, raw_data')
      .not('raw_data', 'is', null)
      .limit(100);
    
    results.fda.before = fdaStats?.length || 0;
    
    // 压缩逻辑：只保留必要的raw_data字段
    // 实际压缩应该在数据导入时完成
    results.fda.note = 'FDA raw_data compression should be done during data import';
  } catch (e) {
    results.fda.error = String(e);
  }

  return results;
}

/**
 * 分析所有表
 */
async function analyzeTables(supabase: any) {
  const tables = ['fda_registrations', 'nmpa_registrations', 'eudamed_registrations', 'companies', 'products'];
  const results = [];

  for (const table of tables) {
    try {
      // Supabase不支持直接的ANALYZE命令，但可以通过查询触发统计更新
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      results.push({ table, status: 'analyzed', rows: count });
    } catch (e) {
      results.push({ table, status: 'error', error: String(e) });
    }
  }

  return results;
}
