// app/[locale]/_components/NanoInspirationCard.tsx
"use client";

import { Bookmark, Download, Layers, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import {
  useClickTracking,
  useRemixTracking,
  useTracking,
} from "@/services/useTracking";
import { templatePacksService } from "@/services/templatePacks";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import {
  makeNanoTemplateUrl,
  normalizeCarouselUrls,
  getLocaleFromPath,
  toSlug,
} from "@/lib/nano_utils";

import { NanoInspirationCardType } from "@/lib/nano_utils";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

interface NanoInspirationCardProps {
  card: NanoInspirationCardType;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
}

export function NanoInspirationCard({
  card,
  requireAuth,
  onViewClick,
}: NanoInspirationCardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Use actual page locale:
  // - /zh/... => zh
  // - everything else => en
  const pageLocale = getLocaleFromPath(pathname);

  const trackCardClick = useClickTracking(card.id, "nano_inspiration_template_card", "list");
  const trackRemix = useRemixTracking(card.id, "nano_inspiration_template_card", "list");
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);
  const [saved, setSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved) return;
    if (!user) { setDrawerState("signin"); return; }
    setSaved(true);
    trackAction(batchTracking, "favorite");
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const batchTracking = {
    contentId: card.id,
    contentType: "nano_inspiration_template_card" as const,
    viewMode: "list" as const,
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    if (!user) { setDrawerState("signin"); isDownloadingRef.current = false; return; }

    try {
      setIsDownloading(true);
      const res = await templatePacksService.downloadPack({ template_id: card.template_id });
      if (!res?.success || !res?.download_url) throw new Error(res?.message || "Missing download_url");
      const a = document.createElement("a");
      a.href = res.download_url;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      trackAction(batchTracking, "download");
    } catch {
      alert(t("batchDownloadFailed"));
    } finally {
      setIsDownloading(false);
      isDownloadingRef.current = false;
    }
  };

  const canonicalUrl = makeNanoTemplateUrl(card.template_id, pageLocale);

  const remixHref = useMemo(() => {
    if (!card.template_id) return null;
    const qs = card.sample_parameters && Object.keys(card.sample_parameters).length > 0
      ? `?${new URLSearchParams(card.sample_parameters as Record<string, string>).toString()}`
      : "";
    return `/${pageLocale}/nano-template/${toSlug(card.template_id)}${qs}#reproduce`;
  }, [card.template_id, card.sample_parameters, pageLocale]);

  const normalized = useMemo(() => {
    return normalizeCarouselUrls(card.image_urls, card.preview_image_urls);
  }, [card.image_urls, card.preview_image_urls]);

  const totalImages =
    normalized.previewUrls.length || normalized.imageUrls.length || 0;

  const nextImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  const handleCardClick = () => {
    trackCardClick();

    if (card.template_id) {
      router.push(canonicalUrl);
      return;
    }

    onViewClick?.(card);
  };

  const [displaySrc, setDisplaySrc] = useState(
    normalized.previewUrls[0] || normalized.imageUrls[0] || ""
  );

  useEffect(() => {
    const preview = normalized.previewUrls[currentImageIndex] || normalized.imageUrls[currentImageIndex] || "";
    const full = normalized.imageUrls[currentImageIndex] || preview;
    setDisplaySrc(preview);
    if (!full || full === preview) return;
    const img = new Image();
    img.src = full;
    img.onload = () => setDisplaySrc(full);
  }, [currentImageIndex, normalized]);

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-3 shadow-md transition-all duration-300 cursor-pointer hover:border-purple-300 hover:shadow-2xl"
    >
      {/* Category Badge */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 text-xs font-bold text-purple-700 shadow-sm">
          <span className="text-base">💡</span>
          {card.category}
        </span>

        {card.template_id && (
          <span className="inline-flex items-center gap-1 text-gray-600">
            <Layers className="h-4 w-4" />
          </span>
        )}
      </div>

      {/* Image Carousel */}
      <div className="relative mb-2 aspect-[1/1] overflow-hidden rounded-xl border border-purple-100 bg-white shadow-inner">
        {displaySrc ? (
          <CdnImage
            src={displaySrc}
            alt={`${card.category} preview ${currentImageIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <div className="text-center">
              <svg
                className="mx-auto mb-2 h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">No image</span>
            </div>
          </div>
        )}

        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 px-3 py-2 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-black/75 group-hover:opacity-100"
              type="button"
              aria-label="Previous image"
            >
              ‹
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-black/60 px-3 py-2 text-white opacity-0 shadow-lg backdrop-blur-sm transition-all hover:bg-black/75 group-hover:opacity-100"
              type="button"
              aria-label="Next image"
            >
              ›
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/40 px-3 py-1.5 backdrop-blur-sm">
              {Array.from({ length: totalImages }).map((_, idx) => (
                <div
                  key={idx}
                  className={classNames(
                    "h-2 rounded-full transition-all",
                    idx === currentImageIndex
                      ? "w-6 bg-white"
                      : "w-2 bg-white/60 hover:bg-white/80"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {remixHref && (
        <div className="mt-auto flex items-center justify-between gap-1.5">
          {card.batch ? (
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1.5 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-60"
            >
              <Download className="h-3.5 w-3.5" />
              {isDownloading ? t("downloadingPack") : t("downloadPack")}
            </button>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={handleSave}
                className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                  saved
                    ? "bg-purple-100 text-purple-700"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
                {saved ? t("saved") : t("save")}
              </button>
              {showSavedToast && (
                <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-lg">
                  Saved! View in your workspace →
                </div>
              )}
            </div>
          )}
          <Link
            href={remixHref}
            onClick={(e) => {
              e.stopPropagation();
              trackRemix();
            }}
            className="flex items-center justify-center gap-1 rounded-full bg-purple-50 px-2.5 py-1.5 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 hover:text-purple-900"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Remix this
          </Link>
        </div>
      )}
    </div>
  );
}

interface NanoInspirationRowProps {
  cards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
  getRelatedScore?: (card: NanoInspirationCardType) => number;
  rankScoreRelatedShift?: number;
}


export function NanoInspirationRow({
  cards,
  requireAuth,
  onViewClick,
  getRelatedScore,
  rankScoreRelatedShift = 80,
}: NanoInspirationRowProps) {
  const scoredCards = cards.map((c) => {
    const relatedScore = Math.max(0, getRelatedScore?.(c) ?? 0);
    const base = c.rank_score ?? 1;
    const shift = relatedScore * rankScoreRelatedShift;
    const finalScore = base + shift;

    return {
      ...c,
      _debug: {
        base,
        relatedScore,
        shift,
        finalScore,
      },
    };
  });

  const sortedCards = [...scoredCards].sort(
    (a, b) => b._debug.finalScore - a._debug.finalScore
  );

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {sortedCards.map((c) => (
        <NanoInspirationCard
          key={c.id}
          card={c}
          requireAuth={requireAuth}
          onViewClick={onViewClick}
        />
      ))}
    </div>
  );
}