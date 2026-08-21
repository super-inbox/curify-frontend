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
  // AI Selfie leads the rail (replaced the retired World Cup slot). Uses id
  // "portrait" — a real topic that already has a generated icon/thumbnail — so
  // the TopicStrip manifest filter (requireThumbnail) never drops it (the old
  // "ai-portrait" id had no manifest entry and was silently filtered out).
  // Opens the "restyle your own photo" 3-column workbench on /topics/portrait.
  {
    id: "portrait",
    emoji: "🤳",
    path: "/topics/portrait",
    isHot: true,
  },
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
    id: "character",
    emoji: "🎭",
    path: "/topics/character",
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
