'use client'

import { useState, useEffect } from 'react'
import { Search, BookOpen, MessageCircle, ChevronDown, ChevronUp, Send, CheckCircle, Mail, HelpCircle, FileText, Rocket, CreditCard, Database, Wrench, Shield, AlertCircle } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  tags: string[]
  isFeatured: boolean
  category: {
    id: string
    name: string
  }
}

interface Category {
  id: string
  name: string
  description: string
  icon: string
  faqCount: number
}

const iconMap: Record<string, React.ComponentType<any>> = {
  rocket: Rocket,
  'credit-card': CreditCard,
  database: Database,
  tool: Wrench,
  'help-circle': HelpCircle,
  shield: Shield,
}

export default function HelpCenterPage({ params }: { params: { locale: string } }) {
  const locale = params.locale
  const isZh = locale === 'zh'

  const [categories, setCategories] = useState<Category[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '', category: 'general' })
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  useEffect(() => {
    fetchData()
  }, [locale])

  useEffect(() => {
    if (searchQuery) {
      searchFaqs()
    } else {
      fetchFaqs()
    }
  }, [searchQuery, selectedCategory])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, faqRes] = await Promise.all([
        fetch(`/api/help-center/categories?locale=${locale}&include_faqs=true`),
        fetch(`/api/help-center?locale=${locale}&featured=true`)
      ])
      
      const catData = await catRes.json()
      const faqData = await faqRes.json()
      
      if (catData.success) setCategories(catData.data)
      if (faqData.success) setFaqs(faqData.data)
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchFaqs = async () => {
    try {
      const params = new URLSearchParams({ locale })
      if (selectedCategory) params.append('category', selectedCategory)
      
      const response = await fetch(`/api/help-center?${params}`)
      const result = await response.json()
      
      if (result.success) setFaqs(result.data)
    } catch (err) {
      console.error('Error fetching FAQs:', err)
    }
  }

  const searchFaqs = async () => {
    try {
      const response = await fetch(`/api/help-center?locale=${locale}&search=${encodeURIComponent(searchQuery)}`)
      const result = await response.json()
      
      if (result.success) setFaqs(result.data)
    } catch (err) {
      console.error('Error searching FAQs:', err)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setContactStatus('sending')
    
    try {
      const response = await fetch('/api/help-center', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'contact',
          ...contactForm
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        setContactStatus('success')
        setContactForm({ name: '', email: '', subject: '', message: '', category: 'general' })
      } else {
        setContactStatus('error')
      }
    } catch (err) {
      setContactStatus('error')
    }
  }

  const t = {
    title: isZh ? '帮助中心' : 'Help Center',
    subtitle: isZh ? '查找答案、浏览文档或联系我们' : 'Find answers, browse docs, or contact us',
    searchPlaceholder: isZh ? '搜索常见问题...' : 'Search frequently asked questions...',
    categories: isZh ? '问题分类' : 'Categories',
    allQuestions: isZh ? '全部问题' : 'All Questions',
    faqs: isZh ? '常见问题' : 'FAQs',
    featured: isZh ? '热门问题' : 'Featured',
    contact: isZh ? '联系我们' : 'Contact Us',
    contactSubtitle: isZh ? '有其他问题？请给我们留言' : 'Have other questions? Send us a message',
    name: isZh ? '您的姓名' : 'Your Name',
    email: isZh ? '电子邮箱' : 'Email',
    subject: isZh ? '主题' : 'Subject',
    message: isZh ? '留言内容' : 'Message',
    category: isZh ? '类别' : 'Category',
    send: isZh ? '发送消息' : 'Send Message',
    sending: isZh ? '发送中...' : 'Sending...',
    success: isZh ? '消息已发送！我们会尽快回复您。' : 'Message sent! We will get back to you soon.',
    categoriesList: {
      general: isZh ? '一般咨询' : 'General',
      technical: isZh ? '技术支持' : 'Technical',
      billing: isZh ? '计费问题' : 'Billing',
      partnership: isZh ? '商务合作' : 'Partnership',
      other: isZh ? '其他' : 'Other',
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{isZh ? '帮助中心' : 'Help Center'}</span>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">{t.title}</h1>
          <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">{t.subtitle}</p>
          
          {/* Search Box */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-12 pr-4 py-4 text-lg rounded-2xl border-0 shadow-lg focus:ring-4 focus:ring-white/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm sticky top-8">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">{t.categories}</h2>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center justify-between ${
                    !selectedCategory
                      ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <span>{t.allQuestions}</span>
                  <span className="text-sm opacity-75">{faqs.length}</span>
                </button>
                
                {categories.map((category) => {
                  const IconComponent = iconMap[category.icon] || HelpCircle
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full px-4 py-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="flex-1">{category.name}</span>
                      <span className="text-sm opacity-75">{category.faqCount}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Featured FAQs */}
            {!searchQuery && !selectedCategory && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#339999]" />
                  {t.featured}
                </h2>
                <div className="space-y-4">
                  {faqs.filter(f => f.isFeatured).slice(0, 3).map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <span className="font-medium text-slate-900">{faq.question}</span>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                          <p className="text-slate-600 whitespace-pre-wrap">{faq.answer}</p>
                          {faq.tags && faq.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {faq.tags.map((tag) => (
                                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All FAQs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-6">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name 
                  : t.allQuestions}
              </h2>
              
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#339999]"></div>
                </div>
              ) : faqs.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-500">
                    {isZh ? '未找到相关问题' : 'No questions found'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq) => (
                    <div
                      key={faq.id}
                      className="border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {faq.isFeatured && (
                            <span className="px-2 py-0.5 bg-gradient-to-r from-[#339999]/10 to-[#2a7a7a]/10 text-[#339999] text-xs font-medium rounded-full">
                              {isZh ? '热门' : 'Featured'}
                            </span>
                          )}
                          <span className="font-medium text-slate-900">{faq.question}</span>
                        </div>
                        {expandedFaq === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      {expandedFaq === faq.id && (
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                          <p className="text-slate-600 whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#339999]" />
                {t.contact}
              </h2>
              <p className="text-slate-500 mb-6">{t.contactSubtitle}</p>
              
              {contactStatus === 'success' ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <p className="text-green-700 font-medium">{t.success}</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999]"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.subject}</label>
                      <input
                        type="text"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">{t.category}</label>
                      <select
                        value={contactForm.category}
                        onChange={(e) => setContactForm({ ...contactForm, category: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999]"
                      >
                        <option value="general">{t.categoriesList.general}</option>
                        <option value="technical">{t.categoriesList.technical}</option>
                        <option value="billing">{t.categoriesList.billing}</option>
                        <option value="partnership">{t.categoriesList.partnership}</option>
                        <option value="other">{t.categoriesList.other}</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t.message}</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999]"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={contactStatus === 'sending'}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {contactStatus === 'sending' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        {t.sending}
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        {t.send}
                      </>
                    )}
                  </button>
                  
                  {contactStatus === 'error' && (
                    <p className="text-red-500 text-center text-sm">
                      {isZh ? '发送失败，请稍后重试' : 'Failed to send. Please try again later.'}
                    </p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
