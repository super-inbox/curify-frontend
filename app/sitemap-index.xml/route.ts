import { NextResponse } from "next/server";

export const runtime = "nodejs";

const BASE_URL = "https://www.curify-ai.com";

// Per-child lastmod — bump the entry whose contents materially changed so
// Google re-fetches that child sitemap. Each child sitemap also carries
// its own per-URL lastmods inside, which Google trusts more than this.
const CHILD_SITEMAPS: Array<{ path: string; lastmod: string }> = [
  // Bumped 2026-09-01 — every nano-template hub entry now carries
  // <image:image> children for its inspiration gallery. Image search is the
  // site's largest surface (19,035 impr/28d vs web's 12,752) and had no
  // sitemap coverage at all; see lib/sitemap_images.ts.
  { path: "/sitemap.xml",          lastmod: "2026-09-01T00:00:00.000Z" },
  // Bumped 2026-09-01 — each post entry now carries its hero <image:image>.
  // Same image-search push as /sitemap.xml above.
  { path: "/sitemap-blogs.xml",    lastmod: "2026-09-01T00:00:00.000Z" },
  // Bumped 2026-05-14 — 1,275 additional non-MBTI example pages gained
  // per-locale SEO copy in messages/<locale>/example.json (commit
  // 2f43a2e). The child sitemap's per-URL lastmods now flag ~1,540
  // entries (260 original + 1,275 new) as bumped, so Google should
  // re-crawl the en + zh variants and refresh the indexed copy.
  //
  // NOT bumped, and NOT given image children: this child is running the
  // locale A/B from 2026-08-26 (readout ~2026-09-23). Rewriting it mid-flight
  // would confound the arms. Google re-fetched it on 2026-08-30 anyway and
  // already reports the post-experiment 8,232 URLs, so the stale date below is
  // costing nothing today — but bump it on the FIRST examples change after the
  // readout, because it is 3.5 months stale and is the intended
  // "this child changed" signal.
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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
