import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";

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

// Explicit sibling groups for tag-style topics (geo, language pairs).
// These appear at the bottom of topic pages as related tags.
const EXPLICIT_SIBLING_GROUPS: string[][] = [
  ["spain", "france", "india", "japan", "korea", "thailand", "mexico", "uk", "brazil", "vietnam", "singapore", "egypt"],
  ["english-chinese", "english-spanish", "english-korean", "english-japanese"],
];

// Tier 1 → Tier 3 tag children mapping.
// These tags appear at the bottom of the Tier 1 topic page.
const TIER1_TAG_CHILDREN: Record<string, string[]> = {
  lifestyle: ["spain", "france", "india", "japan", "korea", "thailand", "mexico", "uk", "brazil", "vietnam", "singapore", "egypt"],
  language:  ["english-chinese", "english-spanish", "english-korean", "english-japanese"],
};

// Full explicit parent→children hierarchy.
// Tier 1 (entry bar): character, language, lifestyle, learning, product
// Tier 2 (navigational subtopics, shown at top of parent page)
const EXPLICIT_CHILD_TOPICS: Record<string, string[]> = {
  character: ["mbti", "film", "sports", "gaming", "comparison", "groups"],
  language:  ["vocabulary", "dialogue", "expressions", "language-english"],
  lifestyle: ["travel", "food", "fitness", "nostalgia", "city", "fashion"],
  learning:  ["science", "trending", "culture", "architecture", "history", "ai", "finance"],
  product:   [],
  design:    ["interior"],
};

// Reverse map: Tier 3 tag → Tier 1 parent
const TIER3_TAG_PARENT = new Map<string, string>();
for (const [tier1, tags] of Object.entries(TIER1_TAG_CHILDREN)) {
  for (const tag of tags) {
    TIER3_TAG_PARENT.set(tag, tier1);
  }
}

// Gallery tag to pull from nano-banana-pro-prompts for a topic page.
const TOPIC_GALLERY_TAG: Record<string, string> = {
  character: "character",
  nostalgia: "nostalgic",
  product:   "product",
};

// Blog tag to pull posts for a topic page.
const TOPIC_BLOG_TAG: Record<string, string> = {
  ai: "Creator Tools",
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

  // Build enriched topic list (parentTopic from explicit map)
  const allTopicIds = Array.from(topicToTemplateIds.keys());
  const enrichedTopics: TopicWithTemplates[] = allTopicIds.map((id) => {
    const topicTemplates = topicToTemplates.get(id) ?? [];
    return {
      id,
      templates: topicTemplates,
      templateCount: topicTemplates.length,
      isEnabled: topicTemplates.length > 0,
      parentTopic: EXPLICIT_PARENT_TOPIC.get(id),
    };
  });

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((t) => [t.id, t])
  );

  // Related topics: only among true Tier 1 topics (entry bar)
  const TIER1_TOPICS = new Set(["character", "language", "lifestyle", "learning", "product", "design"]);
  const RELATED_FOCUS = new Set(["learning", "character", "lifestyle", "product"]);
  const MIN_OVERLAP = 2;
  const relatedTopics = new Map<string, string[]>();
  const tier1Ids = allTopicIds.filter((id) => TIER1_TOPICS.has(id));

  for (const a of tier1Ids) {
    if (!RELATED_FOCUS.has(a)) continue;
    const aIds = topicToTemplateIds.get(a)!;
    const related: string[] = [];
    for (const b of tier1Ids) {
      if (a === b) continue;
      const bIds = topicToTemplateIds.get(b)!;
      const overlap = [...aIds].filter((id) => bIds.has(id)).length;
      if (overlap >= MIN_OVERLAP) related.push(b);
    }
    if (related.length > 0) relatedTopics.set(a, related);
  }

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

/** Gallery tag for nano-banana-pro-prompts to show on this topic page, if any. */
export function getGalleryTag(topicId: string): string | undefined {
  return TOPIC_GALLERY_TAG[topicId];
}

/** Blog tag to filter blog posts for this topic page, if any. */
export function getBlogTag(topicId: string): string | undefined {
  return TOPIC_BLOG_TAG[topicId];
}

export { normalizeTopicValues };
