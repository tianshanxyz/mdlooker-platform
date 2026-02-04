'use client';

import { useState } from 'react';
import { locales, type Locale } from '../../i18n-config';
import {
  generateAccessPathway,
  productCategories,
  targetMarkets,
  sourceCountries,
  deviceClasses,
  type MarketAccessPathway,
} from '../../lib/market-access-data';

export default function MarketAccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const [locale, setLocale] = useState<Locale>('en');
  const [productCategory, setProductCategory] = useState('');
  const [sourceCountry, setSourceCountry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [deviceClass, setDeviceClass] = useState('');
  const [pathway, setPathway] = useState<MarketAccessPathway | null>(null);
  const [showResults, setShowResults] = useState(false);

  params.then((p) => {
    if (locales.includes(p.locale as Locale)) {
      setLocale(p.locale as Locale);
    }
  });

  const generatePathway = () => {
    if (!productCategory || !sourceCountry || !targetMarket || !deviceClass) {
      return;
    }
    const generatedPathway = generateAccessPathway(
      productCategory,
      sourceCountry,
      targetMarket,
      deviceClass,
      locale
    );
    setPathway(generatedPathway);
    setShowResults(true);
  };

  const getMarketFlag = (marketId: string) => {
    const market = targetMarkets.find((m) => m.id === marketId);
    return market?.flag || '🌍';
  };

  const getMarketName = (marketId: string) => {
    const market = targetMarkets.find((m) => m.id === marketId);
    return locale === 'zh' ? market?.nameZh : market?.name;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-4">
        {locale === 'en' ? 'Market Access Navigator' : '情景化准入导航'}
      </h1>
      <p className="text-slate-600 mb-8">
        {locale === 'en'
          ? 'Select your product category, source country, and target market to generate a structured market access pathway'
          : '选择产品类别、来源国和目标市场，生成结构化准入路径、核心法规与关键要求清单'}
      </p>

      {/* Selection Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Product Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'en' ? 'Product Category' : '产品类别'}
            </label>
            <select
              value={productCategory}
              onChange={(e) => setProductCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
            >
              <option value="">
                {locale === 'en' ? 'Select category...' : '选择类别...'}
              </option>
              {productCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === 'zh' ? cat.nameZh : cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Source Country */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'en' ? 'Source Country' : '来源国'}
            </label>
            <select
              value={sourceCountry}
              onChange={(e) => setSourceCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
            >
              <option value="">
                {locale === 'en' ? 'Select country...' : '选择国家...'}
              </option>
              {sourceCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {locale === 'zh' ? country.nameZh : country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Market */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'en' ? 'Target Market' : '目标市场'}
            </label>
            <select
              value={targetMarket}
              onChange={(e) => setTargetMarket(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
            >
              <option value="">
                {locale === 'en' ? 'Select market...' : '选择市场...'}
              </option>
              {targetMarkets.map((market) => (
                <option key={market.id} value={market.id}>
                  {market.flag} {locale === 'zh' ? market.nameZh : market.name}
                </option>
              ))}
            </select>
          </div>

          {/* Device Class */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {locale === 'en' ? 'Device Class' : '设备分类'}
            </label>
            <select
              value={deviceClass}
              onChange={(e) => setDeviceClass(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
            >
              <option value="">
                {locale === 'en' ? 'Select class...' : '选择分类...'}
              </option>
              {deviceClasses.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {locale === 'zh' ? cls.nameZh : cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={generatePathway}
          disabled={!productCategory || !sourceCountry || !targetMarket || !deviceClass}
          className="mt-6 w-full md:w-auto px-8 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {locale === 'en' ? 'Generate Access Pathway' : '生成准入路径'}
        </button>
      </div>

      {/* Results Section */}
      {showResults && pathway && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#339999]/10 to-transparent rounded-2xl p-6 border border-slate-100">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{getMarketFlag(targetMarket)}</span>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {locale === 'zh' ? pathway.targetMarketZh : pathway.targetMarket}
                </h2>
                <p className="text-slate-600">
                  {locale === 'en' ? 'Market Access Pathway' : '市场准入路径'}
                </p>
              </div>
            </div>

            {/* Key Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#339999]">{pathway.requirements.length}</p>
                <p className="text-sm text-slate-600">
                  {locale === 'en' ? 'Steps' : '步骤'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#339999]">
                  {pathway.localRepresentativeRequired
                    ? locale === 'en'
                      ? 'Yes'
                      : '需要'
                    : locale === 'en'
                    ? 'No'
                    : '不需要'}
                </p>
                <p className="text-sm text-slate-600">
                  {locale === 'en' ? 'Local Rep' : '本地代表'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#339999]">
                  {pathway.clinicalDataRequired
                    ? locale === 'en'
                      ? 'Yes'
                      : '需要'
                    : locale === 'en'
                    ? 'No'
                    : '不需要'}
                </p>
                <p className="text-sm text-slate-600">
                  {locale === 'en' ? 'Clinical Data' : '临床数据'}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                <p className="text-2xl font-bold text-[#339999]">{pathway.keyRegulations.length}</p>
                <p className="text-sm text-slate-600">
                  {locale === 'en' ? 'Regulations' : '法规'}
                </p>
              </div>
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {locale === 'en' ? 'Access Pathway Steps' : '准入路径步骤'}
            </h3>
            <div className="space-y-6">
              {pathway.requirements.map((req, index) => (
                <div key={req.step} className="relative">
                  {index !== pathway.requirements.length - 1 && (
                    <div className="absolute left-6 top-14 w-0.5 h-full bg-[#339999]/20" />
                  )}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#339999] text-white flex items-center justify-center font-bold text-lg">
                      {req.step}
                    </div>
                    <div className="flex-1 pb-6">
                      <h4 className="text-lg font-semibold text-slate-900">
                        {locale === 'zh' ? req.titleZh : req.title}
                      </h4>
                      <p className="text-slate-600 mt-1">
                        {locale === 'zh' ? req.descriptionZh : req.description}
                      </p>

                      {/* Documents */}
                      <div className="mt-3">
                        <p className="text-sm font-medium text-slate-700">
                          {locale === 'en' ? 'Required Documents:' : '所需文件：'}
                        </p>
                        <ul className="mt-1 space-y-1">
                          {(locale === 'zh' ? req.documentsZh : req.documents).map((doc, i) => (
                            <li key={i} className="text-sm text-slate-600 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#339999] rounded-full" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Timeline & Cost */}
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {locale === 'zh' ? req.timelineZh : req.timeline}
                        </span>
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {locale === 'zh' ? req.costZh : req.cost}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Regulations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {locale === 'en' ? 'Key Regulations' : '核心法规'}
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {(locale === 'zh' ? pathway.keyRegulationsZh : pathway.keyRegulations).map(
                (reg, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#339999]/10 text-[#339999] flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="text-slate-700">{reg}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Notified Bodies (if applicable) */}
          {pathway.notifiedBodies && pathway.notifiedBodies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {locale === 'en' ? 'Recommended Notified Bodies' : '推荐公告机构'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {pathway.notifiedBodies.map((body, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium"
                  >
                    {body}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Important Notes */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-amber-800 mb-3">
              {locale === 'en' ? 'Important Notes' : '重要提示'}
            </h3>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  {locale === 'en'
                    ? 'Timelines and costs are estimates and may vary based on device complexity and regulatory workload'
                    : '时间和成本为估算值，可能因设备复杂性和监管工作量而有所不同'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  {locale === 'en'
                    ? 'Consult with regulatory experts before making final decisions'
                    : '在做出最终决策前请咨询监管专家'}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>
                  {locale === 'en'
                    ? 'Regulations are subject to change; always verify with official sources'
                    : '法规可能会有变化，请务必与官方来源核实'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
