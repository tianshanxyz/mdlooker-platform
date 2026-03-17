'use client';

import { useState, useMemo } from 'react';
import { useLocale } from 'next-intl';

// 筛选器配置类型
export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'checkbox' | 'radio' | 'select' | 'range';
  options?: FilterOption[];
  min?: number;
  max?: number;
  unit?: string;
}

// 高级筛选器 Props
interface AdvancedFiltersProps {
  filters: FilterConfig[];
  selectedFilters: Record<string, any>;
  onFilterChange: (filterId: string, value: any) => void;
  onReset?: () => void;
  totalResults?: number;
  compact?: boolean;
}

export default function AdvancedFilters({
  filters,
  selectedFilters,
  onFilterChange,
  onReset,
  totalResults,
  compact = false,
}: AdvancedFiltersProps) {
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(!compact);

  const t = {
    filters: locale === 'zh' ? '筛选条件' : 'Filters',
    reset: locale === 'zh' ? '重置' : 'Reset',
    collapse: locale === 'zh' ? '收起' : 'Collapse',
    expand: locale === 'zh' ? '展开' : 'Expand',
    results: locale === 'zh' ? '条结果' : 'results',
    selected: locale === 'zh' ? '已选择' : 'Selected',
    dateRange: locale === 'zh' ? '日期范围' : 'Date Range',
    from: locale === 'zh' ? '从' : 'From',
    to: locale === 'zh' ? '至' : 'To',
  };

  // 计算已选择的筛选条件数量
  const activeFilterCount = useMemo(() => {
    return Object.values(selectedFilters).filter(v => 
      v !== null && v !== undefined && v !== '' && 
      (!Array.isArray(v) || v.length > 0)
    ).length;
  }, [selectedFilters]);

  const handleFilterChange = (filterId: string, value: any) => {
    onFilterChange(filterId, value);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    }
  };

  if (compact && activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t.filters}
          </h3>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              {t.selected}: {activeFilterCount}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {totalResults !== undefined && (
            <span className="text-sm text-gray-500">
              {totalResults} {t.results}
            </span>
          )}
          
          {activeFilterCount > 0 && onReset && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              {t.reset}
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={isExpanded ? t.collapse : t.expand}
          >
            <svg 
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Filters Content */}
      {isExpanded && (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  {filter.label}
                </label>
                
                {filter.type === 'select' && filter.options && (
                  <select
                    value={selectedFilters[filter.id] || ''}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white text-sm"
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} {option.count !== undefined && `(${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'radio' && filter.options && (
                  <div className="space-y-1.5">
                    {filter.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          name={filter.id}
                          value={option.value}
                          checked={selectedFilters[filter.id] === option.value}
                          onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'checkbox' && filter.options && (
                  <div className="space-y-1.5">
                    {filter.options.map((option) => {
                      const selectedValues = Array.isArray(selectedFilters[filter.id]) 
                        ? selectedFilters[filter.id] 
                        : [];
                      const isChecked = selectedValues.includes(option.value);

                      return (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newValues = e.target.checked
                                ? [...selectedValues, option.value]
                                : selectedValues.filter((v: string) => v !== option.value);
                              handleFilterChange(filter.id, newValues);
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 group-hover:text-blue-600 transition-colors">
                            {option.label}
                            {option.count !== undefined && (
                              <span className="text-xs text-gray-400 ml-1">({option.count})</span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}

                {filter.type === 'range' && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={selectedFilters[`${filter.id}_min`] || filter.min || 0}
                        onChange={(e) => handleFilterChange(`${filter.id}_min`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                        placeholder={String(filter.min || 0)}
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        value={selectedFilters[`${filter.id}_max`] || filter.max || 999999}
                        onChange={(e) => handleFilterChange(`${filter.id}_max`, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                        placeholder={String(filter.max || 999999)}
                      />
                    </div>
                    {filter.unit && (
                      <p className="text-xs text-gray-500">{filter.unit}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
