import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// Per-child lastmod — bump the entry whose contents materially changed so
// Google re-fetches that child sitemap. Each child sitemap also carries
// its own per-URL lastmods inside, which Google trusts more than this.
const CHILD_SITEMAPS: Array<{ path: string; lastmod: string }> = [
  { path: "/sitemap.xml",          lastmod: "2026-05-08T00:00:00.000Z" },
  { path: "/sitemap-blogs.xml",    lastmod: "2026-05-08T00:00:00.000Z" },
  // Bumped 2026-05-07 — 260 example pages gained per-locale SEO copy
  // (title / description / metaDescription) and 8 new locale URL variants.
  { path: "/sitemap-examples.xml", lastmod: "2026-05-07T00:00:00.000Z" },
];

export async function GET() {
  const entries = CHILD_SITEMAPS.map(
    ({ path, lastmod }) => `
    <sitemap>
      <loc>${BASE_URL}${path}</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`
  ).join("");

  const xml = `
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
