'use client';

import { useEffect } from 'react';
import { SEOConfig, getPageSEO, defaultSEO } from '../lib/seo';
import { StructuredData } from './StructuredData';

// 存储创建的 meta 标签引用，便于清理
const createdMetaTags: Map<string, Element> = new Map();

interface SEOProps {
  page?: string;
  locale?: string;
  params?: Record<string, string>;
  customConfig?: Partial<SEOConfig>;
  structuredData?: {
    type: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'FAQPage' | 'Product';
    data: Record<string, any>;
  };
}

/**
 * SEO 组件 - 在页面中注入 Meta 标签和结构化数据
 */
export default function SEO({ 
  page = '', 
  locale = 'zh', 
  params, 
  customConfig,
  structuredData 
}: SEOProps) {
  useEffect(() => {
    // 获取 SEO 配置
    const baseConfig = page 
      ? getPageSEO(page, locale, params)
      : defaultSEO;
    
    const config = { ...baseConfig, ...customConfig };

    // 更新 document title
    document.title = config.title;

    // 更新或创建 meta 标签
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const selector = isProperty 
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;
      
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(isProperty ? 'property' : 'name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    // 基础 meta
    updateMeta('description', config.description);
    if (config.keywords) {
      updateMeta('keywords', config.keywords);
    }

    // Robots
    if (config.noIndex || config.noFollow) {
      const robots = `${config.noIndex ? 'noindex' : 'index'},${config.noFollow ? 'nofollow' : 'follow'}`;
      updateMeta('robots', robots);
    }

    // Canonical
    if (config.canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', config.canonical);
    }

    // Open Graph
    updateMeta('og:type', config.ogType || 'website', true);
    updateMeta('og:title', config.title, true);
    updateMeta('og:description', config.description, true);
    updateMeta('og:image', config.ogImage || '/og-image.png', true);
    if (config.canonical) {
      updateMeta('og:url', config.canonical, true);
    }

    // Twitter Card
    updateMeta('twitter:card', config.twitterCard || 'summary_large_image');
    updateMeta('twitter:title', config.title);
    updateMeta('twitter:description', config.description);
    updateMeta('twitter:image', config.ogImage || '/og-image.png');

    // 清理不需要的 meta（简单实现，生产环境可优化）
    // 可以在切换页面时清理过时的 meta 标签

  }, [page, locale, params, customConfig]);

  // 渲染结构化数据（如果需要）
  if (structuredData) {
    return <StructuredData type={structuredData.type} data={structuredData.data} />;
  }

  return null;
}
