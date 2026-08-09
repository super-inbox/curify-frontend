# Curify Workflow Recommendations — B3 Gap Analysis

Answers the manager's core question — "Can these external professional
creative workflows feed back into and improve Curify's current workflows?"
— domain by domain, using the B2 formal external-workflow evidence
(`FORMAL_WORKFLOW_INDEX.csv`, `B2_FORMAL_WORKFLOW_FINDINGS.md`, and all five
`cases/*/workflow_extraction.json` files) compared against the current Curify
baseline (`CURRENT_CURIFY_WORKFLOW_BASELINE.md`). Full row-level detail and
scoring is in `WORKFLOW_GAP_MATRIX.csv`; this document synthesizes it into
narrative recommendations.

**Evidence-class discipline used throughout:** `VIDEO_CONFIRMED` and
`MANAGER_MEETING_CONFIRMED` are the only sources for "this is Curify's
current/planned direction" claims. `EXTERNAL_SOURCE_CONFIRMED` (from B2) is
the only source for "this is what a real external professional workflow
does." A recommendation is never justified by demo value alone, and
"current support unknown" is never rewritten as "missing."

---

## MERCH

### 1. Current known Curify workflow
`VIDEO_CONFIRMED`: single character/IP → 9 expressions → sticker pack →
merchandise applications ("One character → a full merch pack").
`MANAGER_MEETING_CONFIRMED`: print-ready sticker files, CMYK, ~3mm bleed,
600dpi, handling of disconnected visual elements, physical
printing/merchandise production.

### 2. External professional workflow
MERCH-01 (zcool.com.cn, SUBSTANTIAL, 12 steps, `merch_001`): an independent
illustrator's full journey from campus-building reference photography
through illustration production, per-SKU-format recomposition, packaging,
manufacturer sampling, legal clearance, pricing, incoming QC, listing
photography, marketing sequencing, delivery logistics, and ongoing shop
operations.

### 3. Confirmed overlap
Step_03 (per-SKU-format recomposition — postcard/phone-case/badge/magnet
each require dedicated recomposition, not mechanical resize) directly
corroborates the manager-confirmed "handling of disconnected visual
elements" capability. This is the one area where external and current
knowledge line up cleanly.

### 4. New professional knowledge
Two genuinely new findings not present in any current baseline evidence:
- **Legal/trademark/copyright clearance** (step_06): fan-made/derivative
  merch referencing real institutions must avoid registered trademarks and
  names entirely (not just literal logos), and must account for
  image/portrait rights on specific source material. Directly relevant to
  Curify's character/IP → merch use case.
- **Checkable defect-category QC discipline** (step_08): physical QC aside,
  the professional principle of defining specific, named, checkable
  defect/validation categories (rather than an unstructured check) is a
  transferable idea for a pre-export digital "preflight" check.

### 5. Confirmed gaps
None classified as outright `MISSING`. No baseline evidence (video or
manager-confirmed) mentions any IP/trademark-risk guidance anywhere in
Curify's stated merch workflow, and the external source establishes this as
a real, recurring professional constraint for exactly Curify's stated use
case (character/IP-derived merch) — but silence in the baseline is not
evidence of absence, so this is scored `UNKNOWN_CURRENT_STATE` (see section
6) rather than `MISSING`, consistent with every other domain in this
analysis.

### 6. Unknown-current-state areas
Whether the manager-confirmed "handling of disconnected visual elements"
capability already covers full per-SKU-format recomposition (vs. a narrower
interpretation) is unverified. Whether CMYK/bleed/dpi validation already
includes structured, named defect-category checks is unverified. Whether
Curify surfaces any IP/trademark-risk guidance for character/IP-derived
merch is also unverified — the baseline is silent on this topic in both
directions.

