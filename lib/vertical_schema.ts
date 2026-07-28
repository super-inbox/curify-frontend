/**
 * VerticalPageSchema v1 — the vertical domain-knowledge layer (Pillar 2).
 *
 * Adds a per-vertical ontology on top of the flat template/example pages so each
 * vertical earns SEO authority the way TpT (Education), 16Personalities (MBTI) and
 * Printify (Merch) do. See docs/vertical-page-schema-v1.md.
 *
 * A template belongs to a vertical via its `topics[]` (resolveVerticalForTopics).
 * The ontology VALUES for a given page live per-locale in messages/<loc>/nano.json
 * under `content.attributes` (chip strip + schema.org) and `content.vertical`
 * (authored knowledge slots) — read by resolveVerticalSections() in nano_seo_utils.
 *
 * v1 ships 3 verticals (education/mbti/merch); culture/ecommerce are designed in
 * the doc and queued.
 */

export type VerticalId = "education" | "mbti" | "merch";

/** One ontology field. `facet` marks it as a future browse filter; `taxonomyAxis`
 *  records the lib/taxonomy.json axis it derives from (or "NEW"). */
export interface AttributeDef {
  key: string;
  label: string;
  facet?: boolean;
  taxonomyAxis?: string;
}

/** One authored knowledge slot (Pillar 1 depth beyond what/who/how). */
export interface KnowledgeSlotDef {
  key: string;
  label: string;
}

export interface VerticalSchema {
  id: VerticalId;
  label: string;
  /** schema.org @type emitted as JSON-LD for pages in this vertical. */
  schemaOrgType: string;
  /** ontology fields → chip strip + structured data (Pillar 2). */
  attributes: AttributeDef[];
  /** authored knowledge sections rendered under "About this template" (Pillar 1). */
  knowledgeSlots: KnowledgeSlotDef[];
  /** topic tokens that route a template into this vertical (matched against topics[]). */
  topicMatch: string[];
}

export const VERTICAL_SCHEMAS: Record<VerticalId, VerticalSchema> = {
  education: {
    id: "education",
    label: "Education",
    schemaOrgType: "LearningResource",
    attributes: [
      { key: "grade_band", label: "Grade / Level", facet: true, taxonomyAxis: "NEW:grade" },
      { key: "age_range", label: "Age", taxonomyAxis: "NEW" },
      { key: "subject", label: "Subject", facet: true, taxonomyAxis: "tier1:language|learning" },
      { key: "skill", label: "Skill", facet: true, taxonomyAxis: "NEW" },
      { key: "resource_type", label: "Resource type", facet: true, taxonomyAxis: "information_types+NEW" },
      { key: "duration_min", label: "Duration", taxonomyAxis: "NEW" },
      { key: "difficulty", label: "Difficulty", taxonomyAxis: "NEW" },
      { key: "language_mode", label: "Language", taxonomyAxis: "NEW" },
    ],
    knowledgeSlots: [
      { key: "learning_objective", label: "Learning objectives" },
      { key: "includes", label: "What's included" },
      { key: "background", label: "Background" },
    ],
    topicMatch: ["education", "learning", "learning-materials", "study-sheets", "language",
      "phonics", "vocabulary", "reading", "worksheet", "flashcard", "bilingual", "hsk", "esl", "stem"],
  },
  mbti: {
    id: "mbti",
    label: "MBTI & Personality",
    schemaOrgType: "Article",
    attributes: [
      { key: "type_code", label: "Type", facet: true, taxonomyAxis: "NEW:mbti-type" },
      { key: "type_nickname", label: "Nickname", taxonomyAxis: "NEW" },
      { key: "dimensions", label: "Dimensions", taxonomyAxis: "NEW" },
      { key: "subject_kind", label: "Format", facet: true, taxonomyAxis: "content_shapes" },
    ],
    knowledgeSlots: [
      { key: "traits", label: "Personality traits" },
      { key: "strengths", label: "Strengths" },
      { key: "weaknesses", label: "Weaknesses" },
      { key: "communication", label: "Communication style" },
      { key: "relationships", label: "Relationships" },
      { key: "career", label: "Career fit" },
      { key: "compatibility", label: "Compatibility" },
    ],
    topicMatch: ["mbti", "personality", "16-personalities", "personality-type"],
  },
  merch: {
    id: "merch",
    label: "文创 / Merch",
    schemaOrgType: "Product",
    attributes: [
      { key: "product_type", label: "Product", facet: true, taxonomyAxis: "NEW" },
      { key: "material", label: "Material", facet: true, taxonomyAxis: "NEW" },
      { key: "process", label: "Process", facet: true, taxonomyAxis: "NEW" },
      { key: "dimensions", label: "Size", taxonomyAxis: "NEW" },
      { key: "print_spec", label: "Print spec", taxonomyAxis: "NEW" },
      { key: "color_profile", label: "Color", taxonomyAxis: "NEW" },
      { key: "use_case", label: "Use case", facet: true, taxonomyAxis: "tier1" },
    ],
    knowledgeSlots: [
      { key: "cultural_background", label: "Inspiration & story" },
      { key: "design_requirements", label: "Design requirements" },
      { key: "manufacturing_notes", label: "Manufacturing notes" },
    ],
    topicMatch: ["merch", "packaging", "mockup", "sticker", "magnet", "giftbox", "gift-box",
      "pod", "print-on-demand", "cultural-creative", "wenchuang", "souvenir", "collectible"],
  },
};

/** Route a template into a vertical by its topics[] (first schema whose topicMatch
 *  intersects wins). Returns null if none — page renders as today (no vertical layer). */
export function resolveVerticalForTopics(topics: string[] | undefined | null): VerticalSchema | null {
  if (!Array.isArray(topics) || topics.length === 0) return null;
  const set = new Set(topics.map((t) => String(t).toLowerCase()));
  // deterministic order: education, mbti, merch
  for (const id of ["education", "mbti", "merch"] as VerticalId[]) {
    const schema = VERTICAL_SCHEMAS[id];
    if (schema.topicMatch.some((t) => set.has(t))) return schema;
  }
  return null;
}
