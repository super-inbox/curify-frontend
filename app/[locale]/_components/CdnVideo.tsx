"use client";

import React, { forwardRef } from "react";
import { cdn } from "@/lib/cdn";

export interface CdnVideoProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  /**
   * Optional "which side" indicator (used in comparisons)
   * Example: "left" or "right"
   */
  side?: string;

  /**
   * Current video playing ("left" | "right" | ...)
   */
  whoPlaying?: string;

  /**
   * Setter to notify parent which video just started playing
   */
  setWhoPlaying?: (side: string) => void;

  /**
   * src must always be a string (we rewrite for CDN)
   */
  src: string;
}

const CdnVideo = forwardRef<HTMLVideoElement, CdnVideoProps>(
  ({ src, side, whoPlaying, setWhoPlaying, onPlay, ...rest }, ref) => {
    // Auto-rewrite static CDN assets (no rewrite for external URLs)
    const finalSrc = cdn(src);

    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement>) => {
      // If parent wants to track which video is playing
      if (setWhoPlaying && side) {
        setWhoPlaying(side);
      }

      // Preserve developer-defined onPlay handlers
      if (onPlay) {
        onPlay(e);
      }
    };

    return (
      <video
        ref={ref}
        src={finalSrc}
        onPlay={handlePlay}
        {...rest}
      />
    );
  }
);

CdnVideo.displayName = "CdnVideo";

export default CdnVideo;
