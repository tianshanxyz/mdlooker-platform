'use client'

import { useState, useEffect } from 'react'

interface ProductCategory {
  id: string
  name: string
  name_zh: string
  code: string
  level: number
  children?: ProductCategory[]
}

interface ProductSelectorProps {
  selectedProduct: string | null
  onProductSelect: (productId: string) => void
}

export default function ProductSelector({ selectedProduct, onProductSelect }: ProductSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/product-categories')
      const result = await response.json()
      if (result.success) {
        setCategories(result.data)
        // Auto-expand root categories
        setExpandedCategories(result.data.map((cat: ProductCategory) => cat.id))
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name_zh?.includes(searchTerm) ||
    cat.children?.some(child =>
      child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.name_zh?.includes(searchTerm)
    )
  )

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">选择产品类别</h3>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="搜索产品类别..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">加载产品分类...</p>
        </div>
      )}

      {/* Category Tree */}
      {!loading && (
        <div className="space-y-2">
          {filteredCategories.map((category) => (
          <div key={category.id}>
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedProduct === category.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'hover:bg-gray-50 border-2 border-transparent'
              }`}
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center space-x-3">
                <svg
                  className={`w-5 h-5 transform transition-transform ${
                    expandedCategories.includes(category.id) ? 'rotate-90' : ''
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <div className="font-medium text-gray-900">{category.name}</div>
                  <div className="text-sm text-gray-500">{category.name_zh}</div>
                </div>
              </div>
              {selectedProduct === category.id && (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            {/* Children */}
            {expandedCategories.includes(category.id) && category.children && (
              <div className="ml-8 mt-2 space-y-2">
                {category.children.map((child) => (
                  <div
                    key={child.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedProduct === child.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                    onClick={() => onProductSelect(child.id)}
                  >
                    <div className="font-medium text-gray-900">{child.name}</div>
                    <div className="text-sm text-gray-500">{child.name_zh}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Select - 从实际数据中提取热门产品 */}
      {!loading && categories.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">热门产品</h4>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 5).map((category) => (
              <button
                key={category.id}
                onClick={() => onProductSelect(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedProduct === category.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name_zh || category.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
