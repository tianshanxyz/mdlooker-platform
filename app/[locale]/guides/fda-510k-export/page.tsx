'use client';

import { useState } from 'react';
import { locales, type Locale } from '../../../i18n-config';

// Icon components
function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  );
}

function LightbulbIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

// Guide data
const guideData = {
  forms: [
    {
      name: 'Form 3601 - Device User Fee Cover Sheet',
      nameZh: '表格3601 - 设备用户费用封面页',
      downloadUrl: 'https://www.fda.gov/media/80958/download',
      onlineUrl: 'https://www.fda.gov/industry/medical-device-user-fee-amendments-mdufa/mdufa-cover-sheet',
      description: 'Required for all 510(k) submissions with fee payment',
      descriptionZh: '所有510(k)提交都需要此表格用于费用支付'
    },
    {
      name: 'Form 3674 - Certification of Compliance',
      nameZh: '表格3674 - 合规证明',
      downloadUrl: 'https://www.fda.gov/media/73166/download',
      description: 'ClinicalTrials.gov registration certification',
      descriptionZh: 'ClinicalTrials.gov注册证明'
    },
    {
      name: 'Form 3881 - Disclosure Statement',
      nameZh: '表格3881 - 披露声明',
      downloadUrl: 'https://www.fda.gov/media/76967/download',
      description: 'Financial disclosure for clinical investigators',
      descriptionZh: '临床研究者财务披露'
    },
    {
      name: '510(k) Submission Template',
      nameZh: '510(k)提交模板',
      downloadUrl: 'https://www.fda.gov/media/99938/download',
      onlineUrl: 'https://www.fda.gov/medical-devices/premarket-submissions/510k-submissions',
      description: 'FDA recommended format for 510(k) submissions',
      descriptionZh: 'FDA推荐的510(k)提交格式'
    }
  ],
  contacts: [
    {
      name: 'FDA Division of Industry and Consumer Education (DICE)',
      nameZh: 'FDA行业与消费者教育司',
      email: 'DICE@fda.hhs.gov',
      phone: '+1-800-638-2041',
      website: 'https://www.fda.gov/medical-devices/medical-device-safety/medical-device-advisory-committees',
      description: 'General questions about 510(k) submissions',
      descriptionZh: '510(k)提交的一般问题'
    },
    {
      name: 'FDA CDRH Submission Support',
      nameZh: 'FDA CDRH提交支持',
      email: 'CDRHSubmissionSupport@fda.hhs.gov',
      description: 'Technical support for eSubmitter and submission issues',
      descriptionZh: 'eSubmitter和提交问题的技术支持'
    },
    {
      name: 'FDA Small Business Program',
      nameZh: 'FDA小企业计划',
      email: 'CDRHSmallBusiness@fda.hhs.gov',
      phone: '+1-301-796-7400',
      website: 'https://www.fda.gov/industry/medical-device-user-fee-amendments-mdufa/small-business-qualification-and-certification',
      description: 'Fee reduction qualification for small businesses',
      descriptionZh: '小企业费用减免资格'
    }
  ],
  submissionMethods: [
    {
      method: 'eSubmitter System (Recommended)',
      methodZh: 'eSubmitter系统（推荐）',
      url: 'https://www.fda.gov/industry/electronic-submissions-gateway',
      description: 'Electronic submission gateway for 510(k) files',
      descriptionZh: '510(k)文件的电子提交网关'
    },
    {
      method: 'CDRH Customer Collaboration Portal',
      methodZh: 'CDRH客户协作门户',
      url: 'https://customerportal.fda.gov/',
      description: 'Track submission status and communicate with FDA',
      descriptionZh: '跟踪提交状态并与FDA沟通'
    }
  ],
  tips: [
    'Use the FDA 510(k) Pre-Submission process for complex devices or novel questions',
    'Ensure your predicate device is legally marketed in the US',
    'Include all required biocompatibility testing per ISO 10993 series',
    'Prepare for potential Additional Information (AI) requests',
    'Consider hiring an FDA consultant for first-time submissions',
    'Maintain detailed design controls and risk management files'
  ],
  tipsZh: [
    '对于复杂设备或新颖问题，使用FDA 510(k)预提交程序',
    '确保您的对比设备在美国合法上市',
    '按照ISO 10993系列包含所有必需的生物相容性测试',
    '准备应对可能的补充信息（AI）请求',
    '首次提交考虑聘请FDA顾问',
    '维护详细的设计控制和风险管理文件'
  ],
  officialLinks: [
    {
      name: 'FDA 510(k) Guidance Documents',
      nameZh: 'FDA 510(k)指南文件',
      url: 'https://www.fda.gov/medical-devices/premarket-submissions/510k-submissions',
      description: 'Complete list of FDA guidance for 510(k) submissions',
      descriptionZh: 'FDA 510(k)提交指南文件完整列表'
    },
    {
      name: 'Product Classification Database',
      nameZh: '产品分类数据库',
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfPCD/classification.cfm',
      description: 'Search for device classification and product codes',
      descriptionZh: '搜索设备分类和产品代码'
    },
    {
      name: '510(k) Premarket Notification Database',
      nameZh: '510(k)上市前通知数据库',
      url: 'https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm',
      description: 'Search cleared 510(k) devices for predicate selection',
      descriptionZh: '搜索已批准的510(k)设备以选择对比设备'
    },
    {
      name: 'User Fee Calculator',
      nameZh: '用户费用计算器',
      url: 'https://www.fda.gov/industry/medical-device-user-fee-amendments-mdufa/mdufa-fees',
      description: 'Calculate FDA user fees for your submission',
      descriptionZh: '计算您的提交所需的FDA用户费用'
    }
  ]
};

