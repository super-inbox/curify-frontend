export type EntryBarItem = {
  id: string;
  emoji?: string;
  path: string; // ✅ 从 href 改成 path
};

export const ENTRY_BAR_ITEMS: EntryBarItem[] = [
  {
    id: "character",
    emoji: "🎭",
    path: "/topics/psychology",
  },
  {
    id: "learning",
    emoji: "📚",
    path: "topics/learning",
  },
  {
    id: "visual",
    emoji: "🎨",
    path: "/nano-banana-pro-prompts",
  },
  {
    id: "product",
    emoji: "🛍️",
    path: "/topics/commerce",
  },
  {
    id: "video",
    emoji: "🎬",
    path: "/tools",
  },
];