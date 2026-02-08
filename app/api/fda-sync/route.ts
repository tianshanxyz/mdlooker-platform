import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../lib/supabase';

const FDA_API_BASE = 'https://api.fda.gov';

interface FDARegistration {
  registration_number: string;
  fei_number: string;
  owner_operator_number: string;
  registration_status: string;
  registration_date: string;
  product_code?: string;
  device_class?: string;
  device_name?: string;
  device_description?: string;
  regulation_number?: string;
  establishment_type?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
}

/**
 * 从 FDA API 获取注册企业数据
 */
async function fetchFDARegistrations(limit: number = 100, skip: number = 0): Promise<FDARegistration[]> {
  const apiKey = process.env.FDA_API_KEY;
  if (!apiKey) {
    throw new Error('FDA_API_KEY not configured');
  }

  // 使用 FDA Device Registration and Listing API
  const url = `${FDA_API_BASE}/device/registrationlisting.json?api_key=${apiKey}&limit=${limit}&skip=${skip}`;
  
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FDA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  // 转换 FDA 数据格式
  return data.results.map((item: any) => ({
    registration_number: item.registration_number || '',
    fei_number: item.fei_number || '',
    owner_operator_number: item.owner_operator?.owner_operator_number || '',
    registration_status: item.registration_status || 'Unknown',
    registration_date: item.registration_initial_date || '',
    product_code: item.products?.[0]?.product_code || '',
    device_class: item.products?.[0]?.device_class || '',
    device_name: item.products?.[0]?.device_name || '',
    device_description: item.products?.[0]?.device_description || '',
    regulation_number: item.products?.[0]?.regulation_number || '',
    establishment_type: item.establishment_type || '',
    address: item.address || '',
    city: item.city || '',
    state: item.state || '',
    zip: item.zip_code || '',
    country: item.country_code || 'USA',
  }));
}

/**
 * 同步 FDA 数据到 Supabase
 */
async function syncFDADataToSupabase(registrations: FDARegistration[]) {
  const supabase = getSupabaseClient();
  const results = {
    companiesAdded: 0,
    registrationsAdded: 0,
    errors: [] as string[],
  };

  for (const reg of registrations) {
    try {
      // 1. 查找或创建公司
      let companyId: string;
      
      // 尝试通过 FEI 号码查找现有公司
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('fda_fei_number', reg.fei_number)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
        // 创建新公司
        const companyName = reg.device_name 
          ? reg.device_name.split(' ').slice(0, 3).join(' ') + ' Inc.'
          : `FDA Registered Company ${reg.registration_number}`;
        
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            name_zh: null,
            country: reg.country || 'USA',
            address: reg.address,
            website: null,
            business_type: reg.establishment_type || 'Manufacturer',
            description: `FDA registered medical device company. ${reg.device_description || ''}`,
            description_zh: null,
            fda_fei_number: reg.fei_number,
          })
          .select('id')
          .single();

        if (companyError) {
          results.errors.push(`Failed to create company: ${companyError.message}`);
          continue;
        }

        companyId = newCompany.id;
        results.companiesAdded++;
      }

      // 2. 添加 FDA 注册记录
      const { error: regError } = await supabase
        .from('fda_registrations')
        .upsert({
          company_id: companyId,
          registration_number: reg.registration_number,
          fei_number: reg.fei_number,
          owner_operator_number: reg.owner_operator_number,
          registration_status: reg.registration_status,
          registration_date: reg.registration_date,
          product_code: reg.product_code,
          device_class: reg.device_class,
          device_name: reg.device_name,
          device_description: reg.device_description,
          regulation_number: reg.regulation_number,
          establishment_type: reg.establishment_type,
          address: reg.address,
          city: reg.city,
          state: reg.state,
          zip: reg.zip,
          country: reg.country,
          source_url: `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm?lid=${reg.registration_number}`,
          last_synced_at: new Date().toISOString(),
        }, {
          onConflict: 'registration_number',
        });

      if (regError) {
        results.errors.push(`Failed to add registration: ${regError.message}`);
      } else {
        results.registrationsAdded++;
      }

    } catch (error) {
      results.errors.push(`Error processing registration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return results;
}

/**
 * GET /api/fda-sync - 手动触发 FDA 数据同步
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const skip = parseInt(searchParams.get('skip') || '0', 10);

    // 1. 从 FDA API 获取数据
    const registrations = await fetchFDARegistrations(limit, skip);

    if (registrations.length === 0) {
      return NextResponse.json({
        message: 'No data fetched from FDA API',
        timestamp: new Date().toISOString(),
      });
    }

    // 2. 同步到 Supabase
    const results = await syncFDADataToSupabase(registrations);

    return NextResponse.json({
      success: true,
      message: 'FDA data sync completed',
      stats: {
        fetched: registrations.length,
        companiesAdded: results.companiesAdded,
        registrationsAdded: results.registrationsAdded,
        errors: results.errors.length,
      },
      errors: results.errors.slice(0, 10), // 只返回前10个错误
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('FDA sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/fda-sync - 带认证的同步（用于定时任务）
 */
export async function POST(request: NextRequest) {
  try {
    // 验证请求（可以通过 header token 或 API key）
    const authHeader = request.headers.get('authorization');
    const syncToken = process.env.SYNC_TOKEN;
    
    if (syncToken && authHeader !== `Bearer ${syncToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const limit = body.limit || 100;
    const skip = body.skip || 0;

    const registrations = await fetchFDARegistrations(limit, skip);
    const results = await syncFDADataToSupabase(registrations);

    return NextResponse.json({
      success: true,
      stats: {
        fetched: registrations.length,
        companiesAdded: results.companiesAdded,
        registrationsAdded: results.registrationsAdded,
        errors: results.errors.length,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('FDA sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
