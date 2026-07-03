/**
 * Brand-designer workflow demo — 3-panel "contrast puzzle" showing
 * Curify's design process for a virtual new-consumer / 大健康 brief:
 * 「东方植物草本风的茶饮包装」(Oriental botanical herbal tea packaging).
 *
 * PANEL 1 · 意图探索 - Moodboard
 *   Three different direction moodboards for the same brief.
 *   Each is one composite showing hero visual + 3-4 color swatches
 *   (with hex codes) + 2-3 material intent samples.
 *   → replaces Pinterest scraping.
 *
 * PANEL 2 · 变量微调 - Precision control
 *   Pick "禅意留白" direction. Show the same product at 10%, 20%, 30%
 *   of composition area. Demonstrates we can move ONE knob without
 *   re-rolling the whole board.
 *   → replaces "gacha regeneration".
 *
 * PANEL 3 · 落地延展 - 2D print-ready mockups
 *   Apply the chosen visual to coffee paper cup, kraft tote bag,
 *   lid-and-base (天地盖) gift box.
 *   → not just concept art — production-ready.
 *
 * Model: gemini-3-pro-image-preview (Chinese labels + high visual
 * fidelity across all 9 frames).
 */
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const { GoogleGenAI, Modality } = require("@google/genai");

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const KEY = process.env.GEMINI_API_KEY;
if (!KEY) { console.error("Missing GEMINI_API_KEY"); process.exit(1); }
const gemini = new GoogleGenAI({ apiKey: KEY });
const MODEL = process.env.GEMINI_IMAGE_EDIT_MODEL || "gemini-3-pro-image-preview";

const OUTDIR = path.join(process.cwd(), "raw/brand-design-portfolio");
fs.mkdirSync(OUTDIR, { recursive: true });

// Shared brand context for panels 2 & 3 so the visual is coherent
// once "禅意留白" is picked.
const BRAND = `
  Brand: 「青野」 (Qingye) — a premium Oriental herbal tea studio.
  Product: 白毫银针 (Bai Hao Yin Zhen / Silver Needle white tea) in a
    minimalist rice-paper wrapped cylindrical tea canister.
  Visual: single hand-painted botanical (silver-needle tea leaf sprig)
    + delicate gold seal 「青野」 stamp + faint 楷体 Chinese characters
    for the tea name.
  Palette: sage green #A7B39A, cream #F5EFE3, warm ink #2C2A25,
    gold-leaf #C0A15C.
`;

