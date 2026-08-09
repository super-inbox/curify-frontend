#!/usr/bin/env node
// scripts/scan_blog_client_namespaces.cjs
//
// Regenerates lib/blog-client-namespaces.generated.ts.
//
// WHY THIS EXISTS
// ---------------
// `pickClientMessages()` strips blog article BODIES out of the client RSC payload
// so Googlebot stops seeing every page as ~90% byte-identical boilerplate (the
// homepage-canonical fold — docs/workstream-seo-smm-growth.md, 2026-08-07).
//
// Most blog articles are rendered by SERVER components (getTranslations reads the
// full catalog independently), so stripping them is free. But ~22 posts have
// dedicated CLIENT components that read their article namespace through
// useTranslations() — for those, the body MUST stay in the client payload of that
// post's own page, or the page renders raw i18n keys.
//
// The first version of the trim guessed at this with a field-name heuristic and
// broke 6 live posts. This script replaces the guess with a static scan: it finds
// every client component that reads a blog-sourced namespace and attributes it to
// the blog route that renders it.
//
// Run after adding a blog post with a dedicated client component:
//   node scripts/scan_blog_client_namespaces.cjs
// Add --check to fail (exit 1) instead of writing, for CI / pre-commit use.

"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const BLOG_JSON = path.join(ROOT, "messages/en/blog.json");
const OUT = path.join(ROOT, "lib/blog-client-namespaces.generated.ts");
const SCAN_DIRS = ["app", "components", "lib"];
const BLOG_ROUTE_RE = /app\/\[locale\]\/\(public\)\/blog\/([^/]+)\//;

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      walk(p, acc);
    } else if (/\.tsx?$/.test(e.name)) acc.push(p);
  }
  return acc;
}

const blogEn = JSON.parse(fs.readFileSync(BLOG_JSON, "utf8"));
// Every namespace that originates in blog.json: the `blog` container's children
// plus the legacy top-level siblings (aiPlatform, SceneDetection, …).
const TOP_LEVEL = Object.keys(blogEn).filter((k) => k !== "blog");
const CHILDREN = Object.keys(blogEn.blog || {});
const isBlogNs = (ns) =>
  TOP_LEVEL.includes(ns) || (ns.startsWith("blog.") && CHILDREN.includes(ns.slice(5)));

const files = SCAN_DIRS.flatMap((d) =>
  fs.existsSync(path.join(ROOT, d)) ? walk(path.join(ROOT, d)) : []
);

