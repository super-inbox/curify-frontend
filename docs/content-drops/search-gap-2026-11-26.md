# November 26 search gap check-in — partial, blocked weekly analysis

## Completion and deployment ledger

- Last complete core query analysis: November 7 (per November 19 report); expanded competitor/richness loop still incomplete.
- Last partial fresh review: November 19; PR #612 merged 2026-11-19 13:52:28 UTC. Production deployment SHA and subsequent exposure/click/generate/download outcomes could not be verified this run. Do not infer deployment success from merge.
- This targeted investigation: November 26, branch `codex/search-gap-20261126`, baseline main `26d74224`. Local fix prepared; not merged/deployed. No new template/example IDs, assets, CDN upload or social publishing.
- Requested current window: November 19–25 inclusive Asia/Shanghai (UTC November 18 16:00 to November 25 16:00, exclusive end). Previous: November 12–18. Sparse supplement: October 27–November 25.
- Data extraction: existing read-only helper with updated windows, no credentials committed. Network-enabled attempt and bounded retry both returned `DATA_ACCESS_FAILED TimeoutError`; sandbox retry returned DNS `gaierror`. No fresh query aggregates, source freshness, CTR, volumes or zero-click inventory available. Old data is not used as new evidence.
- Built-in browser creation failed `Browser is not available: iab`; browser inventory empty. Actual result destinations, rendered visual quality, Pinterest and Bing remain unreviewed this run.

## Evidence and query-intent table

User screenshot is local only (account UI not committed). See [badcase record](../search-audits/badcases/2026-11-26-bracelet-three-view.md). Its five visible cards are each irrelevant: nanjing (city/weather), wuhan (city/weather), transportation (transport history), dongzhi and guyu (solar-term posters). Relevance@5 = 0/5 for this screenshot only. Destinations not captured.

| Query / provenance | Task and entity | Scene/style/material/structure | Format, language, delivery | Confidence / ambiguity | Cluster |
|---|---|---|---|---|---|
| 手链 三视图; screenshot heading 手链三视图 | Explicit bracelet + three views; design-reference intent inferred | Use scene, style, material, closure and dimensions unspecified | Orthographic three-view inferred from 三视图 with high confidence; Chinese input, English UI; output language/download format unspecified | High subject/format confidence; exact view convention unspecified | Jewelry technical views |
| 手链 三视 图; 手镯 三视图; bracelet three-view drawing; bracelet orthographic views — synthetic controls | Same family, with bangle variant | Unspecified | Three-view/orthographic | Controls, not production traffic | Jewelry technical views |
| 戒指 三视图; 椅子 三视图; 鞋子 三视图 — synthetic controls | Ring/chair/shoe + required view format | Unspecified | Three-view | Used to test family generality, no demand-frequency claim | Product technical views |
| 手链; bracelet design; bracelet perspective drawing; bracelet 3D view — synthetic negative controls | Bracelet only or perspective/3D | Unspecified | Must not impose orthographic requirement | Existing behavior retained, no visual quality claim | Adjacent jewelry inspiration |

This is a case-level table, not the required complete weekly public-query inventory. Sensitive/private inputs were not replayed; no current inputs were obtained.

## Competitor matrix (blocked, not scored)

| Platform | Same-intent queries planned | Visible results/details | Evidence / limitation |
|---|---|---|---|
| Pinterest | 手链 三视图; bracelet orthographic drawing | Not inspected; no score | Built-in browser unavailable November 26; no screenshot captured |
| Bing Images | 手链 三视图; bracelet three-view drawing | Not inspected; no score | Same browser limitation |
| Curify | User screenshot plus local server-page regression | Screenshot five visible examples all irrelevant; local fixture tests below | Local tests cannot establish live ranking, destination, visual completion or attractiveness |

When browser access returns, inspect 5–10 results and representative detail pages on each platform; record actual URLs/screenshots/time, relevance, distinct useful variants, visual finish, thumbnail clarity and practical usability. External rank is not preference evidence.

## Prioritized opportunities and actionable brief

**P1 retrieval — implemented locally.** Product plus mandatory orthographic intent was not protected by original-query constraints. Rewrites can match broad design/3D material unrelated to either object or output. Add original object AND format constraints for the evidenced bilingual bracelet/bangle, ring, chair and shoe family, canonical retrieval and reject decomposed/rewritten paths losing either requirement. Examples must have concrete identity/title/parameter evidence, not only aliases/tags. Subject-only and perspective controls are unchanged. This is bounded coverage, not a general semantic parser or proof that all entities are fixed.

**P2 content opportunity — draft, not generated.** No explicit bracelet three-view example found in the current catalog. Generic `template-minimalist-product-design-presentation-board` and `template-industrial-design-product-presentation-board` already include orthographic sections; evaluate reusing these before adding a template. Some bracelet text matches are ring prompts explicitly saying “not a bracelet”, so they do not fill the gap. A full visual catalog/competitor audit is still needed before asserting breadth and appeal are sufficient.

Brief: initially one linked-chain bracelet sheet and one rigid open-cuff bangle sheet, only after benchmark and existing-batch checks. These are proposed structural contrasts, not observed user material preferences. Show consistent front/side/top geometry, clasp or opening details, restrained clean background and readable view labels; distinguish illustrative concept output from measured manufacturing drawings. Keep dimensions absent unless supplied; do not invent production accuracy. Thumbnail must immediately read as jewelry technical views, not generic jewelry photography or a dense unrelated portfolio board. Accept only if each requested view depicts the same construction, jewelry form stays consistent, labels are legible, no decorative perspective image substitutes for an orthographic view, and each variant adds a useful structural difference. QA rendered assets/text, then CDN, index, persisted query retrieval and actual destinations. No generation or content-drop completion claimed this run.

## Validation and remaining work

- Before patch: targeted server-page/matcher regression produced 9 failures and 4 passes (289 other tests skipped); mocked unrelated rewrites reproduce the failure class, not the exact production screenshot ordering.
- After patch: `npm run eval:tools` — 302/302 pass, 3 files. Includes saved nine query variants, positive object+format matcher examples and subject/perspective negative controls.
- `npx tsc --noEmit` — exit 0.
- Saved eval: `scripts/configs/search_quality_audit_20261126.json`, executed by real server-page test. These controls currently expect no matching examples in the existing catalog; update positive content expectations when a verified batch lands.
- Open: fresh window extraction; full public query intent/zero-card-click review including clicked-but-weak needs; actual top5–10 per-card and destination audit; competitor evidence; content visual QA/drop; production deployment and subsequent user outcomes.
- Continue prior November 19 deferred taxonomy, flashcard-format and typo/capability findings only with current evidence; no duplicate generation.
- Next run must first verify deployment and outcomes, then finish blocked evidence collection; this report does not advance the full-analysis completion date.
