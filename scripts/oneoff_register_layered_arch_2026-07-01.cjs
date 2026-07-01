/**
 * One-off registration for template-layered-systems-architecture.
 * Adds:
 *  - 1 template entry into public/data/nano_templates.json
 *  - 4 inspiration entries into public/data/nano_inspiration.json
 *
 * Idempotent: existing entries with the same ids are replaced.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const T_PATH = path.join(ROOT, "public/data/nano_templates.json");
const I_PATH = path.join(ROOT, "public/data/nano_inspiration.json");

const TEMPLATE_ID = "template-layered-systems-architecture";

// ── Template ────────────────────────────────────────────────────────────────

const BASE_PROMPT = `(Layered Systems Architecture Poster Designer) You are a senior technical illustrator producing reference-grade layered-architecture diagrams for engineering documentation, tech blogs, and platform onboarding decks. Based on the user inputs [{stack_title}], [{stack_subtitle}], and [{layers_block}] with N layers, generate a portrait 4:5 poster.

TITLE
- Top of the poster, centered:
  - Main title: "{stack_title}" — large, bold, dark charcoal sans-serif (Inter / Söhne / SF Pro Display feel).
  - Subtitle underneath in muted gray, smaller: "{stack_subtitle}"

LAYERS
- Render exactly N horizontal rectangular panels stacked top-to-bottom, evenly spaced, from top (L1) to bottom. Each panel represents one layer.
- Between each consecutive pair of layers, draw a single centered downward arrow (thin vertical line + solid arrowhead) so the flow reads top→bottom.
- Panel content is provided as {layers_block}: one line per layer in the form "Lk — Name: item, item, item". Use the exact text — do NOT invent extra items, do NOT drop items.

PANEL DESIGN (apply to every layer)
- Left side: a compact numbered chip (small square badge, e.g. "L1", "L2") in a solid accent color, followed by the layer name in bold sans-serif.
- Right side: sub-items as small rounded-rectangle pills. Each pill has a thin outline (~1.5px), a subtle fill (light warm gray or a pale tint of the layer's accent), and item text in clean sans-serif or monospace (JetBrains Mono / IBM Plex Mono feel). Pills spaced evenly. If a layer has 5+ items, wrap into two rows.
- Panel outline: 1-2px charcoal, rounded corners (~8px). No drop shadows.
- Equal vertical space per layer — panels with fewer items should NOT shrink; balance the whitespace inside them.

STYLE
- Flat vector illustration, engineering-diagram aesthetic.
- NO cartoon characters, NO people, NO decorative avatars, NO gradient backgrounds, NO 3D depth, NO glowing effects.
- Palette: warm-white background (#F9FAF8 range). Charcoal (#1F2937) text and outlines. Muted accent colors from a professional developer palette (deep indigo #4F46E5, teal #0D9488, warm amber #D97706, coral #E11D48, violet #7C3AED, slate #475569, emerald #059669) — one accent per layer, cycled if there are more layers than accents.
- Consistent stroke weight. Balanced whitespace.

WATERMARK
- Small "Curify" wordmark in the bottom-right corner, muted gray, understated.

CONSTRAINTS
- Aspect ratio: portrait 4:5.
- Text must be legible and spelled EXACTLY as given. Preserve punctuation and spacing inside item names.
- Do NOT add layers or sub-items the input didn't specify. Do NOT add narrative captions, footnotes, or icons inside pills.

Output the final diagram directly.`;

const TEMPLATE = {
  id: TEMPLATE_ID,
  locales: {
    en: {
      base_prompt: BASE_PROMPT,
      parameters: [
        {
          name: "stack_title",
          label: "Stack title",
          type: "text",
          placeholder: "AI/ML Job Orchestration",
        },
        {
          name: "stack_subtitle",
          label: "Subtitle (short tagline, optional)",
          type: "text",
          placeholder: "The 5 layers behind every production model-serving platform",
        },
        {
          name: "layers_block",
          label: "Layers (one per line: Lk — Name: item, item, item)",
          type: "textarea",
          placeholder:
            "L1 — API: Submit, Cancel, Status\nL2 — Execution: Queue, Worker, Sync/Async\nL3 — Reliability: Retry, Checkpoint, Failover\nL4 — Resources: CPU, GPU, Memory, Model Loading\nL5 — Scalability: Storage, Horizontal Scaling, Monitoring, Autoscaling",
        },
      ],
    },
  },
  og_image: `/images/nano_insp/${TEMPLATE_ID}-aiml-orchestration.jpg`,
  topics: [
    "infographic",
    "insight",
    "learning",
    "modern",
    "minimalist",
    "posters",
    "art-prints",
    "wall-art",
    "design",
    "architecture",
    "composition",
    "reference",
    "digital-canvas",
    "bold",
  ],
  base_rank_score: 90,
  rank_score: 110,
  creation_date: "2026-07-01",
  allow_generation: true,
};

// ── Inspirations ────────────────────────────────────────────────────────────

function mkInsp({ slug, stack_title, stack_subtitle, layers_block, title, tags, search_aliases }) {
  const id = `${TEMPLATE_ID}-${slug}`;
  return {
    id,
    template_id: TEMPLATE_ID,
    asset: {
      image_url: `/images/nano_insp/${id}.jpg`,
      preview_image_url: `/images/nano_insp_preview/${id}-prev.jpg`,
    },
    params: { stack_title, stack_subtitle, layers_block },
    locales: {
      en: { title },
    },
    tags,
    allow_i18n: true,
    search_aliases,
    topics: [],
  };
}

const INSPIRATIONS = [
  mkInsp({
    slug: "aiml-orchestration",
    stack_title: "AI/ML Job Orchestration",
    stack_subtitle: "The 5 layers behind every production model-serving platform",
    layers_block:
      "L1 — API: Submit, Cancel, Status\nL2 — Execution: Queue, Worker, Sync/Async\nL3 — Reliability: Retry, Checkpoint, Failover\nL4 — Resources: CPU, GPU, Memory, Model Loading\nL5 — Scalability: Storage, Horizontal Scaling, Monitoring, Autoscaling",
    title: "AI/ML Job Orchestration",
    tags: [
      "infographic",
      "insight",
      "modern",
      "minimalist",
      "flat",
      "illustration",
      "composition",
      "bold",
      "posters",
      "art-prints",
      "wall-art",
      "digital-canvas",
    ],
    search_aliases: [
      "ml infrastructure",
      "ml orchestration",
      "model serving stack",
      "ai pipeline",
      "机器学习基础设施",
      "ml 系统架构",
      "job orchestration",
      "mlops",
    ],
  }),
  mkInsp({
    slug: "kubernetes-deployment",
    stack_title: "Kubernetes Deployment Stack",
    stack_subtitle: "The three layers between an incoming request and durable state",
    layers_block:
      "L1 — Ingress: Route, TLS, LoadBalancer\nL2 — Workload: Pod, Replica, Rollout\nL3 — Storage: PVC, Volume, Backup",
    title: "Kubernetes Deployment Stack",
    tags: [
      "infographic",
      "insight",
      "modern",
      "minimalist",
      "flat",
      "illustration",
      "composition",
      "bold",
      "posters",
      "art-prints",
      "wall-art",
      "digital-canvas",
    ],
    search_aliases: [
      "kubernetes stack",
      "k8s architecture",
      "cluster deployment",
      "cloud native stack",
      "kubernetes 架构",
      "k8s 部署",
      "container orchestration",
    ],
  }),
  mkInsp({
    slug: "llm-inference",
    stack_title: "LLM Inference Stack",
    stack_subtitle: "From client request to GPU tensor cores in seven layers",
    layers_block:
      "L1 — Client: REST, WebSocket, Streaming\nL2 — Gateway: Auth, Rate Limit, Routing\nL3 — Orchestrator: Batching, Prompt Cache, Fallback\nL4 — Router: A/B, Cost, Quota\nL5 — Inference: Tokenizer, KV Cache, Sampler\nL6 — Runtime: vLLM, TensorRT, Triton\nL7 — Hardware: GPU, HBM, NVLink",
    title: "LLM Inference Stack",
    tags: [
      "infographic",
      "insight",
      "modern",
      "minimalist",
      "flat",
      "illustration",
      "composition",
      "bold",
      "posters",
      "art-prints",
      "wall-art",
      "digital-canvas",
    ],
    search_aliases: [
      "llm serving",
      "llm inference",
      "gpu inference",
      "vllm architecture",
      "llm 推理架构",
      "大模型推理",
      "genai infrastructure",
      "prompt caching",
    ],
  }),
  mkInsp({
    slug: "modern-data-pipeline",
    stack_title: "Modern Data Pipeline",
    stack_subtitle: "Five layers, uneven density — same top-to-bottom flow",
    layers_block:
      "L1 — Ingest: Kafka, Kinesis\nL2 — Storage: S3, Delta Lake, Iceberg, Parquet, Snowflake\nL3 — Compute: Spark, Flink\nL4 — Transform: dbt, Airflow, Dagster, Prefect\nL5 — Serve: BI, ML, API",
    title: "Modern Data Pipeline",
    tags: [
      "infographic",
      "insight",
      "modern",
      "minimalist",
      "flat",
      "illustration",
      "composition",
      "bold",
      "posters",
      "art-prints",
      "wall-art",
      "digital-canvas",
    ],
    search_aliases: [
      "data pipeline stack",
      "modern data stack",
      "data engineering",
      "etl architecture",
      "数据管道",
      "数据工程架构",
      "dbt airflow spark",
      "lakehouse",
    ],
  }),
];

// ── Write ──────────────────────────────────────────────────────────────────

function upsertBy(arr, id, entry) {
  const idx = arr.findIndex((x) => x.id === id);
  if (idx >= 0) arr[idx] = entry;
  else arr.push(entry);
}

// Templates
const templates = JSON.parse(fs.readFileSync(T_PATH, "utf-8"));
if (!Array.isArray(templates)) {
  console.error("nano_templates.json is not an array — aborting");
  process.exit(1);
}
upsertBy(templates, TEMPLATE.id, TEMPLATE);
fs.writeFileSync(T_PATH, JSON.stringify(templates, null, 2) + "\n", "utf-8");
console.log(`  ✓ template registered: ${TEMPLATE.id}`);

// Inspirations
const insps = JSON.parse(fs.readFileSync(I_PATH, "utf-8"));
if (!Array.isArray(insps)) {
  console.error("nano_inspiration.json is not an array — aborting");
  process.exit(1);
}
for (const insp of INSPIRATIONS) {
  upsertBy(insps, insp.id, insp);
  console.log(`  ✓ inspiration: ${insp.id}`);
}
fs.writeFileSync(I_PATH, JSON.stringify(insps, null, 2) + "\n", "utf-8");

console.log(`\nDone. Template + ${INSPIRATIONS.length} inspirations written.`);
