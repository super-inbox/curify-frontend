"use client";

import { useEffect, useMemo, useState } from "react";
import { useClickTracking } from "@/services/useTracking";
import WorldCupCalendarCard from "./WorldCupCalendarCard";
import WcSearchQueryCard from "./WcSearchQueryCard";

// Wraps the WC card slot and alternates between the calendar card and a
// "People also search" query card. Initial pick is random per page-load
// (50/50). A small toggle in the corner lets the user flip between the
// two surfaces.
//
// The shared WC top-query list lives at TopSearchSuggestions.tsx
// (curated, refresh quarterly against GSC). This component imports the
// list lazily so both files share a single source of truth.

type Props = {
  locale: string;
  // Curated WC query list — passed in by the parent so this component
  // stays presentation-only. Optional/defaulted: callers pass
  // TOP_QUERIES["world-cup"], which can be undefined when that key is
  // disabled/removed (see TopSearchSuggestions DISABLED_TOP_QUERIES). A
  // missing array must NOT crash the page — fall back to calendar-only.
  queries?: string[];
  className?: string;
};

type Mode = "calendar" | "query";

const QUERIES_PER_VIEW = 4;

// Returns a stable random sample of up to N queries — Fisher-Yates style
// but only mutates a local copy. Deterministic given a seed (Math.random
// per call, used in a client effect after hydration).
function sampleQueries(queries: string[], n: number): string[] {
  const pool = [...queries];
  const out: string[] = [];
  while (pool.length > 0 && out.length < n) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

function pickRandomMode(): Mode {
  return Math.random() < 0.5 ? "calendar" : "query";
}

export default function WcRotatingSlot({ locale, queries = [], className }: Props) {
  const hasQueries = queries.length > 0;
  // Server render with a deterministic default (calendar) so SSR markup is
  // stable. Client effect re-rolls on mount so the user sees the random
  // pick after hydration. With no queries, stay calendar-only.
  const [mode, setMode] = useState<Mode>("calendar");
  // First N queries server-side for stable SSR. Client effect re-samples.
  const [shown, setShown] = useState<string[]>(() => queries.slice(0, QUERIES_PER_VIEW));

  useEffect(() => {
    if (!hasQueries) return; // nothing to rotate into — calendar only
    setMode(pickRandomMode());
    setShown(sampleQueries(queries, QUERIES_PER_VIEW));
  }, [queries, hasQueries]);

  const otherMode: Mode = mode === "calendar" ? "query" : "calendar";
  const trackToggle = useClickTracking(`wc-slot-toggle:${otherMode}`, "topic_capsule", "cards");

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    trackToggle();
    setMode(otherMode);
    // Re-sample queries when toggling INTO query mode so repeat toggles
    // surface a fresh set instead of the same 4.
    if (otherMode === "query") setShown(sampleQueries(queries, QUERIES_PER_VIEW));
  };

  const toggleLabel = mode === "calendar" ? "Show a popular search" : "Show the calendar";
  const toggleIcon = mode === "calendar" ? "🔍" : "📅";

  return (
    <div className={["relative h-full", className ?? ""].join(" ")}>
      {mode === "calendar" ? (
        <WorldCupCalendarCard locale={locale} />
      ) : (
        <WcSearchQueryCard locale={locale} queries={shown} />
      )}

      {/* Toggle button — top-right corner, small + unobtrusive. Only shown
          when there are queries to rotate into; otherwise calendar-only. */}
      {hasQueries && (
        <button
          type="button"
          onClick={handleToggle}
          aria-label={toggleLabel}
          title={toggleLabel}
          className={[
            "absolute right-2 top-2 z-10",
            "flex items-center justify-center w-7 h-7 rounded-full",
            "bg-white/85 backdrop-blur-sm shadow-sm border border-neutral-200",
            "text-sm transition-all hover:scale-110 hover:bg-white hover:shadow-md",
            "focus:outline-none focus:ring-2 focus:ring-neutral-400",
          ].join(" ")}
        >
          <span aria-hidden="true">{toggleIcon}</span>
        </button>
      )}
    </div>
  );
}
