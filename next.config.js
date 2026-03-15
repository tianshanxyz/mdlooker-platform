/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保路径解析正确
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    config.resolve.alias['@/app'] = __dirname + '/app';
    config.resolve.alias['@/components'] = __dirname + '/app/components';
    return config;
  },
  // 优化 CSS
  optimizeCss: true,
};

module.exports = nextConfig;
