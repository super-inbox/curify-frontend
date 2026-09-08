/**
 * @file pinterest_lib.cjs
 * @description Shared pieces for Pinterest publishing: data access, image
 * preparation, copy, selection and the pin registry.
 *
 * Extracted from pinterest_publish.cjs on 2026-09-04 so the publisher, the
 * proposer and the board-hygiene mode can share one implementation rather than
 * three drifting copies.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { applyCornerWatermark } = require("./lib/watermark.cjs");
const demand = require("./pinterest_demand.cjs");

const ROOT = path.join(__dirname, "..");
const CDN = "https://cdn.curify-ai.com";
const SITE = "https://www.curify-ai.com";

/** Unwatermarked renders. See preparePinImage for why these are required. */
const CLEAN_SOURCE_DIR = path.join(process.env.HOME, "curify-gallery/daily_inspirations");
/** Where the Pinterest-specific variant is written. public/images is gitignored. */
const PIN_IMAGE_DIR = path.join(ROOT, "public/images/pinterest");
const PIN_IMAGE_URL_PREFIX = "/images/pinterest";

/**
 * board key -> { id, landing }.
 *
 * `landing` is the topic hub, so a Pin sends traffic to a browsable collection
 * rather than one template. ecommerce points at /topics/product because
 * /topics/ecommerce was consolidated into it on 2026-08-20 and now 308s — a Pin
 * must never link through a redirect.
 *
 * `demo` is the board the 2026-08-29 access-demo pins landed on. It is recorded
 * here so the id is not a mystery later; it is not a publishing target.
 */
const BOARDS = {
  merch:     { id: "570831390209279192", landing: "/topics/merch" },
  brand:     { id: "570831390209279198", landing: "/topics/branding" },
  ecommerce: { id: "570831390209279199", landing: "/topics/product" },
  packaging: { id: "570831390209279197", landing: "/topics/packaging" },
  edtech:    { id: "570831390209279196", landing: "/topics/learning" },
  mbti:      { id: "570831390209262804", landing: "/topics/mbti" },
  demo:      { id: "570831390209280001", landing: "/nano-template/custom-character-card" },

  // Batch 3, 2026-09-08. The first five boards are our product taxonomy —
  // packaging, brand identity, ecommerce listings — and after 29 Pins they had
  // earned 0 impressions and 0 saves. They describe a design tool. Pinterest's
  // audience searches for an outcome: "nail art designs", "simple skincare
  // routine steps", "travel journal collage", "blueberries antioxidants". Every
  // one of those is a phrase GSC already measures against a template of ours,
  // on image search, at 0% CTR — demand we are visible for and cannot convert
  // on Google. These four boards are those clusters.
  beauty:    { id: "570831390209281053", landing: "/topics/beauty" },
  fashion:   { id: "570831390209281054", landing: "/topics/fashion" },
  food:      { id: "570831390209281055", landing: "/topics/food" },
  travel:    { id: "570831390209281056", landing: "/topics/travel" },
};

/** Topics feeding each board, matched against the topic-membership rule below. */
const BOARD_TOPICS = {
  ecommerce: ["product", "ecommerce", "e-commerce"],
  packaging: ["packaging"],
  edtech:    ["learning", "education", "edtech", "language", "vocabulary", "science", "study-sheets", "flashcards"],
  merch:     ["merch", "merchandise", "sticker", "keychain"],
  brand:     ["branding", "brand", "logo"],
  beauty:    ["beauty", "hairstyle", "nails", "skincare"],
  fashion:   ["fashion", "outfit", "lookbook", "costumes"],
  food:      ["food", "recipes", "drinks"],
  travel:    ["travel", "city", "map"],
};

/**
 * Templates pulled onto a board regardless of their topic tags.
 *
 * BOARD_TOPICS is the general rule and it stays the general rule, but topic
 * tagging was built for the site's own navigation and does not always agree
 * with a Pinterest category. template-beauty-step-by-step-guide carries
 * lifestyle/fashion/cartoon/guides and no `beauty`, which left the beauty board
 * with three candidates while GSC measures 197 image impressions on exactly
 * that template ("simple skincare routine steps"). Listing it here is honest
 * about the exception; retagging the template would change site navigation to
 * fix a Pinterest problem.
 */
