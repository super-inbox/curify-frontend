# Search V2-R3 — Revision R1 (per-path weighting + result-count-aware filtering)

_2026-07-21. Branch `baobao/search-relevance-prod-main-v2-r3-root-cause-fix-2026-07-19`. Scorer config `v1.1.0-2026-07-21`. Driven by the reviewer's search-eval-07-21 feedback (case screenshots in `raw/search-eval-07-21/`, v0 = prod, "new" = V2-R3). Companion to `docs/search-quality.md` (runbook) and `docs/search-and-content.md` thread-a._

## Why R1

V2-R3 replaced V0's **binary `hasStrict` gate + simple token score** with a single **uniform** deterministic scorer (`scoreRecord`), applying one weight set to every candidate regardless of which retrieval path surfaced it (original / rewrite / decomposition / relaxed). The eval-07-21 review confirmed the direction is right (six queries improved) but surfaced two structural problems the uniform schema causes:

1. **Off-subject candidates from non-original paths leak in and rank high on thin queries.** Removing the binary gate — which dropped *all* relaxed-only records once any strict hit existed — also removed the one thing it did right: dropping records that only matched a *rewrite/decomposition* of the query, not the query itself. The uniform scorer gives a rewrite-path token-overlap the same `base_retrieval` credit as a match on the user's actual query.
2. **No result-count awareness.** The floor (`MIN_SCORE_WHEN_ORIGINAL_NONEMPTY`) gates on original-empty-vs-nonempty, not on *how many* relevant results exist. Reviewer's principle: **result-rich queries should score+filter to push the relevant up and drop the clearly-irrelevant; result-poor queries should be left alone (filtering must not shrink an already-thin set).**

## Case analysis (search-eval-07-21)

### Improvements V2-R3 already delivered — R1 must preserve
| Query | Verdict | Mechanism to keep |
|---|---|---|
| 电影海报 (movie poster) | clearly better | subject/coverage gate |
| sticker pack | better — tennis/volleyball demoted | missing-subject + coverage |
| product photo | better — 植物/cat/dog demoted | missing-subject |
| 日历 (calendar) | top-5 better (top-10 ~same) | scoring |
| logo | slightly better | scoring |
| 人体图解 (anatomy) | new ≥ v0 | scoring |

### Regressions / non-improvements R1 targets
| Query | Problem | R1 fix |
|---|---|---|
| **笔袋 (pencil case)** | **regressed** — two western-food "doodle" posters + two Google-Gemini case-study infographics injected ABOVE the one relevant stationery card; v0's relevant stationery grid (en-zh "Pencil Case 笔袋", moyu, panda sets, boogi kits) displaced | per-path base discount + non-original off-subject extra demotion → food/Gemini score negative and drop; relevant stationery leads |
| **促销海报 (promo poster)** | not significantly better — 4th result still irrelevant; top-3 swapped relevant-for-relevant | result-rich subject gate drops the off-subject tail |
| 拼读卡 (phonics card) | no significant top-10 difference | neutral — no R1 change needed; noted, not forced |

## R1 mechanisms (scorer `v1.1`)

All additive to `scoreRecord` / `selectFinalCandidates`; **an extension of the strict/relaxed distinction, not a return to the binary gate.** Weights centralised in `lib/relevanceScorerConfig.ts`.

1. **Per-path base trust** (`NON_ORIGINAL_BASE_FACTOR = 0.5`). `base_retrieval` (the carried-over primaryHits+bigramHits token-overlap, cap 20) is trusted in full only for original-query candidates; a non-original candidate measured that overlap against a *rewritten* slot, so it counts at ½. Only this low-weight term is path-scaled — the high-signal `exact_phrase` / `whole_token` / subject terms are path-independent, so a genuinely on-subject rewrite result is barely affected.

2. **Non-original off-subject extra demotion** (`NON_ORIGINAL_OFFSUBJECT_EXTRA_PENALTY = -10`, added to `missing_subject_penalty`). The graded successor to `hasStrict`: an off-subject record surfaced **only** by a rewrite/decomposition/relaxed path (the exact 笔袋 food/Gemini profile) is demoted below the inclusion floor. Gated by `!subjectPresent`, so on-subject relaxed results — R3's whole point — are never touched. Net for the food poster: `base 10 + tags 8 − 15 − 10 = −7` < floor → dropped.

