'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { translations, locales, type Locale } from '../../i18n-config';
import { CountrySummaryChart, MonthlyTrendChart } from '../../components/StatsCharts';
import { BarChart3, TrendingUp, Building2, Globe } from 'lucide-react';

interface CountrySummary {
  countries: Array<{
    name: string;
    name_zh: string;
    count: number;
    flag: string;
  }>;
  total: number;
}

interface MonthlyTrend {
  trend: Array<{
    month: string;
    nmpa: number;
    fda: number;
    eudamed: number;
    total: number;
  }>;
}

export default function StatsPage() {
  const params = useParams();
  const [locale, setLocale] = useState<Locale>('en');
  const [countryData, setCountryData] = useState<CountrySummary | null>(null);
  const [trendData, setTrendData] = useState<MonthlyTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const t = translations[locale];
  const isZh = locale === 'zh';

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      // 加载各国统计
      const countryRes = await fetch('/api/stats?type=country-summary');
      if (countryRes.ok) {
        const countryData = await countryRes.json();
        setCountryData(countryData);
      }

      // 加载月度趋势（12 个月）
      const trendRes = await fetch('/api/stats?type=monthly-trend&months=12');
      if (trendRes.ok) {
        const trendData = await trendRes.json();
        setTrendData(trendData);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-[#339999]" />
            <h1 className="text-3xl font-bold text-gray-900">
              {isZh ? '数据统计' : 'Statistics'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isZh 
              ? '全球医疗器械注册数据概览' 
              : 'Global medical device registration data overview'}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {countryData && (
            <>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {isZh ? '总注册数' : 'Total Registrations'}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{countryData.total.toLocaleString()}</p>
              </div>

              {countryData.countries.map((country, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {isZh ? country.name_zh : country.name}
                      </h3>
                      <p className="text-sm text-gray-500">{country.name}</p>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{country.count.toLocaleString()}</p>
                </div>
              ))}
            </>
          )}
        </div>

        {/* 图表 */}
        {loading ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999] mx-auto"></div>
            <p className="mt-4 text-gray-600">{isZh ? '加载数据...' : 'Loading data...'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* 各国对比图 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {countryData && (
                <CountrySummaryChart data={countryData} isZh={isZh} />
              )}
            </div>

            {/* 月度趋势图 */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {trendData && (
                <MonthlyTrendChart data={trendData} isZh={isZh} />
              )}
            </div>
          </div>
        )}

        {/* 数据说明 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {isZh ? '数据来源说明' : 'Data Sources'}
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="font-semibold">🇨🇳</span>
              <div>
                <p><strong>NMPA:</strong> {isZh ? '中国国家药品监督管理局' : 'National Medical Products Administration (China)'}</p>
                <p className="text-gray-500">{isZh ? '包含医疗器械注册证信息' : 'Medical device registration certificates'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">🇺🇸</span>
              <div>
                <p><strong>FDA:</strong> {isZh ? '美国食品药品监督管理局' : 'Food and Drug Administration (USA)'}</p>
                <p className="text-gray-500">{isZh ? '包含 510(k) 和 PMA 信息' : 'Includes 510(k) and PMA data'}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-semibold">🇪🇺</span>
              <div>
                <p><strong>EUDAMED:</strong> {isZh ? '欧盟医疗器械数据库' : 'European Database on Medical Devices'}</p>
                <p className="text-gray-500">{isZh ? '包含 CE 认证信息' : 'Includes CE certification data'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 更新时间 */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {isZh ? '数据最后更新' : 'Last updated'}: {new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
        </div>
      </div>
    </div>
  );
}
