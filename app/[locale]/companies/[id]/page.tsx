'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { locales, type Locale } from '../../../i18n-config';
import type { CompanyWithRegistrations, DataSourceStats } from '../../../lib/types';

export default function CompanyDetailPage({
  params
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const [locale, setLocale] = useState<Locale>('en');
  const [companyId, setCompanyId] = useState<string>('');
  const [company, setCompany] = useState<CompanyWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'fda' | 'nmpa' | 'eudamed' | 'pmda' | 'healthcanada' | 'products'>('overview');

  useEffect(() => {
    params.then(p => {
      if (locales.includes(p.locale as Locale)) {
        setLocale(p.locale as Locale);
      }
      setCompanyId(p.id);
    });
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
    fda: 'FDA',
    nmpa: 'NMPA',
    eudamed: 'EUDAMED',
    pmda: 'PMDA',
    healthcanada: 'Health Canada',
    products: locale === 'en' ? 'Products' : '产品',
    companyInfo: locale === 'en' ? 'Company Information' : '企业信息',
    registrations: locale === 'en' ? 'Registrations' : '注册信息',
    noData: locale === 'en' ? 'No data available' : '暂无数据',
    source: locale === 'en' ? 'Source' : '来源',
  };

  const dataSourceStats: DataSourceStats[] = [
    { source: 'FDA', count: company.fda_registrations.length, lastUpdated: '2024-01', icon: '🇺🇸', color: 'blue' },
    { source: 'NMPA', count: company.nmpa_registrations.length, lastUpdated: '2024-01', icon: '🇨🇳', color: 'green' },
    { source: 'EUDAMED', count: company.eudamed_registrations.length, lastUpdated: '2024-01', icon: '🇪🇺', color: 'purple' },
    { source: 'PMDA', count: company.pmda_registrations.length, lastUpdated: '2024-01', icon: '🇯🇵', color: 'red' },
    { source: 'Health Canada', count: company.health_canada_registrations.length, lastUpdated: '2024-01', icon: '🇨🇦', color: 'orange' },
  ];

  const totalRegistrations = dataSourceStats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Link href={`/${locale}`} className="text-[#339999] hover:underline mb-6 inline-block">
        {locale === 'en' ? '← Back to Search' : '← 返回搜索'}
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
            {company.name_zh && (
              <p className="text-xl text-slate-600 mt-1">{company.name_zh}</p>
            )}
          </div>
          {company.country && (
            <span className="bg-[#339999]/10 text-[#339999] px-4 py-2 rounded-full text-sm font-medium">
              {company.country}
            </span>
          )}
        </div>

        {company.description && (
          <p className="text-slate-700 mb-6 leading-relaxed">
            {locale === 'zh' && company.description_zh ? company.description_zh : company.description}
          </p>
        )}

        <div className="grid md:grid-cols-2 gap-6 text-sm">
          {company.website && (
            <div>
              <span className="text-slate-500">{locale === 'en' ? 'Website: ' : '网站: '}</span>
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-[#339999] hover:underline">
                {company.website}
              </a>
            </div>
          )}
          {company.email && (
            <div>
              <span className="text-slate-500">{locale === 'en' ? 'Email: ' : '邮箱: '}</span>
              <a href={`mailto:${company.email}`} className="text-[#339999] hover:underline">
                {company.email}
              </a>
            </div>
          )}
          {company.phone && (
            <div>
              <span className="text-slate-500">{locale === 'en' ? 'Phone: ' : '电话: '}</span>
              <span className="text-slate-700">{company.phone}</span>
            </div>
          )}
          {company.business_type && (
            <div>
              <span className="text-slate-500">{locale === 'en' ? 'Business Type: ' : '业务类型: '}</span>
              <span className="text-slate-700">{company.business_type}</span>
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
        </div>

        {company.address && (
          <div className="mt-4 text-sm">
            <span className="text-slate-500">{locale === 'en' ? 'Address: ' : '地址: '}</span>
            <span className="text-slate-700">{company.address}</span>
          </div>
        )}
      </div>

      {/* Data Sources Overview */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        <div className="border-b border-slate-200">
          <nav className="flex flex-wrap">
            {(['overview', 'fda', 'nmpa', 'eudamed', 'pmda', 'healthcanada', 'products'] as const).map((tab) => {
              const count = tab === 'overview' ? totalRegistrations :
                tab === 'fda' ? company.fda_registrations.length :
                tab === 'nmpa' ? company.nmpa_registrations.length :
                tab === 'eudamed' ? company.eudamed_registrations.length :
                tab === 'pmda' ? company.pmda_registrations.length :
                tab === 'healthcanada' ? company.health_canada_registrations.length :
                company.products.length;
              
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-[#339999] text-[#339999]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t[tab]}
                  <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {dataSourceStats.map((stat) => (
                  <div 
                    key={stat.source}
                    className={`bg-${stat.color}-50 rounded-xl p-4 border border-${stat.color}-100 cursor-pointer hover:shadow-md transition-all`}
                    onClick={() => {
                      const tabMap: Record<string, 'fda' | 'nmpa' | 'eudamed' | 'pmda' | 'healthcanada'> = {
                        'FDA': 'fda',
                        'NMPA': 'nmpa',
                        'EUDAMED': 'eudamed',
                        'PMDA': 'pmda',
                        'Health Canada': 'healthcanada',
                      };
                      setActiveTab(tabMap[stat.source]);
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{stat.icon}</span>
                      <h3 className="font-semibold text-slate-700">{stat.source}</h3>
                    </div>
                    <p className="text-3xl font-bold text-[#339999]">{stat.count}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {locale === 'en' ? 'Registrations' : '注册'}
                    </p>
                  </div>
                ))}
              </div>

              {totalRegistrations > 0 && (
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Registration Distribution' : '注册分布'}
                  </h3>
                  <div className="space-y-3">
                    {dataSourceStats.filter(s => s.count > 0).map((stat) => (
                      <div key={stat.source} className="flex items-center gap-4">
                        <span className="text-sm text-slate-600 w-24">{stat.source}</span>
                        <div className="flex-1 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-[#339999] h-2 rounded-full transition-all"
                            style={{ width: `${(stat.count / totalRegistrations) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 w-12 text-right">
                          {Math.round((stat.count / totalRegistrations) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fda' && (
            <div className="space-y-4">
              {company.fda_registrations.length > 0 ? (
                company.fda_registrations.map((reg) => (
                  <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{reg.device_name}</h3>
                        <p className="text-slate-500 text-sm">{reg.registration_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reg.registration_status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {reg.registration_status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{reg.device_description}</p>
                    <div className="grid md:grid-cols-4 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-500 block text-xs">Device Class</span>
                        <span className="font-medium">{reg.device_class}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Product Code</span>
                        <span className="font-medium">{reg.product_code}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Regulation</span>
                        <span className="font-medium">{reg.regulation_number}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">FEI Number</span>
                        <span className="font-medium">{reg.fei_number}</span>
                      </div>
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" 
                         className="text-[#339999] hover:underline text-sm mt-4 inline-flex items-center gap-1">
                        {t.source} →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nmpa' && (
            <div className="space-y-4">
              {company.nmpa_registrations.length > 0 ? (
                company.nmpa_registrations.map((reg) => (
                  <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {locale === 'zh' && reg.product_name_zh ? reg.product_name_zh : reg.product_name}
                        </h3>
                        <p className="text-slate-500 text-sm font-mono">{reg.registration_number}</p>
                      </div>
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                        {reg.device_classification}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{reg.product_description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-500 block text-xs">Manufacturer</span>
                        <span className="font-medium">{reg.manufacturer_zh || reg.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Registration Holder</span>
                        <span className="font-medium">{reg.registration_holder_zh || reg.registration_holder}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Approval Date</span>
                        <span className="font-medium">{reg.approval_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Expiration Date</span>
                        <span className="font-medium">{reg.expiration_date}</span>
                      </div>
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" 
                         className="text-[#339999] hover:underline text-sm mt-4 inline-flex items-center gap-1">
                        {t.source} →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'eudamed' && (
            <div className="space-y-4">
              {company.eudamed_registrations.length > 0 ? (
                company.eudamed_registrations.map((reg) => (
                  <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{reg.device_name}</h3>
                        <p className="text-slate-500 text-sm">{reg.certificate_number}</p>
                      </div>
                      <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                        {reg.notified_body}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{reg.device_description}</p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-500 block text-xs">SRN</span>
                        <span className="font-medium">{reg.srn}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">NCA</span>
                        <span className="font-medium">{reg.nca}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">UDI-DI</span>
                        <span className="font-medium text-xs">{reg.udi_di}</span>
                      </div>
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" 
                         className="text-[#339999] hover:underline text-sm mt-4 inline-flex items-center gap-1">
                        {t.source} →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'pmda' && (
            <div className="space-y-4">
              {company.pmda_registrations.length > 0 ? (
                company.pmda_registrations.map((reg) => (
                  <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {reg.product_name_jp || reg.product_name}
                        </h3>
                        <p className="text-slate-500 text-sm font-mono">{reg.approval_number}</p>
                      </div>
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                        {reg.device_classification}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{reg.product_description}</p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-500 block text-xs">Manufacturer</span>
                        <span className="font-medium">{reg.manufacturer_jp || reg.manufacturer}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">MA Holder</span>
                        <span className="font-medium">{reg.marketing_authorization_holder_jp || reg.marketing_authorization_holder}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Approval Date</span>
                        <span className="font-medium">{reg.approval_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Expiration Date</span>
                        <span className="font-medium">{reg.expiration_date}</span>
                      </div>
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" 
                         className="text-[#339999] hover:underline text-sm mt-4 inline-flex items-center gap-1">
                        {t.source} →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'healthcanada' && (
            <div className="space-y-4">
              {company.health_canada_registrations.length > 0 ? (
                company.health_canada_registrations.map((reg) => (
                  <div key={reg.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-slate-900 text-lg">{reg.device_name}</h3>
                        <p className="text-slate-500 text-sm">{reg.licence_number}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        reg.licence_status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {reg.licence_status}
                      </span>
                    </div>
                    <p className="text-slate-600 mb-4">{reg.device_description}</p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                      <div>
                        <span className="text-slate-500 block text-xs">Device Class</span>
                        <span className="font-medium">{reg.device_class}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Issue Date</span>
                        <span className="font-medium">{reg.issue_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-xs">Expiry Date</span>
                        <span className="font-medium">{reg.expiry_date}</span>
                      </div>
                    </div>
                    {reg.source_url && (
                      <a href={reg.source_url} target="_blank" rel="noopener noreferrer" 
                         className="text-[#339999] hover:underline text-sm mt-4 inline-flex items-center gap-1">
                        {t.source} →
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-4">
              {company.products.length > 0 ? (
                company.products.map((product) => (
                  <div key={product.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-slate-900 text-lg">
                        {locale === 'zh' && product.name_zh ? product.name_zh : product.name}
                      </h3>
                      {product.brand_name && (
                        <span className="bg-[#339999]/10 text-[#339999] px-3 py-1 rounded-full text-xs font-medium">
                          {product.brand_name}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 mb-3">
                      {locale === 'zh' && product.description_zh ? product.description_zh : product.description}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      {product.model_number && (
                        <span className="text-slate-500">
                          <span className="font-medium text-slate-700">Model:</span> {product.model_number}
                        </span>
                      )}
                      {product.category && (
                        <span className="text-slate-500">
                          <span className="font-medium text-slate-700">Category:</span> {product.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>{t.noData}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
