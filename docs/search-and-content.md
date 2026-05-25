# Search + Content — Umbrella Tracker

_Last updated: 2026-05-20 (P0 #1 eval-driven alias top-up + P0 #2 gallery tag taxonomy + P0 #3 content drops all shipped 2026-05-19/20; precision tightening pass + new prune/audit tools shipped 2026-05-20; eval set refreshed with 16 real user queries). Owner: jay. Update after any push that touches the threads below or changes priority order._

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
