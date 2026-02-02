// 硬编码翻译对象（Turbopack静态分析通过）
export const translations = {
  en: {
    hero: {
      title: "Global Medical Device Compliance Intelligence",
      subtitle: "Aggregate FDA, NMPA, EUDAMED, customs data. Navigate compliance.",
      placeholder: "Search company, product or country..."
    },
    nav: { home: "Home", guides: "Guides" }
  },
  zh: {
    hero: {
      title: "全球医疗器械合规情报平台",
      subtitle: "聚合FDA、NMPA、EUDAMED及海关数据，透明化导航全球合规",
      placeholder: "搜索公司、产品或国家..."
    },
    nav: { home: "首页", guides: "合规指南" }
  }
} as const;

export const locales = Object.keys(translations) as Array<keyof typeof translations>;
export const defaultLocale = 'en';
export type Locale = keyof typeof translations;
