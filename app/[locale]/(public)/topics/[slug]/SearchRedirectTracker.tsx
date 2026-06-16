"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTracking } from "@/services/useTracking";

/**
 * Fires a single CLICK event with a fixed content_id when the topic page
 * detects ?from_search=<query> — the marker app/[locale]/(public)/search/page.tsx
 * appends to every server-side redirect from /search → /topics.
 *
 * Without this, bare-country queries (e.g. "argentina" → /topics/argentina-world-cup)
 * bypass /search entirely and look like bucket-D no-click failures in the
 * weekly cycle SQL (search_cycle5_pull.py) — even though the redirect IS
 * the conversion. With this, the cycle SQL picks up `content_id='search-redirect'`
 * as a third attribution bucket distinct from real result-grid clicks.
 *
 * `content_id` is the fixed string 'search-redirect' (not the query) so
 * downstream aggregation has bounded cardinality. The original query is
 * still in the SEARCH event already logged before the redirect, and the
 * 5-min session-window join in the cycle SQL stitches them together.
 *
 * Only mounts on the topic page (where the redirect lands).
 */
export default function SearchRedirectTracker() {
  const searchParams = useSearchParams();
  const fromSearch = searchParams?.get("from_search");
  const { track } = useTracking();
  const firedRef = useRef(false);

  useEffect(() => {
    if (!fromSearch) return;
    if (firedRef.current) return;
    firedRef.current = true;
    track({
      contentId: "search-redirect",
      contentType: "topic_capsule",
      actionType: "click",
    });
  }, [fromSearch, track]);

  return null;
}
