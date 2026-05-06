// Pre-built static suggestion index — used by SearchBar for client-side fuzzy suggestions.
// Tier 2 entries are shown by default on focus; all entries are searched on keystroke.

export type SuggestionEntry = {
  slug: string;
  label: string;
  emoji?: string;
  tier: 1 | 2 | 3;
  /**
   * Synonyms / common alternative terms users might type. Matched in
   * filterSuggestions alongside slug/label/localized displayName.
   * Keep these short and lowercase.
   */
  aliases?: readonly string[];
};

// Tier 2 — primary navigational topics (shown by default on focus)
export const TIER2_SUGGESTIONS: SuggestionEntry[] = [
  { slug: "anime",          label: "Anime",            emoji: "🎌", tier: 2, aliases: ["manga", "japan animation"] },
  { slug: "portrait",       label: "Portrait",          emoji: "👤", tier: 2, aliases: ["face", "headshot", "person"] },
  { slug: "fashion",        label: "Fashion",           emoji: "👗", tier: 2, aliases: ["clothing", "clothes", "outfit", "style", "apparel", "wear"] },
  { slug: "food",           label: "Food & Cuisine",    emoji: "🍜", tier: 2, aliases: ["recipe", "cooking", "cuisine", "meal", "dish"] },
  { slug: "fitness",        label: "Fitness",           emoji: "💪", tier: 2, aliases: ["workout", "gym", "exercise", "health", "training", "cardio", "yoga"] },
  { slug: "animal",         label: "Animals & Pets",    emoji: "🐾", tier: 2, aliases: ["pet", "pets", "wildlife", "creature", "dog", "cat"] },
  { slug: "science",        label: "Science",           emoji: "🔬", tier: 2, aliases: ["stem", "biology", "chemistry", "physics", "scientific"] },
  { slug: "interior",       label: "Interior Design",   emoji: "🛋️", tier: 2, aliases: ["home decor", "decor", "room", "house"] },
  { slug: "vocabulary",     label: "Vocabulary Cards",  emoji: "📖", tier: 2, aliases: ["words", "vocab", "lexicon", "flashcard"] },
  { slug: "city",           label: "City & Travel",     emoji: "🏙️", tier: 2, aliases: ["town", "urban", "skyline"] },
  { slug: "film",           label: "Film & Cinema",     emoji: "🎬", tier: 2, aliases: ["movie", "movies", "cinema", "tv show"] },
  { slug: "relationship",   label: "Relationships",     emoji: "💞", tier: 2, aliases: ["couple", "dating", "romance", "partnership", "compatibility", "love"] },
  { slug: "ai",             label: "AI & Technology",   emoji: "🤖", tier: 2, aliases: ["artificial intelligence", "ml", "machine learning", "llm", "tech"] },
  { slug: "sports",         label: "Sports",            emoji: "⚽", tier: 2, aliases: ["athletic", "athletics", "game", "soccer", "football"] },
  { slug: "architecture",   label: "Architecture",      emoji: "🏛️", tier: 2, aliases: ["building", "buildings", "structure", "landmark"] },
  { slug: "nostalgia",      label: "Nostalgia",         emoji: "📷", tier: 2, aliases: ["vintage", "retro", "classic", "old school"] },
  { slug: "history",        label: "History",           emoji: "📜", tier: 2, aliases: ["historical", "past", "ancient", "era", "timeline"] },
  { slug: "mbti",           label: "MBTI Personality",  emoji: "🧠", tier: 2, aliases: ["personality test", "personality type", "myers briggs"] },
  { slug: "dialogue",       label: "Dialogue Practice", emoji: "💬", tier: 2, aliases: ["conversation", "dialog", "chat"] },
  { slug: "beauty",         label: "Beauty & Skincare", emoji: "✨", tier: 2, aliases: ["skincare", "makeup", "cosmetic", "cosmetics"] },
  { slug: "posters",        label: "Posters",           emoji: "🖼️", tier: 2, aliases: ["poster", "print", "wall art"] },
  { slug: "culture",        label: "Culture",           emoji: "🗺️", tier: 2, aliases: ["cultural", "heritage", "tradition", "traditional"] },
  { slug: "reading",        label: "Reading & Books",   emoji: "📚", tier: 2, aliases: ["books", "book", "literature", "reader"] },
  { slug: "comparison",     label: "Before & After",    emoji: "↔️", tier: 2, aliases: ["before after", "vs", "versus", "compare", "contrast"] },
  { slug: "finance",        label: "Finance",           emoji: "💰", tier: 2, aliases: ["money", "budget", "investing", "wealth", "financial"] },
  { slug: "itinerary",      label: "Travel Itinerary",  emoji: "🗓️", tier: 2, aliases: ["trip plan", "travel plan", "day plan", "schedule"] },
  { slug: "groups",         label: "Group Scenes",      emoji: "👥", tier: 2, aliases: ["group", "ensemble", "squad", "team"] },
  { slug: "expressions",    label: "Expressions",       emoji: "🗣️", tier: 2, aliases: ["idiom", "idioms", "phrase", "phrases", "saying"] },
  { slug: "trending",       label: "Trending",          emoji: "🔥", tier: 2, aliases: ["trend", "popular", "viral", "hot"] },
  { slug: "digital-canvas", label: "Digital Canvas",    emoji: "🎨", tier: 2, aliases: ["digital art", "canvas", "digital painting"] },
  { slug: "mockups",        label: "Mockups",           emoji: "📱", tier: 2, aliases: ["mockup", "mock-up", "prototype", "preview"] },
  { slug: "guides",         label: "Guides",            emoji: "📋", tier: 2, aliases: ["how to", "how-to", "tutorial", "walkthrough", "guide"] },
  { slug: "language-english", label: "English Learning", emoji: "🇬🇧", tier: 2, aliases: ["english", "esl", "learn english"] },
];

