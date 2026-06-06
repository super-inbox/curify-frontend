import { NextResponse } from "next/server";
import blogs from "@/public/data/blogs.json";
import { routing } from "@/i18n/routing";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";
const LOCALES = routing.locales;

type BlogRecord = {
  slug: string;
  title?: string;
  date?: string;
  // Set this in blogs.json when a post's title/meta/content is
  // updated, so the sitemap reports a real last-modified to Google
  // and triggers a re-crawl for just the affected URLs. Falls back
  // to date (publish) if absent. Either ISO-8601 (preferred) or the
  // human "Month D, YYYY" form used by date — both are normalized.
  lastmod?: string;
  readTime?: string;
  tag?: string;
  image?: string;
};

function normalizeDate(s: string | undefined): string {
  if (!s) return new Date().toISOString();
  const d = new Date(s);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

// Blog routes — emit (path, lastmod) per record.
function getBlogEntries(): { route: string; lastmod: string }[] {
  const records = blogs as BlogRecord[];

  return records
    .filter((b) => b?.slug)
    .map((b) => ({
      route: `/blog/${encodeURIComponent(b.slug)}`,
      lastmod: normalizeDate(b.lastmod ?? b.date),
    }));
}

// hreflang block
function generateHreflangLinks(route: string) {
  const links = LOCALES.map((lng) => {
    const pathPrefix = lng === "en" ? "" : `/${lng}`;
    return `<xhtml:link rel="alternate" hreflang="${lng}" href="${BASE_URL}${pathPrefix}${route}" />`;
  }).join("");

  return (
    links +
    `<xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}${route}" />`
  );
}

// URL entry
function generateUrlEntry(locale: string, route: string, lastmod: string) {
  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const loc = `${BASE_URL}${pathPrefix}${route}`;

  return `
    <url>
      <loc>${loc}</loc>
      <lastmod>${lastmod}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
      ${generateHreflangLinks(route)}
    </url>
  `;
}

export async function GET() {
  const entries = getBlogEntries();

  let urls = "";

  entries.forEach(({ route, lastmod }) => {
    LOCALES.forEach((locale) => {
      urls += generateUrlEntry(locale, route, lastmod);
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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}