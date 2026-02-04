import Link from 'next/link';
import { locales, type Locale } from '../i18n-config';

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  if (!(locales as readonly string[]).includes(locale)) {
    return <div className="p-20 text-center">404 - Language Not Found</div>;
  }

  const validLocale = locale as Locale;

  const navItems = [
    { href: `/${validLocale}/compliance-profile`, labelEn: 'Compliance Profile', labelZh: '合规档案' },
    { href: `/${validLocale}/market-access`, labelEn: 'Market Access', labelZh: '准入导航' },
    { href: `/${validLocale}/guides`, labelEn: 'Guides', labelZh: '指南' },
  ];

  return (
    <>
      <nav className="bg-white border-b border-[#339999]/20 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href={`/${validLocale}`} className="text-2xl font-bold text-[#339999]">
              MDLooker
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-slate-600 hover:text-[#339999] transition-colors"
                >
                  {validLocale === 'zh' ? item.labelZh : item.labelEn}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {locales.map(loc => (
              <Link
                key={loc}
                href={`/${loc}`}
                className={`px-3 py-1 rounded text-sm ${
                  loc === validLocale ? 'bg-[#339999] text-white' : 'text-slate-600 hover:bg-[#339999]/10'
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
