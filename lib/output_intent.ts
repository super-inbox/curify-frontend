// lib/output_intent.ts
//
// Output Intent = the JTBD / "final artifact" axis for a template. It drives the
// differentiated primary Key Action CTA (cards + search) and the column-3
// workflow ordering (see lib/template_workflows.tsx). The per-template mapping
// is a PROXY compiled from the taxonomy by scripts/build_template_intents.cjs
// into lib/template_intents.json (small id->intent map — safe to import client
// side, unlike the full taxonomy). Re-run that script after taxonomy edits.
//
// This module is pure/client-safe: no server-only imports.

import TEMPLATE_INTENTS from "./template_intents.json";

export type OutputIntent =
  | "social"
  | "education"
  | "merch"
  | "print-art"
  | "presentation"
  | "remix";

export const OUTPUT_INTENTS: readonly OutputIntent[] = [
  "social",
  "education",
  "merch",
  "print-art",
  "presentation",
  "remix",
] as const;

type IntentMeta = {
  /** Short human label for the intent (e.g. chips, headers). */
  label: string;
  /** Differentiated primary Key Action CTA shown on cards + search. */
  cta: string;
  /** What the user is trying to complete — for tooltips / analytics context. */
  jtbd: string;
};

// The Key-Action ladder from the 2026-07-02 "sell Completion not Generation"
// strategy. CTAs are verbs that reflect the finished artifact, not "Generate".
export const INTENT_META: Record<OutputIntent, IntentMeta> = {
  social: { label: "Social post", cta: "Make & Post", jtbd: "post a piece of content" },
  education: { label: "Printable set", cta: "Get Printable Set", jtbd: "print teaching material" },
  merch: { label: "Product files", cta: "Make Product Files", jtbd: "make a sellable product" },
  "print-art": { label: "Wall art", cta: "Make Wall Art", jtbd: "print / hang wall art" },
  presentation: { label: "Presentation", cta: "Turn into Slides", jtbd: "share knowledge" },
  remix: { label: "Remix", cta: "Remix This", jtbd: "riff on an existing work" },
};

const INTENT_SET = new Set<string>(OUTPUT_INTENTS);

/** The compiled output intent for a template id (defaults to "remix"). */
export function getOutputIntent(templateId: string | undefined | null): OutputIntent {
  if (!templateId) return "remix";
  const v = (TEMPLATE_INTENTS as Record<string, string>)[templateId];
  return v && INTENT_SET.has(v) ? (v as OutputIntent) : "remix";
}

/**
 * Differentiated primary CTA label for a template. For the default "remix"
 * intent we keep the caller's existing (already-translated) fallback string so
 * we don't regress i18n on the common case; differentiated intents use the
 * English Key-Action label (i18n of these is a fast-follow).
 */
export function intentCtaLabel(templateId: string | undefined | null, remixFallback: string): string {
  const intent = getOutputIntent(templateId);
  return intent === "remix" ? remixFallback : INTENT_META[intent].cta;
}