const BOARD_TEMPLATES = {
  beauty: [
    "template-beauty-step-by-step-guide",
    "template-hairstyle-guide-infographic",
    "template-fashion-nail-art-design",
    "template-hairstyle-color-recommendation",
  ],
  food: [
    "template-fruit",
    "template-fruit-commercial-lifestyle-infographic-poster",
    "template-varieties-food-poster",
    "template-recipe",
    "template-wine-variety-intro-infographic",
  ],
  travel: [
    "template-watercolor-travel-journal-collage",
    "template-city-miniature",
    "template-historical-event-map-illustration",
  ],
  fashion: [
    "template-fashion-inspired-gown-design-sheet",
    "template-fashion-style-outfit-breakdown-infographic",
    "template-costume",
  ],
};

/**
 * Templates a board must NOT take, even though its topics match.
 *
 * Nail art carries `fashion` as well as `beauty`, so once the beauty board hit
 * its quota the leftover nail-art example spilled onto the fashion board ahead
 * of a dark-academia outfit breakdown. Higher demand, wrong board: a Pinterest
 * board is a topic promise, and mixing manicures into a fashion board weakens
 * both. The rule is one line per genuine cross-tag, not a second taxonomy.
 */
const BOARD_EXCLUDE = {
  fashion: ["template-fashion-nail-art-design", "template-beauty-step-by-step-guide"],
};

const REGISTRY = path.join(ROOT, "data/pinterest/pins.jsonl");

// ---------------------------------------------------------------- env

const BACKEND_ENV = path.join(process.env.HOME, "curify-studio/curify_background/.env");
function loadBackendEnv() {
  try {
    for (const line of fs.readFileSync(BACKEND_ENV, "utf8").split("\n")) {
      const m = line.match(/^\s*(PINTEREST_[A-Z_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch { /* fall back to the ambient env */ }
}

// ---------------------------------------------------------------- data

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, rel), "utf8"));
}

let _insp = null;
/**
 * example id -> record.
 *
 * Replaces a recursive whole-tree walk that ran per lookup over a 5.5MB file.
 * nano_inspiration.json is a flat array of unique ids, so the recursion — and
 * its "last match wins" hazard — was never needed.
 */
function inspIndex() {
  if (!_insp) {
    const arr = loadJson("public/data/nano_inspiration.json");
    _insp = new Map((Array.isArray(arr) ? arr : Object.values(arr)[0]).map((r) => [r.id, r]));
  }
  return _insp;
}

let _nano = null;
function nanoCopy() {
  if (!_nano) _nano = loadJson("messages/en/nano.json");
  return _nano;
}

let _tplTopics = null;
/**
 * template id -> its topics.
 *
 * Topic membership must mirror app/[locale]/(static)/topics/[slug]/page.tsx: a
 * record belongs to a topic via its OWN `topics` or via its template's. Direct
 * tags alone are wrong — `packaging` has zero directly-tagged records and 38
 * that inherit from the template.
 */
function templateTopics() {
  if (!_tplTopics) {
    _tplTopics = new Map(
      loadJson("public/data/nano_templates.json").map((t) => {
        const raw = t.topics;
        const list = Array.isArray(raw) ? raw : String(raw || "").split(",");
        return [String(t.id).trim(), list.map((s) => String(s).trim().toLowerCase()).filter(Boolean)];
      }),
    );
  }
  return _tplTopics;
}

function inTopics(rec, wanted, boardKey = null) {
  const tid = String(rec.template_id).trim();
  if (boardKey && (BOARD_EXCLUDE[boardKey] || []).includes(tid)) return false;
  if (boardKey && (BOARD_TEMPLATES[boardKey] || []).includes(tid)) return true;
  const own = (rec.topics || []).map((s) => String(s).toLowerCase());
  const tpl = templateTopics().get(String(rec.template_id).trim()) || [];
  return wanted.some((w) => own.includes(w) || tpl.includes(w));
}

// ---------------------------------------------------------------- images

/**
 * Dimensions and byte size from the LOCAL file.
 *
 * Replaces a version that downloaded the full image over HTTP just to read its
 * header. Handles PNG as well as JPEG: 220 of 3,879 records (5.7%) are PNG, and
 * treating them as JPEG is how the old path silently produced a 404 URL.
 */
function inspect(localPath) {
  const st = fs.statSync(localPath);
  const fd = fs.openSync(localPath, "r");
  const buf = Buffer.alloc(Math.min(131072, st.size));
  fs.readSync(fd, buf, 0, buf.length, 0);
  fs.closeSync(fd);

  if (buf.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    return { w, h, ratio: w / h, bytes: st.size };
  }
  let i = 2;
  while (i < buf.length - 9) {
    if (buf[i] !== 0xff) { i++; continue; }
    const m = buf[i + 1];
    if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) {
      const h = buf.readUInt16BE(i + 5), w = buf.readUInt16BE(i + 7);
      return { w, h, ratio: w / h, bytes: st.size };
    }
    if (m === 0xd8 || (m >= 0xd0 && m <= 0xd9)) { i += 2; continue; }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  throw new Error(`cannot read dimensions: ${localPath}`);
}

let _cleanIndex = null;
/**
 * filename stem -> absolute path, over the unwatermarked renders.
 *
 * WHY THIS EXISTS. sync_nano_inspiration.cjs:323 calls applyTiledWatermark on
 * every ingested image IN PLACE, at 22% of image width tiled across the whole
 * frame, and the preview inherits it. That is fine on our own site and
 * disqualifying on Pinterest, which is a save-driven surface where a full-frame
 * tiled watermark reads as a stock-photo preview. Publishing a batch that way
 * would also make the results uninterpretable: weak saves would not distinguish
 * bad selection from bad creative.
 */
function cleanIndex() {
  if (!_cleanIndex) {
    _cleanIndex = new Map();
    const walk = (dir) => {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
      for (const e of entries) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p);
        else if (/\.(jpe?g|png|webp)$/i.test(e.name)) {
          const stem = e.name.replace(/\.[^.]+$/, "");
          if (!_cleanIndex.has(stem)) _cleanIndex.set(stem, p);
        }
      }
    };
    walk(CLEAN_SOURCE_DIR);
  }
  return _cleanIndex;
}

