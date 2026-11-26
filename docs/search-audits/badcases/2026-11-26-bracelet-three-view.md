# SEARCH-20261126-01 — 手链 三视图

Status: recorded; diagnosis, generalization review and fix pending.
Reported: 2026-11-26, user screenshot timestamp 09:41:54 Asia/Shanghai.
Evidence: user-supplied screenshot `/Users/qqwjq/Desktop/Screenshot 2026-11-26 at 9.41.54 AM.png`. Keep the original local; it includes account UI and is not copied to public assets or committed as an image.

## Observed, not inferred

- Search box: `手链 三视图`.
- Result heading: `手链三视图` (space removed in displayed query).
- Rewrite banner: `bracelet 3D view`, `bracelet design illustration`, `bracelet perspective drawing`.
- First five visible cards: `nanjing`, `wuhan`, `transportation`, `dongzhi`, `guyu`.
- Their images depict city/weather miniatures, transportation evolution and solar-term infographics. None depicts a bracelet or bracelet three-view drawing: relevant@5 = 0/5 for the visible examples.
- Explore-further chips: learning materials 5, visual art 5, travel place 4.
- English UI is selected. Actual route, deployment SHA, rewrite response, scores and result IDs were not captured; titles are not asserted to be record IDs.

## Intended task and provisional priority

High-confidence subject: bracelet / 手链. Requested output: 三视图, ordinarily an aligned orthographic front/side/top design sheet of the same object. Particular view convention, dimensions, material and production requirements were not specified; do not invent them. A perspective illustration or generic 3D view does not by itself satisfy this format.

Provisional P1 retrieval/query-understanding defect: all five visible results lose the requested subject. Also investigate output-format drift: the shown rewrites weaken 三视图 into 3D/perspective imagery. This is not yet a confirmed missing-content finding; search the full existing catalog before proposing generation.

## Follow-up: determine whether the problem generalizes

1. Reproduce public queries `手链 三视图`, `手链三视图`, `手链 三视 图`, `手镯 三视图`, `bracelet three-view drawing`, `bracelet orthographic views`. Record actual rendered examples, template rail, gallery, suggestions, rewrite paths, scores and deployment baseline.
2. Compare subject-only and format-only controls: `手链`, `三视图`, `bracelet design`, `bracelet perspective drawing`. Distinguish exact three-view answers from useful adjacent inspiration; do not label ordinary product photography an exact match.
3. Test the same subject-plus-format pattern on `戒指 三视图`, `椅子 三视图`, `鞋子 三视图`. Check Chinese whitespace/tokenization, terminology translation, original and rewritten retrieval paths, relaxed matching, broad metadata/tag matches and final relevance filtering. These are hypotheses, not established root causes.
4. Inspect whether genuinely orthographic/multi-view jewelry examples or reusable templates already exist. If absent, separately log a content-format gap; use browser comparison for useful design directions before generating. A suitable generic template is not evidence that a matching bracelet example exists.
5. Prefer fixing the evidenced failure mechanism across subjects over adding a bracelet-only blacklist. Retain required subject AND format through rewriting/ranking; place explicitly labeled adjacent suggestions separately. If no exact result exists, show an honest empty/thin state or an appropriate generation entry instead of unrelated filler.

## Acceptance / persistent regression brief

- Bracelet three-view queries do not return city miniatures, transportation-history or solar-term cards in their primary results.
- A result claimed as exact shows the same bracelet consistently across distinct requested views; generic jewelry imagery is not sufficient.
- Rewrites preserve bracelet identity and orthographic/three-view intent. Chinese spacing variants preserve equivalent meaning.
- Preserve useful recall on subject-only and perspective-drawing controls; do not globally equate 3D, multi-view and orthographic drawings.
- Add representative query pairs and negative controls to persisted eval plus actual search-page tests, then verify live rendering after deployment.

No code fix, fresh analytics, catalog-completeness claim or live reproduction completed in this recording step. Include this case in the next weekly review regardless of query frequency; finish diagnosis and fix before marking resolved.

## November 26 targeted investigation (not a completed weekly analysis)

Baseline origin/main 26d74224. Actual server-page regression with deliberately unrelated
rewrites reproduced the failure class: 9 new tests failed before the change (including
one subject/format matcher test); 302 search/tool tests pass after it. The screenshot
remains the production evidence; the local mocked rewrite is not a live reproduction
of the exact five cards or evidence of production frequency.

Root cause: original-query subject constraints cover selected audited demands only.
This product three-view family had none, so relaxed/rewrite paths could admit unrelated
subjects and weaken mandatory output format. Added a bounded bilingual object+format
constraint for bracelet/bangle, ring, chair and shoe three-view requests, canonical
English retrieval and filtering of expanded paths/banner rewrites. Concrete example
identity/title/parameters must support both requirements; broad tags alone cannot.
Generalization beyond these four product families remains unverified. Subject-only,
perspective and 3D queries retain their prior behavior.

Catalog inspection found generic industrial design boards with orthographic sections,
but no explicit matching bracelet three-view example. Some bracelet string matches
are ring prompts saying “not a bracelet”; those are not matching content. Existing
board templates are potential starting points, not proof of a ready bracelet example.
Content brief and outstanding validation are in ../../content-drops/search-gap-2026-11-26.md.
Status: local regression fixed, production verification pending deployment; not resolved live.
