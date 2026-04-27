"use client";

import Link from "next/link";
import { useState } from "react";
import { Wand2, Sparkles, Download, Bookmark } from "lucide-react";

const GENERATE_CREDITS_COST = 10;
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";

import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { useTracking, useSaveTracking, type TrackingTarget } from "@/services/useTracking";
import { templatePacksService } from "@/services/templatePacks";
import { userAtom, drawerAtom, clientMountedAtom } from "@/app/atoms/atoms";

type GenerateConfig = {
  enabled: boolean;
  text: string;
};

type RemixConfig = {
  enabled: boolean;
  href: string;
};

type CopyConfig = {
  enabled: boolean;
  text: string;
};

type ShareConfig = {
  enabled: boolean;
  url: string;
  title?: string;
  text?: string;
};

type BatchDownloadConfig = {
  enabled: boolean;
  templateId: string;
};

type SaveConfig = {
  enabled: boolean;
};

type DownloadConfig = {
  enabled: boolean;
  url: string;
  filename?: string;
};

type ExternalGenerateConfig = {
  enabled: boolean;
  onGenerate: () => void | Promise<void>;
  isGenerating?: boolean;
};

type Props = {
  tracking: TrackingTarget;
  className?: string;
  generate?: GenerateConfig;
  externalGenerate?: ExternalGenerateConfig;
  remix?: RemixConfig;
  copy?: CopyConfig;
  share?: ShareConfig;
  batchDownload?: BatchDownloadConfig;
  save?: SaveConfig;
  download?: DownloadConfig;
};

function visible<T extends { enabled: boolean } | undefined>(
  c: T
): c is Exclude<T, undefined> {
  return !!c?.enabled;
}

export default function UnifiedActionBar({
  tracking,
  className = "",
  generate,
  externalGenerate,
  remix,
  copy,
  share,
  batchDownload,
  save,
  download,
}: Props) {
  const { trackAction } = useTracking();
  const trackSave = useSaveTracking(tracking.contentId, tracking.contentType, tracking.viewMode);
  const t = useTranslations("actionButtons");

  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);

  const [generated, setGenerated] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!save || saved) return;
    if (!user) {
      setDrawerState("signin");
      return;
    }
    setSaved(true);
    trackSave();
  };

  const handleGenerate = async () => {
    if (!generate) return;

    try {
      await navigator.clipboard.writeText(generate.text);
      trackAction(tracking, "generate");
      setGenerated(true);
      setTimeout(() => setGenerated(false), 2500);
    } catch {}
  };

  const handleBatchDownload = async () => {
    if (!batchDownload || isBatchDownloading) return;
  
    if (!user) {
      setDrawerState("signin");
      return;
    }
  
    try {
      setIsBatchDownloading(true);
  
      const res = await templatePacksService.downloadPack({
        template_id: batchDownload.templateId,
      });
  
      if (!res?.success || !res?.download_url) {
        throw new Error(res?.message || "Missing download_url");
      }
  
      const a = document.createElement("a");
      a.href = res.download_url;
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
  
      // MVP: only track after successful download trigger
      trackAction(tracking, "download");
    } catch (error) {
      console.error("Batch download failed:", error);
      alert(t("batchDownloadFailed"));
    } finally {
      setIsBatchDownloading(false);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {visible(externalGenerate) ? (
        <div className="flex items-center gap-2">
          <button
            onClick={externalGenerate.onGenerate}
            disabled={externalGenerate.isGenerating}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 cursor-pointer disabled:opacity-60"
            type="button"
          >
            <Wand2 className="h-4 w-4" />
            {externalGenerate.isGenerating ? t("generating") : t("generate")}
            {clientMounted && !user && (
              <span className="ml-1 text-xs opacity-80">🔒</span>
            )}
          </button>
          {clientMounted && user && (
            <span className="text-xs text-neutral-500">
              {GENERATE_CREDITS_COST} credits
            </span>
          )}
        </div>
      ) : visible(generate) && (
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700 cursor-pointer"
          type="button"
        >
          <Wand2 className="h-4 w-4" />
          {generated ? t("copied") : t("generate")}
        </button>
      )}

      {visible(remix) && (
        <Link
          href={remix.href}
          onClick={() => trackAction(tracking, "remix")}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-purple-600 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          {t("remix")}
        </Link>
      )}

      {visible(copy) && (
        <CopyPromptButton
          text={copy.text}
          onCopied={() => trackAction(tracking, "copy")}
        />
      )}

      {visible(batchDownload) && (
        <button
          onClick={handleBatchDownload}
          disabled={isBatchDownloading}
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 text-sm font-bold text-white hover:opacity-90 transition-opacity duration-300 shadow-lg cursor-pointer relative disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {isBatchDownloading ? t("downloadingPack") : t("downloadPack")}
          {clientMounted && !user && (
            <span className="ml-1 text-xs opacity-80">🔒</span>
          )}
        </button>
      )}

      {visible(save) && (
        <button
          onClick={handleSave}
          type="button"
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold cursor-pointer transition-colors ${
            saved
              ? "border-purple-300 bg-purple-50 text-purple-700"
              : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
          }`}
        >
          <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
          {saved ? t("saved") : t("save")}
          {clientMounted && !user && (
            <span className="ml-1 text-xs opacity-60">🔒</span>
          )}
        </button>
      )}

      {visible(download) && (
        <a
          href={download.url}
          download={download.filename ?? true}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackAction(tracking, "download")}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          {t("download")}
        </a>
      )}

      {visible(share) && (
        <ShareButton
          url={share.url}
          title={share.title}
          text={share.text}
          onShared={() => trackAction(tracking, "share")}
        />
      )}
    </div>
  );
}