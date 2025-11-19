"use client";

import { useState } from "react";

import Video from "./Video";
import CdnVideo from "../../_components/CdnVideo";

export default function Videos() {
  const [whoPlaying, setWhoPlaying] = useState<"" | "left" | "right">("");

  return (
    <div className="flex justify-center w-full mt-18 gap-20">
      <CdnVideo
        src="/video/demo.mp4"
        whoPlaying={whoPlaying}
        setWhoPlaying={setWhoPlaying}
      />
      <CdnVideo
        src="/video/demo_trans.mp4"
        whoPlaying={whoPlaying}
        setWhoPlaying={setWhoPlaying}
        side="right"
      />
    </div>
  );
}
