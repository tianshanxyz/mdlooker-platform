import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 初始化Supabase客户端
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// 支持的监管机构
const AUTHORITIES = ['HSA', 'PMDA', 'SFDA'] as const;
type Authority = typeof AUTHORITIES[number];

interface SearchParams {
  authority?: Authority | 'all';
  query?: string;
  manufacturer?: string;
  deviceClass?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

// 搜索HSA数据
async function searchHSA(params: SearchParams) {
  let query = supabase
    .from('hsa_registrations')
    .select('*', { count: 'exact' })
    .eq('registration_status', 'Active');

  if (params.query) {
    query = query.or(`device_name.ilike.%${params.query}%,device_name_zh.ilike.%${params.query}%`);
  }

  if (params.manufacturer) {
    query = query.ilike('manufacturer_name', `%${params.manufacturer}%`);
  }

  if (params.deviceClass) {
    query = query.eq('risk_class', params.deviceClass);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('registration_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data?.map(item => ({
      ...item,
      authority: 'HSA',
      country: 'Singapore',
      regNumber: item.registration_number,
      deviceClass: item.risk_class,
      status: item.registration_status,
    })) || [],
    count: count || 0,
  };
}

// 搜索PMDA数据
async function searchPMDA(params: SearchParams) {
  let query = supabase
    .from('pmda_approvals')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'Approved');

  if (params.query) {
    query = query.or(`device_name.ilike.%${params.query}%,device_name_jp.ilike.%${params.query}%`);
  }

  if (params.manufacturer) {
    query = query.ilike('manufacturer_name', `%${params.manufacturer}%`);
  }

  if (params.deviceClass) {
    query = query.eq('classification', params.deviceClass);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('approval_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data?.map(item => ({
      ...item,
      authority: 'PMDA',
      country: 'Japan',
      regNumber: item.approval_number,
      deviceClass: item.classification,
      status: item.approval_status,
    })) || [],
    count: count || 0,
  };
}

// 搜索SFDA数据
async function searchSFDA(params: SearchParams) {
  let query = supabase
    .from('sfda_mdma')
    .select('*', { count: 'exact' })
    .eq('approval_status', 'Approved');

  if (params.query) {
    query = query.or(`device_name.ilike.%${params.query}%,device_name_ar.ilike.%${params.query}%`);
  }

  if (params.manufacturer) {
    query = query.ilike('manufacturer_name', `%${params.manufacturer}%`);
  }

  if (params.deviceClass) {
    query = query.eq('risk_class', params.deviceClass);
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order('issue_date', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: data?.map(item => ({
      ...item,
      authority: 'SFDA',
      country: 'Saudi Arabia',
      regNumber: item.mdma_number,
      deviceClass: item.risk_class,
      status: item.approval_status,
    })) || [],
    count: count || 0,
  };
}

// 统一搜索所有机构
async function searchAll(params: SearchParams) {
  const [hsaResult, pmdaResult, sfdaResult] = await Promise.all([
    searchHSA(params),
    searchPMDA(params),
    searchSFDA(params),
  ]);

  // 合并结果
  const allData = [
    ...hsaResult.data,
    ...pmdaResult.data,
    ...sfdaResult.data,
  ];

  // 按日期排序
  allData.sort((a, b) => {
    const dateA = new Date(a.registration_date || a.approval_date || a.issue_date || 0);
    const dateB = new Date(b.registration_date || b.approval_date || b.issue_date || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // 分页
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const paginatedData = allData.slice(start, end);

  return {
    data: paginatedData,
    count: allData.length,
    byAuthority: {
      HSA: hsaResult.count,
      PMDA: pmdaResult.count,
      SFDA: sfdaResult.count,
    },
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params: SearchParams = {
      authority: searchParams.get('authority') as Authority | 'all' || 'all',
      query: searchParams.get('q') || undefined,
      manufacturer: searchParams.get('manufacturer') || undefined,
      deviceClass: searchParams.get('class') || undefined,
      status: searchParams.get('status') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      pageSize: parseInt(searchParams.get('pageSize') || '20'),
    };

    let result;

    switch (params.authority) {
      case 'HSA':
        result = await searchHSA(params);
        break;
      case 'PMDA':
        result = await searchPMDA(params);
        break;
      case 'SFDA':
        result = await searchSFDA(params);
        break;
      case 'all':
      default:
        result = await searchAll(params);
        break;
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        total: result.count,
        totalPages: Math.ceil(result.count / (params.pageSize || 20)),
      },
      ...(result.byAuthority && { byAuthority: result.byAuthority }),
    });

  } catch (error) {
    console.error('International registrations API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch international registrations' },
      { status: 500 }
    );
  }
}

// 获取统计数据
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'stats') {
      // 获取各机构统计数据
      const [hsaCount, pmdaCount, sfdaCount] = await Promise.all([
        supabase.from('hsa_registrations').select('*', { count: 'exact', head: true })
          .eq('registration_status', 'Active'),
        supabase.from('pmda_approvals').select('*', { count: 'exact', head: true })
          .eq('approval_status', 'Approved'),
        supabase.from('sfda_mdma').select('*', { count: 'exact', head: true })
          .eq('approval_status', 'Approved'),
      ]);

      return NextResponse.json({
        success: true,
        stats: {
          HSA: { count: hsaCount.count || 0, country: 'Singapore' },
          PMDA: { count: pmdaCount.count || 0, country: 'Japan' },
          SFDA: { count: sfdaCount.count || 0, country: 'Saudi Arabia' },
          total: (hsaCount.count || 0) + (pmdaCount.count || 0) + (sfdaCount.count || 0),
        },
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
