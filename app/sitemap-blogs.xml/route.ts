// app/sitemap-blogs.xml/route.ts
import { NextResponse } from "next/server";
import blogs from "@/content/blogs.json";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

// Blog routes
function getBlogRoutes() {
  return (blogs as unknown as string[]).map((slug: string) => `/blog/${slug}`);
}

// hreflang block
function generateHreflangLinks(route: string) {
  const links = LOCALES.map((lng) => {
    const pathPrefix = lng === "en" ? "" : `/${lng}`;
    return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
  }).join("");

  return links + `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`;
}

// URL entry
function generateUrlEntry(locale: string, route: string) {
  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const loc = `${BASE_URL}${pathPrefix}${route}`;

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
      ${generateHreflangLinks(route)}
    </url>
  `;
}

export async function GET() {
  const blogRoutes = getBlogRoutes();

  let urls = "";

  blogRoutes.forEach((route) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route);
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