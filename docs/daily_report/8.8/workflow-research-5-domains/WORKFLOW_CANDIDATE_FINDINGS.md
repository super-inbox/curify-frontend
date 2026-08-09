# Workflow Candidate Findings — B1 External Discovery Pass

Compiled 2026-08-09. Covers external professional-workflow discovery for five
domains (Merch, Ecommerce, Education, Brand/Logo, Packaging), per
`../TASK_SCOPE_AND_EXECUTION_PLAN.md`. Full evidence detail for every
candidate is in `candidates/<candidate_id>-<slug>.md`; scores and status live
in `WORKFLOW_CANDIDATES.csv`.

This is a **discovery + scoring pass only**. No formal workflow extraction
(step-by-step reconstruction for demo use) was performed — that is Phase B2.

---

## Totals

- **18 candidates** collected across 5 domains (target range was 15–25).
- **11 STRONG_SELECT_CANDIDATE** (score 8–10)
- **4 BACKUP_OR_REVIEW** (score 6–7)
- **3 REJECT**, kept deliberately to document weak patterns for the review pass (score 4–5)

| Domain | Candidates | Strong (8–10) | Backup (6–7) | Reject |
|---|---|---|---|---|
| Merch | 4 | 2 | 1 | 1 |
| Ecommerce | 4 | 2 | 1 | 1 |
| Education | 3 | 1 | 2 | 0 |
| Brand/Logo | 3 | 3 | 0 | 0 |
| Packaging | 4 | 3 | 0 | 1 |

