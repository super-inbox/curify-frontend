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
    // ── Group stage (real fixtures, all 72 matches) ─────────────────
    { date: "2026-06-11", time: "12:00 PM", home: "Mexico", away: "South Africa", stage: "Group A", label: "Opening Match" },
    { date: "2026-06-11", time: "7:00 PM", home: "South Korea", away: "Czechia", stage: "Group A" },
    { date: "2026-06-12", time: "12:00 PM", home: "Canada", away: "Bosnia and Herzegovina", stage: "Group B", label: "Canada Opener" },
    { date: "2026-06-12", time: "6:00 PM", home: "USA", away: "Paraguay", stage: "Group D", label: "USA Opener" },
    { date: "2026-06-13", time: "12:00 PM", home: "Qatar", away: "Switzerland", stage: "Group B" },
    { date: "2026-06-13", time: "3:00 PM", home: "Brazil", away: "Morocco", stage: "Group C", label: "Brazil Opener" },
    { date: "2026-06-13", time: "6:00 PM", home: "Haiti", away: "Scotland", stage: "Group C" },
    { date: "2026-06-13", time: "9:00 PM", home: "Australia", away: "Türkiye", stage: "Group D" },
    { date: "2026-06-14", time: "10:00 AM", home: "Germany", away: "Curaçao", stage: "Group E" },
    { date: "2026-06-14", time: "1:00 PM", home: "Netherlands", away: "Japan", stage: "Group F" },
    { date: "2026-06-14", time: "4:00 PM", home: "Ivory Coast", away: "Ecuador", stage: "Group E" },
    { date: "2026-06-14", time: "7:00 PM", home: "Sweden", away: "Tunisia", stage: "Group F" },
    { date: "2026-06-15", time: "9:00 AM", home: "Spain", away: "Cabo Verde", stage: "Group H", label: "Spain Opener" },
    { date: "2026-06-15", time: "12:00 PM", home: "Belgium", away: "Egypt", stage: "Group G" },
    { date: "2026-06-15", time: "3:00 PM", home: "Saudi Arabia", away: "Uruguay", stage: "Group H" },
    { date: "2026-06-15", time: "6:00 PM", home: "Iran", away: "New Zealand", stage: "Group G" },
    { date: "2026-06-16", time: "12:00 PM", home: "France", away: "Senegal", stage: "Group I" },
    { date: "2026-06-16", time: "3:00 PM", home: "Iraq", away: "Norway", stage: "Group I" },
    { date: "2026-06-16", time: "6:00 PM", home: "Argentina", away: "Algeria", stage: "Group J", label: "Defending Champions" },
    { date: "2026-06-16", time: "9:00 PM", home: "Austria", away: "Jordan", stage: "Group J" },
    { date: "2026-06-17", time: "10:00 AM", home: "Portugal", away: "DR Congo", stage: "Group K" },
    { date: "2026-06-17", time: "1:00 PM", home: "England", away: "Croatia", stage: "Group L" },
    { date: "2026-06-17", time: "4:00 PM", home: "Ghana", away: "Panama", stage: "Group L" },
    { date: "2026-06-17", time: "7:00 PM", home: "Uzbekistan", away: "Colombia", stage: "Group K" },
    { date: "2026-06-18", time: "9:00 AM", home: "Czechia", away: "South Africa", stage: "Group A" },
    { date: "2026-06-18", time: "12:00 PM", home: "Switzerland", away: "Bosnia and Herzegovina", stage: "Group B" },
    { date: "2026-06-18", time: "3:00 PM", home: "Canada", away: "Qatar", stage: "Group B" },
    { date: "2026-06-18", time: "6:00 PM", home: "Mexico", away: "South Korea", stage: "Group A" },
    { date: "2026-06-19", time: "12:00 PM", home: "USA", away: "Australia", stage: "Group D" },
    { date: "2026-06-19", time: "3:00 PM", home: "Scotland", away: "Morocco", stage: "Group C" },
    { date: "2026-06-19", time: "5:30 PM", home: "Brazil", away: "Haiti", stage: "Group C" },
    { date: "2026-06-19", time: "8:00 PM", home: "Türkiye", away: "Paraguay", stage: "Group D" },
    { date: "2026-06-20", time: "10:00 AM", home: "Netherlands", away: "Sweden", stage: "Group F" },
    { date: "2026-06-20", time: "1:00 PM", home: "Germany", away: "Ivory Coast", stage: "Group E" },
    { date: "2026-06-20", time: "5:00 PM", home: "Ecuador", away: "Curaçao", stage: "Group E" },
    { date: "2026-06-20", time: "9:00 PM", home: "Tunisia", away: "Japan", stage: "Group F" },
    { date: "2026-06-21", time: "9:00 AM", home: "Spain", away: "Saudi Arabia", stage: "Group H" },
    { date: "2026-06-21", time: "12:00 PM", home: "Belgium", away: "Iran", stage: "Group G" },
    { date: "2026-06-21", time: "3:00 PM", home: "Uruguay", away: "Cabo Verde", stage: "Group H" },
    { date: "2026-06-21", time: "6:00 PM", home: "New Zealand", away: "Egypt", stage: "Group G" },
    { date: "2026-06-22", time: "10:00 AM", home: "Argentina", away: "Austria", stage: "Group J" },
    { date: "2026-06-22", time: "2:00 PM", home: "France", away: "Iraq", stage: "Group I" },
    { date: "2026-06-22", time: "5:00 PM", home: "Norway", away: "Senegal", stage: "Group I" },
    { date: "2026-06-22", time: "8:00 PM", home: "Jordan", away: "Algeria", stage: "Group J" },
    { date: "2026-06-23", time: "10:00 AM", home: "Portugal", away: "Uzbekistan", stage: "Group K" },
    { date: "2026-06-23", time: "1:00 PM", home: "England", away: "Ghana", stage: "Group L" },
    { date: "2026-06-23", time: "4:00 PM", home: "Panama", away: "Croatia", stage: "Group L" },
    { date: "2026-06-23", time: "7:00 PM", home: "Colombia", away: "DR Congo", stage: "Group K" },
    { date: "2026-06-24", time: "12:00 PM", home: "Switzerland", away: "Canada", stage: "Group B" },
    { date: "2026-06-24", time: "12:00 PM", home: "Bosnia and Herzegovina", away: "Qatar", stage: "Group B" },
    { date: "2026-06-24", time: "3:00 PM", home: "Morocco", away: "Haiti", stage: "Group C" },
    { date: "2026-06-24", time: "3:00 PM", home: "Scotland", away: "Brazil", stage: "Group C" },
    { date: "2026-06-24", time: "6:00 PM", home: "South Africa", away: "South Korea", stage: "Group A" },
    { date: "2026-06-24", time: "6:00 PM", home: "Czechia", away: "Mexico", stage: "Group A" },
    { date: "2026-06-25", time: "1:00 PM", home: "Curaçao", away: "Ivory Coast", stage: "Group E" },
    { date: "2026-06-25", time: "1:00 PM", home: "Ecuador", away: "Germany", stage: "Group E" },
    { date: "2026-06-25", time: "4:00 PM", home: "Tunisia", away: "Netherlands", stage: "Group F" },
    { date: "2026-06-25", time: "4:00 PM", home: "Japan", away: "Sweden", stage: "Group F" },
    { date: "2026-06-25", time: "7:00 PM", home: "Türkiye", away: "USA", stage: "Group D" },
    { date: "2026-06-25", time: "7:00 PM", home: "Paraguay", away: "Australia", stage: "Group D" },
    { date: "2026-06-26", time: "12:00 PM", home: "Norway", away: "France", stage: "Group I" },
    { date: "2026-06-26", time: "12:00 PM", home: "Senegal", away: "Iraq", stage: "Group I" },
    { date: "2026-06-26", time: "5:00 PM", home: "Cabo Verde", away: "Saudi Arabia", stage: "Group H" },
    { date: "2026-06-26", time: "5:00 PM", home: "Uruguay", away: "Spain", stage: "Group H" },
    { date: "2026-06-26", time: "8:00 PM", home: "New Zealand", away: "Belgium", stage: "Group G" },
    { date: "2026-06-26", time: "8:00 PM", home: "Egypt", away: "Iran", stage: "Group G" },
    { date: "2026-06-27", time: "2:00 PM", home: "Panama", away: "England", stage: "Group L" },
    { date: "2026-06-27", time: "2:00 PM", home: "Croatia", away: "Ghana", stage: "Group L" },
    { date: "2026-06-27", time: "4:30 PM", home: "Colombia", away: "Portugal", stage: "Group K" },
    { date: "2026-06-27", time: "4:30 PM", home: "DR Congo", away: "Uzbekistan", stage: "Group K" },
    { date: "2026-06-27", time: "7:00 PM", home: "Algeria", away: "Austria", stage: "Group J" },
    { date: "2026-06-27", time: "7:00 PM", home: "Jordan", away: "Argentina", stage: "Group J" },
    // ── Knockout milestones ──────────────────────────────────────────
    { date: "2026-06-28", time: "TBD", home: "Round of 32", away: "",
      venue: "Various", stage: "Round of 32",  label: "Round of 32 begins" },
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


// Returns matches scheduled on `ref`'s local date. Used by the calendar
// card during the tournament to surface "today's games" — typically 2-4
// fixtures during group stage, none on rest days.
export function todaysMatches(ref: Date = new Date(), max: number = 4): WCMatch[] {
  const today = ref.toISOString().slice(0, 10);
  return WC_2026.matches.filter((m) => m.date === today).slice(0, max);
}

// Extracts the country names (home + away) from a match for clickable
// nation chips. Skips "TBD" and the knockout stage names (Round of 16 /
// Semifinal / etc.) that occupy the home field on placeholder rows.
export function nationsForMatch(m: WCMatch): string[] {
  const stageWords = new Set([
    "Round of 32", "Round of 16", "Quarterfinal", "Semifinal",
    "Third Place", "3rd Place", "Final",
  ]);
  const out: string[] = [];
  for (const t of [m.home, m.away]) {
    if (!t || t === "TBD") continue;
    if (stageWords.has(t)) continue;
    out.push(t);
  }
  return out;
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
