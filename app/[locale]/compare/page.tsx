'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { locales, type Locale } from '../../i18n-config';
import SearchBox from '../../components/SearchBox';
import { 
  Building2, 
  FileText, 
  Globe, 
  Shield, 
  TrendingUp, 
  Award, 
  AlertCircle,
  CheckCircle2,
  X,
  Lock,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  name_zh?: string;
  country?: string;
  business_type?: string;
  registration_count?: number;
  compliance_score?: number;
  markets?: string[];
  device_classes?: string[];
  registration_trend?: number[];
  regulatory_history?: {
    type: string;
    date: string;
    description: string;
  }[];
  // VIP专属字段
  product_list?: string[];
  risk_rating?: string;
  market_opportunities?: string[];
}

interface ComparisonItem {
  id: string;
  label: string;
  labelZh: string;
  icon: React.ElementType;
  basic: boolean;
  registered: boolean;
  vip: boolean;
  render: (company: Company) => React.ReactNode;
}

export default function ComparePage() {
  const params = useParams();
  const { data: session } = useSession();
  const [locale, setLocale] = useState<Locale>('en');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchResults, setSearchResults] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const isZh = locale === 'zh';
  const isLoggedIn = !!session?.user;
  const isVip = session?.user?.role === 'vip';

  // 获取用户权限级别
  const getUserTier = () => {
    if (isVip) return 'vip';
    if (isLoggedIn) return 'registered';
    return 'guest';
  };

  const userTier = getUserTier();

  // 搜索企业
  const searchCompanies = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&page=1&pageSize=5&type=company`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // 添加企业到对比
  const addCompany = (company: Company) => {
    if (companies.length >= 4) {
      alert(isZh ? '最多可对比4家企业' : 'Maximum 4 companies for comparison');
      return;
    }
    if (companies.find(c => c.id === company.id)) {
      alert(isZh ? '该企业已在对比列表中' : 'Company already in comparison list');
      return;
    }
    setCompanies([...companies, company]);
    setSearchResults([]);
  };

  // 移除企业
  const removeCompany = (id: string) => {
    setCompanies(companies.filter(c => c.id !== id));
  };

  // 切换展开/收起
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // 对比项目定义
  const comparisonItems: ComparisonItem[] = [
    {
      id: 'name',
      label: 'Company Name',
      labelZh: '企业名称',
      icon: Building2,
      basic: true,
      registered: true,
      vip: true,
      render: (company) => (
        <div>
          <p className="font-semibold text-slate-900">{company.name}</p>
          {company.name_zh && <p className="text-sm text-slate-500">{company.name_zh}</p>}
        </div>
      )
    },
    {
      id: 'country',
      label: 'Country',
      labelZh: '国家/地区',
      icon: Globe,
      basic: true,
      registered: true,
      vip: true,
      render: (company) => (
        <span className="inline-flex items-center gap-1">
          <Globe className="w-4 h-4 text-slate-400" />
          {company.country || '-'}
        </span>
      )
    },
    {
      id: 'registration_count',
      label: 'Registration Count',
      labelZh: '注册证数量',
      icon: FileText,
      basic: true,
      registered: true,
      vip: true,
      render: (company) => (
        <span className="text-2xl font-bold text-[#339999]">
          {company.registration_count || 0}
        </span>
      )
    },
    {
      id: 'markets',
      label: 'Markets',
      labelZh: '主要市场',
      icon: Globe,
      basic: true,
      registered: true,
      vip: true,
      render: (company) => (
        <div className="flex flex-wrap gap-1">
          {company.markets?.slice(0, 3).map((market, i) => (
            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
              {market}
            </span>
          )) || '-'}
        </div>
      )
    },
    {
      id: 'compliance_score',
      label: 'Compliance Score',
      labelZh: '合规评分',
      icon: Shield,
      basic: true,
      registered: true,
      vip: true,
      render: (company) => {
        const score = company.compliance_score || 0;
        const color = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
        return (
          <div className="flex items-center gap-2">
            <Award className={`w-5 h-5 ${color}`} />
            <span className={`text-xl font-bold ${color}`}>{score}</span>
            <span className="text-sm text-slate-400">/100</span>
          </div>
        );
      }
    },
    // 注册用户/VIP专属
    {
      id: 'device_classes',
      label: 'Device Classes',
      labelZh: '设备分类',
      icon: Shield,
      basic: false,
      registered: true,
      vip: true,
      render: (company) => (
        <div className="flex flex-wrap gap-1">
          {company.device_classes?.map((cls, i) => (
            <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
              {cls}
            </span>
          )) || '-'}
        </div>
      )
    },
    {
      id: 'registration_trend',
      label: 'Registration Trend (12M)',
      labelZh: '注册趋势（近12月）',
      icon: TrendingUp,
      basic: false,
      registered: true,
      vip: true,
      render: (company) => {
        const trend = company.registration_trend || [];
        const total = trend.reduce((a, b) => a + b, 0);
        return (
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${total > 0 ? 'text-green-600' : 'text-slate-400'}`} />
            <span className={total > 0 ? 'text-green-600' : 'text-slate-500'}>
              {total > 0 ? `+${total}` : total} {isZh ? '新注册' : 'new'}
            </span>
          </div>
        );
      }
    },
    {
      id: 'regulatory_history',
      label: 'Regulatory History',
      labelZh: '监管历史',
      icon: AlertCircle,
      basic: false,
      registered: true,
      vip: true,
      render: (company) => {
        const history = company.regulatory_history || [];
        const alerts = history.filter(h => h.type === 'alert').length;
        return (
          <div className="flex items-center gap-2">
            {alerts > 0 ? (
              <>
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <span className="text-amber-600">{alerts} {isZh ? '提醒' : 'alerts'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-600">{isZh ? '无异常' : 'Clean'}</span>
              </>
            )}
          </div>
        );
      }
    },
    // VIP专属
    {
      id: 'product_list',
      label: 'Product List',
      labelZh: '产品清单',
      icon: FileText,
      basic: false,
      registered: false,
      vip: true,
      render: (company) => (
        <div className="text-sm text-slate-600">
          {company.product_list?.slice(0, 3).map((p, i) => (
            <div key={i} className="truncate">• {p}</div>
          ))}
          {(company.product_list?.length || 0) > 3 && (
            <div className="text-[#339999]">+{(company.product_list?.length || 0) - 3} more</div>
          )}
        </div>
      )
    },
    {
      id: 'risk_rating',
      label: 'Risk Rating',
      labelZh: '风险评级',
      icon: Shield,
      basic: false,
      registered: false,
      vip: true,
      render: (company) => {
        const rating = company.risk_rating || 'Low';
        const color = rating === 'Low' ? 'text-green-600' : rating === 'Medium' ? 'text-yellow-600' : 'text-red-600';
        return (
          <span className={`font-medium ${color}`}>{rating}</span>
        );
      }
    },
    {
      id: 'market_opportunities',
      label: 'Market Opportunities',
      labelZh: '市场机会',
      icon: TrendingUp,
      basic: false,
      registered: false,
      vip: true,
      render: (company) => (
        <div className="flex flex-wrap gap-1">
          {company.market_opportunities?.slice(0, 2).map((opp, i) => (
            <span key={i} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full">
              {opp}
            </span>
          )) || '-'}
        </div>
      )
    },
  ];

  // 过滤当前用户可见的对比项
  const getVisibleItems = () => {
    return comparisonItems.filter(item => {
      if (userTier === 'vip') return true;
      if (userTier === 'registered') return item.registered || item.basic;
      return item.basic;
    });
  };

  const visibleItems = getVisibleItems();
  const basicItems = visibleItems.filter(i => i.basic);
  const registeredItems = visibleItems.filter(i => i.registered && !i.basic);
  const vipItems = visibleItems.filter(i => i.vip && !i.registered && !i.basic);

  // 导出报告
  const exportReport = () => {
    if (!isVip) {
      setShowUpgradeModal(true);
      return;
    }
    // 导出逻辑
    alert(isZh ? '报告导出功能开发中' : 'Report export feature coming soon');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {isZh ? '企业对比分析' : 'Company Comparison'}
              </h1>
              <p className="text-slate-600 mt-2">
                {isZh 
                  ? '对比多家企业的合规状况、注册信息和市场表现'
                  : 'Compare compliance status, registration info and market performance'}
              </p>
            </div>
            {companies.length > 0 && (
              <button
                onClick={exportReport}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999] text-white rounded-lg hover:bg-[#2a7a7a] transition-colors"
              >
                <Download className="w-4 h-4" />
                {isZh ? '导出报告' : 'Export Report'}
              </button>
            )}
          </div>

          {/* 用户权限提示 */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-slate-500">
              {isZh ? '当前权限:' : 'Current tier:'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              userTier === 'vip' ? 'bg-purple-100 text-purple-700' :
              userTier === 'registered' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {userTier === 'vip' ? (isZh ? 'VIP用户' : 'VIP') :
               userTier === 'registered' ? (isZh ? '注册用户' : 'Registered') :
               (isZh ? '访客' : 'Guest')}
            </span>
            {userTier !== 'vip' && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-sm text-[#339999] hover:underline"
              >
                {isZh ? '升级解锁更多功能 →' : 'Upgrade for more features →'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 搜索区域 */}
        {companies.length < 4 && (
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {isZh ? '添加企业到对比' : 'Add Company to Compare'}
            </h2>
            <SearchBox
              locale={locale}
              onSearch={searchCompanies}
              isLoading={loading}
              placeholder={isZh ? '搜索企业名称...' : 'Search company name...'}
              showPopular={false}
            />
            
            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => addCompany(company)}
                    className="w-full text-left p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-900">{company.name}</p>
                      {company.name_zh && (
                        <p className="text-sm text-slate-500">{company.name_zh}</p>
                      )}
                    </div>
                    <span className="text-[#339999] text-sm">
                      {isZh ? '添加对比' : 'Add'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 对比表格 */}
        {companies.length > 0 ? (
          <div className="space-y-6">
            {/* 基础对比 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => toggleSection('basic')}
                className="w-full px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-slate-900">
                    {isZh ? '基础对比' : 'Basic Comparison'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {isZh ? '(所有用户可用)' : '(Available to all)'}
                  </span>
                </div>
                {expandedSections.includes('basic') ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {expandedSections.includes('basic') && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-6 py-4 text-left text-sm font-medium text-slate-500 w-48">
                          {isZh ? '对比项' : 'Item'}
                        </th>
                        {companies.map(company => (
                          <th key={company.id} className="px-6 py-4 text-left min-w-[200px]">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">{company.name}</span>
                              <button
                                onClick={() => removeCompany(company.id)}
                                className="p-1 hover:bg-slate-100 rounded"
                              >
                                <X className="w-4 h-4 text-slate-400" />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {basicItems.map(item => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <item.icon className="w-4 h-4" />
                              {isZh ? item.labelZh : item.label}
                            </div>
                          </td>
                          {companies.map(company => (
                            <td key={company.id} className="px-6 py-4">
                              {item.render(company)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 注册用户/VIP专属 */}
            {registeredItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('registered')}
                  className="w-full px-6 py-4 flex items-center justify-between bg-blue-50 border-b border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-500" />
                    <span className="font-semibold text-slate-900">
                      {isZh ? '高级对比' : 'Advanced Comparison'}
                    </span>
                    <span className="text-xs text-blue-600">
                      {isZh ? '(注册用户/VIP)' : '(Registered/VIP only)'}
                    </span>
                  </div>
                  {expandedSections.includes('registered') ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedSections.includes('registered') && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {registeredItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="px-6 py-4 w-48">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <item.icon className="w-4 h-4" />
                                {isZh ? item.labelZh : item.label}
                              </div>
                            </td>
                            {companies.map(company => (
                              <td key={company.id} className="px-6 py-4 min-w-[200px]">
                                {item.render(company)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* VIP专属 */}
            {vipItems.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleSection('vip')}
                  className="w-full px-6 py-4 flex items-center justify-between bg-purple-50 border-b border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-purple-500" />
                    <span className="font-semibold text-slate-900">
                      {isZh ? '专家级对比' : 'Expert Comparison'}
                    </span>
                    <span className="text-xs text-purple-600">
                      {isZh ? '(VIP专属)' : '(VIP only)'}
                    </span>
                  </div>
                  {expandedSections.includes('vip') ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {expandedSections.includes('vip') && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <tbody>
                        {vipItems.map(item => (
                          <tr key={item.id} className="border-b border-slate-100">
                            <td className="px-6 py-4 w-48">
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <item.icon className="w-4 h-4" />
                                {isZh ? item.labelZh : item.label}
                              </div>
                            </td>
                            {companies.map(company => (
                              <td key={company.id} className="px-6 py-4 min-w-[200px]">
                                {item.render(company)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <Building2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 text-lg">
              {isZh ? '请添加企业开始对比' : 'Add companies to start comparison'}
            </p>
            <p className="text-slate-400 text-sm mt-2">
              {isZh ? '最多可对比4家企业' : 'Compare up to 4 companies'}
            </p>
          </div>
        )}
      </div>

      {/* 升级提示弹窗 */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isZh ? '升级解锁更多功能' : 'Upgrade for More Features'}
              </h3>
              <p className="text-slate-600 mb-6">
                {isZh 
                  ? '注册成为用户可解锁高级对比功能，升级VIP可获得完整分析报告导出功能。'
                  : 'Register to unlock advanced comparison features. Upgrade to VIP for full report export.'}
              </p>
              <div className="space-y-3">
                {!isLoggedIn && (
                  <Link
                    href={`/${locale}/auth/signin`}
                    className="block w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                  >
                    {isZh ? '免费注册' : 'Register Free'}
                  </Link>
                )}
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="block w-full py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors"
                >
                  {isZh ? '稍后再说' : 'Maybe Later'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
