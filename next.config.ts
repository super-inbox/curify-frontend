// next.config.js

const withNextIntl = require('next-intl/plugin')(
  // This is the default pathname of your `next-intl.config.js`
  './next-intl.config.js'
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options
  experimental: {
    // Enable if you're using app directory
    appDir: true
  },
  // Add any other config you need
};

module.exports = withNextIntl(nextConfig);