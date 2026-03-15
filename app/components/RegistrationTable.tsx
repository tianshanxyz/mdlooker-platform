'use client';

import { getCertificateStatus, getCertificateStatusLabel, getCertificateStatusColor, formatDate } from '@/app/lib/utils';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

interface RegistrationItem {
  id?: string;
  product_name?: string;
  product_name_zh?: string;
  device_name?: string;
  device_name_zh?: string;
  registration_number?: string;
  approval_date?: string;
  expiry_date?: string;
  valid_until?: string;
  certificate_status?: string;
  manufacturer?: string;
  manufacturer_zh?: string;
  [key: string]: any;
}

interface RegistrationTableProps {
  registrations: RegistrationItem[];
  title: string;
  isZh: boolean;
  emptyMessage?: string;
}

export function RegistrationTable({ registrations, title, isZh, emptyMessage }: RegistrationTableProps) {
  if (!registrations || registrations.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {emptyMessage || (isZh ? '暂无数据' : 'No data available')}
      </div>
    );
  }

  const getExpiryDate = (reg: RegistrationItem) => {
    // NMPA 使用 expiration_date，其他可能使用 expiry_date 或 valid_until
    return reg.expiration_date || reg.expiry_date || reg.valid_until || reg.certificate_expiry_date;
  };

  const getStatus = (reg: RegistrationItem) => {
    const expiryDate = getExpiryDate(reg);
    return getCertificateStatus(expiryDate);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isZh ? '产品名称' : 'Product Name'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isZh ? '注册证号' : 'Registration Number'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isZh ? '批准日期' : 'Approval Date'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isZh ? '到期日期' : 'Expiry Date'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isZh ? '状态' : 'Status'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {registrations.map((reg, index) => {
            const status = getStatus(reg);
            const statusLabel = getCertificateStatusLabel(status, isZh);
            const statusColor = getCertificateStatusColor(status);
            const expiryDate = getExpiryDate(reg);
            
            return (
              <tr key={reg.id || index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {isZh ? (reg.product_name_zh || reg.product_name) : (reg.product_name || reg.product_name_zh)}
                  </div>
                  {reg.manufacturer_zh && (
                    <div className="text-sm text-gray-500">
                      {isZh ? reg.manufacturer_zh : reg.manufacturer}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{reg.registration_number}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(reg.approval_date, isZh)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {expiryDate ? (
                    <div className="text-sm text-gray-900">{formatDate(expiryDate, isZh)}</div>
                  ) : (
                    <div className="text-sm text-gray-400">{isZh ? '长期有效' : 'Permanent'}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {status !== 'active' ? (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
                      {status === 'expired' && <AlertCircle className="w-3 h-3 mr-1" />}
                      {status === 'expiring' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {statusLabel}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {statusLabel}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * 统计即将到期的证书
 */
export function getExpiringStats(registrations: any[], isZh: boolean) {
  let expiredCount = 0;
  let expiringCount = 0;
  
  registrations.forEach(reg => {
    const expiryDate = reg.expiry_date || reg.valid_until || reg.certificate_expiry_date;
    const status = getCertificateStatus(expiryDate);
    
    if (status === 'expired') {
      expiredCount++;
    } else if (status === 'expiring') {
      expiringCount++;
    }
  });
  
  return { expiredCount, expiringCount };
}
