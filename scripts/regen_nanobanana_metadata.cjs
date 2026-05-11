"use strict";

/*
 * Regenerate lib/generated/nanobanana_prompts_metadata.json from
 * public/data/nanobanana.json.
 *
 * Source of truth for prompt-tag metadata used by:
 *   - Search index (lib/searchIndex.ts)
 *   - Tag listing page (app/[locale]/(public)/nano-banana-pro-prompts/tag/[slug])
 *   - Hub page (app/[locale]/(public)/nano-banana-pro-prompts/page.tsx)
 *   - Sitemap (app/sitemap.xml/route.ts)
 *
 * Run locally after editing nanobanana.json, or automatically via
 * .github/workflows/sync_nanoprompts_to_redis.yml which commits the
 * regenerated file back.
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(process.cwd(), "public", "data", "nanobanana.json");
const OUT = path.join(process.cwd(), "lib", "generated", "nanobanana_prompts_metadata.json");

function countBy(entries, key) {
  const map = new Map();
  for (const e of entries) {
    const v = e?.[key];
    if (typeof v !== "string" || !v) continue;
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function tagCounts(prompts) {
  const map = new Map();
  for (const p of prompts) {
    const seen = new Set();
    for (const t of p?.tags ?? []) {
      if (typeof t !== "string" || !t) continue;
      const key = t.trim();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

function distinctSources(prompts) {
  return [...new Set(prompts.map((p) => p?.sourceType).filter(Boolean))].sort();
}

function main() {
  const raw = fs.readFileSync(SRC, "utf-8");
  const parsed = JSON.parse(raw);
  const prompts = Array.isArray(parsed) ? parsed : parsed.prompts ?? [];

  const metadata = {
    domainCategories: countBy(prompts, "domainCategory"),
    lastUpdated: new Date().toISOString(),
    layoutCategories: countBy(prompts, "layoutCategory"),
    sources: distinctSources(prompts),
    tags: tagCounts(prompts),
    total: prompts.length,
  };

  fs.writeFileSync(OUT, JSON.stringify({ metadata }, null, 2) + "\n");
  console.log(
    `Wrote ${OUT} — ${metadata.total} prompts, ${metadata.tags.length} tags, ` +
      `${metadata.domainCategories.length} domains, ${metadata.layoutCategories.length} layouts`
  );
}

main();
