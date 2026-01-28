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

function classNames(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

function stripQuotes(s: string) {
  return (s || "").replaceAll("“", "").replaceAll("”", "").trim();
}

export default function InspirationHubClient({ cards }: { cards: Card[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;

    return cards.filter((c) => {
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
  }, [cards, query]);

  return (
    <section>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search signals, angles, hooks..."
            className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none ring-0 focus:border-neutral-300"
          />
        </div>
        <div className="text-xs text-neutral-500">
          Showing{" "}
          <span className="font-medium text-neutral-700">{filtered.length}</span>{" "}
          cards
        </div>
      </div>

      {/* Waterfall via CSS columns */}
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
    </section>
  );
}

function CardHeader({ card }: { card: Card }) {
  const hook = stripQuotes(card?.hook?.text || "");
  const tag = card?.translation?.tag;

  return (
    <div className="px-4 pt-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-neutral-500">
            {card?.lang?.toUpperCase?.() || "ZH"}
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
