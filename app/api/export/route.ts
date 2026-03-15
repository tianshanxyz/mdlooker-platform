import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

/**
 * CSV 导出 API
 * 
 * 支持的导出类型：
 * - search: 搜索结果导出
 * - company: 公司详情导出
 * - registrations: 注册信息导出
 * 
 * 查询参数：
 * - type: 导出类型 (search|company|registrations)
 * - ids: 公司 ID 列表（逗号分隔，用于 company 类型）
 * - query: 搜索关键词（用于 search 类型）
 * - format: 导出格式 (csv|json)，默认 csv
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'search';
    const ids = searchParams.get('ids');
    const query = searchParams.get('query');
    const format = searchParams.get('format') || 'csv';
    
    const supabase = getSupabaseClient();
    let data: any[] = [];
    let filename = 'export';
    
    if (type === 'search') {
      // 导出搜索结果
      if (!query) {
        return NextResponse.json(
          { error: 'Search query is required' },
          { status: 400 }
        );
      }
      
      const { data: searchResults, error } = await supabase
        .from('companies')
        .select(`
          *,
          fda_registrations (count),
          nmpa_registrations (count),
          eudamed_registrations (count)
        `)
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(1000);
      
      if (error) throw error;
      data = searchResults || [];
      filename = `search_${query.replace(/\s+/g, '_')}`;
      
    } else if (type === 'company') {
      // 导出公司详情
      if (!ids) {
        return NextResponse.json(
          { error: 'Company IDs are required' },
          { status: 400 }
        );
      }
      
      const companyIds = ids.split(',');
      const { data: companies, error } = await supabase
        .from('companies')
        .select('*')
        .in('id', companyIds);
      
      if (error) throw error;
      data = companies || [];
      filename = `company_${companyIds[0]}`;
      
    } else if (type === 'registrations') {
      // 导出注册信息
      const companyId = searchParams.get('company_id');
      const source = searchParams.get('source') || 'all';
      
      if (!companyId) {
        return NextResponse.json(
          { error: 'Company ID is required' },
          { status: 400 }
        );
      }
      
      let registrations: any[] = [];
      
      if (source === 'all' || source === 'nmpa') {
        const { data: nmpaData } = await supabase
          .from('nmpa_registrations')
          .select('*')
          .eq('company_id', companyId);
        if (nmpaData) registrations = [...registrations, ...nmpaData];
      }
      
      if (source === 'all' || source === 'fda') {
        const { data: fdaData } = await supabase
          .from('fda_registrations')
          .select('*')
          .eq('company_id', companyId);
        if (fdaData) registrations = [...registrations, ...fdaData];
      }
      
      if (source === 'all' || source === 'eudamed') {
        const { data: eudamedData } = await supabase
          .from('eudamed_registrations')
          .select('*')
          .eq('company_id', companyId);
        if (eudamedData) registrations = [...registrations, ...eudamedData];
      }
      
      data = registrations;
      filename = `registrations_${companyId}`;
    }
    
    // 转换为 CSV
    if (format === 'csv') {
      const csv = convertToCSV(data);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv;charset=utf-8;',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    } else {
      // JSON 格式
      return NextResponse.json(data);
    }
    
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Export failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * 将数据转换为 CSV 格式
 */
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }
  
  // 获取所有字段名
  const fields = getAllFields(data);
  
  // CSV 头部
  const headers = fields.map(field => `"${field}"`).join(',');
  
  // CSV 数据行
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field];
      // 处理不同类型的值
      if (value === null || value === undefined) {
        return '""';
      } else if (typeof value === 'string') {
        // 转义双引号
        return `"${value.replace(/"/g, '""')}"`;
      } else if (typeof value === 'object') {
        // 对象转换为 JSON 字符串
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
      } else {
        return `"${value}"`;
      }
    }).join(',');
  });
  
  return [headers, ...rows].join('\n');
}

/**
 * 获取数据的所有字段名
 */
function getAllFields(data: any[]): string[] {
  const fields = new Set<string>();
  
  data.forEach(item => {
    Object.keys(item).forEach(key => fields.add(key));
  });
  
  // 优先显示重要字段
  const priorityFields = [
    'id', 'name', 'name_zh', 'country', 'business_type',
    'product_name', 'product_name_zh', 'registration_number',
    'approval_date', 'expiration_date', 'manufacturer', 'manufacturer_zh'
  ];
  
  const allFields = Array.from(fields);
  const prioritized: string[] = [];
  const others: string[] = [];
  
  priorityFields.forEach(field => {
    if (allFields.includes(field)) {
      prioritized.push(field);
    }
  });
  
  allFields.forEach(field => {
    if (!priorityFields.includes(field)) {
      others.push(field);
    }
  });
  
  return [...prioritized, ...others.sort()];
}
