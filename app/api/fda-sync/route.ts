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

interface FDA510k {
  k_number: string;
  device_name: string;
  applicant: string;
  decision_code: string;
  decision_date: string;
  product_code?: string;
  device_class?: string;
  summary?: string;
}

interface FDAPMA {
  pma_number: string;
  device_name: string;
  applicant: string;
  approval_order_date: string;
  product_code?: string;
  device_class?: string;
  summary?: string;
}

interface FDAUDI {
  device_identifiers: string;
  brand_name: string;
  version_model_number: string;
  company_name: string;
  device_description: string;
  gmdn_terms?: string;
}

/**
 * 从 FDA API 获取注册企业数据
 */
async function fetchFDARegistrations(limit: number = 100, skip: number = 0): Promise<FDARegistration[]> {
  const apiKey = process.env.FDA_API_KEY;
  if (!apiKey) {
    throw new Error('FDA_API_KEY not configured');
  }

  const url = `${FDA_API_BASE}/device/registrationlisting.json?api_key=${apiKey}&limit=${limit}&skip=${skip}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FDA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

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
 * 从 FDA API 获取 510k 数据
 */
async function fetchFDA510k(limit: number = 100, skip: number = 0): Promise<FDA510k[]> {
  const apiKey = process.env.FDA_API_KEY;
  if (!apiKey) {
    throw new Error('FDA_API_KEY not configured');
  }

  const url = `${FDA_API_BASE}/device/510k.json?api_key=${apiKey}&limit=${limit}&skip=${skip}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FDA 510k API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    k_number: item.k_number || '',
    device_name: item.device_name || '',
    applicant: item.applicant || '',
    decision_code: item.decision_code || '',
    decision_date: item.decision_date || '',
    product_code: item.product_code || '',
    device_class: item.device_class || '',
    summary: item.summary || '',
  }));
}

/**
 * 从 FDA API 获取 PMA 数据
 */
async function fetchFDAPMA(limit: number = 100, skip: number = 0): Promise<FDAPMA[]> {
  const apiKey = process.env.FDA_API_KEY;
  if (!apiKey) {
    throw new Error('FDA_API_KEY not configured');
  }

  const url = `${FDA_API_BASE}/device/pma.json?api_key=${apiKey}&limit=${limit}&skip=${skip}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FDA PMA API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    pma_number: item.pma_number || '',
    device_name: item.device_name || '',
    applicant: item.applicant || '',
    approval_order_date: item.approval_order_date || '',
    product_code: item.product_code || '',
    device_class: item.device_class || '',
    summary: item.summary || '',
  }));
}

/**
 * 从 FDA API 获取 UDI 数据
 */
async function fetchFDAUDI(limit: number = 100, skip: number = 0): Promise<FDAUDI[]> {
  const apiKey = process.env.FDA_API_KEY;
  if (!apiKey) {
    throw new Error('FDA_API_KEY not configured');
  }

  const url = `${FDA_API_BASE}/device/udi.json?api_key=${apiKey}&limit=${limit}&skip=${skip}`;
  
  const response = await fetch(url, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`FDA UDI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.results || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map((item: any) => ({
    device_identifiers: item.device_identifiers || '',
    brand_name: item.brand_name || '',
    version_model_number: item.version_model_number || '',
    company_name: item.company_name || '',
    device_description: item.device_description || '',
    gmdn_terms: item.gmdn_terms || '',
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
      let companyId: string;
      
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('id')
        .eq('fda_fei_number', reg.fei_number)
        .single();

      if (existingCompany) {
        companyId = existingCompany.id;
      } else {
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
    const dataType = searchParams.get('type') || 'registration'; // registration, 510k, pma, udi

    let results: any;
    let message: string;

    switch (dataType) {
      case 'registration':
        const registrations = await fetchFDARegistrations(limit, skip);
        results = await syncFDADataToSupabase(registrations);
        message = 'FDA registration data sync completed';
        break;
      
      case '510k':
        const fda510k = await fetchFDA510k(limit, skip);
        results = {
          fetched: fda510k.length,
          data: fda510k.slice(0, 5), // 只返回前5条示例
        };
        message = 'FDA 510k data fetched';
        break;
      
      case 'pma':
        const fdaPMA = await fetchFDAPMA(limit, skip);
        results = {
          fetched: fdaPMA.length,
          data: fdaPMA.slice(0, 5), // 只返回前5条示例
        };
        message = 'FDA PMA data fetched';
        break;
      
      case 'udi':
        const fdaUDI = await fetchFDAUDI(limit, skip);
        results = {
          fetched: fdaUDI.length,
          data: fdaUDI.slice(0, 5), // 只返回前5条示例
        };
        message = 'FDA UDI data fetched';
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid data type. Use: registration, 510k, pma, udi' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message,
      dataType,
      stats: results,
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
    const dataType = body.type || 'registration';

    let results: any;

    switch (dataType) {
      case 'registration':
        const registrations = await fetchFDARegistrations(limit, skip);
        results = await syncFDADataToSupabase(registrations);
        break;
      case '510k':
        results = await fetchFDA510k(limit, skip);
        break;
      case 'pma':
        results = await fetchFDAPMA(limit, skip);
        break;
      case 'udi':
        results = await fetchFDAUDI(limit, skip);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid data type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      dataType,
      stats: {
        fetched: Array.isArray(results) ? results.length : results.registrationsAdded || 0,
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
