import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..");
const read = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

/** Every place a user can be stopped for want of credits.
 *
 *  Before 2026-08-30 the top-up modal existed, worked, and was reachable from
 *  exactly two of these. The rest ended in `alert()` — including
 *  ExampleGeneratePanel, the route our only paying customer actually converted
 *  through (organic search → example page → generate → exhaust → buy). A user who
 *  hit the wall there got a browser dialog with an OK button and no way to pay.
 *
 *  These are source-level assertions rather than rendered ones because the value
 *  is in the inventory: the risk is not that one component regresses, it is that
 *  the NEXT paid surface ships without any of this and nobody notices. When you
 *  add one, add it here. */
const PAYWALL_SURFACES = [
  "services/useDirectGenerate.ts",
  "services/useFreeformGenerate.ts",
  "app/[locale]/(static)/nano-template/[slug]/example/[exampleId]/ExampleGeneratePanel.tsx",
  "app/[locale]/(static)/tools/CreateNewModal.tsx",
  "app/[locale]/(public)/search/GenerableTemplatesSection.tsx",
  "app/[locale]/_components/UnifiedActionBar.tsx",
  "app/[locale]/_components/ReproduceWorkbench.tsx",
  "app/[locale]/(app)/project_details/[id]/page.tsx",
] as const;

describe("paywall routing", () => {
  it("every credit-gated surface opens the top-up modal", () => {
    const offenders = PAYWALL_SURFACES.filter(
      (rel) => !/setModal(?:State)?\(\s*["']topup["']\s*\)/.test(read(rel)),
    );
    expect(offenders, "these surfaces block a user with no way to pay").toEqual([]);
  });

  it("every credit-gated surface reports the block", () => {
    // Without this the funnel is unmeasurable. "50 users reached the paywall"
    // was inferred from balances, never observed, so there has never been a
    // denominator for paywall → checkout → paid.
    const offenders = PAYWALL_SURFACES.filter(
      (rel) => !/contentId:\s*[`"']paywall:/.test(read(rel)),
    );
    expect(offenders, "these surfaces block a user without emitting an event").toEqual([]);
  });

  it("no surface hardcodes the credit price", () => {
    // The other half of the same failure. `useFreeformGenerate.ts` kept its own
    // `= 10` from the 10-credit era and was missed when generation was cut to 5
    // on 2026-08-16, so for two weeks anyone holding 5-9 credits was refused a
    // generation they could afford — the tail of the 50-credit signup grant, to
    // the cohort closest to converting. Every other surface already reads the
    // shared constant; this pins that down so the price can only move in one
    // place. `lib/pricing.ts` is the source of truth.
    const offenders: string[] = [];
    for (const rel of PAYWALL_SURFACES) {
      const src = read(rel);
      const literal = src.match(/const\s+\w*CREDITS?_COST\w*\s*(?::[^=]+)?=\s*\d+/);
      if (literal) offenders.push(`${rel}: ${literal[0].trim()}`);
    }
    expect(offenders, "these surfaces can drift from lib/pricing.ts").toEqual([]);
  });

  it("no credit check falls back to a bare alert()", () => {
    // The specific shape that shipped: a balance comparison whose whole response
    // was a browser dialog.
    const offenders: string[] = [];
    for (const rel of PAYWALL_SURFACES) {
      const src = read(rel);
      const lines = src.split("\n");
      lines.forEach((line, i) => {
        if (!/alert\(/.test(line)) return;
        const window = lines.slice(Math.max(0, i - 6), i + 1).join("\n");
        if (/credits?\s*<|<\s*CREDITS_COST|cost\s*>\s*remainingCredits|INSUFFICIENT_CREDITS/i.test(window)) {
          offenders.push(`${rel}:${i + 1}`);
        }
      });
    }
    expect(offenders).toEqual([]);
  });
});
