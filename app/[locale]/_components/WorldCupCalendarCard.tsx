"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useClickTracking } from "@/services/useTracking";
import {
  WC_2026,
  daysUntil,
  matchTrackingId,
  nationsForMatch,
  nextMatches,
  searchQueryForMatch,
  todaysMatches,
  tournamentPhase,
  type WCMatch,
} from "@/lib/wc_2026_schedule";

// Card-sized widget for the FIFA World Cup 2026 schedule. Slots into
// the same grid as NanoInspirationCard. Two phases:
//
//   "before"  — big countdown headline + 3 upcoming match lines (per-line
//               clickable, each line → /search?q=<contextual query>).
//   "during"  — replaces the countdown with TODAY's matches (up to 2),
//               each showing the kickoff time + two clickable nation
//               chips. Each chip → /search?q=<country>+world+cup so the
//               search router can either redirect to the country topic
//               page or serve full search results — same elegance pattern.
//
// Per docs/search-and-content.md 2026-06-05: every clickable element on
// the card is a live demo of the search → visual-answer pattern.

type Props = {
  locale: string;
  className?: string;
};

function localePrefix(locale: string): string {
  return locale === "en" ? "" : `/${locale}`;
}

function nationSearchHref(locale: string, country: string): string {
  return `${localePrefix(locale)}/search?q=${encodeURIComponent(`${country} world cup`)}`;
}

// Per-line clickable for "Upcoming" (pre-tournament view). Each row is a
// search shortcut, same as before.
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

// Single nation chip — clickable, routes through /search so the router
// can resolve to a topic page (`/topics/brazil`) when one exists or fall
// through to full search results when it doesn't. One UX, both targets.
function NationChip({ country, locale, matchId }: { country: string; locale: string; matchId: string }) {
  const href = nationSearchHref(locale, country);
  const trackClick = useClickTracking(
    `wc-calendar:nation:${matchId}:${country.toLowerCase().replace(/\s+/g, "-")}`,
    "topic_capsule",
    "cards",
  );
  return (
    <Link
      href={href}
      onClick={trackClick}
      className="inline-block rounded-md bg-white px-2 py-1 text-xs font-semibold text-emerald-800 shadow-sm transition-all hover:bg-emerald-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
      aria-label={`Search: ${country} world cup`}
    >
      {country}
    </Link>
  );
}

// During-tournament block: shows today's matches (up to 2 by default)
// with kickoff time + clickable nation chips. If no matches today (rest
// day), shows the next 2 from the schedule.
function TodayBlock({ matches, locale }: { matches: WCMatch[]; locale: string }) {
  return (
    <div className="flex flex-col gap-2">
      {matches.map((m) => {
        const id = matchTrackingId(m);
        const nations = nationsForMatch(m);
        return (
          <div key={id} className="rounded-xl border border-emerald-100 bg-white/85 p-2.5 shadow-sm">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider">
              <span className="text-emerald-700">{m.stage}</span>
              {m.time ? <span className="text-neutral-500">{m.time}</span> : null}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {nations.map((c, i) => (
                <Fragment key={`${id}-${c}`}>
                  <NationChip country={c} locale={locale} matchId={id} />
                  {i < nations.length - 1 ? (
                    <span className="text-[10px] font-bold text-neutral-400">vs</span>
                  ) : null}
                </Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function WorldCupCalendarCard({ locale, className }: Props) {
  // Hydrate the current date on the client so the countdown / "today"
  // detection isn't frozen at build time. SSR renders with a server
  // timestamp; effect re-renders with the actual current date on
  // hydration.
  const [now, setNow] = useState<Date>(() => new Date());
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60 * 60 * 1000); // hourly refresh
    return () => clearInterval(id);
  }, []);

  const phase = useMemo(() => tournamentPhase(now), [now]);
  const days = useMemo(() => daysUntil(WC_2026.start, now), [now]);
  const upcoming = useMemo(() => nextMatches(now, 3), [now]);
  // Today's matches during the tournament. If none (rest day), fall back
  // to the next 2 scheduled fixtures so the visual block always has
  // content.
  const todayList = useMemo(() => {
    if (phase !== "during") return [];
    const t = todaysMatches(now, 2);
    return t.length > 0 ? t : nextMatches(now, 2);
  }, [phase, now]);

  const wcHref = `${localePrefix(locale)}/topics/world-cup`;
  const trackFooterClick = useClickTracking("wc-calendar-widget", "topic_capsule", "cards");

  // After the tournament ends, the widget self-suppresses.
  if (phase === "after") return null;

  // Headline copy
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

      {/* Hero zone: pre-tournament shows countdown; during shows today's matches */}
      {phase === "before" ? (
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
      ) : (
        <div className="mb-2 flex flex-col gap-2 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50/60 p-2.5 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
              LIVE
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
              {todaysMatches(now, 1).length > 0 ? "Today" : "Next"}
            </span>
          </div>
          <TodayBlock matches={todayList} locale={locale} />
        </div>
      )}

      {/* Secondary list: pre-tournament shows "Upcoming"; during shows "More to come" with next non-today matches */}
      {phase === "before" ? (
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
      ) : (
        <div className="flex-1 min-h-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">
            Upcoming
          </div>
          <ul className="space-y-0.5 text-[11px] text-neutral-700">
            {nextMatches(now, 3)
              .filter((m) => !todayList.some((t) => matchTrackingId(t) === matchTrackingId(m)))
              .slice(0, 3)
              .map((m) => (
                <UpcomingMatchLine
                  key={matchTrackingId(m)}
                  m={m}
                  locale={locale}
                />
              ))}
          </ul>
        </div>
      )}

      {/* Footer CTA → /topics/world-cup (preserves legacy tracking id) */}
      <div className="mt-2 flex items-center justify-between border-t border-emerald-100 pt-2">
        <Link
          href={wcHref}
          onClick={trackFooterClick}
          className="text-[11px] font-semibold text-emerald-700 hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
        >
          Explore World Cup →
        </Link>
      </div>
    </div>
  );
}
