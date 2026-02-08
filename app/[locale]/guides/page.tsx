import Link from 'next/link';
import { locales, type Locale } from '../../i18n-config';

export default async function GuidesPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params;
  const locale = locales.includes(localeParam as Locale) ? localeParam as Locale : 'en';

  const guides = [
    {
      id: 'fda-510k-export',
      title: locale === 'en' ? 'FDA 510(k) Export Guide 2024' : 'FDA 510(k) 出口指南 2024',
      description: locale === 'en' 
        ? 'Complete roadmap for exporting Class II medical devices to USA. Covers device classification, predicate selection, submission process, required forms, and official contacts.' 
        : '出口二类医疗器械到美国的完整路线图。涵盖设备分类、对比设备选择、提交流程、所需表格和官方联系方式。',
      features: locale === 'en' 
        ? ['Downloadable Forms', 'FDA Contacts', 'Submission Guide', 'Fee Calculator']
        : ['可下载表格', 'FDA联系方式', '提交指南', '费用计算器'],
      region: 'USA',
      color: 'blue'
    },
    {
      id: 'nmpa-registration',
      title: locale === 'en' ? 'NMPA Registration Guide 2024' : 'NMPA 注册指南 2024',
      description: locale === 'en'
        ? 'Navigate China\'s NMPA registration process. Includes classification, required documents, CMDE contacts, timeline and costs for domestic and imported devices.'
        : 'navigate 中国NMPA注册流程。包括分类、所需文件、CMDE联系方式、境内和进口设备的时间表和费用。',
      features: locale === 'en'
        ? ['Registration Forms', 'CMDE Contacts', 'Fee Schedule', 'Classification Guide']
        : ['注册表格', 'CMDE联系方式', '费用表', '分类指南'],
      region: 'China',
      color: 'green'
    },
    {
      id: 'eudamed-registration',
      title: locale === 'en' ? 'EUDAMED & EU MDR Guide 2024' : 'EUDAMED 和欧盟MDR指南 2024',
      description: locale === 'en'
        ? 'Comprehensive guide to EU MDR compliance and EUDAMED registration. Covers device classification, notified bodies list, CE marking, and official EU resources.'
        : 'EU MDR合规和EUDAMED注册综合指南。涵盖设备分类、公告机构列表、CE标志和官方欧盟资源。',
      features: locale === 'en'
        ? ['EUDAMED Portal', 'Notified Bodies', 'CE Marking Guide', 'MDR Templates']
        : ['EUDAMED门户', '公告机构', 'CE标志指南', 'MDR模板'],
      region: 'European Union',
      color: 'purple'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {locale === 'en' ? 'Regulatory Guides' : '合规指南'}
        </h1>
        <p className="text-slate-600 mb-8">
          {locale === 'en' 
            ? 'Comprehensive guides to medical device registration and compliance across major markets. Each guide includes downloadable forms, official contacts, submission instructions, and practical tips.' 
            : '主要市场医疗器械注册和合规的综合指南。每个指南都包含可下载表格、官方联系方式、提交说明和实用提示。'}
        </p>
        
        <div className="space-y-6">
          {guides.map((guide) => (
            <article key={guide.id} className="bg-white p-8 rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                    guide.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                    guide.color === 'green' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {guide.region}
                  </span>
                  <h2 className="text-2xl font-semibold text-slate-900">{guide.title}</h2>
                </div>
              </div>
              <p className="text-slate-600 mb-4">
                {guide.description}
              </p>
              
              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-6">
                {guide.features.map((feature, index) => (
                  <span 
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    {feature}
                  </span>
                ))}
              </div>
              
              <Link 
                href={`/${locale}/guides/${guide.id}`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                {locale === 'en' ? 'Read Full Guide' : '阅读完整指南'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
          <p className="text-amber-800 text-sm">
            <strong>{locale === 'en' ? 'Disclaimer:' : '免责声明：'}</strong>
            {locale === 'en' 
              ? ' All guides are based on publicly available regulatory information as of 2024. Always verify current requirements with official regulatory bodies before making compliance decisions.'
              : ' 所有指南均基于截至2024年公开的监管信息。在做出合规决策之前，请务必与官方监管机构核实当前要求。'}
          </p>
        </div>
      </div>
    </div>
  );
}
