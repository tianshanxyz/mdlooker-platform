'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { translations, locales, type Locale } from '../i18n-config';
import SearchBox from '../components/SearchBox';
import { Building2, Package, ScanBarcode, Globe, Shield, Sparkles } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  name_zh?: string;
  description?: string;
  description_zh?: string;
  country?: string;
  business_type?: string;
  resultType: 'company' | 'product' | 'udi';
  company_name?: string;
  company_name_zh?: string;
  company_country?: string;
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  suggestions: string[];
  detectedType: string;
  query: string;
  hasMore: boolean;
}

export default function HomePage() {
  const params = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const t = translations[locale];
  const isZh = locale === 'zh';

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=1&pageSize=10&type=auto`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setHasSearched(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    searchItems(suggestion);
  };

  // 功能特性数据
  const features = [
    {
      icon: Building2,
      title: isZh ? '企业合规档案' : 'Company Compliance',
      description: isZh ? '查询全球医疗器械企业注册信息、认证状态和历史记录' : 'Query global medical device company registrations, certifications, and history',
      href: `/${locale}/compliance-profile`,
      color: 'blue'
    },
    {
      icon: Globe,
      title: isZh ? '市场准入导航' : 'Market Access',
      description: isZh ? '了解各国医疗器械注册要求和准入路径' : 'Understand medical device registration requirements and access pathways',
      href: `/${locale}/market-access`,
      color: 'teal'
    },
    {
      icon: Shield,
      title: isZh ? '法规指南' : 'Regulatory Guides',
      description: isZh ? '详细的FDA、NMPA、EU MDR等注册指南' : 'Detailed FDA, NMPA, EU MDR registration guides',
      href: `/${locale}/guides`,
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#339999]/5 via-transparent to-[#2a7a7a]/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#339999]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2a7a7a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#339999]" />
              <span className="text-sm font-medium text-[#339999]">
                {isZh ? '全球医疗器械合规智能平台' : 'Global Medical Device Compliance Intelligence'}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto mb-16">
            <SearchBox
              locale={locale}
              onSearch={searchItems}
              isLoading={loading}
              placeholder={isZh ? '搜索公司、产品或 UDI...' : 'Search companies, products or UDI...'}
            />
          </div>

          {/* 搜索结果 */}
          {hasSearched && results && (
            <div className="max-w-4xl mx-auto">
              {/* 搜索结果统计 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">
                    {isZh ? `找到 ${results.total} 条结果` : `Found ${results.total} results`}
                  </h2>
                  {results.detectedType !== 'general' && (
                    <p className="text-sm text-slate-500 mt-1">
                      {isZh ? '检测到' : 'Detected'}: 
                      <span className="text-[#339999] font-medium ml-1">
                        {results.detectedType === 'company' 
                          ? (isZh ? '企业搜索' : 'Company Search')
                          : results.detectedType === 'product'
                          ? (isZh ? '产品搜索' : 'Product Search')
                          : results.detectedType === 'udi'
                          ? 'UDI Search'
                          : results.detectedType}
                      </span>
                    </p>
                  )}
                </div>
                {results.total > 0 && (
                  <span className="text-sm text-slate-500">
                    {isZh 
                      ? `显示 ${Math.min(results.results.length, 10)} 条` 
                      : `Showing ${Math.min(results.results.length, 10)}`}
                  </span>
                )}
              </div>

              {/* 搜索建议 */}
              {results.suggestions && results.suggestions.length > 0 && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800 mb-2">
                    {isZh ? '您是否想找:' : 'Did you mean:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {results.suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="px-4 py-2 bg-white text-amber-700 rounded-full text-sm border border-amber-300 hover:bg-amber-100 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {results.results.length > 0 ? (
                <div className="grid gap-4">
                  {results.results.map((item) => (
                    <Link
                      key={`${item.resultType}-${item.id}`}
                      href={item.resultType === 'company' 
                        ? `/${locale}/companies/${item.id}` 
                        : item.resultType === 'product'
                        ? `/${locale}/companies/${item.id}`
                        : `/${locale}/compliance-profile?q=${encodeURIComponent(item.name || '')}`
                      }
                      className="medical-card p-6 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#339999] transition-colors">
                              {item.name}
                            </h3>
                            {item.name_zh && (
                              <span className="text-slate-500 text-sm">{item.name_zh}</span>
                            )}
                            {/* 结果类型标签 */}
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                              item.resultType === 'company' 
                                ? 'bg-blue-100 text-blue-700'
                                : item.resultType === 'product'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}>
                              {item.resultType === 'company' 
                                ? (isZh ? '企业' : 'Company')
                                : item.resultType === 'product'
                                ? (isZh ? '产品' : 'Product')
                                : 'UDI'}
                            </span>
                          </div>
                          
                          {/* 如果是产品，显示所属公司 */}
                          {item.resultType === 'product' && item.company_name && (
                            <p className="text-sm text-slate-500 mb-2">
                              {isZh ? '制造商: ' : 'By: '}
                              <span className="text-slate-700">{item.company_name}</span>
                              {item.company_country && (
                                <span className="ml-2 text-slate-400">({item.company_country})</span>
                              )}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            {item.country && (
                              <span className="medical-tag">
                                <Globe className="w-3 h-3" />
                                {item.country}
                              </span>
                            )}
                            {item.business_type && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                                {item.business_type}
                              </span>
                            )}
                          </div>
                          
                          {item.description && (
                            <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                              {isZh && item.description_zh ? item.description_zh : item.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4 flex items-center">
                          <span className="text-[#339999] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                            {isZh ? '查看详情' : 'View Details'}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 rounded-2xl">
                  <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 text-lg font-medium">
                    {isZh ? '未找到结果' : 'No results found'}
                  </p>
                  <p className="text-slate-400 text-sm mt-2">
                    {isZh 
                      ? '请尝试其他关键词或查看上方建议' 
                      : 'Try different keywords or check the suggestions above'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 功能特性卡片 - 仅在未搜索时显示 */}
          {!hasSearched && (
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="medical-card p-6 group hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    feature.color === 'teal' ? 'bg-[#339999]/10 text-[#339999]' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#339999] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
