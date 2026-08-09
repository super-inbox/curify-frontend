# Demo Storyboard — Packaging

**Status:** Proposed Curify demo flow. Not a final video.

**Important baseline caveat:** Curify's *actual current* Packaging workflow
is **entirely unknown** to this task — the manager explicitly instructed not
to invent one, and no video or manager-meeting evidence exists for this
domain. This storyboard is built from the external PACK-02 case
(`packaging_001`, `EXTERNAL_SOURCE_CONFIRMED`) simplified into a plausible
Curify-style flow, **not** from any confirmed current Curify behavior. Most
scenes are tagged `NEEDS_VALIDATION` for that reason — this is the correct,
honest reflection of the evidence, not an oversight.

**The single most important open question this storyboard surfaces:** is
Curify's packaging output meant to be a production-ready technical dieline
(the die-cut/fold engineering line-work a print shop needs) or a decorative
visual mockup? PACK-02 shows these are different deliverables requiring
different capabilities (3D-fold verification at two separate production
points). This storyboard does **not** assume an answer — see Scene 4 and
the closing note.

| # | SCENE | USER_INPUT | CURIFY_ACTION | VISIBLE_OUTPUT | WHY_THIS_STEP_MATTERS | SOURCE_OF_WORKFLOW_IDEA | EVIDENCE_CONFIDENCE | TAG |
|---|---|---|---|---|---|---|---|---|
| 1 | Product + package type | A product photo, plus basic dimensions or a package-type pick (box / pouch / bottle / bag) | Ingest the product and the selected structural type | Product shown next to a simple package-type selector | PACK-02 shows packaging fundamentally needs dimensional/structural input, not just a flat photo — a different input modality than every other Curify domain confirmed so far. This scene tests that directly and is the first thing to validate | `packaging_001` step_01 (`EXTERNAL_SOURCE_CONFIRMED`) | MEDIUM | NEEDS_VALIDATION |
| 2 | Multiple concepts, scored | (none — automatic) | Generate 3–4 distinct packaging concepts, each visibly scored against named criteria (shelf impact / clear communication / brand fit) | 3–4 concept renders, each with small criteria checkmarks | One of the two strongest cross-domain findings in the entire B3 research ("generate N variants scored against named criteria," independently echoed in the brand_logo domain) — highly demo-friendly and a natural fit for an AI tool, though current Curify fit is unconfirmed | `packaging_001` step_03 (`EXTERNAL_SOURCE_CONFIRMED`) | HIGH | NEEDS_VALIDATION |
| 3 | Pick and refine | User taps their favorite concept | Apply final artwork (product photography, feature callouts, graphics) to the chosen structural shape | A refined packaging render with photography and callouts in place | Natural creative-refinement step, consistent with the pattern seen across every other domain's storyboard (generate options → refine the chosen one) | General pattern, loosely informed by `packaging_001` step_05 | MEDIUM | PRODUCT_PROPOSAL |
| 4 | See it fold | (none — automatic) | Render a 3D preview of the design folded into its real structural shape | A rotating 3D preview of the actual folded package | PACK-02 explicitly shows flat 2D layouts can misrepresent the folded 3D result, and professional packaging design checks this at two separate points. This is the domain's single highest-priority open question: does Curify do anything like structural/fold verification, or is output purely a flat visual render? The answer changes what "packaging support" means for the whole domain | `packaging_001` steps 04/05 (`EXTERNAL_SOURCE_CONFIRMED`) | HIGH | NEEDS_VALIDATION |
| 5 | Packaging pack, ready to use | (none — automatic) | Bundle the structural render, flat print-ready artwork, and 3D preview into one export | "Packaging Pack" download screen | Matches the manager's general demo payoff pattern; **the label should say "ready to use," not "production ready," until the dieline question in Scene 4 is resolved** — overclaiming production-readiness here would be the exact kind of overreach this research was built to avoid | General demo-style pattern; caveat from `packaging_001` dieline findings | LOW | NEEDS_VALIDATION |

**Before using this storyboard for real demo production:** resolve the
dieline-vs-visual-render question (Scene 4). Everything downstream of it —
what "packaging pack" can honestly be labeled, whether a 3D preview is
technically meaningful or purely decorative — depends on that answer, and
it cannot be answered from external research alone.
