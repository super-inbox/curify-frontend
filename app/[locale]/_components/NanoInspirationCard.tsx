// app/[locale]/_components/NanoInspirationCard.tsx
"use client";

import { Layers } from "lucide-react";
import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import {
  useCopyTracking,
  useClickTracking,
  useShareTracking,
} from "@/services/useTracking";
import { stableHashToInt } from "@/lib/hash_utils";
import { ActionButtons } from "@/app/[locale]/_components/button/ActionButtons";
import {
  buildParamSummary,
  fillPrompt,
  makeNanoTemplateUrl,
  normalizeCarouselUrls,
  getLocaleFromPath,
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
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  // Use actual page locale:
  // - /zh/... => zh
  // - everything else => en
  const pageLocale = getLocaleFromPath(pathname);

  // Mock engagement numbers (Deterministic)
  const seedNum = useMemo(() => stableHashToInt(card.id), [card.id]);

  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50);
  const [copyCount, setCopyCount] = useState(
    Math.floor(seedNum * 1.3) % 150 + 100
  );
  const [shareCount, setShareCount] = useState(
    Math.floor(seedNum * 0.7) % 50 + 20
  );

  const trackCardClick = useClickTracking(card.id, "nano_inspiration", "list");
  const trackCopy = useCopyTracking(card.id, "nano_inspiration", "list");
  const trackShare = useShareTracking(card.id, "nano_inspiration", "list");
  const trackSave = useClickTracking(card.id, "nano_inspiration", "list");

  const canonicalUrl = makeNanoTemplateUrl(card.template_id, pageLocale);

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

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("save_nano_inspiration")) return;

    trackSave();

    if (saved) {
      setSaved(false);
      setSaveCount((prev) => prev - 1);
    } else {
      setSaved(true);
      setSaveCount((prev) => prev + 1);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const filled = fillPrompt(card.base_prompt, card.sample_parameters);

      const payload =
        filled?.trim() ||
        buildParamSummary(card.sample_parameters, 4) ||
        canonicalUrl;

      await navigator.clipboard.writeText(payload);
      trackCopy();

      if (!copied) {
        setCopied(true);
        setCopyCount((prev) => prev + 1);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();

      if (!shared) {
        setShared(true);
        setShareCount((prev) => prev + 1);
        setTimeout(() => setShared(false), 1500);
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const displaySrc =
    normalized.previewUrls[currentImageIndex] ||
    normalized.imageUrls[currentImageIndex] ||
    "";

  const paramSummary = useMemo(
    () => buildParamSummary(card.sample_parameters, 2),
    [card.sample_parameters]
  );

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-5 shadow-md transition-all duration-300 cursor-pointer hover:border-purple-300 hover:shadow-2xl"
    >
      {/* Category Badge */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-bold text-purple-700 shadow-sm">
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
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl border-2 border-purple-100 bg-white shadow-inner">
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

      {/* Description / Param summary */}
      <div className="mb-4 rounded-2xl border border-purple-100 bg-white/60 p-4 backdrop-blur-sm">
        {card.description ? (
          <p className="line-clamp-2 text-[15px] leading-snug text-neutral-800 font-medium">
            {card.description}
          </p>
        ) : paramSummary ? (
          <p className="line-clamp-2 text-[15px] leading-snug text-neutral-800 font-medium">
            {paramSummary}
          </p>
        ) : (
          <p className="line-clamp-2 text-[15px] leading-snug text-neutral-700 font-medium">
            Click to create with this template
          </p>
        )}

        {paramSummary && (
          <p className="mt-1 line-clamp-1 text-[13px] text-neutral-500">
            {paramSummary}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto flex items-center">
        <ActionButtons
          saved={saved}
          copied={copied}
          shared={shared}
          saveCount={saveCount}
          copyCount={copyCount}
          shareCount={shareCount}
          onSave={handleSave}
          onCopy={handleCopy}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}

interface NanoInspirationRowProps {
  cards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
}

export function NanoInspirationRow({
  cards,
  requireAuth,
  onViewClick,
}: NanoInspirationRowProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
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