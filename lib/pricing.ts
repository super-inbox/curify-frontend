// Single source of truth for user-facing credit prices.
//
// WHY THIS FILE EXISTS: before 2026-08-16 the image price was written out by hand
// in seven places across this repo (searchGenerationPlan, DesignAgentClient,
// GalleryReproduceSurface, BrandDirectionExplorer × en/zh, a test) and again in
// ten locale files. Changing the price meant finding all of them; missing one
// meant the UI quoted a number we did not charge. That is exactly how the
// subtitle tool ended up displaying a FREE badge while billing 696 credits.
//
// Anything that shows a price to a user imports from here. Anything that states a
// price in prose takes it as an ICU parameter — never bakes the digits into the
// string. The authoritative charge still lives in the backend pipelines; these
// constants must mirror them, and the mirror is asserted in the pricing test.

/** Credits per generated image.
 *
 *  Mirrors `nano_template_pipeline.GENERATION_CREDITS` and
 *  `nano_freeform_pipeline.GENERATION_CREDITS` (both 5.0). Charged AFTER the job
 *  reaches COMPLETED, so a failed generation costs the user nothing.
 *
 *  2026-08-16 — cut from 10 to 5 ($1.00 → $0.50 at 1 credit = $0.10). Image
 *  generation is 63% of completed jobs and was our worst-positioned price:
 *  Gemini 3 Pro Image costs ~$0.13–0.24/image while Midjourney, Canva and the
 *  OpenAI image API sit at $0.04–0.20 for the user — we were charging 5–20× the
 *  market on the thing most people come here to do. 5 credits still holds a
 *  52–74% margin at the top of the cost range, and doubles what the 50-credit
 *  signup grant buys (5 images → 10), which is the number that decides whether a
 *  new user ever reaches a second generation.
 *
 *  Not 3: at $0.30 the margin collapses to ~20% if the real invoice lands near
 *  the top of the vendor's range, and that range is list price we have not yet
 *  reconciled against a bill. Revisit once actual spend is measured. */
export const IMAGE_GENERATION_CREDITS = 5;

/** Credits for a print-ready die-cut sticker package (cutline + CMYK + bleed).
 *  Mirrors `design_tool_pipelines.STICKER_EXPORT_CREDITS`.
 *
 *  Deliberately NOT cut alongside images. This calls no vendor model at all — it
 *  is CPU (mask, Moore trace, Douglas–Peucker, CMYK convert) — so margin is ~100%,
 *  and the comparable is a freelance designer charging $15–50 for the same file,
 *  not a consumer image generator. Volume is low and the buyer is a business
 *  buying a manufacturing input. This is the moat; discounting it would trade the
 *  defensible surface for the commodity one. */
export const STICKER_EXPORT_CREDITS = 20;

/** Credits for an AI packaging mockup (dieline → folded 3D box render).
 *  Mirrors `design_tool_pipelines.PACKAGING_MOCKUP_CREDITS`. One Gemini call plus
 *  geometry enforcement; same "priced against a designer, not against Midjourney"
 *  logic as the sticker export. */
export const PACKAGING_MOCKUP_CREDITS = 15;

/** USD value of one credit — `extra_minute_price` on the backend. Used to render
 *  approximate dollar equivalents; never used to compute an actual charge. */
export const USD_PER_CREDIT = 0.1;
