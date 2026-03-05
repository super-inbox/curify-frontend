// next.config.js
const { routing } = require("./i18n/routing");
const withNextIntl = require("next-intl/plugin")(routing);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  eslint: { ignoreDuringBuilds: true },

  // 👇 Prevent /en/ → /en or /en → /en/ redirects
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
    // ✅ IMPORTANT: restrict :locale so it doesn't match "/tools/..." (locale="tools")
    const LOCALE_RE = routing.locales.join("|"); // e.g. "en|zh|es|fr|de|ja|ko|hi|tr|ru"

    return [
      // ---------------------------
      // Unprefixed legacy routes → /tools/*
      // (default locale "en" style)
      // ---------------------------
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

      // ---------------------------
      // Prefixed legacy routes → /:locale/tools/*
      // (restricted to actual locales)
      // ---------------------------
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

      // ---------------------------
      // Optional: canonicalize English to unprefixed
      // /en/tools/* → /tools/*
      // ---------------------------
      {
        source: "/en/tools/:path*",
        destination: "/tools/:path*",
        permanent: true,
      },
    ];
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