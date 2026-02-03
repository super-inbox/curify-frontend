"use client";

import Image from "next/image";
import { useState } from "react";
import { useViewTracking, useCopyTracking, useShareTracking, useClickTracking } from "@/lib/useTracking";

type Source = {
  label: string;
  url?: string;
};

type CardImage = {
  url: string;
  alt?: string;
};

export type InspirationCardType = {
  id: string;
  lang?: string;
  hook?: { text?: string };
  signal?: { summary?: string; sources?: Source[] };
  translation?: { tag?: string; angles?: string[] };
  production?: { title?: string; format?: string; durationSec?: number; beats?: string[] };
  visual?: { images?: CardImage[] };
  rating?: { score: number; reason: string };
  actions?: {
    copy?: { label?: string; payload?: string };
    share?: { label?: string; url?: string };
  };
};

type ViewMode = "list" | "cards";

type ShareData = {
  title?: string;
  text?: string;
  url?: string;
};

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function stripQuotes(s: string) {
  return (s || "").replaceAll('"', "").replaceAll('"', "").trim();
}

interface InspirationCardProps {
  card: InspirationCardType;
  viewMode: ViewMode;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: () => void;
}

// Card View (Masonry Layout)
export function InspirationCard({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  const viewRef = useViewTracking(card.id, "inspiration", viewMode, { threshold: 0.5, once: true });

  return (
    <div
      ref={viewRef as React.Ref<HTMLDivElement>}
      id={card.id}
      className="mb-5 break-inside-avoid rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <CardHeader card={card} />
      <CardBody card={card} />
      <CardFooter card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
    </div>
  );
}

// List View
export function InspirationListItem({ card, viewMode, requireAuth, onViewClick }: InspirationCardProps) {
  const viewRef = useViewTracking(card.id, "inspiration", viewMode, { threshold: 0.5, once: true });

  return (
    <div
      ref={viewRef as React.Ref<HTMLDivElement>}
      id={card.id}
      className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Thumbnail Image */}
      <div className="flex-shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
          {card?.visual?.images?.[0] ? (
            <Image
              src={card.visual.images[0].url}
              alt={card.visual.images[0].alt || "preview"}
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-neutral-300">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
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
              <div
                className="flex-shrink-0 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                title={card.rating.reason}
              >
                <span>⭐</span>
                <span>{card.rating.score.toFixed(1)}</span>
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
            <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
              {card.translation.tag}
            </span>
          )}
          {card?.translation?.angles?.slice(0, 3).map((angle) => (
            <span key={angle} className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700">
              {angle}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-3 border-t border-neutral-100">
          <ListItemActions card={card} viewMode={viewMode} requireAuth={requireAuth} onViewClick={onViewClick} />
        </div>
      </div>
    </div>
  );
}

// Action buttons for list items
function ListItemActions({
  card,
  viewMode,
  requireAuth,
  onViewClick,
}: {
  card: InspirationCardType;
  viewMode: ViewMode;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const trackCopy = useCopyTracking(card.id, "inspiration", viewMode);
  const trackShare = useShareTracking(card.id, "inspiration", viewMode);
  const trackView = useClickTracking(card.id, "inspiration", viewMode);
  const trackSave = useClickTracking(card.id, "inspiration", viewMode);

  const canonicalUrl =
    card?.actions?.share?.url ||
    (typeof window !== "undefined" ? `${window.location.origin}/inspiration-hub#${card.id}` : `/inspiration-hub#${card.id}`);

  async function handleView() {
    if (!requireAuth("view_inspiration")) return;
    trackView();
    onViewClick?.();
  }

  async function handleSave() {
    if (!requireAuth("save_inspiration")) return;
    trackSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    alert("Save functionality coming soon!");
  }

  async function handleCopy() {
    if (!requireAuth("copy_inspiration")) return;
    try {
      const payload = card?.actions?.copy?.payload || stripQuotes(card?.hook?.text || "");
      await navigator.clipboard.writeText(payload);
      trackCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    if (!requireAuth("share_inspiration")) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      setShared(true);
      setTimeout(() => setShared(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={handleView}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        type="button"
      >
        <span>👁️</span>
        <span>View</span>
      </button>

      <button
        onClick={handleSave}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        type="button"
      >
        <span>{saved ? "✓" : "🔖"}</span>
        <span>{saved ? "Saved!" : "Save"}</span>
      </button>

      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        type="button"
      >
        <span>📋</span>
        <span>{copied ? "Copied!" : "Copy"}</span>
      </button>

      <button
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        type="button"
      >
        <span>↗</span>
        <span>{shared ? "Link Copied!" : "Share"}</span>
      </button>
    </div>
  );
}

// Shared Card Components
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
              <div
                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                title={card.rating.reason}
              >
                <span>⭐</span>
                <span>{card.rating.score.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">{hook || "Inspiration"}</h2>
          {tag ? (
            <div className="mt-2 inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
              {tag}
            </div>
          ) : null}
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
      {/* Visual */}
      {images.length ? (
        <div className={classNames("mt-4 grid gap-2", images.length > 1 ? "grid-cols-2" : "grid-cols-1")}>
          {images.slice(0, 2).map((img) => (
            <div key={img.url} className="relative overflow-hidden rounded-xl border border-neutral-100">
              <Image
                src={img.url}
                alt={img.alt || "preview"}
                width={900}
                height={1200}
                className="h-auto w-full object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Signal */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">信号源</div>
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">{card?.signal?.summary}</p>

        {/* Sources */}
        {sources.length ? (
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
        ) : null}
      </div>

      {/* Creator Lens */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">灵感转化</div>
        {angles.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {angles.map((a) => (
              <span key={a} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700">
                {a}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Production */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">{card?.production?.title || "制作建议"}</div>
        <div className="mt-1 text-xs text-neutral-600">
          形式：{card?.production?.format || "-"} {card?.production?.durationSec ? `· ${card.production.durationSec}s` : ""}
        </div>
        {beats.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {beats.slice(0, 4).map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        ) : null}
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

function CardFooter({
  card,
  viewMode,
  requireAuth,
  onViewClick,
}: {
  card: InspirationCardType;
  viewMode: ViewMode;
  requireAuth: (reason?: string) => boolean;
  onViewClick?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);

  const trackCopy = useCopyTracking(card.id, "inspiration", viewMode);
  const trackShare = useShareTracking(card.id, "inspiration", viewMode);
  const trackView = useClickTracking(card.id, "inspiration", viewMode);
  const trackSave = useClickTracking(card.id, "inspiration", viewMode);

  const canonicalUrl =
    card?.actions?.share?.url ||
    (typeof window !== "undefined" ? `${window.location.origin}/inspiration-hub#${card.id}` : `/inspiration-hub#${card.id}`);

  async function handleView() {
    if (!requireAuth("view_inspiration")) return;
    trackView();
    onViewClick?.();
  }

  async function handleSave() {
    if (!requireAuth("save_inspiration")) return;
    trackSave();
    // TODO: Implement save functionality
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    alert("Save functionality coming soon!");
  }

  async function handleCopy() {
    if (!requireAuth("copy_inspiration")) return;
    try {
      const payload = card?.actions?.copy?.payload || stripQuotes(card?.hook?.text || "");
      await navigator.clipboard.writeText(payload);
      trackCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  async function handleShare() {
    if (!requireAuth("share_inspiration")) return;
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      trackShare();
      setShared(true);
      setTimeout(() => setShared(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="border-t border-neutral-100 px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleView}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          type="button"
          title="View details"
        >
          <span>👁️</span>
          <span>View</span>
        </button>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          type="button"
          title="Save for later"
        >
          <span>{saved ? "✓" : "🔖"}</span>
          <span>{saved ? "Saved!" : "Save"}</span>
        </button>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          type="button"
          title="Copy content"
        >
          <span>📋</span>
          <span>{copied ? "Copied!" : "Copy"}</span>
        </button>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          type="button"
          title="Share link"
        >
          <span>↗</span>
          <span>{shared ? "Link Copied!" : "Share"}</span>
        </button>
      </div>
    </div>
  );
}
