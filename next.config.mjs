/** @type {import('next').NextConfig} */
const nextConfig = {
  // 使用 SSR 模式（不要静态导出）
  output: 'standalone',
  
  // 允许的外部图片域名
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // 移动端路由配置
  async rewrites() {
    return [
      {
        source: '/mobile',
        destination: '/zh/mobile',
      },
      {
        source: '/mobile/:path*',
        destination: '/zh/mobile/:path*',
      },
    ];
  },
  // 实验性功能
  experimental: {
    // 优化移动端性能
    optimizeCss: true,
  },
}

export default nextConfig
