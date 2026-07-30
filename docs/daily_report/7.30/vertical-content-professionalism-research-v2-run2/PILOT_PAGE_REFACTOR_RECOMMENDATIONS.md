# Pilot Page Refactor Recommendations — MBTI / Education / Merch

**research_run_id:** vertical-content-professionalism-research-v2-run2
**method:** every slug below was directly verified this round against
`public/data/nano_templates.json` (exists, `topics[]` intersects the vertical's `topicMatch` list in
`lib/vertical_schema.ts`) and against `messages/en/nano.json` (confirmed to have **empty**
`content.attributes`/`content.vertical` today, i.e. genuinely un-enriched — verification command
output included below). No slug was guessed; where the repo could not confirm a candidate, it is not
listed.

**GSC signal provenance:** the impression/rank/URL-count figures cited per candidate are **not**
freshly pulled this round (no new GSC query was run, consistent with "no new Google searches" for this
round) — they are carried over from the already-mined cohort in `docs/vertical-page-schema-v1.md`
("Pilot cohort — GSC-mined," dated 2026-07-28, 3 days before this document). They are cited as
directional prior evidence, not re-validated current numbers; re-pulling GSC before implementation is
listed as a required step below, not assumed already done.

---

## Verification evidence (this round)

```
template-mbti-generic                          -> present in nano_templates.json; attributes: {}; vertical: {}
template-mbti-yellowstone                       -> present; attributes: {}; vertical: {}
template-friends-character-mbti                 -> present; attributes: {}; vertical: {}
template-chinese-classic-character-mbti         -> present; attributes: {}; vertical: {}
template-chinese-idiom-learning-card            -> present; attributes: {}; vertical: {}
template-education-card                         -> present; attributes: {}; vertical: {}
template-kids-vocabulary-poster                 -> present; attributes: {}; vertical: {}
template-city-landmark-fridge-magnet-collection -> present; attributes: {}; vertical: {}
template-food-product-packaging-design          -> present; attributes: {}; vertical: {}
template-ip-creative-cultural-goods-mockup-set  -> present; attributes: {}; vertical: {}
template-fridge-magnet-merch                    -> present; attributes: {}; vertical: {}
```

