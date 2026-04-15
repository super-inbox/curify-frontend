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
  childTopics: Map<string, string[]>;
  parentTopic: Map<string, string>;
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


const HIERARCHY_FOCUS_TOPICS = new Set([
  "lifestyle",
  "language",
  "character",
  "product",
  "learning",
]);

// Explicit sibling groups for topics that share a semantic category
// but don't need a real parent topic page (e.g. geo countries, language pairs).
const EXPLICIT_SIBLING_GROUPS: string[][] = [
  ["spain", "france", "india", "japan", "korea", "thailand", "mexico"],
  ["english-chinese", "english-spanish", "english-korean", "english-japanese"],
];

// Explicit parent→children for top-level topics that are semantically subtopics
// but appear directly on templates (so co-occurrence detection won't catch them).
const EXPLICIT_CHILD_TOPICS: Record<string, string[]> = {
  language: ["vocabulary", "dialogue", "expressions", "language-english"],
  character: ["comparison", "groups", "mbti", "film", "sports", "gaming", "ai"],
  lifestyle: ["travel", "food", "finance", "interior", "fitness", "nostalgia"],
  learning: ["culture", "architecture", "history", "science"],
};

// A single co-occurrence row: topics that appear together for a given template
type TopicRow = {
  templateId: string;
  topics: string[];
};

function buildRows(templates: TemplateLike[], inspirations: InspirationLike[]): TopicRow[] {
  const rows: TopicRow[] = [];

  // Map template id → its normalized topics for quick lookup
  const templateTopicsMap = new Map<string, string[]>();
  for (const t of templates) {
    templateTopicsMap.set(t.id, normalizeTopicValues(t.topics));
  }

  // Row per template
  for (const t of templates) {
    const topics = templateTopicsMap.get(t.id) ?? [];
    if (topics.length > 0) rows.push({ templateId: t.id, topics });
  }

  // Row per inspiration example that has topics — merged with template topics
  for (const insp of inspirations) {
    if (!insp.topics?.length) continue;
    const templateTopics = templateTopicsMap.get(insp.template_id) ?? [];
    if (!templateTopics.length) continue;
    const merged = [...new Set([...templateTopics, ...insp.topics])];
    rows.push({ templateId: insp.template_id, topics: merged });
  }

  return rows;
}

function buildTopicRegistry(): TopicRegistry {
  const templates = nanoTemplates as TemplateLike[];
  const inspirations = nanoInspiration as InspirationLike[];

  // Set of topics that appear directly on templates (top-level)
  const templateLevelTopics = new Set<string>();
  for (const t of templates) {
    for (const tp of normalizeTopicValues(t.topics)) templateLevelTopics.add(tp);
  }

  // Build unified rows
  const rows = buildRows(templates, inspirations);

  // Derive topic → Set<templateId> from all rows
  const topicToTemplateIds = new Map<string, Set<string>>();
  for (const row of rows) {
    for (const tp of row.topics) {
      if (!topicToTemplateIds.has(tp)) topicToTemplateIds.set(tp, new Set());
      topicToTemplateIds.get(tp)!.add(row.templateId);
    }
  }

  // Build topicToTemplates (resolved template objects) and templateToTopics
  const topicToTemplates = new Map<string, TemplateLike[]>();
  const templateById = new Map<string, TemplateLike>(templates.map((t) => [t.id, t]));

  for (const [tp, ids] of topicToTemplateIds) {
    topicToTemplates.set(
      tp,
      Array.from(ids)
        .map((id) => templateById.get(id))
        .filter((t): t is TemplateLike => Boolean(t))
    );
  }

  const templateToTopics = new Map<string, string[]>();
  for (const t of templates) {
    templateToTopics.set(t.id, normalizeTopicValues(t.topics));
  }

  // Separate top-level topics from child topics
  const childTopics = new Map<string, string[]>();
  const parentTopic = new Map<string, string>();

  for (const tp of topicToTemplateIds.keys()) {
    if (templateLevelTopics.has(tp)) continue; // top-level, skip

    // Find the focus topic this child co-occurs with most
    let bestParent: string | undefined;
    let bestCount = 0;
    for (const focusTp of HIERARCHY_FOCUS_TOPICS) {
      if (!topicToTemplateIds.has(focusTp)) continue;
      const focusIds = topicToTemplateIds.get(focusTp)!;
      const childIds = topicToTemplateIds.get(tp)!;
      const overlap = [...childIds].filter((id) => focusIds.has(id)).length;
      if (overlap > bestCount) {
        bestCount = overlap;
        bestParent = focusTp;
      }
    }

    if (bestParent) {
      parentTopic.set(tp, bestParent);
      if (!childTopics.has(bestParent)) childTopics.set(bestParent, []);
      childTopics.get(bestParent)!.push(tp);
    }
  }

  // Build enriched topic list
  const allTopicIds = Array.from(topicToTemplateIds.keys());
  const enrichedTopics: TopicWithTemplates[] = allTopicIds.map((id) => {
    const topicTemplates = topicToTemplates.get(id) ?? [];
    return {
      id,
      templates: topicTemplates,
      templateCount: topicTemplates.length,
      isEnabled: topicTemplates.length > 0,
      parentTopic: parentTopic.get(id),
    };
  });

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((t) => [t.id, t])
  );

  // Related topics: focus topics sharing >= 2 templates, top-level only
  const RELATED_FOCUS = new Set(["learning", "character", "lifestyle", "product"]);
  const MIN_OVERLAP = 2;
  const relatedTopics = new Map<string, string[]>();
  const topLevelIds = allTopicIds.filter((id) => templateLevelTopics.has(id));

  for (const a of topLevelIds) {
    if (!RELATED_FOCUS.has(a)) continue;
    const aIds = topicToTemplateIds.get(a)!;
    const related: string[] = [];
    for (const b of topLevelIds) {
      if (a === b) continue;
      const bIds = topicToTemplateIds.get(b)!;
      const overlap = [...aIds].filter((id) => bIds.has(id)).length;
      if (overlap >= MIN_OVERLAP) related.push(b);
    }
    if (related.length > 0) relatedTopics.set(a, related);
  }

  return {
    topics: enrichedTopics,
    topicById,
    topicToTemplates,
    templateToTopics,
    relatedTopics,
    childTopics,
    parentTopic,
  };
}

const registry = buildTopicRegistry();

// Build explicit sibling map from groups
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

export function getChildTopics(topicId: string): string[] {
  const auto = registry.childTopics.get(topicId) ?? [];
  const explicit = EXPLICIT_CHILD_TOPICS[topicId] ?? [];
  return [...new Set([...explicit, ...auto])];
}

export function getParentTopic(topicId: string): string | undefined {
  return registry.parentTopic.get(topicId);
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

/** Navigational subtopics explicitly defined for a parent topic (shown in top nav). */
export function getNavigationalChildren(topicId: string): string[] {
  return (EXPLICIT_CHILD_TOPICS[topicId] ?? []).filter((id) => isTopicEnabled(id));
}

/** Tag-style children: auto-detected via co-occurrence (e.g. geo tags, language pairs).
 *  Shown at the bottom of the page, not in top nav. */
export function getTagChildren(topicId: string): string[] {
  return registry.childTopics.get(topicId) ?? [];
}

export { normalizeTopicValues };