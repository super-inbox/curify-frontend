// SERVER-ONLY data registry: topic → templates, derived from
// nano_templates.json + nano_inspiration.json (~4MB combined). The
// `server-only` import makes any client component that imports this module
// fail the build. Client components must import topic helpers/types from
// "@/lib/topicRegistry_pure" (taxonomy-only, no nano JSON). Pure helpers +
// types are re-exported below for back-compat with server callers.
import "server-only";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoInspiration from "@/public/data/nano_inspiration.json";
import {
  LOCALIZED_TOPIC_IDS,
  EXPLICIT_CHILD_TOPICS,
  EXPLICIT_PARENT_TOPIC,
  TIER1_TAG_CHILDREN,
  normalizeTopicValues,
  type TemplateLike,
  type InspirationLike,
  type TopicWithTemplates,
  type TopicRegistry,
  type TopicNavItem,
} from "./topicRegistry_pure";

// Re-export every client-safe helper + type so existing server imports from
// "@/lib/topicRegistry" keep working unchanged.
export * from "./topicRegistry_pure";

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

  return { topics: enrichedTopics, topicById, topicToTemplates, templateToTopics };
}

const registry = buildTopicRegistry();

export function getTopics(): TopicWithTemplates[] {
  return registry.topics;
}

/** Slim {id, isEnabled} list for the client TopicNavRow chip row — avoids
 *  shipping the full registry (with per-topic template arrays) to the client.
 *  Server components compute this and pass it down as a prop. */
export function getTopicNavList(): TopicNavItem[] {
  return registry.topics.map((t) => ({ id: t.id, isEnabled: t.isEnabled }));
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

/** Navigational subtopics for a parent topic (shown at top of page). */
export function getNavigationalChildren(topicId: string): string[] {
  return (EXPLICIT_CHILD_TOPICS[topicId] ?? []).filter((id) => isTopicEnabled(id));
}
