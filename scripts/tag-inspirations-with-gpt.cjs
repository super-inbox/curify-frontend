/**
 * tag-inspirations-with-gpt.cjs
 *
 * For each nano_inspiration example, picks 1-2 images, sends them to GPT-4o,
 * and asks it to assign up to 5 tags describing the visual style and content.
 *
 * Output: scripts/inspiration_tags_output.json
 *   [ { template_id, example_id, tags: string[] }, ... ]
 *
 * Usage:
 *   OPENAI_API_KEY=sk-... node scripts/tag-inspirations-with-gpt.cjs
 *
 * Optional env vars:
 *   CONCURRENCY=5          (default: 5 parallel requests)
 *   RESUME=true            (skip already-processed example IDs in output file)
 *   CDN_BASE=https://...   (default: https://cdn.curify-ai.com)
 */

const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");
let sharp;
try { sharp = require("sharp"); } catch { sharp = null; }

// ── Config ────────────────────────────────────────────────────────────────────

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY env var is required.");
  process.exit(1);
}

const CDN_BASE = process.env.CDN_BASE || "https://cdn.curify-ai.com";
const CONCURRENCY = parseInt(process.env.CONCURRENCY || "5", 10);
const RESUME = process.env.RESUME === "true";
const OUTPUT_FILE = path.join(__dirname, "inspiration_tags_output.json");

// ── Load data ─────────────────────────────────────────────────────────────────

const inspirations = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../public/data/nano_inspiration.json"), "utf8")
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function toAbsoluteUrl(relativeUrl) {
  if (!relativeUrl) return null;
  if (relativeUrl.startsWith("http")) return relativeUrl;
  return `${CDN_BASE}${relativeUrl}`;
}

/** Shuffle an array in-place (Fisher-Yates) and return it. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick up to N items from an array. If > N, pick a random sample. */
function pickUpTo(arr, n) {
  if (arr.length <= n) return arr;
  return shuffle([...arr]).slice(0, n);
}

/** Download a URL and return a Buffer. */
function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

/** Resize image to max 512px on longest side, return base64 JPEG. */
async function resizeToBase64(url) {
  const buf = await fetchBuffer(url);
  if (sharp) {
    const resized = await sharp(buf)
      .resize({ width: 512, height: 512, fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
    return `data:image/jpeg;base64,${resized.toString("base64")}`;
  }
  // Fallback: send raw (may still fail for oversized images)
  return `data:image/jpeg;base64,${buf.toString("base64")}`;
}

/** Call OpenAI chat completions with vision. */
async function callGPT(imageUrls) {
  // Build image content — try URL first, fall back to resized base64 on size error
  const imageContent = await Promise.all(
    imageUrls.map(async (url) => {
      let src = url;
      try {
        src = await resizeToBase64(url);
      } catch {
        // if resize fails, fall back to direct URL
      }
      return {
        type: "image_url",
        image_url: { url: src, detail: "low" },
      };
    })
  );

  const body = JSON.stringify({
    model: "gpt-4o",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: [
          ...imageContent,
          {
            type: "text",
            text:
              "Look at the image(s) and assign up to 5 short descriptive tags that capture the visual style, mood, subject, or theme. " +
              "Return ONLY a JSON array of lowercase strings, no explanation. Example: [\"vintage\",\"portrait\",\"moody\",\"urban\"]",
          },
        ],
      },
    ],
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            const text = json.choices?.[0]?.message?.content?.trim() || "[]";
            // Extract JSON array from response (handle markdown code fences)
            const match = text.match(/\[[\s\S]*\]/);
            const tags = match ? JSON.parse(match[0]) : [];
            resolve(Array.isArray(tags) ? tags.slice(0, 5) : []);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

/** Process a single inspiration entry. */
async function processEntry(entry) {
  const imageUrl = toAbsoluteUrl(entry.asset?.image_url);
  const previewUrl = toAbsoluteUrl(entry.asset?.preview_image_url);

  // Prefer preview (smaller, faster) + original as second image
  const candidates = [previewUrl, imageUrl].filter(Boolean);
  const imageUrls = pickUpTo(candidates, 2);

  if (imageUrls.length === 0) return null;

  const tags = await callGPT(imageUrls);

  return {
    template_id: entry.template_id,
    example_id: entry.id,
    tags,
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Filter entries that have images
  const entries = inspirations.filter((e) => e.asset?.image_url);
  console.log(`Total entries with images: ${entries.length}`);

  // Load existing results if resuming
  let results = [];
  const doneIds = new Set();
  if (RESUME && fs.existsSync(OUTPUT_FILE)) {
    results = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf8"));
    for (const r of results) doneIds.add(r.example_id);
    console.log(`Resuming — already done: ${doneIds.size}`);
  }

  const todo = entries.filter((e) => !doneIds.has(e.id));
  console.log(`To process: ${todo.length} | Concurrency: ${CONCURRENCY}`);

  let done = 0;
  let errors = 0;

  // Process in batches of CONCURRENCY
  for (let i = 0; i < todo.length; i += CONCURRENCY) {
    const batch = todo.slice(i, i + CONCURRENCY);
    const settled = await Promise.allSettled(batch.map(processEntry));

    for (let j = 0; j < settled.length; j++) {
      const s = settled[j];
      const entry = batch[j];
      if (s.status === "fulfilled" && s.value) {
        results.push(s.value);
        done++;
      } else {
        errors++;
        console.error(`  ERROR [${entry.id}]:`, s.reason?.message || s.reason);
        // Push a placeholder so we can identify failures
        results.push({ template_id: entry.template_id, example_id: entry.id, tags: [], error: true });
      }
    }

    // Persist after every batch
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));

    const pct = (((i + batch.length) / todo.length) * 100).toFixed(1);
    console.log(`Progress: ${i + batch.length}/${todo.length} (${pct}%) — done=${done} errors=${errors}`);
  }

  console.log(`\nFinished. Results written to ${OUTPUT_FILE}`);
  console.log(`Total: ${results.length} | Success: ${done} | Errors: ${errors}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
