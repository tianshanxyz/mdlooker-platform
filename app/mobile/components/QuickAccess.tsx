'use client';

import { useState, useEffect } from 'react';
import { History, Heart, Eye, ScanLine, ArrowRight, Clock } from 'lucide-react';

interface QuickAccessProps {
  locale: string;
  onNavigate: (path: string) => void;
}

interface QuickItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  labelEn: string;
  count?: number;
  color: string;
  path: string;
}

export default function QuickAccess({ locale, onNavigate }: QuickAccessProps) {
  const [items, setItems] = useState<QuickItem[]>([]);
  const isZh = locale === 'zh';

  useEffect(() => {
    // 加载各项数据
    const loadData = () => {
      const history = JSON.parse(localStorage.getItem(`search_history_${locale}`) || '[]');
      const favorites = JSON.parse(localStorage.getItem(`favorites_${locale}`) || '[]');
      const viewed = JSON.parse(localStorage.getItem(`viewed_${locale}`) || '[]');

      const quickItems: QuickItem[] = [
        {
          id: 'history',
          icon: <History className="w-5 h-5" />,
          label: '最近搜索',
          labelEn: 'History',
          count: history.length,
          color: 'bg-blue-100 text-blue-600',
          path: '/history',
        },
        {
          id: 'favorites',
          icon: <Heart className="w-5 h-5" />,
          label: '我的收藏',
          labelEn: 'Favorites',
          count: favorites.length,
          color: 'bg-red-100 text-red-600',
          path: '/favorites',
        },
        {
          id: 'viewed',
          icon: <Eye className="w-5 h-5" />,
          label: '浏览记录',
          labelEn: 'Viewed',
          count: viewed.length,
          color: 'bg-purple-100 text-purple-600',
          path: '/viewed',
        },
        {
          id: 'scan',
          icon: <ScanLine className="w-5 h-5" />,
          label: '扫码查UDI',
          labelEn: 'Scan UDI',
          color: 'bg-[#339999]/10 text-[#339999]',
          path: '/scan',
        },
      ];

      setItems(quickItems);
    };

    loadData();
    // 监听存储变化
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [locale]);

  const handleClick = (item: QuickItem) => {
    if (item.id === 'scan') {
      // 触发扫码
      const scanButton = document.querySelector('[data-scan-trigger]') as HTMLButtonElement;
      scanButton?.click();
    } else {
      onNavigate(item.path);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-700">
          {isZh ? '快捷入口' : 'Quick Access'}
        </h3>
        <button className="text-xs text-[#339999] flex items-center gap-1">
          {isZh ? '更多' : 'More'}
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => handleClick(item)}
            className="flex flex-col items-center gap-2 group"
          >
            <div className={`
              relative w-12 h-12 rounded-xl flex items-center justify-center
              ${item.color}
              transition-transform group-active:scale-95
            `}>
              {item.icon}
              {item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {item.count > 99 ? '99+' : item.count}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-600 text-center leading-tight">
              {isZh ? item.label : item.labelEn}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
