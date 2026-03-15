"use client";

import ShareButton from "@/app/[locale]/_components/ShareButton";
import { useShareTracking } from "@/services/useTracking";

export default function ExampleActionBar({
  exampleId,
  pageUrl,
  title,
}: {
  exampleId: string;
  pageUrl: string;
  title: string;
}) {
  const trackShare = useShareTracking(exampleId, "nano_inspiration", "cards");

  return (
    <ShareButton
      url={pageUrl}
      title={title}
      text={`Check out this Nano Banana example: ${title}`}
      onShared={trackShare}
    />
  );
}