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
      name: 'Medical Device Registration Application Form',
      nameZh: '医疗器械注册申请表',
      downloadUrl: 'https://www.nmpa.gov.cn/xxgk/ggtg/qtggtg/20191018152301836.html',
      description: 'Primary application form for NMPA registration',
      descriptionZh: 'NMPA注册的主要申请表格'
    },
    {
      name: 'Product Technical Requirements Template',
      nameZh: '产品技术要求模板',
      downloadUrl: 'https://www.cmde.org.cn/flfg/zcwj/zcjd/20200110152400139.html',
      description: 'Technical requirements document template',
      descriptionZh: '技术要求文件模板'
    },
    {
      name: 'Clinical Evaluation Report Template',
      nameZh: '临床评价报告模板',
      downloadUrl: 'https://www.cmde.org.cn/flfg/zcwj/zcjd/20210915151800123.html',
      description: 'Clinical evaluation report format',
      descriptionZh: '临床评价报告格式'
    },
    {
      name: 'Quality Management System Certification',
      nameZh: '质量管理体系认证',
      description: 'ISO 13485 certificate or equivalent QMS documentation',
      descriptionZh: 'ISO 13485证书或等效质量管理体系文件'
    }
  ],
  contacts: [
    {
      name: 'NMPA Medical Device Registration Division',
      nameZh: 'NMPA医疗器械注册司',
      phone: '+86-10-8833-1888',
      website: 'https://www.nmpa.gov.cn/',
      description: 'General inquiries about medical device registration',
      descriptionZh: '医疗器械注册一般咨询'
    },
    {
      name: 'Center for Medical Device Evaluation (CMDE)',
      nameZh: '医疗器械技术审评中心（CMDE）',
      email: 'cmdenmpa@cmde.org.cn',
      phone: '+86-10-6695-0600',
      website: 'https://www.cmde.org.cn/',
      description: 'Technical evaluation and consultation for Class II and III devices',
      descriptionZh: '二类和三类设备的技术审评和咨询'
    },
    {
      name: 'NMPA Administrative Affairs Service Center',
      nameZh: 'NMPA行政事项受理服务和投诉举报中心',
      phone: '+86-10-8833-1888',
      website: 'https://www.nmpa.gov.cn/',
      description: 'Application submission and complaint handling',
      descriptionZh: '申请受理和投诉处理'
    }
  ],
  submissionMethods: [
    {
      method: 'Online Submission Portal (eRPS)',
      methodZh: '在线提交门户（eRPS）',
      url: 'https://www.nmpa.gov.cn/',
      description: 'Electronic submission system for NMPA applications',
      descriptionZh: 'NMPA申请的电子提交系统'
    },
    {
      method: 'CMDE Online Service',
      methodZh: 'CMDE在线服务',
      url: 'https://www.cmde.org.cn/',
      description: 'Technical evaluation center online services',
      descriptionZh: '技术审评中心在线服务'
    }
  ],
  tips: [
    'Ensure all documents are translated into Chinese by certified translators',
    'Prepare for on-site QMS audits for Class II and III devices',
    'Allow extra time for document review and potential corrections',
    'Consider hiring a local regulatory representative in China',
    'Maintain close communication with CMDE during technical review',
    'Keep track of NMPA regulatory updates and guidance documents'
  ],
  tipsZh: [
    '确保所有文件由认证翻译人员翻译成中文',
    '为二类和三类设备的现场质量管理体系审核做好准备',
    '预留额外时间用于文件审查和可能的修改',
    '考虑在中国聘请当地法规代表',
    '在技术审评期间与CMDE保持密切沟通',
    '关注NMPA法规更新和指南文件'
  ],
  officialLinks: [
    {
      name: 'NMPA Official Website',
      nameZh: 'NMPA官方网站',
      url: 'https://www.nmpa.gov.cn/',
      description: 'National Medical Products Administration official portal',
      descriptionZh: '国家药品监督管理局官方门户'
    },
    {
      name: 'CMDE Official Website',
      nameZh: 'CMDE官方网站',
      url: 'https://www.cmde.org.cn/',
      description: 'Center for Medical Device Evaluation technical guidance',
      descriptionZh: '医疗器械技术审评中心技术指南'
    },
    {
      name: 'NMPA Database Search',
      nameZh: 'NMPA数据库查询',
      url: 'https://www.nmpa.gov.cn/datasearch/search-info.html',
      description: 'Search for registered medical devices and companies',
      descriptionZh: '查询已注册医疗器械和企业'
    },
    {
      name: 'Medical Device Classification Catalog',
      nameZh: '医疗器械分类目录',
      url: 'https://www.nmpa.gov.cn/xxgk/ggtg/qtggtg/20170831085401806.html',
      description: 'Official device classification catalog',
      descriptionZh: '官方设备分类目录'
    }
  ]
};

