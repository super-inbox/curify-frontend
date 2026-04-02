"use client";

import Link from "next/link";
import { useState } from "react";
import { Wand2, Sparkles, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAtom } from "jotai";

import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { useTracking, type TrackingTarget } from "@/services/useTracking";
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

type Props = {
  tracking: TrackingTarget;
  className?: string;
  generate?: GenerateConfig;
  remix?: RemixConfig;
  copy?: CopyConfig;
  share?: ShareConfig;
  batchDownload?: BatchDownloadConfig;
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
  remix,
  copy,
  share,
  batchDownload,
}: Props) {
  const { trackAction } = useTracking();
  const t = useTranslations("actionButtons");

  const [user] = useAtom(userAtom);
  const [, setDrawerState] = useAtom(drawerAtom);
  const [clientMounted] = useAtom(clientMountedAtom);

  const [generated, setGenerated] = useState(false);
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);

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
      {visible(generate) && (
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

      {visible(share) && (
        <ShareButton
          url={share.url}
          title={share.title}
          text={share.text}
          onShared={() => trackAction(tracking, "share")}
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
    </div>
  );
}