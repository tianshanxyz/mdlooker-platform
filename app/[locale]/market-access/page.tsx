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

  // Generate and download pathway report
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

    // Track download
    if (session?.user?.id) {
      await trackDownload(
        session.user.id,
        'market_access_report',
        targetMarket,
        `market-access-pathway-${targetMarket}.md`
      );
    }

    const categoryName = productCategories.find((c: { id: string; name: string; nameZh: string }) => c.id === productCategory);
    const countryName = sourceCountries.find((c: { id: string; name: string; nameZh: string }) => c.id === sourceCountry);
    const marketName = targetMarkets.find((m: { id: string; name: string; nameZh: string }) => m.id === targetMarket);
    const className = deviceClasses.find((c: { id: string; name: string; nameZh: string }) => c.id === deviceClass);

    const reportContent = `
# ${locale === 'en' ? 'Market Access Pathway Report' : '市场准入路径报告'}
## ${pathway.targetMarket} - ${locale === 'zh' ? pathway.targetMarketZh : pathway.targetMarket}

---

### ${locale === 'en' ? 'Product Information' : '产品信息'}
- **${locale === 'en' ? 'Category' : '类别'}:** ${locale === 'zh' ? categoryName?.nameZh : categoryName?.name}
- **${locale === 'en' ? 'Source Country' : '来源国'}:** ${locale === 'zh' ? countryName?.nameZh : countryName?.name}
- **${locale === 'en' ? 'Target Market' : '目标市场'}:** ${locale === 'zh' ? marketName?.nameZh : marketName?.name}
- **${locale === 'en' ? 'Device Class' : '设备分类'}:** ${locale === 'zh' ? className?.nameZh : className?.name}

---

### ${locale === 'en' ? 'Requirements Summary' : '要求概要'}
- **${locale === 'en' ? 'Total Steps' : '总步骤'}:** ${pathway.requirements.length}
- **${locale === 'en' ? 'Local Representative Required' : '需要本地代表'}:** ${pathway.localRepresentativeRequired ? (locale === 'en' ? 'Yes' : '是') : (locale === 'en' ? 'No' : '否')}
- **${locale === 'en' ? 'Clinical Data Required' : '需要临床数据'}:** ${pathway.clinicalDataRequired ? (locale === 'en' ? 'Yes' : '是') : (locale === 'en' ? 'No' : '否')}

---

### ${locale === 'en' ? 'Access Pathway Steps' : '准入路径步骤'}
${pathway.requirements.map((req: { step: number; title: string; titleZh: string; description: string; descriptionZh: string; documents: string[]; documentsZh: string[]; timeline: string; timelineZh: string; cost: string; costZh: string }) => `
#### ${locale === 'zh' ? req.titleZh : req.title}
**${locale === 'en' ? 'Step' : '步骤'} ${req.step}**

${locale === 'zh' ? req.descriptionZh : req.description}

**${locale === 'en' ? 'Required Documents' : '所需文件'}:**
${(locale === 'zh' ? req.documentsZh : req.documents).map((doc: string) => `- ${doc}`).join('\n')}

- **${locale === 'en' ? 'Timeline' : '时间'}:** ${locale === 'zh' ? req.timelineZh : req.timeline}
- **${locale === 'en' ? 'Estimated Cost' : '预估成本'}:** ${locale === 'zh' ? req.costZh : req.cost}
`).join('\n---\n')}

---

### ${locale === 'en' ? 'Key Regulations' : '核心法规'}
${(locale === 'zh' ? pathway.keyRegulationsZh : pathway.keyRegulations).map((reg: string, idx: number) => `${idx + 1}. ${reg}`).join('\n')}

---

### ${locale === 'en' ? 'Regulation Links' : '法规链接'}
${pathway.regulationLinks.map((link: { name: string; nameZh: string; url: string; description?: string; descriptionZh?: string }) => `- **${locale === 'zh' ? link.nameZh : link.name}**: ${link.url}
  ${locale === 'zh' ? (link.descriptionZh || '') : (link.description || '')}`).join('\n')}

---

*${locale === 'en' ? 'Report generated by MDLooker Market Access Navigator' : '报告由MDLooker市场准入导航生成'}*
*${new Date().toLocaleString()}*
`;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-access-pathway-${targetMarket}-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              {pathway.requirements.map((req: { step: number; title: string; titleZh: string; description: string; descriptionZh: string; documents: string[]; documentsZh: string[]; timeline: string; timelineZh: string; cost: string; costZh: string }, index: number) => (
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
                    </div>
                  </div>
                </div>
              ))}
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
