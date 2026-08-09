# Current Curify Workflow Baseline — Evidence-Labeled

Compiled 2026-08-09. Every line is labeled per the evidence policy in
`../TASK_SCOPE_AND_EXECUTION_PLAN.md`. No line fills an `UNKNOWN` gap with
generic industry knowledge.

---

## MERCH

**VIDEO_CONFIRMED:**
- Workflow: single character / IP → 9 expressions → sticker pack → merchandise applications.
- Final framing stated in video: "One character → a full merch pack."

**MANAGER_MEETING_CONFIRMED:**
- Print-ready sticker files.
- CMYK color mode.
- Approximately 3 mm bleed / outer margin.
- 600 dpi resolution.
- Handling of disconnected visual elements.
- Physical printing / merchandise production.

**REPOSITORY_CONFIRMED:**
- None established in Phase 0. (Phase 0 audited data structures, not this
  domain's implementation code; no merch-production-pipeline code was located
  or inspected during this pass.)

**UNKNOWN:**
- Whether/how CMYK, bleed, dpi, and disconnected-element handling are actually
  implemented in current product code (not inspected in Phase 0).
- Any additional merch SKU types beyond stickers referenced but not shown in the video.

---

## ECOMMERCE

**VIDEO_CONFIRMED:**
- Workflow: one ordinary product phone photo → professional product ad → lifestyle shots → ready-to-sell product presentation → whole campaign.
- Video framing: "1 photo → a pro ad", "real lifestyle shots", "ready to sell", "a whole campaign", "all from ONE phone photo."

**MANAGER_MEETING_CONFIRMED:**
- Listing/detail pages.
- Product parameters.
- Holiday campaign assets.
- Halloween.
- Valentine's Day.
- Virtual try-on.
- Makeup try-on.

**REPOSITORY_CONFIRMED:**
- None established in Phase 0.

**UNKNOWN:**
- Exact number/sequence of steps between "1 photo" and "whole campaign" beyond
  what the video framing states.
- Implementation status of virtual try-on / makeup try-on in current product code.

---

## EDUCATION

**VIDEO_CONFIRMED:**
- Workflow: story / episode → word cards → reading & translation → quiz → character map → full learning pack.
- Final framing stated in video: "Turn any story into a full learning pack."

**MANAGER_MEETING_CONFIRMED:**
- None recorded beyond the video content in this task's inputs.

**REPOSITORY_CONFIRMED:**
- None established in Phase 0.

**UNKNOWN:**
- Whether additional education outputs beyond the five listed exist in current product scope.

---

## BRAND_LOGO

**VIDEO_CONFIRMED:**
- None. No Brand/Logo demo video was uploaded or reviewed for this task.

**MANAGER_MEETING_CONFIRMED:**
- The manager stated only that an external five-step brand-design process had
  previously been reverse-engineered and adapted into a Curify demo. The five
  steps themselves were not restated in this task's input and are NOT recorded
  here — inventing them would violate the evidence policy.

**REPOSITORY_CONFIRMED:**
- None established in Phase 0.

**UNKNOWN:**
- The content of the five-step process referenced by the manager.
- Current Curify Brand/Logo workflow scope and implementation.

---

## PACKAGING

**VIDEO_CONFIRMED:**
- None. No Packaging demo video was uploaded or reviewed for this task.

**MANAGER_MEETING_CONFIRMED:**
- None. The manager explicitly stated not to invent a current Packaging baseline.

**REPOSITORY_CONFIRMED:**
- None established in Phase 0.

**UNKNOWN:**
- Entire current Curify Packaging workflow baseline is unknown pending Phase B1 discovery.

---

## Notes on scope of "REPOSITORY_CONFIRMED: None"

Phase 0's repository work focused on (a) locating the authoritative 326-query
input and (b) auditing existing Inspiration/search-adjacent data structures
(see `../inspiration-source-pilot/`), per the Phase 0 instructions. It did not
include a targeted code search for merch/ecommerce/education/brand/packaging
production-pipeline implementation (e.g. print-file generation, campaign-asset
generation). That targeted search is out of scope for Phase 0 and is deferred
to Phase B1/B2.
