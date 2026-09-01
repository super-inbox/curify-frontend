import nanoInspiration from "@/public/data/nano_inspiration.json";
import { CDN_BASE } from "@/lib/constants";

/**
 * Google image-sitemap entries.
 *
 * WHY (measured 2026-09-01, 28d window 2026-08-02→08-29). Image search is the
 * site's largest surface and nobody had ever fed it: 19,035 impressions vs web
 * search's 12,752, across 1,921 distinct queries vs web's 808 — at average
 * position 41.2 and a 0.20% CTR. Every one of the three image-SEO fundamentals
 * was missing, and this file fixes the first: `grep -c image:image` returned
 * **0** across sitemap.xml, sitemap-blogs.xml and sitemap-examples.xml, so
 * Googlebot could only discover our images by rendering each page and noticing
 * the <img> tags. An image sitemap gives it the list directly.
 *
 * This matters disproportionately because the clusters that look dead in the
 * web report are alive here — fashion/design 1 web impression vs 206 image,
 * education 1 vs 173, AI-selfie 0 vs 358. Image search is also not eaten by
 * AI Overview, unlike the MBTI web queries.
 *
 * WHY ONLY `<image:loc>`. Google deprecated `<image:caption>`, `<image:title>`,
 * `<image:license>` and `<image:geo_location>` in 2022 — `<image:loc>` is the
 * only tag still read. Emitting the rest would add megabytes for nothing.
 *
 * WHY sitemap-examples.xml IS NOT TOUCHED. It is running the locale A/B from
 * 2026-08-26 (1,999 de-listed non-EN example URLs vs 4,670 control, readout
 * ~2026-09-23). Adding image children there would rewrite the file mid-flight,
 * and listing a treatment URL under any sitemap would re-list the arm we
 * deliberately removed. Template hub pages carry the same inspiration images as
 * their example pages, so routing image discovery through the hubs costs no
 * coverage and leaves the experiment clean.
 */

/** Max images per <url>. Google's documented ceiling is 1,000; our worst
 *  template has 168, so this is headroom, not a truncation in practice. */
const MAX_IMAGES_PER_URL = 1000;

type InspirationRecord = {
  template_id?: string;
  asset?: { image_url?: string };
};

/**
 * Absolute, crawlable URL for a repo-relative asset path.
 *
 * `encodeURI` is load-bearing: 78 of the 3,872 inspiration images have a space
 * or an apostrophe in the filename ("…blueprint-en 1.jpg",
 * "…dragon's-blood.jpg"). An unencoded space makes the <image:loc> invalid and
 * Google drops the whole entry.
 */
export function toAbsoluteAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return encodeURI(path);
  const clean = path.startsWith("/") ? path : `/${path}`;
  const base = CDN_BASE && clean.startsWith("/images/") ? CDN_BASE : "";
  return encodeURI(`${base || "https://www.curify-ai.com"}${clean}`);
}

/** XML text escaping. Applied after encodeURI, which leaves `&` intact. */
export function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Render the <image:image> children for one <url> entry. */
export function imageEntries(paths: readonly string[]): string {
  if (paths.length === 0) return "";
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of paths) {
    if (!p) continue;
    const url = toAbsoluteAssetUrl(p);
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(`<image:image><image:loc>${xmlEscape(url)}</image:loc></image:image>`);
    if (out.length >= MAX_IMAGES_PER_URL) break;
  }
  return out.join("");
}

/**
 * template_id → its inspiration image paths, in data order.
 *
 * Built once at module load. 349 of the 351 templates in nano_templates.json
 * have images; the 2 that don't simply emit no <image:image> children.
 */
let templateImageMap: Map<string, string[]> | null = null;

export function getTemplateImageMap(): Map<string, string[]> {
  if (templateImageMap) return templateImageMap;

  const records = nanoInspiration as unknown as InspirationRecord[];
  const map = new Map<string, string[]>();

  for (const rec of records) {
    const templateId = rec?.template_id?.trim();
    const url = rec?.asset?.image_url;
    if (!templateId || !url) continue;
    const list = map.get(templateId);
    if (list) list.push(url);
    else map.set(templateId, [url]);
  }

  templateImageMap = map;
  return map;
}

/** The image sitemap namespace, for the <urlset> element. */
export const IMAGE_NAMESPACE =
  'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"';
