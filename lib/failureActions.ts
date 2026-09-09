/**
 * What a failed video job offers the user, and in which language.
 *
 * Pulled out of magic/[id]/page.tsx so it can be tested — every test in this
 * repo lives in lib/__tests__ and exercises pure functions, not components.
 *
 * Two behaviours worth stating, because both replace something worse:
 *
 * 1. An unknown failure code used to fall through to `failure_reason` — the raw
 *    English sentence the backend wrote — rendered verbatim to whoever was
 *    reading. A Hindi user whose ASL job failed got "ASL recognition failed: No
 *    discernible ASL signing was observed…". The backend can emit around twenty
 *    codes; the UI knew two. Now the localized string always wins and the raw
 *    reason is demoted to a diagnostic the user can expand.
 *
 * 2. "Try again" is offered on the server's say-so, not by guessing from the
 *    code. `retryable` comes from the exception class itself, so a transient
 *    fault offers a retry and a settled verdict about the file — no speech, no
 *    signing — does not. Re-running one of those reaches the same answer, which
 *    is the waste the queue-side fix removed in the first place.
 */

export interface AslSuggestion {
  suggested_job_type: string;
  strength: "suspected" | "possible" | string;
  detected: boolean;
  confidence: number;
  reason: string;
  credits_per_minute: number;
  estimated_credits: number;
  is_free: boolean;
}

export interface FailureStatusLike {
  failure_code?: string | null;
  failure_reason?: string | null;
  retryable?: boolean | null;
  asl_suggestion?: AslSuggestion | null;
  job_type?: string | null;
}

export interface FailureView {
  /** i18n key to render as the headline message. */
  messageKey: string;
  /** The backend's raw English string, for a collapsed diagnostic. Never the headline. */
  detail: string | null;
  showRetry: boolean;
  showAslOffer: boolean;
  showTopUp: boolean;
  /** "suspected" reads as a statement, "possible" as a question. */
  aslStrength: string | null;
}

/**
 * @param hasMessage - whether the i18n catalogue knows a key (next-intl's `t.has`).
 */
export function buildFailureView(
  status: FailureStatusLike | null | undefined,
  hasMessage: (key: string) => boolean,
): FailureView {
  const code = status?.failure_code ?? null;
  const reason = status?.failure_reason ?? null;
  const suggestion = status?.asl_suggestion ?? null;

  // A failed ASL job must never be offered the ASL tool again. The backend's
  // allowlist would refuse it, but a button that always errors is worse than no
  // button.
  const alreadyAsl = status?.job_type === "asl_translation";
  const showAslOffer = Boolean(
    suggestion &&
      suggestion.suggested_job_type &&
      !alreadyAsl,
  );

  return {
    messageKey: code && hasMessage(code) ? code : "default",
    detail: reason && reason.trim() ? reason : null,
    // Default true only when the server said nothing: rows written before
    // `retryable` existed carry no opinion, and refusing those would strand
    // them. Anything the server marked terminal stays terminal.
    showRetry: status?.retryable !== false,
    showAslOffer,
    showTopUp: code === "INSUFFICIENT_CREDITS",
    aslStrength: showAslOffer ? (suggestion?.strength ?? null) : null,
  };
}
