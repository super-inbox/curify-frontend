"use client";

import { useCallback } from "react";
import { useTracking } from "@/services/useTracking";

interface BlogInlineClickTrackerProps {
  blogSlug: string;
  children: React.ReactNode;
}

/**
 * Wraps blog body content with a delegated click listener that fires a CLICK
 * event for every internal-link click within. Without this, plain markdown
 * links rendered via dangerouslySetInnerHTML have no React onClick handlers
 * and no per-link attribution shows up in user_interactions.
 *
 * Audit 2026-05-30 (engagement-funnel deep-dive): 90 WC-blog landers / 0
 * CLICK events / 0% engagement attributed to inline-link traffic. This
 * component closes that gap so admin can see which inline links drive
 * actual click-through per blog.
 *
 * - Fires on `<a>` clicks where href starts with "/" (internal Curify URLs).
 * - External links pass through without tracking — those go to docs / GitHub /
 *   tools the user has chosen to leave Curify for; not interesting for the
 *   blog-to-engagement funnel.
 * - Tracking POST uses `keepalive: true` so it survives same-tab navigation.
 * - Does NOT preventDefault — the click proceeds normally.
 *
 * Tracking shape:
 *   contentId   = `blog-link:${blogSlug}:${href}`
 *   contentType = "page" (reuses existing enum per feedback_tracking_enums rule)
 *   actionType  = "click"
 */
export default function BlogInlineClickTracker({
  blogSlug,
  children,
}: BlogInlineClickTrackerProps) {
  const { trackAction } = useTracking();

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Walk up from the click target to find the nearest <a> ancestor —
      // necessary because a click on a child element (e.g., <strong>) inside
      // the link should still count as a link click.
      let el: HTMLElement | null = e.target as HTMLElement;
      while (el && el !== e.currentTarget) {
        if (el.tagName === "A") break;
        el = el.parentElement;
      }
      if (!el || el.tagName !== "A") return;
      const href = (el as HTMLAnchorElement).getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      trackAction(
        { contentId: `blog-link:${blogSlug}:${href}`, contentType: "page" },
        "click",
      );
    },
    [blogSlug, trackAction],
  );

  return <div onClick={onClick}>{children}</div>;
}
