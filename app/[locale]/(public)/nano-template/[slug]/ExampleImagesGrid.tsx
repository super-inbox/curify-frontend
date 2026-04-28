"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Bookmark, Download, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { toSlug } from "@/lib/nano_utils";
import { useClickTracking, useTracking } from "@/services/useTracking";
import { templatePacksService } from "@/services/templatePacks";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

type Item = {
  id: string;
  title: string;
  preview: string;
  templateId: string;
  params?: Record<string, string>;
  batch?: boolean;
};

function getCols() {
  if (typeof window === "undefined") return 1;
  const w = window.innerWidth;
  if (w >= 1024) return 5;
  if (w >= 640) return 3;
  return 2;
}

function useCols() {
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const onResize = () => setCols(getCols());

    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, []);

  return cols;
}

// ── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  items,
  initialIndex,
  locale,
  onClose,
}: {
  items: Item[];
  initialIndex: number;
  locale: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const dragStartX = useRef(0);
  const isHorizontalSwipe = useRef<boolean | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goTo(index + 1);
      if (e.key === "ArrowLeft") goTo(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const goTo = useCallback((next: number) => {
    setIndex(Math.max(0, Math.min(items.length - 1, next)));
    setDragX(0);
  }, [items.length]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
    isHorizontalSwipe.current = null;
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;

    // Determine swipe direction on first meaningful move
    if (isHorizontalSwipe.current === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      isHorizontalSwipe.current = Math.abs(dx) > Math.abs(dy);
    }

    if (!isHorizontalSwipe.current) return;

    e.preventDefault();

    const raw = e.touches[0].clientX - dragStartX.current;
    // Rubber-band at edges
    const atStart = index === 0 && raw > 0;
    const atEnd = index === items.length - 1 && raw < 0;
    setDragX(atStart || atEnd ? raw * 0.15 : raw);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
    if (!isHorizontalSwipe.current) { setDragX(0); return; }

    const threshold = window.innerWidth * 0.25;
    if (dragX < -threshold && index < items.length - 1) {
      goTo(index + 1);
    } else if (dragX > threshold && index > 0) {
      goTo(index - 1);
    } else {
      setDragX(0);
    }
  };

  const item = items[index];
  const exampleHref = `/${locale}/nano-template/${toSlug(item.templateId)}/example/${encodeURIComponent(item.id)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Header */}
      <div className="relative flex shrink-0 items-center justify-between px-4 py-3">
        <span className="text-sm text-white/60">
          {index + 1} / {items.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Slide track */}
      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ touchAction: "pan-y" }}
        ref={trackRef}
      >
        <div
          className="flex h-full"
          style={{
            width: `${items.length * 100}%`,
            transform: `translateX(calc(${-index * 100 / items.length}% + ${dragX / items.length}px))`,
            transition: isDragging ? "none" : "transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            willChange: "transform",
          }}
        >
          {items.map((it, i) => (
            <div
              key={it.id}
              className="flex h-full items-center justify-center"
              style={{ width: `${100 / items.length}%` }}
            >
              {Math.abs(i - index) <= 1 && (
                <div className="relative h-full w-full">
                  <CdnImage
                    src={it.preview}
                    alt={it.title || it.id}
                    fill
                    className="object-contain select-none"
                    draggable={false}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Desktop prev/next arrows */}
        {index > 0 && (
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:flex"
            aria-label="Previous"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {index < items.length - 1 && (
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 sm:flex"
            aria-label="Next"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Footer: dots + action link */}
      <div className="shrink-0 flex flex-col items-center gap-3 px-4 py-4">
        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-4 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}
        <Link
          href={exampleHref}
          className="rounded-full bg-white/90 px-5 py-2 text-sm font-bold text-neutral-900 shadow backdrop-blur-sm hover:bg-white"
        >
          View prompt →
        </Link>
      </div>
    </div>
  );
}

// ── Card ────────────────────────────────────────────────────────────────────

function ExampleImageCard({
  item,
  locale,
  onOpenLightbox,
}: {
  item: Item;
  locale: string;
  onOpenLightbox: () => void;
}) {
  const trackClick = useClickTracking(`${item.templateId}:${item.id}`, "nano_inspiration_example_grid", "cards");
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);
  const [saved, setSaved] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    if (saved) return;
    if (!user) { setDrawerState("signin"); return; }
    setSaved(true);
    trackAction(tracking, "favorite");
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const tracking = {
    contentId: `${item.templateId}:${item.id}`,
    contentType: "nano_inspiration_example_grid" as const,
    viewMode: "cards" as const,
  };

  const remixHref = (() => {
    const qs = item.params && Object.keys(item.params).length > 0
      ? `?${new URLSearchParams(item.params).toString()}`
      : "";
    return `/${locale}/nano-template/${toSlug(item.templateId)}${qs}#reproduce`;
  })();

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isDownloadingRef.current) return;
    isDownloadingRef.current = true;
    if (!user) { setDrawerState("signin"); isDownloadingRef.current = false; return; }

    try {
      setIsDownloading(true);
      const res = await templatePacksService.downloadPack({ template_id: item.templateId });
      if (!res?.success || !res?.download_url) throw new Error(res?.message || "Missing download_url");
      const a = document.createElement("a");
      a.href = res.download_url;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      trackAction(tracking, "download");
    } catch {
      alert(t("batchDownloadFailed"));
    } finally {
      setIsDownloading(false);
      isDownloadingRef.current = false;
    }
  };

  return (
    <div className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={`/${locale}/nano-template/${toSlug(item.templateId)}/example/${encodeURIComponent(item.id)}`}
        onClick={(e) => {
          trackClick();
          if (window.matchMedia("(pointer: coarse)").matches) {
            e.preventDefault();
            onOpenLightbox();
          }
        }}
        className="block relative overflow-hidden"
      >
        <CdnImage
          src={item.preview}
          alt={item.title || item.id}
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-4 opacity-0 transition-colors duration-200 group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-neutral-900 shadow backdrop-blur-sm">
            View prompt →
          </span>
        </div>
      </Link>

      <div className="flex items-center justify-between px-3 py-2">
        {item.batch ? (
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-200 disabled:opacity-60"
          >
            <Download className="h-3.5 w-3.5" />
            {isDownloading ? t("downloadingPack") : t("downloadPack")}
          </button>
        ) : (
          <div className="relative">
            <button
              type="button"
              onClick={handleSave}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold transition-colors ${
                saved
                  ? "bg-purple-100 text-purple-700"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-current" : ""}`} />
              {saved ? t("saved") : t("save")}
            </button>
            {showSavedToast && (
              <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap rounded-lg bg-neutral-900 px-3 py-1.5 text-xs text-white shadow-lg">
                Saved! View in your workspace →
              </div>
            )}
          </div>
        )}
        <Link
          href={remixHref}
          onClick={() => {
            document.getElementById("reproduce")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-100 hover:text-purple-900"
        >
          <Sparkles className="h-3.5 w-3.5" />
          Remix this
        </Link>
      </div>
    </div>
  );
}

// ── Grid ────────────────────────────────────────────────────────────────────

export default function ExampleImagesGrid({
  items,
  maxRows = 4,
  locale = "en",
  batch = false,
}: {
  items: Item[];
  maxRows?: number;
  locale?: string;
  batch?: boolean;
}) {
  const cols = useCols();
  const limit = cols * maxRows;

  const [expanded, setExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visible = expanded ? items : items.slice(0, limit);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((it, i) => (
          <ExampleImageCard
            key={it.id}
            item={{ ...it, batch }}
            locale={locale}
            onOpenLightbox={() => setLightboxIndex(i)}
          />
        ))}
      </div>

      {items.length > limit && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            {expanded ? "See less" : `See more (${items.length - limit})`}
          </button>
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          items={visible}
          initialIndex={lightboxIndex}
          locale={locale}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  );
}
