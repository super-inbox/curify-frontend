# Vertical Page Common Framework v2 — MBTI / Education / Merch

**research_run_id:** vertical-content-professionalism-research-v2-run2
**source:** synthesizes `MBTI_COMPETITOR_PATTERN.md`, `EDUCATION_COMPETITOR_PATTERN.md`,
`MERCH_COMPETITOR_PATTERN.md`, and `CURRENT_IMPLEMENTATION_AUDIT.md`. Design recommendation only — no
code changed to produce this document.

**Goal:** one shared page container that can host three structurally different verticals' professional
content, without forcing MBTI/Education/Merch into a single generic shape (§十六 item 7 of the boss
brief: don't treat all pages as one page type).

---

## A. Common universal modules

Modules that appeared, in some form, across **at least two** of the three verticals' selected evidence
— or that are structural requirements independent of any one vertical (breadcrumb, H1, CTA).

| Module | Evidence basis | Notes |
|---|---|---|
| Breadcrumb | EDU_01, EDU_04, EDU_06 (explicit); implied wayfinding on MBTI_01/MER_01 category pages | Confirmed **missing** on Curify's template page today (sr-only topic chip only, not a visible breadcrumb — `page.tsx:198-203`) |
| H1 + concise summary | All 12 selected pages across all 3 verticals | Curify already has this (`h1`, `intro` in `page.tsx`) |
| Creation preview / gallery | Structural equivalent of MBTI_01/MER_05/MER_06's card grids and MER_04's sheet preview | Curify already has this (`nano_inspiration.json` grid, per `docs/vertical-page-schema-v1.md` Pillar 3) |
| Reproduction / Generate CTA | Structural equivalent of MBTI_02/MER_01's buy CTA, MER_04's install CTA | Curify already has this (`ReproduceTemplateSection`, per design doc Pillar 4) |
| About this template/example (knowledge block) | MBTI_04/MBTI_05 segmented blocks; EDU_02/EDU_04 topic depth; MER_01 cultural story | Curify has the **code** (`VerticalKnowledgeSection`) but **zero authored content** for MBTI/Merch, 1 template for Education |
| Related content / internal linking | Confirmed as a repeated pattern independently in **all three** Pattern docs (MBTI §3, Education §3, Merch §3) | The single strongest cross-vertical finding — and confirmed **missing** as a dedicated module in Curify's current template/example code (only a generic sr-only topic-chip link) |
| Structured attribute chip strip | MBTI type_code (MBTI_01/02/04/05), Merch material/product-type framing (MER_01/04) | Curify already has this **built and wired**, unused for MBTI/Merch, used for 1 Education template (`VerticalAttributeChips`) |
| Structured data (JSON-LD) | Implicit in every selected page's rich-result eligibility (ratings, `Product`, `LearningResource`-equivalent markup) | Curify already has this **built and wired** on the template page (`buildVerticalJsonLd`), **absent on every example page** (audit Q16) — the single biggest structured-data gap |
| FAQ | Strongly evidenced only on MBTI_05; not confirmed on any Education or Merch selected page | **Conditional**, not universal — see §C. Do not add a FAQ block to every page type by default |
| Source / update / trust signal | MER_01 (Made-in-USA, nonprofit trust badges), MBTI_05 (scoring methodology), EDU_04 (publish/update dates) | Present in 3 different forms across 3 verticals — treat as a **conditional, vertical-flavored** module (see §C), not one fixed component |

## B. Vertical-specific modules

Derived strictly from each vertical's Pattern doc §3/§6 — not invented beyond that evidence.

### MBTI modules
- Type-code attribute (already schema'd: `type_code`, `type_nickname`, `dimensions` — `lib/vertical_schema.ts:75-77`)
- Traits / strengths / weaknesses / communication / relationships / career knowledge slots (already schema'd)
- Compatibility **summary** (short authored text using the existing `compatibility` slot — not a full matrix; see MBTI Pattern §6 P1)
- Related-type / related-character internal-linking module (net-new)

### Education modules
- Learning objective / includes / background knowledge slots (already schema'd, proven on the HSK pilot)
- Grade/age/subject/skill/resource-type/duration/difficulty/language-mode attribute chips (already schema'd, proven on the HSK pilot)
- Same-page "browse related worksheets/resources within this topic" grid (net-new — modeled on EDU_01/EDU_06)

### Merch modules
- Product-type / material / process / dimensions / print-spec / color-profile / use-case attribute chips (already schema'd)
- Cultural background (design story) knowledge slot (already schema'd — highest-leverage per MER_01 evidence)
- Design-requirements / manufacturing-notes knowledge slots (already schema'd)
- Related-product / same-family internal-linking module (net-new)

## C. Conditional modules

| Module | Required / Recommended / Optional | Render condition |
|---|---|---|
| Attribute chip strip | Recommended | Only when `resolveVerticalSections()` returns ≥1 non-empty attribute — this is already the existing no-op behavior (`VerticalAttributeChips` returns `null` on empty, `VerticalKnowledge.tsx:16`) |
| Knowledge section | Recommended | Only when ≥1 knowledge slot has authored text — already the existing no-op behavior (`VerticalKnowledgeSection`, `VerticalKnowledge.tsx:37`) |
| Compatibility summary (MBTI) | Optional | Only for MBTI-vertical templates with an authored `compatibility` value; never render an empty section |
| Related-content module | Required once authored templates exist in a family | Should degrade gracefully (hide, not show an empty box) when fewer than ~2 siblings exist in the same theme/topic |
| FAQ | Optional | Only where genuine long-tail questions have been authored (evidenced by MBTI_05 only) — do not auto-generate generic FAQ content to fill the slot |
| Trust/source/update signal | Optional, vertical-flavored | Education: last-updated date if content is periodically revised; Merch: a short provenance/story line (not a fabricated manufacturing claim); MBTI: none currently justified by evidence — do not add a trust badge with nothing behind it |
| Breadcrumb | Required | Structural navigation element, not content-dependent — should render on every template and example page regardless of vertical |
| Structured data (JSON-LD) | Required whenever any vertical content is resolved | Follows the existing `resolveVerticalSections()` null-safety: no vertical data → no vertical JSON-LD (current template-page behavior); should be extended to the example page (currently entirely absent, audit Q16) |

## D. Template page vs. Example page

This split already exists as a design decision in `docs/vertical-page-schema-v1.md` ("Which level: template vs example") and is **confirmed still correct** by this round's competitor evidence — MBTI_01's collection-page pattern (many entities, each a spoke) and MER_05/MER_06's marketplace-grid pattern (many products, each a card) both mirror a hub-with-many-spokes shape, not a single flat page.

**Template Page (hub) is responsible for:**
- Category/format overview — "what this template type is" (the umbrella, not one instance)
- Reusable professional knowledge — the knowledge slots that are identical across all of a template's
  examples (traits/strengths for an MBTI type; learning objective for a worksheet format; cultural
  background/material for a merch product type)
- Creation intent — the Generate CTA and creation-preview gallery
- Examples/gallery — the horizontal asset layer (existing `nano_inspiration.json` grid)
- Vertical knowledge — the full `VerticalKnowledgeSection` (all slots, full prose)
- FAQ (where genuinely authored)
- Related templates — links across sibling templates in the same vertical/theme

**Example Page (spoke) is responsible for:**
- Specific artifact/entity context — the one character, one worksheet instance, one product variant
  this example actually shows
- Generated result — the rendered image/output itself
- Specific explanation — a **short knowledge summary** (1–2 lines), not the full template-level prose
  (per the design doc's explicit dup-content warning: pasting full knowledge prose onto every example
  would create near-duplicate pages, which is a real SEO risk, not just an inefficiency)
- Attributes/specifications — **per-example** attribute values (a specific MBTI type instance, a
  specific worksheet's grade/skill combination) via the not-yet-built `deriveExampleAttributes`
  projection (audit Q17-18) rather than hand-authored per example
- Related examples — siblings within the same template family
- Route back to template/category — the breadcrumb and an explicit "back to [template]" link, so the
  spoke never dead-ends without a path to the hub

**What this avoids:** per the design doc's own math (85% of impressions land on example pages, 10× more
example URLs than template URLs), a framework that only enriches the hub captures ~15% of the
opportunity. But copying the *full* template-level knowledge prose onto every example is the wrong fix
— it risks duplicate-content devaluation across thousands of near-identical pages. The correct
division, confirmed rather than contradicted by this round's evidence (no selected competitor page
repeated its own parent category's full prose verbatim on every child page), is: **author once at the
template level, derive+summarize per example.**
