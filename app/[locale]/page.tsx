'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { translations, locales, type Locale } from '../i18n-config';

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

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
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

  const handleSearch = () => {
    searchItems(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    searchItems(suggestion);
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      {/* 标题居中 - 使用flex确保完全居中 */}
      <div className="flex flex-col items-center justify-center text-center mb-12 w-full">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 leading-tight">
          {t.hero.title}
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto px-4">
          {t.hero.subtitle}
        </p>
      </div>

      {/* 搜索框 */}
      <div className="relative max-w-2xl mx-auto mb-12">
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={locale === 'en' ? 'Search companies, products, UDI...' : '搜索企业、产品、UDI...'}
            className="flex-1 px-6 py-4 rounded-lg border border-slate-300 text-lg focus:outline-none focus:ring-2 focus:ring-[#339999] focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

      {/* 搜索结果 */}
      {hasSearched && results && (
        <div>
          {/* 搜索结果统计 */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-800">
                {locale === 'en' 
                  ? `Found ${results.total} results` 
                  : `找到 ${results.total} 条结果`}
              </h2>
              {results.detectedType !== 'general' && (
                <p className="text-sm text-slate-500 mt-1">
                  {locale === 'en' 
                    ? `Detected: ${results.detectedType}` 
                    : `检测到: ${results.detectedType === 'company' ? '企业' : results.detectedType === 'product' ? '产品' : results.detectedType === 'udi' ? 'UDI' : '通用'}`}
                </p>
              )}
            </div>
            {results.total > 0 && (
              <span className="text-sm text-slate-500">
                {locale === 'en' 
                  ? `Showing ${Math.min(results.results.length, 10)} results` 
                  : `显示 ${Math.min(results.results.length, 10)} 条结果`}
              </span>
            )}
          </div>

          {/* 搜索建议 */}
          {results.suggestions && results.suggestions.length > 0 && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800 mb-2">
                {locale === 'en' ? 'Did you mean:' : '您是否想找:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {results.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1 bg-white text-amber-700 rounded-full text-sm border border-amber-300 hover:bg-amber-100 transition-colors"
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
                    ? `/${locale}/companies/${item.id}` // 产品链接到公司详情
                    : `/${locale}/compliance-profile?q=${encodeURIComponent(item.name || '')}`
                  }
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 group"
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
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.resultType === 'company' 
                            ? 'bg-blue-100 text-blue-700'
                            : item.resultType === 'product'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.resultType === 'company' 
                            ? (locale === 'en' ? 'Company' : '企业')
                            : item.resultType === 'product'
                            ? (locale === 'en' ? 'Product' : '产品')
                            : 'UDI'}
                        </span>
                      </div>
                      
                      {/* 如果是产品，显示所属公司 */}
                      {item.resultType === 'product' && item.company_name && (
                        <p className="text-sm text-slate-500 mb-2">
                          {locale === 'en' ? 'By: ' : '制造商: '}
                          <span className="text-slate-700">{item.company_name}</span>
                          {item.company_country && (
                            <span className="ml-2 text-slate-400">({item.company_country})</span>
                          )}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        {item.country && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#339999]/10 text-[#339999]">
                            {item.country}
                          </span>
                        )}
                        {item.business_type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {item.business_type}
                          </span>
                        )}
                      </div>
                      
                      {item.description && (
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                          {locale === 'zh' && item.description_zh ? item.description_zh : item.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex items-center">
                      <span className="text-[#339999] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        {locale === 'en' ? 'View Details' : '查看详情'}
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
            <div className="text-center py-16 bg-slate-50 rounded-xl">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-slate-500 text-lg">
                {locale === 'en' ? 'No results found' : '未找到结果'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {locale === 'en' 
                  ? 'Try different keywords or check the suggestions above' 
                  : '请尝试其他关键词或查看上方建议'}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
