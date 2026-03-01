/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // 输出静态导出以支持 Capacitor
  output: 'export',
  distDir: 'dist',
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
  // 实验性功能
  experimental: {
    // 优化移动端性能
    optimizeCss: true,
  },
}

export default nextConfig