Topic-routing confirmation (each template's `topics[]`, intersected against
`lib/vertical_schema.ts`'s `topicMatch` lists — `["mbti", ...]` / `["education","learning",...,
"vocabulary",...]` / `["merch","packaging","magnet",...]`):

- MBTI candidates all carry `"mbti"` in `topics[]` → route to the MBTI vertical.
- Education candidates carry `"education"` (HSK, already shipped), `"vocabulary"` (idiom card, kids
  vocab poster), or `"learning"` (education-card) → route to the Education vertical.
- Merch candidates carry `"merch"` (city-landmark magnets, ip-goods mockup set, fridge-magnet-merch) or
  `"packaging"` (food packaging design) → route to the Merch vertical.

---

## MBTI

### Pilot 1 — `template-mbti-generic`
- **Why this page:** the design doc's own GSC mining flags it as the single highest-lift MBTI target —
  833 impressions but average position 13.7 (page 2, effectively unranked) across 88 example URLs; the
  largest MBTI example family found. A large audience is already reaching this template's family
  without the page currently earning rank.
- **Search intent:** general "what MBTI type is [person/character]" queries not anchored to one
  specific franchise — the broadest, least niche MBTI template.
- **Current weakness:** per `CURRENT_IMPLEMENTATION_AUDIT.md` Q4, this template (like every MBTI
  template) has zero authored `content.attributes`/`content.vertical` — it renders with no type chip,
  no knowledge section, and no vertical JSON-LD despite the code path being fully wired.
- **Proposed modules:** `type_code`/`type_nickname`/`dimensions` attributes; `traits`/`strengths`/
  `career` knowledge slots at minimum (per `MBTI_COMPETITOR_PATTERN.md` §6 P0); a related-type
  internal-linking module (P1, net-new capability — see `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md`).
- **Required data:** authored English + Chinese prose for the knowledge slots; since this is a
  "generic" multi-subject template rather than one fixed entity, the attribute values likely need to be
  template-level (format-level) rather than one fixed type — this needs human judgment on what "type"
  content applies at the template level vs. what should wait for `deriveExampleAttributes` at the
  example level (Q17-18, still unbuilt).
- **Expected SEO improvement:** per the design doc's stated measurement plan — improved average
  position and impressions on domain/long-tail MBTI queries (not just brand queries), `Article`-type
  rich-result eligibility once JSON-LD fires.
- **Implementation complexity:** Low-Medium for the template page (proven, unchanged code path from the
  HSK pilot); the "generic" multi-subject nature of this template adds authoring judgment overhead
  other, more specific MBTI templates won't have.
- **Validation method:** re-pull GSC (`scripts/pull_gsc_performance.cjs`, per the design doc roadmap)
  before and 4–6 weeks after enrichment; track average position and impressions on this template's own
  query set, not a fixed control group (per the design doc's already-adopted self-referential
  measurement approach).

### Pilot 2 — `template-mbti-yellowstone`
- **Why this page:** second-largest MBTI family (684 impr / 51 urls) and explicitly flagged in the
  design doc as "durable fandom (not WC-transient)" — i.e. not a seasonal spike that would make
  before/after measurement noisy.
- **Search intent:** franchise/character-anchored MBTI queries (Yellowstone TV show characters), closer
  in shape to this round's own `MBTI_01` (Naruto) and `MBTI_04` (Taylor Swift) evidence — a named-entity
  + MBTI pattern.
- **Current weakness:** same as Pilot 1 — zero authored vertical content today.
- **Proposed modules:** same P0 set as Pilot 1, plus — because this is a named-cast template — the
  related-character internal-linking module is a more natural fit here than on the generic template
  (mirrors `MBTI_01`'s evidenced pattern directly).
- **Required data:** per-character type assignments and knowledge prose for the show's main cast.
- **Expected SEO improvement:** same measurement axis as Pilot 1.
- **Implementation complexity:** Low — a named, bounded cast makes attribute/knowledge authoring more
  tractable than the "generic" template.
- **Validation method:** same as Pilot 1.

### Later — `template-friends-character-mbti`, `template-chinese-classic-character-mbti`
- Both are real, routed, un-enriched templates (verified above) with smaller GSC families (240 and 110
  impressions respectively). Recommended as the next tranche **after** Pilot 1/2's 4–6 week read-out,
  not blocked on anything structural — same code path, same authoring pattern.

---

## Education

### Pilot 1 — `template-chinese-idiom-learning-card`
- **Why this page:** design doc flags it as "discovered-not-ranking" — 75 impressions but average
  position 16.4 (worse than page 1) across 11 URLs — a clear case of demand existing without the page
  earning the rank it should for its actual content quality.
- **Search intent:** language-learning card queries close in shape to this round's own `EDU_02`
  (Spanish vocabulary flashcards) evidence — topic-categorized vocabulary content.
- **Current weakness:** un-enriched (verified above) — same flat shape as any non-pilot template.
- **Proposed modules:** `grade_band`/`subject`/`skill`/`resource_type`/`difficulty` attributes;
  `learning_objective`/`includes` knowledge slots — the exact fields already proven end-to-end by the
  shipped HSK pilot, applied to a second, real Education template.
- **Required data:** learning-objective and includes prose per idiom set; grade/skill/difficulty
  classification for the idiom-card format.
- **Expected SEO improvement:** `LearningResource` JSON-LD eligibility (already coded and proven for
  Education, `lib/nano_seo_utils.ts:461-467` — fires automatically once content is authored, no code
  change needed); improved average position from 16.4 toward page 1 on domain queries.
- **Implementation complexity:** Lowest of all candidates in this document — Education's rendering and
  JSON-LD path is the only one with a live proof-of-concept (HSK) to copy exactly.
- **Validation method:** same GSC before/after approach as the MBTI pilots.

### Pilot 2 — `template-education-card`
- **Why this page:** the largest Education example family found (95 impr / 34 urls) — enriching the
  template lifts the widest example set.
- **Search intent:** general science/education card queries — broader and less format-specific than
  the idiom-card pilot, closer in shape to this round's `EDU_04` (Compound Interest periodic-table hub)
  evidence in terms of subject breadth, though the competitor page type differs (editorial hub vs.
  Curify's template hub).
- **Current weakness:** un-enriched (verified above).
- **Proposed modules:** same P0 attribute/knowledge set as Pilot 1; because this template covers
  multiple science subtopics, also a candidate for the "exhaustive sub-topic breadth" pattern from
  `EDUCATION_COMPETITOR_PATTERN.md` §3 (same-page related-resource grid) given its large family size.
- **Required data:** subject/grade/skill classification and learning-objective prose across its
  broader subject range — more authoring surface than the idiom-card pilot because the template spans
  more subtopics.
- **Expected SEO improvement:** same axis as Pilot 1, at larger scale (34 URLs vs. 11).
- **Implementation complexity:** Medium — larger, less homogeneous subject range means more authoring
  judgment per sub-topic than a single-format template.
- **Validation method:** same as Pilot 1.

### Later — `template-kids-vocabulary-poster`
- Real, routed, un-enriched (verified above), smaller family (16 impr / 3 urls) but the design doc
  calls it a "clean vocab ontology fit" — good low-risk 3rd candidate once Pilot 1/2 read out.

---

## Merch

### Pilot 1 — `template-city-landmark-fridge-magnet-collection`
- **Why this page:** design doc calls it "perfect material/process/DPI depth" — i.e. the template's
  actual subject matter (physical fridge magnets) is the best structural fit for Merch's
  `material`/`process`/`dimensions`/`print_spec` attribute set of any candidate found.
- **Search intent:** closest in shape to this round's own `MER_01` (Yellowstone decal) evidence — a
  place/landmark-themed physical souvenir product.
- **Current weakness:** un-enriched (verified above) — no material/process/story content despite the
  schema being ready.
- **Proposed modules:** `product_type`/`material`/`process`/`dimensions` attributes;
  `cultural_background` knowledge slot (highest-leverage per `MERCH_COMPETITOR_PATTERN.md` §6 P0 — the
  "why this landmark" story, directly analogous to MER_01's "why YELL?" explainer).
- **Required data:** per-city/landmark background prose; magnet material/process/size specs (acrylic vs.
  other material, printing process, standard dimensions).
- **Expected SEO improvement:** `Product` JSON-LD eligibility (already coded, `material`/`category`
  fields, `lib/nano_seo_utils.ts:468-470` — fires once authored); improved discoverability for
  place+souvenir long-tail queries.
- **Implementation complexity:** Low — small family (3 URLs) keeps authoring scope tight, and the
  product type is concrete and singular (fridge magnets), unlike more heterogeneous Merch templates.
- **Validation method:** same GSC before/after approach as the other pilots.

### Pilot 2 — `template-food-product-packaging-design`
- **Why this page:** design doc calls it "packaging spec depth" — a second, structurally different
  Merch product type (packaging design vs. a physical souvenir object), testing whether the schema
  generalizes across Merch sub-categories.
- **Search intent:** packaging/mockup-style queries, structurally closer to this round's excluded
  `MER_03`/Ecommerce-adjacent territory than to MER_01/04/05/06 — flagged as the candidate with the
  **least direct overlap** with this round's 4 selected Merch pages, so its fit should be judged
  cautiously rather than assumed.
- **Current weakness:** un-enriched (verified above).
- **Proposed modules:** `product_type`/`material`/`process`/`print_spec` attributes; `design_requirements`/
  `manufacturing_notes` knowledge slots (print-ready spec expectations, per
  `MERCH_COMPETITOR_PATTERN.md` §6 P1) rather than `cultural_background` as the lead slot, since
  packaging design is more spec-driven than story-driven in this round's evidence.
- **Required data:** packaging material/print-spec prose; design-requirement notes (bleed, resolution,
  etc., per the existing design doc's Merch field examples).
- **Expected SEO improvement:** same JSON-LD/rank axis as Pilot 1.
- **Implementation complexity:** Medium — packaging is a less singular product category than fridge
  magnets, and this round's competitor evidence for it is thinner (no selected Merch page was a
  packaging-design page specifically; closest is the excluded/deferred Ecommerce packaging queries,
  which are out of this round's evidence base).
- **Validation method:** same as Pilot 1, with extra attention to whether the authored copy actually
  matches real user search intent for this template (weaker evidence base than Pilot 1).

### Later — `template-ip-creative-cultural-goods-mockup-set`, `template-fridge-magnet-merch`
- `template-ip-creative-cultural-goods-mockup-set`: design doc calls it the "文创 anchor," but its GSC
  signal is thin (3 impr, avg pos 30) — worth enriching once Pilot 1/2 validate the approach, not as a
  first mover.
- `template-fridge-magnet-merch`: confirmed to exist and route correctly (verified above), but no GSC
  history was available in the design doc's own mining ("new" / "fresh top-10-drop") — treat as an
  unvalidated candidate pending its own GSC pull, not a data-backed pilot pick this round.

---

## Priority summary

| Priority | MBTI | Education | Merch |
|---|---|---|---|
| Pilot 1 | `template-mbti-generic` | `template-chinese-idiom-learning-card` | `template-city-landmark-fridge-magnet-collection` |
| Pilot 2 | `template-mbti-yellowstone` | `template-education-card` | `template-food-product-packaging-design` |
| Later | `template-friends-character-mbti`, `template-chinese-classic-character-mbti` | `template-kids-vocabulary-poster` | `template-ip-creative-cultural-goods-mockup-set`, `template-fridge-magnet-merch` |

All 11 candidates above are real, verified, currently-routed, currently-un-enriched templates. None of
this list is a guess — every slug was checked against `public/data/nano_templates.json` and
`messages/en/nano.json` in this round (see "Verification evidence" above). GSC figures should be
re-pulled immediately before implementation begins, since they were last mined 2026-07-28 in the design
doc, not this round.
