'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { translations, type Locale } from '../i18n-config';
import MobileSearchBox from './components/MobileSearchBox';
import QuickAccess from './components/QuickAccess';
import DailyTasks from './components/DailyTasks';
import { Building2, Package, Globe, Shield, Sparkles, Bell, User, TrendingUp, Zap } from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  name_zh?: string;
  description?: string;
  country?: string;
  resultType: 'company' | 'product' | 'udi';
}

interface SearchResponse {
  results: SearchResult[];
  total: number;
  detectedType: string;
}

export default function MobileHomePage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('zh');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && ['zh', 'en'].includes(localeParam)) {
      setLocale(localeParam as Locale);
    }
    // 检查登录状态
    checkAuthStatus();
  }, [params]);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          setUser(data.user);
        }
      }
    } catch (e) {
      console.error('Auth check failed:', e);
    }
  };

  const t = translations[locale];
  const isZh = locale === 'zh';

  const searchItems = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setQuery(searchQuery);
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&page=1&pageSize=10&type=auto`
      );
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

  const handleNavigate = (path: string) => {
    router.push(`/${locale}${path}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (isZh) {
      if (hour < 12) return '早上好';
      if (hour < 18) return '下午好';
      return '晚上好';
    } else {
      if (hour < 12) return 'Good morning';
      if (hour < 18) return 'Good afternoon';
      return 'Good evening';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#339999] text-white px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">MDLooker</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2">
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>
            <button
              onClick={() => handleNavigate(user ? '/profile' : '/auth/signin')}
              className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"
            >
              <User className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-4 pb-24">
        {/* Greeting */}
        {!hasSearched && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              {getGreeting()}!
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {isZh ? '今天想查询什么医疗器械信息？' : 'What medical device info do you need today?'}
            </p>
          </div>
        )}

        {/* Search Box */}
        <div className="mb-6">
          <MobileSearchBox
            locale={locale}
            onSearch={searchItems}
            isLoading={loading}
          />
        </div>

        {/* Search Results */}
        {hasSearched && results ? (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {isZh ? `找到 ${results.total} 条结果` : `Found ${results.total} results`}
                </h2>
                {results.detectedType !== 'general' && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {isZh ? '检测到' : 'Detected'}: 
                    <span className="text-[#339999] font-medium ml-1">
                      {results.detectedType === 'company' 
                        ? (isZh ? '企业搜索' : 'Company')
                        : results.detectedType === 'product'
                        ? (isZh ? '产品搜索' : 'Product')
                        : 'UDI'}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Results List */}
            {results.results.length > 0 ? (
              <div className="space-y-3">
                {results.results.map((item) => (
                  <button
                    key={`${item.resultType}-${item.id}`}
                    onClick={() => handleNavigate(`/companies/${item.id}`)}
                    className="w-full bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-left active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                        ${item.resultType === 'company' ? 'bg-blue-100 text-blue-600' :
                          item.resultType === 'product' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'}
                      `}>
                        {item.resultType === 'company' ? <Building2 className="w-5 h-5" /> :
                         item.resultType === 'product' ? <Package className="w-5 h-5" /> :
                         <Zap className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800 truncate">
                            {item.name}
                          </h3>
                          <span className={`
                            px-2 py-0.5 rounded-full text-xs
                            ${item.resultType === 'company' ? 'bg-blue-100 text-blue-700' :
                              item.resultType === 'product' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'}
                          `}>
                            {item.resultType === 'company' ? (isZh ? '企业' : 'Co.') :
                             item.resultType === 'product' ? (isZh ? '产品' : 'Prod.') :
                             'UDI'}
                          </span>
                        </div>
                        {item.name_zh && (
                          <p className="text-sm text-slate-500 truncate">{item.name_zh}</p>
                        )}
                        {item.country && (
                          <div className="flex items-center gap-1 mt-1">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{item.country}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-500 font-medium">
                  {isZh ? '未找到结果' : 'No results found'}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {isZh ? '请尝试其他关键词' : 'Try different keywords'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Daily Tasks */}
            <div className="mb-4">
              <DailyTasks locale={locale} />
            </div>

            {/* Quick Access */}
            <div className="mb-4">
              <QuickAccess locale={locale} onNavigate={handleNavigate} />
            </div>

            {/* Features */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                {isZh ? '功能服务' : 'Services'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleNavigate('/compliance-profile')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 active:bg-blue-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 text-sm">
                      {isZh ? '合规档案' : 'Compliance'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isZh ? '查询企业认证' : 'Check certs'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate('/market-access')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#339999]/10 active:bg-[#339999]/20 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-[#339999]/20 text-[#339999] flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 text-sm">
                      {isZh ? '市场准入' : 'Market Access'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isZh ? '各国注册要求' : 'Global regs'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate('/guides')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 active:bg-purple-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 text-sm">
                      {isZh ? '法规指南' : 'Guides'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isZh ? 'FDA/NMPA/CE' : 'Regulations'}
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => handleNavigate('/companies')}
                  className="flex items-center gap-3 p-3 rounded-xl bg-green-50 active:bg-green-100 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-slate-800 text-sm">
                      {isZh ? '企业库' : 'Companies'}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isZh ? '全球企业数据' : 'Global data'}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* VIP Banner */}
            {!user?.role || user.role === 'guest' ? (
              <div className="mt-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 border border-amber-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-amber-800">
                      {isZh ? '升级 VIP 解锁全部功能' : 'Upgrade to VIP'}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">
                      {isZh ? '无限制搜索 · 下载报告 · API访问' : 'Unlimited search · Reports · API'}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium">
                    {isZh ? '立即升级' : 'Upgrade'}
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40">
        <div className="flex items-center justify-around">
          <button
            onClick={() => {
              setHasSearched(false);
              setResults(null);
            }}
            className={`flex flex-col items-center gap-1 p-2 ${!hasSearched ? 'text-[#339999]' : 'text-slate-400'}`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-xs">{isZh ? '首页' : 'Home'}</span>
          </button>

          <button
            onClick={() => handleNavigate('/companies')}
            className="flex flex-col items-center gap-1 p-2 text-slate-400"
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs">{isZh ? '企业' : 'Companies'}</span>
          </button>

          <button
            onClick={() => handleNavigate('/favorites')}
            className="flex flex-col items-center gap-1 p-2 text-slate-400"
          >
            <div className="w-12 h-12 -mt-6 bg-[#339999] rounded-full flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </button>

          <button
            onClick={() => handleNavigate('/guides')}
            className="flex flex-col items-center gap-1 p-2 text-slate-400"
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">{isZh ? '指南' : 'Guides'}</span>
          </button>

          <button
            onClick={() => handleNavigate(user ? '/profile' : '/auth/signin')}
            className="flex flex-col items-center gap-1 p-2 text-slate-400"
          >
            <User className="w-5 h-5" />
            <span className="text-xs">{isZh ? '我的' : 'Profile'}</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
