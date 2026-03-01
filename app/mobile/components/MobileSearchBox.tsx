'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, X, Mic, ScanLine, Sparkles, Loader2, History, TrendingUp } from 'lucide-react';

interface SearchSuggestion {
  text: string;
  type: string;
  icon?: string;
}

interface MobileSearchBoxProps {
  locale: string;
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export default function MobileSearchBox({
  locale,
  onSearch,
  isLoading = false,
  placeholder,
}: MobileSearchBoxProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [hotTerms, setHotTerms] = useState<SearchSuggestion[]>([]);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isZh = locale === 'zh';

  // 加载搜索历史和热门搜索
  useEffect(() => {
    loadSearchHistory();
    fetchHotTerms();
  }, [locale]);

  // 点击外部关闭建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
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
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const loadSearchHistory = () => {
    try {
      const history = localStorage.getItem(`search_history_${locale}`);
      if (history) {
        setSearchHistory(JSON.parse(history).slice(0, 10));
      }
    } catch (e) {
      console.error('Failed to load search history:', e);
    }
  };

  const saveSearchHistory = (newQuery: string) => {
    try {
      const history = JSON.parse(localStorage.getItem(`search_history_${locale}`) || '[]');
      const newHistory = [newQuery, ...history.filter((h: string) => h !== newQuery)].slice(0, 20);
      localStorage.setItem(`search_history_${locale}`, JSON.stringify(newHistory));
      setSearchHistory(newHistory.slice(0, 10));
    } catch (e) {
      console.error('Failed to save search history:', e);
    }
  };

  const fetchHotTerms = async () => {
    try {
      const response = await fetch('/api/search-suggestions?type=popular&limit=8');
      if (response.ok) {
        const data = await response.json();
        setHotTerms(data.suggestions || []);
      }
    } catch (error) {
      console.error('Failed to fetch hot terms:', error);
    }
  };

  const fetchSuggestions = async (searchQuery: string) => {
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveSearchHistory(query.trim());
      onSearch(query.trim());
      setIsFocused(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    saveSearchHistory(suggestion.text);
    onSearch(suggestion.text);
    setIsFocused(false);
  };

  const handleHistoryClick = (historyItem: string) => {
    setQuery(historyItem);
    saveSearchHistory(historyItem);
    onSearch(historyItem);
    setIsFocused(false);
  };

  const clearHistory = () => {
    localStorage.removeItem(`search_history_${locale}`);
    setSearchHistory([]);
  };

  // 语音搜索
  const startVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsListening(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = isZh ? 'zh-CN' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        saveSearchHistory(transcript);
        onSearch(transcript);
        setIsListening(false);
        setIsFocused(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } else {
      alert(isZh ? '您的设备不支持语音搜索' : 'Voice search not supported');
    }
  };

  // 扫码搜索
  const startScan = async () => {
    try {
      // 检查是否在Capacitor环境中
      if (typeof window !== 'undefined' && (window as any).Capacitor) {
        const { BarcodeScanner } = await import('@capacitor/barcode-scanner');
        const result = await BarcodeScanner.scan({
          hint: 17, // QR_CODE and Barcode
        });
        if (result.content) {
          setQuery(result.content);
          saveSearchHistory(result.content);
          onSearch(result.content);
        }
      } else {
        // Web环境：使用HTML5二维码扫描
        alert(isZh ? '请使用APP扫码功能，或在搜索框中手动输入' : 'Please use APP scan feature or type manually');
      }
    } catch (error) {
      console.error('Scan error:', error);
      alert(isZh ? '扫码功能需要在APP中使用' : 'Scan feature requires APP');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'company': return '🏢';
      case 'product': return '📦';
      case 'udi': return '📱';
      default: return '🔍';
    }
  };

  return (
    <div ref={containerRef} className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        {/* 搜索框容器 */}
        <div
          className={`
            relative flex items-center gap-2
            bg-white rounded-2xl
            border-2 transition-all duration-300
            shadow-lg
            ${isFocused
              ? 'border-[#339999] shadow-[#339999]/20'
              : 'border-slate-200'
            }
          `}
        >
          {/* 搜索图标 */}
          <div className="pl-4">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-[#339999] animate-spin" />
            ) : (
              <Search className={`w-5 h-5 ${isFocused ? 'text-[#339999]' : 'text-slate-400'}`} />
            )}
          </div>

          {/* 输入框 */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder || (isZh ? '搜索公司、产品或 UDI...' : 'Search companies, products...')}
            className="
              flex-1 py-3.5 pr-2
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
              className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}

          {/* 语音搜索按钮 */}
          <button
            type="button"
            onClick={startVoiceSearch}
            className={`
              p-2 rounded-xl transition-all
              ${isListening
                ? 'bg-red-100 text-red-500 animate-pulse'
                : 'hover:bg-slate-100 text-slate-400'
              }
            `}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
          </button>

          {/* 扫码按钮 */}
          <button
            type="button"
            onClick={startScan}
            className="p-2 mr-1 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <ScanLine className="w-5 h-5" />
          </button>
        </div>

        {/* 搜索建议和历史下拉框 */}
        {isFocused && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-[70vh] overflow-y-auto">
            {/* 搜索建议 */}
            {query.length >= 2 && suggestions.length > 0 && (
              <div className="p-3">
                <div className="px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  {isZh ? '搜索建议' : 'Suggestions'}
                </div>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-2 py-3 flex items-center gap-3 hover:bg-slate-50 rounded-lg transition-colors text-left active:bg-slate-100"
                  >
                    <span className="text-lg">{getTypeIcon(suggestion.type)}</span>
                    <span className="flex-1 text-slate-700 text-sm">{suggestion.text}</span>
                    <Sparkles className="w-3 h-3 text-[#339999]" />
                  </button>
                ))}
              </div>
            )}

            {/* 搜索历史 */}
            {!query && searchHistory.length > 0 && (
              <div className="p-3 border-b border-slate-100">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                    <History className="w-3 h-3" />
                    {isZh ? '搜索历史' : 'History'}
                  </div>
                  <button
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {isZh ? '清除' : 'Clear'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {searchHistory.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => handleHistoryClick(item)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm hover:bg-slate-200 transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            {!query && hotTerms.length > 0 && (
              <div className="p-3">
                <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-slate-400 uppercase tracking-wide">
                  <TrendingUp className="w-3 h-3" />
                  {isZh ? '热门搜索' : 'Trending'}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {hotTerms.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(term)}
                      className="px-3 py-2.5 flex items-center gap-2 hover:bg-slate-50 rounded-lg transition-colors text-left active:bg-slate-100"
                    >
                      <span className="text-sm">{getTypeIcon(term.type)}</span>
                      <span className="text-slate-700 text-sm truncate">{term.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </form>

      {/* 快捷操作栏 */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <button
          onClick={startVoiceSearch}
          className={`flex flex-col items-center gap-1 transition-colors ${isListening ? 'text-red-500' : 'text-slate-500'}`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isListening ? 'bg-red-100' : 'bg-slate-100'}`}>
            <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
          </div>
          <span className="text-xs">{isZh ? '语音' : 'Voice'}</span>
        </button>

        <button
          onClick={startScan}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <span className="text-xs">{isZh ? '扫码' : 'Scan'}</span>
        </button>

        <button
          onClick={() => setIsFocused(true)}
          className="flex flex-col items-center gap-1 text-slate-500"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs">{isZh ? '热门' : 'Hot'}</span>
        </button>
      </div>
    </div>
  );
}
