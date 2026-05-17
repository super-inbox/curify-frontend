"use client";

// "What's your MBTI?" capsule on /topics/character, /topics/mbti, and the
// 16 mbti-<type> pages. Two parallel paths shown as two rows; no reveal
// gating, both always visible:
//
//   Row 1: "I know my type" + inline 4-letter picker (E/I · N/S · T/F · J/P)
//          When all four letters are selected the trailing action becomes
//          "Go to ENFP →" and routes to /topics/mbti-enfp.
//
//   Row 2: "Take the quiz" → opens the existing modal MBTI quiz (atom-driven).
//
// Tracks distinct content_ids so the admin funnel can tell stated-type
// users (mbti_capsule_iknow + mbti-<type>) apart from quiz-takers (mbti_quiz).

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
  const [picked, setPicked] = useState<(string | null)[]>([null, null, null, null]);

  const isComplete = picked.every((x): x is string => Boolean(x));
  const typeString = picked.filter(Boolean).join("");
  const hasAnyPick = picked.some(Boolean);

  const handleQuiz = () => {
    setOpen(true);
    track({ contentId: "mbti_quiz", contentType: "mbti_quiz", actionType: "click" });
  };

  const handlePick = (rowIdx: number, letter: string) => {
    // Track once per session — first letter the user touches signals
    // "this user is in the stated-type cohort, not the quiz cohort".
    if (!hasAnyPick) {
      track({
        contentId: "mbti_capsule_iknow",
        contentType: "mbti_quiz",
        actionType: "click",
      });
    }
    const next = [...picked];
    next[rowIdx] = letter;
    setPicked(next);
  };

  const handleGo = () => {
    if (!isComplete) return;
    const slug = `mbti-${typeString.toLowerCase()}`;
    track({ contentId: slug, contentType: "topic_capsule", actionType: "click" });
    router.push(`/${locale}/topics/${slug}`);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Row 1 — stated type: label + 4 letter pickers + Go button */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-neutral-800">
          I know my type
        </span>
        {LETTER_PAIRS.map(([a, b], i) => (
          <div
            key={i}
            className="inline-flex overflow-hidden rounded-full border-2 border-purple-300 bg-white"
          >
            {[a, b].map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handlePick(i, letter)}
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
      </div>

      {/* Row 2 — quiz path, parallel option */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-neutral-800">
          Don&apos;t know your type?
        </span>
        <button
          type="button"
          onClick={handleQuiz}
          className="flex cursor-pointer items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-purple-200 transition-transform hover:scale-105 hover:shadow-lg active:scale-100"
        >
          <Sparkles className="h-4 w-4" />
          Take the quiz
        </button>
      </div>
    </div>
  );
}
