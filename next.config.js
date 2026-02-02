/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js 16.1.6默认启用Turbopack，无需experimental配置
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: true }];
  },
  // 明确指定编译入口（Turbopack优化）
  transpilePackages: []
};

export default nextConfig;

