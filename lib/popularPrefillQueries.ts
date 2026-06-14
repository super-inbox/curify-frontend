// Rotating placeholder queries for SearchBar.tsx — motivated by our
// tier-1 + tier-2 taxonomy categories (see lib/taxonomy.json). Each
// query is 3-5 words long because the search data (30-day pull
// 2026-06-14) showed 3+ word queries hit 100% CTR vs 33-50% for bare
// nouns. The pool seeds the breadth of platform value to first-time
// visitors who would otherwise stare at an empty bar.
//
// Pool composition (~42 queries):
//   - At least one query per tier-2 category we have content for
//   - Mix of evergreen + tournament/seasonal entries
//   - 3 empirically-validated long queries from real search data
//
// Quality gate (2026-06-14): inspect_prefill_pool_quality.cjs verified
// every entry returns ON-TOPIC top hits. 13 entries with off-topic top
// results were dropped or swapped — those are kept in
// scripts/configs/search_eval_set.json marked as quality-issue records
// (see task #86 for the matcher fix that would let them ship).
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

  // === character (mbti / anime / film / portrait / sports, 6) ===
  "anime character group poster",
  "celebrity movie group poster",
  "mbti relationship compatibility chart",
  "dual character comparison infographic",

  // === language (vocab with explicit subjects + asl + comparison, 6) ===
  "kids english animals vocabulary cards",
  "kids english food vocabulary poster",
  "kids english colors vocabulary cards",
  "english spanish word comparison",
  "asl sign language tutorial",
  "ielts vocabulary upgrade poster",

  // === travel (itinerary / city / map / scrapbook, 5) ===
  "paris travel itinerary",
  "architecture empire state building",
  "watercolor travel journal collage",
  "vintage travel scrapbook poster",

  // === culture (food / costumes / festivals / story, 4) ===
  "ethnic costume deconstruction board",
  "east asian culture comparison",
  "world cuisine food poster",
  "cultural festival illustration poster",

  // === nostalgia + retro (new emphasis) ===
  "vintage nostalgia infographic poster",
  "childhood snacks then vs now",
  "generation comparison nostalgia infographic",
  "vintage stamp collection garden birds",
  "vintage stamp collection illustration",

  // === diy + life tips + guides (new emphasis) ===
  "diy home decor ideas",
  "lifestyle guide infographic poster",
  "home organization tips guide",
  "warmup routine running checklist",
  "quick recipe meal prep guide",

  // === lifestyle (fashion / interior / fitness / pet, 5) ===
  "vintage fashion lookbook",
  "interior design home guide",
  "fitness anatomy guide infographic",
  "beauty step by step guide",
  "pet care guide infographic",

  // === learning (science / history / ai / architecture, 4) ===
  "weird science facts infographic",
  "world history timeline poster",
  "ai workflow infographic guide",
  // === design + product (3) ===
  "ai outfit try-on poster",
  "product packaging mockup display",
  // === empirically-validated 100% CTR long queries (real user data) ===
  "evolution snacks infographic",
];
