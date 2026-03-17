/**
 * MDLooker 默认 Schema 配置
 * 
 * 包含组织、网站、软件应用的完整结构化数据
 */

import { 
  OrganizationSchema, 
  SoftwareApplicationSchema, 
  WebSiteSchema 
} from '../components/StructuredData';

const baseUrl = 'https://mdlooker.com';

/**
 * 组织信息 Schema
 */
export const organizationSchema: OrganizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MDLooker',
  alternateName: '医疗器械合规数据平台',
  url: baseUrl,
  logo: `${baseUrl}/logo.png`,
  description: 'AI 驱动的医疗器械合规数据平台，提供企业合规档案、产品注册追踪、市场准入导航、监管机构查询等专业服务。',
  foundingDate: '2024',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Beijing',
    addressCountry: 'CN',
  },
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Chinese', 'English'],
    },
  ],
  sameAs: [
    'https://www.linkedin.com/company/mdlooker',
    'https://twitter.com/mdlooker',
    'https://github.com/mdlooker',
  ],
};

/**
 * 软件应用 Schema
 */
export const softwareApplicationSchema: SoftwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MDLooker Platform',
  alternateName: 'MDLooker 医疗器械合规平台',
  url: baseUrl,
  description: '全球领先的医疗器械合规数据平台，覆盖 FDA、NMPA、EUDAMED、PMDA 等全球主要监管机构，提供企业合规档案查询、产品注册追踪、市场准入导航等服务。',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: 156,
    bestRating: '5',
    worstRating: '1',
  },
  featureList: [
    '企业合规档案查询',
    '产品注册追踪',
    '全球监管机构数据库',
    '市场准入导航',
    '法规指南',
    '统一搜索中心',
    '数据导出功能',
    '用户个人中心',
  ],
  screenshot: `${baseUrl}/og-image.png`,
  downloadUrl: baseUrl,
};

/**
 * 网站 Schema
 */
