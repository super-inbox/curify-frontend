import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  IMAGE_GENERATION_CREDITS,
  CLEAN_MASTER_UNLOCK_CREDITS,
  PACKAGING_MOCKUP_CREDITS,
  STICKER_EXPORT_CREDITS,
  ACRYLIC_EXPORT_CREDITS,
  PLAN_CREDITS,
  FREE_SUBTITLE_SECONDS,
} from "@/lib/pricing";
import { JOB_UI_CONFIG, estimateJobCost } from "@/lib/create-job-ui";

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
 *    subscription_constants.SUBSCRIPTION_PLANS[FREE].monthly_credits = 25
 *
 *  D2M prices cut 2026-08-30 (sticker 90 → 40, acrylic 120 → 50, mockup 15 → 10).
 *  Signup grant cut 2026-09-23 (50 → 25). */
const BACKEND_CHARGES = {
  image: 5,
  stickerExport: 40,
  acrylicExport: 50,
  packagingMockup: 10,
  productVideo: 30,
  cleanMasterUnlock: 5,
  freeGrant: 25,
} as const;

/** Per-minute job rates, from JOB_CREDIT_COST in
 *  curify_background/app/constants/subscription_constants.py.
 *
 *  Same tripwire caveat as above, and this is the mirror that has actually gone
 *  stale: create-job-ui's ratePerMinute is a SECOND hand-maintained copy of the
 *  same backend numbers, and until 2026-08-29 nothing tested it at all.
 *
 *  ⚠️ 2026-09-24 — and testing it was not enough, because THIS table was wrong too.
 *  It claimed speech_translator 5 (billed 3), subtitle_only 0 (billed 1),
 *  video_transcript 0 (billed 1), and omitted video_summarizer (billed 2) entirely.
 *  Every entry was wrong in the same direction as the UI it was checking, so the
 *  test went green while three tools quoted a price we did not charge and one
 *  quoted "free" for a job that billed. A transcription tripwire only works if the
 *  transcription is re-read against the source, not copied from the thing under
 *  test. Values below verified against JOB_CREDIT_COST on 2026-09-24, when
 *  SUBTITLE_CAPTIONING and VIDEO_TRANSCRIPT both went 1 -> 2. */
