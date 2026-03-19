'use client'

import { useState, useEffect } from 'react'

interface Template {
  id: string
  title: string
  title_zh: string
  category: string
  subcategory?: string
  country?: string
  file_url: string
  file_type: string
  file_size?: number
  description?: string
  description_zh?: string
  download_count: number
  is_free: boolean
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchTemplates()
  }, [selectedCategory])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory)
      }

      const response = await fetch(`/api/templates?${params}`)
      const result = await response.json()

      if (result.success) {
        setTemplates(result.data)
      }
    } catch (err) {
      console.error('Error fetching templates:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (template: Template) => {
    // Record download
    try {
      await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          user_email: 'demo@example.com' // In real app, use logged-in user email
        })
      })
    } catch (err) {
      console.error('Error recording download:', err)
    }

    // Trigger download (in real app, this would download the actual file)
    alert(`开始下载：${template.title_zh || template.title}\n\n注意：这是演示功能，实际文件需要从 Supabase Storage 下载`)
  }

  const categories = [
    { value: 'all', label: '全部', count: templates.length },
    { value: 'technical', label: '技术文件', count: 0 },
    { value: 'management', label: '管理文件', count: 0 },
    { value: 'declaration', label: '声明文件', count: 0 },
    { value: 'legal', label: '法律文件', count: 0 },
    { value: 'commercial', label: '商业文件', count: 0 },
  ]

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'docx':
        return '📄'
      case 'pdf':
        return '📕'
      case 'xlsx':
        return '📊'
      default:
        return '📁'
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (selectedCategory !== 'all' && template.category !== selectedCategory) {
      return false
    }
    if (searchTerm && !template.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !template.title_zh?.includes(searchTerm)) {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-4">
            资料模板库
          </h1>
          <p className="text-xl text-green-100 text-center max-w-3xl mx-auto">
            免费下载医疗器械注册所需各类文档模板：声明文件、技术文档、管理文件、商业文件等
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">文档分类</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="搜索模板..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">加载模板中...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无模板</h3>
            <p className="mt-1 text-sm text-gray-500">
              该分类下暂无可用模板
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{getFileIcon(template.file_type)}</div>
                  {template.is_free && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                      免费
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {template.title_zh || template.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">
                  {template.title}
                </p>

                {template.description_zh && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {template.description_zh}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{template.file_type.toUpperCase()}</span>
                  {template.file_size && (
                    <span>{(template.file_size / 1024).toFixed(1)} MB</span>
                  )}
                  <span>下载：{template.download_count}</span>
                </div>

                <button
                  onClick={() => handleDownload(template)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  下载模板
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">使用说明</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>所有模板均为通用格式，可根据具体需求修改</li>
                  <li>建议下载后仔细阅读模板中的注释和说明</li>
                  <li>部分国家有特殊格式要求，请参考对应国家的市场准入指南</li>
                  <li>如需定制模板服务，请联系客服</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
