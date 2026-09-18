#!/usr/bin/env node
/**
 * @file pinterest_analytics.cjs
 * @description Pull per-Pin analytics for every Pin in the registry and join it
 * back to template/board/shape, so a batch readout is a command instead of an
 * ad-hoc script rewritten each time.
 *
 * Per-Pin `GET /v5/pins/{id}/analytics` is the ONLY per-Pin attribution we have:
 * UTMs never reach our own DB (the tracker strips the query string), and the
 * referrer join cannot say which Pin. See docs/pinterest-publishing-2026-08-21.md.
 *
 * ⚠️ The window may not start before T-90 — the API refuses it with
 * `code 1: You can only get data from the last 90 days.`
 *
 * Usage:
 *   node scripts/pinterest_analytics.cjs                 # last 30d, table + seeds
 *   node scripts/pinterest_analytics.cjs --days 90
 *   node scripts/pinterest_analytics.cjs --json out.json
 */
"use strict";
const fs = require("fs");
const path = require("path");
const L = require("./pinterest_lib.cjs");
const { refreshAccessToken } = require("./pinterest_oauth.cjs");

const API = "https://api.pinterest.com/v5";
const METRICS = "IMPRESSION,SAVE,PIN_CLICK,OUTBOUND_CLICK";
const arg = (n, d = null) => { const i = process.argv.indexOf(`--${n}`); return i > -1 ? process.argv[i + 1] : d; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GET with the same 401-refresh / 429-backoff policy the publisher uses. */
async function apiGet(url, { attempts = 3 } = {}) {
  let refreshed = false;
  for (let i = 0; i < attempts; i++) {
    const token = process.env.PINTEREST_ACCESS_TOKEN;
    if (!token) throw new Error("PINTEREST_ACCESS_TOKEN not set");
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const text = await res.text();
    if (res.ok) return { ok: true, status: res.status, json: JSON.parse(text) };
    if (res.status === 401 && !refreshed) {
      try { await refreshAccessToken(); refreshed = true; continue; } catch { /* fall through */ }
    }
    if ((res.status === 429 || res.status >= 500) && i < attempts - 1) {
      const ra = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(ra) && ra > 0 ? ra * 1000 : 3000 * 2 ** i);
      continue;
    }
    return { ok: false, status: res.status, text: text.slice(0, 200) };
  }
  throw new Error("unreachable");
}

/** Sum a metric across the daily series the API returns. */
function total(summary, metric) {
  const d = summary?.all?.daily_metrics;
  if (!Array.isArray(d)) return Number(summary?.all?.summary_metrics?.[metric] ?? 0);
  return d.reduce((a, x) => a + Number(x.metrics?.[metric] ?? 0), 0);
}

(async function main() {
  L.loadBackendEnv();
  const days = Number(arg("days", 30));
  if (days > 90) throw new Error("window cannot start before T-90 — the API refuses it");
  const end = new Date();
  const start = new Date(end.getTime() - days * 864e5);
  const fmt = (d) => d.toISOString().slice(0, 10);

  const rows = fs.readFileSync(L.REGISTRY, "utf8").trim().split("\n")
    .map((l) => JSON.parse(l)).filter((r) => r.pin_id);
  // One row per pin_id: the registry is append-only, so a republish would double-count.
  const seen = new Map();
  for (const r of rows) if (!seen.has(r.pin_id)) seen.set(r.pin_id, r);
  const pins = [...seen.values()];

  console.error(`pulling ${pins.length} pins, ${fmt(start)} -> ${fmt(end)}`);
  const out = [];
  for (const p of pins) {
    const u = `${API}/pins/${p.pin_id}/analytics?start_date=${fmt(start)}&end_date=${fmt(end)}`
      + `&metric_types=${METRICS}&app_types=ALL&split_field=NO_SPLIT`;
    const r = await apiGet(u);
    const rec = r.ok ? {
      impression: total(r.json, "IMPRESSION"), save: total(r.json, "SAVE"),
      pin_click: total(r.json, "PIN_CLICK"), outbound: total(r.json, "OUTBOUND_CLICK"),
    } : { error: `${r.status} ${r.text || ""}`.trim() };
    out.push({ pin_id: p.pin_id, example_id: p.example_id, template_id: p.template_id,
      board_key: p.board_key, ts: p.ts, ratio: p.ratio, ...rec });
    process.stderr.write(r.ok ? "." : "x");
    await sleep(250);
  }
  console.error("");

  const live = out.filter((r) => !r.error);
  const earners = live.filter((r) => (r.impression || 0) > 0 || (r.save || 0) > 0)
    .sort((a, b) => (b.save - a.save) || (b.impression - a.impression));

  const sum = (k) => live.reduce((a, r) => a + (r[k] || 0), 0);
  console.log(`\n${live.length} pins measured (${out.length - live.length} errored), last ${days}d`);
  console.log(`IMPRESSION ${sum("impression")} · SAVE ${sum("save")} · PIN_CLICK ${sum("pin_click")} · OUTBOUND ${sum("outbound")}\n`);
  console.log("earners (save desc, then impression):");
  for (const r of earners) {
    const rate = r.impression ? ((r.save / r.impression) * 100).toFixed(1) + "%" : "—";
    console.log(`  ${String(r.impression).padStart(4)} imp  ${String(r.save).padStart(2)} sav  ${rate.padStart(6)}  ${r.board_key.padEnd(9)} ${r.ts.slice(0, 10)}  ${r.example_id}`);
  }
  // Cohort split: the registry date is the batch.
  const byDate = {};
  for (const r of live) {
    const d = r.ts.slice(0, 10);
    byDate[d] = byDate[d] || { n: 0, imp: 0, sav: 0 };
    byDate[d].n++; byDate[d].imp += r.impression || 0; byDate[d].sav += r.save || 0;
  }
  console.log("\nby publish date:");
  for (const d of Object.keys(byDate).sort()) {
    const c = byDate[d];
    console.log(`  ${d}  ${String(c.n).padStart(3)} pins  ${String(c.imp).padStart(5)} imp  ${String(c.sav).padStart(3)} sav`);
  }
  const jsonPath = arg("json");
  if (jsonPath) { fs.writeFileSync(jsonPath, JSON.stringify({ start: fmt(start), end: fmt(end), pins: out }, null, 2)); console.error(`wrote ${jsonPath}`); }
})();
