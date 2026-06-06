"use client";

import MetaChipLink from "@/app/[locale]/_components/MetaChipLink";
import { useClickTracking } from "@/services/useTracking";

function buildSearchHref(locale: string, query: string): string {
  const lp = locale === "en" ? "" : `/${locale}`;
  return `${lp}/search?q=${encodeURIComponent(query)}`;
}

// Hard-coded high-signal queries per topic. Renders only when the topic
// has a curated list — keeps the surface narrow and editorial. Refresh
// quarterly against GSC top-queries data.
//
// Exported so WcRotatingSlot can sample from the same list — single
// source of truth for the WC "People also search" surface.
//
// Only queries with real on-intent content backing are listed here.
// Disabled candidates are kept in DISABLED_TOP_QUERIES below for
// re-enablement once the referenced content / precision work ships.
export const TOP_QUERIES: Record<string, string[]> = {
  "world-cup": [
    "World Cup 2026 schedule",
    "World Cup all time top scorers",
    "Messi vs Ronaldo World Cup",
    "Brazil 2002 squad",
    "FIFA Women's World Cup 2027",
    "World Cup hosts history",
    "England 1966 World Cup",
  ],
};

// Disabled 2026-06-07 (Task #66) — kept as a queue for re-enablement.
// Each entry documents the gap blocking the query. Promote back into
// TOP_QUERIES["world-cup"] once the `needs` ships.
export const DISABLED_TOP_QUERIES: Array<{
  topic: string;
  query: string;
  reason: string;
  needs: string;
}> = [
  {
    topic: "world-cup",
    query: "Argentina vs Brazil all time",
    reason: "Aliased into per-country WC history timelines via argentina_brazil_rivalry family; no BR-AR rivalry-shape content exists.",
    needs: "Generate 4-6 sports-battle examples between Argentina and Brazil (e.g. Maradona/Pelé era, Messi vs Ronaldinho, 2021 Copa America), then re-attach the alias family at inspiration level via topup `inspiration_filter`.",
  },
  {
    topic: "world-cup",
    query: "Iconic World Cup goals",
    reason: "63 recall hits but top template celebrity-movie-group-poster is off-intent — alias overspread on the `goals` token surfaces non-WC group posters.",
    needs: "Run scripts/prune_search_aliases.py to drop the `goals`/`goal` aliases from celebrity-movie-group-poster, then re-attach at inspiration level only on actual WC-goal examples (none exist yet — also needs content gen).",
  },
  {
    topic: "world-cup",
    query: "Maradona Hand of God",
    reason: "Aliased into Argentina WC history timeline (mentions Maradona 1986) via wc_iconic_moments_history. No single-iconic-moment story-shape content exists for Hand of God.",
    needs: "Define `template-iconic-moment-story` (Tier II=story × I=football moment × III=poster) or batch-gen Hand of God / Zidane headbutt / Brazil 7-1 under an existing story template, then tighten the family alias to inspiration-filter scope.",
  },
  {
    topic: "world-cup",
    query: "World Cup trivia",
    reason: "63 recall hits with the same precision issue as Iconic World Cup goals — top template celebrity-movie-group-poster is off-intent. Trivia-shape content (cold facts / weird facts grids) isn't WC-specific in the catalog.",
    needs: "Prune `trivia`/`fun facts` alias spread from off-intent templates + generate WC-specific examples under `template-weird-science-facts-infographic` or a future `template-sports-fact-grid`.",
  },
  {
    topic: "world-cup",
    query: "most memorable World Cup moments",
    reason: "Aliased into per-country WC history timelines via wc_iconic_moments_history. No curated moments-collection content exists.",
    needs: "Either ship `template-iconic-moment-story` (see Hand of God) + 8-12 examples, or batch-gen a `World Cup memorable moments grid` example under celebrity-movie-group-poster with explicit moment metadata.",
  },
];

type Props = {
  locale: string;
  topicId: string;
  heading?: string;
};

function QueryChip({ query, locale }: { query: string; locale: string }) {
  const trackClick = useClickTracking(`top-query:${query}`, "topic_capsule", "cards");
  const href = buildSearchHref(locale, query);
  return (
    <MetaChipLink href={href} onClick={trackClick} size="small" color="blue">
      {query}
    </MetaChipLink>
  );
}

// World-Cup pages (the tier-1 + all country-WC tier-2 pages) share the
// same curated query list. Country-specific lists can be added by giving
// the topic an explicit entry in TOP_QUERIES above.
function isWorldCupPage(topicId: string): boolean {
  return topicId === "world-cup" || topicId.endsWith("-world-cup");
}

export default function TopSearchSuggestions({ locale, topicId, heading }: Props) {
  const queries = TOP_QUERIES[topicId]
    ?? (isWorldCupPage(topicId) ? TOP_QUERIES["world-cup"] : undefined);
  if (!queries || !queries.length) return null;
  return (
    <div>
      {heading ? (
        <h2 className="text-xl font-semibold tracking-tight text-neutral-900 mb-3">
          {heading}
        </h2>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {queries.map((q) => (
          <QueryChip key={q} query={q} locale={locale} />
        ))}
      </div>
    </div>
  );
}
