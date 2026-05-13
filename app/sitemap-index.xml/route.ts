import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// Per-child lastmod — bump the entry whose contents materially changed so
// Google re-fetches that child sitemap. Each child sitemap also carries
// its own per-URL lastmods inside, which Google trusts more than this.
const CHILD_SITEMAPS: Array<{ path: string; lastmod: string }> = [
  // Bumped 2026-05-08 — restricted hreflang/canonical on nano-template
  // pages to localized locales only (fixes "Duplicate without
  // user-selected canonical" reports for non-en/zh URLs).
  { path: "/sitemap.xml",          lastmod: "2026-05-08T00:00:00.000Z" },
  // Bumped 2026-05-14 — multiple blog posts got per-post lastmod bumps
  // in public/data/blogs.json (SEO retitle pass + content tweaks).
  { path: "/sitemap-blogs.xml",    lastmod: "2026-05-14T00:00:00.000Z" },
  // Bumped 2026-05-14 — 1,275 additional non-MBTI example pages gained
  // per-locale SEO copy in messages/<locale>/example.json (commit
  // 2f43a2e). The child sitemap's per-URL lastmods now flag ~1,540
  // entries (260 original + 1,275 new) as bumped, so Google should
  // re-crawl the en + zh variants and refresh the indexed copy.
  { path: "/sitemap-examples.xml", lastmod: "2026-05-14T00:00:00.000Z" },
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
