'use client';

import { useRef, useState } from 'react';
import { Download, X, Share2, CheckCircle } from 'lucide-react';

interface ShareCardProps {
  company: {
    name: string;
    name_zh?: string;
    country?: string;
    description?: string;
  };
  locale: string;
  onClose: () => void;
}

export default function ShareCard({ company, locale, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const isZh = locale === 'zh';

  const generateCardImage = async () => {
    setIsGenerating(true);
    
    try {
      // 使用 html2canvas 或类似库生成图片
      // 这里简化处理，实际项目中需要引入 html2canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) return;
      
      // 设置画布尺寸
      canvas.width = 750;
      canvas.height = 1334;
      
      // 绘制背景
      const gradient = ctx.createLinearGradient(0, 0, 750, 1334);
      gradient.addColorStop(0, '#339999');
      gradient.addColorStop(1, '#2a7a7a');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 750, 1334);
      
      // 绘制卡片背景
      ctx.fillStyle = '#ffffff';
      ctx.roundRect(50, 200, 650, 800, 30);
      ctx.fill();
      
      // 绘制标题
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 48px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(company.name, 375, 350);
      
      if (company.name_zh) {
        ctx.fillStyle = '#64748b';
        ctx.font = '36px system-ui';
        ctx.fillText(company.name_zh, 375, 410);
      }
      
      // 绘制国家
      if (company.country) {
        ctx.fillStyle = '#339999';
        ctx.font = '32px system-ui';
        ctx.fillText(`📍 ${company.country}`, 375, 480);
      }
      
      // 绘制描述
      if (company.description) {
        ctx.fillStyle = '#475569';
        ctx.font = '28px system-ui';
        const words = company.description.slice(0, 100);
        ctx.fillText(words + (company.description.length > 100 ? '...' : ''), 375, 560);
      }
      
      // 绘制二维码区域
      ctx.fillStyle = '#f1f5f9';
      ctx.roundRect(225, 650, 300, 300, 20);
      ctx.fill();
      
      ctx.fillStyle = '#64748b';
      ctx.font = '24px system-ui';
      ctx.fillText(isZh ? '扫码查看详情' : 'Scan to view', 375, 990);
      
      // 绘制底部品牌
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px system-ui';
      ctx.fillText('MDLooker', 375, 1150);
      ctx.font = '28px system-ui';
      ctx.fillText(isZh ? '全球医疗器械合规平台' : 'Global Medical Device Compliance', 375, 1200);
      
      // 下载图片
      const link = document.createElement('a');
      link.download = `${company.name}-share-card.png`;
      link.href = canvas.toDataURL();
      link.click();
      
    } catch (e) {
      console.error('Failed to generate card:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  const shareNative = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: company.name,
          text: company.description || `${company.name} - ${company.name_zh || ''}`,
          url: window.location.href,
        });
      }
    } catch (e) {
      console.error('Share failed:', e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            {isZh ? '分享企业' : 'Share Company'}
          </h3>
          <button onClick={onClose} className="p-1">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Preview Card */}
        <div className="p-4">
          <div 
            ref={cardRef}
            className="bg-gradient-to-br from-[#339999] to-[#2a7a7a] rounded-2xl p-6 text-white"
          >
            <div className="bg-white rounded-xl p-4 text-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-[#339999] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">MD</span>
                </div>
                <span className="text-sm text-slate-500">MDLooker</span>
              </div>
              
              <h4 className="font-bold text-lg mb-1">{company.name}</h4>
              {company.name_zh && (
                <p className="text-slate-500 text-sm mb-2">{company.name_zh}</p>
              )}
              
              {company.country && (
                <div className="flex items-center gap-1 text-sm text-slate-600 mb-3">
                  <span>📍</span>
                  <span>{company.country}</span>
                </div>
              )}
              
              {company.description && (
                <p className="text-slate-600 text-sm line-clamp-2">
                  {company.description}
                </p>
              )}
              
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-slate-500">
                      {isZh ? '合规认证企业' : 'Certified Company'}
                    </span>
                  </div>
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs text-slate-400">QR</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
              <p className="text-white/90 text-sm">
                {isZh ? '扫码下载 MDLooker APP' : 'Scan to download MDLooker'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <button
            onClick={generateCardImage}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#339999] text-white rounded-xl font-medium disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            {isGenerating 
              ? (isZh ? '生成中...' : 'Generating...')
              : (isZh ? '保存分享卡片' : 'Save Share Card')
            }
          </button>
          
          <button
            onClick={shareNative}
            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium"
          >
            <Share2 className="w-5 h-5" />
            {isZh ? '更多分享方式' : 'More Share Options'}
          </button>
        </div>
      </div>
    </div>
  );
}
