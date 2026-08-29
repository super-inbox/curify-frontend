"use client";

import { useTranslations } from "next-intl";
import CalloutBox from "./CalloutBox";

/**
 * Tells the reader that an ASL transcript has not been checked by a human.
 *
 * The pipeline has always computed this — `asl_unverified` and `review_required`
 * are written on every ASL job — but until 2026-08-29 the flags were destroyed
 * before the API could return them (_finalize_pipeline_run replaced runtime_config
 * wholesale instead of merging), so no user ever saw a warning. The only surviving
 * signal was the "[AI-generated ASL translation — unverified]" prefix on the first
 * caption line.
 *
 * Why this matters more than the usual AI disclaimer: scored against verified human
 * ground truth, the recogniser returned WER 0.92 on the one real user video we can
 * score, and it fails in the worst possible way — fluent, confident, correctly-timed
 * English that substitutes for the signing rather than transcribing it. A hearing
 * reader cannot tell which lines are real, and the deaf viewer these captions are
 * made for has nothing to check them against.
 *
 * `asl_low_confidence` is the stronger case: the video was sampled too sparsely to
 * read (long videos hit a hard frame cap), or the transcript collapsed into one
 * repeated caption.
 */
export default function AslUnverifiedNotice({
  runtimeConfig,
}: {
  runtimeConfig?: Record<string, unknown> | null;
}) {
  const t = useTranslations("jobWarnings");

  if (!runtimeConfig || runtimeConfig.asl_unverified !== true) return null;

  const lowConfidence = runtimeConfig.asl_low_confidence === true;

  // next-intl has no per-key fallback — a key missing from one locale renders the
  // dotted path as visible text. Guard the way magic/[id] does.
  const tr = (key: string, fallback: string) => (t.has(key) ? t(key) : fallback);

  const title = lowConfidence
    ? tr("aslLowConfidenceTitle", "We could not read this video well")
    : tr("aslUnverifiedTitle", "Machine translation — not verified by a human");

  const body = lowConfidence
    ? tr(
        "aslLowConfidenceBody",
        "This video was too long or too sparsely sampled for us to read reliably, and parts of the transcript below are likely invented. Please do not publish these captions without checking them against the signing.",
      )
    : tr(
        "aslUnverifiedBody",
        "Sign language translation is experimental and often wrong, including in ways that read as fluent and confident. Please check these captions against the signing before relying on or publishing them.",
      );

  return (
    <CalloutBox type={lowConfidence ? "warning" : "tip"} title={title}>
      {body}
    </CalloutBox>
  );
}
