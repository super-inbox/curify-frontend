// Pre-built static suggestion index — used by SearchBar for client-side fuzzy suggestions.
// Tier 2 entries are shown by default on focus; all entries are searched on keystroke.

export type SuggestionEntry = {
  slug: string;
  label: string;
  emoji?: string;
  tier: 1 | 2 | 3;
};

// Tier 2 — primary navigational topics (shown by default on focus)
export const TIER2_SUGGESTIONS: SuggestionEntry[] = [
  { slug: "anime",          label: "Anime",            emoji: "🎌", tier: 2 },
  { slug: "portrait",       label: "Portrait",          emoji: "👤", tier: 2 },
  { slug: "fashion",        label: "Fashion",           emoji: "👗", tier: 2 },
  { slug: "food",           label: "Food & Cuisine",    emoji: "🍜", tier: 2 },
  { slug: "fitness",        label: "Fitness",           emoji: "💪", tier: 2 },
  { slug: "animal",         label: "Animals & Pets",    emoji: "🐾", tier: 2 },
  { slug: "science",        label: "Science",           emoji: "🔬", tier: 2 },
  { slug: "interior",       label: "Interior Design",   emoji: "🛋️", tier: 2 },
  { slug: "vocabulary",     label: "Vocabulary Cards",  emoji: "📖", tier: 2 },
  { slug: "city",           label: "City & Travel",     emoji: "🏙️", tier: 2 },
  { slug: "film",           label: "Film & Cinema",     emoji: "🎬", tier: 2 },
  { slug: "ai",             label: "AI & Technology",   emoji: "🤖", tier: 2 },
  { slug: "sports",         label: "Sports",            emoji: "⚽", tier: 2 },
  { slug: "architecture",   label: "Architecture",      emoji: "🏛️", tier: 2 },
  { slug: "nostalgia",      label: "Nostalgia",         emoji: "📷", tier: 2 },
  { slug: "history",        label: "History",           emoji: "📜", tier: 2 },
  { slug: "mbti",           label: "MBTI Personality",  emoji: "🧠", tier: 2 },
  { slug: "dialogue",       label: "Dialogue Practice", emoji: "💬", tier: 2 },
  { slug: "beauty",         label: "Beauty & Skincare", emoji: "✨", tier: 2 },
  { slug: "posters",        label: "Posters",           emoji: "🖼️", tier: 2 },
  { slug: "culture",        label: "Culture",           emoji: "🗺️", tier: 2 },
  { slug: "reading",        label: "Reading & Books",   emoji: "📚", tier: 2 },
  { slug: "comparison",     label: "Before & After",    emoji: "↔️", tier: 2 },
  { slug: "finance",        label: "Finance",           emoji: "💰", tier: 2 },
  { slug: "itinerary",      label: "Travel Itinerary",  emoji: "🗓️", tier: 2 },
  { slug: "groups",         label: "Group Scenes",      emoji: "👥", tier: 2 },
  { slug: "expressions",    label: "Expressions",       emoji: "🗣️", tier: 2 },
  { slug: "trending",       label: "Trending",          emoji: "🔥", tier: 2 },
  { slug: "digital-canvas", label: "Digital Canvas",    emoji: "🎨", tier: 2 },
  { slug: "mockups",        label: "Mockups",           emoji: "📱", tier: 2 },
  { slug: "guides",         label: "Guides",            emoji: "📋", tier: 2 },
  { slug: "language-english", label: "English Learning", emoji: "🇬🇧", tier: 2 },
];

// Tier 1 — entry bar categories
const TIER1_SUGGESTIONS: SuggestionEntry[] = [
  { slug: "character",   label: "Character",  emoji: "🎭", tier: 1 },
  { slug: "language",    label: "Language",   emoji: "🗣️", tier: 1 },
  { slug: "travel",      label: "Travel",     emoji: "✈️", tier: 1 },
  { slug: "lifestyle",   label: "Lifestyle",  emoji: "🌿", tier: 1 },
  { slug: "learning",    label: "Learning",   emoji: "📚", tier: 1 },
  { slug: "product",     label: "Product",    emoji: "🛍️", tier: 1 },
  { slug: "design",      label: "Design",     emoji: "🎨", tier: 1 },
  { slug: "personality", label: "Personality",emoji: "🧬", tier: 1 },
];

