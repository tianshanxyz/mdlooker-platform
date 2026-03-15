'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { translations, locales, type Locale } from '../../i18n-config';
import { SearchFiltersComponent } from '../components/SearchFilters';
import { Pagination } from '../components/Pagination';
import { Building2, Package, ScanBarcode, AlertCircle, ChevronRight } from 'lucide-react';

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
  registration_count?: number;
  compliance_score?: number;
  markets?: string[];
  matchScore?: number;
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

export default function SearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [locale, setLocale] = useState<Locale>('en');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const t = translations[locale];
  const isZh = locale === 'zh';

  const performSearch = useCallback(async () => {
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const pageSize = searchParams.get('pageSize') || '10';
    const country = searchParams.get('country') || '';
    const certificateStatus = searchParams.get('certificateStatus') || '';
    const companyType = searchParams.get('companyType') || '';
    
    if (!query?.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      // 构建查询参数
      const queryParams = new URLSearchParams({
        q: query,
        page,
        pageSize,
      });
      
      if (country) queryParams.set('country', country);
      if (certificateStatus) queryParams.set('certificateStatus', certificateStatus);
      if (companyType) queryParams.set('companyType', companyType);
      
      const response = await fetch(`/api/search?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    performSearch();
  }, [performSearch]);

  const getResultTitle = (result: SearchResult) => {
    if (result.resultType === 'company') {
      return isZh ? (result.name_zh || result.name) : (result.name || result.name_zh);
    } else {
      return isZh ? (result.name_zh || result.name) : (result.name || result.name_zh);
    }
  };

  const getResultDescription = (result: SearchResult) => {
    if (result.resultType === 'company') {
      return isZh ? (result.description_zh || result.description) : (result.description || result.description_zh);
    } else {
      return isZh ? (result.description_zh || result.description) : (result.description || result.description_zh);
    }
  };

  const getResultLink = (result: SearchResult) => {
    if (result.resultType === 'company') {
      return `/${locale}/companies/${result.id}`;
    } else if (result.resultType === 'product') {
      return `/${locale}/companies/${result.id}`;
    } else {
      return `/${locale}/companies/${result.id}`;
    }
  };

  const getResultIcon = (result: SearchResult) => {
    if (result.resultType === 'company') {
      return Building2;
    } else if (result.resultType === 'product') {
      return Package;
    } else {
      return ScanBarcode;
    }
  };

  const getCountryName = (countryCode?: string) => {
    const countries: Record<string, string> = {
      'USA': isZh ? '美国' : 'United States',
      'China': isZh ? '中国' : 'China',
      'EU': isZh ? '欧盟' : 'European Union',
      'Japan': isZh ? '日本' : 'Japan',
      'Singapore': isZh ? '新加坡' : 'Singapore',
      'Australia': isZh ? '澳大利亚' : 'Australia',
      'Canada': isZh ? '加拿大' : 'Canada',
      'UK': isZh ? '英国' : 'United Kingdom',
    };
    return countries[countryCode || ''] || countryCode;
  };

  if (!results && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isZh ? '请输入搜索关键词' : 'Please enter a search term'}
            </h1>
            <p className="text-gray-600">
              {isZh ? '尝试搜索公司名称、产品名称或注册证号' : 'Try searching for company names, product names, or registration numbers'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isZh ? '搜索结果' : 'Search Results'}
          </h1>
          {results && (
            <p className="text-gray-600">
              {isZh ? `找到 ${results.total} 条与 "${results.query}" 相关的结果` : `Found ${results.total} results for "${results.query}"`}
            </p>
          )}
        </div>

        {/* 筛选器 */}
        <div className="mb-6">
          <SearchFiltersComponent />
        </div>

        {/* 加载状态 */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999] mx-auto"></div>
            <p className="mt-4 text-gray-600">{isZh ? '搜索中...' : 'Searching...'}</p>
          </div>
        )}

        {/* 搜索结果 */}
        {!loading && results && results.results.length > 0 && (
          <>
            <div className="space-y-4">
              {results.results.map((result) => {
                const Icon = getResultIcon(result);
                return (
                  <a
                    key={result.id}
                    href={getResultLink(result)}
                    className="block bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-[#339999]/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#339999]" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {getResultTitle(result)}
                              </h3>
                              
                              {getResultDescription(result) && (
                                <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                  {getResultDescription(result)}
                                </p>
                              )}
                              
                              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  {result.resultType === 'company' 
                                    ? (isZh ? '公司' : 'Company')
                                    : result.resultType === 'product'
                                    ? (isZh ? '产品' : 'Product')
                                    : (isZh ? 'UDI' : 'UDI')
                                  }
                                </span>
                                
                                {result.company_country && (
                                  <span>• {getCountryName(result.company_country)}</span>
                                )}
                                
                                {result.registration_count !== undefined && (
                                  <span>• {isZh ? '注册证数量' : 'Registrations'}: {result.registration_count}</span>
                                )}
                                
                                {result.compliance_score !== undefined && (
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    result.compliance_score >= 70
                                      ? 'bg-green-100 text-green-800'
                                      : result.compliance_score >= 50
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {isZh ? '合规评分' : 'Compliance Score'}: {result.compliance_score}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* 分页 */}
            <Pagination
              currentPage={results.page}
              totalPages={Math.ceil(results.total / results.pageSize)}
              totalResults={results.total}
              pageSize={results.pageSize}
            />
          </>
        )}

        {/* 无结果 */}
        {!loading && results && results.results.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isZh ? '未找到相关结果' : 'No results found'}
            </h2>
            <p className="text-gray-600 mb-4">
              {isZh ? '尝试以下建议：' : 'Try these suggestions:'}
            </p>
            <ul className="text-left text-gray-600 space-y-2 max-w-md mx-auto">
              {isZh ? (
                <>
                  <li>• 检查拼写是否正确</li>
                  <li>• 尝试使用英文关键词搜索</li>
                  <li>• 减少筛选条件</li>
                  <li>• 使用更通用的关键词</li>
                </>
              ) : (
                <>
                  <li>• Check your spelling</li>
                  <li>• Try searching in English</li>
                  <li>• Remove some filters</li>
                  <li>• Use more general keywords</li>
                </>
              )}
            </ul>
            
            {results.suggestions && results.suggestions.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">
                  {isZh ? '热门搜索：' : 'Popular searches:'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {results.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('q', suggestion);
                        router.push(`/search?${params.toString()}`);
                      }}
                      className="px-3 py-1 bg-[#339999]/10 text-[#339999] rounded-full text-sm hover:bg-[#339999]/20 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
