'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { locales, type Locale } from '../../i18n-config';
import SearchBox from '../../components/SearchBox';
import { Building2, Package, ScanBarcode, Globe, Shield, FileText } from 'lucide-react';

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
  const params = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [results, setResults] = useState<ComplianceProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 从URL参数获取locale
  useState(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  });

  const isZh = locale === 'zh';

  const searchProfiles = async (query: string) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setLoading(true);
    setHasSearched(false);
    
    try {
      const response = await fetch(
        `/api/compliance-profile?q=${encodeURIComponent(query)}&type=auto`
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

  // 功能特性
  const features = [
    {
      icon: Building2,
      title: isZh ? '企业合规查询' : 'Company Compliance',
      description: isZh ? '查询企业在全球各市场的注册和认证状态' : 'Query company registration status across global markets',
    },
    {
      icon: Package,
      title: isZh ? '产品注册追踪' : 'Product Registration',
      description: isZh ? '追踪产品在不同国家的注册历史和现状' : 'Track product registration history and status',
    },
    {
      icon: ScanBarcode,
      title: isZh ? 'UDI信息查询' : 'UDI Lookup',
      description: isZh ? '通过UDI码查询设备详细信息和合规状态' : 'Query device details via UDI code',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#339999]/5 via-transparent to-[#2a7a7a]/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#339999]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2a7a7a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          {/* 标题区域 */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999]/10 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#339999]" />
              <span className="text-sm font-medium text-[#339999]">
                {isZh ? '高级合规查询工具' : 'Advanced Compliance Lookup'}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {isZh ? '全球合规档案查询' : 'Global Compliance Profile'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {isZh 
                ? '通过企业、产品或UDI查询多个目标市场的注册、认证、监管状态' 
                : 'Search by company, product, or UDI to view registration status across multiple markets'}
            </p>
          </div>

          {/* 统一搜索框 */}
          <div className="max-w-2xl mx-auto mb-12">
            <SearchBox
              locale={locale}
              onSearch={searchProfiles}
              isLoading={loading}
              placeholder={isZh ? '搜索企业、产品或 UDI...' : 'Search companies, products or UDI...'}
              showPopular={true}
            />
          </div>

          {/* 功能特性 - 仅在未搜索时显示 */}
          {!hasSearched && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#339999]/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-[#339999]" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      {hasSearched && (
        <section className="max-w-6xl mx-auto px-6 py-8">
          {/* 搜索结果统计 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {isZh ? `找到 ${results.length} 条合规档案` : `Found ${results.length} compliance profiles`}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isZh ? '搜索关键词: ' : 'Search query: '}
                <span className="text-[#339999] font-medium">{searchQuery}</span>
              </p>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((profile) => (
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
                      {isZh ? '注册汇总' : 'Registration Summary'}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-[#339999]">{profile.summary.totalRegistrations}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {isZh ? '总注册数' : 'Total Registrations'}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-[#339999]">{profile.summary.markets.length}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {isZh ? '市场' : 'Markets'}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-[#339999]">{profile.summary.deviceClasses.length}</p>
                        <p className="text-sm text-slate-600 mt-1">
                          {isZh ? '设备分类' : 'Device Classes'}
                        </p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">
                          {Object.entries(profile.summary.status).find(([k]) => k.toLowerCase().includes('active'))?.[1] || 0}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {isZh ? '活跃' : 'Active'}
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
                      {isZh ? '各市场注册详情' : 'Registration Details by Market'}
                    </h3>
                    <div className="space-y-4">
                      {profile.registrations.fda.length > 0 && (
                        <div className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🇺🇸</span>
                            <h4 className="font-semibold text-slate-900">FDA (USA)</h4>
                            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                              {profile.registrations.fda.length} {isZh ? '注册' : 'registrations'}
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
                                +{profile.registrations.fda.length - 3} {isZh ? '更多' : 'more'}
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
                              {profile.registrations.nmpa.length} {isZh ? '注册' : 'registrations'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            {profile.registrations.nmpa.slice(0, 3).map((reg) => (
                              <div key={reg.id} className="text-sm">
                                <p className="font-medium text-slate-700">
                                  {isZh && reg.product_name_zh ? reg.product_name_zh : reg.product_name}
                                </p>
                                <p className="text-slate-500">
                                  {reg.device_classification} • {reg.registration_number}
                                </p>
                              </div>
                            ))}
                            {profile.registrations.nmpa.length > 3 && (
                              <p className="text-sm text-[#339999]">
                                +{profile.registrations.nmpa.length - 3} {isZh ? '更多' : 'more'}
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
                              {profile.registrations.eudamed.length} {isZh ? '注册' : 'registrations'}
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
                                +{profile.registrations.eudamed.length - 3} {isZh ? '更多' : 'more'}
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
                              {profile.registrations.pmda.length} {isZh ? '注册' : 'registrations'}
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
                                +{profile.registrations.pmda.length - 3} {isZh ? '更多' : 'more'}
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
                              {profile.registrations.healthCanada.length} {isZh ? '注册' : 'registrations'}
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
                                +{profile.registrations.healthCanada.length - 3} {isZh ? '更多' : 'more'}
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
                      {isZh ? '查看完整档案' : 'View Full Profile'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl">
              <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-500 text-lg font-medium">
                {isZh ? '未找到合规档案' : 'No compliance profiles found'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {isZh ? '请尝试其他关键词' : 'Try a different search term'}
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
