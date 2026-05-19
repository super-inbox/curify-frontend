# Search + Content — Umbrella Tracker

_Last updated: 2026-05-19. Owner: jay. Update after any push that touches the threads below or changes priority order._

## Why this doc exists

Search quality, content tagging, content production, and upstream demand-sensing each have their own runbook (`docs/search-quality.md`, `docs/batch-generation.md`, plus pieces in `curify-studio`), but the work is interlocking — a recall fix in search can be a tag fix, a tag refactor can change what gets generated next, and the upstream proposals pipeline feeds the content drop. This doc is the **orchestration layer** that names the threads, points to the runbooks, and tracks cross-thread priorities so we don't lose context jumping between them.

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

### Open items
1. **Random-sample audit recipe.** No script yet that samples 20 random inspirations + 20 random templates + 20 random gallery prompts and prints their tags side-by-side with their tier-1/tier-2 expected. The cheapest visibility tool: a one-shot `scripts/audit_tags.py` that prints sampled records' `topics`, `tags`, `search_aliases`, plus the parent template's `topics`, plus a "consistency note" (e.g. "inspiration is tagged `vocabulary` but parent template's tier-1 is `learning` not `language` — re-tag?"). Catches drift early, especially right after a content drop.

2. **Recommendation layer.** `subject_topic_seeds.json` is currently write-only (input to gen). The user flagged it as the substrate for: similar-template recommendations, similar-example recommendations on /carousel, similar-gallery recommendations, and a richer search-alias source. None of those are wired yet. The structure: take a record's tier-1 ancestor + its tier-3 tags + its `search_aliases` → query a similarity index → return top-N. Open question whether to build the index in JS (BM25 over the existing blobs) or to offload to a vector store. **Half-week task minimum.**

3. **Tag-vs-topic drift between gallery prompts and templates.** Gallery prompts use free `tags` only; templates use structured `topics`. The reverse map `TOPIC_GALLERY_TAG` papers over this for /topics/<slug> pages (each tier-1 topic points to one canonical gallery tag), but it's brittle — adding a new gallery tag or renaming one breaks the link silently. Worth a periodic audit: which gallery tags have no corresponding topic entry? Which topics have no gallery presence?

4. **Subject seed coverage.** `subject_topic_seeds.json` covers ~5 subjects today (animals, nature, space, weather, etc.). The English-X language pair sweep on 2026-05-18 introduced new subjects (family, body, daily-routines) that are not yet in the seeds. Backfill them so the next `vocabulary_kids_topics.json` regen carries them forward.

5. **Split `travel` and `culture` into two tier-1 topics.** Today `culture` is a tier-2 navigational child under `travel` (`EXPLICIT_CHILD_TOPICS.travel = ["culture","food","city","itinerary"]`). The user-facing concepts are distinct — a Studio Ghibli culture card or a Lunar New Year infographic is not a travel template, and a watercolor map itinerary isn't a culture template. Promoting `culture` to its own tier-1 lets templates carry both tags (e.g. a Kyoto temple guide is genuinely travel AND culture) without forcing the false either/or that the current hierarchy implies. Touches `lib/topic_tag_mappings.json`, `lib/topicRegistry.ts` (TIER1_USE_CASES, EXPLICIT_SIBLING_GROUPS), EntryBar capsule order in `messages/<locale>/common.json`, and a targeted re-tag pass on existing templates currently labeled only `travel` that should also gain `culture`.

6. **Other-templates section quality.** `buildOtherTemplateCards` in `lib/nano_page_data.ts` is the surface on `/nano-template/<slug>` and `/nano-template/<slug>/example/<id>` that shows "Other templates" below the current template. Today it returns the top-ranked templates globally (filtered only by `excludeTemplateId`) — no topic relatedness, so a Marvel MBTI page surfaces unrelated watercolor maps. Should rank candidates by topic-overlap (Jaccard or shared-topic-count) against the current template, falling back to global rank when there is no overlap. The row count on these specific surfaces is also higher than needed — drop from `30` cards (~5 rows) to `15` (~3 rows) on template/example pages. Other surfaces (topics page, tools page, tag page, prompt page) build their own card lists through different paths and aren't affected.

---

## Thread c — Content production + daily drop

**Runbook:** [`docs/batch-generation.md`](./batch-generation.md). Memory: `project_daily_template_workflow.md`.

