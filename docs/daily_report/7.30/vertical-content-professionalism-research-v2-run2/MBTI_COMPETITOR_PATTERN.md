# MBTI Competitor Pattern Summary

**research_run_id:** vertical-content-professionalism-research-v2-run2
**source:** `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` (MBTI rows) + `SELECTED_PAGE_EVIDENCE_INDEX.md` §MBTI
+ `CURRENT_IMPLEMENTATION_AUDIT.md` for Curify's existing implementation state.

---

## 1. Research scope

- **Search queries used:** 6 (`MBTI_01`–`MBTI_06`)
- **SERP results viewed:** 6 (one organic result recorded and screenshotted per query)
- **Internal pages opened:** 6 (every query has a `*_content.png` click-through screenshot)
- **Final representative pages selected:** 4 (`MBTI_01`, `MBTI_02`, `MBTI_04`, `MBTI_05`); 2 excluded as
  visual references only (`MBTI_03`, `MBTI_06`)

## 2. Selected competitors

| Page | Rank | Page type | Key professional modules | Strength | Limitation |
|---|---|---|---|---|---|
| MBTI_01 — Naruto MBTI chart (personality-database.com) | 3 | Entity collection + per-entity mini-profile (fandom database) | Category filters, character card grid, per-character type tag, vote counts, discussion entry | Character aggregation + type-tag system + internal linking at scale | Needs a pre-built character roster and crowd-voting infrastructure |
| MBTI_02 — INFJ posters (redbubble.com) | 2 | Marketplace collection page | Related-type tags, filter/sort, product grid with price/discount | Shows commercial poster-collection & tag-based browse pattern | No trait/strength/career/relationship content — commerce only |
| MBTI_04 — Taylor Swift MBTI (personality-database.com) | 2 | Single-entity profile page | Identity tags, multi-system type labels (MBTI+Enneagram+Big Five+Zodiac), segmented content blocks, related-celebrity nav, voting/comments | Most complete single-entity IA: bio + analysis + related links + engagement | Depends on celebrity fame and community voting data Curify doesn't have |
| MBTI_05 — MBTI compatibility chart (jobcannon.io) | 2 | Editorial + interactive data-tool page | Compatibility definition, full 16×16 matrix, scoring methodology, Top-10 pairs, browse-by-type, FAQ, CTA | Strongest structured-data + explanatory-content + FAQ combination found | Needs a full 256-pair scored dataset — a data-tool build, not just content authoring |

## 3. Repeated patterns

Only patterns confirmed on **2 or more** of the 4 selected pages are listed.

### Pattern: Type code as a visible, structured attribute
- **What users see:** the MBTI 4-letter type shown as a distinct, tagged element (a chip, header label,
  or column), not buried in prose — e.g. INFJ tags on MBTI_02, "ESFJ" as a labeled field on MBTI_04,
  per-character type tags on MBTI_01, the type axis of the matrix on MBTI_05.
- **Why it helps SEO:** the type code becomes a discrete, indexable/facetable value — the basis for
  `/mbti/infj`-style landing pages and for schema.org `additionalProperty` / `DefinedTerm` markup.
- **Why it helps user intent:** most MBTI searches are anchored on a type code or an entity+type pair;
  surfacing it as a labeled value (not just inline text) answers the query at a glance.
- **Evidence pages:** MBTI_01, MBTI_02, MBTI_04, MBTI_05 (all 4).
- **Curify status:** Curify's own schema already has this field —
  `type_code` in `lib/vertical_schema.ts:75` (`facet: true`), rendered by `VerticalAttributeChips`
  (`VerticalKnowledge.tsx:11-30`). Per `CURRENT_IMPLEMENTATION_AUDIT.md` Q4, this is **wired but has
  zero authored content anywhere** — no page currently renders an MBTI chip.

### Pattern: Type/entity-based internal linking network
- **What users see:** links out to "other characters with this type," "related celebrities," "browse
  by type," or "top compatible pairs" — the page never dead-ends on one entity or one type.
- **Why it helps SEO:** builds a dense internal-link graph across a whole type/entity taxonomy, which
  is exactly the "hub & spoke" authority-consolidation pattern the design doc already targets.
- **Why it helps user intent:** MBTI browsing is inherently comparative/exploratory ("what type is X,"
  "who else is this type," "what type am I compatible with") — one-entity pages without this linking
  feel like dead ends.
- **Evidence pages:** MBTI_01 (character links), MBTI_02 (related-type tags), MBTI_04 (related
  celebrities), MBTI_05 (browse-by-type, Top-10 pairs).
- **Curify status:** **missing.** `CURRENT_IMPLEMENTATION_AUDIT.md` found no MBTI content authored at
  all (Q4), so there is nothing to link between yet; more structurally, no "related type" or
  "related character" linking mechanism exists in the template or example page code today (only a
  generic sr-only topic-chip link to `/topics/<slug>`, not an entity/type-specific related-content
  module).

### Pattern: Segmented knowledge blocks under clear headings
- **What users see:** the page's knowledge content is split into named sections (e.g. MBTI_04's
  "Taylor Swift MBTI" / "Taylor Swift Enneagram" / "Big Five Personality Traits" / "About Taylor
  Swift"; MBTI_05's definition / methodology / FAQ), not one undifferentiated block of prose.
- **Why it helps SEO:** each heading is a distinct topical target and a candidate for its own featured
  snippet; segmenting also lets crawlers/LLM summarizers extract specific facts cleanly.
- **Why it helps user intent:** scanning readers jump straight to the sub-question they came for
  (career fit vs. relationships vs. compatibility) instead of reading linearly.