export default function NMPARegistrationGuide({
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
          {isZh ? 'NMPA 注册指南 2024' : 'NMPA Registration Guide 2024'}
        </h1>
        <p className="text-slate-600 mb-8">
          {isZh 
            ? '中国NMPA医疗器械注册完整指南，包含表格下载、联系方式和官方资源。'
            : 'Complete guide to China NMPA medical device registration, including forms, contacts, and official resources.'}
        </p>
        
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8">
          <p className="text-amber-800 text-sm">
            <strong>{isZh ? '免责声明：' : 'Disclaimer:'}</strong>
            {isZh 
              ? '基于NMPA 2024年法规。请在nmpa.gov.cn核实最新要求。'
              : ' Based on NMPA regulations as of 2024. Verify at nmpa.gov.cn.'}
          </p>
        </div>

        <section className="space-y-12">
          {/* Overview */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '1. NMPA注册概述' : '1. NMPA Registration Overview'}
            </h2>
            <p className="text-slate-700 mb-4">
              {isZh 
                ? '国家药品监督管理局（NMPA）负责中国境内和进口医疗器械的注册管理。根据风险等级，医疗器械分为三类，不同类别有不同的注册要求。'
                : 'The National Medical Products Administration (NMPA) oversees medical device registration for both domestic and imported devices in China. Devices are classified into three categories based on risk level, with different registration requirements for each.'}
            </p>
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-slate-900">
                {isZh ? '设备分类：' : 'Device Classification:'}
              </h3>
              <ul className="list-disc pl-6 space-y-1 text-slate-700">
                <li><strong>{isZh ? '一类' : 'Class I'}:</strong> {isZh ? '低风险（如手术器械、绷带）- 备案制' : 'Low risk (e.g., surgical instruments, bandages) - Filing system'}</li>
                <li><strong>{isZh ? '二类' : 'Class II'}:</strong> {isZh ? '中等风险（如超声设备、监护仪）- 注册证' : 'Moderate risk (e.g., ultrasound devices, monitors) - Registration certificate'}</li>
                <li><strong>{isZh ? '三类' : 'Class III'}:</strong> {isZh ? '高风险（如起搏器、植入器械）- 注册证' : 'High risk (e.g., pacemakers, implants) - Registration certificate'}</li>
              </ul>
            </div>
          </div>

          {/* Timeline & Costs */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '2. 时间线与费用（2024）' : '2. Timeline & Costs (2024)'}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-100">
                    <th className="border border-slate-300 px-4 py-2 text-left">Class</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Timeline</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Application Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '一类' : 'Class I'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '1-2个月' : '1-2 months'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '¥0（仅需备案）' : '¥0 (filing only)'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '二类' : 'Class II'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '12-18个月' : '12-18 months'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '¥153,600' : '¥153,600 (~$21,000)'}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '三类' : 'Class III'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '18-24个月' : '18-24 months'}</td>
                    <td className="border border-slate-300 px-4 py-2">{isZh ? '¥204,800' : '¥204,800 (~$28,000)'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Registration Pathways */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '3. 注册路径' : '3. Registration Pathways'}
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg mb-2 text-slate-900">
                  {isZh ? '境内生产企业' : 'Domestic Manufacturers'}
                </h3>
                <p className="text-slate-700 text-sm">
                  {isZh 
                    ? '申请医疗器械注册证（境内），需具备医疗器械生产许可证。'
                    : 'Apply for Medical Device Registration Certificate (Domestic), requires Medical Device Manufacturing License.'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg mb-2 text-slate-900">
                  {isZh ? '进口医疗器械' : 'Imported Medical Devices'}
                </h3>
                <p className="text-slate-700 text-sm">
                  {isZh 
                    ? '申请进口医疗器械注册证，需指定中国境内代理人，并提供原产国上市证明。'
                    : 'Apply for Imported Medical Device Registration Certificate, requires appointed China agent and proof of marketing in country of origin.'}
                </p>
              </div>
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-semibold text-lg mb-2 text-slate-900">
                  {isZh ? '港澳台地区' : 'Hong Kong, Macau, Taiwan'}
                </h3>
                <p className="text-slate-700 text-sm">
                  {isZh 
                    ? '按照进口医疗器械管理，需申请进口医疗器械注册证。'
                    : 'Managed as imported medical devices, requires Imported Medical Device Registration Certificate.'}
                </p>
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
                      {isZh ? '下载表格' : 'Download Form'}
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

          {/* Required Documents */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '7. 所需文件' : '7. Required Documents'}
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg">
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>{isZh ? '营业执照和生产许可证' : 'Business license and manufacturing license'}</li>
                <li>{isZh ? '产品技术要求（中文）' : 'Product technical requirements (in Chinese)'}</li>
                <li>{isZh ? 'NMPA认可实验室的检测报告' : 'Testing reports from NMPA-accredited laboratories'}</li>
                <li>{isZh ? '临床评价报告(CER)或临床试验数据' : 'Clinical Evaluation Report (CER) or clinical trial data'}</li>
                <li>{isZh ? '风险管理报告(ISO 14971)' : 'Risk management report (ISO 14971)'}</li>
                <li>{isZh ? '质量管理体系证书(ISO 13485)' : 'Quality management system certificate (ISO 13485)'}</li>
                <li>{isZh ? '说明书和标签（中文）' : 'Instructions for use and labeling (in Chinese)'}</li>
                <li>{isZh ? '原产国上市证明（进口设备）' : 'Certificate of marketing in country of origin (imported devices)'}</li>
              </ul>
            </div>
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

          {/* Key Regulations */}
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-slate-900">
              {isZh ? '10. 核心法规' : '10. Key Regulations'}
            </h2>
            <div className="bg-slate-50 p-4 rounded-lg">
              <ul className="list-disc pl-6 space-y-2 text-slate-700">
                <li>{isZh ? '《医疗器械监督管理条例》（国务院令第739号）' : 'Regulations on Supervision and Administration of Medical Devices (State Council Order No. 739)'}</li>
                <li>{isZh ? '《医疗器械注册与备案管理办法》（NMPA令第47号）' : 'Measures for the Administration of Medical Device Registration (NMPA Order No. 47)'}</li>
                <li>{isZh ? 'GB/T 16886系列（医疗器械生物学评价）' : 'GB/T 16886 series (Biological evaluation of medical devices)'}</li>
                <li>{isZh ? 'YY/T 0316（医疗器械风险管理应用）' : 'YY/T 0316 (Risk management application to medical devices)'}</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
