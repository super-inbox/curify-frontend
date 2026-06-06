// FIFA World Cup 2026 — North America (Mexico / USA / Canada)
// First 48-team edition. Tournament window: June 11 – July 19, 2026.
//
// Schedule is a hand-curated subset focused on host-country openers,
// matches involving top-ranked teams (Brazil/Argentina/France/Germany/
// Spain/England/Portugal), and the knockout milestone dates. Refresh
// monthly during group stage or as FIFA confirms additional fixtures.
//
// Matches with team = "TBD" mean the bracket slot is not yet resolved
// (knockout rounds before group stage finishes).

export type WCMatch = {
  date: string;       // YYYY-MM-DD (local to host venue)
  time?: string;      // e.g. "17:00 CDT" — host-venue local
  home: string;       // team name OR "TBD"
  away: string;       // team name OR "TBD" OR "" (for final-line entries)
  venue?: string;     // stadium, city
  stage: string;      // "Group A" / "Round of 32" / "Quarterfinal" / "Final" etc.
  label?: string;     // e.g. "Opening Match", "Host Opener (USA)", "Final"
};

export const WC_2026 = {
  name: "FIFA World Cup 2026",
  shortName: "WC 2026",
  start: "2026-06-11",
  end:   "2026-07-19",
  hosts: ["Mexico", "USA", "Canada"],
  matches: [
    // ── Opening week ─────────────────────────────────────────────────
    { date: "2026-06-11", time: "17:00 CST", home: "Mexico", away: "TBD",
      venue: "Estadio Azteca, Mexico City",   stage: "Group A", label: "Opening Match" },
    { date: "2026-06-12", time: "15:00 ET",  home: "USA",    away: "TBD",
      venue: "MetLife Stadium, NJ",            stage: "Group D", label: "USA Opener" },
    { date: "2026-06-12", time: "18:00 ET",  home: "Canada", away: "TBD",
      venue: "BMO Field, Toronto",             stage: "Group A", label: "Canada Opener" },
    { date: "2026-06-13", time: "TBD",       home: "Argentina", away: "TBD",
      venue: "TBD",                            stage: "Group A", label: "Defending Champions" },

    // ── Marquee group stage ──────────────────────────────────────────
    { date: "2026-06-14", time: "TBD", home: "Spain",       away: "TBD",
      venue: "TBD", stage: "Group B" },
    { date: "2026-06-14", time: "TBD", home: "Brazil",      away: "TBD",
      venue: "TBD", stage: "Group C" },
    { date: "2026-06-15", time: "TBD", home: "France",      away: "TBD",
      venue: "TBD", stage: "Group D" },
    { date: "2026-06-16", time: "TBD", home: "Germany",     away: "TBD",
      venue: "TBD", stage: "Group E" },
    { date: "2026-06-17", time: "TBD", home: "England",     away: "TBD",
      venue: "TBD", stage: "Group F" },
    { date: "2026-06-18", time: "TBD", home: "Portugal",    away: "TBD",
      venue: "TBD", stage: "Group G" },

    // ── Knockout milestones ──────────────────────────────────────────
    { date: "2026-07-04", time: "TBD", home: "Round of 16", away: "",
      venue: "Various", stage: "Round of 16",  label: "Round of 16 begins" },
    { date: "2026-07-09", time: "TBD", home: "Quarterfinal", away: "",
      venue: "Various", stage: "Quarterfinal", label: "Quarterfinals begin" },
    { date: "2026-07-14", time: "TBD", home: "Semifinal",   away: "",
      venue: "Various", stage: "Semifinal",    label: "Semifinals" },
    { date: "2026-07-18", time: "TBD", home: "3rd Place",   away: "",
      venue: "TBD",     stage: "Third Place",  label: "3rd Place Play-off" },
    { date: "2026-07-19", time: "15:00 ET", home: "Final",  away: "",
      venue: "MetLife Stadium, NJ", stage: "Final", label: "FIFA World Cup Final" },
  ] as WCMatch[],
};

// Helpers
export function daysUntil(target: string, ref: Date = new Date()): number {
  const t = new Date(target + "T00:00:00Z").getTime();
  const r = new Date(ref.toISOString().slice(0, 10) + "T00:00:00Z").getTime();
  return Math.round((t - r) / (24 * 60 * 60 * 1000));
}

export function nextMatches(ref: Date = new Date(), n = 3): WCMatch[] {
  const today = ref.toISOString().slice(0, 10);
  return WC_2026.matches.filter((m) => m.date >= today).slice(0, n);
}

export function tournamentPhase(ref: Date = new Date()): "before" | "during" | "after" {
  const today = ref.toISOString().slice(0, 10);
  if (today < WC_2026.start) return "before";
  if (today > WC_2026.end) return "after";
  return "during";
}

// Derive a contextual search query from a match. Used by WorldCupCalendarCard
// per-line clickable upgrade — each Upcoming line links to /search?q=<query>
// rather than the whole card going to /topics/world-cup. The strategic frame
// (docs/search-and-content.md 2026-06-05): every match line is a live demo of
// the search → visual-answer pattern. Users learn through repetition.
export function searchQueryForMatch(m: WCMatch): string {
  // Knockout milestones: away is "", home is the stage name
  if (m.away === "") {
    if (m.stage === "Round of 16")  return "World Cup Round of 16 bracket";
    if (m.stage === "Quarterfinal") return "World Cup Quarterfinal bracket";
    if (m.stage === "Semifinal")    return "World Cup Semifinal bracket";
    if (m.stage === "Third Place")  return "World Cup 3rd place 2026";
    if (m.stage === "Final")        return "World Cup Final 2026";
    return `World Cup ${m.stage}`;
  }
  // Opener labels (Mexico Opening Match, USA Opener, Canada Opener)
  if (m.label && (m.label.includes("Opener") || m.label.includes("Opening"))) {
    return `${m.home} World Cup 2026 opener`;
  }
  // Group stage with TBD opponent (marquee team focus)
  if (m.away === "TBD") {
    return `${m.home} World Cup 2026`;
  }
  // Resolved fixture
  return `${m.home} vs ${m.away} World Cup 2026`;
}

// Stable id for a match — used as tracking content_id on per-line clicks.
export function matchTrackingId(m: WCMatch): string {
  const opponent = m.away || "knockout";
  return `${m.date}-${m.home}-${opponent}-${m.stage}`.replace(/\s+/g, "-").toLowerCase();
}
