"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type Source = {
  label: string;
  url?: string;
};

type CardImage = {
  url: string;
  alt?: string;
};

type Card = {
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

type ShareData = {
  title?: string;
  text?: string;
  url?: string;
};

type ViewMode = "cards" | "list";

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function stripQuotes(s: string) {
  return (s || "").replaceAll('"', "").replaceAll('"', "").trim();
}

export default function InspirationHubClient({ cards }: { cards: Card[] }) {
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    
    let result = cards;
    
    // Text search
    if (q) {
      result = result.filter((c) => {
        const hay = [
          c?.signal?.summary,
          c?.translation?.tag,
          ...(c?.translation?.angles || []),
          c?.hook?.text,
          c?.production?.format,
          ...(c?.production?.beats || []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return hay.includes(q);
      });
    }
    
    // Rating filter
    if (minRating !== null) {
      result = result.filter((c) => {
        return c.rating && c.rating.score >= minRating;
      });
    }

    return result;
  }, [cards, query, minRating]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search signals, angles, hooks..."
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
            />
          </div>
          
          {/* Rating Filter */}
          <select
            value={minRating?.toString() || ""}
            onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : null)}
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex gap-1 rounded-xl border border-neutral-200 bg-white p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "cards"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              ⊞ Cards
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={classNames(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                viewMode === "list"
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              )}
            >
              ☰ List
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-neutral-500">
          <span>
            Showing{" "}
            <span className="font-medium text-neutral-700">{filtered.length}</span>{" "}
            of {cards.length} cards
          </span>
          {minRating && (
            <button
              onClick={() => setMinRating(null)}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Conditional Rendering Based on View Mode */}
      {viewMode === "cards" ? (
        <CardsView filtered={filtered} />
      ) : (
        <ListView filtered={filtered} />
      )}
      
      {filtered.length === 0 && (
        <div className="py-16 text-center text-neutral-500">
          <p>No cards found matching your criteria.</p>
          {minRating && (
            <button
              onClick={() => setMinRating(null)}
              className="mt-2 text-blue-600 hover:text-blue-700"
            >
              Clear rating filter
            </button>
          )}
        </div>
      )}
    </section>
  );
}

// Cards View (Original Waterfall Layout)
function CardsView({ filtered }: { filtered: Card[] }) {
  return (
    <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
      {filtered.map((card) => (
        <div
          key={card.id}
          id={card.id}
          className="mb-5 break-inside-avoid rounded-2xl border border-neutral-200 bg-white shadow-sm"
        >
          <CardHeader card={card} />
          <CardBody card={card} />
          <CardFooter card={card} />
        </div>
      ))}
    </div>
  );
}

// List View (Single Column with Image, Title/Summary, Tags)
function ListView({ filtered }: { filtered: Card[] }) {
  return (
    <div className="space-y-4">
      {filtered.map((card) => (
        <div
          key={card.id}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <div>
              {/* Title / Summary */}
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
              
              {/* Summary if different from title */}
              {card?.signal?.summary && card.signal.summary !== card?.hook?.text && (
                <p className="mt-1 line-clamp-2 text-sm text-neutral-600">
                  {card.signal.summary}
                </p>
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
                <span
                  key={angle}
                  className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
                >
                  {angle}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CardHeader({ card }: { card: Card }) {
  const hook = stripQuotes(card?.hook?.text || "");
  const tag = card?.translation?.tag;

  return (
    <div className="px-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div className="text-xs text-neutral-500">
              {card?.lang?.toUpperCase?.() || "ZH"}
            </div>
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
          <h2 className="mt-1 line-clamp-2 text-base font-semibold leading-snug">
            {hook || "Inspiration"}
          </h2>
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

function CardBody({ card }: { card: Card }) {
  const images = card?.visual?.images || [];
  const angles = card?.translation?.angles || [];
  const beats = card?.production?.beats || [];
  const sources = card?.signal?.sources || [];

  return (
    <div className="px-4 pb-4">
      {/* Visual */}
      {images.length ? (
        <div
          className={classNames(
            "mt-4 grid gap-2",
            images.length > 1 ? "grid-cols-2" : "grid-cols-1"
          )}
        >
          {images.slice(0, 2).map((img) => (
            <div
              key={img.url}
              className="relative overflow-hidden rounded-xl border border-neutral-100"
            >
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
        <p className="mt-1 text-sm leading-relaxed text-neutral-700">
          {card?.signal?.summary}
        </p>

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
                <span
                  key={key}
                  className="rounded-full bg-neutral-50 px-2.5 py-1 text-xs text-neutral-600"
                >
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
              <span
                key={a}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-700"
              >
                {a}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Production */}
      <div className="mt-4">
        <div className="text-xs font-medium text-neutral-800">
          {card?.production?.title || "制作建议"}
        </div>
        <div className="mt-1 text-xs text-neutral-600">
          形式：{card?.production?.format || "-"}{" "}
          {card?.production?.durationSec ? `· ${card.production.durationSec}s` : ""}
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
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            {card.rating.reason}
          </p>
        </details>
      )}
    </div>
  );
}

function CardFooter({ card }: { card: Card }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const shareUrl =
    card?.actions?.share?.url ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/inspiration-hub#${card.id}`
      : `/inspiration-hub#${card.id}`);

  async function onCopy() {
    try {
      const payload = card?.actions?.copy?.payload || stripQuotes(card?.hook?.text || "");
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {
      // ignore
    }
  }

  async function onShare() {
    try {
      const title = stripQuotes(card?.hook?.text || "Inspiration");
      const text = card?.signal?.summary || "";

      const nav = navigator as Navigator & {
        share?: (data: ShareData) => Promise<void>;
      };

      if (nav?.share) {
        await nav.share({ title, text, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
      }

      setShared(true);
      setTimeout(() => setShared(false), 900);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-neutral-100 px-4 py-3">
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-medium text-white hover:bg-neutral-800"
      >
        <span>📋</span>
        <span>{copied ? "已复制" : card?.actions?.copy?.label || "复制"}</span>
      </button>

      <button
        onClick={onShare}
        className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
      >
        <span>↗</span>
        <span>{shared ? "已分享/已复制链接" : card?.actions?.share?.label || "分享"}</span>
      </button>
    </div>
  );
}
