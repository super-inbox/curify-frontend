// Blog → Topic hub mapping. Drives the W1.3 footer row that finally
// gives each blog post outbound links to /topics/* — the audit
// (docs/seo-funnel-audit-2026-06-26.md) found blogs hold 76% of all
// site clicks but emit ZERO outbound topic-hub links. W1.3 channels
// that authority share into the topic family, which had 17% sitemap
// coverage before W1.7.
//
// Two-tier lookup:
//   1. Per-slug curated mappings for high-traffic blogs (WC, mega-hubs,
//      sticker hubs, etc.) — precise topic matches optimize for
//      relevance signals + click-through.
//   2. Category-derived defaults for everything else. Every blog has a
//      category (see blog-config.ts), so this is a 100%-coverage fallback.
//
// Topic IDs are stored as raw strings here; the consumer filters
// through isFullyLocalizedTopic at render time, so listing a stub
// topic (e.g. "stickers") is harmless — it just won't render until
// authored.

export type BlogRelatedHubs = {
  topicIds: string[];
};

// Per-slug curated mappings. Cover the top-traffic blogs from the
// 2026-06-26 GSC audit (top 5 = 76% of clicks). Each maps to its most
// relevant fully-localized topic hubs in priority order.
const PER_SLUG_TOPICS: Record<string, string[]> = {
  // ── World Cup cluster (top 5 = 76% of clicks) ─────────────────────
  "brazil-argentina-soccer-poster-prompts": ["world-cup", "posters", "sports"],
  "portugal-soccer-poster-prompts": ["world-cup", "posters", "sports"],
  "france-soccer-poster-prompts": ["world-cup", "posters", "sports"],
  "world-cup-2026-ai-prompt-hub": ["world-cup", "sports", "posters"],
  "50-world-cup-2026-ai-prompts": ["world-cup", "posters", "sports"],
  "world-cup-2026-top-contenders": ["world-cup", "sports"],
  "fifa-2026-host-city-travel-guide": ["world-cup", "travel"],
  "argentina-france-2022-world-cup-final": ["world-cup", "sports"],
  "ai-1v1-soccer-rivalry-prompts": ["world-cup", "sports", "posters"],

  // ── Mega-hub cluster ─────────────────────────────────────────────
  "50-ai-sticker-design-prompts": ["design", "posters"],
  "50-ai-packaging-design-prompts": ["design", "posters"],
  "50-ai-makeover-prompts": ["makeover", "design"],
  "ai-product-photo-to-ecommerce-listing": ["design", "product"],
  "50-wimbledon-2026-ai-prompts": ["sports", "posters"],

  // ── Sticker + design ─────────────────────────────────────────────
  "ai-sticker-design-guide": ["design"],
  "ai-die-cut-sticker-design-guide": ["design"],
  "ai-packaging-design-guide": ["design", "posters"],
  "ai-makeover-guide": ["makeover", "design"],

  // ── Character / MBTI ─────────────────────────────────────────────
  "mbti-character-generator": ["mbti", "personality", "character"],
  "mbti-relationship-style-visualizer": ["mbti", "personality"],
  "character-prompt-generator": ["character", "personality"],
  "preserve-facial-features-ai-generation": ["character", "portrait"],

  // ── Travel ───────────────────────────────────────────────────────
  "ai-travel-scrapbook-wall-art-guide": ["travel", "wall-art"],
  "ai-travel-itinerary-guide": ["travel"],

  // ── Education / Learning ─────────────────────────────────────────
  "ai-phonics-flashcards-guide": ["phonics", "learning"],
  "ai-vocabulary-flashcards-guide": ["vocabulary", "learning"],
  "ai-biology-chemistry-flashcards-guide": ["learning"],
  "weird-science-facts-classroom-engagement": ["learning"],
  "viral-learning-content": ["learning"],
  "visual-learning-tools": ["learning"],

  // ── Merch / IP ───────────────────────────────────────────────────
  "ai-merchandise-design-guide": ["design", "merch"],
  "ip-merch-design": ["design", "merch"],
  "industrial-ai-for-illustrator-ip": ["design"],
  "surtex-licensing-playbook": ["design"],

  // ── Video pipeline blogs ─────────────────────────────────────────
  "asl-video-translator": ["language"],
  "ai-video-dubbing-tutorial": ["language"],
  "how-to-dub-videos-naturally": ["language"],
  "video-transcription-business-guide": ["language"],
  "video-transcription-technical-deep-dive": ["language"],

  // ── Company / Infographic ────────────────────────────────────────
  "ai-company-comparison-infographics-guide": ["infographic"],
  "evolution-timelines-visualization": ["infographic"],
};

// Category-derived defaults for the long tail. Each maps to 1-3
// fully-localized topics that broadly fit the category.
const CATEGORY_TOPICS: Record<string, string[]> = {
  "nano-template": ["design"],
  "creator-tools": ["design"],
  "video-translation-dubbing": ["language"],
  "video-dubbing": ["language"],
  "ai-strategy": ["design"],
  "ds-ai-engineering": ["design"],
  "content-automation": ["design"],
  "learning-education": ["learning"],
};

export function getRelatedHubsForBlog(
  slug: string,
  category?: string | null
): BlogRelatedHubs {
  const perSlug = PER_SLUG_TOPICS[slug];
  if (perSlug && perSlug.length > 0) return { topicIds: perSlug };
  const categoryTopics = category ? CATEGORY_TOPICS[category] : undefined;
  return { topicIds: categoryTopics ?? [] };
}
