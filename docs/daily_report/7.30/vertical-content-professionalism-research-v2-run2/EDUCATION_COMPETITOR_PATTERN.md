# Education Competitor Pattern Summary

**research_run_id:** vertical-content-professionalism-research-v2-run2
**source:** `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` (Education rows) + `SELECTED_PAGE_EVIDENCE_INDEX.md`
§Education + `CURRENT_IMPLEMENTATION_AUDIT.md` for Curify's existing implementation state.

---

## 1. Research scope

- **Search queries used:** 6 (`EDU_01`–`EDU_06`)
- **SERP results viewed:** 6
- **Internal pages opened:** 6 (every query has a `*_content.png` click-through screenshot)
- **Final representative pages selected:** 4 (`EDU_01`, `EDU_02`, `EDU_04`, `EDU_06`); 2 excluded as
  visual references only (`EDU_03`, `EDU_05`)

## 2. Selected competitors

| Page | Rank | Page type | Key professional modules | Strength | Limitation |
|---|---|---|---|---|---|
| EDU_01 — 3rd grade multiplication worksheets (canva.com) | 2 | Template marketplace / collection page | Breadcrumb, H1, search, filter entry, wide sub-topic worksheet grid | Template-discovery and creation-entry pattern directly analogous to Curify's own pages | No learning-objective / age / difficulty / teaching-note modules |
| EDU_02 — Spanish vocabulary flashcards (flashcardo.com) | 5 | Resource hub | Topic-categorized nav, 1,000-word frequency-ranked entry points, multiple formats (ebook, PDF, Anki, video), related-language links | Full classification + frequency system + multi-format + download + related-content architecture | Requires a large structured vocabulary dataset Curify doesn't currently author |
| EDU_04 — Periodic table infographics (compoundchem.com) | 1 | Editorial content hub | Breadcrumb, H1, card-organized deep-dive articles with preview image/date/engagement stats/detail link | The clearest "professional content hub" pattern in this vertical — subtopic depth + freshness + internal linking | Requires sustained editorial output (many distinct articles), not a one-time authoring task |
| EDU_06 — Human body diagram worksheets (canva.com) | 4 | Template marketplace / collection page | Breadcrumb, H1, search/filter, wide sub-topic worksheet grid | Second data point confirming EDU_01's template-grid pattern | Same as EDU_01 — no grade/objective/difficulty/teaching-note modules |

## 3. Repeated patterns

Only patterns confirmed on **2 or more** of the 4 selected pages are listed.

### Pattern: Breadcrumb + explicit H1 wayfinding
- **What users see:** a breadcrumb trail above a clear, specific H1 (not just a generic site title).
- **Why it helps SEO:** breadcrumbs both aid crawl-path understanding and are eligible for
  `BreadcrumbList` rich results; a specific H1 matches long-tail query intent more precisely than a
  generic one.
- **Why it helps user intent:** confirms to the visitor they landed in the right sub-topic and gives an
  easy path back up to the parent category.
- **Evidence pages:** EDU_01, EDU_04, EDU_06.
- **Curify status:** **missing on the template page.** Repo-wide grep of
  `app/[locale]/(public)/nano-template/[slug]/page.tsx` found no breadcrumb component; the page does
  carry a topic-chip link to `/topics/<slug>` but it is rendered `sr-only` (screen-reader only, not
  visible) per the code comment at `page.tsx:198-203`. The **example** page does render a visible
  breadcrumb (`example/[exampleId]/page.tsx:350`) — the gap is specific to the template/hub page.

### Pattern: Exhaustive sub-topic/format breadth under one umbrella topic
- **What users see:** the page doesn't stop at one worksheet/resource — it shows a wide, concrete
  spread of variations (EDU_01: arrays, number lines, times tables, fact families, properties;
  EDU_02: 1,000 frequency-ranked words across topics; EDU_04: element-discovery history, women
  scientists, oxidation states, name origins, alternate table designs; EDU_06: body-part ID, organs,
  senses, vocabulary matching, fill-in-the-blank, labeling, body functions).
- **Why it helps SEO:** breadth-in-depth under one page/section captures a much wider long-tail query
  set than a single-variant page, without fragmenting into thin near-duplicate pages.
- **Why it helps user intent:** teachers/parents searching a grade+subject combination usually want to
  browse options, not land on exactly one fixed worksheet.
- **Evidence pages:** EDU_01, EDU_02, EDU_04, EDU_06 (all 4).
- **Curify status:** **partially analogous, not directly comparable.** Curify's template/example split
  already produces breadth (each template has an example family — per
  `docs/vertical-page-schema-v1.md`, "3,550 examples vs 346 templates"), but that breadth lives across
  separate example URLs, not as a single browsable grid on the template page itself, and none of it is
  organized by a pedagogical axis (grade/skill/difficulty) the way these competitor pages are.

### Pattern: Topic/subtopic taxonomy as the primary navigation structure
- **What users see:** content is reached by first choosing a topic/subtopic category, not by scrolling
  a flat list — EDU_02's topic-categorized flashcard nav, EDU_04's subtopic article cards.
