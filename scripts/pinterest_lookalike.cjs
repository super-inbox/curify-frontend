#!/usr/bin/env node
/**
 * @file pinterest_lookalike.cjs
 * @description Propose a batch of Pins that LOOK LIKE the Pins that earned
 * something, instead of the ones search demand says should earn something.
 *
 * WHY THIS EXISTS. Three selection bases have now been tried on this account:
 *
 *   batch 1-2 (09-04/05)  rank by proximity to 2:3        -> 620 impressions, 6 saves
 *   batch 3   (09-08)     rank by measured GSC demand     ->   2 impressions, 0 saves
 *
 * The 2026-09-16 readout is the first one with non-zero numbers in it, and it
 * says something neither ranking predicted: everything that earned anything is
 * a COLLECTION GRID — many small repeated items laid out in one frame.
 *
 *   586 imp / 3 saves  city-landmark-fridge-magnet-collection-nanjing  (2x2 magnets)
 *    21 imp / 3 saves  professional-category-guide-infographic-interior-design-styles (4x3 photo grid)
 *    11 imp / 0 saves  ip-emoji-sticker-sheet-poster-empress-cow-cat   (4x4 stickers)
 *
 * GSC demand could not see this, because the demand is on the SHAPE of the
 * image and GSC measures the subject. So this proposer ranks by similarity to
 * what worked, and leaves the judgement of "is it actually a grid" to the human
 * visual pass, which remains the real gate.
 *
 * ⚠️ THE HEADLINE NUMBER IS NOT EVIDENCE OF CREATIVE QUALITY.
 * `-yangzhou-landmarks` is the same template, the same layout and the same
 * board as the 586-impression `-nanjing-landmarks`, published one day earlier,
 * and it has 0 impressions. Pinterest chose one and fed it. Treat impressions
 * as the surface's coin flip and SAVE RATE as the creative signal — by which
 * the interior-design style guide (3/21 = 14%) beats Nanjing (3/586 = 0.5%) by
 * 28x and is the thing actually worth copying.
 *
 * Usage:
 *   node scripts/pinterest_lookalike.cjs --n 40 > plan.json
 *   node scripts/pinterest_lookalike.cjs --like <example_id>,<example_id> --n 40
 *   node scripts/pinterest_lookalike.cjs --n 40 --per-template 2
 *
 * Output is plan-row shaped, so scripts/pinterest_publish.cjs --plan consumes
 * it unchanged — including the ip_review: PENDING gate, which --plan refuses to
 * run through.
 */
"use strict";
const L = require("./pinterest_lib.cjs");

/**
 * The three Pins that earned anything measurable, 2026-09-16.
 *
 * Not a guess and not a hand-pick: this is every example id in
 * data/pinterest/pins.jsonl whose per-Pin analytics came back non-zero on
 * IMPRESSION or SAVE, minus the two demo Pins (1 impression each, published to
 * a board that is not a publishing target).
 */
const DEFAULT_SEEDS = [
  "template-city-landmark-fridge-magnet-collection-nanjing-landmarks",
  "template-professional-category-guide-infographic-interior-design-styles",
  "template-ip-emoji-sticker-sheet-poster-empress-cow-cat",
];

const arg = (name, def = null) => {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return !v || v.startsWith("--") ? true : v;
};

/**
 * The bag of words describing a record: its own tags and topics, plus its
 * template's topics.
 *
 * Tags alone are useless for this — "posters", "illustration", "design" and
 * "modern" sit on all three seeds and on most of the 3,879-record corpus. The
 * IDF weighting below is what makes "daily-life-grid" (869 records) count for
 * more than "design", and "stickers" (69) count for more again.
 */
function vectorOf(rec) {
  const s = new Set();
  for (const t of rec.tags || []) s.add(String(t).toLowerCase());
  for (const t of rec.topics || []) s.add(`topic:${String(t).toLowerCase()}`);
  for (const t of L.templateTopics().get(String(rec.template_id).trim()) || []) s.add(`topic:${t}`);
  return s;
}

function buildIdf(recs) {
  const df = new Map();
  for (const r of recs) for (const t of vectorOf(r)) df.set(t, (df.get(t) || 0) + 1);
  const n = recs.length;
  return (t) => Math.log(n / (1 + (df.get(t) || 0)));
}

/** Cosine similarity over IDF-weighted term sets. */
function cosine(a, b, idf) {
  let dot = 0, na = 0, nb = 0;
  for (const t of a) { const w = idf(t) ** 2; na += w; if (b.has(t)) dot += w; }
  for (const t of b) nb += idf(t) ** 2;
  return dot / (Math.sqrt(na) * Math.sqrt(nb) || 1);
}

