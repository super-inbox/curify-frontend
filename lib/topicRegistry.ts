import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import taxonomy from "./taxonomy.json";
import topicsI18n from "@/messages/en/topics.json";

// i18n-gating: a topic is only navigable (clickable chip + reachable
// /topics/<slug> page) if it has an EN i18n entry in
// messages/en/topics.json. The taxonomy holds many tier-3/tier-4
// vocabulary entries that don't yet have authored topic-page content
// (mood/aesthetic/lighting/temporal/product cohorts from Rounds 2B/2D);
// they stay in the taxonomy as vocabulary but the registry treats them
// as undeclared until i18n lands. Documented in docs/search-and-content.md.
const LOCALIZED_TOPIC_IDS: Set<string> = new Set(
  Object.keys((topicsI18n as { topics: Record<string, unknown> }).topics)
);
export function isLocalizedTopic(id: string): boolean {
  return LOCALIZED_TOPIC_IDS.has(id);
}

export type Topic = {
  id: string;
};

type TemplateLike = {
  id: string;
  topics?: string | string[];
};

type InspirationLike = {
  id: string;
  template_id: string;
  topics?: string[];
};

export type TopicWithTemplates = Topic & {
  templates: TemplateLike[];
  templateCount: number;
  isEnabled: boolean;
  parentTopic?: string;
};

export type TopicRegistry = {
  topics: TopicWithTemplates[];
  topicById: Map<string, TopicWithTemplates>;
  topicToTemplates: Map<string, TemplateLike[]>;
  templateToTopics: Map<string, string[]>;
  relatedTopics: Map<string, string[]>;
};

