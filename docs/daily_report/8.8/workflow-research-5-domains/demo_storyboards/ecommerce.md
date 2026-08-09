# Demo Storyboard — Ecommerce

**Status:** Proposed Curify demo flow. Not a final video. Built on Curify's
own confirmed baseline (`VIDEO_CONFIRMED`: one phone photo → professional ad
→ lifestyle shots → ready-to-sell presentation → whole campaign;
`MANAGER_MEETING_CONFIRMED`: listing/detail pages, product parameters,
holiday campaigns, virtual try-on, makeup try-on), enhanced with the two
strongest, best-evidenced findings from the external ECOM-01 case
(`ecommerce_001`, `EXTERNAL_SOURCE_CONFIRMED`). This is the domain with the
tightest fit between external evidence and Curify's own stated direction —
most scenes below are `EVIDENCE_BACKED`, not proposals.

| # | SCENE | USER_INPUT | CURIFY_ACTION | VISIBLE_OUTPUT | WHY_THIS_STEP_MATTERS | SOURCE_OF_WORKFLOW_IDEA | EVIDENCE_CONFIDENCE | TAG |
|---|---|---|---|---|---|---|---|---|
| 1 | One ordinary phone photo | A single smartphone photo of the product, imperfect background/lighting, no studio setup | Ingest the raw photo as-is | The uploaded photo shown exactly as taken (cluttered desk, everyday lighting) | The hook: no studio photography required. An independent commercial vendor tool confirms this exact premise works in the real market, not just in Curify's own marketing | `VIDEO_CONFIRMED`, validated by `ecommerce_001` step_1 | HIGH | EVIDENCE_BACKED |
| 2 | Selling points, translated | User types 2–3 raw product facts (e.g., "waterproof," "collapsible," "600ml") | Structure the raw facts into consumer-benefit language (e.g., "waterproof" → "worry-free outdoor use") | A small side-by-side panel: raw fact → consumer benefit phrase | Demonstrates Curify doesn't just generate pretty pictures — it structures the *selling message*, a distinct and valuable professional step most users wouldn't think to do themselves | `ecommerce_001` step_2 (`EXTERNAL_SOURCE_CONFIRMED`), extending `MANAGER_MEETING_CONFIRMED` "product parameters" | HIGH | EVIDENCE_BACKED |
| 3 | Pick a visual style | User taps one of several style thumbnails (e.g., outdoor/lifestyle, clean studio, seasonal) | Apply the chosen visual direction to the generation | 4 small style thumbnails, one selected and enlarged | Matches the manager-confirmed holiday-campaign styling (Halloween, Valentine's) already part of Curify's plan — this scene proves style choice is a real, visible lever, not just a backend toggle | `MANAGER_MEETING_CONFIRMED`, validated by `ecommerce_001` step_3 | HIGH | EVIDENCE_BACKED |
| 4 | The complete image set | (none — automatic) | Generate the full required image suite: white-background shot, lifestyle/scene shot, selling-point close-up, comparison/detail shot | A labeled grid building up to 7 images, visibly organized into the 4 categories, with a "7 of 7 — complete set" checkmark | The single most concrete, evidence-backed finding in this entire research: a real commercial detail page needs this exact structure (≥7 images, 4 categories, mandatory white-background, ≥60% product-body composition, 3:4 ratio) to be genuinely complete — this scene proves Curify delivers a professionally *complete* set, not just some nice images | `ecommerce_001` step_4 (`EXTERNAL_SOURCE_CONFIRMED`) | HIGH | EVIDENCE_BACKED |
| 5 | Seasonal campaign remix | User taps "Valentine's Day" (or another holiday) | Re-skin the same product images into a seasonal campaign treatment | A Valentine's-themed banner/social post using the same product | Directly matches manager-confirmed holiday campaign assets (Halloween, Valentine's Day) — proves the same one photo scales into a full campaign, not just one page | `MANAGER_MEETING_CONFIRMED` | HIGH | EVIDENCE_BACKED |
| 6 | (If ready) Try-on preview | User selects "show on model" | Generate a virtual try-on / makeup try-on preview using the product | Model shown wearing/using the product | Manager-confirmed as an intended feature category, but implementation status in the current product is not established in this task's inputs — include only after confirming it's demo-ready | `MANAGER_MEETING_CONFIRMED` (feature category only) | MEDIUM | NEEDS_VALIDATION |
| 7 | Full campaign pack, ready to sell | (none — automatic) | Bundle the detail page, lifestyle set, seasonal variant, and (if validated) try-on preview into one export | "Campaign Pack" download screen: complete page mockup plus the full asset grid | The payoff scene, matching Curify's own stated framing exactly: "a whole campaign... all from ONE phone photo" | `VIDEO_CONFIRMED` | HIGH | EVIDENCE_BACKED |

**Note on Scene 6:** this is the only scene in the ecommerce storyboard not
tagged `EVIDENCE_BACKED`, specifically because its evidence class differs
from the others — it is a confirmed *feature category* (manager-stated) but
not a confirmed *implementation status*, per
`CURRENT_CURIFY_WORKFLOW_BASELINE.md`'s explicit `UNKNOWN` note. Verify
before filming.
