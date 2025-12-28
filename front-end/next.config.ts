/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  exportPathMap: function () {
    return {
      '/': { page: '/' },
      '/app': { page: '/app' },
      '/app/discover': { page: '/app/discover' },
      '/app/interest': { page: '/app/interest'}
    }
  },

  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
}

module.exports = nextConfig
