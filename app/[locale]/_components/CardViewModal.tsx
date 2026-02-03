"use client";

import { useEffect } from "react";
import { InspirationCardType } from "./InspirationCard";
import { NanoInspirationCard, NanoInspirationCardType } from "./NanoInspirationCard";

function normalizeImageSrc(src?: string | null) {
  if (!src) return "";
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  return src.startsWith("/") ? src : `/${src}`;
}

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
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
            <InspirationCardDetailView card={card as InspirationCardType} />
          ) : (
            <NanoBananaCardDetailView card={card as NanoInspirationCardType} />
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

// Inspiration Card Detail View (like the card view)
function InspirationCardDetailView({ card }: { card: InspirationCardType }) {
  const hook = card.hook?.text?.replaceAll('"', "").replaceAll('"', "").trim() || "";
  const tag = card.translation?.tag;
  const images = card?.visual?.images || [];
  const angles = card?.translation?.angles || [];
  const beats = card?.production?.beats || [];
  const sources = card?.signal?.sources || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs text-neutral-500">{card?.lang?.toUpperCase?.() || "ZH"}</div>
          {card?.rating && (
            <div
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
              title={card.rating.reason}
            >
              <span>⭐</span>
              <span>{card.rating.score.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold leading-snug text-neutral-900">{hook || "Inspiration"}</h2>
        {tag && (
          <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
            {tag}
          </div>
        )}
      </div>

      {/* Visual */}
      {images.length > 0 && (
        <div className={classNames("grid gap-2", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {images.slice(0, 2).map((img) => (
            <div key={img.url} className="relative overflow-hidden rounded-xl border border-neutral-100">
              <img
                src={normalizeImageSrc(img.url)}
                alt={img.alt || "preview"}
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {/* Signal */}
      <div>
        <div className="text-xs font-medium text-neutral-800">信号源</div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{card?.signal?.summary}</p>

        {/* Sources */}
        {sources.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.slice(0, 4).map((s, idx) => {
              const key = `${s.label}-${idx}`;
              return s.url ? (
                <a
                  key={key}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100"
                >
                  {s.label}
                </a>
              ) : (
                <span key={key} className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600">
                  {s.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Lens */}
      <div>
        <div className="text-xs font-medium text-neutral-800">灵感转化</div>
        {angles.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {angles.map((a) => (
              <span key={a} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Production */}
      <div>
        <div className="text-xs font-medium text-neutral-800">{card?.production?.title || "制作建议"}</div>
        <div className="mt-1 text-xs text-neutral-600">
          形式：{card?.production?.format || "-"}{" "}
          {card?.production?.durationSec ? `· ${card.production.durationSec}s` : ""}
        </div>
        {beats.length > 0 && (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {beats.slice(0, 4).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Rating Details */}
      {card?.rating?.reason && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-neutral-800 hover:text-neutral-900">
            AI评分详情
          </summary>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">{card.rating.reason}</p>
        </details>
      )}
    </div>
  );
}

// Nano Banana Card Detail View
function NanoBananaCardDetailView({ card }: { card: NanoInspirationCardType }) {
  const normalized = card.image_urls?.map(normalizeImageSrc) || [];

  return (
    <div className="space-y-4">
      {/* Category */}
      <div className="inline-flex rounded-full bg-purple-100 px-4 py-2 text-sm font-medium text-purple-700">
        💡 {card.category}
      </div>

      {/* Prompt */}
      <div>
        <h4 className="mb-2 text-sm font-semibold text-neutral-800">Prompt</h4>
        <p className="rounded-lg bg-neutral-50 p-4 text-sm leading-relaxed text-neutral-700">{card.prompt}</p>
      </div>

      {/* Images */}
      {normalized.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-semibold text-neutral-800">
            Example Images ({normalized.length})
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {normalized.map((fullUrl, idx) => (
              <img
                key={idx}
                src={fullUrl}
                alt={`${card.category} example ${idx + 1}`}
                className="rounded-lg"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


