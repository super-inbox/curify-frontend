"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import { NanoInspirationCard } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import { useClickTracking } from "@/services/useTracking";

// One gallery-prompt tile every N tiles. 1:3 keeps the gallery rail
// visible without dominating the template feed. Easy to tune later
// once CTR by tile-type comes back.
const GALLERY_INTERLEAVE_RATIO = 4;

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
  locale: string;
  requireAuth: (reason?: string) => boolean;
  onViewClick: (card: NanoInspirationCardType) => void;
  maxRows?: number;
};

type FusedItem =
  | { kind: "template"; card: NanoInspirationCardType }
  | { kind: "gallery"; prompt: TopRemixPrompt };

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

export default function HomeFusedRow({
  templates,
  galleryPrompts,
  locale,
  requireAuth,
  onViewClick,
  maxRows = 8,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  // Build the interleaved sequence. Templates are kept in their
  // incoming order (caller pre-sorted by rank_score); gallery prompts
  // arrive pre-sorted by copy count. We splice in one gallery prompt
  // at every Nth position (0-indexed): positions 3, 7, 11, ...
  const fused: FusedItem[] = useMemo(() => {
    const out: FusedItem[] = [];
    let g = 0;
    for (let i = 0; i < templates.length; i++) {
      out.push({ kind: "template", card: templates[i] });
      // After the Nth template tile, before the (N+1)th, push the
      // next gallery prompt. So with ratio=4: positions 3, 7, 11, …
      if (
        (i + 1) % (GALLERY_INTERLEAVE_RATIO - 1) === 0 &&
        g < galleryPrompts.length
      ) {
        out.push({ kind: "gallery", prompt: galleryPrompts[g] });
        g += 1;
      }
    }
    // Anything leftover (rare — only when galleryPrompts > templates / 3)
    while (g < galleryPrompts.length) {
      out.push({ kind: "gallery", prompt: galleryPrompts[g] });
      g += 1;
    }
    return out;
  }, [templates, galleryPrompts]);

  // Approximate visible window. Match NanoInspirationRow's heuristic:
  // 5 cols × 8 rows = 40. We don't have useGridCols here; pick 5 cols
  // as the planning denominator since most desktop widths land there.
  const limit = 5 * maxRows;
  const visible = expanded ? fused : fused.slice(0, limit);
  const hidden = Math.max(0, fused.length - limit);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {visible.map((item) =>
          item.kind === "template" ? (
            <NanoInspirationCard
              key={`tpl-${item.card.id}`}
              card={item.card}
              requireAuth={requireAuth}
              onViewClick={onViewClick}
            />
          ) : (
            <GalleryPromptTile
              key={`gal-${item.prompt.id}`}
              prompt={item.prompt}
              locale={locale}
            />
          )
        )}
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