- **Why it helps SEO:** each taxonomy node becomes an addressable landing target and a facet for
  programmatic SEO (grade × subject × resource-type style browsing).
- **Why it helps user intent:** lets a visitor self-select the exact sub-area they need instead of
  scanning irrelevant material.
- **Evidence pages:** EDU_02, EDU_04.
- **Curify status:** Curify already has a separate three-tier taxonomy system (`lib/taxonomy.json`,
  tier1-4, confirmed by `CURRENT_IMPLEMENTATION_AUDIT.md` §1) and a `taxonomyAxis` field on each
  Education `AttributeDef` (`lib/vertical_schema.ts:53-60`), but the audit found `taxonomyAxis` is
  "read nowhere" outside its own definition (audit Q26) — it does not drive any taxonomy
  cross-reference or navigation today, so this pattern is closer to a **documented but inert** gap
  than a from-scratch one.

## 4. Page-type differences

- **Template marketplace / collection page** (EDU_01, EDU_06): closest in kind to Curify's own
  template pages — a category umbrella over many creation-ready variants.
- **Resource hub** (EDU_02): organized around a taxonomy of the *subject matter* (vocabulary topics),
  not around templates/formats.
- **Editorial content hub** (EDU_04): a magazine-style index of standalone deep-dive articles; the
  least template-like of the four, closer to a blog category page.

Two of the four selected pages (EDU_01, EDU_06) are the same page type — this is a genuine repeated
pattern, not just a coincidence of the query set, and is the closest evidence to "what a strong
version of Curify's own template-hub page looks like."

## 5. Curify gap analysis

| Dimension | Finding |
|---|---|
| Current support | Education is the only vertical with real shipped content: `template-hsk-bilingual-reading-text-lesson-poster` has all 8 attributes + all 3 knowledge slots authored in both `en` and `zh` (audit Q19-21), rendering chips, a knowledge section, and `LearningResource` JSON-LD on its template page |
| Missing | Everything found in §3 above beyond that one pilot: a visible breadcrumb on the template page, an exhaustive same-page sub-topic browse grid, and any working taxonomy-driven navigation (the `taxonomyAxis` field is inert per audit Q26) |
| Too generic | Every Education template except the one HSK pilot renders with the same flat, un-enriched shape as any other vertical's template |
| Needs vertical-specific data | `content.attributes`/`content.vertical` authored for more templates — only 1 of many Education-routed templates has any (audit Q3, Q29) |
| Needs stronger internal linking | No related-worksheet/related-template module confirmed on any Education page; only the sr-only topic chip |
| Needs structured data | `buildVerticalJsonLd` already maps `learningResourceType`, `educationalLevel`, `typicalAgeRange`, `about`, `teaches`, `timeRequired` for Education (`lib/nano_seo_utils.ts:461-467`) — this works today for HSK and would work immediately for any newly-authored template, no code change needed |
| Needs professional copy | Learning-objective / includes / background prose for every Education template beyond HSK |
| Needs trust/source/methodology signals | None of the 4 selected pages showed an explicit methodology/sourcing disclaimer (unlike MBTI_05) — not flagged as a gap specific to this vertical based on current evidence |

## 6. Recommended Curify modules

- **P0 — required:**
  - Author `content.attributes`/`content.vertical` for the next tranche of real Education templates
    beyond HSK (see `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`) — the rendering and JSON-LD path is
    already proven end-to-end by the HSK pilot, so this is authoring cost only, not new code.
  - A visible breadcrumb on the template page (currently sr-only-only topic linking).
- **P1 — valuable:**
  - A same-page "browse related worksheets/resources within this topic" grid module, modeled on the
    EDU_01/EDU_06 template-grid pattern, to concentrate related long-tail variants under one hub URL.
  - Activating `taxonomyAxis` as a real navigation/facet signal rather than inert metadata (ties to the
    existing `lib/taxonomy.json` system, not a new taxonomy).
- **P2 — optional:**
  - A magazine-style "deep-dive article" content hub in the EDU_04 style — valuable but a sustained
    editorial commitment, not a page-template change.

## 7. What should not be copied

- **Canva's full commercial template-editor product** (EDU_01, EDU_06) — Curify should study the
  *browse/discovery* layer (breadcrumb, grid, sub-topic breadth), not attempt to replicate Canva's
  in-browser design-editor product, which is a different product category entirely.
- **Flashcardo's specific format lineup** (ebook + Anki export + video) (EDU_02) — the *organizing
  principle* (topic taxonomy + frequency ranking) is transferable; the specific output formats are not
  something Curify's image-generation product currently produces and shouldn't be copied just because
  a competitor offers them.
- **CompoundChem's blog/article publishing cadence** (EDU_04) — this is an editorial content-hub
  pattern with its own resourcing model (frequent new articles); treating it as a one-time template
  page addition would misrepresent the actual effort required.
- **Pinterest-style image waterfalls** (excluded `EDU_03`, `EDU_05`) — visually rich but structurally
  empty; excluded for the same reason as the MBTI Pinterest results — no reusable page architecture.
