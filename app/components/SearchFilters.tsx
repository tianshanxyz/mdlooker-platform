'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, X } from 'lucide-react';

interface SearchFilters {
  country?: string;
  certificateStatus?: string;
  companyType?: string;
}

const COUNTRIES = [
  { value: 'USA', label: '美国', flag: '🇺🇸' },
  { value: 'China', label: '中国', flag: '🇨🇳' },
  { value: 'EU', label: '欧盟', flag: '🇪🇺' },
  { value: 'Japan', label: '日本', flag: '🇯🇵' },
  { value: 'Singapore', label: '新加坡', flag: '🇸🇬' },
  { value: 'Australia', label: '澳大利亚', flag: '🇦🇺' },
  { value: 'Canada', label: '加拿大', flag: '🇨🇦' },
  { value: 'UK', label: '英国', flag: '🇬🇧' },
];

const CERTIFICATE_STATUS = [
  { value: 'active', label: '有效' },
  { value: 'expired', label: '过期' },
  { value: 'suspended', label: '暂停' },
  { value: 'pending', label: '审核中' },
];

const COMPANY_TYPES = [
  { value: 'manufacturer', label: '生产商' },
  { value: 'distributor', label: '经销商' },
  { value: 'importer', label: '进口商' },
  { value: 'agent', label: '代理机构' },
];

export function SearchFiltersComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    country: searchParams.get('country') || undefined,
    certificateStatus: searchParams.get('certificateStatus') || undefined,
    companyType: searchParams.get('companyType') || undefined,
  });

  const updateFilters = useCallback((newFilters: SearchFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // 更新搜索参数
    if (newFilters.country) {
      params.set('country', newFilters.country);
    } else {
      params.delete('country');
    }
    
    if (newFilters.certificateStatus) {
      params.set('certificateStatus', newFilters.certificateStatus);
    } else {
      params.delete('certificateStatus');
    }
    
    if (newFilters.companyType) {
      params.set('companyType', newFilters.companyType);
    } else {
      params.delete('companyType');
    }
    
    // 重置页码
    params.set('page', '1');
    
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  const handleFilterChange = (key: keyof SearchFilters, value: string | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateFilters(newFilters);
  };

  const clearAllFilters = () => {
    const emptyFilters = { country: undefined, certificateStatus: undefined, companyType: undefined };
    setFilters(emptyFilters);
    updateFilters(emptyFilters);
  };

  const hasActiveFilters = filters.country || filters.certificateStatus || filters.companyType;

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.country) count++;
    if (filters.certificateStatus) count++;
    if (filters.companyType) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* 筛选器头部 */}
      <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">筛选条件</span>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 text-xs font-medium text-white bg-[#339999] rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
              清空
            </button>
          )}
          <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* 筛选器内容 */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* 国家筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                国家/地区
              </label>
              <select
                value={filters.country || ''}
                onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#339999] focus:border-[#339999]"
              >
                <option value="">全部国家</option>
                {COUNTRIES.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.flag} {country.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 证书状态筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                证书状态
              </label>
              <select
                value={filters.certificateStatus || ''}
                onChange={(e) => handleFilterChange('certificateStatus', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#339999] focus:border-[#339999]"
              >
                <option value="">全部状态</option>
                {CERTIFICATE_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 公司类型筛选 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公司类型
              </label>
              <select
                value={filters.companyType || ''}
                onChange={(e) => handleFilterChange('companyType', e.target.value || undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#339999] focus:border-[#339999]"
              >
                <option value="">全部类型</option>
                {COMPANY_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 已选筛选条件标签 */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.country && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {COUNTRIES.find(c => c.value === filters.country)?.flag} {filters.country}
                  <button
                    onClick={() => handleFilterChange('country', undefined)}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.certificateStatus && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {CERTIFICATE_STATUS.find(s => s.value === filters.certificateStatus)?.label}
                  <button
                    onClick={() => handleFilterChange('certificateStatus', undefined)}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              
              {filters.companyType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {COMPANY_TYPES.find(t => t.value === filters.companyType)?.label}
                  <button
                    onClick={() => handleFilterChange('companyType', undefined)}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
