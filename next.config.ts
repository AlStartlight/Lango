import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // trailingSlash: true, // Optional: enable if needed for hosting
  compress: true,

  // The dev server is opened via http://127.0.0.1:3000 as well as localhost.
  // Next blocks dev-only resources (HMR) from non-initial hostnames by default,
  // which leaves the error overlay stuck on stale errors. Allow it in dev.
  allowedDevOrigins: ["127.0.0.1"],

  // Story content is generated at build time and stored as Brotli files under
  // content/stories/compiled. Only the routes that can render story content
  // need those files in their server trace; including them everywhere would
  // multiply ~14 MB by every function in the deployment.
  outputFileTracingIncludes: (() => {
    const storyContent = ["./content/stories/compiled/**/*.json.br"];
    const pages = [
      "/*/leaderboard",
      "/*/learn",
      "/*/learn/**",
      "/*/passport",
      "/*/practice",
      "/*/reader",
      "/*/reader/**",
      "/*/results",
      "/*/results/**",
      "/*/settings/**",
      "/*/store",
      "/*/stories",
      "/*/stories/**",
      "/*/vault",
    ];
    const api = [
      "/api/v1/characters",
      "/api/v1/episodes/**",
      "/api/v1/materials/**",
      "/api/v1/passport",
      "/api/v1/review/rate",
      "/api/v1/scenes/**",
      "/api/v1/stories",
      "/api/v1/stories/**",
      "/api/v1/story-attempts",
      "/api/v1/story-choices",
      "/api/v1/story-progress",
    ];
    return Object.fromEntries(
      [...pages, ...api].map((route) => [route, storyContent]),
    );
  })(),
  
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
