/**
 * Register 6 WC emotional-moment tribute posters into nanobanana.json.
 *
 * These are gallery images (baked-in captions, no reproducible template)
 * so they go into the gallery corpus, NOT nano_inspiration.json.
 *
 * Watermark is already baked in by the generation prompt (Curify wordmark
 * bottom-right), so no watermark-utility pass is needed.
 *
 * Workflow:
 *   1. Copy source renders to public/images/nanobanana/jul01/
 *   2. Push to GCS (gs://curify-static/images/nanobanana/jul01/)
 *   3. Append 6 entries to public/data/nanobanana.json (ids 4387-4392)
 *
 * After this, run:  node scripts/regen_nanobanana_metadata.cjs
 * (required per feedback_gallery_tag_metadata_regen.md — new tags don't
 * surface in /search without the regen).
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "raw/wc-emotions");
const DEST_DIR = path.join(ROOT, "public/images/nanobanana/jul01");
const NB_JSON = path.join(ROOT, "public/data/nanobanana.json");
const CDN_BASE = "https://cdn.curify-ai.com";
const GCS_BUCKET = "gs://curify-static";
const DATE = "2026-07-01";
const BATCH = "jul01";

const COMMON_TAGS = [
  "insight",
  "narrative-comic",
  "illustration",
  "vintage-retro",
  "dramatic",
  "moody",
  "cinematic",
  "editorial",
  "posters",
  "wall-art",
  "art-prints",
  "digital-canvas",
  "sports",
  "world-cup",
  "soccer",
  "football",
  "national-team",
  "tribute",
];

const ITEMS = [
  {
    slug: "argentina-joy",
    file: "01_argentina_joy.jpg",
    title: "Argentina — Once More, Captain (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Argentina's euphoric hero moment at the 2026 FIFA World Cup — lone player in sky-blue-and-white kit, arms raised to a sunset stadium of golden confetti, trophy glowing in the sky. Bilingual caption ES + EN.",
    caption_native: "Otra vez, capitán.",
    caption_english: "Once more, captain.",
    subject_tags: ["argentina", "messi", "euphoria", "celebration", "victory", "gold", "sunset", "confetti"],
    aliases: [
      "argentina world cup 2026",
      "messi tribute poster",
      "argentina celebration poster",
      "world cup euphoria",
      "阿根廷 世界杯",
      "梅西 世界杯",
      "otra vez capitan",
      "argentina hero moment",
    ],
    mood: "euphoria",
  },
  {
    slug: "portugal-heartbreak",
    file: "02_portugal_heartbreak.jpg",
    title: "Portugal — One Last Dance (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Portugal's heartbreak at the 2026 FIFA World Cup — kneeling hero on the center circle under floodlights, Belém Tower and Portuguese caravel silhouetted in the night sky, trophy distant and unlit. Bilingual caption PT + EN.",
    caption_native: "Uma última dança que ficou por dançar.",
    caption_english: "One last dance we never got to dance.",
    subject_tags: ["portugal", "ronaldo", "heartbreak", "elimination", "night", "solitude", "belem-tower"],
    aliases: [
      "portugal world cup 2026",
      "ronaldo tribute poster",
      "portugal heartbreak poster",
      "world cup elimination",
      "葡萄牙 世界杯",
      "c罗 世界杯",
      "uma ultima danca",
      "portugal defeat",
    ],
    mood: "heartbreak",
  },
  {
    slug: "cabo-verde-disbelief",
    file: "03_cabo_verde_disbelief.jpg",
    title: "Cabo Verde — Zero-Zero vs Europe (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Cabo Verde's disbelief and joy after holding Spain to a 0-0 draw in their 2026 FIFA World Cup debut — hands-on-head shock, teammates rushing in, ESP 0-0 CPV scoreboard chip, archipelago silhouetted in the ocean. Bilingual caption PT + EN.",
    caption_native: "Zero a zero. Contra os campeões da Europa.",
    caption_english: "Zero-zero. Against the champions of Europe.",
    subject_tags: ["cabo-verde", "cape-verde", "disbelief", "underdog", "debut", "africa", "ocean", "shock"],
    aliases: [
      "cabo verde world cup 2026",
      "cape verde world cup",
      "cabo verde spain draw",
      "underdog moment world cup",
      "佛得角 世界杯",
      "cape verde debut",
      "zero a zero contra campeões",
      "cabo verde tribute",
    ],
    mood: "disbelief",
  },
  {
    slug: "norway-pride",
    file: "04_norway_pride.jpg",
    title: "Norway — We're Back (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Norway's collective pride on their 2026 FIFA World Cup return — full team standing shoulder-to-shoulder in Viking Row salute, aurora borealis rippling across a fjord night, trophy shape formed by the aurora itself. Bilingual caption NO + EN.",
    caption_native: "Vi er tilbake.",
    caption_english: "We're back.",
    subject_tags: ["norway", "haaland", "viking-row", "pride", "aurora", "fjord", "team-unity", "return"],
    aliases: [
      "norway world cup 2026",
      "haaland world cup",
      "norway viking row",
      "norway return world cup",
      "挪威 世界杯",
      "vi er tilbake",
      "aurora borealis football",
      "norway team unity",
    ],
    mood: "pride",
  },
  {
    slug: "turkey-ecstasy",
    file: "05_turkey_ecstasy.jpg",
    title: "Turkey — One Nation's Roar (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Turkey's ecstatic crowd celebration during the 2026 FIFA World Cup — packed sea of red-jersey fans, red flares, Istanbul skyline of Hagia Sophia and Sultanahmet Mosque behind the Bosphorus bridge under a crescent moon. Bilingual caption TR + EN.",
    caption_native: "Bir milletin sesi.",
    caption_english: "One nation's roar.",
    subject_tags: ["turkey", "istanbul", "crowd", "flares", "hagia-sophia", "bosphorus", "ecstasy", "fans"],
    aliases: [
      "turkey world cup 2026",
      "türkiye world cup",
      "istanbul football fans",
      "turkey national team",
      "土耳其 世界杯",
      "bir milletin sesi",
      "turkey celebration",
      "hagia sophia football",
    ],
    mood: "ecstasy",
  },
  {
    slug: "morocco-resolve",
    file: "06_morocco_resolve.jpg",
    title: "Morocco — We Don't Fold (2026 WC Tribute)",
    description:
      "Illustrated editorial tribute poster capturing Morocco's quiet resolve at the 2026 FIFA World Cup — solitary hero walking off pitch back to camera, Atlas mountains silhouetted, crescent moon rising, trophy constellation drawn in stars. Bilingual caption AR + EN.",
    caption_native: "لا نتنازل.",
    caption_english: "We don't fold.",
    subject_tags: ["morocco", "atlas-mountains", "resolve", "night", "constellation", "arabic", "north-africa", "silhouette"],
    aliases: [
      "morocco world cup 2026",
      "morocco national team",
      "morocco resolve poster",
      "atlas lions football",
      "المغرب كأس العالم",
      "المغرب 2026",
      "morocco tribute",
      "atlas mountains football",
    ],
    mood: "resolve",
  },
];

// ── Step 1: copy renders to public/images/nanobanana/jul01/ ──────────────────
fs.mkdirSync(DEST_DIR, { recursive: true });
for (const item of ITEMS) {
  const src = path.join(SRC_DIR, item.file);
  const destFile = `${BATCH}-${String(ITEMS.indexOf(item) + 1).padStart(2, "0")}-${item.slug}.jpg`;
  const dest = path.join(DEST_DIR, destFile);
  fs.copyFileSync(src, dest);
  item._destFile = destFile;
  console.log(`  copy: ${item.file} → ${destFile}`);
}

// ── Step 2: sync to GCS ──────────────────────────────────────────────────────
const gcsTarget = `${GCS_BUCKET}/images/nanobanana/${BATCH}/`;
console.log(`\n  syncing to GCS: ${gcsTarget}`);
try {
  execSync(`gsutil -m cp -r ${DEST_DIR}/*.jpg ${gcsTarget}`, { stdio: "inherit" });
} catch (err) {
  console.error("GCS sync failed:", err.message);
  process.exit(1);
}

// ── Step 3: register in nanobanana.json ──────────────────────────────────────
const nb = JSON.parse(fs.readFileSync(NB_JSON, "utf-8"));
const arr = Array.isArray(nb) ? nb : nb.prompts || Object.values(nb);
const maxId = Math.max(0, ...arr.map((x) => x.id).filter((n) => Number.isFinite(n) && n < Number.MAX_SAFE_INTEGER));
console.log(`\n  current max id: ${maxId}`);

const newEntries = ITEMS.map((item, idx) => {
  const id = maxId + 1 + idx;
  const cdnUrl = `${CDN_BASE}/images/nanobanana/${BATCH}/${item._destFile}`;
  return {
    id,
    title: item.title,
    description: item.description,
    promptText: `Illustrated editorial tribute poster, portrait 4:5. ${item.description} Baked-in bilingual caption: native line "${item.caption_native}" (bold, with dark outline) stacked above English line "${item.caption_english}" (smaller, lighter). Painterly semi-realistic style, warm cinematic lighting, symbolic backdrop, Curify wordmark bottom-right.`,
    author: null,
    authorHandle: null,
    date: DATE,
    category: null,
    imageUrl: cdnUrl,
    sourceUrl: cdnUrl,
    sourceType: "curated-tribute-drop",
    likes: 0,
    retweets: 0,
    createdAt: DATE,
    layoutCategory: null,
    domainCategory: null,
    tags: [...COMMON_TAGS, ...item.subject_tags, `mood-${item.mood}`],
    aliases: item.aliases,
    topic: "Sports",
  };
});

// idempotent: if the ids already exist, replace them
for (const entry of newEntries) {
  const idx = arr.findIndex((x) => x.id === entry.id);
  if (idx >= 0) arr[idx] = entry;
  else arr.push(entry);
  console.log(`  ✓ ${entry.id} — ${entry.title}`);
}

fs.writeFileSync(NB_JSON, JSON.stringify(arr, null, 2) + "\n", "utf-8");
console.log(`\nDone. ${newEntries.length} gallery entries added (ids ${newEntries[0].id}-${newEntries.at(-1).id}).`);
console.log(`Next: node scripts/regen_nanobanana_metadata.cjs`);
