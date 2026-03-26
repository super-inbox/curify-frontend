"use client";

import Link from "next/link";
import { useState } from "react";
import { Wand2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { useTracking, type TrackingTarget } from "@/services/useTracking";

type GenerateConfig = {
  enabled: boolean;
  text: string; // ✅ prompt text to copy
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

type Props = {
  tracking: TrackingTarget;
  className?: string;
  generate?: GenerateConfig;
  remix?: RemixConfig;
  copy?: CopyConfig;
  share?: ShareConfig;
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
}: Props) {
  const { trackAction } = useTracking();
  const t = useTranslations("common.actionButtons"); 
  // 👆 you can define:
  // generate: "Generate"
  // copied: "Copied"
  // remix: "Remix"

  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!generate) return;

    try {
      await navigator.clipboard.writeText(generate.text);

      trackAction(tracking, "generate");

      setGenerated(true);
      setTimeout(() => setGenerated(false), 2500);
    } catch {}
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      {/* Generate */}
      {visible(generate) && (
        <button
          onClick={handleGenerate}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-sm font-bold text-white hover:bg-purple-700"
        >
          <Wand2 className="h-4 w-4" />
          {generated ? t("copied") : t("generate")}
        </button>
      )}

      {/* Remix */}
      {visible(remix) && (
        <Link
          href={remix.href}
          onClick={() => trackAction(tracking, "remix")}
          className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
        >
          <Sparkles className="h-4 w-4" />
          {t("remix")}
        </Link>
      )}

      {/* Copy */}
      {visible(copy) && (
        <CopyPromptButton
          text={copy.text}
          onCopied={() => trackAction(tracking, "copy")}
        />
      )}

      {/* Share */}
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