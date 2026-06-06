"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useClickTracking } from "@/services/useTracking";
import {
  WC_2026,
  daysUntil,
  matchTrackingId,
  nextMatches,
  searchQueryForMatch,
  tournamentPhase,
  type WCMatch,
} from "@/lib/wc_2026_schedule";

// Card-sized widget for the FIFA World Cup 2026 schedule. Slots into
// the same grid as NanoInspirationCard (aspect-square outer wrap,
// rounded-2xl border, p-3 padding). Renders countdown + next matches +
// per-line clickable search links + footer CTA. Auto-hides after the
// tournament ends.
//
// Per docs/search-and-content.md 2026-06-05 strategic reframe: each
// Upcoming line is its own clickable demo of the search → visual-answer
// pattern. Click → /search?q=<contextual query> derived per match.
//
// Mounted on:
//   - /topics/world-cup
//   - /topics/sports
//   - Home (HomeClient)

type Props = {
  locale: string;
  className?: string;
};

function localePrefix(locale: string): string {
  return locale === "en" ? "" : `/${locale}`;
}

// Per-line clickable component. Lives outside the parent because
// useClickTracking is a hook and can't be called in a render-time loop.
function UpcomingMatchLine({ m, locale }: { m: WCMatch; locale: string }) {
  const id = matchTrackingId(m);
  const query = searchQueryForMatch(m);
  const href = `${localePrefix(locale)}/search?q=${encodeURIComponent(query)}`;
  const trackClick = useClickTracking(`wc-calendar:match:${id}`, "topic_capsule", "cards");
  return (
    <li>
      <Link
        href={href}
        onClick={trackClick}
        className="flex items-baseline gap-1.5 leading-tight rounded px-1 -mx-1 transition-colors hover:bg-emerald-100/60 hover:text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        aria-label={`Search: ${query}`}
      >
        <span className="font-mono text-emerald-700 shrink-0">{m.date.slice(5)}</span>
        <span className="truncate">
          {m.label
            ? m.label
            : m.away
              ? `${m.home} vs ${m.away}`
              : m.home}
          {m.stage ? <span className="text-neutral-500"> · {m.stage}</span> : null}
        </span>
      </Link>
    </li>
  );
}

export default function WorldCupCalendarCard({ locale, className }: Props) {
  // Hydrate the current date on the client so the countdown isn't frozen
  // at build time. SSR renders with a server timestamp; effect re-renders
  // with the actual current date on hydration.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60 * 60 * 1000); // hourly refresh
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(() => tournamentPhase(now), [now]);
  const days = useMemo(() => daysUntil(WC_2026.start, now), [now]);
  const upcoming = useMemo(() => nextMatches(now, 3), [now]);

  const wcHref = `${localePrefix(locale)}/topics/world-cup`;
  // Footer CTA preserves the legacy wc-calendar-widget tracking id so the
  // existing 19-click-per-14d engagement metric continues uninterrupted.
  // Per-match line clicks land on a new content_id pattern
  // (wc-calendar:match:<id>), giving us per-line CTR alongside it.
  const trackFooterClick = useClickTracking("wc-calendar-widget", "topic_capsule", "cards");

  // After the tournament ends, the widget self-suppresses.
  if (phase === "after") return null;

  // Headline copy by phase
  let headline: string;
  let sub: string;
  if (phase === "before") {
    headline = days === 0 ? "Today!" : days === 1 ? "Tomorrow" : `${days} days`;
    sub = days <= 1 ? "FIFA WC 2026 kicks off" : "to FIFA WC 2026";
  } else {
    headline = "LIVE";
    sub = "FIFA WC 2026 — in progress";
  }

  return (
    <div
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2",
        "border-emerald-300 bg-gradient-to-br from-emerald-50 via-yellow-50 to-rose-50",
        "p-3 shadow-md transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl",
        className ?? "",
      ].join(" ")}
      aria-label="FIFA World Cup 2026 calendar"
    >
      {/* Top: emblem + tournament name */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" aria-hidden="true">⚽</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
          FIFA World Cup 2026
        </span>
      </div>

      {/* Countdown — fills the square visual zone */}
      <div className="relative mb-2 flex aspect-[1/1] flex-col items-center justify-center overflow-hidden rounded-xl border border-emerald-100 bg-white/70 shadow-inner">
        <div className="text-5xl sm:text-6xl font-extrabold leading-none text-emerald-700">
          {headline}
        </div>
        <div className="mt-2 text-xs sm:text-sm font-medium text-neutral-700 text-center px-2">
          {sub}
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">
          🔥 Hot
        </div>
      </div>

      {/* Upcoming matches list — per-line clickable */}
      <div className="flex-1 min-h-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
          Upcoming
        </div>
        <ul className="space-y-0.5 text-[11px] text-neutral-700">
          {upcoming.map((m) => (
            <UpcomingMatchLine
              key={matchTrackingId(m)}
              m={m}
              locale={locale}
            />
          ))}
        </ul>
      </div>

      {/* Footer CTA → /topics/world-cup (preserves legacy tracking id) */}
      <div className="mt-2 flex items-center justify-between border-t border-emerald-100 pt-2">
        <Link
          href={wcHref}
          onClick={trackFooterClick}
          className="text-[11px] font-semibold text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
        >
          View full schedule →
        </Link>
      </div>
    </div>
  );
}