### 7. Recommended changes
- **RESEARCH_FURTHER**: should Curify surface IP/trademark-risk guidance
  (e.g., a disclaimer or risk flag) when generating derivative merch from a
  character/IP the user may not own outright? Professionally necessary and
  highly repeatable, but a product-policy question, not a pure
  workflow-engineering one — low demo value, so not fast-tracked purely on
  novelty.
- **MODIFY (low priority)**: consider extending the confirmed print-file
  validation feature set (CMYK/bleed/dpi/disconnected-elements) with named,
  checkable categories analogous to the external QC taxonomy, as a "digital
  preflight" concept.

### 8. Things NOT recommended
Steps 01, 02, 04, 05, 07, 09, 10, 11, 12 (reference gathering, manual
illustration tooling, MOQ/packaging workarounds, vendor sampling, pricing
strategy, product photography of manufactured stock, promotion-timing rules,
delivery logistics, ongoing shop operations) are **not recommended** for any
Curify workflow change. These describe an independent seller's supply-chain
and retail-operations business, not creative-asset generation — importing
them would add scope Curify's product surface was never intended to cover.

### 9. Evidence limitations
MERCH-01 is a single first-person account; figures (defect rates, costs,
MOQ numbers) are self-reported and not independently corroborated. No
embedded images were retrieved, so illustration-stage claims rest on text
description only.

### 10. Product implication
Merch's strongest B3 finding is a **validation**, not a discovery: the
manager's already-stated "disconnected-element handling" direction is
professionally sound and independently corroborated. The one real net-new
idea (IP/trademark guardrails) is worth a product-policy conversation but is
not a workflow-engineering priority.

---

## ECOMMERCE

