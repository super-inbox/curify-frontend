import nanoTemplates from "@/public/data/nano_templates.json";

export type Topic = {
  id: string;
};

type TemplateLike = {
  id: string;
  topics?: string | string[];
};

export type TopicWithTemplates = Topic & {
  templates: TemplateLike[];
  templateCount: number;
  isEnabled: boolean;
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

function buildTopicRegistry(): TopicRegistry {
  const templates = nanoTemplates as TemplateLike[];
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

  const enrichedTopics: TopicWithTemplates[] = baseTopics.map((topic) => {
    const topicTemplates = topicToTemplates.get(topic.id) ?? [];
    return {
      ...topic,
      templates: topicTemplates,
      templateCount: topicTemplates.length,
      isEnabled: topicTemplates.length > 0,
    };
  });

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((topic) => [topic.id, topic])
  );

  // Build related topics: pairs sharing >= 3 templates
  const MIN_OVERLAP = 3;
  const relatedTopics = new Map<string, string[]>();
  const topicIds = Array.from(topicToTemplates.keys());

  for (const a of topicIds) {
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

export function hasTopic(topicId: string): boolean {
  return registry.topicById.has(topicId);
}

export function isTopicEnabled(topicId: string): boolean {
  return (registry.topicById.get(topicId)?.templateCount ?? 0) > 0;
}

export { normalizeTopicValues };