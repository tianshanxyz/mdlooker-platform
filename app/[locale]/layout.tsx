'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, type Locale } from '../i18n-config';
import Image from 'next/image';

export default function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const pathname = usePathname();
  const locale = params.locale as Locale;
  
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
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
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
          <div className="flex gap-2">
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
        </div>
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
