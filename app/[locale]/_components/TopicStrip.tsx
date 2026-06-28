"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import { getCanonicalPath } from "@/lib/canonical";
import { useClickTracking } from "@/services/useTracking";
import TOPIC_THUMBNAILS from "@/lib/generated/topic_thumbnails.json";
import TOPIC_ICONS from "@/lib/generated/topic_icons.json";

// Canva-style topic strip — alternative to EntryBar's pill row.
// Each tile is wider, light pastel background per topic, with a small
// thumbnail glimpsing the topic's content on the right.
//
// Mount sites (decided per page):
//   - Home page: top 12-18 tier-1+tier-2 topics
//   - Topic page bottom: related tier-3 (e.g. /topics/character bottom
//     shows MBTI types, /topics/learning shows subject tags)
//   - Search results: related-topics fallback strip
//
// To keep Tailwind JIT happy, the pastel classes below are STRING
// LITERALS so the build-time scan picks them up. The hash function
// just picks an index — Tailwind never sees the result, only these
// 12 literals.
const PASTELS: { bg: string; ring: string }[] = [
  { bg: "bg-amber-100",   ring: "ring-amber-200/60" },
  { bg: "bg-violet-100",  ring: "ring-violet-200/60" },
  { bg: "bg-pink-100",    ring: "ring-pink-200/60" },
  { bg: "bg-emerald-100", ring: "ring-emerald-200/60" },
  { bg: "bg-sky-100",     ring: "ring-sky-200/60" },
  { bg: "bg-rose-100",    ring: "ring-rose-200/60" },
  { bg: "bg-cyan-100",    ring: "ring-cyan-200/60" },
  { bg: "bg-orange-100",  ring: "ring-orange-200/60" },
  { bg: "bg-fuchsia-100", ring: "ring-fuchsia-200/60" },
  { bg: "bg-lime-100",    ring: "ring-lime-200/60" },
  { bg: "bg-indigo-100",  ring: "ring-indigo-200/60" },
  { bg: "bg-teal-100",    ring: "ring-teal-200/60" },
];

// Deterministic slug → pastel index. djb2-style. Same slug always
// gets the same color across mount sites + reloads.
function paletteFor(slug: string): { bg: string; ring: string } {
  let h = 5381;
  for (let i = 0; i < slug.length; i++) h = ((h * 33) ^ slug.charCodeAt(i)) >>> 0;
  return PASTELS[h % PASTELS.length];
}

const THUMBS = TOPIC_THUMBNAILS as Record<string, string>;
const ICONS = TOPIC_ICONS as Record<string, string>;

// Resolve the per-slug image — prefer the 128px webp icon (avg ~6 KB,
// 10× smaller than the full preview). Fall back to the preview-image
// path when no icon exists (e.g. a freshly-added topic that hasn't
// run through build_topic_icons.cjs yet).
function imageFor(slug: string): string | undefined {
  return ICONS[slug] ?? THUMBS[slug];
}

export type TopicStripItem = {
  /** Topic slug (drives color + thumbnail + tracking). */
  slug: string;
  /** Destination path AFTER the /<locale> prefix (e.g. "/topics/character"). */
  path: string;
  /** Display label. Caller provides — usually the localized name from
   *  `next-intl` (`topics.<slug>.displayName`) or a hand-supplied string. */
  label: string;
};

type Props = {
  /** Tile data — caller decides which topics to show + their order. */
  items: TopicStripItem[];
  locale: string;
  /** Optional header text above the strip (e.g. "Browse by topic"). */
  heading?: string;
  /** Tracking content_id prefix — lets admin SQL split clicks per surface
   *  (e.g. "home-strip" vs "topic-bottom-strip"). */
  trackPrefix?: string;
  className?: string;
  /** When true, render as a single horizontally-scrollable row even on
   *  desktop (instead of the default wrapping grid). Used in the sticky
   *  top-bar where vertical space is constrained to a single rail. */
  singleRow?: boolean;
  /** Number of leading tiles to render with image `priority`. Only the
   *  topbar (above-the-fold, server-rendered, every page) should pass
   *  a non-zero value — that's where icon preloading earns its keep.
   *  Other mount sites (topic page bottom, search related-topics) are
   *  below the fold and should stay lazy. */
  priorityFirst?: number;
};

function TopicTile({
  item,
  locale,
  trackPrefix,
  compact,
  priority,
}: {
  item: TopicStripItem;
  locale: string;
  trackPrefix: string;
  /** Compact (single-row sticky-bar) tile: shorter + narrower. */
  compact?: boolean;
  /** When true, the tile image renders with priority (no lazy
   *  loading + preloaded). Use sparingly — only for above-the-fold
   *  tiles in the sticky topbar to avoid bloating the LCP candidate
   *  set. */
  priority?: boolean;
}) {
  const { bg, ring } = paletteFor(item.slug);
  const thumbnail = imageFor(item.slug);
  const href = getCanonicalPath(locale, item.path);
  const trackClick = useClickTracking(
    `${trackPrefix}:${item.slug}`,
    "topic_capsule",
    "cards"
  );
  const sizeClass = compact
    ? "h-[56px] min-w-[150px] flex-shrink-0"
    : "h-[88px] min-w-[180px] flex-1";
  const labelClass = compact
    ? "line-clamp-1 text-sm font-semibold leading-tight text-neutral-900"
    : "line-clamp-2 text-base font-semibold leading-tight text-neutral-900";
  const padClass = compact ? "px-3 py-2" : "px-4 py-3";
  const thumbWidth = compact ? "w-[56px]" : "w-[82px]";
  const thumbSizes = compact ? "56px" : "82px";
  return (
    <Link
      href={href}
      onClick={trackClick}
      className={`group relative flex items-stretch overflow-hidden rounded-2xl ring-1 transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${bg} ${ring} ${sizeClass}`}
    >
      <div className={`flex flex-1 items-center ${padClass}`}>
        <span className={labelClass}>{item.label}</span>
      </div>
      {thumbnail ? (
        <div className={`relative h-full flex-shrink-0 ${thumbWidth}`}>
          <CdnImage
            src={thumbnail}
            alt=""
            fill
            sizes={thumbSizes}
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
            {...(priority ? { priority: true } : { loading: "lazy" })}
          />
        </div>
      ) : null}
    </Link>
  );
}

export default function TopicStrip({
  items,
  locale,
  heading,
  trackPrefix = "topic-strip",
  className,
  singleRow,
}: Props) {
  const t = useTranslations();
  void t; // reserved for future "See more" UX

  if (items.length === 0) return null;

  // Two layouts:
  //   - default: mobile horizontal scroll, desktop wrapping grid
  //     (Canva landing-page treatment)
  //   - singleRow: always a single horizontal scroll rail; used in the
  //     sticky topbar where we have ~56px of vertical budget total
  const layoutClass = singleRow
    ? "flex gap-2 overflow-x-auto pb-1"
    : "flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-5 xl:grid-cols-6";

  return (
    <section
      aria-label={heading ?? "Browse topics"}
      className={["w-full", className ?? ""].join(" ")}
    >
      {heading ? (
        <h2 className="mb-3 text-lg font-bold tracking-tight text-neutral-900">
          {heading}
        </h2>
      ) : null}
      <div className={layoutClass}>
        {items.map((item) => (
          <TopicTile
            key={item.slug}
            item={item}
            locale={locale}
            trackPrefix={trackPrefix}
            compact={singleRow}
          />
        ))}
      </div>
    </section>
  );
}
