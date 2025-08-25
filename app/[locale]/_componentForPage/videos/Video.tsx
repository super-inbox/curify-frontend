"use client";

import { useEffect, useRef } from "react";
import Icon from "../../_components/Icon";
import BtnSp from "../../_components/button/ButtonSpecial";

interface Props {
  src: string;
  whoPlaying: "" | "left" | "right";
  setWhoPlaying: Function;
  side?: "left" | "right";
}

export default function Video(props: Props) {
  const { src, whoPlaying, setWhoPlaying, side = "left" } = props;

  const videoRef = useRef<HTMLVideoElement>(null);

  const onClick = () => {
    if (whoPlaying === side) {
      setWhoPlaying("");
    } else {
      setWhoPlaying(side);
    }
  };

  useEffect(() => {
    if (whoPlaying === side) {
      videoRef.current?.play();
    } else {
      videoRef.current?.pause();
    }
  }, [whoPlaying, side]);

  const isLeft = side === "left";

  return (
    <div
      className={`
        flex-1 min-w-0 rounded-4xl
        relative cursor-pointer
        transition duration-500
        ${
          isLeft
            ? `shadow-[0_0.625rem_1.25rem_rgba(var(--p-purple-rgb),0.5)] 
         hover:shadow-[0_0.625rem_1.25rem_rgba(var(--p-purple-rgb),0.8)]`
            : `shadow-[0_0.625rem_1.25rem_rgba(var(--p-blue-rgb),0.5)]
         hover:shadow-[0_0.625rem_1.25rem_rgba(var(--p-blue-rgb),0.8)]`
        }
      `}
    >
      <BtnSp
        active={true}
        onClick={() => {}}
        className={`absolute top-15 z-3 ${
          isLeft ? "left-[-3.75rem]" : "right-[-3.75rem]"
        }`}
      >
        {isLeft ? 'Original' : 'Translated'}
      </BtnSp>
      <div
        className={`
          w-full h-full
          absolute z-1
          flex items-center justify-center
          transition duration-500
          ${
            whoPlaying === side
              ? "pointer-events-none opacity-0 hover:opacity-100"
              : "pointer-events-auto opacity-100"
          }
        `}
        onClick={onClick}
      >
        <Icon
          name={`logo_${whoPlaying === side ? "pause" : "play"}`}
          size={15}
          className="opacity-80"
        />
      </div>
      <video
        onClick={onClick}
        src={src}
        controls={whoPlaying === side}
        className="w-full rounded-4xl"
        ref={videoRef}
        onEnded={() => setWhoPlaying("")}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
