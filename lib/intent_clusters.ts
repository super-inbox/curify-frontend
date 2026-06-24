/**
 * Intent-cluster aggregator for /search results.
 *
 * Two pathways:
 *   A. Raw output-type chips (legacy): topIntentChips / topIntentChipsFromTopicCounts
 *      – operate on the 19 OUTPUT_TYPE_SLUGS vocabulary
 *      – kind === "topic"
 *   B. High-level cluster chips (Phase 2): rankIntentClusters
 *      – maps Top-20 topic co-occurrence evidence into 8 creation-intent clusters
 *      – kind === "cluster"
 *
 * Caller preference: cluster chips (B) when any cluster clears minCount;
 * otherwise fall back to topic chips (A).
 */

import type { TopicCooccurrenceResult } from "./topic_cooccurrence";
import {
  INTENT_CLUSTERS,
  getIntentClusterLabel,
  getIntentClusterTopicSet,
  isIntentClusterSlug,
} from "./intent_taxonomy";

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

// ─── Chip types ─────────────────────────────────────────────────────────────

/** Raw output-type chip (legacy pathway). */
export type TopicChip = {
  kind: "topic";
  slug: string;
  count: number;
};

/** High-level cluster chip (Phase 2 pathway). label is pre-localized. */
export type ClusterChip = {
  kind: "cluster";
  slug: string;
  label: string;
  count: number;
};

/** Discriminated union passed to the search UI. */
export type IntentChip = TopicChip | ClusterChip;

// ─── Legacy pathway: raw output-type topic chips ─────────────────────────────

/**
 * Top output-type chips for a result set. Returns up to `topN` slugs,
 * each with `count` ≥ `minCount`, sorted by frequency desc. Caller is
 * responsible for fetching i18n displayName via the topics namespace.
 */
export function topIntentChips(
  templates: Array<{ topics?: string[] | null }>,
  options: { topN?: number; minCount?: number } = {}
): TopicChip[] {
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
    .map(([slug, count]) => ({ kind: "topic" as const, slug, count }));
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
): TopicChip[] {
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
    .map(([slug, ids]) => ({ kind: "topic" as const, slug, count: ids.size }))
    .filter(({ count }) => count >= minCount)
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
    .slice(0, topN);
}

// ─── Phase 2: high-level cluster chips ──────────────────────────────────────

/**
 * Map topic co-occurrence evidence into the 8 high-level creation-intent
 * clusters and return the top-ranked ones.
 *
 * Ranking rules:
 *  - Uses mergedTopicCounts only.
 *  - For each cluster, unions the resultIds of every matching topic slug.
 *  - One result contributes at most +1 to a given cluster, even when it
 *    carries multiple topics that all map to that cluster.
 *  - The same result may contribute +1 to different clusters when its topics
 *    support different intents.
 *  - Cluster count = size of the unioned result-ID Set.
 *  - Sort: count descending, then slug ascending for deterministic ties.
 *  - No Business Override applied at this phase.
 *  - No LLM calls; purely evidence-driven.
 */
export function rankIntentClusters(
  cooccurrence: TopicCooccurrenceResult,
  options: { topN?: number; minCount?: number; locale?: string } = {}
): ClusterChip[] {
  const topN = options.topN ?? 5;
  const minCount = options.minCount ?? 2;
  const locale = options.locale ?? "en";

  // Fast lookup: topic slug → result IDs from merged counts
  const topicToResultIds = new Map<string, string[]>();
  for (const { slug, resultIds } of cooccurrence.mergedTopicCounts) {
    topicToResultIds.set(slug, resultIds);
  }

  const chips: ClusterChip[] = [];

  for (const cluster of INTENT_CLUSTERS) {
    // Union all result IDs across every mapped topic slug.
    // Using a Set ensures one result = one vote for this cluster.
    const unionIds = new Set<string>();
    for (const topicSlug of cluster.topicSlugs) {
      for (const id of topicToResultIds.get(topicSlug) ?? []) {
        unionIds.add(id);
      }
    }
    if (unionIds.size < minCount) continue;
    chips.push({
      kind: "cluster" as const,
      slug: cluster.slug,
      label: getIntentClusterLabel(cluster, locale),
      count: unionIds.size,
    });
  }

  return chips
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
    .slice(0, topN);
}

// ─── Pure filter helpers (used in search page and tests) ────────────────────

/**
 * Filter pre-resolved inspiration records by cluster membership.
 *
 * An inspiration survives when at least one of its mergedTopics is in the
 * cluster's topic set. Original ranking order is preserved.
 *
 * If clusterSlug is not a known cluster, all records pass through (safe no-op).
 */
export function filterInspirationsByCluster<T extends { mergedTopics: string[] }>(
  resolved: T[],
  clusterSlug: string
): T[] {
  if (!isIntentClusterSlug(clusterSlug)) return resolved;
  const topicSet = getIntentClusterTopicSet(clusterSlug);
  return resolved.filter((r) => r.mergedTopics.some((t) => topicSet.has(t)));
}

/**
 * Filter template-rail cards by cluster membership.
 *
 * A template is included when EITHER:
 *   A. Its own topics intersect the cluster topic set (direct match).
 *   B. Its template_id appears among the surviving inspiration results.
 *
 * If clusterSlug is not a known cluster, all templates pass through.
 */
export function filterTemplatesByCluster<
  T extends { template_id: string; topics?: string[] | null },
>(
  templates: T[],
  survivingInspTemplateIds: Set<string>,
  clusterSlug: string
): T[] {
  if (!isIntentClusterSlug(clusterSlug)) return templates;
  const topicSet = getIntentClusterTopicSet(clusterSlug);
  return templates.filter(
    (t) =>
      (t.topics ?? []).some((s) => topicSet.has(s)) ||
      survivingInspTemplateIds.has(t.template_id)
  );
}
