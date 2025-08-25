"use client";

import { useState } from "react";

import Video from "./Video";

export default function Videos() {
  const [whoPlaying, setWhoPlaying] = useState<"" | "left" | "right">("");

  return (
    <div className="flex justify-center w-full mt-18 gap-20">
      <Video
        src="/video/demo.mp4"
        whoPlaying={whoPlaying}
        setWhoPlaying={setWhoPlaying}
      />
      <Video
        src="/video/demo_trans.mp4"
        whoPlaying={whoPlaying}
        setWhoPlaying={setWhoPlaying}
        side="right"
      />
    </div>
  );
}
