"use client";

import ShareButton from "@/app/[locale]/_components/ShareButton";
import CopyPromptButton from "@/app/[locale]/_components/CopyPromptButton";
import { useCopyTracking, useShareTracking } from "@/services/useTracking";

export default function ExampleActionBar({
  exampleId,
  pageUrl,
  title,
  promptText,
}: {
  exampleId: string;
  pageUrl: string;
  title: string;
  promptText: string;
}) {
  const trackShare = useShareTracking(exampleId, "nano_inspiration", "cards");
  const trackCopy = useCopyTracking(exampleId, "nano_inspiration", "cards");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <CopyPromptButton text={promptText} onCopied={trackCopy} />
      <ShareButton
        url={pageUrl}
        title={title}
        text={`Check out this Nano Banana example: ${title}`}
        onShared={trackShare}
      />
    </div>
  );
}