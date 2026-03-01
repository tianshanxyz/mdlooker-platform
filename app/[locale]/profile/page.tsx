'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/app/lib/supabase';
import { UserRole, getRolePermissions } from '@/app/lib/auth';

// Icons
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function MailIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function CrownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  company_name: string | null;
  job_title: string | null;
  phone: string | null;
  country: string | null;
  subscription_status: string;
  subscription_expires_at: string | null;
  created_at: string;
}

export default function ProfilePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<ProfileData>>({});

  useEffect(() => {
    async function loadProfile() {
      if (!session?.user?.id) return;

      setIsLoading(true);
      const supabase = createClient();

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setEditForm(profileData);

        // Load permissions
        const perms = await getRolePermissions(profileData.role);
        setPermissions(perms.filter(p => p.allowed).map(p => `${p.resource}:${p.action}`));
      }

      setIsLoading(false);
    }

    loadProfile();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user?.id) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name,
        company_name: editForm.company_name,
        job_title: editForm.job_title,
        phone: editForm.phone,
        country: editForm.country,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      guest: 'bg-slate-100 text-slate-700',
      user: 'bg-blue-100 text-blue-700',
      vip: 'bg-amber-100 text-amber-700 border-amber-300',
    };

    const labels = {
      guest: locale === 'zh' ? '访客' : 'Guest',
      user: locale === 'zh' ? '注册用户' : 'User',
      vip: locale === 'zh' ? 'VIP会员' : 'VIP Member',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${styles[role]} ${role === 'vip' ? 'border' : ''}`}>
        {role === 'vip' && <CrownIcon className="w-4 h-4" />}
        {labels[role]}
      </span>
    );
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
            {locale === 'zh' ? '请先登录' : 'Please Sign In'}
          </h1>
          <p className="text-slate-600 mb-6">
            {locale === 'zh' ? '您需要登录才能查看个人资料' : 'You need to sign in to view your profile'}
          </p>
          <Link
            href={`/${locale}/auth/signin?callbackUrl=/${locale}/profile`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#339999] text-white rounded-lg font-medium hover:bg-[#2a7a7a] transition-colors"
          >
            {locale === 'zh' ? '立即登录' : 'Sign In'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {locale === 'zh' ? '个人资料' : 'My Profile'}
        </h1>
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}` })}
          className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogoutIcon className="w-5 h-5" />
          {locale === 'zh' ? '退出登录' : 'Sign Out'}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#339999] to-[#2a7a7a] flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.full_name?.charAt(0) || profile?.email?.charAt(0) || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {profile?.full_name || locale === 'zh' ? '未设置姓名' : 'No name set'}
                  </h2>
                  <p className="text-slate-500">{profile?.email}</p>
                  <div className="mt-2">
                    {profile && getRoleBadge(profile.role)}
                  </div>
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 text-[#339999] hover:bg-[#339999]/10 rounded-lg transition-colors"
                >
                  {locale === 'zh' ? '编辑' : 'Edit'}
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {locale === 'zh' ? '全名' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={editForm.full_name || ''}
                    onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {locale === 'zh' ? '公司名称' : 'Company'}
                    </label>
                    <input
                      type="text"
                      value={editForm.company_name || ''}
                      onChange={(e) => setEditForm({ ...editForm, company_name: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {locale === 'zh' ? '职位' : 'Job Title'}
                    </label>
                    <input
                      type="text"
                      value={editForm.job_title || ''}
                      onChange={(e) => setEditForm({ ...editForm, job_title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {locale === 'zh' ? '电话' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={editForm.phone || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {locale === 'zh' ? '国家/地区' : 'Country'}
                    </label>
                    <input
                      type="text"
                      value={editForm.country || ''}
                      onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#339999]"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#339999] text-white rounded-lg hover:bg-[#2a7a7a] transition-colors"
                  >
                    {locale === 'zh' ? '保存' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(profile || {});
                    }}
                    className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    {locale === 'zh' ? '取消' : 'Cancel'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <BuildingIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '公司' : 'Company'}</p>
                    <p className="text-sm font-medium text-slate-900">{profile?.company_name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <UserIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '职位' : 'Job Title'}</p>
                    <p className="text-sm font-medium text-slate-900">{profile?.job_title || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <MailIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '电话' : 'Phone'}</p>
                    <p className="text-sm font-medium text-slate-900">{profile?.phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <BuildingIcon className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500">{locale === 'zh' ? '国家/地区' : 'Country'}</p>
                    <p className="text-sm font-medium text-slate-900">{profile?.country || '-'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Permissions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {locale === 'zh' ? '我的权限' : 'My Permissions'}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {permissions.map((perm) => {
                const [resource, action] = perm.split(':');
                const resourceLabels: Record<string, string> = {
                  companies: locale === 'zh' ? '公司数据' : 'Companies',
                  market_access: locale === 'zh' ? '市场准入' : 'Market Access',
                  regulations: locale === 'zh' ? '法规' : 'Regulations',
                  analytics: locale === 'zh' ? '分析' : 'Analytics',
                  api: 'API',
                };
                const actionLabels: Record<string, string> = {
                  read: locale === 'zh' ? '查看' : 'Read',
                  search: locale === 'zh' ? '搜索' : 'Search',
                  download: locale === 'zh' ? '下载' : 'Download',
                  export: locale === 'zh' ? '导出' : 'Export',
                  access: locale === 'zh' ? '访问' : 'Access',
                };
                return (
                  <div key={perm} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-green-800">
                      {resourceLabels[resource] || resource}: {actionLabels[action] || action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column - Subscription */}
        <div className="space-y-6">
          {/* Subscription Status */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {locale === 'zh' ? '订阅状态' : 'Subscription'}
            </h3>
            <div className="text-center">
              {profile?.role === 'vip' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                    <CrownIcon className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-amber-600 font-medium">
                    {locale === 'zh' ? 'VIP会员' : 'VIP Member'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {profile?.subscription_expires_at
                      ? `${locale === 'zh' ? '有效期至' : 'Valid until'} ${new Date(profile.subscription_expires_at).toLocaleDateString()}`
                      : locale === 'zh' ? '永久有效' : 'Lifetime access'}
                  </p>
                </>
              ) : profile?.role === 'user' ? (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-blue-600 font-medium">
                    {locale === 'zh' ? '注册用户' : 'Registered User'}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    {locale === 'zh' ? '免费账户' : 'Free account'}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    {locale === 'zh' ? '访客' : 'Guest'}
                  </p>
                </>
              )}
            </div>

            {profile?.role !== 'vip' && (
              <Link
                href={`/${locale}/pricing`}
                className="mt-4 w-full block text-center px-4 py-2 bg-[#339999] text-white rounded-lg hover:bg-[#2a7a7a] transition-colors"
              >
                {locale === 'zh' ? '升级VIP' : 'Upgrade to VIP'}
              </Link>
            )}
          </div>

          {/* Member Since */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {locale === 'zh' ? '会员信息' : 'Member Info'}
            </h3>
            <p className="text-sm text-slate-500">
              {locale === 'zh' ? '注册时间' : 'Member since'}
            </p>
            <p className="font-medium text-slate-900">
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : '-'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
