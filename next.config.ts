// next.config.js

const withNextIntl = require('next-intl/plugin')(
  './next-intl.config.js'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ✅ Remove experimental.appDir (deprecated)
  experimental: {
    // You can keep other experimental flags if needed, but NOT appDir
  },

  // ✅ Add security headers to control COOP/COEP
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups', // safer for postMessage/popups
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
