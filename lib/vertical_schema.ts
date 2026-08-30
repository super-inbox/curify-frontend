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

export type VerticalId = "education" | "mbti" | "merch" | "culture";

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
  // Culture & heritage pages: costume evolution, solar terms, relics, cross-country
  // comparison infographics. Added 2026-08-16 — the /topics/culture cluster had
  // NO schema, so its five highest-volume templates (costume 47 examples,
  // east-asian-comparison 24, clothing-evolution 18, solar-term 11, relic 10)
  // resolved null and could not carry authored knowledge at all, however much
  // prose we wrote. `education` was the wrong home: these are heritage reference
  // pages, not learning resources with an objective and a duration.
  //
  // schema.org Article rather than CreativeWork: these are explanatory editorial
  // pages about a subject, which is what Article models. Same choice the mbti
  // vertical makes for the same reason.
  culture: {
    id: "culture",
    label: "Culture & Heritage",
    schemaOrgType: "Article",
    attributes: [
      { key: "region", label: "Region", facet: true, taxonomyAxis: "NEW" },
      { key: "period", label: "Period", facet: true, taxonomyAxis: "NEW" },
      { key: "tradition", label: "Tradition", facet: true, taxonomyAxis: "NEW" },
      { key: "content_format", label: "Format", facet: true, taxonomyAxis: "content_shapes" },
    ],
    knowledgeSlots: [
      { key: "what_it_is", label: "What it is" },
      { key: "cultural_background", label: "Cultural background" },
      { key: "why_it_matters", label: "Why it matters" },
      { key: "how_to_read", label: "How to read this" },
    ],
    topicMatch: [
      "culture", "china", "history", "heritage", "tradition", "festival",
      "cultural-festivals", "costumes", "relic", "solar-term", "folklore",
    ],
  },
  merch: {
    id: "merch",
    label: "文创 / Merch",
    // NOT "Product", despite the name. Google validates Product as a rich-result
    // candidate and rejects any instance without `offers`, `review` or
    // `aggregateRating` — "Items with this issue are invalid" in GSC, which is
    // exactly what these pages threw. We cannot satisfy it honestly: a template
    // page is a generator, not a listing, and it has no price. The only ways to
    // clear it as a Product would be to invent a price or to fabricate ratings,
    // and fake reviews are a manual-action offence.
    //
    // CreativeWork is what these pages actually are — a design template — and it
    // has no required properties, so it validates. Nothing is lost: an invalid
    // Product earns no rich result either, it just also files an error. If merch
    // pages should ever chase Product rich results, that starts with really
    // selling something at a price on the page, which is a product decision.
    schemaOrgType: "CreativeWork",
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
    topicMatch: ["merch", "packaging", "mockup", "mockups", "sticker", "stickers", "magnet", "giftbox", "gift-box",
      "pod", "print-on-demand", "cultural-creative", "wenchuang", "souvenir", "collectible"],
  },
};

/** Route a template into a vertical by its topics[] (first schema whose topicMatch
 *  intersects wins). Returns null if none — page renders as today (no vertical layer). */
export function resolveVerticalForTopics(topics: string[] | undefined | null): VerticalSchema | null {
  if (!Array.isArray(topics) || topics.length === 0) return null;
  const set = new Set(topics.map((t) => String(t).toLowerCase()));
  // Deterministic order: mbti, education, merch, culture — FIRST MATCH WINS.
  //
  // mbti is FIRST because it is the most specific signal a template can carry.
  // Three MBTI templates (mbti-yellowstone, harry-potter-mbti-infographic,
  // mbti-stereotype-vs-reality-infographic) are also tagged `study-sheets`,
  // which put them under `education` when education was checked first. That was
  // not merely a mislabel: buildResolvedVertical filters attributes and
  // knowledge by the RESOLVED schema's slot keys, so authored MBTI content
  // (type_code, traits, compatibility) matched none of education's slots and
  // was dropped silently. All five enriched mbti-yellowstone examples — and
  // their 10-locale translations — rendered nothing at all.
  //
  // culture stays LAST for the mirror-image reason: a template tagged both
  // `culture` and `learning` (cultural-travel-journey) really is a learning
  // resource and should keep `education`.
  for (const id of ["mbti", "education", "merch", "culture"] as VerticalId[]) {
    const schema = VERTICAL_SCHEMAS[id];
    if (schema.topicMatch.some((t) => set.has(t))) return schema;
  }
  return null;
}