function normalizeTopicValues(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

// Source-of-truth data lives in lib/taxonomy.json so .cjs scripts
// (e.g. scripts/sync_nano_inspiration.cjs auto-tagger) can require
// the same mappings without duplicating them.
const TIER1_TAG_CHILDREN: Record<string, string[]> = taxonomy.tier3;
const EXPLICIT_CHILD_TOPICS: Record<string, string[]> = taxonomy.tier2;
// MBTI types and SUBJECT tags are derived views of the tier3 buckets —
// kept as named constants because they are referenced by short name
// in EXPLICIT_SIBLING_GROUPS below and by the auto-tag pipeline.
const MBTI_TYPE_TAGS = TIER1_TAG_CHILDREN.personality;

// Sibling groups for tag-style topics (shown as related tag chips at
// the bottom of topic pages). Mirrors the per-Tier-1 tag lists since
// Tier 3 tags share scope with their Tier 1 ancestor.
const EXPLICIT_SIBLING_GROUPS: string[][] = [
  TIER1_TAG_CHILDREN.travel,
  ["english-chinese", "english-spanish", "english-korean", "english-japanese", "english-french"],
  TIER1_TAG_CHILDREN.design,
  ["animals", "nature", "space", "weather"],
  MBTI_TYPE_TAGS,
  TIER1_TAG_CHILDREN.lifestyle,
];

// Reverse map: Tier 3 tag → Tier 1 parent
const TIER3_TAG_PARENT = new Map<string, string>();
for (const [tier1, tags] of Object.entries(TIER1_TAG_CHILDREN)) {
  for (const tag of tags) {
    TIER3_TAG_PARENT.set(tag, tier1);
  }
}

// Gallery tag to pull from nano-banana-pro-prompts for a topic page.
const TOPIC_GALLERY_TAG: Record<string, string> = {
  character:      "character",
  nostalgia:      "nostalgic",
  product:        "product",
  anime:          "anime",
  food:           "food",
  fashion:        "fashion",
  fitness:        "fitness",
  photorealistic: "photorealistic",
  architecture:   "architecture",
  travel:         "landscape",
  portrait:       "portrait",
  monochrome:     "monochrome",
  watercolor:     "watercolor",
  animal:         "animal",
  city:           "urban",
  film:           "cinematic",
  ai:             "futuristic",
  posters:        "vintage",
  "digital-canvas": "artistic",
  relationship:   "couple",
  // Fashion-style Tier 3 tags under lifestyle
  minimalist:     "minimalist",
  "soft-girl":    "soft",
  edgy:           "edgy",
  athleisure:     "athletic",
  chic:           "chic",
  "vintage-retro": "vintage",
  elegant:        "elegant",
  casual:         "casual",
  "high-fashion": "high fashion",
  // ---- 2026-05-21 — gallery row for the new tier-2 topics that landed
  // with the gallery tag taxonomy pass + the culture tier-1 split. Picks
  // the single most-representative gallery tag per topic so the topic
  // page surfaces a relevant prompt row even when the template set is
  // still thin. -------------------------------------------------------
  mood:                 "cozy",
  lighting:             "golden hour",
  seasonal:             "winter",
  composition:          "collage",
  "cultural-festivals": "festive",
};

// Blog tag to pull posts for a topic page. Use when one tag in
// public/data/blogs.json maps cleanly to a topic.
const TOPIC_BLOG_TAG: Record<string, string> = {
  ai: "Creator Tools",
};

// Specific blog slugs to surface on a topic page. Use when a single
// canonical post belongs to a topic but its tag is too generic to
// map via TOPIC_BLOG_TAG (e.g. tag "Nano Template" is shared by many
// posts; only this one is the canonical world-cup explainer).
// Resolved against public/data/blogs.json by slug.
const TOPIC_BLOG_SLUGS: Record<string, string[]> = {
  // Main WC topic page — links to the hub blog + the 3 new 2026-06-05
  // longform posts + the 4 existing prompt-recipe posts.
  "world-cup": [
    "world-cup-2026-ai-prompt-hub",
    "world-cup-2026-top-contenders",
    "fifa-2026-host-city-travel-guide",
    "argentina-france-2022-world-cup-final",
    "brazil-argentina-soccer-poster-prompts",
    "portugal-soccer-poster-prompts",
    "france-soccer-poster-prompts",
    "ai-1v1-soccer-rivalry-prompts",
  ],
  // Country-WC tier-2 pages each pull the hub + the contenders + their
  // own country-relevant deep guides where they exist.
  "argentina-world-cup": [
    "argentina-france-2022-world-cup-final",
    "brazil-argentina-soccer-poster-prompts",
    "world-cup-2026-top-contenders",
    "world-cup-2026-ai-prompt-hub",
  ],
  "brazil-world-cup": [
    "brazil-argentina-soccer-poster-prompts",
    "world-cup-2026-ai-prompt-hub",
    "world-cup-2026-top-contenders",
  ],
  "france-world-cup": [
    "france-soccer-poster-prompts",
    "argentina-france-2022-world-cup-final",
    "world-cup-2026-top-contenders",
    "world-cup-2026-ai-prompt-hub",
  ],
  "portugal-world-cup": [
    "portugal-soccer-poster-prompts",
    "world-cup-2026-ai-prompt-hub",
  ],
  "spain-world-cup": [
    "world-cup-2026-top-contenders",
    "world-cup-2026-ai-prompt-hub",
  ],
  "england-world-cup": [
    "world-cup-2026-top-contenders",
    "world-cup-2026-ai-prompt-hub",
    "ai-1v1-soccer-rivalry-prompts",
  ],
  "germany-world-cup": [
    "world-cup-2026-ai-prompt-hub",
  ],
  "italy-world-cup": [
    "world-cup-2026-ai-prompt-hub",
  ],
  "netherlands-world-cup": [
    "world-cup-2026-ai-prompt-hub",
  ],
  "uruguay-world-cup": [
    "world-cup-2026-ai-prompt-hub",
  ],
};

// Reverse map: Tier 2 child → Tier 1 parent
const EXPLICIT_PARENT_TOPIC = new Map<string, string>();
for (const [parent, children] of Object.entries(EXPLICIT_CHILD_TOPICS)) {
  for (const child of children) {
    EXPLICIT_PARENT_TOPIC.set(child, parent);
  }
}

function buildTopicRegistry(): TopicRegistry {
  const templates = nanoTemplates as TemplateLike[];
  const inspirations = nanoInspiration as InspirationLike[];

  // Map template id → its normalized topics
  const templateTopicsMap = new Map<string, string[]>();
  for (const t of templates) {
    templateTopicsMap.set(t.id, normalizeTopicValues(t.topics));
  }

  // Derive topic → Set<templateId> from templates + examples
  const topicToTemplateIds = new Map<string, Set<string>>();
  const addTopic = (tp: string, tid: string) => {
    if (!topicToTemplateIds.has(tp)) topicToTemplateIds.set(tp, new Set());
    topicToTemplateIds.get(tp)!.add(tid);
  };

  for (const t of templates) {
    for (const tp of templateTopicsMap.get(t.id) ?? []) addTopic(tp, t.id);
  }
  for (const insp of inspirations) {
    if (!insp.topics?.length) continue;
    const tTps = templateTopicsMap.get(insp.template_id) ?? [];
    if (!tTps.length) continue;
    for (const tp of [...tTps, ...insp.topics]) addTopic(tp, insp.template_id);
  }

  // Build topicToTemplates and templateToTopics
  const templateById = new Map<string, TemplateLike>(templates.map((t) => [t.id, t]));
  const topicToTemplates = new Map<string, TemplateLike[]>();
  for (const [tp, ids] of topicToTemplateIds) {
    topicToTemplates.set(
      tp,
      Array.from(ids).map((id) => templateById.get(id)).filter((t): t is TemplateLike => Boolean(t))
    );
  }

  const templateToTopics = new Map<string, string[]>();
  for (const t of templates) {
    templateToTopics.set(t.id, normalizeTopicValues(t.topics));
  }

  // Collect every explicitly-declared topic id (Tier 1 keys, Tier 2
  // navigational children, and Tier 3 tag children). Filtered by i18n
  // presence — taxonomy entries without messages/en/topics.json content
  // stay as vocabulary but are NOT navigable until i18n is authored
  // (avoids /topics/<slug> pages that render with key-fallback strings).
  // Affects Round 2B/2D unlocalized cohorts (mood / aesthetic / lighting
  // / temporal / product tier-3) — 99 entries as of 2026-05-31.
  const declaredTopicIds = new Set<string>();
  for (const [tier1, children] of Object.entries(EXPLICIT_CHILD_TOPICS)) {
    if (LOCALIZED_TOPIC_IDS.has(tier1)) declaredTopicIds.add(tier1);
    for (const child of children) {
      if (LOCALIZED_TOPIC_IDS.has(child)) declaredTopicIds.add(child);
    }
  }
  for (const [tier1, tags] of Object.entries(TIER1_TAG_CHILDREN)) {
    if (LOCALIZED_TOPIC_IDS.has(tier1)) declaredTopicIds.add(tier1);
    for (const tag of tags) {
      if (LOCALIZED_TOPIC_IDS.has(tag)) declaredTopicIds.add(tag);
    }
  }

  // Build enriched topic list — union of data-derived + declared topics,
  // also gated by i18n presence so the few inspirations auto-tagged with
  // unlocalized terms (e.g. 'illustration' has 7 ins via gallery auto-tag)
  // don't materialize a broken topic page.
  const allTopicIds = new Set<string>([
    ...[...topicToTemplateIds.keys()].filter((id) => LOCALIZED_TOPIC_IDS.has(id)),
    ...declaredTopicIds,
  ]);
  const enrichedTopics: TopicWithTemplates[] = Array.from(allTopicIds).map(
    (id) => {
      const topicTemplates = topicToTemplates.get(id) ?? [];
      return {
        id,
        templates: topicTemplates,
        templateCount: topicTemplates.length,
        // Declared topics are clickable even when empty — the destination
        // page can still surface gallery prompts via TOPIC_GALLERY_TAG and
        // sibling chips, and SEO-wise we want the chip discoverable.
        isEnabled: topicTemplates.length > 0 || declaredTopicIds.has(id),
        parentTopic: EXPLICIT_PARENT_TOPIC.get(id),
      };
    }
  );

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((t) => [t.id, t])
  );

  // Manual cross-link map — UNI-directional cross-promotion that the tier
  // hierarchy doesn't capture. Today's seed: country travel pages → their
  // country-WC pages. The reverse direction (country-WC → travel) was
  // dropped 2026-06-04 per user direction: country-WC pages don't need
  // the back-link chip since the country is already in the page title.
  // Extend this map when other topic pairs warrant explicit cross-link.
  const RELATED_LINKS: Record<string, string[]> = {
    brazil:    ["brazil-world-cup"],
    argentina: ["argentina-world-cup"],
    france:    ["france-world-cup"],
    germany:   ["germany-world-cup"],
    italy:     ["italy-world-cup"],
    spain:     ["spain-world-cup"],
    uk:        ["england-world-cup"],
    portugal:  ["portugal-world-cup"],
  };
  const relatedTopics = new Map<string, string[]>(Object.entries(RELATED_LINKS));

  return { topics: enrichedTopics, topicById, topicToTemplates, templateToTopics, relatedTopics };
}

