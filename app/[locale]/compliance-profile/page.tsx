'use client';

import { useState } from 'react';
import Link from 'next/link';
import { locales, type Locale } from '../../i18n-config';

interface ComplianceProfile {
  company: {
    id: string;
    name: string;
    name_zh: string | null;
    country: string | null;
  };
  registrations: {
    fda: any[];
    nmpa: any[];
    eudamed: any[];
    pmda: any[];
    healthCanada: any[];
  };
  summary: {
    totalRegistrations: number;
    markets: string[];
    deviceClasses: string[];
    status: Record<string, number>;
  };
}

export default function ComplianceProfilePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState<'company' | 'product' | 'udi'>('company');
  const [results, setResults] = useState<ComplianceProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const searchProfiles = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/compliance-profile?q=${encodeURIComponent(query)}&type=${searchType}`
      );
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarketIcon = (market: string) => {
    const icons: Record<string, string> = {
      USA: '🇺🇸',
      China: '🇨🇳',
      EU: '🇪🇺',
      Japan: '🇯🇵',
      Canada: '🇨🇦',
    };
    return icons[market] || '🌍';
  };

  const getMarketColor = (market: string) => {
    const colors: Record<string, string> = {
      USA: 'bg-blue-100 text-blue-800',
      China: 'bg-green-100 text-green-800',
      EU: 'bg-purple-100 text-purple-800',
      Japan: 'bg-red-100 text-red-800',
      Canada: 'bg-orange-100 text-orange-800',
    };
    return colors[market] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        {locale === 'en' ? 'Global Compliance Profile' : '全球合规档案查询'}
      </h1>
      <p className="text-slate-600 mb-8">
        {locale === 'en'
          ? 'Search by company, product name, or UDI to view registration status across multiple markets'
          : '通过公司、产品名称或UDI查询多个目标市场的注册、认证、监管状态'}
      </p>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
        <div className="flex flex-wrap gap-4 mb-4">
          {(['company', 'product', 'udi'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSearchType(type)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                searchType === type
                  ? 'bg-[#339999] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type === 'company' && (locale === 'en' ? 'Company' : '公司')}
              {type === 'product' && (locale === 'en' ? 'Product' : '产品')}
              {type === 'udi' && 'UDI'}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchProfiles()}
            placeholder={
              searchType === 'company'
                ? locale === 'en'
                  ? 'Enter company name...'
                  : '输入公司名称...'
                : searchType === 'product'
                ? locale === 'en'
                  ? 'Enter product name...'
                  : '输入产品名称...'
                : locale === 'en'
                ? 'Enter UDI...'
                : '输入UDI...'
            }
            className="flex-1 px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
          />
          <button
            onClick={searchProfiles}
            disabled={loading}
            className="px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{locale === 'en' ? 'Searching...' : '搜索中...'}</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>{locale === 'en' ? 'Search' : '搜索'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {hasSearched && (
        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((profile) => (
              <div key={profile.company.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
                {/* Company Header */}
                <div className="bg-gradient-to-r from-[#339999]/10 to-transparent p-6 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{profile.company.name}</h2>
                      {profile.company.name_zh && (
                        <p className="text-lg text-slate-600 mt-1">{profile.company.name_zh}</p>
                      )}
                    </div>
                    {profile.company.country && (
                      <span className="bg-[#339999]/10 text-[#339999] px-4 py-2 rounded-full text-sm font-medium">
                        {profile.company.country}
                      </span>
                    )}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Registration Summary' : '注册汇总'}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#339999]">{profile.summary.totalRegistrations}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {locale === 'en' ? 'Total Registrations' : '总注册数'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#339999]">{profile.summary.markets.length}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {locale === 'en' ? 'Markets' : '市场'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-[#339999]">{profile.summary.deviceClasses.length}</p>
                      <p className="text-sm text-slate-600 mt-1">
                        {locale === 'en' ? 'Device Classes' : '设备分类'}
                      </p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {Object.entries(profile.summary.status).find(([k]) => k.toLowerCase().includes('active'))?.[1] || 0}
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {locale === 'en' ? 'Active' : '活跃'}
                      </p>
                    </div>
                  </div>

                  {/* Markets */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {profile.summary.markets.map((market) => (
                      <span
                        key={market}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${getMarketColor(market)}`}
                      >
                        <span>{getMarketIcon(market)}</span>
                        <span>{market}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Registration Details by Market */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    {locale === 'en' ? 'Registration Details by Market' : '各市场注册详情'}
                  </h3>
                  <div className="space-y-4">
                    {profile.registrations.fda.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🇺🇸</span>
                          <h4 className="font-semibold text-slate-900">FDA (USA)</h4>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                            {profile.registrations.fda.length} {locale === 'en' ? 'registrations' : '注册'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {profile.registrations.fda.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              <p className="font-medium text-slate-700">{reg.device_name}</p>
                              <p className="text-slate-500">
                                {reg.device_class} • {reg.registration_status}
                              </p>
                            </div>
                          ))}
                          {profile.registrations.fda.length > 3 && (
                            <p className="text-sm text-[#339999]">
                              +{profile.registrations.fda.length - 3} {locale === 'en' ? 'more' : '更多'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.registrations.nmpa.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🇨🇳</span>
                          <h4 className="font-semibold text-slate-900">NMPA (China)</h4>
                          <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-xs">
                            {profile.registrations.nmpa.length} {locale === 'en' ? 'registrations' : '注册'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {profile.registrations.nmpa.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              <p className="font-medium text-slate-700">
                                {locale === 'zh' && reg.product_name_zh ? reg.product_name_zh : reg.product_name}
                              </p>
                              <p className="text-slate-500">
                                {reg.device_classification} • {reg.registration_number}
                              </p>
                            </div>
                          ))}
                          {profile.registrations.nmpa.length > 3 && (
                            <p className="text-sm text-[#339999]">
                              +{profile.registrations.nmpa.length - 3} {locale === 'en' ? 'more' : '更多'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.registrations.eudamed.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🇪🇺</span>
                          <h4 className="font-semibold text-slate-900">EUDAMED (EU)</h4>
                          <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
                            {profile.registrations.eudamed.length} {locale === 'en' ? 'registrations' : '注册'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {profile.registrations.eudamed.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              <p className="font-medium text-slate-700">{reg.device_name}</p>
                              <p className="text-slate-500">
                                {reg.notified_body} • {reg.certificate_number}
                              </p>
                            </div>
                          ))}
                          {profile.registrations.eudamed.length > 3 && (
                            <p className="text-sm text-[#339999]">
                              +{profile.registrations.eudamed.length - 3} {locale === 'en' ? 'more' : '更多'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.registrations.pmda.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🇯🇵</span>
                          <h4 className="font-semibold text-slate-900">PMDA (Japan)</h4>
                          <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-full text-xs">
                            {profile.registrations.pmda.length} {locale === 'en' ? 'registrations' : '注册'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {profile.registrations.pmda.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              <p className="font-medium text-slate-700">
                                {reg.product_name_jp || reg.product_name}
                              </p>
                              <p className="text-slate-500">
                                {reg.device_classification} • {reg.approval_number}
                              </p>
                            </div>
                          ))}
                          {profile.registrations.pmda.length > 3 && (
                            <p className="text-sm text-[#339999]">
                              +{profile.registrations.pmda.length - 3} {locale === 'en' ? 'more' : '更多'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {profile.registrations.healthCanada.length > 0 && (
                      <div className="border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">🇨🇦</span>
                          <h4 className="font-semibold text-slate-900">Health Canada</h4>
                          <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full text-xs">
                            {profile.registrations.healthCanada.length} {locale === 'en' ? 'registrations' : '注册'}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {profile.registrations.healthCanada.slice(0, 3).map((reg) => (
                            <div key={reg.id} className="text-sm">
                              <p className="font-medium text-slate-700">{reg.device_name}</p>
                              <p className="text-slate-500">
                                {reg.device_class} • {reg.licence_status}
                              </p>
                            </div>
                          ))}
                          {profile.registrations.healthCanada.length > 3 && (
                            <p className="text-sm text-[#339999]">
                              +{profile.registrations.healthCanada.length - 3} {locale === 'en' ? 'more' : '更多'}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Full Profile Button */}
                <div className="px-6 pb-6">
                  <Link
                    href={`/${locale}/companies/${profile.company.id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
                  >
                    {locale === 'en' ? 'View Full Profile' : '查看完整档案'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 text-lg">
                {locale === 'en' ? 'No compliance profiles found' : '未找到合规档案'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {locale === 'en' ? 'Try a different search term' : '请尝试其他关键词'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
