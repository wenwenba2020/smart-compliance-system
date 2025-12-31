/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // 如果部署到子路径，取消注释下面的行
  // basePath: '/smart-compliance-system',
  // assetPrefix: '/smart-compliance-system/',
}

module.exports = nextConfig
