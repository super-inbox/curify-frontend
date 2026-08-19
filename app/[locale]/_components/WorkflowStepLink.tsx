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
      className="relative flex h-full flex-col rounded-2xl border border-neutral-200 bg-white p-3.5 transition hover:border-purple-300 hover:shadow-sm"
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-bold text-purple-700">
          {n}
        </span>
        {!thumbnail && (
          <span className="text-lg" aria-hidden>
            {emoji}
          </span>
        )}
        <span className="text-sm font-semibold text-neutral-900">{name}</span>
      </div>
      {/* Leave room at the bottom-right for the example thumbnail. */}
      <p className="mt-2 flex-1 pr-14 text-xs leading-5 text-neutral-600">{desc}</p>
      <span className="mt-3 inline-block pr-14 text-xs font-semibold text-purple-700">{cta} →</span>
      {thumbnail && (
        // Example of what this step produces — anchored bottom-right so it never
        // collides with the number badge or the copy.
        <span className="absolute bottom-2.5 right-2.5 h-12 w-12 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
        </span>
      )}
    </Link>
  );
}
