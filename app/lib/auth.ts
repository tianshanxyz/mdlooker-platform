import { createClient } from './supabase';

export type UserRole = 'guest' | 'user' | 'vip';

export interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

// Check if user has permission
export async function checkPermission(
  userId: string | undefined,
  resource: string,
  action: string
): Promise<boolean> {
  if (!userId) {
    // Guest users - check guest permissions
    return checkGuestPermission(resource, action);
  }

  const supabase = createClient();

  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  // Get permission for role
  const { data: permission } = await supabase
    .from('permissions')
    .select('allowed')
    .eq('role', profile.role)
    .eq('resource', resource)
    .eq('action', action)
    .single();

  return permission?.allowed ?? false;
}

// Check guest permissions
async function checkGuestPermission(resource: string, action: string): Promise<boolean> {
  const supabase = createClient();

  const { data: permission } = await supabase
    .from('permissions')
    .select('allowed')
    .eq('role', 'guest')
    .eq('resource', resource)
    .eq('action', action)
    .single();

  return permission?.allowed ?? false;
}

// Get user role
export async function getUserRole(userId: string | undefined): Promise<UserRole> {
  if (!userId) return 'guest';

  const supabase = createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return profile?.role || 'guest';
}

// Get all permissions for a role
export async function getRolePermissions(role: UserRole): Promise<Permission[]> {
  const supabase = createClient();

  const { data: permissions } = await supabase
    .from('permissions')
    .select('resource, action, allowed')
    .eq('role', role);

  return permissions || [];
}

// Upgrade user role (for admin use)
export async function upgradeUserRole(
  userId: string,
  newRole: UserRole
): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  return !error;
}

// Track download
export async function trackDownload(
  userId: string,
  resourceType: string,
  resourceId: string,
  fileName: string
): Promise<void> {
  const supabase = createClient();

  await supabase.from('download_history').insert({
    user_id: userId,
    resource_type: resourceType,
    resource_id: resourceId,
    file_name: fileName,
  });
}

// Permission helpers
export const Permissions = {
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

  // Analytics (VIP only)
  ANALYTICS_READ: { resource: 'analytics', action: 'read' },

  // API (VIP only)
  API_ACCESS: { resource: 'api', action: 'access' },
} as const;
