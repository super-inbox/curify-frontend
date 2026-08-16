"use client";

import React, { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useTracking } from "@/services/useTracking";

/**
 * "Run the whole workflow" — coming-soon state.
 *
 * The button used to link straight to /design-agent, which is not ready. Sending
 * people from a polished ladder into an unfinished surface is worse than not
 * offering the action: it spends the trust the ladder just earned. So the button
 * stays (the intent is real and worth advertising) but resolves to an
 * encouraging in-place message instead of a navigation.
 *
 * The click is TRACKED. That is the point of keeping the button rather than
 * removing it: every press is a person telling us they want the one-click run,
 * per workflow domain, which is demand data we have no other way to collect.
 * Read it as content_id `workflow-run-all:<domain>` on action CLICK.
 */
export default function RunWorkflowComingSoon({ domain }: { domain: string }) {
  const t = useTranslations();
  const { track } = useTracking();
  const [open, setOpen] = useState(false);

  const safe = (key: string, fallback: string) => {
    const has = (t as unknown as { has?: (k: string) => boolean }).has;
    if (typeof has === "function" && !has.call(t, key)) return fallback;
    try {
      return (t(key as never) as string) || fallback;
    } catch {
      return fallback;
    }
  };

  const onClick = useCallback(() => {
    setOpen(true);
    track({
      contentId: `workflow-run-all:${domain}`,
      contentType: "topic_capsule",
      actionType: "click",
    });
  }, [domain, track]);

  return (
    <div className="shrink-0">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-xl bg-gradient-to-r from-[#5a50e5] to-[#7f76ff] px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
      >
        {safe("topicWorkflows.runAll", "Run the whole workflow")}
        <span aria-hidden>→</span>
      </button>

      {open && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2 max-w-xs rounded-xl border border-purple-200 bg-purple-50/80 px-3 py-2 text-right"
        >
          <div className="text-sm font-bold text-purple-800">
            {safe("topicWorkflows.comingSoonTitle", "Almost ready ✨")}
          </div>
          <div className="mt-0.5 text-xs leading-relaxed text-purple-900/75">
            {safe(
              "topicWorkflows.comingSoonBody",
              "One-click end-to-end runs are coming soon. In the meantime every step below works on its own — start anywhere.",
            )}
          </div>
        </div>
      )}
    </div>
  );
}
