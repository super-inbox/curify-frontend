# August 8 Workflow + Creative Exploration Research

## 1. What was completed

Two independent research tracks, both fully executed and QA'd:

**A. Five-domain workflow research** — for each of Curify's five target
domains (Merch, Ecommerce, Education, Brand/Logo, Packaging), found one
strong, evidence-based real-world professional workflow, compared it
against Curify's current/planned workflow, and produced gap analysis +
recommendations + a demo storyboard.

**B. Creative Exploration / Inspiration pilot** — validated whether
Curify can build a V1 "Inspiration" source-discovery feature (thumbnail +
original-source link + tags + content understanding) using existing data
structures and no embeddings, via a 10-query pilot across the same five
domains.

## 2. Workflow findings

| Domain | External workflow studied | Most useful professional knowledge | Implication for Curify | Evidence confidence |
|---|---|---|---|---|
| **Merch** | Independent illustrator's campus-merch line (zcool.com.cn, 12 steps) | Legal/IP clearance for derivative character merch; checkable defect-category QC | Print-readiness direction (CMYK/bleed/dpi) is **validated, not newly discovered** — IP-risk guidance is genuinely new | HIGH |
| **Ecommerce** | Meitu Design Studio Tmall detail-page system (5 steps) | Structured image-suite ruleset (≥7 images/4 categories/composition rules) | **Confirmed ADD recommendation** — enhances an already-confirmed listing feature | HIGH |
| **Education** | Zebra AI Class content breakdown (8 steps) | Multi-dimensional quiz structuring (pronunciation/meaning/written-form separately) | **Confirmed MODIFY**, but capped in confidence — source is **PARTIAL** (documents learner-facing delivery, not internal production) | PARTIAL (disclosed) |
| **Brand/Logo** | Constellation rebrand case study (Behance, 8 steps) | Persona-driven creative variation; one-identity-to-many-formats | **Needs current-product verification** — Curify's own five-step baseline was never recorded, so nothing here can be scored against it | Case: SUBSTANTIAL. Curify baseline: UNKNOWN |
| **Packaging** | Pet-product retail packaging case (Catalpha, 6 steps) | Dieline vs. visual-render distinction; N-variant generation scored against named criteria | **Needs current-product verification** — Curify's packaging baseline was never established at all | Case: SUBSTANTIAL. Curify baseline: UNKNOWN |

**Confirmed recommendation vs. needs verification, explicitly**: only
Ecommerce's image-suite ruleset (ADD) and Education's quiz structuring
(MODIFY) are grounded in a *confirmed* current-Curify baseline. Merch's
IP-guidance finding, and effectively everything in Brand/Logo and
Packaging, is `RESEARCH_FURTHER` — real, evidence-backed findings that
require someone to check current Curify implementation before acting.
Full detail: `WORKFLOW_GAP_MATRIX.csv` (41 rows) and
`CURIFY_WORKFLOW_RECOMMENDATIONS.md`.

## 3. Inspiration findings

- **326-query audit**: verified 326 unique queries, mapped to 5 domains
  (Merch 82, Ecommerce 66, Education 80, Brand/Logo 10, Packaging 66,
  Other 22). Authoritative file untouched throughout.
- **10-query pilot** (2 per domain) → **47 retained source candidates**,
  each fetched and evidence-checked.
- **Quality distribution**: 22 A / 23 B / 2 C, zero rejects — A-grade
  required an independently verifiable real client, studio, or business.
  These grades are **automated research recommendations, not human
  approval** — `human_review_status = PENDING` on all 47 candidates;
  nothing has been reviewed or approved by a person yet.
- **Thumbnail + content-understanding**: 47/47 (100%) on both.
- **Canonical-source tracing**: 47/47 resolved; 46 used the discovery page
  itself, 1 was successfully traced to a richer original beyond the
  discovery platform.
- **Source-expansion** (asset→page→creator→section→domain, tested on 13
  candidates): 100% at asset/page level, 8/13 reached full end-to-end
  confirmation of a real creator/business.

## 4. Query-bank conclusion

