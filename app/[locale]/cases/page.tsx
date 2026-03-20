'use client'

import { useState, useEffect } from 'react'
import { Building, Globe, Clock, TrendingUp, Users, CheckCircle, Package, FileText, Star, Quote, ThumbsUp, ArrowRight } from 'lucide-react'

interface Case {
  id: string
  companyName: string
  description: string
  challenge: string
  solution: string
  results: any
  targetCountries: string[]
  targetProducts: string[]
  timeline: string
  testimonial: string
  testimonialAuthor: string
  testimonialTitle: string
  logoUrl?: string
  isFeatured: boolean
}

export default function CasesPage({ params }: { params: { locale: string } }) {
  const locale = params.locale
  const isZh = locale === 'zh'

  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCases()
  }, [locale])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases?locale=${locale}&featured=true`)
      const result = await response.json()
      
      if (result.success) setCases(result.data)
    } catch (err) {
      console.error('Error fetching cases:', err)
    } finally {
      setLoading(false)
    }
  }

  const t = {
    title: isZh ? '客户案例' : 'Customer Cases',
    subtitle: isZh ? '真实成功案例，展示我们如何帮助企业拓展全球市场' : 'Real success stories showing how we help companies expand globally',
    challenge: isZh ? '挑战' : 'Challenge',
    solution: isZh ? '解决方案' : 'Solution',
    results: isZh ? '成果' : 'Results',
    timeline: isZh ? '用时' : 'Timeline',
    countries: isZh ? '目标国家' : 'Target Countries',
    products: isZh ? '目标产品' : 'Target Products',
    testimonial: isZh ? '客户评价' : 'Testimonial',
    viewAll: isZh ? '查看全部案例' : 'View All Cases',
    readMore: isZh ? '了解更多' : 'Read More',
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Building className="w-4 h-4" />
            <span className="text-sm font-medium">{isZh ? '成功案例' : 'Success Stories'}</span>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">{t.title}</h1>
          <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">{t.subtitle}</p>
        </div>
      </div>

      {/* Cases Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999]"></div>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">{isZh ? '暂无案例' : 'No cases available'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((caseData) => (
              <div key={caseData.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group">
                {/* Company Logo/Header */}
                <div className="h-20 bg-gradient-to-r from-[#339999]/10 to-[#2a7a7a]/10 flex items-center justify-center">
                  <Building className="w-10 h-10 text-[#339999]" />
                </div>

                <div className="p-6">
                  {/* Company Name */}
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#339999] transition-colors">
                    {caseData.companyName}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 mb-4 line-clamp-2">
                    {caseData.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {caseData.targetCountries?.slice(0, 2).map((country) => (
                      <span key={country} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {country}
                      </span>
                    ))}
                    {caseData.targetProducts?.slice(0, 1).map((product) => (
                      <span key={product} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {product}
                      </span>
                    ))}
                  </div>

                  {/* Results */}
                  {caseData.results && (
                    <div className="bg-gradient-to-r from-[#339999]/5 to-[#2a7a7a]/5 rounded-xl p-4 mb-4">
                      <h4 className="text-sm font-semibold text-slate-900 mb-2">{t.results}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(caseData.results).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#339999]" />
                            <span className="text-sm text-slate-700">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>{t.timeline}: {caseData.timeline}</span>
                  </div>

                  {/* Testimonial */}
                  {caseData.testimonial && (
                    <div className="border-t border-slate-100 pt-4">
                      <Quote className="w-5 h-5 text-[#339999] mb-2" />
                      <p className="text-sm text-slate-600 italic line-clamp-3 mb-2">
                        "{caseData.testimonial}"
                      </p>
                      <p className="text-sm font-medium text-slate-900">
                        {caseData.testimonialAuthor}
                      </p>
                      <p className="text-xs text-slate-500">
                        {caseData.testimonialTitle}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="px-8 py-3 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white font-medium rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all inline-flex items-center gap-2">
            {t.viewAll}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
