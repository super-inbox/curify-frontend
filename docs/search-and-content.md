# Search + Content — Umbrella Tracker

_Last updated: 2026-06-05 (strategic reframe: WC is the entry point, the engine is the destination — "Visual Answers for Every Query". Calendar widget per-match-line clickable upgrade queued for 2026-06-06). Owner: jay. Update after any push that touches the threads below or changes priority order._

## Why this doc exists

Search quality, content tagging, content production, and upstream demand-sensing each have their own runbook (`docs/search-quality.md`, `docs/batch-generation.md`, plus pieces in `curify-studio`), but the work is interlocking — a recall fix in search can be a tag fix, a tag refactor can change what gets generated next, and the upstream proposals pipeline feeds the content drop. This doc is the **orchestration layer** that names the threads, points to the runbooks, and tracks cross-thread priorities so we don't lose context jumping between them.

**New operators start here:** [`docs/onboarding-runbook.md`](./onboarding-runbook.md) covers the prerequisites (tools, repo clones, GCS access), env vars, and step-by-step for each recurring workflow (daily content drop, batch gen, WC daily recap, prefill quality check, snapshot regen, manual credit grant). This doc is the WHY; the onboarding runbook is the HOW.

**Active improvement plan (2026-06-25):** [`docs/search-retrieval-improvement-plan-2026-06-25.md`](./search-retrieval-improvement-plan-2026-06-25.md) audits Curify's retrieval against a 4-item recommendation (multi-query, metadata expansion, query decomposition, intent routing), picks the P0 subset by ROI, and lays out the implementation order. P0.1 (metadata expansion v2) in progress.

