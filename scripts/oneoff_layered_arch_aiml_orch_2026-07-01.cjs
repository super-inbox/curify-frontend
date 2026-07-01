/**
 * One-off render of a layered systems-architecture poster.
 *
 * Purpose: prototype the `template-layered-systems-architecture` template
 * before registering it. The prompt below is the DRAFT `base_prompt` with
 * {stack_title}, {stack_subtitle}, and {layers_block} substituted for
 * this sample: AI/ML Job Orchestration, 5 layers.
 *
 * If the render looks right, promote the prompt into
 * public/data/nano_templates.json as a new template. If not, iterate
 * here first — cheap.
 *
 * Model: gemini-3-pro-image-preview (many small legible labels; pro
 * handles text much better than flash — critical for this layout).
 *
 * Output: raw/tech-stack-diagram/01_aiml_orchestration.jpg
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

const OUTDIR = path.join(process.cwd(), "raw/tech-stack-diagram");
fs.mkdirSync(OUTDIR, { recursive: true });

// ---------- sample substitutions ----------
const STACK_TITLE = "AI/ML Job Orchestration";
const STACK_SUBTITLE = "The 5 layers behind every production model-serving platform";
const LAYERS_BLOCK = `
  L1 — API: Submit, Cancel, Status
  L2 — Execution: Queue, Worker, Sync/Async
  L3 — Reliability: Retry, Checkpoint, Failover
  L4 — Resources: CPU, GPU, Memory, Model Loading
  L5 — Scalability: Storage, Horizontal Scaling, Monitoring, Autoscaling
`.trim();
const N = 5;

// ---------- DRAFT base_prompt (with substitutions inline for the one-off) ----------
const PROMPT = `(Layered Systems Architecture Poster Designer) You are a senior technical illustrator producing reference-grade layered-architecture diagrams for engineering documentation, tech blogs, and platform onboarding decks. Generate a portrait 4:5 poster.

TITLE
- Top of the poster, centered:
  - Main title: "${STACK_TITLE}" — large, bold, dark charcoal sans-serif (Inter / Söhne / SF Pro Display feel).
  - Subtitle underneath in muted gray, smaller: "${STACK_SUBTITLE}"

LAYERS
- Render exactly ${N} horizontal rectangular panels stacked top-to-bottom, evenly spaced, from top (L1) to bottom (L${N}). Each panel represents one layer.
- Between each consecutive pair of layers, draw a single centered downward arrow (thin vertical line + solid arrowhead) so the flow reads top→bottom.
- Panel content (verbatim, use the exact text below — do NOT invent extra items, do NOT drop items):
${LAYERS_BLOCK}

PANEL DESIGN (apply to every layer)
- Left side of the panel: a compact numbered chip (small square or circle badge, e.g. "L1", "L2") in a solid accent color, followed by the layer name in bold sans-serif.
- Right side (or a horizontal row below the name if space is tight): the sub-items rendered as small rounded-rectangle pills. Each pill has a thin outline (~1.5px), a very subtle fill (light warm gray or a pale tint of the layer's accent), and the item text in clean sans-serif or monospace (JetBrains Mono / IBM Plex Mono feel). Pills spaced evenly.
- Panel outline: 1-2px charcoal, rounded corners (~8px radius). No drop shadows.
- Give each layer panel roughly equal vertical space so the stack reads as evenly-weighted layers.

STYLE
- Flat vector illustration. Engineering-diagram aesthetic.
- NO cartoon characters, NO people, NO decorative avatars, NO gradient backgrounds, NO 3D depth, NO glowing effects.
- Palette: warm-white background (#F9FAF8 range). Charcoal (#1F2937) for text and outlines. One or two muted accent colors from a professional developer palette (deep indigo #4F46E5, teal #0D9488, warm amber #D97706, coral #E11D48) used sparingly on the layer number chips and pill accents — one accent per layer is fine, or a single accent across.
- Consistent stroke weight throughout.
- Balanced whitespace — never crowded.

WATERMARK
- Small "Curify" wordmark in the bottom-right corner, muted gray, understated.

CONSTRAINTS
- Aspect ratio: portrait 4:5.
- Text must be legible and spelled EXACTLY as given. Preserve the "/" in "Sync/Async" and the space in "Model Loading" / "Horizontal Scaling" / "Model Loading".
- Do NOT add layers or sub-items the input didn't specify.
- Do NOT add narrative captions, footnotes, or icons inside pills.

Output the final diagram directly.`;

(async () => {
  console.log(`Calling ${MODEL} — AI/ML orchestration 5-layer poster...`);
  const t0 = Date.now();
  const res = await gemini.models.generateContent({
    model: MODEL,
    contents: PROMPT,
    config: { responseModalities: [Modality.IMAGE] },
  });
  const parts = res?.candidates?.[0]?.content?.parts ?? [];
  let saved = 0;
  for (const part of parts) {
    if (part?.inlineData?.data) {
      const out = path.join(OUTDIR, "01_aiml_orchestration.jpg");
      fs.writeFileSync(out, Buffer.from(part.inlineData.data, "base64"));
      console.log(`  ✓ ${out}`);
      saved++;
    } else if (part?.text) {
      console.log(`  (text): ${part.text.slice(0, 200)}`);
    }
  }
  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s. Saved ${saved}.`);
})().catch((err) => { console.error("Render failed:", err); process.exit(1); });
