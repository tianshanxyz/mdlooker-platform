'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isLast?: boolean;
}

interface BreadcrumbProps {
  locale: string;
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumb({ locale, customItems }: BreadcrumbProps) {
  const pathname = usePathname();
  const isZh = locale === 'zh';

  // 路径映射
  const pathMap: Record<string, { en: string; zh: string }> = {
    '': { en: 'Home', zh: '首页' },
    'compliance-profile': { en: 'Compliance Profile', zh: '合规档案' },
    'market-access': { en: 'Market Access', zh: '准入导航' },
    'guides': { en: 'Guides', zh: '指南' },
    'fda-510k-export': { en: 'FDA 510(k) Export', zh: 'FDA 510(k) 出口' },
    'nmpa-registration': { en: 'NMPA Registration', zh: 'NMPA 注册' },
    'eudamed-registration': { en: 'EUDAMED Registration', zh: 'EUDAMED 注册' },
    'companies': { en: 'Companies', zh: '公司' },
    'search': { en: 'Search', zh: '搜索' },
    'auth': { en: 'Auth', zh: '认证' },
    'signin': { en: 'Sign In', zh: '登录' },
    'profile': { en: 'Profile', zh: '个人资料' },
  };

  // 生成面包屑项目
  const generateBreadcrumbItems = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const paths = pathname.split('/').filter(Boolean);
    // 移除语言代码
    const pathSegments = paths.slice(1);
    
    const items: BreadcrumbItem[] = [
      {
        label: isZh ? '首页' : 'Home',
        href: `/${locale}`,
        isLast: pathSegments.length === 0,
      },
    ];

    let currentPath = `/${locale}`;
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      const mappedLabel = pathMap[segment];
      
      items.push({
        label: mappedLabel ? (isZh ? mappedLabel.zh : mappedLabel.en) : segment,
        href: currentPath,
        isLast,
      });
    });

    return items;
  };

  const items = generateBreadcrumbItems();

  // 如果只有首页，不显示面包屑
  if (items.length <= 1) return null;

  return (
    <nav className="py-4 px-6 bg-slate-50/50 border-b border-slate-100">
      <div className="max-w-6xl mx-auto">
        <ol className="flex items-center flex-wrap gap-2 text-sm">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
              )}
              
              {item.isLast ? (
                <span className="text-slate-500 font-medium">
                  {index === 0 && <Home className="w-4 h-4 inline mr-1" />}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-[#339999] hover:text-[#2a7a7a] transition-colors flex items-center"
                >
                  {index === 0 && <Home className="w-4 h-4 mr-1" />}
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