3. **Result-count-aware subject gate** (`RESULT_RICH_MIN_ONSUBJECT = 8`, in `selectFinalCandidates`). A query is *result-rich* once ≥8 candidates are genuinely on-subject (subjectPresent AND positive score). For a rich query, a **non-original** candidate must carry the query subject to be included at all → prunes 促销海报's off-subject 4th and any 笔袋 food that survived mechanism 2. For a *thin* query the gate never engages — scoring+filtering cannot shrink an already-thin result (reviewer's "对返回结果少的 query 评分+过滤不影响结果"). Original-query candidates are never gated (Direction-1 floor invariant intact).

### Invariants preserved
- Original-pass records always kept when original is non-empty (Direction 1).
- Never-zero guarantee when original is empty (top-N fallback ignores both floor and gate).
- No new LLM calls / embeddings / learned reranker — every signal deterministic from catalog+query text.

### Fix B — landed 2026-07-22 (single-token subject-presence bypass)
The scorer-v1.1 full-326 eval (`visual-search-adhoc/…/scorer-v1.1-evaluation-2026-07-21`) confirmed this residual live: for 笔袋 the flagship regressed (PARTIAL→FAIL) because an off-subject non-original candidate (a canvas-tote-bag food template whose only 袋-content is the alias `帆布袋设计`, no `笔` char) read as **subject-present** and bypassed mechanism 2's `−10` penalty and mechanism 3's rich-gate. Root cause: the single-token branch of `deriveFieldHits` (`page.tsx`) computed `subjectPresent = titleHit || tagsHit`, where those hits come from *this path's* (rewritten/decomposed) `callTokens` and include a CJK bigram/substring fallback — so a decomposition slot's bigram (`帆布袋`) satisfied it.

**Fix:** make the single-token branch consistent with the multi-term branch — `subjectPresent = tokenInBlob(combined, subj)` where `subj` is the ORIGINAL query's subject token (`originalPrimaryTokens[0] ?? originalBigrams[0] ?? fullQueryPhrase`), a whole-token (ASCII) / substring (CJK) hit against the record's own blob, independent of the path's callTokens. The food (no `笔袋`) → `subjectPresent=false` → mechanisms 2+3 fire → dropped; genuine `Stationery`/`en-zh` cards (which literally contain `笔袋`) stay. Multi-term wins are untouched (different branch); single-token wins (`logo`, `日历`) keep their subject because their relevant results carry the token. Tradeoff to watch in re-eval: a CJK single-token query whose only relevant items are English-tagged (no CJK term) loses subject-presence — bounded, and the never-empty + original-floor invariants prevent new zeros. `tsc` clean; 37/37 scorer units still pass (they assert scoreRecord/selectFinalCandidates given a subjectPresent, unaffected by this upstream fix).

### Fix A (Cluster A) — landed 2026-07-22 (format-word-aware subject)

Cluster A = multi-term **head-noun + format** queries where the scorer picked the wrong subject. `deriveFieldHits` approximated a query's subject as its **longest ORIGINAL token**; for "head-noun + format/output" queries that is almost always the FORMAT word, not the theme:

| Query | longest token (old subject) | correct subject | wrong-sense winner it promoted |
|---|---|---|---|
| wine **label** | `label` (5 > `wine` 4) | wine | "label printer" / blank product-label mockups |
| 字母**海报** (alphabet poster) | `海报` wins the compound | 字母 (alphabet) | MBTI/generic "poster" group shots |
| 巧克力**礼盒** (chocolate gift-box) | `礼盒` | 巧克力 (chocolate) | generic gift-box / hamper merch |
| 人体**图解** (anatomy diagram) | `图解` | 人体 (human body) | architecture / how-to "图解" explainers |

