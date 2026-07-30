# VerticalPageSchema Gap Analysis

**research_run_id:** vertical-content-professionalism-research-v2-run2
**research_run_date:** 2026-07-30
**source:** derived entirely from `CURRENT_IMPLEMENTATION_AUDIT.md` (this round's code audit).
This document identifies *candidate* gaps for Phase 6 code work — it does not authorize any
implementation. No code was changed to produce this file.

---

## 1. Gaps by vertical

| Vertical | Schema coded? | Content authored? | Gap |
|---|---|---|---|
| Education | Yes | 1 template (HSK, en+zh) | Needs more authored pilots; only proof-of-concept scale so far |
| MBTI | Yes | 0 templates | Schema exists and is wired end-to-end but has never been exercised — no page has ever rendered an MBTI chip strip, knowledge section, or vertical JSON-LD |
| Merch | Yes | 0 templates | Same as MBTI — schema-only, zero real pages |
| Ecommerce | **No** | N/A | Not in `VerticalId`, no `AttributeDef[]`, no `topicMatch`, cannot route any template regardless of `topics[]` content |
| Culture | **No** (design-doc only, out of this round's scope per boss brief) | N/A | Noted for awareness only — not evaluated further here |

## 2. Structural gaps (affect all verticals, not vertical-specific)

1. **No example-page rendering path.** `VerticalAttributeChips` and `VerticalKnowledgeSection` are
   generic components already capable of rendering on any page, but nothing imports them under
   `.../example/[exampleId]/`. This is the single largest gap relative to the boss's "template = hub,
   example = spoke" framing (brief §一) — right now the example/spoke layer has zero vertical content
   of any kind.
2. **No `deriveExampleAttributes`-equivalent function.** Confirmed absent repo-wide. Without it,
   example pages have no way to surface example-specific attribute values (e.g. a specific MBTI type,
   a specific worksheet's grade band) even if the render components were wired in.
3. **No per-example vertical JSON-LD.** Every example page emits the same generic `HowTo` schema
   regardless of vertical — no `additionalProperty`, no vertical `@type`.
4. **Attribute labels are not i18n'd.** Hardcoded English strings in `lib/vertical_schema.ts`
   (e.g. `"Grade / Level"`) render unchanged on non-English locale pages, even when the *values* are
   correctly localized (proven by the HSK zh page, which mixes an English label with Chinese values
   today).
5. **`facet` / `taxonomyAxis` are inert metadata.** Both fields are defined per-attribute and
   threaded through the resolver, but nothing in the app reads either one — no faceted-browse UI, no
   taxonomy cross-validation. Not a blocking gap, but worth flagging so Phase 6 doesn't assume this
   wiring already works.
6. **Doc/code drift.** `docs/vertical-page-schema-v1.md`'s top-level `VerticalId` type listing (5
   members) does not match the actual code (3 members). If the design doc is updated in a later
   phase, this line should be corrected or explicitly marked "target state, not current state."

## 3. What this means for the 4-vertical research (Phase 1-3)

- Education and, once authored, MBTI/Merch research can validate/extend an *existing* schema shape —
  the research should explicitly test whether the current `AttributeDef`/`KnowledgeSlotDef` field
  sets (e.g. education's 8 attributes / 3 knowledge slots) are actually the fields real competitor
  pages emphasize, or whether fields are missing/superfluous.
- Ecommerce research has no existing schema to validate against — it is genuinely greenfield. The
  research should produce a proposed field list from scratch (per brief §八.4's expected modules:
  product_category, platform, shot_type, background, resolution, aspect_ratio, image_sequence,
  conversion_role, feature_callout, composition, lighting, platform_rules, common_mistakes,
  related_image_types), then cross-check it against what real pages actually show — not assume the
  brief's suggested list is already correct.

## 4. Explicitly not decided here

Per the boss's brief (§十七), this document does **not** decide: which fields to add/remove/rename,
whether to build `deriveExampleAttributes`, whether to i18n attribute labels, or whether/how to
implement Ecommerce. Those are Phase 6 decisions, made after Phases 1-5 (fresh research → per-page
module analysis → per-vertical Pattern docs → cross-vertical framework → Pilot selection) and after
explicit human sign-off.
