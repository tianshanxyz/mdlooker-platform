'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, CheckSquare, Square } from 'lucide-react';

interface ExportButtonProps {
  type: 'search' | 'company' | 'registrations';
  query?: string;
  companyId?: string;
  ids?: string[];
  className?: string;
}

export function ExportButton({ type, query, companyId, ids, className = '' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showFieldSelector, setShowFieldSelector] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    setLoading(true);
    
    try {
      // 构建查询参数
      const params = new URLSearchParams({
        type,
        format,
      });
      
      if (query) params.set('query', query);
      if (companyId) params.set('company_id', companyId);
      if (ids && ids.length > 0) params.set('ids', ids.join(','));
      if (selectedFields.length > 0) params.set('fields', selectedFields.join(','));
      
      // 发起下载请求
      const response = await fetch(`/api/export?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // 创建下载链接
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // 从 Content-Disposition header 获取文件名
      const disposition = response.headers.get('Content-Disposition');
      let filename = 'export.csv';
      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }
      
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('导出失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleFieldSelector = () => {
    setShowFieldSelector(!showFieldSelector);
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const selectAllFields = () => {
    // 默认字段
    const defaultFields = ['id', 'name', 'name_zh', 'country', 'business_type', 'registration_number'];
    setSelectedFields(defaultFields);
  };

  const clearFields = () => {
    setSelectedFields([]);
  };

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* 导出按钮 */}
      <button
        onClick={() => handleExport('csv')}
        disabled={loading}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#339999] text-white rounded-lg hover:bg-[#2a7a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="导出为 CSV"
      >
        <Download className="w-4 h-4" />
        <span>导出 CSV</span>
      </button>
      
      {/* 字段选择按钮 */}
      <button
        onClick={toggleFieldSelector}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="选择导出字段"
      >
        {selectedFields.length > 0 ? (
          <CheckSquare className="w-4 h-4" />
        ) : (
          <Square className="w-4 h-4" />
        )}
      </button>
      
      {/* 字段选择面板 */}
      {showFieldSelector && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-900">选择导出字段</h4>
            <button
              onClick={toggleFieldSelector}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          <div className="flex gap-2 mb-3">
            <button
              onClick={selectAllFields}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              全选
            </button>
            <button
              onClick={clearFields}
              className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              清空
            </button>
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {getFieldOptions(type).map(field => (
              <label key={field} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(field)}
                  onChange={() => toggleField(field)}
                  className="rounded border-gray-300 text-[#339999] focus:ring-[#339999]"
                />
                <span className="text-sm text-gray-700">{getFieldLabel(field)}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 获取字段选项
 */
function getFieldOptions(type: string): string[] {
  const commonFields = ['id', 'name', 'name_zh', 'country', 'business_type', 'description'];
  
  if (type === 'search') {
    return [...commonFields, 'website', 'email', 'phone'];
  } else if (type === 'company') {
    return [
      ...commonFields,
      'address', 'website', 'email', 'phone',
      'established_year', 'employee_count', 'registered_capital',
      'business_scope', 'gmp_certificates', 'iso_certificates'
    ];
  } else if (type === 'registrations') {
    return [
      'product_name', 'product_name_zh', 'registration_number',
      'approval_date', 'expiration_date', 'manufacturer', 'manufacturer_zh',
      'device_classification', 'product_description'
    ];
  }
  
  return commonFields;
}

/**
 * 获取字段标签（中文）
 */
function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    id: 'ID',
    name: '英文名称',
    name_zh: '中文名称',
    country: '国家',
    business_type: '公司类型',
    description: '描述',
    address: '地址',
    website: '网站',
    email: '邮箱',
    phone: '电话',
    established_year: '成立年份',
    employee_count: '员工数量',
    registered_capital: '注册资本',
    business_scope: '经营范围',
    gmp_certificates: 'GMP 证书',
    iso_certificates: 'ISO 证书',
    product_name: '产品名称（英）',
    product_name_zh: '产品名称（中）',
    registration_number: '注册证号',
    approval_date: '批准日期',
    expiration_date: '到期日期',
    manufacturer: '生产商（英）',
    manufacturer_zh: '生产商（中）',
    device_classification: '分类',
    product_description: '产品描述',
  };
  
  return labels[field] || field;
}
