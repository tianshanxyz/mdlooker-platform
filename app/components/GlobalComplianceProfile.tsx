'use client';

import { useState, useEffect } from 'react';
import { Globe, CheckCircle, AlertCircle, Clock, ExternalLink } from 'lucide-react';

interface ComplianceData {
  fda_registrations: any[];
  nmpa_registrations: any[];
  eudamed_registrations: any[];
  pmda_registrations: any[];
  health_canada_registrations: any[];
  ema_registrations: any[];
  mhra_registrations: any[];
  tga_registrations: any[];
  hsa_registrations: any[];
  swissmedic_registrations: any[];
  mfds_registrations: any[];
  anvisa_registrations: any[];
  warning_letters: any[];
  recalls: any[];
}

interface GlobalComplianceProfileProps {
  companyId: string;
  locale: string;
  complianceData: ComplianceData;
}

const marketConfig: Record<string, { name: string; icon: string; color: string; bgColor: string; region: string }> = {
  FDA: { name: 'FDA (USA)', icon: '🇺🇸', color: 'text-blue-600', bgColor: 'bg-blue-50', region: 'North America' },
  NMPA: { name: 'NMPA (China)', icon: '🇨🇳', color: 'text-green-600', bgColor: 'bg-green-50', region: 'Asia-Pacific' },
  EUDAMED: { name: 'EUDAMED (EU)', icon: '🇪🇺', color: 'text-purple-600', bgColor: 'bg-purple-50', region: 'Europe' },
  EMA: { name: 'EMA (EU)', icon: '🇪🇺', color: 'text-indigo-600', bgColor: 'bg-indigo-50', region: 'Europe' },
  PMDA: { name: 'PMDA (Japan)', icon: '🇯🇵', color: 'text-red-600', bgColor: 'bg-red-50', region: 'Asia-Pacific' },
  HealthCanada: { name: 'Health Canada', icon: '🇨🇦', color: 'text-orange-600', bgColor: 'bg-orange-50', region: 'North America' },
  MHRA: { name: 'MHRA (UK)', icon: '🇬🇧', color: 'text-teal-600', bgColor: 'bg-teal-50', region: 'Europe' },
  TGA: { name: 'TGA (Australia)', icon: '🇦🇺', color: 'text-yellow-600', bgColor: 'bg-yellow-50', region: 'Asia-Pacific' },
  HSA: { name: 'HSA (Singapore)', icon: '🇸🇬', color: 'text-red-600', bgColor: 'bg-red-50', region: 'Asia-Pacific' },
  Swissmedic: { name: 'Swissmedic', icon: '🇨🇭', color: 'text-red-600', bgColor: 'bg-red-50', region: 'Europe' },
  MFDS: { name: 'MFDS (Korea)', icon: '🇰🇷', color: 'text-blue-600', bgColor: 'bg-blue-50', region: 'Asia-Pacific' },
  ANVISA: { name: 'ANVISA (Brazil)', icon: '🇧🇷', color: 'text-green-600', bgColor: 'bg-green-50', region: 'South America' },
};

