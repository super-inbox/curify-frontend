"use client";

import React, { forwardRef } from "react";
import { cdn } from "@/lib/cdn";
import { Dispatch, SetStateAction } from "react";


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
  setWhoPlaying?: 
  | Dispatch<SetStateAction<"" | "left" | "right">>
  | ((side: "" | "left" | "right") => void);

  /**
   * src must always be a string (we rewrite for CDN)
   */
  src: string;
}

const CdnVideo = forwardRef<HTMLVideoElement, CdnVideoProps>(
  ({ src, side, whoPlaying, setWhoPlaying, onPlay, ...rest }, ref) => {
    // Auto-rewrite static CDN assets (no rewrite for external URLs)
    const finalSrc = cdn(src);

    const handlePlay = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      // Internal side-by-side state (used by comparison videos)
      if (setWhoPlaying) {
        const value = side ?? "";
        if (typeof setWhoPlaying === "function") {
          setWhoPlaying(value as any);
        }
      }
      // Chain the consumer's onPlay so tracking handlers (e.g. video_play
      // via useVideoTracking) fire on use-case / demo videos.
      onPlay?.(e);
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