// Tier 1 — entry bar categories
const TIER1_SUGGESTIONS: SuggestionEntry[] = [
  { slug: "character",   label: "Character",  emoji: "🎭", tier: 1, aliases: ["archetype", "persona"] },
  { slug: "language",    label: "Language",   emoji: "🗣️", tier: 1, aliases: ["linguistic"] },
  { slug: "travel",      label: "Travel",     emoji: "✈️", tier: 1, aliases: ["vacation", "trip", "journey", "tourism"] },
  { slug: "lifestyle",   label: "Lifestyle",  emoji: "🌿", tier: 1, aliases: ["daily life", "self care", "wellness"] },
  { slug: "learning",    label: "Learning",   emoji: "📚", tier: 1, aliases: ["education", "study", "edu"] },
  { slug: "product",     label: "Product",    emoji: "🛍️", tier: 1, aliases: ["shopping", "ecommerce"] },
  { slug: "design",      label: "Design",     emoji: "🎨", tier: 1, aliases: ["art", "graphic design"] },
  { slug: "personality", label: "Personality",emoji: "🧬", tier: 1, aliases: ["mbti", "personality test", "personality type"] },
];

// Tier 3 — geo tags
export const TIER3_GEO: SuggestionEntry[] = [
  "japan","korea","china","india","france","spain","italy","germany",
  "mexico","brazil","thailand","vietnam","singapore","egypt","australia",
  "greece","russia","portugal","uk","middle-east","united-states","iran",
].map(slug => ({ slug, label: slug.split("-").map(w => w[0].toUpperCase()+w.slice(1)).join(" "), tier: 3 as const }));