**Companion workstream — search evaluation + external signals (Baobao):** [`super-inbox/visual-search-adhoc`](https://github.com/super-inbox/visual-search-adhoc) — separate repo carrying Baobao's cross-platform search-quality benchmarks (Curify / Pinterest / Google Images / Bing Images / Canva) and external-signal pilots. Layout:
- `scripts/{curify,pinterest,google-image,bing-image,canva}-search-eval/` — per-platform crawl + eval scripts.
- `scripts/external-signal-analysis/` — upstream demand-sensing pilots (feeds thread-d).
- `docs/search-evaluation/`, `docs/external-signal-pilot/`, `docs/daily_report/` — running reports and design notes; `claude-reports/` carries recent daily reports.
- Clone alongside `curify-frontend` (`~/visual-search-adhoc`). Read `docs/search-evaluation/` first for the benchmark schema; the current work loop lands in `claude-reports/` before promotion.
- Pairs with the eval framework doc [`docs/eval-framework-visual-search-benchmark-2026-06-14.md`](./eval-framework-visual-search-benchmark-2026-06-14.md) in this repo (framing here; execution + data there).

The four threads:

| # | Thread | Where it lives | Status doc |
| --- | --- | --- | --- |
| **a** | Search quality + experience | `app/[locale]/(public)/search/`, `lib/searchRewrite.ts`, admin SQL panels | [`docs/search-quality.md`](./search-quality.md) |
| **b** | Content tagging + topic taxonomy | `lib/topicRegistry.ts`, `lib/topic_tag_mappings.json`, `lib/subject_topic_seeds.json`, tags on inspirations / templates / gallery prompts | (this doc — section [Thread b](#thread-b--content-tagging--topic-taxonomy)) |
| **c** | Content production + daily drop | `scripts/generate_template_examples.cjs`, `scripts/configs/*.json`, the daily-content-drop workflow | [`docs/batch-generation.md`](./batch-generation.md) + memory `project_daily_template_workflow.md` |
| **d** | Upstream inspiration / demand sensing | `curify-studio/curify_background/app/routers/proposals.py` + adapters (`search_no_result_utils`, `template_gap_utils`, `reddit_utils`); admin UI in `admin_portal/js/proposals.js` | (this doc — section [Thread d](#thread-d--upstream-inspiration--demand-sensing)) |

The arrow of causation flows **upstream → downstream**:

```
  thread d (proposals: search-no-result + template-gap + reddit + GSC)
       │   the demand signal — what users want we don't have
       ▼
  thread c (config-driven generation: watermark, auto-tag, search_aliases)
       │   the production rail — turn demand into catalog
       ▼
  thread b (tagging + taxonomy: tier-1/2/3 + free tags + subject_topic_seeds)
       │   the structure layer — make catalog findable + recommendable
       ▼
  thread a (search: tokenizer, alias index, LLM rewrite, low-result logging)
       │   the surface — answer the user's query well
       ▼
                                  user
```

A bug in any one thread can leak across — most often we discover the wrong thread first (a search recall miss surfaces as thread-a, but the fix lives in thread-b alias or thread-c content). The tracker below helps cross-reference.

---

## Thread a — Search quality + experience

**Runbook:** [`docs/search-quality.md`](./search-quality.md). Already detailed there; recapping the open items:

### Open follow-ups
1. **Confirm `SEARCH_LOWRESULT` in admin portal.** The frontend ships the event (commit `8217070`), the Postgres enum has the value (migration ran 2026-05-18, verified via `pg_enum`). But `curify_background/app/crud/admin.py` lines 751-798 only aggregates `SEARCH_NORESULT` — the low-result panel hasn't been added. Until that lands, the low-result events accumulate in the DB but nobody surfaces them. **Half-day backend task.**

2. **Use the LLM rewriter as a precision/recall instrument.** The 28-query regression eval (`scripts/eval_search.cjs`) already shows base vs rewriter-union counts side by side. Specific queries where the rewriter contributes >50× the base are tightening opportunities — the alias / tokenizer may be over-restrictive. Specific queries where rewriter union is barely above base are recall ceilings we can't fix with alias top-ups. Example signal from the 2026-05-19 baseline:
   - `english-chinese`: base 0 → union 266. Strong rewriter dependency. Either accept the redirect path (current prod) or alias the hyphenated form more aggressively.
   - `wedding planner`: base 15 → union 409. Rewriter expands recall ~27×. Alias top-up candidate.
   - `unique cultural experiences`: base 0 → union 0. Neither alias nor rewriter helps — real content gap.

3. **Travel-intent ranker weighting + `character_name` query mode** — open P1 items from the search-quality doc; ranker tweaks rather than alias work.

---

## Thread b — Content tagging + topic taxonomy

### Three-tier ontology

The taxonomy is structured along three orthogonal axes — every template / inspiration / gallery prompt is positioned at the intersection of (Tier I × Tier II × Tier III). Tags in `topics[]` carry the Tier-I and Tier-II coordinates; Tier III is implicit in the template ID today and queued for explicit tagging (2026-06-01 audit Open item 2).

| Tier | Name | What it captures | Examples | Implementation |
| --- | --- | --- | --- | --- |
| **I** | Subjects, Events & Knowledge Graph Grounding | Entities the content is *about* — topics, franchises, places, people, IPs, events | `character`, `mbti`, `naruto`, `marvel`, `world-cup`, `language`, `chinese-cuisine`, `dog`, `heart` | `tier1-4` in `lib/taxonomy.json`; `template_subjects` (auto-derived); `topics[]` on templates + inspirations |
| **II** | Information Typology & Semantic Modality | How information is *organized* — the cognitive shape of the payload | `fact`, `profile`, `collection`, `comparison`, `timeline`, `process`, `analysis`, `information-card`, `vocabulary`, `dialogue`, `quote`, `map`, `quiz`, `story` (13 canonical types, Round 2A) | `information_types` in `lib/taxonomy.json`; `template_information_types` (auto-derived from `topics[]`) |
| **III** | Layout, Spatial Determinism & Visual Synthesis | How the artifact is *rendered* — composition rules, grid topology, aspect ratio | 3×3 grid, 4×4 grid, vertical poster, horizontal infographic, carousel, flashcard, collage, multi-panel | `template_shapes` (legacy alias from Round 2A — back-compat). **Not yet surfaced as queryable per-template tags** — encoded only in the template id. Queued as 2026-06-01 audit Open item 2. |

**Why this framing matters**: Tier I scales unbounded (every new franchise / place / IP), Tier III scales slowly (a finite set of layouts), but Tier II is the keystone — **bounded at ~13 categories and the connective tissue between search intent and generation** (per `raw/taxonomy_brainstorm.txt`). Most queries decompose along this 3-axis grid:

> "give me a [Tier II info-type] of [Tier I subject] in [Tier III layout]"
>
> e.g. "give me a **timeline** of **the World Cup** in a **vertical poster**" — single template can answer if all three axes hit.

The content gap matrix is also 3D: `subject × info_type × layout`. Today we only render the `subject × info_type` slice (Round 2A coverage matrix). Adding Tier III as explicit tags unlocks the full 3D gap analysis + the search-generation bridge's "all three axes provided, generate now" path.

### 3D content gap matrix — operationalized 2026-06-02

The flat `topics[]` schema is preserved; tier classification happens at runtime via taxonomy.json maps. The script `scripts/build_3d_gap_matrix.cjs` reads three signals per template:

- **Tier I (Subject)** — from `template_subjects` (already auto-derived from `topics[]` ∩ tier1-4)
- **Tier II (Info-type)** — from `template_information_types` (auto-derived from `topics[]` ∩ `information_types` vocabulary)
- **Tier III (Layout)** — heuristic from template id substrings via `LAYOUT_RULES` (since Layout isn't yet a queryable tag — flagged as 2026-06-01 audit Open item 2). 15-layout vocabulary: flashcard / matching-chart / grid / timeline / map / before-after / vs-battle / collage / mood-board / carousel / infographic / guide-card / character-card / poster / single-image.

Run: `node scripts/build_3d_gap_matrix.cjs` → writes `/tmp/3d_gap_matrix_<date>.md`.

**First-run findings (2026-06-02)** — 18 subjects × 13 info-types × 15 layouts = 3,510 3D cells. 778 are "fillable gap cells" (subject has ≥10 templates AND subject×info-type has at least one template AND that cell is empty for a common layout). 72 cells are saturated (≥3 templates).

**Layout-axis sparsity is the headline**: the Layout distribution is highly uneven:

| Layout | Templates | Layout | Templates |
| --- | --: | --- | --: |
| single-image | 62 | timeline | 7 |
| infographic | 52 | flashcard | 6 |
| poster | 22 | collage | 6 |
| character-card | 15 | before-after | 5 |
| vs-battle | 14 | grid | 5 |
| guide-card | 11 | matching-chart | 2 |
| map | 8 | carousel | 2 |
| | | mood-board | 1 |

**single-image + infographic = 114/218 (52%)** of the catalog by layout. Targeted layouts (timeline, flashcard, collage, grid, before-after, carousel, mood-board) have ≤10 templates each — they're under-represented and are the highest-leverage layout-axis content drops.

**Top gap pattern**: `learning × {insight, timeline, information-card, process} × {flashcard, grid, timeline, map, before-after, vs-battle, collage, character-card, poster}` — `learning` (55 templates) has substantial info-type coverage but is mostly infographic-shaped; the same content can clearly render as flashcards, before-after pairs, grids etc.

**Concrete batch-generation candidates** (first 5 from the report):

- `learning × insight × flashcard` (empty; adjacent: infographic×12, single-image×6)
- `learning × insight × grid` (empty; adjacent: infographic×12, single-image×6)
- `learning × insight × timeline` (empty; adjacent: infographic×12, single-image×6)
- `learning × insight × map` (empty; adjacent: infographic×12, single-image×6)
- `learning × insight × before-after` (empty; adjacent: infographic×12, single-image×6)

The mechanical brief: pick one existing example from the saturated (subject × info-type) row and regenerate in the missing layout. Single-template families can absorb this — `template-9-traits-info-grid` proves the grid layout works; cloning the design for `learning × insight × grid` is straightforward.

**Caveats** for the first-run output:
- Layout heuristic is id-substring based. Some templates classified as `single-image` actually have richer composition; some `infographic` matches catch incidental matches. Refining the rules OR promoting Layout to an explicit tag (audit Open item 2) would tighten the matrix.
- `mbti` (26 templates) and `character` (45 templates) both have heavy `quiz` + `character-card` saturation but very thin `timeline`, `map`, `story` coverage — corroborates the 2026-05-30 content_shapes coverage matrix.
- The 3D matrix is biased toward existing taxonomy entries. Brand-new subjects (world-cup just promoted to tier-1) won't show in MATRIX_SUBJECTS until added.

**Next-step proposal (in order of ROI)**:
1. **Pick 2-3 high-signal gap cells per week** for the daily content drop. The matrix surfaces them mechanically — no judgment needed beyond editorial pick.
2. **Promote Layout to a queryable tag** (audit Open item 2). The heuristic works as a first cut but loses fidelity for genuinely-mixed-layout templates. Once explicit, the gap matrix becomes authoritative and feeds the search-generation bridge's accept criterion.
3. **Tier-weighted matcher scoring** (#4 from the 2026-06-02 ontology-use proposal) — depends on Layout being a real tag.

**See also:** the Visual Intent Routing eval at [`docs/eval-framework-visual-intent-routing-2026-06-15.md`](./eval-framework-visual-intent-routing-2026-06-15.md) (renamed 2026-06-17 from "Agentic Evaluation"). Its Layer 1 (Routing Accuracy) is essentially **the 3-tier ontology as a scoring rubric** — each user intent decomposes into a (Subject × Info-type × Layout) gold cell, and the routing system's pick is graded against it. The eval doubles as ontology validation: gold cells that humans can't fill mark real content gaps and feed back to the gap matrix.

### Current state

**Three tagging surfaces, each with a different shape:**

| Surface | Where | Tagging shape |
| --- | --- | --- |
| **Templates** | `public/data/nano_templates.json` | `topics: string` (comma-separated) — usually 2-5 tier-2/tier-3 topic slugs. Drives `/topics/<slug>` membership. |
| **Inspirations** | `public/data/nano_inspiration.json` | `tags: string[]` (free, ~5-8 per record) + `search_aliases: string[]` (LLM-enriched, ~10-20 per record) + `topics: string[]` (sometimes — overrides the parent template's topics for that specific example). |
| **Gallery prompts** | Redis-backed via `nanoPromptsService`; canonical metadata at `lib/generated/nanobanana_prompts_metadata.json` | `tags: string[]` — the only tagging axis. Surfaced as `/nano-banana-pro-prompts/tag/<slug>`. |

**Topic registry** (`lib/topicRegistry.ts`):
- Tier-1 (8): `character`, `language`, `learning`, `travel`, `lifestyle`, `design`, `product`, `personality`.
- Tier-2 navigational children (`EXPLICIT_CHILD_TOPICS`): tier-1 → 4-9 sub-topics each (`character → mbti, anime, sports, film, …`; `travel → culture, food, city, itinerary`; etc.).
- Tier-3 tag children (`TIER1_TAG_CHILDREN`): tier-1 → tag-style children (e.g. `language → vocabulary, dialogue, expressions, language-english, english-chinese, english-spanish, …`).
- Cross-mappings: `MBTI_TYPE_TAGS` (16 personality types), gallery tag → topic reverse map (`TOPIC_GALLERY_TAG`), per-topic blog tag map (`TOPIC_BLOG_TAG`).

**Subject-topic seeds** (`lib/subject_topic_seeds.json`):
- Hand-curated topic-name lists grouped by `SUBJECT_TAG` (animals / nature / space / weather / food / family / etc.).
- Input to `scripts/generate_template_examples.cjs` for the vocabulary template family.
- ~10-15 seed names per subject. Single source of truth — regenerate `scripts/configs/vocabulary_kids_topics.json` from this.

### What's healthy
- The tier-1 / tier-2 / tier-3 hierarchy is internally consistent and drives `/topics/<slug>` routing, EntryBar capsules, and the persona → blog-category mapping.
- `search_aliases` enrichment is automated for new inspirations via `scripts/lib/auto_tag.cjs` (same pipeline as the daily content drop).
- `subject_topic_seeds.json` is small and easy to extend.

### 2026-06-01 audit — Topic × Info-type × Layout coverage

Ran a seeded-random audit (1 template + 1 example per tier-1's tier-2 children; 9 buckets) plus a 6-prompt gallery sample. Findings:

**Sample table:**

| # | Tier 1 → Tier 2 | Template | Example tags | Framework gap | Cross-topic? | Tier-3 candidate |
|---|---|---|---|---|---|---|
| 1 | character → anime | `template-mbti-naruto` | `anime, character, mbti, fantasy, franchise fandom` | info-type missing (profile), layout missing (character-card) | ✅ pattern reused for HP/Friends/Marvel | `franchise:naruto`, `character-role:villain` |
| 2 | personality → quiz | (same template) | `anime, character, mbti, naruto, portrait, franchise fandom` | `quiz` topic tag looks **wrong** — this is a static profile card, not interactive | — | same as above |
| 3 | language → expressions | `template-english-top5-phrases` | **EMPTY** | info-type missing, layout missing (top-N list) | ✅ any language pair × any topic | `pair:english-french`, `topic:hobbies`, `level:beginner` |
| 4 | travel → food | `template-regional-alcoholic-drinks-infographic` | **EMPTY** | layout partial only | ✅ any region × any category | `country:spain`, `drink-type:wine` |
| 5 | culture → food | `template-recipe` | `infographic, traditional, food, chinese, illustration` | info-type missing (process/recipe), layout missing | ✅ any cuisine | `cuisine:chinese`, `region:fujian`, `dish-type:soup` |
| 6 | lifestyle → animal | `template-dog-breed-retro-infographic` | `dog, vintage, educational, illustration` | layout missing (retro-infographic) | ✅ any species × any breed | `species:dog`, `breed:poodle` |
| 7 | learning → science | `template-organ-health-food-guide-infographic` | `health, food, educational, infographic, science, artistic, anatomy, food science` | best-tagged in sample (close to ideal) | ✅ any organ | `organ:heart`, `health-topic:cardiovascular` |
| 8 | product → **branding** | **NO TEMPLATES TAGGED** | — | **catalog gap** — tier-2 has zero members | — | backfill OR remove |
| 9 | design → digital-canvas | `template-poetry-ink-wash-illustration` | `traditional, chinese, poetry, ink wash` | `quote` acts as content shape | ✅ any topic in ink-wash style | `theme:rural-life`, `poetic-form:classical-chinese-poetry` |

**Six-prompt gallery sample:** style-heavy tagging (`cozy, dramatic, elegant, photorealistic`) but consistently missing: subject (woman, café, mirror), scene (bathroom, dimly-lit-room), era (y2k, 80s), garments/props (black-dress, banana-phone, leather-couch), pose (mirror-selfie, split-pose). Plus several wrong/uncategorized topic fields ("History / What-if" on a café selfie; "Uncategorized" on a Y2K prompt).

**Key findings:**

1. **Framework coverage is partial.** All templates have topic tags. Roughly half implicitly carry info-type via the `topics` array (e.g. `information-card`, `quote`). Almost none have explicit template-shape / layout tags — layout is encoded only in the template ID. The taxonomy.json has the `information_types` (13) and `template_shapes` dimensions defined but they're not surfaced as queryable tags on individual templates.

2. **Cross-topic reuse is high, undertapped.** 8 of 9 sampled templates are structurally generic but tagged narrowly by their first instance (recipe → any cuisine; dog-breed-infographic → any species; top-5-phrases → any language pair × any topic). The schema conflates "template structure" with "example instance" in the same `topics` array.

3. **Example tag completeness is poor.** 2 of 9 examples had EMPTY tag arrays. Most others had 3-5 generic tags but were missing instance-specific tags (specific breed, country, dish name, character role).

4. **Tier-3 expansion is overdue.** Tier-3 today is mostly MBTI types. The audit surfaced concrete tier-3 candidates that already exist in the catalog as separate templates but aren't promoted to taxonomy: franchises under `character → mbti`, cuisines under `travel → food`, species under `lifestyle → animal`, organs under `learning → science`, language pairs + levels under `language → vocabulary`.

5. **Catalog gap surfaced.** `product → branding` has zero members.

6. **Gallery tag schema needs 5 new dimensions.** `subject`, `scene`, `era`, `prop`, `pose` — use `category:value` convention within the existing `tags` array; no schema change.

### Open items (re-ranked after 2026-06-01 audit)

1. ~~**Random-sample audit recipe.**~~ Done ad-hoc on 2026-06-01 (see above). Codify as `scripts/audit_tags.py` for periodic re-run.

2. **Add `info_type` + `template_shape` fields to template schema.** Backfill via script (use `id` substring matching against `taxonomy.json` `template_shapes` keys) then human review. ~2-3 hr. Unlocks proper 3-axis taxonomy queries (e.g. "all comparison-type templates across any topic", "all character-card templates by franchise").

3. **Promote known template families to tier-3.** Formal additions to `lib/taxonomy.json` `tier3`: franchise (naruto, harry-potter, friends, marvel, breaking-bad, yellowstone), cuisine (chinese, italian, mexican, spanish), species (dog, cat, horse, bird), organ (heart, lungs, kidney, brain), language-pair (english-french, english-spanish, …), level (beginner, intermediate, advanced). ~1 hr; high SEO long-tail value.

4. **Bulk-pass examples with empty/sparse tag arrays.** Script that suggests tags from example's `id` substring + `search_aliases` + parent template's `topics`, then human-review. Highest-leverage on the 2 sampled examples with empty arrays and the broader population they represent.

5. **Fix `product → branding` tier-2.** Backfill members or remove the empty navigational child. ~30 min.

6. **Extend gallery tag schema with 5 new dimensions.** Define the `category:value` convention (`subject:woman`, `scene:cafe-bathroom`, `era:y2k`, `prop:banana-phone`, `pose:mirror-selfie`). Pilot-retag top-100 prompts. ~3-4 hr. Big UX lift on `/nano-banana-pro-prompts` search/filter.

7. **Audit `quiz` topic tag for false positives.** Sample #2 surfaced `template-mbti-naruto` tagged with `quiz` but it's a static character profile, not an interactive quiz. Worth a sweep of all `quiz`-tagged templates to confirm they actually are interactive quizzes vs profile cards mistagged.

2. **Recommendation layer.** `subject_topic_seeds.json` is currently write-only (input to gen). The user flagged it as the substrate for: similar-template recommendations, similar-example recommendations on /carousel, similar-gallery recommendations, and a richer search-alias source. None of those are wired yet. The structure: take a record's tier-1 ancestor + its tier-3 tags + its `search_aliases` → query a similarity index → return top-N. Open question whether to build the index in JS (BM25 over the existing blobs) or to offload to a vector store. **Half-week task minimum.**

3. **Tag-vs-topic drift between gallery prompts and templates.** Gallery prompts use free `tags` only; templates use structured `topics`. The reverse map `TOPIC_GALLERY_TAG` papers over this for /topics/<slug> pages (each tier-1 topic points to one canonical gallery tag), but it's brittle — adding a new gallery tag or renaming one breaks the link silently. Worth a periodic audit: which gallery tags have no corresponding topic entry? Which topics have no gallery presence?

4. **Subject seed coverage.** `subject_topic_seeds.json` covers ~5 subjects today (animals, nature, space, weather, etc.). The English-X language pair sweep on 2026-05-18 introduced new subjects (family, body, daily-routines) that are not yet in the seeds. Backfill them so the next `vocabulary_kids_topics.json` regen carries them forward.

5. **Split `travel` and `culture` into two tier-1 topics.** Today `culture` is a tier-2 navigational child under `travel` (`EXPLICIT_CHILD_TOPICS.travel = ["culture","food","city","itinerary"]`). The user-facing concepts are distinct — a Studio Ghibli culture card or a Lunar New Year infographic is not a travel template, and a watercolor map itinerary isn't a culture template. Promoting `culture` to its own tier-1 lets templates carry both tags (e.g. a Kyoto temple guide is genuinely travel AND culture) without forcing the false either/or that the current hierarchy implies. Touches `lib/topic_tag_mappings.json`, `lib/topicRegistry.ts` (TIER1_USE_CASES, EXPLICIT_SIBLING_GROUPS), EntryBar capsule order in `messages/<locale>/common.json`, and a targeted re-tag pass on existing templates currently labeled only `travel` that should also gain `culture`.

6. **Other-templates section quality.** `buildOtherTemplateCards` in `lib/nano_page_data.ts` is the surface on `/nano-template/<slug>` and `/nano-template/<slug>/example/<id>` that shows "Other templates" below the current template. Today it returns the top-ranked templates globally (filtered only by `excludeTemplateId`) — no topic relatedness, so a Marvel MBTI page surfaces unrelated watercolor maps. Should rank candidates by topic-overlap (Jaccard or shared-topic-count) against the current template, falling back to global rank when there is no overlap. The row count on these specific surfaces is also higher than needed — drop from `30` cards (~5 rows) to `15` (~3 rows) on template/example pages. Other surfaces (topics page, tools page, tag page, prompt page) build their own card lists through different paths and aren't affected.

---

## Thread c — Content production + daily drop

**Runbooks:** [`docs/batch-generation.md`](./batch-generation.md) (config-driven batch gen) + [`docs/onboarding-runbook.md` § 2.1](./onboarding-runbook.md#21-daily-content-drop-hongjie28-patch-n) (the daily `hongjie28-patch-N` ingest loop, end-to-end) + [`docs/onboarding-runbook.md` § 2.3](./onboarding-runbook.md#23-wc-daily-recap-manual-paste-and-ship) (WC daily recap ritual).

### Already shipped
- Config-driven generator (`scripts/generate_template_examples.cjs`) with watermark, auto-tag, `search_aliases` enrichment, optional `--sync` to CDN.
- Daily-content-drop workflow (fetch hongjie28-patch-N → wire 5 metadata fields → i18n autotranslate → gallery sync with `--auto-tag`).
- Recent batch: 75 low-language examples on 2026-05-18 (config `scripts/configs/low_languages_2026-05-18.json`).

### Observed content gaps from SEARCH_NORESULT logs (review weekly)
Live-prod failing queries that the catalog could theoretically host but does not yet, surfaced via the admin Search Queries panel and ad-hoc DB queries. The rewriter now routes most of these to Path A with substantive rewrites (post-2026-05-23 prompt patch), but generated CONTENT under those rewrites is still thin or missing. Worth a batch-gen pass when a cluster reaches 3+ events / week.

| Query | First seen | Adjacent templates | Notes |
| --- | --- | --- | --- |
| ~~`samurai` / `武士`~~ | 2026-05-23 | fandom-grid + historical-figure-profile + mbti-generic | ✅ Filled 2026-05-23 via `scripts/configs/samurai_genshin_2026-05-19.json` (3 records). All 5 query variants return 3 hits. |
| ~~`genshin` / `原神` / `genshin impact`~~ | 2026-05-23 | fandom-grid + mbti-generic + pop-culture-matching-chart | ✅ Filled 2026-05-23 via `scripts/configs/samurai_genshin_2026-05-19.json` (3 records). All 3 query variants return 3 hits. |
| `accion` | 2026-05-23 | template-mbti-marvel, template-battle, template-mbti-nba (English `action` already returns 126 hits across 13 templates) | Spanish-language gap. The rewriter still doesn't translate `accion` → `action` cleanly (no accent → model treats as gibberish). Either alias-top-up to add `accion` directly to action-content inspirations, or accept as a Spanish-accent edge case. |


### Open items
1. **Subject-seed-driven config regen.** When `subject_topic_seeds.json` changes, the affected config under `scripts/configs/` should regenerate automatically. Today it's a manual copy. A small helper `scripts/regen_seed_configs.py` that reads the seeds + a template-family mapping and emits the config files would close the loop.

2. **Drop-cadence audit.** Daily-content-drop is human-triggered today (the `hongjie28-patch-N` PR drops). Worth tracking: number of new inspirations / week, distribution by tier-1 topic, distribution by template family. If one tier-1 (say `product`) has been static for a month, that's a content-gap signal upstream of any search work.

---

## Thread d — Upstream inspiration / demand sensing

### Current state

**Pipeline** (in `curify-studio/curify_background/app/routers/proposals.py`):

```
sources              adapter (run_*)                    output
─────────────        ────────────────────────────        ───────────────────────
template_gap         template_gap_utils                  high-rank-score templates with few examples
search_no_result     search_no_result_utils              SEARCH_NORESULT queries from user_interactions
reddit               reddit_utils                        re-LLMs a static hot_topics.json snapshot (no live crawler yet — see open item 5)
(future) gsc         (not implemented)                   Google Search Console zero-CTR / no-result
rss                  separate /rss/run endpoint          curated RSS feeds (not in the proposal router)
```

Each adapter produces proposal entries in a unified schema (slug, title, evidence, source, status). Proposals land in one blob (`PROPOSAL_STORAGE`). Admin UI at `admin_portal/js/proposals.js` reads `GET /proposals`, mutates status via `PATCH /proposals/{id}`, and exports the APPROVED set as a config JSON ready to feed `curify-frontend/scripts/generate_template_examples.cjs`. The full loop demand → proposal → approval → content drop is wired.

### Open items
1. **Add SEARCH_LOWRESULT as a proposal source.** The adapter `search_no_result_utils.py` currently surfaces only `SEARCH_NORESULT` queries. With the new `SEARCH_LOWRESULT` action type live (commit `72e7189` backend + migration), the adapter should expand to "queries that returned ≤2 results across all surfaces." Same upstream-demand framing, broader coverage. Trivial extension — one UNION clause in the SQL.

2. **Wire GSC as a fourth source.** GSC export (`Pages.csv` at repo root, refreshed monthly per `docs/interconnection.md`) has zero-CTR queries that the in-product `search_noresult` event never sees (since GSC measures impressions on SERP, not site visits). Adding it as a proposal source closes a real gap — users who search Google for "Marvel MBTI" and see Curify but don't click are demand we lose today.

3. **Track approval rate per source.** Some sources will produce mostly noise (reddit thread title harvesting) vs mostly signal (template-gap top-quartile). A simple admin panel showing approval-rate-per-source-per-week would surface which adapters earn their cron slot. Cross-references with thread-c drop volume.

4. **Trace the GSC `Pages.csv` data into the existing proposal flow.** Today `Pages.csv` is a manual export read for the interconnection audit (`docs/interconnection.md`). It could feed the `gsc` adapter once that's built. Half-day to wire as a one-shot script that ingests the latest CSV into the proposals blob.

5. **Reddit adapter: missing live crawler + misleading admin button** (audit 2026-05-25). The "Run Source: reddit" button on the proposals admin page suggests it triggers a fresh crawl, but it actually only re-runs the LLM matcher against the same static `curify_background/app/assets/hot_topics.json` snapshot (last touched 2026-05-14). No Reddit-API code (PRAW / asyncpraw / reddit.com) exists anywhere in the repo — exhaustive grep confirms. After the first successful match-run, subsequent button presses produce ~0 new proposals because of the (phrase, template_id) dedupe key.

   **What does work** in the pipeline (don't rebuild these):
   - Batch LLM matching (gpt-4o-mini, 10 phrases/batch) at `proposal_matching.py`, shared with the `search_no_result` adapter
   - Hallucinated template_id rejection (validates against the template set)
   - 0.6 confidence cutoff + dedupe key (phrase + template_id) → safe re-runs
   - Score formula `0.4 + 0.6 * confidence` anchored low because Reddit lacks quantified demand vs `search_no_result`'s event counts

   **Gaps** (priority within this work item):
   - **5.1 (P0):** ship a real crawler (`app/utils/reddit_crawler.py`, PRAW or asyncpraw, 6-8 high-signal subreddits — r/midjourney, r/MBTI, r/anime, r/Marvel, r/Wedding, r/PromptDesign as starter list). Call from `run_reddit()` BEFORE `_load_hot_topics()`: crawl → write → match. ~Half-day + Reddit API creds (script-app client_id + secret + user_agent in `.env`).
   - **5.2 (P1):** pass tier1/tier2 context to the LLM matcher alongside each phrase (currently dropped). 1-hour edit to `proposal_matching._MATCH_PROMPT`. Improves match precision on short phrases ("MBTI computer habits" → mbti-generic).
   - **5.3 (P1):** match-quality eval — sample N=50 surviving proposals, manual binary judge, baseline accuracy before any prompt tuning. Half-day.
   - **5.4 (P2):** pre-filter candidate templates to the phrase's tier1/tier2 ancestry before sending to LLM. Currently the catalog blob embeds all 193 templates per call (~3-4K tokens). Cost scales linearly with catalog size.
   - **5.5 (P3):** attach tier1 to proposal `topics` field (currently only tier2 — line 122 of `reddit_utils.py`); add subreddit/thread provenance to `source_ref` once crawler exists.

   **Sanity check before building:** confirm whether a Reddit crawler lives in a different repo / location that a `curify-studio`-only grep would miss. The docstring's framing ("re-running the crawler in curify-studio/curify_background") is specific enough to suggest something existed at some point.

   **Decision deferred:** whether Reddit stays a proposal source at all. If GSC + on-platform `search_no_result` + `search_lowresult` together cover the demand surface adequately, the cheaper move is to **demote Reddit to manual hot_topics.json refresh** (drop the misleading button OR rename to "Re-match: reddit") rather than build the crawler. Revisit when we run a per-source approval-rate audit (open item 3 in this thread).

6. **Automate the no-result / low-result gap classifier** (filed 2026-05-25). Manually we've been doing the same workflow each time a user-reported query fails: classify whether the gap is **tech** (search algorithm — tokenizer, rewriter, matcher) or **content** (catalog gap), then ship a code fix or batch-gen drop. Recent examples: `snake / snakes / 蛇` (3 tech fixes in one feature), `samurai / genshin` (content gen), `鲜花` (rewriter prompt), `accion` (alias top-up). The work codifies that classification into a script that runs over an arbitrary window of `SEARCH_NORESULT` + `SEARCH_LOWRESULT` events and produces a markdown report with concrete suggested actions per query.

   **Phase 1 (planned)**: one-shot classifier + markdown report. No admin UI integration. Six probes per query (plural stem, diacritic strip, CJK regression, compound-noun precision, LLM rewrite hit-check, LLM adjacent-templates suggestion) classify into 5 verdicts: `TECH_FIX` / `CONTENT_GAP_ALIASES` / `CONTENT_GAP_BATCH_GEN` / `OUT_OF_SCOPE` / `NEEDS_HUMAN`. Each verdict comes with a concrete suggested action (file to edit OR config to write). 2-3 day build; lives at `curify_background/app/utils/gap_classifier.py` + `curify_background/scripts/run_gap_analysis.py`; output reports under `curify-frontend/docs/gap-reports/<date>.md`. Success criterion: ≥75% verdict-matches-engineer-judgment precision on a 30-query manual eval set.

   **Phase 2 (out of scope until Phase 1 lands)**: integrate verdicts into the proposals pipeline. Extend `search_no_result_utils.py` to emit two proposal types — `content_gap` (existing template_id+params shape) and `tech_gap` (new shape with query + fix_type + suggested diff). Approved `tech_gap` writes a spec to `docs/tech-gap-queue/` OR opens a draft PR via `gh` CLI.

   **Full spec**: `docs/gap-classifier-phase1.md` — has the 6 probes spec'd in detail, output schema, day-by-day plan, success criteria. Read that before starting the build.

   **Why this is high-leverage**: every gap-fix-feature in the last 2 weeks (snake / 鲜花 / accion / samurai / genshin / Chiikawa) followed the same workflow. Automating the classification step removes ~30 min of human triage per query and ensures consistent verdict criteria.

7. **Long-query bigram weighting in CJK matcher** (audit 2026-05-25). Long compound CJK queries like `适合日本秋季旅行的极简穿搭` (= "minimalist outfit for autumn travel in Japan") produce 12 bigrams but **zero strict catalog matches** — not because the concepts are missing (`日本: 48 records, 旅行: 218, 穿搭: 5, 秋季: 2`) but because no single record contains 3+ of the query's bigrams together AND the cross-boundary noise bigrams (`适合 / 合日 / 季旅 / 行的 / 的极 / 简穿`) dilute the signal. The rewriter rescues the query into a union of partial matches rather than the intersection the user typed.

   **Two possible matcher-level fixes**:
   - **(a) Noise filtering**: drop bigrams that don't appear in ≥N records (e.g., N=10) before computing threshold. For this query, would reduce from 12 bigrams to ~4 meaningful ones, dropping threshold from 3 to 2, surfacing records that match `日本+旅行` or `日本+穿搭`. Cleaner signal, narrow blast radius.
   - **(b) LLM query decomposition**: for queries with >6 bigrams or >4 ASCII tokens, decompose to 2-3 concept clusters via gpt-4o-mini, score each, intersection-rank the results. Higher cost per query but handles arbitrarily-long compounds.

   Both touch `app/[locale]/(public)/search/page.tsx` `scoreBlob` + `scoreQueryTokens`. Eval regression risk is real — many of the 36 regression queries are 2-4 char CJK where current behavior is correct.

   **Priority**: medium-low. Long compound CJK queries are long-tail (most users type 2-6 chars). Worth tackling when the gap-classifier (open item 6) surfaces ≥10 such queries per week, which would justify the engineering cost. Until then, accept rewriter rescue as the best-available behavior.

8. **Search ⇄ generation bridge** (filed 2026-05-26, motivated by ProgSEO demo). The current search results page surfaces inspirations + templates *reactively* — Templates rail only includes templates whose i18n or existing inspirations match the query. This misses the big idea behind the ProgSEO demo: for any query, the page should ALSO surface templates that **could generate** the query (with concrete params filled in), even when zero inspirations exist today.

   **Concrete example**: `cuban sandwich recipe poster` has 1 strict hit today. We have `template-recipe` and `template-food` — both can clearly generate it with `{dish_name: "Cuban Sandwich"}` / `{food_name: "Cuban Sandwich"}`. The page should render both as "Generate this yourself" cards alongside the existing examples grid.

   **Design**: two sections — `Examples generated` (existing) + `Generate "<query>" yourself` (new). LLM matcher (`proposal_matching.py` already exists for Reddit adapter — port to TS, run at query time when results thin, cache via LRU). Page header swaps to a richer status: "<N> examples + <M> templates for <query>" / "No examples for <query> yet — generate one below." Borderline-confidence (0.4-0.7) templates render with a hedged label ("Might work for <query>").

   **Phases**: (1) wire LLM matcher into search page + render new section + tracking → ~3 days; (2) measure CLICK-through + downstream GENERATE attribution → half-day; (3) backfill taxonomy from accepted LLM verdicts to cut LLM cost long-term → half-week.

   **Full spec**: `docs/search-generation-bridge.md` — covers two design paths (taxonomy vs LLM matcher), hybrid recommendation, UI copy proposals per state, mobile + accessibility, risks, open questions, downstream unlocks beyond search.

   **Unblocks**: long-tail SEO landing pages, dynamic /topics/<slug> generate-grids (even when topic has zero content yet), automation pair with gap-classifier (item 6) to turn `CONTENT_GAP_BATCH_GEN` verdicts into concrete batch configs.

9. **Programmatic SEO — topic-hub pipeline** (filed 2026-05-27, **highest-leverage item in the workstream**). Every other item in this thread improves internal UX; this is the only item that converts the workstream output into external (Google organic) traffic.

   **The strategic framing**: the self-evolving search engine produces a content engine — detect demand → match to templates → batch-gen content. But the output surface is internal-only. Audit on 2026-05-27: **1 of 46 eval queries has a Google-indexable static URL today; 45 are search-only and invisible to Googlebot**. The engine works; we just haven't built the export surface.

   **Why search-only URLs don't index**: (a) Googlebot can't type into search boxes — only follows `<a href>`; (b) client-side-rendered `/search?q=…` returns empty HTML to crawlers; (c) Google's anti-Slop policy penalizes internal-search pages as thin content. Fixes: (a) semantic-slug routes `/topic-hub/<slug>`; (b) server-rendered; (c) wrapped as topic-hub format (H1 + 80-120 word LLM intro + curated image grid + downloads + cross-links) so it reads as an editorial topic page, not a search result.

   **Source pipeline** combines three inputs: GSC top queries (impressions ≥ 30, CTR < 3%, position 5-20), internal `SEARCH_NORESULT + LOWRESULT` (≥ 2 distinct users in last 30 days), curated long-tail (e.g. ProgSEO seeds). Slugs gate on catalog-readiness (≥ 5 inspirations OR ≥ 2 high-confidence matcher templates) + intent clarity + cannibalization check against existing /topics/<slug>.

   **Phases**: (0) foundation infra — manifest schema + route + sitemap — 1 day; (1) ship 20 hand-curated hubs from highest-impressions GSC queries — 2-3 days; (2) auto-generation pipeline pairing with gap-classifier verdicts — 1 week; (3) cross-link layer + /topic-hub index — half-week; (4) measurement loop using GSC API — ongoing.

   **Phase 1 success criteria** (30 days post-ship): ≥ 60% indexed, ≥ 5 on page 1, ≥ 500 impressions/week, ≥ 10 clicks/week landing.

   **Full spec**: `docs/programmatic-seo-topic-hubs.md` — covers page anatomy, source pipeline gating, hreflang strategy, risks (duplicate content with /topics, anti-Slop, AI Overview defenses, cannibalization), measurement loop.

   **Why prioritize ahead of items 5-8**: items 5-8 all improve internal UX or measurement; only item 9 converts the workstream into a growth flywheel. Should be the next thing built once Generation Bridge Phase 1 has accumulated 2 weeks of CTR data to inform which queries are matcher-ready.

---

## 2026-06-26 — POD / Merch Design strategic reframe

Workstream reframe per 2026-06-26 strategy discussion. **The thesis: Curify recenters
around Merch Design + POD (Print-on-Demand) as the primary revenue surface.** Search
& Content shifts from "info retrieval / template discovery" to a **Trend &
Inspiration Engine for merch design** — every query is also a potential SKU.

This section captures the search-and-content delta. Companion deltas live in:
- `curify-studio/docs/workstream-tooling-and-engineering.md` → POD design + mockup tooling
- `curify-frontend/docs/workstream-seo-smm-growth.md` → merchant SEO + SMM distribution + sales analytics
- `curify-frontend/docs/workstream-vertical-use-cases.md` → 4 high-margin POD niche packages

### Reframe in one paragraph

Today every search result optimizes for *"did the user find a relevant template?"*.
Under the POD lens it must also answer *"did the user find something they could
turn into a sellable product?"*. That changes (a) the **intent layer** (purchase /
gift / design intent become first-class), (b) the **daily content drop** target
(trend-driven SKU concepts replace generic template authoring), and (c) the **eval
rubric** (commercialization signal joins relevance / coverage).

### Work items (POD lens) — thread mapping

| # | Title | Threads touched | Effort |
|---|---|---|---|
| POD-A1 | **Purchase / design / gift intent classifier** in query routing — when a user searches a subject ("dachshund quotes", "80s retro arcade", "programmer humor"), the result page surfaces a *"Make merch from this"* rail alongside templates + inspirations. Routes into the merch-design demo page (D workstream) | a (search rerank + intent) + b (route binding) | 3-5d |
| POD-A2 | **Daily content drop → "daily trending SKU concepts"** — pivot the hongjie patch cadence from generic templates to *seasonally / event-driven, POD-ready design concepts*. Source: trending memes, holidays, news, niche fandoms. Output: a daily set of merch-ready PNGs + slogans, not just nano-templates | c (daily drop) + d (upstream inspiration) | 1wk + ongoing |
| POD-A3 | **Eval rubric: add "commercialization potential"** — extend `scripts/eval_search.cjs` (or build a sister eval) so each query's top results are scored not just on relevance but on *"could a POD seller turn this into a SKU?"* (slogan-ready / image-only / printable resolution / on-trend). Surfaces queries with high intent but low merch-readiness | a (eval) | 2-3d |
| POD-A4 | **Niche-discovery surface** — mine SEARCH_NORESULT + SEARCH_LOWRESULT + low-CTR GSC queries for **blue-ocean POD niches** (e.g. "minority dog breed witty quotes t-shirt", "tarot cat sticker"). Output: a weekly "underserved POD niches this week" report. Feeds the daily content drop AND the merchant-facing growth-analytics blog series (C workstream) | d (demand sensing) + b (taxonomy gap matrix) | 3d, then weekly cadence |
| POD-A5 | **Trend-capture pipeline (X / TikTok / Pinterest / RedNote)** — extend the proposals adapter set to ingest *visual / merch-shape* trends from social platforms, not just Reddit shape demand. The output is a candidate-design queue with provenance + recency, gated by the existing approval flow | d (upstream) | 1wk (adapter scaffold), then per-platform incremental |
| POD-A6 | **Subject ↔ merch-format mapping** — for every tier-1/tier-2 subject in the topic registry, declare which POD formats convert (t-shirt / sticker / mug / hoodie / canvas / phone case / tote / poster). Drives the *"make merch from this"* rail in POD-A1 and the SKU concepts in POD-A2 | b (taxonomy) | 2-3d |

### Why this belongs in *this* workstream (not just the new C / D docs)

Search & Content is where intent first surfaces. If purchase intent isn't detected
here, every downstream POD investment (mockup generator, listing optimizer, niche
packages) is starved of demand signal. POD-A1 + POD-A3 are the upstream gates;
POD-A2 + POD-A4 + POD-A5 are the supply side that keeps the engine fed.

### Sequencing recommendation

1. **POD-A6** first (1 week) — mapping is cheap and unblocks POD-A1's UX
2. **POD-A1** (3-5d) — the visible UX change that proves the reframe
3. **POD-A3** (2-3d) — instrument before scaling, otherwise we ship blind
4. **POD-A2** in parallel with hongjie-patch refactor (the daily-drop machinery exists)
5. **POD-A4 + POD-A5** as the weekly cycle stabilizes

### Open questions

- Is *"make merch from this"* a button on every result page, or only on certain
  subject classes? (Probably gated by POD-A6 mapping — if subject has no high-converting
  POD format, suppress the rail.)
- Should the trend-capture pipeline (POD-A5) feed directly into autopost (C) for
  amplification, or stay one-step removed via the proposals approval queue?
- Eval-rubric scoring for POD-A3 — LLM-judge or human-curated rubric? LLM-judge is
  faster but commercial signal is noisier than relevance signal.

---

## 2026-06-03 — World Cup expansion plan

GSC shows substantial WC-related search traffic. The tier-1 promotion + EntryBar hot chip shipped 2026-06-01, and the 2026-06-03 daily-drop tripled landing inspirations (1 template / 27 ins → 3 templates / 37 ins). Next wave: **deepen WC content, enrich UX, cross-link to adjacent topics (culture / travel / country pages), layer in monetization.** Items grouped by area; prioritization pending — see end of section for recommendation.

### Content expansion (thread c)

1. **Teams + team-battle watch-list** — top match-ups to anticipate per match week; matchday content cards. Adjacent template: `template-sports-battle` already covers 1v1 (Messi vs Ronaldo style); new use is *team vs team* match-ups (Brazil vs Argentina semi-final preview, etc.).

2. **Post-match meme generator** (比赛结果的梗图) — meme cards for results, players, iconic moments. Sustained engagement (memes are re-shared more than infographics). Template family doesn't exist yet — would need a new `template-match-result-meme` boilerplate that takes (final-score, hero-player, moment-photo) and renders a shareable meme card.

3. **Vote / "who are you rooting for"** interactive — sustained engagement loop independent of match schedule. Cross-cuts with product item 1 (polls); the vote artifact itself becomes a shareable card ("我支持的世界杯队伍 — Argentina!").

4. **Top-query suggestions** — surface GSC long-tail demand on the /topics/world-cup page itself ("People also search: Argentina lineup, Brazil 2002 squad, World Cup all-time top scorers, ..."). Drives further click-through to specific subtopic pages.

### UX & product iteration (cross-cutting)

1. **Poll + comments** — engagement loop on /topics/world-cup and per-match pages. Polls per match ("Argentina or Brazil for semi?"); comments per page. Requires user account integration. **Polls without comments** is cheaper to ship first.

2. **Calendar (match schedule)** — **core anchor** per user direction. Treat as the primary navigation surface on /topics/world-cup. Schedule data source: FIFA API (free, well-documented), or a static seed file refreshed weekly. Calendar entries link to per-match pages (which themselves host polls + post-match memes + team-watch content).

3. **Topic-as-card layout** — country-specific WC pages (`/topics/argentina-world-cup`, `/topics/brazil-world-cup`, etc.) get a card-based layout: hero matchday card → squad card → historical record card → key matchup card. Mirrors the consumer-grade UX that Pinterest / sports.com use; differentiates from text-heavy infographic landing.

4. **Country ↔ WC bidirectional links** — from `/topics/<country>` link to `/topics/world-cup` (cross-promotion via the country's WC history); from `/topics/world-cup` surface country breakdowns. Today the country pages exist but don't cross-link to WC. **Smallest scope, fastest ship.**

### Monetization (new dimension)

1. **Amazon affiliate integration** — jersey, ball, fan merch contextual to the page (Argentina page → Argentina jersey + Messi merch). Requires affiliate-link wrapping middleware + an SKU-to-context mapping; revenue starts at ~3-8% per click conversion. Cleanest pilot: 4 country pages (Brazil, Argentina, France, Germany) + WC main page.

2. **Shopify print-on-demand for user-generated WC posters** — user generates a poster via our templates, hits "order printed" → routed to a Shopify POD partner (Printful / Gelato / Printify). Higher margin than affiliates (30-50%) but requires order-fulfillment integration + design-to-product conversion. Defer to Phase 2.

### Cross-thread implications

- **Search**: WC-related queries get disproportionate ROI from generation-bridge Phase 1. Worth aiming the bridge here first when it ships (thread d item 8).
- **Tagging**: tier2.world-cup is empty today (the bucket was created when promoted to tier-1). Add tier-3 entries under it: teams (Brazil / Argentina / France / Germany / Spain / Italy / Netherlands / Portugal / England + women's powerhouses), tournament editions (2026 / 2027-women / 2022 / 2018 / 1986 nostalgia), eras (Golden Generation Spain, Argentina-Messi, Brazil-Pelé).
- **Calendar** infrastructure: requires data model (`/data/wc_schedule.json` or a new schema), refresh cadence, UI component, link strategy from calendar entries to per-match pages.
- **Polls + comments**: requires user-account integration (anonymous voting may be enough for polls; comments need identity).
- **Affiliate compliance**: FTC disclosure required on every affiliate link; Amazon Operating Agreement compliance (no caching prices, etc.).

### 2026-06-05 — Strategic reframe: WC is the entry point, not the destination

User-direction (2026-06-05): the WC traffic itself isn't the opportunity. **The opportunity is using WC to teach users that any search query can become a beautiful visual answer.** Mindshare to claim: *"Visual Answers for Every Query"* / *"the world's biggest visual encyclopedia factory."* If users remember "the World Cup website" we've lost; if they remember "the site that turns any question into a visual encyclopedia" we've won.

**Decision filter** going forward — every WC choice scored on: does it teach the engine, or just deepen WC retention?

Re-ranked WC work under this lens:

| Surface | Aligned with engine demo? | Action |
| --- | --- | --- |
| Calendar widget on home / WC / sports / country-WC | ✓ a topical demo of the visual-answer pattern | Keep; sharpen click targets to land on `/search?q=…` |
| Calendar widget on 8 WC blog posts | Partial — CTA target matters | Keep, evolve CTA to search-page targets |
| 10 country-WC tier-2 pages | Real content, but WC-deepening | Keep; de-prioritize *more* country expansion |
| Tier-3 tournament editions vocabulary | Risky if all light up as pages | Keep as vocab; don't pour i18n + content into each |
| Search→generation bridge (Thread d item 8) | **Strategic core** — it IS the engine | Promote to highest priority |

### Calendar widget — per-match clickable lines (queued for 2026-06-06)

Plan: each line of the calendar widget's "Upcoming" list becomes its own clickable component (instead of the single bottom CTA). Click → `/search?q=<contextual query>`.

Examples (mapped from current schedule entries):

| Line in widget | Click → search query |
| --- | --- |
| `06-11 Opening Match · Group A` | `Mexico World Cup 2026 opener` |
| `06-12 USA Opener · Group D` | `USA World Cup 2026 opener` |
| `06-13 Argentina · Group A` | `Argentina World Cup 2026` |
| `06-14 Brazil · Group C` | `Brazil World Cup 2026` |
| `07-04 Round of 16 begins` | `World Cup Round of 16 bracket` |
| `07-19 FIFA World Cup Final` | `World Cup Final 2026` |

Why this design embodies the strategic frame:

- Every match line becomes a live demo: "click → search results page → visual answers"
- Users learn the pattern through repetition (a calendar with 3+ clickable rows = 3+ chances to fire the demo)
- The search bar is in the user's hand on landing, inviting "try another query"
- No new content needed today — each line is a small implementation against existing `lib/wc_2026_schedule.ts` data

Today's widget still uses the naive single-link redirect (`/topics/world-cup`) for the "View full schedule →" CTA. Per-match-line clickable upgrade ships 2026-06-06.

### Recommended prioritization (DRAFT — please confirm or redirect)

| Phase | Items | Why | Effort |
| --- | --- | --- | --- |
| **P0 — this week** | (1) Country ↔ WC bidirectional links · (2) tier-3 under tier2.world-cup (teams + editions) · (3) Top-query suggestions card on /topics/world-cup | Fastest-to-ship, highest cross-link / SEO value, leverages existing GSC signal | 1-2 days total |
| **P1 — next week** | (4) Calendar component + schedule data · (5) `template-match-result-meme` boilerplate + 4-6 seed examples · (6) Amazon affiliate pilot on Brazil/Argentina/France/Germany + WC main | Calendar is the anchor; memes drive shareability; affiliate is monetization MVP | 3-5 days |
| **P2 — after CTR data** | (7) Polls (no comments) · (8) Country-WC card-layout redesign · (9) Vote/rooting interactive | Requires usage signal to inform design choices; polls need account integration | 1 week+ |
| **P3 — Phase 2 monetization** | (10) Shopify POD integration | Higher margin but requires fulfillment partnership + UX flow | Multi-week |

---

## 2026-05-30 — Workstream refresh: content shapes + Reddit docking

After ~10 days of search/content production plus the 2026-05-30 blog-engagement triage, the bottleneck has moved. Search recall on covered topics is largely fixed (eval 52/54 PASS, low-result panel ships demand signal, alias top-up is well-grooved). Content production is steady (~5-10 new templates per week via patch branches; 215 templates total). The new bottleneck is **discoverability of which content to make next** — both for filling demand that search/Reddit reveal, and for compounding the catalog without redundancy.

### The unifying frame: content shapes

Today the taxonomy is two-axis:

- **Subject / topic** — what the content is *about* (sports, character, mbti, food, history, ...)
- **Template** — a specific generative pipeline that turns a prompt into a visual

What's missing is the **shape** layer in between — the format-pattern that is portable across subjects:

> 1v1 battle · team poster · then-vs-now · grid collection · timeline-evolution · recipe card · how-to guide · mbti portrait · vocabulary flashcard · character profile · collage · lookbook · packaging · celebration poster · map · ...

The same shape (1v1 battle) is currently expressed across `template-sports-battle`, `template-mbti-comparison`, `template-historical-figure-vs-infographic`. The same subject (world cup) is currently expressed via 1v1 battle + team poster but **not** via nostalgia / then-vs-now / evolution timeline — even though all three shapes exist in the catalog and would clearly fit. **Shape × subject** is the right primitive for spotting that gap.

Downstream consumers this layer unblocks:

- **Content gap discovery**: shape × tier-2 subject → template count. Cells with 0 templates but high adjacent demand are the next-to-build list.
- **Programmatic landing pages**: per-shape index pages (e.g. `/shapes/then-vs-now`) become coherent SEO hubs distinct from `/topics/<subject>`.
- **Reddit demand routing**: when Reddit posts mention "anyone have a [shape] of [subject]", the shape tag tells us which existing templates to surface or which gap to fill next.
- **Search-generation bridge Phase 3**: the parked Phase 3 spec in `docs/search-generation-bridge.md` already pencils in shape-aware accept conditions. With per-template shape tags, the matcher can reason "user asked for a battle, route to 1v1-battle templates".

### Refresh priorities (supersede the 2026-05-19 list below)

1. **P0 — Content shapes taxonomy + per-template tagging.** Define ~15-18 canonical shapes; tag each of the 215 templates with 1-3 shapes; write `content_shapes` and reverse `shape_templates` maps into `lib/taxonomy.json` (same in-taxonomy pattern as the `template_subjects` map shipped 2026-05-26). Build `scripts/build_template_shapes.cjs` as the canonical re-derivation. Output coverage matrix: shape × tier-2 subject. **~1 day. Unblocks every item below.**

2. **P1 — Weekly cron: low-result panel → alias family proposer.** Every Monday, pull `SEARCH_NORESULT` + `SEARCH_LOWRESULT` from prod, cluster via the rewriter, emit candidate alias-family proposals into the existing approval queue. Closes the loop between "user asks → no result → operator adds alias" without manual eyeballing. ~3 days.

3. **P1 — Reddit demand-mining → 3-channel docking.** Current Reddit crawl produces visual proposals (in `proposals.py`). Extend to two more channels: (a) **B2B client seed extraction** — brand/founder mentions feeding the demand-mining doc's outreach queue; (b) **content-shape demand** — what shape is being asked for. Output writes to the proposals approval queue tagged by shape+subject, which the P0 matrix surfaces as gap-filling priority. ~4 days. Depends on P0.

4. **P2 — Search-generation bridge Phase 2 measurement panel.** Phase 1 (LLM matcher routing queries to existing templates) is shipped. Phase 2 panel measures matcher CTR, template-binding hit rate, queries-without-a-match per week. Data input to decide which queries are mature enough to route to Phase 3 (generation). ~2 days.

5. **P2 — Search-generation bridge Phase 3 build.** Once Phase 2 has ≥2 weeks of CTR data and the P0 shape layer exists, build the matcher-to-generation handoff per the spec in `docs/search-generation-bridge.md`. Shape annotations on each template become the acceptance criterion (the matcher refuses to spin up a generation that doesn't bind to a known shape). ~1 week.

Items 5-12 in the prior priority list remain in scope as **Backlog** — they're internal UX / measurement items that don't unblock new growth surfaces, so they wait behind the items above.

---

## Cross-thread priorities (next 2-3 weeks)

Ranked by how much each unblocks downstream. Reprioritized 2026-05-19 after running `scripts/eval_search.cjs --rewrite` and reading the base-vs-union gap.

### P0
1. **[thread a] Eval-driven alias top-up batch**. The 2026-05-19 rewriter eval surfaced 6 queries that only land in `rich` because gpt-4o-mini rescued them — the templates exist, the alias index doesn't reach them on the original query. Each is an alias top-up opportunity, family-pattern same as the 2026-05-18 audit. Plus 3 borderline content gaps that are alias-fixable via adjacent templates. Run `scripts/topup_search_aliases.py` with new families:
   - **wedding/marriage** (`wedding planner` 15 → 409, 27× lift): celebration / vocab-wedding templates.
   - **antonym 反义 / english-chinese** (`反义词` 22 → 246, 11×): opposite-concept / kids-opposite templates.
   - **animal-vocabulary cross-lingual** (`动物 词汇` 8 → 133, 17×): per-language animal vocab templates.
   - **expression / phrase** (`language learning expressions` 10 → 186, 19×): dialogue + native-expressions templates.
   - **english-chinese hyphenated** (`english-chinese` 0 → 259, rescue): bilingual vocab templates.
   - **handcraft / diy / scrapbook** (`手作` 0 → 173, rescue): watercolor / scrapbook / craft templates.
   - **world cuisines / comfort food** (`creative comfort food` 2 → 2, gap): aliasing world-cuisines templates closes the adjacent gap.
   - **paper-cutting / kirigami** (`paper cutting` 1 → 1, gap): aliasing craft-tradition templates.
   - **red-carpet / met-gala** (`met gala` 1 → 1, gap): aliasing fashion / celebrity templates.

   Success criterion: re-run `scripts/eval_search.cjs` (without `--rewrite`) and observe `base_hits ≥ 3` on every query that previously needed the rewriter. 1-2 days.

2. **[thread b] Gallery free-tag categorization proposal**. Proposal landed 2026-05-19 at `docs/gallery-tag-taxonomy.md`. Audit: today only 58.9% of tag-occurrences map to a topic; 90 distinct tags (41.1% of occurrences) are dead-ends. Proposal extends `EXTRA_TAG_TO_TOPICS` with 38 mappings + 3 new tier-3 buckets (`mood`, `lighting`, `seasonal`) — projected to lift coverage to ~91.7%. 4 open decisions queued: tier-1 parent for `mood`, photorealistic reverse-map heterogeneity, long-tail noise audit at ingestion, bilingual coverage timing. Implementation is half-day post-approval.

3. **[thread c] Content drops: hongjie28-patch-4 + hongjie28-patch-2**. Per the daily-content-drop workflow (memory `project_daily_template_workflow.md`). Fetch each patch branch, wire 5 metadata fields, run i18n autotranslate, sync gallery with `--auto-tag`. After both land, re-run the eval to baseline how new templates shift the bottleneck list.

### P1
4. ~~**[thread a] SEARCH_LOWRESULT admin panel**~~ ✅ Shipped 2026-05-25 (user-added). Both `SEARCH_NORESULT` and `SEARCH_LOWRESULT` events now carry weight=1 at query-level when aggregating in the admin portal — a query that fired either event once counts as one demand signal, not weighted by event volume per user.

5. **[thread d] Extend `search_no_result_utils.py` to also harvest `SEARCH_LOWRESULT`**. Same query path, broader demand signal. Cheap now that P1 #4 has shipped — same weight-1 query-level aggregation applies on the proposal-source side.

6. **[thread b] Tag-audit sampling script** (`scripts/audit_tags.py`). Prints 20 random samples per surface with parent-template tier-1 / topic consistency notes. Catches tagging drift post-content-drop. Especially useful after P0 #3 to verify the new content carries the expected topic tags.

7. **[thread d] GSC adapter for proposals**. Once `Pages.csv` is in the loop, the demand signal compounds — search-quality misses + interconnection bleeders + GSC zero-CTR all feed one approval queue.

### P2
8. **[thread b] Subject-topic-seed backfill** for the 2026-05-18 language sweep (family, body, daily-routines).

9. **[thread c] Seed-driven config regen helper** so subject_topic_seeds.json edits propagate automatically.

10. **[thread b] Recommendation layer** built on tier-1 + tag + alias similarity. Half-week. Unlocks the carousel "similar templates" + gallery "more like this" + search alias regeneration use cases. Note: the shipped topic-overlap ranking in Other Templates is the cheapest down-payment on this layer — same Jaccard idea, scoped to one surface.

### P3 / open-ended
11. **[thread d] Approval-rate-per-source dashboard panel**. Calibrates which adapter cron slots to keep.

12. **[thread b] Periodic gallery-tag ↔ topic-registry consistency audit**. Catch silent drift. Subsumed once P0 #2 ships and the gallery tags carry a tier mapping.

### Recently shipped (2026-06-03)
- **[thread c] Daily content drop: hongjie28-patch-4 + hongjie28-patch-5** (`<this commit>`, 2026-06-03) — 3 new templates (all sports / international-event themed, perfect for /topics/world-cup tier-1 lift): `template-football-tournament-group-stage-bracket-infographic` (subject-bound to soccer tournaments), `template-international-event-promotional-poster` (BOILERPLATE per memory `feedback_template_topics_should_be_boilerplate.md` — hosts any event from sports to music festivals), `template-player-vintage-stats-card-poster` (subject-bound to football players, vintage aesthetic). patch-4 had malformed JSON (missing `]` and `,` between two templates) — extracted only the 2 new template definitions via brace-matching rather than full-file parse, preserving the post-Round-2A info-type tags on the 218 existing templates. 12 seed examples generated via Gemini-3-pro (4 per template: FIFA WC 2026 / UEFA Euro 2028 / Copa América / FIFA Women's WC 2027 brackets; FIFA WC 2026 / Milano Cortina / Coachella / Nagoya Asian Games event posters; Messi / Mbappé / Sun Wen / Marta vintage cards). Supabase pull `--since=2026-06-01` added 1 more inspiration (hairstyle-guide). 30 i18n template-locale entries via `scripts/add_hongjie28_patch4_patch5_v5_i18n.py` (flat top-level structure per memory `feedback_daily_drop_i18n.md`). **/topics/world-cup landing went 1 template/27 inspirations → 3 templates/37 inspirations**. Eval 55/57 PASS unchanged. Both remote branches deleted per memory `feedback_hongjie_patch_branches.md`.

### Recently shipped (2026-06-02)
- **[thread c] Gap-matrix batch 1 — 15 examples + tier-4 enrichment** (`cdb014f3`, 2026-06-02) — First content batch driven by the 3D gap matrix. 5 cells filled (16 entries proposed, 15 shipped, Iron Man deferred due to Gemini brand-content refusal on Mark-numbered Stark suits): character × comparison × before-after (Sun Wukong arc, Walter White arc), food × map × map (Italian regional pasta, Chinese provincial cuisine, Mexican mole varieties, French wine regions), sports × {quiz × matching-chart, collection × grid} (soccer-positions-mbti, olympic-sports-mbti, best-soccer-player-by-position), fashion × timeline × evolution (sneaker decades 1970-2026, denim decades, fashion eras 1920-2020), learning × insight × grid (9 animal facts, 16 weird historical events, 9 space facts). Per memory `feedback_template_topics_should_be_boilerplate.md`, subject tags written to **inspirations**' topics[], not parent templates. Tier-4 enrichment per memory `feedback_enrich_taxonomy_during_generation.md`: 4 new buckets (`wine`, `fashion-eras`, `olympic-sports`, `soccer-positions`) + extended `cuisine` (+8). Total 45 new tier-4 entity vocab entries.
- **[thread b] 3D content gap matrix operationalized** (`cecfd25`, 2026-06-02) — `scripts/build_3d_gap_matrix.cjs` materializes the Subject × Info-type × Layout ontology with heuristic Layout derivation from template id substrings (since Layout isn't yet a queryable tag — 2026-06-01 audit Open item 2). First run: 3,510 3D cells, 778 fillable gap cells, 72 saturated. Layout-axis sparsity is the headline (single-image + infographic = 52% of catalog; flashcard, grid, collage, timeline, before-after all ≤7 templates each). Top-30 gap cells + 5 mechanical batch-gen briefs documented in `docs/search-and-content.md` Thread b. Flat `topics[]` schema preserved — tier classification at runtime.
- **[thread a] Rewriter NAMED-ENTITY RELAXATION rule** (`bd231f53`, 2026-06-02) — Cycle 2 carryover. New clause in `lib/searchRewrite.ts` prompt: when a query names a specific entity nested in a broader catalog category, the rewrites should include BOTH the literal entity AND a broader-category fallback. Examples baked in: 服部平次 → [literal, Detective Conan supporting characters, anime detective character]; 阿兹特克 → [literal, ancient Mexico, Mesoamerican civilization]; 敦煌, Lamine Yamal etc. Additive — LITERAL-NOUN + CRITICAL clauses untouched. Eval 55/57 PASS unchanged.
- **[thread a] Weekly search-evolution cycle 2** (`2d0ad4b0`, 2026-06-02) — Second in-session cycle. Cluster A carryover (chiikawa / samurai / genshin) post-topup hits hold. **P0 ship**: 出海品牌 (cross-border ecom brand, Chinese B2B query) → new alias-family `cross_border_ecom_brand` covering 4 product templates with bilingual aliases (出海品牌 / 跨境品牌 / 跨境电商 / 出海 / cross-border / dtc cross-border / overseas-market). 45 inspirations touched. After: 出海品牌 / cross-border / 跨境电商 / 出海 all jumped 0 → 45-46 hits rich. Cycle 3 carryover: rewriter relaxation hardening (shipped same day as bd231f53). Memory `project_search_weekly_review.md` cadence intact.

### Recently shipped (2026-05-31)
- **[thread b] i18n-gating + product tier-2 completion** (`<this commit>`, 2026-05-31) — Single registry-level rule: a topic id is navigable (clickable chip + reachable `/topics/<slug>` page) only when `messages/en/topics.json` has an entry for it. Implemented in `lib/topicRegistry.ts` (filters `declaredTopicIds` + `allTopicIds` by `LOCALIZED_TOPIC_IDS`) and `app/[locale]/(public)/topics/[slug]/page.tsx` (explicit `notFound()` via new `isLocalizedTopic()` export). **Affects 99 unlocalized taxonomy entries** queued for future i18n: tier3.product (15, Round 2D), tier3.design aesthetic+lighting (25, Round 2B), tier3.travel temporal (11, Round 2B), tier3.lifestyle mood (48, Round 2B). The data stays in taxonomy as vocabulary; only the page surface is gated. Future entries auto-comply — author EN i18n in `messages/en/topics.json` to unlock the page. Also: product **tier-2** i18n added across 10 locales (packaging, ecommerce, showcase, branding) and 4 product templates tagged accordingly (food-product-packaging-design→packaging, fashion-ecommerce→ecommerce, product-poster+product-theme-promotional-poster→showcase). Richness audit: only 6 of the 99 unlocalized entries have any data attached (5 from auto-tag on the recent Supabase pull, 1 with 7 inspirations: `illustration`). Eval 55/57 PASS unchanged.
- **[thread b] Info Type axis made load-bearing** (`a38aabd`, 2026-05-31) — Completes Round 2A by moving info-type tags from a hand-curated script dict into `public/data/nano_templates.json` topics[] (the actual source of truth). Adds 6 new tier-2 topics with full 10-locale i18n: **insight** (under learning, displayed as "Facts and Analysis" — collapses what was originally fact + analysis), **information-card** (learning), **quote / story** (culture), **map** (travel), **quiz** (personality — fills the previously-empty bucket). 7 other info-types reuse existing topic words to avoid duplicating vocabulary: profile→portrait, collection→groups, process→guides, timeline→history, comparison/vocabulary/dialogue direct-collide intentionally. 206 new tags written across 165 templates via `scripts/migrate_info_types_to_nano_templates.cjs` (one-time). Refactored `scripts/build_template_information_types.cjs` to pure auto-derive (no more hand-curated dict — same pattern as `build_template_subjects.cjs`). Per memory `feedback_taxonomy_vs_template_tagging_separation.md`. Eval 55/57 PASS unchanged.
- **[thread b] UI chip suppression on detail pages** (`<same commit>`) — `app/[locale]/_components/TopicNavRow.tsx` now drops redundant tier-1 chips when a tier-2 child is present in the same chip set (e.g., template with `[character, mbti, comparison, quiz, relationship]` displays only `mbti, comparison, quiz, relationship`). Special-case: `personality` also drops when `mbti` is present (different tier-1 but same conceptual framework). Suppression is display-only — `topics[]` data model is unchanged, so `/topics/<tier1>` pages and search recall stay intact. Option B from the chosen plan; rejected Option A (registry-hierarchy walk) for downstream-consumer risk.
- **[thread b] Product tier-3 buildout — Round 2D** (`<this commit>`, 2026-05-31) — Fills the `tier2.product` vs `tier3.product` asymmetry I called out in the morning review. 15 new tier-3 entries under `product`: food-packaging, beverage-packaging, cosmetic-packaging, electronics-packaging, luxury-packaging, gift-packaging, hero-banner, lifestyle-shot, flat-lay, detail-image, mood-board, concept-sketch, product-lineup, promotional-poster, logo-application. Tier-2 product stays at 4 (packaging, ecommerce, showcase, branding) — proposed expansion to 6 was reverted after user audit (industrial-design overlapped with the broader `design`/`showcase` buckets; interior-design overlapped with existing `lifestyle.interior`). Lesson saved as memory `feedback_taxonomy_tier_overlap_audit.md`.
- **[thread b] Style axis + gallery tag absorption — Round 2B** (`<this commit>`, 2026-05-31) — 4 style sub-axes shipped as a top-level `content_styles` map: **mood (49 entries, 5,159 prompt count) · aesthetic (19, 3,230) · lighting (11, 547) · temporal (11, 947)**. Each entry carries `gallery_count` from `lib/generated/nanobanana_prompts_metadata.json` — demand signal from prompt-side usage. tier3 extended by 85 entries (design 7→33, lifestyle 9→57, travel 22→33). `gallery_tag_to_topics` reached 100% coverage: **145/145 tags mapped** (was 100/145 from Round 1, 5/19). The 2026-05-19 deferred buckets (mood / seasonal / lighting) finally landed — under existing tier-2 parents that already had the key but no leaves. Per-template style tagging deliberately deferred — style is query-side vocabulary; templates that carry style do so via their own `topics[]`. Canonical re-derivation: `scripts/build_content_styles.cjs`. Eval 55/57 PASS unchanged.
- **[thread b] Information Type taxonomy — Round 2A** (`92a6aed`, 2026-05-31) — Three-layer taxonomy refactor per `raw/taxonomy_brainstorm.txt`. Topic (subject) and Layout grow unbounded, but Information Type is bounded (~14) and is the connective tissue between search intent and generation. 14 canonical types: fact, profile, collection, comparison, timeline, analysis, process, information-card, vocabulary, dialogue, quote, map, quiz, story. Hand-curated 214/215 templates → 1-2 types each (1 untagged = template-food-photo-doodle-sticker-overlay, pure aesthetic overlay). Written to `lib/taxonomy.json` as `information_types` (forward) + `template_information_types` (reverse). Canonical re-derivation: `scripts/build_template_information_types.cjs`. Coverage matrix `info_type × tier-2 subject` surfaces gaps cleanly (timeline×character=1, story×character=0, map×character=0 — character-arc / character-origin-map cells are content-drop candidates). `content_shapes` shipped 5/30 stays in taxonomy.json as a back-compat alias for ~2 weeks. Eval 55/57 PASS unchanged. Round 2B (Style axis + gallery tag absorption) and 2D (product tier-3 buildout) follow.

### Recently shipped (2026-05-30)
- **[thread b] Content shapes taxonomy P0** (`1581a11`, 2026-05-30) — Foundation layer between (subject) and (template). 20 canonical shapes (1v1-battle, then-vs-now, grid-collection, team-group-poster, timeline-evolution, nostalgia-retro, map-spatial, recipe-card, how-to-guide, educational-explainer, mbti-portrait, vocabulary-flashcard, character-profile, collage-scrapbook, lookbook-outfit, packaging-design, celebration-festival, watercolor-illustration, quote-typography-poster, hero-thematic-poster). 204/215 templates assigned 1-3 shapes each (11 unshaped = pure single-image aesthetic templates). Written into `lib/taxonomy.json` as `content_shapes` + reverse `template_shapes` map (same in-taxonomy pattern as `template_subjects`). Canonical re-derivation: `scripts/build_template_shapes.cjs`. Coverage matrix (shape × tier-2 subject) surfaces gaps immediately — e.g. sports × nostalgia-retro = 0, character × map-spatial = 0, food × packaging-design = 0. 52/54 eval PASS (no regression — additive only).
- **[thread a/d] Weekly search-evolution review setup + cycle 1 shipped** (`bc26c90`, 2026-05-30) — In-session cadence (NO cron — user declined automation; memory `project_search_weekly_review.md`). Cycle 1: pulled 14d admin `/interaction-analytics` (reuse-admin-panel pattern, memory `feedback_reuse_admin_panel.md`), 92 candidate queries, 4 clusters. Shipped Cluster A (fandom under-serve): 11 new chiikawa/samurai/genshin examples via `scripts/configs/fandom_topup_2026-05-30.json`. Hits lifted chiikawa 5→8 (was 3 escape-clicks — the loudest user-gave-up signal), samurai 3→7, genshin 3→7. 3 new eval-set entries under source `user-weekly-2026-05-30`, all PASS at moderate. New "Weekly review cycles" section in `docs/search-quality.md`. Eval 55/57 PASS (no new WARNs).

### Recently shipped (2026-05-23 / 25)
- **[thread a] Snake-class tokenizer fixes** (`cdc6d7a`, 2026-05-25) — Two changes in `app/[locale]/(public)/search/page.tsx`. (1) English plural stem: single ASCII tokens ending in -s get singularized at tokenization time (snakes → snake, stories → story, boxes → box). Conservative suffix guard skips -ss/-us/-is/-os/-as. (2) Compound-noun precision guard in scoreQueryTokens: inspirations that strict-match only via their own blob (parent template did not match) require either topical-field reinforcement (template_id / tags / search_aliases) OR a whole-phrase param match (param tokens ⊆ query tokens). Stops query `snake` from being a strict hit on a snake-plant inspiration under a houseplant template that never mentions snakes. 36/36 eval PASS.
- **[thread a] Rewriter prompt patches** (`e3047d2`, 2026-05-23) — Sharpened Path B examples to specifically business / accounting / private individuals; added a CRITICAL clause routing pop-culture / fandom / celebrity names always Path A (Genshin Impact, Bridgerton, Taylor Swift, Stranger Things, Chiikawa). Broadened the non-English language rule from Chinese-only to any non-English. Fixes routing failures on samurai, genshin, taylor swift type queries.
- **[thread c] Samurai + Genshin content gap fill** (`13e30db`, 2026-05-23) — 6 examples via `scripts/configs/samurai_genshin_2026-05-19.json` (fandom-grid + historical-figure-profile + mbti-generic for samurai; fandom-grid + mbti-generic + pop-culture-matching-chart for Genshin). All 5 query variants (samurai, 武士, genshin, 原神, genshin impact) now return 3 hits.
- **[thread c] Daily content drops** (`cd10ef0` 2026-05-23 + `b090079` 2026-05-24 + `bee2b98` 2026-05-25) — 10 new templates across patch-2 (twice) + patch-7. Patch-7 carried the recurring `111111[` corrupt prefix; wire script strips it programmatically. Now at 197 templates total.

### Recently shipped (2026-05-19 / 20)
- **[thread a] P0 #1 eval-driven alias top-up** (`6ea0d36`) — `scripts/topup_search_aliases.py` extended with 9 new families closing the rewriter-dependency gap. 28-query eval shifted from "9 queries needing rewriter rescue" to "0 — all base-rich". Examples: `english-chinese` 0→301, `手作` 0→173, `met gala` 1→83, `wedding planner` 15→252.
- **[thread b] P0 #2 gallery tag taxonomy** (`af42851`) — 3 new tier-3 buckets (`mood`, `lighting`, `seasonal`), 45 EXTRA_TAG_TO_TOPICS entries, plus a noise denylist filter in `scripts/regen_nanobanana_metadata.cjs`. Coverage lifted from 58.9% to 96.9% of tag-occurrences mapped. Audit tool `scripts/audit_tag_coverage.py` makes regression catchable.
- **[thread c] P0 #3 content drops** (`cca9eee`) — 11 new templates from hongjie28-patch-2/4/5, +58 inspirations, +990 i18n strings, +63 CDN assets. Plus 10 wine-focused examples (`7727d3e`) closing the 葡萄酒 gap surfaced in a follow-up audit.
- **[thread a] Precision tightening** (`33a625d`) — Relevance audit via new `scripts/eval_relevance_audit.cjs` surfaced template-level alias overspread. New companion script `scripts/prune_search_aliases.py` removes aliases from over-broad parents; `topup_search_aliases.py` gains `inspiration_filter` for re-attachment at inspiration granularity. Net: 16,936 alias entries pruned, 2,182 re-added at inspiration level. Precision wins: `global influence` 479→38, `wedding planner` 252→88, `动物 词汇` 310→166, `唯美春天` 133→58. Eval still 28/28 PASS.
- **[thread a] Eval set refreshed** (commit pending) — Dropped 8 tier-1 anchor queries (those redirect to /topics/<slug> and surface no fresh signal), added 16 real production queries from admin search-log + GSC zero-CTR list (单词, 卡通, 吉伊卡哇, 家居装饰, 工程, 植物, 水果中文, 电商详情图, 自行车, 葡萄酒, 蔬菜, 词汇, 趣味经济学知识科普, 音乐, 食物, 香薰). Net 36 queries, all PASS at base scoring.

### New tools (2026-05-20)
| Tool | Purpose |
| --- | --- |
| `scripts/prune_search_aliases.py` | Remove specified aliases from inspirations under given template ids. Idempotent. Companion to `topup_search_aliases.py` for the tighten-and-reapply workflow. |
| `topup_search_aliases.py` `inspiration_filter` | Per-family option: only inspirations whose `params.<field>` matches the listed patterns get the aliases. Lets us re-attach moved aliases at inspiration granularity. |
| `scripts/eval_relevance_audit.cjs` | Per-query relevance audit. Reports distinct-template counts + top-4 templates per query for eyeball check. Used to detect alias overspread. |
| `scripts/audit_tag_coverage.py` | Reports % of gallery-tag occurrences mapped to a topic via TOPIC_GALLERY_TAG + EXTRA_TAG_TO_TOPICS. Run after registry edits to confirm coverage didn't regress. |
| `scripts/score_user_queries.cjs` | Ad-hoc scorer for individual queries. Prints hits + top-4 templates. Used when calibrating `expected` buckets in `search_eval_set.json`. |

---

## Where things live

| Surface | Path |
| --- | --- |
| Search runbook (thread a) | `docs/search-quality.md` |
| Search regression eval | `scripts/eval_search.cjs`, `scripts/configs/search_eval_set.json` |
| Per-query relevance audit | `scripts/eval_relevance_audit.cjs` |
| Ad-hoc query scorer | `scripts/score_user_queries.cjs` |
| Alias top-up (template + inspiration level) | `scripts/topup_search_aliases.py` |
| Alias prune (companion to top-up) | `scripts/prune_search_aliases.py` |
| Topic registry (thread b) | `lib/topicRegistry.ts`, `lib/topic_tag_mappings.json` |
| Gallery tag taxonomy (proposal + decisions) | `docs/gallery-tag-taxonomy.md` |
| Gallery tag coverage audit | `scripts/audit_tag_coverage.py` |
| Subject-topic seeds | `lib/subject_topic_seeds.json` |
| Content drop runbook (thread c) | `docs/batch-generation.md` |
| Daily drop workflow | memory `project_daily_template_workflow.md` |
| Proposals router (thread d) | `curify-studio/curify_background/app/routers/proposals.py` |
| Proposal source adapters | `curify-studio/curify_background/app/utils/search_no_result_utils.py`, `template_gap_utils.py`, `reddit_utils.py` |
| Proposals admin UI | `curify-studio/admin_portal/js/proposals.js` |
| Admin SQL search panels | `curify-studio/curify_background/app/crud/admin.py` (sections "Search queries", "Search activity") |
| GSC export (manual refresh) | `Pages.csv` at repo root |
| Sibling status docs | `docs/blog-quality.md`, `docs/interconnection.md`, `docs/etsy-packs.md` |

---

_This doc is the orchestration layer for search + content work. Update it when a thread's priority changes, when a new thread emerges, or after a push that affects multiple threads simultaneously._
