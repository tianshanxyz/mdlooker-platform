import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', id)
      .single();

    if (companyError) {
      if (companyError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }
      throw companyError;
    }

    const [
      { data: fdaRegistrations },
      { data: nmpaRegistrations },
      { data: eudamedRegistrations },
      { data: pmdaRegistrations },
      { data: healthCanadaRegistrations },
      { data: products }
    ] = await Promise.all([
      supabase.from('fda_registrations').select('*').eq('company_id', id),
      supabase.from('nmpa_registrations').select('*').eq('company_id', id),
      supabase.from('eudamed_registrations').select('*').eq('company_id', id),
      supabase.from('pmda_registrations').select('*').eq('company_id', id),
      supabase.from('health_canada_registrations').select('*').eq('company_id', id),
      supabase.from('products').select('*').eq('company_id', id)
    ]);

    return NextResponse.json({
      ...company,
      fda_registrations: fdaRegistrations || [],
      nmpa_registrations: nmpaRegistrations || [],
      eudamed_registrations: eudamedRegistrations || [],
      pmda_registrations: pmdaRegistrations || [],
      health_canada_registrations: healthCanadaRegistrations || [],
      products: products || []
    });
  } catch (error) {
    console.error('Company detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
