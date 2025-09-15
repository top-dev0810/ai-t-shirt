import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i0.wp.com',
        port: '',
        pathname: '/bandadda.com/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize images for production
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
  },

  // Production optimizations
  compress: true,
  poweredByHeader: false,

  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Experimental features for better performance
  experimental: {
    // optimizeCss: true, // Disabled due to critters module issue
  },
};

export default nextConfig;