### Already shipped
- Config-driven generator (`scripts/generate_template_examples.cjs`) with watermark, auto-tag, `search_aliases` enrichment, optional `--sync` to CDN.
- Daily-content-drop workflow (fetch hongjie28-patch-N → wire 5 metadata fields → i18n autotranslate → gallery sync with `--auto-tag`).
- Recent batch: 75 low-language examples on 2026-05-18 (config `scripts/configs/low_languages_2026-05-18.json`).

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
reddit               reddit_utils                        crawled reddit threads on relevant subreddits
(future) gsc         (not implemented)                   Google Search Console zero-CTR / no-result
rss                  separate /rss/run endpoint          curated RSS feeds (not in the proposal router)
```

Each adapter produces proposal entries in a unified schema (slug, title, evidence, source, status). Proposals land in one blob (`PROPOSAL_STORAGE`). Admin UI at `admin_portal/js/proposals.js` reads `GET /proposals`, mutates status via `PATCH /proposals/{id}`, and exports the APPROVED set as a config JSON ready to feed `curify-frontend/scripts/generate_template_examples.cjs`. The full loop demand → proposal → approval → content drop is wired.

### Open items
1. **Add SEARCH_LOWRESULT as a proposal source.** The adapter `search_no_result_utils.py` currently surfaces only `SEARCH_NORESULT` queries. With the new `SEARCH_LOWRESULT` action type live (commit `72e7189` backend + migration), the adapter should expand to "queries that returned ≤2 results across all surfaces." Same upstream-demand framing, broader coverage. Trivial extension — one UNION clause in the SQL.

2. **Wire GSC as a fourth source.** GSC export (`Pages.csv` at repo root, refreshed monthly per `docs/interconnection.md`) has zero-CTR queries that the in-product `search_noresult` event never sees (since GSC measures impressions on SERP, not site visits). Adding it as a proposal source closes a real gap — users who search Google for "Marvel MBTI" and see Curify but don't click are demand we lose today.

3. **Track approval rate per source.** Some sources will produce mostly noise (reddit thread title harvesting) vs mostly signal (template-gap top-quartile). A simple admin panel showing approval-rate-per-source-per-week would surface which adapters earn their cron slot. Cross-references with thread-c drop volume.

4. **Trace the GSC `Pages.csv` data into the existing proposal flow.** Today `Pages.csv` is a manual export read for the interconnection audit (`docs/interconnection.md`). It could feed the `gsc` adapter once that's built. Half-day to wire as a one-shot script that ingests the latest CSV into the proposals blob.

---

## Cross-thread priorities (next 2-3 weeks)

Ranked by how much each unblocks downstream. Items already in flight elsewhere are listed for cross-reference but don't reblock.

### P0
1. **[thread a] Add the `SEARCH_LOWRESULT` panel to admin** (`curify-studio` backend, `app/crud/admin.py`). Half-day. Without it, every other thread-a alias top-up stays analyst-driven instead of data-driven.

2. **[thread d] Extend `search_no_result_utils.py` to also harvest `SEARCH_LOWRESULT`**. Same query path, broader recall on demand signal. Cheap once P0 #1 lands (the SQL is similar).

### P1
3. **[thread b] Topic-aware Other Templates ranking + lower row count.** Replace global-rank fallback in `buildOtherTemplateCards` with topic-overlap ranking against the current template; cap the section at ~3 rows on `/nano-template/*` and `/nano-template/*/example/*` (currently ~5 rows of mostly-unrelated cards). Half-day. Single function + the two callers; other surfaces are unaffected. Open item Thread b #6.

4. **[thread b] Split travel and culture into separate tier-1s.** Today `culture` is tier-2 under travel, forcing a false either/or. Promote it to tier-1 in `lib/topic_tag_mappings.json` + register in `topicRegistry` + add an EntryBar capsule. Then a targeted re-tag of templates currently labeled only `travel` that should also gain `culture`. Half-day for the structural change; the tagging audit fits the same window. Open item Thread b #5.

5. **[thread b] Tag-audit sampling script** (`scripts/audit_tags.py`). Prints 20 random samples per surface with parent-template tier-1 / topic consistency notes. Half-day. Catches tagging drift post-content-drop and ahead of next alias top-up.

6. **[thread a] Precision/recall tightening from the eval gap**. Run `scripts/eval_search.cjs --rewrite` weekly; flag queries where rewriter union >> base (suggests alias under-coverage) or where rewriter recovers nothing despite a known content gap (suggests content-thread escalation). 30 min weekly cron.

7. **[thread d] GSC adapter for proposals**. Once `Pages.csv` is in the loop, the demand signal compounds — search-quality misses + interconnection bleeders + GSC zero-CTR all feed one approval queue.

### P2
8. **[thread b] Subject-topic-seed backfill** for the 2026-05-18 language sweep (family, body, daily-routines).

9. **[thread c] Seed-driven config regen helper** so subject_topic_seeds.json edits propagate automatically.

10. **[thread b] Recommendation layer** built on tier-1 + tag + alias similarity. Half-week. Unlocks the carousel "similar templates" + gallery "more like this" + search alias regeneration use cases. Note: P1 item 3 (topic-overlap ranking in Other Templates) is the cheapest down-payment on this layer — same Jaccard idea, scoped to one surface.

### P3 / open-ended
11. **[thread d] Approval-rate-per-source dashboard panel**. Calibrates which adapter cron slots to keep.

12. **[thread b] Periodic gallery-tag ↔ topic-registry consistency audit**. Catch silent drift.

---

## Where things live

| Surface | Path |
| --- | --- |
| Search runbook (thread a) | `docs/search-quality.md` |
| Search regression eval | `scripts/eval_search.cjs`, `scripts/configs/search_eval_set.json` |
| Topic registry (thread b) | `lib/topicRegistry.ts`, `lib/topic_tag_mappings.json` |
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
