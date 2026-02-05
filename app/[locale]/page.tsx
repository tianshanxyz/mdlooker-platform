'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { translations, locales, type Locale } from '../i18n-config';
import type { Company } from '../lib/types';

interface SearchResult {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
}

export default function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState<Locale>('en');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    params.then(p => {
      if (locales.includes(p.locale as Locale)) {
        setLocale(p.locale as Locale);
      }
    });
  }, [params]);

  const t = translations[locale];

  const searchCompanies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&page=1&pageSize=10`);
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
    searchCompanies(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-6 py-20">
      {/* 标题居中 */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-6">{t.hero.title}</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
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
            placeholder={t.hero.placeholder}
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              {locale === 'en' ? `Found ${results.total} companies` : `找到 ${results.total} 家企业`}
            </h2>
            {results.total > 0 && (
              <span className="text-sm text-slate-500">
                {locale === 'en' ? `Showing ${results.companies.length} results` : `显示 ${results.companies.length} 条结果`}
              </span>
            )}
          </div>
          
          {results.companies.length > 0 ? (
            <div className="grid gap-4">
              {results.companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/${locale}/companies/${company.id}`}
                  className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100 group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#339999] transition-colors">
                          {company.name}
                        </h3>
                        {company.name_zh && (
                          <span className="text-slate-500 text-sm">{company.name_zh}</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-3">
                        {company.country && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#339999]/10 text-[#339999]">
                            {company.country}
                          </span>
                        )}
                        {company.business_type && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                            {company.business_type}
                          </span>
                        )}
                      </div>
                      
                      {company.description && (
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">
                          {locale === 'zh' && company.description_zh ? company.description_zh : company.description}
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
                {locale === 'en' ? 'No companies found' : '未找到企业'}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {locale === 'en' ? 'Try a different search term' : '请尝试其他关键词'}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
