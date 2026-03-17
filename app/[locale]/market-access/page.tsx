'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { locales, type Locale } from '../../i18n-config';
import {
  generateAccessPathway,
  productCategories,
  targetMarkets,
  sourceCountries,
  deviceClasses,
  type MarketAccessPathway,
} from '@/app/lib/market-access-data';
import { checkPermission, trackDownload } from '@/app/lib/auth';
import { MarketAccessPDF, generateAndDownloadPDF } from '@/app/components/PDFTemplates';
import { generateReportId, trackReportDownload } from '@/app/lib/report-tracking';

// Download icon component
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// External link icon component
function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

// File text icon component
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// Chevron down icon component
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// Mail icon component
function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

// Phone icon component
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

// Globe icon component
function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

// Lightbulb icon component
function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

// Send icon component
function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  );
}

export default function MarketAccessPage() {
  const { data: session, status } = useSession();
  const [locale, setLocale] = useState<Locale>('en');
  const [productCategory, setProductCategory] = useState('');
  const [sourceCountry, setSourceCountry] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [deviceClass, setDeviceClass] = useState('');
  const [pathway, setPathway] = useState<MarketAccessPathway | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isCheckingPermission, setIsCheckingPermission] = useState(true);
  const [expandedSteps, setExpandedSteps] = useState<number[]>([]);

  const toggleStep = (step: number) => {
    setExpandedSteps(prev =>
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  useEffect(() => {
    async function checkDownloadPermission() {
      setIsCheckingPermission(true);
      const hasPermission = await checkPermission(
        session?.user?.id,
        'market_access',
        'download'
      );
      setCanDownload(hasPermission);
      setIsCheckingPermission(false);
    }
    checkDownloadPermission();
  }, [session]);

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
    const market = targetMarkets.find((m: { id: string; flag?: string }) => m.id === marketId);
    return market?.flag || '🌍';
  };

  const getMarketName = (marketId: string) => {
    const market = targetMarkets.find((m: { id: string; name?: string; nameZh?: string }) => m.id === marketId);
    return locale === 'zh' ? market?.nameZh : market?.name;
  };

  // Generate and download pathway report as PDF
  const downloadPathwayReport = async () => {
    if (!pathway) return;

    // Check permission before downloading
    const hasPermission = await checkPermission(
      session?.user?.id,
      'market_access',
      'download'
    );

    if (!hasPermission) {
      alert(locale === 'zh'
        ? '请登录或升级账户以下载报告'
        : 'Please sign in or upgrade your account to download reports');
      return;
    }

    // Generate report ID
    const reportId = generateReportId('MAP');

    // Track download in database
    await trackReportDownload(
      reportId,
      session?.user?.id || null,
      'MAP',
      targetMarket,
      {
        productCategory,
        sourceCountry,
        deviceClass,
        pathway: pathway.targetMarket,
      }
    );

    // Get display names
    const categoryName = productCategories.find((c: { id: string; name: string; nameZh: string }) => c.id === productCategory);
    const countryName = sourceCountries.find((c: { id: string; name: string; nameZh: string }) => c.id === sourceCountry);
    const marketName = targetMarkets.find((m: { id: string; name: string; nameZh: string }) => m.id === targetMarket);
    const className = deviceClasses.find((c: { id: string; name: string; nameZh: string }) => c.id === deviceClass);

    // Generate PDF
    const pdfComponent = (
      <MarketAccessPDF
        pathway={pathway}
        productCategory={(locale === 'zh' ? categoryName?.nameZh : categoryName?.name) || productCategory}
        sourceCountry={(locale === 'zh' ? countryName?.nameZh : countryName?.name) || sourceCountry}
        targetMarket={(locale === 'zh' ? marketName?.nameZh : marketName?.name) || targetMarket}
        deviceClass={(locale === 'zh' ? className?.nameZh : className?.name) || deviceClass}
        locale={locale}
      />
    );

    const filename = `mdlooker-map-${targetMarket.toLowerCase()}-${new Date().toISOString().split('T')[0]}-${reportId.split('-').pop()}.pdf`;
    await generateAndDownloadPDF(pdfComponent, filename);
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
              {productCategories.map((cat: { id: string; name: string; nameZh: string }) => (
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
              {sourceCountries.map((country: { id: string; name: string; nameZh: string }) => (
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
              {targetMarkets.map((market: { id: string; name: string; nameZh: string; flag: string }) => (
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
              {deviceClasses.map((cls: { id: string; name: string; nameZh: string }) => (
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

            {/* Download Report Button */}
            <div className="mt-6 flex justify-end">
              {canDownload ? (
                <button
                  onClick={downloadPathwayReport}
                  disabled={isCheckingPermission}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors shadow-md disabled:opacity-50"
                >
                  <DownloadIcon className="w-5 h-5" />
                  {locale === 'en' ? 'Download Full Report' : '下载完整报告'}
                </button>
              ) : (
                <Link
                  href={`/${locale}/auth/signin?callbackUrl=/${locale}/market-access`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
                >
                  <DownloadIcon className="w-5 h-5" />
                  {locale === 'en' ? 'Sign in to Download' : '登录后下载'}
                </Link>
              )}
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              {locale === 'en' ? 'Access Pathway Steps' : '准入路径步骤'}
            </h3>
            <div className="space-y-6">
              {pathway.requirements.map((req: { step: number; title: string; titleZh: string; description: string; descriptionZh: string; documents: string[]; documentsZh: string[]; timeline: string; timelineZh: string; cost: string; costZh: string; detailedGuide?: any }, index: number) => {
                const isExpanded = expandedSteps.includes(req.step);
                const hasDetailedGuide = req.detailedGuide && (
                  req.detailedGuide.forms?.length > 0 ||
                  req.detailedGuide.contacts?.length > 0 ||
                  req.detailedGuide.submissionMethods?.length > 0 ||
                  req.detailedGuide.tips?.length > 0
                );

                return (
                  <div key={req.step} className="relative">
                    {index !== pathway.requirements.length - 1 && (
                      <div className="absolute left-6 top-14 w-0.5 h-full bg-[#339999]/20" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#339999] text-white flex items-center justify-center font-bold text-lg">
                        {req.step}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-slate-900">
                              {locale === 'zh' ? req.titleZh : req.title}
                            </h4>
                            <p className="text-slate-600 mt-1">
                              {locale === 'zh' ? req.descriptionZh : req.description}
                            </p>
                          </div>
                          {hasDetailedGuide && (
                            <button
                              onClick={() => toggleStep(req.step)}
                              className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#339999] hover:bg-[#339999]/10 rounded-lg transition-colors"
                            >
                              {locale === 'en' ? 'Details' : '详情'}
                              <ChevronDownIcon className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* Documents */}
                        <div className="mt-3">
                          <p className="text-sm font-medium text-slate-700">
                            {locale === 'en' ? 'Required Documents:' : '所需文件：'}
                          </p>
                          <ul className="mt-1 space-y-1">
                            {(locale === 'zh' ? req.documentsZh : req.documents).map((doc: string, i: number) => (
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

                        {/* Detailed Guide */}
                        {isExpanded && req.detailedGuide && (
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                            {/* Detailed Description */}
                            {(locale === 'zh' ? req.detailedGuide.descriptionZh : req.detailedGuide.description) && (
                              <div className="mb-4">
                                <p className="text-sm text-slate-700 leading-relaxed">
                                  {locale === 'zh' ? req.detailedGuide.descriptionZh : req.detailedGuide.description}
                                </p>
                              </div>
                            )}

                            {/* Forms */}
                            {req.detailedGuide.forms && req.detailedGuide.forms.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                  <FileTextIcon className="w-4 h-4 text-[#339999]" />
                                  {locale === 'en' ? 'Required Forms' : '所需表格'}
                                </h5>
                                <div className="space-y-2">
                                  {req.detailedGuide.forms.map((form: any, i: number) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                                      <p className="font-medium text-slate-900 text-sm">
                                        {locale === 'zh' ? form.nameZh : form.name}
                                      </p>
                                      {(locale === 'zh' ? form.descriptionZh : form.description) && (
                                        <p className="text-xs text-slate-500 mt-1">
                                          {locale === 'zh' ? form.descriptionZh : form.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {form.downloadUrl && (
                                          <a
                                            href={form.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-[#339999] text-white text-xs rounded-lg hover:bg-[#2a7a7a] transition-colors"
                                          >
                                            <DownloadIcon className="w-3 h-3" />
                                            {locale === 'en' ? 'Download' : '下载'}
                                          </a>
                                        )}
                                        {form.onlineUrl && (
                                          <a
                                            href={form.onlineUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-lg hover:bg-blue-100 transition-colors"
                                          >
                                            <ExternalLinkIcon className="w-3 h-3" />
                                            {locale === 'en' ? 'Online Form' : '在线填写'}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Contacts */}
                            {req.detailedGuide.contacts && req.detailedGuide.contacts.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                  <PhoneIcon className="w-4 h-4 text-[#339999]" />
                                  {locale === 'en' ? 'Contact Information' : '联系方式'}
                                </h5>
                                <div className="space-y-2">
                                  {req.detailedGuide.contacts.map((contact: any, i: number) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                                      <p className="font-medium text-slate-900 text-sm">
                                        {locale === 'zh' ? contact.nameZh : contact.name}
                                      </p>
                                      {(locale === 'zh' ? contact.descriptionZh : contact.description) && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {locale === 'zh' ? contact.descriptionZh : contact.description}
                                        </p>
                                      )}
                                      <div className="flex flex-wrap gap-3 mt-2">
                                        {contact.email && (
                                          <a
                                            href={`mailto:${contact.email}`}
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            <MailIcon className="w-3 h-3" />
                                            {contact.email}
                                          </a>
                                        )}
                                        {contact.phone && (
                                          <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                            <PhoneIcon className="w-3 h-3" />
                                            {contact.phone}
                                          </span>
                                        )}
                                        {contact.website && (
                                          <a
                                            href={contact.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            <GlobeIcon className="w-3 h-3" />
                                            {locale === 'en' ? 'Website' : '官网'}
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Submission Methods */}
                            {req.detailedGuide.submissionMethods && req.detailedGuide.submissionMethods.length > 0 && (
                              <div className="mb-4">
                                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                  <SendIcon className="w-4 h-4 text-[#339999]" />
                                  {locale === 'en' ? 'How to Submit' : '提交方式'}
                                </h5>
                                <div className="space-y-2">
                                  {req.detailedGuide.submissionMethods.map((method: any, i: number) => (
                                    <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
                                      <p className="font-medium text-slate-900 text-sm">
                                        {locale === 'zh' ? method.methodZh : method.method}
                                      </p>
                                      {(locale === 'zh' ? method.descriptionZh : method.description) && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {locale === 'zh' ? method.descriptionZh : method.description}
                                        </p>
                                      )}
                                      {method.url && (
                                        <a
                                          href={method.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          <ExternalLinkIcon className="w-3 h-3" />
                                          {method.url}
                                        </a>
                                      )}
                                      {method.email && (
                                        <a
                                          href={`mailto:${method.email}`}
                                          className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:text-blue-800"
                                        >
                                          <MailIcon className="w-3 h-3" />
                                          {method.email}
                                        </a>
                                      )}
                                      {method.address && (
                                        <p className="text-xs text-slate-600 mt-2 flex items-start gap-1">
                                          <span className="font-medium">{locale === 'en' ? 'Address: ' : '地址: '}</span>
                                          {method.address}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Tips */}
                            {req.detailedGuide.tips && req.detailedGuide.tips.length > 0 && (
                              <div>
                                <h5 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                                  <LightbulbIcon className="w-4 h-4 text-amber-500" />
                                  {locale === 'en' ? 'Tips & Best Practices' : '提示与最佳实践'}
                                </h5>
                                <ul className="space-y-1.5">
                                  {(locale === 'zh' ? req.detailedGuide.tipsZh : req.detailedGuide.tips).map((tip: string, i: number) => (
                                    <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                      <span className="text-amber-500 mt-0.5">•</span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Regulations with Links */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              {locale === 'en' ? 'Key Regulations & Official Links' : '核心法规与官方链接'}
            </h3>
            <div className="space-y-4">
              {(locale === 'zh' ? pathway.keyRegulationsZh : pathway.keyRegulations).map(
                (reg: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#339999]/10 text-[#339999] flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <span className="text-slate-800 font-medium block">{reg}</span>
                      {pathway.regulationLinks[index] && (
                        <a
                          href={pathway.regulationLinks[index].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-[#339999] hover:text-[#2a7a7a] hover:underline"
                        >
                          <ExternalLinkIcon className="w-4 h-4" />
                          {locale === 'zh'
                            ? pathway.regulationLinks[index].nameZh
                            : pathway.regulationLinks[index].name}
                        </a>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>

            {/* All Regulation Links */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h4 className="text-lg font-semibold text-slate-900 mb-3">
                {locale === 'en' ? 'Additional Resources' : '更多资源'}
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {pathway.regulationLinks.map((link: { name: string; nameZh: string; url: string; description?: string; descriptionZh?: string }, idx: number) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                  >
                    <FileTextIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 group-hover:text-blue-800">
                        {locale === 'zh' ? link.nameZh : link.name}
                      </p>
                      {link.description && (
                        <p className="text-xs text-blue-700 mt-1">
                          {locale === 'zh' ? link.descriptionZh : link.description}
                        </p>
                      )}
                    </div>
                    <ExternalLinkIcon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Notified Bodies (if applicable) */}
          {pathway.notifiedBodies && pathway.notifiedBodies.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {locale === 'en' ? 'Recommended Notified Bodies' : '推荐公告机构'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {pathway.notifiedBodies.map((body: string, index: number) => (
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
