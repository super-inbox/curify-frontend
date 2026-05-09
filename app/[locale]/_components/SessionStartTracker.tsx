"use client";

import { useSessionStartTracker } from "@/services/useTracking";

/**
 * Mount-only client component that fires a single page-view event the
 * first time any page in a session is visited. Provides the bottom of
 * the funnel (entry route, referrer, UTM) for sessions that would
 * otherwise leave no trace if the user bounces without interacting.
 */
export default function SessionStartTracker() {
  useSessionStartTracker();
  return null;
}
