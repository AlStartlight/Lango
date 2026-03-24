import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // trailingSlash: true, // Optional: enable if needed for hosting
  compress: true,
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24, // 24 hours
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Basic security headers
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.googletagmanager.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' blob: data: https:",
              "connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
              "frame-src 'self' https://www.youtube.com https://player.vimeo.com",
              "manifest-src 'self'",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
      // Cache headers for static assets
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache headers for images
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=2592000',
          },
        ],
      },
      // Cache headers for fonts
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      // Redirect /index to /
      {
        source: '/index',
        destination: '/',
        permanent: true,
      },
      // Redirect old URL patterns if any
      {
        source: '/about',
        destination: '/en/aboutus',
        permanent: true,
      },
      {
        source: '/how-it-works',
        destination: '/en/how-its-works',
        permanent: true,
      },
    ];
  },

  // Experimental features for performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },

  // Strict React mode
  reactStrictMode: true,

  // Powered by header (disable for security)
  poweredByHeader: false,
};

export default nextConfig;