const registry = buildTopicRegistry();

// Build explicit sibling map
const explicitSiblingMap = new Map<string, string[]>();
for (const group of EXPLICIT_SIBLING_GROUPS) {
  for (const topic of group) {
    explicitSiblingMap.set(topic, group.filter((t) => t !== topic));
  }
}

export function getTopics(): TopicWithTemplates[] {
  return registry.topics;
}

export function getTopicById(topicId: string): TopicWithTemplates | undefined {
  return registry.topicById.get(topicId);
}

export function getTemplatesForTopic(topicId: string): TemplateLike[] {
  return registry.topicToTemplates.get(topicId) ?? [];
}

export function getTopicIdsForTemplate(templateId: string): string[] {
  return registry.templateToTopics.get(templateId) ?? [];
}

// Extra reverse-only enrichment: gallery tags that should surface
// templates from a related topic, even though no topic page pulls from
// that tag. Used solely by getTopicsForTag (tag page / prompt detail
// page "related templates" section). Does NOT affect the topic page,
// which still uses TOPIC_GALLERY_TAG one-way for its gallery row.
//
// Sourced from lib/taxonomy.json `gallery_tag_to_topics` (single
// source of truth, also read by lib/relatedTags.ts for sibling
// discovery). Edit there to add new tag-to-topic mappings.
const EXTRA_TAG_TO_TOPICS: Record<string, string[]> = taxonomy.gallery_tag_to_topics;

