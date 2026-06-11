"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { filterSuggestions, DEFAULT_FOCUS_SUGGESTIONS } from "@/lib/searchIndex";
import { useTracking } from "@/services/useTracking";

type Props = { locale: string };

export default function SearchBar({ locale }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { track } = useTracking();
  const t = useTranslations("topics");
  // Guard so we only fire ONE focus event per session-of-this-mount,
  // not on every focus regain. Pairs with the SEARCH submit event so we
  // can compute "opened dropdown / didn't submit" as a funnel rung.
  const focusFiredRef = useRef(false);

  // Fired the first time the SearchBar dropdown is opened in a session.
  // content_id `searchbar-focus` is a fixed string (not a query) so the
  // event is countable without per-query cardinality blowup. Action_type
  // reuses "click" — there's no "focus" enum; backend silently drops
  // unknown values (feedback_tracking_enums memory).
  const trackFocusOnce = useCallback(() => {
    if (focusFiredRef.current) return;
    focusFiredRef.current = true;
    track({
      contentId: "searchbar-focus",
      contentType: "topic_capsule",
      actionType: "click",
    });
  }, [track]);

  // Localized label resolver — returns the locale's displayName or undefined.
  // Used for both rendering chips and matching user queries in the user's language.
  const localize = useCallback(
    (slug: string) => (t.has(`${slug}.displayName`) ? t(`${slug}.displayName`) : undefined),
    [t]
  );
  const renderLabel = useCallback(
    (slug: string, fallback: string) => localize(slug) ?? fallback,
    [localize]
  );

  const suggestions = query.trim()
    ? filterSuggestions(query, 8, localize)
    : DEFAULT_FOCUS_SUGGESTIONS;

  const navigate = useCallback((
    slug: string,
    label: string,
    href?: string,
    searchFallback?: boolean,
    queryStr?: string,
  ) => {
    const q = slug || query.trim();
    track({ contentId: label || q, contentType: "topic_capsule", actionType: "search" });
    setOpen(false);
    setQuery("");
    if (href) router.push(`/${locale}${href}`);
    else if (searchFallback) {
      router.push(`/${locale}/search?q=${encodeURIComponent(queryStr ?? slug)}`);
      // Bypass Next.js Router Cache so a stale empty-result RSC payload
      // from a pre-deploy attempt doesn't get served on the same query.
      router.refresh();
    }
    else router.push(`/${locale}/topics/${q}`);
  }, [locale, query, router, track]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    track({ contentId: q, contentType: "topic_capsule", actionType: "search" });
    setOpen(false);
    setQuery("");
    // Try to match a known topic/tool entry; fall back to search results page
    const exact = filterSuggestions(q, 1, localize)[0];
    const exactLocalized = exact ? localize(exact.slug)?.toLowerCase() : undefined;
    if (exact && (exact.slug === q || exact.label.toLowerCase() === q || exactLocalized === q)) {
      if (exact.searchFallback) {
        router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
        router.refresh();
      } else {
        router.push(exact.href ? `/${locale}${exact.href}` : `/${locale}/topics/${exact.slug}`);
      }
    } else {
      router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
      router.refresh();
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Search className="absolute left-4 h-5 w-5 text-blue-500 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { setOpen(true); trackFocusOnce(); }}
            placeholder="Search templates, styles, topics…"
            className="w-full rounded-2xl border-2 border-blue-200 bg-white py-3.5 pl-12 pr-10 text-base text-neutral-900 placeholder:text-neutral-500 shadow-sm hover:border-blue-300 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3.5 rounded-full p-0.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden">
          <div className="px-3 pt-3 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
              {query.trim() ? "Suggestions" : "Popular topics"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 px-3 pb-3 pt-1.5">
            {suggestions.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => navigate(s.slug, renderLabel(s.slug, s.label), s.href, s.searchFallback, s.aliases?.[0])}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-base text-neutral-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {s.emoji && <span aria-hidden="true">{s.emoji}</span>}
                {renderLabel(s.slug, s.label)}
              </button>
            ))}
          </div>
          {query.trim() && suggestions.length === 0 && (
            <p className="px-4 pb-3 text-sm text-neutral-400">No matching topics — press Enter to search</p>
          )}
        </div>
      )}
    </div>
  );
}
