/**
 * SEO 配置工具库
 * 纯工具函数，不包含 React 组件
 */

/**
 * SEO 配置接口
 */
export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  noFollow?: boolean;
}

/**
 * 生成 SEO Meta 标签（HTML 字符串）
 * 用于服务端渲染或静态生成
 */
export function generateSEO(config: SEOConfig): string {
  const {
    title,
    description,
    keywords,
    canonical,
    ogImage = '/og-image.png',
    ogType = 'website',
    twitterCard = 'summary_large_image',
    noIndex = false,
    noFollow = false,
  } = config;

  let meta = `
    <title>${title}</title>
    <meta name="description" content="${description}" />
  `;

  if (keywords) {
    meta += `\n    <meta name="keywords" content="${keywords}" />`;
  }

  // Robots
  if (noIndex || noFollow) {
    const robots = `${noIndex ? 'noindex' : 'index'},${noFollow ? 'nofollow' : 'follow'}`;
    meta += `\n    <meta name="robots" content="${robots}" />`;
  }

  // Canonical
  if (canonical) {
    meta += `\n    <link rel="canonical" href="${canonical}" />`;
  }

  // Open Graph
  meta += `
    <meta property="og:type" content="${ogType}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonical || ''}" />
  `;

  // Twitter Card
  meta += `
    <meta name="twitter:card" content="${twitterCard}" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
  `;

  return meta;
}

/**
 * 生成结构化数据（JSON-LD）
 * 返回 JSON 字符串，需要在组件中使用 dangerouslySetInnerHTML 插入
 */
export function generateStructuredData(
  type: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'FAQPage' | 'Product',
  data: Record<string, any>
): string {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return JSON.stringify(structuredData);
}

/**
 * 默认 SEO 配置
 */
export const defaultSEO: SEOConfig = {
  title: 'MDLooker - AI 驱动的医疗器械合规数据平台',
  description: '全球领先的医疗器械合规数据平台，提供企业合规档案、产品注册追踪、市场准入导航、监管机构查询等服务，覆盖 FDA、NMPA、EUDAMED、PMDA 等全球主要监管机构。',
  keywords: '医疗器械，合规数据，FDA 注册，NMPA 注册，EUDAMED，PMDA，市场准入，产品注册，企业档案，UDI 查询',
  ogImage: '/og-image.png',
  ogType: 'website',
  twitterCard: 'summary_large_image',
};

/**
 * 生成各页面的 SEO 配置
 */
export function getPageSEO(page: string, locale: string = 'zh', params?: Record<string, string>): SEOConfig {
  const baseUrl = 'https://mdlooker.com';
  const canonical = params 
    ? `${baseUrl}/${locale}/${page}/${Object.values(params).join('/')}`
    : `${baseUrl}/${locale}/${page}`;

  switch (page) {
    case '':
    case 'home':
      return {
        ...defaultSEO,
        title: locale === 'zh' 
          ? 'MDLooker - AI 驱动的医疗器械合规数据平台' 
          : 'MDLooker - AI-Powered Medical Device Compliance Intelligence',
        canonical: `${baseUrl}/${locale}`,
      };

    case 'compliance-profile':
      return {
        title: locale === 'zh'
          ? '全球合规档案查询 - MDLooker'
          : 'Global Compliance Profile Search - MDLooker',
        description: locale === 'zh'
          ? '通过企业、产品或 UDI 查询多个目标市场的注册、认证、监管状态，覆盖 FDA、NMPA、EUDAMED、PMDA 等全球主要监管机构。'
          : 'Search by company, product, or UDI to view registration status across multiple markets including FDA, NMPA, EUDAMED, PMDA.',
        keywords: '合规档案，企业注册，产品注册，FDA，NMPA，EUDAMED，PMDA',
        canonical,
      };

    case 'product-tracker':
      return {
        title: locale === 'zh'
          ? '产品注册追踪 - 全球医疗器械注册状态查询 - MDLooker'
          : 'Product Registration Tracker - Global Medical Device Status - MDLooker',
        description: locale === 'zh'
          ? '追踪医疗器械产品在全球各国的注册历史和现状，可视化展示注册时间线和注册证详情。'
          : 'Track medical device product registration history and status across countries with visual timeline and certificate details.',
        keywords: '产品追踪，注册状态，注册时间线，全球注册',
        canonical,
      };

    case 'regulators':
      return {
        title: locale === 'zh'
          ? '全球监管机构数据库 - MDLooker'
          : 'Global Regulatory Agencies Database - MDLooker',
        description: locale === 'zh'
          ? '查询全球 15+ 个国家的医疗器械监管机构信息，包括联系方式、官方网站和数据库入口。'
          : 'Search regulatory agencies information from 15+ countries including contact details, official websites and database access.',
        keywords: '监管机构，FDA，NMPA，PMDA，监管机构数据库',
        canonical,
      };

    case 'market-access':
      return {
        title: locale === 'zh'
          ? '市场准入导航 - 医疗器械各国注册要求 - MDLooker'
          : 'Market Access Navigation - Medical Device Registration Requirements - MDLooker',
        description: locale === 'zh'
          ? '了解各国医疗器械注册要求和准入路径，提供详细的注册流程、时间和成本分析。'
          : 'Understand medical device registration requirements and access pathways for different countries with detailed process, timeline and cost analysis.',
        keywords: '市场准入，注册要求，注册流程，准入路径',
        canonical,
      };

    case 'guides':
      return {
        title: locale === 'zh'
          ? '法规指南 - FDA、NMPA、EU MDR 注册指南 - MDLooker'
          : 'Regulatory Guides - FDA, NMPA, EU MDR Registration - MDLooker',
        description: locale === 'zh'
          ? '详细的 FDA、NMPA、EU MDR 等医疗器械注册指南，提供实操性建议和案例分析。'
          : 'Detailed guides for FDA, NMPA, EU MDR medical device registration with practical advice and case studies.',
        keywords: '注册指南，FDA 指南，NMPA 指南，EU MDR，注册流程',
        canonical,
      };

    case 'search':
      return {
        title: locale === 'zh'
          ? '统一搜索 - 企业、产品、监管机构 - MDLooker'
          : 'Unified Search - Companies, Products, Regulators - MDLooker',
        description: locale === 'zh'
          ? '一站式搜索医疗器械企业、产品和监管机构信息，支持高级筛选和智能推荐。'
          : 'One-stop search for medical device companies, products and regulatory agencies with advanced filters and smart suggestions.',
        keywords: '搜索，企业搜索，产品搜索，高级筛选',
        canonical,
      };

    case 'profile/dashboard':
      return {
        title: locale === 'zh'
          ? '个人中心 - MDLooker'
          : 'User Dashboard - MDLooker',
        description: locale === 'zh'
          ? '管理您的收藏、监控、搜索历史和下载记录。'
          : 'Manage your favorites, monitoring, search history and download records.',
        noIndex: true,
        noFollow: true,
        canonical,
      };

    case 'toolkit':
      return {
        title: locale === 'zh'
          ? '工具箱 - MDLooker'
          : 'Toolkit - MDLooker',
        description: locale === 'zh'
          ? 'MDLooker工具箱提供各种医疗器械合规数据查询工具，包括合规档案、产品追踪、监管机构查询等。'
          : 'MDLooker toolkit provides various medical device compliance data query tools.',
        keywords: locale === 'zh'
          ? '工具箱,合规查询,产品追踪,监管机构,市场准入,法规指南'
          : 'toolkit,compliance search,product tracker,regulators,market access,guides',
        canonical,
      };

    default:
      return {
        ...defaultSEO,
        canonical,
      };
  }
}
