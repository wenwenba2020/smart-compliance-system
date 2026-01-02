/** @type {import('next').NextConfig} */
const nextConfig = {
  // Vercel 部署不需要 output: 'export'，使用默认的服务端渲染
  images: {
    unoptimized: true,
  },
  // Vercel 部署不需要 basePath 和 assetPrefix
  // 如果需要部署到 GitHub Pages，请取消注释以下配置：
  // output: 'export',
  // basePath: '/smart-compliance-system',
  // assetPrefix: '/smart-compliance-system/',
}

module.exports = nextConfig
