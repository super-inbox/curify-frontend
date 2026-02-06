import { NextResponse } from "next/server";
import blogs from "@/content/blogs.json";

// ✅ Add nano templates
import nanoTemplates from "@/public/data/nano_templates.json";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// All supported locales
const LOCALES = ["en", "zh", "es", "de", "fr", "ja", "ko", "hi", "ru", "tr"];

// Static pages (shared across locales)
const STATIC_ROUTES = [
  "",
  "/contact",
  "/pricing",
  "/about",
  "/video-dubbing",
  "/bilingual-subtitles",
  "/creator",
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

// ✅ Nano template routes
function getNanoTemplateRoutes() {
  // Your page accepts both "template-xxx" and "xxx", but we pick a single canonical slug.
  // Safer default: use the existing template_id if present.
  const raws = nanoTemplates as unknown as Array<any>;

  const slugs = raws
    .map((t) => t?.id ?? t?.template_id ?? t?.templateId ?? null)
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((s) => s.trim());

  const unique = Array.from(new Set(slugs));

  return unique.map((slug) => `/nano-template/${encodeURIComponent(slug)}`);
}

// hreflang block
function generateHreflangLinks(route: string) {
  const links = LOCALES.map(
    (lng) =>
      `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}/${lng}${route}" />`
  ).join("");

  return (
    links +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en${route}" />`
  );
}

// <url> entry for a specific locale
function generateUrlEntry(
  locale: string,
  route: string,
  opts?: { lastmod?: string; changefreq?: string; priority?: string }
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
      ${generateHreflangLinks(route)}
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

  // ✅ Nano template routes × locales
  nanoTemplateRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, {
        changefreq: "weekly",
        priority: "0.6",
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
