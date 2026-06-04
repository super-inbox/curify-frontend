#!/usr/bin/env node
/**
 * One-off pitch demo for the 张总 illustrator client.
 *
 * Renders 2 finished illustrations from raw/client-illustrator/hand-draw.jpg
 * (the bronze-relic + long-eared mascot fusion series), demonstrating Curify's
 * "industrial-grade" advantage over Doubao's generic AI on:
 *   - clean authentic Shang/Zhou bronze ornament patterns (饕餮纹/雷纹), no AI slop
 *   - consistent recurring mascot character across multiple pieces
 *   - crisp vector-ready linework (no chromatic aberration, no blurry shading)
 *
 * Pipeline:
 *   1. Pass the full hand-draw.jpg as the structural reference
 *   2. Pass the green-ding Doubao output as the character/palette reference
 *   3. Prompt Gemini 3 Pro Image to render the requested sketch with the
 *      shared style + bronze pattern fidelity constraints
 *   4. Watermark with the Curify logo (corner)
 *   5. Write to raw/client-illustrator/curify-preview/
 *
 * Run from curify-frontend root:
 *   node scripts/gen_client_illustrator_pitch.cjs
 *
 * Requires GEMINI_API_KEY in .env.local.
 */

const fs   = require("fs");
const path = require("path");

try { require("dotenv").config({ path: ".env.local" }); } catch {}

const { GoogleGenAI, Modality } = require("@google/genai");
const { applyCornerWatermark } = require("./lib/watermark.cjs");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env.local");
  process.exit(1);
}

const ROOT      = path.resolve(__dirname, "..");
const RAW       = path.join(ROOT, "raw", "client-illustrator");
const OUT       = path.join(RAW, "curify-preview");
const HAND_DRAW = path.join(RAW, "hand-draw.jpg");
const STYLE_REF = path.join(RAW, "Weixin Image_20260604051220_22_3499.png"); // green ding (cleanest Doubao output for palette/character ref)
const LOGO      = path.join(ROOT, "public", "curify_logo_1024.png");

fs.mkdirSync(OUT, { recursive: true });

// ── Style constraints (shared across all pieces for consistency) ─────────────

const SHARED_STYLE = `
Render as a finished illustration in the style of a vintage Chinese hand-pulled woodblock print:

- Bold black ink outlines with subtle hand-drawn wobble; slightly cracked / aged paper texture
- Limited unified color palette across the entire series: aged paper background (faded turquoise-green OR warm rust-orange) + ink black + ONE warm metallic accent (oxidized bronze, gold leaf, or ochre-red)
- Background filled with hand-drawn traditional Chinese cloud-and-thunder pattern (云雷纹), faded and worn — drawn as clean continuous spirals, not random noise
- Authentic Shang / Zhou / Han dynasty bronze ornament patterns on every bronze surface: precise taotie mask (饕餮纹), thunder pattern (雷纹), kui-dragon pattern (夔龙纹). Each pattern must be a real recognizable motif. ABSOLUTELY NO random AI scribble lines, NO nonsense fake-glyph text, NO blurred wormy filler.
- Crisp consistent line weight, vector-ready clean edges, NO chromatic aberration / no rainbow fringing, NO blurry watercolor shading

Recurring mascot character (identical across every piece in this series):
- A long-eared creature, body roughly cat-or-rabbit shaped
- Two prominent tall pointed ears (rabbit-fox hybrid silhouette), tufted at the tips
- Round innocent eyes with clean simple circular pupils
- Small triangular nose, simple short whisker lines
- Soft fur rendered as short hatched ink strokes
- Long curving tail with a darker tip

The mascot must be identical in body proportions, fur treatment, ear shape, and eye proportions in every piece — as if drawn by the same illustrator on the same day.
`.trim();

