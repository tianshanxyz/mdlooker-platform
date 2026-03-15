'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { translations, locales, type Locale } from '../../i18n-config';
import { Heart, Bell, Building2, TrendingUp, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

interface Favorite {
  id: string;
  company_id: string;
  company: {
    id: string;
    name: string;
    name_zh: string;
    country: string;
    business_type: string;
  };
  unread_count: number;
  created_at: string;
}

interface Notification {
  id: string;
  notification_type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function MonitoringPage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>('en');
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'favorites' | 'notifications'>('favorites');

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam && locales.includes(localeParam as Locale)) {
      setLocale(localeParam as Locale);
    }
  }, [params]);

  const t = translations[locale];
  const isZh = locale === 'zh';

  // 模拟用户 ID（实际应该从认证系统获取）
  const userId = 'current-user-id';

  useEffect(() => {
    loadMonitoringData();
  }, []);

  const loadMonitoringData = async () => {
    setLoading(true);
    try {
      // 加载收藏列表
      const favResponse = await fetch(`/api/favorites?user_id=${userId}`);
      if (favResponse.ok) {
        const favData = await favResponse.json();
        setFavorites(favData.favorites || []);
      }

      // TODO: 加载通知列表
      // const notifResponse = await fetch(`/api/notifications?user_id=${userId}`);
      
    } catch (error) {
      console.error('Load monitoring data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    if (!confirm(isZh ? '确定要取消收藏吗？' : 'Are you sure to remove this favorite?')) {
      return;
    }

    try {
      const response = await fetch(`/api/favorites?id=${favoriteId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setFavorites(favorites.filter(f => f.id !== favoriteId));
      }
    } catch (error) {
      console.error('Remove favorite error:', error);
    }
  };

  const getTotalUnreadCount = () => {
    return favorites.reduce((sum, f) => sum + f.unread_count, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              {isZh ? '竞品监控' : 'Competitor Monitoring'}
            </h1>
          </div>
          <p className="text-gray-600">
            {isZh 
              ? '收藏关注的公司，及时获取最新注册动态' 
              : 'Follow companies and get notified about their latest regulatory activities'}
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isZh ? '收藏公司' : 'Favorite Companies'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{favorites.length}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-6 h-6 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isZh ? '未读通知' : 'Unread Notifications'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">{getTotalUnreadCount()}</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {isZh ? '本月新增' : 'New This Month'}
              </h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>
        </div>

        {/* 标签页 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('favorites')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'favorites'
                  ? 'text-[#339999] border-b-2 border-[#339999]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isZh ? '我的收藏' : 'My Favorites'}
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === 'notifications'
                  ? 'text-[#339999] border-b-2 border-[#339999]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isZh ? '通知' : 'Notifications'}
              {getTotalUnreadCount() > 0 && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium text-white bg-red-500 rounded-full">
                  {getTotalUnreadCount()}
                </span>
              )}
            </button>
          </div>

          {/* 收藏列表 */}
          {activeTab === 'favorites' && (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#339999] mx-auto"></div>
                  <p className="mt-4 text-gray-600">{isZh ? '加载中...' : 'Loading...'}</p>
                </div>
              ) : favorites.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isZh ? '还没有收藏任何公司' : 'No favorites yet'}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {isZh ? '浏览公司时点击"收藏"按钮，即可在这里查看他们的最新动态' : 'Click the "Favorite" button on company pages to track their activities'}
                  </p>
                  <button
                    onClick={() => router.push(`/${locale}/`)}
                    className="px-6 py-2 bg-[#339999] text-white rounded-lg hover:bg-[#2a7a7a] transition-colors"
                  >
                    {isZh ? '去搜索公司' : 'Search Companies'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {favorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 bg-[#339999]/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-[#339999]" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {isZh ? favorite.company.name_zh : favorite.company.name}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{favorite.company.country}</span>
                            <span>•</span>
                            <span>{favorite.company.business_type}</span>
                            {favorite.unread_count > 0 && (
                              <>
                                <span>•</span>
                                <span className="text-red-600 font-medium">
                                  {favorite.unread_count} {isZh ? '条新通知' : 'new notifications'}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => router.push(`/${locale}/companies/${favorite.company_id}`)}
                          className="px-4 py-2 text-sm text-[#339999] hover:bg-[#339999]/10 rounded transition-colors"
                        >
                          {isZh ? '查看详情' : 'View Details'}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFavorite(favorite.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title={isZh ? '取消收藏' : 'Remove favorite'}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 通知列表 */}
          {activeTab === 'notifications' && (
            <div className="p-6">
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '暂无通知' : 'No notifications'}
                </h3>
                <p className="text-gray-600">
                  {isZh ? '当你收藏的公司有新注册时，会在这里显示通知' : 'Notifications about new registrations from your favorite companies will appear here'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
