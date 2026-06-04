#!/usr/bin/env node
/**
 * Style-exploration pass for the 张总 illustrator client.
 *
 * Generates 4 candidates of the SAME sketch (the bronze ding + long-eared
 * mascot fusion) so the styles can be compared apples-to-apples. Each
 * candidate borrows the *aesthetic vocabulary* (palette, decorative motifs,
 * border style) of a proven Curify template — but NOT its layout. Hero
 * subject fills the canvas, background is decorative but unannotated, no
 * text labels, no MBTI badges, no modules, no timeline, no callouts.
 *
 * Aesthetic sources:
 *   A) heritage-mineral  — template-intangible-heritage palette
 *                          (ancient-book mineral pigments + decorative border)
 *   B) ink-watercolor    — template-chinese-classic-character-mbti aesthetic
 *                          (ink-and-watercolor on aged silk + lattice border)
 *   C) qcute-watercolor  — template-princess-pearl-mbti-character-card aesthetic
 *                          (软萌Q版 watercolor + 国风 cloud/border)
 *   D) watercolor-sketch — template-national-culture-history-infographic aesthetic
 *                          (watercolor + sketch hybrid, warm muted tones, border)
 *
 * Run from curify-frontend root:
 *   node scripts/gen_client_illustrator_styles.cjs
 *   node scripts/gen_client_illustrator_styles.cjs --only=qcute-watercolor
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
const OUT       = path.join(RAW, "curify-preview-styles");
const HAND_DRAW = path.join(RAW, "hand-draw.jpg");
const LOGO      = path.join(ROOT, "public", "curify_logo_1024.png");

fs.mkdirSync(OUT, { recursive: true });

// ── Shared subject (so all 4 styles render the same thing) ───────────────────

const SUBJECT_BLOCK = `
Subject — reference image top-row third sketch from the left: the long-eared mascot fused into a square four-legged bronze ritual ding (四足方鼎). Two tall tufted ears rise above the rim of the vessel, the front face of the ding bears the taotie mask (饕餮纹), the mascot's body sits inside the vessel, and the long curving tail drapes from the back over the side. Preserve this exact pose / topology / which-creature-is-fused-with-which-vessel relationship from the sketch. The mascot's body shows clean discrete fur shapes (no scribble noise); the eyes are round and innocent.

Authentic bronze ornament patterns required on every bronze surface: precise Shang/Zhou taotie mask (饕餮纹), thunder pattern (雷纹), kui-dragon pattern (夔龙纹). Each pattern must be a recognizable historical motif drawn cleanly — NO random AI scribble lines, NO nonsense fake-glyph filler.
`.trim();

// ── Strict no-scaffolding rules (every style inherits these) ─────────────────

const NO_SCAFFOLDING = `
ABSOLUTELY NO text in the image — no titles, no labels, no annotations, no callouts, no Chinese characters, no English captions, no MBTI badges, no module panels, no timeline strips, no information boxes. Just the hero subject on its background. The hero subject fills approximately 70% of the canvas. The background is decorative but unannotated. Square 1:1 aspect ratio, 4K resolution, direct image generation.
`.trim();

// ── 4 style variants — aesthetic only, no template scaffolding ───────────────

const STYLES = [
  {
    label: "heritage-mineral",
    aesthetic: "ancient-book mineral-pigment Chinese cultural-heritage illustration",
    prompt: `
Style: Ancient-book mineral-pigment illustration in the tradition of Chinese 古籍图谱 / 故宫文物图录. The look is exquisite, retro, and reverent — like a hand-painted plate from a Qing-dynasty bronze-catalog folio.

Palette: traditional architectural-painting / ancient-book mineral pigments — malachite green (石绿), azurite blue (石青), cinnabar red (朱砂), mineral ochre, ink black, all on warm aged silk-paper background (绢本 cream).

Background: warm aged silk-paper field with a decorative classical Chinese border frame (回纹 + 雷纹 corner motifs), drawn cleanly. Faint scattered cloud-and-thunder pattern (云雷纹) wash in the background, at low opacity, drawn as discrete spirals not noise.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
  },

  {
    label: "ink-watercolor",
    aesthetic: "exquisite Chinese ink-and-watercolor on aged silk paper with lattice border",
    prompt: `
Style: Elegant traditional Chinese ink-and-watercolor (水墨彩绘) illustration. The look matches a premium ink-painting plate — delicate soft ink wash, mineral pigment touches, fine brushwork.

Palette: ink black, soft mineral green, soft mineral red, light gold, on off-white aged silk-paper background (素绢 cream).

Background: off-white silk paper with a traditional Chinese lattice border (回字纹 / 万字纹) drawn cleanly around the edges. A soft watercolor wash of bronze-green and gold suggests atmosphere without competing with the subject. Faint distant 云雷纹 spirals at low opacity.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
  },

  {
    label: "qcute-watercolor",
    aesthetic: "软萌Q版水彩 cute blind-box illustration with 国风 decoration",
    prompt: `
Style: 软萌Q版 (soft cute chibi proportions) watercolor illustration — the kind of art used on collectible blind-box (盲盒) packaging, fridge magnets, and 文创 product gift boxes. Large head, large innocent eyes, small body, charming and approachable. Soft watercolor texture but with clean confident outlines.

Palette: aged bronze green, warm bronze gold, pale rose, ivory, ink black outline, on soft pastel cream background.

Background: pastel cream field with 国风 decorative elements scattered around the subject — small 祥云 (auspicious cloud) shapes, small floral 缠枝 vines, faint 雷纹 spiral motifs, a soft circular halo behind the subject. A delicate traditional border frames the edges. Everything decorative is drawn cleanly as discrete shapes, not painterly noise.

The bronze ding still bears a recognizable taotie 饕餮纹 on its front face and 雷纹 on its body — even in Q-cute style, the patterns must remain authentic historical motifs, not random scribbles.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
  },

  {
    label: "watercolor-sketch",
    aesthetic: "clean watercolor + sketch hybrid in warm muted earth tones with decorative border",
    prompt: `
Style: Clean detailed watercolor-and-sketch hybrid illustration — confident pen-line outlines plus soft watercolor washes inside. The look matches a high-end educational publishing illustration or a cultural-heritage gift-book plate.

Palette: warm muted earth tones — terracotta, jade green, ochre yellow, indigo accent, ink black sketch outline, on aged cream paper background.

Background: aged cream paper with a decorative classical Chinese border (回纹 + 雷纹 corner motifs) framing the entire canvas. Faint watercolor wash of warm sepia / terracotta as atmosphere. Subtle 云雷纹 spirals at low opacity scattered across the field.

${SUBJECT_BLOCK}

${NO_SCAFFOLDING}
`.trim(),
  },
];

// ── Gemini call (image-conditioned) ──────────────────────────────────────────

const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function geminiImg({ structureRef, prompt, model }) {
  const parts = [
    { inlineData: { mimeType: "image/jpeg", data: fs.readFileSync(structureRef).toString("base64") } },
    { text: prompt + "\n\nReference image 1 is the structural source — use the requested sketch's pose, topology, and which-creature-is-fused-with-which-vessel relationship. Do NOT copy its hand-drawn pencil aesthetic; render in the finished style described above." },
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
  console.log("out dir:  ", OUT);
  console.log("styles:   ", STYLES.map((s) => s.label).join(", "));

  const onlyArg = process.argv.find((a) => a.startsWith("--only="));
  const only = onlyArg ? new Set(onlyArg.split("=")[1].split(",")) : null;

  for (const style of STYLES) {
    if (only && !only.has(style.label)) continue;
    console.log(`\n=== ${style.label} — ${style.aesthetic} ===`);
    const t0 = Date.now();
    let buf;
    try {
      buf = await geminiImg({ structureRef: HAND_DRAW, prompt: style.prompt, model });
    } catch (e) {
      console.error(`  ❌ ${style.label}: ${e.message}`);
      continue;
    }
    const rawPath  = path.join(OUT, `${style.label}.raw.png`);
    const finalPath = path.join(OUT, `${style.label}.png`);
    fs.writeFileSync(rawPath, buf);
    try {
      applyCornerWatermark(rawPath, finalPath, { logoPath: LOGO, logoPct: 0.14, padding: 20 });
    } catch (e) {
      console.error(`  ⚠️  watermark failed (${e.message}); raw kept at ${rawPath}`);
      continue;
    }
    const dtSec = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`  ✓ ${finalPath} (${dtSec}s)`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
