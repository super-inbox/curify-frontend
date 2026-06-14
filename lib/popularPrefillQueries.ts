// Rotating placeholder queries for SearchBar.tsx — motivated by our
// tier-1 + tier-2 taxonomy categories (see lib/taxonomy.json). Each
// query is 3-5 words long because the search data (30-day pull
// 2026-06-14) showed 3+ word queries hit 100% CTR vs 33-50% for bare
// nouns. The pool seeds the breadth of platform value to first-time
// visitors who would otherwise stare at an empty bar.
//
// Pool composition (~45 queries):
//   - At least one query per tier-2 category we have content for
//   - Mix of evergreen + tournament/seasonal entries
//   - 4 empirically-validated long queries from real search data
//
// Maintenance: when adding a new tier-2 or a content-pack you want
// surfaced, append one entry here. Order doesn't matter — SearchBar
// shuffles the pool on mount (Fisher-Yates) before rotating.

export const POPULAR_PREFILL_QUERIES: ReadonlyArray<string> = [
  // === world-cup (3 — light during off-game days, scale up around match days) ===
  "brazil 2026 world cup squad",
  "england 1966 world cup squad",
  "world cup 2026 schedule",

  // === character (mbti / anime / film / portrait / sports, 6) ===
  "mbti enfp career poster",
  "mbti infj workplace traits",
  "anime character group poster",
  "celebrity movie group poster",
  "mbti relationship compatibility chart",
  "dual character comparison infographic",

  // === language (vocab with explicit subjects + asl + comparison, 6) ===
  "kids english animals vocabulary cards",
  "kids english food vocabulary poster",
  "kids english body parts flashcards",
  "english spanish word comparison",
  "asl sign language tutorial",
  "ielts vocabulary upgrade poster",

  // === travel (itinerary / city / map / scrapbook, 5) ===
  "japan travel itinerary infographic",
  "italy city map poster",
  "3d landmark map illustration",
  "watercolor travel journal collage",
  "vintage travel scrapbook poster",

  // === culture (food / costumes / festivals / story, 4) ===
  "ethnic costume deconstruction board",
  "east asian culture comparison",
  "world cuisine food poster",
  "cultural festival illustration poster",

  // === nostalgia + retro (new emphasis) ===
  "old times nostalgia poster",
  "vintage childhood memories illustration",
  "generation comparison nostalgia infographic",
  "retro 90s aesthetic poster",
  "vintage stamp collection illustration",

  // === diy + life tips + guides (new emphasis) ===
  "diy home decor ideas",
  "life hack daily tips infographic",
  "diy craft tutorial poster",
  "home organization tips guide",
  "morning routine checklist poster",
  "quick recipe meal prep guide",

  // === lifestyle (fashion / interior / fitness / pet, 5) ===
  "vintage fashion lookbook",
  "interior design bedroom guide",
  "fitness anatomy guide infographic",
  "skincare routine step guide",
  "pet care guide infographic",

  // === learning (science / history / ai / architecture, 4) ===
  "weird science facts infographic",
  "world history timeline poster",
  "ai workflow infographic guide",
  "architecture style guide poster",

  // === design + product (3) ===
  "ai outfit try-on poster",
  "product packaging mockup display",
  "brand logo design board",

  // === empirically-validated 100% CTR long queries (real user data) ===
  "amusement park map infographic",
  "evolution snacks infographic",
  "dubai map travel guide",
];