export default function GuideDetailPage({
  params
}: {
  params: { locale: string }
}) {
  const locale = params.locale as Locale;
  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          {isZh ? 'FDA 510(k) 出口指南 2024' : 'FDA 510(k) Export Guide 2024'}
        </h1>
        <p className="text-slate-600 mb-8">
          {isZh 
            ? '出口二类医疗器械到美国的完整路线图，包含表格下载、联系方式和官方资源。'
            : 'Complete roadmap for exporting Class II medical devices to USA, including forms, contacts, and official resources.'}
        </p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>{isZh ? '免责声明：' : 'Disclaimer:'}</strong>
            {isZh 
              ? '基于FDA 2024年法规。请在fda.gov核实最新要求。'
              : ' Based on FDA regulations as of 2024. Verify at fda.gov.'}
          </p>
        </div>

        <section className="space-y-12">
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '1. 510(k) 概述' : '1. 510(k) Overview'}
            </h2>
            <p className="text-slate-700 mb-4">
              {isZh 
                ? '510(k)是向FDA提交的上市前通知，证明您的设备与已合法上市的对比设备（predicate device）实质等效。大多数二类医疗器械需要通过510(k)途径获得FDA批准。'
                : 'The 510(k) is a premarket submission to FDA demonstrating that your device is substantially equivalent to a legally marketed predicate device. Most Class II medical devices require 510(k) clearance.'}
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-900">
                {isZh ? '关键要求：' : 'Key Requirements:'}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>{isZh ? '设备分类确认（Class I, II, 或 III）' : 'Device classification (Class I, II, or III)'}</li>
                <li>{isZh ? '对比设备选择（Predicate Device）' : 'Predicate device selection'}</li>
                <li>{isZh ? '实质等效证明' : 'Substantial equivalence demonstration'}</li>
                <li>{isZh ? '510(k)摘要' : '510(k) Summary'}</li>
              </ul>
            </div>
          </div>

          {/* Timeline & Costs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '2. 时间线与费用（2024）' : '2. Timeline & Costs (2024)'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-900">
                  {isZh ? '典型时间线：' : 'Typical Timeline:'}
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{isZh ? '准备阶段：3-6个月' : 'Preparation: 3-6 months'}</li>
                  <li>{isZh ? 'FDA审查：90-120天' : 'FDA Review: 90-120 days'}</li>
                  <li>{isZh ? '总时间：6-12个月' : 'Total: 6-12 months'}</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-900">
                  {isZh ? '费用（2024）：' : 'Fees (2024):'}
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{isZh ? '标准费用：$21,760' : 'Standard Fee: $21,760'}</li>
                  <li>{isZh ? '小企业费用：$5,440' : 'Small Business: $5,440'}</li>
                  <li>{isZh ? '准备成本：$10,000-$50,000' : 'Preparation: $10,000-$50,000'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Device Classification */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '3. 设备分类' : '3. Device Classification'}
            </h2>
            <p className="text-slate-700 mb-4">
              {isZh 
                ? '使用FDA产品分类数据库确定您的设备分类和产品代码。正确的分类决定了您的监管路径。'
                : 'Use the FDA Product Classification Database to determine your device classification and product code. Correct classification determines your regulatory pathway.'}
            </p>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>{isZh ? '提示：' : 'Tip:'}</strong>
                {isZh 
                  ? ' 如果不确定分类，可以提交513(g)信息请求获得FDA官方意见。'
                  : ' If unsure about classification, submit a 513(g) Request for Information for FDA official opinion.'}
              </p>
            </div>
          </div>

          {/* Required Forms */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <FileTextIcon className="w-6 h-6 text-[#339999]" />
              {isZh ? '4. 所需表格与下载' : '4. Required Forms & Downloads'}
            </h2>
            <div className="space-y-4">
              {guideData.forms.map((form, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {isZh ? form.nameZh : form.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {isZh ? form.descriptionZh : form.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {form.downloadUrl && (
                      <a
                        href={form.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#339999] text-white text-sm rounded-lg hover:bg-[#2a7a7a] transition-colors"
                      >
                        <DownloadIcon className="w-4 h-4" />
                        {isZh ? '下载表格' : 'Download Form'}
                      </a>
                    )}
                    {form.onlineUrl && (
                      <a
                        href={form.onlineUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        {isZh ? '在线填写' : 'Fill Online'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <PhoneIcon className="w-6 h-6 text-[#339999]" />
              {isZh ? '5. 联系方式' : '5. Contact Information'}
            </h2>
            <div className="space-y-4">
              {guideData.contacts.map((contact, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {isZh ? contact.nameZh : contact.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {isZh ? contact.descriptionZh : contact.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
                      >
                        <MailIcon className="w-4 h-4" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <PhoneIcon className="w-4 h-4" />
                        {contact.phone}
                      </span>
                    )}
                    {contact.website && (
                      <a
                        href={contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800"
                      >
                        <GlobeIcon className="w-4 h-4" />
                        {isZh ? '官方网站' : 'Website'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submission Methods */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '6. 提交方式' : '6. How to Submit'}
            </h2>
            <div className="space-y-4">
              {guideData.submissionMethods.map((method, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <h3 className="font-semibold text-slate-900 mb-1">
                    {isZh ? method.methodZh : method.method}
                  </h3>
                  <p className="text-sm text-slate-600 mb-3">
                    {isZh ? method.descriptionZh : method.description}
                  </p>
                  {method.url && (
                    <a
                      href={method.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      {method.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tips & Best Practices */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <LightbulbIcon className="w-6 h-6 text-amber-500" />
              {isZh ? '7. 提示与最佳实践' : '7. Tips & Best Practices'}
            </h2>
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <ul className="space-y-2">
                {(isZh ? guideData.tipsZh : guideData.tips).map((tip, index) => (
                  <li key={index} className="text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Official Resources */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '8. 官方资源链接' : '8. Official Resources'}
            </h2>
            <div className="space-y-3">
              {guideData.officialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors group"
                >
                  <ExternalLinkIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-900 group-hover:text-blue-800">
                      {isZh ? link.nameZh : link.name}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                      {isZh ? link.descriptionZh : link.description}
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Predicate Device Selection */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '9. 对比设备选择' : '9. Predicate Device Selection'}
            </h2>
            <p className="text-slate-700 mb-4">
              {isZh 
                ? '选择正确的对比设备是510(k)成功的关键。对比设备必须是在美国合法上市的设备，且与您的设备具有相同的预期用途。'
                : 'Selecting the right predicate device is critical for 510(k) success. The predicate must be legally marketed in the US and have the same intended use as your device.'}
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-900">
                {isZh ? '选择标准：' : 'Selection Criteria:'}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>{isZh ? '在美国合法上市（有510(k)许可号）' : 'Legally marketed in the US (has 510(k) number)'}</li>
                <li>{isZh ? '相同的预期用途（Indications for Use）' : 'Same intended use (Indications for Use)'}</li>
                <li>{isZh ? '相似的技术特征' : 'Similar technological characteristics'}</li>
                <li>{isZh ? '无未解决的安全问题' : 'No unresolved safety issues'}</li>
              </ul>
            </div>
          </div>

          {/* Submission Process */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '10. 提交流程' : '10. Submission Process'}
            </h2>
            <ol className="list-decimal pl-6 space-y-3 text-slate-700">
              <li>
                <strong>{isZh ? '准备510(k)文件' : 'Prepare 510(k) Documentation'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? '包括设备描述、对比分析、性能测试、生物相容性数据等。'
                    : 'Include device description, comparison analysis, performance testing, biocompatibility data, etc.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '支付用户费用' : 'Pay User Fee'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? '通过FDA用户费用系统支付510(k)审查费用。'
                    : 'Pay the 510(k) review fee through the FDA User Fee system.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '通过eSubmitter提交' : 'Submit via eSubmitter'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? '使用FDA电子提交网关(eSG)提交您的510(k)。'
                    : 'Submit your 510(k) using the FDA Electronic Submission Gateway (eSG).'}
                </p>
              </li>
              <li>
                <strong>{isZh ? 'FDA接受审查' : 'FDA Acceptance Review'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? 'FDA将在15天内进行接受审查，确认提交完整性。'
                    : 'FDA conducts acceptance review within 15 days to confirm submission completeness.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '实质审查' : 'Substantive Review'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? 'FDA进行实质审查，可能发出补充信息(AI)请求。'
                    : 'FDA conducts substantive review and may issue Additional Information (AI) requests.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '获得许可' : 'Receive Clearance'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh 
                    ? '审查通过后，FDA发出510(k)许可函，分配K号码。'
                    : 'Upon clearance, FDA issues 510(k) clearance letter with assigned K number.'}
                </p>
              </li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  );
}