### 1. Current known Curify workflow
`VIDEO_CONFIRMED`: one ordinary product phone photo → professional product
ad → lifestyle shots → ready-to-sell product presentation → whole campaign.
`MANAGER_MEETING_CONFIRMED`: listing/detail pages, product parameters,
holiday campaign assets (Halloween, Valentine's Day), virtual try-on, makeup
try-on.

### 2. External professional workflow
ECOM-01 (Meitu Design Studio / designkit.cn, SUBSTANTIAL, 5 steps,
`ecommerce_001`): raw phone-photo intake → selling-point instruction input →
style selection (4 defined directions) → structured multi-category image-suite
generation → final generation and page placement, producing a complete Tmall
detail page.

### 3. Confirmed overlap
Step_1 (ordinary phone photo as sufficient starting input, no studio
photography required) and step_5 (final assets assembled into a complete
page) both **directly match** Curify's own stated video framing almost
word-for-word ("1 photo → a pro ad," "ready to sell"). This is the strongest
overlap of any domain in this analysis — an independent commercial vendor
tool validates the exact same starting premise and end-state Curify already
claims.

### 4. New professional knowledge
- **Selling-point → consumer-benefit-language translation** (step_2): raw
  product attributes should be explicitly translated into consumer-facing
  benefit language before generation (e.g., "food-grade" → safety concern,
  "lightweight" → hiking pain point), not passed through as raw specs.
- **Structured image-suite composition ruleset** (step_4): a genuinely
  complete detail page requires a minimum of 7 images across 4 defined
  categories (white-background, scene, selling-point close-up, comparison),
  with explicit composition rules — mandatory white-background shot, ≥60%
  product-body composition, 3:4 vertical ratio for mobile. This is the most
  concrete, checkable, professionally-grounded finding in the entire B2
  corpus.

### 5. Confirmed gaps
None classified as outright `MISSING` — in every case a parent capability
(`product parameters`, `listing/detail pages`, holiday-campaign styling) is
already manager-confirmed to exist, so gaps here are scoped as **enhancements
to known features**, not claims of absent capability.

### 6. Unknown-current-state areas
Whether an explicit benefit-language-translation step already exists inside
current product-parameter handling is unverified. Whether the current
listing/detail-page generation already enforces a structured
count/category/ratio ruleset is unverified. Whether style selection is
already informed by category-level performance (CTR) data, or is purely
manual/aesthetic, is unverified.

### 7. Recommended changes
- **ADD (as an enhancement to the confirmed listing/detail-page feature)**:
  the 4-category/≥7-image/3:4-ratio/60%-composition structured ruleset from
  step_4. This is the single highest-value, most demo-able, best-evidenced
  recommendation in this entire analysis.
- **MODIFY**: extend the confirmed product-parameters feature with an
  explicit benefit-language-translation stage before generation (step_2).
- **RESEARCH_FURTHER**: whether style selection should be informed by
  category-level CTR/performance data (step_3) — valuable in principle, but
  requires a performance-data feedback loop that is a bigger product-
  architecture decision, not a single generation-pipeline change.

### 8. Things NOT recommended
No ecommerce step is recommended against outright; all 5 steps map onto
Curify's existing confirmed direction in some form. The CTR-driven-selection
idea (part of step_3) is deliberately *not* fast-tracked as an ADD, since it
requires infrastructure beyond what a single workflow node change can
deliver.

### 9. Evidence limitations
ECOM-01 is vendor tutorial content published by Meitu to promote its own AI
tool; not independently authored or third-party audited. The efficiency claim
("2 designer-days → under 30 minutes") and the CTR claim are both
self-reported with no disclosed methodology. It documents a single worked
example (one folding water bottle).

### 10. Product implication
Ecommerce has the cleanest evidence-to-recommendation path of any domain:
a real, well-evidenced external source validates Curify's core premise
almost exactly and supplies a concrete, checkable, immediately actionable
structural requirement (the image-suite ruleset) that plugs directly into
an already-confirmed feature (listing/detail pages) without requiring new
product architecture.

---

## EDUCATION

### 1. Current known Curify workflow
`VIDEO_CONFIRMED` (only; no manager-meeting detail recorded): story/episode
→ word cards → reading & translation → quiz → character map → full learning
pack ("Turn any story into a full learning pack").

### 2. External professional workflow
EDU-01 (woshipm.com, **PARTIAL**, 8 steps, `education_001`): a third-party
analysis of Zebra AI Class's weekly content structure — daily story video,
word cards, picture-book reading & follow-along, multi-dimensional quiz,
a simulated-teacher "Zebra Call" review, daily WeChat teacher videos, WeChat
group homework with human feedback, and a Friday live-format class.

**This source documents the LEARNER-FACING weekly content-delivery
sequence, not Zebra's internal content-production pipeline.** This
limitation is treated as load-bearing throughout this section, not a
footnote.

### 3. Confirmed overlap
Two direct, strong matches: EDU-01's "story video" step matches Curify's
"story/episode" step, and EDU-01's "word cards" step matches Curify's "word
cards" step **by name and content** (illustrated, audio-enabled flashcard
per vocabulary item). Both are `CONFIRMED_FINDING` and
`VALIDATES_EXISTING_DIRECTION` — real independent corroboration that these
two step types are genuine, recurring patterns in a live commercial
education product, not arbitrary choices.

### 4. New professional knowledge — CONFIRMED_FINDING only
These are directly quoted in the source and treated as reliable regardless
of the source's PARTIAL rating, because they are professional/pedagogical
*principles*, not production-process claims:
- **Multi-dimensional quiz testing**: a single knowledge point should be
  tested separately on pronunciation, meaning, and written form — not as one
  combined item.
- **Cognitive-load ceiling**: 3–7 year-olds have short-term memory capacity
  of only "3±2" chunks, which should bound how much new content a single
  pack introduces.
- **Repetition-cycling target**: each target word should be cycled through
  9+ distinct exposures per week across varied modalities.

### 5. Confirmed gaps
None. Every education-domain row in the gap matrix is classified
`PARTIALLY_SUPPORTED` or `UNKNOWN_CURRENT_STATE` — there is no education row
classified `MISSING`. Given EDU-01's PARTIAL evidence status and the fact
that Curify's own baseline is video-only (no manager-meeting depth), asserting
a confirmed gap here would overreach what either evidence source can support.

