"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";
import { Bookmark } from "lucide-react";

import CdnImage from "@/app/[locale]/_components/CdnImage";
import type { NanoInspirationCardType } from "@/lib/nano_pure";
import { makeNanoTemplateUrl, getLocaleFromPath } from "@/lib/nano_pure";
import { useClickTracking, useTracking } from "@/services/useTracking";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

// Template strip — compact one-row-per-template UI to differentiate
// template-listing surfaces (this) from example-grid surfaces
// (ExampleImagesGrid). Each row is a Link to /nano-template/<slug>
// with a small thumbnail icon (left), template name (center), and
// save-bookmark button (right).
//
// Mount sites (2026-06-29 swap):
//   - HomeClient legacy fallback (when gallery snapshot is empty)
//   - blog/[slug]/NanoBananaExamples ("Popular Template Examples")
//   - nano-template/[slug] "Other templates" section in
//     NanoTemplateDetailClient
//
// Tracking: clicks fire 'CLICK' on content_type
// 'nano_inspiration_template_card' so the new surface coalesces with
// the old card's analytics — the existing row-vs-card split lives in
// view_mode instead ('list' on cards, 'strip' on the new component).

export type TemplateStripCardProps = {
  card: NanoInspirationCardType;
  /** Tracking prefix — splits clicks per surface in admin SQL.
   *  Defaults to 'template-strip'. */
  trackPrefix?: string;
};

function TemplateStripCard({ card, trackPrefix = "template-strip" }: TemplateStripCardProps) {
  const pathname = usePathname();
  const pageLocale = getLocaleFromPath(pathname);
  const t = useTranslations("actionButtons");
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [saved, setSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const trackCardClick = useClickTracking(
    `${trackPrefix}:${card.id}`,
    "nano_inspiration_template_card",
    "list"
  );
  const { trackAction, track } = useTracking();
  const href = makeNanoTemplateUrl(card.template_id, pageLocale);
  // Prefer the preview list, fall back to full. Either way only one
  // thumbnail needed for the strip — pick index 0.
  const thumbnail =
    card.preview_image_urls?.[0] || card.image_urls?.[0] || "";

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); // don't follow the parent Link on a save click
    if (saved) return;
    if (!user) {
      track({ contentId: "auth-modal:save-template", contentType: "topic_capsule", actionType: "click" });
      setDrawerState("signin");
      return;
    }
    setSaved(true);
    trackAction(
      {
        contentId: card.id,
        contentType: "nano_inspiration_template_card",
        viewMode: "list",
      },
      "favorite"
    );
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  return (
    <Link
      href={href}
      onClick={trackCardClick}
      className="group relative flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
    >
      {thumbnail ? (
        <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-50">
          <CdnImage
            src={thumbnail}
            alt={card.category || card.id}
            fill
            sizes="48px"
            className="object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-neutral-100" />
      )}

      <div className="min-w-0 flex-1">
        <p
          className="line-clamp-1 text-sm font-bold text-neutral-900"
          title={card.category || card.id}
        >
          {card.category || card.id}
        </p>
      </div>

      <div className="relative flex-shrink-0">
        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? t("saved") : t("save")}
          className={`inline-flex items-center justify-center rounded-full p-2 transition-colors ${
            saved
              ? "bg-purple-100 text-purple-700"
              : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
        </button>
        {showSavedToast && (
          <div className="absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-lg">
            Saved! View in your workspace →
          </div>
        )}
      </div>
    </Link>
  );
}

export type TemplateStripProps = {
  cards: NanoInspirationCardType[];
  /** Tracking prefix per surface (e.g. 'home-fallback-template-strip',
   *  'blog-template-strip', 'other-templates-strip'). */
  trackPrefix?: string;
  /** Optional cap — defaults to 24. Strips are dense; >24 rows scrolls
   *  out of comfortable view. */
  maxRows?: number;
};

export default function TemplateStrip({
  cards,
  trackPrefix = "template-strip",
  maxRows = 24,
}: TemplateStripProps) {
  if (cards.length === 0) return null;
  const visible = cards.slice(0, maxRows);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {visible.map((card) => (
        <TemplateStripCard key={card.id} card={card} trackPrefix={trackPrefix} />
      ))}
    </div>
  );
}
