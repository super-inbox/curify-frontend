# B3 Workflow Research Findings — Research-Level Conclusion

This is the research-level synthesis of the B3 gap analysis (see
`WORKFLOW_GAP_MATRIX.csv` for row-level detail and
`CURIFY_WORKFLOW_RECOMMENDATIONS.md` for per-domain product recommendations).
It answers the eight research questions the task poses directly.

---

## What did we learn from each industry?

- **Merch** (independent illustrator, Singapore, campus-architecture goods):
  the deepest and most operationally complete of the five external cases (12
  steps spanning reference gathering through ongoing shop operations). Most
  of its depth — manufacturer sampling, legal clearance, pricing, physical
  QC, logistics — belongs to a small business's supply-chain and retail
  operations, not to creative-asset generation, and is out of scope for
  Curify by design, not by gap. The one directly transferable lesson is that
  per-product-format recomposition is a real, professionally necessary step,
  not an aesthetic nicety.
- **Ecommerce** (Meitu Design Studio vendor tutorial, China): the shortest
  external case (5 steps) but the tightest fit to Curify's own stated
  product. It independently validates Curify's exact starting premise (one
  ordinary phone photo) and end-state (a complete, ready-to-sell page), and
  supplies the single most concrete, checkable structural requirement found
  anywhere in this research (a 7-image/4-category/composition ruleset).
- **Education** (third-party analysis of Zebra AI Class, China): confirmed
  as PARTIAL evidence from the start of B2, and that limitation held up
  under B3 scrutiny — this source describes what a *learner* experiences
  each week, not how Zebra's team *produces* that experience. It still
  yielded real value: two direct step-name/content matches to Curify's own
  baseline (story, word cards) and three well-quoted pedagogical principles
  (multi-dimensional quiz testing, cognitive-load ceiling, repetition
  targets) that are usable as content-design guidelines independent of the
  production-process question.
- **Brand/Logo** (Behance portfolio case study, Canada Life rebrand): a
  real, well-evidenced external workflow, but B3's comparison against it is
  structurally limited — Curify's own current brand_logo baseline is
  entirely unrecorded (the manager referenced an external five-step process
  without restating it). The research value here is in the external
  patterns themselves (persona-driven variation, one-identity-to-many-
  formats, localization-as-adaptation), offered as verification priorities
  rather than confirmed gaps.
- **Packaging** (Catalpha agency blog, pet-grooming product): same
  structural limitation as brand_logo (Curify's current baseline is fully
  unknown, this time by explicit instruction not to invent one). The
  standout finding is that packaging fundamentally needs a different *input
  modality* (physical measurements) than the single-flat-photo pattern
  every other domain shares, and that the dieline-vs-visual-render question
  is a genuine fork in what "packaging support" would even mean for Curify.

## What professional knowledge was genuinely new?

Ranked by how directly it maps onto an AI-generation workflow node:

1. **Ecommerce structured image-suite ruleset** (≥7 images, 4 categories,
   3:4 ratio, ≥60% product-body, mandatory white-background) — concrete,
   checkable, and immediately encodable as a generation/validation template.
2. **Ecommerce selling-point → consumer-benefit-language translation** —
   a well-evidenced input-structuring transformation.
3. **Merch legal/trademark/copyright clearance for derivative IP** — new
   professional-necessity knowledge with no analog anywhere in the current
   baseline, though it's a policy/guardrail feature rather than a generation
   step.
4. **Education's three pedagogical principles** (multi-dimensional quiz
   testing, cognitive-load ceiling, repetition-cycling target) — genuinely
   new content-design guidelines, though EDU-01's PARTIAL status means they
   should inform design guidelines rather than justify new production steps.
5. **Two cross-domain patterns independently corroborated across three
   unrelated sources**: "one asset → many correctly-adapted formats" (merch,
   brand_logo, packaging) and "generate N concept variants scored against
   named criteria" (packaging, echoed in brand_logo's persona work). These
   are the strongest-evidenced findings in the whole research pass precisely
   *because* they appeared independently in unrelated industries and
   sources, not because any single source was unusually strong.

## What merely validated the manager's existing direction?

- Merch's per-SKU-format recomposition finding (step_03) — corroborates,
  does not discover, the manager-confirmed "disconnected-element handling"
  capability.
- Ecommerce's phone-photo-in / ready-to-sell-page-out framing (steps 1 and
  5) — an almost exact match to Curify's own video narration, from an
  independently-sourced commercial vendor tool.
- Education's story and word-cards steps — direct name/content matches to
  Curify's existing baseline steps.

None of these should be re-described as "newly discovered gaps." They are
independent confirmation that three separate parts of Curify's stated
direction are professionally sound, which is valuable in its own right and
is called out explicitly in the recommendations document rather than
folded into the gap list.

