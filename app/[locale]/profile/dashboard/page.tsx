'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { createClient } from '@/app/lib/supabase';
import { 
  Heart, 
  Eye, 
  Search, 
  Download, 
  TrendingUp, 
  Building2, 
  Package, 
  Shield,
  Clock,
  Star,
  BarChart3,
  Settings,
  ChevronRight
} from 'lucide-react';

interface DashboardStats {
  totalViews: number;
  totalSearches: number;
  totalDownloads: number;
  favoriteCompanies: number;
  favoriteProducts: number;
  monitoringItems: number;
}

interface RecentActivity {
  id: string;
  activity_type: 'view' | 'search' | 'download';
  target_type: 'company' | 'product' | 'regulator';
  target_name: string;
  target_name_zh?: string;
  created_at: string;
}

interface FavoriteItem {
  id: string;
  item_id: string;
  item_type: 'company' | 'product';
  item_name: string;
  item_name_zh?: string;
  added_at: string;
}

export default function DashboardPage() {
  const params = useParams();
  const { data: session, status } = useSession();
  const [locale, setLocale] = useState('en');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam) {
      setLocale(localeParam);
    }
  }, [params]);

  useEffect(() => {
    async function loadDashboard() {
      if (!session?.user?.id || status !== 'authenticated') {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const supabase = createClient();

      try {
        // Load stats
        const [viewsRes, searchesRes, downloadsRes, favCompaniesRes, favProductsRes, monitoringRes] = await Promise.all([
          supabase.from('user_activities')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('activity_type', 'view'),
          
          supabase.from('user_activities')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('activity_type', 'search'),
          
          supabase.from('user_activities')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('activity_type', 'download'),
          
          supabase.from('favorites')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('item_type', 'company'),
          
          supabase.from('favorites')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('item_type', 'product'),
          
          supabase.from('monitoring_items')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', session.user.id),
        ]);

        setStats({
          totalViews: viewsRes.count || 0,
          totalSearches: searchesRes.count || 0,
          totalDownloads: downloadsRes.count || 0,
          favoriteCompanies: favCompaniesRes.count || 0,
          favoriteProducts: favProductsRes.count || 0,
          monitoringItems: monitoringRes.count || 0,
        });

        // Load recent activities
        const { data: activities } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activities) {
          setRecentActivities(activities);
        }

        // Load favorites
        const { data: favs } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (favs) {
          setFavorites(favs);
        }
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, [session, status]);

  const isZh = locale === 'zh';

  const t = {
    dashboard: isZh ? '个人中心' : 'Dashboard',
    welcomeBack: isZh ? '欢迎回来' : 'Welcome back',
    loading: isZh ? '加载中...' : 'Loading...',
    pleaseLogin: isZh ? '请先登录' : 'Please sign in',
    needLogin: isZh ? '您需要登录才能查看个人中心' : 'You need to sign in to view your dashboard',
    signIn: isZh ? '立即登录' : 'Sign In',
    overview: isZh ? '概览' : 'Overview',
    recentActivity: isZh ? '最近活动' : 'Recent Activity',
    myFavorites: isZh ? '我的收藏' : 'My Favorites',
    myMonitoring: isZh ? '我的监控' : 'My Monitoring',
    views: isZh ? '次浏览' : 'views',
    searches: isZh ? '次搜索' : 'searches',
    downloads: isZh ? '次下载' : 'downloads',
    companies: isZh ? '家企业' : 'companies',
    products: isZh ? '个产品' : 'products',
    items: isZh ? '个监控项' : 'items',
    viewed: isZh ? '查看' : 'Viewed',
    searched: isZh ? '搜索' : 'Searched',
    downloaded: isZh ? '下载' : 'Downloaded',
    noActivity: isZh ? '暂无活动记录' : 'No recent activity',
    noFavorites: isZh ? '暂无收藏' : 'No favorites yet',
    viewAll: isZh ? '查看全部' : 'View all',
    company: isZh ? '企业' : 'Company',
    product: isZh ? '产品' : 'Product',
    regulator: isZh ? '监管机构' : 'Regulator',
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999]"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">
            {t.pleaseLogin}
          </h1>
          <p className="text-slate-600 mb-6">
            {t.needLogin}
          </p>
          <Link
            href={`/${locale}/auth/signin?callbackUrl=/${locale}/profile/dashboard`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
          >
            {t.signIn}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#339999] to-[#2a7a7a] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {t.welcomeBack}, {session.user?.name || session.user?.email}
              </h1>
              <p className="text-white/80">
                {new Date().toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Link
              href={`/${locale}/profile`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
              {isZh ? '个人设置' : 'Settings'}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalViews || 0}</p>
                <p className="text-sm text-slate-500">{t.views}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Search className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalSearches || 0}</p>
                <p className="text-sm text-slate-500">{t.searches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalDownloads || 0}</p>
                <p className="text-sm text-slate-500">{t.downloads}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {(stats?.favoriteCompanies || 0) + (stats?.favoriteProducts || 0)}
                </p>
                <p className="text-sm text-slate-500">{isZh ? '个收藏' : 'favorites'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                {t.recentActivity}
              </h2>
              <Link
                href={`/${locale}/profile/activity`}
                className="text-sm text-[#339999] hover:text-[#2a7a7a] flex items-center gap-1"
              >
                {t.viewAll}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl"
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.activity_type === 'view' ? 'bg-blue-100 text-blue-600' :
                      activity.activity_type === 'search' ? 'bg-purple-100 text-purple-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {activity.activity_type === 'view' ? <Eye className="w-5 h-5" /> :
                       activity.activity_type === 'search' ? <Search className="w-5 h-5" /> :
                       <Download className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.activity_type === 'view' ? t.viewed :
                         activity.activity_type === 'search' ? t.searched :
                         t.downloaded}
                        {' '}
                        {activity.target_type === 'company' ? t.company :
                         activity.target_type === 'product' ? t.product :
                         t.regulator}
                      </p>
                      <p className="text-sm text-slate-500">
                        {locale === 'zh' && activity.target_name_zh 
                          ? activity.target_name_zh 
                          : activity.target_name}
                      </p>
                    </div>
                    <div className="text-xs text-slate-400">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">{t.noActivity}</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-slate-400" />
              {isZh ? '快速访问' : 'Quick Access'}
            </h2>

            <div className="space-y-3">
              <Link
                href={`/${locale}/search`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-[#339999]/10 rounded-lg flex items-center justify-center">
                  <Search className="w-5 h-5 text-[#339999]" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{isZh ? '统一搜索' : 'Search'}</p>
                  <p className="text-xs text-slate-500">{isZh ? '查找企业、产品' : 'Find companies, products'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/${locale}/regulators`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{isZh ? '监管机构' : 'Regulators'}</p>
                  <p className="text-xs text-slate-500">{isZh ? '全球监管机构' : 'Global agencies'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/${locale}/product-tracker`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{isZh ? '产品追踪' : 'Product Tracker'}</p>
                  <p className="text-xs text-slate-500">{isZh ? '全球注册状态' : 'Global status'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                href={`/${locale}/monitoring`}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{isZh ? '监控中心' : 'Monitoring'}</p>
                  <p className="text-xs text-slate-500">{isZh ? '关注动态' : 'Track changes'}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
