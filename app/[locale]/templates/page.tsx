'use client'

import { useState, useEffect } from 'react'
import { FileText, Download, Search, Sparkles, File, FileSpreadsheet } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Templates Library</span>
          </div>
          <h1 className="text-4xl font-bold text-center mb-4">
            资料模板库
          </h1>
          <p className="text-xl text-white/90 text-center max-w-3xl mx-auto">
            免费下载医疗器械注册所需各类文档模板：声明文件、技术文档、管理文件、商业文件等
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          {/* Category Filter */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">文档分类</h2>
            <div className="flex flex-wrap gap-3">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white shadow-lg shadow-[#339999]/30'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-[#339999]/30 hover:shadow-md'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#339999]/20 focus:border-[#339999] transition-all"
            />
          </div>
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999]"></div>
            <p className="mt-4 text-slate-600">加载模板中...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-slate-400" />
            <h3 className="mt-2 text-sm font-medium text-slate-900">暂无模板</h3>
            <p className="mt-1 text-sm text-slate-500">
              该分类下暂无可用模板
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-[#339999]/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#339999]/10 to-[#2a7a7a]/10">
                    {template.file_type === 'pdf' ? (
                      <File className="w-6 h-6 text-[#339999]" />
                    ) : template.file_type === 'xlsx' ? (
                      <FileSpreadsheet className="w-6 h-6 text-[#339999]" />
                    ) : (
                      <FileText className="w-6 h-6 text-[#339999]" />
                    )}
                  </div>
                  {template.is_free && (
                    <span className="px-3 py-1 bg-gradient-to-r from-[#339999]/10 to-[#2a7a7a]/10 text-[#339999] text-xs font-medium rounded-full border border-[#339999]/20">
                      免费
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                  {template.title_zh || template.title}
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  {template.title}
                </p>

                {template.description_zh && (
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {template.description_zh}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                  <span className="px-2 py-1 bg-slate-100 rounded-md text-xs font-medium">{template.file_type.toUpperCase()}</span>
                  {template.file_size && (
                    <span>{(template.file_size / 1024).toFixed(1)} MB</span>
                  )}
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {template.download_count}
                  </span>
                </div>

                <button
                  onClick={() => handleDownload(template)}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all font-medium flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载模板
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-gradient-to-r from-[#339999]/5 to-[#2a7a7a]/5 border border-[#339999]/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#339999]/10 to-[#2a7a7a]/10 flex-shrink-0">
              <Sparkles className="w-5 h-5 text-[#339999]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900">使用说明</h3>
              <div className="mt-2 text-sm text-slate-600">
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
