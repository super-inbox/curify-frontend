"use client";

import { useMemo, useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import {
  useViewTracking,
  useCopyTracking,
  useClickTracking,
  useShareTracking,
} from "@/services/useTracking";

export type NanoInspirationCardType = {
  id: string; // e.g. "1-zh", "1-en"
  language: "zh" | "en";
  category: string;
  image_urls: string[];          // e.g. ["herbal_medicine_1.jpg", ...] or ["/images/nano_insp/herbal_medicine_1.jpg"]
  preview_image_urls?: string[]; // optional; if absent, we derive from image_urls

  prompt: string;
};

/**
 * If src is:
 * - absolute URL => keep
 * - relative path "/images/..." => keep
 * - raw filename "xxx.jpg" => prefix with "/images/nano_insp/"
 */
function normalizeNanoImageUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `/images/nano_insp/${src}`;
}

/**
 * Derive preview url from a raw filename or url.
 * Rule requested:
 *  preview => "/images/nano_insp_preview/[name]_prev"
 * We keep extension if present:
 *  "abc.jpg" => "/images/nano_insp_preview/abc_prev.jpg"
 */
function derivePreviewUrlFromImageUrl(imageUrl: string) {
  if (!imageUrl) return "";

  // If absolute or already starts with "/", take only the filename part for derivation
  // but keep absolute/relative paths if user already provided explicit preview urls elsewhere.
  // Here we derive from the filename.
  const asPath = imageUrl.startsWith("http")
    ? (() => {
        try {
          return new URL(imageUrl).pathname;
        } catch {
          return imageUrl;
        }
      })()
    : imageUrl;

  const filename = asPath.split("/").pop() || imageUrl; // "abc.jpg"
  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const ext = dot >= 0 ? filename.slice(dot) : ""; // ".jpg" or ""

  return `/images/nano_insp_preview/${base}_prev${ext}`;
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

interface NanoInspirationCardProps {
  card: NanoInspirationCardType;

  // Use this ONLY for actions that should require auth (e.g. Save)
  requireAuth: (reason?: string) => boolean;

  onViewClick?: (card: NanoInspirationCardType) => void;
}

export function NanoInspirationCard({ card, requireAuth, onViewClick }: NanoInspirationCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Mock engagement numbers (random but stable per card)
  const seedNum = parseInt(card.id.split('-').pop() || '0', 10) || Math.floor(Math.random() * 1000);
  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50); // 50-150
  const [copyCount, setCopyCount] = useState(Math.floor(seedNum * 1.3) % 150 + 100); // 100-250
  const [shareCount, setShareCount] = useState(Math.floor(seedNum * 0.7) % 50 + 20); // 20-70

  const viewRef = useViewTracking(card.id, "nano_inspiration", "list", {
    threshold: 0.5,
    once: true,
  });

  const trackClick = useClickTracking(card.id, "nano_inspiration", "list");
  const trackCopy = useCopyTracking(card.id, "nano_inspiration", "list");
  const trackShare = useShareTracking(card.id, "nano_inspiration", "list");
  const trackSave = useClickTracking(card.id, "nano_inspiration", "list");

  const getCanonicalUrl = () => {
    if (typeof window === "undefined") return `/inspiration-hub#${card.id}`;
    
    const pathname = window.location.pathname;
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    return `${window.location.origin}/${locale}/inspiration-hub#${card.id}`;
  };

  const canonicalUrl = getCanonicalUrl();

  // Normalize / derive URLs once
  const normalized = useMemo(() => {
    const imageUrls = (card.image_urls || []).map(normalizeNanoImageUrl);

    // If preview_image_urls provided, normalize them; otherwise derive
    const previewUrls =
      card.preview_image_urls && card.preview_image_urls.length > 0
        ? card.preview_image_urls.map((u) => {
            if (!u) return "";
            if (u.startsWith("http://") || u.startsWith("https://")) return u;
            if (u.startsWith("/")) return u;
            // If someone passes raw "abc_prev.jpg", we still place it under nano_insp_preview
            return `/images/nano_insp_preview/${u}`;
          })
        : imageUrls.map((u) => derivePreviewUrlFromImageUrl(u));

    return { imageUrls, previewUrls };
  }, [card.image_urls, card.preview_image_urls]);

  const totalImages = normalized.previewUrls.length || normalized.imageUrls.length || 0;

  const nextImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev + 1) % totalImages);
  };

  const prevImage = () => {
    if (!totalImages) return;
    setCurrentImageIndex((prev) => (prev - 1 + totalImages) % totalImages);
  };

  // Card click opens modal
  const handleCardClick = () => {
    trackClick();
    onViewClick?.(card);
  };

  // Save DOES require auth - toggles on/off
  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("save_nano_inspiration")) return;
    trackSave();
    
    if (saved) {
      setSaved(false);
      setSaveCount(prev => prev - 1);
    } else {
      setSaved(true);
      setSaveCount(prev => prev + 1);
    }
  };

  // Copy does NOT require auth
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(card.prompt);
      trackCopy();
      
      if (!copied) {
        setCopied(true);
        setCopyCount(prev => prev + 1);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Share does NOT require auth - directly copy URL
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      
      if (!shared) {
        setShared(true);
        setShareCount(prev => prev + 1);
        setTimeout(() => setShared(false), 1500);
      }
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const abbreviatedPrompt = card.prompt.length > 90 ? card.prompt.slice(0, 90) + "..." : card.prompt;

  // Prefer preview image; fallback to full image
  const previewSrc = normalized.previewUrls[currentImageIndex] || "";
  const fullSrc = normalized.imageUrls[currentImageIndex] || "";
  const displaySrc = previewSrc || fullSrc;

  const btnBase =
    "inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors active:scale-[0.98]";

  return (
    <div
      ref={viewRef as React.Ref<HTMLDivElement>}
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Category */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          💡 {card.category}
        </span>
      </div>

      {/* Image Carousel */}
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-white">
        {displaySrc ? (
          <CdnImage
            src={displaySrc}
            alt={`${card.category} preview ${currentImageIndex + 1}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
            No image
          </div>
        )}

        {totalImages > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              aria-label="Previous image"
              type="button"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              aria-label="Next image"
              type="button"
            >
              ›
            </button>

            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {Array.from({ length: totalImages }).map((_, idx) => (
                <div
                  key={idx}
                  className={classNames(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    idx === currentImageIndex ? "w-3 bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Prompt */}
      <p className="text-xs leading-relaxed text-neutral-700 mb-3">{abbreviatedPrompt}</p>

      {/* Actions - 3 buttons with engagement counts */}
      <div className="flex items-center gap-3">
        {/* Save (requires auth) */}
        <button
          onClick={handleSave}
          className={classNames(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
            saved 
              ? "bg-amber-50 text-amber-700 hover:bg-amber-100" 
              : "text-neutral-600 hover:text-neutral-900"
          )}
          type="button"
        >
          <span>{saved ? "🔖" : "🤍"}</span>
          <span>{saveCount}</span>
        </button>

        {/* Copy (no auth) */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          type="button"
        >
          <span>📋</span>
          <span>{copyCount}</span>
        </button>

        {/* Share (no auth) */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          type="button"
        >
          <span>↗</span>
          <span>{shareCount}</span>
        </button>
      </div>
    </div>
  );
}

interface NanoInspirationRowProps {
  cards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
}

export function NanoInspirationRow({ cards, requireAuth, onViewClick }: NanoInspirationRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <NanoInspirationCard key={c.id} card={c} requireAuth={requireAuth} onViewClick={onViewClick} />
      ))}
    </div>
  );
}
