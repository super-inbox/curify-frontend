#!/usr/bin/env node
/**
 * @file pinterest_publish.cjs
 * @description Create Pinterest Pins from Curify template examples.
 *
 * Pinterest API v5 POST /pins. Docs:
 * https://developers.pinterest.com/docs/api/v5/pins-create/
 *
 * LANDING URL POLICY. Never link a Pin to an example page
 * (/nano-template/<slug>/example/<id>) — unauthored example pages render
 * `noindex, follow` and canonical to the template page, so the link is wasted.
 * Link to the topic hub (the board's default) or the template page.
 *
 * IMAGE. Pinterest fetches server-side from a public URL, so it must be the CDN
 * origin. The image published is NOT the site asset: see preparePinImage in
 * pinterest_lib.cjs for why the tiled watermark disqualifies it.
 *
 * Usage:
 *   # one Pin
 *   node scripts/pinterest_publish.cjs --example <id> --board <key> [--dry-run]
 *
 *   # propose a reviewable batch, then publish it
 *   node scripts/pinterest_publish.cjs --propose --board edtech --n 6 > plan.json
 *   node scripts/pinterest_publish.cjs --plan plan.json --limit 1        # smoke test
 *   node scripts/pinterest_publish.cjs --plan plan.json --delay 60
 *
 *   # board names + descriptions
 *   node scripts/pinterest_publish.cjs --boards [--dry-run]
 *
 * Env: PINTEREST_ACCESS_TOKEN (+ PINTEREST_REFRESH_TOKEN for auto-refresh).
 */
"use strict";
const fs = require("fs");
const path = require("path");
const L = require("./pinterest_lib.cjs");
const { refreshAccessToken } = require("./pinterest_oauth.cjs");

L.loadBackendEnv();

const API_PROD = "https://api.pinterest.com/v5";
const API_SANDBOX = "https://api-sandbox.pinterest.com/v5";
let API = process.argv.includes("--sandbox") ? API_SANDBOX : API_PROD;

function arg(name, def = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  // A value starting with "--" is the next flag, not this flag's value. Without
  // this guard `--link --no-utm` silently produced "https://www.curify-ai.comtrue".
  return !v || v.startsWith("--") ? true : v;
}
const flag = (n) => arg(n) === true;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------- selection

/**
 * Rank candidates for a board, applying every mechanical filter.
 *
 * Mechanical only — the IP screen here is layers 1 and 2. Layer 3 is a human
 * looking at each image, and it is not optional: the aroma-diffuser poster
 * passes both automated layers and renders "NIIMBOT B21" on the device.
 */
