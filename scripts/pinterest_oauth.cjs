#!/usr/bin/env node
/**
 * @file pinterest_oauth.cjs
 * @description One-time Pinterest OAuth so publishing stops depending on a
 * 24-hour token pasted by hand.
 *
 * WHY THIS EXISTS. The token generated in the Pinterest developer console is
 * read-only unless the write scopes are ticked, and it expires in 24h. The
 * authorization-code flow instead returns a REFRESH token (long-lived) that
 * can mint access tokens forever without a browser. Same shape as
 * scripts/youtube_token_remint.py — the operator must do the browser half,
 * because it is a consent screen on their own account.
 *
 * STEP 1 (operator, browser):
 *   node scripts/pinterest_oauth.cjs --url
 *   -> open the printed URL, approve, then copy the `code=` value from the
 *      URL you land on (the page itself may 404 — only the code matters).
 *
 * STEP 2 (exchange, no browser):
 *   node scripts/pinterest_oauth.cjs --code <CODE>
 *   -> prints PINTEREST_ACCESS_TOKEN and PINTEREST_REFRESH_TOKEN to paste
 *      into curify-studio/curify_background/.env
 *
 * STEP 3 (later, automatic — no operator):
 *   node scripts/pinterest_oauth.cjs --refresh
 *
 * Requires PINTEREST_APP_ID and PINTEREST_SECRET_KEY in the backend .env.
 * The redirect URI must EXACTLY match one registered on the app.
 */
const fs = require("fs");
const path = require("path");

const ENV = path.join(process.env.HOME, "curify-studio/curify_background/.env");
for (const line of fs.existsSync(ENV) ? fs.readFileSync(ENV, "utf8").split("\n") : []) {
  const m = line.match(/^\s*(PINTEREST_[A-Z_]+)\s*=\s*(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
}

const APP_ID = process.env.PINTEREST_APP_ID || process.env.PINTEREST_CLIENT_ID;
const SECRET = process.env.PINTEREST_SECRET_KEY;
// Must match a redirect URI registered on the app VERBATIM (trailing slash
// included). The operator registered the localhost callback below, which is
// why --serve can catch the code without any copy/paste.
const REDIRECT =
  process.env.PINTEREST_REDIRECT_URI || "http://localhost:3000/api/oauth/pinterest/callback";
// Trial-tier apps can write "standard Pins" but they are visible only to the
// creating user — i.e. SECRET pins on a SECRET board. Public pins/boards use
// pins:write / boards:write; the creator-only variants need the *_secret
// scopes. Request both sets so the same token covers Trial now and Standard
// later without another consent round-trip.
const SCOPES = [
  "boards:read", "boards:write", "boards:read_secret", "boards:write_secret",
  "pins:read", "pins:write", "pins:read_secret", "pins:write_secret",
  "user_accounts:read",
];

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i === -1 ? null : (process.argv[i + 1] || true); };

async function tokenCall(body) {
  const res = await fetch("https://api.pinterest.com/v5/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${APP_ID}:${SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body).toString(),
  });
  const text = await res.text();
  if (!res.ok) {
    // Throw rather than exit: this is imported by pinterest_publish.cjs, where a
    // hard process.exit inside a batch would strand pins already published but
    // not yet flushed to the registry.
    const err = new Error(`token endpoint HTTP ${res.status}: ${text.slice(0, 300)}`);
    err.status = res.status;
    if (require.main === module) { console.error(`HTTP ${res.status}\n${text}`); process.exit(1); }
    throw err;
  }
  return JSON.parse(text);
}

/**
 * Rewrite only the PINTEREST_*_TOKEN lines of the backend .env, preserving every
 * other line byte-for-byte.
 *
 * Atomic (temp file + rename in the same directory) because curify_background
 * may be reading this file, and backed up first — the .env.bak convention
 * already exists per docs/pinterest-publishing-2026-08-21.md.
 */
function persistEnvTokens(tokens) {
  const cur = fs.readFileSync(ENV, "utf8");
  fs.writeFileSync(`${ENV}.bak`, cur);
  const next = { PINTEREST_ACCESS_TOKEN: tokens.access_token };
  if (tokens.refresh_token) next.PINTEREST_REFRESH_TOKEN = tokens.refresh_token;
  const seen = new Set();
  const lines = cur.split("\n").map((line) => {
    const m = line.match(/^\s*(PINTEREST_[A-Z_]+)\s*=\s*(.*)$/);
    if (m && next[m[1]] !== undefined) { seen.add(m[1]); return `${m[1]}=${next[m[1]]}`; }
    return line;
  });
  for (const [k, v] of Object.entries(next)) if (!seen.has(k)) lines.push(`${k}=${v}`);
  const tmp = `${ENV}.tmp-${process.pid}`;
  fs.writeFileSync(tmp, lines.join("\n"));
  fs.renameSync(tmp, ENV);
}