Because the wrong-sense content carries the format word, it read as subject-present (`+MISSING_SUBJECT` avoided) while the genuine head-noun results — which lack the format word — took the `−15` missing-subject penalty and sank. Confirmed live on all four via scorer instrumentation (e.g. wine label: subject picked = `label` → label-printers `subj=1`, actual wines `subj=0 → −4`).

**Fix:** the subject is the query's **theme / head-noun content — the non-format token(s)**. New `lib/searchSubject.ts` exports `subjectUnits(primaryTokens, bigrams, fullQueryPhrase)` and a `FORMAT_TOKENS` lexicon; `deriveFieldHits`'s single-token + multi-term branches collapse into `subjectPresent = subjectUnits(...).some(u => tokenInBlob(combined, u))`.

- **Segmented query** (`wine label`) → content primary tokens (`wine`); a candidate carrying only `label` is off-subject → `−15` → demoted.
- **CJK compound with a format bigram** (`字母海报` = 字母 + 海报, `人体图解` = 人体 + 图解) → the non-format content bigrams (`字母` / `人体`); wrong-sense results with only `海报` / `图解` are off-subject.
- **Single concept** — ASCII single word (`logo`) or CJK compound with **no** format word (`笔袋`, `元素周期表`) → the whole token. This **preserves Fix B's strictness** (require the full compound, never a partial bigram), so a record carrying only `元素` is not subject-present for `元素周期表`.
- **All-format query** (`poster`) → falls back to the tokens themselves so a bare-format query still has a subject.

**Leverages the taxonomy (per review Q).** `FORMAT_TOKENS`' English entries are the format/output subset of `lib/taxonomy.json` `content_shapes` + `information_types` (poster, card, flashcard, grid, packaging, map, quote, timeline, infographic…) — the same **subject-vs-shape** separation the taxonomy already draws, not a parallel hand-rolled axis. The taxonomy carries **no CJK shape surface forms** (海报/图解/礼盒/包装 all absent), yet every confirmed CJK Cluster-A regression hinges on one, so the CJK entries are a curated 2-char supplement. Calibration guardrail baked into tests: theme words that merely co-occur with a format (**sticker**, **logo**, map地图, recipe, menu) are kept OUT — so `sticker pack` still resolves subject=`sticker` (`pack` is the format word). Known gap: 3-char CJK shape words (信息图 / 缩略图) don't match a clean trailing bigram — deferred.

Bonus: this also **hardens the 人体图解 preserved-win** (subject now `人体`, not `图解`). Not fixed here: **black friday banner** (`banner` → Marvel's "Bruce Banner") — that one is a *protected-phrase* case (`banner` is not part of the "black friday" anchor, so subject-presence already excludes it); the residual is that Marvel's whole-token TITLE hit on `banner` is uncapped because a protected phrase disables the isolated-hit cap. That needs a **separate** lever (apply the isolated-hit cap under protected phrases) — filed as follow-up, not in this commit.

Tests: `lib/__tests__/searchSubject.test.ts` (16) — the 4 Cluster-A cases, the 6 preserved wins, the 2 Fix-B single-concept cases, all-format fallback, and lexicon calibration (format words present; theme words absent). `tsc` clean; existing 37 scorer units unaffected (they assert `scoreRecord`/`selectFinalCandidates` given a `subjectPresent`, upstream of this change).

### Known residual (follow-up, not blocking)
- Calibration used the eval-07-21 case set only, per the standing prohibition on query-by-query overfitting against the full 326-query benchmark. Re-run the benchmark before promoting to prod.

## Verification
- `npx vitest run --config vitest.unit.config.ts lib/__tests__/relevanceScorer.test.ts lib/__tests__/searchSubject.test.ts` — 53/53 (37 scorer v1.1 + 16 Fix-A `subjectUnits`: 4 Cluster-A cases, 6 preserved wins, 2 Fix-B single-concept, all-format fallback, lexicon calibration).
- `npx tsc --noEmit` — clean (0 errors).
- Live re-eval against search-eval-07-21 queries + the full 326-query benchmark pending before prod promotion (Fix B **and** Fix A now both landed; re-gate covers both).
