# VerticalPageSchema v2 Recommendation — MBTI / Education / Merch

**research_run_id:** vertical-content-professionalism-research-v2-run2
**status:** design recommendation only. No file under `lib/`, `app/`, or `messages/` was modified to
produce this document. Everything in "Proposed schema shape" below is pseudo-code for review, not a
diff.

---

## Existing fields (audit of `lib/vertical_schema.ts` + `docs/vertical-page-schema-v1.md`)

### Currently implemented in code, working end-to-end (proven by the HSK pilot)
- `VerticalId = "education" | "mbti" | "merch"` (`lib/vertical_schema.ts:17`)
- `AttributeDef { key, label, facet?, taxonomyAxis? }` — Education 8 fields, MBTI 4 fields, Merch 7
  fields (`vertical_schema.ts:52-111`)
- `KnowledgeSlotDef { key, label }` — Education 3 slots, MBTI 7 slots, Merch 3 slots
- `topicMatch: string[]` — routes a template into a vertical (`resolveVerticalForTopics`,
  `vertical_schema.ts:116-125`)
- Resolver `resolveVerticalSections()` + JSON-LD builder `buildVerticalJsonLd()`
  (`lib/nano_seo_utils.ts:399-484`)
- Render components `VerticalAttributeChips` / `VerticalKnowledgeSection`
  (`VerticalKnowledge.tsx`), both null-safe

### Fields that exist only in the design doc, never implemented in code
- Ecommerce's proposed attribute list (`product_category`, `shot_type`, `background`, `platform`,
  `resolution_note`, `conversion_role` — doc §2.5) — no `AttributeDef[]`, no `VerticalId` member.
  **Not addressed by this round** (Ecommerce deferred).
- Culture's proposed attribute list (doc §2.3) — same status, and also out of this round's scope.
- The doc's top-level `VerticalId` union (doc line 185) lists 5 members; the real code has 3 — this is
  a pre-existing doc/code drift, not something this round introduces (see
  `CURRENT_IMPLEMENTATION_AUDIT.md` Q28).

### Fields that exist in code but are not rendered/consumed anywhere
- `AttributeDef.facet` — threaded into `ResolvedVerticalPage.attributes[].facet` but read by no
  faceted-browse UI anywhere in `app/` (audit Q27).
- `AttributeDef.taxonomyAxis` — stored as a string, never cross-validated against `lib/taxonomy.json`,
  never used for navigation (audit Q26).
- Both are pre-existing "documented placeholder" fields, not new findings from this round — kept as-is
  in the proposal below (no removal recommended; removing them was not requested and they may still be
  useful once faceted browse is built).

### Fields that only exist for some verticals
- All attributes/knowledge for MBTI and Merch: coded but **zero authored content** anywhere
  (audit Q4-5, Q29) — this is a content gap, not a schema gap; the schema shape is already correct.
- Education: only 1 of many Education-routed templates has authored values.
- No vertical has any per-example attribute rendering (audit Q13-18) — this is the single largest
  structural (code) gap, common to all 3 verticals equally.

---

## Missing fields from competitor research

Grouped by vertical, each tied to a specific finding in that vertical's Pattern doc.

### MBTI (from `MBTI_COMPETITOR_PATTERN.md` §6)
- No new `AttributeDef` needed — `type_code`/`type_nickname`/`dimensions` already cover MBTI_01/02/04/05's
  "type as structured attribute" pattern.
- No new `KnowledgeSlotDef` needed — the existing `compatibility` slot already covers MBTI_05's
  compatibility-summary use case (P1 recommendation is to author a short summary into that slot, not to
  build a new field).
- **Missing capability, not an attribute:** a related-content relationship (type-based or entity-based
  internal linking) — proposed as a new `relatedContent` schema-level construct below, evidenced by
  MBTI_01/02/04/05 (all 4 selected pages).

### Education (from `EDUCATION_COMPETITOR_PATTERN.md` §6)
- No new `AttributeDef`/`KnowledgeSlotDef` needed — the existing 8 attributes / 3 knowledge slots
  already match what EDU_01/02/04/06 emphasize; the gap is authoring volume (1 of many templates), not
  field coverage.
- **Missing capability:** same-page related-worksheet/related-template module (EDU_01/EDU_06 pattern) —
  covered by the same `relatedContent` construct.
- **Missing capability:** a visible breadcrumb — not a schema field, a template-page rendering gap
  (see `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md` §A).

### Merch (from `MERCH_COMPETITOR_PATTERN.md` §6)
- No new `AttributeDef` needed — `product_type`/`material`/`process`/`dimensions` already cover
  MER_01/04's spec pattern.
- No new `KnowledgeSlotDef` needed — `cultural_background` already covers MER_01's story pattern
  (again, an authoring gap, not a schema gap).
