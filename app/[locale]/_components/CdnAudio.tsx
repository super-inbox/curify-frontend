"use client";

import { cdn } from "@/lib/cdn";
import React from "react";

type CdnAudioProps = React.AudioHTMLAttributes<HTMLAudioElement> & {
  src: string;
};

export default function CdnAudio({ src, ...rest }: CdnAudioProps) {
  return <audio src={cdn(src)} {...rest} />;
}
