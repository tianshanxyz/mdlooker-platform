'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '../i18n-config';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import PageLoader from '../components/PageLoader';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import AIAssistant from '../components/AIAssistant';

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname();
  const locale = params.locale as Locale;
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!(locales as readonly string[]).includes(locale)) {
    return <div className="p-20 text-center">404 - Language Not Found</div>;
  }

  const navItems = [
    { href: `/${locale}`, labelEn: 'Home', labelZh: '首页' },
    { href: `/${locale}/compliance-profile`, labelEn: 'Compliance Profile', labelZh: '合规档案' },
    { href: `/${locale}/product-tracker`, labelEn: 'Product Tracker', labelZh: '产品追踪' },
    { href: `/${locale}/market-access`, labelEn: 'Market Access', labelZh: '准入导航' },
    { href: `/${locale}/regulations`, labelEn: 'Regulations', labelZh: '法规动态' },
    { href: `/${locale}/regulators`, labelEn: 'Regulators', labelZh: '监管数据库' },
    { href: `/${locale}/help`, labelEn: 'Help Center', labelZh: '帮助中心' },
    { href: `/${locale}/guides`, labelEn: 'Guides', labelZh: '指南' },
  ];

  const toolkitItems = [
    { href: `/${locale}/market-access-wizard`, labelEn: 'Market Access Wizard', labelZh: '市场准入向导', icon: '🌍' },
    { href: `/${locale}/templates`, labelEn: 'Document Templates', labelZh: '资料模板库', icon: '📄' },
    { href: `/${locale}/compare-markets`, labelEn: 'Compare Markets', labelZh: '市场对比', icon: '📊' },
    { href: `/${locale}/monitoring`, labelEn: 'Competitor Monitoring', labelZh: '竞争对手监控', icon: '👁️' },
    { href: `/${locale}/stats`, labelEn: 'Statistics', labelZh: '数据统计', icon: '📈' },
  ];

  return (
    <>
      {/* 页面加载动画 */}
      <PageLoader />
      
      {/* 导航栏 - 医疗科技风格 */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-[#339999]/20 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="flex items-center gap-3 group">
              <div className="relative w-11 h-11">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/logo.png" 
                  alt="MDLooker" 
                  className="w-full h-full rounded-xl transition-transform group-hover:scale-105 object-contain"
                />
                {/* 发光效果 */}
                <div className="absolute inset-0 rounded-xl bg-[#339999]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#339999] to-[#2a7a7a] bg-clip-text text-transparent">
                MDLooker
              </span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isHome = item.href === `/${locale}`;
                const isActive = isHome 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white shadow-lg shadow-[#339999]/30' 
                        : 'text-slate-600 hover:bg-[#339999]/10 hover:text-[#339999]'
                    }`}
                  >
                    {locale === 'zh' ? item.labelZh : item.labelEn}
                  </Link>
                );
              })}
              
              {/* Toolkit Dropdown */}
              <div className="relative group">
                <button className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-[#339999]/10 hover:text-[#339999] transition-all duration-200 flex items-center gap-1">
                  <span>{locale === 'zh' ? '工具箱' : 'Toolkit'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-left z-50">
                  <div className="py-2">
                    {toolkitItems.map((tool) => (
                      <Link
                        key={tool.href}
                        href={tool.href}
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-[#339999]/10 hover:text-[#339999] flex items-center gap-3 transition-colors"
                      >
                        <span className="text-xl">{tool.icon}</span>
                        <div>
                          <div className="font-medium">{locale === 'zh' ? tool.labelZh : tool.labelEn}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Right side: Language switcher + User menu + Mobile menu button */}
          <div className="flex items-center gap-2">
            {/* Language switcher - always visible */}
            <div className="hidden sm:flex gap-1 p-1 bg-slate-100 rounded-xl">
              {locales.map(loc => (
                <Link
                  key={loc}
                  href={`/${loc}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    loc === locale 
                      ? 'bg-white text-[#339999] shadow-sm' 
                      : 'text-slate-500 hover:text-[#339999]'
                  }`}
                >
                  {loc === 'en' ? 'English' : '中文'}
                </Link>
              ))}
            </div>
            
            {/* User menu - show when logged in */}
            {session && (
              <div className="relative group hidden sm:block">
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-[#339999]/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#339999] to-[#2a7a7a] flex items-center justify-center text-white text-sm font-bold">
                    {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                  </div>
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right z-50">
                  <div className="py-2">
                    <Link
                      href={`/${locale}/profile/dashboard`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-[#339999]/10 hover:text-[#339999] flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{locale === 'zh' ? '个人中心' : 'Dashboard'}</span>
                    </Link>
                    <Link
                      href={`/${locale}/profile`}
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-[#339999]/10 hover:text-[#339999] flex items-center gap-2 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{locale === 'zh' ? '个人设置' : 'Settings'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2.5 rounded-xl text-slate-600 hover:bg-[#339999]/10 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-[#339999]/10 pt-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isHome = item.href === `/${locale}`;
                const isActive = isHome 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white' 
                        : 'text-slate-600 hover:bg-[#339999]/10 hover:text-[#339999]'
                    }`}
                  >
                    {locale === 'zh' ? item.labelZh : item.labelEn}
                  </Link>
                );
              })}
              
              {/* Mobile Toolkit */}
              <div className="mt-2 pt-2 border-t border-slate-200">
                <div className="px-4 py-2 text-xs font-medium text-slate-500 uppercase">
                  {locale === 'zh' ? '工具箱' : 'Toolkit'}
                </div>
                {toolkitItems.map((tool) => (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm text-slate-600 hover:bg-[#339999]/10 hover:text-[#339999] flex items-center gap-3 transition-colors"
                  >
                    <span className="text-xl">{tool.icon}</span>
                    <span>{locale === 'zh' ? tool.labelZh : tool.labelEn}</span>
                  </Link>
                ))}
              </div>
              
              {/* Mobile language switcher */}
              <div className="flex gap-2 mt-2 pt-2 border-t border-slate-200 sm:hidden">
                {locales.map(loc => (
                  <Link
                    key={loc}
                    href={`/${loc}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2 rounded-lg text-sm flex-1 text-center transition-all ${
                      loc === locale 
                        ? 'bg-[#339999] text-white' 
                        : 'text-slate-600 hover:bg-[#339999]/10'
                    }`}
                  >
                    {loc === 'en' ? 'English' : '中文'}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>
      
      {/* 面包屑导航 */}
      <Breadcrumb locale={locale} />
      
      {/* 主内容 */}
      <main className="min-h-screen">{children}</main>
      
      {/* 新页脚 */}
      <Footer locale={locale} />
      
      {/* AI助手 */}
      <AIAssistant />
    </>
  );
}
