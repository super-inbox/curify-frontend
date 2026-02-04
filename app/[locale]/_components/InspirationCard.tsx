"use client";

import { useState } from "react";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { useCopyTracking, useShareTracking, useClickTracking } from "@/services/useTracking";

type Source = { label: string; url?: string };
type CardImage = { image_url: string; preview_image_url?: string; alt?: string };
export type InspirationCardType = {
  id: string;
  lang?: string;
  hook?: { text?: string };
  signal?: { summary?: string; sources?: Source[] };
  translation?: { tag?: string; angles?: string[] };
  production?: { title?: string; format?: string; durationSec?: number; beats?: string[] };
  visual?: { images?: CardImage[] };
  rating?: { score: number; reason: string };
  actions?: { copy?: { label?: string; payload?: string }; share?: { label?: string; url?: string } };
};
type ViewMode = "list" | "cards";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function stripQuotes(s: string) {
  return (s || "").replaceAll('"', "").replaceAll('"', "").trim();
}

function getImgSrc(img?: { image_url?: string; preview_image_url?: string } | null) {
  if (!img) return "";
  return img.preview_image_url || img.image_url || "";
}

interface InspirationCardProps {
  card: InspirationCardType;
  viewMode: ViewMode;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: () => void;
}

// Card View (Masonry Layout) - IMPROVED VERSION
export function InspirationCard({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  const trackView = useClickTracking(card.id, "inspiration", viewMode);

  const handleClick = () => {
    trackView();
    onViewClick?.();
  };

  return (
    <div
      id={card.id}
      onClick={handleClick}
      className="group mb-5 break-inside-avoid rounded-3xl border border-neutral-200 bg-white shadow-sm cursor-pointer hover:shadow-xl hover:border-neutral-300 transition-all duration-300 overflow-hidden"
    >
      <CardHeader card={card} />
      <CardBody card={card} />
      <CardFooter card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
    </div>
  );
}

// List View - IMPROVED VERSION
export function InspirationListItem({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  const trackView = useClickTracking(card.id, "inspiration", viewMode);
  const img0 = card?.visual?.images?.[0];
  const thumbSrc = getImgSrc(img0);

  const handleClick = () => {
    trackView();
    onViewClick?.();
  };

  return (
    <div
      id={card.id}
      onClick={handleClick}
      className="group flex gap-5 rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm hover:shadow-xl hover:border-neutral-300 transition-all duration-300 cursor-pointer"
    >
      {/* Thumbnail - Enhanced */}
      <div className="flex-shrink-0">
        <div className="h-32 w-32 overflow-hidden rounded-2xl border-2 border-neutral-100 bg-gradient-to-br from-neutral-50 to-neutral-100 group-hover:border-neutral-200 transition-colors">
          {card?.visual?.images?.[0] ? (
            <CdnImage
              src={thumbSrc}
              alt={card.visual.images[0].alt || "preview"}
              width={128}
              height={128}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content - Enhanced */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* Header */}
        <div>
          <div className="flex items-start gap-3 mb-2">
            <h3 className="flex-1 text-lg font-bold leading-tight text-neutral-900 group-hover:text-neutral-700 transition-colors">
              {stripQuotes(card?.hook?.text || "") || card?.signal?.summary || "Inspiration"}
            </h3>
            {card?.rating && (
              <div className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1.5 text-sm font-semibold text-amber-700 shadow-sm">
                <span>⭐</span>
                <span>{card.rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
          {card?.signal?.summary && card.signal.summary !== card?.hook?.text && (
            <p className="line-clamp-2 text-sm leading-relaxed text-neutral-600">{card.signal.summary}</p>
          )}
        </div>

        {/* Tags - Enhanced */}
        <div className="flex flex-wrap gap-2">
          {card?.translation?.tag && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1.5 text-xs font-medium text-purple-700 border border-purple-100">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              {card.translation.tag}
            </span>
          )}
          {card?.translation?.angles?.slice(0, 3).map((angle) => (
            <span key={angle} className="inline-flex rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-100">
              {angle}
            </span>
          ))}
        </div>

        {/* Action Buttons - Enhanced */}
        <div className="mt-auto">
          <ListItemActions card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
        </div>
      </div>
    </div>
  );
}

function ListItemActions({ card, viewMode, requireAuth }: { card: InspirationCardType; viewMode: ViewMode; requireAuth: (reason?: string) => boolean; onViewClick?: () => void }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const seedNum = parseInt(card.id.split("-").pop() || "0", 10) || Math.floor(Math.random() * 1000);
  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50);
  const [copyCount, setCopyCount] = useState(Math.floor(seedNum * 1.3) % 150 + 100);
  const [shareCount, setShareCount] = useState(Math.floor(seedNum * 0.7) % 50 + 20);

  const trackCopy = useCopyTracking(card.id, "inspiration", viewMode);
  const trackShare = useShareTracking(card.id, "inspiration", viewMode);
  const trackSave = useClickTracking(card.id, "inspiration", viewMode);

  const getCanonicalUrl = () => {
    if (card?.actions?.share?.url) return card.actions.share.url;
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    const baseUrl = typeof window !== "undefined" ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL || "";
    const locale = pathname.startsWith("/en") ? "en" : "zh";
    return `${baseUrl}/${locale}/i/${card.id}`;
  };
  const canonicalUrl = getCanonicalUrl();

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation();
    if (!requireAuth("save_inspiration")) return;
    trackSave();
    if (saved) {
      setSaved(false);
      setSaveCount((prev) => prev - 1);
    } else {
      setSaved(true);
      setSaveCount((prev) => prev + 1);
    }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const payload = card?.actions?.copy?.payload || stripQuotes(card?.hook?.text || "");
      await navigator.clipboard.writeText(payload);
      trackCopy();
      if (!copied) {
        setCopied(true);
        setCopyCount((prev) => prev + 1);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {}
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      if (!shared) {
        setShared(true);
        setShareCount((prev) => prev + 1);
        setTimeout(() => setShared(false), 1500);
      }
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSave}
        className={classNames(
          "group/btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm",
          saved
            ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 hover:from-amber-100 hover:to-orange-100"
            : "bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300"
        )}
      >
        <span className="text-base">{saved ? "🔖" : "🤔"}</span>
        <span className="font-semibold">{saveCount}</span>
      </button>
      <button
        onClick={handleCopy}
        className="group/btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
      >
        <span className="text-base">📋</span>
        <span className="font-semibold">{copyCount}</span>
      </button>
      <button
        onClick={handleShare}
        className="group/btn inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-white text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
      >
        <span className="text-base">↗</span>
        <span className="font-semibold">{shareCount}</span>
      </button>
    </div>
  );
}

function CardHeader({ card }: { card: InspirationCardType }) {
  const hook = stripQuotes(card?.hook?.text || "");
  const tag = card?.translation?.tag;
  return (
    <div className="px-5 pt-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{card?.lang?.toUpperCase?.() || "ZH"}</div>
            {card?.rating && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-2.5 py-1 text-xs font-semibold text-amber-700 border border-amber-100">
                <span>⭐</span>
                <span>{card.rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h2 className="text-lg font-bold leading-snug text-neutral-900 group-hover:text-neutral-700 transition-colors line-clamp-3">
            {hook || "Inspiration"}
          </h2>
          {tag && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-purple-50 to-pink-50 px-3 py-1.5 text-xs font-medium text-purple-700 border border-purple-100">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
              {tag}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CardBody({ card }: { card: InspirationCardType }) {
  const images = card?.visual?.images || [];
  const angles = card?.translation?.angles || [];
  const beats = card?.production?.beats || [];
  const sources = card?.signal?.sources || [];

  return (
    <div className="px-5 pb-5">
      {/* Images - Enhanced */}
      {images.length > 0 && (
        <div className={classNames("mt-4 grid gap-3", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {images.slice(0, 2).map((img) => (
            <div key={img.image_url} className="relative overflow-hidden rounded-2xl border-2 border-neutral-100 group-hover:border-neutral-200 transition-colors">
              <CdnImage src={img.image_url} alt={img.alt || "preview"} width={900} height={1200} className="h-auto w-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
          ))}
        </div>
      )}

      {/* Signal - Enhanced */}
      <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-neutral-50 to-neutral-100/50 border border-neutral-100">
        <div className="text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-2">信号源</div>
        <p className="text-sm leading-relaxed text-neutral-700">{card?.signal?.summary}</p>
        {sources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {sources.slice(0, 4).map((s, idx) => {
              const key = `${s.label}-${idx}`;
              return s.url ? (
                <a key={key} href={s.url} target="_blank" rel="noreferrer" className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 border border-neutral-200 hover:border-neutral-300 transition-colors">
                  {s.label}
                </a>
              ) : (
                <span key={key} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-neutral-600 border border-neutral-200">
                  {s.label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Creator Lens - Enhanced */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100">
        <div className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">灵感转化</div>
        {angles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {angles.map((a) => (
              <span key={a} className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 border border-blue-200">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Production - Enhanced */}
      <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50/50 border border-green-100">
        <div className="text-xs font-semibold text-green-900 uppercase tracking-wider mb-1">{card?.production?.title || "制作建议"}</div>
        <div className="text-xs text-green-700 mb-3">
          形式：{card?.production?.format || "-"}
          {card?.production?.durationSec ? ` · ${card.production.durationSec}s` : ""}
        </div>
        {beats.length > 0 && (
          <ul className="space-y-2">
            {beats.slice(0, 4).map((b, idx) => (
              <li key={b} className="flex items-start gap-2 text-sm text-green-800">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 text-green-700 flex items-center justify-center text-xs font-semibold mt-0.5">{idx + 1}</span>
                <span className="flex-1">{b}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI Rating Details */}
      {card?.rating?.reason && (
        <details className="mt-4 group/details">
          <summary className="cursor-pointer text-xs font-semibold text-neutral-800 hover:text-neutral-900 px-4 py-2 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 transition-colors">
            AI评分详情
          </summary>
          <p className="mt-3 text-xs leading-relaxed text-neutral-600 px-4 py-3 rounded-xl bg-neutral-50 border border-neutral-100">{card.rating.reason}</p>
        </details>
      )}
    </div>
  );
}

function CardFooter({ card, viewMode, requireAuth, onViewClick }: { card: InspirationCardType; viewMode: ViewMode; requireAuth: (reason?: string) => boolean; onViewClick?: () => void }) {
  return (
    <div className="border-t border-neutral-100 px-5 py-4 bg-gradient-to-b from-white to-neutral-50/30">
      <ListItemActions card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
    </div>
  );
}
