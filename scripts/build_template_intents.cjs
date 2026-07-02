#!/usr/bin/env node
/**
 * Build a compiled Output-Intent lookup: template_id -> intent.
 *
 * Output Intent is the JTBD/"final artifact" axis that drives the primary Key
 * Action CTA (cards + search) and the column-3 workflow ordering. It is a PROXY
 * derived from the existing taxonomy — NOT a new classifier:
 *   1. manual OVERRIDES (flagship / known-misclassified templates) — definitive
 *   2. content_shape  (taxonomy.template_shapes) — primary signal (204/301)
 *   3. tier-1 topic   (nano_templates topics)    — fallback
 *   4. keyword scan   (id + topics)              — last-resort
 *   5. "remix"        — default
 *
 * Writes lib/template_intents.json (small: id->intent string) so clients read
 * it without importing the multi-hundred-KB taxonomy.json into the bundle.
 *
 * Re-run after editing nano_templates.json / taxonomy content_shapes:
 *   node scripts/build_template_intents.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const TAXO = JSON.parse(fs.readFileSync(path.join(ROOT, "lib/taxonomy.json"), "utf8"));
const TEMPLATES = JSON.parse(fs.readFileSync(path.join(ROOT, "public/data/nano_templates.json"), "utf8"));
const OUT = path.join(ROOT, "lib/template_intents.json");

const INTENTS = ["social", "education", "merch", "print-art", "presentation", "remix"];
// Tie-break order when multiple signals fire (most commercial / specific first).
const PRIORITY = ["merch", "education", "print-art", "presentation", "social", "remix"];

// content_shape (taxonomy.content_shapes keys) -> intent
const SHAPE_INTENT = {
  "vs-1v1-battle": "social",
  "then-vs-now": "social",
  "grid-collection": "social",
  "team-group-poster": "social",
  "timeline-evolution": "presentation",
  "nostalgia-retro": "social",
  "map-spatial": "print-art",
  "recipe-card": "education",
  "how-to-guide": "education",
  "educational-explainer": "education",
  "mbti-portrait": "social",
  "vocabulary-flashcard": "education",
  "character-profile": "remix",
  "collage-scrapbook": "social",
  "lookbook-outfit": "social",
  "packaging-design": "merch",
  "celebration-festival": "social",
  "quote-typography-poster": "print-art",
  "hero-thematic-poster": "print-art",
  // NOTE: purely-aesthetic shapes (watercolor-illustration, nostalgia-retro) are
  // deliberately NOT mapped — they describe a look, not a job-to-be-done, so we
  // let the tier-1 topic / keyword signal decide the intent instead.
};

// tier-1 topic -> intent (fallback for templates with no content_shape)
const TIER1_INTENT = {
  character: "remix",
  personality: "social",
  language: "education",
  learning: "education",
  travel: "print-art",
  culture: "social",
  lifestyle: "social",
  design: "print-art",
  product: "merch",
  "world-cup": "social",
};

// keyword scan (ordered) over id + topics — last resort before default
const KEYWORD_RULES = [
  ["merch", /sticker|merch|packaging|t-?shirt|tshirt|mug|tote|keychain|badge|acrylic|enamel|product-design|die-?cut/],
  ["education", /flashcard|coloring|colouring|phonics|vocabulary|vocab|worksheet|dialogue|alphabet|number|spelling|classroom|teacher|study|quiz/],
  ["print-art", /poster|wall-?art|art-?print|\bmap\b|itinerary|framed|canvas|mural|wallpaper/],
  ["presentation", /infographic|chart|diagram|timeline|comparison|slide|deck|report/],
  ["social", /meme|event|calendar|recap|standings|xiaohongshu|rednote|reel|story|announcement|greeting/],
];

// flagship / known-ambiguous overrides (definitive)
const OVERRIDES = {
  "template-product-poster": "social",       // product marketing poster -> post it
  "template-mbti-nba": "social",             // shareable collectible card
  "template-personal-fashion-outfit-style-variations": "social",
  "template-fashion-ecommerce": "merch",     // e-commerce detail image -> product asset
  "template-ai-outfit-try-on-poster": "social",
  "template-wc-fan-outfit-poster": "social",
};

const tier1Keys = new Set(Object.keys(TAXO.tier1 || {}));
const templateShapes = TAXO.template_shapes || {};

function highestPriority(list) {
  for (const p of PRIORITY) if (list.includes(p)) return p;
  return null;
}

function fromShapes(id) {
  const shapes = templateShapes[id] || [];
  const mapped = shapes.map((s) => SHAPE_INTENT[s]).filter(Boolean);
  return highestPriority(mapped);
}
function fromTier1(topics) {
  const mapped = (topics || []).filter((t) => tier1Keys.has(t)).map((t) => TIER1_INTENT[t]).filter(Boolean);
  return highestPriority(mapped);
}
function fromKeywords(id, topics) {
  const hay = (id + " " + (topics || []).join(" ")).toLowerCase();
  for (const [intent, re] of KEYWORD_RULES) if (re.test(hay)) return intent;
  return null;
}

function deriveIntent(tpl) {
  const id = tpl.id;
  const topics = tpl.topics || [];
  return (
    OVERRIDES[id] ||
    fromShapes(id) ||
    fromKeywords(id, topics) ||
    fromTier1(topics) ||
    "remix"
  );
}

const out = {};
const dist = {};
for (const tpl of TEMPLATES) {
  if (!tpl || !tpl.id) continue;
  const intent = deriveIntent(tpl);
  if (!INTENTS.includes(intent)) throw new Error(`bad intent ${intent} for ${tpl.id}`);
  out[tpl.id] = intent;
  dist[intent] = (dist[intent] || 0) + 1;
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 0) + "\n");
console.log(`wrote ${Object.keys(out).length} template intents -> ${path.relative(ROOT, OUT)}`);
console.log("distribution:", dist);