export default function GlobalComplianceProfile({ companyId, locale, complianceData }: GlobalComplianceProfileProps) {
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [expandedMarkets, setExpandedMarkets] = useState<Set<string>>(new Set());

  const isZh = locale === 'zh';

  // 计算统计数据
  const stats = {
    totalRegistrations: Object.values(complianceData).filter(arr => Array.isArray(arr)).reduce((sum, arr) => sum + arr.length, 0),
    activeMarkets: Object.entries(complianceData).filter(([key, arr]) => Array.isArray(arr) && arr.length > 0 && !key.includes('warning') && !key.includes('recall')).length,
    warningLetters: complianceData.warning_letters?.length || 0,
    recalls: complianceData.recalls?.length || 0,
  };

  // 按地区分组的市场
  const marketsByRegion = Object.entries(marketConfig).reduce((acc, [key, config]) => {
    if (!acc[config.region]) acc[config.region] = [];
    acc[config.region].push({ key, ...config });
    return acc;
  }, {} as Record<string, any[]>);

  const toggleMarket = (marketKey: string) => {
    const newExpanded = new Set(expandedMarkets);
    if (newExpanded.has(marketKey)) {
      newExpanded.delete(marketKey);
    } else {
      newExpanded.add(marketKey);
    }
    setExpandedMarkets(newExpanded);
  };

  const getRegistrationData = (marketKey: string) => {
    const keyMap: Record<string, keyof ComplianceData> = {
      'FDA': 'fda_registrations',
      'NMPA': 'nmpa_registrations',
      'EUDAMED': 'eudamed_registrations',
      'EMA': 'ema_registrations',
      'PMDA': 'pmda_registrations',
      'HealthCanada': 'health_canada_registrations',
      'MHRA': 'mhra_registrations',
      'TGA': 'tga_registrations',
      'HSA': 'hsa_registrations',
      'Swissmedic': 'swissmedic_registrations',
      'MFDS': 'mfds_registrations',
      'ANVISA': 'anvisa_registrations',
    };
    return complianceData[keyMap[marketKey]] || [];
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
          <p className="text-3xl font-bold text-blue-600">{stats.totalRegistrations}</p>
          <p className="text-sm text-blue-700 mt-1">
            {isZh ? '总注册数' : 'Total Registrations'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
          <p className="text-3xl font-bold text-green-600">{stats.activeMarkets}</p>
          <p className="text-sm text-green-700 mt-1">
            {isZh ? '活跃市场' : 'Active Markets'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border border-yellow-200">
          <p className="text-3xl font-bold text-yellow-600">{stats.warningLetters}</p>
          <p className="text-sm text-yellow-700 mt-1">
            {isZh ? '警告信' : 'Warning Letters'}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 text-center border border-red-200">
          <p className="text-3xl font-bold text-red-600">{stats.recalls}</p>
          <p className="text-sm text-red-700 mt-1">
            {isZh ? '召回事件' : 'Recalls'}
          </p>
        </div>
      </div>

      {/* Global Market Map */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-[#339999]" />
          {isZh ? '全球市场覆盖' : 'Global Market Coverage'}
        </h3>
        
        {Object.entries(marketsByRegion).map(([region, markets]) => (
          <div key={region} className="mb-6 last:mb-0">
            <h4 className="text-sm font-medium text-slate-500 mb-3 uppercase tracking-wide">{region}</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {markets.map((market) => {
                const registrationCount = getRegistrationData(market.key).length;
                const hasData = registrationCount > 0;
                
                return (
                  <button
                    key={market.key}
                    onClick={() => hasData && toggleMarket(market.key)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      hasData 
                        ? `${market.bgColor} border-current cursor-pointer hover:shadow-md` 
                        : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                    } ${market.color}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{market.icon}</span>
                      {hasData && (
                        <span className="text-lg font-bold">{registrationCount}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1">{market.name}</p>
                    {hasData ? (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        <span>{isZh ? '已注册' : 'Registered'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{isZh ? '无数据' : 'No Data'}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Registration Lists */}
      {Array.from(expandedMarkets).map((marketKey) => {
        const registrations = getRegistrationData(marketKey);
        const config = marketConfig[marketKey];
        
        if (registrations.length === 0) return null;

        return (
          <div key={marketKey} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className={`p-4 ${config.bgColor} border-b border-slate-200 flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{config.icon}</span>
                <div>
                  <h3 className={`font-semibold ${config.color}`}>{config.name}</h3>
                  <p className="text-sm text-slate-600">
                    {registrations.length} {isZh ? '个注册产品' : 'registered products'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => toggleMarket(marketKey)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {registrations.map((reg: any, index: number) => (
                <div key={reg.id || index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">
                        {reg.device_name || reg.product_name || reg.device_name_en || 'Unknown Device'}
                      </h4>
                      
                      {/* Registration Number */}
                      {(reg.registration_number || reg.srn || reg.approval_number || reg.licence_number) && (
                        <p className="text-sm text-slate-500 mt-1 font-mono">
                          {reg.registration_number || reg.srn || reg.approval_number || reg.licence_number}
                        </p>
                      )}
                      
                      {/* Device Class */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {(reg.device_class || reg.device_classification || reg.device_risk_class) && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bgColor} ${config.color}`}>
                            Class {reg.device_class || reg.device_classification || reg.device_risk_class}
                          </span>
                        )}
                        
                        {reg.registration_status && (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            reg.registration_status.toLowerCase().includes('active') 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {reg.registration_status}
                          </span>
                        )}
                        
                        {reg.product_code && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                            {reg.product_code}
                          </span>
                        )}
                      </div>
                      
                      {/* Additional Info */}
                      <div className="mt-2 text-sm text-slate-600 space-y-1">
                        {reg.notified_body_name && (
                          <p>Notified Body: {reg.notified_body_name}</p>
                        )}
                        {reg.notified_body && (
                          <p>Notified Body: {reg.notified_body}</p>
                        )}
                        {reg.uk_responsible_person && (
                          <p>UK Responsible Person: {reg.uk_responsible_person}</p>
                        )}
                        {reg.registration_date && (
                          <p>Registration Date: {new Date(reg.registration_date).toLocaleDateString()}</p>
                        )}
                        {reg.approval_date && (
                          <p>Approval Date: {new Date(reg.approval_date).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* External Link */}
                    {reg.source_url && (
                      <a
                        href={reg.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 text-[#339999] hover:text-[#2a7a7a]"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Compliance Alerts */}
      {(stats.warningLetters > 0 || stats.recalls > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            {isZh ? '合规提醒' : 'Compliance Alerts'}
          </h3>
          
          {stats.warningLetters > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-orange-700 mb-2">
                {isZh ? `警告信 (${stats.warningLetters})` : `Warning Letters (${stats.warningLetters})`}
              </h4>
              <div className="space-y-2">
                {complianceData.warning_letters?.slice(0, 3).map((letter: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-orange-200">
                    <p className="font-medium text-slate-800">{letter.letter_subject || 'Warning Letter'}</p>
                    <p className="text-sm text-slate-600">{letter.issue_date && new Date(letter.issue_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {stats.recalls > 0 && (
            <div>
              <h4 className="font-medium text-red-700 mb-2">
                {isZh ? `召回事件 (${stats.recalls})` : `Recalls (${stats.recalls})`}
              </h4>
              <div className="space-y-2">
                {complianceData.recalls?.slice(0, 3).map((recall: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-red-200">
                    <p className="font-medium text-slate-800">{recall.product_name || 'Product Recall'}</p>
                    <p className="text-sm text-slate-600">{recall.recall_date && new Date(recall.recall_date).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
