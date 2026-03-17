'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import SEO from '../../components/SEO';
import { StructuredData } from '../../components/StructuredData';
import { generateFAQPageSchema } from '../../lib/faq-generator';
import { faqData } from '../../lib/schema-config';
import { ChevronDown, HelpCircle, Search } from 'lucide-react';

export default function FAQPage() {
  const params = useParams();
  const [locale, setLocale] = useState(params.locale as string || 'zh');
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isZh = locale === 'zh';

  // 过滤 FAQ
  const filteredFAQs = faqData.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const t = {
    title: isZh ? '常见问题 - FAQ' : 'FAQ - Frequently Asked Questions',
    subtitle: isZh 
      ? '查找关于 MDLooker 平台、数据、功能的常见问题解答' 
      : 'Find answers to common questions about MDLooker platform, data, and features',
    searchPlaceholder: isZh ? '搜索问题...' : 'Search questions...',
    noResults: isZh ? '未找到相关问题' : 'No questions found',
    backToHome: isZh ? '返回首页' : 'Back to Home',
    contactSupport: isZh ? '联系客服' : 'Contact Support',
    stillNeedHelp: isZh ? '仍然需要帮助？' : 'Still need help?',
  };

  return (
    <>
      <SEO 
        page=""
        locale={locale}
        customConfig={{
          title: isZh ? '常见问题 - FAQ - MDLooker' : 'FAQ - Frequently Asked Questions - MDLooker',
          description: isZh 
            ? '查找关于 MDLooker 平台、数据来源、功能使用、VIP 订阅等常见问题的详细解答。'
            : 'Find detailed answers to common questions about MDLooker platform, data sources, features, VIP subscription, and more.',
          keywords: '常见问题，FAQ，MDLooker 使用，VIP 订阅，数据导出',
        }}
      />
      
      {/* FAQ Schema */}
      <StructuredData
        type="FAQPage"
        data={generateFAQPageSchema(faqData)}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-16">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-10 h-10" />
              <h1 className="text-4xl font-bold">{t.title}</h1>
            </div>
            <p className="text-xl text-white/90">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Search */}
          <div className="mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#339999] focus:border-transparent shadow-lg"
              />
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => {
                const originalIndex = faqData.indexOf(faq);
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleFAQ(originalIndex)}
                      className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-lg font-semibold text-slate-900 text-left pr-4">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-6 h-6 text-slate-400 transition-transform flex-shrink-0 ${
                          expandedIndex === originalIndex ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {expandedIndex === originalIndex && (
                      <div className="px-6 pb-5">
                        <div className="pt-2 border-t border-slate-100">
                          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                            {faq.answer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-xl text-slate-500">{t.noResults}</p>
              </div>
            )}
          </div>

          {/* Contact Support */}
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              {t.stillNeedHelp}
            </h2>
            <p className="text-slate-600 mb-6">
              {isZh 
                ? '如果常见问题没有解答您的问题，我们的客服团队随时为您提供帮助。' 
                : 'If you cannot find the answer to your question, our support team is always ready to help.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
              >
                {t.backToHome}
              </Link>
              <a
                href="mailto:support@mdlooker.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                {t.contactSupport}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
