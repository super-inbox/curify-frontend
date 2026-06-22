/**
 * Topic co-occurrence calculator for the Multi-Intent system.
 *
 * Analyzes the first N ranked inspiration results to produce per-source
 * and merged topic frequency counts. Pure and testable — accepts records
 * and maps as arguments; does not import JSON datasets directly.
 */

import { resolveTopics, type InspirationTopicRecord } from "./topic_resolver";

export type TopicCount = {
  slug: string;
  count: number;
  /**
   * Inspiration record IDs that contributed this slug.
   * Included so callers can union ID sets across synonym-folded slugs and
   * avoid double-counting results that carry both the source and target slug
   * (e.g. a result whose merged topics contain both "art-prints" and "wall-art"
   * must contribute only +1 to "wall-art" after folding).
   */
  resultIds: string[];
};

export type TopicCooccurrenceResult = {
  /** Number of ranked results that were analyzed (≤ limit). */
  analyzedResultCount: number;
  /** Per-slug frequency across inspiration-own topics only. */
  inspirationTopicCounts: TopicCount[];
  /** Per-slug frequency across parent-template topics only. */
  templateTopicCounts: TopicCount[];
  /** Per-slug frequency across the union of both sources (each slug counted at most once per result). */
  mergedTopicCounts: TopicCount[];
};

/** Sort counts: higher count first; ties broken by slug ascending (deterministic). */
function sortCounts(
  counts: Map<string, number>,
  ids: Map<string, string[]>
): TopicCount[] {
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({ slug, count, resultIds: ids.get(slug) ?? [] }));
}

/**
 * Calculate topic co-occurrence across the first `limit` ranked inspiration results.
 *
 * Default limit = 20. Counting rules per result:
 *   - inspiration source:  each slug in inspirationTopics counted at most once
 *   - template source:     each slug in templateTopics counted at most once
 *   - merged:              each slug in mergedTopics (union) counted at most once —
 *                          a topic present in both sources contributes +1, not +2
 *
 * Each TopicCount includes the result IDs that contributed it so callers can
 * union ID sets across synonym-folded slugs for correct post-fold deduplication.
 *
 * Sorting: higher count first; equal counts sorted by slug ascending.
 */
export function calculateTopicCooccurrence(
  rankedInspirations: InspirationTopicRecord[],
  templateMap: Map<string, string[]>,
  limit = 20
): TopicCooccurrenceResult {
  const slice = rankedInspirations.slice(0, limit);

  const inspirationCounts = new Map<string, number>();
  const inspirationIds = new Map<string, string[]>();
  const templateCounts = new Map<string, number>();
  const templateIds = new Map<string, string[]>();
  const mergedCounts = new Map<string, number>();
  const mergedIds = new Map<string, string[]>();

  for (const inspiration of slice) {
    const resultId =
      typeof inspiration.id === "string" ? inspiration.id : String(inspiration.id);

    const { inspirationTopics, templateTopics, mergedTopics } = resolveTopics(
      inspiration,
      templateMap
    );

    // inspirationTopics, templateTopics, and mergedTopics are already deduplicated
    // by resolveTopics. The explicit seen-sets below make the "at most once per
    // result" invariant explicit and guard against future changes to resolveTopics.
    const seenInsp = new Set<string>();
    for (const slug of inspirationTopics) {
      if (seenInsp.has(slug)) continue;
      seenInsp.add(slug);
      inspirationCounts.set(slug, (inspirationCounts.get(slug) ?? 0) + 1);
      const existing = inspirationIds.get(slug) ?? [];
      existing.push(resultId);
      inspirationIds.set(slug, existing);
    }

    const seenTpl = new Set<string>();
    for (const slug of templateTopics) {
      if (seenTpl.has(slug)) continue;
      seenTpl.add(slug);
      templateCounts.set(slug, (templateCounts.get(slug) ?? 0) + 1);
      const existing = templateIds.get(slug) ?? [];
      existing.push(resultId);
      templateIds.set(slug, existing);
    }

    const seenMerged = new Set<string>();
    for (const slug of mergedTopics) {
      if (seenMerged.has(slug)) continue;
      seenMerged.add(slug);
      mergedCounts.set(slug, (mergedCounts.get(slug) ?? 0) + 1);
      const existing = mergedIds.get(slug) ?? [];
      existing.push(resultId);
      mergedIds.set(slug, existing);
    }
  }

  return {
    analyzedResultCount: slice.length,
    inspirationTopicCounts: sortCounts(inspirationCounts, inspirationIds),
    templateTopicCounts: sortCounts(templateCounts, templateIds),
    mergedTopicCounts: sortCounts(mergedCounts, mergedIds),
  };
}