// Topics excluded from the reverse map only — their topic page still
// pulls a gallery row via TOPIC_GALLERY_TAG, but the tag page does NOT
// surface their templates. Use this when a topic's template set is too
// heterogeneous to make a coherent "Templates exploring [tag]" section.
// Sourced from lib/taxonomy.json `reverse_map_excluded_topics`.
const REVERSE_MAP_EXCLUDED_TOPICS = new Set<string>(taxonomy.reverse_map_excluded_topics);

// Reverse index of TOPIC_GALLERY_TAG (topic → tag), merged with
// EXTRA_TAG_TO_TOPICS. Built once at module load so the tag page can ask
// "what topics pull from this gallery tag?" without scanning per request.
// Multiple topics can share a tag (e.g. posters + vintage-retro both
// pull from "vintage"), so values are arrays.
const GALLERY_TAG_TO_TOPICS: Map<string, string[]> = (() => {
  const out = new Map<string, string[]>();
  for (const [topic, tag] of Object.entries(TOPIC_GALLERY_TAG)) {
    if (REVERSE_MAP_EXCLUDED_TOPICS.has(topic)) continue;
    const arr = out.get(tag);
    if (arr) arr.push(topic);
    else out.set(tag, [topic]);
  }
  for (const [tag, topics] of Object.entries(EXTRA_TAG_TO_TOPICS)) {
    const filtered = topics.filter((t) => !REVERSE_MAP_EXCLUDED_TOPICS.has(t));
    if (filtered.length === 0) continue;
    const arr = out.get(tag);
    if (arr) {
      for (const t of filtered) if (!arr.includes(t)) arr.push(t);
    } else {
      out.set(tag, [...filtered]);
    }
  }
  return out;
})();

/**
 * Return the topic ids whose topic page pulls from this gallery tag. Used
 * on the /nano-banana-pro-prompts/tag/[slug] page to surface templates
 * under those topics alongside the prompt grid. This is the strict reverse
 * of TOPIC_GALLERY_TAG, so if topic page X surfaces gallery tag Y, then
 * tag page Y surfaces topic X's templates (round-trip consistent).
 */
export function getTopicsForTag(tag: string): string[] {
  return GALLERY_TAG_TO_TOPICS.get(tag) ?? [];
}

export function getRelatedTopics(topicId: string): string[] {
  return registry.relatedTopics.get(topicId) ?? [];
}

/** All children (navigational) of a parent topic. */
export function getChildTopics(topicId: string): string[] {
  return EXPLICIT_CHILD_TOPICS[topicId] ?? [];
}

/** Parent of a child topic (from explicit hierarchy). */
export function getParentTopic(topicId: string): string | undefined {
  return EXPLICIT_PARENT_TOPIC.get(topicId);
}

export function hasTopic(topicId: string): boolean {
  return registry.topicById.has(topicId);
}

export function isTopicEnabled(topicId: string): boolean {
  return (registry.topicById.get(topicId)?.templateCount ?? 0) > 0;
}