export const webSiteSchema: WebSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'MDLooker',
  alternateName: '医疗器械合规数据平台',
  url: baseUrl,
  description: 'AI 驱动的医疗器械合规数据平台',
  publisher: {
    '@type': 'Organization',
    name: 'MDLooker',
    url: baseUrl,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: `${baseUrl}/search?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
  inLanguage: ['zh-CN', 'en-US'],
};

/**
 * 首页 WebPage Schema
 */
export const homePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'MDLooker - AI 驱动的医疗器械合规数据平台',
  description: '全球领先的医疗器械合规数据平台，提供企业合规档案、产品注册追踪、市场准入导航等服务。',
  url: baseUrl,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
    url: baseUrl,
  },
  primaryImageOfPage: {
    '@type': 'ImageObject',
    url: `${baseUrl}/og-image.png`,
  },
  inLanguage: 'zh-CN',
};

/**
 * 合规档案页 Schema
 */
export const complianceProfilePageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '全球合规档案查询 - MDLooker',
  description: '通过企业、产品或 UDI 查询多个目标市场的注册、认证、监管状态，覆盖 FDA、NMPA、EUDAMED、PMDA 等全球主要监管机构。',
  url: `${baseUrl}/compliance-profile`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
  },
  inLanguage: ['zh-CN', 'en-US'],
};

/**
 * 产品追踪页 Schema
 */
export const productTrackerPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '产品注册追踪 - MDLooker',
  description: '追踪医疗器械产品在全球各国的注册历史和现状，可视化展示注册时间线和注册证详情。',
  url: `${baseUrl}/product-tracker`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
  },
};

/**
 * 监管机构页 Schema
 */
export const regulatorsPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '全球监管机构数据库 - MDLooker',
  description: '查询全球 15+ 个国家的医疗器械监管机构信息，包括联系方式、官方网站和数据库入口。',
  url: `${baseUrl}/regulators`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
  },
};

/**
 * 市场准入页 Schema
 */
export const marketAccessPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '市场准入导航 - MDLooker',
  description: '了解各国医疗器械注册要求和准入路径，提供详细的注册流程、时间和成本分析。',
  url: `${baseUrl}/market-access`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
  },
};

/**
 * 法规指南页 Schema
 */
export const guidesPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: '法规指南 - MDLooker',
  description: '详细的 FDA、NMPA、EU MDR 等医疗器械注册指南，提供实操性建议和案例分析。',
  url: `${baseUrl}/guides`,
  isPartOf: {
    '@type': 'WebSite',
    name: 'MDLooker',
  },
};

/**
 * FAQ 数据（示例）
 */
export const faqData = [
  {
    question: 'MDLooker 是什么？',
    answer: 'MDLooker 是一个 AI 驱动的医疗器械合规数据平台，提供企业合规档案查询、产品注册追踪、市场准入导航、监管机构数据库等专业服务。平台覆盖 FDA（美国）、NMPA（中国）、EUDAMED（欧盟）、PMDA（日本）等全球主要监管机构的数据。',
  },
  {
    question: 'MDLooker 的数据来源是什么？',
    answer: 'MDLooker 的数据来自全球各国官方监管机构公开数据，包括 FDA、NMPA、EUDAMED、PMDA、Health Canada 等。我们通过自动化采集和人工审核确保数据的准确性和时效性。',
  },
  {
    question: '如何查询企业的合规档案？',
    answer: '在 MDLooker 首页或合规档案页面，输入企业名称或关键词进行搜索，即可查看该企业在全球各市场的注册信息、认证状态和历史记录。支持按国家、注册状态等条件筛选。',
  },
  {
    question: 'MDLooker 支持哪些国家的数据？',
    answer: 'MDLooker 目前支持 15+ 个主要国家和地区的医疗器械监管数据，包括：美国（FDA）、中国（NMPA）、欧盟（EUDAMED）、日本（PMDA）、加拿大（Health Canada）、澳大利亚（TGA）、韩国（MFDS）、新加坡（HSA）、巴西（ANVISA）、印度（CDSCO）等。',
  },
  {
    question: 'MDLooker 是免费的吗？',
    answer: 'MDLooker 提供基础免费服务和 VIP 付费服务。免费用户可以查询基本的企业信息和产品注册状态。VIP 用户可以访问完整数据、导出报告、使用高级筛选等功能。',
  },
  {
    question: '如何成为 VIP 用户？',
    answer: '在个人中心页面可以选择 VIP 订阅方案。我们提供月度、年度等多种订阅选项，满足不同用户需求。VIP 用户可以享受完整数据访问、无限次导出、优先客服支持等特权。',
  },
  {
    question: 'MDLooker 的数据更新频率是多少？',
    answer: 'MDLooker 的监管数据每日更新，确保用户获取最新的注册状态和法规动态。对于重要的法规变更，我们会实时推送通知。',
  },
  {
    question: '可以导出数据吗？',
    answer: '是的，MDLooker 支持 CSV 和 JSON 格式的数据导出。免费用户有导出次数限制，VIP 用户可以无限次导出。导出功能在搜索结果页、企业详情页、产品详情页等页面均可使用。',
  },
  {
    question: 'MDLooker 提供 API 接口吗？',
    answer: '是的，MDLooker 提供 RESTful API 接口，方便企业将我们的数据集成到内部系统。API 访问需要单独申请，请联系客服获取更多信息。',
  },
  {
    question: '如何联系 MDLooker 客服？',
    answer: '您可以通过以下方式联系我们：\n- 电子邮件：support@mdlooker.com\n- 在线客服：网站右下角的 AI 助手\n- 工作时间：周一至周五 9:00-18:00（北京时间）',
  },
];

/**
 * 面包屑导航数据生成器
 */
export function generateBreadcrumb(locale: string = 'zh', pagePath: string) {
  const items = [
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
  ];

  const pageNames: Record<string, string> = {
    'compliance-profile': locale === 'zh' ? '合规档案' : 'Compliance Profile',
    'product-tracker': locale === 'zh' ? '产品追踪' : 'Product Tracker',
    'regulators': locale === 'zh' ? '监管机构' : 'Regulators',
    'market-access': locale === 'zh' ? '市场准入' : 'Market Access',
    'guides': locale === 'zh' ? '法规指南' : 'Guides',
    'search': locale === 'zh' ? '搜索' : 'Search',
    'profile': locale === 'zh' ? '个人中心' : 'Profile',
    'dashboard': locale === 'zh' ? '仪表板' : 'Dashboard',
  };

  const pages = pagePath.split('/').filter(Boolean);
  pages.forEach((page, index) => {
    const name = pageNames[page] || page;
    const url = `/${locale}/${pages.slice(0, index + 1).join('/')}`;
    items.push({ name, url });
  });

  return items;
}

/**
 * 组合 Schema（用于首页）
 */
export const combinedHomeSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    softwareApplicationSchema,
    webSiteSchema,
    homePageSchema,
  ],
};