function propose(boardKey, n) {
  const topics = L.BOARD_TOPICS[boardKey];
  if (!topics) throw new Error(`no topic mapping for board "${boardKey}"`);
  const board = L.BOARDS[boardKey];
  const already = L.publishedIds();

  const rows = [];
  for (const rec of L.inspIndex().values()) {
    if (already.has(rec.id)) continue;
    if (!L.inTopics(rec, topics)) continue;
    const flags = L.ipFlags(rec);
    if (flags.length) continue;

    const local = L.siteImagePath(rec);
    if (!local) continue;
    let dim;
    try { dim = L.inspect(local); } catch { continue; }
    if (dim.ratio < 0.55 || dim.ratio > 0.8) continue;
    // Pinterest refuses to fetch very large files; several herbal renders are 19-21MB.
    if (dim.bytes > 10 * 1024 * 1024) continue;
    if (!L.cleanSourceFor(rec)) continue;

    let copy;
    try { copy = L.copyFor(rec); L.assertCopy(rec, copy); } catch { continue; }

    rows.push({
      example_id: rec.id,
      template_id: rec.template_id,
      board: boardKey,
      link: `${L.SITE}${board.landing}?utm_source=pinterest&utm_medium=social&utm_campaign=template-examples`,
      px: `${dim.w}x${dim.h}`,
      ratio: +dim.ratio.toFixed(3),
      mb: +(dim.bytes / 1048576).toFixed(2),
      subject: copy.subject,
      title: copy.title,
      alt_text: copy.alt_text,
      description: copy.description,
      local_path: local,
      clean_source: L.cleanSourceFor(rec),
      ip_review: "PENDING — open local_path and look at the image before publishing",
    });
  }

  // Closest to 2:3 first, then at most one per template so a run is not five
  // near-identical pins with the same template-level description.
  rows.sort((a, b) => Math.abs(a.ratio - 0.667) - Math.abs(b.ratio - 0.667));
  const seen = new Set(), out = [];
  for (const r of rows) {
    if (seen.has(r.template_id)) continue;
    seen.add(r.template_id);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

// ---------------------------------------------------------------- publish

function ratelimitOf(res) {
  const g = (k) => res.headers.get(k);
  return { limit: g("x-ratelimit-limit"), remaining: g("x-ratelimit-remaining"), reset: g("x-ratelimit-reset") };
}

/**
 * POST one Pin, with the retry policy the old version had none of.
 *
 * 401 -> refresh once and retry once (the CLI --refresh only printed a token, so
 * an expiry mid-batch used to be unrecoverable). 429/5xx -> up to 3 tries,
 * honouring Retry-After. Other 4xx -> no retry, the payload is wrong.
 */
async function postPin(payload, { attempts = 3 } = {}) {
  let refreshed = false;
  for (let i = 0; i < attempts; i++) {
    const token = process.env.PINTEREST_ACCESS_TOKEN;
    if (!token) throw new Error("PINTEREST_ACCESS_TOKEN not set");
    const res = await fetch(`${API}/pins`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    if (res.ok) return { res, text };

    if (res.status === 401 && !refreshed) {
      console.log("  401 — refreshing access token and retrying once");
      try { await refreshAccessToken(); refreshed = true; continue; }
      catch (e) { console.error(`  refresh failed: ${e.message}`); return { res, text }; }
    }
    if (res.status === 429 || res.status >= 500) {
      const ra = Number(res.headers.get("retry-after"));
      const wait = Number.isFinite(ra) && ra > 0 ? ra * 1000 : Math.round(5000 * 2 ** i * (0.8 + Math.random() * 0.4));
      if (i < attempts - 1) { console.log(`  HTTP ${res.status} — retrying in ${Math.round(wait / 1000)}s`); await sleep(wait); continue; }
    }
    return { res, text };
  }
  throw new Error("unreachable");
}

/** Publish one planned row. Returns true on success. */
async function publishRow(row, { dry = false }) {
  const rec = L.inspIndex().get(row.example_id);
  if (!rec) throw new Error(`example not found: ${row.example_id}`);
  const board = L.BOARDS[row.board];
  if (!board) throw new Error(`unknown board: ${row.board}`);

  const img = L.preparePinImage(rec, { dryRun: dry });
  if (!dry) {
    try { L.uploadPinImage(img.localPath); }
    catch (e) { throw new Error(`CDN upload failed for ${row.example_id}: ${e.message}`); }
  }

  const payload = {
    title: row.title,
    description: row.description,
    alt_text: row.alt_text,
    board_id: board.id,
    link: row.link,
    media_source: { source_type: "image_url", url: img.url },
  };

  console.log(`\n=== ${row.example_id} -> ${row.board}`);
  console.log(JSON.stringify(payload, null, 2));

  // Verify what Pinterest and the visitor will hit. A non-200 image aborts:
  // the old code fell back to a 28KB thumbnail and published a soft Pin.
  const imgRes = await fetch(img.url, { method: "HEAD" }).catch(() => null);
  console.log(`image   ${img.url} -> ${imgRes ? imgRes.status : "FETCH FAILED"}`);
  if (!dry && (!imgRes || !imgRes.ok)) throw new Error(`image not fetchable: ${img.url}`);

  // redirect:"manual" — the landing rule is that a Pin must never link through
  // a redirect, and the old code followed them and only warned.
  const landRes = await fetch(row.link, { redirect: "manual" }).catch(() => null);
  console.log(`landing ${row.link} -> ${landRes ? landRes.status : "FETCH FAILED"}`);
  if (!landRes || landRes.status !== 200) throw new Error(`landing must be 200 with no redirect (got ${landRes && landRes.status})`);

  if (dry) { console.log("(dry run — not published)"); return true; }

  const { res, text } = await postPin(payload);
  let parsed = null;
  try { parsed = JSON.parse(text); } catch { /* keep raw */ }

  L.recordPin({
    status: res.ok ? "ok" : "error",
    http_status: res.status,
    pin_id: (parsed && parsed.id) || null,
    example_id: row.example_id,
    template_id: row.template_id,
    board_key: row.board,
    board_id: board.id,
    link: row.link,
    image_url: img.url,
    image_variant: img.variant,
    source_asset: rec.asset && rec.asset.image_url,
    px: row.px,
    ratio: row.ratio,
    bytes: Math.round(row.mb * 1048576),
    title: row.title,
    alt_text: row.alt_text,
    description: row.description,
    api_host: new URL(API).host,
    ratelimit: ratelimitOf(res),
    error: res.ok ? null : text.slice(0, 500),
  });

  console.log(`HTTP ${res.status}${parsed && parsed.id ? `  pin_id=${parsed.id}` : ""}`);
  if (!res.ok) console.error(text.slice(0, 500));
  else {
    const rl = ratelimitOf(res);
    if (rl.limit) console.log(`ratelimit ${rl.remaining}/${rl.limit}`);
    if (!parsed || !parsed.media) console.error("  !! response has no media — Pinterest may not have fetched the image");
  }
  return res.ok;
}

// ---------------------------------------------------------------- boards

const BOARD_COPY = {
  ecommerce: { name: "Product Photography & Ecommerce Listing Templates",
    description: "AI templates for product photos, listing images and seller content — shot-style scenes, white-background packs and six-grid infographics." },
  packaging: { name: "Packaging Design Mockups & Label Templates",
    description: "Food, beverage, cosmetic and consumer-electronics packaging mockups, dielines and label design made with AI." },
  edtech:    { name: "Educational Posters & Study Infographics",
    description: "Classroom-ready posters, explainer infographics and study cards — science, language, history and how-things-work visuals." },
  merch:     { name: "Merch & Print-on-Demand Design Templates",
    description: "Sticker sheets, keychains, cultural goods and print-ready merch artwork generated from a single design." },
  brand:     { name: "Brand Identity & Logo Design Boards",
    description: "Logo variant sets, full visual-identity packs and brand mockup boards for small studios and new products." },
};

async function patchBoards({ dry }) {
  for (const [key, copy] of Object.entries(BOARD_COPY)) {
    const board = L.BOARDS[key];
    console.log(`\n${key} (${board.id})\n  name: ${copy.name}\n  desc: ${copy.description}`);
    if (dry) continue;
    const res = await fetch(`${API}/boards/${board.id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${process.env.PINTEREST_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(copy),
    });
    const text = await res.text();
    console.log(`  -> HTTP ${res.status}`);
    if (!res.ok) console.error(`  ${text.slice(0, 300)}`);
    L.recordPin({ status: res.ok ? "board_patch" : "error", http_status: res.status,
      board_key: key, board_id: board.id, title: copy.name, description: copy.description,
      api_host: new URL(API).host, error: res.ok ? null : text.slice(0, 300) });
  }
}

// ---------------------------------------------------------------- main

async function main() {
  const dry = flag("dry-run");

  if (flag("boards")) return patchBoards({ dry });

  if (flag("propose")) {
    const boardKey = arg("board");
    const n = Number(arg("n", 5)) || 5;
    if (!boardKey || boardKey === true) throw new Error("--propose needs --board <key>");
    process.stdout.write(JSON.stringify(propose(String(boardKey), n), null, 2) + "\n");
    return;
  }

  const planPath = arg("plan");
  if (planPath && planPath !== true) {
    // Sandbox ids must never land in the production registry.
    if (API === API_SANDBOX) throw new Error("--plan refuses --sandbox: sandbox pin ids would pollute the registry");
    let rows = JSON.parse(fs.readFileSync(path.resolve(planPath), "utf8"));
    const limit = Number(arg("limit", 0)) || 0;
    const max = Number(arg("max", 15)) || 15;
    if (limit) rows = rows.slice(0, limit);
    if (rows.length > max) throw new Error(`plan has ${rows.length} rows, over --max ${max}`);

    const pending = rows.filter((r) => /^PENDING/.test(String(r.ip_review || "")));
    if (pending.length && !dry) {
      throw new Error(
        `${pending.length} row(s) still say ip_review: PENDING.\n` +
        "Open each local_path, look at the image, and replace the field with\n" +
        `"approved <date> by <name>". Metadata cannot see what is drawn — the\n` +
        "aroma-diffuser poster has NIIMBOT B21 printed on the device.",
      );
    }

    // Skip anything already in the registry. --plan is re-run after a partial
    // batch, and the account already carries two identical demo pins created 13
    // seconds apart because nothing checked.
    const done = L.publishedIds();
    const skipped = rows.filter((r) => done.has(r.example_id)).map((r) => r.example_id);
    rows = rows.filter((r) => !done.has(r.example_id));
    if (skipped.length) console.log(`(skipping ${skipped.length} already published: ${skipped.join(", ")})`);
    if (!rows.length) { console.log("nothing left to publish"); return; }

    const delay = Number(arg("delay", 60)) || 60;
    let ok = 0; const failures = [];
    for (const [i, row] of rows.entries()) {
      try {
        if (await publishRow(row, { dry })) ok++;
        else failures.push(row.example_id);
      } catch (e) {
        console.error(`ERROR ${row.example_id}: ${e.message}`);
        failures.push(row.example_id);
      }
      if (i < rows.length - 1 && !dry) {
        const jitter = Math.round(delay * 1000 * (0.8 + Math.random() * 0.4));
        console.log(`\n(waiting ${Math.round(jitter / 1000)}s)`);
        await sleep(jitter);
      }
    }
    console.log(`\n=== ${ok}/${rows.length} published`);
    if (failures.length) { console.error(`failed: ${failures.join(", ")}`); process.exitCode = 1; }
    return;
  }

  // Single-example mode.
  const exampleId = arg("example");
  if (!exampleId || exampleId === true) throw new Error("--example <id> is required (or use --propose / --plan / --boards)");
  const rec = L.inspIndex().get(String(exampleId));
  if (!rec) throw new Error(`example not found: ${exampleId}`);
  const boardKey = arg("board");
  if (!boardKey || boardKey === true) throw new Error("--board <key> is required");
  const board = L.BOARDS[String(boardKey)];
  if (!board) throw new Error(`unknown board "${boardKey}" — known: ${Object.keys(L.BOARDS).join(", ")}`);

  const copy = L.copyFor(rec);
  L.assertCopy(rec, copy);
  const dim = L.inspect(L.siteImagePath(rec) || L.cleanSourceFor(rec));
  const linkPath = arg("link") && arg("link") !== true ? String(arg("link")) : board.landing;
  const utm = flag("no-utm") ? "" : "?utm_source=pinterest&utm_medium=social&utm_campaign=template-examples";

  await publishRow({
    example_id: rec.id, template_id: rec.template_id, board: String(boardKey),
    link: `${L.SITE}${linkPath}${utm}`,
    px: `${dim.w}x${dim.h}`, ratio: +dim.ratio.toFixed(3), mb: +(dim.bytes / 1048576).toFixed(2),
    subject: copy.subject, title: copy.title, alt_text: copy.alt_text, description: copy.description,
    ip_review: "single-example mode — operator is looking at it",
  }, { dry });
}

main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exitCode = 1; });
