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
// Pinterest requires https. This must be registered on the app verbatim.
const REDIRECT = process.env.PINTEREST_REDIRECT_URI || "https://www.curify-ai.com/";
const SCOPES = ["boards:read", "boards:write", "pins:read", "pins:write", "user_accounts:read"];

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
  if (!res.ok) { console.error(`HTTP ${res.status}\n${text}`); process.exit(1); }
  return JSON.parse(text);
}

(async () => {
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
  console.log("usage: --url | --code <CODE> | --refresh");
})();
