---
name: curify-search-gap-weekly
description: Review Curify search queries and clicks, diagnose routing versus retrieval versus genuine content gaps, fill evidenced priority gaps, and validate a content drop. Use for weekly search reviews, no-click analysis, search gap analysis, or deciding whether another content top-up is due.
---

# Curify weekly search gap review

Work in `/Users/qqwjq/curify-frontend`; backend analytics lives in `/Users/qqwjq/curify-studio`. Read repository instructions and current git/worktree status. Use an isolated `codex/` worktree when another workstream is active; preserve unrelated changes.

## Establish whether a cycle is due

Read `docs/search-and-content.md`, `docs/search-quality.md`, recent `docs/content-drops/` reports and git history. Track the last **completed analytics + remediation review**, separately from a small routing fix or content-only drop. The October 20, 2026 report `docs/content-drops/search-quality-2026-10-20.md` is a known completed review; October 21 tool routing and October 27 ASL entry-point work are follow-ups, not fresh analytics cycles. Search for newer evidence before using these dates.

A weekly review is due after seven days. Explicit user requests or a serious new regression can justify an earlier run. Record attempted/blocked runs separately; never advance the completed-review timestamp when data collection failed. If already reviewed for the same data window, reuse findings and finish outstanding work instead of duplicating content. Earlier notes declining automation are superseded by the user's October 29, 2026 weekly scheduling request.

## Collect evidence and classify

Read the analytics section of `docs/search-performance-and-content-gap-2026-10-11.md` before collecting data. Reuse the admin `interaction-analytics` search_queries section and backend `curify_background/app/crud/admin.py` attribution logic. The helper `dev/jayw/admin_analysis/search_cycle5_pull.py` supplies click-target details, but its old SQL needs checking: normalize instrumentation suffixes and whitespace, recognize locale-prefixed routes, use the current test-account exclusions and bot filtering, and retain redirect attribution. The older `search_noclick_pull.py` is not a complete modern attribution implementation.

Use read-only DB transactions or existing authenticated read APIs. Inspect credentials through their existing loader; do not print secrets. Compare the last seven complete days against the preceding seven, with 30 days for sparse-query context. Record exact time bounds, timezone, source and exclusions. Save only aggregated, sanitized evidence in git: no visitor IDs, sessions, pasted private URLs or identifiable query text. Five-minute same-user/session attribution is observational and may attribute a click to adjacent searches; distinguish automatic redirects from deliberate clicks.

Inspect no-result, low-result with clicks, low-result without clicks, and normal-result without clicks. Include clicked destinations, query frequency, distinct users, available result counts and attributable CTR denominators. Low frequency affects prioritization, not whether a query deserves inspection. Never infer that content gaps are absent from a high-frequency sample. Do not assume the local branch is deployed.

## Complete zero-click quality audit (required)

On every weekly run, enumerate **all distinct zero-result-card-click queries** for the last seven complete local-calendar days, with no minimum-frequency or top-N query cutoff. Include queries present only as NORESULT/LOWRESULT markers. Collapse instrumentation suffixes while retaining narrowed-search context in the evidence; deduplicate within query/locale/context. Count example, template and gallery card clicks; report topic/tool arrivals separately. SEARCH events and result-state markers are not disjoint visits. Do not call searches-with-click divided by SEARCH events impression-based CTR.

For every candidate, inspect the first **5–10 actual rendered results** (all if fewer), including thumbnails, titles and destinations. Follow actual redirects and inspect the destination rather than pretending a tool page has an image-results ranking. Record missing/broken images and distinguish the primary example grid, template rail, gallery and broader suggestions. Prefer live browser evidence; local mocked tests validate behavior but do not establish live ranking. Record locale, timestamp, code/deployment baseline and whether rewrites were live.

