// Server-only: match a creative direction's style keywords against the tags of
// our existing gallery images (nano_inspiration) to surface the closest real
// visuals as a direction "preview" — instead of a static placeholder or a fresh
// (slow, paid) image generation. Import from server code only (route handlers):
// nano_inspiration.json is multi-MB and must not enter the client bundle.
import inspiration from "@/public/data/nano_inspiration.json";

type InspRec = {
  id?: string;
  asset?: { image_url?: string; preview_image_url?: string };
  tags?: string[];
  topics?: string[];
  search_aliases?: string[];
};

const RECS = (inspiration as unknown as InspRec[]) ?? [];

// Inverted index: normalized tag -> record indices. Built once at module load.
const TAG_INDEX = new Map<string, number[]>();
RECS.forEach((r, i) => {
  for (const raw of r.tags ?? []) {
    const k = raw.toLowerCase().trim();
    if (!k) continue;
    const arr = TAG_INDEX.get(k);
    if (arr) arr.push(i);
    else TAG_INDEX.set(k, [i]);
  }
});

// IDF weight per tag: a rare, specific keyword ("artisanal") should count far
// more than a generic one ("warm", on hundreds of images), so matches skew
// toward the distinctive part of a direction instead of the common mood words.
const TOTAL = Math.max(1, RECS.length);
const IDF = new Map<string, number>();
for (const [tag, recIdxs] of TAG_INDEX) {
  IDF.set(tag, Math.log(TOTAL / recIdxs.length));
}

export type MatchedImage = { id?: string; imageUrl: string; score: number; matchedTags: string[] };

/**
 * Rank existing gallery images by keyword overlap with a direction's style tags.
 * Score = number of the direction's keywords that appear in the image's tags.
 * Returns up to `limit` distinct images, highest overlap first.
 */
export function matchImagesByKeywords(keywords: string[], limit = 4): MatchedImage[] {
  const kws = Array.from(
    new Set(keywords.map((k) => k.toLowerCase().trim()).filter(Boolean)),
  );
  if (kws.length === 0) return [];

  // Accumulate per-record IDF-weighted overlap + which keywords hit. Weighting
  // by IDF means a distinctive shared keyword outranks several generic ones.
  const score = new Map<number, number>();
  const hits = new Map<number, string[]>();
  for (const kw of kws) {
    const w = IDF.get(kw) ?? 0;
    for (const idx of TAG_INDEX.get(kw) ?? []) {
      score.set(idx, (score.get(idx) ?? 0) + w);
      const h = hits.get(idx);
      if (h) h.push(kw);
      else hits.set(idx, [kw]);
    }
  }

  const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
  const out: MatchedImage[] = [];
  const seen = new Set<string>();
  for (const [idx, s] of ranked) {
    const r = RECS[idx];
    const url = r.asset?.preview_image_url || r.asset?.image_url;
    if (!url || seen.has(url)) continue;
    seen.add(url);
    out.push({ id: r.id, imageUrl: url, score: s, matchedTags: hits.get(idx) ?? [] });
    if (out.length >= limit) break;
  }
  return out;
}
