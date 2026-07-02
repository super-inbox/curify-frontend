// WC 2026 R32 bracket state — used by the interactive bracket-picker page
// at /wc-bracket. Sourced from lib/wc_2026_schedule.ts confirmed fixtures
// (2026-06-28+ knockouts) + the 2026-07-02 advancement snapshot the
// operator dropped under raw/wc-bracket-07-02/.
//
// Convention: R32 games are indexed 0-15 top → bottom in the bracket
// display order. R32[2k] and R32[2k+1] feed into R16[k]. Same halving
// pattern propagates through QF → SF → Final. 31 games total.
//
// A pending game has result = null; the user picks the winner. A
// completed game has result = "home" | "away" and the picker locks that
// choice (still interactive from R16 onwards).

export type BracketSide = "home" | "away";

export type R32Game = {
  home: string;         // team name (used to resolve flag emoji)
  away: string;
  result: BracketSide | null;  // null = pending
  date: string;         // "MM/DD" for display
  time: string;         // "HH:MM" local, informational
};

export type BracketConfig = {
  r32: R32Game[];       // length 16
  labels: {
    r32: string;
    r16: string;
    qf: string;
    sf: string;
    f: string;
  };
};

// Country → emoji flag (via regional-indicator sequence). Names must
// match those used in R32 pairs below. Missing entries render the raw
// team name without a flag prefix.
export const FLAG: Record<string, string> = {
  Germany:        "🇩🇪",
  Paraguay:       "🇵🇾",
  France:         "🇫🇷",
  Sweden:         "🇸🇪",
  "South Africa": "🇿🇦",
  Canada:         "🇨🇦",
  Netherlands:    "🇳🇱",
  Morocco:        "🇲🇦",
  Portugal:       "🇵🇹",
  Croatia:        "🇭🇷",
  Spain:          "🇪🇸",
  Austria:        "🇦🇹",
  USA:            "🇺🇸",
  Bosnia:         "🇧🇦",
  Belgium:        "🇧🇪",
  Senegal:        "🇸🇳",
  Brazil:         "🇧🇷",
  Japan:          "🇯🇵",
  "Ivory Coast":  "🇨🇮",
  Norway:         "🇳🇴",
  Mexico:         "🇲🇽",
  Ecuador:        "🇪🇨",
  England:        "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "DR Congo":     "🇨🇩",
  Argentina:      "🇦🇷",
  Australia:      "🇦🇺",
  Egypt:          "🇪🇬",
  Uruguay:        "🇺🇾",
  Switzerland:    "🇨🇭",
  Colombia:       "🇨🇴",
  Algeria:        "🇩🇿",
  Ghana:          "🇬🇭",
};

// R32 in bracket display order, top → bottom.
// Games 0-7 are the top half of the tree (Argentina-side away from
// Brazil-half convention doesn't apply in 48-team format; ordering just
// mirrors the 2026-07-02 operator source snapshot).
export const WC_2026_BRACKET: BracketConfig = {
  r32: [
    // ── Top half ──────────────────────────────────────
    { home: "Germany",      away: "Paraguay",     result: "away", date: "06/29", time: "4:30 PM" },
    { home: "France",       away: "Sweden",       result: "home", date: "06/30", time: "5:00 PM" },
    { home: "South Africa", away: "Canada",       result: "away", date: "06/28", time: "12:00 PM" },
    { home: "Netherlands",  away: "Morocco",      result: "away", date: "06/29", time: "8:00 PM" },
    { home: "Portugal",     away: "Croatia",      result: null,   date: "07/02", time: "7:00 PM" },
    { home: "Spain",        away: "Austria",      result: null,   date: "07/02", time: "3:00 PM" },
    { home: "USA",          away: "Bosnia",       result: "home", date: "07/01", time: "8:00 PM" },
    { home: "Belgium",      away: "Senegal",      result: "home", date: "07/01", time: "4:00 PM" },
    // ── Bottom half ───────────────────────────────────
    { home: "Brazil",       away: "Japan",        result: "home", date: "06/29", time: "12:00 PM" },
    { home: "Ivory Coast",  away: "Norway",       result: "away", date: "06/30", time: "12:00 PM" },
    { home: "Mexico",       away: "Ecuador",      result: "home", date: "06/30", time: "10:00 PM" },
    { home: "England",      away: "DR Congo",     result: "home", date: "07/01", time: "12:00 AM" },
    { home: "Argentina",    away: "Australia",    result: null,   date: "07/03", time: "6:00 PM" },
    { home: "Egypt",        away: "Uruguay",      result: null,   date: "07/03", time: "10:00 PM" },
    { home: "Switzerland",  away: "Colombia",     result: null,   date: "07/02", time: "11:00 PM" },
    { home: "Algeria",      away: "Ghana",        result: null,   date: "07/02", time: "3:00 AM" },
  ],
  labels: { r32: "R32", r16: "R16", qf: "QF", sf: "SF", f: "Final" },
};

// ── Picks encoding ─────────────────────────────────────
// 31 picks total: 16 R32 + 8 R16 + 4 QF + 2 SF + 1 F.
// Each pick is 'H' (home / top) or 'A' (away / bottom).
// Encode as a 31-char string in the URL query param `p`.

export const TOTAL_PICKS = 31;
export const R32_COUNT = 16;
export const R16_COUNT = 8;
export const QF_COUNT = 4;
export const SF_COUNT = 2;
export const F_COUNT = 1;

// Slot index ranges into the 31-char picks string
export const R32_OFFSET = 0;
export const R16_OFFSET = R32_COUNT;                     // 16
export const QF_OFFSET  = R32_COUNT + R16_COUNT;         // 24
export const SF_OFFSET  = QF_OFFSET + QF_COUNT;          // 28
export const F_OFFSET   = SF_OFFSET + SF_COUNT;          // 30

