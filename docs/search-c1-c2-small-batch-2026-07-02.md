# Search gap small batch — C1 fixes implemented, C2 (MBTI INFJ×ENTP) deferred (2026-07-02)

_Filed 2026-07-02. Follow-up to `project_gap_retest_2026_06_30.md` (P0/P1 gap retest on `baobao/multi-intent-topic-cooccurrence`). Branch: `baobao/c1-c2-gap-fixes-2026-07-02`._

## Summary

This batch addressed 2 of the c1 (alias/tokenizer-adjacent) gaps from the 2026-06-30 retest by adding search aliases to existing `nano_inspiration.json` records — no template/matcher/tokenizer code touched. The `水果中文` / `中文水果` fruit alias gap is fully fixed. The `warmup routine running checklist` gap is only partially addressed: checklist-style recall is improved for the 6 non-running warmup variants (gym, swimming, yoga, badminton, basketball, fencing), but the original running-specific query remains unfixed, since no running-specific warmup inspiration/template exists yet (tracked as a follow-up below). A third gap (`infj vs entp dating compatibility chart`, classified c2 — content gen) had its inspiration image generated and manually approved, but the alias-only fix was found to regress an unrelated query and has been **deferred**, not shipped.

## C1 fixes completed

1. **`水果中文` / `中文水果`** — added both literal (space-free, both orderings) forms as `search_aliases` on `template-vocabulary-fruits-en-zh`. The underlying gap is a bigram-tokenizer limitation (concatenated CJK query doesn't split into the right bigram set for the strict path); adding the literal alias sidesteps it without touching the tokenizer.
2. **`warmup routine running checklist`** (originally the named P1 gap) — on inspection, the P1 gap query is specifically about *running*, and no warmup template/inspiration covers running specifically, so it remains unfixed (see Remaining follow-ups). Instead, this batch added the `checklist` variant alias to the 6 **non-running** warmup activity types that were missing it, closing the general "checklist" phrasing gap for those sports: gym, swimming, yoga, badminton, basketball, fencing.

### Exact aliases added

| Record | Alias(es) added |
|---|---|
| `template-vocabulary-fruits-en-zh` | `水果中文`, `中文水果` |
| `template-warmup-routine-gym` | `gym warmup checklist` |
| `template-warmup-routine-swimming` | `swimming warmup checklist` |
| `template-warmup-routine-yoga` | `yoga warmup checklist` |
| `template-warmup-routine-badminton` | `badminton warmup checklist` |
| `template-warmup-routine-basketball` | `basketball warmup checklist` |
| `template-warmup-routine-fencing` | `fencing warmup checklist` |

## Validation results

**`node scripts/eval_search.cjs --quiet`** — `PASS=87 WARN=38 FAIL=0 (of 125)`. Verdict diff vs. the pre-batch baseline: exactly one flip, `infj vs entp dating compatibility chart` WARN→PASS — this is a *reversion* to the true pre-batch state (removing the never-shipped MBTI record also removed its relaxed-match contribution to that query), not a regression. Zero other flips.

**`npx vitest run --config vitest.unit.config.ts lib/__tests__/thin_recall_queries.test.ts`** — 28/28 passed.

**Ad-hoc strict-match checks** (direct tokenizer/matcher replay against `nano_inspiration.json`, since some of these aren't in the fixed 125-query eval set):

| Query | Strict hits | Matched record(s) |
|---|---|---|
| `水果中文` | 1 | `template-vocabulary-fruits-en-zh` |
| `中文水果` | 1 | `template-vocabulary-fruits-en-zh` |
| `gym warmup checklist` | 1 | `template-warmup-routine-gym` |
| `yoga warmup checklist` | 5 | gym, yoga, badminton, basketball, fencing warmup templates |
| `swimming warmup checklist` | 1 | `template-warmup-routine-swimming` |

All 5 confirmed hits — the c1 fixes work as intended.

## MBTI C2 item — deferred

Record: `template-mbti-relationship-infographic-infj-entp` (target query: `infj vs entp dating compatibility chart`).

- **Generated image passed manual eyeball review** (physical defects, logical defects, unreadable text/乱码, language mismatch, semantic drift, template misuse, placeholder-not-replaced, weird content — all PASS; minor note that bottom summary text is small/dense but acceptable).
- **CDN sync unavailable**: neither `gcloud` nor `gsutil` is installed on this machine (checked PATH, Homebrew, the `~/curify-studio` venv referenced in the onboarding runbook, and did a full-disk search — none found). The asset can't be pushed to `gs://curify-static` from here.
- **Alias-only fix causes a regression**: the target query requires all 6 tokens (`infj`, `vs`, `entp`, `dating`, `compatibility`, `chart`) to literal-match the record's search blob (strict "allPrimary" rule, no partial credit). But `template_id` (`template-mbti-relationship-infographic`) already leaks the words "mbti" and "relationship" into the blob for free (hyphens count as word boundaries). Because of the matcher's strict-floor behavior (any strict match on a query discards all relaxed matches, even if the relaxed pool was large), any alias that supplies both `compatibility` and `chart` — required to hit the target — also causes this same record to newly strict-match `mbti relationship compatibility chart`, collapsing that query's result set from ~10+ relaxed hits (bucket `rich`, PASS) down to a single strict hit (bucket `thin`, WARN). Four narrow INFJ+ENTP-qualified candidates were tested; the two that moved the target query both regressed the unrelated query, and the two that didn't regress it also didn't move the target. See prior session notes for the full 4-candidate test matrix.
- **Real fix is out of scope for this batch**: it requires either a matcher/retrieval change (e.g., don't drop the relaxed pool wholesale when a query gains exactly one new strict match) or a different retrieval strategy for this record (e.g., a template-level rather than token-blob-level signal). Both touch matcher/tokenizer code, which this batch is explicitly scoped to avoid.
- **Not shipped**: the record has been removed from `public/data/nano_inspiration.json`, and `scripts/configs/mbti_infj_entp_2026-07-02.json` has been deleted (was untracked, never committed). The generated local image files (`public/images/nano_insp/template-mbti-relationship-infographic-infj-entp.jpg` and the `-prev.jpg` in `nano_insp_preview/`) are left in place as gitignored local scratch assets — safe to reuse if this item is picked back up.

## Files modified

- `public/data/nano_inspiration.json` — 6 checklist aliases + 2 fruit aliases added; MBTI INFJ×ENTP record added then removed (net: not present).

No other files were modified. `scripts/configs/mbti_infj_entp_2026-07-02.json` was created and then deleted (untracked both times, never committed).

## Remaining follow-ups

1. **MBTI INFJ×ENTP retrieval** — needs a matcher/retrieval-level decision (see above) before the existing generated image + config can ship safely. Local assets are preserved for reuse.
2. **`warmup routine running checklist`** — still genuinely unfixed. No warmup inspiration/template covers running specifically; this needs either a new running-warmup inspiration (content gen, c2-style) or a running-specific alias on an existing general-fitness template if one fits. Not attempted in this batch.
3. CDN sync tooling (`gcloud`/`gsutil`) is not available on this machine — any future asset sync work from this environment needs that installed first, or must be run from a machine that has it (per `docs/onboarding-runbook.md` § 1).
