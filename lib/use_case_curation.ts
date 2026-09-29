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
//   popular  = recent usage (recent_templates.json) first, then rank, then
//              diversified so no family / tier-1 group takes more than 2 slots
//              in the head; deferred templates are appended, not dropped.

import {
  getTier1Ancestor,
  normalizeTopicValues,
} from "@/lib/topicRegistry_pure";
import { SELFIE_TEMPLATE_IDS } from "@/lib/topic_workbench";

export type UseCaseCurationMode = "relevant" | "popular";

type PoolSpec = {
  /** Template topic tags that qualify a template (direct tag match). */
  topics: readonly string[];
  /** Extra template ids that always qualify. */
  templateIds?: Iterable<string>;
  /** Only admit topic-matched templates with `batch: true`. */
  batchOnly?: boolean;
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

export const USE_CASE_POOLS: Record<string, PoolSpec> = {
  "for-photographers": { topics: TOPICS_PHOTO, templateIds: SELFIE_TEMPLATE_IDS },
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
  "for-publishers": { topics: TOPICS_EDU_LANGUAGE },
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
 * Manual near-duplicate families. The diversity key is TEMPLATE_FAMILY[id]
 * when set, otherwise the template's tier-1 topic. Tier-1 alone is too coarse
 * on the product pages (almost everything is `product` or `design`) and too
 * fine for the World Cup set (split across `design` / `character` / `sports`).
 */
const FAMILY_MEMBERS: Record<string, readonly string[]> = {
  "world-cup": [
    "template-wc-knockout-matchup-poster",
    "template-wc-fan-outfit-poster",
    "template-wc-daily-recap-poster",
    "template-football-star-chibi-sticker-set",
    "template-world-cup-team-sticker-poster",
    "template-world-cup-premium-gold-text-poster",
    "template-soccer-star-comic-retro-poster-card",
    "template-all-sports-tournament-schedule-infographic",
    "template-universal-event-split-schedule-flyer-poster",
  ],
  mbti: [
    "template-mbti-ghibli",
    "template-harry-potter-mbti-infographic",
    "template-mbti-marvel",
    "template-mbti-stereotype-vs-reality-infographic",
  ],
  "food-guide": [
    "template-cuisine-food-vocab-poster",
    "template-varieties-food-poster",
    "template-wine-variety-intro-infographic",
    "template-regional-alcoholic-drinks-infographic",
  ],
  "brand-identity": [
    "template-brand-identity-moodboard-visual-system-poster",
    "template-brand-vi-full-visual-pack-mockup",
    "template-brand-logo-variant-set",
    "template-brand-font-specimen-set",
    "template-brand-ip-mascot-design-board",
    "template-brand-ip-full-design-board",
  ],
  packaging: [
    "template-food-product-packaging-design",
    "template-chocolate-giftbox-packaging",
    "template-perfume-cosmetic-bottle-mockup",
    "template-price-tag-product-label",
    "template-eco-farm-food-uniform-product-label",
  ],
  "product-photo": [
    "template-ecommerce-product-photography",
    "template-fruit-drink-scene-photography",
    "template-home-textiles-ecommerce",
    "template-9-grid-ecommerce-product-lifestyle-moodboard",
    "template-surreal-macro-product-commercial-ad-poster",
  ],
  "product-board": [
    "template-industrial-design-product-presentation-board",
    "template-minimalist-product-design-presentation-board",
    "template-industrial-design-concept-sketch",
    "template-luxury-vintage-gem-necklace-design-sheet",
  ],
  "listing-infographic": [
    "template-amazon-long-scroll-product-infographic-template",
    "template-amazon-product-six-grid-infographic-listing-poster",
  ],
  "promo-poster": [
    "template-product-poster",
    "template-product-theme-promotional-poster",
    "template-promotional-flyer",
    "template-discount-coupon-voucher",
    "template-einstein-character-russian-product-ad-poster",
  ],
  "fashion-tryon": [
    "template-ai-outfit-try-on-poster",
    "template-personal-fashion-outfit-style-variations",
    "template-fashion-ecommerce",
    "template-fashion-before-after-outfit-annotation-card",
  ],
  "ip-sticker": [
    "template-ip-character-expression-sheet",
    "template-original-character-sticker-pack",
    "template-ip-emoji-sticker-sheet-poster",
    "template-ip-character-sprite-emoji-sheet",
    "template-celebrity-meme-sticker-merchandise-collection-poster",
  ],
  "ip-merch-mockup": [
    "template-ip-creative-cultural-goods-mockup-set",
    "template-ip-gift-box-stationery-set-mockup",
    "template-museum-gift-themed-merchandise-collection-display",
    "template-fridge-magnet-merch",
    "template-city-landmark-fridge-magnet-collection",
  ],
};

export const TEMPLATE_FAMILY: Record<string, string> = Object.fromEntries(
  Object.entries(FAMILY_MEMBERS).flatMap(([family, ids]) =>
    ids.map((id) => [id, family] as const)
  )
);

/**
 * Topic-level families: big franchises spread across many templates (mbti,
 * world-cup), and the `education` printables (learning cards, worksheets,
 * reading lessons) whose topic lists carry no tier-1 id of their own.
 */
const TOPIC_FAMILY: Record<string, string> = {
  mbti: "mbti",
  "world-cup": "world-cup",
  education: "edu-printables",
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
 * Diversity key: manual id family, then topic family (mbti / world-cup), then
 * the template's tier-1 topic — preferring a topic that IS a tier-1 id over
 * the ancestor of a style tag listed earlier.
 */
export function templateGroupKey(t: CurationTemplate): string {
  const family = TEMPLATE_FAMILY[t.id];
  if (family) return family;
  const topics = normalizeTopicValues(t.topics);
  for (const tp of topics) {
    if (TOPIC_FAMILY[tp]) return TOPIC_FAMILY[tp];
  }
  const direct = topics.find((tp) => getTier1Ancestor(tp) === tp);
  if (direct) return direct;
  for (const tp of topics) {
    const tier1 = getTier1Ancestor(tp);
    if (tier1) return tier1;
  }
  return "other";
}

/**
 * Stable diversity pass: walk `items` in order, keeping at most `maxPerGroup`
 * per group in the head; over-quota items are deferred and appended after the
 * head in their original order (never dropped).
 */
export function diversifyTemplates<T>(
  items: readonly T[],
  opts: { maxPerGroup: number; groupOf: (item: T) => string }
): T[] {
  const counts = new Map<string, number>();
  const head: T[] = [];
  const deferred: T[] = [];
  for (const item of items) {
    const key = opts.groupOf(item);
    const n = counts.get(key) ?? 0;
    if (n < opts.maxPerGroup) {
      counts.set(key, n + 1);
      head.push(item);
    } else {
      deferred.push(item);
    }
  }
  return [...head, ...deferred];
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

  const pool = registry.templates.filter((t) => {
    if (USE_CASE_IP_DENYLIST.has(t.id)) return false;
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
  // in the pool), then rank_score, then the diversity pass.
  const usageIds = (recentTemplates?.templates ?? [])
    .map((r) => r.id)
    .filter((id, i, arr) => poolById.has(id) && arr.indexOf(id) === i);
  const usageSet = new Set(usageIds);
  const ordered = [
    ...usageIds.map((id) => poolById.get(id)!),
    ...pool.filter((t) => !usageSet.has(t.id)).sort(byRankDesc),
  ];
  return diversifyTemplates(ordered, {
    maxPerGroup: 2,
    groupOf: templateGroupKey,
  }).map((t) => t.id);
}
