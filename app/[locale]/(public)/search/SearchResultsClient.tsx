"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import ExampleImagesGrid from "@/app/[locale]/(public)/nano-template/[slug]/ExampleImagesGrid";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import PromptCard from "@/app/[locale]/(public)/nano-banana-pro-prompts/PromptCard";
import GenerableTemplatesSection from "./GenerableTemplatesSection";
import TopicStrip, { type TopicStripItem } from "@/app/[locale]/_components/TopicStrip";
import { resolveTopicPath } from "@/lib/topic_path_overrides";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import type { SuggestionEntry } from "@/lib/searchIndex";
import type { NanoPromptBase } from "@/types/nanoPrompts";
import type { IntentChip } from "@/lib/intent_clusters";
import { useTracking } from "@/services/useTracking";

type InspRecord = {
  id: string;
  template_id: string;
  asset: {
    preview_image_url: string;
    image_url: string;
    video_url?: string;
  };
  params?: Record<string, unknown>;
  topics?: string[];
  tags?: string[];
  locales?: Record<string, { title?: string; category?: string }>;
};

type Props = {
  query: string;
  locale: string;
  inspirations: InspRecord[];
  relatedTopics: SuggestionEntry[];
  matchedTemplates: NanoInspirationCardType[];
  galleryPrompts: NanoPromptBase[];
  /** LLM-rewritten queries used to expand the result set when the
   *  original returned <3 results. Empty when the original was rich
   *  enough or when the rewriter was unavailable. Surfaced to the
   *  user via a "Showing results for: …" hint above the grid. */
  usedRewrites?: string[];
  /** Number of retrieval paths actually unioned by the server (1 = just
   *  the original query; >1 = multi-query expansion fired). Drives the
   *  `|paths=N` admin tracking suffix so SQL can split "thin after 8
   *  paths tried" from "thin after rewrite only" without a second event. */
  pathsUsed?: number;
  /** Top output-type slugs derived from matched templates' topics —
   *  Pinterest-style "Explore further" chip row above the example
   *  grid. Empty when no chip clears the minCount threshold. */
  intentChips?: IntentChip[];
  /** When set, results are already narrowed to this output-type slug
   *  (user clicked a chip). Renders a removable header pill. */
  withinSlug?: string;
};

// Compute the href for a SuggestionEntry chip — honors `href` overrides
// for non-topic destinations and routes `searchFallback` entries (nano-tag
// suggestions) through /search?q= so they re-render this same page.
function chipHref(s: SuggestionEntry, locale: string): string {
  if (s.href) return `/${locale}${s.href}`;
  if (s.searchFallback) {
    const q = s.aliases?.[0] ?? s.slug;
    return `/${locale}/search?q=${encodeURIComponent(q)}`;
  }
  return `/${locale}/topics/${s.slug}`;
}

// Bare (locale-prefix-free) variant of chipHref. TopicStrip prepends
// /<locale> itself via getCanonicalPath, so we pass the raw path.
// Honors TOPIC_PATH_OVERRIDES so slugs with stronger use-case landings
// (e.g. design → /use-cases/for-designers) route there everywhere
// the strip is mounted.
function chipBarePath(s: SuggestionEntry): string {
  if (s.href) return s.href;
  if (s.searchFallback) {
    const q = s.aliases?.[0] ?? s.slug;
    return `/search?q=${encodeURIComponent(q)}`;
  }
  return resolveTopicPath(s.slug);
}

