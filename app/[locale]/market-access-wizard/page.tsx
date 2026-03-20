'use client'

import { useState } from 'react'
import ProductSelector from '@/app/components/ProductSelector'
import CountrySelector from '@/app/components/CountrySelector'
import MarketAccessReport from '@/app/components/MarketAccessReport'
import { useSearchParams } from 'next/navigation'

interface MarketAccessData {
  id: string
  country: string
  country_name: string
  classification: string
  classification_description?: string
  required_documents: any[]
  process_steps: any[]
  official_fees: number
  official_fees_usd: number
  currency: string
  estimated_days_min: number
  estimated_days_max: number
  estimated_days_avg: number
  validity_period: number
  gmp_required: boolean
  local_agent_required: boolean
  clinical_data_required: boolean
  notes: string
  difficulty_index: number
  data_source: string
  last_updated: string
}

const translations = {
  zh: {
    title: '市场准入向导',
    subtitle: '一键查询全球医疗器械市场准入要求：产品分类、文件清单、注册流程、费用周期全掌握',
    selectProduct: '选择产品类别',
    selectCountry: '选择目标市场',
    search: '一键查询市场准入要求',
    searching: '查询中...',
    reset: '重置',
    errorSelect: '请选择产品类别和目标市场',
    errorNoData: '未找到该产品和市场的准入数据',
    errorFailed: '查询失败，请稍后重试',
    waitingTitle: '等待查询',
    waitingDesc: '请选择产品类别和目标市场，然后点击"一键查询"按钮'
  },
  en: {
    title: 'Market Access Wizard',
    subtitle: 'One-click query for global medical device market access requirements: product classification, document lists, registration processes, fees and timelines',
    selectProduct: 'Select Product Category',
    selectCountry: 'Select Target Market',
    search: 'Query Market Access Requirements',
    searching: 'Searching...',
    reset: 'Reset',
    errorSelect: 'Please select a product category and target market',
    errorNoData: 'No market access data found for this product and market',
    errorFailed: 'Query failed, please try again later',
    waitingTitle: 'Waiting for Query',
    waitingDesc: 'Please select a product category and target market, then click the "Query" button'
  }
}

export default function MarketAccessWizardPage({ params }: { params: { locale: string } }) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [marketAccessData, setMarketAccessData] = useState<MarketAccessData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const locale = params.locale === 'zh' ? 'zh' : 'en'
  const t = translations[locale]

  const handleSearch = async () => {
    if (!selectedProduct || !selectedCountry) {
      setError(t.errorSelect)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        keywords: 'mask',
        country: selectedCountry,
      })

      const response = await fetch(`/api/market-access?${params}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        setMarketAccessData(result.data[0])
      } else {
        setError(t.errorNoData)
      }
    } catch (err) {
      setError(t.errorFailed)
      console.error('Error fetching market access data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedProduct(null)
    setSelectedCountry(null)
    setMarketAccessData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-blue-100 text-center max-w-3xl mx-auto">
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Selection Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ProductSelector
            selectedProduct={selectedProduct}
            onProductSelect={setSelectedProduct}
          />
          <CountrySelector
            selectedCountry={selectedCountry}
            onCountrySelect={setSelectedCountry}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleSearch}
            disabled={loading || !selectedProduct || !selectedCountry}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
              loading || !selectedProduct || !selectedCountry
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? t.searching : t.search}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t.reset}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t.searching}</p>
          </div>
        )}

        {/* Report Display */}
        {marketAccessData && !loading && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {marketAccessData.country_name} - {marketAccessData.classification}
              </h2>
              <p className="text-gray-600 mt-1">
                {locale === 'zh' ? '完整市场准入指南：文件要求、注册流程、费用周期一目了然' : 'Complete market access guide: document requirements, registration process, fees and timelines at a glance'}
              </p>
            </div>
            <MarketAccessReport data={marketAccessData} />
          </div>
        )}

        {/* Empty State */}
        {!marketAccessData && !loading && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">{t.waitingTitle}</h3>
            <p className="mt-1 text-sm text-gray-500">{t.waitingDesc}</p>
          </div>
        )}
      </div>
    </div>
  )
}
