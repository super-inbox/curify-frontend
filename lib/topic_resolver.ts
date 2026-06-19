/**
 * Pure topic resolver for Multi-Intent co-occurrence system.
 *
 * Accepts records or maps as arguments so it can be:
 *   - unit-tested with small fixtures
 *   - used without importing large JSON datasets into the resolver itself
 *   - safely called from both server and client contexts
 */

/** Minimal fields needed from a template record for topic resolution. */
export type TemplateTopicRecord = {
  id: unknown;
  topics?: unknown;
};

/** Minimal fields needed from an inspiration record for topic resolution. */
export type InspirationTopicRecord = {
  id: unknown;
  template_id?: unknown;
  topics?: unknown;
};

/** Result of resolveTopics — inspiration-only, template-only, and union. */
export type ResolvedTopics = {
  inspirationTopics: string[];
  templateTopics: string[];
  mergedTopics: string[];
};

/**
 * Normalize an unknown topic value to a clean deduplicated string array.
 *
 * Rules:
 *  - only string values are kept
 *  - each value is trimmed and lowercased (topics are lowercase slug convention)
 *  - empty strings are discarded
 *  - duplicates are removed; order is preserved (first occurrence wins)
 *  - hyphenated slugs are left intact
 *  - no semantic synonym mapping is applied here
 */
export function normalizeTopicList(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const item of input) {
    if (typeof item !== "string") continue;
    const slug = item.trim().toLowerCase();
    if (!slug) continue;
    if (seen.has(slug)) continue;
    seen.add(slug);
    result.push(slug);
  }
  return result;
}

/**
 * Build a Map from template id → normalized topic list.
 *
 * Records without a non-empty string id are silently ignored.
 * Missing or malformed topics are treated as an empty list.
 */
export function buildTemplateTopicsMap(
  templates: TemplateTopicRecord[]
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const t of templates) {
    if (typeof t?.id !== "string" || !t.id) continue;
    map.set(t.id, normalizeTopicList(t.topics));
  }
  return map;
}

/**
 * Resolve the topics for one inspiration record.
 *
 * - inspirationTopics  — topics from the inspiration record only
 * - templateTopics     — topics from the linked parent template only
 * - mergedTopics       — union of both; each slug appears at most once
 *
 * Missing template_id, unknown template_id, or missing topics never throw.
 * Tags and search_aliases are intentionally NOT included here.
 */
export function resolveTopics(
  inspiration: InspirationTopicRecord,
  templateMap: Map<string, string[]>
): ResolvedTopics {
  const inspirationTopics = normalizeTopicList(inspiration.topics);

  const templateId =
    typeof inspiration.template_id === "string" ? inspiration.template_id : "";
  const templateTopics = templateId ? (templateMap.get(templateId) ?? []) : [];

  const mergedSet = new Set<string>(inspirationTopics);
  for (const slug of templateTopics) mergedSet.add(slug);
  const mergedTopics = Array.from(mergedSet);

  return { inspirationTopics, templateTopics, mergedTopics };
}