Maintain a per-query audit ledger: search/marker counts, observed redirects/clicks, first 10 result IDs/URLs/titles, per-result grade (exact, useful adjacent, off-intent, unusable), relevant@5/10 with explicit denominator, subject/format/language fit, catalog evidence, classification, priority, proposed action, and before/after verification. Ambiguous queries can remain unresolved; never invent their intent. List unavailable/private inputs as separate exceptions with a reason. Do not send personal file paths, pasted private URLs or identifiable text back through search/LLM replay; use sanitized synthetic controls when diagnosing the input class.

Classify every term as: tool/navigation, retrieval/ranking, preview/display, genuine missing content, unsupported capability/help intent, ambiguous/no demonstrated defect, or blocked/needs evidence. Labels may overlap. Search the existing catalog before calling something a content gap: semantic near-matches may not satisfy requested language, format or entity. A relevant first result does not excuse an off-topic tail. A sparse but fully relevant result set need not be expanded.

Report coverage explicitly (total candidates, public queries reviewed, privacy exceptions, unavailable pages). Do not call the audit complete while public queries remain uninspected. Prioritize obvious wrong-intent results even when queried once; use frequency and independent users to size generation batches, not to dismiss confirmed gaps. Save the complete ledger and a small representative regression set. Fix P1/P2 items, including evidenced content briefs or small drops, and record deferred work with reasons. A no-generation conclusion must be supported by the full ledger, not a handful of samples.

Classify each cluster before selecting a fix:
- Existing tool intent: repair registry/aliases/navigation or add a topic-page entry point. Bare ASL can remain a topic; explicit ASL translation should expose the tool.
- Relevant content exists: improve retrieval, subject/language constraints, ranking, titles or previews. Avoid broad aliases that return irrelevant results.
- Genuine missing content: create examples matching the requested subject, format and language.
- Performance or instrumentation problem: fix or document that problem; generating content does not solve it.

Prioritize P1/P2 by repeated demand, severity, affected users and confidence. Save a short table linking query clusters to evidence, current failure, proposed destination/content and acceptance checks. A cycle with no supported content gaps may correctly generate nothing.

## Fill gaps and validate

Use `docs/batch-generation.md` and `docs/onboarding-runbook.md` for current content-drop mechanics. Prefer existing templates and deduplicate against `public/data/nano_inspiration.json` and `public/data/nanobanana.json`. Start with a small batch for the strongest 2–3 supported clusters; do not mass-generate from isolated queries. Use the available image-generation skill when producing or editing images. Inspect actual images and text, correct errors, generate the expected previews/watermarks, and verify uploaded asset URLs. Keep concept mockups distinct from production-ready dielines; make accurate tool-capability claims.

Update canonical content records, genuine topic/search aliases and required generated indexes. Curated gallery records use `scripts/build_search_curated_gallery.py`; inspect its selection rules before assuming a new record is indexed. Update the saved tool eval `scripts/configs/tool_search_eval_set.json` for routing changes and `scripts/configs/search_eval_set.json` for content cases, including confusing negative queries. Read `docs/search-eval-set.md` and current scripts before running relevant tests. Run `npm run eval:tools` when routing is touched; use focused integration tests and the existing content eval for retrieval changes. Report pre/post relevance, not just hit counts. Do not claim improved production CTR until a later live measurement supports it.

For an authorized content drop, upload verified assets and commit/push only task-owned changes on a dedicated branch; open a reviewable PR if appropriate. Do not merge or mark deployment complete without confirmation from the actual deployment state. Public social posting and SMM scheduling are separate actions requiring their own explicit scope; a search content drop alone does not authorize them.

## Close the loop

Write `docs/content-drops/search-gap-YYYY-MM-DD.md` containing the data window, prior completed review, aggregated evidence, P1/P2 decisions, generated record IDs, branch/commit, tests, deployment status and remaining gaps. Update `docs/search-and-content.md` with a link and clearly separate analysis completion, content-drop completion and production verification. If no new content was warranted, state that and the evidence. If blocked, record the missing access or evidence without inventing findings.

For scheduled runs, notify only for actionable findings, completed changes, regressions or blockers. Stay quiet when nothing meaningful has changed. The next run must check post-deployment outcomes for the previous fixes before proposing another batch.
