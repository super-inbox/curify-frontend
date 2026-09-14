/**
 * Reasoning step: read a garment's reference photos and emit a structured
 * feature spec, before anything is generated.
 *
 * WHY THIS EXISTS
 * ---------------
 * Both failures on the 夏可 job (2026-09-10) and on model-swap case 1 (2026-08-28)
 * were the same shape: the generator faithfully reproduced a spec that had been
 * written by a human skim-reading the flatlay. Case 1 called a buttoned pointed
 * hem tab a "notched V-split" and every take obeyed. Case 2 looked at two
 * close-ups of gathered rib at the side seam, called them "fabric detail shots",
 * and shipped five images with a smooth side seam.
 *
 * Neither was a generator problem and neither would have been caught by an
 * output checker, because the output matched the spec. The fix has to sit
 * BEFORE the prompt: read the photos deliberately, in writing, against a
 * checklist, and keep the result as an artifact you can diff.
 *
 * THREE RULES THE PROMPT ENFORCES, each from a specific miss
 * ---------------------------------------------------------
 *  1. The client's detail-shot selection IS the feature list. A supplier does
 *     not burn 2 of 11 photos on a fold. Repeated or close-up = important.
 *  2. Construction vs. styling artifact is decided by RECURRENCE: a pucker in
 *     the same place on both the front and back flatlay is a seam detail; one
 *     that appears once is a fold. This is the exact test that would have caught
 *     the 侧面抽褶.
 *  3. Count the countables out loud. Buttons get miscounted silently.
 *
 * Emits JSON to stdout or --out. REVIEW THE OUTPUT AGAINST THE PHOTOS before
 * feeding it forward — this is a reasoning aid, not an oracle.
 *
 *   node scripts/garment_feature_extract.cjs --kind top    --dir "<flatlay dir>" --out spec-top.json
 *   node scripts/garment_feature_extract.cjs --kind bottom --dir "<flatlay dir>" --out spec-bottom.json
 *   node scripts/garment_feature_extract.cjs --kind model  --dir "<model dir>"   --out spec-model.json
 */
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const BG_ENV = "/Users/qqwjq/curify-studio/curify_background/.env";
const ANALYSIS_MODEL = process.env.ANALYSIS_MODEL || "gemini-3.1-pro-preview";
const MAX_IMAGES = 16;

