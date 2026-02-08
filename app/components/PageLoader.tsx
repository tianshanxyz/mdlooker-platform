'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 模拟加载进度
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // 页面加载完成后隐藏loader
    const handleLoad = () => {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    return () => {
      clearInterval(progressInterval);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white transition-opacity duration-500">
      {/* Logo动画 */}
      <div className="relative mb-8">
        <div className="animate-pulse">
          <Image 
            src="/logo.png" 
            alt="MDLooker" 
            width={80} 
            height={80}
            className="animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>
        {/* 旋转光环 */}
        <div className="absolute inset-0 -m-4">
          <div className="w-[112px] h-[112px] border-2 border-[#339999]/20 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
        </div>
        <div className="absolute inset-0 -m-2">
          <div className="w-[96px] h-[96px] border-2 border-[#339999]/40 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
        </div>
      </div>

      {/* 品牌名称 */}
      <h1 className="text-2xl font-bold text-[#339999] mb-6 tracking-wide">
        MDLooker
      </h1>

      {/* 加载进度条 */}
      <div className="w-64 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#339999] to-[#2a7a7a] transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.min(progress, 100)}%` }}
        ></div>
      </div>

      {/* 加载文字 */}
      <p className="mt-4 text-sm text-slate-400 animate-pulse">
        Loading...
      </p>
    </div>
  );
}
