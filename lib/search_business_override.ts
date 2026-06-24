/**
 * Business Override layer for Multi-Intent search intent chips.
 *
 * Precedence in the search page:
 *   1. Business Override (this module)        ← runs first
 *   2. Content-grounded co-occurrence chips    (rankIntentClusters)
 *   3. Raw output-type topic chip fallback     (topIntentChipsFromTopicCounts)
 *   4. Empty chip row                          (no evidence, no override)
 *
 * Design constraints:
 *  - Deterministic: same input → same output, always.
 *  - No LLM calls, no external API calls.
 *  - No invented content: override only REORDERS existing evidence chips;
 *    it does not inject a chip without evidence support.
 *  - Returns only valid, existing IntentClusterSlug values.
 *  - Does NOT bypass content filtering (filtering still runs on real content).
 */

import type { IntentClusterSlug } from "./intent_taxonomy";
import {
  isIntentClusterSlug,
  getIntentCluster,
  getIntentClusterLabel,
} from "./intent_taxonomy";
import type { ClusterChip } from "./intent_clusters";
import { normalizeSearchQuery } from "./query_normalize";

/**
 * High-confidence override rules.
 *
 * Key: canonical normalized query (output of normalizeSearchQuery).
 * Value: the cluster slug to promote to position 0 in the chip list.
 *
 * Evidence basis for each entry (from nano_inspiration.json analysis):
 *
 *   "cat"
 *     10 matched results. Top merged topics: art-prints (8), wall-art (8),
 *     posters (7), design (6), illustration (5), kawaii (4), merch (4).
 *     Curify cat content is overwhelmingly visual/illustration-oriented
 *     (kawaii cats, poster designs, character art).
 *     → visual-art
 *
 *   "kitten"
 *     0 direct results in current catalog, but belongs to the same
 *     content family as "cat" (pet illustration/character design).
 *     Normalizer routes "kittens" → "kitten", so both spellings get the
 *     same override even if results appear later.
 *     → visual-art
 *
 *   "cat breeds"
 *     Educational comparison / vocabulary content (breed comparison charts,
 *     infographic cards about cat species). Top template types for
 *     pet-comparison content: infographic, information-card, comparison.
 *     → learning-materials
 *
 * Criteria for adding new entries:
 *   1. Inspect nano_templates.json + nano_inspiration.json first.
 *   2. The override cluster must be genuinely supported by top merged topics.
 *   3. Keep the map small and reviewable — do not add speculative entries.
 */
const OVERRIDE_MAP: Readonly<Record<string, IntentClusterSlug>> = {
  cat: "visual-art",
  kitten: "visual-art",
  "cat breeds": "learning-materials",
};

/**
 * Returns the preferred cluster slug for a normalized query, or null
 * when no high-confidence override applies.
 *
 * @param normalizedQuery - output of normalizeSearchQuery()
 */
export function getBusinessOverride(
  normalizedQuery: string
): IntentClusterSlug | null {
  const slug = OVERRIDE_MAP[normalizedQuery];
  if (!slug) return null;
  // Guard: only return if the slug is still a valid registered cluster.
  // Protects against stale entries if taxonomy ever changes.
  return isIntentClusterSlug(slug) ? slug : null;
}

/**
 * Apply a Business Override to a ranked cluster chip list.
 *
 * Behaviour:
 *  - If the override cluster already appears in the list → move it to index 0;
 *    all other chips keep their relative order.
 *  - If the override cluster is NOT in the list → return the list unchanged.
 *    The override NEVER injects a chip without evidence support.
 *
 * Returns a new array; the input is never mutated.
 *
 * @param chips        - output of rankIntentClusters (may be empty)
 * @param overrideSlug - the cluster to promote (from getBusinessOverride)
 * @param locale       - locale string for label generation if needed
 */
export function applyBusinessOverride(
  chips: ClusterChip[],
  overrideSlug: IntentClusterSlug,
  locale: string
): ClusterChip[] {
  void locale; // locale parameter reserved for future injection use

  const existingIdx = chips.findIndex((c) => c.slug === overrideSlug);

  // Already at the front — no change needed.
  if (existingIdx === 0) return chips;

  // Found but not at front — move to index 0, keep rest in original order.
  if (existingIdx > 0) {
    return [chips[existingIdx], ...chips.filter((_, i) => i !== existingIdx)];
  }

  // Not found — do not inject without evidence. Return unchanged.
  return chips;
}

/**
 * Returns true when the topic-page redirect should be suppressed for this
 * raw query because a Business Override explicitly signals that the search-
 * results page (with multi-intent chips and filtering) is the richer
 * destination.
 *
 * Applies normalizeSearchQuery internally so callers can pass the raw URL
 * param value (e.g. "Cats", "CATS", " cat ") without pre-normalizing.
 *
 * Used in the search page's topic-redirect guard:
 *   if (target && !target.searchFallback && !shouldSkipTopicRedirect(q)) redirect(...)
 */
export function shouldSkipTopicRedirect(rawQuery: string): boolean {
  return !!getBusinessOverride(normalizeSearchQuery(rawQuery));
}
