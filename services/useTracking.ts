"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/services/api";

type ContentType = "inspiration" | "nano_inspiration" | "nano_gallery";
type ActionType = "view" | "click" | "copy" | "favorite" | "share";

export interface TrackingOptions {
  contentId: string;
  contentType: ContentType;
  actionType: ActionType;
  viewMode?: "list" | "cards";
}

const TRACK_ENDPOINT = "/interactions/track";

// NOTE: apiClient keeps baseURL private, so for sendBeacon we use the same env var.
// Keep this consistent with services/api.ts.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Generate a session ID that persists during the browser session.
 */
function getSessionId(): string {
  const SESSION_KEY = "_curify_session_id";
  if (typeof window === "undefined") return "";

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/**
 * Get user ID from local storage (if logged in).
 * If you don't store user_id, this can be removed safely.
 */
function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

/**
 * Build tracking payload (MUST match FastAPI TrackInteractionRequest).
 */
function buildPayload(options: TrackingOptions) {
  const sessionId = getSessionId();
  const userId = getUserId();
  const referrer = typeof window !== "undefined" ? document.referrer : undefined;

  return {
    content_id: options.contentId,
    content_type: options.contentType,
    action_type: options.actionType,
    user_id: userId ?? undefined,
    session_id: sessionId || undefined,
    view_mode: options.viewMode,
    referrer,
  };
}

/**
 * Best-effort tracking with apiClient.
 * Fail silently.
 */
async function trackViaApiClient(payload: any) {
  try {
    await apiClient.request<any>(TRACK_ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
      keepalive: true as any,
    });
  } catch {
    // tracking must never break UX
  }
}

/**
 * More reliable tracking during unload using sendBeacon when available.
 * Falls back to apiClient if beacon isn't available.
 */
function trackWithBeaconOrApi(payload: any) {
  if (typeof window === "undefined") return;

  try {
    if (navigator.sendBeacon) {
      const url = `${API_BASE}${TRACK_ENDPOINT}`;
      const blob = new Blob([JSON.stringify(payload)], {
        type: "application/json",
      });
      navigator.sendBeacon(url, blob);
      return;
    }
  } catch {
    // ignore and fall back
  }

  void trackViaApiClient(payload);
}

/**
 * Track an interaction (normal path).
 */
async function trackInteraction(options: TrackingOptions): Promise<void> {
  if (typeof window === "undefined") return;
  const payload = buildPayload(options);
  await trackViaApiClient(payload);
}

/**
 * Hook for manual tracking (normal path).
 */
export function useTracking() {
  const track = useCallback((options: TrackingOptions) => {
    void trackInteraction(options);
  }, []);

  const trackOnUnload = useCallback((options: TrackingOptions) => {
    const payload = buildPayload(options);
    trackWithBeaconOrApi(payload);
  }, []);

  return { track, trackOnUnload };
}

/**
 * Hook for tracking view events automatically:
 * Tracks when an element enters the viewport.
 */
export function useViewTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: "list" | "cards",
  options?: {
    threshold?: number;
    once?: boolean;
  }
) {
  const elementRef = useRef<HTMLElement | null>(null);
  const hasTracked = useRef(false);
  const { track } = useTracking();

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (options?.once && hasTracked.current) return;

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

          hasTracked.current = true;

          if (options?.once) {
            observer.unobserve(element);
          }
        }
      },
      { threshold: options?.threshold ?? 0.5 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [contentId, contentType, viewMode, track, options?.once, options?.threshold]);

  return elementRef;
}

/**
 * Hook for tracking click events.
 */
export function useClickTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: "list" | "cards"
) {
  const { track } = useTracking();

  return useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: "click",
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
}

/**
 * Hook for tracking copy events.
 */
export function useCopyTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: "list" | "cards"
) {
  const { track } = useTracking();

  return useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: "copy",
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
}

/**
 * Hook for tracking share events.
 */
export function useShareTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: "list" | "cards"
) {
  const { track } = useTracking();

  return useCallback(() => {
    track({
      contentId,
      contentType,
      actionType: "share",
      viewMode,
    });
  }, [contentId, contentType, viewMode, track]);
}
