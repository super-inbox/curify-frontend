"use client";

import { useRef } from "react";
import { cdn } from "@/lib/cdn";
import { useVideoTracking } from "@/services/useTracking";

type Props = {
  templateId: string;
  exampleId: string;
  videoUrl: string;
  posterUrl?: string;
  title?: string;
};

export default function ExampleVideoPlayer({
  templateId,
  exampleId,
  videoUrl,
  posterUrl,
  title,
}: Props) {
  const playFired = useRef(false);
  const { trackVideoPlay } = useVideoTracking(
    `${templateId}:${exampleId}`,
    "nano_inspiration_example_grid",
    "cards"
  );

  return (
    <video
      src={cdn(videoUrl)}
      poster={posterUrl ? cdn(posterUrl) : undefined}
      controls
      preload="metadata"
      playsInline
      className="h-full w-full object-contain"
      aria-label={title}
      onPlay={() => {
        if (playFired.current) return;
        playFired.current = true;
        trackVideoPlay();
      }}
    />
  );
}