/** First board whose topic map claims this record, or null. */
function boardFor(rec) {
  for (const key of Object.keys(L.BOARD_TOPICS)) {
    if (L.BOARDS[key] && L.inTopics(rec, L.BOARD_TOPICS[key], key)) return key;
  }
  return null;
}

/**
 * Every mechanical filter propose() applies, in the same order and for the same
 * reasons. Kept as one function rather than imported because propose() also
 * does the demand ranking this file exists to replace.
 */
function mechanical(rec, already) {
  if (already.has(rec.id)) return null;
  if (L.ipFlags(rec).length) return null;
  const local = L.siteImagePath(rec);
  if (!local) return null;
  let dim;
  try { dim = L.inspect(local); } catch { return null; }
  if (dim.ratio < 0.55 || dim.ratio > 0.8) return null;
  if (dim.bytes > 10 * 1024 * 1024) return null;
  const clean = L.cleanSourceFor(rec);
  if (!clean) return null;
  let copy;
  try { copy = L.copyFor(rec); L.assertCopy(rec, copy); } catch { return null; }
  return { dim, clean, local, copy };
}

function lookalike(seedIds, n, perTemplate = 1) {
  const recs = [...L.inspIndex().values()];
  const idf = buildIdf(recs);
  const seeds = seedIds.map((id) => {
    const r = L.inspIndex().get(id);
    if (!r) throw new Error(`seed example not found: ${id}`);
    return { id, template: String(r.template_id).trim(), v: vectorOf(r) };
  });
  const already = L.publishedIds();

  const rows = [];
  for (const rec of recs) {
    const m = mechanical(rec, already);
    if (!m) continue;
    const board = boardFor(rec);
    if (!board) continue;

    const v = vectorOf(rec);
    let sim = 0, nearest = null;
    for (const s of seeds) {
      // A different example of a seed's own template is the most literal
      // look-alike there is — same layout, same render, different subject — and
      // tag cosine does not always say so, because tags describe the subject.
      const score = String(rec.template_id).trim() === s.template ? 1 : cosine(v, s.v, idf);
      if (score > sim) { sim = score; nearest = s.id; }
    }

    rows.push({
      example_id: rec.id,
      template_id: String(rec.template_id).trim(),
      board,
      link: `${L.SITE}${L.BOARDS[board].landing}?utm_source=pinterest&utm_medium=social&utm_campaign=template-examples`,
      px: `${m.dim.w}x${m.dim.h}`,
      ratio: +m.dim.ratio.toFixed(3),
      mb: +(m.dim.bytes / 1048576).toFixed(2),
      subject: m.copy.subject,
      search_phrase: m.copy.phrase,
      lookalike: { similarity: +sim.toFixed(3), nearest_winner: nearest },
      demand: {
        template_score: Math.round(L.demand.score(rec.template_id)),
        example_image_impressions: L.demand.exampleImpressions(rec.template_id, rec.id),
      },
      title: m.copy.title,
      alt_text: m.copy.alt_text,
      description: m.copy.description,
      local_path: m.local,
      clean_source: m.clean,
      ip_review: "PENDING — open local_path and look at the image before publishing",
    });
  }

  // Similarity first, measured demand as the tie-break. Demand is demoted
  // rather than dropped: it was the right instinct applied to the wrong axis,
  // and between two equally grid-shaped candidates the one search already wants
  // is still the better bet.
  rows.sort((a, b) =>
    b.lookalike.similarity - a.lookalike.similarity ||
    (b.demand.example_image_impressions * 3 + b.demand.template_score) -
    (a.demand.example_image_impressions * 3 + a.demand.template_score));

  const seen = new Map(), out = [];
  for (const r of rows) {
    const used = seen.get(r.template_id) || 0;
    if (used >= perTemplate) continue;
    seen.set(r.template_id, used + 1);
    out.push(r);
    if (out.length >= n) break;
  }
  return out;
}

if (require.main === module) {
  const seeds = arg("like") && arg("like") !== true ? String(arg("like")).split(",") : DEFAULT_SEEDS;
  const n = Number(arg("n", 20)) || 20;
  const perTemplate = Number(arg("per-template", 1)) || 1;
  process.stdout.write(JSON.stringify(lookalike(seeds, n, perTemplate), null, 2) + "\n");
}

module.exports = { lookalike, vectorOf, buildIdf, cosine, DEFAULT_SEEDS };
