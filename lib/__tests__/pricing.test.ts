import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  IMAGE_GENERATION_CREDITS,
  PACKAGING_MOCKUP_CREDITS,
  STICKER_EXPORT_CREDITS,
  ACRYLIC_EXPORT_CREDITS,
} from "@/lib/pricing";

/** What the backend actually charges, as of 2026-08-16.
 *
 *  This is a TRIPWIRE, not verification — this repo cannot import from
 *  curify_background, so these numbers are transcribed by hand. The test's job is
 *  to fail loudly when someone edits lib/pricing.ts alone, as a reminder that the
 *  charge lives in the other repo and both have to move together. If the backend
 *  changed and this file did not, the test passes and lies; the only defence is
 *  updating both in the same change. Sources:
 *    nano_template_pipeline.GENERATION_CREDITS   = 5.0
 *    nano_freeform_pipeline.GENERATION_CREDITS   = 5.0
 *    design_tool_pipelines.STICKER_EXPORT_CREDITS   = 190.0
 *    design_tool_pipelines.ACRYLIC_EXPORT_CREDITS   = 240.0
 *    design_tool_pipelines.PACKAGING_MOCKUP_CREDITS = 15.0 */
const BACKEND_CHARGES = {
  image: 5,
  stickerExport: 190,
  acrylicExport: 240,
  packagingMockup: 15,
} as const;

describe("credit pricing", () => {
  it("mirrors the backend charge for image generation", () => {
    expect(IMAGE_GENERATION_CREDITS).toBe(BACKEND_CHARGES.image);
  });

  it("mirrors the backend charge for the design-to-manufacturing tools", () => {
    expect(STICKER_EXPORT_CREDITS).toBe(BACKEND_CHARGES.stickerExport);
    expect(ACRYLIC_EXPORT_CREDITS).toBe(BACKEND_CHARGES.acrylicExport);
    expect(PACKAGING_MOCKUP_CREDITS).toBe(BACKEND_CHARGES.packagingMockup);
  });

  /** The bug this whole module exists to prevent: a locale file stating a price
   *  in prose. Those strings are invisible to a constant change, so they keep
   *  quoting last quarter's number long after the charge moved. Prices must
   *  arrive as ICU parameters. */
  it("no locale file hardcodes a credit amount in prose", () => {
    const dir = join(process.cwd(), "messages");
    const offenders: string[] = [];
    // "1 credit ≈ $X" is a rate DEFINITION — the unit is inherently 1 and the
    // dollar side is already a parameter, so it never goes stale. What must never
    // be hardcoded is a quantity charged for an action ("requires 10 credits"),
    // which is always 2 or more. Hence the leading [2-9] / multi-digit alternation.
    const priceWord =
      /(?:[2-9]|\d{2,})\s*(credits?|crédits?|créditos?|积分|クレジット|크레딧|кредит\w*|kredi)/i;

    for (const locale of readdirSync(dir)) {
      const file = join(dir, locale, "common.json");
      let parsed: unknown;
      try {
        parsed = JSON.parse(readFileSync(file, "utf8"));
      } catch {
        continue; // locale has no common.json
      }
      const walk = (node: unknown, path: string) => {
        if (typeof node === "string") {
          if (priceWord.test(node)) offenders.push(`${locale}${path}: ${node}`);
        } else if (node && typeof node === "object") {
          for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
        }
      };
      walk(parsed, "");
    }

    expect(offenders).toEqual([]);
  });

  /** 2026-08-21: services/factoryExport.ts declared its OWN
   *  `STICKER_EXPORT_CREDITS = 20` and that copy — not lib/pricing.ts — was what
   *  the sticker form rendered. Backend and lib/pricing.ts both moved to 190 and
   *  the UI kept quoting $2, with every existing test green. A price is only
   *  single-sourced if no second file declares it. */
  it("is the only file that declares a credit price", async () => {
    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const ROOT = join(__dirname, "..", "..");
    const NAMES = [
      "IMAGE_GENERATION_CREDITS",
      "STICKER_EXPORT_CREDITS",
      "ACRYLIC_EXPORT_CREDITS",
      "PACKAGING_MOCKUP_CREDITS",
      "USD_PER_CREDIT",
    ];
    const SKIP = new Set(["node_modules", ".next", ".git", "public", "raw", "messages"]);
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (SKIP.has(entry)) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(entry)) continue;
        const rel = full.slice(ROOT.length + 1);
        if (rel === join("lib", "pricing.ts")) continue;
        const src = readFileSync(full, "utf8");
        for (const name of NAMES) {
          // `export const X = 20` / `const X = 20` — a declaration with a literal.
          if (new RegExp(`(?:export\\s+)?const\\s+${name}\\s*(?::[^=]+)?=\\s*[0-9]`).test(src)) {
            offenders.push(`${rel} declares ${name}`);
          }
        }
      }
    };
    walk(ROOT);
    expect(offenders).toEqual([]);
  });
});
