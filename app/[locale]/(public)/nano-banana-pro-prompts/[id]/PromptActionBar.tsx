"use client";

import ShareButton from "@/app/[locale]/_components/ShareButton";
import CopyButton from "./CopyButton";
import { useShareTracking } from "@/services/useTracking";

export default function PromptActionBar({
  promptId,
  promptText,
  pageUrl,
  title,
}: {
  promptId: string;
  promptText: string;
  pageUrl: string;
  title: string;
}) {
  const trackShare = useShareTracking(promptId, "nano_gallery", "cards");

  return (
    <div className="flex items-center gap-3">
      <ShareButton
        url={pageUrl}
        title={title}
        text={`Check out this AI prompt: ${title}`}
        onShared={trackShare}
      />
      <CopyButton text={promptText} />
    </div>
  );
}