export default function SearchResultsClient({
  query,
  locale,
  inspirations,
  relatedTopics,
  matchedTemplates,
  galleryPrompts,
  usedRewrites = [],
  pathsUsed = 1,
  intentChips = [],
  withinSlug,
}: Props) {
  const [input, setInput] = useState(query);
  const router = useRouter();
  const t = useTranslations("topics");
  const localize = useCallback(
    (slug: string) => (t.has(`${slug}.displayName`) ? t(`${slug}.displayName`) : undefined),
    [t]
  );
  const renderLabel = useCallback(
    (slug: string, fallback: string) => localize(slug) ?? fallback,
    [localize]
  );

  // Adapter — SuggestionEntry[] → TopicStripItem[] for the Canva-style
  // related-topics strips (empty-state + bottom soft-footer).
  const relatedTopicStripItems: TopicStripItem[] = useMemo(
    () =>
      relatedTopics.map((s) => ({
        slug: s.slug,
        path: chipBarePath(s),
        label: renderLabel(s.slug, s.label),
      })),
    [relatedTopics, renderLabel]
  );

  // Cap at 3 examples per template_id — keeps results diverse without
  // crowding the grid with near-duplicate variants of the same template.
  // Then map to the shape ExampleImagesGrid expects.
  const gridItems = useMemo(() => {
    const counts = new Map<string, number>();
    return inspirations
      .filter((r) => {
        const n = counts.get(r.template_id) ?? 0;
        if (n >= 3) return false;
        counts.set(r.template_id, n + 1);
        return true;
      })
      .map((r) => {
        // Caption fallback chain: prefer locales.[locale].title (i18n);
        // then EN/ZH title; then locales.category; then the first
        // non-empty param value (humanized); finally, strip the
        // template_id prefix from the id and title-case the suffix.
        // Keeps the search grid readable for records where authored
        // i18n is sparse without showing raw slugs.
        const titleForCaption = (() => {
          const direct =
            r.locales?.[locale]?.title ||
            r.locales?.en?.title ||
            r.locales?.zh?.title;
          if (direct) return direct;
          const cat =
            r.locales?.[locale]?.category || r.locales?.en?.category;
          if (cat) return cat;
          const firstParam = Object.values(r.params ?? {}).find(
            (v) => v != null && String(v).trim().length > 0
          );
          if (firstParam) return String(firstParam);
          const idTail = r.id
            .replace(r.template_id, "")
            .replace(/^-/, "")
            .replace(/-/g, " ")
            .trim();
          return idTail;
        })();
        return {
          id: r.id,
          title: titleForCaption,
          preview: r.asset.preview_image_url,
          templateId: r.template_id,
          params: Object.fromEntries(
            Object.entries(r.params ?? {}).map(([k, v]) => [k, String(v ?? "")])
          ) as Record<string, string>,
          videoUrl: r.asset.video_url,
        };
      });
  }, [inspirations, locale]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    router.push(`/${locale}/search?q=${encodeURIComponent(q.toLowerCase())}`);
  };

  const totalResults =
    gridItems.length + matchedTemplates.length + galleryPrompts.length;
  const hasResults = totalResults > 0;
  // Threshold below which a query is "thin" enough to flag for an alias
  // top-up or content review. 5 catches queries that returned 1-4 items —
  // even a 3-4-result page is often subjectively thin (no diversity,
  // single template family). Raised from 3 → 5 on 2026-06-26 to surface
  // borderline-thin queries in admin's failing-query backlog. Matches
  // the server-side LOW_RESULT_THRESHOLD in search/page.tsx. See
  // docs/search-quality.md (item 2, low-result query logging).
  const LOW_RESULT_THRESHOLD = 5;

  const { track } = useTracking();
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    // Server-side LLM rewrite runs BEFORE these arrays are populated, so
    // totalResults already reflects the post-rewrite count. We fire the
    // no-result / low-result events only when the rewrite either was not
    // applied or did not recover the query — the admin's failing-query
    // backlog stays focused on "tried everything and still empty."
    // When the rewrite DID run (usedRewrites.length > 0), append a
    // "|rw=1" marker so admin can split "thin after LLM rescue attempt"
    // from "thin without rescue attempt" without a second event. Same
    // pattern for ?within=<slug> intent narrowing — admin can split the
    // chip-narrowed result events from raw-search events without forking
    // the action_type enum.
    const rwSuffix = usedRewrites.length > 0 ? "|rw=1" : "";
    const withinSuffix = withinSlug ? `|within=${withinSlug}` : "";
    // P0.2 paths suffix — only emit when multi-query expansion fired
    // (pathsUsed > 1). Lets admin SQL split "thin after N paths tried"
    // from "thin after no expansion attempt" without a separate event.
    const pathsSuffix = pathsUsed > 1 ? `|paths=${pathsUsed}` : "";
    if (totalResults === 0) {
      track({
        contentId: q + withinSuffix + rwSuffix + pathsSuffix,
        contentType: "topic_capsule",
        actionType: "search_noresult",
      });
    } else if (totalResults < LOW_RESULT_THRESHOLD) {
      // Encode the count in contentId so admin can rank queries by how
      // close they are to the threshold without joining against another
      // table. Format: "<query>[|within=<slug>]|n=<count>[|rw=1][|paths=N]".
      track({
        contentId: `${q}${withinSuffix}|n=${totalResults}${rwSuffix}${pathsSuffix}`,
        contentType: "topic_capsule",
        actionType: "search_lowresult",
      });
    } else if (withinSlug) {
      // Chip-narrowed search with healthy results — fire SEARCH so admin
      // sees volume per (query, within) pair. Raw searches with healthy
      // results don't fire a SEARCH event today (the URL change is the
      // implicit signal). Chip-narrow is an explicit user action and the
      // operator wants per-chip volume, so we fire it for this case.
      track({
        contentId: `${q}${withinSuffix}${rwSuffix}${pathsSuffix}`,
        contentType: "topic_capsule",
        actionType: "search",
      });
    }
  }, [query, totalResults, usedRewrites.length, withinSlug, pathsUsed, track]);

  return (
    <div className="mx-auto max-w-[1680px] px-4 py-10 sm:px-6 lg:px-8">
      {/* Mobile-only search input — desktop uses SiteTopBar's SearchBar */}
      <form onSubmit={handleSearch} className="lg:hidden mb-8 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
        >
          Search
        </button>
      </form>

      {/* LLM-rewrite hint — surfaced only when the original query was
          thin and the rewriter contributed at least one alternate
          phrasing. Shows the rewrites in dim text so the reader knows
          we expanded the search instead of "showing different stuff". */}
      {usedRewrites.length > 0 && hasResults && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
          <span className="font-semibold">Few results for &ldquo;{query}&rdquo;.</span>{" "}
          Also showing results for:{" "}
          <span className="font-mono text-amber-800">
            {usedRewrites.join(", ")}
          </span>
        </div>
      )}

      <p className="mb-5 text-sm text-neutral-500">
        {hasResults
          ? `Results for "${query}"`
          : `No results for "${query}"`}
      </p>

      {!hasResults ? (
        <div className="py-12">
          <p className="mb-4 text-center text-neutral-400">
            Try browsing a topic instead:
          </p>
          <TopicStrip
            items={relatedTopicStripItems}
            locale={locale}
            trackPrefix="search-empty-strip"
          />
        </div>
      ) : (
        <>
          {/* Intent chip row — Pinterest-style "Explore further" derived
              from the output-type tags on matched templates. Sits ABOVE
              the example grid so users can narrow by creation intent
              (flashcards / posters / stickers / …) before scrolling
              through individual examples. Click → /topics/<slug>?from_search
              (server-side redirect attribution stays consistent with the
              bare-country redirect bucket tracked since 2026-06-16). */}
          {/* Active intent-narrow pill — appears when ?within=<slug> is
              set (chip aggregator destination). Removable × restores the
              raw query. Mutually exclusive with the chip row below: once
              narrowed, the user is one level deep already, the further
              chips would be redundant. */}
          {withinSlug && (
            <section className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-sm text-neutral-600">Narrowed to:</span>
              <Link
                href={`/${locale}/search?q=${encodeURIComponent(query)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700"
                aria-label={`Remove ${renderLabel(withinSlug, withinSlug)} filter`}
              >
                <span>{renderLabel(withinSlug, withinSlug.replace(/-/g, " "))}</span>
                <span aria-hidden="true">×</span>
              </Link>
            </section>
          )}

          {intentChips.length > 0 && (
            <section className="mb-6 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-neutral-700">
                Explore further:
              </span>
              {intentChips.map(({ slug, count }) => (
                <Link
                  key={slug}
                  href={`/${locale}/search?q=${encodeURIComponent(query)}&within=${slug}`}
                  onClick={() =>
                    track({
                      contentId: `intent-chip:${slug}:${query}`,
                      contentType: "topic_capsule",
                      actionType: "click",
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-purple-50 px-3.5 py-1.5 text-sm text-purple-900 transition-colors hover:border-purple-400 hover:bg-purple-100"
                >
                  <span className="font-semibold">
                    {renderLabel(slug, slug.replace(/-/g, " "))}
                  </span>
                  <span className="text-xs text-purple-600">{count}</span>
                </Link>
              ))}
            </section>
          )}

          {/* Examples grid (top): same UI used on /topics, /nano-template
              detail, /inspiration-hub. Tracking, share, remix all carry over
              for free. */}
          {gridItems.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">
                Examples
              </h2>
              <ExampleImagesGrid
                items={gridItems}
                locale={locale}
                maxRows={3}
                showCaption
              />
            </section>
          )}

          {/* Templates rail (middle): renders the matched template cards
              with the same component the topic page uses. */}
          {matchedTemplates.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-3 text-lg font-bold text-neutral-900">
                Templates
              </h2>
              <NanoTemplateDetailClient
                locale={locale}
                otherNanoCards={matchedTemplates}
                showReproduce={false}
                showOtherTemplates={true}
                showOtherTemplateTitle={false}
              />
            </section>
          )}

          {/* Generable templates (LLM-matched): templates that COULD
              generate the query even if no inspiration exists for it
              yet. Lazy-fetched after mount so initial render stays
              fast. See docs/search-generation-bridge.md. */}
          <GenerableTemplatesSection query={query} locale={locale} />

          {/* Gallery prompts (bottom): Redis-backed nano-banana prompts
              matching the query as an exact tag. Renders with the same
              PromptCard used on /nano-banana-pro-prompts/tag/[slug]. */}
          {galleryPrompts.length > 0 && (
            <section className="mt-12">
              <div className="mb-3 flex items-end justify-between gap-2">
                <h2 className="text-lg font-bold text-neutral-900">
                  Gallery Prompts
                </h2>
                <Link
                  href={`/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(query)}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Browse all →
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {galleryPrompts.map((p) => (
                  <PromptCard key={p.id} prompt={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Related-query strip — moved to the bottom so the page leads
          with actual results / the rewrite hint, and the "what else
          could I look at" fork sits as a soft footer for users who
          scrolled past everything without converting. */}
      {relatedTopics.length > 0 && (
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <TopicStrip
            items={relatedTopicStripItems}
            locale={locale}
            heading="Browse"
            trackPrefix="search-bottom-strip"
          />
        </div>
      )}
    </div>
  );
}
