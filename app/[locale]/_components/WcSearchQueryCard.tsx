"use client";

import Link from "next/link";
import { useClickTracking } from "@/services/useTracking";

// Card-sized "People also search" surface, sibling to WorldCupCalendarCard.
// Now renders 3-4 queries in a vertical stack (was 1 prominent query).
// Each query is independently clickable + tracked. Parent rotator picks
// which queries to display (sampled from the curated TOP_QUERIES list).
//
// Strategic frame (docs/search-and-content.md 2026-06-05): the WC card
// slot is shared between (calendar = match-schedule demand) and (query
// card = search-engine demo). Together they cover the WC traffic AND
// advertise the engine.

type Props = {
  locale: string;
  // List of queries to display. Parent ensures a small set (3-4 entries)
  // is passed in; trimmed here to MAX so the card height stays predictable.
  queries: string[];
  className?: string;
};

const MAX_QUERIES = 4;

function localePrefix(locale: string): string {
  return locale === "en" ? "" : `/${locale}`;
}

function QueryRow({
  query,
  locale,
  isHero,
}: {
  query: string;
  locale: string;
  isHero?: boolean;
}) {
  const href = `${localePrefix(locale)}/search?q=${encodeURIComponent(query)}`;
  const trackClick = useClickTracking(
    `wc-query-card:${query}`,
    "topic_capsule",
    "cards",
  );
  return (
    <Link
      href={href}
      onClick={trackClick}
      className={[
        "group/row flex items-center justify-between gap-2 rounded-lg px-3",
        "border border-purple-100 bg-white/80 transition-all duration-200",
        "hover:border-purple-300 hover:bg-purple-50/80 hover:shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-purple-400",
        isHero ? "py-2.5" : "py-2",
      ].join(" ")}
      aria-label={`Search: ${query}`}
    >
      <span
        className={[
          "min-w-0 truncate font-semibold text-purple-800",
          isHero ? "text-sm sm:text-base" : "text-xs sm:text-sm",
        ].join(" ")}
      >
        {query}
      </span>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-purple-500 opacity-0 transition-opacity group-hover/row:opacity-100">
        Try →
      </span>
    </Link>
  );
}

export default function WcSearchQueryCard({
  locale,
  queries,
  className,
}: Props) {
  const shown = (queries ?? []).slice(0, MAX_QUERIES);
  if (shown.length === 0) return null;

  // The first query gets slightly more prominence (hero row). The rest are
  // standard rows. All four stay clickable independently — no parent link.
  const [hero, ...rest] = shown;

  return (
    <div
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2",
        "border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50",
        "p-3 shadow-md transition-all duration-300",
        className ?? "",
      ].join(" ")}
      aria-label="Popular World Cup searches"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-2xl" aria-hidden="true">🔍</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
          People are searching
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5">
        <QueryRow query={hero} locale={locale} isHero />
        {rest.map((q) => (
          <QueryRow key={q} query={q} locale={locale} />
        ))}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-purple-100 pt-2">
        <span className="text-[11px] font-semibold text-purple-700">
          ✨ Click any to see visual answers
        </span>
      </div>
    </div>
  );
}
