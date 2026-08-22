// lib/physical_product_offer.ts
//
// Offer a physical-product export at the moment a character generation finishes.
//
// WHY: as of 2026-08-22 the factory line has 2 voluntary users in its lifetime
// (sticker_factory_export: 11 jobs / 3 users, one of whom is the founder;
// acrylic_factory_export: 0; packaging_mockup: 0). Both real users signed up and
// exported within three minutes, so intent exists — they just had to already know
// the tool was there. Meanwhile our traffic is anime/IP/character templates, and
// acrylic charms are ordered by exactly that population from factories that
// CHARGE for or REJECT bad files rather than absorbing them (unlike a US press —
// see docs/sticker-factory-pipeline.md, the Jetpack thread).
//
// So this is the cheapest available test of the acrylic hypothesis: put the offer
// in front of people already holding a character they made. If our own audience
// won't click it, no crawled list will convert.
//
// NOT gated on output intent. getOutputIntent() tags character templates as
// "social"/"remix" and reserves "merch" for 23 unrelated ones, so it would miss
// nearly every case. Gated instead on an explicit, inspectable name predicate.
//
// ⚠️ MEASURED COVERAGE, 2026-08-22: this predicate fires on 10 of 468 lifetime
// generations — 2.1%. The character templates that actually carry traffic are all
// correctly VETOED because they emit multi-element layouts, not a subject:
// ip-character-expression-sheet (19 gens, 9 poses), figure-to-abstract-portrait-
// series (10), world-cup-team-sticker-poster (7). Real traffic is educational
// cards, travel maps and product posters.
//
// So this wiring is CORRECT but is NOT a sufficient test of acrylic demand at
// current volume — do not read a low click count here as "the audience does not
// want physical products". The finding is upstream: our generation traffic barely
// produces single cut-outable subjects at all. Making the exporter accept one pose
// from an expression sheet would reach ~4x the traffic, and that is a build.
//
// This module is pure/client-safe: no taxonomy import, no big JSON.

/** Template-id fragments whose output is a single cut-outable subject.
 *
 *  The exporters run background removal then trace a silhouette, so they need one
 *  clear subject on a clean background. An infographic, map or multi-panel card
 *  traces into nonsense — hence a allowlist rather than "show it on everything". */
const SINGLE_SUBJECT_FRAGMENTS = [
  "character",
  "chibi",
  "sticker",
  "mascot",
  "figure",
  "turnaround",
  "sprite",
  "emoji",
  "avatar",
  "pet",
  "plush",
  "mbti-animal",
] as const;

/** Fragments that veto the offer even when one above matches — these produce
 *  multi-element layouts (grids, sheets, posters, comparison cards) that have no
 *  single silhouette to cut. */
const MULTI_ELEMENT_FRAGMENTS = [
  "grid",
  "comparison",
  "contrast",
  "infographic",
  "poster",
  "chart",
  "map",
  "timeline",
  "analysis",
  "vocab",
  // Added 2026-08-22 after checking the predicate against all 301 template ids:
  // each of these produces a layout, not a subject. A "sprite emoji sheet" is 9
  // poses, a "design board" is a moodboard, a "specification sheet" is multi-view.
  "sheet",
  "board",
  "guide",
  "series",
  "specification",
  "educational",
  "overlay",
  "spread",
  "pack",
] as const;

/** Does this template produce something worth offering as a physical product? */
export function offersPhysicalProduct(templateId: string | undefined | null): boolean {
  if (!templateId) return false;
  const id = templateId.toLowerCase();
  if (MULTI_ELEMENT_FRAGMENTS.some((f) => id.includes(f))) return false;
  return SINGLE_SUBJECT_FRAGMENTS.some((f) => id.includes(f));
}

/** Query param the tool pages read to pre-fill an already-generated image, so the
 *  handoff does not force a download-then-reupload round trip. The backend's
 *  _materialize() accepts an http(s) URL as well as a bucket path, so a signed
 *  generation URL works directly.
 *
 *  Signed URLs expire — this is a click-now handoff, not a durable link. */
export const PRESET_IMAGE_PARAM = "image";

export const ACRYLIC_TOOL_SLUG = "acrylic-factory-export";

/** Build the handoff URL from a completed generation to the acrylic exporter. */
export function acrylicOfferHref(locale: string, imageUrl: string): string {
  return `/${locale}/tools/${ACRYLIC_TOOL_SLUG}?${PRESET_IMAGE_PARAM}=${encodeURIComponent(imageUrl)}`;
}
