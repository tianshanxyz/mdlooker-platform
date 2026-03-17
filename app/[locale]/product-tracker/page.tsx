'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// 产品类型
interface Product {
  id: string;
  product_name: string;
  product_name_en: string;
  product_name_zh: string;
  model_number: string;
  udi_di: string;
  product_category: string;
  manufacturer_name: string;
  manufacturer_country: string;
  registration_status: string;
  total_registrations: number;
  approved_countries: string[];
  company_id: string;
  company_name: string;
}

// 扩展的类别列表（12个类别）
const categories = [
  { id: 'cardiovascular', nameEn: 'Cardiovascular Implants', nameZh: '心血管植入物' },
  { id: 'orthopedic', nameEn: 'Orthopedic Devices', nameZh: '骨科器械' },
  { id: 'surgical', nameEn: 'Surgical Instruments', nameZh: '手术器械' },
  { id: 'imaging', nameEn: 'Medical Imaging', nameZh: '医学影像设备' },
  { id: 'diagnostic', nameEn: 'In Vitro Diagnostics', nameZh: '体外诊断设备' },
  { id: 'dental', nameEn: 'Dental Devices', nameZh: '牙科器械' },
  { id: 'ophthalmic', nameEn: 'Ophthalmic Devices', nameZh: '眼科器械' },
  { id: 'neurological', nameEn: 'Neurological Devices', nameZh: '神经外科器械' },
  { id: 'robotic', nameEn: 'Surgical Robots', nameZh: '手术机器人' },
  { id: 'patient-monitoring', nameEn: 'Patient Monitoring', nameZh: '患者监护设备' },
  { id: 'consumables', nameEn: 'Medical Consumables', nameZh: '医用耗材' },
  { id: 'rehabilitation', nameEn: 'Rehabilitation Devices', nameZh: '康复器械' },
];

// 扩展的模拟数据
const mockProducts: Product[] = [
  {
    id: '1',
    product_name: 'Intravascular Stent System',
    product_name_en: 'Intravascular Stent System',
    product_name_zh: '血管内支架系统',
    model_number: 'STS-2024',
    udi_di: '00643169007221',
    product_category: 'cardiovascular',
    manufacturer_name: 'MedTech Solutions Inc.',
    manufacturer_country: 'United States',
    registration_status: 'active',
    total_registrations: 12,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'KR', 'SG', 'BR', 'IN', 'MX', 'GB'],
    company_id: '1',
    company_name: 'MedTech Solutions',
  },
  {
    id: '2',
    product_name: 'Digital X-Ray Imaging System',
    product_name_en: 'Digital X-Ray Imaging System',
    product_name_zh: '数字化 X 射线成像系统',
    model_number: 'XR-5000',
    udi_di: '00643169007238',
    product_category: 'imaging',
    manufacturer_name: 'Global Imaging Corp.',
    manufacturer_country: 'Germany',
    registration_status: 'active',
    total_registrations: 15,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'KR', 'SG', 'BR', 'IN', 'MX', 'GB', 'CH', 'TR', 'SA'],
    company_id: '2',
    company_name: 'Global Imaging',
  },
  {
    id: '3',
    product_name: 'Blood Glucose Monitoring System',
    product_name_en: 'Blood Glucose Monitoring System',
    product_name_zh: '血糖监测系统',
    model_number: 'BGM-300',
    udi_di: '00643169007245',
    product_category: 'diagnostic',
    manufacturer_name: 'DiabetesCare Technologies',
    manufacturer_country: 'Switzerland',
    registration_status: 'active',
    total_registrations: 8,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'SG', 'BR'],
    company_id: '3',
    company_name: 'DiabetesCare',
  },
  {
    id: '4',
    product_name: 'Surgical Robot System',
    product_name_en: 'Surgical Robot System',
    product_name_zh: '手术机器人系统',
    model_number: 'SR-2024',
    udi_di: '00643169007252',
    product_category: 'robotic',
    manufacturer_name: 'RoboMed International',
    manufacturer_country: 'United States',
    registration_status: 'active',
    total_registrations: 6,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'KR', 'AU'],
    company_id: '4',
    company_name: 'RoboMed',
  },
  {
    id: '5',
    product_name: 'Hip Replacement Implant',
    product_name_en: 'Hip Replacement Implant',
    product_name_zh: '髋关节置换植入物',
    model_number: 'HIP-PRO-500',
    udi_di: '00643169007269',
    product_category: 'orthopedic',
    manufacturer_name: 'OrthoTech Medical',
    manufacturer_country: 'Ireland',
    registration_status: 'active',
    total_registrations: 10,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'GB', 'CH'],
    company_id: '5',
    company_name: 'OrthoTech',
  },
  {
    id: '6',
    product_name: 'Dental Implant System',
    product_name_en: 'Dental Implant System',
    product_name_zh: '牙科种植系统',
    model_number: 'DENT-IMPL-200',
    udi_di: '00643169007276',
    product_category: 'dental',
    manufacturer_name: 'SmileTech Dental',
    manufacturer_country: 'Sweden',
    registration_status: 'active',
    total_registrations: 9,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'KR', 'SG', 'BR'],
    company_id: '6',
    company_name: 'SmileTech',
  },
  {
    id: '7',
    product_name: 'Cataract Surgery System',
    product_name_en: 'Cataract Surgery System',
    product_name_zh: '白内障手术系统',
    model_number: 'EYE-CAT-100',
    udi_di: '00643169007283',
    product_category: 'ophthalmic',
    manufacturer_name: 'VisionCare Medical',
    manufacturer_country: 'United States',
    registration_status: 'active',
    total_registrations: 11,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU', 'KR', 'SG', 'IN'],
    company_id: '7',
    company_name: 'VisionCare',
  },
  {
    id: '8',
    product_name: 'Spinal Fusion Device',
    product_name_en: 'Spinal Fusion Device',
    product_name_zh: '脊柱融合器械',
    model_number: 'SPINE-FUSE-300',
    udi_di: '00643169007290',
    product_category: 'neurological',
    manufacturer_name: 'NeuroSpine Technologies',
    manufacturer_country: 'United States',
    registration_status: 'active',
    total_registrations: 7,
    approved_countries: ['US', 'CN', 'EU', 'JP', 'CA', 'AU'],
    company_id: '8',
    company_name: 'NeuroSpine',
  },
];