### 6. Unknown-current-state areas — HYPOTHESIS_REQUIRING_BETTER_SOURCE
The "Zebra Call" (simulated live teacher review), WeChat teacher videos,
WeChat group homework, and Friday live class are all **learner-facing
delivery/community infrastructure**, not generation-pipeline steps — they
describe human teachers and live interaction, a different product category
from Curify's apparent packaged-asset-generation model. These are flagged as
hypotheses that would need a better (internal-production-facing) source to
evaluate seriously, not as findings ready to act on.

### 7. Recommended changes
- **MODIFY (medium confidence)**: structure the existing "quiz" step to test
  pronunciation/meaning/written-form as separate items, per the
  well-evidenced multi-dimensional quiz principle.
- **MODIFY (low confidence)**: the existing "reading & translation" step's
  mechanism could add a read-then-follow-read-aloud micro-sequence
  (re-contextualization-over-verbatim-repetition), per EDU-01's reading
  pattern. Confidence is low because EDU-01 provides no evidence either way
  on the existing step's translation sub-component — this only speaks to the
  reading half.
- **RESEARCH_FURTHER**: whether the existing pipeline's per-pack content
  volume respects an age-appropriate cognitive-load ceiling and repetition-
  cycling target. Well-evidenced pedagogical principles but require
  product-design input beyond what EDU-01 alone can specify.

### 8. Things NOT recommended
Reproducing the Zebra Call, WeChat teacher-video, or WeChat group-homework
patterns as Curify features is **not recommended**. These are human-operated,
live-delivery mechanisms fundamentally different from Curify's
content-generation model, and recommending them from a PARTIAL,
learner-facing-only source would be exactly the kind of overreach the task
explicitly warns against.

