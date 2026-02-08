'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Building2, Package, ScanBarcode, Loader2, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  text: string;
  type: string;
  icon?: string;
  id?: string;
}

interface SearchBoxProps {
  locale: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
  showPopular?: boolean;
}

export default function SearchBox({ 
  locale, 
  onSearch, 
  isLoading = false,
  placeholder,
  className = '',
  showPopular = true
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [popularTerms, setPopularTerms] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isZh = locale === 'zh';

  // 加载热门搜索词
  useEffect(() => {
    if (showPopular) {
      fetchPopularTerms();
    }
  }, [locale, showPopular]);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 搜索建议防抖
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const fetchPopularTerms = async () => {
    try {
      const response = await fetch('/api/search-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, type: 'all' }),
      });
      if (response.ok) {
        const data = await response.json();
        setPopularTerms(data.popular || []);
      }
    } catch (error) {
      console.error('Failed to fetch popular terms:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `/api/search-suggestions?q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSearch(suggestion.text);
    setShowSuggestions(false);
  };

  // 检测搜索类型
  const detectSearchType = (value: string) => {
    if (!value) return null;
    // UDI 检测
    if (/^[0-9]{14}$/.test(value) || value.includes('(01)') || value.includes('(21)')) {
      return { type: 'udi', icon: ScanBarcode, label: isZh ? 'UDI 搜索' : 'UDI Search' };
    }
    // 产品搜索
    if (/\d/.test(value) || value.length > 3) {
      return { type: 'product', icon: Package, label: isZh ? '产品搜索' : 'Product Search' };
    }
    // 默认公司搜索
    return { type: 'company', icon: Building2, label: isZh ? '公司搜索' : 'Company Search' };
  };

  const searchType = detectSearchType(query);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'product': return '📦';
      case 'category': return '📂';
      default: return '🔍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'company': return isZh ? '公司' : 'Company';
      case 'product': return isZh ? '产品' : 'Product';
      case 'category': return isZh ? '分类' : 'Category';
      default: return type;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索框容器 */}
        <div 
          className={`
            relative flex items-center gap-3 
            bg-white rounded-2xl 
            border-2 transition-all duration-300
            shadow-lg
            ${isFocused 
              ? 'border-[#339999] shadow-[#339999]/20 ring-4 ring-[#339999]/10' 
              : 'border-slate-200 hover:border-[#339999]/50 hover:shadow-xl'
            }
          `}
        >
          {/* 搜索图标 */}
          <div className="pl-5">
            {isLoading ? (
              <Loader2 className="w-6 h-6 text-[#339999] animate-spin" />
            ) : (
              <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-[#339999]' : 'text-slate-400'}`} />
            )}
          </div>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(true);
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder || (isZh ? '搜索公司、产品或 UDI...' : 'Search companies, products or UDI...')}
            className="
              flex-1 py-4 pr-4
              bg-transparent border-none outline-none
              text-slate-700 placeholder:text-slate-400
              text-base
            "
          />

          {/* 清除按钮 */}
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 mr-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          )}

          {/* 搜索按钮 */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="
              m-2 px-6 py-2.5
              bg-gradient-to-r from-[#339999] to-[#2a7a7a]
              text-white font-medium
              rounded-xl
              transition-all duration-200
              hover:shadow-lg hover:shadow-[#339999]/30
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center gap-2
            "
          >
            <Sparkles className="w-4 h-4" />
            {isZh ? '搜索' : 'Search'}
          </button>
        </div>

        {/* 智能检测提示 */}
        {query && searchType && (
          <div className="absolute -bottom-8 left-0 flex items-center gap-2 text-sm">
            <searchType.icon className="w-4 h-4 text-[#339999]" />
            <span className="text-slate-500">
              {isZh ? '检测到' : 'Detected'}: 
              <span className="text-[#339999] font-medium ml-1">{searchType.label}</span>
            </span>
          </div>
        )}
      </form>

      {/* 搜索建议和热门关键词下拉框 */}
      {showSuggestions && (query.length >= 2 || (!query && showPopular)) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50">
          {/* 搜索建议 */}
          {query.length >= 2 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                {isZh ? '搜索建议' : 'Suggestions'}
              </div>
              {isLoadingSuggestions ? (
                <div className="px-3 py-4 text-center text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <span className="flex-1 text-slate-700">{suggestion.text}</span>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      {getTypeLabel(suggestion.type)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-slate-400 text-sm">
                  {isZh ? '无匹配结果' : 'No matches found'}
                </div>
              )}
            </div>
          )}

          {/* 热门搜索词 */}
          {!query && showPopular && popularTerms.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {isZh ? '热门搜索' : 'Popular Searches'}
              </div>
              <div className="grid grid-cols-2 gap-1">
                {popularTerms.slice(0, 8).map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(term)}
                    className="px-3 py-2.5 flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors text-left"
                  >
                    <span className="text-lg">{term.icon}</span>
                    <span className="text-slate-700 text-sm truncate">{term.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
