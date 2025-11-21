const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@12-step-companion/api", "@12-step-companion/types"],

  // Turbopack monorepo configuration
  turbopack: {
    root: path.resolve(__dirname, '../..'),
  },

  // Performance optimizations
  // Note: swcMinify is always enabled in Next.js 16, removed deprecated option
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? {
      exclude: ["error", "warn"]
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [32, 48, 64, 96, 128, 256, 384],
  },

  // Experimental features for better performance
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Headers for caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
        ],
      },
    ];
  },
  
  // Note: Webpack config removed for Next.js 16 compatibility
  // Turbopack is the default bundler in Next.js 16
  // The previous webpack config (fallbacks for fs/net/tls and moduleIds) 
  // is handled automatically by Turbopack
};

module.exports = nextConfig;
