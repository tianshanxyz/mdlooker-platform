import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';

interface ComplianceProfile {
  company: {
    id: string;
    name: string;
    name_zh: string | null;
    country: string | null;
  };
  registrations: {
    fda: FDARegistration[];
    nmpa: NMPARegistration[];
    eudamed: EUDAMEDRegistration[];
    pmda: PMDARegistration[];
    healthCanada: HealthCanadaRegistration[];
  };
  summary: {
    totalRegistrations: number;
    markets: string[];
    deviceClasses: string[];
    status: Record<string, number>;
  };
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'company'; // company, product, udi

  if (!query.trim()) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  try {
    let companyIds: string[] = [];

    // 根据查询类型搜索
    if (type === 'company') {
      // 搜索公司名称
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, name_zh, country')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`)
        .limit(5);
      
      companyIds = companies?.map(c => c.id) || [];
    } else if (type === 'product') {
      // 搜索产品名称
      const { data: products } = await supabase
        .from('products')
        .select('company_id')
        .or(`name.ilike.%${query}%,name_zh.ilike.%${query}%`);
      
      companyIds = [...new Set(products?.map(p => p.company_id) || [])];
    } else if (type === 'udi') {
      // 搜索 UDI
      const { data: eudamed } = await supabase
        .from('eudamed_registrations')
        .select('company_id')
        .ilike('udi_di', `%${query}%`);
      
      companyIds = [...new Set(eudamed?.map(e => e.company_id) || [])];
    }

    if (companyIds.length === 0) {
      return NextResponse.json({
        results: [],
        total: 0,
      });
    }

    // 获取完整合规档案
    const profiles: ComplianceProfile[] = [];

    for (const companyId of companyIds.slice(0, 3)) { // 限制返回3个最匹配的结果
      const { data: company } = await supabase
        .from('companies')
        .select('id, name, name_zh, country')
        .eq('id', companyId)
        .single();

      if (!company) continue;

      // 并行获取所有注册信息
      const [
        { data: fda },
        { data: nmpa },
        { data: eudamed },
        { data: pmda },
        { data: healthCanada },
      ] = await Promise.all([
        supabase.from('fda_registrations').select('*').eq('company_id', companyId),
        supabase.from('nmpa_registrations').select('*').eq('company_id', companyId),
        supabase.from('eudamed_registrations').select('*').eq('company_id', companyId),
        supabase.from('pmda_registrations').select('*').eq('company_id', companyId),
        supabase.from('health_canada_registrations').select('*').eq('company_id', companyId),
      ]);

      const fdaRegs = fda || [];
      const nmpaRegs = nmpa || [];
      const eudamedRegs = eudamed || [];
      const pmdaRegs = pmda || [];
      const healthCanadaRegs = healthCanada || [];

      // 计算汇总信息
      const totalRegistrations = fdaRegs.length + nmpaRegs.length + eudamedRegs.length + 
                                 pmdaRegs.length + healthCanadaRegs.length;
      
      const markets = [];
      if (fdaRegs.length > 0) markets.push('USA');
      if (nmpaRegs.length > 0) markets.push('China');
      if (eudamedRegs.length > 0) markets.push('EU');
      if (pmdaRegs.length > 0) markets.push('Japan');
      if (healthCanadaRegs.length > 0) markets.push('Canada');

      const deviceClasses = [
        ...new Set([
          ...fdaRegs.map(r => r.device_class).filter(Boolean),
          ...nmpaRegs.map(r => r.device_classification).filter(Boolean),
          ...eudamedRegs.map(r => 'MDR Class').filter(Boolean),
          ...pmdaRegs.map(r => r.device_classification).filter(Boolean),
          ...healthCanadaRegs.map(r => r.device_class).filter(Boolean),
        ])
      ];

      const status: Record<string, number> = {};
      [...fdaRegs, ...healthCanadaRegs].forEach(r => {
        const s = r.registration_status || r.licence_status || 'Unknown';
        status[s] = (status[s] || 0) + 1;
      });

      profiles.push({
        company,
        registrations: {
          fda: fdaRegs,
          nmpa: nmpaRegs,
          eudamed: eudamedRegs,
          pmda: pmdaRegs,
          healthCanada: healthCanadaRegs,
        },
        summary: {
          totalRegistrations,
          markets,
          deviceClasses,
          status,
        },
      });
    }

    return NextResponse.json({
      results: profiles,
      total: profiles.length,
      query,
      type,
    });

  } catch (error) {
    console.error('Compliance profile query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch compliance profile', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Type definitions
interface FDARegistration {
  id: string;
  device_name: string | null;
  device_class: string | null;
  registration_status: string | null;
  product_code: string | null;
  registration_number: string | null;
  source_url: string | null;
}

interface NMPARegistration {
  id: string;
  product_name: string | null;
  product_name_zh: string | null;
  device_classification: string | null;
  registration_number: string;
  approval_date: string | null;
  source_url: string | null;
}

interface EUDAMEDRegistration {
  id: string;
  device_name: string | null;
  udi_di: string | null;
  notified_body: string | null;
  certificate_number: string | null;
  source_url: string | null;
}

interface PMDARegistration {
  id: string;
  product_name: string | null;
  product_name_jp: string | null;
  device_classification: string | null;
  approval_number: string;
  source_url: string | null;
}

interface HealthCanadaRegistration {
  id: string;
  device_name: string | null;
  device_class: string | null;
  licence_status: string | null;
  licence_number: string | null;
  source_url: string | null;
}
