# Gap classifier — Phase 1 spec

_Status: spec. Created 2026-05-25. Owner: TBD. Updates after build land in Thread d open item 6 of `docs/search-and-content.md`._

## Why this exists

Manually we've been doing the same workflow each time a user-reported query fails: classify whether the gap is **tech** (search algorithm — tokenizer, rewriter, matcher) or **content** (catalog doesn't host this concept yet), then either ship a code fix or a batch-gen drop. Recent examples: `snake / snakes / 蛇` (3 tech fixes), `samurai / genshin` (content gen), `鲜花` (rewriter prompt), `accion` (alias top-up).

This work codifies that classification into a script that runs over an arbitrary window of `SEARCH_NORESULT` + `SEARCH_LOWRESULT` events and produces a markdown report with concrete suggested actions. Phase 1 = report only, human applies fixes. Phase 2 (later) = wire into the proposals pipeline for review-and-approve flow.

## Goal

Produce a markdown report classifying each no/low-result query into one of five verdicts, each with a concrete suggested fix:

| Verdict | What it means | Suggested action |
|---|---|---|
| `TECH_FIX` | A mechanical transformation of the query (plural stem / diacritic strip / unicode normalize / compound-noun guard) makes it return results. | Code change in `app/[locale]/(public)/search/page.tsx` tokenizer |
| `CONTENT_GAP_ALIASES` | LLM rewrite produces working rewrites — adjacent content exists but the original query has no alias path to it. | Run `scripts/topup_search_aliases.py` with the surfaced alias family |
| `CONTENT_GAP_BATCH_GEN` | No catalog match for the original or any rewrite, but the LLM names a viable template that could host this content. | Author a `scripts/configs/<theme>_<date>.json` for batch-gen |
| `OUT_OF_SCOPE` | Query is business / non-visual / gibberish — Curify catalog cannot reasonably host it. | Skip; record for prompt-tuning the rewriter Path B |
| `NEEDS_HUMAN` | Ambiguous — multiple probe signals conflict or confidence is low. | Surface for manual review |

## Non-goals (Phase 1)

- No admin UI integration (Phase 2)
- No PR / batch-gen-config auto-creation (Phase 2)
- No Slack / email notification (out of scope)
- No retroactive history — only forward-running on fresh windows

## Input contract

CLI:

```
python curify_background/scripts/run_gap_analysis.py \
  --days=7 \
  --min-users=2 \
  --out=../curify-frontend/docs/gap-reports/2026-MM-DD.md
```

- `--days` (default 7): how far back to pull events
- `--min-users` (default 2): drop queries from a single user (likely test / one-off)
- `--out` (default `gap-reports/<today>.md`)

