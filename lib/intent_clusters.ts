/**
 * Intent-cluster aggregator for /search results.
 *
 * Given the templates matched for a query, derive the top N output-type
 * slugs ("creation intents") to surface as Pinterest-style "Explore further"
 * chips above the example grid.
 *
 * Source of truth = the 19 output-type slugs added to lib/taxonomy.json
 * + tagged across 285 templates by gpt-4o-mini in commit af768fe7.
 * Each chip → /topics/<slug>?from_search=<query> for attribution tracking.
 */

import type { TopicCooccurrenceResult } from "./topic_cooccurrence";

// The 19 creation-output slugs. Must stay in sync with the vocabulary
// the LLM tagging script (scripts/tag_templates_output_types_2026-06-19.py)
// uses, otherwise the aggregator silently drops new entries.
export const OUTPUT_TYPE_SLUGS = [
  // 5 vocab-only entries newly localized
  "infographic",
  "anatomy",
  "comic",
  "step-by-step-tutorial",
  "illustration",
  // 14 newly added entries (2026-06-19 commit 81896cda)
  "flashcards",
  "recipes",
  "mind-maps",
  "study-sheets",
  "art-prints",
  "wall-art",
  "memes",
  "social-media-posts",
  "stickers",
  "mascots",
  "character-ip",
  "fan-art",
  "selfies",
  "scrapbooks",
] as const;

const OUTPUT_TYPE_SET = new Set<string>(OUTPUT_TYPE_SLUGS);

/**
 * `art-prints` and `wall-art` are near-synonyms — every poster matched
 * both during the LLM tagging pass (192 vs 220). To avoid redundant
 * chips, the aggregator collapses them under `wall-art` (the higher-
 * coverage slug; `art-prints` will still be navigable directly).
 */
const SYNONYM_FOLDS: Record<string, string> = {
  "art-prints": "wall-art",
};

export type IntentChip = {
  slug: string;
  count: number;
};

/**
 * Top output-type chips for a result set. Returns up to `topN` slugs,
 * each with `count` ≥ `minCount`, sorted by frequency desc. Caller is
 * responsible for fetching i18n displayName via the topics namespace.
 */
export function topIntentChips(
  templates: Array<{ topics?: string[] | null }>,
  options: { topN?: number; minCount?: number } = {}
): IntentChip[] {
  const topN = options.topN ?? 5;
  const minCount = options.minCount ?? 2;

  const counts = new Map<string, number>();
  for (const t of templates) {
    const topics = t.topics ?? [];
    // Dedupe per template — a template tagged BOTH art-prints AND wall-art
    // should count once toward the folded slug, not twice.
    const seen = new Set<string>();
    for (const topic of topics) {
      if (typeof topic !== "string") continue;
      if (!OUTPUT_TYPE_SET.has(topic)) continue;
      const folded = SYNONYM_FOLDS[topic] ?? topic;
      if (seen.has(folded)) continue;
      seen.add(folded);
      counts.set(folded, (counts.get(folded) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, c]) => c >= minCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([slug, count]) => ({ slug, count }));
}

/**
 * Derive intent chips from topic co-occurrence data calculated over the
 * Top 20 ranked inspiration results.
 *
 * Evidence comes from mergedTopicCounts (inspiration + parent template
 * topics combined). SYNONYM_FOLDS and OUTPUT_TYPE_SLUGS filtering are
 * applied identically to topIntentChips.
 *
 * Synonym-fold deduplication: each TopicCount carries the inspiration IDs
 * that contributed it. After folding (e.g. "art-prints" → "wall-art"), the
 * result-ID sets for the source and target slugs are UNIONED. Using set.size
 * as the count guarantees that a single result carrying both "art-prints" and
 * "wall-art" in its merged topics contributes exactly +1 to "wall-art", not +2.
 */
export function topIntentChipsFromTopicCounts(
  cooccurrence: TopicCooccurrenceResult,
  options: { topN?: number; minCount?: number } = {}
): IntentChip[] {
  const topN = options.topN ?? 5;
  const minCount = options.minCount ?? 2;

  // Map from folded slug → set of result IDs that contributed (via either the
  // source or target slug). Using a Set ensures one result = one vote even when
  // it carries both a synonym and its canonical target.
  const foldedResultIds = new Map<string, Set<string>>();

  for (const { slug, resultIds } of cooccurrence.mergedTopicCounts) {
    if (!OUTPUT_TYPE_SET.has(slug)) continue;
    const folded = SYNONYM_FOLDS[slug] ?? slug;
    if (!foldedResultIds.has(folded)) foldedResultIds.set(folded, new Set());
    const idSet = foldedResultIds.get(folded)!;
    for (const id of resultIds) idSet.add(id);
  }

  return Array.from(foldedResultIds.entries())
    .map(([slug, ids]) => ({ slug, count: ids.size }))
    .filter(({ count }) => count >= minCount)
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
    .slice(0, topN);
}
