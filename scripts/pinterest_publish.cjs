#!/usr/bin/env node
/**
 * @file pinterest_publish.cjs
 * @description Create a Pinterest Pin from a Curify template example.
 *
 * Pinterest API v5 POST /pins. Auth is OAuth 2.0; the token needs
 * `pins:write` (and `boards:read` to resolve a board by name).
 * Docs: https://developers.pinterest.com/docs/api/v5/pins-create/
 *
 * LANDING URL POLICY — this is the part that is easy to get wrong.
 * The obvious link is the example page
 *   /nano-template/<slug>/example/<exampleId>
 * but example pages whose copy is not authored render `noindex, follow` and
 * canonical to the TEMPLATE page. Sending paid-for traffic to a noindex,
 * canonicalised URL wastes the link, so we always link to the template page:
 *   /nano-template/<slug>
 * which is `index, follow` and self-canonical. Override with --link if you
 * have a better destination (a tool page, a topic hub, a blog post).
 *
 * IMAGE — Pinterest FETCHES the image server-side from a public URL, so it
 * must be the CDN origin, not a relative path. public/images is gitignored
 * and served from cdn.curify-ai.com.
 *
 * Usage:
 *   node scripts/pinterest_publish.cjs --example <id> [--board <id>] [--dry-run]
 *   node scripts/pinterest_publish.cjs --example <id> --link /tools/character-sticker-sheet
 *
 * Env: PINTEREST_ACCESS_TOKEN, PINTEREST_BOARD_ID (or pass --board)
 */
const fs = require("fs");
const path = require("path");

// Credentials live in the BACKEND env (curify_background/.env), not the
// frontend one — that is where the operator saved them.
const BACKEND_ENV = path.join(process.env.HOME, "curify-studio/curify_background/.env");
function loadBackendEnv() {
  try {
    for (const line of fs.readFileSync(BACKEND_ENV, "utf8").split("\n")) {
      const m = line.match(/^\s*(PINTEREST_[A-Z_]+)\s*=\s*(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch { /* fall back to the ambient env */ }
}
loadBackendEnv();

// board slug -> { id, landing }. The landing page is the topic hub for that
// board, so a Pin sends traffic to a browsable collection rather than a single
// template. NOTE ecommerce points at /topics/product: /topics/ecommerce was
// consolidated into it on 2026-08-20 and now 308s, and a Pin should never link
// through a redirect.
const BOARDS = {
  merch:     { id: "570831390209279192", landing: "/topics/merch" },
  brand:     { id: "570831390209279198", landing: "/topics/branding" },
  ecommerce: { id: "570831390209279199", landing: "/topics/product" },
  packaging: { id: "570831390209279197", landing: "/topics/packaging" },
  edtech:    { id: "570831390209279196", landing: "/topics/learning" },
  mbti:      { id: "570831390209262804", landing: "/topics/mbti" },
};

const CDN = "https://cdn.curify-ai.com";
const SITE = "https://www.curify-ai.com";
const API = "https://api.pinterest.com/v5";

function arg(name, def = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return def;
  const v = process.argv[i + 1];
  return !v || v.startsWith("--") ? true : v;
}

function loadJson(p) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, "..", p), "utf8"));
}

/** Walk the inspiration tree for an example id. */
function findExample(node, id, out = {}) {
  if (Array.isArray(node)) { for (const n of node) findExample(n, id, out); return out; }
  if (node && typeof node === "object") {
    if (node.id === id && node.template_id) out.hit = node;
    for (const v of Object.values(node)) findExample(v, id, out);
  }
  return out;
}