- **Merch: SUFFICIENT_FOR_NEXT_PILOT** — deep (82 queries/36 sub-intents), both pilot queries hit target with strong grades.
- **Ecommerce: USABLE_BUT_IMBALANCED** — deep in banners, thin in marketplace/UGC formats (pilot itself exposed this).
- **Education: USABLE_BUT_IMBALANCED** — deep K-12 breadth, but both pilot queries landed below target (4/5 candidates).
- **Brand/Logo: NEEDS_SUPPLEMENT** — only 4 distinct concepts total.
- **Packaging: NEEDS_SUPPLEMENT** — 61% concentrated in food/beverage + cosmetic.

**Brand/Logo and Packaging need supplementation, but not because they
underperformed** — both produced the *best* source-quality results in the
whole pilot (7/10 and 8/10 A-grade respectively). They simply have no
more untested breadth in the existing bank to scale into. Proposed
supplement queries exist (`SUPPLEMENTARY_QUERY_GAPS.md`,
`QUERY_BANK_RECOMMENDATIONS.md`), all tagged `PROPOSED_NEW_QUERY` and
unapproved.

## 5. Source strategy

**Strongest performers**: named-studio or named-designer case studies tied
to an **independently verifiable real client or business** — not the
hosting platform. This pattern (not the platform) produced every A-grade,
full-expansion-chain result across all five domains.

**Discovery-surface vs. canonical-source, clarified**: Behance was the
canonical source in 46 of 47 cases (it *is* the creator's own original
publication). Pinterest and ZCOOL were tested as discovery surfaces per
the task's model but produced zero retained candidates in this pilot —
they remain unproven as routing layers, not confirmed useless.

## 6. Data/system conclusion

- **Fits now, no change needed**: thumbnail, title.
- **Minimal additive fields needed** (not a schema rewrite): source URL,
  canonical URL, source domain, creator/author, content understanding,
  quality status, human-review status, plus re-exposing an
  already-populated `tags` field at the rendering layer.
- **V1 does not require embeddings.** Discovery, content description, and
  the offline gallery's search/filter all worked on keyword/tag matching
  with zero embedding or vector-search use anywhere in this pilot —
  matching how Curify's existing production image catalog already
  operates (tags/topics/category, not vectors).

## 7. Recommended next step

Based on the 10-query pilot evidence — **not** a full 326-query crawl:

1. **Human-review the 47 pilot records** (all `PENDING`); decide the 2
   structurally-ambiguous ones (a vendor guidance article, a
   recipient-reposted credential) as policy questions.
2. **Run a modest next pilot (~20-30 queries)**: a few more per
   strong-performing domain, a handful of Brand/Logo and Packaging
   supplement queries under review, and one test of a second discovery
   surface against influencer/UGC-style queries (Behance's weak spot).
3. For workflow: verify current Curify implementation against the
   confirmed Ecommerce/Education recommendations, and prioritize
   recovering/documenting Brand/Logo's and Packaging's actual current
   baselines before further external-workflow research in those two
   domains.
4. **Do not** scale to all 326 queries, build embeddings/vector search, or
   change production schema yet — none of that is justified by the
   evidence gathered so far.

## 8. Deliverables

- Workflow findings: `workflow-research-5-domains/WORKFLOW_RESEARCH_FINDINGS.md`
- Workflow gap matrix: `workflow-research-5-domains/WORKFLOW_GAP_MATRIX.csv`
- Workflow recommendations: `workflow-research-5-domains/CURIFY_WORKFLOW_RECOMMENDATIONS.md`
- Demo storyboards: `workflow-research-5-domains/demo_storyboards/`
- Inspiration source candidates: `inspiration-source-pilot/SOURCE_CANDIDATES.csv`, `inspiration-source-pilot/inspirations.jsonl`
- Visual gallery: `inspiration-source-pilot/gallery.html`
- Integration findings: `inspiration-source-pilot/INSPIRATION_INTEGRATION_FINDINGS.md`
- Query-bank recommendations: `inspiration-source-pilot/QUERY_BANK_RECOMMENDATIONS.md`
- Full QA detail: `FINAL_VALIDATION.md` (this directory)