- **Evidence pages:** MBTI_04, MBTI_05.
- **Curify status:** **partially present as a code capability, not yet exercised.** The schema already
  has 7 separate knowledge slots (`traits`, `strengths`, `weaknesses`, `communication`, `relationships`,
  `career`, `compatibility` — `lib/vertical_schema.ts:80-88`), rendered as a `<dl>` of labeled sections
  by `VerticalKnowledgeSection` (`VerticalKnowledge.tsx:32-51`). Per the audit, zero MBTI pages have
  ever populated these slots.

### Pattern: Community engagement signals (votes/comments)
- **What users see:** vote counts and a discussion/comment entry point tied to the type verdict itself
  (not just generic page comments).
- **Why it helps SEO:** engagement signals and periodically-refreshed user-generated content are a
  freshness/authority signal, and the underlying votes double as the "how do we know this type is
  right" trust mechanism.
- **Why it helps user intent:** MBTI-typing of real people/characters is inherently subjective; showing
  a vote distribution answers "is this consensus or one person's opinion" directly.
- **Evidence pages:** MBTI_01, MBTI_04.
- **Curify status:** **missing**, and out of scope as a content change — this is a product/community
  feature (voting, accounts, moderation), not a content-authoring or schema field. Flagged here for
  awareness, not proposed as a Phase-2 content module.

## 4. Page-type differences

- **Entity collection + per-entity profile** (MBTI_01): a directory of many characters, each with its
  own compact profile.
- **Single-entity profile page** (MBTI_04): one person, deep multi-system analysis.
- **Marketplace/collection page** (MBTI_02): commerce-first, type used only as a browse tag.
- **Editorial + interactive data-tool page** (MBTI_05): not about any one entity — a reference/utility
  page over the full type system.

These are four structurally different page types, not variations of one template. Curify's MBTI
template pages most resemble MBTI_04's shape (one page = one context) but currently have none of its
knowledge depth or internal linking.

## 5. Curify gap analysis

| Dimension | Finding |
|---|---|
| Current support | `VerticalSchema` for MBTI is fully coded (4 attributes, 7 knowledge slots, `schemaOrgType: "Article"`) and wired into the template page's chip strip, knowledge section, and JSON-LD builder (`CURRENT_IMPLEMENTATION_AUDIT.md` Q4, Q10-12) |
| Missing | Any authored content — **zero** MBTI templates have populated `content.attributes`/`content.vertical` in `messages/{en,zh}/nano.json` (audit Q4); no example-page rendering at all (audit Q13-16); no type-based or entity-based internal-linking module |
| Too generic | Without authored attributes/knowledge, MBTI template pages render as the same flat `title → examples → Generate` shape as every other template — no type identity, no entity context |
| Needs vertical-specific data | Type-code assignments, trait/strength/weakness/career/relationship/compatibility prose per template (and, per `docs/vertical-page-schema-v1.md`'s "which level" analysis, per-example attribute derivation via a not-yet-built `deriveExampleAttributes` function — audit Q17-18) |
| Needs stronger internal linking | No related-type or related-character module exists on either the template or example route today |
| Needs structured data | JSON-LD builder already supports MBTI (`node.about = type_code`, `lib/nano_seo_utils.ts:471-472`) but has never fired for lack of content; example pages emit only a generic `HowTo` schema regardless of vertical (audit Q16) |
| Needs professional copy | All 7 knowledge slots are empty for every MBTI-routed template |
| Needs trust/source/methodology signals | MBTI_05's "scoring methodology" explanation has no Curify equivalent anywhere; Curify has no disclaimer/methodology pattern for any vertical |

## 6. Recommended Curify modules

- **P0 — required:**
  - Author `type_code` (+ `type_nickname`, `dimensions`) attribute values for at least the confirmed
    real MBTI templates (see `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`) — this alone activates the
    already-built chip strip.
  - Author the `traits` / `strengths` / `weaknesses` / `career` knowledge slots for the same templates
    — activates the already-built knowledge section.
- **P1 — valuable:**
  - A short, non-interactive **compatibility summary** (2-3 "pairs well with" / "friction with" lines
    using the existing `compatibility` knowledge slot) rather than a full matrix — captures the *intent*
    of MBTI_05's pattern at authoring-only cost.
  - A **related-type / related-template internal-linking module** on both template and example pages
    (distinct from the existing sr-only topic chips).
  - A small **FAQ block** per MBTI template, mirroring MBTI_05's long-tail Q&A pattern.
- **P2 — optional:**
  - A full interactive type×type compatibility matrix (data-tool scope, not content scope).
  - Any community voting/consensus mechanism (product feature, not content).

## 7. What should not be copied

- **Personality-database.com's crowd-voting/consensus system** (MBTI_01, MBTI_04) — infrastructure
  Curify does not have and this round is not scoped to build.
- **Redbubble's commerce cart/checkout/pricing modules** (MBTI_02) — Curify's template/example pages
  are not a marketplace; only the tag-based browse pattern is transferable, not the buy flow.
- **The full 256-pair interactive compatibility matrix** (MBTI_05) — a standalone data-tool product,
  not a page-content pattern; do not copy it wholesale onto a template page, only borrow the smaller
  "compatibility summary" idea (see P1 above).
- **Pinterest-style image waterfalls** (excluded `MBTI_03`, `MBTI_06`) — these were explicitly excluded
  because they are image-discovery aggregators with no authored text structure; high visual density is
  not itself a "professional content" signal and should not be mistaken for one just because it ranks.
