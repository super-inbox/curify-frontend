/**
 * One-off: England "Golden Generation 2006 vs 2026" comparison poster.
 * Our own asset (regenerated concept — the source MAD FOOTBALL image is a
 * competitor watermark we won't repost). Maps to
 * template-generation-comparison-infographic (allow_generation, text-only).
 *
 * Design choices:
 *  - Stylized illustration, NOT photorealistic real faces (avoids likeness +
 *    uncanny issues; genuinely "ours").
 *  - Tournament OUTCOMES not contestable FIFA-ranking numbers for 2006
 *    (2026 #4 is well-supported; 2006 ranking is ambiguous 8th-10th).
 *  - Minimal, high-value text to reduce AI text-garble.
 *  - NO Curify watermark in prompt — sync_nano_inspiration applies it.
 *
 * Output: raw/england-generation-2026-07-30/<filename>.jpg
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI } = require("@google/genai");

// key lives in curify-studio/curify_background/.env
dotenv.config({ path: "/Users/qqwjq/curify-studio/curify_background/.env" });
const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/england-generation-2026-07-30");
fs.mkdirSync(OUTDIR, { recursive: true });
const OUT = path.join(OUTDIR, "template-generation-comparison-infographic-england-golden-generation-2006-vs-2026.jpg");

const PROMPT = `Create a vertical two-panel football comparison infographic poster, sports-magazine cover aesthetic, 3:4 portrait.

Bold title bar across the very top: "ENGLAND — THEN vs NOW".

TOP PANEL — header "ENGLAND 2006 · THE GOLDEN GENERATION":
- A stylized, semi-realistic illustration of a classic England national football team lined up in the white home shirt with navy shorts, confident poses, stadium crowd behind. Use GENERIC stylized player likenesses (do NOT depict real identifiable faces).
- A clean text row of key names: "ROONEY · BECKHAM · GERRARD · LAMPARD · TERRY · FERDINAND".
- A subtitle strip reading: "World-class names — Quarter-final exit · 0 trophies".

BOTTOM PANEL — header "ENGLAND 2026 · THE NEW ERA":
- A stylized, semi-realistic illustration of a modern England national football team in the white home shirt, dynamic poses, bright stadium. GENERIC stylized player likenesses (no real faces).
- A clean text row of key names: "KANE · BELLINGHAM · SAKA · FODEN · RICE".
- A subtitle strip reading: "FIFA World #4 · World Cup Semi-finalists".

Include a small Three Lions style crest motif on each panel header. Red, white and navy England color scheme. Bold clean modern typography, high-contrast and perfectly legible; ensure ALL text is spelled correctly. Crisp poster print quality.`;

(async () => {
  console.log("Generating England comparison poster…");
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: PROMPT }] }],
  });
  const parts = res?.candidates?.[0]?.content?.parts || [];
  let wrote = false;
  for (const part of parts) {
    if (part?.inlineData?.data) {
      const data = typeof part.inlineData.data === "string"
        ? Buffer.from(part.inlineData.data, "base64")
        : part.inlineData.data;
      fs.writeFileSync(OUT, data);
      wrote = true;
      console.log("✓ wrote", OUT, `(${(data.length/1024).toFixed(0)} KB)`);
    } else if (part?.text) {
      console.log("model text:", part.text.slice(0, 200));
    }
  }
  if (!wrote) { console.error("✗ no image returned"); process.exit(1); }
})().catch(e => { console.error("ERR", e.message); process.exit(1); });
