'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

// 模拟产品详情数据
const mockProduct = {
  id: '1',
  product_name: 'Intravascular Stent System',
  product_name_en: 'Intravascular Stent System',
  product_name_zh: '血管内支架系统',
  model_number: 'STS-2024',
  udi_di: '00643169007221',
  product_category: '心血管植入物',
  device_class_us: 'Class III',
  device_class_eu: 'Class III',
  device_class_cn: 'Class III',
  description: 'Advanced intravascular stent system for treatment of coronary artery disease. Features drug-eluting technology and optimized stent design for improved patient outcomes.',
  description_zh: '先进的血管内支架系统，用于治疗冠状动脉疾病。采用药物洗脱技术和优化的支架设计，改善患者预后。',
  intended_use: 'For percutaneous transluminal coronary angioplasty (PTCA) procedures to improve coronary artery luminal diameter in patients with symptomatic coronary artery disease.',
  intended_use_zh: '用于经皮冠状动脉腔内血管成形术 (PTCA)，改善冠状动脉疾病患者的冠状动脉管腔直径。',
  manufacturer_name: 'MedTech Solutions Inc.',
  manufacturer_country: 'United States',
  registration_status: 'active',
  first_approval_date: '2020-03-15',
  latest_approval_date: '2024-01-20',
  company_id: '1',
  company_name: 'MedTech Solutions',
};

// 模拟注册数据
const mockRegistrations = [
  {
    id: '1',
    country: 'United States',
    country_code: 'US',
    registration_number: 'P190012',
    registration_status: 'approved',
    registration_type: 'PMA',
    approval_date: '2020-03-15',
    expiration_date: '2025-03-15',
    product_classification: 'Class III',
  },
  {
    id: '2',
    country: 'China',
    country_code: 'CN',
    registration_number: '国械注准 20203130001',
    registration_status: 'approved',
    registration_type: 'NMPA Registration',
    approval_date: '2020-06-20',
    expiration_date: '2025-06-20',
    product_classification: 'Class III',
  },
  {
    id: '3',
    country: 'European Union',
    country_code: 'EU',
    registration_number: 'CE-0123',
    registration_status: 'approved',
    registration_type: 'CE Mark (MDR)',
    approval_date: '2020-05-10',
    expiration_date: '2025-05-10',
    product_classification: 'Class III',
  },
  {
    id: '4',
    country: 'Japan',
    country_code: 'JP',
    registration_number: '30200BZX00001',
    registration_status: 'approved',
    registration_type: 'PMDA Approval',
    approval_date: '2020-09-01',
    expiration_date: '2025-09-01',
    product_classification: 'Class III',
  },
  {
    id: '5',
    country: 'Canada',
    country_code: 'CA',
    registration_number: 'MD-123456',
    registration_status: 'approved',
    registration_type: 'Health Canada License',
    approval_date: '2020-07-15',
    expiration_date: '2025-07-15',
    product_classification: 'Class III',
  },
  {
    id: '6',
    country: 'Australia',
    country_code: 'AU',
    registration_number: 'ARTG-123456',
    registration_status: 'approved',
    registration_type: 'TGA Registration',
    approval_date: '2020-08-20',
    expiration_date: '2025-08-20',
    product_classification: 'Class III',
  },
];

// 模拟时间线事件
const mockTimeline = [
  {
    id: '1',
    event_type: 'approval',
    event_date: '2020-03-15',
    event_description: 'FDA PMA Approval - First global approval',
    event_description_zh: 'FDA PMA 获批 - 全球首次获批',
    country: 'United States',
    country_code: 'US',
  },
  {
    id: '2',
    event_type: 'approval',
    event_date: '2020-05-10',
    event_description: 'CE Mark Approval (EU MDR)',
    event_description_zh: 'CE 标志获批 (欧盟 MDR)',
    country: 'European Union',
    country_code: 'EU',
  },
  {
    id: '3',
    event_type: 'approval',
    event_date: '2020-06-20',
    event_description: 'NMPA Registration Approval',
    event_description_zh: 'NMPA 注册获批',
    country: 'China',
    country_code: 'CN',
  },
  {
    id: '4',
    event_type: 'approval',
    event_date: '2020-07-15',
    event_description: 'Health Canada License Approval',
    event_description_zh: '加拿大卫生部许可证获批',
    country: 'Canada',
    country_code: 'CA',
  },
  {
    id: '5',
    event_type: 'renewal',
    event_date: '2024-01-20',
    event_description: 'Latest registration approval in new market',
    event_description_zh: '最新市场注册获批',
    country: 'South Korea',
    country_code: 'KR',
  },
];

