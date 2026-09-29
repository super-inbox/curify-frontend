// Template curation for the /use-cases/<slug> example grids.
//
// Pure module (no nano JSON imports, no server-only) so it can be unit-tested
// and reused. The page passes in the nano registry and the usage snapshot.
//
// Why this exists (2026-09-29): the grids were built by filtering every
// template on `use_cases` — which, when a template has no explicit tag, falls
// back to getUseCasesForTopics(topics) (TIER1_USE_CASES). That fallback pulled
// off-topic templates onto the B2B personas (the WC knockout poster, rank 350,
// led for-marketers / for-dtc-brands), left for-photographers and
// for-programmatic-seo with ZERO examples (no tier-1 topic maps to them), and
// let 4–5 top-rank templates own the first screen.
//
// Now each curated persona gets:
//   pool     = templates explicitly tagged with the slug in nano_templates.json
//              ∪ templates directly tagged with one of the persona's topics
//                (the same "directly has this topic" rule as /topics/<slug>)
//              ∪ an explicit id allowlist (e.g. SELFIE_TEMPLATE_IDS).
//              Topic-FALLBACK-only matches are deliberately excluded.
//   relevant = hand-ordered USE_CASE_CURATED_TEMPLATES first, rest by rank.
//   popular  = recent usage (recent_templates.json) first, then rank.
// The page interleaves each template's examples round-robin, so adjacent
// tiles are different templates (no per-group cap).

import { normalizeTopicValues } from "@/lib/topicRegistry_pure";
import { SELFIE_TEMPLATE_IDS } from "@/lib/topic_workbench";

export type UseCaseCurationMode = "relevant" | "popular";

type PoolSpec = {
  /** Template topic tags that qualify a template (direct tag match). */
  topics: readonly string[];
  /** Extra template ids that always qualify. */
  templateIds?: Iterable<string>;
  /** Only admit topic-matched templates with `batch: true`. */
  batchOnly?: boolean;
  /** Template ids never shown on this page, even if tagged. */
  excludeIds?: Iterable<string>;
};

// Topic groups the user called out as well curated (2026-09-29): merch,
// branding/packaging, product, edu/language, portrait/selfie.
const TOPICS_MERCH = ["merch", "stickers", "merch-commerce", "product-lineup"];
const TOPICS_BRANDING_PACKAGING = [
  "branding",
  "brand",
  "packaging",
  "cosmetic-packaging",
  "gift-packaging",
];
const TOPICS_PRODUCT = [
  "product",
  "ecommerce",
  "product-photography",
  "commercial-photography",
];
const TOPICS_EDU_LANGUAGE = [
  "language",
  "vocabulary",
  "education",
  "learning-materials",
];
const TOPICS_PHOTO = [
  "product-photography",
  "commercial-photography",
  "studio",
];

// Selfie-allowlist templates that are character/merch deliverables rather
// than photography (user review 2026-09-29).
const PHOTOGRAPHER_EXCLUDED_SELFIE_IDS: ReadonlySet<string> = new Set([
  "template-ip-character-expression-sheet",
  "template-ip-creative-cultural-goods-mockup-set",
]);

export const USE_CASE_POOLS: Record<string, PoolSpec> = {
  "for-photographers": {
    topics: TOPICS_PHOTO,
    templateIds: [...SELFIE_TEMPLATE_IDS].filter(
      (id) => !PHOTOGRAPHER_EXCLUDED_SELFIE_IDS.has(id)
    ),
  },
  "for-programmatic-seo": {
    topics: [...TOPICS_EDU_LANGUAGE, ...TOPICS_PRODUCT, ...TOPICS_BRANDING_PACKAGING],
    batchOnly: true,
  },
  "for-merch-operators": { topics: [...TOPICS_MERCH, ...TOPICS_PRODUCT] },
  "for-dtc-brands": { topics: [...TOPICS_PRODUCT, ...TOPICS_BRANDING_PACKAGING] },
  "for-marketers": {
    topics: [
      ...TOPICS_BRANDING_PACKAGING,
      ...TOPICS_PRODUCT,
      ...TOPICS_MERCH,
      "promotional-poster",
      "marketing",
    ],
  },
  "for-publishers": {
    topics: TOPICS_EDU_LANGUAGE,
    // ASL has its own tool funnel; it is off-message for publishers
    // (user review 2026-09-29).
    excludeIds: ["template-asl-sign-language-tutorial-infographic"],
  },
};

