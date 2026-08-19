// Server-only: pick the closest existing gallery images (nano_inspiration) as a
// preview "moodboard" for each generated creative direction. Import from server
// code only (route handlers) — nano_inspiration.json is multi-MB and must not
// enter the client bundle.
//
// Relevance model (2026-08): match against each image's tags + topics + aliases,
// and score the brief's PRODUCT/SUBJECT words (coffee, cafe, brand, packaging…)
// far above the direction's generic STYLE words (earthy, modern…). Style words
// alone surfaced off-subject, repetitive images (a coffee brief pulling up
// Journey-to-the-West character art); anchoring on the subject fixes that. The
// three directions are matched together with a global dedup so each gets a
// distinct set.
import inspiration from "@/public/data/nano_inspiration.json";

type InspRec = {
  id?: string;
  asset?: { image_url?: string; preview_image_url?: string };
  tags?: string[];
  topics?: string[];
  search_aliases?: string[];
};

const RECS = (inspiration as unknown as InspRec[]) ?? [];

// Each record's searchable vocabulary (tags + topics + aliases), normalized.
const REC_TERMS: Set<string>[] = RECS.map((r) => {
  const s = new Set<string>();
  for (const t of [...(r.tags ?? []), ...(r.topics ?? []), ...(r.search_aliases ?? [])]) {
    const k = t.toLowerCase().trim();
    if (k) s.add(k);
  }
  return s;
});

// Inverted index term -> record indices, + IDF per term (rarer = more telling).
const TERM_INDEX = new Map<string, number[]>();
REC_TERMS.forEach((terms, i) => {
  for (const term of terms) {
    const arr = TERM_INDEX.get(term);
    if (arr) arr.push(i);
    else TERM_INDEX.set(term, [i]);
  }
});
const TOTAL = Math.max(1, RECS.length);
function idf(term: string): number {
  const df = TERM_INDEX.get(term)?.length ?? 0;
  return df > 0 ? Math.log(TOTAL / df) : 0;
}

// The whole corpus vocabulary — used to keep only meaningful subject words out of
// a free-text brief (drop "the", "opening", a shop's made-up name, etc.).
const VOCAB = new Set(TERM_INDEX.keys());

const SUBJECT_WEIGHT = 4; // product/subject match counts 4x a style match
const STYLE_WEIGHT = 1;

function tokenize(text: string): string[] {
  return Array.from(
    new Set(
      (text.toLowerCase().match(/[a-z][a-z-]{2,}/g) ?? []).filter((w) => VOCAB.has(w)),
    ),
  );
}

/**
 * Match every direction's preview images at once (global dedup so the three sets
 * are distinct). `contextText` is the brief (case title/description + field
 * values); its in-vocabulary words become the high-weight subject anchor.
 * Returns image URLs per direction, parallel to `directions`.
 */
export function matchImagesForDirections(
  directions: { styleTags: string[] }[],
  opts: { contextText?: string; perDirection?: number } = {},
): string[][] {
  const perDir = opts.perDirection ?? 4;
  const subjectKws = tokenize(opts.contextText ?? "");
  const used = new Set<string>(); // global dedup across directions

  const scoreFor = (styleTags: string[]) => {
    const styleKws = Array.from(
      new Set(styleTags.map((k) => k.toLowerCase().trim()).filter(Boolean)),
    );
    const score = new Map<number, number>();
    const bump = (kw: string, weight: number) => {
      const w = weight * idf(kw);
      if (w <= 0) return;
      for (const idx of TERM_INDEX.get(kw) ?? []) score.set(idx, (score.get(idx) ?? 0) + w);
    };
    for (const kw of subjectKws) bump(kw, SUBJECT_WEIGHT);
    for (const kw of styleKws) bump(kw, STYLE_WEIGHT);
    return score;
  };

  return directions.map((d) => {
    const score = scoreFor(d.styleTags);
    // Prefer images that hit the subject at all — a subject match is worth far
    // more than any number of style matches, so those sort to the top naturally.
    const ranked = [...score.entries()].sort((a, b) => b[1] - a[1]);
    const out: string[] = [];
    for (const [idx] of ranked) {
      const r = RECS[idx];
      const url = r.asset?.preview_image_url || r.asset?.image_url;
      if (!url || used.has(url)) continue;
      used.add(url);
      out.push(url);
      if (out.length >= perDir) break;
    }
    return out;
  });
}