export default function ProductDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';

  const t = {
    backToList: locale === 'zh' ? '返回列表' : 'Back to List',
    overview: locale === 'zh' ? '产品概览' : 'Product Overview',
    globalRegistrations: locale === 'zh' ? '全球注册情况' : 'Global Registrations',
    registrationTimeline: locale === 'zh' ? '注册时间线' : 'Registration Timeline',
    productInfo: locale === 'zh' ? '产品信息' : 'Product Information',
    classification: locale === 'zh' ? '产品分类' : 'Classification',
    intendedUse: locale === 'zh' ? '预期用途' : 'Intended Use',
    manufacturer: locale === 'zh' ? '生产商' : 'Manufacturer',
    registrationHistory: locale === 'zh' ? '注册历史' : 'Registration History',
    country: locale === 'zh' ? '国家' : 'Country',
    registrationNumber: locale === 'zh' ? '注册证号' : 'Registration Number',
    registrationType: locale === 'zh' ? '注册类型' : 'Registration Type',
    approvalDate: locale === 'zh' ? '获批日期' : 'Approval Date',
    expirationDate: locale === 'zh' ? '有效期至' : 'Expiration Date',
    status: locale === 'zh' ? '状态' : 'Status',
    approved: locale === 'zh' ? '已获批' : 'Approved',
    pending: locale === 'zh' ? '审核中' : 'Pending',
    expired: locale === 'zh' ? '已过期' : 'Expired',
    viewCompany: locale === 'zh' ? '查看企业详情' : 'View Company',
    totalCountries: locale === 'zh' ? '注册国家' : 'Countries',
    firstApproval: locale === 'zh' ? '首次获批' : 'First Approval',
    latestApproval: locale === 'zh' ? '最新获批' : 'Latest Approval',
  };

  const countryFlags: Record<string, string> = {
    'US': '🇺🇸', 'CN': '🇨🇳', 'EU': '🇪🇺', 'JP': '🇯🇵',
    'CA': '🇨🇦', 'AU': '🇦🇺', 'KR': '🇰🇷', 'SG': '🇸🇬',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Header - 统一使用网站主色调 #339999 */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <Link
            href={`/${params.locale}/product-tracker`}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t.backToList}
          </Link>
          
          <h1 className="text-4xl font-bold mb-4">
            {locale === 'zh' ? mockProduct.product_name_zh : mockProduct.product_name_en}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center text-lg">
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
              {mockProduct.model_number}
            </span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-mono">
              UDI: {mockProduct.udi_di}
            </span>
            <span className="px-3 py-1 bg-green-500/30 rounded-full text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {t.approved}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.overview}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">{t.productInfo}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {locale === 'zh' ? mockProduct.description_zh : mockProduct.description}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">{t.intendedUse}</p>
                  <p className="text-gray-700 leading-relaxed">
                    {locale === 'zh' ? mockProduct.intended_use_zh : mockProduct.intended_use}
                  </p>
                </div>
              </div>
            </div>

            {/* Global Registrations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                {t.globalRegistrations}
              </h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.country}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.registrationNumber}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.registrationType}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.approvalDate}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.expirationDate}</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">{t.status}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRegistrations.map((reg) => (
                      <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          <span className="flex items-center gap-2">
                            <span className="text-xl">{countryFlags[reg.country_code] || '🌍'}</span>
                            <span className="text-gray-900">{reg.country}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-mono text-gray-900">{reg.registration_number}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{reg.registration_type}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{reg.approval_date}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{reg.expiration_date}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reg.registration_status === 'approved' 
                              ? 'bg-green-100 text-green-700'
                              : reg.registration_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {locale === 'zh' ? t[reg.registration_status as keyof typeof t] : reg.registration_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t.registrationTimeline}
              </h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <div className="space-y-4">
                  {mockTimeline.map((event) => (
                    <div key={event.id} className="relative flex gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        event.event_type === 'approval' 
                          ? 'bg-[#339999] text-white'
                          : event.event_type === 'renewal'
                          ? 'bg-[#2a7a7a] text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {event.event_type === 'approval' && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {event.event_type === 'renewal' && (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{countryFlags[event.country_code] || '🌍'}</span>
                          <span className="text-sm font-semibold text-gray-900">{event.country}</span>
                          <span className="text-xs text-gray-500 ml-auto">{event.event_date}</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {locale === 'zh' ? event.event_description_zh : event.event_description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.classification}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">FDA</span>
                  <span className="text-sm font-semibold text-gray-900">{mockProduct.device_class_us}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">EU MDR</span>
                  <span className="text-sm font-semibold text-gray-900">{mockProduct.device_class_eu}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">NMPA</span>
                  <span className="text-sm font-semibold text-gray-900">{mockProduct.device_class_cn}</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Statistics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.totalCountries}</p>
                  <p className="text-3xl font-bold text-[#339999]">{mockRegistrations.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.firstApproval}</p>
                  <p className="text-lg font-semibold text-gray-900">{mockProduct.first_approval_date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t.latestApproval}</p>
                  <p className="text-lg font-semibold text-gray-900">{mockProduct.latest_approval_date}</p>
                </div>
              </div>
            </div>

            {/* Manufacturer */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t.manufacturer}</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {locale === 'zh' ? '公司名称' : 'Company Name'}
                  </p>
                  <p className="text-gray-900 font-medium">{mockProduct.manufacturer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    {locale === 'zh' ? '国家' : 'Country'}
                  </p>
                  <p className="text-gray-900">{mockProduct.manufacturer_country}</p>
                </div>
                <Link
                  href={`/${params.locale}/companies/${mockProduct.company_id}`}
                  className="block w-full text-center py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all font-medium"
                >
                  {t.viewCompany}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
