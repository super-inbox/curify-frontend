/**
 * QA step: diff a rendered garment against its reference photo and enumerate
 * every discrepancy, ranked.
 *
 * WHY THIS EXISTS
 * ---------------
 * garment_feature_extract.cjs fixed the INTAKE half of the problem — reading the
 * reference properly before prompting. This is the other half. On the 夏可 job the
 * same garment area was rejected three rounds running, and each round a human
 * eyeballing the render found exactly one new error: first the side gathering was
 * missing, then its shape was wrong, then the collar turned out to be the wrong
 * TYPE and had been wrong the whole time. Each of those was plainly visible the
 * moment the two images were put side by side and read part by part — and
 * invisible when looking at the render on its own, because a render only ever
 * looks like a plausible photograph.
 *
 * A person comparing two images finds the first difference and stops. This asks
 * for ALL of them, in one pass, ranked, before the client does it for us.
 *
 * It feeds both images whole AND as matched magnified crops, because the details
 * that get rejected here are a few hundred pixels in a 4000px frame and do not
 * survive the model's downsampling of a full frame.
 *
 *   node scripts/garment_diff.cjs --ref <reference.jpg> --render <render.png> \
 *       --crops "collar:x,y,w,h" --crops "hem:x,y,w,h" --out diff.json
 *
 * Crop boxes are given separately for ref and render via --ref-crops/--render-crops
 * since the two images are not aligned. Omit them to diff whole frames only.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { GoogleGenAI } = require("@google/genai");

const BG_ENV = "/Users/qqwjq/curify-studio/curify_background/.env";
const MODEL = process.env.ANALYSIS_MODEL || "gemini-3.1-pro-preview";

function readKey() {
  const m = fs.readFileSync(BG_ENV, "utf-8").match(/^GEMINI_API_KEY_TRYON_RETOUCHING=(.+)$/m);
  if (!m) throw new Error("GEMINI_API_KEY_TRYON_RETOUCHING not found");
  return m[1].trim().replace(/^["']|["']$/g, "");
}

const SCHEMA = `Return ONE JSON object, no markdown fence:

{
  "verdict": "match" | "minor_differences" | "would_be_rejected",
  "discrepancies": [
    {
      "rank": number,
      "part": string,
      "reference_shows": string,
      "render_shows": string,
      "severity": "reject" | "noticeable" | "minor",
      "confidence": "high" | "medium" | "low",
      "how_to_fix_in_a_prompt": string
    }
  ],
  "correct_in_the_render": [ string ],
  "could_not_compare": [ string ]
}

Rank 1 is whatever a sourcing buyer would reject the batch over. "severity":
"reject" means 货不对版 — the garment in the render is not the garment in the
reference photograph.

"how_to_fix_in_a_prompt" must be a concrete instruction naming the shape, extent
and direction of the correct feature, AND naming the wrong thing to avoid. Not
"make the collar more accurate".`;

async function main() {
  const argv = process.argv.slice(2);
  const flag = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
  const all = (n) => argv.reduce((a, v, i) => (v === `--${n}` && argv[i + 1] ? [...a, argv[i + 1]] : a), []);

  const ref = flag("ref"), render = flag("render"), out = flag("out");
  const what = flag("what", "this garment");
  if (!ref || !render) { console.error("--ref <img> --render <img> [--ref-crops name:x,y,w,h] [--render-crops ...] [--out f.json]"); process.exit(1); }

  const tmp = fs.mkdtempSync("/tmp/gdiff-");
  const parts = [];
  const legend = [];
  let n = 1;

  const push = (file, label) => {
    const ext = path.extname(file).toLowerCase();
    parts.push({ inlineData: { mimeType: ext === ".png" ? "image/png" : "image/jpeg", data: fs.readFileSync(file).toString("base64") } });
    legend.push(`  IMAGE ${n++} — ${label}`);
  };

  push(ref, "THE REFERENCE — the real garment, photographed. This is the truth.");
  push(render, "THE RENDER — our generated photograph, the thing under test.");

  for (const spec of all("ref-crops")) {
    const [name, box] = spec.split(":");
    const [x, y, w, h] = box.split(",").map(Number);
    const f = path.join(tmp, `ref-${name}.png`);
    execSync(`magick "${ref}" -crop ${w}x${h}+${x}+${y} +repage -resize 1200x "${f}"`, { stdio: "pipe" });
    push(f, `THE REFERENCE, magnified on the ${name}.`);
  }
  for (const spec of all("render-crops")) {
    const [name, box] = spec.split(":");
    const [x, y, w, h] = box.split(",").map(Number);
    const f = path.join(tmp, `render-${name}.png`);
    execSync(`magick "${render}" -crop ${w}x${h}+${x}+${y} +repage -resize 1200x "${f}"`, { stdio: "pipe" });
    push(f, `THE RENDER, magnified on the ${name}.`);
  }

  const prompt = `You are checking a generated fashion photograph against the real garment it is
supposed to reproduce. A sourcing buyer will compare them part by part and reject
the batch for 货不对版 — wrong goods — if the garment does not match.

THE IMAGES:
${legend.join("\n")}

WHAT THE GARMENT IS: ${what}

HOW TO DO THIS, because the usual way fails:

1. DO NOT judge the render on its own. A generated image always looks like a
   plausible photograph; that tells you nothing. Every judgement must be a
   COMPARISON against the reference.

2. GO PART BY PART, in this order, and say something about each one even if it
   matches: collar or neckline (including its TYPE — a turn-down collar and a
   stand-up collar are different garments), placket and buttons, shoulders and
   armholes, sleeves and cuffs, the knit or weave structure and its direction,
   the side seams, the hem and the shape of the hemline, the overall length, and
   the fit through the body.

3. FIND EVERYTHING, NOT THE FIRST THING. A person comparing two images finds one
   difference and stops looking. The specific failure this tool exists to prevent
   is exactly that: three rounds of review on one garment, each round finding one
   new error, the largest of them last. Assume there is more than one and keep
   going after you have found a convincing one.

4. IGNORE everything that is not the garment: the pose, the model, the lighting,
   the background, the crop, the camera angle, whether the garment is on a body
   or laid flat. Those are supposed to differ. Only the GARMENT is under test.

5. Where the two genuinely agree, say so in "correct_in_the_render" — a diff that
   lists only faults is not calibrated and gets ignored. Where a part is not
   visible in one of the images, put it in "could_not_compare" rather than
   guessing at it.

${SCHEMA}`;

  const ai = new GoogleGenAI({ apiKey: readKey() });
  process.stderr.write(`diffing ${path.basename(render)} against ${path.basename(ref)} (${parts.length} images) -> ${MODEL}\n`);
  const resp = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [...parts, { text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  let parsed;
  try { parsed = JSON.parse(resp.text || ""); }
  catch { parsed = { _raw: resp.text }; }
  parsed._meta = { ref, render, model: MODEL, at: new Date().toISOString() };
  const json = JSON.stringify(parsed, null, 2);
  if (out) { fs.writeFileSync(out, json, "utf-8"); process.stderr.write(`wrote ${out}\n`); }
  else console.log(json);
  fs.rmSync(tmp, { recursive: true, force: true });
}

main().catch((e) => { console.error(e.message || e); process.exit(1); });
