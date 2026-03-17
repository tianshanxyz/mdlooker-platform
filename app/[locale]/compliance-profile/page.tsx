'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { locales, type Locale } from '../../i18n-config';
import { Building2, Package, ScanBarcode, Shield } from 'lucide-react';

export default function ComplianceProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('en');

  useState(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  });

  const isZh = locale === 'zh';

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`);
    }
  };

  const features = [
    {
      icon: Building2,
      title: isZh ? '企业合规查询' : 'Company Compliance',
      description: isZh ? '查询企业在全球各市场的注册和认证状态' : 'Query company registration status across global markets',
    },
    {
      icon: Package,
      title: isZh ? '产品注册追踪' : 'Product Registration',
      description: isZh ? '追踪产品在不同国家的注册历史和现状' : 'Track product registration history and status',
    },
    {
      icon: ScanBarcode,
      title: isZh ? 'UDI 信息查询' : 'UDI Lookup',
      description: isZh ? '通过 UDI 码查询设备详细信息和合规状态' : 'Query device details via UDI code',
    },
  ];

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#339999]/5 via-transparent to-[#2a7a7a]/5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#339999]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#2a7a7a]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999]/10 rounded-full mb-6">
              <Shield className="w-4 h-4 text-[#339999]" />
              <span className="text-sm font-medium text-[#339999]">
                {isZh ? '高级合规查询工具' : 'Advanced Compliance Lookup'}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 leading-tight">
              {isZh ? '全球合规档案查询' : 'Global Compliance Profile'}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {isZh 
                ? '通过企业、产品或 UDI 查询多个目标市场的注册、认证、监管状态' 
                : 'Search by company, product, or UDI to view registration status across multiple markets'}
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-12">
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
                  placeholder={isZh ? '搜索企业、产品或 UDI...' : 'Search companies, products or UDI...'}
                  className="flex-1 py-4 pr-4 bg-transparent border-none outline-none text-slate-700 placeholder:text-slate-400 text-base"
                />
                <button
                  type="submit"
                  className="m-2 px-6 py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-[#339999]/30 flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  {isZh ? '搜索' : 'Search'}
                </button>
              </div>
            </form>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#339999]/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#339999]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
