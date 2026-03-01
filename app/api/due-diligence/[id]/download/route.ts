import { createClient } from '@/app/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

// POST /api/due-diligence/[id]/download - Download report
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reportId = parseInt(params.id);
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

    // Get report
    const { data: report, error: reportError } = await supabase
      .from('due_diligence_reports')
      .select('*')
      .eq('id', reportId)
      .eq('generated_by', user.id)
      .single();

    if (reportError || !report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Check if downloadable
    if (!report.is_downloadable) {
      return NextResponse.json(
        { error: 'Report is not available for download. Please upgrade to VIP.' },
        { status: 403 }
      );
    }

    // Check if expired
    if (report.expires_at && new Date(report.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Report has expired. Please generate a new report.' },
        { status: 410 }
      );
    }

    // Generate PDF content (Markdown format for now)
    const reportData = report.report_data;
    const markdownContent = generateReportMarkdown(reportData);

    // Log download
    await supabase.from('report_access_log').insert({
      report_id: reportId,
      user_id: user.id,
      access_type: 'download',
    });

    // Return the report content
    return new NextResponse(markdownContent, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename="due-diligence-report-${reportData.company.name}-${new Date().toISOString().split('T')[0]}.md"`,
      },
    });
  } catch (error) {
    console.error('Error downloading report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateReportMarkdown(data: any): string {
  const company = data.company;
  
  let markdown = `# Due Diligence Report
## ${company.name}${company.name_zh ? ` (${company.name_zh})` : ''}

---

**Report Type:** ${data.report_type.toUpperCase()}  
**Generated At:** ${new Date(data.generated_at).toLocaleString()}  
**Access Level:** ${data.access_level.toUpperCase()}

---

## Executive Summary

This due diligence report provides a comprehensive analysis of ${company.name}, including company background, regulatory compliance, intellectual property, and risk assessment.

## 1. Company Information

| Field | Value |
|-------|-------|
| **Company Name** | ${company.name} |
| **Chinese Name** | ${company.name_zh || 'N/A'} |
| **Country** | ${company.country || 'N/A'} |
| **Address** | ${company.address || 'N/A'} |
| **Website** | ${company.website || 'N/A'} |
| **Business Type** | ${company.business_type || 'N/A'} |
| **Established Year** | ${company.established_year || 'N/A'} |
| **Employee Count** | ${company.employee_count || 'N/A'} |

`;

  if (company.legal_representative) {
    markdown += `
### Legal Information

| Field | Value |
|-------|-------|
| **Legal Representative** | ${company.legal_representative} |
| **Registered Capital** | ${company.registered_capital || 'N/A'} |
| **Registration Number** | ${company.registration_number || 'N/A'} |
| **Business Status** | ${company.business_status || 'N/A'} |

`;
  }

  if (data.registrations) {
    markdown += `
## 2. Regulatory Registrations

### Registration Summary
- **Total Registrations:** ${data.registrations.total_count}
- **FDA Registrations:** ${data.registrations.fda?.length || 0}
- **NMPA Registrations:** ${data.registrations.nmpa?.length || 0}

`;

    if (data.registrations.fda?.length > 0) {
      markdown += `### FDA Registrations

| Device Name | Registration Number | Status |
|-------------|-------------------|--------|
`;
      data.registrations.fda.forEach((reg: any) => {
        markdown += `| ${reg.device_name} | ${reg.registration_number} | ${reg.status || 'Active'} |\n`;
      });
      markdown += '\n';
    }

    if (data.registrations.nmpa?.length > 0) {
      markdown += `### NMPA Registrations

| Product Name | Registration Number | Status |
|--------------|-------------------|--------|
`;
      data.registrations.nmpa.forEach((reg: any) => {
        markdown += `| ${reg.product_name} | ${reg.registration_number} | ${reg.status || 'Active'} |\n`;
      });
      markdown += '\n';
    }
  }

  if (data.intellectual_property) {
    markdown += `
## 3. Intellectual Property

### Summary
- **Patent Count:** ${data.intellectual_property.patent_count}
- **Trademark Count:** ${data.intellectual_property.trademark_count}

`;

    if (data.intellectual_property.patents?.length > 0) {
      markdown += `### Patents

| Patent Name | Type | Status |
|-------------|------|--------|
`;
      data.intellectual_property.patents.forEach((patent: any) => {
        markdown += `| ${patent.patent_name} | ${patent.patent_type} | ${patent.status} |\n`;
      });
      markdown += '\n';
    }
  }

  if (data.risk_assessment) {
    markdown += `
## 4. Risk Assessment

### Risk Score: ${data.risk_assessment.score}/100
**Risk Level:** ${data.risk_assessment.level.toUpperCase()}

### Risk Factors
`;
    if (data.risk_assessment.factors?.length > 0) {
      data.risk_assessment.factors.forEach((factor: string) => {
        markdown += `- ${factor}\n`;
      });
    } else {
      markdown += '- No significant risk factors identified\n';
    }

    if (data.risk_assessment.litigations?.length > 0) {
      markdown += `
### Litigations (${data.risk_assessment.litigation_count})

| Case Number | Type | Court | Status |
|-------------|------|-------|--------|
`;
      data.risk_assessment.litigations.forEach((lit: any) => {
        markdown += `| ${lit.case_number} | ${lit.case_type} | ${lit.court} | ${lit.case_status} |\n`;
      });
      markdown += '\n';
    }

    if (data.risk_assessment.abnormal_operations?.length > 0) {
      markdown += `
### Abnormal Operations (${data.risk_assessment.abnormal_operation_count})

| Reason | Authority | Date |
|--------|-----------|------|
`;
      data.risk_assessment.abnormal_operations.forEach((op: any) => {
        markdown += `| ${op.reason} | ${op.decision_authority} | ${op.decision_date} |\n`;
      });
      markdown += '\n';
    }
  }

  if (data.branches?.length > 0) {
    markdown += `
## 5. Branches (${data.branch_count})

| Branch Name | Address | Status |
|-------------|---------|--------|
`;
    data.branches.forEach((branch: any) => {
      markdown += `| ${branch.branch_name} | ${branch.branch_address} | ${branch.branch_status} |\n`;
    });
    markdown += '\n';
  }

  markdown += `
---

## Disclaimer

This report is generated based on publicly available information and data provided by third-party sources. While we strive to ensure accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained in this report.

**Generated by MDLooker Due Diligence System**
**Report ID:** ${data.report_id || 'N/A'}

---

*This report is confidential and intended solely for the use of the individual or entity to whom it is addressed.*
`;

  return markdown;
}
