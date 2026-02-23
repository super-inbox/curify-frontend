import { NextResponse } from "next/server";
import blogs from "@/content/blogs.json";
import { routing } from "@/i18n/routing";

// ✅ Add nano templates
import nanoTemplates from "@/public/data/nano_templates.json";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// All supported locales
const LOCALES = routing.locales;

// Static pages (shared across locales)
const STATIC_ROUTES = [
  "",
  "/contact",
  "/pricing",
  "/about",
  "/video-dubbing",
  "/bilingual-subtitles",
  "/tools",
  "/lip-sync",
  "/privacy",
  "/agreement",
  "/blog",
  "/nano-banana-pro-prompts",
  "/inspiration-hub",
];

// Blog routes
function getBlogRoutes() {
  return blogs.map((slug: string) => `/blog/${slug}`);
}

// ✅ Nano template routes - RESPECTS LOCALE
function getNanoTemplateRoutes(): Array<{ route: string; locales: string[] }> {
  const raws = nanoTemplates as unknown as Array<{
    id: string;
    locales?: Record<string, any>;
  }>;

  return raws
    .filter((t) => t?.id && typeof t.id === "string")
    .map((t) => {
      const templateId = t.id.trim();
      const availableLocales = t.locales ? Object.keys(t.locales) : [];
      
      return {
        route: `/nano-template/${encodeURIComponent(templateId)}`,
        locales: availableLocales,
      };
    })
    .filter((item) => item.locales.length > 0); // Only include templates with at least one locale
}

// hreflang block
function generateHreflangLinks(route: string, availableLocales?: string[]) {
  // If availableLocales is provided, only generate hreflang for those locales
  const localesToUse = availableLocales || LOCALES;
  
  const links = localesToUse.map(
    (lng) =>
      `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}/${lng}${route}" />`
  ).join("");

  // x-default points to first available locale or 'en'
  const defaultLocale = localesToUse.includes("en") ? "en" : localesToUse[0];
  
  return (
    links +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/${defaultLocale}${route}" />`
  );
}

// <url> entry for a specific locale
function generateUrlEntry(
  locale: string,
  route: string,
  opts?: { 
    lastmod?: string; 
    changefreq?: string; 
    priority?: string;
    availableLocales?: string[];
  }
) {
  const loc = `${BASE_URL}/${locale}${route}`;
  const lastmod = opts?.lastmod ?? new Date().toISOString();
  const changefreq = opts?.changefreq ?? "weekly";
  const priority =
    opts?.priority ?? (route === "" && locale === "en" ? "1.0" : "0.8");

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>${changefreq}</changefreq>
      <priority>${priority}</priority>
      ${generateHreflangLinks(route, opts?.availableLocales)}
    </url>
  `;
}

export async function GET() {
  const blogRoutes = getBlogRoutes();
  const nanoTemplateRoutes = getNanoTemplateRoutes();

  let urls = "";

  // Static routes × locales
  STATIC_ROUTES.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: route === "" ? "daily" : "weekly",
        priority: route === "" && locale === "en" ? "1.0" : "0.8",
      });
    });
  });

  // Blog routes × locales
  blogRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.7",
      });
    });
  });

  // ✅ Nano template routes × ONLY THEIR AVAILABLE LOCALES
  nanoTemplateRoutes.forEach(({ route, locales: availableLocales }) => {
    availableLocales.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.6",
        availableLocales, // Pass available locales for proper hreflang
      });
    });
  });

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls}
</urlset>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}