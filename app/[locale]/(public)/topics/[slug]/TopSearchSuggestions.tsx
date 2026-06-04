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
const TOP_QUERIES: Record<string, string[]> = {
  "world-cup": [
    "World Cup 2026 schedule",
    "Argentina vs Brazil all time",
    "World Cup all time top scorers",
    "Iconic World Cup goals",
    "Messi vs Ronaldo World Cup",
    "Brazil 2002 squad",
    "Maradona Hand of God",
    "FIFA Women's World Cup 2027",
    "World Cup hosts history",
    "England 1966 World Cup",
  ],
};

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

export default function TopSearchSuggestions({ locale, topicId, heading }: Props) {
  const queries = TOP_QUERIES[topicId];
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
