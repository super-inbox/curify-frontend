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
};

export default config;
