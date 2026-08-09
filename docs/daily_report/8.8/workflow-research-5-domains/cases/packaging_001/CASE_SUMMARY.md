# packaging_001 — Case Summary

## Source

**Catalpha Advertising & Design** (Cockeysville, MD, USA), agency case study:
"Getting a Unique New-to-Market Pet Product Into Shelf-Ready Packaging for Major
Retailers" (byline: Michael Garlitz), published on the agency's own blog.

- URL: https://blog.catalpha.com/getting-a-unique-new-to-market-pet-product-into-shelf-ready-packaging-for-major-retailers
- Discovered in the B1 candidate pass as **PACK-02**.
- Re-verified directly in B2 via WebFetch of the live source page on 2026-08-09 — the
  page was accessible and yielded full section headings, in-text quotes, and image
  captions consistent with the B1 candidate summary.

## Why this case was selected (per the SELECTION RULE)

B1 scored PACK-01 (造物起异 / Zaowuqiyi, fruit wine) and PACK-02 (Catalpha, Combat
Comb) as co-strongest, both at 9/10. Both were independently re-verified in B2 via
direct WebFetch against their live source pages, and both held up: neither collapsed
into unsupported claims on inspection.

Applying the tie-break instruction ("prefer the one with clearer PROCESS and
professional constraints over the one with a prettier final output"), PACK-02 was
selected over PACK-01 for these reasons:

1. **Process visibility.** PACK-02's six stages (Measuring Up → Mockup Testing →
   Initial Creative Exploration → Dieline Drafting → Final Package Production →
   Launch) are each explicitly a *causal* chain — every stage's stated input is the
   previous stage's stated output ("Using our notes and measurements, we trim out a
   rough blank prototype..."; "With the designs out for feedback, we began to draft
   the actual dieline..."). PACK-01's six stages are also real and well-evidenced,
   but are described more as a taxonomy of activities *within* each phase (selection
   criteria, market-research checklist, design-strategy checklist) than as an
   explicit step-to-step handoff chain.
2. **Professional/structural constraints.** PACK-02 surfaces concrete, verifiable
   structural-packaging engineering constraints — stock (paper) weight, folding,
   dieline accuracy, print feasibility, 3D-vs-flat verification — each tied to a
   specific quoted rationale. PACK-01 also names real professional terms (SWOT,
   Pantone color-proofing, white-sample testing, die-cut/glue QC) but with less
   causal "why this constraint, applied at this exact point" detail per term.
3. **Evidence completeness under direct re-verification.** Both sources reproduced
   cleanly under WebFetch. PACK-02's article structure (explicit named subheadings
   with "verb-ing — purpose" format) mapped very cleanly onto discrete workflow
   steps with minimal interpretive gap-filling, reducing risk of over-inferring
   structure that isn't actually stated. PACK-01, while equally information-rich,
   requires translation/paraphrasing from Chinese, which is handled here but adds a
   layer of interpretive risk that PACK-02 (native English, quoted verbatim) avoids.
4. **Source authority.** Tied — both are first-party agency/studio blog posts, not
   independent trade press.
5. **Curify relevance.** Tied — both are concept-to-production pipelines directly
   translatable to Curify's packaging domain.

PACK-03 (Pearlfisher / McDonald's) was not selected: B1 already documented it as
explicitly missing materials/print/production specifics ("does not specifically
address materials, sustainability practices, or printing specifications") and weaker
on the structural/dieline side that defines this domain (curify_relevance scored 1
vs. 2 for PACK-01/PACK-02). Given PACK-01 and PACK-02 both independently verified as
strong, competitive re-fetching of PACK-03 was not needed to make the primary
selection — it was not a live contender against two confirmed 9-scored, causally
sequenced candidates.

PACK-04 (独角狮设计) was excluded per B1's own finding: it is generic industry-process
advice not tied to any real project (no input, no artifacts, no output for a specific
case) — explicitly the pattern the SELECTION RULE says not to force a pass on.

## Input

A new-to-market pet grooming product ("Combat Comb") from a startup brand entering an
unfamiliar product category. No prior packaging existed. The brief was to design
shelf-ready packaging suitable for placement in major retailers.

## Verified workflow sequence (6 steps, all EXTERNAL_SOURCE_CONFIRMED)

1. **Measuring Up** — measure product (width/length/depth); select structural type
   (hanging box with window) to optimize shelf space while showing product function.
2. **Mockup Testing** — build a rough blank physical prototype from the measurements;
   test sizing, stock weight, and folding of internal structural elements.
3. **Initial Creative Exploration** — produce four design concepts with varied
   copy/messaging, evaluated against three explicit goals (shelf impact, clear
   communication, brand consistency); present to client for feedback.
4. **Dieline Drafting** — draft the production dieline from mockup measurements,
   accounting for folding, paper weight, and print feasibility; verify accuracy
   periodically with 3D software.
5. **Final Package Production** — lay out client-approved artwork (with edits) onto
   the verified dieline; re-check with 3D software since flat layouts can misrepresent
   the folded result.
6. **Product Launch** — package printed and launched in major retailers.

See `workflow_extraction.json` for full structured detail and `evidence_manifest.csv`
for the quote-level evidence backing each step.

## Outputs

- Print-ready digital dieline and final package artwork.
- Physical shelf-ready package (hanging box with window), launched in major retailers.
- Product/feature photography and graphics used on the final package.

## Professional knowledge found

- Structural package-type selection driven by retail shelf-space optimization while
  preserving product visibility/function communication.
- Physical mockup/prototype testing as a mandatory gate before digital dieline work
  (validates sizing, stock weight, folding — not just a formality).
- Dieline engineering must jointly satisfy folding, stock weight, and print
  feasibility.
- 3D software used at two distinct checkpoints (dieline drafting, final production)
  specifically because flat 2D layouts can look correct yet fail once folded.
- Design concepts evaluated against named, explicit criteria (shelf impact / product
  communication / brand consistency), not aesthetic judgment alone.
- Client approval gates exist at two points: after concept exploration (before
  dieline drafting) and after dieline is ready (before final production layout).

## Important production/industry constraints

- Retail shelf-space optimization is a first-order structural driver, not an
  afterthought applied late in the process.
- Structural integrity (stock weight, folding) must be physically validated before
  any digital production work begins.
- Dieline accuracy is verified against a folded 3D reality, not trusted as a flat
  2D drawing.
- Client sign-off is a formal gate between creative and production phases.

## Evidence completeness

All 6 steps are backed by direct verbatim quotes from the live source page
(re-fetched independently in B2, not just taken from the B1 summary), with matching
section headings that can be used to locate the original passages. Image captions
were used only as corroboration of an already text-established step order, never as
the sole basis for sequencing (see `evidence_manifest.csv` row E12). One general
framing quote (E13) and general agency-relationship language were documented but
excluded from the formal step sequence as not tied to any single step.

## Limitations

- Single first-party source (agency's own blog); no independent/trade-press
  corroboration of this specific project was located.
- No disclosed budget, timeline, exact retailer name(s), or numeric material
  specifications (e.g., exact stock/gsm values) — only qualitative terms ("stock
  weight," "paper weight") are given.
- The article does not disclose how many rounds of client feedback occurred or
  exactly what the "edits" to the chosen layout were.
- This is a single case; it should not be read as representative of all structural
  packaging workflows, only as one rigorously evidenced professional example.
