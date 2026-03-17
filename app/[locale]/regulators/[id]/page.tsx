'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getAgencyById, countryNames } from '../../../lib/regulatory-agencies-data';

export default function RegulatorDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const agencyId = params?.id as string;
  
  // 根据ID获取对应的监管机构数据
  const agency = getAgencyById(agencyId);

  const t = {
    backToList: locale === 'zh' ? '返回列表' : 'Back to List',
    verified: locale === 'zh' ? '已验证' : 'Verified',
    national: locale === 'zh' ? '国家级' : 'National',
    regional: locale === 'zh' ? '区域级' : 'Regional',
    local: locale === 'zh' ? '地方级' : 'Local',
    overview: locale === 'zh' ? '机构概览' : 'Overview',
    contactInfo: locale === 'zh' ? '联系信息' : 'Contact Information',
    regulatoryInfo: locale === 'zh' ? '监管信息' : 'Regulatory Information',
    officialLinks: locale === 'zh' ? '官方链接' : 'Official Links',
    officialWebsite: locale === 'zh' ? '官方网站' : 'Official Website',
    database: locale === 'zh' ? '官方数据库' : 'Database',
    establishmentDate: locale === 'zh' ? '成立日期' : 'Establishment Date',
    parentOrg: locale === 'zh' ? '上级机构' : 'Parent Organization',
    regulatoryFramework: locale === 'zh' ? '监管体系' : 'Regulatory Framework',
    classificationSystem: locale === 'zh' ? '分类系统' : 'Classification System',
    approvalProcess: locale === 'zh' ? '审批流程' : 'Approval Process',
    approvalTime: locale === 'zh' ? '审批时间' : 'Approval Time',
    officialFees: locale === 'zh' ? '官方费用' : 'Official Fees',
    languages: locale === 'zh' ? '支持语言' : 'Languages',
    email: locale === 'zh' ? '邮箱' : 'Email',
    phone: locale === 'zh' ? '电话' : 'Phone',
    fax: locale === 'zh' ? '传真' : 'Fax',
    address: locale === 'zh' ? '地址' : 'Address',
    notFound: locale === 'zh' ? '未找到该监管机构' : 'Regulatory agency not found',
  };

  const getCountryName = () => {
    if (!agency) return '';
    return countryNames[agency.country]?.[locale === 'zh' ? 'zh' : 'en'] || agency.country;
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'CN': '🇨🇳', 'EU': '🇪🇺', 'JP': '🇯🇵', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'KR': '🇰🇷', 'SG': '🇸🇬', 'GB': '🇬🇧', 'BR': '🇧🇷',
      'IN': '🇮🇳', 'CH': '🇨🇭', 'SA': '🇸🇦', 'MX': '🇲🇽', 'TR': '🇹🇷',
      'RU': '🇷🇺', 'ZA': '🇿🇦', 'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩',
    };
    return flags[countryCode] || '🌍';
  };

  // 如果找不到对应的监管机构，显示错误信息
  if (!agency) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.notFound}</h1>
            <Link
              href={`/${locale}/regulators`}
              className="inline-flex items-center gap-2 text-[#339999] hover:underline mt-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t.backToList}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href={`/${locale}/regulators`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToList}
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">{getCountryFlag(agency.country_code)}</span>
            <h1 className="text-4xl font-bold">
              {locale === 'zh' ? agency.agency_name_zh : agency.agency_name_en}
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-lg opacity-90">{getCountryName()}</span>
            {agency.verified && (
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.verified}
              </span>
            )}
            <span className={`px-3 py-1 rounded-full text-sm ${
              agency.agency_type === 'national' ? 'bg-blue-500/30' :
              agency.agency_type === 'regional' ? 'bg-purple-500/30' :
              'bg-gray-500/30'
            }`}>
              {locale === 'zh' ? t[agency.agency_type as keyof typeof t] : agency.agency_type}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.overview}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {locale === 'zh' ? agency.description_zh : agency.description}
              </p>
            </div>

            {/* Regulatory Information */}
            {(agency.regulatory_framework || agency.device_classification_system || agency.approval_process_description) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t.regulatoryInfo}
                </h2>
                <div className="space-y-4">
                  {agency.regulatory_framework && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.regulatoryFramework}</p>
                      <p className="text-gray-900 font-medium">{agency.regulatory_framework}</p>
                    </div>
                  )}
                  {agency.device_classification_system && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.classificationSystem}</p>
                      <p className="text-gray-900 font-medium">{agency.device_classification_system}</p>
                    </div>
                  )}
                  {agency.approval_process_description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.approvalProcess}</p>
                      <p className="text-gray-900">{agency.approval_process_description}</p>
                    </div>
                  )}
                  {agency.average_approval_time && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.approvalTime}</p>
                      <p className="text-gray-900">{agency.average_approval_time}</p>
                    </div>
                  )}
                  {agency.official_fees && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t.officialFees}</p>
                      <p className="text-gray-900">{agency.official_fees}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Official Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {t.officialLinks}
              </h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={agency.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#339999]/10 text-[#339999] rounded-lg hover:bg-[#339999]/20 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  {t.officialWebsite}
                </a>
                {agency.database_url && (
                  <a
                    href={agency.database_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                    </svg>
                    {t.database}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Contact & Additional Info */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t.contactInfo}
              </h2>
              <div className="space-y-3">
                {agency.contact_email && (
                  <a href={`mailto:${agency.contact_email}`} className="flex items-start gap-3 text-gray-700 hover:text-[#339999] transition-colors">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.email}</p>
                      <p className="text-sm">{agency.contact_email}</p>
                    </div>
                  </a>
                )}
                {agency.contact_phone && (
                  <a href={`tel:${agency.contact_phone}`} className="flex items-start gap-3 text-gray-700 hover:text-[#339999] transition-colors">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.phone}</p>
                      <p className="text-sm">{agency.contact_phone}</p>
                    </div>
                  </a>
                )}
                {agency.contact_fax && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.fax}</p>
                      <p className="text-sm">{agency.contact_fax}</p>
                    </div>
                  </div>
                )}
                {agency.contact_address && (
                  <div className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.address}</p>
                      <p className="text-sm">{agency.contact_address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Information */}
            {(agency.establishment_date || agency.parent_organization || agency.languages_supported) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {locale === 'zh' ? '其他信息' : 'Additional Information'}
                </h2>
                <div className="space-y-3">
                  {agency.establishment_date && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.establishmentDate}</p>
                      <p className="text-gray-900 font-medium">{agency.establishment_date}</p>
                    </div>
                  )}
                  {agency.parent_organization && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.parentOrg}</p>
                      <p className="text-gray-900 font-medium">{agency.parent_organization}</p>
                    </div>
                  )}
                  {agency.languages_supported && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">{t.languages}</p>
                      <p className="text-gray-900">{agency.languages_supported.join(', ')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