/** The unwatermarked source for a record, or null when we only have the tiled one. */
function cleanSourceFor(rec) {
  const idx = cleanIndex();
  if (idx.has(rec.id)) return idx.get(rec.id);
  const rel = rec.asset && rec.asset.image_url;
  if (rel) {
    const stem = path.basename(rel).replace(/\.[^.]+$/, "");
    if (idx.has(stem)) return idx.get(stem);
  }
  return null;
}

/** Absolute path of the site's (watermarked) asset, or null if not synced locally. */
function siteImagePath(rec) {
  const rel = rec.asset && rec.asset.image_url;
  if (!rel) return null;
  const p = path.join(ROOT, "public", rel);
  return fs.existsSync(p) ? p : null;
}

/**
 * Build the Pin image: clean source + a small corner mark, uploaded to the CDN.
 *
 * The corner mark keeps attribution when the Pin is re-hosted, which is what
 * Pinterest is for, without the tiled version's stock-preview look.
 * CORNER_DEFAULTS.logoPctFull is 0.20 — too large for a Pin — so 0.10 here.
 */
function preparePinImage(rec, { dryRun = false } = {}) {
  const src = cleanSourceFor(rec);
  if (!src) throw new Error(`${rec.id}: no unwatermarked source in ${CLEAN_SOURCE_DIR}`);
  const ext = path.extname(src).toLowerCase() === ".png" ? ".png" : ".jpg";
  const outName = `${rec.id}${ext}`;
  const outPath = path.join(PIN_IMAGE_DIR, outName);
  const url = `${CDN}${PIN_IMAGE_URL_PREFIX}/${encodeURIComponent(outName)}`;

  if (!dryRun && !fs.existsSync(outPath)) {
    fs.mkdirSync(PIN_IMAGE_DIR, { recursive: true });
    applyCornerWatermark(src, outPath, { logoPct: 0.1, padding: 24 });
  }
  return { url, localPath: fs.existsSync(outPath) ? outPath : src, sourcePath: src, variant: "corner-watermark" };
}