const BACKEND_RATES_PER_MINUTE = {
  full_translation: 5, // VIDEO_TRANSLATION
  speech_translator: 3, // SPEECH_TRANSLATOR
  asl_translation: 8, // ASL_TRANSLATION — 0 from 2026-08-29, restored 2026-09-24
  subtitle_only: 2, // SUBTITLE_CAPTIONING, charged after FREE_SUBTITLE_SECONDS
  video_transcript: 2, // VIDEO_TRANSCRIPT
  video_summarizer: 2, // VIDEO_SUMMARIZER
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

  /** The grant had no mirror test until 2026-09-23, which is how it came to be the
   *  one credit number this module did not actually single-source: the value lived
   *  here AND as hardcoded prose in ten pricing.json files, and the locale guard
   *  below only walked common.json, so nothing would have caught them disagreeing. */
  it("mirrors the backend free signup grant", () => {
    expect(PLAN_CREDITS.FREE).toBe(BACKEND_CHARGES.freeGrant);
  });

  /** Not a price mirror — a product floor. A grant that cannot fund a few images is
   *  not a trial. Pinned on the backend too (test_free_grant_still_buys_a_real_trial);
   *  duplicated here because this is the repo that decides what the number is SHOWN
   *  as, and a page advertising a grant too small to use is the worse failure. */
  it("leaves the free grant able to buy at least three generations", () => {
    expect(PLAN_CREDITS.FREE).toBeGreaterThanOrEqual(3 * IMAGE_GENERATION_CREDITS);
  });

  it("mirrors the backend per-minute rates quoted in the create-job modal", () => {
    for (const [jobType, rate] of Object.entries(BACKEND_RATES_PER_MINUTE)) {
      expect(
        JOB_UI_CONFIG[jobType as keyof typeof JOB_UI_CONFIG].ratePerMinute,
        `${jobType} quotes a different rate than the backend charges`,
      ).toBe(rate);
    }
  });

  /** The quote must equal the charge, and the charge rounds minutes UP before it
   *  multiplies. The modal did `ceil(max(min,1) * rate)`, which under-quotes every
   *  part-minute: 90s of translation showed 8 credits and billed 10. Since the same
   *  number is the affordability gate, an under-quote also lets through a job the
   *  backend then rejects — the leak already recorded on CreateNewModal. */
  it("estimates a job's cost the way compute_processing_fee charges for it", () => {
    const translate = JOB_UI_CONFIG.full_translation;
    expect(estimateJobCost(90, translate)).toBe(10); // 2 billable min x 5
    expect(estimateJobCost(60, translate)).toBe(5);
    expect(estimateJobCost(1, translate)).toBe(5); // floor of one minute
    expect(estimateJobCost(0, translate)).toBe(0);
  });

  /** Subtitles bill on the excess over a per-VIDEO allowance and bill nothing at
   *  all inside it. A flat rate over-charges the common case; the 0 the modal used
   *  to carry under-charged the long tail. Both were wrong, in opposite directions. */
  it("charges subtitles only past the free allowance, and only on the excess", () => {
    const subs = JOB_UI_CONFIG.subtitle_only;
    expect(subs.freeSecondsPerVideo).toBe(FREE_SUBTITLE_SECONDS);
    expect(estimateJobCost(FREE_SUBTITLE_SECONDS, subs)).toBe(0);
    expect(estimateJobCost(FREE_SUBTITLE_SECONDS - 1, subs)).toBe(0);
    // One second over: a whole billable minute, not a whole billable video.
    expect(estimateJobCost(FREE_SUBTITLE_SECONDS + 1, subs)).toBe(2);
    expect(estimateJobCost(FREE_SUBTITLE_SECONDS + 120, subs)).toBe(4);
  });

  /** The bug this whole module exists to prevent: a locale file stating a price
   *  in prose. Those strings are invisible to a constant change, so they keep
   *  quoting last quarter's number long after the charge moved. Prices must
   *  arrive as ICU parameters.
   *
   *  2026-09-23: this walked common.json ONLY, and that is exactly how ten copies of
   *  "50 credits to start" (and 200 / 1,200 for the paid tiers) sat in pricing.json
   *  through two repricings. They were deleted rather than parameterized — every one
   *  duplicated an allowance PricingClient already renders from PLAN_CREDITS directly
   *  above the same list — and pricing.json is now walked so they cannot come back.
   *
   *  Deliberately NOT every file under messages/: blog.json still says generation
   *  "costs 10 credits" (it has been 5 since 2026-08-16) and home.json hardcodes a
   *  correct 5. Both are real drift, both are a separate change; widening this walk
   *  before fixing them would only teach the next person to add a skip. */
  it("no locale file hardcodes a credit amount in prose", () => {
    const dir = join(process.cwd(), "messages");
    const offenders: string[] = [];
    // "1 credit ≈ $X" is a rate DEFINITION — the unit is inherently 1 and the
    // dollar side is already a parameter, so it never goes stale. What must never
    // be hardcoded is a quantity charged for an action ("requires 10 credits"),
    // which is always 2 or more. Hence the leading [2-9] / multi-digit alternation.
    //
    // क्रेडिट was missing until 2026-09-23, so the Hindi "शुरुआत में 50 क्रेडिट"
    // would have survived this guard even once it walked the right file.
    const priceWord =
      /(?:[2-9]|\d{2,})\s*(credits?|crédits?|créditos?|积分|クレジット|크레딧|क्रेडिट|кредит\w*|kredi)/i;

    for (const locale of readdirSync(dir)) {
      for (const name of ["common.json", "pricing.json"]) {
        const file = join(dir, locale, name);
        let parsed: unknown;
        try {
          parsed = JSON.parse(readFileSync(file, "utf8"));
        } catch {
          continue; // locale does not have this file
        }
        const walk = (node: unknown, path: string) => {
          if (typeof node === "string") {
            if (priceWord.test(node)) offenders.push(`${locale}/${name}${path}: ${node}`);
          } else if (node && typeof node === "object") {
            for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
          }
        };
        walk(parsed, "");
      }
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