export const USE_CASE_MODE: Record<string, UseCaseCurationMode> = {
  "for-photographers": "relevant",
  "for-programmatic-seo": "relevant",
  "for-merch-operators": "relevant",
  "for-marketers": "popular",
  "for-publishers": "popular",
  "for-dtc-brands": "popular",
};

/**
 * Hand-ordered leads for the "relevant" personas. Each id is also tagged with
 * the slug in nano_templates.json `use_cases`, so other surfaces (example
 * persona chips, etc.) see the same intent. Order alternates families so the
 * first screen reads as a range of deliverables, not one template repeated.
 */
export const USE_CASE_CURATED_TEMPLATES: Record<string, readonly string[]> = {
  // Portrait / selfie restyle, retouch, studio + product photography.
  // No wedding template exists in the catalogue yet (2026-09-29).
  "for-photographers": [
    "template-portrait-retouching-blueprint",
    "template-ecommerce-product-photography",
    "template-studio-digital-backdrop-scene",
    "template-figure-to-abstract-portrait-series",
    "template-fruit-drink-scene-photography",
    "template-lifestyle-photo-grid",
    "template-personal-fashion-outfit-style-variations",
    "template-home-textiles-ecommerce",
    "template-ai-outfit-try-on-poster",
    "template-hairstyle-color-recommendation",
    "template-9-grid-ecommerce-product-lifestyle-moodboard",
    "template-fashion-before-after-outfit-annotation-card",
    "template-surreal-macro-product-commercial-ad-poster",
  ],
  // One prompt, many pages: batch templates whose parameter is an entity
  // (word list, city, herb, country, product SKU) — i.e. a page per row.
  "for-programmatic-seo": [
    "template-vocabulary",
    "template-3d-region-landmark-map",
    "template-food-product-packaging-design",
    "template-herbal",
    "template-word-scene",
    "template-city-miniature",
    "template-cuisine-food-vocab-poster",
    "template-costume",
    "template-phonics-consonant-blend",
    "template-watercolor-world-map-illustration",
    "template-varieties-food-poster",
    "template-bilingual-object-structure-labeling",
    "template-ecommerce-product-photography",
    "template-species-science",
    "template-language-word-comparison-educational-poster",
    "template-chinese-character-learning-poster",
    "template-global-city-walkability-infographic-card",
    "template-kids-vocabulary-poster",
  ],
  // Merch + product: character/IP sheets, sticker packs, merch mockups,
  // packaging, listing assets.
  "for-merch-operators": [
    "template-ip-character-expression-sheet",
    "template-ip-creative-cultural-goods-mockup-set",
    "template-original-character-sticker-pack",
    "template-food-product-packaging-design",
    "template-brand-vi-full-visual-pack-mockup",
    "template-fashion-ecommerce",
    "template-product-theme-promotional-poster",
    "template-ip-emoji-sticker-sheet-poster",
    "template-amazon-long-scroll-product-infographic-template",
    "template-fridge-magnet-merch",
    "template-ip-gift-box-stationery-set-mockup",
    "template-brand-ip-mascot-design-board",
    "template-jigsaw-puzzle-box",
    "template-ecommerce-product-photography",
    "template-ip-character-design-specification-sheet",
    "template-lunar-new-year-red-envelope-set",
    "template-museum-gift-themed-merchandise-collection-display",
    "template-chinese-ancient-bronze-cultural-creative-product-technical-design-sheet",
  ],
};

