# VerticalPageSchema v1 — vertical domain-knowledge layer for template/example pages

_2026-07-28. Owner: jay. Design doc — not yet implemented. Driven by
`raw/seo-content-authority-07-28/discussion.txt`. Companion to
`docs/search-and-content.md` (Thread b taxonomy) and `docs/etsy-packs.md`._

## The problem (root cause, not "more URLs")

Curify's template/example pages are a **flat horizontal asset layer**: `title → examples →
Generate`. To Google and to buyers they read like a generic AI-image generator, not a site that
_understands_ education, personality, heritage, or manufacturing. We can already get 10,000 pages
_discovered_; the unsolved question is **"once discovered, why should Google rank them?"**

The fix is not a new domain and not more articles. It's a **vertical domain-knowledge layer** added
_on top of_ the existing URLs — each vertical getting its own professional content structure (its own
ontology), the way TpT/Twinkl have an Education ontology and 16Personalities has a Personality
ontology. **One domain, multiple vertical products.**

> Knowledge content earns authority/search; the generation tools earn conversion. Curify's edge is
> both on one page. (`discussion.txt`)

## The 4 pillars (every vertical page follows this spine)

Each vertical page is built from four pillars — **Know → Structure → Show → Make**:

| # | Pillar | What it is | Job | Where it lives today |
|---|--------|-----------|-----|----------------------|
| **1** | **Knowledge** (领域权威) | Authored domain prose: what this format/subject _is_, why it matters, background & best practice | Earns **SEO authority** (topical depth) | partially: `content.sections` what/who/how on 330/350 templates (template page only) |
| **2** | **Attributes** (结构化本体) | Machine-readable ontology fields for THIS page (Grade/Subject/Skill · Type/Career · Dynasty/Material…) | Enables **faceted browse + schema.org rich results + programmatic SEO** | ❌ missing — this is the core gap |
| **3** | **Assets** (示例资产) | Template examples, gallery, variations | The horizontal layer (unchanged) | ✅ `nano_inspiration.json` grid |
| **4** | **Create** (创作转化) | Generate / Remix / Mockup CTA | **Conversion** | ✅ ReproduceTemplateSection |

Pillars 3 & 4 exist. **Pillars 1 & 2 are the work** — 1 deepens what's there; 2 is net-new and is what
the reference sites actually have that we don't (the "Education Ontology" behind TpT, not just its look).

## Which level: template vs example (the key design decision)

**The demand — and the lift — is at the example level.** GSC (`raw/gsc-recent-2026-07-13/Pages.csv`,
rolled up): of nano-template impressions, **85% land on example pages (8,551 impr / 1,331 URLs) vs 15%
on template landing pages (1,486 / 288)**, and there are **10× more example URLs** (3,550 examples vs
346 templates). Enriching only the template pages touches ~15% of the opportunity and leaves the
impression-earning long tail flat.

**But the two pillars live at different levels** — this is the core rule:

| Pillar | Authored at | Rendered on | Why |
|---|---|---|---|
| **1 · Knowledge** (prose: "what is HSK 2", the INFJ profile, fridge-magnet material) | **Template** (once) | Template (full) + example (1–2 line **summary** only) | Identical across all of a template's examples. Pasting the full prose on 88 example pages = **duplicate-content penalty** — near-dup pages get devalued, so verbatim reuse would *hurt*. |
| **2 · Attributes** (the ontology values) | **Example** (per instance) | Example (full chips + JSON-LD) + template (the *schema*/facets) | Each example's values are **unique** (`HSK 1 · A Day at School · Reading` vs `Football · Messi/Ronaldo`) → unique per-example structured data + faceting; this is what makes 3,550 thin pages each distinct without dup-content risk. |

**Model = pillar-cluster (hub & spoke):** the **template is the hub** (full authoritative knowledge +
format-level JSON-LD + internal links down to its examples → consolidates the vertical's authority);
**examples are the spokes** (unique attribute chips + per-example JSON-LD — a `LearningResource` per
card, an `Article` per MBTI instance — + a short knowledge summary + a link *up* to the hub).

**Scale unlock — example attributes DERIVE from `params`, they are not hand-authored.** Every example
already carries its instance data: HSK `hsk_article_title:"HSK1 …"` → `grade_band`, story title; MBTI
`mbti_topic:"Football"` + `character_set` → topic/subjects; merch `city_info:"nanjing landmarks"` → the
instance. Template-constant attributes (subject, age band, difficulty, material) **inherit from the
template**. So you hand-author **~12 template schemas + knowledge** and **auto-project** per-example
attributes across all 3,550 — the whole point of an ontology is that it's programmatic, not manual.

**Rollout implication:** v1 (template page, shipped) is the cheap 15%. The **highest-lift next step is
rendering the layer on the example page** with a `deriveExampleAttributes(schema, example.params)`
projection + per-example JSON-LD — and **measuring on example URLs**, where 85% of impressions live.
See the Roadmap.

## The 5 verticals

User-defined categories, each mapped to a reference model + existing taxonomy:

| Vertical | Curify surface (topics/templates) | Reference sites (top 1–2) | Ontology modeled on |
|---|---|---|---|
| **1. MBTI / Character** | `/topics/mbti`, `/topics/personality`, `/topics/character`; mbti-* + character templates | **16Personalities**, **Truity** (Personality Junkie for depth) | Type → Traits → Strengths/Weaknesses → Communication → Relationships → Career → Compatibility |
| **2. Education** | `/topics/language`, `/topics/learning`; hsk-reading, vocabulary, phonics, workbook, worksheet, stem, flashcard templates | **Teachers Pay Teachers**, **Twinkl** (K5 Learning) | Grade/Age → Subject → Skill → Resource-Type → Learning-Objective → Duration → Printable |
| **3. Traditional culture / 服饰** | `/topics/culture`, `/topics/travel`; costume, herbal, cultural-relic, clothing-evolution templates | **SCMP hanfu visual guide**, **newhanfu.com** (thehanfustory) | Culture/Region → Era/Dynasty → Garment-Type → Materials → Patterns → Cultural-Significance → Comparison |
| **4. 文创 / Merch** | merch/POD templates; mockup-set, sticker-pack, fridge-magnet, giftbox, IP-merch | **Printify knowledge-hub**, **PrintKK / Prodigi** | Product → Material → Process → Dimensions → DPI/Bleed → Color-Profile → Manufacturing → Cultural-Background → Use-Case |
| **5. E-commerce content** | ecommerce-photo, product-poster, 9-grid-moodboard, url-to-product templates | **TheGood**, **BrandJump** (Amazon A+ patterns) | Product-Category → Shot-Type (hero/angle/detail/lifestyle/infographic) → Background → Platform → Resolution → Conversion-Role |

> `discussion.txt` recommends piloting **3 first** (Education + MBTI + Merch) as the cleanest cohort
> test. Verticals 3 & 5 are designed here but sequenced after the first read-out.

## Per-vertical attribute schemas (Pillar 2)

Each schema = **10–20 fields**. `taxonomy`= reuse an existing `lib/taxonomy.json` axis; `NEW`= add to
taxonomy; `free`= authored per page. Values are stored per-page (see Data model) and drive facets +
schema.org.

### 2.1 Education (`schema.org/LearningResource`)
| Field | Source | Example (HSK2 reading card) |
|---|---|---|
| grade_band | NEW (tier3 `grade`) | `HSK 2` / `Grade 2` / `Preschool` |
| age_range | NEW | `8–10` |
| subject | taxonomy tier1 `language`/`learning` + NEW | `Chinese (Mandarin)` |
| skill | NEW | `Reading` |
| resource_type | taxonomy `information_types` (`vocabulary`,`process`) + NEW `worksheet`/`flashcard`/`reading-card` | `Reading card` |
| learning_objective | free | `Recognize 8 target words; read a 120-char passage; answer 3 questions` |
| duration_min | NEW | `15` |
| difficulty | NEW | `Beginner` |
| includes | free | `passage + pinyin + vocabulary + printable PDF` |
| audience | taxonomy `audience` | `bilingual`, `kids-learning` |
| language_mode | NEW | `Bilingual EN–ZH` |

Browse axes: **Grade × Subject × Resource-Type** (`Preschool → Reading → Worksheet`; `HSK 2 → Reading → Printable`).

### 2.2 MBTI / Character (`schema.org/Article` + custom DefinedTerm)
| Field | Source | Example (INFJ) |
|---|---|---|
| type_code | NEW (tier3 `mbti-type`, 16 values) | `INFJ` |
| type_nickname | free | `The Advocate` |
| dimensions | NEW | `I·N·F·J` (4 preference pairs) |
| traits | free | `insightful, principled, private…` |
| strengths / weaknesses | free | … |
| communication_style | free | … |
| relationships | free | … |
| career_fit | free | `counselor, writer, HR…` |
| compatibility | NEW (type×type) | `INFJ × ENFP` |
| subject_kind | taxonomy `character`/`personality` | `character portrait` / `personality poster` |

The 16 type codes become a first-class tier3 axis → a real **`/mbti/infj` hub** (traits + career +
relationships + then the poster/avatar/×-pairing generators).

### 2.3 Traditional culture / 服饰 (`schema.org/Article`, `about: DefinedTerm`)
| Field | Source | Example (Ming dragon robe) |
|---|---|---|
| culture / region | taxonomy tier1 `culture`/`travel` + NEW | `Chinese (Han)` |
| era / dynasty | NEW | `Ming Dynasty (1368–1644)` |
| garment_type | NEW | `Longpao (dragon robe)` / `Ruqun` / `Beizi` |
| materials | free | `silk brocade, gold thread` |
| patterns / motifs | free | `five-clawed dragon, cloud collar` |
| cultural_significance | free | `imperial authority; nine dragons = …` |
| historical_context | free | … |
| comparison | NEW (cross-culture) | `vs Korean gonryongpo, vs Japanese sokutai` |

Browse axes: **Culture × Era × Garment-Type**; the comparative angle (hanfu vs hanbok vs kimono) is a
known high-traffic query pattern the reference sites win on.

### 2.4 文创 / Merch (`schema.org/Product` + manufacturing notes)
| Field | Source | Example (故宫风 fridge magnet) |
|---|---|---|
| product_type | NEW | `Acrylic fridge magnet` |
| material | NEW | `Acrylic` / `Wood` / `Metal` / `Enamel` |
| process | NEW | `UV printing` / `laser engraving` / `soft enamel` |
| dimensions | free | `60×80 mm` |
| dpi / bleed / safe_zone | free (best-practice constants) | `≥300 DPI, 3 mm bleed, 5 mm safe zone` |
| color_profile | free | `design RGB → print CMYK` |
| manufacturing_notes | free | `non-printed backer; shrink for enamel` |
| cultural_background | free | `Forbidden City motif; why it suits a magnet` |
| use_case | taxonomy tier1 | `souvenir`, `gift`, `brand promo` |

This is the sharpest differentiator vs a plain AI-image site (`discussion.txt` §3): lead with
inspiration/culture + real spec sheet, _then_ Generate → mockup → factory-ready assets.

### 2.5 E-commerce content (`schema.org/Product`/`ImageObject`)
| Field | Source | Example |
|---|---|---|
| product_category | NEW | `Apparel` / `Home` / `Beauty` |
| shot_type | NEW | `hero` / `angle` / `detail` / `lifestyle` / `infographic-callout` |
| background | free | `pure white` / `lifestyle scene` |
| platform | NEW | `Amazon` / `Shopify` / `Etsy` |
| resolution_note | free | `≥3000×3000, 300 DPI` |
| conversion_role | free | `builds trust`, `shows scale`, `explains feature` |

## Data model & attach points

From the architecture map, the layer plugs in two places (no `nano_templates.json` prose — it stays
structural):

1. **Per-vertical knowledge + ontology definitions** → **new sidecar** `lib/verticals/<vertical>.json`
   (+ a registry `lib/vertical_schema.ts` exporting `VerticalPageSchema`), keyed by vertical id, joined
   to a page via `template.topics` / the topic slug. Mirrors how `topics.json` holds
   `topics.${slug}.intro`. Holds: the field schema, the schema.org `@type`, facet definitions, and
   vertical-level authored knowledge (e.g. the INFJ hub prose, the "what is a dragon robe" explainer).
   Locale-independent structure; authored prose i18n'd via the existing message files.

2. **Per-page attribute VALUES** → extend the i18n `content` block in `messages/<loc>/nano.json`
   (already the home of `content.sections`) with a sibling **`content.attributes`** (the filled ontology
   fields for this template/example) + optional **`content.vertical`** (extra authored knowledge). Read
   via a new `resolveVerticalSections()` in `lib/nano_seo_utils.ts` (next to `resolveContentSections`),
   rendered on the template page after the "About this template" section, and — new — surfaced on the
   **example page** (which today renders none of the domain prose).

```ts
// lib/vertical_schema.ts (shape)
export type VerticalId = "education" | "mbti" | "culture" | "merch" | "ecommerce";
export interface AttributeDef { key: string; label: string; taxonomyAxis?: string; facet?: boolean; }
export interface VerticalSchema {
  id: VerticalId;
  schemaOrgType: string;              // "LearningResource" | "Product" | "Article" | ...
  attributes: AttributeDef[];         // the 10–20 ontology fields
  facets: string[];                   // subset of attribute keys that become browse filters
  knowledgeSlots: string[];           // authored prose sections beyond what/who/how
}
```

## Rendering & structured data (Pillars 1–2 on the page)

- **Attribute chip strip** under the H1 (e.g. `HSK 2 · Age 8–10 · Reading · 15 min`) — the visible
  ontology, like the reference sites' grade/subject badges.
- **Domain-knowledge section** — extend "About this template" with the vertical knowledge slots
  (Education: Learning objectives + Includes; MBTI: Traits/Career/Relationships; Merch: Material/Process
  + spec sheet; Culture: history + significance).
- **JSON-LD** per vertical `schemaOrgType` (today only the example page emits `HowTo`): `LearningResource`
  for Education (teaches, educationalLevel, timeRequired), `Product` for Merch/Ecommerce, `Article`/
  `DefinedTerm` for MBTI/Culture. This is the rich-result unlock the flat pages can't earn.
- **Faceted browse** on topics pages: `/topics/language` gains `Grade × Subject × Resource-Type`
  filters driven by Pillar-2 values → the programmatic-SEO substrate (`Grade 2 → Chinese → Vocabulary`).

## Pilot plan (Phase 1 — do NOT batch-generate)

Per `discussion.txt`: design the schema, hand-enrich a small cohort, measure, then decide.

1. **Build** `VerticalPageSchema v1` for **Education + MBTI + Merch** (verticals 1,2,4). ~10–20 fields each.
2. **Enrich 20 existing high-potential pages per vertical** (60 total) — Pillars 1 & 2 fully authored +
   JSON-LD. **Keep 20 similar pages per vertical un-enriched as a control** (SEO A/B cohort).
   - _Page selection (GSC-driven):_ pages with impressions > 0 but rank ≥ 10 (discovered-not-ranking),
     already have `content.sections`, and sit in the vertical. Mine from `raw/gsc-*` +
     `scripts/pull_gsc_performance.cjs`.
3. **Measure 4–6 weeks** vs control: impressions/page, ranking queries/page, top-10/20 keywords,
   engagement, Generate CTR, indexed pages.
4. **Phase 2** (only if it moves): productize the ontology into the DB → programmatic facet pages.
   **Phase 3**: scale 20 → 200 → 2,000 per vertical.

## Implemented in v1 (2026-07-28)
- `lib/vertical_schema.ts` — `VerticalPageSchema` type + registry for **education / mbti / merch** (schemaOrgType, 8/4/7 attributes, knowledge slots, `resolveVerticalForTopics`).
- `lib/nano_seo_utils.ts` — `content.attributes` / `content.vertical` on `NanoLocaleMessageEntry`; `resolveVerticalSections()`; `buildVerticalJsonLd()`.
- `app/[locale]/_components/VerticalKnowledge.tsx` — `VerticalAttributeChips` (chip strip) + `VerticalKnowledgeSection` (knowledge block), both no-op outside the pilot.
- `nano-template/[slug]/page.tsx` — renders the chip strip under the H1, the knowledge block after "About this template", and per-vertical JSON-LD.
- **Pilot page**: `template-hsk-bilingual-reading-text-lesson-poster` (Education) enriched in `messages/{en,zh}/nano.json` → renders `HSK 2 · Age 8–10 · Reading · 15 min` chips + Learning objectives / Includes / Background + `LearningResource` JSON-LD.

## Pilot cohort — GSC-mined (2026-07-28)

The strict 20-enrich + 20-control A/B was **dropped**: the GSC data is too thin/noisy for a clean
matched control (most template pages sit at single/low-double-digit impressions with ~0 CTR, and the
biggest MBTI/merch numbers are a transient World-Cup footballer spike). Instead — a **focused pilot of
~3–4 TEMPLATE pages per vertical** (the layer renders on the template page and lifts its whole example
family), chosen from `raw/gsc-recent-2026-07-13/Pages.csv` rolled up to parent templates:

| Vertical | Pilot template | GSC signal (impr · avgPos · #urls) | Why |
|---|---|---|---|
| Education | `template-hsk-bilingual-reading-text-lesson-poster` | (HSK; durable) | ✅ **shipped** — rich edu ontology |
| Education | `template-chinese-idiom-learning-card` | 75 · **16.4** · 11 | high impr, **rank ≥ 10** = discovered-not-ranking |
| Education | `template-education-card` | 95 · 9.0 · 34 | biggest edu family (34 urls) |
| Education | `template-kids-vocabulary-poster` | 16 · 9.0 · 3 | clean vocab ontology fit |
| MBTI | `template-mbti-generic` | **833 · 13.7 · 88** | anchor; huge impr but poor rank → best lift target |
| MBTI | `template-mbti-yellowstone` | 684 · 8.6 · 51 | durable fandom (not WC-transient) |
| MBTI | `template-friends-character-mbti` | 240 · 10.1 · 43 | durable fandom |
| MBTI | `template-chinese-classic-character-mbti` | 110 · 9.1 · 43 | CN-locale depth |
| Merch | `template-city-landmark-fridge-magnet-collection` | 15 · 7.0 · 3 | perfect material/process/DPI depth |
| Merch | `template-food-product-packaging-design` | 20 · 9.2 · 6 | packaging spec depth |
| Merch | `template-ip-creative-cultural-goods-mockup-set` | 3 · 30 · 1 | 文创 anchor; needs the story+spec layer most |
| Merch | `template-fridge-magnet-merch` | (new) | fresh top-10-drop template |

_Excluded as primary (transient WC spike — watch, don't anchor on):_ `template-mbti-nba` (3231 impr),
`template-world-cup-team-sticker-poster` (244 impr).

**Measurement (no rigid control — self-referential + qualitative):** for each enriched template track its
OWN before/after over 4–6 weeks — (a) does it start surfacing for **domain/long-tail queries** (e.g.
"hsk 2 reading practice", "INFJ personality poster", "fridge magnet material"), not just brand/name
queries; (b) impressions & avg-position trend on the template's query set; (c) Generate CTR; (d)
rich-result eligibility (Search Console → Enhancements, once JSON-LD is crawled). A few un-touched
same-vertical templates serve as a loose directional reference, not a statistical control.

## Roadmap / TODO (next steps)
1. **Author the ~12 template-hub enrichments** above — Pillar-1 knowledge + the template-constant
   attributes + facet schema in nano.json (en+zh), mirroring the shipped HSK entry. Hand-authored, ~12
   pages. Do NOT batch-generate. Re-pull GSC (`scripts/pull_gsc_performance.cjs`) at enrich-time to
   confirm each page still has live impressions.
2. **⭐ Highest-lift: example-level attributes (the 85%).** Build `deriveExampleAttributes(schema,
   example.params)` — project each vertical schema's attributes onto an example's `params` (variable
   values) + template-constant attributes (inherited); render the chip strip + a knowledge *summary* +
   **per-example JSON-LD** on `example/[exampleId]/page.tsx` (today shows no domain prose). This scales
   the layer to all 3,550 example URLs at ~zero authoring cost and is where the impressions are.
   **Measure on example URLs**, not just template landing pages. (See "Which level" above.)
3. **Vertical v2 — culture (服饰) + ecommerce.** Add their schemas to `VERTICAL_SCHEMAS` (fields already specified in §2.3 / §2.5) once the first read-out validates the approach. Culture is a Curify strength (costume/herbal/cultural-relic templates) and a natural 4th.
5. **Taxonomy additions.** Promote the NEW ontology axes into `lib/taxonomy.json` so facets derive from one source: `grade`, `skill`, `resource_type` (education); `mbti-type` (16 types, tier3) + type×type compatibility; `material`/`process`/`product_type` (merch). Ties into `project_taxonomy_shape_i18n`.
6. **Phase 2 — faceted browse (programmatic SEO).** Once attributes are DB-backed, generate `/topics/language?grade=…&subject=…&type=…` facet pages (`Preschool → Reading → Worksheet`). Only after the pilot read-out.
7. **i18n the attribute LABELS.** v1 labels are hardcoded English in `vertical_schema.ts`; move to messages so `[Grade / Level]` localizes (values already per-locale).

## What this is NOT
- Not a domain split (Curify's authority is still thin; splitting fragments backlinks/crawl signals).
- Not a rewrite of existing templates/examples — the vertical layer sits _on top_.
- Not batch generation — Phase 1 is a measured cohort test first.

## Sources (reference models)
- MBTI: [16Personalities](https://www.16personalities.com/), [Truity TypeFinder](https://www.truity.com/test/type-finder-personality-test-new)
- Education: [Teachers Pay Teachers](https://www.teacherspayteachers.com/), [Twinkl](https://www.twinkl.com/)
- Costume/Culture: [SCMP hanfu visual guide](https://multimedia.scmp.com/infographics/culture/article/3241304/hanfu-part-1/), [newhanfu.com](https://www.newhanfu.com/521.html)
- 文创/Merch: [Printify file-prep knowledge hub](https://printify.com/knowledge-hub/file-prep-blueprint-for-bleeds/), [Prodigi](https://www.prodigi.com/products/stickers/magnets/)
- E-commerce: [The Good — product image guide](https://thegood.com/insights/product-image-conversions/), [BrandJump](https://blog.brandjump.com/product-imagery-for-ecommerce-a-best-practice-guide)
