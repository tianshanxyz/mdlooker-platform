import { createClient } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';
import { checkPermission } from '@/app/lib/auth';

// POST /api/companies/[id]/due-diligence - Generate due diligence report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);
    const { reportType = 'basic' } = await request.json();

    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user role and permissions
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Define access levels based on role and report type
    const accessLevels: Record<string, Record<string, { canView: boolean; canDownload: boolean; dataLevel: string }>> = {
      guest: {
        basic: { canView: false, canDownload: false, dataLevel: 'none' },
        standard: { canView: false, canDownload: false, dataLevel: 'none' },
        comprehensive: { canView: false, canDownload: false, dataLevel: 'none' },
      },
      user: {
        basic: { canView: true, canDownload: false, dataLevel: 'basic' },
        standard: { canView: true, canDownload: false, dataLevel: 'standard' },
        comprehensive: { canView: false, canDownload: false, dataLevel: 'none' },
      },
      vip: {
        basic: { canView: true, canDownload: true, dataLevel: 'full' },
        standard: { canView: true, canDownload: true, dataLevel: 'full' },
        comprehensive: { canView: true, canDownload: true, dataLevel: 'full' },
      },
    };

    const access = accessLevels[profile.role]?.[reportType];

    if (!access || !access.canView) {
      return NextResponse.json(
        { error: 'Insufficient permissions for this report type' },
        { status: 403 }
      );
    }

    // Fetch company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch related data based on access level
    const reportData: any = {
      company: {
        id: company.id,
        name: company.name,
        name_zh: company.name_zh,
        country: company.country,
        address: company.address,
        website: company.website,
        description: company.description,
        business_type: company.business_type,
        established_year: company.established_year,
        employee_count: company.employee_count,
      },
      generated_at: new Date().toISOString(),
      report_type: reportType,
      access_level: access.dataLevel,
    };

    // Add data based on report type and access level
    if (access.dataLevel === 'basic' || access.dataLevel === 'standard' || access.dataLevel === 'full') {
      // Basic info
      reportData.company.legal_representative = company.legal_representative;
      reportData.company.registered_capital = company.registered_capital;
      reportData.company.registration_number = company.registration_number;
      reportData.company.business_status = company.business_status;
    }

    if (access.dataLevel === 'standard' || access.dataLevel === 'full') {
      // Standard info - registrations
      const { data: fdaRegs } = await supabase
        .from('fda_registrations')
        .select('*')
        .eq('company_id', companyId)
        .limit(10);
      
      const { data: nmpaRegs } = await supabase
        .from('nmpa_registrations')
        .select('*')
        .eq('company_id', companyId)
        .limit(10);

      reportData.registrations = {
        fda: fdaRegs || [],
        nmpa: nmpaRegs || [],
        total_count: (fdaRegs?.length || 0) + (nmpaRegs?.length || 0),
      };

      // IP info
      const { data: patents } = await supabase
        .from('patents')
        .select('*')
        .eq('company_id', companyId)
        .limit(20);

      const { data: trademarks } = await supabase
        .from('trademarks')
        .select('*')
        .eq('company_id', companyId)
        .limit(20);

      reportData.intellectual_property = {
        patents: patents || [],
        trademarks: trademarks || [],
        patent_count: patents?.length || 0,
        trademark_count: trademarks?.length || 0,
      };
    }

    if (access.dataLevel === 'full') {
      // Full info - risk data
      const { data: litigations } = await supabase
        .from('litigations')
        .select('*')
        .eq('company_id', companyId);

      const { data: abnormalOps } = await supabase
        .from('abnormal_operations')
        .select('*')
        .eq('company_id', companyId);

      const { data: branches } = await supabase
        .from('branches')
        .select('*')
        .eq('company_id', companyId);

      reportData.risk_assessment = {
        litigations: litigations || [],
        abnormal_operations: abnormalOps || [],
        litigation_count: litigations?.length || 0,
        abnormal_operation_count: abnormalOps?.length || 0,
      };

      reportData.branches = branches || [];
      reportData.branch_count = branches?.length || 0;

      // Calculate risk score
      const riskFactors: string[] = [];
      if (litigations && litigations.length > 0) {
        riskFactors.push(`Active litigations: ${litigations.length}`);
      }
      if (abnormalOps && abnormalOps.length > 0) {
        riskFactors.push(`Abnormal operations: ${abnormalOps.length}`);
      }

      const riskScore = Math.min(100, (litigations?.length || 0) * 15 + (abnormalOps?.length || 0) * 10);
      
      reportData.risk_assessment.score = riskScore;
      reportData.risk_assessment.level = riskScore > 50 ? 'high' : riskScore > 25 ? 'medium' : 'low';
      reportData.risk_assessment.factors = riskFactors;
    }

    // Save report to database
    const { data: savedReport, error: saveError } = await supabase
      .from('due_diligence_reports')
      .insert({
        company_id: companyId,
        generated_by: user.id,
        report_type: reportType,
        report_data: reportData,
        is_downloadable: access.canDownload,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving report:', saveError);
      return NextResponse.json(
        { error: 'Failed to save report' },
        { status: 500 }
      );
    }

    // Log access
    await supabase.from('report_access_log').insert({
      report_id: savedReport.id,
      user_id: user.id,
      access_type: 'view',
    });

    return NextResponse.json({
      report: {
        id: savedReport.id,
        data: reportData,
        canDownload: access.canDownload,
        createdAt: savedReport.created_at,
        expiresAt: savedReport.expires_at,
      },
    });
  } catch (error) {
    console.error('Error generating due diligence report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/companies/[id]/due-diligence - Get report history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = parseInt(params.id);
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's reports for this company
    const { data: reports, error } = await supabase
      .from('due_diligence_reports')
      .select('*')
      .eq('company_id', companyId)
      .eq('generated_by', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports: reports || [] });
  } catch (error) {
    console.error('Error in GET due diligence:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
