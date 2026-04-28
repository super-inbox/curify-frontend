"use client";

import { useSetAtom } from "jotai";
import { Sparkles } from "lucide-react";
import { mbtiQuizOpenAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

export default function MBTIQuizCapsule() {
  const setOpen = useSetAtom(mbtiQuizOpenAtom);
  const { track } = useTracking();

  const handleClick = () => {
    setOpen(true);
    track({ contentId: "capsule", contentType: "mbti_quiz", actionType: "click" });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-purple-200 transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
    >
      <Sparkles className="h-4 w-4" />
      Take your MBTI personality quiz today →
    </button>
  );
}
