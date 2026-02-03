"use client";

import { useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import {
  useViewTracking,
  useCopyTracking,
  useClickTracking,
  useShareTracking,
} from "@/lib/useTracking";

/* =========================
   Types
========================= */

export type NanoInspirationCardType = {
  id: string;               // e.g. "1-zh", "1-en"
  language: "zh" | "en";
  category: string;
  images: string[];
  prompt: string;
};

/* =========================
   Helpers
========================= */

function normalizeImageSrc(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

/* =========================
   Component
========================= */

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const viewRef = useViewTracking(card.id, "nano_inspiration", "list", {
    threshold: 0.5,
    once: true,
  });

  const trackClick = useClickTracking(card.id, "nano_inspiration", "list");
  const trackCopy = useCopyTracking(card.id, "nano_inspiration", "list");
  const trackShare = useShareTracking(card.id, "nano_inspiration", "list");
  const trackSave = useClickTracking(card.id, "nano_inspiration", "list");

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/inspiration-hub#${card.id}`
      : `/inspiration-hub#${card.id}`;

  const nextImage = () =>
    setCurrentImageIndex((prev) => (prev + 1) % card.images.length);

  const prevImage = () =>
    setCurrentImageIndex((prev) => (prev - 1 + card.images.length) % card.images.length);

  /* =========================
     Actions (auth-gated)
  ========================= */

  const handleView = () => {
    if (!requireAuth("view_nano_inspiration")) return;
    trackClick();
    onViewClick?.(card);
  };

  const handleSave = () => {
    if (!requireAuth("save_nano_inspiration")) return;
    trackSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    alert("Save functionality coming soon!");
  };

  const handleCopy = async () => {
    if (!requireAuth("copy_nano_prompt")) return;
    try {
      await navigator.clipboard.writeText(card.prompt);
      trackCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (!requireAuth("share_nano_inspiration")) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      setShared(true);
      setTimeout(() => setShared(false), 900);
    } catch (err) {
      console.error("Failed to share:", err);
    }
  };

  const abbreviatedPrompt =
    card.prompt.length > 80 ? card.prompt.slice(0, 80) + "..." : card.prompt;

  const rawSrc = card.images[currentImageIndex];
  const imageSrc = normalizeImageSrc(rawSrc);

  /* =========================
     Render
  ========================= */

  return (
    <div
      ref={viewRef as React.Ref<HTMLDivElement>}
      className="group relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Category */}
      <div className="mb-3">
        <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700">
          💡 {card.category}
        </span>
      </div>

      {/* Image Carousel */}
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-xl bg-white">
        <CdnImage
          src={imageSrc}
          alt={`${card.category} example ${currentImageIndex + 1}`}
          fill
          className="object-cover"
          unoptimized
        />

        {card.images.length > 1 && (
          <>
            {/* Arrows */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100"
              type="button"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white opacity-0 group-hover:opacity-100"
              type="button"
            >
              ›
            </button>

            {/* Dots */}
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {card.images.map((_, idx) => (
                <div
                  key={idx}
                  className={classNames(
                    "h-1.5 w-1.5 rounded-full",
                    idx === currentImageIndex ? "bg-white w-3" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Prompt */}
      <p className="text-xs leading-relaxed text-neutral-700 mb-3">
        {abbreviatedPrompt}
      </p>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleView();
          }}
          className="btn-secondary"
          type="button"
        >
          👁 View
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleSave();
          }}
          className="btn-secondary"
          type="button"
        >
          {saved ? "✓ Saved" : "🔖 Save"}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          className="btn-primary"
          type="button"
        >
          {copied ? "✓ Copied" : "📋 Copy"}
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleShare();
          }}
          className="btn-secondary"
          type="button"
        >
          {shared ? "✓ Shared" : "↗ Share"}
        </button>
      </div>

      <div className="mt-2 text-xs text-neutral-500 text-center">
        {card.images.length} example{card.images.length > 1 ? "s" : ""}
      </div>
    </div>
  );
}

/* =========================
   Row Component
========================= */

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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <NanoInspirationCard
          key={card.id}
          card={card}
          requireAuth={requireAuth}
          onViewClick={onViewClick}
        />
      ))}
    </div>
  );
}
