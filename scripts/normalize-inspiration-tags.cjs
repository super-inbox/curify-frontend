/**
 * normalize-inspiration-tags.cjs
 *
 * Consolidates the GPT-assigned tags in nano_inspiration.json:
 *  1. Lowercases and trims everything
 *  2. Applies an alias map (synonyms, plurals, redundant variants → canonical)
 *  3. Drops tags with global frequency < MIN_FREQ that don't map to anything canonical
 *  4. De-duplicates per entry
 *  5. Writes back to nano_inspiration.json
 *
 * Usage:
 *   node scripts/normalize-inspiration-tags.cjs
 */

const fs = require("fs");
const path = require("path");

const INSP_FILE = path.join(__dirname, "../public/data/nano_inspiration.json");
const MIN_FREQ = 3; // drop tags appearing fewer than this many times globally (after aliasing)

// ── Alias map: raw tag → canonical tag (or null to drop) ─────────────────────
// Order matters for multi-word tags — put more specific before broader.
const ALIAS = {
  // illustration family
  "illustrated":          "illustration",
  "illustrative":         "illustration",
  "illustrations":        "illustration",
  "digital art":          "illustration",
  "art":                  "illustration",
  "painting":             "illustration",

  // cartoon / animation family
  "cartoonish":           "cartoon",
  "animated":             "cartoon",
  "anime-style":          "anime",
  "manga":                "anime",
  "kawaii":               "anime",

  // educational / informational family
  "informative":          "educational",
  "informational":        "educational",
  "instructional":        "educational",
  "academic":             "educational",
  "education":            "educational",
  "learning":             "educational",

  // infographic family
  "diagram":              "infographic",
  "labeled":              "infographic",
  "labels":               "infographic",
  "step-by-step":         "infographic",
  "blueprint":            "infographic",
  "timeline":             "infographic",

  // character family
  "characters":           "character",
  "character design":     "character",
  "character-profile":    "character",
  "animal-characters":    "character",

  // MBTI types & synonyms → mbti
  "myers-briggs":         "mbti",
  "intj":                 "mbti",
  "infj":                 "mbti",
  "entj":                 "mbti",
  "istj":                 "mbti",
  "istp":                 "mbti",
  "isfj":                 "mbti",
  "isfp":                 "mbti",
  "enfj":                 "mbti",
  "enfp":                 "mbti",
  "entp":                 "mbti",
  "intp":                 "mbti",
  "estp":                 "mbti",
  "esfp":                 "mbti",
  "estj":                 "mbti",
  "esfj":                 "mbti",
  "advocate":             "mbti",
  "adventurer":           "mbti",
  "visionary":            "mbti",
  "strategist":           "mbti",
  "analyst":              "mbti",
  "psychology":           "personality",

  // humor family
  "humorous":             "humor",
  "funny":                "humor",
  "comedy":               "humor",
  "comedic":              "humor",
  "satirical":            "humor",
  "satire":               "humor",
  "parody":               "humor",

  // fantasy / mythology family
  "mythology":            "fantasy",
  "mythological":         "fantasy",
  "mystical":             "fantasy",
  "legendary":            "fantasy",
  "fictional":            "fantasy",
  "warrior":              "fantasy",
  "ninja":                "fantasy",

  // superhero family
  "superheroes":          "superhero",
  "heroic":               "superhero",

  // vintage / retro family
  "retro":                "vintage",
  "nostalgic":            "vintage",
  "nostalgia":            "vintage",
  "classic":              "vintage",

  // sports family
  "basketball":           "sports",
  "soccer":               "sports",
  "football":             "sports",
  "nba":                  "sports",
  "skiing":               "sports",
  "swimming":             "sports",
  "players":              "sports",

  // fitness family
  "exercise":             "fitness",
  "workout":              "fitness",
  "gym":                  "fitness",
  "training":             "fitness",
  "muscle":               "fitness",
  "warm-up":              "fitness",
  "wellness":             "fitness",

  // food family
  "cuisine":              "food",
  "culinary":             "food",
  "cooking":              "food",
  "dishes":               "food",
  "ingredients":          "food",
  "menu":                 "food",
  "nutrition":            "food",
  "dessert":              "food",
  "desserts":             "food",
  "delicious":            "food",
  "recipe":               "food",
  "vegetables":           "food",
  "fruits":               "food",
  "coffee":               "food",
  "sandwich":             "food",
  "dining":               "food",

  // travel family
  "tourism":              "travel",
  "journey":              "travel",
  "itinerary":            "travel",
  "landmarks":            "travel",
  "map":                  "travel",
  "airport":              "travel",
  "airplane":             "travel",
  "packing":              "travel",
  "directions":           "travel",

  // technology family
  "tech":                 "technology",
  "digital":              "technology",
  "robot":                "technology",
  "futuristic":           "technology",
  "innovation":           "technology",
  "future":               "technology",
  "startup":              "technology",
  "steampunk":            "technology",

  // science family
  "scientific":           "science",
  "physics":              "science",
  "medicine":             "science",
  "medical":              "science",
  "anatomy":              "science",
  "chinese medicine":     "science",
  "medicinal":            "herbal",

  // nature / botanical family
  "wildlife":             "nature",
  "animals":              "nature",
  "animal":               "nature",
  "marine":               "nature",
  "conservation":         "nature",
  "environment":          "nature",
  "natural":              "nature",

  // fashion / costume family
  "clothing":             "fashion",
  "costume":              "fashion",
  "costumes":             "fashion",
  "attire":               "fashion",
  "accessory":            "fashion",
  "jewelry":              "fashion",
  "beauty":               "fashion",
  "elegance":             "elegant",

  // history family
  "historic":             "history",
  "historical":           "history",
  "ancient":              "history",
  "wwii":                 "history",

  // cultural family
  "culture":              "cultural",
  "heritage":             "cultural",
  "asian":                "cultural",

  // language / vocabulary family
  "bilingual":            "language",
  "multilingual":         "language",
  "translation":          "language",
  "vocabulary":           "language",
  "grammar":              "language",
  "expressions":          "language",
  "verbs":                "language",
  "flashcards":           "language",

  // finance / business family
  "financial":            "finance",
  "financial-advice":     "finance",
  "debt":                 "finance",
  "trading card":         "finance",
  "statistics":           "finance",
  "corporate":            "business",
  "leadership":           "business",
  "organization":         "business",
  "professional":         "business",
  "workplace":            "business",
  "office":               "business",

  // kids family
  "children":             "kids",
  "child-friendly":       "kids",

  // architecture / urban family
  "urban":                "architecture",
  "cityscape":            "architecture",
  "isometric":            "architecture",

  // film / pop-culture family
  "film":                 "movie",
  "tv-show":              "movie",
  "television":           "movie",
  "pop-culture":          "movie",

  // music
  "musical":              "music",

  // celebration
  "festival":             "celebration",
  "party":                "celebration",
  "wedding":              "celebration",
  "festive":              "celebration",

  // zodiac / astrology
  "astrology":            "zodiac",

  // sports strategy
  "strategy":             "strategy",
  "strategic":            "strategy",

  // comparison / contrast
  "contrast":             "comparison",

  // portrait — keep as-is but normalize near-synonyms
  "profile":              "portrait",

  // landscape / nature scene
  "landscape":            "nature",

  // misc quality adjectives — drop (not useful for filtering)
  "detailed":             null,
  "versatile":            null,
  "variety":              null,
  "bold":                 null,
  "powerful":             null,
  "iconic":               null,
  "creative":             null,
  "friendly":             null,
  "casual":               null,
  "formal":               null,
  "organized":            null,
  "symbolic":             null,
  "inspirational":        null,
  "motivational":         null,
  "energetic":            null,
  "dynamic":              null,
  "vibrant":              null,
  "colorful":             "colorful",  // keep
  "warm":                 null,
  "moody":                null,
  "dark":                 null,
  "serene":               null,
  "cozy":                 null,
  "playful":              null,
  "fun":                  null,
  "cute":                 "kids",
  "whimsical":            null,
  "adventurous":          null,
  "romantic":             "romantic",  // keep
  "minimalist":           "minimalist", // keep
  "luxury":               null,
  "luxurious":            null,
  "elegant":              "elegant",   // keep
  "political":            null,
  "social":               null,
  "conflict":             null,
  "crisis":               null,
  "summary":              null,
  "guide":                null,
  "tools":                null,
  "routine":              null,
  "communication":        null,
  "problem-solving":      null,
  "analytical":           null,
  "informal":             null,
  "abstract":             null,
};

