import { NextConfig } from 'next';
const { routing } = require("./i18n/routing");
const withNextIntl = require("next-intl/plugin")(routing);

/**
 * Interface representing the structure of a redirect rule.
 * Next.js internal 'Redirect' type is more complex, so we define 
 * our local requirement here.
 */
interface RedirectRule {
  source: string;
  destination: string;
  permanent: boolean;
}

// Explicitly type the array to prevent 'any[]' inference errors
let generatedRedirects: RedirectRule[] = [];

try {
  // Use require for the CommonJS generated file
  const loadedRedirects = require("./redirects.generated.cjs");

  if (Array.isArray(loadedRedirects)) {
    generatedRedirects = loadedRedirects as RedirectRule[];
  }
} catch (e) {
  generatedRedirects = [];
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  eslint: { 
    ignoreDuringBuilds: true 
  },

  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  experimental: {
    serverActions: { 
      allowedOrigins: ["*"] 
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.curify-ai.com' },
      { protocol: 'https', hostname: 'videotranslatetest.blob.core.windows.net' },
      { protocol: 'https', hostname: 'pbs.twimg.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  async redirects() {
    const LOCALE_RE = routing.locales.join("|");

    const manualRedirects: RedirectRule[] = [
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

    const safeGeneratedRedirects = generatedRedirects.filter(
      (r): r is RedirectRule =>
        !!r &&
        typeof r.source === "string" &&
        typeof r.destination === "string" &&
        typeof r.permanent === "boolean" &&
        r.source !== r.destination
    );

    return [...manualRedirects, ...safeGeneratedRedirects];
  },

  async headers() {
    const commonHeaders = [
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Cross-Origin-Embedder-Policy",
        value: "unsafe-none",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: commonHeaders,
      },
      {
        source: "/_next/:path*",
        headers: commonHeaders,
      },
      {
        source: "/api/:path*",
        headers: commonHeaders,
      },
    ];
  },
};

// Use ES Module export for .ts files
export default withNextIntl(nextConfig);