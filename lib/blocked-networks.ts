// Edge-level IP blocklist for the corpus-harvesting campaign documented in
// docs/workstream-seo-smm-growth.md (2026-08-08).
//
// WHAT WE ARE BLOCKING
// --------------------
// A distributed harvester running out of two Alibaba Cloud ranges walks the
// localized prompt corpus. On 2026-08-08 alone it made 41,187 requests to
// 20,404 distinct URLs from 462 IPs — 91% of all site traffic that day. Its
// tell is the locale split, near-uniform across the six non-English locales
// while English is skipped entirely (es 7,236 / ru 7,073 / ja 6,802 / tr 6,784
// / ko 6,638 / zh 6,589 vs en 65) — a translation-corpus harvest, not a crawl.
// It escalates: 14,288 (08-06) → 29,464 (08-07) → 41,187 (08-08, in 15h),
// after an identical ~14.5k/day wave on 07-27..28.
//
// Every request is a DYNAMIC render — the (public) layout's generateMetadata
// calls headers(), so nothing is served from cache and each hit costs an origin
// render plus full transfer. It also executes JavaScript (it fires our
// client-side tracking beacons), so it is rendering full pages, not just
// fetching HTML.
//
// IT HAS NO GEO VALUE (checked 2026-08-09, the reason we block rather than
// tolerate it):
//   * No reverse DNS — every sampled IP is NXDOMAIN, where Googlebot resolves
//     to crawl-66-249-72-136.googlebot.com. Engines that attribute sources
//     publish verifiable identity so publishers will allow them.
//   * It never declares itself: 167,132 events over 90 days, every one under a
//     generic browser UA.
//   * It is not Alibaba. Alibaba's real crawler is separately present and
//     properly named (Quark, 80 events, crawling openly).
// An anonymous fetcher has no attribution path, so no citation can result.
// Retrieval crawlers that DO produce citations are handled in app/robots.ts.
//
// WHY BY IP AND NOT BY USER-AGENT
// -------------------------------
// The pool sends `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) …
// Chrome/145.0.0.0 Safari/537.36` — no bot token, which is how it evades the
// analytics UA regex. That is also the stock Mac Chrome UA: over 30 days it
// carried 3,920 events from 2,681 REAL visitors outside these ranges. Blocking
// on the UA would take out every Mac Chrome user. Do not add a UA condition.
//
// WHY THESE RANGES ARE SAFE
// -------------------------
// 90 days of user_interactions across both /16s: 115,240 events, 84,280 visitor
// keys, ZERO logged-in users, and only 163 non-VIEW actions — 158 of them the
// `VIDEO_PLAY` that carousel pages fire automatically on mount, plus 5
// SEARCH_LOWRESULT. No human has ever engaged from this space.
//
// Blocked at the /16 rather than the observed /24s (43.119.100.0/24 and
// 47.82.201.0/24) on purpose: the actor rotates addresses inside its block and
// grew the pool from 311 to 473 IPs between the two waves, and low-volume
// traffic from ~12 further 47.82.x /24s shows the same signature. A /24 block
// would be stepped around within a day.
//
// Googlebot (66.249.0.0/16) and other declared crawlers are NOT affected — they
// live in different space and must keep crawling: as of 2026-08-08 Google is
// re-crawling the site at ~100× baseline after the canonical-fold fix.
//
// To amend: add or remove a CIDR below. Set BLOCK_NETWORKS_DISABLED=1 in the
// environment to disable the whole check without a deploy.

/** CIDR blocks refused at the edge, with the evidence for each. */
export const BLOCKED_CIDRS: ReadonlyArray<{ cidr: string; note: string }> = [
  // Alibaba Cloud (Singapore) Private Limited — observed live in 43.119.100.0/24
  { cidr: "43.119.0.0/16", note: "alibaba-sg corpus harvester (2026-07-27→)" },
  // Alibaba Cloud LLC (US) — observed live in 47.82.201.0/24
  { cidr: "47.82.0.0/16", note: "alibaba-us corpus harvester (2026-07-27→)" },
];

type Net = { base: number; mask: number };

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let out = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const n = Number(p);
    if (n > 255) return null;
    out = (out << 8) | n;
  }
  return out >>> 0;
}

function parseCidr(cidr: string): Net | null {
  const [ip, bitsRaw] = cidr.split("/");
  const base = ipv4ToInt(ip);
  const bits = Number(bitsRaw);
  if (base === null || !Number.isInteger(bits) || bits < 0 || bits > 32) return null;
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { base: (base & mask) >>> 0, mask };
}

const NETS: Net[] = BLOCKED_CIDRS.map((b) => parseCidr(b.cidr)).filter(
  (n): n is Net => n !== null
);

/**
 * The client IP, as Vercel reports it. `x-forwarded-for` may be a list — the
 * left-most entry is the client. A bare `req.ip` is not available on all
 * runtimes, so read the headers directly.
 *
 * A port suffix is stripped, so a value copied straight out of
 * `user_interactions.user_ip` (which stores `ip:port`) matches too.
 */
export function clientIpFrom(headers: Headers): string | null {
  const raw =
    headers.get("x-vercel-forwarded-for") ??
    headers.get("x-forwarded-for") ??
    headers.get("x-real-ip");
  if (!raw) return null;
  const first = raw.split(",")[0]?.trim();
  if (!first) return null;
  // IPv6 is never matched below; leave it intact rather than mangling it.
  if (first.includes(":") && first.split(":").length > 2) return first;
  return first.replace(/:\d+$/, "");
}

/** True when `ip` falls inside any blocked CIDR. IPv6 always returns false. */
export function isBlockedIp(ip: string | null | undefined): boolean {
  if (!ip) return false;
  const n = ipv4ToInt(ip);
  if (n === null) return false;
  for (const net of NETS) if (((n & net.mask) >>> 0) === net.base) return true;
  return false;
}
