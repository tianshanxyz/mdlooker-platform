/** @type {import('next').NextConfig} */

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const nextConfig = {
  // 确保路径解析正确
  webpack: (config) => {
    config.resolve.alias['@'] = __dirname;
    config.resolve.alias['@/app'] = __dirname + '/app';
    config.resolve.alias['@/components'] = __dirname + '/app/components';
    return config;
  },
  // 优化 CSS（移除未识别的选项）
  // optimizeCss: true,  // 此选项在 Next.js 14 中不存在
};

export default nextConfig;