// 1) collect (file -> namespaces) for client components only
const hits = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (!/["']use client["']/.test(src)) continue;
  const found = new Set();
  for (const m of src.matchAll(/useTranslations\(\s*["']([^"']+)["']\s*\)/g)) {
    if (isBlogNs(m[1])) found.add(m[1]);
  }
  if (found.size) hits.push({ file: path.relative(ROOT, f), namespaces: [...found] });
}

// 2) attribute each hit to the blog route that renders it.
//    Direct case: the file lives under blog/<slug>/.
//    Indirect case: it lives under blog/[slug]/components/ and is rendered by a
//    dedicated blog/<slug>/page.tsx — resolve via the importing page.
const componentUsers = new Map(); // ComponentName -> slug
for (const f of files) {
  const m = path.relative(ROOT, f).match(BLOG_ROUTE_RE);
  if (!m || m[1] === "[slug]") continue;
  const src = fs.readFileSync(f, "utf8");
  for (const c of src.matchAll(/<([A-Z][A-Za-z0-9_]*)\s*\/?>/g)) {
    if (!componentUsers.has(c[1])) componentUsers.set(c[1], m[1]);
  }
}

const routes = {};
const unattributed = [];
for (const h of hits) {
  const m = h.file.match(BLOG_ROUTE_RE);
  let slug = m && m[1] !== "[slug]" ? m[1] : null;
  if (!slug) {
    const comp = path.basename(h.file).replace(/\.tsx?$/, "");
    slug = componentUsers.get(comp) || null;
  }
  if (!slug) {
    unattributed.push(h);
    continue;
  }
  routes[slug] = [...new Set([...(routes[slug] || []), ...h.namespaces])].sort();
}

const all = [...new Set(Object.values(routes).flat())].sort();
const slugs = Object.keys(routes).sort();
// References we could NOT pin to a blog route (e.g. a shared client component
// rendered outside /blog). These must stay in EVERY page's payload, or that
// component breaks off-route.
const globals = [...new Set(unattributed.flatMap((u) => u.namespaces))].sort();

// 3) the full set of article namespaces — what may be lightened when it is not
//    needed by the current route. UI blocks that happen to live inside the
//    `blog` container (metadata, ruleOfThumb, keyInsight…) are NOT articles and
//    are never touched; they are all < 2KB while the smallest real article body
//    is ~4KB, so size is a clean discriminator here.
// Every blog route we know about. A known route missing from
// BLOG_ROUTE_ARTICLE_NAMESPACES provably needs NO article body in the client
// payload (the scan above found no client component reading one), so it must not
// fall back to shipping all of them — only a genuinely unknown slug does.
const blogsJson = path.join(ROOT, "public/data/blogs.json");
const knownSlugs = new Set(
  fs.existsSync(blogsJson)
    ? JSON.parse(fs.readFileSync(blogsJson, "utf8")).map((b) => b.slug)
    : []
);
const blogRouteDir = path.join(ROOT, "app/[locale]/(public)/blog");
if (fs.existsSync(blogRouteDir)) {
  for (const e of fs.readdirSync(blogRouteDir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    if (e.name === "[slug]" || e.name.startsWith("_")) continue;
    knownSlugs.add(e.name);
  }
}

const ARTICLE_MIN_BYTES = 2048;
const articleChildren = Object.entries(blogEn.blog || {})
  .filter(
    ([, v]) =>
      v && typeof v === "object" && !Array.isArray(v) &&
      typeof v.title === "string" &&
      JSON.stringify(v).length >= ARTICLE_MIN_BYTES
  )
  .map(([k]) => `blog.${k}`);
const articles = [...new Set([...articleChildren, ...TOP_LEVEL])].sort();

const body = `// GENERATED by scripts/scan_blog_client_namespaces.cjs — do not edit by hand.
//
// Blog article namespaces that are read by CLIENT components, keyed by the blog
// slug whose route renders them. \`pickClientMessages()\` keeps ONLY the current
// route's entry in the client RSC payload and lightens every other article, so a
// blog page ships its own (unique) body and nothing else ships any.
//
// Regenerate after adding a blog post with a dedicated client component:
//   node scripts/scan_blog_client_namespaces.cjs

export const BLOG_ROUTE_ARTICLE_NAMESPACES: Record<string, string[]> = {
${slugs.map((s) => `  ${JSON.stringify(s)}: [${routes[s].map((n) => JSON.stringify(n)).join(", ")}],`).join("\n")}
};

/** Union of the above — the safe fallback for an unrecognised blog route. */
export const ALL_CLIENT_ARTICLE_NAMESPACES: string[] = [
${all.map((n) => `  ${JSON.stringify(n)},`).join("\n")}
];

/** Client references that could not be pinned to a blog route — always kept. */
export const GLOBAL_CLIENT_ARTICLE_NAMESPACES: string[] = [
${globals.map((n) => `  ${JSON.stringify(n)},`).join("\n")}
];

/** Every blog-article namespace: the candidates for lightening. */
export const ARTICLE_NAMESPACES: string[] = [
${articles.map((n) => `  ${JSON.stringify(n)},`).join("\n")}
];

/** Blog slugs this scan covered. A slug listed here but absent from
 *  BLOG_ROUTE_ARTICLE_NAMESPACES needs no article body at all; a slug missing
 *  from this list is unknown and falls back to the full client-read set. */
export const KNOWN_BLOG_SLUGS: string[] = [
${[...knownSlugs].sort().map((s) => `  ${JSON.stringify(s)},`).join("\n")}
];
`;

if (unattributed.length) {
  console.warn("⚠️  client blog-namespace references not attributable to a blog route:");
  for (const u of unattributed) console.warn(`   ${u.file} :: ${u.namespaces.join(", ")}`);
  console.warn("   Emitted as GLOBAL_CLIENT_ARTICLE_NAMESPACES (kept on every page).");
}

if (process.argv.includes("--check")) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (cur !== body) {
    console.error("✗ lib/blog-client-namespaces.generated.ts is stale — run: node scripts/scan_blog_client_namespaces.cjs");
    process.exit(1);
  }
  console.log("✓ generated namespace map is up to date");
} else {
  fs.writeFileSync(OUT, body);
  console.log(`✓ ${path.relative(ROOT, OUT)} — ${slugs.length} routes, ${all.length} namespaces`);
}