Pulls from `user_interactions` using the same query-level rollup as `crud/admin.py` Search Queries section (weight=1 per query — per the project's standing rule).

## The 6 probes

Per unique query, run these in order. First hit wins on the verdict ladder.

### Probe 1 — Plural stem (English)

Strip `-s` / `-es` / `-ies` suffix per the conservative rule already in `app/[locale]/(public)/search/page.tsx`. If singular returns ≥3 strict hits → **TECH_FIX (plural_stem)**.

```python
def probe_plural_stem(query: str) -> Optional[str]:
    # Mirror the production tokenizer logic
    if not re.match(r"^[a-z]+s$", query) or len(query) < 4: return None
    if re.search(r"(ss|us|is|os|as)$", query): return None
    if re.search(r"[bcdfghjklmnpqrtvwz]ies$", query) and len(query) >= 5:
        return query[:-3] + "y"
    if re.search(r"(ches|shes|xes|zzes)$", query) and len(query) >= 5:
        return query[:-2]
    return query[:-1]
```

### Probe 2 — Diacritic strip

`query.normalize("NFKD")` + strip combining marks. If `accion` → `accion` (no diacritic to strip) returns hits, this probe doesn't trigger. If `naïve` → `naive` returns hits → **TECH_FIX (diacritic_strip)**.

Note: production tokenizer doesn't do this today — would be a small addition.

### Probe 3 — CJK Trad-to-Simplified

Already in production via `tsToSc`. Probe verifies no regression — if `蛇` returns 4 strict hits, the production path is working; if it returns 0 but should return 4, log as **TECH_FIX (cjk_regression)**.

### Probe 4 — Compound-noun precision check

For each catalog inspiration whose blob contains the query, check whether the query appears in *topical* fields (template_id, tags, search_aliases, locale title/category outside params) or only inside multi-word *param* values.

- If only in params AND template's i18n blob also doesn't mention the query → the strict match is a phrase collision (the snake → snake-plant pattern).
- Production matcher already has the guard (since `cdc6d7a`). Probe just validates the guard is correctly suppressing collisions; flags any leakage as **TECH_FIX (compound_noun)**.

### Probe 5 — LLM rewrite hit-check (alias top-up signal)

Call `lib/searchRewrite.ts` for the query. Score each rewrite against the catalog. If rewrites produce ≥3 strict hits across ≤4 templates → **CONTENT_GAP_ALIASES**.

Suggested action: the rewrite that scored highest names the family (e.g. `mbti marvel`, `wedding planner`, `flower arrangement`). The classifier outputs a stub `topup_search_aliases.py` family entry the engineer can paste into the script.

### Probe 6 — LLM adjacent-templates suggestion

Single-shot LLM call: "Here is the query: `<query>`. Here is the template catalog: `<catalog blob>`. Which templates could host this concept with appropriate parameters? Return JSON: `[{template_id, params, confidence, reason}]`."

If any template returns confidence ≥0.7 AND that template currently has <3 inspirations under similar params → **CONTENT_GAP_BATCH_GEN**. The classifier outputs a draft `scripts/configs/<theme>.json` row the operator can review.

If all suggestions <0.5 confidence → **OUT_OF_SCOPE** (catalog can't reasonably host) or **NEEDS_HUMAN** (matcher uncertainty, surface for review).

## Verdict ladder (precedence)

Run probes in order; first signal wins:

1. Probe 4 (compound-noun): if it fires, the strict matcher is wrong on a known collision — fix takes precedence
2. Probe 1 (plural): mechanical transformation, high precision
3. Probe 2 (diacritic): mechanical, high precision
4. Probe 3 (CJK regression): high precision
5. Probe 5 (alias rescue): medium confidence, requires script run
6. Probe 6 (batch-gen suggestion): medium confidence, requires gen + review
7. Else → `NEEDS_HUMAN` or `OUT_OF_SCOPE` based on LLM domain check

This ordering reflects "cheapest fix first." A plural-stem code change is one line; a batch-gen run is hours of GPU + curation.

## Output schema (per query)

```yaml
- query: "snakes"
  users: 4
  events: 7
  current_hits: 0
  verdict: TECH_FIX
  fix_type: plural_stem
  confidence: 0.95
  evidence: |
    Probe 1: stem to "snake" → 4 strict hits (template-fruit-salak, template-mbti-naruto-Orochimaru, template-species-science-protobothrops-mangshanensis, template-vocabulary-reptiles-amphibians-en-zh).
  suggested_action: |
    Already shipped in commit cdc6d7a. Verify production deployment, then this query should resolve.

- query: "鲜花"
  users: 3
  events: 5
  current_hits: 0
  verdict: CONTENT_GAP_BATCH_GEN
  fix_type: batch_gen
  confidence: 0.7
  evidence: |
    Probe 5 (rewriter): rewrites to [bouquet, flower arrangement, cherry blossom];
      bouquet→0, flower arrangement→0, cherry blossom→12 hits.
    Probe 6 (LLM): suggests template-watercolor-theme-collage-illustration with
      theme="fresh flower bouquet" (confidence 0.75).
  suggested_action: |
    Author scripts/configs/fresh_flowers_2026-MM-DD.json with 3-5 entries:
    - template-watercolor-theme-collage-illustration / theme="fresh flower bouquet"
    - template-watercolor-theme-collage-illustration / theme="wedding bouquet"
    - template-herbal / herb_name="rose"
    Then run scripts/generate_template_examples.cjs --sync.
```

## Report format

Single markdown file per run. Structure:

```
# Search gap report — 2026-MM-DD (last 7 days)

## Summary

| Verdict             | Queries | Users affected |
| ------------------- | ------- | -------------- |
| TECH_FIX            | 4       | 18             |
| CONTENT_GAP_ALIASES | 7       | 23             |
| CONTENT_GAP_BATCH_GEN | 5     | 14             |
| OUT_OF_SCOPE        | 12      | 21             |
| NEEDS_HUMAN         | 3       | 8              |

## TECH_FIX (4)

### snakes (4 users, 7 events)
Probe 1 stems to "snake" → 4 hits ...
Suggested action: ... (already shipped cdc6d7a)

### accion (2 users, 4 events)
...

## CONTENT_GAP_ALIASES (7)
...

## CONTENT_GAP_BATCH_GEN (5)
...

## OUT_OF_SCOPE (12)
List only (no detail).

## NEEDS_HUMAN (3)
Each with full evidence dump.
```

## Files to create

```
curify-studio/curify_background/app/utils/gap_classifier.py   # core classifier
curify-studio/curify_background/scripts/run_gap_analysis.py   # CLI driver
curify-frontend/docs/gap-reports/                              # output directory
```

Classifier API (callable from any script or future router):

```python
from app.utils.gap_classifier import classify_query, classify_batch

verdict = await classify_query(query="snakes", n_users=4, n_events=7, catalog=catalog_blob)
verdicts = await classify_batch([...], catalog=catalog_blob)
```

## Day-by-day plan

**Day 1** — mechanical probes (Probes 1-4)
- Pull queries from DB via existing admin SQL pattern
- Implement probes 1-4 against the loaded `nano_inspiration.json` + `nano_templates.json` + `messages/en/nano.json` + `messages/zh/nano.json` (same shape the production scorer uses, ported to Python)
- Initial report on last-7-days data — should immediately surface plural-class queries
- Self-eval: do verdicts match my judgment on ~10 queries?

**Day 2** — LLM probes (5 + 6) + verdict logic
- Probe 5: reuse `lib/searchRewrite.ts` rewriter prompt verbatim, call from Python
- Probe 6: new prompt — "which templates could host this concept" — embed catalog blob
- Implement verdict-ladder precedence
- Eval: 30 hand-labeled queries, target ≥75% verdict-matches-judgment

**Day 3 (if needed)** — prompt tuning
- If precision <75%, iterate Probe 6 prompt (the LLM judgment is the bottleneck)
- Add `OUT_OF_SCOPE` domain check (the Path B reject criteria from the existing rewriter)

## Success criteria for Phase 1

- Classifier precision ≥75% on a 30-query manual eval set (verdict matches what an engineer would label)
- A 7-day run produces ≥5 actionable items (specific TECH_FIX or CONTENT_GAP_BATCH_GEN suggestions with concrete parameters)
- Runtime <5 min for a 200-query window (Probe 5 + 6 are the LLM cost — batched at 10/call like the existing matcher)
- Report is readable enough that an engineer can act on TECH_FIX entries without rerunning the analysis

## What Phase 2 would build on top

(For reference only — not in this spec.)

- Extend `search_no_result_utils.py` adapter to emit two proposal types: `content_gap` (existing template_id+params shape, feeds daily content drop) and `tech_gap` (new shape — query, fix_type, suggested diff, feeds a dev queue)
- Add a `tech_gap` filter to the admin proposals UI
- Approved `tech_gap` → writes a markdown spec to `docs/tech-gap-queue/<query>.md` OR opens a draft PR via `gh` CLI

Phase 2 only makes sense if Phase 1 classifier precision is solid AND the manual workflow has enough volume to justify the productionization cost.