/** Push one prepared image to the CDN bucket (see scripts/sync_large_assets.sh). */
function uploadPinImage(localPath) {
  execSync(`gsutil -q cp "${localPath}" gs://curify-static/images/pinterest/`, { stdio: "pipe" });
}

// ---------------------------------------------------------------- copy

/**
 * A nameable subject for the Pin.
 *
 * Prefers params, which is what the site itself shows (mirrors pickTitle in
 * sync_nano_inspiration.cjs). Blind id-minus-template_id surgery produces
 * "Template Education Dna Double Helix" whenever the id does not start with its
 * own template id, so that is the last resort and a miss throws — a Pin whose
 * subject we cannot name should not be published.
 */
const SUBJECT_KEYS = ["topic", "book_name", "herb_name", "core_selling_point",
  "word_pair_title", "costume_style", "scene_type", "product_name", "character_name"];

function subjectOf(rec) {
  const params = rec.params || {};
  for (const k of SUBJECT_KEYS) {
    if (params[k] && String(params[k]).trim()) return String(params[k]).trim();
  }
  for (const v of Object.values(params)) {
    if (v && String(v).trim() && String(v).length < 60) return String(v).trim();
  }
  const en = (rec.locales && (rec.locales.en || Object.values(rec.locales)[0])) || {};
  if (en.title && String(en.title).trim()) return String(en.title).trim();
  const tid = String(rec.template_id);
  if (rec.id.startsWith(`${tid}-`)) return rec.id.slice(tid.length + 1).replace(/-/g, " ");
  throw new Error(`${rec.id}: cannot resolve a subject`);
}

// Anchored on word STARTS, not \b: \b matches between the apostrophe and the s
// in "men's", and the proposer emitted "Men'S Korean Short Hair Guide".
const titleCase = (s) => s.replace(/(^|[\s\-–—(/])([a-z])/g, (_, p, c) => p + c.toUpperCase());

/** Truncate on a word boundary — mid-word cuts read as broken copy. */
function clip(s, max) {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).trimEnd();
}

/**
 * Strip the artefacts of an id-derived subject.
 *
 * Example ids carry enumeration suffixes and quoted category names that read as
 * broken copy on a Pin: "Western2", "Cover 1", "Kyotoani Vs Ufotable 2",
 * `"Doodle Overlay" Photo Example`. None of them is part of what is drawn.
 */