/**
 * Mint a fresh access token from the long-lived refresh token and (by default)
 * write it back. The CLI --refresh only PRINTED it, so a batch had no way to
 * recover from an expiry mid-run.
 */
async function refreshAccessToken({ persist = true } = {}) {
  const rt = process.env.PINTEREST_REFRESH_TOKEN;
  if (!rt) throw new Error("PINTEREST_REFRESH_TOKEN not set — run --serve once");
  const d = await tokenCall({ grant_type: "refresh_token", refresh_token: rt });
  if (persist) persistEnvTokens(d);
  process.env.PINTEREST_ACCESS_TOKEN = d.access_token;
  if (d.refresh_token) process.env.PINTEREST_REFRESH_TOKEN = d.refresh_token;
  return d;
}

module.exports = { tokenCall, refreshAccessToken, persistEnvTokens, SCOPES };

if (require.main === module) (async () => {
  if (!APP_ID) {
    console.error(
      "PINTEREST_APP_ID is missing from curify_background/.env.\n" +
      "Find it in the Pinterest developer console next to your app (it sits\n" +
      "beside the secret you already saved) and add:\n  PINTEREST_APP_ID=<app id>",
    );
    process.exit(1);
  }
  if (arg("url") || process.argv.length === 2) {
    const u = new URL("https://www.pinterest.com/oauth/");
    u.searchParams.set("client_id", APP_ID);
    u.searchParams.set("redirect_uri", REDIRECT);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", SCOPES.join(","));
    console.log("1. Open this URL, approve, then copy the ?code= value you land on:\n");
    console.log(u.toString());
    console.log(`\n   redirect_uri used: ${REDIRECT}`);
    console.log("   (it must be registered on the app EXACTLY, trailing slash included)");
    console.log("\n2. Then run:  node scripts/pinterest_oauth.cjs --code <CODE>");
    return;
  }
  if (arg("code")) {
    const d = await tokenCall({ grant_type: "authorization_code", code: arg("code"), redirect_uri: REDIRECT });
    console.log("Paste into curify-studio/curify_background/.env:\n");
    console.log(`PINTEREST_ACCESS_TOKEN=${d.access_token}`);
    console.log(`PINTEREST_REFRESH_TOKEN=${d.refresh_token}`);
    console.log(`\nscopes: ${d.scope}\naccess token expires in ${d.expires_in}s; the refresh token is long-lived.`);
    return;
  }
  if (arg("refresh")) {
    if (!process.env.PINTEREST_REFRESH_TOKEN) { console.error("PINTEREST_REFRESH_TOKEN not set — run --url first."); process.exit(1); }
    const d = await tokenCall({ grant_type: "refresh_token", refresh_token: process.env.PINTEREST_REFRESH_TOKEN });
    console.log(`PINTEREST_ACCESS_TOKEN=${d.access_token}`);
    console.log(`\nscopes: ${d.scope}`);
    return;
  }
  if (arg("serve")) {
    // Catch the callback locally and exchange in one go, so there is no code
    // to copy. Requires port 3000 free (the registered redirect URI).
    const http = require("http");
    const u = new URL("https://www.pinterest.com/oauth/");
    u.searchParams.set("client_id", APP_ID);
    u.searchParams.set("redirect_uri", REDIRECT);
    u.searchParams.set("response_type", "code");
    u.searchParams.set("scope", SCOPES.join(","));
    const port = Number(new URL(REDIRECT).port || 80);

    const server = http.createServer(async (req, res) => {
      const got = new URL(req.url, REDIRECT);
      const code = got.searchParams.get("code");
      const err = got.searchParams.get("error");
      if (!code && !err) { res.writeHead(204).end(); return; }
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(`<h2>${code ? "Pinterest authorized — you can close this tab." : "Authorization failed: " + err}</h2>`);
      server.close();
      if (err) { console.error(`\nauthorization failed: ${err}`); process.exit(1); }
      console.log("\ncode received, exchanging...");
      const d = await tokenCall({ grant_type: "authorization_code", code, redirect_uri: REDIRECT });
      console.log("\nPaste into curify-studio/curify_background/.env:\n");
      console.log(`PINTEREST_ACCESS_TOKEN=${d.access_token}`);
      console.log(`PINTEREST_REFRESH_TOKEN=${d.refresh_token}`);
      console.log(`\nscopes: ${d.scope}`);
      process.exit(0);
    });
    server.listen(port, () => {
      console.log(`listening on ${REDIRECT}\n`);
      console.log("Open this URL, approve, and this script will do the rest:\n");
      console.log(u.toString());
    });
    return;
  }
  console.log("usage: --serve (recommended) | --url | --code <CODE> | --refresh");
})();
