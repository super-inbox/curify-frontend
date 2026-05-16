"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Download, Play, Sparkles } from "lucide-react";
import { useAtom } from "jotai";
import { useTranslations } from "next-intl";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { SITE_URL } from "@/lib/constants";
import { toSlug } from "@/lib/nano_utils";
import { useClickTracking, useTracking, useVideoTracking } from "@/services/useTracking";
import { templatePacksService } from "@/services/templatePacks";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";

type Item = {
  id: string;
  title: string;
  preview: string;
  templateId: string;
  params?: Record<string, string>;
  batch?: boolean;
  videoUrl?: string;
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

// ── Card ────────────────────────────────────────────────────────────────────

// Cap how many ids ride the URL. 40 covers the typical visible window
// without busting browser URL limits (~8KB). Slides beyond #40 fall
// back to the template-scoped order inside the carousel page.
const CAROUSEL_IDS_CAP = 40;

function ExampleImageCard({
  item,
  locale,
  carouselContext,
}: {
  item: Item;
  locale: string;
  carouselContext: string; // pre-encoded "&from=...&ids=..."
}) {
  const trackClick = useClickTracking(`${item.templateId}:${item.id}`, "nano_inspiration_example_grid", "cards");
  const { trackVideoClick } = useVideoTracking(`${item.templateId}:${item.id}`, "nano_inspiration_example_grid", "cards");
  const { trackAction } = useTracking();
  const hasVideo = Boolean(item.videoUrl);
  const t = useTranslations("actionButtons");
  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [isDownloading, setIsDownloading] = useState(false);
  const isDownloadingRef = useRef(false);

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

  // Append &from=<grid pathname> and &ids=<grid order> so the carousel
  // (a) sequences slides in the same order the user saw on the grid,
  // (b) closes back to the originating page rather than the template-
  //     scoped example detail. carouselContext is computed once in the
  //     parent so every card on this grid shares the same slice.
  const carouselHref = `/${locale}/carousel/template-example/${toSlug(item.templateId)}/${encodeURIComponent(item.id)}?media=${hasVideo ? "video" : "image"}${carouselContext}`;

  const shareUrl = `${SITE_URL}/${locale}/nano-template/${toSlug(item.templateId)}/example/${encodeURIComponent(item.id)}`;

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
    <div className="group rounded-3xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <Link
        href={carouselHref}
        onClick={() => {
          trackClick();
          if (hasVideo) trackVideoClick();
        }}
        className="block relative overflow-hidden rounded-t-3xl"
      >
        <CdnImage
          src={item.preview}
          alt={item.title || item.id}
          className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          loading="lazy"
        />
        {hasVideo && (
          <span
            aria-label="Has video"
            className="pointer-events-none absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white shadow-sm backdrop-blur-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
        )}
        <div className="absolute inset-0 flex items-end justify-center bg-black/0 pb-4 opacity-0 transition-colors duration-200 group-hover:bg-black/20 group-hover:opacity-100">
          <span className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-bold text-neutral-900 shadow backdrop-blur-sm">
            {hasVideo ? "Play video →" : "View prompt →"}
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
          <Link
            href={remixHref}
            onClick={() => {
              document.getElementById("reproduce")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1 text-sm font-semibold text-purple-700 transition-colors hover:bg-purple-100 hover:text-purple-900"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {t("remixThis")}
          </Link>
        )}
        <ShareButton
          compact
          url={shareUrl}
          title={item.title || item.id}
          text={`Check out this Nano Banana example: ${item.title || item.id}`}
          onShared={() => trackAction(tracking, "share")}
        />
      </div>
    </div>
  );
}

// ── Grid ────────────────────────────────────────────────────────────────────

export default function ExampleImagesGrid({
  items,
  maxRows = 3,
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

  const visible = expanded ? items : items.slice(0, limit);

  // Pre-compute the carousel context string (from + ids) once per render
  // so every card on this grid shares the same slice. usePathname /
  // useSearchParams give us the current page URL to return to on close.
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const carouselContext = useMemo(() => {
    const qs = searchParams?.toString();
    const from = `${pathname}${qs ? `?${qs}` : ""}`;
    const ids = items.slice(0, CAROUSEL_IDS_CAP).map((it) => it.id).join(",");
    return `&from=${encodeURIComponent(from)}&ids=${encodeURIComponent(ids)}`;
  }, [pathname, searchParams, items]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {visible.map((it) => (
          <ExampleImageCard
            key={it.id}
            // Per-item batch wins (topic-page mixed-template grids stamp
            // each item with its parent template's flag); grid-level
            // batch is the fallback for single-template surfaces.
            item={{ ...it, batch: it.batch ?? batch }}
            locale={locale}
            carouselContext={carouselContext}
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
    </div>
  );
}
