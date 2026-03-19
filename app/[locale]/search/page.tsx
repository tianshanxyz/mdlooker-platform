'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AdvancedFilters, { type FilterConfig } from '../../components/AdvancedFilters';
import ExportButton from '../../components/ExportButton';

// 搜索结果类型
interface SearchResult {
  id: string;
  type: 'company' | 'product' | 'regulator';
  name: string;
  name_zh?: string;
  description?: string;
  country?: string;
  logo_url?: string;
  match_score: number;
}

export default function SearchPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as string) || 'zh';
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [resultType, setResultType] = useState<'all' | 'company' | 'product' | 'regulator'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 筛选器状态
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({
    country: '',
    registration_status: '',
    device_class: '',
  });

  const t = {
    title: locale === 'zh' ? '搜索' : 'Search',
    placeholder: locale === 'zh' ? '搜索企业、产品、监管机构...' : 'Search companies, products, regulators...',
    searchButton: locale === 'zh' ? '搜索' : 'Search',
    allResults: locale === 'zh' ? '全部' : 'All',
    companies: locale === 'zh' ? '企业' : 'Companies',
    products: locale === 'zh' ? '产品' : 'Products',
    regulators: locale === 'zh' ? '监管机构' : 'Regulators',
    filters: locale === 'zh' ? '筛选条件' : 'Filters',
    country: locale === 'zh' ? '国家' : 'Country',
    registrationStatus: locale === 'zh' ? '注册状态' : 'Registration Status',
    deviceClass: locale === 'zh' ? '设备分类' : 'Device Class',
    noResults: locale === 'zh' ? '未找到相关结果' : 'No results found',
    foundResults: locale === 'zh' ? '找到' : 'Found',
    resultsFor: locale === 'zh' ? '条结果' : 'results for',
    searching: locale === 'zh' ? '搜索中...' : 'Searching...',
    searchHint: locale === 'zh' ? '请输入搜索关键词' : 'Please enter a search term',
    viewDetail: locale === 'zh' ? '查看详情' : 'View Detail',
  };

  // 筛选器配置
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      id: 'country',
      label: t.country,
      type: 'select',
      options: [
        { value: '', label: locale === 'zh' ? '所有国家' : 'All Countries' },
        { value: 'US', label: locale === 'zh' ? '美国' : 'United States' },
        { value: 'CN', label: locale === 'zh' ? '中国' : 'China' },
        { value: 'EU', label: locale === 'zh' ? '欧盟' : 'European Union' },
        { value: 'JP', label: locale === 'zh' ? '日本' : 'Japan' },
        { value: 'CA', label: locale === 'zh' ? '加拿大' : 'Canada' },
        { value: 'AU', label: locale === 'zh' ? '澳大利亚' : 'Australia' },
      ],
    },
    {
      id: 'registration_status',
      label: t.registrationStatus,
      type: 'select',
      options: [
        { value: '', label: locale === 'zh' ? '所有状态' : 'All Statuses' },
        { value: 'approved', label: locale === 'zh' ? '已批准' : 'Approved' },
        { value: 'pending', label: locale === 'zh' ? '审核中' : 'Pending' },
        { value: 'expired', label: locale === 'zh' ? '已过期' : 'Expired' },
      ],
    },
    {
      id: 'device_class',
      label: t.deviceClass,
      type: 'select',
      options: [
        { value: '', label: locale === 'zh' ? '所有分类' : 'All Classes' },
        { value: 'I', label: 'Class I' },
        { value: 'II', label: 'Class II' },
        { value: 'III', label: 'Class III' },
      ],
    },
  ], [locale, t]);

  // 真实的搜索结果
  const [realResults, setRealResults] = useState<SearchResult[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    
    try {
      // 调用真实 API
      const params = new URLSearchParams({
        q: searchQuery,
        page: '1',
        pageSize: '20',
        type: resultType !== 'all' ? resultType : 'auto',
      });
      
      const response = await fetch(`/api/search?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRealResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 过滤结果
  const filteredResults = useMemo(() => {
    let results = realResults;

    // 按类型过滤
    if (resultType !== 'all') {
      results = results.filter(r => r.type === resultType);
    }

    // 按筛选条件过滤
    if (selectedFilters.country) {
      results = results.filter(r => r.country?.includes(selectedFilters.country));
    }

    return results;
  }, [realResults, resultType, selectedFilters]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (filterId: string, value: any) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleResetFilters = () => {
    setSelectedFilters({
      country: '',
      registration_status: '',
      device_class: '',
    });
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return t.companies;
      case 'product': return t.products;
      case 'regulator': return t.regulators;
      default: return t.allResults;
    }
  };

  const getResultLink = (result: SearchResult) => {
    const locale = params.locale;
    switch (result.type) {
      case 'company': return `/${locale}/companies/${result.id}`;
      case 'product': return `/${locale}/products/${result.id}`;
      case 'regulator': return `/${locale}/regulators/${result.id}`;
      default: return '#';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-slate-100">
      {/* Header - 使用网站主色调 #339999 */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-12">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-6">{t.title}</h1>
          
          {/* Search Box */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.placeholder}
                className="w-full px-6 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-white/30 shadow-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={isLoading || !searchQuery.trim()}
              className="px-8 py-4 bg-white text-[#339999] rounded-2xl font-semibold hover:bg-teal-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
            >
              {isLoading ? t.searching : t.searchButton}
            </button>
          </div>

          {/* Result Type Tabs */}
          <div className="flex gap-2 mt-6">
            {[
              { value: 'all', label: t.allResults },
              { value: 'company', label: t.companies },
              { value: 'product', label: t.products },
              { value: 'regulator', label: t.regulators },
            ].map((type) => (
              <button
                key={type.value}
                onClick={() => setResultType(type.value as any)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  resultType === type.value
                    ? 'bg-white text-[#339999] shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {!hasSearched ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-xl text-gray-500">{t.searchHint}</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-[#339999] border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-lg text-gray-500">{t.searching}</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="text-center py-20">
            <svg className="w-24 h-24 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-500">{t.noResults}</p>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                <span className="font-bold text-gray-900">{filteredResults.length}</span>
                {' '}{t.foundResults}
                {resultType !== 'all' && `${getResultTypeLabel(resultType)} - `}
                "<span className="font-semibold">{searchQuery}</span>"
              </p>
              <ExportButton
                type="search-results"
                data={filteredResults}
                filename={`search-${searchQuery.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}`}
                format="csv"
              />
            </div>

            {/* Advanced Filters */}
            <div className="mb-6">
              <AdvancedFilters
                filters={filterConfigs}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
                totalResults={filteredResults.length}
              />
            </div>

            {/* Results List */}
            <div className="space-y-4 mt-6">
              {filteredResults.map((result) => (
                <Link
                  key={result.id}
                  href={getResultLink(result)}
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100 group"
                >
                  <div className="flex items-start gap-4">
                    {result.type === 'company' && result.logo_url && (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={result.logo_url} 
                          alt={result.name}
                          className="w-12 h-12 object-contain"
                        />
                      </div>
                    )}
                    
                    {result.type === 'product' && (
                      <div className="w-16 h-16 bg-[#339999]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                    
                    {result.type === 'regulator' && (
                      <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                          result.type === 'company' ? 'bg-purple-100 text-purple-700' :
                          result.type === 'product' ? 'bg-[#339999]/10 text-[#339999]' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getResultTypeLabel(result.type)}
                        </span>
                        {result.country && (
                          <span className="text-xs text-gray-500">{result.country}</span>
                        )}
                        <span className="text-xs text-green-600 font-medium">
                          Match: {result.match_score}%
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#339999] transition-colors mb-1">
                        {locale === 'zh' && result.name_zh ? result.name_zh : result.name}
                      </h3>
                      
                      {result.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center text-[#339999] group-hover:translate-x-2 transition-transform">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
