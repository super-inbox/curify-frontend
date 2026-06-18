export type EntryBarItem = {
  id: string;
  emoji?: string;
  path: string;
  isHot?: boolean;
};

// 2026-06-19 entry bar refresh: pivots from abstract topic framing to
// action-oriented "what you can make" framing. Order picks supply
// (inspirations per bucket) AND demand (gallery copy signal) — see
// docs/visual-layer-distribution-2026-06-19.md for the per-bucket counts.
// Culture dropped (covered by Travel + Social Media Assets + Food).
// AI Portraits added because ~22 of top-25 gallery copies are
// photorealistic AI portraits/selfies — dominant remix demand.
// Recipes & Food Cards added: 346 inspirations, currently invisible
// from top-level nav.
export const ENTRY_BAR_ITEMS: EntryBarItem[] = [
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
    id: "learning",
    emoji: "🧠",
    path: "/topics/learning",
  },
  {
    id: "language",
    emoji: "🗣️",
    path: "/topics/language",
  },
  {
    id: "lifestyle",
    emoji: "🌿",
    path: "/topics/lifestyle",
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
  {
    id: "visual",
    emoji: "🎨",
    path: "/topics/design",
  },
  {
    id: "product",
    emoji: "🛍️",
    path: "/topics/product",
  },
  {
    id: "merch",
    emoji: "🎁",
    path: "/topics/merch",
  },
];
