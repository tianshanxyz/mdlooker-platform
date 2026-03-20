'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

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
    subscribeDesc: '获取最新法规更新推送'
  },
  en: {
    title: 'Regulation Updates',
    subtitle: 'Real-time tracking of global medical device regulation changes',
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
    subscribeDesc: 'Get latest regulation updates'
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-indigo-100 text-center max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'zh' ? '国家/地区' : 'Country/Region'}
              </label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {locale === 'zh' ? '重要程度' : 'Importance Level'}
              </label>
              <select
                value={selectedImportance}
                onChange={(e) => setSelectedImportance(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
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
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t.reset}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading regulations...</p>
          </div>
        )}

        {/* Regulations List */}
        {!loading && regulations.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t.noData}</h3>
            <p className="mt-1 text-sm text-gray-500">{t.noDataDesc}</p>
          </div>
        )}

        {/* Regulations Grid */}
        {!loading && regulations.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {regulations.map((regulation) => (
              <div
                key={regulation.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">
                      {countryFlags[regulation.country] || '🌍'}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-500">
                        {regulation.country_name}
                      </div>
                      <div className="text-xs text-gray-400">
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {locale === 'zh' && regulation.title_zh ? regulation.title_zh : regulation.title}
                </h3>

                {/* Summary */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {locale === 'zh' && regulation.summary_zh ? regulation.summary_zh : regulation.summary}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{t.effectiveDate}: {formatDate(regulation.effective_date)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{t.publishedDate}: {formatDate(regulation.published_date)}</span>
                  </div>
                </div>

                {/* Action Required */}
                {regulation.action_required && (
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {locale === 'zh' ? '需要采取行动' : 'Action Required'}
                    </div>
                  </div>
                )}

                {/* Source */}
                <div className="text-xs text-gray-500 mb-4">
                  {t.source}: {regulation.source_organization}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
                    {t.readMore}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    {t.subscribe}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subscribe Section */}
        <div className="mt-12 bg-indigo-50 border-l-4 border-indigo-400 p-6 rounded-r-lg">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-indigo-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-indigo-800">
                {t.subscribe}
              </h3>
              <p className="mt-2 text-sm text-indigo-700">
                {t.subscribeDesc}
              </p>
              <div className="mt-4">
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
                  {locale === 'zh' ? '立即订阅' : 'Subscribe Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
