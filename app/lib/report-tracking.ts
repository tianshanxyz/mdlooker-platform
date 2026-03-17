/**
 * 报告下载追踪系统
 * 用于生成报告编号并追踪下载统计
 */

import { createClient } from './supabase';

// 报告类型定义
export type ReportType = 
  | 'MAP'   // Market Access Pathway
  | 'COMP'  // Compliance Profile
  | 'PROD'  // Product Registration
  | 'REG'   // Regulatory Agency
  | 'STAT'; // Statistics

// 报告类型配置
export const REPORT_TYPE_CONFIG: Record<ReportType, { nameEn: string; nameZh: string }> = {
  MAP: { nameEn: 'Market Access Pathway Report', nameZh: '市场准入路径报告' },
  COMP: { nameEn: 'Compliance Profile Report', nameZh: '合规档案报告' },
  PROD: { nameEn: 'Product Registration Report', nameZh: '产品注册报告' },
  REG: { nameEn: 'Regulatory Agency Report', nameZh: '监管机构报告' },
  STAT: { nameEn: 'Market Statistics Report', nameZh: '市场统计报告' },
};

// 生成报告编号
// 格式: MDL-[TYPE]-[YYYYMMDD]-[随机码]
// 示例: MDL-MAP-20260115-A3B7
export function generateReportId(type: ReportType): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MDL-${type}-${year}${month}${day}-${random}`;
}

// 解析报告编号
export function parseReportId(reportId: string): {
  type: ReportType | null;
  date: Date | null;
  random: string | null;
} {
  const match = reportId.match(/^MDL-(MAP|COMP|PROD|REG|STAT)-(\d{8})-([A-Z0-9]{4})$/);
  if (!match) {
    return { type: null, date: null, random: null };
  }
  
  const type = match[1] as ReportType;
  const dateStr = match[2];
  const random = match[3];
  
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  
  return {
    type,
    date: new Date(year, month, day),
    random,
  };
}

// 记录报告下载
export async function trackReportDownload(
  reportId: string,
  userId: string | null,
  type: ReportType,
  target: string,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.from('report_downloads').insert({
      report_id: reportId,
      user_id: userId,
      report_type: type,
      target: target,
      metadata: metadata || {},
      downloaded_at: new Date().toISOString(),
      ip_address: null, // 可在服务端获取
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null,
    });
    
    if (error) {
      console.error('Failed to track report download:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking report download:', error);
    return false;
  }
}

// 获取下载统计（用于后台管理）
export async function getDownloadStats(
  startDate?: Date,
  endDate?: Date
): Promise<{
  total: number;
  byType: Record<ReportType, number>;
  byMonth: Record<string, number>;
  recent: Array<{
    reportId: string;
    type: ReportType;
    target: string;
    downloadedAt: string;
    userId: string | null;
  }>;
}> {
  try {
    const supabase = createClient();
    
    let query = supabase
      .from('report_downloads')
      .select('*')
      .order('downloaded_at', { ascending: false });
    
    if (startDate) {
      query = query.gte('downloaded_at', startDate.toISOString());
    }
    if (endDate) {
      query = query.lte('downloaded_at', endDate.toISOString());
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to get download stats:', error);
      return {
        total: 0,
        byType: { MAP: 0, COMP: 0, PROD: 0, REG: 0, STAT: 0 },
        byMonth: {},
        recent: [],
      };
    }
    
    // 统计按类型
    const byType: Record<ReportType, number> = {
      MAP: 0,
      COMP: 0,
      PROD: 0,
      REG: 0,
      STAT: 0,
    };
    
    // 统计按月
    const byMonth: Record<string, number> = {};
    
    data.forEach((record) => {
      // 按类型统计
      if (record.report_type in byType) {
        byType[record.report_type as ReportType]++;
      }
      
      // 按月统计
      const date = new Date(record.downloaded_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
    });
    
    return {
      total: data.length,
      byType,
      byMonth,
      recent: data.slice(0, 10).map((record) => ({
        reportId: record.report_id,
        type: record.report_type as ReportType,
        target: record.target,
        downloadedAt: record.downloaded_at,
        userId: record.user_id,
      })),
    };
  } catch (error) {
    console.error('Error getting download stats:', error);
    return {
      total: 0,
      byType: { MAP: 0, COMP: 0, PROD: 0, REG: 0, STAT: 0 },
      byMonth: {},
      recent: [],
    };
  }
}

// 获取月度下载统计（用于后台图表）
export async function getMonthlyDownloadStats(
  year: number
): Promise<Array<{
  month: string;
  total: number;
  byType: Record<ReportType, number>;
}>> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);
  
  const stats = await getDownloadStats(startDate, endDate);
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map((month, index) => {
    const monthKey = `${year}-${String(index + 1).padStart(2, '0')}`;
    return {
      month,
      total: stats.byMonth[monthKey] || 0,
      byType: {
        MAP: 0,
        COMP: 0,
        PROD: 0,
        REG: 0,
        STAT: 0,
      },
    };
  });
}

// 验证报告编号是否存在
export async function verifyReportId(reportId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('report_downloads')
      .select('id')
      .eq('report_id', reportId)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying report ID:', error);
    return false;
  }
}
