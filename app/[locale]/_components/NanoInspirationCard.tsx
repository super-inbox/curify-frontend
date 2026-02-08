"use client";

import { useMemo, useState } from "react";
import { stableHashToInt } from "@/lib/hash_utils";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import {
  useCopyTracking,
  useClickTracking,
  useShareTracking,
} from "@/services/useTracking";

export type NanoInspirationCardType = {
  id: string; 
  language: "zh" | "en";
  category: string;
  image_urls: string[];          
  preview_image_urls?: string[]; 
  prompt: string;
};

// ... [Keep normalizeNanoImageUrl and derivePreviewUrlFromImageUrl helpers as is] ...
export function normalizeNanoImageUrl(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/")) return src;
  return `/images/nano_insp/${src}`;
}

function derivePreviewUrlFromImageUrl(imageUrl: string) {
  if (!imageUrl) return "";
  const asPath = imageUrl.startsWith("http")
    ? (() => { try { return new URL(imageUrl).pathname; } catch { return imageUrl; } })()
    : imageUrl;
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
}

export function NanoInspirationCard({ card, requireAuth, onViewClick }: NanoInspirationCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Mock engagement numbers (Deterministic)
  const seedNum = stableHashToInt(card.id);
  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50); 
  const [copyCount, setCopyCount] = useState(Math.floor(seedNum * 1.3) % 150 + 100); 
  const [shareCount, setShareCount] = useState(Math.floor(seedNum * 0.7) % 50 + 20); 

  // TRACKING: Removed useViewTracking
  // We strictly track interactions now
  const trackCardClick = useClickTracking(card.id, "nano_inspiration", "list");
  const trackCopy = useCopyTracking(card.id, "nano_inspiration", "list");
  const trackShare = useShareTracking(card.id, "nano_inspiration", "list");
  const trackSave = useClickTracking(card.id, "nano_inspiration", "list"); // Using click tracking for save action

  const getCanonicalUrl = () => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "";
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    return `${baseUrl}/${locale}/n/${card.id}`;
  };

  const canonicalUrl = getCanonicalUrl();

  const normalized = useMemo(() => {
    const imageUrls = (card.image_urls || []).map(normalizeNanoImageUrl);
    const previewUrls = card.preview_image_urls && card.preview_image_urls.length > 0
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

  // Card click = View
  const handleCardClick = () => {
    trackCardClick(); // Tracks the "View"
    onViewClick?.(card);
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!requireAuth("save_nano_inspiration")) return;
    trackSave(); // Tracks the "Save"
    
    if (saved) {
      setSaved(false);
      setSaveCount(prev => prev - 1);
    } else {
      setSaved(true);
      setSaveCount(prev => prev + 1);
    }
  };

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
  const displaySrc = normalized.previewUrls[currentImageIndex] || normalized.imageUrls[currentImageIndex] || "";

  return (
    <div
      onClick={handleCardClick}
      className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all cursor-pointer"
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
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              type="button"
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 px-2 py-1.5 text-white opacity-0 transition-opacity hover:bg-black/60 group-hover:opacity-100"
              type="button"
            >
              ›
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {Array.from({ length: totalImages }).map((_, idx) => (
                <div key={idx} className={classNames("h-1.5 w-1.5 rounded-full transition-all", idx === currentImageIndex ? "w-3 bg-white" : "bg-white/50")} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Prompt */}
      <p className="text-xs leading-relaxed text-neutral-700 mb-3">{abbreviatedPrompt}</p>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className={classNames("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer hover:scale-105 active:scale-95", saved ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "text-neutral-600 hover:text-neutral-900")}
          type="button"
        >
          <span>{saved ? "🔖" : "🤍"}</span>
          <span>{saveCount}</span>
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer hover:scale-105 active:scale-95"
          type="button"
        >
          <span>📋</span>
          <span>{copyCount}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-all cursor-pointer hover:scale-105 active:scale-95"
          type="button"
        >
          <span>↗</span>
          <span>{shareCount}</span>
        </button>
      </div>
    </div>
  );
}

// ... [Keep NanoInspirationRow as is] ...
export function NanoInspirationRow({ cards, requireAuth, onViewClick }: NanoInspirationRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c) => (
        <NanoInspirationCard key={c.id} card={c} requireAuth={requireAuth} onViewClick={onViewClick} />
      ))}
    </div>
  );
}

interface NanoInspirationRowProps {
  cards: NanoInspirationCardType[];
  requireAuth: (reason?: string) => boolean;
  onViewClick?: (card: NanoInspirationCardType) => void;
}
