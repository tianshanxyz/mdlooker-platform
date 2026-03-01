'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { locales, type Locale } from '../../../i18n-config';
import CompanyComments from '@/app/components/CompanyComments';
import DueDiligenceReport from '@/app/components/DueDiligenceReport';
import GlobalComplianceProfile from '@/app/components/GlobalComplianceProfile';

interface CompanyDetail {
  id: string;
  name: string;
  name_zh?: string;
  country?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  description?: string;
  description_zh?: string;
  business_type?: string;
  established_year?: number;
  employee_count?: string;
  legal_representative?: string;
  registered_capital?: string;
  registration_number?: string;
  unified_social_credit_code?: string;
  business_status?: string;
  business_scope?: string;
  gmp_certificates?: string[];
  iso_certificates?: string[];
  shareholders?: Array<{ name: string; percentage: number }>;
  intellectual_property?: { patents?: number; trademarks?: number };
  contact_info?: { phone?: string; fax?: string; email?: string };
  fda_registrations: any[];
  nmpa_registrations: any[];
  eudamed_registrations: any[];
  pmda_registrations: any[];
  health_canada_registrations: any[];
  ema_registrations: any[];
  mhra_registrations: any[];
  tga_registrations: any[];
  hsa_registrations: any[];
  swissmedic_registrations: any[];
  mfds_registrations: any[];
  anvisa_registrations: any[];
  warning_letters: any[];
  recalls: any[];
  products: any[];
  branches: any[];
  patents: any[];
  trademarks: any[];
  litigations: any[];
  abnormal_operations: any[];
  changes: any[];
  risk_score?: { score: number; level: 'low' | 'medium' | 'high'; factors: string[] };
  registration_summary?: {
    total_registrations: number;
    fda_count: number;
    nmpa_count: number;
    eudamed_count: number;
    pmda_count: number;
    health_canada_count: number;
    ema_count: number;
    mhra_count: number;
    tga_count: number;
    hsa_count: number;
    swissmedic_count: number;
    mfds_count: number;
    anvisa_count: number;
  };
  compliance_summary?: {
    warning_letters_count: number;
    recalls_count: number;
    total_violations: number;
  };
  intellectual_property_summary?: {
    patents_count: number;
    trademarks_count: number;
    branches_count: number;
  };
}

