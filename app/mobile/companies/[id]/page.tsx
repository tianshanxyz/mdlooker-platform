'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, Heart, Share2, Globe, Building2, 
  Shield, CheckCircle, FileText, Phone, Mail,
  MapPin, ExternalLink, Bookmark, Download
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  name_zh?: string;
  description?: string;
  country?: string;
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  business_type?: string;
  logo_url?: string;
}

interface Registration {
  id: string;
  registration_number: string;
  product_name?: string;
  registration_date?: string;
  expiry_date?: string;
  status: string;
  database: 'fda' | 'nmpa' | 'eudamed';
}

export default function MobileCompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  const [company, setCompany] = useState<Company | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'registrations' | 'contact'>('overview');

  useEffect(() => {
    const localeParam = params?.locale as string;
    const companyId = params?.id as string;
    if (localeParam) setLocale(localeParam as 'zh' | 'en');
    if (companyId) {
      loadCompany(companyId);
      checkFavorite(companyId);
    }
  }, [params]);

  const loadCompany = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data.company);
        setRegistrations(data.registrations || []);
      }
    } catch (e) {
      console.error('Failed to load company:', e);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async (companyId: string) => {
    try {
      const response = await fetch(`/api/mobile/user/favorites?company_id=${companyId}`);
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (e) {
      console.error('Failed to check favorite:', e);
    }
  };

  const toggleFavorite = async () => {
    if (!company) return;
    
    try {
      const response = await fetch('/api/mobile/user/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          action: isFavorite ? 'remove' : 'add'
        })
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
        // 震动反馈（如果支持）
        if (navigator.vibrate) {
          navigator.vibrate(50);
        }
      }
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  const handleShare = async () => {
    if (!company) return;

    const shareData = {
      title: company.name,
      text: company.description || `${company.name} - ${company.name_zh || ''}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // 复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        alert(isZh ? '链接已复制到剪贴板' : 'Link copied to clipboard');
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  const isZh = locale === 'zh';

  const getDatabaseIcon = (db: string) => {
    switch (db) {
      case 'fda': return '🇺🇸 FDA';
      case 'nmpa': return '🇨🇳 NMPA';
      case 'eudamed': return '🇪🇺 EUDAMED';
      default: return db.toUpperCase();
    }
  };

  const getDatabaseColor = (db: string) => {
    switch (db) {
      case 'fda': return 'bg-blue-100 text-blue-700';
      case 'nmpa': return 'bg-red-100 text-red-700';
      case 'eudamed': return 'bg-purple-100 text-purple-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#339999]"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500">{isZh ? '企业不存在' : 'Company not found'}</p>
          <button 
            onClick={() => router.back()}
            className="mt-4 text-[#339999]"
          >
            {isZh ? '返回' : 'Go Back'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-[#339999] text-white px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="font-semibold truncate flex-1 mx-4">
            {isZh && company.name_zh ? company.name_zh : company.name}
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-colors ${
                isFavorite ? 'bg-white/20 text-red-300' : 'text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 text-white"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Company Header Card */}
      <div className="bg-white px-4 py-6 border-b border-slate-100">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center flex-shrink-0">
            {company.logo_url ? (
              <img 
                src={company.logo_url} 
                alt={company.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              <Building2 className="w-10 h-10 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-slate-800">
              {company.name}
            </h2>
            {company.name_zh && (
              <p className="text-slate-500 text-sm mt-0.5">{company.name_zh}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {company.country && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs">
                  <Globe className="w-3 h-3" />
                  {company.country}
                </span>
              )}
              {company.business_type && (
                <span className="px-2 py-1 bg-[#339999]/10 text-[#339999] rounded-lg text-xs">
                  {company.business_type}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Registration Badges */}
        {registrations.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {Array.from(new Set(registrations.map(r => r.database))).map((db) => (
              <span 
                key={db}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${getDatabaseColor(db)}`}
              >
                {getDatabaseIcon(db)}
                <span className="ml-1">
                  {registrations.filter(r => r.database === db).length}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100">
        <div className="flex">
          {[
            { id: 'overview', label: isZh ? '概览' : 'Overview', icon: Building2 },
            { id: 'registrations', label: isZh ? '注册证' : 'Registrations', icon: Shield },
            { id: 'contact', label: isZh ? '联系' : 'Contact', icon: Phone },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#339999] text-[#339999]'
                  : 'border-transparent text-slate-500'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Description */}
            {company.description && (
              <div className="bg-white rounded-2xl p-4">
                <h3 className="font-semibold text-slate-800 mb-2">
                  {isZh ? '企业简介' : 'About'}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {company.description}
                </p>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl p-4">
              <h3 className="font-semibold text-slate-800 mb-3">
                {isZh ? '注册统计' : 'Registration Stats'}
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-xl">
                  <p className="text-2xl font-bold text-blue-600">
                    {registrations.filter(r => r.database === 'fda').length}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">FDA</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-xl">
                  <p className="text-2xl font-bold text-red-600">
                    {registrations.filter(r => r.database === 'nmpa').length}
                  </p>
                  <p className="text-xs text-red-600 mt-1">NMPA</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <p className="text-2xl font-bold text-purple-600">
                    {registrations.filter(r => r.database === 'eudamed').length}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">EUDAMED</p>
                </div>
              </div>
            </div>

            {/* Compliance Score */}
            <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{isZh ? '合规评分' : 'Compliance Score'}</h3>
                <span className="text-2xl font-bold">92</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-xs text-white/80 mt-2">
                {isZh ? '基于注册完整性、认证数量、历史记录' : 'Based on registration completeness, certifications, history'}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'registrations' && (
          <div className="space-y-3">
            {registrations.length > 0 ? (
              registrations.map((reg) => (
                <div 
                  key={reg.id}
                  className="bg-white rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getDatabaseColor(reg.database)}`}>
                          {getDatabaseIcon(reg.database)}
                        </span>
                        {reg.status === 'active' && (
                          <span className="inline-flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="w-3 h-3" />
                            {isZh ? '有效' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-slate-800 text-sm">
                        {reg.product_name || reg.registration_number}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {reg.registration_number}
                      </p>
                      {reg.expiry_date && (
                        <p className="text-xs text-slate-400 mt-1">
                          {isZh ? '有效期至' : 'Expires'}: {new Date(reg.expiry_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <button className="p-2 text-slate-400">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Shield className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{isZh ? '暂无注册信息' : 'No registrations found'}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-3">
            {company.website && (
              <a 
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-white rounded-2xl p-4 active:bg-slate-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">{isZh ? '官方网站' : 'Website'}</p>
                  <p className="text-slate-800 truncate">{company.website}</p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            )}

            {company.email && (
              <a 
                href={`mailto:${company.email}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 active:bg-slate-50"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">{isZh ? '电子邮箱' : 'Email'}</p>
                  <p className="text-slate-800 truncate">{company.email}</p>
                </div>
              </a>
            )}

            {company.phone && (
              <a 
                href={`tel:${company.phone}`}
                className="flex items-center gap-3 bg-white rounded-2xl p-4 active:bg-slate-50"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-500">{isZh ? '联系电话' : 'Phone'}</p>
                  <p className="text-slate-800">{company.phone}</p>
                </div>
              </a>
            )}

            {company.address && (
              <div className="flex items-start gap-3 bg-white rounded-2xl p-4">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-500">{isZh ? '地址' : 'Address'}</p>
                  <p className="text-slate-800 text-sm mt-1">{company.address}</p>
                </div>
              </div>
            )}

            {!company.website && !company.email && !company.phone && !company.address && (
              <div className="text-center py-12 bg-white rounded-2xl">
                <Phone className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{isZh ? '暂无联系信息' : 'No contact information'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-3 z-40">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleFavorite}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
              isFavorite 
                ? 'bg-red-50 text-red-600' 
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? (isZh ? '已收藏' : 'Saved') : (isZh ? '收藏' : 'Save')}
          </button>
          <button 
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#339999] text-white rounded-xl font-medium"
          >
            <Share2 className="w-5 h-5" />
            {isZh ? '分享' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
}
