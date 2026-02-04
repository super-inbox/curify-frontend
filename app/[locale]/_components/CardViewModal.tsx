"use client";

import { useEffect } from "react";
import { InspirationCardType } from "./InspirationCard";
import { NanoInspirationCardType } from "./NanoInspirationCard";

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

  const getCanonicalUrl = () => {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "";

    const prefix = cardType === "inspiration" ? "i" : "n";
    return `${baseUrl}/${locale}/${prefix}/${card.id}`;
  };

  const canonicalUrl = getCanonicalUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - Enhanced */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md cursor-pointer" onClick={onClose} />

      {/* Modal - Enhanced */}
      <div className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-auto rounded-3xl shadow-2xl border-2 border-white/10">
        {/* Header - Enhanced */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-gradient-to-r from-white via-white to-neutral-50 px-8 py-5 border-b-2 border-neutral-200 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <h2 className="text-xl font-bold text-neutral-900">
                {cardType === "inspiration" ? "Inspiration Card" : "Nano Banana Card"}
              </h2>
            </div>
            <span className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-1.5 text-sm font-semibold text-purple-700 border border-purple-200">
              #{card.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="group rounded-xl p-3 text-neutral-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 hover:text-red-600 transition-all cursor-pointer border-2 border-transparent hover:border-red-200"
            type="button"
            aria-label="Close modal"
          >
            <svg className="h-6 w-6 group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Enhanced */}
        <div className="p-8 bg-gradient-to-br from-white via-neutral-50/30 to-white">
          {cardType === "inspiration" ? (
            <InspirationCardDetailView card={card as InspirationCardType} />
          ) : (
            <NanoBananaCardDetailView card={card as NanoInspirationCardType} />
          )}

          {/* Canonical URL - Enhanced */}
          <div className="mt-8 rounded-2xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></div>
              <div className="text-sm font-bold text-purple-900 uppercase tracking-wider">Canonical URL</div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={canonicalUrl}
                readOnly
                className="flex-1 rounded-xl border-2 border-purple-200 bg-white px-4 py-3 text-sm text-neutral-700 font-medium focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(canonicalUrl);
                }}
                className="group rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 text-sm font-bold text-white hover:from-purple-600 hover:to-pink-600 transition-all cursor-pointer shadow-md hover:shadow-lg hover:scale-105 active:scale-95 border-2 border-purple-400"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inspiration Card Detail View - Enhanced
function InspirationCardDetailView({ card }: { card: InspirationCardType }) {
  const hook = card.hook?.text?.replaceAll('"', "").replaceAll('"', "").trim() || "";
  const tag = card.translation?.tag;
  const images = card?.visual?.images || [];
  const angles = card?.translation?.angles || [];
  const beats = card?.production?.beats || [];
  const sources = card?.signal?.sources || [];

  return (
    <div className="space-y-6">
      {/* Header - Enhanced */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 border-2 border-neutral-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider">{card?.lang?.toUpperCase?.() || "ZH"}</div>
          {card?.rating && (
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 text-sm font-bold text-amber-700 border-2 border-amber-200 shadow-sm" title={card.rating.reason}>
              <span className="text-base">⭐</span>
              <span>{card.rating.score.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h2 className="text-2xl font-bold leading-snug text-neutral-900 mb-3">{hook || "Inspiration"}</h2>
        {tag && (
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-semibold text-purple-700 border-2 border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            {tag}
          </div>
        )}
      </div>

      {/* Visual - Enhanced */}
      {images.length > 0 && (
        <div className={classNames("grid gap-4", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {images.slice(0, 2).map((img) => (
            <div key={img.image_url} className="group relative overflow-hidden rounded-2xl border-2 border-neutral-200 shadow-md hover:shadow-xl transition-all">
              <img src={normalizeImageSrc(img.image_url)} alt={img.alt || "preview"} className="h-auto w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* Signal - Enhanced */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border-2 border-blue-200">
        <div className="text-sm font-bold text-blue-900 uppercase tracking-wider mb-3">信号源</div>
        <p className="text-base leading-relaxed text-blue-800 mb-4">{card?.signal?.summary}</p>

        {sources.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {sources.slice(0, 4).map((s, idx) => {
              const key = `${s.label}-${idx}`;
              return s.url ? (
                <a key={key} href={s.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-300 transition-all shadow-sm hover:shadow">
                  {s.label}
                </a>
              ) : (
                <span key={key} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-600 border-2 border-blue-200">
                  {s.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Lens - Enhanced */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/50 border-2 border-green-200">
        <div className="text-sm font-bold text-green-900 uppercase tracking-wider mb-3">灵感转化</div>
        {angles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {angles.map((a) => (
              <span key={a} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-green-700 border-2 border-green-200 shadow-sm">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Production - Enhanced */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/50 border-2 border-purple-200">
        <div className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-2">{card?.production?.title || "制作建议"}</div>
        <div className="text-sm text-purple-700 mb-4 font-medium">
          形式：{card?.production?.format || "-"}
          {card?.production?.durationSec ? ` · ${card.production.durationSec}s` : ""}
        </div>
        {beats.length > 0 && (
          <ul className="space-y-3">
            {beats.slice(0, 4).map((b, idx) => (
              <li key={b} className="flex items-start gap-3 text-base text-purple-800">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-200 to-pink-200 text-purple-700 flex items-center justify-center text-sm font-bold mt-0.5 border-2 border-purple-300">{idx + 1}</span>
                <span className="flex-1 pt-0.5">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Rating Details - Enhanced */}
      {card?.rating?.reason && (
        <details className="group/details">
          <summary className="cursor-pointer text-sm font-bold text-neutral-800 hover:text-neutral-900 px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 hover:border-amber-300 transition-all shadow-sm hover:shadow">
            <span className="flex items-center gap-2">
              <span className="text-base">⭐</span>
              AI评分详情
            </span>
          </summary>
          <p className="mt-4 text-sm leading-relaxed text-neutral-700 px-6 py-4 rounded-2xl bg-neutral-50 border-2 border-neutral-200">{card.rating.reason}</p>
        </details>
      )}
    </div>
  );
}

// Nano Banana Card Detail View - Enhanced
function NanoBananaCardDetailView({ card }: { card: NanoInspirationCardType }) {
  const normalized = card.image_urls?.map(normalizeImageSrc) || [];

  return (
    <div className="space-y-6">
      {/* Category - Enhanced */}
      <div className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 text-lg font-bold text-purple-700 border-2 border-purple-200 shadow-md">
        <span className="text-2xl">💡</span>
        {card.category}
      </div>

      {/* Prompt - Enhanced */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-200">
        <h4 className="mb-3 text-sm font-bold text-purple-900 uppercase tracking-wider">Prompt</h4>
        <p className="rounded-xl bg-white/80 backdrop-blur-sm p-5 text-base leading-relaxed text-neutral-700 border-2 border-purple-100 shadow-sm">{card.prompt}</p>
      </div>

      {/* Images - Enhanced */}
      {normalized.length > 0 && (
        <div>
          <h4 className="mb-4 text-sm font-bold text-purple-900 uppercase tracking-wider">Example Images ({normalized.length})</h4>
          <div className="grid grid-cols-2 gap-4">
            {normalized.map((fullUrl, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl border-2 border-purple-200 shadow-md hover:shadow-xl transition-all">
                <img src={fullUrl} alt={`${card.category} example ${idx + 1}`} className="rounded-xl group-hover:scale-105 transition-transform duration-300" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
