export type EntryBarItem = {
  id: string;
  emoji?: string;
  path: string;
  isHot?: boolean;
};

// 2026-08-05 entry-bar reorder: lead with the highest-priority commerce/design
// topics (merch, product, education, brand design, packaging, social media),
// then a shorter tail of consumer/seasonal topics. Order = business priority
// (per operator), not raw supply. "Education" routes to /topics/learning (the
// infographic/study-material topic), replacing the old EdTech-flashcards
// (/topics/language) slot. branding/packaging/social-media-posts are new
// top-level entries — each has a thumbnail in topic_thumbnails.json so it
// survives the TopicStrip manifest filter.
export const ENTRY_BAR_ITEMS: EntryBarItem[] = [
  // — most important (commerce & design) —
  {
    id: "merch",
    emoji: "🎁",
    path: "/topics/merch",
  },
  {
    id: "product",
    emoji: "🛍️",
    path: "/topics/product",
  },
  {
    id: "learning",
    emoji: "🧠",
    path: "/topics/learning",
  },
  {
    id: "branding",
    emoji: "✨",
    path: "/topics/branding",
  },
  {
    id: "packaging",
    emoji: "📦",
    path: "/topics/packaging",
  },
  {
    id: "social-media-posts",
    emoji: "📱",
    path: "/topics/social-media-posts",
  },
  // — tail (consumer / seasonal) —
  {
    id: "world-cup",
    emoji: "⚽",
    path: "/topics/world-cup",
    isHot: true,
  },
  {
    id: "character",
    emoji: "🎭",
    path: "/topics/character",
  },
  {
    id: "ai-portrait",
    emoji: "📸",
    path: "/topics/portrait",
  },
  {
    id: "travel",
    emoji: "✈️",
    path: "/topics/travel",
  },
  {
    id: "food",
    emoji: "🍳",
    path: "/topics/food",
  },
];
