"use client";

import { useEffect } from "react";
import { InspirationCardType } from "./InspirationCard";
import { NanoInspirationCard, NanoInspirationCardType } from "./NanoInspirationCard";

function normalizeImageSrc(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

interface CardViewModalProps {
  card: InspirationCardType | NanoInspirationCardType | null;
  isOpen: boolean;
  onClose: () => void;
  cardType: "inspiration" | "nano";
}

export function CardViewModal({ card, isOpen, onClose, cardType }: CardViewModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const canonicalUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/inspiration-hub#${card.id}`
      : `/inspiration-hub#${card.id}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto m-4 bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-900">
              {cardType === "inspiration" ? "Inspiration Card" : "Nano Banana Card"}
            </h2>
            <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-600">
              #{card.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            type="button"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {cardType === "inspiration" ? (
            <InspirationCardContent card={card as InspirationCardType} />
          ) : (
            <NanoBananaCardContent card={card as NanoInspirationCardType} />
          )}

          {/* Canonical URL */}
          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div className="mb-2 text-xs font-medium text-neutral-600">Canonical URL</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={canonicalUrl}
                readOnly
                className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-700"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(canonicalUrl);
                }}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                type="button"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspirationCardContent({ card }: { card: InspirationCardType }) {
  return (
    <div className="space-y-4">
      {/* Hook/Title */}
      {card.hook?.text && (
        <div>
          <h3 className="text-xl font-bold text-neutral-900">{card.hook.text}</h3>
        </div>
      )}

      {/* Rating */}
      {card.rating && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-600">Rating:</span>
          <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700">
            <span>⭐</span>
            <span>{card.rating.score.toFixed(1)}</span>
          </div>
          {card.rating.reason && <span className="text-sm text-neutral-500">— {card.rating.reason}</span>}
        </div>
      )}

      {/* Signal */}
      {card.signal?.summary && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">Signal Source</h4>
          <p className="text-sm leading-relaxed text-neutral-700">{card.signal.summary}</p>
        </div>
      )}

      {/* Sources */}
      {card.signal?.sources && card.signal.sources.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">Sources</h4>
          <div className="flex flex-wrap gap-2">
            {card.signal.sources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-neutral-100 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-200 transition-colors"
              >
                {source.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Translation Angles */}
      {card.translation?.angles && card.translation.angles.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">Creative Angles</h4>
          <div className="flex flex-wrap gap-2">
            {card.translation.angles.map((angle, idx) => (
              <span key={idx} className="rounded-full bg-blue-50 px-3 py-1.5 text-sm text-blue-700">
                {angle}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Production */}
      {card.production && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">
            {card.production.title || "Production Suggestions"}
          </h4>
          <p className="text-sm text-neutral-600">
            Format: {card.production.format || "N/A"}
            {card.production.durationSec && ` · ${card.production.durationSec}s`}
          </p>
          {card.production.beats && card.production.beats.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
              {card.production.beats.map((beat, idx) => (
                <li key={idx}>{beat}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Images */}
      {card.visual?.images && card.visual.images.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">Visual Assets</h4>
          <div className="grid grid-cols-2 gap-4">
            {card.visual.images.map((img, idx) => (
              <img
                key={idx}
                src={normalizeImageSrc(img.url)}
                alt={img.alt || `Visual ${idx + 1}`}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NanoBananaCardContent({ card }: { card: NanoInspirationCardType }) {
  return (
    <div className="space-y-4">
      {/* Category */}
      <div className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
        🍌 {card.category}
      </div>

      {/* Prompt */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-800">Prompt</h4>
        <p className="rounded-lg bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">{card.prompt}</p>
      </div>

      {/* Images */}
      {card.images && card.images.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">
            Example Images ({card.images.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {card.images.map((imgPath, idx) => {
              const fullUrl = normalizeImageSrc(imgPath);
              return (
                <img
                  key={idx}
                  src={fullUrl}
                  alt={`${card.category} example ${idx + 1}`}
                  className="rounded-lg"
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
