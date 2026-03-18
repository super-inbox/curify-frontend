// next.config.js
const { routing } = require("./i18n/routing");
const withNextIntl = require("next-intl/plugin")(routing);

/**
 * @typedef {Object} RedirectRule
 * @property {string} source
 * @property {string} destination
 * @property {boolean} permanent
 */

/** @type {RedirectRule[]} */
let generatedRedirects = [];

try {
  /** @type {unknown} */
  const loadedRedirects = require("./redirects.generated.cjs");

  if (Array.isArray(loadedRedirects)) {
    generatedRedirects = loadedRedirects;
  }
} catch (e) {
  generatedRedirects = [];
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },

  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  experimental: {
    serverActions: { allowedOrigins: ["*"] },
  },

  images: {
    domains: [
      "lh3.googleusercontent.com",
      "cdn.curify-ai.com",
      "videotranslatetest.blob.core.windows.net",
      "pbs.twimg.com",
      "storage.googleapis.com",
      "images.unsplash.com",
    ],
  },

  async redirects() {
    const LOCALE_RE = routing.locales.join("|");

    /** @type {RedirectRule[]} */
    const manualRedirects = [
      {
        source: "/bilingual-subtitles",
        destination: "/tools/bilingual-subtitles",
        permanent: true,
      },
      {
        source: "/video-dubbing",
        destination: "/tools/video-dubbing",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALE_RE})/bilingual-subtitles`,
        destination: "/:locale/tools/bilingual-subtitles",
        permanent: true,
      },
      {
        source: `/:locale(${LOCALE_RE})/video-dubbing`,
        destination: "/:locale/tools/video-dubbing",
        permanent: true,
      },
      {
        source: "/en/tools/:path*",
        destination: "/tools/:path*",
        permanent: true,
      },
    ];

    /** @type {RedirectRule[]} */
    const safeGeneratedRedirects = generatedRedirects.filter(
      (r) =>
        r &&
        typeof r.source === "string" &&
        typeof r.destination === "string" &&
        typeof r.permanent === "boolean" &&
        r.source !== r.destination
    );

    return [...manualRedirects, ...safeGeneratedRedirects];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          },
        ],
      },
    ];
  },
};

module.exports = withNextIntl(nextConfig);