"use client";

import { useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/services/api";
import { API_BASE } from "@/lib/constants";

export type ContentType =
  | "inspiration"
  | "nano_inspiration"
  | "nano_inspiration_example_grid"
  | "nano_inspiration_template_card"
  | "nano_inspiration_reproduce_section"
  | "nano_gallery"
  | "topic_capsule"
  | "tag_capsule"
  | "menu_link"
  | "breadcrumb"
  | "prev_next";

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
  currentPageRoute?: string;
}

export interface TrackingTarget {
  contentId: string;
  contentType: ContentType;
  viewMode?: ViewMode;
}

const TRACK_ENDPOINT = "/interactions/track";
const SESSION_KEY = "_curify_session_id";

// Route patterns ordered most-specific first.
// current_page_route is normalised for backend aggregation.
const LOCALE_PREFIX = /^\/[a-z]{2}(?=\/|$)/;

const ROUTE_PATTERNS: [RegExp, string][] = [
  [/\/nano-template\/[^/]+\/example\/[^/]+$/, "/nano-template/[slug]/example/[exampleId]"],
  [/\/nano-template\/[^/]+$/,                 "/nano-template/[slug]"],
  [/\/nano-banana-pro-prompts\/tag\/[^/]+$/,  "/nano-banana-pro-prompts/tag/[slug]"],
  [/\/nano-banana-pro-prompts\/[^/]+$/,       "/nano-banana-pro-prompts/[id]"],
  [/\/topics\/[^/]+$/,                        "/topics/[slug]"],
  [/\/use-cases\/[^/]+$/,                     "/use-cases/[slug]"],
  [/\/tools\/[^/]+$/,                         "/tools/[slug]"],
  [/\/blog\/[^/]+$/,                          "/blog/[slug]"],
  [/\/magic\/[^/]+$/,                         "/magic/[id]"],
  [/\/project_details\/[^/]+$/,               "/project_details/[id]"],
];

function normalizeRoute(pathname: string): string {
  // Strip locale prefix (e.g. /zh, /fr) — en has no prefix so this is a no-op for en
  const stripped = pathname.replace(LOCALE_PREFIX, "");
  for (const [pattern, normalized] of ROUTE_PATTERNS) {
    if (pattern.test(stripped)) return normalized;
  }
  return stripped;
}

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
  try {
    const stored = localStorage.getItem("curifyUser");
    if (stored) return (JSON.parse(stored) as any)?.user_id ?? null;
  } catch {}
  return null;
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
    current_page_url:
      typeof window !== "undefined" ? window.location.pathname || undefined : undefined,
    current_page_route:
      typeof window !== "undefined"
        ? options.currentPageRoute ?? normalizeRoute(window.location.pathname)
        : undefined,
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

export function useSaveTracking(
  contentId: string,
  contentType: ContentType,
  viewMode?: ViewMode
) {
  const { trackAction } = useTracking();

  return useCallback(() => {
    trackAction({ contentId, contentType, viewMode }, "favorite");
  }, [contentId, contentType, viewMode, trackAction]);
}