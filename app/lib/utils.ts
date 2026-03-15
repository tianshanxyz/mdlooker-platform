/**
 * 计算证书状态
 * @param expiryDate 到期日期
 * @returns 'expired' | 'expiring' | 'active'
 */
export function getCertificateStatus(expiryDate: string | null | undefined): 'expired' | 'expiring' | 'active' {
  if (!expiryDate) return 'active';
  
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'expired';
  } else if (diffDays < 180) { // 6 个月内到期
    return 'expiring';
  } else {
    return 'active';
  }
}

/**
 * 获取证书状态标签
 */
export function getCertificateStatusLabel(status: 'expired' | 'expiring' | 'active', isZh: boolean): string {
  if (status === 'expired') {
    return isZh ? '已过期' : 'Expired';
  } else if (status === 'expiring') {
    return isZh ? '即将到期' : 'Expiring Soon';
  } else {
    return isZh ? '有效' : 'Active';
  }
}

/**
 * 获取证书状态颜色
 */
export function getCertificateStatusColor(status: 'expired' | 'expiring' | 'active'): string {
  if (status === 'expired') {
    return 'bg-red-100 text-red-800 border-red-200';
  } else if (status === 'expiring') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  } else {
    return 'bg-green-100 text-green-800 border-green-200';
  }
}

/**
 * 格式化日期
 */
export function formatDate(dateString: string | null | undefined, isZh: boolean): string {
  if (!dateString) return isZh ? '未知' : 'Unknown';
  
  const date = new Date(dateString);
  if (isZh) {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
