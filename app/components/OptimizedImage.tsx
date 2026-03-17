'use client';

import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * 优化的图片组件
 * - 支持懒加载
 * - 支持响应式图片
 * - 支持占位符
 * - 自动 WebP 检测
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [supportsWebP, setSupportsWebP] = useState(true);
  const imgRef = useRef<HTMLImageElement>(null);

  // 检测 WebP 支持
  useEffect(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const supports = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    setSupportsWebP(supports);
  }, []);

  // 懒加载逻辑
  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  // 处理图片格式（自动转换为 WebP）
  const getOptimizedSrc = (source: string) => {
    if (!supportsWebP) return source;
    
    // 如果是外部图片或不支持转换的格式，直接返回
    if (source.startsWith('http') || source.includes('data:')) {
      return source;
    }
    
    // 添加 WebP 转换
    const ext = source.split('.').pop();
    if (ext && ['jpg', 'jpeg', 'png', 'gif'].includes(ext.toLowerCase())) {
      return source.replace(`.${ext}`, '.webp');
    }
    
    return source;
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : 'auto',
      }}
    >
      {/* 占位符 */}
      {!isLoaded && placeholder === 'blur' && blurDataURL && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{
            backgroundImage: `url(${blurDataURL})`,
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* 实际图片 */}
      {isInView && (
        <img
          src={getOptimizedSrc(src)}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            w-full h-full object-cover
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}

      {/* 加载占位符 */}
      {!isLoaded && placeholder !== 'blur' && (
        <div className="absolute inset-0 bg-slate-200 animate-pulse" />
      )}
    </div>
  );
}

/**
 * 图片懒加载 Hook
 */
export function useImageLazyLoad(threshold = 0.01, rootMargin = '50px') {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);

  return [setRef, isInView] as const;
}
