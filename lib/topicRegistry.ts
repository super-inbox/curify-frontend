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

function deriveTopicsFromTemplates(
  templates: TemplateLike[]
): Topic[] {
  const distinctTopicIds = Array.from(
    new Set(
      templates.flatMap((template) =>
        normalizeTopicValues(template.topics)
      )
    )
  ).sort((a, b) => a.localeCompare(b));

  return distinctTopicIds.map((id) => ({ id }));
}

const HIERARCHY_FOCUS_TOPICS = new Set([
  "lifestyle",
  "language",
  "character",
  "product",
  "learning",
]);

function buildTopicRegistry(): TopicRegistry {
  const templates = nanoTemplates as TemplateLike[];
  const inspirations = nanoInspiration as InspirationLike[];
  const baseTopics = deriveTopicsFromTemplates(templates);

  const topicToTemplates = new Map<string, TemplateLike[]>();
  const templateToTopics = new Map<string, string[]>();

  for (const topic of baseTopics) {
    topicToTemplates.set(topic.id, []);
  }

  for (const template of templates) {
    const topicIds = [...new Set(normalizeTopicValues(template.topics))].filter(
      (topicId) => topicToTemplates.has(topicId)
    );

    templateToTopics.set(template.id, topicIds);

    for (const topicId of topicIds) {
      topicToTemplates.get(topicId)?.push(template);
    }
  }

  // Build child topics from nano_inspiration.topics for the 5 hierarchy focus topics
  const childTopics = new Map<string, string[]>();
  const parentTopic = new Map<string, string>();

  // child topic id → Set of template ids that have examples tagged with it
  const childToTemplateIds = new Map<string, Set<string>>();

  for (const insp of inspirations) {
    if (!insp.topics?.length) continue;

    // Find which focus topics this inspiration's template belongs to
    const templateFocusTopics = (templateToTopics.get(insp.template_id) ?? [])
      .filter((t) => HIERARCHY_FOCUS_TOPICS.has(t));

    if (!templateFocusTopics.length) continue;

    for (const childId of insp.topics) {
      // Skip if this is already a top-level topic
      if (topicToTemplates.has(childId)) continue;

      if (!childToTemplateIds.has(childId)) {
        childToTemplateIds.set(childId, new Set());
      }
      childToTemplateIds.get(childId)!.add(insp.template_id);

      // Assign parent (first focus topic found)
      if (!parentTopic.has(childId)) {
        parentTopic.set(childId, templateFocusTopics[0]);
      }
    }
  }

  // Group children by parent focus topic
  for (const [childId, templateIds] of childToTemplateIds) {
    const parent = parentTopic.get(childId)!;
    if (!childTopics.has(parent)) childTopics.set(parent, []);
    childTopics.get(parent)!.push(childId);

    // Register child topic in topicToTemplates so pages can query it
    const childTemplates = Array.from(templateIds)
      .map((id) => templates.find((t) => t.id === id))
      .filter((t): t is TemplateLike => Boolean(t));
    topicToTemplates.set(childId, childTemplates);
  }

  // Build enriched topics including child topics
  const enrichedTopics: TopicWithTemplates[] = baseTopics.map((topic) => {
    const topicTemplates = topicToTemplates.get(topic.id) ?? [];
    return {
      ...topic,
      templates: topicTemplates,
      templateCount: topicTemplates.length,
      isEnabled: topicTemplates.length > 0,
    };
  });

  // Add child topics to the topics list
  for (const [childId, templateSet] of childToTemplateIds) {
    const childTemplates = Array.from(templateSet)
      .map((id) => templates.find((t) => t.id === id))
      .filter((t): t is TemplateLike => Boolean(t));

    enrichedTopics.push({
      id: childId,
      templates: childTemplates,
      templateCount: childTemplates.length,
      isEnabled: childTemplates.length > 0,
      parentTopic: parentTopic.get(childId),
    });
  }

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((topic) => [topic.id, topic])
  );

  // Build related topics for focus topics only, sharing >= 2 templates
  const RELATED_FOCUS_TOPICS = new Set(["learning", "character", "lifestyle", "product"]);
  const MIN_OVERLAP = 2;
  const relatedTopics = new Map<string, string[]>();
  const topicIds = Array.from(topicToTemplates.keys()).filter(
    (id) => !parentTopic.has(id) // exclude child topics from related computation
  );

  for (const a of topicIds) {
    if (!RELATED_FOCUS_TOPICS.has(a)) continue;
    const aIds = new Set(topicToTemplates.get(a)!.map((t) => t.id));
    const related: string[] = [];
    for (const b of topicIds) {
      if (a === b) continue;
      const overlap = topicToTemplates.get(b)!.filter((t) => aIds.has(t.id)).length;
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
  return registry.childTopics.get(topicId) ?? [];
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

export { normalizeTopicValues };