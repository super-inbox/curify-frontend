"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import WcSearchQueryCard from "@/app/[locale]/_components/WcSearchQueryCard";
import { SITE_URL } from "@/lib/constants";
import { toSlug } from "@/lib/nano_pure";
import { useClickTracking, useTracking } from "@/services/useTracking";

// One gallery-prompt tile every N tiles. Raised density 2026-06-27:
// 4 → 3 (one gallery tile per 2 templates instead of per 3) because
// the recent image2image drops (jun25 pet customization, jun26
// surreal fashion) are easier-to-remix content and users were
// requesting more remix tiles in the rail.
const GALLERY_INTERLEAVE_RATIO = 3;

// One search-query tile every N tiles. Wider cadence than gallery —
// these are navigational nudges, not content; too many becomes noise.
// 10 → one tile per 9 templates (~10% of a 40-tile rail).
const SEARCH_QUERY_INTERLEAVE_RATIO = 10;

export type TopRemixPrompt = {
  id: number;
  title: string;
  image_url: string;
  tags: string[];
  unique_copies_30d: number;
  total_copies_30d: number;
};

/** One rendered example (nano_inspiration record) — the new tile shape
 *  for the home fused row. Replaces the old template-card tile so the
 *  rail showcases individual creations, not template-grouped collages. */
export type HomeExampleTile = {
  id: string;
  templateId: string;
  title: string;
  preview: string;
};

type Props = {
  examples: HomeExampleTile[];
  galleryPrompts: TopRemixPrompt[];
  /** 6-8 random picks from POPULAR_PREFILL_QUERIES (server-side shuffled
   *  so each visit gets a fresh mix without hydration mismatch). */
  searchQueries?: string[];
  locale: string;
  maxRows?: number;
  /** Pinned to row-1 rightmost cell (WC rotating slot on the home page). */
  topRightCell?: React.ReactNode;
};

type FusedItem =
  | { kind: "example"; tile: HomeExampleTile }
  | { kind: "gallery"; prompt: TopRemixPrompt }
  | { kind: "search"; query: string };

function ExampleTile({
  tile,
  locale,
}: {
  tile: HomeExampleTile;
  locale: string;
}) {
  // Mirror the gallery rail's tracking convention — `home-rail-example`
  // splits cleanly in admin SQL from the gallery (`home-rail:`) and
  // strip (`home-topic-strip:`) buckets.
  const trackClick = useClickTracking(
    `home-rail-example:${tile.id}`,
    "nano_inspiration_example_grid",
    "cards"
  );
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");
  const slug = toSlug(tile.templateId);
  const examplePageHref = `/${locale}/nano-template/${slug}/example/${encodeURIComponent(tile.id)}`;
  const remixHref = `/${locale}/nano-template/${slug}#reproduce`;
  const shareUrl = `${SITE_URL}${examplePageHref}`;
  const shareTracking = {
    contentId: tile.id,
    contentType: "nano_inspiration_example_grid" as const,
    viewMode: "cards" as const,
  };
  // Card UI mirrors the ExampleImagesGrid card (image → bold title →
  // CTA + iconOnly Share row) so home / topic / search / use-case
  // surfaces all render the same affordances.
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:border-neutral-300 hover:shadow-lg">
      <Link
        href={examplePageHref}
        onClick={trackClick}
        className="relative aspect-[1/1] overflow-hidden bg-neutral-50"
      >
        <CdnImage
          src={tile.preview}
          alt={tile.title || "Example"}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
      </Link>
      {tile.title ? (
        <p
          className="px-3 pt-2 text-sm font-bold text-neutral-900 line-clamp-2"
          title={tile.title}
        >
          {tile.title}
        </p>
      ) : null}
      <div className="mt-auto flex items-center justify-between px-3 py-2">
        <Link
          href={remixHref}
          onClick={trackClick}
          className="inline-flex items-center gap-1.5 rounded-full bg-purple-600 px-3 py-1 text-sm font-bold text-white shadow-sm transition-colors hover:bg-purple-700"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t("remixThis")}
        </Link>
        <ShareButton
          compact
          iconOnly
          url={shareUrl}
          title={tile.title || tile.id}
          text={`Check out this Nano Banana example: ${tile.title || tile.id}`}
          onShared={() => trackAction(shareTracking, "share")}
        />
      </div>
    </div>
  );
}

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

// Search-query tile on the home fused row — adopts the WC slot's
// "People are searching" card format (WcSearchQueryCard) so all search-
// nudge surfaces look consistent. WcSearchQueryCard handles tracking
// internally with content_id="wc-query-card:<query>", so home-rail
// search clicks coalesce into the same admin SQL bucket as the WC slot's
// query mode (acceptable — both are "user clicked a popular-search
// nudge tile"). If we ever need to split them by surface, swap to a
// dedicated wrapper that re-fires with a "home-rail-search:" prefix.

export default function HomeFusedRow({
  examples,
  galleryPrompts,
  searchQueries = [],
  locale,
  maxRows = 8,
  topRightCell,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Build the interleaved sequence. Examples are kept in their incoming
  // order (caller pre-sorted by parent template rank_score, deduped to
  // one per template). Gallery prompts + search-query tiles splice at
  // their own cadences (gallery: every 2nd; search: every 9th). With a
  // 5-wide grid, this lands a search tile in row 1 only if it falls
  // before the topRightCell — reserved (WC slot), so we shift the
  // first search tile to after the row-1 visible window.
  const fused: FusedItem[] = useMemo(() => {
    const out: FusedItem[] = [];
    let g = 0;
    let s = 0;
    for (let i = 0; i < examples.length; i++) {
      out.push({ kind: "example", tile: examples[i] });
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
  }, [examples, galleryPrompts, searchQueries]);

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
          if (item.kind === "example") {
            return (
              <ExampleTile
                key={`ex-${item.tile.id}`}
                tile={item.tile}
                locale={locale}
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
            <WcSearchQueryCard
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