function cleanSubject(s) {
  return String(s)
    .replace(/["“”]/g, "")
    .replace(/\s+\d{1,2}$/, "")
    .replace(/([a-z])\d{1,2}$/i, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/**
 * Normalised subject tokens of a template's OTHER examples.
 *
 * A query measured on a TEMPLATE page still describes one example a lot of the
 * time — the template page renders its examples, so template-food-anatomy-diagram
 * ranks for "coffee bean anatomy diagram" and that phrase then titled the beef
 * cuts example "Beef Cuts Coffee Bean Anatomy Diagram". If a phrase names a
 * sibling's subject and not this one's, it belongs to the sibling.
 */
/**
 * Templates whose examples are per-ITEM, so a template-page query never
 * generalises to a different example.
 *
 * The ASL tutorial has one example per sign, and its template page ranks for
 * "big in asl" and "nose asl" — each true of exactly one example. Applied to
 * another, they produce "Five Parameters Of Asl Nose Asl". Unlike the sibling
 * guard, which needs the offending word to be some sibling's subject, this just
 * says: for these templates, title from the example's own queries or from the
 * category, never from the template's.
 */
const NO_TEMPLATE_PHRASE = new Set([
  "template-asl-sign-language-tutorial-infographic",
  "template-chinese-idiom-learning-card",
  "template-anatomy-cut-guide",
]);

const SUBJECT_STOP = new Set(["the", "and", "for", "with", "a", "an", "of", "in", "on",
  "guide", "card", "chart", "poster", "infographic", "design", "style", "tutorial", "set"]);
let _siblings = null;
function siblingSubjectTokens(templateId, exceptId) {
  if (!_siblings) {
    _siblings = new Map();
    for (const r of inspIndex().values()) {
      const tid = String(r.template_id).trim();
      let subj;
      try { subj = subjectOf(r); } catch { continue; }
      if (!_siblings.has(tid)) _siblings.set(tid, []);
      _siblings.get(tid).push([r.id, subj]);
    }
  }
  const out = new Set();
  for (const [id, subj] of _siblings.get(String(templateId).trim()) || []) {
    if (id === exceptId) continue;
    // 3, not 4: the ASL template's examples are distinguished by short words
    // ("big vs very big"), and at 4 the template-page phrase "big in asl"
    // titled the FIVE PARAMETERS example "Five Parameters Of Asl Big In Asl".
    for (const w of subj.toLowerCase().split(/[^a-z0-9]+/)) {
      if (w.length >= 3 && !SUBJECT_STOP.has(w)) out.add(w);
    }
  }
  return out;
}

/**
 * Merge a subject into a measured search phrase without repeating a word.
 *
 * "Blueberry" + "blueberries antioxidants" must not become "Blueberry
 * Blueberries Antioxidants". Tokens are considered the same word when they
 * share a 5-character prefix, which is crude but only ever decides whether a
 * word is said twice.
 */
function mergePhrase(subject, phrase) {
  const norm = (w) => w.toLowerCase().replace(/[^a-z0-9]/g, "");
  const pTokens = phrase.split(/\s+/).map(norm).filter(Boolean);
  const same = (a, b) => a.slice(0, 4) === b.slice(0, 4) && a.length >= 3 && b.length >= 3;
  const kept = subject.split(/\s+/).filter((w) => {
    const n = norm(w);
    return n && !pTokens.some((t) => same(n, t));
  });
  return titleCase(`${kept.join(" ")} ${phrase}`.trim().replace(/\s+/g, " "));
}

/**
 * Title / description / alt_text.
 *
 * The previous alt_text was hardcoded to "<subject> character expression sheet,
 * nine poses on a grid" for EVERY template — wrong for all but one, and alt
 * text is read by both screen readers and Pinterest search.
 *
 * Uses `category` rather than `title` for the suffix: nano.json titles look like
 * "Nano Banana Prompt: Food Product Packaging Design Generator | Curify AI",
 * and "Generator" is dead weight in a search phrase.
 *
 * 2026-09-08 — the title is now anchored on a MEASURED search phrase when GSC
 * has one for the template (see pinterest_demand.cjs). The category suffix is a
 * description of our tool: batch 2 shipped "Ceramic Lake-View Mug Price Tag &
 * Product Label" and "Saving Vs Investing Finance Comparison Infographic", and
 * those 29 Pins earned 0 impressions in 3 days. Nobody searches Pinterest for a
 * price tag. They search "simple skincare routine steps" — 197 image
 * impressions, 0 clicks, already ours on Google and unconvertible there.
 *
 * The description now ends on an explicit save CTA. SAVE is the distribution
 * signal on this surface and the measured rate across 57 Pins is exactly 0.
 */
function copyFor(rec) {
  const tpl = nanoCopy()[rec.template_id] || {};
  const category = cleanSubject(
    String(tpl.category || "").replace(/\s+Category$/i, "").replace(/\s+Generator$/i, "").trim());
  // Strip the "Generate a ..." lead, then re-capitalise: the remainder becomes a
  // sentence in the middle of the description, and "…made with Curify AI.
  // complete brand visual identity…" reads as a typo.
  let body = String(tpl.description || "").replace(/^Generate an?\s+/i, "").trim();
  // Then strip render jargon. 23 of 352 EN descriptions open on the spec we
  // hand the model — "3:4 vertical ultra-high-definition 8K …", "suitable for
  // high-quality commercial display". It is instructions to a renderer, and on
  // a Pin it is the first line a human reads.
  body = body
    .replace(/\b(?:ultra[- ]high[- ]definition|high[- ]definition)\b/gi, "")
    .replace(/\b[48]K\b/g, "")
    .replace(/\b\d{1,2}:\d{1,2}\b/g, "")
    .replace(/\bvertical composition\b/gi, "")
    .replace(/,?\s*suitable for (?:high-quality )?(?:commercial|science communication)[^.,;]*/gi, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;])/g, "$1")
    .replace(/^[\s,;:-]+/, "")
    .trim();
  if (body) body = body[0].toUpperCase() + body.slice(1);
  if (!category) throw new Error(`${rec.template_id}: no EN category in nano.json`);
  if (!body) throw new Error(`${rec.template_id}: no EN description in nano.json`);

  const subject = titleCase(cleanSubject(subjectOf(rec)));
  const phrase = demand.copyPhrase(rec.template_id, rec.id, {
    templatePhrases: !NO_TEMPLATE_PHRASE.has(String(rec.template_id).trim()),
    reject: (q) => {
      const mine = new Set(subjectOf(rec).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
      const sibs = siblingSubjectTokens(rec.template_id, rec.id);
      return q.toLowerCase().split(/[^a-z0-9]+/).some(
        (w) => w.length >= 3 && sibs.has(w) && ![...mine].some((m) => m.slice(0, 3) === w.slice(0, 3)));
    },
  });
  const title = clip(mergePhrase(subject, phrase || category.toLowerCase()), 100);
  return {
    subject,
    phrase,
    title,
    alt_text: clip(`${subject} — ${body}`, 500),
    description: clip(
      `${title}. ${body} ` +
      `Save it for later, or make your own — free ${category.toLowerCase()} template on Curify AI.`, 800),
  };
}

/** Guards that must hold before a Pin is posted. */
function assertCopy(rec, copy) {
  const alt = copy.alt_text.toLowerCase();
  if (!alt.includes(copy.subject.toLowerCase().slice(0, 24)))
    throw new Error(`${rec.id}: alt_text does not name the subject`);
  if (alt.includes("expression sheet") && !/expression/.test(rec.template_id))
    throw new Error(`${rec.id}: alt_text says "expression sheet" for a non-expression template`);
  for (const [k, max] of [["title", 100], ["description", 800], ["alt_text", 500]])
    if (copy[k].length > max) throw new Error(`${rec.id}: ${k} exceeds ${max}`);
}

// ---------------------------------------------------------------- IP screen

/**
 * Layer 1 — named entities anywhere in the record's text.
 * Layer 2 — templates whose SHAPE implies a real person or a character.
 *
 * Neither is sufficient. Layer 3 is a human looking at the image, and it is not
 * optional: template-product-poster-aroma-diffuser passes both layers and
 * renders "NIIMBOT B21" on the device — a real brand, drawn in the pixels.
 * Metadata never describes what is drawn.
 */
const IP_NAMES = new RegExp([
  "messi", "maradona", "ronaldo", "neymar", "mbappe", "haaland", "yamal", "world.?cup", "fifa", "olympic",
  "marvel", "disney", "pixar", "hello.?kitty", "miffy", "mario", "minion", "bluey", "kuromi", "labubu",
  "luffy", "pokemon", "pikachu", "potter", "naruto", "itachi", "gaara", "hinata", "minato", "ghibli",
  "conan", "shin.?chan", "snoopy", "sailor.?moon", "yellowstone", "chandler", "durant",
  "nike", "adidas", "coca.?cola", "starbucks", "apple.?inc", "lego", "barbie", "niimbot",
  // Animation studios are trademarks with distinctive marks, and the
  // comparison-infographic template renders their logos. Added 2026-09-08 when
  // demand ranking surfaced "Kyotoani Vs Ufotable" as the top edtech candidate.
  "ufotable", "kyoto.?ani", "dreamworks", "madhouse", "mappa\\b", "toei", "wit.?studio",
  "studio.?trigger", "shueisha", "kodansha", "netflix", "warner", "universal.?studios",
  "van.?gogh", "einstein", "steve.?jobs", "musk", "picasso",
  "zhenhuan", "red.?chamber",
  // Added 2026-09-04 after visual review rejected 4 of 22 candidates that had
  // passed both automated layers. Each is recorded so the same image cannot be
  // re-proposed, but the general lesson is that this list ALWAYS lags — the
  // rejections were NIIMBOT printed on a diffuser, Busan's official BOOGI
  // mascot, a poster crediting "Civil Navigator", and Stella McCartney set in
  // the artwork. Only the first was catchable from metadata.
  "stella.?mccartney", "boogi", "busan.communication", "civil.?navigator",
].join("|"), "i");

/**
 * Individually rejected at visual review. Keyed by example id because the
 * offending detail is in the pixels, not the metadata, so no pattern would
 * catch it.
 */
const IP_REJECTED_TEMPLATES = new Set([
  // Both examples inspected render "NIIMBOT B21" on the device, and the string
  // appears NOWHERE in the template's metadata — the generation model baked a
  // real brand into the pixels. With 10 examples under it and no way to tell
  // from data which carry the mark, the whole template is out for Pinterest.
  "template-product-poster",
]);

const IP_REJECTED_EXAMPLES = new Set([
  // Visible Canva placeholder text ("123 ANYWHERE ST., ANY CITY") — reads as an
  // unfinished stock template rather than a finished piece.
  "template-vintage-collage-fashion-collection-poster-fall-fashion-vibes-cicybell",
  "template-product-poster-aroma-diffuser",                        // NIIMBOT B21 on the device
  "template-ip-gift-box-stationery-set-mockup-busan-boogi-duck",   // Busan municipal mascot
  "template-cultural-festival-poster-suwori-festival",             // credits "Civil Navigator"
  "template-vintage-collage-fashion-collection-poster-denim-chic-stella-mccartney",
  // Batch 2, 2026-09-05: names and pictures AeroPress, Chemex, Kalita Wave and
  // V60 — real trademarks with distinctive trade dress. Arguably nominative fair
  // use in an educational guide, but "Civil Navigator" was rejected on less, and
  // the standard should not move between batches.
  "template-professional-category-guide-infographic-coffee-brewing-guide",
  // Batch 3, 2026-09-08. 7 of 30 rejected at visual review — the same ~25% the
  // earlier batches ran, and only one of the seven was visible in metadata.
  "template-travel-packing-guide-infographic-3day-hiking-adventure",  // Yankees "NY" + New Era mark on the cap
  "template-watercolor-travel-journal-collage-countryside-tour",      // "Nikon" rendered on the camera body
  "template-watercolor-travel-journal-collage-coastal-vibe",         // same
  "template-watercolor-travel-journal-collage-mountain-trip",        // same. 3 of this template's 4 examples render "Nikon" on the camera; all four were
                                                                     // inspected and only -island-vacation is clean, so the survivor is kept rather
                                                                     // than the whole template being cut the way template-product-poster was.
  "template-pet-safe-human-food-infographic-guinea-pig",              // third-party "the little shine" watermark baked into the onion photo; food labels garbled ("Pumpoil", "Chartots", "Ceams")
  "template-book-series-one-hundred-years-of-solitude-cover-1",       // in-copyright novel, cover art credits "Gabriel García Márquez"
]);

/**
 * Templates that render photorealistic human faces.
 *
 * Not an IP finding — all of these are `image_input: "none"`, so the faces are
 * model-generated and not swapped off a reference photo, which is the case
 * project_fashion_model_pose_ref_likeness warns about. Publishing a photoreal
 * face on a commercial account is still a policy call, so it was put to the
 * operator rather than decided by the proposer: **allowed, 2026-09-08**. The
 * set is kept, and the flag with it, so the decision is one line to reverse and
 * so a future reviewer can see which templates it covers.
 */
const PHOTOREAL_FACE_TEMPLATES = new Set([
  "template-hairstyle-guide-infographic",
  "template-asl-sign-language-tutorial-infographic",
  "template-hairstyle-color-recommendation",
  "template-fashion-style-outfit-breakdown-infographic",
]);
const ALLOW_PHOTOREAL_FACES = process.env.PINTEREST_ALLOW_FACES !== "0";

const IP_TEMPLATE_SHAPE = /(character|figure|celebrity|portrait|scientist|founder|player|actor|idol|mbti|persona|artist)/i;

/**
 * Layer 1b — category words that imply a real person or a licensed property.
 *
 * Split out of IP_NAMES on 2026-09-08 because these are the only patterns that
 * are also legitimate SEARCH VOCABULARY, and search_aliases is where we park
 * the phrases people type. "celebrity fashion" is an alias on every gown in
 * template-fashion-inspired-gown-design-sheet; the gowns are butterflies,
 * cherry blossoms and ocean waves. All 7 were blocked, and that template is the
 * single highest-demand non-IP image page on the site (668 image impressions).
 *
 * So these are matched against what the record IS — id, params, locales, tags —
 * and never against what people SEARCH for. A named entity (IP_NAMES) still
 * disqualifies wherever it appears, aliases included: an alias of "hello kitty"
 * means the image really is Hello Kitty.
 */
const IP_CATEGORY = /character-ip|celebrity|fandom/i;

function ipFlags(rec) {
  if (IP_REJECTED_EXAMPLES.has(rec.id)) return ["rejected-at-visual-review"];
  if (IP_REJECTED_TEMPLATES.has(String(rec.template_id).trim())) return ["template-rejected-at-visual-review"];
  if (!ALLOW_PHOTOREAL_FACES && PHOTOREAL_FACE_TEMPLATES.has(String(rec.template_id).trim()))
    return ["photoreal-face:set PINTEREST_ALLOW_FACES=1 to include"];
  const self = [rec.id, JSON.stringify(rec.params || {}), JSON.stringify(rec.locales || {}),
    (rec.tags || []).join(" ")].join(" ");
  const blob = `${self} ${(rec.search_aliases || []).join(" ")}`;
  const flags = [];
  const named = blob.match(IP_NAMES);
  if (named) flags.push(`named:${named[0]}`);
  const cat = self.match(IP_CATEGORY);
  if (cat) flags.push(`category:${cat[0]}`);
  if (IP_TEMPLATE_SHAPE.test(rec.template_id)) flags.push("shape:person-like");
  if ((rec.params || {}).character_name) flags.push("param:character_name");
  return flags;
}

// ---------------------------------------------------------------- registry

/**
 * Append-only JSONL, one row per ATTEMPT.
 *
 * Not public/data (served at curify-ai.com/data/...), not lib/generated
 * (bundled into the build), not raw/ (client material).
 *
 * The 29 pins already on the account have no recorded ids and therefore no
 * recoverable analytics; pin-level analytics is keyed on the id, so this file is
 * the prerequisite for ever measuring a run.
 */
function recordPin(row) {
  const line = JSON.stringify({ ts: new Date().toISOString(), ...row });
  try {
    fs.mkdirSync(path.dirname(REGISTRY), { recursive: true });
    fs.appendFileSync(REGISTRY, line + "\n");
  } catch (e) {
    // Losing a pin id is worse than a noisy log — the id is unrecoverable.
    console.error(`!!! REGISTRY WRITE FAILED — RECORD THIS BY HAND:\n${line}\n${e.message}`);
  }
}

function publishedIds() {
  try {
    return new Set(
      fs.readFileSync(REGISTRY, "utf8").split("\n").filter(Boolean)
        .map((l) => { try { return JSON.parse(l); } catch { return null; } })
        .filter((r) => r && r.status === "ok" && r.example_id)
        .map((r) => r.example_id),
    );
  } catch { return new Set(); }
}

module.exports = {
  ROOT, CDN, SITE, BOARDS, BOARD_TOPICS, BOARD_TEMPLATES, BOARD_EXCLUDE, REGISTRY, CLEAN_SOURCE_DIR, PIN_IMAGE_DIR,
  loadBackendEnv, loadJson, inspIndex, nanoCopy, templateTopics, inTopics,
  inspect, cleanIndex, cleanSourceFor, siteImagePath, preparePinImage, uploadPinImage,
  subjectOf, cleanSubject, titleCase, clip, mergePhrase, siblingSubjectTokens, copyFor, assertCopy, demand,
  ipFlags, IP_NAMES, IP_CATEGORY, IP_TEMPLATE_SHAPE, PHOTOREAL_FACE_TEMPLATES, IP_REJECTED_EXAMPLES, IP_REJECTED_TEMPLATES,
  recordPin, publishedIds,
};
