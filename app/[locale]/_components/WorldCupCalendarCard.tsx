"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useClickTracking } from "@/services/useTracking";
import { WC_2026, daysUntil, nextMatches, tournamentPhase } from "@/lib/wc_2026_schedule";

// Card-sized widget for the FIFA World Cup 2026 schedule. Slots into
// the same grid as NanoInspirationCard (aspect-square outer wrap,
// rounded-2xl border, p-3 padding). Renders countdown + next matches +
// CTA to /topics/world-cup. Auto-hides after the tournament ends.
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
  const trackClick = useClickTracking("wc-calendar-widget", "topic_capsule", "cards");

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
    <Link
      href={wcHref}
      onClick={trackClick}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2",
        "border-emerald-300 bg-gradient-to-br from-emerald-50 via-yellow-50 to-rose-50",
        "p-3 shadow-md transition-all duration-300 cursor-pointer hover:border-emerald-500 hover:shadow-2xl",
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

      {/* Upcoming matches list */}
      <div className="flex-1 min-h-0">
        <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
          Upcoming
        </div>
        <ul className="space-y-1 text-[11px] text-neutral-700">
          {upcoming.map((m, i) => (
            <li key={i} className="flex items-baseline gap-1.5 leading-tight">
              <span className="font-mono text-emerald-700 shrink-0">
                {m.date.slice(5)}
              </span>
              <span className="truncate">
                {m.label
                  ? m.label
                  : m.away
                    ? `${m.home} vs ${m.away}`
                    : m.home}
                {m.stage ? <span className="text-neutral-500"> · {m.stage}</span> : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer CTA */}
      <div className="mt-2 flex items-center justify-between border-t border-emerald-100 pt-2">
        <span className="text-[11px] font-semibold text-emerald-700 group-hover:underline">
          View full schedule →
        </span>
      </div>
    </Link>
  );
}
