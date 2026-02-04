import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const country = searchParams.get('country');
  const hasFDA = searchParams.get('hasFDA') === 'true';
  const hasNMPA = searchParams.get('hasNMPA') === 'true';
  const hasEUDAMED = searchParams.get('hasEUDAMED') === 'true';

  try {
    let dbQuery = supabase
      .from('companies')
      .select('*', { count: 'exact' });

    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,name_zh.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (country) {
      dbQuery = dbQuery.eq('country', country);
    }

    const { data: companies, error, count } = await dbQuery
      .range((page - 1) * pageSize, page * pageSize - 1)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    let filteredCompanies = companies || [];

    if (hasFDA || hasNMPA || hasEUDAMED) {
      const companyIds = filteredCompanies.map(c => c.id);
      
      if (hasFDA && companyIds.length > 0) {
        const { data: fdaData } = await supabase
          .from('fda_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const fdaCompanyIds = new Set(fdaData?.map(r => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter(c => fdaCompanyIds.has(c.id));
      }
      
      if (hasNMPA && filteredCompanies.length > 0) {
        const companyIds = filteredCompanies.map(c => c.id);
        const { data: nmpaData } = await supabase
          .from('nmpa_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const nmpaCompanyIds = new Set(nmpaData?.map(r => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter(c => nmpaCompanyIds.has(c.id));
      }
      
      if (hasEUDAMED && filteredCompanies.length > 0) {
        const companyIds = filteredCompanies.map(c => c.id);
        const { data: eudamedData } = await supabase
          .from('eudamed_registrations')
          .select('company_id')
          .in('company_id', companyIds);
        const eudamedCompanyIds = new Set(eudamedData?.map(r => r.company_id) || []);
        filteredCompanies = filteredCompanies.filter(c => eudamedCompanyIds.has(c.id));
      }
    }

    return NextResponse.json({
      companies: filteredCompanies,
      total: count || 0,
      page,
      pageSize,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