**Note:** an independent reviewer subagent checked this dataset after the
initial pass (see "Review pass" below) and found that ECOM-02 (Perfect
Corp's beauty virtual-try-on roundup) had been scored inconsistently with
comparable vendor-self-published sources — it was downgraded from STRONG (8)
to BACKUP_OR_REVIEW (7) as a result, along with three CSV Y/N flag
corrections (ECOM-02, EDU-03, PACK-03). The numbers above already reflect
those fixes.

Every domain has at least one well-evidenced STRONG_SELECT_CANDIDATE (score
≥8). No domain required a second targeted search pass to clear that bar,
though **Education** and **Merch** are comparatively thinner on independent,
high-authority sources (see "Domains that could use another pass" below).

---

## Strongest candidate per domain

**Merch** — two co-strongest candidates, both score 9:
- **MERCH-01**: [Anna — "把自己的插画做成产品"](https://www.zcool.com.cn/article/ZMTE3OTk3Mg==.html) (ZCOOL). A single designer's fully evidenced pipeline from campus-architecture illustration through five merch SKUs, packaging, multi-vendor QC, and Singapore trademark-law compliance. Most evidence-complete merch case found.
- **MERCH-02**: [LKK Design — Forbidden City Cat (故宫猫)](https://www.lkkdesign.com/anli/anlilook/id/65.html). Major studio's official case: 400 designers / 52 days, 200+ SKUs produced and sold via the Palace Museum's Tmall flagship. Highest source_authority in the domain.

**Ecommerce** — **ECOM-01**: [Meitu Design Studio — raw photo to Tmall detail page](https://www.designkit.cn/article/tianmaoxiangqingye-zhizuo) (score 9). Nearly a 1:1 structural match to Curify's own "1 phone photo → pro ad → campaign" baseline framing, with concrete platform constraints (image count, white-background mandate, composition ratio).

**Education** — **EDU-01**: [斑马AI课 (Zebra AI Class) deep-dive](https://www.woshipm.com/pd/3673908.html) (woshipm.com, score 9). Structurally near-identical to Curify's story → word cards → reading & translation → quiz baseline, backed by real cognitive-science reasoning (short-term-memory chunk limits driving repetition design).

**Brand/Logo** — three co-strongest candidates (scores 9, 9, 8):
- **BRAND-01**: [COLLINS — Institute of Design](https://wearecollins.com/case-studies/institute-of-design/)
- **BRAND-02**: [Pentagram — Fashion for Good](https://www.pentagram.com/work/fashion-for-good)
- **BRAND-03**: [Sabrina Young — Constellation rebrand and launch campaign](https://www.behance.net/gallery/185658399/CASE-STUDY-Constellation-rebrand-and-launch-campaign)

This is the only domain where every collected candidate cleared the STRONG bar — reflecting that major brand consultancies publish unusually complete brief-to-system case studies as a matter of course.

**Packaging** — two co-strongest candidates, both score 9:
- **PACK-01**: [造物起异包装设计 — 星河果酒](https://www.zcool.com.cn/article/ZMTU5ODMwOA==.html) (ZCOOL). Full pipeline including white-sample structural testing and Pantone color-proof verification.
- **PACK-02**: [Catalpha — Combat Comb shelf-ready packaging](https://blog.catalpha.com/getting-a-unique-new-to-market-pet-product-into-shelf-ready-packaging-for-major-retailers). Real dieline development checked against 3D software, iterative physical mockup testing.

---

## Weak / rejected patterns observed

Three recurring failure modes, one example of each kept in the dataset:

1. **Final-gallery-only, "process" claimed but not shown** (MERCH-04, Darin
   Michau Mascot Design Case Study). Multiple rendering styles and dozens of
   application mockups are shown, but no sketches/iteration trail or brief
   back the stated "process" framing, and no production/technical
   constraints are discussed. This matches the task's explicit warning
   against "a beautiful final-result-only gallery."
2. **Strategy/analysis piece mistaken for a project case study** (ECOM-04,
   the AIPL-model ZCOOL article). Real platform-differentiation insight
   (e.g. Pinduoduo's simplified list layout) but no single product's
   evidenced input→output journey — it's a comparative framework, not a
   workflow.
3. **Generic process description with no attached project** (PACK-04,
   独角狮设计's "包装设计流程"). Real commercial terms (40% deposit,
   printing agreement) but never tied to an actual input material or
   output — advice, not evidence.

A related soft pattern, not rejected but explicitly flagged in its own
candidate file: sources that are **real and well-documented but thin on one
specific evidence category** — e.g. Pentagram's Fashion for Good page shows
no sketches/iteration (evidence_completeness capped at 1 despite otherwise
strong scores), and the Pearlfisher/McDonald's PRINT Magazine piece
explicitly states it doesn't cover materials/sustainability/print specs.
These were kept as STRONG because the categories they *do* cover are deep
and well-sourced, but the gaps are called out rather than papered over.

---

## Domains that could use another targeted search pass

- **Education** (3 candidates, narrowest of the five): only one candidate
  (EDU-01) is a close structural match to Curify's story→cards→quiz
  baseline; the other two (Duolingo internship case study, Twinkl's generic
  process page) are backup-tier. A further pass specifically targeting
  **Chinese bilingual/ESL story-based curriculum publishers** (e.g. 叽里呱啦,
  伴鱼绘本, 有道) or **English graded-reader publishers with public design
  process writeups** (e.g. Usborne, Scholastic) might surface a second
  strong, story-to-full-pack case with more platform diversity.
- **Merch** (4 candidates, but only 1 is a non-Chinese source and only 1 is
  from a large agency rather than an individual designer or journalism
  piece): a further pass targeting **Western character-licensing studios**
  (e.g. Sanrio/Line Friends/Kakao Friends official process documentation,
  if any exists beyond business-press coverage) could balance the set.

Ecommerce, Brand/Logo, and Packaging are considered adequately covered for
this discovery phase (3 strong candidates each, drawn from distinct
platforms: vendor blogs, independent trade press, agency blogs, and
designer portfolios).

---

## Review pass

An independent reviewer subagent was spawned (general-purpose type) to
fresh-eyes-check this output for unsupported claims, duplicate URLs,
final-gallery-only cases mis-scored as strong, scoring consistency, domain
coverage, source accessibility, and source-quality mix.

**Findings:** total_score arithmetic was correct on all 18 rows; all
candidate_status labels matched their scoring band; all 18 source_urls were
unique; domain values were clean (`merch/ecommerce/education/brand_logo/packaging`,
3–4 per domain); the two deliberately-planted weak-pattern REJECT examples
(MERCH-04 gallery-only, ECOM-04 strategy-only) were correctly caught and not
mis-scored as strong; source-quality mix was judged healthy (official
studio/agency pages, trade journalism, and individual portfolios, not
over-reliant on one platform). It flagged: (1) three CSV Y/N flags that
contradicted their own candidate file's text (ECOM-02 process_visible,
EDU-03 process_visible/output_visible, PACK-03 professional_constraints_visible);
(2) an inconsistency where ECOM-02 (Perfect Corp, self-published vendor
content) was scored source_authority=2 while structurally identical vendor
case content (ECOM-01 Meitu, ECOM-03 soona) was scored source_authority=1,
with no differentiating rationale — and noted ECOM-02's low
workflow_visibility/evidence_completeness profile matched ECOM-04's
(REJECTED) pattern; (3) two unusually specific claims (BRAND-03's precise
internal sales figures from an individual's Behance post; MERCH-02's "AI
robots" and "only IP-image product line" claims) that were plausible and
genuinely stated on their source pages but not independently cross-verified.

**Fixes applied:** corrected the three CSV Y/N flags; downgraded ECOM-02
from STRONG_SELECT_CANDIDATE (8) to BACKUP_OR_REVIEW (7) by lowering
source_authority to 1 for consistency, updating both the CSV row and
`candidates/ECOM-02-perfectcorp-beauty-tryons.md`; added explicit
verification-caveat notes to `candidates/BRAND-03-constellation-rebrand.md`
and `candidates/MERCH-02-lkk-forbidden-city-cat.md` flagging the
unverified-but-source-stated claims. All fixes are reflected directly in the
CSV and the affected candidate files; this findings doc's totals table above
already reflects the post-fix numbers.
