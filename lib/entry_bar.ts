export type EntryBarItem = {
  id: string;
  emoji?: string;
  path: string; // ✅ 从 href 改成 path
};

export const ENTRY_BAR_ITEMS: EntryBarItem[] = [
  {
    id: "character",
    emoji: "🎭",
    path: "/topics/character",
  },
  {
    id: "language",
    emoji: "🗣️",
    path: "/topics/language",
  },
  {
    id: "learning",
    emoji: "📚",
    path: "/topics/learning",
  },
  {
    id: "travel",
    emoji: "✈️",
    path: "/topics/travel",
  },
  {
    id: "lifestyle",
    emoji: "🌿",
    path: "/topics/lifestyle",
  },
  {
    id: "product",
    emoji: "🛍️",
    path: "/topics/product",
  },
  {
    id: "visual",
    emoji: "🎨",
    path: "/topics/design",
  },
];