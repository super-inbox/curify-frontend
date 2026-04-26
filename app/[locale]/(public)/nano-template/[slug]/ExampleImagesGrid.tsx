"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bookmark, Download, Sparkles } from "lucide-react";
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
  if (w >= 1024) return 4;
  if (w >= 640) return 2;
  return 1;
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

function ExampleImageCard({
  item,
  locale,
}: {
  item: Item;
  locale: string;
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
        onClick={trackClick}
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

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">

      {visible.map((it) => (
  <ExampleImageCard
    key={it.id}
    item={{ ...it, batch }}
    locale={locale}
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