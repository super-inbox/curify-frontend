"use client";

import ShareButton from "@/app/[locale]/_components/ShareButton";
import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import { useShareTracking, useCopyTracking } from "@/services/useTracking";


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
  const trackCopy = useCopyTracking(promptId, "nano_gallery", "cards")

  return (
    <div className="flex items-center gap-3">
      <CopyPromptButton
  text={promptText}
  onCopied={trackCopy}
/>
      <ShareButton
        url={pageUrl}
        title={title}
        text={`Check out this AI prompt: ${title}`}
        onShared={trackShare}
      />
      
    </div>
  );
}