export default function CompanyDetailPage() {
  const params = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [companyId, setCompanyId] = useState<string>('');
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'ip' | 'risk' | 'branches'>('overview');

  // Get companyId from URL params
  useEffect(() => {
    const id = params?.id as string;
    if (id) {
      setCompanyId(id);
    }
  }, [params]);

  useEffect(() => {
    if (!companyId) return;

    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch company details');
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999] mx-auto"></div>
        <p className="mt-4 text-slate-600">
          {locale === 'en' ? 'Loading...' : '加载中...'}
        </p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-red-600">
          {locale === 'en' ? 'Company not found' : '未找到企业'}
        </p>
        <Link href={`/${locale}`} className="text-[#339999] hover:underline mt-4 inline-block">
          {locale === 'en' ? '← Back to Home' : '← 返回首页'}
        </Link>
      </div>
    );
  }

  const t = {
    overview: locale === 'en' ? 'Overview' : '概览',
    registrations: locale === 'en' ? 'Registrations' : '注册信息',
    ip: locale === 'en' ? 'Intellectual Property' : '知识产权',
    risk: locale === 'en' ? 'Risk Assessment' : '风险评估',
    branches: locale === 'en' ? 'Branches' : '分支机构',
    companyInfo: locale === 'en' ? 'Company Information' : '企业信息',
    noData: locale === 'en' ? 'No data available' : '暂无数据',
    source: locale === 'en' ? 'Source' : '来源',
    basicInfo: locale === 'en' ? 'Basic Information' : '基本信息',
    contactInfo: locale === 'en' ? 'Contact Information' : '联系信息',
    businessInfo: locale === 'en' ? 'Business Information' : '经营信息',
    shareholders: locale === 'en' ? 'Shareholders' : '股东信息',
    certificates: locale === 'en' ? 'Certificates' : '资质证书',
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link href={`/${locale}`} className="text-[#339999] hover:underline mb-6 inline-block">
        {locale === 'en' ? '← Back to Search' : '← 返回搜索'}
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
            {company.name_zh && (
              <p className="text-xl text-slate-600 mt-1">{company.name_zh}</p>
            )}
            {company.business_status && (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-3 ${
                company.business_status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {company.business_status}
              </span>
            )}
          </div>
          {company.country && (
            <span className="bg-[#339999]/10 text-[#339999] px-4 py-2 rounded-full text-sm font-medium">
              {company.country}
            </span>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#339999]">
              {company.registration_summary?.total_registrations || 0}
            </p>
            <p className="text-sm text-slate-600">
              {locale === 'en' ? 'Registrations' : '注册数'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#339999]">
              {company.intellectual_property_summary?.patents_count || 0}
            </p>
            <p className="text-sm text-slate-600">
              {locale === 'en' ? 'Patents' : '专利'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#339999]">
              {company.intellectual_property_summary?.trademarks_count || 0}
            </p>
            <p className="text-sm text-slate-600">
              {locale === 'en' ? 'Trademarks' : '商标'}
            </p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-[#339999]">
              {company.intellectual_property_summary?.branches_count || 0}
            </p>
            <p className="text-sm text-slate-600">
              {locale === 'en' ? 'Branches' : '分支机构'}
            </p>
          </div>
        </div>

        {company.description && (
          <p className="text-slate-700 mb-6 leading-relaxed">
            {locale === 'zh' && company.description_zh ? company.description_zh : company.description}
          </p>
        )}
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="border-b border-slate-200">
          <nav className="flex flex-wrap">
            {(['overview', 'registrations', 'ip', 'risk', 'branches'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[#339999] text-[#339999]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t[tab]}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h3 className="font-semibold text-slate-800 mb-4">{t.basicInfo}</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  {company.legal_representative && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Legal Representative: ' : '法定代表人: '}</span>
                      <span className="text-slate-700">{company.legal_representative}</span>
                    </div>
                  )}
                  {company.registered_capital && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Registered Capital: ' : '注册资本: '}</span>
                      <span className="text-slate-700">{company.registered_capital}</span>
                    </div>
                  )}
                  {company.established_year && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Established: ' : '成立年份: '}</span>
                      <span className="text-slate-700">{company.established_year}</span>
                    </div>
                  )}
                  {company.employee_count && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Employees: ' : '员工数量: '}</span>
                      <span className="text-slate-700">{company.employee_count}</span>
                    </div>
                  )}
                  {company.registration_number && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Registration Number: ' : '注册号: '}</span>
                      <span className="text-slate-700">{company.registration_number}</span>
                    </div>
                  )}
                  {company.unified_social_credit_code && (
                    <div>
                      <span className="text-slate-500">{locale === 'en' ? 'Unified Code: ' : '统一社会信用代码: '}</span>
                      <span className="text-slate-700">{company.unified_social_credit_code}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              {(company.website || company.email || company.phone || company.contact_info) && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">{t.contactInfo}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    {company.website && (
                      <div>
                        <span className="text-slate-500">{locale === 'en' ? 'Website: ' : '网站: '}</span>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#339999] hover:underline">
                          {company.website}
                        </a>
                      </div>
                    )}
                    {(company.email || company.contact_info?.email) && (
                      <div>
                        <span className="text-slate-500">{locale === 'en' ? 'Email: ' : '邮箱: '}</span>
                        <a href={`mailto:${company.email || company.contact_info?.email}`} className="text-[#339999] hover:underline">
                          {company.email || company.contact_info?.email}
                        </a>
                      </div>
                    )}
                    {(company.phone || company.contact_info?.phone) && (
                      <div>
                        <span className="text-slate-500">{locale === 'en' ? 'Phone: ' : '电话: '}</span>
                        <span className="text-slate-700">{company.phone || company.contact_info?.phone}</span>
                      </div>
                    )}
                    {company.contact_info?.fax && (
                      <div>
                        <span className="text-slate-500">{locale === 'en' ? 'Fax: ' : '传真: '}</span>
                        <span className="text-slate-700">{company.contact_info.fax}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Business Scope */}
              {company.business_scope && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">{t.businessInfo}</h3>
                  <p className="text-slate-700 text-sm">{company.business_scope}</p>
                </div>
              )}

              {/* Address */}
              {company.address && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-2">{locale === 'en' ? 'Address' : '地址'}</h3>
                  <p className="text-slate-700 text-sm">{company.address}</p>
                </div>
              )}

              {/* Shareholders */}
              {company.shareholders && company.shareholders.length > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">{t.shareholders}</h3>
                  <div className="space-y-3">
                    {company.shareholders.map((shareholder, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-slate-700">{shareholder.name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-slate-200 rounded-full h-2">
                            <div 
                              className="bg-[#339999] h-2 rounded-full"
                              style={{ width: `${shareholder.percentage}%` }}
                            />
                          </div>
                          <span className="text-slate-600 text-sm w-12 text-right">{shareholder.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certificates */}
              {(company.gmp_certificates && company.gmp_certificates.length > 0) || (company.iso_certificates && company.iso_certificates.length > 0) ? (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">{t.certificates}</h3>
                  <div className="flex flex-wrap gap-2">
                    {company.gmp_certificates?.map((cert, index) => (
                      <span key={`gmp-${index}`} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                    {company.iso_certificates?.map((cert, index) => (
                      <span key={`iso-${index}`} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Registrations Tab - Enhanced with Global Compliance Profile */}
          {activeTab === 'registrations' && (
            <GlobalComplianceProfile 
              companyId={company.id}
              locale={locale}
              complianceData={{
                fda_registrations: company.fda_registrations,
                nmpa_registrations: company.nmpa_registrations,
                eudamed_registrations: company.eudamed_registrations,
                pmda_registrations: company.pmda_registrations,
                health_canada_registrations: company.health_canada_registrations,
                ema_registrations: company.ema_registrations,
                mhra_registrations: company.mhra_registrations,
                tga_registrations: company.tga_registrations,
                hsa_registrations: company.hsa_registrations,
                swissmedic_registrations: company.swissmedic_registrations,
                mfds_registrations: company.mfds_registrations,
                anvisa_registrations: company.anvisa_registrations,
                warning_letters: company.warning_letters,
                recalls: company.recalls,
              }}
            />
          )}

          {/* IP Tab */}
          {activeTab === 'ip' && (
            <div className="space-y-6">
              {/* Patents */}
              {company.patents.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Patents' : '专利'} ({company.patents.length})
                  </h3>
                  <div className="space-y-3">
                    {company.patents.map((patent) => (
                      <div key={patent.id} className="border border-slate-200 rounded-xl p-4">
                        <h4 className="font-medium text-slate-900">{patent.patent_name}</h4>
                        <p className="text-sm text-slate-500">{patent.patent_number}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-600">
                          <span>{patent.patent_type}</span>
                          <span>{patent.application_date}</span>
                          <span className={`px-2 py-0.5 rounded ${patent.status === 'Granted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {patent.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Trademarks */}
              {company.trademarks.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Trademarks' : '商标'} ({company.trademarks.length})
                  </h3>
                  <div className="space-y-3">
                    {company.trademarks.map((trademark) => (
                      <div key={trademark.id} className="border border-slate-200 rounded-xl p-4">
                        <h4 className="font-medium text-slate-900">{trademark.trademark_name}</h4>
                        <p className="text-sm text-slate-500">{trademark.registration_number}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-600">
                          <span>{trademark.category}</span>
                          <span>{trademark.application_date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Risk Tab */}
          {activeTab === 'risk' && (
            <div className="space-y-6">
              {/* Risk Score */}
              {company.risk_score && (
                <div className={`rounded-xl p-6 ${getRiskColor(company.risk_score.level)}`}>
                  <h3 className="font-semibold mb-2">
                    {locale === 'en' ? 'Risk Assessment' : '风险评估'}
                  </h3>
                  <p className="text-3xl font-bold">{company.risk_score.score}</p>
                  <p className="text-sm mt-1">
                    {locale === 'en'
                      ? `Risk Level: ${company.risk_score.level.toUpperCase()}`
                      : `风险等级: ${company.risk_score.level === 'high' ? '高' : company.risk_score.level === 'medium' ? '中' : '低'}`}
                  </p>
                  {company.risk_score.factors.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium">
                        {locale === 'en' ? 'Risk Factors:' : '风险因素:'}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {company.risk_score.factors.map((factor, index) => (
                          <li key={index} className="text-sm">• {factor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Compliance Summary */}
              {company.compliance_summary && company.compliance_summary.total_violations > 0 && (
                <div className="bg-red-50 rounded-xl p-6 border border-red-200">
                  <h3 className="font-semibold text-red-800 mb-4">
                    {locale === 'en' ? 'Regulatory Violations' : '监管违规记录'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{company.compliance_summary.warning_letters_count}</p>
                      <p className="text-sm text-red-700">{locale === 'en' ? 'Warning Letters' : '警告信'}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-600">{company.compliance_summary.recalls_count}</p>
                      <p className="text-sm text-red-700">{locale === 'en' ? 'Recalls' : '召回记录'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Letters */}
              {company.warning_letters.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Warning Letters' : '警告信'} ({company.warning_letters.length})
                  </h3>
                  <div className="space-y-3">
                    {company.warning_letters.map((letter) => (
                      <div key={letter.id} className="border border-red-200 rounded-xl p-4 bg-red-50">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-slate-900">{letter.issuing_agency}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${letter.status === 'Open' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {letter.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{letter.letter_number}</p>
                        <p className="text-sm text-slate-700 mt-2">{letter.violation_summary}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>{letter.letter_date}</span>
                          <span>{letter.facility_name}</span>
                        </div>
                        {letter.letter_url && (
                          <a href={letter.letter_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#339999] hover:underline mt-2 inline-block">
                            {locale === 'en' ? 'View Letter' : '查看信件'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recalls */}
              {company.recalls.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Product Recalls' : '产品召回'} ({company.recalls.length})
                  </h3>
                  <div className="space-y-3">
                    {company.recalls.map((recall) => (
                      <div key={recall.id} className="border border-orange-200 rounded-xl p-4 bg-orange-50">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-slate-900">{recall.product_name}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs ${recall.recall_classification === 'Class I' || recall.recall_classification === 'High' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                            {recall.recall_classification}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{recall.issuing_agency}</p>
                        <p className="text-sm text-slate-700 mt-2">{recall.recall_reason}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>{recall.recall_initiation_date}</span>
                          <span className={`px-2 py-0.5 rounded ${recall.recall_status === 'Ongoing' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {recall.recall_status}
                          </span>
                        </div>
                        {recall.recall_url && (
                          <a href={recall.recall_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#339999] hover:underline mt-2 inline-block">
                            {locale === 'en' ? 'View Recall Details' : '查看召回详情'}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Litigations */}
              {company.litigations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Litigations' : '法律诉讼'} ({company.litigations.length})
                  </h3>
                  <div className="space-y-3">
                    {company.litigations.map((litigation) => (
                      <div key={litigation.id} className="border border-slate-200 rounded-xl p-4">
                        <h4 className="font-medium text-slate-900">{litigation.case_number}</h4>
                        <p className="text-sm text-slate-600">{litigation.case_type}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>{litigation.court}</span>
                          <span>{litigation.case_date}</span>
                          <span className={`px-2 py-0.5 rounded ${litigation.case_status === 'Active' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'}`}>
                            {litigation.case_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Abnormal Operations */}
              {company.abnormal_operations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Abnormal Operations' : '经营异常'} ({company.abnormal_operations.length})
                  </h3>
                  <div className="space-y-3">
                    {company.abnormal_operations.map((op) => (
                      <div key={op.id} className="border border-slate-200 rounded-xl p-4">
                        <p className="text-slate-700">{op.reason}</p>
                        <div className="flex gap-4 mt-2 text-xs text-slate-500">
                          <span>{op.decision_authority}</span>
                          <span>{op.decision_date}</span>
                          {op.removal_date && <span className="text-green-600">已移除: {op.removal_date}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Branches Tab */}
          {activeTab === 'branches' && (
            <div>
              {company.branches.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {company.branches.map((branch) => (
                    <div key={branch.id} className="border border-slate-200 rounded-xl p-4">
                      <h4 className="font-medium text-slate-900">{branch.branch_name}</h4>
                      <p className="text-sm text-slate-600 mt-1">{branch.branch_address}</p>
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${branch.branch_status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {branch.branch_status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <CompanyComments companyId={companyId} locale={locale} />

        {/* Due Diligence Report Section */}
        <DueDiligenceReport companyId={companyId} locale={locale} />
      </div>
    </div>
  );
}
