import { describe, expect, it } from "vitest";

import { buildFailureView } from "../failureActions";

const KNOWN = new Set([
  "NO_SPEECH",
  "ASL_SUSPECTED",
  "INSUFFICIENT_CREDITS",
  "default",
]);
const hasMessage = (k: string) => KNOWN.has(k);

const suggestion = {
  suggested_job_type: "asl_translation",
  strength: "possible" as const,
  detected: false,
  confidence: 0.1,
  reason: "no speech, motion covers 12% of the clip",
  credits_per_minute: 0,
  estimated_credits: 0,
  is_free: true,
};

describe("buildFailureView", () => {
  it("never surfaces the raw backend string as the headline", () => {
    // The old behaviour: an unknown code fell through to failure_reason and a
    // Hindi user read an English sentence written for a log.
    const v = buildFailureView(
      { failure_code: "NO_SIGNING_DETECTED", failure_reason: "ASL recognition failed: ..." },
      hasMessage,
    );
    expect(v.messageKey).toBe("default");
    expect(v.detail).toBe("ASL recognition failed: ...");
  });

  it("prefers a localized message when the catalogue knows the code", () => {
    const v = buildFailureView(
      { failure_code: "NO_SPEECH", failure_reason: "raw english" },
      hasMessage,
    );
    expect(v.messageKey).toBe("NO_SPEECH");
  });

  it("offers the ASL switch on a plain no-speech failure", () => {
    // The whole point: ASL_SUSPECTED has fired once ever, while plain NO_SPEECH
    // covered every observed case, including both users who switched by hand.
    const v = buildFailureView(
      { failure_code: "NO_SPEECH", asl_suggestion: suggestion, job_type: "subtitle_only" },
      hasMessage,
    );
    expect(v.showAslOffer).toBe(true);
    expect(v.aslStrength).toBe("possible");
  });

  it("passes through the stronger wording when the detector fired", () => {
    const v = buildFailureView(
      {
        failure_code: "ASL_SUSPECTED",
        asl_suggestion: { ...suggestion, strength: "suspected", detected: true },
        job_type: "full_translation",
      },
      hasMessage,
    );
    expect(v.aslStrength).toBe("suspected");
  });

  it("never offers ASL to a job that already was ASL", () => {
    const v = buildFailureView(
      { failure_code: "NO_SPEECH", asl_suggestion: suggestion, job_type: "asl_translation" },
      hasMessage,
    );
    expect(v.showAslOffer).toBe(false);
  });

  it("withholds retry when the server called the failure terminal", () => {
    const v = buildFailureView(
      { failure_code: "NO_SPEECH", retryable: false },
      hasMessage,
    );
    expect(v.showRetry).toBe(false);
  });

  it("offers retry for a transient failure", () => {
    const v = buildFailureView(
      { failure_code: "PIPELINE_FAILED", retryable: true },
      hasMessage,
    );
    expect(v.showRetry).toBe(true);
  });

  it("offers retry when the server has no opinion (pre-retryable rows)", () => {
    const v = buildFailureView({ failure_code: "PIPELINE_FAILED" }, hasMessage);
    expect(v.showRetry).toBe(true);
  });

  it("keeps the top-up button on a credit shortfall", () => {
    const v = buildFailureView({ failure_code: "INSUFFICIENT_CREDITS" }, hasMessage);
    expect(v.showTopUp).toBe(true);
  });

  it("treats a blank reason as no diagnostic", () => {
    const v = buildFailureView({ failure_code: "X", failure_reason: "   " }, hasMessage);
    expect(v.detail).toBeNull();
  });
});
