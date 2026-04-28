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

  const navigate = useCallback((slug: string, label: string) => {
    const q = slug || query.trim();
    track({ contentId: label || q, contentType: "topic_capsule", actionType: "search" });
    setOpen(false);
    setQuery("");
    router.push(`/${locale}/topics/${q}`);
  }, [locale, query, router, track]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim().toLowerCase();
    if (!q) return;
    track({ contentId: q, contentType: "topic_capsule", actionType: "search" });
    setOpen(false);
    setQuery("");
    // Try to match a known topic slug; fall back to search results page
    const exact = filterSuggestions(q, 1, localize)[0];
    const exactLocalized = exact ? localize(exact.slug)?.toLowerCase() : undefined;
    if (exact && (exact.slug === q || exact.label.toLowerCase() === q || exactLocalized === q)) {
      router.push(`/${locale}/topics/${exact.slug}`);
    } else {
      router.push(`/${locale}/search?q=${encodeURIComponent(q)}`);
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
          <Search className="absolute left-3.5 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            placeholder="Search templates, styles, topics…"
            className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-9 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {query && (
            <button
              type="button"
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-3 text-neutral-400 hover:text-neutral-600"
            >
              <X className="h-3.5 w-3.5" />
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
          <div className="flex flex-wrap gap-1.5 px-3 pb-3 pt-1.5">
            {suggestions.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => navigate(s.slug, renderLabel(s.slug, s.label))}
                className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer"
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
