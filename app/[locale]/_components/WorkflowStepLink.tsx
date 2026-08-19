"use client";

import Link from "next/link";
import { useTracking } from "@/services/useTracking";

/**
 * One step in the "Design workflows" ladder (TopicWorkflow). Client wrapper so a
 * step click emits a demand/engagement signal — the section was previously
 * un-instrumented, so "do users use the workflows section?" had no meter
 * (2026-08-19). Shows the linked template's example thumbnail when available
 * (falls back to the emoji) so the visitor sees what the step produces.
 */
export default function WorkflowStepLink({
  href,
  trackId,
  n,
  emoji,
  thumbnail,
  name,
  desc,
  cta,
}: {
  href: string;
  trackId: string;
  n: number;
  emoji: string;
  thumbnail: string | null;
  name: string;
  desc: string;
  cta: string;
}) {
  const { track } = useTracking();
  return (
    <Link
      href={href}
      onClick={() =>
        track({ contentId: trackId, contentType: "topic_capsule", actionType: "click" })
      }
      className="flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-3.5 transition hover:border-purple-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        {thumbnail ? (
          <span className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
            <span className="absolute left-0 top-0 inline-flex h-4 min-w-4 items-center justify-center rounded-br-lg bg-purple-600 px-1 text-[9px] font-bold text-white">
              {n}
            </span>
          </span>
        ) : (
          <>
            <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
              {n}
            </span>
            <span className="text-lg" aria-hidden>
              {emoji}
            </span>
          </>
        )}
        <span className="text-sm font-semibold text-neutral-900">{name}</span>
      </div>
      <p className="mt-2 flex-1 text-xs leading-5 text-neutral-600">{desc}</p>
      <span className="mt-3 inline-block text-xs font-semibold text-purple-700">{cta} →</span>
    </Link>
  );
}
