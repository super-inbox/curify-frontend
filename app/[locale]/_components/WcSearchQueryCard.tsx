"use client";

import Link from "next/link";
import { useClickTracking } from "@/services/useTracking";

// Card-sized "People also search" surface, sibling to WorldCupCalendarCard.
// Renders ONE query from the supplied list (random pick happens in the
// parent rotator so the same query is stable across re-renders within a
// session).
//
// Strategic frame (docs/search-and-content.md 2026-06-05): the WC card
// slot is shared between (calendar = match-schedule demand) and (query
// card = search-engine demo). Both live in the same slot, alternated by
// WcRotatingSlot. Together they cover the WC traffic AND advertise the
// engine without forcing the per-line search-routing bet alone.

type Props = {
  locale: string;
  query: string;
  className?: string;
};

function localePrefix(locale: string): string {
  return locale === "en" ? "" : `/${locale}`;
}

export default function WcSearchQueryCard({ locale, query, className }: Props) {
  const href = `${localePrefix(locale)}/search?q=${encodeURIComponent(query)}`;
  // Tracking content_id is namespaced under wc-query-card:<query> so it
  // doesn't collide with the top-query:<query> chips on the topics page.
  const trackClick = useClickTracking(`wc-query-card:${query}`, "topic_capsule", "cards");

  return (
    <Link
      href={href}
      onClick={trackClick}
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border-2",
        "border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50",
        "p-3 shadow-md transition-all duration-300 cursor-pointer hover:border-purple-500 hover:shadow-2xl",
        "focus:outline-none focus:ring-2 focus:ring-purple-400",
        className ?? "",
      ].join(" ")}
      aria-label={`Search: ${query}`}
    >
      {/* Top: emblem + label */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl" aria-hidden="true">🔍</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
          People are searching
        </span>
      </div>

      {/* Center: the query, big and inviting */}
      <div className="relative mb-2 flex aspect-[1/1] flex-col items-center justify-center overflow-hidden rounded-xl border border-purple-100 bg-white/70 shadow-inner px-3">
        <div className="text-center text-xl sm:text-2xl font-bold leading-tight text-purple-800">
          {query}
        </div>
        <div className="absolute bottom-2 right-2 text-[10px] font-bold uppercase tracking-wider text-amber-600">
          ✨ Try it
        </div>
      </div>

      {/* Bottom hint */}
      <div className="flex-1 min-h-0 flex flex-col justify-end">
        <p className="text-[11px] text-neutral-700 leading-tight">
          Click to see visual answers for this query — examples, templates, ready-to-generate prompts.
        </p>
      </div>

      {/* Footer CTA */}
      <div className="mt-2 flex items-center justify-between border-t border-purple-100 pt-2">
        <span className="text-[11px] font-semibold text-purple-700 group-hover:underline">
          See visual answers →
        </span>
      </div>
    </Link>
  );
}
