"use client";

import { useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, drawerAtom } from "@/app/atoms/atoms";
import { useTracking } from "@/services/useTracking";

/**
 * Centralized auth-gate hook.
 *
 * Returns a `requireAuth(reason?: string)` function. On call:
 *   - If the user is signed in → returns true (caller proceeds).
 *   - Otherwise → opens the sign-in drawer AND fires a tracking event
 *     for the attempted action, then returns false.
 *
 * Why the tracking matters: without it we only see auth-gated conversions
 * that *succeed*. The funnel can't distinguish "user clicked Generate,
 * hit the auth modal, bailed" from "user browsed without ever trying."
 * That distinction is the load-bearing diagnostic for ranking auth-wall
 * friction. See docs/conversion-funnel-auth-wall-2026-06-12.md.
 *
 * `reason` is namespaced under content_id `auth-modal:<reason>` so we
 * can split dropoff by which verb the user was trying (save / generate /
 * remix / etc.). actionType reuses "click" — there's no auth_attempt
 * enum and the backend silently drops unknown values per the tracking-
 * enum memory.
 *
 * Replaces the inline `useCallback(() => { if (user) return true;
 * setDrawerState("signin"); return false; }, ...)` shape duplicated
 * across HomeClient, InspirationHubClient, NanoBananaExamples,
 * UseCaseClient, NanoTemplateDetailClient.
 */
export function useRequireAuth(opts?: { variant?: "signin" | "signup" }) {
  const variant = opts?.variant ?? "signin";
  const user = useAtomValue(userAtom);
  const setDrawerState = useSetAtom(drawerAtom);
  const { track } = useTracking();

  return useCallback(
    (reason: string = "unknown") => {
      if (user) return true;
      // Fire BEFORE opening the drawer so the event isn't lost if the
      // user dismisses the drawer immediately (rare, but cheap insurance).
      track({
        contentId: `auth-modal:${reason}`,
        contentType: "topic_capsule",
        actionType: "click",
      });
      setDrawerState(variant);
      return false;
    },
    [user, setDrawerState, track, variant]
  );
}
