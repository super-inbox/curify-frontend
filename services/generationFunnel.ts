"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/services/useTracking";

export type GenerationStage =
  | "entry_view" | "entry_click" | "cta_view" | "params_edit"
  | "attempt" | "auth_required" | "auth_resumed" | "credits_required"
  | "duplicate" | "reused" | "request" | "success" | "failure";

/** Reuse supported backend enums. Never send prompt text, parameters or URLs. */
export function trackGenerationStage(stage: GenerationStage, contentId: string) {
  trackEvent({
    contentId: `generation:${stage}:${contentId}`.slice(0, 255),
    contentType: "menu_link",
    actionType: stage.endsWith("_view") ? "view" : "click",
    viewMode: "cards",
  });
}

/** Count actual visibility once per mounted target, not render/hydration. */
export function useGenerationExposure<T extends HTMLElement>(
  stage: "entry_view" | "cta_view", contentId: string, enabled = true,
) {
  const ref = useRef<T>(null);
  const seen = useRef(new Set<string>());
  useEffect(() => {
    const target = ref.current;
    const key = `${stage}:${contentId}`;
    if (!enabled || !target || seen.current.has(key) || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.5)) return;
      if (!seen.current.has(key)) {
        seen.current.add(key);
        trackGenerationStage(stage, contentId);
      }
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [stage, contentId, enabled]);
  return ref;
}