- **Missing capability:** related-product/same-family internal linking (MER_01/04/05/06, all 4 selected
  pages) — same `relatedContent` construct as MBTI/Education.

### Cross-vertical (not specific to one vertical)
- **`relatedContent`** — the single strongest finding of this round, independently confirmed in all 3
  Pattern docs' §3. Proposed as a new, optional, schema-level construct (not an `AttributeDef` or
  `KnowledgeSlotDef` — it describes a relationship between pages, not a value on one page).
- **Attribute label i18n** — confirmed broken today (audit Q24: the zh HSK page shows the English
  string "Grade / Level" next to Chinese values). Proposed fix below (`labelKey`, optional, backward
  compatible).
- **Per-example attribute/JSON-LD rendering** — confirmed entirely absent (audit Q13-16). This is a
  code-wiring gap on the example route, not a schema *field* gap — the schema itself doesn't need new
  fields to support it, it needs `deriveExampleAttributes(schema, example.params)` (already named and
  scoped in `docs/vertical-page-schema-v1.md` Roadmap item 2, still unbuilt per audit Q18) and the
  example route calling the existing `VerticalAttributeChips`/`VerticalKnowledgeSection`/
  `buildVerticalJsonLd` the same way the template route already does.
- **Source/trust signal** — evidenced in 3 different vertical-specific forms (MER_01 provenance,
  MBTI_05 methodology, EDU_04 update date) — proposed as one small optional `SourceInfo` structure
  below, not a forced field.
- **FAQ** — evidenced only on MBTI_05 (1 of 12 selected pages across all 3 verticals). Per the "only
  fields with multi-page or clear-intent evidence" rule, this is **not** proposed as a required or
  default-rendered field — proposed only as an optional, per-template, evidence-gated slot.

---

## Proposed schema shape

Design-only pseudo-TypeScript. Everything marked `NEW` is additive; nothing existing is renamed or
removed.

```ts
// lib/vertical_schema.ts — PROPOSED v2 shape (not implemented)

export type VerticalId = "education" | "mbti" | "merch";
// NOTE: "ecommerce" / "culture" intentionally NOT added — deferred to a future round's research
// (see VERTICAL_CONTENT_PROFESSIONALISM_PHASE1_REPORT.md "Ecommerce status"). Do not add these
// members speculatively; the v1 doc's already-drifted 5-member union (doc line 185) is the
// cautionary example of listing a vertical before it has real research or code behind it.

export interface AttributeDef {
  key: string;
  label: string;              // unchanged — literal fallback string
  labelKey?: string;          // NEW — messages/<locale>/nano.json key, e.g. "vertical.education.grade_band.label"
                               // if present, render() prefers the localized value; falls back to `label`
                               // when the key is missing for a locale. Fixes audit Q24 without breaking
                               // any existing AttributeDef that only has `label`.
  facet?: boolean;             // unchanged, still inert until faceted browse is built (not this round's scope)
  taxonomyAxis?: string;       // unchanged, still inert (not this round's scope)
}

export interface KnowledgeSlotDef {
  key: string;
  label: string;
  labelKey?: string;          // NEW — same i18n fallback pattern as AttributeDef
  summarizable?: boolean;      // NEW — marks a slot safe to auto-truncate to 1-2 lines for the example
                               // page's knowledge SUMMARY (per Framework §D — never paste full prose
                               // onto every example, duplicate-content risk). Defaults to false; a
                               // human still authors the full text, this flag only controls whether an
                               // automatic truncation is allowed to run against it.
}

// NEW — evidenced independently by all 3 verticals' Pattern docs. Describes a RELATIONSHIP between
// pages, not a value ON one page — deliberately separate from AttributeDef/KnowledgeSlotDef.
export interface RelatedContentSlotDef {
  key: string;                 // e.g. "related_type" (MBTI), "related_worksheets" (Education), "related_products" (Merch)
  label: string;
  labelKey?: string;
  relationBasis: "shared_attribute" | "same_theme" | "same_template_family";
  attributeKey?: string;       // required when relationBasis = "shared_attribute", e.g. "type_code"
  minItems?: number;           // module hides entirely below this count — no empty-box rendering
  maxItems?: number;
}

// NEW — optional, evidence-gated. Only MBTI_05 (of 12 selected pages) showed this pattern; do not
// wire this to auto-generate content. A template with no faq[] entries simply renders no FAQ block.
export interface FaqSlotDef {
  key: string;
  question: string;            // authored per template
  answer: string;               // authored per template
}

// NEW — optional. Covers 3 different vertical-flavored trust signals found in evidence; a template
// populates only the field(s) that are true and relevant to it. Never auto-fill with a generic claim.
export interface SourceInfo {
  lastUpdated?: string;         // ISO date — Education freshness signal (EDU_04 pattern)
  methodologyNote?: string;     // MBTI-style "how this was determined" explanation (MBTI_05 pattern)
  provenanceNote?: string;      // Merch-style short trust/story line (MER_01 pattern) — must be a true
                                 // statement about the template/product, never fabricated
}

export interface VerticalSchema {
  id: VerticalId;
  label: string;
  schemaOrgType: string;
  attributes: AttributeDef[];
  knowledgeSlots: KnowledgeSlotDef[];
  relatedContent?: RelatedContentSlotDef[];  // NEW, optional — omit for verticals/templates with no candidate siblings yet
  faq?: FaqSlotDef[];                         // NEW, optional
  topicMatch: string[];
}
```