function build() {
  const exampleId = arg("example");
  if (!exampleId || exampleId === true) throw new Error("--example <id> is required");

  const insp = loadJson("public/data/nano_inspiration.json");
  const { hit } = findExample(insp, exampleId);
  if (!hit) throw new Error(`example not found: ${exampleId}`);

  const nano = loadJson("messages/en/nano.json");
  const tpl = nano[hit.template_id] || {};
  const slug = hit.template_id.replace(/^template-/, "");

  // Prefer the FULL asset over the *_prev thumbnail. The preview is ~512x374
  // at ~28 KB, which Pinterest renders small and soft; the full render is
  // ~1206x880 at ~187 KB. The preview path is only a listing thumbnail.
  const relPrev = (hit.asset && (hit.asset.preview_image_url || hit.asset.image_url)) || "";
  if (!relPrev) throw new Error("example has no image asset");
  const relFull = relPrev
    .replace("/nano_insp_preview/", "/nano_insp/")
    .replace(/-prev\.jpg$/, ".jpg");
  const imageUrl = relPrev.startsWith("http") ? relPrev : `${CDN}${relFull}`;
  const fallbackUrl = `${CDN}${relPrev}`;

  const boardKey = arg("board") && arg("board") !== true ? String(arg("board")) : null;
  const board = boardKey && BOARDS[boardKey] ? BOARDS[boardKey] : null;
  if (boardKey && !board && !/^\d+$/.test(boardKey))
    throw new Error(`unknown board "${boardKey}" — known: ${Object.keys(BOARDS).join(", ")}`);
  // Landing precedence: explicit --link > the board's topic hub > template page.
  const linkPath =
    arg("link") && arg("link") !== true ? arg("link")
    : board ? board.landing
    : `/nano-template/${slug}`;
  const utm = arg("no-utm") ? "" : "?utm_source=pinterest&utm_medium=social&utm_campaign=template-examples";
  const link = `${SITE}${linkPath}${utm}`;

  // Pinterest hard limits: title 100, description 800, alt_text 500.
  const rawTitle = (tpl.title || slug).replace(/^Nano Banana Prompt:\s*/, "").replace(/\s*\|\s*Curify.*$/, "");
  const subject = exampleId.replace(`${hit.template_id}-`, "").replace(/-/g, " ");

  return {
    exampleId, templateId: hit.template_id, fallbackUrl,
    payload: {
      title: `${subject.replace(/\b\w/g, (c) => c.toUpperCase())} — ${rawTitle}`.slice(0, 100),
      description: ((tpl.description || "") + " Made with Curify AI — upload one character and get a consistent set.").trim().slice(0, 800),
      alt_text: `${subject} character expression sheet, nine poses on a grid`.slice(0, 500),
      board_id: (board && board.id) || boardKey || process.env.PINTEREST_BOARD_ID || "<PINTEREST_BOARD_ID>",
      link,
      media_source: { source_type: "image_url", url: imageUrl },
    },
  };
}

async function main() {
  const { exampleId, templateId, payload, fallbackUrl } = build();
  // Not every example has a full render; fall back to the thumbnail rather
  // than posting a Pin that Pinterest cannot fetch.
  try {
    const probe = await fetch(payload.media_source.url, { method: "HEAD" });
    if (!probe.ok && fallbackUrl) {
      console.log(`(full asset ${probe.status}; falling back to preview)`);
      payload.media_source.url = fallbackUrl;
    }
  } catch { payload.media_source.url = fallbackUrl; }
  const dry = arg("dry-run") === true;

  console.log(`example : ${exampleId}`);
  console.log(`template: ${templateId}`);
  console.log(`\nPOST ${API}/pins`);
  console.log(JSON.stringify(payload, null, 2));

  // Verify the two URLs Pinterest and the user will hit, before spending a call.
  for (const [label, url] of [["image", payload.media_source.url], ["landing", payload.link]]) {
    try {
      const r = await fetch(url, { method: label === "image" ? "HEAD" : "GET", redirect: "follow" });
      console.log(`\n${label} ${url}\n  -> HTTP ${r.status}${label === "image" ? ` ${r.headers.get("content-type")}` : ""}`);
      if (!r.ok) console.log(`  !! Pinterest will reject a non-200 ${label}`);
    } catch (e) { console.log(`\n${label} ${url}\n  -> FETCH FAILED ${e.message}`); }
  }

  if (dry) { console.log("\n(dry run — nothing published)"); return; }

  const token = process.env.PINTEREST_ACCESS_TOKEN;
  if (!token) throw new Error("PINTEREST_ACCESS_TOKEN not set (needs scope pins:write)");
  if (String(payload.board_id).startsWith("<")) throw new Error("no board id: pass --board or set PINTEREST_BOARD_ID");

  const res = await fetch(`${API}/pins`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await res.text();
  console.log(`\nHTTP ${res.status}\n${body}`);
  if (!res.ok) {
    // The most common first-run failure: a token generated with read scopes
    // only. Board listing succeeds (boards:read) so the token looks valid
    // right up until the POST.
    if (res.status === 401 && /scopes|permissions/i.test(body)) {
      console.error(
        "\nThe token is read-only. Regenerate it with WRITE scopes:\n" +
        "  boards:read, boards:write, pins:read, pins:write\n" +
        "Pinterest developer console -> My apps -> your app -> generate token,\n" +
        "tick the write scopes, then update PINTEREST_ACCESS_TOKEN in\n" +
        "curify-studio/curify_background/.env (tokens expire in 24h).",
      );
    }
    process.exitCode = 1;
  }
}

main().catch((e) => { console.error(`ERROR: ${e.message}`); process.exitCode = 1; });
