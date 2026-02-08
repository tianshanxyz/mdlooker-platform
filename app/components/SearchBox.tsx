'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles, Building2, Package, ScanBarcode, Loader2 } from 'lucide-react';

interface SearchBoxProps {
  locale: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export default function SearchBox({ 
  locale, 
  onSearch, 
  isLoading = false,
  placeholder,
  className = '' 
}: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isZh = locale === 'zh';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  // 检测搜索类型
  const detectSearchType = (value: string) => {
    if (!value) return null;
    // UDI 检测 (通常包含特定字符或长度)
    if (/^[0-9]{14}$/.test(value) || value.includes('(01)') || value.includes('(21)')) {
      return { type: 'udi', icon: ScanBarcode, label: isZh ? 'UDI 搜索' : 'UDI Search' };
    }
    // 产品搜索 (包含数字或特定关键词)
    if (/\d/.test(value) || value.length > 3) {
      return { type: 'product', icon: Package, label: isZh ? '产品搜索' : 'Product Search' };
    }
    // 默认公司搜索
    return { type: 'company', icon: Building2, label: isZh ? '公司搜索' : 'Company Search' };
  };

  const searchType = detectSearchType(query);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索框容器 - 医疗科技风格 */}
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
            onFocus={() => setIsFocused(true)}
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
    </div>
  );
}
