'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '../i18n-config';
import Image from 'next/image';
import { useState } from 'react';

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
      <nav className="bg-white border-b border-[#339999]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Image 
                src="/logo.png" 
                alt="MDLooker" 
                width={40} 
                height={40}
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-[#339999]">MDLooker</span>
            </Link>
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                // Home page should only be active when exactly on home page
                const isHome = item.href === `/${locale}`;
                const isActive = isHome 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#339999] text-white' 
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
            <div className="hidden sm:flex gap-2">
              {locales.map(loc => (
                <Link
                  key={loc}
                  href={`/${loc}`}
                  className={`px-3 py-1 rounded text-sm ${
                    loc === locale ? 'bg-[#339999] text-white' : 'text-slate-600 hover:bg-[#339999]/10'
                  }`}
                >
                  {loc === 'en' ? 'English' : '中文'}
                </Link>
              ))}
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-[#339999]/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                // Home page should only be active when exactly on home page
                const isHome = item.href === `/${locale}`;
                const isActive = isHome 
                  ? pathname === item.href 
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#339999] text-white' 
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
                    className={`px-3 py-1 rounded text-sm flex-1 text-center ${
                      loc === locale ? 'bg-[#339999] text-white' : 'text-slate-600 hover:bg-[#339999]/10'
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
      
      <main>{children}</main>
      
      <footer className="bg-[#2a7a7a] py-8 mt-20">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-white/80">
          <p>© 2026 MDLooker by Nanjing Freeman Health Technology Co., Ltd. All rights reserved.</p>
          <p className="mt-2">All data from public regulatory databases. Disclaimer: All information is for reference only.</p>
        </div>
      </footer>
    </>
  );
}
