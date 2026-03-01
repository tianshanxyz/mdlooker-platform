'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Icons
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

interface ReportType {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  features: string[];
  featuresZh: string[];
  userAccess: 'view' | 'none';
  vipAccess: 'download' | 'view';
}

const reportTypes: ReportType[] = [
  {
    id: 'basic',
    name: 'Basic Report',
    nameZh: '基础报告',
    description: 'Essential company information and basic compliance overview',
    descriptionZh: '基本公司信息和合规概览',
    features: ['Company basic info', 'Legal representative', 'Business status', 'Registration overview'],
    featuresZh: ['公司基本信息', '法人代表', '经营状态', '注册概览'],
    userAccess: 'view',
    vipAccess: 'download',
  },
  {
    id: 'standard',
    name: 'Standard Report',
    nameZh: '标准报告',
    description: 'Detailed analysis including registrations and IP portfolio',
    descriptionZh: '包含注册信息和知识产权组合的详细分析',
    features: ['All Basic features', 'FDA/NMPA registrations', 'Patent portfolio', 'Trademark analysis'],
    featuresZh: ['所有基础功能', 'FDA/NMPA注册', '专利组合', '商标分析'],
    userAccess: 'view',
    vipAccess: 'download',
  },
  {
    id: 'comprehensive',
    name: 'Comprehensive Report',
    nameZh: '综合报告',
    description: 'Full due diligence with risk assessment and litigation analysis',
    descriptionZh: '包含风险评估和诉讼分析的完整尽职调查',
    features: ['All Standard features', 'Risk assessment', 'Litigation analysis', 'Branch network', 'Downloadable PDF'],
    featuresZh: ['所有标准功能', '风险评估', '诉讼分析', '分支机构', '可下载PDF'],
    userAccess: 'none',
    vipAccess: 'download',
  },
];

