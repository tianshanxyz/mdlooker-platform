'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import SEO from '../../components/SEO';
import { StructuredData } from '../../components/StructuredData';

export default function ToolkitPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';

  const isZh = locale === 'zh';

  const tools = [
    {
      id: 'compliance-profile',
      title: isZh ? '合规档案查询' : 'Compliance Profile Search',
      description: isZh 
        ? '查询企业在全球各市场的注册、认证和监管状态' 
        : 'Search company registration, certification and regulatory status across global markets',
      icon: '🏢',
      href: `/${locale}/compliance-profile`,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'product-tracker',
      title: isZh ? '产品注册追踪' : 'Product Registration Tracker',
      description: isZh 
        ? '追踪医疗器械产品在全球各国的注册历史和现状' 
        : 'Track medical device product registration history and status across countries',
      icon: '🔍',
      href: `/${locale}/product-tracker`,
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'regulators',
      title: isZh ? '监管机构数据库' : 'Regulatory Agencies Database',
      description: isZh 
        ? '查询全球15+个国家的医疗器械监管机构信息' 
        : 'Search regulatory agencies information from 15+ countries',
      icon: '🏛️',
      href: `/${locale}/regulators`,
      color: 'from-purple-500 to-violet-500',
    },
    {
      id: 'market-access',
      title: isZh ? '市场准入导航' : 'Market Access Navigation',
      description: isZh 
        ? '了解各国医疗器械注册要求和准入路径' 
        : 'Understand medical device registration requirements and access pathways',
      icon: '🌍',
      href: `/${locale}/market-access`,
      color: 'from-orange-500 to-amber-500',
    },
    {
      id: 'guides',
      title: isZh ? '法规指南' : 'Regulatory Guides',
      description: isZh 
        ? '详细的FDA、NMPA、EU MDR等医疗器械注册指南' 
        : 'Detailed guides for FDA, NMPA, EU MDR medical device registration',
      icon: '📚',
      href: `/${locale}/guides`,
      color: 'from-red-500 to-rose-500',
    },
    {
      id: 'stats',
      title: isZh ? '数据统计' : 'Statistics',
      description: isZh 
        ? '查看医疗器械注册数据的统计分析和趋势' 
        : 'View statistical analysis and trends of medical device registration data',
      icon: '📊',
      href: `/${locale}/stats`,
      color: 'from-teal-500 to-cyan-500',
    },
    {
      id: 'monitoring',
      title: isZh ? '竞品监控' : 'Competitor Monitoring',
      description: isZh 
        ? '监控竞争对手的产品注册动态和市场变化' 
        : 'Monitor competitor product registration dynamics and market changes',
      icon: '👁️',
      href: `/${locale}/monitoring`,
      color: 'from-indigo-500 to-blue-500',
    },
    {
      id: 'search',
      title: isZh ? '统一搜索' : 'Unified Search',
      description: isZh 
        ? '一站式搜索企业、产品和监管机构信息' 
        : 'One-stop search for companies, products and regulatory agencies',
      icon: '🔎',
      href: `/${locale}/search`,
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const pageTitle = isZh ? '工具箱 - MDLooker' : 'Toolkit - MDLooker';
  const pageDescription = isZh 
    ? 'MDLooker工具箱提供各种医疗器械合规数据查询工具，包括合规档案、产品追踪、监管机构查询等。'
    : 'MDLooker toolkit provides various medical device compliance data query tools.';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO
        page="toolkit"
        locale={locale}
        customConfig={{
          title: pageTitle,
          description: pageDescription,
          keywords: isZh 
            ? '工具箱,合规查询,产品追踪,监管机构,市场准入,法规指南'
            : 'toolkit,compliance search,product tracker,regulators,market access,guides',
        }}
      />
      <StructuredData
        type="Organization"
        data={{
          name: pageTitle,
          description: pageDescription,
          url: `https://mdlooker.com/${locale}/toolkit`,
        }}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#339999] to-[#2a7a7a] text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {isZh ? '🔧 工具箱' : '🔧 Toolkit'}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {isZh 
                ? '一站式医疗器械合规数据查询工具集合'
                : 'One-stop medical device compliance data query toolkit'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
            >
              {/* Background Gradient on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {tool.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#339999] transition-colors">
                  {tool.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {tool.description}
                </p>

                {/* Arrow */}
                <div className="mt-4 flex items-center text-[#339999] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>{isZh ? '开始使用' : 'Get Started'}</span>
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-16 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-100">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
              💡
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {isZh ? '使用提示' : 'Quick Tips'}
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>
                    {isZh 
                      ? '使用合规档案查询快速了解企业在全球各市场的注册状态'
                      : 'Use Compliance Profile Search to quickly check company registration status across global markets'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>
                    {isZh 
                      ? '产品追踪功能可以帮助您监控竞争对手的新产品注册动态'
                      : 'Product Tracker helps you monitor competitor new product registration dynamics'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>
                    {isZh 
                      ? '数据统计页面提供行业趋势分析和市场洞察'
                      : 'Statistics page provides industry trend analysis and market insights'
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
