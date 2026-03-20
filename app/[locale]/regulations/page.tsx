'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Shield, Globe, AlertCircle, Calendar, FileText, Sparkles } from 'lucide-react'

interface Regulation {
  id: string
  country: string
  country_name: string
  title: string
  title_zh: string
  summary: string
  summary_zh: string
  importance: string
  regulation_type: string
  effective_date: string
  published_date: string
  action_required: boolean
  source_organization: string
}

const translations = {
  zh: {
    title: '法规动态',
    subtitle: '实时追踪全球医疗器械法规变化，掌握最新政策动态',
    badge: '实时法规追踪',
    allCountries: '全部国家',
    allImportance: '全部级别',
    filter: '筛选',
    reset: '重置',
    readMore: '阅读更多',
    effectiveDate: '生效日期',
    publishedDate: '发布日期',
    source: '来源',
    noData: '暂无法规数据',
    noDataDesc: '暂无符合条件的法规更新',
    critical: '紧急',
    high: '重要',
    medium: '中等',
    low: '一般',
    subscribe: '订阅更新',
    subscribeDesc: '获取最新法规更新推送',
    subscribeNow: '立即订阅'
  },
  en: {
    title: 'Regulation Updates',
    subtitle: 'Real-time tracking of global medical device regulation changes',
    badge: 'Real-time Tracking',
    allCountries: 'All Countries',
    allImportance: 'All Levels',
    filter: 'Filter',
    reset: 'Reset',
    readMore: 'Read More',
    effectiveDate: 'Effective Date',
    publishedDate: 'Published Date',
    source: 'Source',
    noData: 'No Regulations',
    noDataDesc: 'No regulation updates found',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    subscribe: 'Subscribe',
    subscribeDesc: 'Get latest regulation updates',
    subscribeNow: 'Subscribe Now'
  }
}

const importanceColors = {
  critical: 'bg-red-100 text-red-700 border-red-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  low: 'bg-green-100 text-green-700 border-green-300'
}

const countryFlags: Record<string, string> = {
  'SG': '🇸🇬',
  'MY': '🇲🇾',
  'TH': '🇹🇭',
  'US': '🇺🇸',
  'DE': '🇩🇪',
  'EU': '🇪🇺',
  'AU': '🇦🇺',
  'JP': '🇯🇵',
  'KR': '🇰🇷',
  'IN': '🇮🇳',
  'CN': '🇨🇳',
  'GB': '🇬🇧',
  'CA': '🇨🇦',
  'FR': '🇫🇷',
  'IT': '🇮🇹',
  'ES': '🇪🇸'
}

export default function RegulationsPage({ params }: { params: { locale: string } }) {
  const [regulations, setRegulations] = useState<Regulation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedImportance, setSelectedImportance] = useState<string>('')
  const searchParams = useSearchParams()

  const locale = params.locale === 'zh' ? 'zh' : 'en'
  const t = translations[locale]

  const countries = ['SG', 'MY', 'TH', 'US', 'EU', 'AU', 'JP', 'KR', 'IN', 'CN']
  const importanceLevels = ['critical', 'high', 'medium', 'low']

  useEffect(() => {
    fetchRegulations()
  }, [selectedCountry, selectedImportance])

  const fetchRegulations = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCountry) params.append('country', selectedCountry)
      if (selectedImportance) params.append('importance', selectedImportance)
      params.append('limit', '50')

      const response = await fetch(`/api/regulations?${params}`)
      const result = await response.json()

      if (result.success) {
        setRegulations(result.data)
      }
    } catch (err) {
      console.error('Error fetching regulations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedCountry('')
    setSelectedImportance('')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#339999]/5 via-transparent to-[#2a7a7a]/5">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-20">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">{t.badge}</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              {t.title}
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale === 'zh' ? '国家/地区' : 'Country/Region'}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999] bg-white transition-all"
              >
                <option value="">{t.allCountries}</option>
                {countries.map((code) => (
                  <option key={code} value={code}>
                    {countryFlags[code]} {code}
                  </option>
                ))}
              </select>
            </div>

            {/* Importance Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {locale === 'zh' ? '重要程度' : 'Importance Level'}
              </label>
              <select
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999] bg-white transition-all"
              >
                <option value="">{t.allImportance}</option>
                {importanceLevels.map((level) => (
                  <option key={level} value={level}>
                    {t[level as keyof typeof t]}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <div className="flex-1"></div>
            <button
              onClick={handleReset}
              className="px-6 py-2.5 text-sm font-medium text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999]"></div>
            <p className="mt-4 text-slate-600">Loading regulations...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && regulations.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
            <Globe className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">{t.noData}</h3>
            <p className="mt-1 text-sm text-slate-500">{t.noDataDesc}</p>
          </div>
        )}

        {/* Regulations Grid */}
        {!loading && regulations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regulations.map((regulation) => (
              <div
                key={regulation.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#339999]/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {countryFlags[regulation.country] || '🌍'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-slate-600">
                        {regulation.country_name}
                      </div>
                      <div className="text-xs text-slate-400">
                        {regulation.regulation_type}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    importanceColors[regulation.importance as keyof typeof importanceColors]
                  }`}>
                    {t[regulation.importance as keyof typeof t]}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {locale === 'zh' && regulation.title_zh ? regulation.title_zh : regulation.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  {locale === 'zh' && regulation.summary_zh ? regulation.summary_zh : regulation.summary}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{t.effectiveDate}: {formatDate(regulation.effective_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="w-4 h-4" />
                    <span>{t.publishedDate}: {formatDate(regulation.published_date)}</span>
                  </div>
                </div>

                {/* Action Required */}
                {regulation.action_required && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {locale === 'zh' ? '需要采取行动' : 'Action Required'}
                    </div>
                  </div>
                )}

                {/* Source */}
                <div className="text-xs text-slate-500 mb-4">
                  {t.source}: {regulation.source_organization}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all text-sm font-medium">
                    {t.readMore}
                  </button>
                  <button className="px-4 py-2.5 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all text-sm font-medium">
                    {t.subscribe}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe Section */}
        <div className="mt-12 bg-gradient-to-r from-[#339999]/5 to-[#2a7a7a]/5 border-l-4 border-[#339999] p-6 rounded-2xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Shield className="h-6 w-6 text-[#339999]" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-slate-800">
                {t.subscribe}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {t.subscribeDesc}
              </p>
              <div className="mt-4">
                <button className="px-6 py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all font-medium">
                  {t.subscribeNow}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