export default function DueDiligenceReport({
  companyId,
  locale,
}: {
  companyId: string;
  locale: string;
}) {
  const { data: session } = useSession();
  const [selectedType, setSelectedType] = useState<string>('basic');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);
  const [reportHistory, setReportHistory] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('guest');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUserRole(data.profile?.role || 'guest');
      }

      // Load report history
      const historyResponse = await fetch(`/api/companies/${companyId}/due-diligence`);
      if (historyResponse.ok) {
        const historyData = await historyResponse.json();
        setReportHistory(historyData.reports || []);
      }

      setIsLoading(false);
    }

    loadUserData();
  }, [session, companyId]);

  const handleGenerate = async () => {
    if (!session) {
      alert(locale === 'zh' ? '请先登录' : 'Please sign in');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`/api/companies/${companyId}/due-diligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportType: selectedType }),
      });

      if (response.ok) {
        const data = await response.json();
        setGeneratedReport(data.report);
        // Refresh history
        const historyResponse = await fetch(`/api/companies/${companyId}/due-diligence`);
        if (historyResponse.ok) {
          const historyData = await historyResponse.json();
          setReportHistory(historyData.reports || []);
        }
      } else {
        const error = await response.json();
        alert(error.error || (locale === 'zh' ? '生成报告失败' : 'Failed to generate report'));
      }
    } catch (err) {
      console.error('Error generating report:', err);
      alert(locale === 'zh' ? '网络错误' : 'Network error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (reportId: number) => {
    try {
      const response = await fetch(`/api/due-diligence/${reportId}/download`, {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `due-diligence-report-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(error.error || (locale === 'zh' ? '下载失败' : 'Download failed'));
      }
    } catch (err) {
      console.error('Error downloading report:', err);
      alert(locale === 'zh' ? '下载错误' : 'Download error');
    }
  };

  const canAccessReport = (type: ReportType) => {
    if (userRole === 'vip') return true;
    if (userRole === 'user') return type.userAccess !== 'none';
    return false;
  };

  const canDownload = (type: ReportType) => {
    return userRole === 'vip';
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
        <div className="h-32 bg-slate-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {locale === 'zh' ? '尽职调查报告' : 'Due Diligence Report'}
      </h2>

      {!session ? (
        <div className="bg-slate-50 rounded-xl p-6 text-center">
          <LockIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">
            {locale === 'zh'
              ? '登录后可生成和查看尽职调查报告'
              : 'Sign in to generate and view due diligence reports'}
          </p>
          <Link
            href={`/${locale}/auth/signin?callbackUrl=/${locale}/companies/${companyId}`}
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
          >
            {locale === 'zh' ? '立即登录' : 'Sign In'}
          </Link>
        </div>
      ) : (
        <>
          {/* Report Type Selection */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {reportTypes.map((type) => {
              const hasAccess = canAccessReport(type);
              const canDownloadReport = canDownload(type);

              return (
                <div
                  key={type.id}
                  onClick={() => hasAccess && setSelectedType(type.id)}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedType === type.id
                      ? 'border-[#339999] bg-[#339999]/5'
                      : hasAccess
                      ? 'border-slate-200 hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50 opacity-60'
                  }`}
                >
                  {!hasAccess && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50/80 rounded-xl">
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                        VIP
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-3">
                    <FileTextIcon className="w-8 h-8 text-[#339999]" />
                    {selectedType === type.id && (
                      <CheckIcon className="w-5 h-5 text-[#339999]" />
                    )}
                  </div>

                  <h3 className="font-semibold text-slate-900 mb-1">
                    {locale === 'zh' ? type.nameZh : type.name}
                  </h3>
                  <p className="text-sm text-slate-500 mb-3">
                    {locale === 'zh' ? type.descriptionZh : type.description}
                  </p>

                  <ul className="space-y-1">
                    {(locale === 'zh' ? type.featuresZh : type.features).map((feature, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                        <CheckIcon className="w-3 h-3 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        {locale === 'zh' ? '注册用户' : 'User'}:
                      </span>
                      <span className={type.userAccess === 'view' ? 'text-green-600' : 'text-slate-400'}>
                        {type.userAccess === 'view'
                          ? locale === 'zh'
                            ? '可查看'
                            : 'View'
                          : locale === 'zh'
                          ? '无权限'
                          : 'No access'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500">VIP:</span>
                      <span className="text-amber-600 font-medium">
                        {canDownloadReport
                          ? locale === 'zh'
                            ? '可下载'
                            : 'Download'
                          : locale === 'zh'
                          ? '可查看'
                          : 'View'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !canAccessReport(reportTypes.find(t => t.id === selectedType)!)}
            className="w-full py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            {isGenerating
              ? locale === 'zh'
                ? '生成中...'
                : 'Generating...'
              : locale === 'zh'
              ? '生成报告'
              : 'Generate Report'}
          </button>

          {/* Generated Report Preview */}
          {generatedReport && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
              <h3 className="font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '报告预览' : 'Report Preview'}
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '公司名称' : 'Company'}</p>
                    <p className="font-medium text-slate-900">{generatedReport.data.company.name}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '报告类型' : 'Report Type'}</p>
                    <p className="font-medium text-slate-900 uppercase">{generatedReport.data.report_type}</p>
                  </div>
                </div>

                {generatedReport.data.registrations && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2">{locale === 'zh' ? '注册信息' : 'Registrations'}</p>
                    <div className="flex gap-4">
                      <span className="text-sm">
                        FDA: <strong>{generatedReport.data.registrations.fda?.length || 0}</strong>
                      </span>
                      <span className="text-sm">
                        NMPA: <strong>{generatedReport.data.registrations.nmpa?.length || 0}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {generatedReport.data.risk_assessment && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-2">{locale === 'zh' ? '风险评估' : 'Risk Assessment'}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{locale === 'zh' ? '风险评分' : 'Risk Score'}:</span>
                      <span className={`font-bold ${
                        generatedReport.data.risk_assessment.score > 50
                          ? 'text-red-600'
                          : generatedReport.data.risk_assessment.score > 25
                          ? 'text-amber-600'
                          : 'text-green-600'
                      }`}>
                        {generatedReport.data.risk_assessment.score}/100
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        generatedReport.data.risk_assessment.level === 'high'
                          ? 'bg-red-100 text-red-700'
                          : generatedReport.data.risk_assessment.level === 'medium'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {generatedReport.data.risk_assessment.level.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}

                {generatedReport.canDownload && (
                  <button
                    onClick={() => handleDownload(generatedReport.id)}
                    className="w-full py-2 bg-slate-800 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    {locale === 'zh' ? '下载报告' : 'Download Report'}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Report History */}
          {reportHistory.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">
                {locale === 'zh' ? '历史报告' : 'Report History'}
              </h3>
              <div className="space-y-2">
                {reportHistory.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-slate-900 capitalize">{report.report_type}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {report.is_downloadable ? (
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="p-2 text-[#339999] hover:bg-[#339999]/10 rounded-lg transition-colors"
                      >
                        <DownloadIcon className="w-5 h-5" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">
                        {locale === 'zh' ? '仅可查看' : 'View only'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