## Which current workflows appear mature?

None can be called "mature" on the evidence available to this task — B3's
inputs establish *what Curify says it does* (video framing, manager
statements) but not *how completely it does it* (no repository/code
inspection occurred in this research). The closest to a defensible "mature
direction" statement is **ecommerce**, where the external evidence lines up
with the stated video framing on both ends of the pipeline (input and
output) and the stated feature list (listing/detail pages, product
parameters, holiday campaigns) already covers every category the external
source touches, even though implementation completeness within those
categories is unverified.

## Which areas remain shallow/unknown?

**Brand/Logo and Packaging are both structurally shallow in this research**,
by construction of the available evidence rather than a shortfall in this
task: Brand/Logo's current baseline is an unrecorded five-step process, and
Packaging's current baseline was explicitly never established at all. Every
row in both domains' gap-matrix sections is `UNKNOWN_CURRENT_STATE`, and no
row in either domain is scored `MISSING` or `CURRENTLY_SUPPORTED`. Any
future B-phase work on these two domains should treat "recover/establish
the current baseline" as a precondition, not a parallel task.

## Which external workflow patterns are most reusable?

The two cross-domain patterns flagged above are the most reusable, precisely
*because* reusability is what makes them cross-domain in the first place:

1. **One asset → many correctly-adapted formats** (not mechanical
   crop/resize) — evidenced independently in merch (postcard/phone-case/
   badge/magnet recomposition), brand_logo (brochure/kit/die-cut/poster
   applications), and packaging (the underlying multi-application need
   behind dieline + final-artwork production). A single, well-built
   "format-aware recomposition" capability could serve all three domains
   at once.
2. **Generate N concept variants, each scored against named criteria** —
   evidenced in packaging (4 concepts vs. 3 named goals: shelf impact,
   clear communication, brand consistency) and echoed in brand_logo's
   persona-driven creative-variation pattern. This is a generically valuable,
   highly AI-compatible pattern (structured multi-variant generation +
   explicit scoring criteria) that is not tied to any one domain's subject
   matter.

## Which findings are strong enough to feed Curify now?

Per the priority table in `CURIFY_WORKFLOW_RECOMMENDATIONS.md`:
- The ecommerce image-suite ruleset and selling-point-translation stage
  (both P1) are strong enough to move into product scoping now — HIGH
  evidence strength, a confirmed parent feature to extend, and high scores
  across all six recommendation criteria.
- Education's multi-dimensional quiz-structuring principle (P1) is strong
  enough to inform the existing "quiz" step's design, with the caveat that
  it is a content-design guideline drawn from a PARTIAL source, not a
  production-process mandate.
- Nothing from Brand/Logo or Packaging is strong enough to "feed Curify now"
  in the sense of an implementation-ready recommendation — both domains'
  strongest findings are verification priorities, not build priorities,
  because there is no current baseline to build "on top of" yet.

## Which require better sources or current-product verification?

- **Education**: any recommendation touching internal production process
  (team structure, timeline, QA) requires a source that actually documents
  Zebra's (or a comparable product's) internal 教研 pipeline — EDU-01
  explicitly does not cover this and should not be stretched further.
- **Brand/Logo**: requires recovering or re-documenting the manager-
  referenced five-step process before any external-vs-current comparison is
  possible. Until then, "verify whether X already exists" is the only
  responsible framing for every finding in this domain.
- **Packaging**: requires a direct product-scoping answer to one question —
  is Curify's packaging output meant to be a production-ready dieline or a
  visual render? — before any of PACK-02's findings can be triaged into
  ADD/MODIFY/IGNORE with confidence. This is flagged as the single highest-
  leverage next step across both under-documented domains.
- **Merch and Ecommerce**: the remaining open question in both domains is
  implementation verification, not further external research — i.e.,
  confirming what the current codebase actually does with the
  manager-confirmed capabilities (CMYK/bleed/dpi handling; product-
  parameters structuring), which is a repository-inspection task, not a
  workflow-research task.

---

## Summary

This research did not surface a large number of confident new build
recommendations, and that is the correct outcome given the evidence
available, not a weak result. Two domains (ecommerce, and to a lesser
extent merch) had strong enough current-baseline evidence to support
concrete, scoped recommendations. Two domains (brand_logo, packaging) had
essentially no current-baseline evidence at all, so the responsible output
was a prioritized verification list rather than invented gaps. One domain
(education) had a source with a clearly disclosed limitation (learner-facing
delivery, not internal production) that this research deliberately did not
paper over, yielding a smaller but more trustworthy set of findings than a
less careful pass would have produced. The two cross-domain patterns that
emerged independently across unrelated sources are, by a wide margin, the
most defensible "new knowledge" this research produced.
