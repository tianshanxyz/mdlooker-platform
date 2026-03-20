'use client'

import { useState } from 'react'
import CountrySelector from '@/app/components/CountrySelector'

interface MarketAccessData {
  id: string
  country: string
  country_name: string
  classification: string
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
  difficulty_index: number
}

export default function CompareMarketsPage() {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState<MarketAccessData[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountries(prev => {
      if (prev.includes(countryCode)) {
        return prev.filter(c => c !== countryCode)
      }
      if (prev.length >= 4) {
        alert('最多选择 4 个国家进行对比')
        return prev
      }
      return [...prev, countryCode]
    })
  }

  const handleCompare = async () => {
    if (selectedCountries.length < 2) {
      setError('请至少选择 2 个国家进行对比')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        countries: selectedCountries.join(','),
      })

      const response = await fetch(`/api/compare?${params}`)
      const result = await response.json()

      if (result.success && result.data && result.data.length > 0) {
        setComparisonData(result.data)
      } else {
        setError('未找到对比数据')
      }
    } catch (err) {
      setError('对比失败，请稍后重试')
      console.error('Error fetching comparison data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedCountries([])
    setComparisonData([])
    setError(null)
  }

  const handleExport = async (format: 'csv' | 'json') => {
    if (comparisonData.length === 0) {
      alert('没有可导出的数据')
      return
    }

    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: comparisonData.map(item => ({
            国家：item.country_name,
            分类：item.classification,
            官方费用_USD: item.official_fees_usd,
            注册周期_天：item.estimated_days_avg,
            证书有效期_月：item.validity_period,
            GMP 要求：item.gmp_required ? '需要' : '不需要',
            本地代理：item.local_agent_required ? '需要' : '不需要',
            临床数据：item.clinical_data_required ? '需要' : '不需要',
            准入难度：item.difficulty_index,
            文件数量：item.required_documents?.length || 0,
            流程步骤：item.process_steps?.length || 0,
          })),
          format
        })
      })

      if (!response.ok) {
        throw new Error('导出失败')
      }

      // 触发下载
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `market_comparison.${format === 'csv' ? 'csv' : 'json'}`
      a.click()
      window.URL.revokeObjectURL(url)

      alert(`成功导出 ${comparisonData.length} 个市场的数据`)
    } catch (err) {
      console.error('Error exporting data:', err)
      alert('导出失败，请稍后重试')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            市场对比工具
          </h1>
          <p className="text-xl text-purple-100 text-center max-w-3xl mx-auto">
            一键对比多个市场的认证要求：分类标准、文件清单、费用周期横向对比，助您快速决策
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Country Selection */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">选择要对比的国家/地区</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                已选择：<span className="font-medium text-purple-600">{selectedCountries.length}</span> 个
                （最多 4 个）
              </p>
              {selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedCountries.map(code => (
                    <span
                      key={code}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700"
                    >
                      {code}
                      <button
                        onClick={() => handleCountrySelect(code)}
                        className="ml-2 hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <CountrySelector
              selectedCountry={null}
              onCountrySelect={handleCountrySelect}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-8">
          <button
            onClick={handleCompare}
            disabled={loading || selectedCountries.length < 2}
            className={`px-8 py-3 rounded-lg font-medium text-white transition-colors ${
              loading || selectedCountries.length < 2
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
            }`}
          >
            {loading ? '对比中...' : '开始对比'}
          </button>
          <button
            onClick={handleReset}
            className="px-8 py-3 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            重置
          </button>
          {comparisonData.length > 0 && (
            <div className="relative group">
              <button
                className="px-8 py-3 rounded-lg font-medium text-purple-600 bg-white border border-purple-300 hover:bg-purple-50 transition-colors"
              >
                导出对比表
              </button>
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-2">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    📊 导出为 CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    📄 导出为 JSON
                  </button>
                </div>
              </div>
            </div>
          )}
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">正在对比市场数据...</p>
          </div>
        )}

        {/* Comparison Table */}
        {comparisonData.length > 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">市场对比结果</h2>
              <p className="text-gray-600 mt-1">
                对比 {comparisonData.length} 个市场的准入要求
              </p>
            </div>

            {/* Comparison Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      对比项
                    </th>
                    {comparisonData.map((data) => (
                      <th key={data.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {data.country_name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Classification */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      产品分类
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        {data.classification}
                      </td>
                    ))}
                  </tr>

                  {/* Official Fees */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      官方费用
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        <div className="font-bold text-green-600">${data.official_fees_usd}</div>
                        <div className="text-xs text-gray-500">
                          {data.currency} {data.official_fees}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Estimated Days */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      注册周期
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        <div className="font-bold text-blue-600">{data.estimated_days_avg}天</div>
                        <div className="text-xs text-gray-500">
                          {data.estimated_days_min}-{data.estimated_days_max}天
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Validity Period */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      证书有效期
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        {data.validity_period}个月
                      </td>
                    ))}
                  </tr>

                  {/* GMP Required */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      GMP 要求
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-center">
                        {data.gmp_required ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">需要</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">不需要</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Local Agent Required */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      本地代理
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-center">
                        {data.local_agent_required ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded">需要</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">不需要</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Clinical Data Required */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      临床数据
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-center">
                        {data.clinical_data_required ? (
                          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">需要</span>
                        ) : (
                          <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">不需要</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Difficulty Index */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      准入难度
                    </td>
                    {comparisonData.map((data) => {
                      const difficultyColor = data.difficulty_index <= 30 ? 'text-green-600' :
                                             data.difficulty_index <= 60 ? 'text-yellow-600' : 'text-red-600'
                      return (
                        <td key={data.id} className="px-6 py-4 text-center">
                          <div className={`font-bold ${difficultyColor}`}>
                            {data.difficulty_index}/100
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* Document Count */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      文件数量
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        {data.required_documents?.length || 0} 项
                      </td>
                    ))}
                  </tr>

                  {/* Process Steps */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      流程步骤
                    </td>
                    {comparisonData.map((data) => (
                      <td key={data.id} className="px-6 py-4 text-sm text-gray-900 text-center">
                        {data.process_steps?.length || 0} 步
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && comparisonData.length === 0 && !error && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">等待对比</h3>
            <p className="mt-1 text-sm text-gray-500">
              请选择至少 2 个国家，然后点击"开始对比"按钮
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
