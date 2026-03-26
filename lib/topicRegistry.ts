import topics from "@/public/data/topics.json";
import nanoTemplates from "@/public/data/nano_templates.json";

export type Topic = {
  id: string;
  icon: string;
  priority: number;
  keywords: string[];
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

function buildTopicRegistry(): TopicRegistry {
  const baseTopics = [...(topics as Topic[])].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );

  const topicToTemplates = new Map<string, TemplateLike[]>();
  const templateToTopics = new Map<string, string[]>();

  for (const topic of baseTopics) {
    topicToTemplates.set(topic.id, []);
  }

  for (const template of nanoTemplates as TemplateLike[]) {
    const topicIds = [...new Set(normalizeTopicValues(template.topics))].filter(
      (topicId) => topicToTemplates.has(topicId)
    );

    templateToTopics.set(template.id, topicIds);

    for (const topicId of topicIds) {
      topicToTemplates.get(topicId)?.push(template);
    }
  }

  const enrichedTopics: TopicWithTemplates[] = baseTopics.map((topic) => {
    const templates = topicToTemplates.get(topic.id) ?? [];
    return {
      ...topic,
      templates,
      templateCount: templates.length,
      isEnabled: templates.length > 0,
    };
  });

  const topicById = new Map<string, TopicWithTemplates>(
    enrichedTopics.map((topic) => [topic.id, topic])
  );

  return {
    topics: enrichedTopics,
    topicById,
    topicToTemplates,
    templateToTopics,
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

export function hasTopic(topicId: string): boolean {
  return registry.topicById.has(topicId);
}

export function isTopicEnabled(topicId: string): boolean {
  return (registry.topicById.get(topicId)?.templateCount ?? 0) > 0;
}

export { normalizeTopicValues };