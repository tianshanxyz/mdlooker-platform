// 硬编码翻译对象（Turbopack静态分析通过）
export const translations = {
  en: {
    hero: {
      title: "Global Medical Device Compliance Intelligence",
      subtitle: "Your Strategic Partner for Market Access - Navigate FDA, NMPA, EUDAMED & Global Regulations",
      placeholder: "Search companies, products or UDI..."
    },
    nav: { home: "Home", guides: "Guides" }
  },
  zh: {
    hero: {
      title: "全球医疗器械合规信息平台",
      subtitle: "您市场准入的战略合作伙伴 - 一站式导航FDA、NMPA、EUDAMED及全球法规",
      placeholder: "搜索企业、产品或UDI..."
    },
    nav: { home: "首页", guides: "合规指南" }
  }
} as const;

export const locales = Object.keys(translations) as Array<keyof typeof translations>;
export const defaultLocale = 'en';
export type Locale = keyof typeof translations;
