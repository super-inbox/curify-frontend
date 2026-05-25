// Tag-category sibling lookup for the nano-banana prompt surface.
//
// Source: lib/categorized_tags.json (productionized from raw/ on
// 2026-05-25). The data is hand-curated category → tag[] mappings —
// e.g. mood_emotion → [playful, confident, joyful, ...]. We invert it
// once at module load so getRelatedTags(tag) returns the other tags
// from the same category cluster.
//
// Used by /nano-banana-pro-prompts/tag/[slug] and
// /nano-banana-pro-prompts/[id] to surface a "Related Tags" chip row.

import categorizedTags from "./categorized_tags.json";
import nanoMetadata from "./generated/nanobanana_prompts_metadata.json";

const CATEGORY_TO_TAGS: Record<string, string[]> = categorizedTags as Record<string, string[]>;

const TAG_TO_CATEGORY = new Map<string, string>();
for (const [category, tags] of Object.entries(CATEGORY_TO_TAGS)) {
  if (category === "uncategorized") continue;
  for (const tag of tags) TAG_TO_CATEGORY.set(tag.toLowerCase(), category);
}

// Canonical gallery tag set + count map — used to filter out related
// tags that have no live prompts (would 404 if clicked) and to rank by
// volume so the chip row leads with high-coverage siblings.
type NanoTagEntry = { tag: string; count: number };
const NANO_TAGS = (nanoMetadata as { metadata: { tags: NanoTagEntry[] } }).metadata.tags;
const TAG_COUNT = new Map<string, number>(
  NANO_TAGS.map((t) => [t.tag.toLowerCase(), t.count])
);
const CANONICAL_TAGS = new Set<string>(NANO_TAGS.map((t) => t.tag.toLowerCase()));

export function getCategoryForTag(tag: string): string | undefined {
  return TAG_TO_CATEGORY.get(tag.toLowerCase());
}

export type RelatedTagsOptions = {
  limit?: number;
  // Only return tags that have ≥1 live prompt in the gallery metadata.
  // Default true — clicking a 0-count tag would soft-404.
  liveOnly?: boolean;
};

export function getRelatedTags(
  tag: string,
  opts: RelatedTagsOptions = {}
): string[] {
  const { limit = 12, liveOnly = true } = opts;
  const category = TAG_TO_CATEGORY.get(tag.toLowerCase());
  if (!category) return [];
  const siblings = CATEGORY_TO_TAGS[category] ?? [];
  return siblings
    .filter((t) => t.toLowerCase() !== tag.toLowerCase())
    .filter((t) => (liveOnly ? CANONICAL_TAGS.has(t.toLowerCase()) : true))
    .sort((a, b) => (TAG_COUNT.get(b.toLowerCase()) ?? 0) - (TAG_COUNT.get(a.toLowerCase()) ?? 0))
    .slice(0, limit);
}

// For prompt detail pages: a prompt has multiple tags. Aggregate
// related-tag candidates across all its tags, dedupe, exclude the
// prompt's own tags, rank by live count, cap.
export function getRelatedTagsForPrompt(
  promptTags: string[],
  opts: RelatedTagsOptions = {}
): string[] {
  const { limit = 12, liveOnly = true } = opts;
  const ownTagsLower = new Set(promptTags.map((t) => t.toLowerCase()));
  const seen = new Set<string>();
  const candidates: string[] = [];
  for (const t of promptTags) {
    for (const sib of getRelatedTags(t, { limit: 50, liveOnly })) {
      const key = sib.toLowerCase();
      if (ownTagsLower.has(key) || seen.has(key)) continue;
      seen.add(key);
      candidates.push(sib);
    }
  }
  return candidates
    .sort((a, b) => (TAG_COUNT.get(b.toLowerCase()) ?? 0) - (TAG_COUNT.get(a.toLowerCase()) ?? 0))
    .slice(0, limit);
}
