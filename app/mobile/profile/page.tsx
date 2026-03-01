'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, Heart, History, Download, Settings, 
  ChevronRight, Crown, Star, Trophy, Zap,
  LogOut, Bell, Shield, Globe
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: 'guest' | 'user' | 'vip';
  subscription_expires_at?: string;
  level: number;
  experience: number;
  achievements: string[];
}

interface Achievement {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export default function MobileProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [locale, setLocale] = useState<'zh' | 'en'>('zh');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    favorites: 0,
    searches: 0,
    downloads: 0,
    viewed: 0,
  });

  useEffect(() => {
    const localeParam = params?.locale as string;
    if (localeParam) setLocale(localeParam as 'zh' | 'en');
    loadUserData();
    loadStats();
  }, [params]);

  const loadUserData = async () => {
    try {
      const response = await fetch('/api/mobile/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = () => {
    const favorites = JSON.parse(localStorage.getItem(`favorites_${locale}`) || '[]');
    const history = JSON.parse(localStorage.getItem(`search_history_${locale}`) || '[]');
    const viewed = JSON.parse(localStorage.getItem(`viewed_${locale}`) || '[]');
    
    setStats({
      favorites: favorites.length,
      searches: history.length,
      downloads: 0, // 从服务器获取
      viewed: viewed.length,
    });
  };

  const isZh = locale === 'zh';

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'vip': return isZh ? 'VIP会员' : 'VIP Member';
      case 'user': return isZh ? '注册用户' : 'Registered User';
      default: return isZh ? '游客' : 'Guest';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'vip': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'user': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const achievements: Achievement[] = [
    { id: 'first_search', icon: '🔍', name: isZh ? '初识合规' : 'First Search', description: isZh ? '完成首次搜索' : 'Complete first search', unlocked: stats.searches > 0 },
    { id: 'collector', icon: '❤️', name: isZh ? '收藏家' : 'Collector', description: isZh ? '收藏5家企业' : 'Save 5 companies', unlocked: stats.favorites >= 5 },
    { id: 'expert', icon: '📥', name: isZh ? '下载达人' : 'Downloader', description: isZh ? '下载10份报告' : 'Download 10 reports', unlocked: stats.downloads >= 10 },
    { id: 'master', icon: '🎯', name: isZh ? '精准搜索' : 'Precise', description: isZh ? '连续7天使用' : '7-day streak', unlocked: false },
  ];

  const handleLogout = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push(`/${locale}/mobile`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#339999]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-[#339999] text-white px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold">{isZh ? '个人中心' : 'Profile'}</h1>
          <button className="p-2">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Info Card */}
        <div className="bg-white/10 backdrop-blur rounded-2xl p-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-lg">
                {user?.full_name || user?.email || (isZh ? '游客用户' : 'Guest')}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs border ${getRoleColor(user?.role || 'guest')}`}>
                  {getRoleLabel(user?.role || 'guest')}
                </span>
                {user?.role === 'vip' && user?.subscription_expires_at && (
                  <span className="text-xs text-white/70">
                    {isZh ? '有效期至' : 'Expires'}: {new Date(user.subscription_expires_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Level & Experience */}
          {user && user.role !== 'guest' && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  <span className="text-sm">{isZh ? '等级' : 'Level'} {user.level || 1}</span>
                </div>
                <span className="text-xs text-white/70">
                  {user.experience || 0} / {(user.level || 1) * 100} XP
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-300 rounded-full transition-all"
                  style={{ width: `${((user.experience || 0) % 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 py-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.favorites}</p>
            <p className="text-xs text-slate-500">{isZh ? '收藏' : 'Favorites'}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
              <History className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.searches}</p>
            <p className="text-xs text-slate-500">{isZh ? '搜索' : 'Searches'}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
              <Download className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.downloads}</p>
            <p className="text-xs text-slate-500">{isZh ? '下载' : 'Downloads'}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center">
            <div className="w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-lg font-bold text-slate-800">{stats.viewed}</p>
            <p className="text-xs text-slate-500">{isZh ? '浏览' : 'Viewed'}</p>
          </div>
        </div>

        {/* Achievements */}
        {user && user.role !== 'guest' && (
          <div className="bg-white rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">
                {isZh ? '我的成就' : 'Achievements'}
              </h3>
              <span className="text-xs text-slate-400">
                {achievements.filter(a => a.unlocked).length} / {achievements.length}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`flex flex-col items-center gap-2 p-2 rounded-xl ${
                    achievement.unlocked ? 'bg-amber-50' : 'bg-slate-50 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{achievement.icon}</span>
                  <span className="text-xs text-center text-slate-600 leading-tight">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          <button className="w-full flex items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-500" />
              </div>
              <span className="text-slate-700">{isZh ? '我的收藏' : 'My Favorites'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <History className="w-5 h-5 text-blue-500" />
              </div>
              <span className="text-slate-700">{isZh ? '搜索历史' : 'Search History'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-slate-700">{isZh ? '下载记录' : 'Downloads'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between p-4 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-purple-500" />
              </div>
              <span className="text-slate-700">{isZh ? '消息通知' : 'Notifications'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl overflow-hidden mb-4">
          <button className="w-full flex items-center justify-between p-4 border-b border-slate-100 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-slate-700">{isZh ? '语言设置' : 'Language'}</span>
            </div>
            <span className="text-sm text-slate-400">{isZh ? '简体中文' : 'English'}</span>
          </button>

          <button className="w-full flex items-center justify-between p-4 active:bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-slate-500" />
              </div>
              <span className="text-slate-700">{isZh ? '隐私设置' : 'Privacy'}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* VIP Upgrade Banner */}
        {(!user || user.role === 'guest' || user.role === 'user') && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-white">
                  {isZh ? '升级 VIP 会员' : 'Upgrade to VIP'}
                </p>
                <p className="text-xs text-white/80">
                  {isZh ? '解锁无限搜索、下载报告、API访问' : 'Unlimited search, reports, API access'}
                </p>
              </div>
              <button className="px-4 py-2 bg-white text-amber-500 rounded-lg text-sm font-bold">
                {isZh ? '升级' : 'Upgrade'}
              </button>
            </div>
          </div>
        )}

        {/* Logout */}
        {user && user.role !== 'guest' && (
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 text-red-500 active:bg-red-50 rounded-2xl"
          >
            <LogOut className="w-5 h-5" />
            <span>{isZh ? '退出登录' : 'Sign Out'}</span>
          </button>
        )}
      </main>
    </div>
  );
}