### Per-page resolved data (extends, not replaces, `ResolvedVerticalPage`)

```ts
// lib/nano_seo_utils.ts — PROPOSED extension (not implemented)
export type ResolvedVerticalPage = {
  schema: VerticalSchema;
  attributes: { key: string; label: string; value: string; facet: boolean }[]; // unchanged
  knowledge: { key: string; label: string; text: string }[];                    // unchanged
  relatedItems?: { key: string; label: string; items: { title: string; url: string }[] }[]; // NEW
  faq?: { question: string; answer: string }[];                                 // NEW
  source?: SourceInfo;                                                          // NEW
};
```

### Structured-data mapping (extends `buildVerticalJsonLd`)

| New field | schema.org mapping |
|---|---|
| `relatedContent` | Not itself a schema.org property — feeds the page's internal-link HTML, optionally an `ItemList` if a future iteration wants it machine-readable |
| `faq` | `FAQPage` / `mainEntity: Question[]` with `acceptedAnswer: Answer`, emitted as a **separate** JSON-LD block only when `faq[]` is non-empty |
| `source.lastUpdated` | `dateModified` |
| `source.methodologyNote` | No direct schema.org property — rendered as visible page text only (matches MBTI_05's pattern, which is prose, not markup) |
| `source.provenanceNote` | No direct schema.org property — rendered as visible page text only |

### Optionality rules

- `attributes`, `knowledgeSlots`, `topicMatch` — unchanged, still required per vertical (existing v1 rule).
- `relatedContent`, `faq`, `source` — all optional at the schema level; additionally, each is
  **evidence-gated at the render level**: `relatedContent` hides below `minItems`, `faq` renders nothing
  when empty, `source` renders only the sub-fields that are populated.
- `labelKey`/`summarizable` — both optional, additive-only; any v1 `AttributeDef`/`KnowledgeSlotDef`
  without them behaves exactly as it does today.

### Validation rules

- `resolveVerticalSections()` keeps its existing null-return behavior (audit line
  `lib/nano_seo_utils.ts:436`) when attributes and knowledge are both empty — unchanged.
- A `relatedContent` slot with `relationBasis: "shared_attribute"` MUST set `attributeKey`, and that key
  MUST exist in the same schema's `attributes[]` — a slot referencing a non-existent attribute key
  should fail validation at authoring time, not render a broken/empty module silently.
- `faq[]` entries are authored, not synthesized — no code path should auto-generate a `question`/`answer`
  pair from other fields.
- `source.provenanceNote`/`methodologyNote` should only be populated with a verifiably true statement
  about that specific template — same evidence-integrity principle this whole research round follows
  ("不得编造竞品页面内容" extends naturally to "don't fabricate Curify's own trust copy either").

---

## Backward compatibility

- **v1 data continues to work unchanged.** The HSK pilot's `content.attributes`/`content.vertical`
  entries in `messages/{en,zh}/nano.json` use only `key`→`value` maps that match existing
  `AttributeDef.key`/`KnowledgeSlotDef.key` values — nothing in the v2 proposal renames or restructures
  those keys, so the HSK page keeps rendering exactly as it does today with zero changes.
- **Missing vertical data still falls back safely.** Every new field (`relatedContent`, `faq`, `source`,
  `labelKey`, `summarizable`) is optional; a template with none of them authored resolves and renders
  exactly like a v1-only template — same null-safe pattern already proven by `VerticalAttributeChips`/
  `VerticalKnowledgeSection`'s existing no-op guards.
- **No forced all-at-once completion.** Because every v2 addition is optional and evidence-gated, a
  template can ship with just attributes+knowledge (today's v1 shape) and pick up `relatedContent`/
  `faq`/`source` later without a migration step — consistent with the existing design doc's "Phase 1 —
  do NOT batch-generate" principle.
- **Pilot-by-pilot rollout.** The existing rollout method (hand-enrich a small confirmed cohort, measure,
  then decide — design doc "Pilot plan" + "Pilot cohort — GSC-mined") is unchanged by this proposal; see
  `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md` for which real templates are recommended as the next cohort.
