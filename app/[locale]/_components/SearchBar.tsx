"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  filterSuggestions,
  DEFAULT_FOCUS_SUGGESTIONS,
  TIER1_CHIP_SETS,
  ALL_SUGGESTIONS,
  type SuggestionEntry,
} from "@/lib/searchIndex";
import { POPULAR_PREFILL_QUERIES } from "@/lib/popularPrefillQueries";
import { useTracking } from "@/services/useTracking";

// Fisher-Yates shuffle, returns a NEW array (doesn't mutate input).
function shuffled<T>(arr: ReadonlyArray<T>): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PLACEHOLDER_ROTATE_MS = 3500;
// Visible prefix on the rotating placeholder. Kept as a constant so the
// onInputFocus DOM-read and the rendered placeholder stay in sync — the
// strip-logic depends on this exact string.
const PLACEHOLDER_PREFIX = "✨ ";

type Props = { locale: string };

export default function SearchBar({ locale }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // On /search results page: prefill from ?q= and disable rotation
  // (refine mode — matches Google/Bing/Pinterest convention). Match any
  // path ending in /search so locale prefix (/en/search, /zh/search) works.
  const isSearchPage = (pathname ?? "").endsWith("/search");
  const urlQuery = searchParams?.get("q") ?? "";

  const [query, setQuery] = useState(isSearchPage ? urlQuery : "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { track } = useTracking();
  const t = useTranslations("topics");

  // Keep the input synced with the URL when navigating between /search?q=…
  // results (e.g. user clicks a suggestion chip on the results page).
  // SearchBar is mounted in the layout so it doesn't remount across nav.
  useEffect(() => {
    if (isSearchPage) setQuery(urlQuery);
  }, [isSearchPage, urlQuery]);
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

  // Rotating placeholder — shuffled once per mount, advances every
  // PLACEHOLDER_ROTATE_MS while the input is unfocused + empty. Pauses
  // on focus, when the user types, or on the /search results page
  // (refine mode — see isSearchPage above). Respects prefers-reduced-motion.
  const shuffledQueriesRef = useRef<string[]>(shuffled(POPULAR_PREFILL_QUERIES));
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  // Track the interval id so onFocus can synchronously kill any pending
  // tick — React's effect cleanup runs on the NEXT render cycle which
  // can fire after the user has already pressed Enter, causing
  // submit-mismatch with what they saw at focus time.
  const intervalIdRef = useRef<number | null>(null);
  // Snapshot of the placeholder query at focus time. handleSubmit's
  // empty-fallback prefers this over the (possibly-advanced) idx so we
  // always submit exactly what the user clicked on.
  const focusedPlaceholderRef = useRef<string>("");
  const isPaused = isSearchPage || open || query.length > 0;
  useEffect(() => {
    if (isPaused) return;
    if (typeof window !== "undefined"
      && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % shuffledQueriesRef.current.length);
    }, PLACEHOLDER_ROTATE_MS);
    intervalIdRef.current = id;
    return () => {
      window.clearInterval(id);
      intervalIdRef.current = null;
    };
  }, [isPaused]);
  const rotatingPlaceholder = isSearchPage
    ? "Refine your search…"
    : `${PLACEHOLDER_PREFIX}${shuffledQueriesRef.current[placeholderIdx]}`;

  const onInputFocus = useCallback(() => {
    // Snap the placeholder DIRECTLY from the input's DOM attribute —
    // that's what the user is actually looking at, regardless of any
    // in-flight React state update that closure capture would miss.
    // Falls back to the closure idx if DOM read returns nothing (e.g.,
    // focus fired before first paint).
    const dom = inputRef.current?.placeholder ?? "";
    const fromDom = dom.startsWith(PLACEHOLDER_PREFIX)
      ? dom.slice(PLACEHOLDER_PREFIX.length).trim()
      : "";
    focusedPlaceholderRef.current =
      fromDom || shuffledQueriesRef.current[placeholderIdx] || "";
    if (intervalIdRef.current !== null) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setOpen(true);
    trackFocusOnce();
  }, [placeholderIdx, trackFocusOnce]);

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

  // Build a slug→SuggestionEntry index ONCE per mount for the grouped
  // focus view. Lookup is read-only; the index isn't recomputed unless
  // ALL_SUGGESTIONS itself changes (module-static at build time).
  const suggestionBySlug = useRef<Map<string, SuggestionEntry>>(
    new Map(ALL_SUGGESTIONS.map((s) => [s.slug, s]))
  ).current;

  // For the focus-state grouped view: resolve each tier1's chip slugs into
  // full SuggestionEntries (emoji + label + searchFallback + href). Slugs
  // not found in ALL_SUGGESTIONS (e.g., unlocalized world-cup country edits)
  // get a minimal default entry so the chip still renders.
  const groupedFocusSections = TIER1_CHIP_SETS.map(({ tier1, chips }) => {
    const t1Entry = suggestionBySlug.get(tier1);
    const t1Label = renderLabel(tier1, t1Entry?.label ?? tier1);
    const t1Emoji = t1Entry?.emoji;
    const items = chips
      .map((slug): SuggestionEntry => {
        const found = suggestionBySlug.get(slug);
        if (found) return found;
        // Fallback for slugs not in ALL_SUGGESTIONS — route to /search
        // so the chip still works even if the topic page isn't registered.
        const spaced = slug.replace(/-/g, " ");
        return {
          slug,
          label: spaced.replace(/\b\w/g, (c) => c.toUpperCase()),
          tier: 3 as const,
          searchFallback: true,
        };
      });
    return { tier1, t1Label, t1Emoji, items };
  });

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
    // Empty submit → adopt the placeholder visible AT FOCUS TIME (the
    // snapshot captured in onInputFocus). Prefer the snapshot over the
    // live placeholderIdx because a rotation tick may have queued after
    // focus but before this submit handler ran — without the snapshot,
    // we'd submit a query different from what the user clicked on.
    // No fallback on /search (refine-mode placeholder is "Refine your
    // search…", not a real query).
    let q = query.trim().toLowerCase();
    if (!q && !isSearchPage) {
      // Priority: focus-time snapshot → live DOM placeholder → closure idx.
      // The DOM read is the single source of truth for what the user sees
      // right NOW (rotation is paused while focused, so DOM == snapshot in
      // the happy path, but DOM wins if anything got out of sync).
      const dom = inputRef.current?.placeholder ?? "";
      const fromDom = dom.startsWith(PLACEHOLDER_PREFIX)
        ? dom.slice(PLACEHOLDER_PREFIX.length).trim().toLowerCase()
        : "";
      q = (focusedPlaceholderRef.current.toLowerCase()
        || fromDom
        || (shuffledQueriesRef.current[placeholderIdx] ?? "").toLowerCase()
        || "").trim();
      if (q) {
        // Lightweight signal that a placeholder-adopt path fired — fixed
        // content_id keeps cardinality bounded; the query itself goes into
        // the SEARCH event below so we can still attribute downstream clicks.
        track({ contentId: "placeholder-adopt", contentType: "topic_capsule", actionType: "click" });
      }
    }
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
            onFocus={onInputFocus}
            placeholder={rotatingPlaceholder}
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
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-lg">
          {query.trim() ? (
            <>
              <div className="px-3 pt-3 pb-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Suggestions
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
              {suggestions.length === 0 && (
                <p className="px-4 pb-3 text-sm text-neutral-400">No matching topics — press Enter to search</p>
              )}
            </>
          ) : (
            <div className="px-3 py-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                Browse by category
              </p>
              <div className="flex flex-col gap-3">
                {groupedFocusSections.map(({ tier1, t1Label, t1Emoji, items }) => (
                  <div key={tier1}>
                    <div className="mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                      {t1Emoji && <span aria-hidden="true" className="text-sm">{t1Emoji}</span>}
                      <span>{t1Label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((s) => (
                        <button
                          key={s.slug}
                          type="button"
                          onClick={() => navigate(s.slug, renderLabel(s.slug, s.label), s.href, s.searchFallback, s.aliases?.[0])}
                          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          {s.emoji && <span aria-hidden="true">{s.emoji}</span>}
                          {renderLabel(s.slug, s.label)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
