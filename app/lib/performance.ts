/**
 * 性能优化配置
 * 
 * 用于优化 Core Web Vitals 指标：
 * - LCP (Largest Contentful Paint): < 2.5s
 * - FID (First Input Delay): < 100ms
 * - CLS (Cumulative Layout Shift): < 0.1
 */

/**
 * 关键资源预加载配置
 */
export const preloadResources = {
  // 字体预加载
  fonts: [
    {
      href: '/fonts/inter-var.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous',
    },
  ],
  
  // 关键 CSS 预加载
  styles: [
    {
      href: '/css/critical.css',
      as: 'style',
    },
  ],
  
  // 关键图片预加载（LCP 元素）
  images: [
    // 在首页中配置 hero 图片预加载
  ],
};

/**
 * 图片优化配置
 */
export const imageOptimization = {
  // 懒加载阈值
  lazyLoadThreshold: 50,
  
  // 占位符类型
  placeholder: 'blur' as const,
  
  // 默认图片质量（1-100）
  defaultQuality: 85,
  
  // 响应式图片尺寸
  sizes: {
    mobile: '100vw',
    tablet: '50vw',
    desktop: '33vw',
  },
  
  // 支持的格式（按优先级排序）
  formats: ['webp', 'avif', 'original'],
};

/**
 * 字体优化配置
 */
export const fontOptimization = {
  // 使用 font-display: swap
  display: 'swap' as const,
  
  // 预加载关键字体变体
  preloadVariants: [
    { weight: '400', style: 'normal' },
    { weight: '500', style: 'normal' },
    { weight: '600', style: 'normal' },
    { weight: '700', style: 'normal' },
  ],
  
  // 字体子集（如果支持）
  subsets: ['latin', 'chinese-simplified'],
};

/**
 * JavaScript 优化配置
 */
export const jsOptimization = {
  // 代码分割策略
  codeSplitting: {
    // 按路由分割
    byRoute: true,
    // 按组件分割
    byComponent: true,
    // 第三方库单独打包
    vendorChunk: true,
  },
  
  // 懒加载配置
  lazyLoad: {
    // 组件懒加载
    components: true,
    // 图片懒加载
    images: true,
    // 视频懒加载
    videos: true,
  },
  
  // Tree shaking（移除未使用代码）
  treeShaking: true,
};

/**
 * 缓存策略
 */
export const cacheStrategy = {
  // 静态资源缓存（1 年）
  static: {
    maxAge: 31536000,
    staleWhileRevalidate: 86400,
  },
  
  // HTML 页面缓存（1 小时）
  html: {
    maxAge: 3600,
    staleWhileRevalidate: 86400,
  },
  
  // API 响应缓存（根据类型）
  api: {
    default: {
      maxAge: 300,
      staleWhileRevalidate: 3600,
    },
  },
};

/**
 * 性能监控配置
 */
export const performanceMonitoring = {
  // 启用 Core Web Vitals 监控
  coreWebVitals: true,
  
  // 监控指标
  metrics: [
    'LCP',  // 最大内容绘制
    'FID',  // 首次输入延迟
    'CLS',  // 累积布局偏移
    'FCP',  // 首次内容绘制
    'TTFB', // 首字节时间
  ],
  
  // 上报阈值（毫秒）
  thresholds: {
    LCP: 2500,
    FID: 100,
    CLS: 0.1,
    FCP: 1800,
    TTFB: 800,
  },
};

/**
 * 生成预加载标签
 */
export function generatePreloadTags() {
  return preloadResources.fonts.map((font) => 
    `<link rel="${font.as}" href="${font.href}" as="${font.as}" type="${font.type}" crossorigin="${font.crossorigin}" />`
  ).join('\n    ');
}

/**
 * 生成关键 CSS 内联
 * 
 * 建议将关键 CSS 提取并内联到 HTML <head> 中
 * 减少首次渲染的阻塞
 */
export const criticalCSS = `
  /* 关键 CSS - 首屏样式 */
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif}
  .container{max-width:1280px;margin:0 auto;padding:0 1rem}
  /* 添加更多关键样式... */
`.replace(/\s+/g, ' ').trim();

/**
 * 性能优化建议
 */
export const optimizationTips = [
  '使用 Next.js Image 组件自动优化图片',
  '对首屏图片使用 priority 属性预加载',
  '使用 font-display: swap 避免字体加载阻塞',
  '实施代码分割减少初始包大小',
  '使用动态导入 (import()) 懒加载非关键组件',
  '启用 Gzip/Brotli 压缩',
  '使用 CDN 分发静态资源',
  '实施 Service Worker 离线缓存',
  '优化第三方脚本加载（使用 defer/async）',
  '减少主线程工作量，避免长任务',
];
