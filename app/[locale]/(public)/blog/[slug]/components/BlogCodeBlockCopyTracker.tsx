"use client";

import { useCallback } from "react";
import { useTracking } from "@/services/useTracking";

interface BlogCodeBlockCopyTrackerProps {
  blogSlug: string;
  children: React.ReactNode;
}

/**
 * Wraps blog body content with a delegated `copy` listener that fires a
 * COPY interaction event whenever a user copies text from inside a
 * `<pre>` (code block) or `<code>` element.
 *
 * Audit 2026-06-04 (engagement-funnel deep-dive): 1,378 of 1,614 blog
 * landings over 14 days (85%) are single-event sessions filtered out by
 * bot_free_b's "> 1 event" rule before the funnel sees them. Many of
 * those single-VIEW sessions are real users who landed on a blog,
 * copied the prompt, and left — a legitimate completion we have zero
 * visibility into. This component closes that observability gap so the
 * admin funnel can finally see "users copied the recipe" as a tracked
 * action, separately from the `<a>`-link tracking handled by
 * BlogInlineClickTracker.
 *
 * - Listens for the native `copy` event (fires on Cmd+C / Ctrl+C / right-
 *   click → Copy / `<button>`-driven `execCommand("copy")`).
 * - Walks up from `e.target` to find the nearest `<pre>` or `<code>` ancestor.
 *   If no code ancestor is found, the copy is from regular prose — not
 *   tracked (most blog readers highlight stray sentences without intent
 *   to use them, which would inflate the signal).
 * - Fires via `trackOnUnload` / sendBeacon for the same cross-origin
 *   navigation reliability reason called out in BlogInlineClickTracker.
 * - Does NOT preventDefault — the copy proceeds normally.
 *
 * Tracking shape:
 *   contentId   = `blog-copy:${blogSlug}` (per-blog rollup; the specific
 *                 code block fingerprint adds noise without analytical
 *                 value at current scale)
 *   contentType = "page"
 *   actionType  = "copy"
 */
export default function BlogCodeBlockCopyTracker({
  blogSlug,
  children,
}: BlogCodeBlockCopyTrackerProps) {
  const { trackOnUnload } = useTracking();

  const onCopy = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      // Walk up from the selection target to find the nearest <pre> or
      // <code> ancestor. The copy event fires on the deepest element
      // under the cursor at the time of the keypress; for a typical
      // <pre><code>token</code></pre> structure, that's usually the
      // text node's parent which is several levels deep inside <pre>.
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== e.currentTarget) {
        const tag = el.tagName;
        if (tag === "PRE" || tag === "CODE") break;
        el = el.parentElement;
      }
      if (!el || (el.tagName !== "PRE" && el.tagName !== "CODE")) return;

      trackOnUnload({
        contentId: `blog-copy:${blogSlug}`,
        contentType: "page",
        actionType: "copy",
      });
    },
    [blogSlug, trackOnUnload],
  );

  return <div onCopy={onCopy}>{children}</div>;
}
