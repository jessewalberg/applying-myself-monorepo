import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SEO and Performance Optimizations
  compress: true,
  poweredByHeader: false,

  // Disable sourcemaps in development to prevent console errors
  productionBrowserSourceMaps: false,

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'img.logo.dev',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // Webpack configuration for better error handling
  webpack: (config, { dev }) => {
    // Suppress sourcemap warnings in development
    if (dev) {
      config.devtool = false;
    }

    // Handle SVG files properly
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Suppress specific warnings
    config.stats = {
      ...config.stats,
      warnings: false,
    };

    return config;
  },

  // Headers for SEO and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, s-maxage=86400',
          },
        ],
      },
    ];
  },

  // Redirects for SEO (if needed)
  async redirects() {
    return [
      // Add any SEO redirects here
    ];
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@heroicons/react', 'lucide-react'],
  },
};

export default nextConfig;
