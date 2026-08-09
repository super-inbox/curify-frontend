# Demo Storyboard — Merch

**Status:** Proposed Curify demo flow. Not a final video. Built primarily on
Curify's own confirmed baseline (`VIDEO_CONFIRMED`: single character/IP → 9
expressions → sticker pack → merchandise applications;
`MANAGER_MEETING_CONFIRMED`: print-ready sticker files, CMYK, ~3mm bleed,
600dpi, disconnected-element handling), with one refinement and one optional
addition drawn from the external MERCH-01 case (`merch_001`,
`EXTERNAL_SOURCE_CONFIRMED`). The external case's supply-chain/retail-
operations steps (manufacturer sampling, pricing, physical QC, logistics)
are deliberately **not** reflected here — see
`CURIFY_WORKFLOW_RECOMMENDATIONS.md` §Merch for why.

| # | SCENE | USER_INPUT | CURIFY_ACTION | VISIBLE_OUTPUT | WHY_THIS_STEP_MATTERS | SOURCE_OF_WORKFLOW_IDEA | EVIDENCE_CONFIDENCE | TAG |
|---|---|---|---|---|---|---|---|---|
| 1 | One character, one upload | A single character illustration or IP reference image | Ingest the character and lock its visual style/model | Clean single-character render, style confirmed | Establishes the core hook: everything that follows comes from just one input | `VIDEO_CONFIRMED` baseline step 1 | HIGH | EVIDENCE_BACKED |
| 2 | Nine expressions, one click | (none — automatic from Scene 1) | Generate the character across 9 distinct expressions/poses, maintaining character consistency | A 3×3 grid of expression variants | This is Curify's own stated headline capability ("One character → a full merch pack"); demonstrates consistency at scale, the hardest part to fake | `VIDEO_CONFIRMED` baseline step 2 | HIGH | EVIDENCE_BACKED |
| 3 | Sticker sheet, print-ready | (none — automatic) | Lay expressions into a sticker sheet; apply CMYK conversion, ~3mm bleed, 600dpi, and disconnected-element handling | Print-ready sticker sheet PDF with visible bleed guides and a "print spec" badge (CMYK / 600dpi / 3mm bleed) | This is the professional print-readiness step that separates "pretty AI art" from "something a print shop will actually accept" — Curify's stated core value proposition | `MANAGER_MEETING_CONFIRMED` | HIGH | EVIDENCE_BACKED |
| 4 | Format-aware merch recomposition | (none — automatic) | Recompose the character/scene per target product shape (vertical phone case, square magnet/badge, horizontal postcard) — repositioning elements, not stretching or cropping | 3–4 merch mockups (phone case, magnet, postcard), each well-composed for its own aspect ratio | An independent external source confirms that naive resize/crop looks unprofessional and that dedicated per-format recomposition is a real production necessity — this scene proves Curify does the harder, correct thing, validating (not inventing) the manager's "disconnected-element handling" direction | `merch_001` step_03 (`EXTERNAL_SOURCE_CONFIRMED`), validating `MANAGER_MEETING_CONFIRMED` | HIGH | EVIDENCE_BACKED |
| 5 | (Optional) Rights-awareness tip | (none — automatic, non-blocking) | If the character resembles a well-known trademarked IP, surface a small, non-blocking tip: "Using someone else's character commercially may need rights clearance" | A small dismissible banner/tag, not a blocker | New professional knowledge from the external case: derivative/fan-made merch has real trademark and image-rights constraints. Genuinely useful, but this is a product-policy decision (tone, placement, whether to include at all), not a confirmed Curify behavior | `merch_001` step_06 (`EXTERNAL_SOURCE_CONFIRMED`) | MEDIUM | NEEDS_VALIDATION |
| 6 | Full merch pack, ready to use | (none — automatic) | Bundle every generated asset (sticker sheet + all merch mockups) into one export, with production specs summarized | "Full Merch Pack" download screen: thumbnail grid of every asset plus a specs footer (CMYK / 600dpi / 3mm bleed) | The payoff scene, matching Curify's own stated framing exactly: "One character → a full merch pack" | `VIDEO_CONFIRMED` | HIGH | EVIDENCE_BACKED |

**Scenes deliberately not included:** manufacturer/vendor sampling, pricing
strategy, physical incoming QC, delivery logistics, and ongoing shop
operations from MERCH-01. These describe an independent seller's business
operations, not a creative-generation demo beat — see
`CURIFY_WORKFLOW_RECOMMENDATIONS.md` §Merch, section 8.
