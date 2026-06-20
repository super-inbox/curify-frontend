// Rotating placeholder queries for SearchBar.tsx — motivated by our
// tier-1 + tier-2 taxonomy categories (see lib/taxonomy.json). Each
// query is 3-5 words long because the search data (30-day pull
// 2026-06-14) showed 3+ word queries hit 100% CTR vs 33-50% for bare
// nouns. The pool seeds the breadth of platform value to first-time
// visitors who would otherwise stare at an empty bar.
//
// Pool composition (~32 queries):
//   - At least one query per tier-2 category we have content for
//   - Mix of evergreen + tournament/seasonal entries
//   - 3 empirically-validated long queries from real search data
//
// Quality gate (2026-06-14 + 2026-06-21): inspect_prefill_pool_quality.cjs
// runs per-query checks. 13 entries with off-topic top results were
// dropped on 2026-06-14 (kept in scripts/configs/search_eval_set.json
// as quality-issue records — see task #86 for the matcher fix). On
// 2026-06-21, dropped 10 more NARROW queries (single-template + ≤7
// hits) that promised more variety than the catalog actually delivers.
// Single-template queries WITH strong volume (e.g. celebrity movie
// group poster at 85 hits) are kept — that template has enough
// examples to scroll through.
//
// Maintenance: when adding a new tier-2 or a content-pack you want
// surfaced, append one entry here AND run scripts/inspect_prefill_pool_quality.cjs
// to confirm the top hits are topically aligned. Order doesn't matter —
// SearchBar shuffles the pool on mount (Fisher-Yates) before rotating.

export const POPULAR_PREFILL_QUERIES: ReadonlyArray<string> = [
  // === world-cup (3 — light during off-game days, scale up around match days) ===
  "brazil world cup squad poster",
  "england 1966 world cup squad",
  "world cup 2026 schedule",

  // === character (mbti / anime / film / portrait / sports, 3) ===
  // Dropped 2026-06-21: "dual character comparison infographic" (4/1 narrow).
  "anime character group poster",
  "celebrity movie group poster",
  "mbti relationship compatibility chart",

  // === language (vocab with explicit subjects + comparison, 5) ===
  // Dropped 2026-06-21: "asl sign language tutorial" (4/1 narrow).
  "kids english animals vocabulary cards",
  "kids english food vocabulary poster",
  "kids english colors vocabulary cards",
  "english spanish word comparison",
  "ielts vocabulary upgrade poster",

  // === travel (itinerary / map / journal, 2) ===
  // Dropped 2026-06-21: "architecture empire state building" (4/1),
  //                     "vintage travel scrapbook poster" (5/1).
  "paris travel itinerary",
  "watercolor travel journal collage",

  // === culture (food / festivals, 3) ===
  // Dropped 2026-06-21: "ethnic costume deconstruction board" (6/1 narrow).
  "east asian culture comparison",
  "world cuisine food poster",
  "cultural festival illustration poster",

  // === nostalgia + retro (3) ===
  // Dropped 2026-06-21: "childhood snacks then vs now" (7/1),
  //                     "vintage stamp collection garden birds" (5/1,
  //                     redundant with the illustration variant).
  "vintage nostalgia infographic poster",
  "generation comparison nostalgia infographic",
  "vintage stamp collection illustration",

  // === diy + life tips + guides (3) ===
  // Dropped 2026-06-21: "home organization tips guide" (5/1),
  //                     "warmup routine running checklist" (5/1).
  "diy home decor ideas",
  "lifestyle guide infographic poster",
  "quick recipe meal prep guide",

  // === lifestyle (interior / fitness / beauty / pet, 4) ===
  // Dropped 2026-06-21: "vintage fashion lookbook" (5/1 narrow).
  "interior design home guide",
  "fitness anatomy guide infographic",
  "beauty step by step guide",
  "pet care guide infographic",

  // === learning (science / history / ai, 3) ===
  "weird science facts infographic",
  "world history timeline poster",
  "ai workflow infographic guide",

  // === design + product (2) ===
  "ai outfit try-on poster",
  "product packaging mockup display",

  // === empirically-validated 100% CTR long queries (real user data) ===
  "evolution snacks infographic",
];