const VERSIONS = [
  // ── PANEL 1 · MOODBOARDS ────────────────────────────────────────
  {
    name: "panel1_moodboard_zen",
    out: "panel1_moodboard_zen.jpg",
    prompt: `Design moodboard poster, aspect ratio 4:5. Direction: 「禅意留白」 — minimalist Zen white-space Oriental tea packaging.

Layout the moodboard as a magazine spread:
- Top-left 60% area: hero mockup of the tea canister on a cream rice-paper backdrop. Very minimalist, single delicate silver-needle tea sprig hand-painted, small gold 「青野」 seal, extensive breathing room.
- Top-right: strip of 4 color swatches stacked vertically, each with a hex label — sage green #A7B39A, cream #F5EFE3, warm ink #2C2A25, gold-leaf #C0A15C.
- Bottom-left: two material samples arranged side by side — a torn corner of rough handmade rice paper, and a small pile of dried Silver Needle tea leaves.
- Bottom-right: small handwritten-serif label reading "MOODBOARD 01 · 禅意留白 · ZEN MINIMALIST".
- Top of the whole board: elegant serif Chinese title 「东方植物草本风 · 茶饮包装提案」 with an English subtitle "Oriental Botanical Herbal Tea Packaging".

Style: clean editorial magazine layout, warm cream background, high-quality art direction, no cluttered elements, printable design deck aesthetic. Small "Curify" wordmark bottom-right corner, muted.`,
  },
  {
    name: "panel1_moodboard_apothecary",
    out: "panel1_moodboard_apothecary.jpg",
    prompt: `Design moodboard poster, aspect ratio 4:5. Direction: 「本草古方」 — vintage traditional apothecary Oriental herbal tea packaging.

Layout the moodboard as a magazine spread:
- Top-left 60% area: hero mockup of the tea canister as a small corked amber glass apothecary jar with a hand-drawn kraft-paper label. The label carries a detailed botanical illustration of silver-needle tea sprig in the style of an old herbal atlas, with Latin taxonomy "Camellia sinensis · Bai Hao Yin Zhen" and small handwritten Chinese medicinal notes.
- Top-right: strip of 4 color swatches — parchment #E8DDC4, apothecary amber #A76B2A, herbal green #556B4A, ink black #1F1B15, each with hex label.
- Bottom-left: three material samples — kraft paper with wax seal, botanical pressed leaves, letterpress-printed tag.
- Bottom-right: handwritten-serif label "MOODBOARD 02 · 本草古方 · APOTHECARY VINTAGE".
- Top: same elegant serif Chinese title 「东方植物草本风 · 茶饮包装提案」.

Style: warm sepia magazine layout, rich apothecary feel, hand-drawn botanical illustration accents, old-atlas aesthetic. Small "Curify" wordmark bottom-right, muted.`,
  },
  {
    name: "panel1_moodboard_modern",
    out: "panel1_moodboard_modern.jpg",
    prompt: `Design moodboard poster, aspect ratio 4:5. Direction: 「东方摩登」 — modern Oriental contemporary herbal tea packaging.

Layout the moodboard as a magazine spread:
- Top-left 60% area: hero mockup of the tea canister as a bold matte-jade-green tall rectangular box with a single clean ink-brush stroke of a tea leaf and geometric sans-serif brand name 「青野」 aligned to a modernist grid.
- Top-right: strip of 4 color swatches — jade #2F4F3F, off-white #F0EDE6, brush ink #0F0E0C, warm accent orange #C96A3C, each with hex label.
- Bottom-left: three material samples — matte-lamination card, foil-stamped hot-stamped gold detail, embossed geometric pattern.
- Bottom-right: sans-serif label "MOODBOARD 03 · 东方摩登 · MODERN ORIENTAL".
- Top: same elegant serif Chinese title 「东方植物草本风 · 茶饮包装提案」.

Style: bold geometric grid layout, contemporary editorial feel, high-contrast palette, gallery-poster energy. Small "Curify" wordmark bottom-right, muted.`,
  },

  // ── PANEL 2 · VARIABLE TUNING (Zen direction locked) ────────────
  {
    name: "panel2_ratio_10",
    out: "panel2_ratio_10.jpg",
    prompt: `Product composition study, aspect ratio 4:5. ${BRAND}

Show the tea canister occupying approximately 10% of the composition area — small, delicate, isolated in a large field of cream rice-paper texture with subtle brush-ink botanical shadow. Extensive negative space. The canister sits in the lower-third area.

Add a small clean typographic label in the top-left corner reading "主体占比 · 10% · SUBJECT SCALE".

Style: minimalist Zen editorial photograph, printable art-direction reference. Small "Curify" wordmark bottom-right, muted.`,
  },
  {
    name: "panel2_ratio_20",
    out: "panel2_ratio_20.jpg",
    prompt: `Product composition study, aspect ratio 4:5. ${BRAND}

Show the SAME tea canister (same design, same palette, same botanical) at approximately 20% of the composition area — medium size, centered, with the cream rice-paper backdrop and subtle brush-ink botanical shadow around it.

Add the same top-left label "主体占比 · 20% · SUBJECT SCALE".

CONSTRAINTS: canister design, palette, and botanical illustration must be pixel-identical to the 10% version (same brand, same treatment) — ONLY the scale changes. Style: minimalist Zen editorial photograph. Small "Curify" wordmark bottom-right.`,
  },
  {
    name: "panel2_ratio_30",
    out: "panel2_ratio_30.jpg",
    prompt: `Product composition study, aspect ratio 4:5. ${BRAND}

Show the SAME tea canister at approximately 30% of the composition area — hero-shot size, prominent, centered, on the cream rice-paper backdrop with brush-ink botanical shadow.

Add the same top-left label "主体占比 · 30% · SUBJECT SCALE".

CONSTRAINTS: canister design, palette, and botanical illustration must be pixel-identical to the 10% and 20% versions — ONLY the scale changes. Style: minimalist Zen editorial photograph. Small "Curify" wordmark bottom-right.`,
  },

  // ── PANEL 3 · TEMPLATE MOCKUPS ──────────────────────────────────
  {
    name: "panel3_mockup_cup",
    out: "panel3_mockup_cup.jpg",
    prompt: `Product mockup, aspect ratio 4:5. ${BRAND}

Apply the 「青野」 brand visual system to a double-wall coffee/tea paper cup — 12oz size, matte kraft-cream base, with the sage-green wrap featuring the hand-painted silver-needle tea sprig, gold 「青野」 seal, and small vertical 「白毫银针」 Chinese label. Slip-sleeve style band around the middle. Studio product photograph on a soft neutral surface.

Add a small clean top-left label "延展 01 · 双层纸杯 · PAPER CUP".

Style: crisp e-commerce mockup, sharp focus on the cup, subtle shadow. Small "Curify" wordmark bottom-right.`,
  },
  {
    name: "panel3_mockup_bag",
    out: "panel3_mockup_bag.jpg",
    prompt: `Product mockup, aspect ratio 4:5. ${BRAND}

Apply the 「青野」 brand visual system to a kraft paper tote bag — natural kraft brown-cream color, standard shopping bag size with cotton handles, front face carrying the sage-green painted botanical, gold 「青野」 seal, and a small tagline 「东方草本 · 一叶一芽」 below in warm ink calligraphy. The bag is standing upright on a neutral studio surface.

Add a small clean top-left label "延展 02 · 手提袋 · TOTE BAG".

Style: crisp e-commerce mockup, natural studio light, printable production-ready look. Small "Curify" wordmark bottom-right.`,
  },
  {
    name: "panel3_mockup_box",
    out: "panel3_mockup_box.jpg",
    prompt: `Product mockup, aspect ratio 4:5. ${BRAND}

Apply the 「青野」 brand visual system to a lid-and-base (天地盖) rigid gift box — cream matte finish, elegant proportions, the lid featuring the hand-painted silver-needle tea sprig botanical + gold 「青野」 seal + embossed geometric border. The lid is slightly lifted to reveal the sage-green interior lining and the tea canister inside. Studio photograph on a warm surface.

Add a small clean top-left label "延展 03 · 天地盖礼盒 · GIFT BOX".

Style: premium e-commerce mockup, printable production-ready look, subtle depth. Small "Curify" wordmark bottom-right.`,
  },
];

(async () => {
  for (const v of VERSIONS) {
    const outPath = path.join(OUTDIR, v.out);
    console.log(`\n=== ${v.name} → ${v.out} ===`);
    console.log(`Calling ${MODEL}...`);
    const t0 = Date.now();
    try {
      const res = await gemini.models.generateContent({
        model: MODEL,
        contents: v.prompt,
        config: { responseModalities: [Modality.IMAGE] },
      });
      const parts = res?.candidates?.[0]?.content?.parts ?? [];
      let saved = 0;
      for (const part of parts) {
        if (part?.inlineData?.data) {
          fs.writeFileSync(outPath, Buffer.from(part.inlineData.data, "base64"));
          console.log(`  ✓ ${outPath}`);
          saved++;
        } else if (part?.text) {
          console.log(`  (text): ${part.text.slice(0, 200)}`);
        }
      }
      console.log(`  done in ${((Date.now() - t0) / 1000).toFixed(1)}s, saved ${saved}`);
    } catch (err) {
      console.log(`  FAILED: ${err.message}`);
    }
  }
})().catch((err) => { console.error("Batch failed:", err); process.exit(1); });