// ── Normalize a single tag ────────────────────────────────────────────────────
function normalizeTag(raw) {
  const t = raw.toLowerCase().trim();
  if (t in ALIAS) return ALIAS[t]; // may be null (drop)
  return t;
}

// ── Load & process ────────────────────────────────────────────────────────────
const inspirations = JSON.parse(fs.readFileSync(INSP_FILE, "utf8"));

// Pass 1: normalize all tags
const pass1 = inspirations.map((entry) => {
  if (!entry.tags) return entry;
  const normalized = entry.tags
    .map(normalizeTag)
    .filter(Boolean); // remove nulls
  // deduplicate
  return { ...entry, tags: [...new Set(normalized)] };
});

// Pass 2: count global frequencies
const freq = {};
for (const entry of pass1) {
  for (const tag of (entry.tags || [])) {
    freq[tag] = (freq[tag] || 0) + 1;
  }
}

// Pass 3: drop tags below MIN_FREQ
const result = pass1.map((entry) => {
  if (!entry.tags) return entry;
  const filtered = entry.tags.filter((t) => (freq[t] || 0) >= MIN_FREQ);
  return { ...entry, tags: filtered };
});

// ── Stats ─────────────────────────────────────────────────────────────────────
const finalFreq = {};
for (const entry of result) {
  for (const tag of (entry.tags || [])) {
    finalFreq[tag] = (finalFreq[tag] || 0) + 1;
  }
}
const sorted = Object.entries(finalFreq).sort((a, b) => b[1] - a[1]);
console.log("Top 30 canonical tags:");
sorted.slice(0, 30).forEach(([tag, count]) => console.log(`  ${count.toString().padStart(4)}  ${tag}`));
console.log(`\nTotal unique tags before: 1119`);
console.log(`Total unique tags after:  ${sorted.length}`);

// ── Write ─────────────────────────────────────────────────────────────────────
fs.writeFileSync(INSP_FILE, JSON.stringify(result, null, 2));
console.log(`\nWritten to ${INSP_FILE}`);
