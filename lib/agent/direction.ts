/**
 * Creative-direction policy for workflow runs.
 *
 * Two rules, from the 2026-08-14 review:
 *
 *  a. **A reference image can BE the direction.** For merch, an uploaded
 *     character already fixes the look — emotion grid → sticker sheet → apply to
 *     products all inherit it, and asking the user to pick a "style direction"
 *     on top would be a step that changes nothing. Skip the gate.
 *  b. **Never run a 5-step ladder on an unset direction.** Without a shared
 *     constraint each step generates independently and the set does not match,
 *     which is the main quality risk in the current expansion — and it costs 5x
 *     a single generation to discover. So when a direction is required and
 *     absent, the plan is ONE step (choose a direction), not five.
 *
 * Per-vertical judgement (§7j):
 *
 *  | domain     | image | direction gate | why                                    |
 *  |------------|-------|----------------|----------------------------------------|
 *  | merch      | yes   | skip           | the character IS the direction         |
 *  | merch      | no    | REQUIRE        | nothing fixes the look yet             |
 *  | product    | yes   | skip           | the product's own look is the constraint; the ladder varies placement, not style |
 *  | product    | no    | REQUIRE        | same as merch                          |
 *  | packaging  | yes   | skip           | existing artwork/dieline carries it    |
 *  | packaging  | no    | REQUIRE        | shelf look is the whole decision       |
 *  | brand      | ANY   | REQUIRE        | the direction IS the deliverable — a reference is an input to exploring it, never a substitute |
 *  | education  | ANY   | skip           | templates are functionally opinionated (flashcard / worksheet / poster); style is secondary and a gate would be friction with no payoff |
 */

/** Domains where a reference image cannot stand in for a chosen direction. */
const ALWAYS_REQUIRE = new Set(["brand"]);
/** Domains whose deliverables are functional enough not to need one at all. */
const NEVER_REQUIRE = new Set(["education"]);

export function requiresDirection(domain: string, hasImage: boolean): boolean {
  if (NEVER_REQUIRE.has(domain)) return false;
  if (ALWAYS_REQUIRE.has(domain)) return true;
  return !hasImage;
}

/**
 * Why the gate did or did not fire — surfaced in the UI so a skipped step reads
 * as a deliberate decision rather than a missing feature.
 */
export function directionRationale(domain: string, hasImage: boolean): string {
  if (NEVER_REQUIRE.has(domain)) {
    return "These deliverables are template-driven, so no style direction is needed — running the full workflow.";
  }
  if (ALWAYS_REQUIRE.has(domain)) {
    return "Brand work IS the direction — pick one before anything is generated, even with a reference image.";
  }
  return hasImage
    ? "Your reference image sets the look, so every step inherits it — running the full workflow."
    : "Pick a direction first: all steps share it, so choosing after generating would mean regenerating the set.";
}

/**
 * Existing creative-exploration cases the agent can borrow.
 *
 * ⚠️ WIRING GAP: `BrandDirectionCase["id"]` is a closed union of three demo
 * cases, so the agent cannot yet ask for directions on an arbitrary domain — it
 * can only reuse the closest existing case. Widening that type (or extracting a
 * domain-agnostic `generateDirections(brief)`) is the real fix; mapping onto
 * demo cases is the honest interim, and it is why merch/product map to a poster
 * case rather than something purpose-built.
 */
export const DIRECTION_CASE_BY_DOMAIN: Record<string, string> = {
  brand: "tea-brand-exploration",
  packaging: "tea-brand-exploration",
  merch: "event-poster",
  product: "event-poster",
};

export function directionCaseFor(domain: string): string | null {
  return DIRECTION_CASE_BY_DOMAIN[domain] ?? null;
}
