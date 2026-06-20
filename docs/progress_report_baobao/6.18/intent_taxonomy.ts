/**
 * High-level creation intent clusters for the Multi-Intent search system.
 *
 * Pure configuration module — does NOT import nano_templates.json,
 * nano_inspiration.json, or any large dataset. Topic slugs were audited
 * against those datasets and must exist in at least one of:
 *   - public/data/nano_templates.json  (template-level topics)
 *   - public/data/nano_inspiration.json (inspiration-level topics)
 *   - lib/taxonomy.json                 (taxonomy vocabulary)
 *
 * Overlap between clusters is intentional: a topic like "photorealistic"
 * is valid evidence for both visual-art and social-personal. Duplicate
 * slugs WITHIN a single cluster are not allowed.
 */

export const INTENT_CLUSTER_SLUGS = [
  "learning-materials",
  "visual-art",
  "merch-commerce",
  "social-personal",
  "storytelling-identity",
  "travel-place",
  "events-hot-now",
  "diy-guides",
] as const;

export type IntentClusterSlug = (typeof INTENT_CLUSTER_SLUGS)[number];

export type IntentCluster = {
  slug: IntentClusterSlug;
  labels: { en: string; zh: string };
  topicSlugs: string[];
};

export const INTENT_CLUSTERS: readonly IntentCluster[] = [
  {
    slug: "learning-materials",
    labels: { en: "Learning Materials", zh: "学习材料" },
    topicSlugs: [
      // Core learning concepts (taxonomy tier1/tier2 under "learning" and "language")
      "learning",
      "vocabulary",
      "kids-vocabulary",
      "language",
      "language-english",
      "dialogue",
      "expressions",
      "asl",
      "phonics",
      // Language-pair slugs (inspiration topics)
      "english-chinese",
      "english-spanish",
      "english-korean",
      "english-japanese",
      "english-french",
      // Proficiency levels (template topics)
      "beginner",
      "intermediate",
      "advanced",
      // Educational output formats (OUTPUT_TYPE_SLUGS overlap)
      "infographic",
      "information-card",
      "flashcards",
      "mind-maps",
      "study-sheets",
      // Analytical / knowledge formats
      "comparison",
      "matching-chart",
      "science",
      "evolution",
      "anatomy",
      "history",
      "reading",
      "insight",
      "fact",
      "school",
      "timeline",
      // step-by-step also maps to diy-guides — overlap is intentional
      "step-by-step-tutorial",
    ],
  },
  {
    slug: "visual-art",
    labels: { en: "Visual & Art", zh: "视觉与艺术" },
    topicSlugs: [
      // Primary creative-output topics
      "design",
      "posters",
      "digital-canvas",
      "art",
      "illustration",
      "watercolor",
      "ink",
      "cartoon",
      "kawaii",
      // Art style / aesthetic tags (inspiration topics)
      "vintage",
      "vintage-retro",
      "retro",
      "pastel",
      "y2k",
      "abstract",
      "monochrome",
      "isometric",
      "composition",
      "photorealistic",
      "artistic",
      // Output-type wall / print topics (OUTPUT_TYPE_SLUGS)
      "wall-art",
      "art-prints",
      "fan-art",
      // Poster subtypes (inspiration topics)
      "event-poster",
      "promotional-poster",
    ],
  },
  {
    slug: "merch-commerce",
    labels: { en: "Merch & Commerce", zh: "商品与商业" },
    topicSlugs: [
      "product",
      "merch",
      "ecommerce",
      "mockups",
      "packaging",
      "showcase",
      "stickers",
      "mascots",
      // character-ip also maps to storytelling-identity — overlap is intentional
      "character-ip",
    ],
  },
  {
    slug: "social-personal",
    labels: { en: "Social & Personal", zh: "社交与个人" },
    topicSlugs: [
      "lifestyle",
      "fashion",
      "high-fashion",
      "portrait",
      // photorealistic also maps to visual-art — overlap is intentional
      "photorealistic",
      "chic",
      // Social output formats (OUTPUT_TYPE_SLUGS)
      "memes",
      "social-media-posts",
      "selfies",
      // Personal wellness / style topics
      "beauty",
      "fitness",
      "wellness",
      "lookbook",
      "outfit",
      "profile",
      "groups",
      // Fashion style descriptors (inspiration topics)
      "athleisure",
      "denim",
      "sneakers",
      "soft-girl",
      "casual",
      "elegant",
      "stylish",
      "mood",
      "natural-beauty",
    ],
  },
  {
    slug: "storytelling-identity",
    labels: { en: "Storytelling & Identity", zh: "故事与身份" },
    topicSlugs: [
      "character",
      "personality",
      "mbti",
      "film",
      "anime",
      "comic",
      // fan-art also maps to visual-art — overlap is intentional
      "fan-art",
      // character-ip also maps to merch-commerce — overlap is intentional
      "character-ip",
      "mascots",
      "quiz",
      "story",
      "scrapbooks",
      "relationship",
      "nostalgia",
      "gaming",
      "quote",
      // Franchise / IP inspiration topics
      "disney",
      "marvel",
      "naruto",
      "ghibli",
      "harry-potter",
      "friends",
      "silicon-valley",
      "yellowstone",
      "genshin",
      "journey-to-the-west",
      "breaking-bad",
      // MBTI subtypes (all 16 types — inspiration topics)
      "mbti-infj",
      "mbti-infp",
      "mbti-intj",
      "mbti-intp",
      "mbti-enfj",
      "mbti-enfp",
      "mbti-entj",
      "mbti-entp",
      "mbti-isfj",
      "mbti-isfp",
      "mbti-istj",
      "mbti-istp",
      "mbti-esfj",
      "mbti-esfp",
      "mbti-estj",
      "mbti-estp",
    ],
  },
  {
    slug: "travel-place",
    labels: { en: "Travel & Place", zh: "旅行与地点" },
    topicSlugs: [
      "travel",
      "city",
      "itinerary",
      "map",
      "seasonal",
      "architecture",
      // food also maps to diy-guides — overlap is intentional
      "food",
      "food-and-drink",
      "culture",
      "cultural-festivals",
      "weather",
      "costumes",
    ],
  },
  {
    slug: "events-hot-now",
    labels: { en: "Events & Hot Now", zh: "活动与热点" },
    topicSlugs: [
      "world-cup",
      "sports",
      "soccer",
      "trending",
      "schedule",
      // Multi-sport / organization topics (inspiration topics)
      "olympics",
      "tournament-bracket",
      "fifa",
      "conmebol",
      "uefa",
      // League / sport-specific topics (inspiration topics)
      "nba",
      "nfl",
      "nhl",
      "hockey",
      "tennis",
      "volleyball",
      "basketball",
      "baseball",
      "badminton",
      "swimming",
      "athletics",
      "winter-sports",
      "women-sports",
      // celebration also maps to travel-place (festivals) — kept here for event intent
      "celebration",
      "festival",
    ],
  },
  {
    slug: "diy-guides",
    labels: { en: "DIY & Guides", zh: "DIY 与指南" },
    topicSlugs: [
      // step-by-step also maps to learning-materials — overlap is intentional
      "step-by-step-tutorial",
      "recipes",
      "guides",
      "before-after",
      // wellness / fitness also map to social-personal — overlap is intentional
      "wellness",
      "fitness",
      "finance",
      // food also maps to travel-place — overlap is intentional
      "food",
      "process",
    ],
  },
];

// O(1) cluster lookup by slug
const CLUSTER_BY_SLUG = new Map<string, IntentCluster>(
  INTENT_CLUSTERS.map((c) => [c.slug, c])
);

export function getIntentCluster(slug: string): IntentCluster | undefined {
  return CLUSTER_BY_SLUG.get(slug);
}

export function isIntentClusterSlug(value: unknown): value is IntentClusterSlug {
  return typeof value === "string" && CLUSTER_BY_SLUG.has(value);
}

/**
 * Localized label for a cluster.
 * Returns the Chinese label when locale === "zh"; English otherwise.
 */
export function getIntentClusterLabel(
  cluster: IntentCluster,
  locale: string
): string {
  if (locale === "zh") return cluster.labels.zh;
  return cluster.labels.en;
}

/**
 * Returns a Set of topic slugs mapped to the given cluster slug.
 * Returns an empty Set for unknown slugs so callers can treat it as a no-op.
 */
export function getIntentClusterTopicSet(slug: string): Set<string> {
  const cluster = CLUSTER_BY_SLUG.get(slug);
  if (!cluster) return new Set();
  return new Set(cluster.topicSlugs);
}
