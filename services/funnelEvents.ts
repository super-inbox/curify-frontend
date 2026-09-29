"use client";

// Funnel milestone events: auth success, signup completion, first generation,
// Calendly clicks. Before 2026-09-29 none of these existed, so the funnel was
// dark between "auth-modal opened" and "a project row appeared".
//
// All events use content_type "menu_link" + action "click", the same pair the
// lead events (contact:submit:*, bulk-callout:*) use: the backend enum 422s
// unknown values, so a new lead-shaped type would need a migration first, and
// one type across the funnel keeps every stage a single filter on content_id.
//
// Storage guards (localStorage) are best-effort: they stop the same browser
// firing a milestone twice; a second device can fire it again. Analysis should
// still dedupe on user_id (MIN(created_at)) rather than trust the event count.

import { trackEvent } from "@/services/useTracking";

export type AuthMethod = "email_otp" | "google";

const SIGNUP_FIRED_PREFIX = "_curify_signup_fired:";
const FIRST_GEN_PREFIX = "_curify_first_gen:";

/**
 * How recent `created_at` must be for this login to count as the signup.
 *
 * WHY A WINDOW. /auth/verify-otp and /auth/google-login return the same
 * payload for new and returning users — there is no is_new flag. But both
 * return the user's created_at, and a brand-new account is created at most a
 * few minutes before its first successful auth: Google creates it inside the
 * same request, and email accounts are created at send-otp, with the OTP
 * expiring shortly after. 15 minutes covers the OTP lifetime plus clock skew
 * without catching a returning user.
 */
const NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function parseBackendDate(value: unknown): number | null {
  if (typeof value !== "string" || !value) return null;
  // Backend datetimes are naive UTC (datetime.utcnow()) and serialise without
  // an offset; Date.parse would read them as local time.
  const iso = /[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : ms;
}

/**
 * Accounts created before this instrumentation shipped have no localStorage
 * guard, so their next generation would look like a "first". They are not
 * eligible: generate:first only fires for accounts created on/after this date.
 */
const GENERATE_FIRST_SINCE_MS = Date.parse("2026-09-29T00:00:00Z");

function currentUser(): { id: string; createdMs: number | null } | null {
  try {
    const stored = localStorage.getItem("curifyUser");
    const u = stored ? (JSON.parse(stored) as { user_id?: unknown; created_at?: unknown }) : null;
    if (u?.user_id == null) return null;
    return { id: String(u.user_id), createdMs: parseBackendDate(u.created_at) };
  } catch {
    return null;
  }
}

/**
 * Call once after a successful sign-in. Always fires auth:login:<method>;
 * additionally fires signup:complete:<method> when the account is new.
 */
export function trackAuthSuccess(
  method: AuthMethod,
  user: { user_id?: string | number; created_at?: string } | null | undefined,
) {
  trackEvent({ contentId: `auth:login:${method}`, contentType: "menu_link", actionType: "click" });

  const userId = user?.user_id != null ? String(user.user_id) : null;
  const createdMs = parseBackendDate(user?.created_at);
  if (!userId || createdMs == null) return;
  if (Date.now() - createdMs > NEW_ACCOUNT_WINDOW_MS) return;

  const key = `${SIGNUP_FIRED_PREFIX}${userId}`;
  if (safeGet(key)) return;
  safeSet(key, "1");
  trackEvent({ contentId: `signup:complete:${method}`, contentType: "menu_link", actionType: "click" });
}

/**
 * Call after any generation SUCCEEDS (result delivered, not merely requested).
 * Fires generate:first once per user per browser. `surface` is recorded as
 * generate:first:<surface> so the first-value tool is visible.
 */
export function trackFirstGeneration(surface: string) {
  const user = currentUser();
  if (!user || user.createdMs == null || user.createdMs < GENERATE_FIRST_SINCE_MS) return;
  const key = `${FIRST_GEN_PREFIX}${user.id}`;
  if (safeGet(key)) return;
  safeSet(key, "1");
  trackEvent({
    contentId: `generate:first:${surface}`.slice(0, 255),
    contentType: "menu_link",
    actionType: "click",
  });
}

/** Click on a link that opens Calendly. */
export function trackCalendlyClick(source: string) {
  trackEvent({
    contentId: `calendly:click:${source}`.slice(0, 255),
    contentType: "menu_link",
    actionType: "click",
  });
}
