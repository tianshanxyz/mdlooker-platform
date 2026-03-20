'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { translations, locales, type Locale } from '../i18n-config';
import SEO from '../components/SEO';
import { StructuredData } from '../components/StructuredData';
import { combinedHomeSchema } from '../lib/schema-config';
import { Building2, Package, ScanBarcode, Globe, Shield, Sparkles, Users, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export default function HomePage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const t = translations[locale];
  const isZh = locale === 'zh';

  const [stats, setStats] = useState<any[]>([])

  useEffect(() => {
    fetchStats()
  }, [locale])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats')
      const result = await response.json()
      if (result.success) {
        setStats(result.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  };

  // 功能特性数据
  const features = [
    {
      icon: Building2,
      title: isZh ? '企业合规档案' : 'Company Compliance',
      description: isZh ? '查询全球医疗器械企业注册信息、认证状态和历史记录' : 'Query global medical device company registrations, certifications, and history',
      href: `/${locale}/compliance-profile`,
      color: 'blue'
    },
    {
      icon: Globe,
      title: isZh ? '市场准入导航' : 'Market Access',
      description: isZh ? '了解各国医疗器械注册要求和准入路径' : 'Understand medical device registration requirements and access pathways',
      href: `/${locale}/market-access`,
      color: 'teal'
    },
    {
      icon: Shield,
      title: isZh ? '法规指南' : 'Regulatory Guides',
      description: isZh ? '详细的FDA、NMPA、EU MDR等注册指南' : 'Detailed FDA, NMPA, EU MDR registration guides',
      href: `/${locale}/guides`,
      color: 'purple'
    }
  ];

  return (
    <>
      <SEO 
        page="home" 
        locale={locale}
      />
      {/* 完整的结构化数据（组合 Schema） */}
      <StructuredData 
        type="Organization" 
        data={combinedHomeSchema}
      />
      <div className="min-h-screen">
        {/* Hero Section */}
        <main>
        {/* 背景装饰 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#339999]/5 via-transparent to-[#2a7a7a]/5"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#339999]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2a7a7a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20 lg:py-28">
          {/* 标题区域 */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999]/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#339999]" />
              <span className="text-sm font-medium text-[#339999]">
                {isZh ? 'AI驱动的合规数据平台' : 'AI-Powered Compliance Intelligence'}
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
              {t.hero.title}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {t.hero.subtitle}
            </p>
          </div>

          {/* 搜索框 */}
          <div className="max-w-2xl mx-auto mb-16">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const searchQuery = formData.get('q') as string;
                handleSearch(searchQuery);
              }}
              className="relative"
            >
              <div className="relative flex items-center gap-3 bg-white rounded-2xl border-2 border-slate-200 shadow-lg hover:border-[#339999]/50 hover:shadow-xl transition-all">
                <div className="pl-5">
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  name="q"
                  type="text"
                  placeholder={isZh ? '搜索公司、产品或 UDI...' : 'Search companies, products or UDI...'}
                  className="flex-1 py-4 pr-4 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-base"
                />
                <button
                  type="submit"
                  className="m-2 px-6 py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-[#339999]/30 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  {isZh ? '搜索' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          {/* 功能特性卡片 */}
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="medical-card p-6 group hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    feature.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    feature.color === 'teal' ? 'bg-[#339999]/10 text-[#339999]' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-[#339999] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* 数据统计展示 */}
            {stats.length > 0 && (
              <div className="mt-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                  {stats.slice(0, 8).map((stat, index) => (
                    <div key={index} className="text-center">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#339999]/10 to-[#2a7a7a]/10 mb-3">
                        {stat.stat_type === 'counter' && <Building2 className="w-7 h-7 text-[#339999]" />}
                        {stat.stat_type === 'percentage' && <TrendingUp className="w-7 h-7 text-[#339999]" />}
                        {stat.stat_type === 'days' && <Clock className="w-7 h-7 text-[#339999]" />}
                      </div>
                      <div className="text-2xl font-bold text-slate-900 mb-1">
                        {stat.stat_type === 'percentage' ? `${stat.stat_value}%` : 
                         stat.stat_type === 'days' ? `${stat.stat_value}d` :
                         stat.stat_value >= 1000 ? `${(stat.stat_value / 1000).toFixed(1)}k+` : 
                         stat.stat_value}
                      </div>
                      <div className="text-sm text-slate-500">
                        {isZh ? stat.stat_label_zh : stat.stat_label_en}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </main>
      </div>
    </>
  );
}