// Tier 3 — geo tags
export const TIER3_GEO: SuggestionEntry[] = [
  "japan","korea","china","india","france","spain","italy","germany",
  "mexico","brazil","thailand","vietnam","singapore","egypt","australia",
  "greece","russia","portugal","uk","middle-east","united-states","iran",
].map(slug => ({ slug, label: slug.split("-").map(w => w[0].toUpperCase()+w.slice(1)).join(" "), tier: 3 as const }));

// Tier 3 — style tags
export const TIER3_STYLE: SuggestionEntry[] = [
  { slug: "cartoon",       label: "Cartoon",       emoji: "🎨", tier: 3 },
  { slug: "photorealistic",label: "Photorealistic",emoji: "📷", tier: 3 },
  { slug: "watercolor",    label: "Watercolor",    emoji: "🎨", tier: 3 },
  { slug: "monochrome",    label: "Monochrome",    emoji: "⬛", tier: 3 },
  { slug: "ink",           label: "Ink",           emoji: "🖋️", tier: 3 },
  { slug: "kawaii",        label: "Kawaii",        emoji: "🌸", tier: 3 },
  { slug: "isometric",     label: "Isometric",     emoji: "📐", tier: 3 },
];

// MBTI tier 3
const TIER3_MBTI: SuggestionEntry[] = [
  "INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP",
  "ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP",
].map(type => ({ slug: `mbti-${type.toLowerCase()}`, label: type, emoji: "🧠", tier: 3 as const }));

// Default suggestions shown on search focus — top Tier 2 + selected geo + style picks
export const DEFAULT_FOCUS_SUGGESTIONS: SuggestionEntry[] = [
  ...TIER2_SUGGESTIONS.slice(0, 10),
  { slug: "japan",          label: "Japan",          emoji: "🇯🇵", tier: 3 },
  { slug: "korea",          label: "Korea",          emoji: "🇰🇷", tier: 3 },
  { slug: "china",          label: "China",          emoji: "🇨🇳", tier: 3 },
  { slug: "photorealistic", label: "Photorealistic", emoji: "📷",   tier: 3 },
  { slug: "watercolor",     label: "Watercolor",     emoji: "🎨",   tier: 3 },
  { slug: "cartoon",        label: "Cartoon",        emoji: "🖌️",   tier: 3 },
];

export const ALL_SUGGESTIONS: SuggestionEntry[] = [
  ...TIER2_SUGGESTIONS,
  ...TIER1_SUGGESTIONS,
  ...TIER3_GEO,
  ...TIER3_STYLE,
  ...TIER3_MBTI,
];

/**
 * Simple substring match — returns suggestions ranked by tier then match position.
 * Pass `localize(slug)` to also match the user's locale displayName (e.g. zh "动漫"
 * resolves to slug "anime"). Falls back to English label/slug when undefined.
 */
export function filterSuggestions(
  query: string,
  limit = 8,
  localize?: (slug: string) => string | undefined
): SuggestionEntry[] {
  if (!query.trim()) return TIER2_SUGGESTIONS.slice(0, 12);
  const q = query.toLowerCase().trim();
  return ALL_SUGGESTIONS
    .filter((s) => {
      if (s.label.toLowerCase().includes(q)) return true;
      if (s.slug.includes(q)) return true;
      const localized = localize?.(s.slug)?.toLowerCase();
      return !!localized && localized.includes(q);
    })
    .sort((a, b) => {
      // exact slug match first
      if (a.slug === q) return -1;
      if (b.slug === q) return 1;
      // then by tier (lower tier = more prominent)
      if (a.tier !== b.tier) return a.tier - b.tier;
      // then by position of match (English label only — keeps ranking stable)
      return a.label.toLowerCase().indexOf(q) - b.label.toLowerCase().indexOf(q);
    })
    .slice(0, limit);
}