### 9. Evidence limitations
EDU-01 is third-party analyst commentary (woshipm.com), not an official
first-party account from Zebra/Zuoyebang. It explicitly does not cover
internal team structure, production timeline, licensing, or QA process. Its
own stated weekly cadence has an internal inconsistency (day-specific labels
don't cleanly reconcile with the stated 3-new/2-review split), and it
discloses that the product's own "AI" branding is largely conceptual/
marketing rather than substantive.

### 10. Product implication
Education is the one domain where the right conclusion is **"this
validates two existing steps and offers three well-evidenced content-design
principles — nothing more."** No new production-workflow steps should be
inferred from this source. Any deeper education-domain gap analysis should
wait for a source that actually documents an internal content/教研
production pipeline, not a learner-facing delivery description.

---

## BRAND_LOGO

### 1. Current known Curify workflow
`MANAGER_MEETING_CONFIRMED` only: the manager stated that an external
five-step brand-design process had previously been reverse-engineered and
adapted into a Curify demo. **The five steps themselves were not restated in
this task's input and are not known.** No video evidence exists for this
domain. Current Curify Brand/Logo workflow scope and implementation is
`UNKNOWN`.

### 2. External professional workflow
BRAND-03 (Behance / Sabrina Young RGD, SUBSTANTIAL, 8 steps,
`brand_logo_001`): a real corporate rebrand (Canada Life's Constellation
program) — define objectives, develop client personas, develop advisor
personas, create a distinguishing sub-brand visual device, localize for
target-language markets, produce multi-format applications, coordinate with
an external digital-tool vendor, launch.

**Step order in this source is a disclosed MEDIUM-confidence
reconstruction** from stated content dependencies, not source-declared
chronological wording — this is treated as a live caveat in every
recommendation below, not just noted once.

### 3. Confirmed overlap
**None can be claimed.** Because Curify's actual current brand_logo workflow
content is unknown (the manager-referenced five steps were never recorded),
there is no baseline to compare against for overlap. Any claim of overlap or
non-overlap would be inventing the missing baseline, which this task
explicitly prohibits.

### 4. New professional knowledge
Independent of any current-state comparison, BRAND-03 offers real,
well-evidenced professional patterns:
- **Persona-driven creative variation**: distinct audience personas (5
  client + 3 advisor) each drive tailored creative treatment.
- **One identity → multiple applied formats**: brochure, kit, die-cut
  piece, large-format print, poster/one-pager, all derived from one
  identity system.
- **Localization means adapting representation, not just translating
  copy**: personas themselves were modified for target-market segments.

### 5. Confirmed gaps
**None.** Per explicit task instruction, the missing internal five-step
workflow must not be reconstructed, so no gap can be "confirmed" against an
unknown baseline. Every brand_logo row in the gap matrix is
`UNKNOWN_CURRENT_STATE`.

### 6. Unknown-current-state areas
All 8 external steps. This is the domain where current-state uncertainty is
total, by design of the available evidence (not a research shortfall in
this task — the manager explicitly declined to restate the five-step
process).

### 7. Recommended changes
None can be responsibly classified `ADD` given zero current-baseline
visibility. Instead:
- **RESEARCH_FURTHER (elevated priority)**: verify whether Curify's
  existing (unrecorded) brand_logo workflow already includes persona-driven
  variation and multi-format application production. This is flagged as
  elevated-priority research — not because of demo appeal, but because the
  same "one asset → many correctly-adapted formats" pattern independently
  recurs in merch (step_03) and packaging (steps 03/06), a genuine
  cross-domain signal worth resolving once rather than three times.
- **RESEARCH_FURTHER (standard priority)**: localization-as-representation-
  adaptation, and objective-definition framing, both worth checking against
  whatever the existing five-step process actually contains.

### 8. Things NOT recommended
The specific "keyline square" sub-brand-differentiation device (step_04) is
a narrow pattern tied to one corporate sub-brand-within-parent-brand
scenario, unlikely to generalize to Curify's more common standalone-new-
brand use case — not recommended for further pursuit. External vendor
coordination (step_07) and campaign launch scheduling (step_08) are
organizational/operations activities outside a creative-generation
product's scope.

### 9. Evidence limitations
BRAND-03 is an individual practitioner's self-published portfolio post
(source_authority 1/2), not an official agency/brand-published case study.
No sketches or iteration imagery were found. Self-reported financial/
adoption figures were excluded from the formal workflow entirely and are not
used in any recommendation here.

### 10. Product implication
Brand/logo cannot receive the same treatment as merch/ecommerce, and this
document does not pretend otherwise: with the internal five-step baseline
unrecorded, the responsible output is a **prioritized verification list**,
not gap-closing recommendations. The one actionable next step is recovering
or re-documenting the manager-referenced five-step process so a real
comparison becomes possible in a future pass.

---

## PACKAGING

### 1. Current known Curify workflow
Entirely `UNKNOWN`. The manager explicitly instructed not to invent a
current Packaging baseline; no video, no manager-meeting detail, no
repository evidence exists for this domain.

### 2. External professional workflow
PACK-02 (Catalpha Advertising & Design, SUBSTANTIAL, 6 steps,
`packaging_001`): a real client engagement (a pet-grooming product,
"Combat Comb") — measure the physical product and select structural
package type, build a physical blank mockup to validate stock weight/
folding, generate 4 creative concepts scored against 3 named goals, draft a
production dieline (3D-verified), lay final artwork onto the dieline
(3D-rechecked), print and launch.

### 3. Confirmed overlap
**None can be claimed**, for the same reason as brand_logo: there is no
current baseline to compare against. Every packaging row in the gap matrix
is `UNKNOWN_CURRENT_STATE`.

### 4. New professional knowledge
- **Dimensional/physical input, not a flat photo**: packaging structural
  design starts from real product measurements (width/length/depth), a
  fundamentally different input modality than the single-flat-photo pattern
  confirmed for merch and ecommerce.
- **Named-criteria concept generation**: 4 distinct design concepts, each
  scored against 3 explicit goals (shelf impact, clear communication, brand
  consistency) — the same "generate N variants scored against named
  criteria" pattern found independently in brand_logo, making this one of
  the strongest cross-domain signals in the whole B3 analysis.
- **Dieline engineering + 3D verification**: a technical, print-production-
  grade deliverable (die-cut/fold line-work), checked in 3D at two separate
  points because flat 2D layouts can misrepresent the folded result.

### 5. Confirmed gaps
**None.** Per explicit task instruction, this document does not claim
"Curify is missing dielines" or any other capability — current state is
unverified, not confirmed absent.

### 6. Unknown-current-state areas
All 6 external steps, with **dieline production specifically flagged as the
single highest-priority open question in the entire packaging domain**:
whether Curify's packaging output is intended to be a production-ready
technical dieline or a decorative visual render fundamentally changes what
"packaging support" means and should be resolved before any further
packaging roadmap work.

### 7. Recommended changes
None can be responsibly classified `ADD` against a fully unknown baseline.
Instead, `HIGH_VALUE_CAPABILITY_TO_VERIFY` items, in priority order:
1. **Does packaging generation require dimensional/measurement input, and
   does Curify currently support that input modality at all?** (steps
   01/04/05) — the most structurally important open question.
2. **Does Curify already support named-criteria multi-concept generation**
   (step_03) — high cross-domain reuse value if verified absent and added
   once, generically.
3. Whether any dieline-equivalent or 3D-fold-verification capability exists
   in any form (steps 04/05).

### 8. Things NOT recommended
Physical mockup/prototype testing (step_02, cutting and folding real paper)
and print/retail-distribution launch (step_06) are **not recommended** for
Curify to reproduce directly — they are physical-world activities outside a
digital asset-generation tool's product surface. A 3D-preview simulation as
a loose digital analog to physical mockup testing is noted only as a
speculative idea, not a recommendation.

### 9. Evidence limitations
PACK-02 is a single first-party agency blog post; no independent/trade-press
corroboration was found. No budget, timeline, exact retailer name, or
numeric material specification (gsm/caliper values) is disclosed. The number
of client-feedback rounds is not disclosed.

### 10. Product implication
Packaging, like brand_logo, needs a **verification-first roadmap**, not a
build roadmap. The single highest-leverage next step is determining whether
"packaging" in Curify's product vision means production-ready technical
dielines or visual packaging mockups — every other packaging decision
depends on that answer.

---

## Overall Priority Table

Assigned conservatively: `P0`/`P1` only where evidence strength AND product
value both clearly justify it, per task instruction. No item is elevated
solely for demo appeal.

| Priority | Domain | Item | Recommendation | Why this tier |
|---|---|---|---|---|
| **P0** | — | *(none)* | — | No item combines HIGH evidence strength, a confirmed (not unknown) current-state baseline, AND unambiguous product-readiness. The single strongest candidate (ecommerce image-suite ruleset) is capped at P1 because current implementation status is unverified, not because the evidence is weak. |
| **P1** | Ecommerce | Structured image-suite ruleset: ≥7 images / 4 categories / mandatory white-bg / ≥60% product-body / 3:4 ratio (step_4) | ADD (enhancement to confirmed listing/detail-page feature) | HIGH evidence strength, HIGH across all 6 criteria, parent feature already confirmed. Best-evidenced, most demo-able, most immediately actionable recommendation in the whole analysis. |
| **P1** | Ecommerce | Selling-point → consumer-benefit-language translation stage (step_2) | MODIFY (enhancement to confirmed product-parameters feature) | HIGH evidence strength, HIGH value/necessity/repeatability/AI-compatibility; parent feature confirmed. |
| **P1** | Education | Multi-dimensional quiz structuring — test pronunciation/meaning/written-form separately (step_04_quiz) | MODIFY (enhancement to confirmed "quiz" step) | HIGH, directly-quoted evidence; parent step confirmed; high professional necessity and AI-compatibility. Capped at P1 not P0 because EDU-01's overall case rating is PARTIAL. |
| **P2** | Merch | Digital "preflight" defect-category validation, extending the confirmed CMYK/bleed/dpi/disconnected-element feature set (step_08) | MODIFY | Real transferable principle, but indirect (translated from physical QC to a digital analog) and lower demo value. |
| **P2** | Education | Cognitive-load ceiling and repetition-cycling target as content-generation guidelines (pc_01, pc_02) | RESEARCH_FURTHER | Well-evidenced pedagogical principles, high necessity/repeatability, but need product-design translation work before they're actionable. |
| **RESEARCH_FURTHER** | Merch | IP/trademark-risk guidance for derivative character merch (step_06) | RESEARCH_FURTHER | Genuinely new, professionally necessary, highly repeatable — but a product-policy question, not a workflow-engineering one. |
| **RESEARCH_FURTHER** | Ecommerce | CTR/performance-data-informed style selection (step_3, partial) | RESEARCH_FURTHER | Valuable in principle; requires a performance-data feedback loop, a bigger architecture decision than a single node change. |
| **RESEARCH_FURTHER** | Brand/Logo | Persona-driven creative variation + one-identity-to-many-formats (steps 02, 06) | RESEARCH_FURTHER (elevated) | Zero current-baseline visibility, but this exact "one asset → many formats" pattern independently recurs in merch and packaging — worth resolving once, generically, across domains. |
| **RESEARCH_FURTHER** | Brand/Logo | Localization-as-representation-adaptation, objective-definition framing (steps 01, 03, 05) | RESEARCH_FURTHER | Zero current-baseline visibility; standard priority. |
| **RESEARCH_FURTHER** | Packaging | Dimensional/measurement input support; named-criteria multi-concept generation; dieline / 3D-fold verification (steps 01, 03, 04, 05) | RESEARCH_FURTHER (dieline question elevated) | Zero current-baseline visibility; the dieline question is the single highest-priority open question in the domain and should be resolved before any packaging roadmap work. |
| **DO_NOT_ADD** | Merch | Reference gathering, manual illustration tooling, MOQ/packaging workarounds, vendor sampling, pricing strategy, product photography of manufactured stock, promotion-timing rules, delivery logistics, ongoing shop operations (steps 01, 02, 04, 05, 07, 09, 10, 11, 12) | IGNORE | Independent-seller supply-chain/retail-operations activities, outside a creative-asset-generation product's scope. |
| **DO_NOT_ADD** | Education | Zebra Call, WeChat teacher video, WeChat group homework, Friday live class as literal features (steps 05, 06, 07, 08) | IGNORE / RESEARCH_FURTHER (hypothesis only) | Human-operated live-delivery/community infrastructure, a different product category from packaged-asset generation; sourced from a PARTIAL, learner-facing-only case. |
| **DO_NOT_ADD** | Brand/Logo | Keyline-square sub-brand device, external vendor coordination, launch scheduling (steps 04, 07, 08) | IGNORE | Narrow case-specific pattern or organizational/operations activity, not generalizable creative-generation scope. |
| **DO_NOT_ADD** | Packaging | Physical mockup/prototype testing, print + retail distribution (steps 02, 06) | IGNORE | Physical-world activities outside a digital asset-generation tool's product surface. |

**Cross-domain note:** two patterns each appear independently across *three*
different B2 sources — (a) "one asset → many correctly-adapted formats"
(merch step_03, brand_logo step_06, packaging step_06/production
requirements) and (b) "generate N concept variants scored against named
criteria" (packaging step_03, echoed in brand_logo's persona-driven
variation). Independent corroboration across unrelated industries and
sources is the strongest kind of evidence this analysis produced, and both
patterns are called out at elevated priority above even though neither
crosses the P0/P1 bar on their own merits in any single domain.
