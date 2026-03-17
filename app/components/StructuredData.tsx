'use client';

import React from 'react';

// Schema.org 类型定义
export interface OrganizationSchema {
  '@context': string;
  '@type': string;
  name: string;
  alternateName?: string;
  url: string;
  logo?: string;
  description?: string;
  foundingDate?: string;
  address?: {
    '@type': string;
    addressLocality?: string;
    addressCountry?: string;
  };
  contactPoint?: Array<{
    '@type': string;
    contactType: string;
    availableLanguage?: string[];
  }>;
  sameAs?: string[];
}

export interface SoftwareApplicationSchema {
  '@context': string;
  '@type': string;
  name: string;
  alternateName?: string;
  url: string;
  description: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    '@type': string;
    price: string;
    priceCurrency: string;
    availability: string;
  };
  aggregateRating?: {
    '@type': string;
    ratingValue: string;
    ratingCount: number;
    bestRating: string;
    worstRating: string;
  };
  featureList?: string[];
  screenshot?: string;
  downloadUrl?: string;
}

export interface WebSiteSchema {
  '@context': string;
  '@type': string;
  name: string;
  alternateName?: string;
  url: string;
  description?: string;
  publisher?: {
    '@type': string;
    name: string;
    url: string;
  };
  potentialAction?: {
    '@type': string;
    target: string;
    'query-input': string;
  };
  inLanguage?: string[];
}

interface StructuredDataProps {
  type: 'Organization' | 'SoftwareApplication' | 'WebSite' | 'FAQPage' | 'Product';
  data: Record<string, any>;
}

/**
 * 结构化数据组件
 * 用于在页面中插入 JSON-LD 格式的 Schema.org 结构化数据
 */
export const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};

export default StructuredData;