// Tier 3 — style tags
export const TIER3_STYLE: SuggestionEntry[] = [
  { slug: "cartoon",       label: "Cartoon",       emoji: "🎨", tier: 3, aliases: ["animation", "comic", "anime style"] },
  { slug: "photorealistic",label: "Photorealistic",emoji: "📷", tier: 3, aliases: ["realistic", "photo", "photograph"] },
  { slug: "watercolor",    label: "Watercolor",    emoji: "🎨", tier: 3, aliases: ["paint", "painting", "water color"] },
  { slug: "monochrome",    label: "Monochrome",    emoji: "⬛", tier: 3, aliases: ["black and white", "b/w", "grayscale"] },
  { slug: "ink",           label: "Ink",           emoji: "🖋️", tier: 3, aliases: ["ink wash", "sumi", "sumi-e"] },
  { slug: "kawaii",        label: "Kawaii",        emoji: "🌸", tier: 3, aliases: ["cute", "chibi"] },
  { slug: "isometric",     label: "Isometric",     emoji: "📐", tier: 3, aliases: ["iso", "3d view"] },
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

// ── Fuzzy matching ──────────────────────────────────────────────────────────

/**
 * Damerau-Levenshtein-ish edit distance. Counts substitution, insertion,
 * and deletion as 1 each. Used for typo tolerance — caller should bound
 * input length before calling.
 */
function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  let curr = new Array(n + 1);
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

/**
 * True when `query` matches `target` either as a substring or with at most
 * `maxEdits` edits against any whitespace/dash-separated token of target
 * (or against the whole target when short). Skipped for very short queries
 * to avoid trivial false positives.
 */
function fuzzyMatch(target: string, query: string, maxEdits = 1): boolean {
  if (target.includes(query)) return true;
  if (query.length < 4) return false;
  // Token-level approximate matching
  const tokens = target.split(/[\s\-_/]+/).filter(Boolean);
  for (const tok of tokens) {
    if (Math.abs(tok.length - query.length) <= maxEdits && editDistance(tok, query) <= maxEdits) {
      return true;
    }
  }
  // Whole-string distance (e.g., "fittness" against "fitness")
  if (Math.abs(target.length - query.length) <= maxEdits) {
    if (editDistance(target, query) <= maxEdits) return true;
  }
  return false;
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Substring + alias + fuzzy match — returns suggestions ranked by match
 * quality (exact > substring > alias > fuzzy), then tier, then position.
 *
 * Pass `localize(slug)` to also match the user's locale displayName
 * (e.g. zh "动漫" resolves to slug "anime").
 */
export function filterSuggestions(
  query: string,
  limit = 8,
  localize?: (slug: string) => string | undefined
): SuggestionEntry[] {
  if (!query.trim()) return TIER2_SUGGESTIONS.slice(0, 12);
  const q = query.toLowerCase().trim();

  type Scored = { entry: SuggestionEntry; score: number; pos: number };
  const results: Scored[] = [];

  for (const s of ALL_SUGGESTIONS) {
    const labelLower = s.label.toLowerCase();
    const slugLower = s.slug.toLowerCase();
    const localized = localize?.(s.slug)?.toLowerCase();
    const aliases = (s.aliases ?? []).map((a) => a.toLowerCase());

    let score = 0;
    let pos = Infinity;

    // Exact match (highest)
    if (slugLower === q || labelLower === q || aliases.includes(q)) {
      score = 100; pos = 0;
    }
    // Localized exact
    if (localized === q) {
      score = Math.max(score, 95); pos = 0;
    }
    // Substring on label / slug / localized
    if (score < 100) {
      if (labelLower.includes(q)) {
        score = Math.max(score, 80);
        pos = Math.min(pos, labelLower.indexOf(q));
      }
      if (localized && localized.includes(q)) {
        score = Math.max(score, 75);
        pos = Math.min(pos, localized.indexOf(q));
      }
      if (slugLower.includes(q)) {
        score = Math.max(score, 70);
        pos = Math.min(pos, slugLower.indexOf(q));
      }
      // Alias substring (e.g. "workout" → fitness)
      for (const a of aliases) {
        if (a.includes(q)) {
          score = Math.max(score, 60);
          pos = Math.min(pos, a.indexOf(q));
          break;
        }
      }
    }

    // Fuzzy match (typo tolerance) — only if no other match found
    if (score === 0 && q.length >= 4) {
      const fuzzyHit =
        fuzzyMatch(labelLower, q) ||
        fuzzyMatch(slugLower, q) ||
        (localized ? fuzzyMatch(localized, q) : false) ||
        aliases.some((a) => fuzzyMatch(a, q));
      if (fuzzyHit) {
        score = 30;
        pos = 0;
      }
    }

    if (score > 0) {
      results.push({ entry: s, score, pos });
    }
  }

  return results
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      if (a.entry.tier !== b.entry.tier) return a.entry.tier - b.entry.tier;
      if (a.pos !== b.pos) return a.pos - b.pos;
      return a.entry.label.localeCompare(b.entry.label);
    })
    .slice(0, limit)
    .map((r) => r.entry);
}
