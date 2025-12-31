/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // GitHub Pages子路径配置
  basePath: '/smart-compliance-system',
  assetPrefix: '/smart-compliance-system/',
}

module.exports = nextConfig
