"use client";

import { useMemo, useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { useCopyTracking, useClickTracking, useShareTracking } from "@/services/useTracking";

export type NanoInspirationCardType = {
  id: string;
  language: "zh" | "en";
  category: string;
  image_urls: string[];
  preview_image_urls?: string[];
  prompt: string;
  template_id?: string; // Link to template for reproducible generation
};

export function normalizeNanoImageUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `/images/nano_insp/${src}`;
}

function derivePreviewUrlFromImageUrl(imageUrl: string) {
  if (!imageUrl) return "";
  const asPath = imageUrl.startsWith("http") ? (() => { try { return new URL(imageUrl).pathname; } catch { return imageUrl; } })() : imageUrl;
  const filename = asPath.split("/").pop() || imageUrl;
  const dot = filename.lastIndexOf(".");
  const base = dot >= 0 ? filename.slice(0, dot) : filename;
  const ext = dot >= 0 ? filename.slice(dot) : "";
  return `/images/nano_insp_preview/${base}_prev${ext}`;
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

interface NanoInspirationCardProps {
  card: NanoInspirationCardType;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
  onGenerateClick?: (card: NanoInspirationCardType) => void; // New: trigger template-based generation
}

export function NanoInspirationCard({ card, requireAuth, onViewClick, onGenerateClick }: NanoInspirationCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const seedNum = parseInt(card.id.split("-").pop() || "0", 10) || Math.floor(Math.random() * 1000);
  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50);
  const [copyCount, setCopyCount] = useState(Math.floor(seedNum * 1.3) % 150 + 100);
  const [shareCount, setShareCount] = useState(Math.floor(seedNum * 0.7) % 50 + 20);

  const trackCardClick = useClickTracking(card.id, "nano_inspiration", "list");
  const trackCopy = useCopyTracking(card.id, "nano_inspiration", "list");
  const trackShare = useShareTracking(card.id, "nano_inspiration", "list");
  const trackSave = useClickTracking(card.id, "nano_inspiration", "list");
  const trackGenerate = useClickTracking(card.id, "nano_inspiration", "list"); // Track generation

  const getCanonicalUrl = () => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "";
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    return `${baseUrl}/${locale}/n/${card.id}`;
  };

  const canonicalUrl = getCanonicalUrl();

  const normalized = useMemo(() => {
    const imageUrls = (card.image_urls || []).map(normalizeNanoImageUrl);
    const previewUrls =
      card.preview_image_urls && card.preview_image_urls.length > 0
        ? card.preview_image_urls.map((u) => {
            if (!u) return "";
            if (u.startsWith("http://") || u.startsWith("https://")) return u;
            if (u.startsWith("/")) return u;
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

  const handleCardClick = () => {
    trackCardClick();
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
      await navigator.clipboard.writeText(card.prompt);
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

  const handleGenerate = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackGenerate();
    onGenerateClick?.(card);
  };

  const abbreviatedPrompt = card.prompt.length > 120 ? card.prompt.slice(0, 120) + "..." : card.prompt;
  const displaySrc = normalized.previewUrls[currentImageIndex] || normalized.imageUrls[currentImageIndex] || "";

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-5 shadow-md hover:shadow-2xl hover:border-purple-300 transition-all duration-300 cursor-pointer"
    >
      {/* Category Badge - Enhanced */}
      <div className="mb-4 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-bold text-purple-700 border border-purple-200 shadow-sm">
          <span className="text-base">💡</span>
          {card.category}
        </span>
        {card.template_id && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-purple-600 border border-purple-200">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            Template
          </span>
        )}
      </div>

      {/* Image Carousel - Enhanced */}
      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-2xl bg-white shadow-inner border-2 border-purple-100">
        {displaySrc ? (
          <CdnImage src={displaySrc} alt={`${card.category} preview ${currentImageIndex + 1}`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-400">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-2 text-white opacity-0 transition-all hover:bg-black/75 group-hover:opacity-100 shadow-lg"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 backdrop-blur-sm px-3 py-2 text-white opacity-0 transition-all hover:bg-black/75 group-hover:opacity-100 shadow-lg"
              type="button"
              aria-label="Next image"
            >
              ›
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              {Array.from({ length: totalImages }).map((_, idx) => (
                <div
                  key={idx}
                  className={classNames("h-2 rounded-full transition-all", idx === currentImageIndex ? "w-6 bg-white" : "w-2 bg-white/60 hover:bg-white/80")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Prompt - Enhanced */}
      <div className="mb-4 p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-purple-100">
        <p className="text-sm leading-relaxed text-neutral-700 font-medium">{abbreviatedPrompt}</p>
      </div>

      {/* Actions - Enhanced */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleSave}
          className={classNames(
            "inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm",
            saved
              ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300"
              : "bg-white text-neutral-600 border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300"
          )}
          type="button"
        >
          <span className="text-base">{saved ? "🔖" : "🤔"}</span>
          <span>{saveCount}</span>
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white text-neutral-600 border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
          type="button"
        >
          <span className="text-base">📋</span>
          <span>{copyCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-white text-neutral-600 border-2 border-neutral-200 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
          type="button"
        >
          <span className="text-base">↗</span>
          <span>{shareCount}</span>
        </button>

        {/* Generate Button - NEW */}
        {card.template_id && onGenerateClick && (
          <button
            onClick={handleGenerate}
            className="ml-auto inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            type="button"
          >
            <span className="text-base">✨</span>
            <span>生成</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function NanoInspirationRow({ cards, requireAuth, onViewClick, onGenerateClick }: NanoInspirationRowProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <NanoInspirationCard key={c.id} card={c} requireAuth={requireAuth} onViewClick={onViewClick} onGenerateClick={onGenerateClick} />
      ))}
    </div>
  );
}

interface NanoInspirationRowProps {
  cards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
  onGenerateClick?: (card: NanoInspirationCardType) => void;
}
