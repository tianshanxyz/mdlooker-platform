'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { locales, type Locale } from '../../i18n-config';
import SearchBox from '../../components/SearchBox';
import { Building2, Globe, ChevronRight } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  name_zh?: string;
  country?: string;
  business_type?: string;
  description?: string;
  description_zh?: string;
}

interface CompaniesResponse {
  companies: Company[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export default function CompaniesPage() {
  const params = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const isZh = locale === 'zh';

  // 加载公司列表
  const loadCompanies = async (pageNum: number = 1, searchQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = searchQuery 
        ? `/api/search?q=${encodeURIComponent(searchQuery)}&page=${pageNum}&pageSize=20&type=company`
        : `/api/search?q=&page=${pageNum}&pageSize=20&type=company`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (pageNum === 1) {
          setCompanies(data.results || []);
        } else {
          setCompanies(prev => [...prev, ...(data.results || [])]);
        }
        setTotal(data.total || 0);
        setHasMore(data.hasMore || false);
      } else {
        setError(isZh ? '加载失败' : 'Failed to load');
      }
    } catch (err) {
      setError(isZh ? '网络错误' : 'Network error');
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadCompanies(1);
  }, [locale]);

  const handleSearch = (query: string) => {
    setPage(1);
    loadCompanies(1, query);
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCompanies(nextPage);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <Link href={`/${locale}`} className="hover:text-[#339999]">
              {isZh ? '首页' : 'Home'}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900">{isZh ? '企业' : 'Companies'}</span>
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            {isZh ? '医疗器械企业' : 'Medical Device Companies'}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {isZh 
              ? '浏览全球医疗器械注册企业，查看合规档案和注册信息。'
              : 'Browse global medical device registered companies, view compliance profiles and registration information.'}
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="max-w-6xl mx-auto px-6 py-8">
        <SearchBox
          locale={locale}
          onSearch={handleSearch}
          isLoading={loading}
          placeholder={isZh ? '搜索企业名称...' : 'Search company name...'}
        />
      </section>

      {/* Companies List */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
            {error}
          </div>
        )}

        {companies.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-slate-500">
              {isZh ? `共 ${total} 家企业` : `${total} companies`}
            </div>
            
            <div className="grid gap-4">
              {companies.map((company) => (
                <Link
                  key={company.id}
                  href={`/${locale}/companies/${company.id}`}
                  className="medical-card p-6 group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#339999]/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-[#339999]" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-[#339999] transition-colors">
                            {company.name}
                          </h3>
                          {company.name_zh && (
                            <p className="text-sm text-slate-500">{company.name_zh}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        {company.country && (
                          <span className="medical-tag">
                            <Globe className="w-3 h-3" />
                            {company.country}
                          </span>
                        )}
                        {company.business_type && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                            {company.business_type}
                          </span>
                        )}
                      </div>
                      
                      {company.description && (
                        <p className="text-slate-600 text-sm mt-3 line-clamp-2">
                          {isZh && company.description_zh ? company.description_zh : company.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4 flex items-center">
                      <span className="text-[#339999] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        {isZh ? '查看详情' : 'View'}
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="medical-btn-secondary"
                >
                  {loading 
                    ? (isZh ? '加载中...' : 'Loading...')
                    : (isZh ? '加载更多' : 'Load More')}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <Building2 className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-slate-500 text-lg font-medium">
              {isZh ? '暂无企业数据' : 'No companies found'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {isZh ? '请尝试搜索其他关键词' : 'Try searching with different keywords'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