const PIECES = [
  {
    label: "bronze-ding",
    instruction: `Render ONLY the following sketch from the first reference image:

The bronze square ding (四足方鼎) — top row, third sketch from the left. A long-eared mascot is fused into a square four-legged bronze ritual vessel: the front face of the vessel forms a stylized taotie mask with two large round eyes peeking through, the mascot's two tall pointed ears rise above the rim, the body has four short stocky legs, and a long curving tail drapes from the back of the vessel over the side.

Render this on a faded turquoise-green aged paper background.`,
  },
  {
    label: "bronze-pig-zun",
    instruction: `Render ONLY the following sketch from the first reference image:

The bronze pig / boar zun vessel (青铜猪尊) — middle row, right side. A stocky boar-shaped bronze ritual vessel in profile, body covered in dense bronze ornament patterns; the long-eared mascot is fused on top of / inside the boar's back, with the mascot's two tall pointed ears rising above the boar's spine and its head peeking forward.

Render this on a warm rust-orange aged paper background to differentiate it from the green ding, while keeping the same mascot character and the same line weight / pattern style.`,
  },
  {
    label: "elephant-zun",
    instruction: `Render ONLY the following sketch from the first reference image:

The bronze elephant zun vessel (青铜象尊) — middle row, left side. An elephant-shaped bronze ritual vessel in profile with trunk curling forward, body covered in dense Shang-dynasty bronze ornament panels (taotie + thunder pattern); the long-eared mascot is fused on top of the elephant's back like a small rider, the mascot's two tall pointed ears rising above the elephant's spine.

Render this on a faded turquoise-green aged paper background to match the ding piece for the side-by-side comparison.`,
  },
];

// ── Gemini call ──────────────────────────────────────────────────────────────

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiImg2img({ structureRef, styleRef, prompt, model }) {
  const parts = [
    { inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(structureRef).toString("base64") } },
    { inlineData: { mimeType: "image/png",  data: fs.readFileSync(styleRef).toString("base64") } },
    { text: prompt + "\n\nReference image 1 is the structural source (use the requested sketch's pose / topology / which creature is fused with which vessel). Reference image 2 is the palette / line-quality / mascot-character source — match its woodblock aesthetic and taotie-pattern fidelity, do NOT copy its specific composition. Square 1:1 aspect ratio." },
  ];
  const response = await gemini.models.generateContent({
    model,
    contents: [{ role: "user", parts }],
    generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
  });
  const respParts = response?.candidates?.[0]?.content?.parts || response?.parts || [];
  for (const p of respParts) {
    if (p?.inlineData?.data) return Buffer.from(p.inlineData.data, "base64");
  }
  const txt = respParts.map((p) => p.text || "").join("\n");
  throw new Error("Gemini returned no image. Text: " + (txt.slice(0, 300) || "[none]"));
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const model = process.env.MODEL || "gemini-3-pro-image-preview";
  console.log("model:    ", model);
  console.log("structure:", HAND_DRAW);
  console.log("style ref:", STYLE_REF);
  console.log("out dir:  ", OUT);
  console.log("pieces:   ", PIECES.map((p) => p.label).join(", "));

  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.split("=")[1].split(",")) : null;

  for (const piece of PIECES) {
    if (only && !only.has(piece.label)) continue;
    console.log(`\n=== ${piece.label} ===`);
    const fullPrompt = `${piece.instruction}\n\n${SHARED_STYLE}`;
    const t0 = Date.now();
    let buf;
    try {
      buf = await geminiImg2img({
        structureRef: HAND_DRAW,
        styleRef:     STYLE_REF,
        prompt:       fullPrompt,
        model,
      });
    } catch (e) {
      console.error(`  ❌ ${piece.label}: ${e.message}`);
      continue;
    }
    const rawPath  = path.join(OUT, `${piece.label}.raw.png`);
    const finalPath = path.join(OUT, `${piece.label}.png`);
    fs.writeFileSync(rawPath, buf);
    try {
      applyCornerWatermark(rawPath, finalPath, {
        logoPath: LOGO,
        logoPct:  0.16,
        padding:  24,
      });
    } catch (e) {
      console.error(`  ⚠️  watermark failed (${e.message}); raw image kept at ${rawPath}`);
      continue;
    }
    const dtSec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`  ✓ ${finalPath} (${dtSec}s)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