// Default picks string built from the R32 config (locked results, blank
// for pending, blank for all downstream rounds).
export function buildDefaultPicks(): string {
  const chars = new Array(TOTAL_PICKS).fill("?");
  WC_2026_BRACKET.r32.forEach((g, i) => {
    if (g.result === "home") chars[R32_OFFSET + i] = "H";
    else if (g.result === "away") chars[R32_OFFSET + i] = "A";
  });
  return chars.join("");
}

// Sanitize an incoming picks string (URL query param). Anything other
// than H / A / ? at each position resets to ?. Length is clamped to
// TOTAL_PICKS.
export function sanitizePicks(input: string | undefined | null): string {
  const def = buildDefaultPicks();
  if (!input) return def;
  const clean = input.slice(0, TOTAL_PICKS).padEnd(TOTAL_PICKS, "?");
  const out: string[] = [];
  for (let i = 0; i < TOTAL_PICKS; i++) {
    const c = clean[i];
    out.push(c === "H" || c === "A" ? c : "?");
  }
  // Force locked R32 results in every payload — we don't let the URL
  // rewrite completed real-world results.
  WC_2026_BRACKET.r32.forEach((g, i) => {
    if (g.result === "home") out[R32_OFFSET + i] = "H";
    else if (g.result === "away") out[R32_OFFSET + i] = "A";
  });
  return out.join("");
}

// Return the winning team name for a given R32 pick, or null if the
// pick is still blank.
export function r32WinnerName(index: number, picks: string): string | null {
  const g = WC_2026_BRACKET.r32[index];
  if (!g) return null;
  const c = picks[R32_OFFSET + index];
  if (c === "H") return g.home;
  if (c === "A") return g.away;
  return null;
}

// Slot k in a round (R16/QF/SF/F) fed by two parent slots in the previous
// round. Returns [homeTeamName|null, awayTeamName|null] for display.
export function pairFor(
  round: "r16" | "qf" | "sf" | "f",
  slot: number,
  picks: string,
): [string | null, string | null] {
  if (round === "r16") {
    const h = r32WinnerName(2 * slot, picks);
    const a = r32WinnerName(2 * slot + 1, picks);
    return [h, a];
  }
  if (round === "qf") {
    const h = r16Winner(2 * slot, picks);
    const a = r16Winner(2 * slot + 1, picks);
    return [h, a];
  }
  if (round === "sf") {
    const h = qfWinner(2 * slot, picks);
    const a = qfWinner(2 * slot + 1, picks);
    return [h, a];
  }
  // final
  const h = sfWinner(0, picks);
  const a = sfWinner(1, picks);
  return [h, a];
}

export function r16Winner(slot: number, picks: string): string | null {
  const c = picks[R16_OFFSET + slot];
  const [h, a] = pairFor("r16", slot, picks);
  if (c === "H") return h;
  if (c === "A") return a;
  return null;
}
export function qfWinner(slot: number, picks: string): string | null {
  const c = picks[QF_OFFSET + slot];
  const [h, a] = pairFor("qf", slot, picks);
  if (c === "H") return h;
  if (c === "A") return a;
  return null;
}
export function sfWinner(slot: number, picks: string): string | null {
  const c = picks[SF_OFFSET + slot];
  const [h, a] = pairFor("sf", slot, picks);
  if (c === "H") return h;
  if (c === "A") return a;
  return null;
}
export function championName(picks: string): string | null {
  const c = picks[F_OFFSET];
  const [h, a] = pairFor("f", 0, picks);
  if (c === "H") return h;
  if (c === "A") return a;
  return null;
}

// Set / clear a pick at (round, slot). Also invalidates every downstream
// pick that referenced the changed team (so if the user re-picks their
// QF winner, the SF/F picks blank out).
export function setPick(
  picks: string,
  round: "r32" | "r16" | "qf" | "sf" | "f",
  slot: number,
  side: BracketSide,
): string {
  const off = round === "r32" ? R32_OFFSET :
              round === "r16" ? R16_OFFSET :
              round === "qf"  ? QF_OFFSET  :
              round === "sf"  ? SF_OFFSET  : F_OFFSET;
  const chars = picks.split("");
  chars[off + slot] = side === "home" ? "H" : "A";

  // Downstream invalidation: any slot whose parent-pair now yields a
  // different winner gets blanked to "?".
  // Simplest correct implementation: rebuild downstream from the change
  // point.
  let cur = chars.join("");
  const invalidate = (r: "r16" | "qf" | "sf" | "f", start: number, count: number) => {
    const rOff = r === "r16" ? R16_OFFSET : r === "qf" ? QF_OFFSET : r === "sf" ? SF_OFFSET : F_OFFSET;
    const arr = cur.split("");
    for (let k = start; k < start + count; k++) arr[rOff + k] = "?";
    cur = arr.join("");
  };
  if (round === "r32") {
    // R16 slot floor(slot/2), QF floor(slot/4), SF floor(slot/8), F 0
    invalidate("r16", Math.floor(slot / 2), 1);
    invalidate("qf",  Math.floor(slot / 4), 1);
    invalidate("sf",  Math.floor(slot / 8), 1);
    invalidate("f",   0, 1);
  } else if (round === "r16") {
    invalidate("qf",  Math.floor(slot / 2), 1);
    invalidate("sf",  Math.floor(slot / 4), 1);
    invalidate("f",   0, 1);
  } else if (round === "qf") {
    invalidate("sf",  Math.floor(slot / 2), 1);
    invalidate("f",   0, 1);
  } else if (round === "sf") {
    invalidate("f",   0, 1);
  }
  return cur;
}
