import Link from 'next/link';
import { locales, type Locale } from '../i18n-config';

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>; // 改为string，Turbopack自动推导的类型
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  
  // 运行时验证locale有效性
  if (!(locales as readonly string[]).includes(locale)) {
    return <div>404 - Language Not Supported</div>;
  }

  const typedLocale = locale as Locale; // 类型断言

  return (
    <html lang={typedLocale}>
      <body className="min-h-screen bg-slate-50">
        <nav className="bg-white border-b px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link href={`/${typedLocale}`} className="text-2xl font-bold">MDLooker</Link>
            <div className="flex gap-2">
              {locales.map(loc => (
                <Link
                  key={loc}
                  href={`/${loc}`}
                  className={`px-3 py-1 rounded text-sm ${
                    loc === typedLocale ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {loc === 'en' ? 'English' : '中文'}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