// 国家代码映射
const countryFlags: Record<string, string> = {
  'US': '🇺🇸',
  'CN': '🇨🇳',
  'EU': '🇪🇺',
  'JP': '🇯🇵',
  'CA': '🇨🇦',
  'AU': '🇦🇺',
  'KR': '🇰🇷',
  'SG': '🇸🇬',
  'BR': '🇧🇷',
  'IN': '🇮🇳',
  'MX': '🇲🇽',
  'GB': '🇬🇧',
  'CH': '🇨🇭',
  'TR': '🇹🇷',
  'SA': '🇸🇦',
};

export default function ProductTrackerPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const t = {
    title: locale === 'zh' ? '产品注册追踪' : 'Product Registration Tracker',
    subtitle: locale === 'zh' ? '追踪产品在全球各国的注册状态和历史' : 'Track product registration status worldwide',
    searchPlaceholder: locale === 'zh' ? '搜索产品名称、型号或 UDI...' : 'Search product name, model or UDI...',
    allCategories: locale === 'zh' ? '所有类别' : 'All Categories',
    allStatuses: locale === 'zh' ? '所有状态' : 'All Statuses',
    active: locale === 'zh' ? '有效' : 'Active',
    expired: locale === 'zh' ? '过期' : 'Expired',
    pending: locale === 'zh' ? '审核中' : 'Pending',
    listView: locale === 'zh' ? '列表' : 'List',
    mapView: locale === 'zh' ? '地图' : 'Map',
    product: locale === 'zh' ? '产品' : 'Product',
    model: locale === 'zh' ? '型号' : 'Model',
    udi: locale === 'zh' ? 'UDI' : 'UDI',
    manufacturer: locale === 'zh' ? '生产商' : 'Manufacturer',
    country: locale === 'zh' ? '国家' : 'Country',
    registrations: locale === 'zh' ? '个注册' : 'registrations',
    approvedCountries: locale === 'zh' ? '获批国家' : 'Approved Countries',
    viewDetail: locale === 'zh' ? '查看详情' : 'View Detail',
    noResults: locale === 'zh' ? '未找到符合条件的产品' : 'No products found',
    totalProducts: locale === 'zh' ? '共收录' : 'Total',
    products: locale === 'zh' ? '个产品' : 'products',
    category: locale === 'zh' ? '产品类别' : 'Category',
    avgRegistrations: locale === 'zh' ? '平均注册国家' : 'Avg. Registrations',
  };

  // 获取类别显示名称
  const getCategoryName = (categoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    return locale === 'zh' ? cat?.nameZh : cat?.nameEn;
  };

  // 过滤数据
  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = 
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.product_name_zh.includes(searchTerm) ||
      product.model_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.udi_di.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || product.product_category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.registration_status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section - 统一使用网站主色调 */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl opacity-90">{t.subtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Statistics - 统一卡片样式 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.totalProducts}</p>
                <p className="text-3xl font-bold text-[#339999]">{mockProducts.length}</p>
              </div>
              <div className="w-12 h-12 bg-[#339999]/10 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-[#339999]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.active}</p>
                <p className="text-3xl font-bold text-green-600">{mockProducts.filter(p => p.registration_status === 'active').length}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t.avgRegistrations}</p>
                <p className="text-3xl font-bold text-purple-600">
                  {(mockProducts.reduce((sum, p) => sum + p.total_registrations, 0) / mockProducts.length).toFixed(1)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and View Toggle */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 w-full">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#339999] focus:ring-2 focus:ring-[#339999]/20 outline-none transition-all"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category Filter - 使用扩展的类别 */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#339999] focus:ring-2 focus:ring-[#339999]/20 outline-none transition-all bg-white"
              >
                <option value="all">{t.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {locale === 'zh' ? cat.nameZh : cat.nameEn}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#339999] focus:ring-2 focus:ring-[#339999]/20 outline-none transition-all bg-white"
              >
                <option value="all">{t.allStatuses}</option>
                <option value="active">{t.active}</option>
                <option value="expired">{t.expired}</option>
                <option value="pending">{t.pending}</option>
              </select>
            </div>

            {/* View Toggle - 统一按钮样式 */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'list'
                    ? 'bg-[#339999] text-white shadow-lg shadow-[#339999]/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                {t.listView}
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  viewMode === 'map'
                    ? 'bg-[#339999] text-white shadow-lg shadow-[#339999]/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                {t.mapView}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-500">{t.noResults}</p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {locale === 'zh' ? product.product_name_zh : product.product_name_en}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 py-1 bg-[#339999]/10 text-[#339999] text-sm rounded-full">
                            {getCategoryName(product.product_category)}
                          </span>
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {t.active}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t.model}</p>
                        <p className="text-sm font-medium text-gray-900">{product.model_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t.udi}</p>
                        <p className="text-sm font-medium text-gray-900 font-mono">{product.udi_di}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{t.manufacturer}</p>
                        <p className="text-sm text-gray-900">{product.manufacturer_name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Registration Map */}
                  <div className="lg:w-80">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">{t.approvedCountries}</p>
                        <p className="text-lg font-bold text-[#339999]">{product.total_registrations}</p>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.approved_countries.slice(0, 12).map((code) => (
                          <span
                            key={code}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg text-lg hover:scale-110 transition-transform"
                            title={code}
                          >
                            {countryFlags[code] || '🌍'}
                          </span>
                        ))}
                        {product.total_registrations > 12 && (
                          <span className="w-8 h-8 flex items-center justify-center bg-[#339999]/10 text-[#339999] rounded-lg text-xs font-bold">
                            +{product.total_registrations - 12}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/${locale}/products/${product.id}`}
                      className="block w-full text-center py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all font-medium"
                    >
                      {t.viewDetail}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Map View Placeholder */
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-full h-96 bg-gradient-to-br from-[#339999]/10 to-[#339999]/5 rounded-2xl flex items-center justify-center mb-6">
              <div className="text-center">
                <svg className="w-20 h-20 text-[#339999] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
                <p className="text-lg text-gray-600">{locale === 'zh' ? '交互式全球注册地图' : 'Interactive Global Registration Map'}</p>
                <p className="text-sm text-gray-500 mt-2">{locale === 'zh' ? '展示产品在各国的注册状态分布' : 'Display product registration status distribution across countries'}</p>
              </div>
            </div>
            <p className="text-gray-500">{locale === 'zh' ? '地图视图开发中...' : 'Map view under development...'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
