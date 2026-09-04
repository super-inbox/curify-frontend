import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  IMAGE_GENERATION_CREDITS,
  CLEAN_MASTER_UNLOCK_CREDITS,
  PACKAGING_MOCKUP_CREDITS,
  STICKER_EXPORT_CREDITS,
  ACRYLIC_EXPORT_CREDITS,
} from "@/lib/pricing";
import { JOB_UI_CONFIG } from "@/lib/create-job-ui";

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
 *    design_tool_pipelines.STICKER_EXPORT_CREDITS   = 40.0
 *    design_tool_pipelines.ACRYLIC_EXPORT_CREDITS   = 50.0
 *    design_tool_pipelines.PACKAGING_MOCKUP_CREDITS = 10.0
 *    product_video_pipeline.PRODUCT_VIDEO_CREDITS   = 30.0
 *    crud.credits.CLEAN_MASTER_UNLOCK_COST          = 5.0
 *
 *  D2M prices cut 2026-08-30 (sticker 90 → 40, acrylic 120 → 50, mockup 15 → 10). */
const BACKEND_CHARGES = {
  image: 5,
  stickerExport: 40,
  acrylicExport: 50,
  packagingMockup: 10,
  productVideo: 30,
  cleanMasterUnlock: 5,
} as const;

/** Per-minute job rates, from JOB_CREDIT_COST in
 *  curify_background/app/constants/subscription_constants.py.
 *
 *  Same tripwire caveat as above, and this is the mirror that has actually gone
 *  stale: create-job-ui's ratePerMinute is a SECOND hand-maintained copy of the
 *  same backend numbers, and until 2026-08-29 nothing tested it at all. */
const BACKEND_RATES_PER_MINUTE = {
  full_translation: 5,
  speech_translator: 5,
  asl_translation: 0, // free as of 2026-08-29 — see create-job-ui.ts
  subtitle_only: 0,
  video_transcript: 0,
} as const;

describe("credit pricing", () => {
  it("mirrors the backend charge for image generation", () => {
    expect(IMAGE_GENERATION_CREDITS).toBe(BACKEND_CHARGES.image);
  });

  it("mirrors the backend charge to remove an image watermark", () => {
    // Buy-once per project. If these drift the button quotes one price and the
    // ledger takes another — the exact failure lib/credit_utils.js used to have.
    expect(CLEAN_MASTER_UNLOCK_CREDITS).toBe(BACKEND_CHARGES.cleanMasterUnlock);
  });

  it("mirrors the backend charge for the design-to-manufacturing tools", () => {
    expect(STICKER_EXPORT_CREDITS).toBe(BACKEND_CHARGES.stickerExport);
    expect(ACRYLIC_EXPORT_CREDITS).toBe(BACKEND_CHARGES.acrylicExport);
    expect(PACKAGING_MOCKUP_CREDITS).toBe(BACKEND_CHARGES.packagingMockup);
  });

  it("mirrors the backend per-minute rates quoted in the create-job modal", () => {
    for (const [jobType, rate] of Object.entries(BACKEND_RATES_PER_MINUTE)) {
      expect(
        JOB_UI_CONFIG[jobType as keyof typeof JOB_UI_CONFIG].ratePerMinute,
        `${jobType} quotes a different rate than the backend charges`,
      ).toBe(rate);
    }
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
  /** 2026-08-30: the version above missed the bug that actually shipped.
   *
   *  services/useDirectGenerate.ts and useFreeformGenerate.ts each declared
   *  `const CREDITS_COST = 10` — not one of the five NAMES — and kept it through
   *  the 10 → 5 cut on 2026-08-16. For two weeks every user holding 5-9 credits
   *  was refused a generation they could afford, on the two surfaces carrying
   *  almost all generation traffic, with this test green throughout.
   *
   *  So the guard now covers the local alias too, and walks `.js` as well: the
   *  price ladder in lib/credit_utils.js was invisible for the same reason — the
   *  walk only read `.ts|.tsx`. Aliasing (`const CREDITS_COST = IMAGE_GENERATION_CREDITS`)
   *  is fine and intended; only a numeric literal is an offence. */
  it("is the only file that declares a credit price", async () => {
    const { readFileSync, readdirSync, statSync } = await import("node:fs");
    const { join } = await import("node:path");
    const ROOT = join(__dirname, "..", "..");
    const NAMES = [
      "IMAGE_GENERATION_CREDITS",
      "STICKER_EXPORT_CREDITS",
      "ACRYLIC_EXPORT_CREDITS",
      "PACKAGING_MOCKUP_CREDITS",
      "PRODUCT_VIDEO_CREDITS",
      "USD_PER_CREDIT",
      "PLAN_CREDITS",
      "CREDITS_COST",
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
        if (!/\.(ts|tsx|js|jsx|cjs|mjs)$/.test(entry)) continue;
        const rel = full.slice(ROOT.length + 1);
        if (rel === join("lib", "pricing.ts")) continue;
        // This file quotes the offending declarations verbatim when explaining
        // which bug each rule exists to catch. It declares no runtime price.
        if (rel === join("lib", "__tests__", "pricing.test.ts")) continue;
        const src = readFileSync(full, "utf8");
        for (const name of NAMES) {
          // `export const X = 20` / `const X = 20` — a declaration with a literal.
          const literal = name === "PLAN_CREDITS" ? "[0-9{]" : "[0-9]";
          if (new RegExp(`(?:export\\s+)?const\\s+${name}\\s*(?::[^=]+)?=\\s*${literal}`).test(src)) {
            offenders.push(`${rel} declares ${name}`);
          }
        }
      }
    };
    walk(ROOT);
    expect(offenders).toEqual([]);
  });
});
