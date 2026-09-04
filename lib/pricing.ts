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
 *  defensible surface for the commodity one.
 *
 *  2026-08-21 — 20 → 190 ($19) on value grounds, walked back to 90 ($9) the same
 *  day: the binding constraint is not margin but that almost nobody reaches our
 *  paywall at all (50 users of 705, lifetime, one of whom paid).
 *
 *  2026-08-30 — 90 → 40 ($9.00 → $4.00), per user. $19 and $9 were both run as
 *  barrier-reduction experiments and both returned ZERO purchases, so price is not
 *  the variable this is testing any more; the cut is to remove it as a candidate
 *  explanation entirely before spending effort elsewhere. Cost permits it — this
 *  calls no vendor model at all (mask, Moore trace, Douglas–Peucker, CMYK convert,
 *  local rembg/u2net), so margin is ~100% at $2, $4, $9 and $19 alike, and the only
 *  real cost is worker occupancy on a single worker.
 *
 *  ⚠️ 40 is BELOW the 50-credit signup grant, which the previous prices were
 *  deliberately kept above. The price no longer guards this on its own —
 *  `design_tool_pipelines.FREE_GRANT_EXCLUDED_JOBS` is now the ONLY thing stopping
 *  a free grant from buying a factory file. Do not remove that carve-out without
 *  deciding, separately and on purpose, that a free account should get one. */
export const STICKER_EXPORT_CREDITS = 40;

/** Credits for a print-ready acrylic standee / keychain package.
 *  Mirrors `design_tool_pipelines.ACRYLIC_EXPORT_CREDITS`.
 *
 *  Above the sticker export because it is strictly more pre-press: the same
 *  geometry plus a choked white underbase plate and a wall-checked hole. Acrylic is
 *  transparent, so without that white layer the factory either quotes for a
 *  designer to build it or prints the piece washed out.
 *
 *  2026-08-30 — 120 → 50 ($12.00 → $5.00). Moves with the sticker export and must
 *  never undercut it; 40 → 50 holds the 1:1.25 ratio the two have carried since
 *  2026-08-21. */
export const ACRYLIC_EXPORT_CREDITS = 50;

/** Credits for an AI packaging mockup (dieline → folded 3D box render).
 *  Mirrors `design_tool_pipelines.PACKAGING_MOCKUP_CREDITS`. One Gemini call plus
 *  geometry enforcement.
 *
 *  2026-08-30 — 15 → 10 ($1.50 → $1.00). Unlike the two exports above this one has
 *  a real vendor bill (~$0.134 for the Gemini call), so it is the only D2M price
 *  with a floor: 10 credits holds ~87% margin, and it must stay above
 *  IMAGE_GENERATION_CREDITS because it is that same call plus dieline
 *  rasterization and geometry enforcement.
 *
 *  Stays OUT of FREE_GRANT_EXCLUDED_JOBS. It is a model-rendered picture of a box,
 *  not a manufacturable file — the commodity side of the line the carve-out draws. */
export const PACKAGING_MOCKUP_CREDITS = 10;

/** Credits for a URL → product video generation.
 *  Mirrors `product_video_pipeline.PRODUCT_VIDEO_CREDITS` (30.0). */
export const PRODUCT_VIDEO_CREDITS = 30;

/** USD value of one credit — `extra_minute_price` on the backend. Used to render
 *  approximate dollar equivalents; never used to compute an actual charge. */
export const USD_PER_CREDIT = 0.1;

/** Credit allowance per plan. Mirrors `monthly_credits` in
 *  `subscription_constants.SUBSCRIPTION_PLANS`.
 *
 *  ⚠️ FREE's 50 is granted ONCE at signup, not monthly — the backend key is named
 *  `monthly_credits` but carries `grant_type: "one_time_at_signup"`, and nothing
 *  refreshes it. Do not render it as a monthly allowance.
 *
 *  Lived as a local const in PricingClient.tsx until 2026-08-30, which is how that
 *  page came to print 5,000 for PRO in the comparison table while the plan card
 *  above it printed 1,200 from this same source. */
export const PLAN_CREDITS = { FREE: 50, CREATOR: 200, PRO: 1200 } as const;

/** Credits to remove the watermark from one generated file (image or video).
 *
 *  Mirrors `crud.credits.CLEAN_MASTER_UNLOCK_COST`. Buy-once per project: the
 *  backend keys entitlement on a deterministic invoice_id, so re-downloading a
 *  file you already unlocked is free.
 *
 *  NOT payable from the free signup grant — the backend gates on the purchased
 *  balance and debits it, the same carve-out the factory exports carry. A FREE
 *  account holding only signup credits is refused with NEEDS_PURCHASED_CREDITS
 *  and routed to a top-up. (Topping up then clears the badge outright, so in
 *  practice this price is only charged against previously purchased credits.) */
export const CLEAN_MASTER_UNLOCK_CREDITS = 5;

/** Dollars for `credits` at top-up.
 *
 *  Flat $0.10/credit on every plan, because that is what the backend does:
 *  `calculate_credits_from_amount` divides by `plan["extra_minute_price"]`, which
 *  is 0.10 on FREE, CREATOR, PRO and ENTERPRISE alike.
 *
 *  Replaces `lib/credit_utils.js`, which applied an invented $0.08 (Pro) / $0.05
 *  (Enterprise) ladder. That was not merely a second untested price declaration —
 *  it was wrong in a direction that costs the user: the button would have quoted
 *  $0.08/credit while the webhook still granted `ceil(usd / 0.10)`, taking the
 *  money and returning 20% fewer credits than promised. It stayed unreachable only
 *  because TopUpModal hardcoded the plan to "Free". */
export function creditsToDollars(credits: number): number {
  return credits * USD_PER_CREDIT;
}
