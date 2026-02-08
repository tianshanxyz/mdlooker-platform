'use client';

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
      name: 'EUDAMED Actor Registration Form',
      nameZh: 'EUDAMED参与者注册表',
      downloadUrl: 'https://ec.europa.eu/tools/eudamed/',
      description: 'Registration form for obtaining Single Registration Number (SRN)',
      descriptionZh: '获取单一注册号(SRN)的注册表'
    },
    {
      name: 'MDR Technical Documentation Checklist',
      nameZh: 'MDR技术文档清单',
      downloadUrl: 'https://health.ec.europa.eu/system/files/2021-09/md_mdr_guidance_techdoc_en_0.pdf',
      description: 'EU MDR technical documentation guidance',
      descriptionZh: '欧盟MDR技术文档指南'
    },
    {
      name: 'Clinical Evaluation Report Template',
      nameZh: '临床评价报告模板',
      downloadUrl: 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-clinical-evaluation-medical-devices_en.pdf',
      description: 'MEDDEV 2.7/1 rev 4 clinical evaluation guidance',
      descriptionZh: 'MEDDEV 2.7/1 rev 4临床评价指南'
    },
    {
      name: 'SSCP Template (Class III/Implantable)',
      nameZh: 'SSCP模板（三类/植入类）',
      downloadUrl: 'https://ec.europa.eu/health/system/files/2022-02/md_sscp_template_en.pdf',
      description: 'Summary of Safety and Clinical Performance template',
      descriptionZh: '安全和临床性能总结模板'
    }
  ],
  contacts: [
    {
      name: 'European Commission - Medical Devices',
      nameZh: '欧盟委员会 - 医疗器械',
      email: 'SANTE-MEDICAL-DEVICES@ec.europa.eu',
      website: 'https://health.ec.europa.eu/medical-devices-sector_en',
      description: 'General inquiries about EU MDR and IVDR regulations',
      descriptionZh: '欧盟MDR和IVDR法规的一般咨询'
    },
    {
      name: 'EUDAMED Support',
      nameZh: 'EUDAMED支持',
      email: 'EUDAMED-SUPPORT@ec.europa.eu',
      website: 'https://ec.europa.eu/tools/eudamed/',
      description: 'Technical support for EUDAMED registration and use',
      descriptionZh: 'EUDAMED注册和使用的技术支持'
    },
    {
      name: 'EU Member State Competent Authorities',
      nameZh: '欧盟成员国主管当局',
      website: 'https://ec.europa.eu/growth/sectors/medical-devices/contacts_en',
      description: 'Contact information for national competent authorities',
      descriptionZh: '国家主管当局的联系信息'
    }
  ],
  submissionMethods: [
    {
      method: 'EUDAMED Portal',
      methodZh: 'EUDAMED门户',
      url: 'https://ec.europa.eu/tools/eudamed/',
      description: 'Official European database for medical device registration',
      descriptionZh: '医疗器械注册的官方欧洲数据库'
    },
    {
      method: 'Notified Body Submission',
      methodZh: '公告机构提交',
      description: 'Submit conformity assessment application to selected Notified Body',
      descriptionZh: '向选定的公告机构提交符合性评估申请'
    }
  ],
  tips: [
    'Appoint an Authorized Representative (AR) if your company is outside the EU',
    'Register in EUDAMED as early as possible to obtain your SRN',
    'Ensure your QMS is fully compliant with ISO 13485:2016 and MDR Article 10',
    'Plan for sufficient clinical evidence - MDR requires more than MDD',
    'Consider the transition timelines carefully - MDR fully applicable since May 2021',
    'Maintain Post-Market Surveillance (PMS) and Post-Market Clinical Follow-up (PMCF) systems'
  ],
  tipsZh: [
    '如果您的公司在欧盟以外，请指定授权代表(AR)',
    '尽早注册EUDAMED以获取您的SRN',
    '确保您的质量管理体系完全符合ISO 13485:2016和MDR第10条',
    '准备充分的临床证据 - MDR比MDD要求更多',
    '仔细考虑过渡时间表 - MDR自2021年5月起完全适用',
    '维护上市后监督(PMS)和上市后临床跟踪(PMCF)系统'
  ],
  officialLinks: [
    {
      name: 'EUDAMED Portal',
      nameZh: 'EUDAMED门户',
      url: 'https://ec.europa.eu/tools/eudamed/',
      description: 'European Database on Medical Devices',
      descriptionZh: '欧洲医疗器械数据库'
    },
    {
      name: 'EU MDR Regulations (2017/745)',
      nameZh: '欧盟MDR法规(2017/745)',
      url: 'https://eur-lex.europa.eu/eli/reg/2017/745',
      description: 'Official text of Medical Device Regulation',
      descriptionZh: '医疗器械法规官方文本'
    },
    {
      name: 'NANDO Database',
      nameZh: 'NANDO数据库',
      url: 'https://ec.europa.eu/growth/tools-databases/nando/',
      description: 'Notified Bodies and designated organizations database',
      descriptionZh: '公告机构和指定组织数据库'
    },
    {
      name: 'MDCG Guidance Documents',
      nameZh: 'MDCG指南文件',
      url: 'https://health.ec.europa.eu/medical-devices-sector/new-regulations/guidance-mdcg-endorsed-documents-and-other-guidance_en',
      description: 'Medical Device Coordination Group endorsed documents',
      descriptionZh: '医疗器械协调组认可的文件'
    }
  ],
  notifiedBodies: [
    { name: 'BSI Group', numbers: '0086, 2797', countries: 'UK, Netherlands' },
    { name: 'TÜV SÜD Product Service', numbers: '0123', countries: 'Germany' },
    { name: 'DEKRA Testing and Certification', numbers: '0124', countries: 'Netherlands' },
    { name: 'SGS Belgium', numbers: '1639', countries: 'Belgium' },
    { name: 'DNV Product Assurance', numbers: '2460', countries: 'Norway' },
    { name: 'Intertek Semko', numbers: '0413', countries: 'Sweden' }
  ]
};

