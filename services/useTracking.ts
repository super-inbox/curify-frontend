"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/services/api";
import { API_BASE } from "@/lib/constants";

export type ContentType =
  | "inspiration"
  | "nano_inspiration"
  | "nano_gallery"
  | "topic_capsule"
  | "tag_capsule"
  | "menu_link"
  | "use_case_capsule";

export type ActionType =
  | "view"
  | "click"
  | "copy"
  | "favorite"
  | "share"
  | "generate"
  | "remix"
  | "download";

export type ViewMode = "list" | "cards";

export interface TrackingOptions {
  contentId: string;
  contentType: ContentType;
  actionType: ActionType;
  viewMode?: ViewMode;
}

export interface TrackingTarget {
  contentId: string;
  contentType: ContentType;
  viewMode?: ViewMode;
}

const TRACK_ENDPOINT = "/interactions/track";
const SESSION_KEY = "_curify_session_id";

function getSessionId(): string {
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

function buildPayload(options: TrackingOptions) {
  return {
    content_id: options.contentId,
    content_type: options.contentType,
    action_type: options.actionType,
    view_mode: options.viewMode,
    user_id: getUserId() ?? undefined,
    session_id: getSessionId() || undefined,
    referrer:
      typeof document !== "undefined" ? document.referrer || undefined : undefined,
  };
}

async function trackViaApiClient(payload: Record<string, unknown>) {
  try {
    await apiClient.request(TRACK_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      keepalive: true as never,
    });
  } catch {
    // tracking should never break UX
  }
}

function trackWithBeacon(payload: Record<string, unknown>) {
  if (typeof navigator === "undefined" || typeof navigator.sendBeacon !== "function") {
    return false;
  }

  try {
    const url = `${API_BASE}${TRACK_ENDPOINT}`;
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    return navigator.sendBeacon(url, blob);
  } catch {
    return false;
  }
}

async function trackInteraction(options: TrackingOptions) {
  if (typeof window === "undefined") return;
  const payload = buildPayload(options);
  await trackViaApiClient(payload);
}

export function useTracking() {
  const track = useCallback((options: TrackingOptions) => {
    void trackInteraction(options);
  }, []);

  const trackAction = useCallback(
    (target: TrackingTarget, actionType: ActionType) => {
      track({ ...target, actionType });
    },
    [track]
  );

  const trackOnUnload = useCallback((options: TrackingOptions) => {
    const payload = buildPayload(options);
    const ok = trackWithBeacon(payload);
    if (!ok) {
      void trackViaApiClient(payload);
    }
  }, []);

  return { track, trackAction, trackOnUnload };
}

export function useViewTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const ref = useRef<HTMLElement | null>(null);
  const tracked = useRef(false);
  const { track } = useTracking();

  useEffect(() => {
    const el = ref.current;
    if (!el || tracked.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          track({
            contentId,
            contentType,
            actionType: "view",
            viewMode,
          });

          tracked.current = true;
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [contentId, contentType, viewMode, track]);

  return ref;
}

export function useClickTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "click");
  }, [contentId, contentType, viewMode, trackAction]);
}

export function useCopyTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "copy");
  }, [contentId, contentType, viewMode, trackAction]);
}

export function useShareTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "share");
  }, [contentId, contentType, viewMode, trackAction]);
}

export function useGenerateTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "generate");
  }, [contentId, contentType, viewMode, trackAction]);
}

export function useRemixTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "remix");
  }, [contentId, contentType, viewMode, trackAction]);
}