'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ExportButton from '../../components/ExportButton';
import { regulatoryAgenciesData, countryNames, type RegulatoryAgency } from '../../lib/regulatory-agencies-data';

export default function RegulatorsPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'zh';
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');

  const t = {
    title: locale === 'zh' ? '全球监管机构数据库' : 'Global Regulators Database',
    subtitle: locale === 'zh' ? '查询各国医疗器械监管机构信息、官方网站和联系方式' : 'Search regulatory agencies for medical devices worldwide',
    searchPlaceholder: locale === 'zh' ? '搜索机构名称...' : 'Search agency name...',
    allCountries: locale === 'zh' ? '所有国家' : 'All Countries',
    allTypes: locale === 'zh' ? '所有类型' : 'All Types',
    national: locale === 'zh' ? '国家级' : 'National',
    regional: locale === 'zh' ? '区域级' : 'Regional',
    local: locale === 'zh' ? '地方级' : 'Local',
    officialWebsite: locale === 'zh' ? '官方网站' : 'Official Website',
    database: locale === 'zh' ? '官方数据库' : 'Database',
    contact: locale === 'zh' ? '联系方式' : 'Contact',
    email: locale === 'zh' ? '邮箱' : 'Email',
    phone: locale === 'zh' ? '电话' : 'Phone',
    description: locale === 'zh' ? '机构简介' : 'Description',
    verified: locale === 'zh' ? '已验证' : 'Verified',
    viewDetail: locale === 'zh' ? '查看详情' : 'View Detail',
    noResults: locale === 'zh' ? '未找到符合条件的监管机构' : 'No regulatory agencies found',
    totalAgencies: locale === 'zh' ? '共收录' : 'Total',
    agencies: locale === 'zh' ? '个监管机构' : 'agencies',
    foundResults: locale === 'zh' ? '个结果' : 'results',
  };

  // 获取唯一国家列表
  const countries = Array.from(new Set(regulatoryAgenciesData.map(a => a.country))).sort();

  // 过滤数据
  const filteredAgencies = regulatoryAgenciesData.filter(agency => {
    const matchesSearch = agency.agency_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agency.agency_name_zh.includes(searchTerm) ||
                         agency.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || agency.country === selectedCountry;
    const matchesType = selectedType === 'all' || agency.agency_type === selectedType;
    return matchesSearch && matchesCountry && matchesType;
  });

  const getCountryName = (country: string) => {
    return countryNames[country]?.[locale === 'zh' ? 'zh' : 'en'] || country;
  };

  const getCountryFlag = (countryCode: string) => {
    const flags: Record<string, string> = {
      'US': '🇺🇸', 'CN': '🇨🇳', 'EU': '🇪🇺', 'JP': '🇯🇵', 'CA': '🇨🇦',
      'AU': '🇦🇺', 'KR': '🇰🇷', 'SG': '🇸🇬', 'GB': '🇬🇧', 'BR': '🇧🇷',
      'IN': '🇮🇳', 'CH': '🇨🇭', 'SA': '🇸🇦', 'MX': '🇲🇽', 'TR': '🇹🇷',
      'RU': '🇷🇺', 'ZA': '🇿🇦', 'TH': '🇹🇭', 'VN': '🇻🇳', 'ID': '🇮🇩',
    };
    return flags[countryCode] || '🌍';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t.title}</h1>
          <p className="text-xl opacity-90">{t.subtitle}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Statistics */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{t.totalAgencies}</p>
              <p className="text-3xl font-bold text-[#339999]">{regulatoryAgenciesData.length}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">{t.verified}</p>
              <p className="text-3xl font-bold text-green-600">{regulatoryAgenciesData.filter(a => a.verified).length}</p>
            </div>
            <div className="hidden md:block">
              <div className="text-sm text-gray-600">
                <p>{t.agencies}</p>
                <p className="text-xs mt-1">覆盖 {countries.length} 个国家/地区</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Country Filter */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#339999] focus:ring-2 focus:ring-[#339999]/20 outline-none transition-all bg-white"
            >
              <option value="all">{t.allCountries}</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {getCountryName(country)}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#339999] focus:ring-2 focus:ring-[#339999]/20 outline-none transition-all bg-white"
            >
              <option value="all">{t.allTypes}</option>
              <option value="national">{t.national}</option>
              <option value="regional">{t.regional}</option>
              <option value="local">{t.local}</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            <span className="font-bold text-gray-900">{filteredAgencies.length}</span>
            {' '}{t.foundResults}
            {selectedCountry !== 'all' && ` - ${getCountryName(selectedCountry)}`}
            {selectedType !== 'all' && ` - ${t[selectedType as keyof typeof t]}`}
          </p>
          <ExportButton
            type="regulator"
            data={filteredAgencies}
            filename={`regulators-${new Date().toISOString().split('T')[0]}`}
            format="csv"
          />
        </div>

        {/* Results */}
        {filteredAgencies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-500">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getCountryFlag(agency.country_code)}</span>
                      <h3 className="text-xl font-bold text-gray-900">
                        {locale === 'zh' ? agency.agency_name_zh : agency.agency_name_en}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">{getCountryName(agency.country)}</span>
                      {agency.verified && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t.verified}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        agency.agency_type === 'national' ? 'bg-blue-100 text-blue-700' :
                        agency.agency_type === 'regional' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {locale === 'zh' ? t[agency.agency_type as keyof typeof t] : agency.agency_type}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {locale === 'zh' ? agency.description_zh : agency.description}
                </p>

                {/* Links */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <a
                    href={agency.official_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-[#339999]/10 text-[#339999] text-sm rounded-lg hover:bg-[#339999]/20 transition-colors flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    {t.officialWebsite}
                  </a>
                  {agency.database_url && (
                    <a
                      href={agency.database_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                      </svg>
                      {t.database}
                    </a>
                  )}
                </div>

                {/* Contact */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-500 mb-2">{t.contact}</p>
                  <div className="space-y-1">
                    {agency.contact_email && (
                      <a href={`mailto:${agency.contact_email}`} className="block text-sm text-gray-600 hover:text-[#339999] transition-colors">
                        <span className="inline-block w-8 text-gray-400">{t.email}:</span>
                        {agency.contact_email}
                      </a>
                    )}
                    {agency.contact_phone && (
                      <a href={`tel:${agency.contact_phone}`} className="block text-sm text-gray-600 hover:text-[#339999] transition-colors">
                        <span className="inline-block w-8 text-gray-400">{t.phone}:</span>
                        {agency.contact_phone}
                      </a>
                    )}
                  </div>
                </div>

                {/* View Detail Button */}
                <Link
                  href={`/${locale}/regulators/${agency.id}`}
                  className="mt-4 block w-full text-center py-2.5 bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white rounded-xl hover:shadow-lg hover:shadow-[#339999]/30 transition-all font-medium"
                >
                  {t.viewDetail}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
