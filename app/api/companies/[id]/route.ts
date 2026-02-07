import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 获取公司基本信息
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

    // 并行获取所有相关信息
    const [
      { data: fdaRegistrations },
      { data: nmpaRegistrations },
      { data: eudamedRegistrations },
      { data: pmdaRegistrations },
      { data: healthCanadaRegistrations },
      { data: emaRegistrations },
      { data: mhraRegistrations },
      { data: warningLetters },
      { data: recalls },
      { data: products },
      { data: branches },
      { data: patents },
      { data: trademarks },
      { data: litigations },
      { data: abnormalOperations },
      { data: changes }
    ] = await Promise.all([
      supabase.from('fda_registrations').select('*').eq('company_id', id),
      supabase.from('nmpa_registrations').select('*').eq('company_id', id),
      supabase.from('eudamed_registrations').select('*').eq('company_id', id),
      supabase.from('pmda_registrations').select('*').eq('company_id', id),
      supabase.from('health_canada_registrations').select('*').eq('company_id', id),
      supabase.from('ema_registrations').select('*').eq('company_id', id),
      supabase.from('mhra_registrations').select('*').eq('company_id', id),
      supabase.from('regulatory_warning_letters').select('*').eq('company_id', id).order('letter_date', { ascending: false }),
      supabase.from('regulatory_recalls').select('*').eq('company_id', id).order('recall_initiation_date', { ascending: false }),
      supabase.from('products').select('*').eq('company_id', id),
      supabase.from('company_branches').select('*').eq('company_id', id),
      supabase.from('company_patents').select('*').eq('company_id', id).order('application_date', { ascending: false }),
      supabase.from('company_trademarks').select('*').eq('company_id', id).order('application_date', { ascending: false }),
      supabase.from('company_litigations').select('*').eq('company_id', id).order('case_date', { ascending: false }),
      supabase.from('company_abnormal_operations').select('*').eq('company_id', id).order('decision_date', { ascending: false }),
      supabase.from('company_changes').select('*').eq('company_id', id).order('change_date', { ascending: false })
    ]);

    // 计算风险评分
    const riskScore = calculateRiskScore(
      litigations || [],
      abnormalOperations || []
    );

    return NextResponse.json({
      ...company,
      fda_registrations: fdaRegistrations || [],
      nmpa_registrations: nmpaRegistrations || [],
      eudamed_registrations: eudamedRegistrations || [],
      pmda_registrations: pmdaRegistrations || [],
      health_canada_registrations: healthCanadaRegistrations || [],
      ema_registrations: emaRegistrations || [],
      mhra_registrations: mhraRegistrations || [],
      warning_letters: warningLetters || [],
      recalls: recalls || [],
      products: products || [],
      branches: branches || [],
      patents: patents || [],
      trademarks: trademarks || [],
      litigations: litigations || [],
      abnormal_operations: abnormalOperations || [],
      changes: changes || [],
      risk_score: riskScore,
      registration_summary: {
        total_registrations: (fdaRegistrations?.length || 0) + 
                           (nmpaRegistrations?.length || 0) + 
                           (eudamedRegistrations?.length || 0) + 
                           (pmdaRegistrations?.length || 0) + 
                           (healthCanadaRegistrations?.length || 0) +
                           (emaRegistrations?.length || 0) +
                           (mhraRegistrations?.length || 0),
        fda_count: fdaRegistrations?.length || 0,
        nmpa_count: nmpaRegistrations?.length || 0,
        eudamed_count: eudamedRegistrations?.length || 0,
        pmda_count: pmdaRegistrations?.length || 0,
        health_canada_count: healthCanadaRegistrations?.length || 0,
        ema_count: emaRegistrations?.length || 0,
        mhra_count: mhraRegistrations?.length || 0
      },
      compliance_summary: {
        warning_letters_count: warningLetters?.length || 0,
        recalls_count: recalls?.length || 0,
        total_violations: (warningLetters?.length || 0) + (recalls?.length || 0)
      },
      intellectual_property_summary: {
        patents_count: patents?.length || company.intellectual_property?.patents || 0,
        trademarks_count: trademarks?.length || company.intellectual_property?.trademarks || 0,
        branches_count: branches?.length || 0
      }
    });
  } catch (error) {
    console.error('Company detail error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company details', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// 计算风险评分
function calculateRiskScore(
  litigations: any[],
  abnormalOperations: any[]
): { score: number; level: 'low' | 'medium' | 'high'; factors: string[] } {
  let score = 0;
  const factors: string[] = [];

  // 法律诉讼风险
  const activeLitigations = litigations.filter(l => l.case_status === 'Active');
  if (activeLitigations.length > 0) {
    score += activeLitigations.length * 10;
    factors.push(`${activeLitigations.length} 起未决诉讼`);
  }

  // 经营异常风险
  const activeAbnormalOps = abnormalOperations.filter(a => !a.removal_date);
  if (activeAbnormalOps.length > 0) {
    score += activeAbnormalOps.length * 20;
    factors.push(`${activeAbnormalOps.length} 条经营异常记录`);
  }

  // 确定风险等级
  let level: 'low' | 'medium' | 'high' = 'low';
  if (score >= 50) {
    level = 'high';
  } else if (score >= 20) {
    level = 'medium';
  }

  return { score, level, factors };
}
