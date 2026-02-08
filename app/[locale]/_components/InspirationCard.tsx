"use client";

import { useEffect } from "react"; // add this import
import { useState } from "react";
import { stableHashToInt } from "@/lib/hash_utils";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { useCopyTracking, useShareTracking, useClickTracking } from "@/services/useTracking";

// ... [Keep Type Definitions and Helper Functions as is] ...
type Source = { label: string; url?: string; };
type CardImage = { image_url: string; preview_image_url?: string; alt?: string; };
export type InspirationCardType = {
  id: string;
  lang?: string;
  hook?: { text?: string };
  signal?: { summary?: string; sources?: Source[] };
  translation?: { tag?: string; angles?: string[] };
  production?: { title?: string; format?: string; durationSec?: number; beats?: string[] };
  visual?: { images?: CardImage[] };
  rating?: { score: number; reason: string };
  actions?: { copy?: { label?: string; payload?: string }; share?: { label?: string; url?: string }; };
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

// Card View (Masonry Layout)
export function InspirationCard({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  // console.log("[InspirationCard render]", card.id, viewMode);

  // TRACKING: Use click tracking for "View", removed useViewTracking
  const trackView = useClickTracking(card.id, "inspiration", viewMode);

  const handleClick = () => {
    trackView(); // Track "View"
    onViewClick?.();
  };

  return (
    <div
      id={card.id}
      onClick={handleClick}
      className="mb-5 break-inside-avoid rounded-2xl border border-neutral-200 bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <CardHeader card={card} />
      <CardBody card={card} />
      <CardFooter card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
    </div>
  );
}

// List View
export function InspirationListItem({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  
  // console.log("[InspirationListItem render]", card.id);

  const trackView = useClickTracking(card.id, "inspiration", viewMode);

  const img0 = card?.visual?.images?.[0];
  const thumbSrc = getImgSrc(img0);

  // useEffect(() => {
  //   // prints whenever the thumbnail src changes
  //   console.log("[InspirationListItem] thumb", {
  //     id: card.id,
  //     viewMode,
  //     thumbSrc,
  //     raw: img0,
  //   });
  // }, [card.id, viewMode, thumbSrc]); // keep deps small

  const handleClick = () => {
    trackView(); // Track "View"
    onViewClick?.();
  };

  return (
    <div
      id={card.id}
      onClick={handleClick}
      className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-lg hover:border-neutral-300 transition-all cursor-pointer"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 mt-0.5">
        <div className="h-28 w-28 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
          {card?.visual?.images?.[0] ? (
            <CdnImage
              src={thumbSrc}

              alt={card.visual.images[0].alt || "preview"}
              width={112}
              height={112}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start gap-2">
            <h3 className="flex-1 text-base font-semibold leading-snug text-neutral-900">
              {stripQuotes(card?.hook?.text || "") || card?.signal?.summary || "Inspiration"}
            </h3>
            {card?.rating && (
              <div className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span>⭐</span><span>{card.rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
          {card?.signal?.summary && card.signal.summary !== card?.hook?.text && (
            <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{card.signal.summary}</p>
          )}
        </div>

        {/* Tags */}
        <div className="mt-2 flex flex-wrap gap-2">
          {card?.translation?.tag && (
            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">{card.translation.tag}</span>
          )}
          {card?.translation?.angles?.slice(0, 3).map((angle) => (
            <span key={angle} className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">{angle}</span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-3">
          <ListItemActions card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
        </div>
      </div>
    </div>
  );
}

// ... [Keep ListItemActions, CardHeader, CardBody, CardFooter almost as is, but remove useViewTracking usages if any were hiding there] ...

// Simplified ListItemActions (just ensuring imports and logic match new request)
function ListItemActions({ card, viewMode, requireAuth }: { card: InspirationCardType; viewMode: ViewMode; requireAuth: (reason?: string) => boolean; onViewClick?: () => void; }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  
  // Mock numbers (Deterministic)
  const seedNum = stableHashToInt(card.id);
  const [saveCount, setSaveCount] = useState(seedNum % 100 + 50); 
  const [copyCount, setCopyCount] = useState(Math.floor(seedNum * 1.3) % 150 + 100); 
  const [shareCount, setShareCount] = useState(Math.floor(seedNum * 0.7) % 50 + 20); 

  const trackCopy = useCopyTracking(card.id, "inspiration", viewMode);
  const trackShare = useShareTracking(card.id, "inspiration", viewMode);
  const trackSave = useClickTracking(card.id, "inspiration", viewMode); // Save tracking

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
    if (saved) { setSaved(false); setSaveCount(prev => prev - 1); } 
    else { setSaved(true); setSaveCount(prev => prev + 1); }
  }

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      const payload = card?.actions?.copy?.payload || stripQuotes(card?.hook?.text || "");
      await navigator.clipboard.writeText(payload);
      trackCopy();
      if (!copied) { setCopied(true); setCopyCount(prev => prev + 1); setTimeout(() => setCopied(false), 1500); }
    } catch {}
  }

  async function handleShare(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      if (!shared) { setShared(true); setShareCount(prev => prev + 1); setTimeout(() => setShared(false), 1500); }
    } catch {}
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={handleSave} className={classNames("inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer hover:scale-105 active:scale-95", saved ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50")}>
        <span>{saved ? "🔖" : "🤍"}</span><span>{saveCount}</span>
      </button>
      <button onClick={handleCopy} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer hover:scale-105 active:scale-95">
        <span>📋</span><span>{copyCount}</span>
      </button>
      <button onClick={handleShare} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-all cursor-pointer hover:scale-105 active:scale-95">
        <span>↗</span><span>{shareCount}</span>
      </button>
    </div>
  );
}

// ... [CardHeader, CardBody, CardFooter reuse logic similar to ListItemActions for buttons] ...
// Ensure CardFooter also uses the same tracking hooks logic as ListItemActions above.
function CardHeader({ card }: { card: InspirationCardType }) {
  const hook = stripQuotes(card?.hook?.text || "");
  const tag = card?.translation?.tag;
  return (
    <div className="px-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-xs text-neutral-500">{card?.lang?.toUpperCase?.() || "ZH"}</div>
            {card?.rating && (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                <span>⭐</span><span>{card.rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">{hook || "Inspiration"}</h2>
          {tag ? <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">{tag}</div> : null}
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
    <div className="px-4 pb-4">
      {images.length ? (
        <div className={classNames("mt-4 grid gap-2", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {images.slice(0, 2).map((img) => (
            <div key={img.image_url} className="relative overflow-hidden rounded-xl border border-neutral-100">
              <CdnImage src={img.image_url} alt={img.alt || "preview"} width={900} height={1200} className="h-auto w-full object-cover" />
            </div>
          ))}
        </div>
      ) : null}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">信号源</div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{card?.signal?.summary}</p>
        {sources.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {sources.slice(0, 4).map((s, idx) => {
              const key = `${s.label}-${idx}`;
              return s.url ? <a key={key} href={s.url} target="_blank" rel="noreferrer" className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600 hover:bg-neutral-100">{s.label}</a> : <span key={key} className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600">{s.label}</span>;
            })}
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">灵感转化</div>
        {angles.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {angles.map((a) => <span key={a} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">{a}</span>)}
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">{card?.production?.title || "制作建议"}</div>
        <div className="mt-1 text-xs text-neutral-600">形式：{card?.production?.format || "-"} {card?.production?.durationSec ? `· ${card.production.durationSec}s` : ""}</div>
        {beats.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {beats.slice(0, 4).map((b) => <li key={b}>{b}</li>)}
          </ul>
        ) : null}
      </div>
      {card?.rating?.reason && (
        <details className="mt-4">
          <summary className="cursor-pointer text-xs font-medium text-neutral-800 hover:text-neutral-900">AI评分详情</summary>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">{card.rating.reason}</p>
        </details>
      )}
    </div>
  );
}

function CardFooter({ card, viewMode, requireAuth, onViewClick }: { card: InspirationCardType; viewMode: ViewMode; requireAuth: (reason?: string) => boolean; onViewClick?: () => void; }) {
  // Uses exact same logic/hooks as ListItemActions
  return (
    <div className="border-t border-neutral-100 px-4 py-3">
       <ListItemActions card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
    </div>
  );
}