// Pre-built static suggestion index — used by SearchBar for client-side fuzzy suggestions.
// Tier 2 entries are shown by default on focus; all entries are searched on keystroke.

import nanoMetadata from "@/lib/generated/nanobanana_prompts_metadata.json";
import taxonomy from "./taxonomy.json";

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
  /**
   * Optional URL override (without locale prefix, leading slash required).
   * When set, the search UI navigates here instead of `/topics/<slug>`.
   * Used for entries that point at non-topic destinations like /tools.
   */
  href?: string;
  /**
   * When true, the entry is *autocomplete-only* — clicking it or pressing
   * Enter routes to `/search?q=<alias|slug>` (the unified results page)
   * instead of any direct destination. Used for nano-banana prompt tags
   * so the user sees templates, examples, and gallery prompts side-by-side.
   */
  searchFallback?: boolean;
};

// Tier 2 — primary navigational topics (shown by default on focus)
export const TIER2_SUGGESTIONS: SuggestionEntry[] = [
  { slug: "anime",          label: "Anime",            emoji: "🎌", tier: 2, aliases: ["manga", "japan animation"] },
  { slug: "portrait",       label: "Portrait",          emoji: "👤", tier: 2, aliases: ["face", "headshot", "person", "portarit", "portarite", "portait", "prtrait", "portriat"] },
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
  // "timeline" intentionally NOT aliased to history — series-infographic /
  // evolution / flowing-journey / clothing-evolution-poster are all
  // timeline-shaped templates outside the history topic, and a "timeline"
  // search should free-text-match all of them rather than redirecting to
  // /topics/history.
  { slug: "history",        label: "History",           emoji: "📜", tier: 2, aliases: ["historical", "past", "ancient", "era"] },
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
  // `map` slot — content-shape topic (8 templates, 75 inspirations). Aliases
  // include multi-language map terms so `/search?q=<term>` redirects to
  // `/topics/map` instead of falling through to the matcher (which has
  // recall-high / precision-weak behavior on the bare token `map`/`maps`).
  { slug: "map",            label: "Maps",              emoji: "🗺️", tier: 2, aliases: [
    "maps", "mapping",
    "地图", "地圖", "地図", "マップ",
    "mapa", "mapas",
    "carte", "cartes", "mappemonde", "plan de ville",
    "landkarte", "weltkarte", "stadtplan",
    "지도", "맵",
    "नक्शा", "मानचित्र",
    "карта", "карты",
    "harita",
  ] },
  { slug: "language-english", label: "English Learning", emoji: "🇬🇧", tier: 2, aliases: ["english", "esl", "learn english"] },
  // `asl` slot — American Sign Language. Added 2026-06-09 with the
  // template-asl-sign-language-tutorial-infographic template push. Closes
  // the bare-`asl` SEARCH_NORESULT bleeder from cycle 4. Multi-locale
  // aliases keep CJK / European callers in scope.
  { slug: "asl", label: "American Sign Language", emoji: "🤟", tier: 2, aliases: [
    "asl", "american sign language", "sign language", "sign", "signing",
    "deaf community", "deaf",
    "美式手语", "手语", "수어", "수화",
    "lengua de señas", "langue des signes", "gebärdensprache",
  ] },
  // Language pairs — promoted from Tier 3 to Tier 2 so they appear as
  // navigational tabs alongside vocabulary / dialogue / etc.
  { slug: "english-chinese",  label: "English ↔ Chinese",  emoji: "🇨🇳", tier: 2, aliases: ["en-zh", "chinese english", "english chinese"] },
  { slug: "english-spanish",  label: "English ↔ Spanish",  emoji: "🇪🇸", tier: 2, aliases: ["en-es", "spanish english", "english spanish"] },
  { slug: "english-korean",   label: "English ↔ Korean",   emoji: "🇰🇷", tier: 2, aliases: ["en-ko", "korean english", "english korean"] },
  { slug: "english-japanese", label: "English ↔ Japanese", emoji: "🇯🇵", tier: 2, aliases: ["en-ja", "japanese english", "english japanese"] },
  { slug: "english-french",   label: "English ↔ French",   emoji: "🇫🇷", tier: 2, aliases: ["en-fr", "french english", "english french"] },
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

// Subject Tier 3 tags — shared by learning and language Tier 1s.
// Keep in sync with SUBJECT_TAGS in topicRegistry.ts.
export const TIER3_SUBJECT: SuggestionEntry[] = [
  // World / science
  { slug: "animals",         label: "Animals",         emoji: "🐾", tier: 3, aliases: ["pet", "wildlife", "creature"] },
  { slug: "nature",          label: "Nature",          emoji: "🌿", tier: 3, aliases: ["outdoor", "natural", "biology", "ecosystem"] },
  { slug: "space",           label: "Space",           emoji: "🚀", tier: 3, aliases: ["astronomy", "cosmos", "universe"] },
  { slug: "weather",         label: "Weather",         emoji: "🌦️", tier: 3, aliases: ["climate", "forecast"] },
  { slug: "evolution",       label: "Dinosaur & Evolution", emoji: "🦕", tier: 3, aliases: ["dinosaur", "dinosaurs", "prehistoric", "fossil", "human evolution", "hominid"] },
  // Everyday / language scenes
  { slug: "food-and-drink",  label: "Food & Drink",    emoji: "🍎", tier: 3, aliases: ["meal", "kitchen", "eating", "drink"] },
  { slug: "family",          label: "Family",          emoji: "👨‍👩‍👧‍👦", tier: 3, aliases: ["parents", "siblings", "relatives"] },
  { slug: "school",          label: "School",          emoji: "🏫", tier: 3, aliases: ["classroom", "student", "education", "library"] },
  { slug: "transportation",  label: "Transportation",  emoji: "🚆", tier: 3, aliases: ["transport", "vehicle", "vehicles", "transit"] },
  // NB: do NOT alias "festival" here — celebration is the kid-vocabulary
  // tier-3 topic (party scenes, birthdays) and has no cultural-festival
  // templates. Letting "festival" fall through to free-text lets the
  // cultural-festival-poster template's i18n blob match instead.
  { slug: "celebration",     label: "Celebration",     emoji: "🎉", tier: 3, aliases: ["party", "holiday"] },
  { slug: "body",            label: "Body",            emoji: "🧍", tier: 3, aliases: ["body parts", "anatomy", "health"] },
  { slug: "emotions",        label: "Emotions",        emoji: "😊", tier: 3, aliases: ["feelings", "mood", "emotional"] },
  // Phonics is a data-layer tier-3 — no /topics/phonics page exists.
  // searchFallback routes the user to /search?q=phonics where the 50
  // template-phonics-consonant-blend-* inspirations free-text-match.
  { slug: "phonics",         label: "Phonics",         emoji: "🔤", tier: 3, aliases: ["consonant blend", "digraph", "vowel pattern", "phonemes", "learn to read"], searchFallback: true },
];

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

// Curated chip set per Tier 1, shown in the focus-state dropdown grouped
// by Tier 1 section header (4-5 most interesting Tier 2/3 picks per row).
// Each entry is a slug resolved against ALL_SUGGESTIONS at render time.
//
// Curation principles:
//   - Lead with entries that have content (no dead chips)
//   - Mix Tier 2 navigational + Tier 3 specific where appropriate
//   - WC row uses the 5 highest-entry-traffic country pages from the
//     2026-06-12 per-topic entry pull (argentina/portugal/england/
//     brazil/france were top 5)
//   - Refresh quarterly against TOPIC_CAPSULE click frequency
//
// Slugs not in TIER1/2/3 explicit arrays will still resolve via
// TIER3_TOPIC_MAPPED (taxonomy.json tier3 derivation). Any slug missing
// from ALL_SUGGESTIONS gets dropped silently by the SearchBar render.
export const TIER1_CHIP_SETS: Array<{ tier1: string; chips: string[] }> = [
  { tier1: "world-cup",   chips: ["argentina-world-cup", "portugal-world-cup", "england-world-cup", "brazil-world-cup", "france-world-cup"] },
  { tier1: "character",   chips: ["mbti", "anime", "sports", "film", "portrait"] },
  { tier1: "personality", chips: ["mbti-enfp", "mbti-intj", "mbti-infp", "mbti-entp", "mbti-isfj"] },
  { tier1: "language",    chips: ["vocabulary", "dialogue", "english-chinese", "english-spanish", "asl"] },
  { tier1: "learning",    chips: ["science", "history", "ai", "phonics", "architecture"] },
  { tier1: "travel",      chips: ["city", "itinerary", "japan", "france", "korea"] },
  { tier1: "culture",     chips: ["food", "costumes", "cultural-festivals", "china", "india"] },
  { tier1: "lifestyle",   chips: ["fashion", "fitness", "beauty", "interior", "finance"] },
  { tier1: "design",      chips: ["posters", "mockups", "watercolor", "photorealistic", "illustration"] },
  { tier1: "product",     chips: ["packaging", "ecommerce", "branding", "hero-banner", "mood-board"] },
];

// Tools — overall /tools page + each tool with status === "create" in
// lib/tools-registry.ts. Use `href` so navigation goes to the tool route
// instead of /topics/<slug>. Keep slugs in sync with tools-registry.
export const TOOL_SUGGESTIONS: SuggestionEntry[] = [
  {
    slug: "tools",
    href: "/tools",
    label: "AI Tools",
    emoji: "🛠️",
    tier: 2,
    aliases: [
      "tool", "ai tools", "studio tools", "utilities",
      // 2026-06-07 Cycle 3 — `ppt` (CN PowerPoint slang, 1 user / 1
      // escape) recurred in Cluster B tool-intent. We don't ship a
      // dedicated /tools/ai-slides yet; route to the catalog so the
      // user sees what's available instead of bouncing on empty search.
      "ppt", "powerpoint", "ppt template", "slides", "presentation",
      "ai slides", "ai presentation",
      "工具", "ai 工具", "幻灯片", "演示文稿", "ppt 模板",
      "herramientas", "présentation",
    ],
  },
  {
    slug: "video-dubbing",
    href: "/tools/video-dubbing",
    label: "Video Dubbing",
    emoji: "🎙️",
    tier: 3,
    aliases: [
      "dub", "dubbing", "voice over", "translate video", "video translation",
      // 2026-06-07 Cycle 3 — `ai dub` (1 user / 2 searches / 2 escapes)
      // and `video dubbing` (2 users / 2 searches / 0% CTR) recurred.
      // `ai dub` was missing entirely from the alias set; `video dubbing`
      // was matching via label-exact but with mixed-case quirks.
      "ai dub", "ai dubbing", "ai voice over", "auto dub",
      "lip sync dubbing", "dubbed video",
      // 2026-07-02 — `translate youtube video` (and near-variants) fell
      // through the /search routing to the low-result topic-chip
      // aggregator because none of the existing aliases carried the
      // "youtube" substring. Add YouTube-carrying multi-word aliases so
      // the exact-match branch (page.tsx L365-371) fires and redirects
      // straight to /tools/video-dubbing. Bare "youtube" left OUT on
      // purpose — collides with subtitle-downloader / summarizer intent.
      "translate youtube video", "translate youtube",
      "youtube video translation", "youtube translation",
      "dub youtube video", "dub youtube", "youtube dubbing",
      "youtube video dubbing",
      "配音", "视频配音", "ai 配音", "自动配音", "中英配音",
      "翻译 youtube 视频", "youtube 视频翻译",
      "youtube 视频配音", "给 youtube 视频配音",
      "doblaje", "doblar video", "doblaje ia",
      "doblar video de youtube", "traducir video de youtube",
    ],
  },
  {
    slug: "bilingual-subtitles",
    href: "/tools/bilingual-subtitles",
    label: "Bilingual Subtitles",
    emoji: "💬",
    tier: 3,
    aliases: [
      "subtitle", "subtitles", "captions", "captioner", "srt",
      "bilingual subtitles", "subtitle captioner",
      "字幕", "双语字幕", "subtítulos", "subtítulos bilingües",
    ],
  },
  {
    slug: "video-transcript-generator",
    href: "/tools/video-transcript-generator",
    label: "Video Transcript",
    emoji: "📝",
    tier: 3,
    aliases: [
      "transcript", "transcribe", "transcription", "video to text",
      "speech to text", "stt",
      "转录", "视频转文字", "transcripción", "transcribir video",
    ],
  },
  {
    slug: "video-summarizer",
    href: "/tools/video-summarizer",
    label: "Video Summarizer",
    emoji: "🎬",
    tier: 3,
    aliases: [
      "summarize", "summarize video", "video summary", "summary", "tldr",
      "视频总结", "视频摘要", "resumen", "resumen de video",
    ],
  },
  {
    slug: "speech-translator",
    href: "/tools/speech-translator",
    label: "Speech Translator",
    emoji: "🗣️",
    tier: 3,
    aliases: [
      "speech translation", "voice translator", "translate audio",
      "audio translator", "real time translation",
      "语音翻译", "实时翻译", "traductor de voz", "traducir voz",
    ],
  },
];

const titleCase = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// ── Topic-mapping destinations ─────────────────────────────────────────────
// Tags listed as Tier-3 children in lib/taxonomy.json that aren't
// already represented in the static tier arrays above. These get
// SuggestionEntries that route to /topics/<slug> (default routing — no href
// override) so search bounces straight to the richer topic page, not to a
// gallery image grid. Derived from the mapping file so adding new mapped
// tags later auto-surfaces them in search.
const _EXISTING_SLUGS = new Set<string>();
for (const s of [
  ...TIER2_SUGGESTIONS,
  ...TIER1_SUGGESTIONS,
  ...TIER3_GEO,
  ...TIER3_STYLE,
  ...TIER3_MBTI,
  ...TIER3_SUBJECT,
  ...TOOL_SUGGESTIONS,
]) _EXISTING_SLUGS.add(s.slug.toLowerCase());

const _MAPPED_DEST_TAGS = new Set<string>();
for (const list of Object.values(taxonomy.tier3 as Record<string, string[]>)) {
  for (const tag of list) _MAPPED_DEST_TAGS.add(tag.toLowerCase());
}

export const TIER3_TOPIC_MAPPED: SuggestionEntry[] = [..._MAPPED_DEST_TAGS]
  .filter((slug) => !_EXISTING_SLUGS.has(slug))
  .map((slug) => {
    const spaced = slug.replace(/-/g, " ");
    return {
      slug,
      label: titleCase(spaced),
      tier: 3 as const,
      // Include both dash- and space-form so nano-tag dedupe and free-text
      // user queries both hit (`high-fashion` query AND `high fashion` query).
      aliases: spaced === slug ? undefined : [spaced],
      // searchFallback by default: these slugs are auto-derived from
      // taxonomy.json tier3 entries — there's no guarantee a /topics/<slug>
      // page exists or is i18n-localized. Routing to /search instead lets
      // the search page surface templates / inspirations / gallery prompts
      // even when the topic page is missing. Without this, clicking
      // unlocalized entries like world-cup-2026 / world-cup-1966 in the
      // SearchBar dropdown bounced users to /topics/world-cup-2026 → 404.
      searchFallback: true,
    };
  });

// ── Nano-banana prompt tags ────────────────────────────────────────────────
// 4k+ gallery prompts at /nano-banana-pro-prompts have their own tag pages
// (/nano-banana-pro-prompts/tag/<encoded>). The metadata snapshot in
// lib/generated/ ships only the tag→count table (~10KB), regenerated daily.
// We surface tags with count ≥ 5 that aren't already represented elsewhere
// in the index, so a query like "kpop" / "golden hour" / "mirror selfie"
// routes straight to the prompt-tag page instead of dead-ending. Tags that
// ARE mapped to a topic (TIER3_TOPIC_MAPPED above) drop out — those go to
// the richer topic page instead.
const NANO_TAG_THRESHOLD = 5;

type NanoTagEntry = { tag: string; count: number };
const NANO_TAGS = (nanoMetadata as { metadata: { tags: NanoTagEntry[] } }).metadata.tags;

const _COVERED_TOKENS = new Set<string>();
for (const s of [
  ...TIER2_SUGGESTIONS,
  ...TIER1_SUGGESTIONS,
  ...TIER3_GEO,
  ...TIER3_STYLE,
  ...TIER3_MBTI,
  ...TIER3_SUBJECT,
  ...TOOL_SUGGESTIONS,
  ...TIER3_TOPIC_MAPPED,
]) {
  _COVERED_TOKENS.add(s.slug.toLowerCase());
  _COVERED_TOKENS.add(s.label.toLowerCase());
  for (const a of s.aliases ?? []) _COVERED_TOKENS.add(a.toLowerCase());
}

export const PROMPT_TAG_SUGGESTIONS: SuggestionEntry[] = NANO_TAGS
  .filter(({ count }) => count >= NANO_TAG_THRESHOLD)
  .filter(({ tag }) => !_COVERED_TOKENS.has(tag.toLowerCase()))
  .map(({ tag }) => ({
    slug: `nano-tag-${tag.toLowerCase().replace(/\s+/g, "-")}`,
    // No href: searchFallback routes the user to /search?q=<tag> so they
    // see the gallery prompts alongside templates and template examples.
    // The /nano-banana-pro-prompts/tag/<tag> page still exists for SEO
    // and is linked from /search results.
    searchFallback: true,
    label: titleCase(tag),
    tier: 3 as const,
    aliases: [tag.toLowerCase()],
  }));

export const ALL_SUGGESTIONS: SuggestionEntry[] = [
  ...TIER2_SUGGESTIONS,
  ...TIER1_SUGGESTIONS,
  ...TIER3_GEO,
  ...TIER3_STYLE,
  ...TIER3_MBTI,
  ...TIER3_SUBJECT,
  ...TOOL_SUGGESTIONS,
  ...TIER3_TOPIC_MAPPED,
  ...PROMPT_TAG_SUGGESTIONS,
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
