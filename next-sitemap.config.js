/** @type {import('next-sitemap').IConfig} */
const config = {
  siteUrl: "https://curify-ai.com",
  generateRobotsTxt: true,
  changefreq: "daily",
  priority: 0.7,
  sitemapSize: 7000,
  exclude: ["/api/*", "/auth/*"],

  alternateRefs: [
    { href: "https://curify-ai.com/en", hreflang: "en" },
    { href: "https://curify-ai.com/zh", hreflang: "zh" },
    { href: "https://curify-ai.com/es", hreflang: "es" },
  ],

  i18n: {
    locales: ["en", "zh", "es"],
    defaultLocale: "en",
  },

  // ✅ Add explicit paths for your main public pages
  additionalPaths: async (config) => {
    const locales = ["en", "zh", "es"];
    const basePaths = [
      "",
      "/contact",
      "/pricing",
      "/video-dubbing",
      "/bilingual-subtitles",
      "/about"
    ];

    const paths = [];
    for (const locale of locales) {
      for (const path of basePaths) {
        paths.push({
          loc: `/${locale}${path}`,
          changefreq: "daily",
          priority: path === "" ? 1.0 : 0.8,
          lastmod: new Date().toISOString(),
        });
      }
    }
    return paths;
  },
};

export default config;
