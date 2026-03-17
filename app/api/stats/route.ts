import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

/**
 * 数据统计 API
 * 
 * 支持的统计类型：
 * - country-summary: 各国注册数量统计
 * - monthly-trend: 月度注册趋势
 * - company-stats: 公司统计
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || 'country-summary';
    const months = parseInt(searchParams.get('months') || '12', 10);
    
    const supabase = getSupabaseClient();
    let data: any;
    
    if (type === 'country-summary') {
      // 各国注册数量统计
      data = await getCountrySummary(supabase);
    } else if (type === 'monthly-trend') {
      // 月度注册趋势
      data = await getMonthlyTrend(supabase, months);
    } else if (type === 'company-stats') {
      // 公司统计
      const companyId = searchParams.get('company_id');
      if (companyId) {
        data = await getCompanyStats(supabase, companyId);
      } else {
        data = await getAllCompaniesStats(supabase);
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type. Supported: country-summary, monthly-trend, company-stats' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to get statistics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * 各国注册数量统计
 */
async function getCountrySummary(supabase: any) {
  // NMPA (中国)
  const { count: nmpaCount } = await supabase
    .from('nmpa_registrations')
    .select('*', { count: 'exact', head: true });
  
  // FDA (美国)
  const { count: fdaCount } = await supabase
    .from('fda_registrations')
    .select('*', { count: 'exact', head: true });
  
  // EUDAMED (欧盟)
  const { count: eudamedCount } = await supabase
    .from('eudamed_registrations')
    .select('*', { count: 'exact', head: true });
  
  return {
    countries: [
      { name: 'China', name_zh: '中国', count: nmpaCount || 0, flag: '🇨🇳' },
      { name: 'USA', name_zh: '美国', count: fdaCount || 0, flag: '🇺🇸' },
      { name: 'EU', name_zh: '欧盟', count: eudamedCount || 0, flag: '🇪🇺' },
    ],
    total: (nmpaCount || 0) + (fdaCount || 0) + (eudamedCount || 0),
    updated_at: new Date().toISOString()
  };
}

/**
 * 月度注册趋势
 */
async function getMonthlyTrend(supabase: any, months: number = 12) {
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - months);
  
  // NMPA 月度趋势
  const { data: nmpaTrend } = await supabase
    .from('nmpa_registrations')
    .select('approval_date')
    .gte('approval_date', cutoffDate.toISOString())
    .not('approval_date', 'is', null);
  
  // FDA 月度趋势
  const { data: fdaTrend } = await supabase
    .from('fda_registrations')
    .select('approval_date')
    .gte('approval_date', cutoffDate.toISOString())
    .not('approval_date', 'is', null);
  
  // EUDAMED 月度趋势
  const { data: eudamedTrend } = await supabase
    .from('eudamed_registrations')
    .select('approval_date')
    .gte('approval_date', cutoffDate.toISOString())
    .not('approval_date', 'is', null);
  
  // 按月份聚合
  const monthlyData: Record<string, any> = {};
  
  const processTrend = (data: any[], source: string) => {
    data?.forEach(item => {
      if (!item.approval_date) return;
      const date = new Date(item.approval_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          nmpa: 0,
          fda: 0,
          eudamed: 0,
          total: 0
        };
      }
      
      monthlyData[monthKey][source]++;
      monthlyData[monthKey].total++;
    });
  };
  
  processTrend(nmpaTrend || [], 'nmpa');
  processTrend(fdaTrend || [], 'fda');
  processTrend(eudamedTrend || [], 'eudamed');
  
  // 转换为数组并排序
  const trend = Object.values(monthlyData).sort((a: any, b: any) => 
    a.month.localeCompare(b.month)
  );
  
  return {
    trend,
    months,
    updated_at: new Date().toISOString()
  };
}

/**
 * 单个公司统计
 */
async function getCompanyStats(supabase: any, companyId: string) {
  // NMPA 数量
  const { count: nmpaCount } = await supabase
    .from('nmpa_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  
  // FDA 数量
  const { count: fdaCount } = await supabase
    .from('fda_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  
  // EUDAMED 数量
  const { count: eudamedCount } = await supabase
    .from('eudamed_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', companyId);
  
  // 获取公司信息
  const { data: company } = await supabase
    .from('companies')
    .select('name, name_zh, country')
    .eq('id', companyId)
    .single();
  
  return {
    company,
    registrations: {
      nmpa: nmpaCount || 0,
      fda: fdaCount || 0,
      eudamed: eudamedCount || 0,
      total: (nmpaCount || 0) + (fdaCount || 0) + (eudamedCount || 0)
    },
    updated_at: new Date().toISOString()
  };
}

/**
 * 所有公司统计（Top N）
 */
async function getAllCompaniesStats(supabase: any) {
  // 获取公司列表及其注册数量
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      id,
      name,
      name_zh,
      country,
      nmpa_registrations (count),
      fda_registrations (count),
      eudamed_registrations (count)
    `)
    .limit(20);
  
  const stats = (companies || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    name_zh: c.name_zh,
    country: c.country,
    nmpa_count: (c.nmpa_registrations as any[])?.[0]?.count || 0,
    fda_count: (c.fda_registrations as any[])?.[0]?.count || 0,
    eudamed_count: (c.eudamed_registrations as any[])?.[0]?.count || 0,
    total: ((c.nmpa_registrations as any[])?.[0]?.count || 0) +
           ((c.fda_registrations as any[])?.[0]?.count || 0) +
           ((c.eudamed_registrations as any[])?.[0]?.count || 0)
  })).sort((a: any, b: any) => b.total - a.total);
  
  return {
    companies: stats,
    total_companies: stats.length,
    updated_at: new Date().toISOString()
  };
}
