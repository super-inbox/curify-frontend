"use client";

import { useEffect } from "react";
import { InspirationCardType } from "./InspirationCard";
import { NanoInspirationCardType } from "@/lib/nano_utils";

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

export function CardViewModal({
  card,
  isOpen,
  onClose,
  cardType,
}: CardViewModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !card) return null;

  const getCanonicalUrl = () => {
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "";
    const prefix = cardType === "inspiration" ? "i" : "n";
    return `${baseUrl}/${locale}/${prefix}/${card.id}`;
  };

  const canonicalUrl = getCanonicalUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-md cursor-pointer"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-4xl max-h-[90vh] overflow-auto rounded-2xl shadow-2xl border border-white/10 bg-white">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur-xl px-5 sm:px-6 py-3.5 border-b border-neutral-200">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 truncate">
              {cardType === "inspiration" ? "Inspiration Card" : "Nano Banana Card"}
            </h2>
            <span className="hidden sm:inline-flex shrink-0 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-100">
              #{card.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="group rounded-lg p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all cursor-pointer"
            type="button"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5 group-hover:rotate-90 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.25}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 bg-white">
          {cardType === "inspiration" ? (
            <InspirationCardDetailView card={card as InspirationCardType} />
          ) : (
            <NanoBananaCardDetailView card={card as NanoInspirationCardType} />
          )}

          {/* Canonical URL */}
          <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="w-1 h-3 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
              <div className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Canonical URL
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={canonicalUrl}
                readOnly
                className="flex-1 rounded-xl border border-purple-200 bg-white px-3 py-2 text-xs sm:text-sm text-neutral-700 font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button
                onClick={() => navigator.clipboard.writeText(canonicalUrl)}
                className="rounded-xl bg-purple-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-purple-700 transition-all cursor-pointer"
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

// Inspiration Card Detail View (COMPACT)
function InspirationCardDetailView({ card }: { card: InspirationCardType }) {
  const hook =
    card.hook?.text?.replaceAll('"', "").replaceAll('"', "").trim() || "";
  const tag = card.translation?.tag;
  const images = card?.visual?.images || [];
  const angles = card?.translation?.angles || [];
  const beats = card?.production?.beats || [];
  const sources = card?.signal?.sources || [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
            {card?.lang?.toUpperCase?.() || "ZH"}
          </div>
          {card?.rating && (
            <div
              className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200"
              title={card.rating.reason}
            >
              <span>⭐</span>
              <span>{card.rating.score.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h2 className="text-xl font-bold leading-snug text-neutral-900">
          {hook || "Inspiration"}
        </h2>

        {tag && (
          <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700 border border-purple-100">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {tag}
          </div>
        )}
      </div>

      {/* Visual */}
      {images.length > 0 && (
        <div
          className={classNames(
            "grid gap-3",
            images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {images.slice(0, 2).map((img) => (
            <div
              key={img.image_url}
              className="group relative overflow-hidden rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all"
            >
              <img
                src={normalizeImageSrc(img.image_url)}
                alt={img.alt || "preview"}
                className="h-auto w-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      )}

      {/* Signal */}
      <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200">
        <div className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
          信号源
        </div>
        <p className="text-sm leading-relaxed text-blue-900/90">
          {card?.signal?.summary}
        </p>

        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.slice(0, 4).map((s, idx) => {
              const key = `${s.label}-${idx}`;
              return s.url ? (
                <a
                  key={key}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
                >
                  {s.label}
                </a>
              ) : (
                <span
                  key={key}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200"
                >
                  {s.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Lens */}
      <div className="p-4 rounded-2xl bg-green-50/40 border border-green-200">
        <div className="text-xs font-bold text-green-900 uppercase tracking-wider mb-2">
          灵感转化
        </div>
        {angles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {angles.map((a) => (
              <span
                key={a}
                className="rounded-full bg-white px-3 py-1 text-xs font-medium text-green-800 border border-green-200"
              >
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Production */}
      <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200">
        <div className="text-xs font-bold text-purple-900 uppercase tracking-wider mb-1">
          {card?.production?.title || "制作建议"}
        </div>
        <div className="text-xs text-purple-800/80 mb-3 font-medium">
          形式：{card?.production?.format || "-"}
          {card?.production?.durationSec ? ` · ${card.production.durationSec}s` : ""}
        </div>

        {beats.length > 0 && (
          <ul className="space-y-2">
            {beats.slice(0, 4).map((b, idx) => (
              <li key={b} className="flex items-start gap-2 text-sm text-purple-900/90">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span className="flex-1">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Rating Details */}
      {card?.rating?.reason && (
        <details className="group/details">
          <summary className="cursor-pointer text-xs font-bold text-neutral-800 hover:text-neutral-900 px-4 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors">
            <span className="flex items-center gap-2">
              <span>⭐</span>
              AI评分详情
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-neutral-700 px-4 py-3 rounded-2xl bg-neutral-50 border border-neutral-200">
            {card.rating.reason}
          </p>
        </details>
      )}
    </div>
  );
}

// Nano Banana Card Detail View (COMPACT)
function NanoBananaCardDetailView({ card }: { card: NanoInspirationCardType }) {
  const normalized = card.image_urls?.map(normalizeImageSrc) || [];

  return (
    <div className="space-y-4">
      {/* Category */}
      <div className="inline-flex items-center gap-2 rounded-2xl bg-purple-50 px-4 py-2 text-sm font-bold text-purple-700 border border-purple-200">
        <span className="text-lg">💡</span>
        {card.category}
      </div>

      {/* Prompt */}
      <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200">
        <h4 className="mb-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
          Prompt
        </h4>
        <p className="rounded-xl bg-white/80 backdrop-blur-sm p-4 text-sm leading-relaxed text-neutral-700 border border-purple-100">
          {card.base_prompt}
        </p>
      </div>

      {/* Images */}
      {normalized.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-bold text-purple-900 uppercase tracking-wider">
            Example Images ({normalized.length})
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {normalized.map((fullUrl, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-purple-200 shadow-sm hover:shadow-md transition-all"
              >
                <img
                  src={fullUrl}
                  alt={`${card.category} example ${idx + 1}`}
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
