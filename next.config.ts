const { routing } = require('./i18n/routing');
const withNextIntl = require('next-intl/plugin')(routing);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 👇 Prevent /en/ → /en or /en → /en/ redirects
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // 👇 Make sure Next.js does NOT auto-rewrite locale roots
  // (required for Google to index stable URL versions)
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "cdn.curify-ai.com",
      "videotranslatetest.blob.core.windows.net",
      "pbs.twimg.com"
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
      {
        source: '/_next/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);
