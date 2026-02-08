'use client';

import Link from 'next/link';
import { Mail, MapPin, Phone, Github, Twitter, Linkedin, ExternalLink, Shield, Globe, FileText, BookOpen } from 'lucide-react';

interface FooterProps {
  locale: string;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export default function Footer({ locale }: FooterProps) {
  const isZh = locale === 'zh';

  const footerLinks: Record<string, FooterSection> = {
    product: {
      title: isZh ? '产品' : 'Product',
      links: [
        { label: isZh ? '合规档案' : 'Compliance Profile', href: `/${locale}/compliance-profile` },
        { label: isZh ? '准入导航' : 'Market Access', href: `/${locale}/market-access` },
        { label: isZh ? '指南' : 'Guides', href: `/${locale}/guides` },
        { label: isZh ? '搜索' : 'Search', href: `/${locale}` },
      ],
    },
    guides: {
      title: isZh ? '指南' : 'Guides',
      links: [
        { label: isZh ? 'FDA 510(k) 出口' : 'FDA 510(k) Export', href: `/${locale}/guides/fda-510k-export` },
        { label: isZh ? 'NMPA 注册' : 'NMPA Registration', href: `/${locale}/guides/nmpa-registration` },
        { label: isZh ? 'EUDAMED 注册' : 'EUDAMED Registration', href: `/${locale}/guides/eudamed-registration` },
      ],
    },
    resources: {
      title: isZh ? '资源' : 'Resources',
      links: [
        { label: isZh ? 'FDA 官网' : 'FDA Official', href: 'https://www.fda.gov', external: true },
        { label: isZh ? 'NMPA 官网' : 'NMPA Official', href: 'https://www.nmpa.gov.cn', external: true },
        { label: isZh ? 'EUDAMED' : 'EUDAMED', href: 'https://ec.europa.eu/tools/eudamed', external: true },
      ],
    },
    company: {
      title: isZh ? '公司' : 'Company',
      links: [
        { label: isZh ? '关于我们' : 'About Us', href: `/${locale}/about` },
        { label: isZh ? '联系我们' : 'Contact', href: `/${locale}/contact` },
        { label: isZh ? '隐私政策' : 'Privacy Policy', href: `/${locale}/privacy` },
        { label: isZh ? '使用条款' : 'Terms of Use', href: `/${locale}/terms` },
      ],
    },
  };

  return (
    <footer className="bg-slate-900 text-white">
      {/* 主要内容区域 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* 品牌区域 */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/logo.png" 
                alt="MDLooker" 
                className="w-12 h-12 rounded-lg object-contain"
              />
              <span className="text-2xl font-bold">MDLooker</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              {isZh 
                ? '全球医疗器械合规智能平台。提供企业合规档案查询、市场准入路径导航、法规指南等一站式解决方案。'
                : 'Global Medical Device Compliance Intelligence Platform. Providing enterprise compliance profiles, market access navigation, and regulatory guidance.'
              }
            </p>
            
            {/* 联系方式 */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Mail className="w-4 h-4 text-[#339999]" />
                <span>contact@mdlooker.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Globe className="w-4 h-4 text-[#339999]" />
                <span>www.mdlooker.com</span>
              </div>
            </div>
          </div>

          {/* 链接区域 */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                {key === 'product' && <Shield className="w-4 h-4 text-[#339999]" />}
                {key === 'guides' && <BookOpen className="w-4 h-4 text-[#339999]" />}
                {key === 'resources' && <FileText className="w-4 h-4 text-[#339999]" />}
                {key === 'company' && <MapPin className="w-4 h-4 text-[#339999]" />}
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-slate-400 hover:text-[#339999] transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-[#339999] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 分隔线 */}
      <div className="border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* 版权信息 */}
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} MDLooker. {isZh ? '保留所有权利。' : 'All rights reserved.'}
            </p>

            {/* 社交媒体 */}
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-[#339999] hover:text-white transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-[#339999] hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:bg-[#339999] hover:text-white transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>

            {/* 语言切换 */}
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/en"
                className={`px-3 py-1 rounded ${locale === 'en' ? 'bg-[#339999] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </Link>
              <Link
                href="/zh"
                className={`px-3 py-1 rounded ${locale === 'zh' ? 'bg-[#339999] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                中文
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