export default function EUDAMEDRegistrationGuide({
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
          {isZh ? 'EUDAMED 和欧盟 MDR 指南 2024' : 'EUDAMED & EU MDR Guide 2024'}
        </h1>
        <p className="text-slate-600 mb-8">
          {isZh 
            ? '欧盟MDR合规和EUDAMED注册综合指南，包含表格下载、公告机构信息和官方资源。'
            : 'Comprehensive guide to EU MDR compliance and EUDAMED registration, including forms, Notified Bodies, and official resources.'}
        </p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>{isZh ? '免责声明：' : 'Disclaimer:'}</strong>
            {isZh 
              ? '基于欧盟MDR 2017/745和IVDR 2017/746。请在ec.europa.eu核实最新要求。'
              : ' Based on EU MDR 2017/745 and IVDR 2017/746. Verify at ec.europa.eu.'}
          </p>
        </div>

        <section className="space-y-12">
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '1. EUDAMED 概述' : '1. EUDAMED Overview'}
            </h2>
            <p className="text-slate-700 mb-4">
              {isZh 
                ? 'EUDAMED（欧洲医疗器械数据库）是欧盟委员会开发的IT系统，用于实施医疗器械法规(EU) 2017/745和体外诊断医疗器械法规(EU) 2017/746。'
                : 'EUDAMED (European Database on Medical Devices) is the IT system developed by the European Commission to implement Regulation (EU) 2017/745 on medical devices and Regulation (EU) 2017/746 on in vitro diagnostic medical devices.'}
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-900">
                {isZh ? 'EUDAMED模块：' : 'EUDAMED Modules:'}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li>{isZh ? '参与者注册（SRN - 单一注册号）' : 'Actor registration (SRN - Single Registration Number)'}</li>
                <li>{isZh ? 'UDI/器械注册' : 'UDI/Devices registration'}</li>
                <li>{isZh ? '公告机构和证书' : 'Notified Bodies and Certificates'}</li>
                <li>{isZh ? '临床调查和性能研究' : 'Clinical Investigations and Performance Studies'}</li>
                <li>{isZh ? '警戒和上市后监督' : 'Vigilance and Post-Market Surveillance'}</li>
                <li>{isZh ? '市场监督' : 'Market Surveillance'}</li>
              </ul>
            </div>
          </div>

          {/* Device Classification */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '2. EU MDR 设备分类' : '2. EU MDR Device Classification'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '分类' : 'Class'}</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '风险等级' : 'Risk Level'}</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '示例' : 'Examples'}</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '符合性路径' : 'Conformity Route'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? 'I类' : 'Class I'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '低' : 'Low'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '轮椅、眼镜' : 'Wheelchairs, glasses'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '自我声明' : 'Self-declaration'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? 'IIa类' : 'Class IIa'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '中等' : 'Medium'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '助听器、超声' : 'Hearing aids, ultrasound'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '公告机构' : 'Notified Body'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? 'IIb类' : 'Class IIb'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '中高' : 'Medium-High'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '输液泵、X光' : 'Infusion pumps, X-ray'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '公告机构' : 'Notified Body'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? 'III类' : 'Class III'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '高' : 'High'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '起搏器、支架' : 'Pacemakers, stents'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '公告机构+临床' : 'Notified Body + Clinical'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Timeline & Costs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '3. 时间线与费用（2024）' : '3. Timeline & Costs (2024)'}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-900">
                  {isZh ? '典型时间线：' : 'Typical Timeline:'}
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{isZh ? 'I类：1-3个月（自我声明）' : 'Class I: 1-3 months (self-declaration)'}</li>
                  <li>{isZh ? 'IIa类：6-12个月' : 'Class IIa: 6-12 months'}</li>
                  <li>{isZh ? 'IIb类：9-15个月' : 'Class IIb: 9-15 months'}</li>
                  <li>{isZh ? 'III类：12-24个月' : 'Class III: 12-24 months'}</li>
                </ul>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-slate-900">
                  {isZh ? '预估费用：' : 'Estimated Costs:'}
                </h3>
                <ul className="list-disc pl-6 space-y-1 text-slate-700">
                  <li>{isZh ? '公告机构审核：€15,000 - €50,000' : 'Notified Body Audit: €15,000 - €50,000'}</li>
                  <li>{isZh ? '技术文档：€20,000 - €100,000+' : 'Technical Documentation: €20,000 - €100,000+'}</li>
                  <li>{isZh ? '临床评价：€10,000 - €50,000+' : 'Clinical Evaluation: €10,000 - €50,000+'}</li>
                  <li>{isZh ? '年度监督：€5,000 - €15,000' : 'Annual Surveillance: €5,000 - €15,000'}</li>
                </ul>
              </div>
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
                  {form.downloadUrl && (
                    <a
                      href={form.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#339999] text-white text-sm rounded-lg hover:bg-[#2a7a7a] transition-colors"
                    >
                      <DownloadIcon className="w-4 h-4" />
                      {isZh ? '下载' : 'Download'}
                    </a>
                  )}
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

          {/* Notified Bodies */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '6. 主要公告机构' : '6. Major Notified Bodies'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '机构名称' : 'Organization'}</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '公告机构号' : 'NB Numbers'}</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">{isZh ? '国家' : 'Countries'}</th>
                  </tr>
                </thead>
                <tbody>
                  {guideData.notifiedBodies.map((nb, index) => (
                    <tr key={index}>
                      <td className="border border-slate-300 px-4 py-2">{nb.name}</td>
                      <td className="border border-slate-300 px-4 py-2">{nb.numbers}</td>
                      <td className="border border-slate-300 px-4 py-2">{nb.countries}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Process */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '7. 注册流程' : '7. Registration Process'}
            </h2>
            <ol className="list-decimal pl-6 space-y-3 text-slate-700">
              <li>
                <strong>{isZh ? '指定授权代表(AR)' : 'Appoint Authorized Representative (AR)'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '非欧盟制造商必须在欧盟境内指定授权代表。' : 'Non-EU manufacturers must appoint an AR within the EU.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '在EUDAMED注册为参与者' : 'Register as Actor in EUDAMED'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '获取SRN（单一注册号）。' : 'Obtain SRN (Single Registration Number).'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '设备分类' : 'Classify Device'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '根据MDR附件VIII确定设备分类。' : 'Determine class according to Annex VIII of MDR.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '选择公告机构' : 'Select Notified Body'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '适用于IIa、IIb、III类设备。' : 'For Class IIa, IIb, III devices.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '准备技术文档' : 'Technical Documentation'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '按照附件II和III准备。' : 'Prepare according to Annexes II & III.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '实施质量管理体系' : 'Quality Management System'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '实施ISO 13485。' : 'Implement ISO 13485.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? '临床评价' : 'Clinical Evaluation'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '按照MEDDEV 2.7/1 rev 4准备CER。' : 'CER according to MEDDEV 2.7/1 rev 4.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? 'UDI分配' : 'UDI Assignment'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '在EUDAMED UDI模块注册设备。' : 'Register device in EUDAMED UDI module.'}
                </p>
              </li>
              <li>
                <strong>{isZh ? 'CE标志' : 'CE Marking'}</strong>
                <p className="text-sm text-slate-600 mt-1">
                  {isZh ? '加贴带公告机构号的CE标志。' : 'Affix CE mark with Notified Body number.'}
                </p>
              </li>
            </ol>
          </div>

          {/* Tips & Best Practices */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900 flex items-center gap-2">
              <LightbulbIcon className="w-6 h-6 text-amber-500" />
              {isZh ? '8. 提示与最佳实践' : '8. Tips & Best Practices'}
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
              {isZh ? '9. 官方资源链接' : '9. Official Resources'}
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
        </section>
      </div>
    </div>
  );
}
