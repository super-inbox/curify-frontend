"use client";

// "What's your MBTI?" capsule on /topics/character, /topics/mbti, and the
// 16 mbti-<type> pages. Two paths:
//
//   1. "I know my MBTI" → expands an inline 4-letter picker (E/I · N/S ·
//      T/F · J/P). When the user picks all four, the button becomes
//      "Go to ENFP →" and navigates to /topics/mbti-enfp.
//
//   2. "Take the quiz"  → opens the existing modal MBTI quiz (atom-driven).
//
// Tracks two distinct content_ids so the admin funnel can tell stated-type
// users apart from quiz-takers.

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSetAtom } from "jotai";
import { Sparkles } from "lucide-react";
import { mbtiQuizOpenAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

const LETTER_PAIRS: ReadonlyArray<readonly [string, string]> = [
  ["E", "I"],
  ["N", "S"],
  ["T", "F"],
  ["J", "P"],
];

export default function MBTIQuizCapsule() {
  const setOpen = useSetAtom(mbtiQuizOpenAtom);
  const router = useRouter();
  const params = useParams<{ locale?: string }>();
  const locale = params?.locale ?? "en";
  const { track } = useTracking();
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState<(string | null)[]>([null, null, null, null]);

  const isComplete = picked.every((x): x is string => Boolean(x));
  const typeString = picked.filter(Boolean).join("");

  const handleQuiz = () => {
    setOpen(true);
    track({ contentId: "mbti_quiz", contentType: "mbti_quiz", actionType: "click" });
  };

  const handleIKnow = () => {
    setPicking(true);
    track({ contentId: "mbti_capsule_iknow", contentType: "mbti_quiz", actionType: "click" });
  };

  const handleGo = () => {
    if (!isComplete) return;
    const slug = `mbti-${typeString.toLowerCase()}`;
    track({ contentId: slug, contentType: "topic_capsule", actionType: "click" });
    router.push(`/${locale}/topics/${slug}`);
  };

  if (!picking) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-neutral-800">What's your MBTI?</span>
        <button
          type="button"
          onClick={handleIKnow}
          className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-purple-500 bg-white px-4 py-2 text-sm font-bold text-purple-700 transition-transform hover:scale-105 hover:bg-purple-50"
        >
          I know my type
        </button>
        <button
          type="button"
          onClick={handleQuiz}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-200 transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
        >
          <Sparkles className="h-4 w-4" />
          Take the quiz
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-neutral-800">Pick your type:</span>
      {LETTER_PAIRS.map(([a, b], i) => (
        <div
          key={i}
          className="inline-flex overflow-hidden rounded-full border-2 border-purple-300 bg-white"
        >
          {[a, b].map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => {
                const next = [...picked];
                next[i] = letter;
                setPicked(next);
              }}
              className={
                picked[i] === letter
                  ? "bg-purple-600 px-3 py-1.5 text-sm font-bold text-white"
                  : "px-3 py-1.5 text-sm font-semibold text-purple-700 hover:bg-purple-50"
              }
              aria-pressed={picked[i] === letter}
            >
              {letter}
            </button>
          ))}
        </div>
      ))}
      <button
        type="button"
        disabled={!isComplete}
        onClick={handleGo}
        className={
          isComplete
            ? "flex cursor-pointer items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-200 transition-transform hover:scale-105"
            : "rounded-full bg-neutral-200 px-4 py-2 text-sm font-bold text-neutral-400 cursor-not-allowed"
        }
      >
        {isComplete ? `Go to ${typeString} →` : "Pick all 4 letters"}
      </button>
      <button
        type="button"
        onClick={() => {
          setPicking(false);
          setPicked([null, null, null, null]);
        }}
        className="cursor-pointer text-sm text-neutral-500 underline hover:text-neutral-700"
      >
        Back
      </button>
    </div>
  );
}