export function getExplicitSiblings(topicId: string): string[] {
  return explicitSiblingMap.get(topicId) ?? [];
}

/** Returns true for Tier 2 navigational topics (defined in EXPLICIT_CHILD_TOPICS).
 *  Returns false for Tier 3 tag topics (geo, language pairs) which need example-level filtering. */
export function isNavigationalTopic(topicId: string): boolean {
  return EXPLICIT_PARENT_TOPIC.has(topicId);
}

/** Navigational subtopics for a parent topic (shown at top of page). */
export function getNavigationalChildren(topicId: string): string[] {
  return (EXPLICIT_CHILD_TOPICS[topicId] ?? []).filter((id) => isTopicEnabled(id));
}

/** Tag-style children for bottom of page (geo siblings, language pairs). */
export function getTagChildren(topicId: string): string[] {
  return TIER1_TAG_CHILDREN[topicId] ?? [];
}

/** Returns the Tier 1 ancestor for any topic (Tier 1 → itself, Tier 2 → parent, Tier 3 → Tier 1 via tag map). */
export function getTier1Ancestor(topicId: string): string | undefined {
  if (TIER1_TAG_CHILDREN[topicId] !== undefined || EXPLICIT_CHILD_TOPICS[topicId] !== undefined) return topicId;
  const tier2Parent = EXPLICIT_PARENT_TOPIC.get(topicId);
  if (tier2Parent) return tier2Parent;
  return TIER3_TAG_PARENT.get(topicId);
}

/**
 * Returns the single tier 1 topic that has tier 3 tag children for a given
 * template's topic list. Used to determine which tag row to show on template
 * pages (geo tags for lifestyle, language pairs for language, visual tags for
 * design). Returns undefined when no tier 1 with tag children is found.
 */
export function getPrimaryTagTier1(topicIds: string[]): string | undefined {
  for (const tp of topicIds) {
    const ancestor = getTier1Ancestor(tp);
    if (ancestor && TIER1_TAG_CHILDREN[ancestor] !== undefined) return ancestor;
  }
  return undefined;
}

/** Gallery tag for nano-banana-pro-prompts to show on this topic page, if any. */
export function getGalleryTag(topicId: string): string | undefined {
  return TOPIC_GALLERY_TAG[topicId];
}

// Tier-1 topic → persona chip slugs shown on reproduce/example surfaces.
// Mapping is deliberate, not topic-derived: each tier-1 implies which
// audiences will recognize value in those templates. Keep in sync with
// USE_CASES in lib/use-cases.ts.
//
// for-programmatic-seo is intentionally absent — it's a horizontal engine
// play (hub-and-spoke generator), not a vertical template browser, so it
// wouldn't be served by a "templates for travel" feed.
const TIER1_USE_CASES: Record<string, readonly string[]> = {
  character:   ["for-creators", "for-designers"],
  personality: ["for-creators", "for-designers"],
  language:    ["for-parents", "for-esl-learners", "for-publishers"],
  learning:    ["for-parents", "for-creators", "for-publishers"],
  travel:      ["for-creators", "for-marketers", "for-dtc-brands"],
  culture:     ["for-creators", "for-publishers", "for-designers"],
  lifestyle:   ["for-creators", "for-marketers", "for-dtc-brands"],
  design:      ["for-marketers", "for-designers", "for-dtc-brands"],
  product:     ["for-marketers", "for-designers", "for-dtc-brands"],
};

/** Persona chips appropriate for a template/example, derived from its
 *  tier-1 topic. First tier-1 ancestor found wins; empty list ⇒ no row. */
export function getUseCasesForTopics(topicIds: readonly string[]): string[] {
  for (const tp of topicIds) {
    const ancestor = getTier1Ancestor(tp);
    if (ancestor && TIER1_USE_CASES[ancestor]) {
      return [...TIER1_USE_CASES[ancestor]];
    }
  }
  return [];
}

/** Blog tag to filter blog posts for this topic page, if any. */
export function getBlogTag(topicId: string): string | undefined {
  return TOPIC_BLOG_TAG[topicId];
}

/** Specific blog slugs pinned to a topic (in addition to tag-based filter).
 *  Returns an empty array when the topic has no curated slugs. */
export function getBlogSlugsForTopic(topicId: string): string[] {
  return TOPIC_BLOG_SLUGS[topicId] ?? [];
}

export { normalizeTopicValues };
