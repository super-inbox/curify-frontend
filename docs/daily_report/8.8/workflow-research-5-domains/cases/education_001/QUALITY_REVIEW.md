# QUALITY_REVIEW — education_001

## Self-check: workflow_extraction.json vs evidence_manifest.csv
- All 8 steps (step_01–step_08) cite evidence_ids among EV01–EV10; every cited evidence_id
  has support_level = DIRECT in evidence_manifest.csv, and every step's evidence_status is
  EXTERNAL_SOURCE_CONFIRMED.
- EV11, EV13, EV14 (memory-capacity/repetition claims, TPR methodology, self-developed
  content strategy + stated weaknesses) have step_id left blank and are not cited in any
  workflow_steps.evidence_ids array — they support `professional_constraints` and
  `production_or_delivery_requirements`/`source_limitations` narrative fields instead,
  which is correct since these are product-level claims, not single-step claims.
- EV12 (learning report) is PARTIAL support and is cited only in `final_outputs`, not in
  `workflow_steps` — correct, since the source gives no reconstructable process detail for
  it, only its existence/purpose.
- EV15, EV16 (backup B1 candidates EDU-02/EDU-03) are NONE support with step_id "none" —
  correctly not cited anywhere in workflow_extraction.json; retained only for
  selection-rationale documentation.
- No step's EXTERNAL_SOURCE_CONFIRMED status rests on a NONE or PARTIAL-only evidence row.

## Checks

**Unsupported steps:** None found. All 8 steps trace to a quote or close paraphrase from a
specifically numbered component under the article's "一、拆解还原" section, independently
re-verified via WebFetch on 2026-08-09 (a fourth pass, on top of three original B2-build
passes) during this recovery session.

**Inferred causal ordering:** This case carries the most order-related caveats of the
five domains, and they are disclosed rather than smoothed over:
1. The 8 components are presented in a numbered list (1-8) in the source, which is used
   as the base ordering — this is source-declared list order, not inferred from images.
2. However, the *intra-day* placement of Word Cards (step_02), Quiz (step_04), and Zebra
   Call (step_05) relative to each other is not established by explicit "then/next"
   language in the source — only by their position in the article's own list. This is
   flagged as MEDIUM confidence in both workflow_extraction.json and CASE_SUMMARY.md, not
   silently presented as HIGH.
3. There is a genuine internal inconsistency in the source itself: its stated overall
   weekly cadence ("first 3 days new content, last 2 days review") does not cleanly
   reconcile with day-specific labels given elsewhere (Video/Story&Speaking explicitly
   Monday-Thursday = 4 days; TV Live Class explicitly Friday). The "review day" content
   (day 5+) is never described anywhere in the article. This is documented as a
   source-side inconsistency in `source_limitations`, not resolved by invention of
   unstated content.
No image-sequence-as-process fallacy applies here — this source has no meaningful image
evidence retrieved via WebFetch (text-only extraction); ordering is based entirely on
textual list position and stated day-labels.

**Missing source evidence:** None of the 8 steps lack a citation. The evidence/ directory
and evidence_manifest.csv were both entirely missing on recovery inspection (the greatest
gap among the 5 domains); both have now been built from actual quoted content,
cross-checked against a fresh 2026-08-09 WebFetch pass performed during this recovery
session.

**Duplicate steps:** None. The 8 steps are topically distinct (video story, word cards,
picture-book reading, quiz, teacher call, WeChat teacher video, WeChat homework, Friday
live class) with no overlapping content.

**Professional-rule hallucination:** Checked each non-null `professional_rule`:
- step_01 (story-format matches children's narrative cognition) — grounded in the source's
  explicit framing of the video as a connected story arc integrating life-knowledge/values.
  OK.
- step_03 (re-contextualization + read-then-follow-read sequence) — directly grounded in
  the "Story & Speaking" description. OK.
- step_04 (multi-dimensional testing of one knowledge point) — directly quoted. OK.
- step_05 (Zebra Call as a post-introduction review checkpoint) — directly grounded in the
  "reviewing today's vocabulary" framing. OK.
- step_07 (real-object anchoring + human feedback) — directly grounded in the WeChat
  homework description. OK.
- step_02, step_06, step_08 — professional_rule is null; the source describes these
  components without stating an underlying design rationale specific to them, so null is
  correct rather than fabricated.

**Inaccessible evidence:** None. The source URL was fetched successfully across four total
independent passes (three original + one during this recovery), returning substantive,
consistent content each time, including one additional confirmed detail (L2-level content
density figures) on the most recent pass. access_status in source_metadata.json is
ACCESSIBLE.

**Is this a true workflow vs. a final-output gallery, AND does it actually show
production process:** This is the central question for this case and is answered
honestly rather than glossed over. The source is **not** a production/manufacturing
workflow in the same sense as merch_001, ecommerce_001, packaging_001, or brand_logo_001
— it does not document how Zebra's content team builds a weekly unit. It documents the
**structure and sequence of content-item types** a learner receives each week. This is
disclosed as the single most important limitation of this case, prominently, in
source_metadata.json, workflow_extraction.json, and CASE_SUMMARY.md. It is retained as
the domain's formal case (rather than falling back to EDU-02 or EDU-03) because:
(a) it is a near-exact structural match to Curify's own recorded education baseline
(story -> word cards -> reading -> quiz -> review), making the content-type sequence
itself directly relevant to what Curify's education workflow needs to produce; (b) EDU-02
is a narrower single-pattern internship exercise, not a shipped product; (c) EDU-03 is
generic with no single example project's input/process/output shown. Given the choice
among three real B1-vetted candidates, none of which is an internal-production account,
EDU-01 has the strongest evidence density and clearest content-type sequence, and its
limitation is disclosed rather than concealed.

## Residual risk / caveats
- **Primary limitation:** documents learner-facing content delivery, not internal
  production/教研 process. Explicitly flagged everywhere in this case's files.
- Third-party analyst commentary, not an official first-party Zebra/Zuoyebang account;
  source_authority capped at 1/2.
- Intra-day micro-ordering (Word Cards/Quiz/Zebra Call) is MEDIUM confidence, not HIGH.
- Internal inconsistency in the source's own stated cadence vs. day-specific labels;
  "review day" content is never described.
- No sketches, drafts, or production-stage imagery of any kind — text-only source.

## Final rating

**PARTIAL**

Rationale: 8 of 8 steps are EXTERNAL_SOURCE_CONFIRMED with DIRECT evidence, professional
constraints are concretely quoted (memory-capacity science, repetition targets, TPR
methodology), and the source is genuinely accessible and independently re-verified across
four fetch passes. This case is rated one tier below the other four domains'
SUBSTANTIAL rating specifically because — unlike merch_001, ecommerce_001, packaging_001,
and brand_logo_001 — the underlying source does not document an internal production
process at all, only a learner-facing content-delivery structure; this is a materially
different (and weaker, for gap-analysis purposes) kind of evidence than "how was this
made," even though step-level evidence quality is otherwise strong. Still usable for B3
as a content-structure/sequence reference, but the B3 gap analysis should treat this
domain's "workflow" as content-type sequencing rather than a producer's step-by-step
process, and should weigh this case's professional constraints more heavily than its
step ordering.
