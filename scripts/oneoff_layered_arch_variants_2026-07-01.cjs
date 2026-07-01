/**
 * Stress-test variants of the layered-systems-architecture prompt.
 * Runs 3 renders in one pass to prove the layout generalizes before
 * we register the template in nano_templates.json.
 *
 *   02 — 3 layers, all with 3 items (short stack)
 *   03 — 7 layers, 2-3 items each (tall stack)
 *   04 — 5 layers, IMBALANCED item counts (2, 5, 2, 4, 3)
 *
 * Same base_prompt as 01, only stack_title / subtitle / layers_block
 * change per variant.
 *
 * Model: gemini-3-pro-image-preview (many small legible labels).
 *
 * Outputs under raw/tech-stack-diagram/.
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

function buildPrompt({ stack_title, stack_subtitle, layers_block, N }) {
  return `(Layered Systems Architecture Poster Designer) You are a senior technical illustrator producing reference-grade layered-architecture diagrams for engineering documentation, tech blogs, and platform onboarding decks. Generate a portrait 4:5 poster.

TITLE
- Top of the poster, centered:
  - Main title: "${stack_title}" — large, bold, dark charcoal sans-serif (Inter / Söhne / SF Pro Display feel).
  - Subtitle underneath in muted gray, smaller: "${stack_subtitle}"

LAYERS
- Render exactly ${N} horizontal rectangular panels stacked top-to-bottom, evenly spaced, from top (L1) to bottom (L${N}). Each panel represents one layer.
- Between each consecutive pair of layers, draw a single centered downward arrow (thin vertical line + solid arrowhead) so the flow reads top→bottom.
- Panel content (verbatim, use the exact text below — do NOT invent extra items, do NOT drop items):
${layers_block}

PANEL DESIGN (apply to every layer)
- Left side of the panel: a compact numbered chip (small square or circle badge, e.g. "L1", "L2") in a solid accent color, followed by the layer name in bold sans-serif.
- Right side (or a horizontal row below the name if space is tight): the sub-items rendered as small rounded-rectangle pills. Each pill has a thin outline (~1.5px), a very subtle fill (light warm gray or a pale tint of the layer's accent), and the item text in clean sans-serif or monospace (JetBrains Mono / IBM Plex Mono feel). Pills spaced evenly. If a layer has 5+ items, wrap into two rows.
- Panel outline: 1-2px charcoal, rounded corners (~8px radius). No drop shadows.
- Give each layer panel roughly equal vertical space so the stack reads as evenly-weighted layers — panels with fewer items should NOT shrink; balance the whitespace inside them.

STYLE
- Flat vector illustration. Engineering-diagram aesthetic.
- NO cartoon characters, NO people, NO decorative avatars, NO gradient backgrounds, NO 3D depth, NO glowing effects.
- Palette: warm-white background (#F9FAF8 range). Charcoal (#1F2937) for text and outlines. One or two muted accent colors from a professional developer palette (deep indigo #4F46E5, teal #0D9488, warm amber #D97706, coral #E11D48, violet #7C3AED, slate #475569, emerald #059669) — one accent per layer, cycled if there are more layers than accent choices.
- Consistent stroke weight throughout.
- Balanced whitespace — never crowded.

WATERMARK
- Small "Curify" wordmark in the bottom-right corner, muted gray, understated.

CONSTRAINTS
- Aspect ratio: portrait 4:5.
- Text must be legible and spelled EXACTLY as given. Preserve punctuation and spacing inside item names.
- Do NOT add layers or sub-items the input didn't specify.
- Do NOT add narrative captions, footnotes, or icons inside pills.

Output the final diagram directly.`;
}

const VERSIONS = [
  {
    name: "02_kubernetes_short",
    out: "02_kubernetes_short.jpg",
    stack_title: "Kubernetes Deployment Stack",
    stack_subtitle: "The three layers between an incoming request and durable state",
    layers_block: `  L1 — Ingress: Route, TLS, LoadBalancer
  L2 — Workload: Pod, Replica, Rollout
  L3 — Storage: PVC, Volume, Backup`,
    N: 3,
  },
  {
    name: "03_llm_inference_tall",
    out: "03_llm_inference_tall.jpg",
    stack_title: "LLM Inference Stack",
    stack_subtitle: "From client request to GPU tensor cores in seven layers",
    layers_block: `  L1 — Client: REST, WebSocket, Streaming
  L2 — Gateway: Auth, Rate Limit, Routing
  L3 — Orchestrator: Batching, Prompt Cache, Fallback
  L4 — Router: A/B, Cost, Quota
  L5 — Inference: Tokenizer, KV Cache, Sampler
  L6 — Runtime: vLLM, TensorRT, Triton
  L7 — Hardware: GPU, HBM, NVLink`,
    N: 7,
  },
  {
    name: "04_data_pipeline_uneven",
    out: "04_data_pipeline_uneven.jpg",
    stack_title: "Modern Data Pipeline",
    stack_subtitle: "Five layers, uneven density — same top-to-bottom flow",
    layers_block: `  L1 — Ingest: Kafka, Kinesis
  L2 — Storage: S3, Delta Lake, Iceberg, Parquet, Snowflake
  L3 — Compute: Spark, Flink
  L4 — Transform: dbt, Airflow, Dagster, Prefect
  L5 — Serve: BI, ML, API`,
    N: 5,
  },
];

(async () => {
  for (const v of VERSIONS) {
    const prompt = buildPrompt(v);
    const outPath = path.join(OUTDIR, v.out);
    console.log(`\n=== ${v.name} (${v.N} layers) → ${v.out} ===`);
    console.log(`Calling ${MODEL}...`);
    const t0 = Date.now();
    const res = await gemini.models.generateContent({
      model: MODEL,
      contents: prompt,
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
  }
})().catch((err) => { console.error("Render failed:", err); process.exit(1); });
