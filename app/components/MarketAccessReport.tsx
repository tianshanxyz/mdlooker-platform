'use client'

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

interface MarketAccessReportProps {
  data: MarketAccessData
}

export default function MarketAccessReport({ data }: MarketAccessReportProps) {
  const difficultyColor = (index: number) => {
    if (index <= 30) return 'text-green-600 bg-green-100'
    if (index <= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const difficultyLabel = (index: number) => {
    if (index <= 30) return '容易'
    if (index <= 60) return '中等'
    return '困难'
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{data.country_name}市场准入指南</h2>
            <p className="text-blue-100 mt-1">{data.classification}</p>
          </div>
          <div className={`px-4 py-2 rounded-full font-medium ${difficultyColor(data.difficulty_index)}`}>
            难度：{difficultyLabel(data.difficulty_index)} ({data.difficulty_index}/100)
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">${data.official_fees_usd}</div>
          <div className="text-sm text-gray-600 mt-1">官方费用</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.estimated_days_avg}天</div>
          <div className="text-sm text-gray-600 mt-1">平均周期</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.validity_period}月</div>
          <div className="text-sm text-gray-600 mt-1">证书有效期</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.currency} {data.official_fees}</div>
          <div className="text-sm text-gray-600 mt-1">当地费用</div>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">核心要求</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg border-2 ${data.gmp_required ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-2">
              {data.gmp_required ? (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">GMP 要求</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {data.gmp_required ? '需要提供 GMP 证书' : '不需要 GMP 证书'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${data.local_agent_required ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-2">
              {data.local_agent_required ? (
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">本地代理</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {data.local_agent_required ? '必须指定本地代理' : '不需要本地代理'}
            </div>
          </div>

          <div className={`p-4 rounded-lg border-2 ${data.clinical_data_required ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center space-x-2">
              {data.clinical_data_required ? (
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="font-medium">临床数据</span>
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {data.clinical_data_required ? '需要提供临床数据' : '不需要临床数据'}
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="p-6 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">必需文件清单</h3>
        <div className="space-y-3">
          {data.required_documents.map((doc: any, index: number) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{doc.name}</div>
                {doc.name_zh && <div className="text-sm text-gray-500">{doc.name_zh}</div>}
                {doc.description && <div className="text-sm text-gray-600 mt-1">{doc.description}</div>}
              </div>
              {doc.required && (
                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded">必需</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Process Steps */}
      <div className="p-6 border-t bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">注册流程</h3>
        <div className="space-y-4">
          {data.process_steps.map((step: any, index: number) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.step}
                </div>
              </div>
              <div className="flex-1 bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                    {step.title_zh && <p className="text-sm text-gray-500">{step.title_zh}</p>}
                    {step.description && <p className="text-sm text-gray-600 mt-1">{step.description}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">{step.estimated_days}天</div>
                    <div className="text-xs text-gray-500">预计周期</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">总周期范围</div>
            <div className="text-lg font-bold text-blue-600">
              {data.estimated_days_min} - {data.estimated_days_max}天
              <span className="text-sm font-normal text-gray-600 ml-2">
                （平均{data.estimated_days_avg}天）
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="p-6 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">注意事项</h3>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <div className="text-sm text-yellow-700 whitespace-pre-line">{data.notes}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="p-6 bg-gray-50 border-t text-sm text-gray-500">
        <div className="flex items-center justify-between">
          <div>
            数据来源：{data.data_source}
          </div>
          <div>
            最后更新：{new Date(data.last_updated).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  )
}
