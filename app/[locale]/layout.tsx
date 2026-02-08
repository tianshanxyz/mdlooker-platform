'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '../i18n-config';
import Image from 'next/image';
import { useState } from 'react';
import PageLoader from '../components/PageLoader';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname();
  const locale = params.locale as Locale;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  if (!(locales as readonly string[]).includes(locale)) {
    return <div className="p-20 text-center">404 - Language Not Found</div>;
  }

  const navItems = [
    { href: `/${locale}`, labelEn: 'Home', labelZh: '首页' },
    { href: `/${locale}/compliance-profile`, labelEn: 'Compliance Profile', labelZh: '合规档案' },
    { href: `/${locale}/market-access`, labelEn: 'Market Access', labelZh: '准入导航' },
    { href: `/${locale}/guides`, labelEn: 'Guides', labelZh: '指南' },
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
              <div className="relative">
                <Image 
                  src="/logo.png" 
                  alt="MDLooker" 
                  width={44} 
                  height={44}
                  className="rounded-xl transition-transform group-hover:scale-105"
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
            </div>
          </div>
          
          {/* Right side: Language switcher + Mobile menu button */}
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
    </>
  );
}
