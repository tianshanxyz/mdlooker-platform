'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// 模拟数据
const mockAgency = {
  id: '1',
  country: 'United States',
  country_code: 'US',
  agency_name: 'Food and Drug Administration',
  agency_name_en: 'Food and Drug Administration',
  agency_name_zh: '美国食品药品监督管理局',
  agency_type: 'national',
  official_website: 'https://www.fda.gov',
  database_url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfRL/rl.cfm',
  contact_email: 'info@fda.gov',
  contact_phone: '+1-888-463-6332',
  contact_fax: '+1-301-827-0111',
  contact_address: '10903 New Hampshire Avenue, Silver Spring, MD 20993, USA',
  description: 'The FDA is responsible for protecting the public health by ensuring the safety, efficacy, and security of human drugs, biological products, and medical devices. The FDA also ensures the safety of our nation\'s food supply, cosmetics, and products that emit radiation.',
  description_zh: 'FDA 负责通过确保人用药品、生物制品和医疗器械的安全性、有效性和安全性来保护公众健康。FDA 还确保我们国家食品供应、化妆品和辐射产品的安全性。',
  establishment_date: '1906-06-30',
  parent_organization: 'Department of Health and Human Services',
  regulatory_framework: 'Federal Food, Drug, and Cosmetic Act (FD&C Act)',
  device_classification_system: 'Class I, Class II, Class III (based on risk)',
  approval_process_description: 'Medical devices must undergo premarket notification (510(k)) or premarket approval (PMA) depending on their classification. Class I devices are generally exempt from premarket requirements.',
  average_approval_time: '510(k): 90 days; PMA: 180 days',
  official_fees: '510(k): $12,676 (small business: $3,169); PMA: $289,232 (small business: $72,308)',
  languages_supported: ['English'],
  verified: true,
};

export default function RegulatorDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';

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
  };

  const getCountryName = () => {
    const names: Record<string, { zh: string; en: string }> = {
      'United States': { zh: '美国', en: 'United States' },
      'China': { zh: '中国', en: 'China' },
      'European Union': { zh: '欧盟', en: 'European Union' },
      'Japan': { zh: '日本', en: 'Japan' },
      'Canada': { zh: '加拿大', en: 'Canada' },
      'Australia': { zh: '澳大利亚', en: 'Australia' },
    };
    return names[mockAgency.country]?.[locale === 'zh' ? 'zh' : 'en'] || mockAgency.country;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <Link
            href={`/${params.locale}/regulators`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToList}
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <span className="text-4xl">
              {mockAgency.country_code === 'US' ? '🇺🇸' :
               mockAgency.country_code === 'CN' ? '🇨🇳' :
               mockAgency.country_code === 'EU' ? '🇪🇺' :
               mockAgency.country_code === 'JP' ? '🇯🇵' :
               mockAgency.country_code === 'CA' ? '🇨🇦' :
               mockAgency.country_code === 'AU' ? '🇦🇺' : '🌍'}
            </span>
            <h1 className="text-4xl font-bold">
              {locale === 'zh' ? mockAgency.agency_name_zh : mockAgency.agency_name_en}
            </h1>
          </div>
          
          <div className="flex items-center gap-4 text-lg">
            <span className="opacity-90">{getCountryName()}</span>
            {mockAgency.verified && (
              <span className="px-3 py-1 bg-green-500/30 text-green-100 text-sm rounded-full flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t.verified}
              </span>
            )}
            <span className="px-3 py-1 bg-white/20 text-white text-sm rounded-full">
              {locale === 'zh' ? t[mockAgency.agency_type as keyof typeof t] : mockAgency.agency_type}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.overview}
              </h2>
              <p className="text-gray-600 leading-relaxed">
                {locale === 'zh' ? mockAgency.description_zh : mockAgency.description}
              </p>
            </div>

            {/* Regulatory Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t.regulatoryInfo}
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{t.regulatoryFramework}</p>
                  <p className="text-gray-900">{mockAgency.regulatory_framework}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{t.classificationSystem}</p>
                  <p className="text-gray-900">{mockAgency.device_classification_system}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{t.approvalProcess}</p>
                  <p className="text-gray-900">{mockAgency.approval_process_description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{t.approvalTime}</p>
                    <p className="text-gray-900">{mockAgency.average_approval_time}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 mb-1">{t.officialFees}</p>
                    <p className="text-gray-900 text-sm">{mockAgency.official_fees}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {t.contactInfo}
              </h2>
              <div className="space-y-3">
                {mockAgency.contact_email && (
                  <a href={`mailto:${mockAgency.contact_email}`} className="block text-sm text-gray-600 hover:text-[#339999] transition-colors">
                    <span className="text-xs text-gray-400 block">{t.email}</span>
                    {mockAgency.contact_email}
                  </a>
                )}
                {mockAgency.contact_phone && (
                  <a href={`tel:${mockAgency.contact_phone}`} className="block text-sm text-gray-600 hover:text-[#339999] transition-colors">
                    <span className="text-xs text-gray-400 block">{t.phone}</span>
                    {mockAgency.contact_phone}
                  </a>
                )}
                {mockAgency.contact_fax && (
                  <div className="text-sm text-gray-600">
                    <span className="text-xs text-gray-400 block">{t.fax}</span>
                    {mockAgency.contact_fax}
                  </div>
                )}
                {mockAgency.contact_address && (
                  <div className="text-sm text-gray-600">
                    <span className="text-xs text-gray-400 block">{t.address}</span>
                    {mockAgency.contact_address}
                  </div>
                )}
              </div>
            </div>

            {/* Official Links */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                {t.officialLinks}
              </h2>
              <div className="space-y-3">
                <a
                  href={mockAgency.official_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-3 bg-[#339999]/10 text-[#339999] rounded-xl hover:bg-[#339999]/20 transition-colors text-sm font-medium"
                >
                  <div className="flex items-center justify-between">
                    <span>{t.officialWebsite}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
                {mockAgency.database_url && (
                  <a
                    href={mockAgency.database_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    <div className="flex items-center justify-between">
                      <span>{t.database}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Info
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">{t.establishmentDate}</p>
                  <p className="text-gray-900">{new Date(mockAgency.establishment_date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t.parentOrg}</p>
                  <p className="text-gray-900">{mockAgency.parent_organization}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">{t.languages}</p>
                  <p className="text-gray-900">{mockAgency.languages_supported.join(', ')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
