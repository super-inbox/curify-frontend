import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// Children — every sitemap registered here is auto-discovered by search
// engines that read /sitemap-index.xml. Update this list when new sitemap
// files are added under app/sitemap-*.xml/route.ts.
const CHILD_SITEMAPS = [
  "/sitemap.xml",
  "/sitemap-blogs.xml",
  "/sitemap-examples.xml",
];

// Static lastmod for the index. The child sitemaps each carry their own
// per-URL lastmods (which Google trusts more), so this is just a coarse
// hint that the index itself was reviewed recently. Bump as needed.
const INDEX_LASTMOD = "2026-05-08T00:00:00.000Z";

export async function GET() {
  const entries = CHILD_SITEMAPS.map(
    (path) => `
    <sitemap>
      <loc>${BASE_URL}${path}</loc>
      <lastmod>${INDEX_LASTMOD}</lastmod>
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
