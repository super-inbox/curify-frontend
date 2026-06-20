"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import { NanoInspirationCard } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import { useClickTracking } from "@/services/useTracking";

// One gallery-prompt tile every N tiles. 1:3 keeps the gallery rail
// visible without dominating the template feed. Easy to tune later
// once CTR by tile-type comes back.
const GALLERY_INTERLEAVE_RATIO = 4;

// One search-query tile every N tiles. Wider cadence than gallery —
// these are navigational nudges, not content; too many becomes noise.
const SEARCH_QUERY_INTERLEAVE_RATIO = 6;

export type TopRemixPrompt = {
  id: number;
  title: string;
  image_url: string;
  tags: string[];
  unique_copies_30d: number;
  total_copies_30d: number;
};

type Props = {
  templates: NanoInspirationCardType[];
  galleryPrompts: TopRemixPrompt[];
  /** 6-8 random picks from POPULAR_PREFILL_QUERIES (server-side shuffled
   *  so each visit gets a fresh mix without hydration mismatch). */
  searchQueries?: string[];
  locale: string;
  requireAuth: (reason?: string) => boolean;
  onViewClick: (card: NanoInspirationCardType) => void;
  maxRows?: number;
  /** Pinned to row-1 rightmost cell (WC rotating slot on the home page). */
  topRightCell?: React.ReactNode;
};

type FusedItem =
  | { kind: "template"; card: NanoInspirationCardType }
  | { kind: "gallery"; prompt: TopRemixPrompt }
  | { kind: "search"; query: string };

function GalleryPromptTile({
  prompt,
  locale,
}: {
  prompt: TopRemixPrompt;
  locale: string;
}) {
  // Reuse the existing 'nano_gallery' content_type (backend rejects
  // unknown values silently). Disambiguate the rail in admin SQL via
  // content_id prefix "home-rail:" so we can split fused-rail clicks
  // from gallery-list-page clicks without forking the enum.
  const trackClick = useClickTracking(
    `home-rail:${prompt.id}`,
    "nano_gallery",
    "cards"
  );
  const href = `/${locale}/nano-banana-pro-prompts/${prompt.id}`;
  return (
    <Link
      href={href}
      onClick={trackClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 via-purple-50 to-indigo-50 p-3 shadow-md transition-all duration-300 hover:border-indigo-300 hover:shadow-2xl"
    >
      {/* Remix badge — distinguishes from template tiles at a glance */}
      <span className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
        <Sparkles className="h-3 w-3" />
        Remix
      </span>
      <div className="relative mb-2 aspect-[1/1] overflow-hidden rounded-xl border border-indigo-100 bg-white shadow-inner">
        <CdnImage
          src={prompt.image_url}
          alt={prompt.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </div>
      <div className="flex-1">
        <h3
          className="line-clamp-2 text-sm font-semibold text-neutral-900"
          title={prompt.title}
        >
          {prompt.title}
        </h3>
        <p className="mt-0.5 text-[11px] font-medium text-indigo-700">
          Popular this month · {prompt.unique_copies_30d} remixes
        </p>
      </div>
    </Link>
  );
}

function SearchQueryTile({ query, locale }: { query: string; locale: string }) {
  // Reuse 'topic_capsule' content_type (per feedback_tracking_enums —
  // backend silently rejects unknown values). Prefix gives admin SQL
  // a clean way to split home-rail search tiles from other capsule
  // events without forking the enum.
  const trackClick = useClickTracking(
    `home-rail-search:${query}`,
    "topic_capsule",
    "cards"
  );
  const href = `/${locale}/search?q=${encodeURIComponent(query)}`;
  return (
    <Link
      href={href}
      onClick={trackClick}
      className="group relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 p-4 text-center shadow-md transition-all duration-300 hover:border-amber-400 hover:shadow-2xl"
    >
      <Search className="mb-2 h-5 w-5 text-amber-700" />
      <p className="text-sm font-semibold leading-snug text-neutral-900 line-clamp-3">
        {query}
      </p>
      <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
        Search →
      </p>
    </Link>
  );
}

export default function HomeFusedRow({
  templates,
  galleryPrompts,
  searchQueries = [],
  locale,
  requireAuth,
  onViewClick,
  maxRows = 8,
  topRightCell,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Build the interleaved sequence. Templates are kept in their
  // incoming order (caller pre-sorted by rank_score). Gallery prompts
  // and search-query tiles are spliced at their own cadences
  // (gallery: every 3rd template; search: every 5th template). With a
  // 5-wide grid, this lands a search tile in row 1 only if it falls
  // before the topRightCell — which is reserved (WC slot), so we shift
  // the first search tile to after the row-1 visible window.
  const fused: FusedItem[] = useMemo(() => {
    const out: FusedItem[] = [];
    let g = 0;
    let s = 0;
    for (let i = 0; i < templates.length; i++) {
      out.push({ kind: "template", card: templates[i] });
      if (
        (i + 1) % (GALLERY_INTERLEAVE_RATIO - 1) === 0 &&
        g < galleryPrompts.length
      ) {
        out.push({ kind: "gallery", prompt: galleryPrompts[g] });
        g += 1;
      }
      if (
        (i + 1) % (SEARCH_QUERY_INTERLEAVE_RATIO - 1) === 0 &&
        s < searchQueries.length
      ) {
        out.push({ kind: "search", query: searchQueries[s] });
        s += 1;
      }
    }
    while (g < galleryPrompts.length) {
      out.push({ kind: "gallery", prompt: galleryPrompts[g] });
      g += 1;
    }
    while (s < searchQueries.length) {
      out.push({ kind: "search", query: searchQueries[s] });
      s += 1;
    }
    return out;
  }, [templates, galleryPrompts, searchQueries]);

  // Approximate visible window. Match NanoInspirationRow's heuristic:
  // 5 cols × 8 rows = 40. We don't have useGridCols here; pick 5 cols
  // as the planning denominator since most desktop widths land there.
  const limit = 5 * maxRows;
  const visible = expanded ? fused : fused.slice(0, limit);
  const hidden = Math.max(0, fused.length - limit);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {topRightCell ? (
          <div className="col-start-2 row-start-1 sm:col-start-3 lg:col-start-5 xl:col-start-6">
            {topRightCell}
          </div>
        ) : null}
        {visible.map((item) => {
          if (item.kind === "template") {
            return (
              <NanoInspirationCard
                key={`tpl-${item.card.id}`}
                card={item.card}
                requireAuth={requireAuth}
                onViewClick={onViewClick}
              />
            );
          }
          if (item.kind === "gallery") {
            return (
              <GalleryPromptTile
                key={`gal-${item.prompt.id}`}
                prompt={item.prompt}
                locale={locale}
              />
            );
          }
          return (
            <SearchQueryTile
              key={`q-${item.query}`}
              query={item.query}
              locale={locale}
            />
          );
        })}
      </div>
      {hidden > 0 && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            {expanded ? "See less" : `See more (${hidden})`}
          </button>
        </div>
      )}
    </div>
  );
}
