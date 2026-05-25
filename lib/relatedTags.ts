// Tag-cluster sibling lookup for the nano-banana prompt surface.
//
// Source: lib/taxonomy.json `gallery_tag_to_topics` (gallery tag →
// tier-2/tier-3 topic[s] it maps to). Two tags are siblings when
// they share at least one mapped topic — so the "Related Tags" chip
// row on /nano-banana-pro-prompts/tag/[slug] and /[id] reflects the
// same clustering used by getTopicsForTag in topicRegistry.ts.
//
// Used by /nano-banana-pro-prompts/tag/[slug] and
// /nano-banana-pro-prompts/[id] to surface a "Related Tags" chip row.

import taxonomy from "./taxonomy.json";
import nanoMetadata from "./generated/nanobanana_prompts_metadata.json";

const TAG_TO_TOPICS: Record<string, string[]> =
  taxonomy.gallery_tag_to_topics as Record<string, string[]>;

// Build the reverse index once: topic → [tags that map to it]. Used to
// find siblings (all tags sharing a topic with the query tag).
const TOPIC_TO_TAGS = new Map<string, string[]>();
for (const [tag, topics] of Object.entries(TAG_TO_TOPICS)) {
  for (const topic of topics) {
    const arr = TOPIC_TO_TAGS.get(topic);
    if (arr) arr.push(tag);
    else TOPIC_TO_TAGS.set(topic, [tag]);
  }
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

/** Returns the primary topic this gallery tag belongs to (first in the
 *  mapping), or undefined if the tag is uncategorized. Useful for
 *  displaying a one-word cluster label. */
export function getTopicForTag(tag: string): string | undefined {
  const topics = TAG_TO_TOPICS[tag.toLowerCase()];
  return topics?.[0];
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
  const tagLower = tag.toLowerCase();
  const topics = TAG_TO_TOPICS[tagLower];
  if (!topics || topics.length === 0) return [];
  // Union of siblings across all topics this tag maps to.
  const seen = new Set<string>([tagLower]);
  const siblings: string[] = [];
  for (const topic of topics) {
    for (const sib of TOPIC_TO_TAGS.get(topic) ?? []) {
      const key = sib.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      siblings.push(sib);
    }
  }
  return siblings
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
