"use client";

import { useEffect, useRef } from "react";
import { cdn } from "@/lib/cdn";
import { useVideoTracking } from "@/services/useTracking";

type Props = {
  templateId: string;
  exampleId: string;
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  /** True when this player is the currently visible slide. Defaults to true. */
  active?: boolean;
  /** Auto-play (muted) when active. Defaults to false. */
  autoPlay?: boolean;
};

export default function ExampleVideoPlayer({
  templateId,
  exampleId,
  videoUrl,
  posterUrl,
  title,
  active = true,
  autoPlay = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playFired = useRef(false);
  const { trackVideoPlay } = useVideoTracking(
    `${templateId}:${exampleId}`,
    "nano_inspiration_example_grid",
    "cards"
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (active && autoPlay) {
      // Try unmuted first (preserves sound when allowed); if the browser
      // blocks it (autoplay policy), fall back to muted so the video at
      // least starts playing — user can unmute via controls.
      v.muted = false;
      v.play().catch(() => {
        v.muted = true;
        v.play().catch(() => {
          // Even muted autoplay denied; leave paused, user can press play.
        });
      });
    } else if (!active) {
      v.pause();
    }
  }, [active, autoPlay]);

  return (
    <video
      ref={videoRef}
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
