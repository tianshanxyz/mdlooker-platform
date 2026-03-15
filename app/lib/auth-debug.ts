/**
 * 临时权限补丁 - 调试模式
 * 
 * 让所有用户（包括游客）都拥有 VIP 权限，方便调试
 * 
 * 使用方法：
 * 1. 在需要权限检查的地方导入此文件
 * 2. 使用 checkPermissionDebug 代替 checkPermission
 * 
 * 注意：此文件仅用于调试，生产环境请勿使用！
 */

import { createClient } from './supabase';

export type UserRole = 'guest' | 'user' | 'vip';

export interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

/**
 * 调试模式权限检查 - 始终返回 true（允许所有操作）
 */
export async function checkPermissionDebug(
  userId: string | undefined,
  resource: string,
  action: string
): Promise<boolean> {
  // 调试模式：允许所有权限
  return true;
}

/**
 * 调试模式获取用户角色 - 始终返回 'vip'
 */
export async function getUserRoleDebug(userId: string | undefined): Promise<UserRole> {
  // 调试模式：所有人都是 VIP
  return 'vip';
}

/**
 * 获取所有权限（调试模式）
 */
export async function getRolePermissionsDebug(role: UserRole): Promise<Permission[]> {
  // 返回所有权限
  return [
    { resource: 'companies', action: 'read', allowed: true },
    { resource: 'companies', action: 'search', allowed: true },
    { resource: 'companies', action: 'export', allowed: true },
    { resource: 'market_access', action: 'read', allowed: true },
    { resource: 'market_access', action: 'download', allowed: true },
    { resource: 'regulations', action: 'read', allowed: true },
    { resource: 'regulations', action: 'download', allowed: true },
    { resource: 'analytics', action: 'read', allowed: true },
    { resource: 'api', action: 'access', allowed: true },
    { resource: 'monitoring', action: 'read', allowed: true },
    { resource: 'monitoring', action: 'write', allowed: true },
    { resource: 'stats', action: 'read', allowed: true },
  ];
}

/**
 * 升级用户角色（调试模式）- 直接设置为 VIP
 */
export async function upgradeUserRoleDebug(
  userId: string,
  newRole: UserRole
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role: 'vip' }) // 强制设置为 VIP
    .eq('id', userId);

  return !error;
}

/**
 * 自动将所有用户升级为 VIP（一次性操作）
 * 在应用启动时调用此函数
 */
export async function upgradeAllUsersToVIP(): Promise<void> {
  try {
    const supabase = createClient();

    console.log('🔧 [调试模式] 正在将所有用户升级为 VIP...');

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'vip' });

    if (error) {
      console.error('❌ 升级用户失败:', error);
    } else {
      console.log('✅ [调试模式] 所有用户已升级为 VIP');
    }
  } catch (error) {
    console.error('❌ 升级用户出错:', error);
  }
}

/**
 * 权限常量（调试模式）
 */
export const PermissionsDebug = {
  // Companies
  COMPANIES_READ: { resource: 'companies', action: 'read' },
  COMPANIES_SEARCH: { resource: 'companies', action: 'search' },
  COMPANIES_EXPORT: { resource: 'companies', action: 'export' },

  // Market Access
  MARKET_ACCESS_READ: { resource: 'market_access', action: 'read' },
  MARKET_ACCESS_DOWNLOAD: { resource: 'market_access', action: 'download' },

  // Regulations
  REGULATIONS_READ: { resource: 'regulations', action: 'read' },
  REGULATIONS_DOWNLOAD: { resource: 'regulations', action: 'download' },

  // Analytics
  ANALYTICS_READ: { resource: 'analytics', action: 'read' },

  // API
  API_ACCESS: { resource: 'api', action: 'access' },

  // Monitoring
  MONITORING_READ: { resource: 'monitoring', action: 'read' },
  MONITORING_WRITE: { resource: 'monitoring', action: 'write' },

  // Stats
  STATS_READ: { resource: 'stats', action: 'read' },
} as const;