function readKey() {
  const m = fs.readFileSync(BG_ENV, "utf-8").match(/^GEMINI_API_KEY_TRYON_RETOUCHING=(.+)$/m);
  if (!m) throw new Error(`GEMINI_API_KEY_TRYON_RETOUCHING not in ${BG_ENV}`);
  return m[1].trim().replace(/^["']|["']$/g, "");
}

// ── the checklist ─────────────────────────────────────────────────────────────
// Named axes come from what a sourcing buyer checks and from what has actually
// been got wrong: buttons, neck, fabric, 袖口, 侧面, and for trousers the waist
// button and leg shape.

const COMMON_RULES = `HOW TO READ THIS SET OF PHOTOS

You are looking at a supplier's own product photography: one or two full flatlays
plus a run of close-ups. Three rules govern how to weigh them.

1. THE CLOSE-UPS ARE THE FEATURE LIST. A supplier does not spend two of eleven
   photographs on an accidental crease. If several close-ups show the same area,
   that area is the point of the garment. Say so, and say how many photos show it.

2. CONSTRUCTION VERSUS STYLING ARTIFACT IS DECIDED BY RECURRENCE, NOT BY LOOKS.
   A pucker, gather, fold or bulge that appears in the SAME PLACE on the front
   flatlay AND the back flatlay, or on both the left and the right side, is built
   into the garment — a gather, shirring, a dart, an elasticated section. One that
   appears once, in one photo only, is a fold in the styling. Apply this test
   explicitly to the side seams, the waist and the sleeves before you write
   anything off as a wrinkle.

3. COUNT THE COUNTABLES EXPLICITLY. Buttons, buttonholes, belt loops, pockets,
   pleats. State the number. If a button is partly hidden under a collar, count it
   and say it is partly hidden. Never write "several".

Be concrete and physical. "A short run of gathered rib at the side seam directly
above the hem band, about 6cm tall, pulling the fabric into a soft pouf" is
useful. "Interesting side detail" is not. If you cannot see something, say
"not visible in these photos" rather than guessing — a confident guess here
becomes a defect in every image generated afterwards.`;

const GARMENT_SCHEMA = `Return ONE JSON object, no markdown fence, with exactly these keys:

{
  "sku": string | null,
  "category": string,
  "colour": { "name": string, "description": string, "is_single_colour": boolean, "contrast_parts": string },
  "fabric": { "construction": string, "surface": string, "weight": string, "opacity": string, "drape": string, "sheen": string },
  "collar_neck": { "type": string, "construction": string, "detail": string },
  "buttons": { "count_total": number, "locations": string, "count_by_location": string, "colour": string, "material": string, "shape": string, "holes": string, "spacing": string, "placket": string },
  "cuffs": { "construction": string, "width": string, "detail": string },
  "hem": { "construction": string, "shape": string, "detail": string },
  "sides": { "seam_treatment": string, "gathering_or_shirring": string, "slits_or_vents": string, "darts": string, "appears_on_front_and_back": boolean, "verdict": string },
  "waist_and_closure": { "waistband": string, "closure": string, "belt_loops": string, "fly": string },
  "pockets": { "front": string, "back": string, "shape": string },
  "silhouette": { "fit": string, "shoulder": string, "leg_shape": string, "widest_point": string, "narrowest_point": string, "ratio_note": string },
  "length": { "where_it_ends": string, "note": string },
  "back_view": string,
  "other_features": [ string ],
  "signature_details": [ string ],
  "evidence": [ { "feature": string, "photo_count": number, "seen_in": string, "confidence": "high"|"medium"|"low" } ],
  "not_visible": [ string ]
}

Fields that do not apply to this garment take the string "n/a" (for example
"leg_shape" on a top, or "collar_neck" on a trouser). Do not drop keys.

"signature_details" is the most important field: the two to four things a buyer
would point at and say 货不对版 — wrong goods — if the render got them wrong or
left them out. Rank them, most damaging first.

"sides" must be filled in deliberately. Look at the side seam of the front
flatlay and the side seam of the back flatlay and compare them. Look at BOTH
sides. State what is there.`;

const MODEL_SCHEMA = `Return ONE JSON object, no markdown fence, with exactly these keys:

{
  "face": { "shape": string, "jaw": string, "chin": string, "cheekbones": string, "forehead": string },
  "eyes": { "shape": string, "spacing": string, "lids": string, "colour": string, "brows": string },
  "nose": string,
  "mouth": { "lips": string, "resting_expression": string },
  "ears_and_earrings": string,
  "hair": { "colour": string, "length": string, "cut": string, "parting": string, "texture": string, "volume": string, "how_it_falls": string },
  "skin": { "tone": string, "undertone": string, "texture": string, "finish": string, "evenness": string },
  "makeup": string,
  "distinguishing_marks": [ string ],
  "apparent_age": string,
  "build": { "frame": string, "shoulders": string, "neck": string, "proportion_notes": string },
  "identity_anchors": [ string ],
  "what_varies_between_the_photos": [ string ],
  "not_visible": [ string ]
}

"identity_anchors" is the most important field: the three to five specific,
describable features that make this face recognisably THIS person rather than a
generic pretty face of the same ethnicity and age. These are what must survive
into every generated image for the set to read as one model. Avoid generic
praise; name geometry.

"build" must be honest about what the photographs actually show. If they are
head-and-shoulders only, say the body is not visible and confine yourself to
neck, shoulder line and apparent frame.`;

const KINDS = {
  top: {
    intro: `These photographs show ONE upper-body garment from a womenswear supplier.
Read it the way a sourcing buyer does before committing to a sample run: they are
checking 款式 (style), 面料 (fabric), 领口 (neck), 纽扣 (buttons), 袖口 (cuffs) and
侧面 (the sides) against the flatlay, and they reject the batch for 货不对版 if any
of them is wrong.`,
    schema: GARMENT_SCHEMA,
  },
  bottom: {
    intro: `These photographs show ONE lower-body garment (trousers or skirt) from a
womenswear supplier. Read it the way a sourcing buyer does: they are checking
款式, 面料, the waistband and its button and fly, the pockets, the leg shape and
the hem against the flatlay, and they reject the batch for 货不对版 if any of them
is wrong. Describe the leg shape in terms of where it is widest and where it is
narrowest, with a rough ratio, not with an adjective.`,
    schema: GARMENT_SCHEMA,
  },
  model: {
    intro: `These photographs are a fashion model's reference sheet — the same woman
in several views. Your job is to describe her precisely enough that a different
photograph of her could be recognised as the same person, and precisely enough
that an image generator could hold her identity across a set of images.`,
    schema: MODEL_SCHEMA,
    rules: `HOW TO READ THIS SET OF PHOTOS

Look at every view before writing. Features that hold across all of them are
identity; features that change between them are styling or expression, and belong
in "what_varies_between_the_photos" rather than in the identity fields.

Name geometry, not impressions. "Eyes set slightly wide, with a low double lid
that disappears at the inner corner" is usable. "Beautiful expressive eyes" is
not. Be specific about the hairline, the parting, where the hair changes
direction, and how the ends behave, because those are what generators lose first.

If the photographs are head-and-shoulders only, do not invent a body.`,
  },
};

// ── run ───────────────────────────────────────────────────────────────────────
function imagesIn(dir, exclude) {
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !exclude.some((x) => f.includes(x)))
    .sort()
    .map((f) => path.join(dir, f));
}

function part(p) {
  const ext = path.extname(p).toLowerCase();
  const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { inlineData: { mimeType: mime, data: fs.readFileSync(p).toString("base64") } };
}

async function main() {
  const argv = process.argv.slice(2);
  const flag = (n, d) => {
    const i = argv.indexOf(`--${n}`);
    return i >= 0 && argv[i + 1] ? argv[i + 1] : d;
  };
  const kind = flag("kind");
  const dir = flag("dir");
  const out = flag("out");
  // 参考对标图 is a real photograph the client marked 不可直接用; keep it out of
  // every pipeline stage, analysis included.
  const exclude = flag("exclude", "参考对标图,Thumbs.db").split(",").filter(Boolean);
  if (!KINDS[kind] || !dir) {
    console.error("usage: --kind top|bottom|model --dir <folder> [--out spec.json] [--exclude a,b]");
    process.exit(1);
  }

  const files = imagesIn(dir, exclude).slice(0, MAX_IMAGES);
  if (!files.length) throw new Error(`no images in ${dir}`);

  const k = KINDS[kind];
  const legend = files.map((f, i) => `  PHOTO ${i + 1} — ${path.basename(f)}`).join("\n");
  const prompt = `${k.intro}

THE PHOTOGRAPHS, in order:
${legend}

${k.rules || COMMON_RULES}

${k.schema}`;

  const ai = new GoogleGenAI({ apiKey: readKey() });
  process.stderr.write(`${kind}: ${files.length} photos -> ${ANALYSIS_MODEL}\n`);
  const resp = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: [{ role: "user", parts: [...files.map(part), { text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  const text = resp.text || "";
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    process.stderr.write("model did not return parseable JSON; writing raw\n");
    parsed = { _raw: text };
  }
  parsed._meta = { kind, model: ANALYSIS_MODEL, photos: files.map((f) => path.basename(f)), at: new Date().toISOString() };
  const json = JSON.stringify(parsed, null, 2);
  if (out) {
    fs.writeFileSync(out, json, "utf-8");
    process.stderr.write(`wrote ${out}\n`);
  } else {
    console.log(json);
  }
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
