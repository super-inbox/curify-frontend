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

export type TopicRegistry = {
  topics: Topic[];
  topicById: Map<string, Topic>;
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
  const sortedTopics = [...(topics as Topic[])].sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );

  const topicById = new Map<string, Topic>(
    sortedTopics.map((topic) => [topic.id, topic])
  );

  const topicToTemplates = new Map<string, TemplateLike[]>();
  const templateToTopics = new Map<string, string[]>();

  for (const topic of sortedTopics) {
    topicToTemplates.set(topic.id, []);
  }

  for (const template of nanoTemplates as TemplateLike[]) {
    const topicIds = normalizeTopicValues(template.topics).filter((topicId) =>
      topicById.has(topicId)
    );

    templateToTopics.set(template.id, topicIds);

    for (const topicId of topicIds) {
      topicToTemplates.get(topicId)?.push(template);
    }
  }

  return {
    topics: sortedTopics,
    topicById,
    topicToTemplates,
    templateToTopics,
  };
}

const registry = buildTopicRegistry();

export function getTopics(): Topic[] {
  return registry.topics;
}

export function getTopicById(topicId: string): Topic | undefined {
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

export { normalizeTopicValues };