/**
 * Mirror of IP_DENYLIST in scripts/snapshot_recent_templates.cjs: templates
 * that reproduce someone else's work (mastheads, logos, real covers). The
 * snapshot already drops them from usage; this keeps rank_score from
 * promoting them onto a persona page either.
 */
export const USE_CASE_IP_DENYLIST: ReadonlySet<string> = new Set([
  "template-fruit-commercial-lifestyle-infographic-poster",
  "template-ballroom-dance-step-vintage-tutorial-infographic",
  "template-book-minimalist",
  "template-musical-instrument-technical-infographic-poster",
  "template-national-culture-history-infographic",
]);

export type CurationTemplate = {
  id: string;
  topics?: string | string[];
  use_cases?: string[];
  rank_score?: number;
  batch?: boolean;
};

export type CurationRegistry = {
  templates: readonly CurationTemplate[];
  imagesByTemplateId: ReadonlyMap<string, readonly unknown[]>;
};

export type RecentTemplatesSnapshot = {
  templates?: ReadonlyArray<{ id: string }>;
};

/**
 * Round-robin interleave of per-template example lists, so adjacent grid
 * tiles come from different templates while template order is preserved.
 */
export function interleaveRoundRobin<T>(groups: readonly (readonly T[])[]): T[] {
  const out: T[] = [];
  const maxLen = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < maxLen; i++) {
    for (const g of groups) {
      if (i < g.length) out.push(g[i]);
    }
  }
  return out;
}

export function isCuratedUseCase(slug: string): boolean {
  return slug in USE_CASE_MODE;
}

const byRankDesc = (a: CurationTemplate, b: CurationTemplate) =>
  (b.rank_score ?? 1) - (a.rank_score ?? 1);

/**
 * Ordered template ids for a curated use-case grid, or null for slugs this
 * module does not curate (the caller keeps its previous behaviour).
 * Templates without images or on the IP denylist are excluded.
 */
export function getUseCaseTemplateOrder(
  slug: string,
  registry: CurationRegistry,
  recentTemplates?: RecentTemplatesSnapshot | null
): string[] | null {
  const mode = USE_CASE_MODE[slug];
  const spec = USE_CASE_POOLS[slug];
  if (!mode || !spec) return null;

  const topicSet = new Set(spec.topics);
  const extraIds = new Set(spec.templateIds ?? []);
  const excludedIds = new Set(spec.excludeIds ?? []);

  const pool = registry.templates.filter((t) => {
    if (USE_CASE_IP_DENYLIST.has(t.id)) return false;
    if (excludedIds.has(t.id)) return false;
    if (!(registry.imagesByTemplateId.get(t.id)?.length)) return false;
    if (t.use_cases?.includes(slug)) return true;
    if (extraIds.has(t.id)) return true;
    if (spec.batchOnly && t.batch !== true) return false;
    return normalizeTopicValues(t.topics).some((tp) => topicSet.has(tp));
  });
  const poolById = new Map(pool.map((t) => [t.id, t] as const));

  if (mode === "relevant") {
    const curated = (USE_CASE_CURATED_TEMPLATES[slug] ?? []).filter((id) =>
      poolById.has(id)
    );
    const curatedSet = new Set(curated);
    const rest = pool
      .filter((t) => !curatedSet.has(t.id))
      .sort(byRankDesc)
      .map((t) => t.id);
    return [...curated, ...rest];
  }

  // popular: usage order first (unavailable / denylisted ids are simply not
  // in the pool), then rank_score.
  const usageIds = (recentTemplates?.templates ?? [])
    .map((r) => r.id)
    .filter((id, i, arr) => poolById.has(id) && arr.indexOf(id) === i);
  const usageSet = new Set(usageIds);
  return [
    ...usageIds,
    ...pool
      .filter((t) => !usageSet.has(t.id))
      .sort(byRankDesc)
      .map((t) => t.id),
  ];
}
