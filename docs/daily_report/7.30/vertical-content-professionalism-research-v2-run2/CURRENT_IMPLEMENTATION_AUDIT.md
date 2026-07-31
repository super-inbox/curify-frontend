# Current Implementation Audit — VerticalPageSchema & Related Code

**research_run_id:** vertical-content-professionalism-research-v2-run2
**research_run_date:** 2026-07-30
**audit_type:** read-only code audit (no code modified)
**repo:** curify-frontend
**worktree:** `/Users/baobaoli/Desktop/curify-frontend-vertical-seo-2026-07-30`
**branch:** `baobao/vertical-content-professionalism-research-v2-2026-07-30`
**HEAD at audit time:** `2d4a89f8` (2026-07-28 18:36:11 +0800)
**method:** direct file reads + `grep`/`python3 -c` (JSON parsing) against the real files below —
no conclusion in this document is inferred from a filename alone.

---

## 1. Files read as primary evidence

| File | Role |
|---|---|
| `docs/vertical-page-schema-v1.md` | Design doc (21,989 bytes, last touched 2026-07-28) |
| `lib/vertical_schema.ts` | Schema registry (126 lines) |
| `lib/nano_seo_utils.ts` | Resolver + JSON-LD builder (529 lines) |
| `app/[locale]/_components/VerticalKnowledge.tsx` | Render components (52 lines) |
| `app/[locale]/(public)/nano-template/[slug]/page.tsx` | Template page — wires the above in |
| `app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/page.tsx` | Example page — checked for the same wiring |
| `messages/en/nano.json`, `messages/zh/nano.json` | Per-locale authored content, parsed with Python's `json` module |
| `public/data/nano_templates.json` | Template registry (346 entries) |
| `lib/taxonomy.json` | tier1–tier4 taxonomy (referenced by `taxonomyAxis` fields) |
| `docs/search-and-content.md` | Confirms the "three-tier" ontology is `lib/taxonomy.json` tier1–4, a *separate* system from `VerticalPageSchema` |

---

## 2. Answers to the 34 audit questions

**1. 当前存在几个 `VerticalSchema`.**
One TypeScript type/registry: `VerticalSchema` interface + `VERTICAL_SCHEMAS` const, both in
`lib/vertical_schema.ts:34-112`. There is no second, competing implementation anywhere else in the
repo (grep for `VerticalSchema`/`VERTICAL_SCHEMAS` returns only this file and its two consumers,
`lib/nano_seo_utils.ts` and `app/[locale]/_components/VerticalKnowledge.tsx`).

**2. 当前 registry 中有哪些 vertical.**
`lib/vertical_schema.ts:17` — `export type VerticalId = "education" | "mbti" | "merch";` — exactly
3, keyed identically in `VERTICAL_SCHEMAS` (lines 48, 70, 91). No `culture` or `ecommerce` key
exists in code.

**3. Education 的实现状态.**
Fully defined in code: 8 `AttributeDef`s (`grade_band`, `age_range`, `subject`, `skill`,
`resource_type`, `duration_min`, `difficulty`, `language_mode`) and 3 `KnowledgeSlotDef`s
(`learning_objective`, `includes`, `background`) — `lib/vertical_schema.ts:52-69`. `schemaOrgType:
"LearningResource"`. Content authored for exactly **1 template**: `template-hsk-bilingual-reading-text-lesson-poster`
(see Q19-21).

**4. MBTI 的实现状态.**
Fully defined in code: 4 attributes (`type_code`, `type_nickname`, `dimensions`, `subject_kind`),
7 knowledge slots (`traits`, `strengths`, `weaknesses`, `communication`, `relationships`, `career`,
`compatibility`) — `lib/vertical_schema.ts:74-89`. `schemaOrgType: "Article"`. **Zero** nano.json
entries have non-empty `content.attributes`/`content.vertical` for any MBTI-routed template — the
only populated entry repo-wide is the HSK (education) one (verified by parsing all keys in
`messages/en/nano.json` and `messages/zh/nano.json`). So the MBTI schema exists but has no authored
content anywhere yet — no page currently renders an MBTI chip strip or knowledge section.

**5. Merch 的实现状态.**
Fully defined in code: 7 attributes (`product_type`, `material`, `process`, `dimensions`,
`print_spec`, `color_profile`, `use_case`), 3 knowledge slots (`cultural_background`,
`design_requirements`, `manufacturing_notes`) — `lib/vertical_schema.ts:95-111`.
`schemaOrgType: "Product"`. Same as MBTI: **zero** authored `content.attributes`/`content.vertical`
values exist for any merch-routed template. Schema-only, no content.

**6. Ecommerce 的实现状态.**
**Not implemented in code at all.** `VerticalId` has no `"ecommerce"` member
(`lib/vertical_schema.ts:17`); `resolveVerticalForTopics` only iterates
`["education", "mbti", "merch"]` (line 120). The design doc
(`docs/vertical-page-schema-v1.md:185`) lists `"ecommerce"` as a *planned* member of a 5-value union
that does not match the code's actual 3-value union — confirmed doc/code mismatch. §2.5 of the doc
proposes fields (`product_category`, `shot_type`, `background`, `platform`, `resolution_note`,
`conversion_role`) that exist only as prose, never as a TypeScript `AttributeDef[]`.

**7. Culture/Traditional Culture 是否存在，以及它是否属于本轮主范围.**
Does not exist in code (same evidence as Q6 — `VerticalId` has no `"culture"` member). It appears
only in the design doc as a *future* 4th/5th vertical
(`docs/vertical-page-schema-v1.md:275`: "Vertical v2 — culture (服饰) + ecommerce"). Per the boss's
brief (§一), the four verticals in scope this round are MBTI, Education, Merch, Ecommerce — Culture
is explicitly **not** one of them, so it is out of this round's main scope; noted here only because
the audit brief asked whether it exists.

**8. attribute chip strip 是否已实现.**
Yes, as a component: `VerticalAttributeChips` in
`app/[locale]/_components/VerticalKnowledge.tsx:11-30`. Renders a flat pill list from
`vertical.attributes`, no-ops (`return null`) when `vertical` is null or has zero attributes.

**9. knowledge section 是否已实现.**
Yes: `VerticalKnowledgeSection` in `VerticalKnowledge.tsx:32-51`. Renders a `<dl>` of
label/text pairs from `vertical.knowledge`, same no-op guard.

**10. template 页面是否渲染 vertical attributes.**
Yes — `app/[locale]/(public)/nano-template/[slug]/page.tsx:198`:
`<VerticalAttributeChips vertical={vertical} />`, fed by `resolveVerticalSections(...)` at line 155.

**11. template 页面是否渲染 vertical knowledge.**
Yes — same file, line 338: `<VerticalKnowledgeSection vertical={vertical} />`.

**12. template 页面 JSON-LD 是否已实现.**
Yes — `page.tsx:160` calls `buildVerticalJsonLd(vertical, {...})` and the result is emitted as a
`<script type="application/ld+json">` block at line 340-343. `buildVerticalJsonLd`
(`lib/nano_seo_utils.ts:446-484`) maps vertical-specific fields (e.g. `educationalLevel`,
`teaches`, `timeRequired` for education; `material`, `category` for merch; `about` for mbti) plus a
generic `additionalProperty` array of every populated attribute as `PropertyValue`.

**13. example 页面是否渲染 vertical 内容.**
**No.** Grepping
`app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/page.tsx` and its sibling
components (`ExampleImagesGrid.tsx`, `ExampleReproduceSurface.tsx`, `ExampleRightColumn.tsx`,
`ExampleRelatedTopics.tsx`, `ExampleVideoPlayer.tsx`, `ExampleGeneratePanel.tsx`) for
`vertical`/`Vertical` returns zero matches. Nothing from `lib/vertical_schema.ts` or
`lib/nano_seo_utils.ts`'s vertical exports is imported anywhere under `.../example/`.

**14. example 页面是否渲染 attribute chips.** No — same evidence as Q13; `VerticalAttributeChips`
is never imported in the example route tree.

**15. example 页面是否渲染 knowledge summary.** No — same evidence; `VerticalKnowledgeSection` is
never imported in the example route tree.

**16. example 页面是否输出 per-example vertical JSON-LD.**
No. The example page's only JSON-LD is a generic, non-vertical `HowTo` schema
(`.../example/[exampleId]/page.tsx:529-540`: `@type: "HowTo"` with 3 fixed `HowToStep`s — "Open
Nano Banana," "Enter the prompt," "Generate and download"). It carries no vertical `@type`, no
`additionalProperty`, and is identical in shape across every example regardless of vertical.

**17. example 属性是否已经能从 params 派生.**
No. The example page (`getPageData` in `page.tsx:52+`) reads `templateTopics`,
`templateParameters`, and per-example fields (`example`, `templateView`) via
`buildNanoPageContext`/`getNanoExampleById`/`getTemplateView`, but none of that data is passed
through `resolveVerticalSections` or any vertical-attribute derivation — there is no code path
connecting example `params` values to `AttributeDef` values.

**18. 是否存在 `deriveExampleAttributes` 或同类函数.**
No. `grep -rn "deriveExampleAttributes"` across the whole repo (excluding `node_modules`) returns
zero matches. No function of any name performs example-param → vertical-attribute derivation
anywhere in `lib/` or `app/`.

**19. HSK Pilot 是否真实存在.**
Yes. `template-hsk-bilingual-reading-text-lesson-poster` is a real, registered template: present in
`public/data/nano_templates.json` (line 19032) with `topics: ["study-sheets", "learning-materials",
"education", "bilingual"]` — which intersects `education`'s `topicMatch` array
(`lib/vertical_schema.ts:67-68`), so it does route into the education vertical via
`resolveVerticalForTopics`.

**20. HSK Pilot 是否在英文内容中存在.**
Yes — `messages/en/nano.json`, key `template-hsk-bilingual-reading-text-lesson-poster`, has
non-empty `content.attributes` (8 keys: grade_band="HSK 2", age_range="8–10", subject="Chinese
(Mandarin)", skill="Reading", resource_type="Reading card", duration_min="15 min",
difficulty="Beginner", language_mode="Bilingual EN–ZH") and non-empty `content.vertical` (3 keys:
`learning_objective`, `includes`, `background`, all populated with authored English prose).

**21. HSK Pilot 是否在中文内容中存在.**
Yes — `messages/zh/nano.json`, same key, same 8 attribute keys and 3 knowledge keys, all populated
with authored Chinese-language values (e.g. `subject: "中文（普通话）"`, `grade_band: "HSK 2"`).

**22. HSK Pilot 是否实际被 route 和组件读取.**
Yes, for the **template** page only (see Q10-12: `resolveVerticalSections` →
`VerticalAttributeChips` / `VerticalKnowledgeSection` / `buildVerticalJsonLd`, all wired into
`.../nano-template/[slug]/page.tsx`). It is confirmed **not** read by the example route (Q13-16) —
so the HSK example pages under `.../nano-template/hsk-.../example/...` render with no vertical
chips, no knowledge section, and only the generic `HowTo` JSON-LD, same as every other example page.

**23. Ecommerce 是否已经注册.**
No — confirmed twice: (a) not a member of `VerticalId` (Q6); (b) `resolveVerticalForTopics` never
iterates an `"ecommerce"` key, so even a template with an `ecommerce`-sounding `topics[]` value
cannot route into any vertical for it. There is no `topicMatch` list for ecommerce anywhere because
there is no ecommerce entry in `VERTICAL_SCHEMAS`.

**24. attribute labels 是否已经 i18n.**
**No.** Every `AttributeDef.label` (e.g. `"Grade / Level"`, `"Subject"`, `"Type"`, `"Material"`) is
a single hardcoded English string literal in `lib/vertical_schema.ts`, not read from any
`messages/<locale>/*.json` file. `VerticalAttributeChips` renders `a.label` directly
(`VerticalKnowledge.tsx:24`) — so a `zh` locale page would show an English label
(e.g. "Subject") next to a Chinese value (e.g. "中文（普通话）") if it ever rendered a merch/mbti
attribute; for the one real HSK case today this is visible: the zh template page shows the English
word "Grade / Level" as the chip label even though the value ("HSK 2") and the knowledge text are
authored in Chinese.

**25. attribute values 是否已经 i18n.**
Yes, for the one case that has any content — HSK's `content.attributes`/`content.vertical` values
are authored per-locale in `messages/en/nano.json` and `messages/zh/nano.json` independently (see
Q20-21; the zh values are not a translation pass-through, they are distinct authored Chinese
strings). This is a data-authoring pattern that would need to be repeated per template per locale;
there is no fallback/inheritance mechanism observed for missing-locale attribute values (unauthored
locales simply yield an empty `attrVals`/`vertVals` map, and `resolveVerticalSections` returns
`null` when all fields are empty at `lib/nano_seo_utils.ts:436`).

**26. taxonomy axes 是否已经加入.**
Partially, as **metadata only**. Every `AttributeDef` carries a `taxonomyAxis` string (e.g.
`"tier1:language|learning"`, `"NEW:grade"`, `"NEW"`) — see `lib/vertical_schema.ts:53-102`. This
field is documented in a comment (`vertical_schema.ts:19-20`) as "records the lib/taxonomy.json
axis it derives from (or 'NEW')" but grepping for `taxonomyAxis` across `app/` and `lib/` shows it
is **read nowhere** outside its own definition and the `AttributeDef` type — it does not drive any
taxonomy cross-reference, validation, or lookup against `lib/taxonomy.json` at runtime.

**27. facet definitions 是否真实使用.**
No — same pattern as Q26. `facet: true` is set on 8 of the 19 total attribute defs across the 3
verticals. It is threaded through into the resolved `attributes[]` array
(`lib/nano_seo_utils.ts:404,429`: `facet: !!a.facet`) but nothing downstream reads that field —
there is no faceted-browse route, filter UI, or query param anywhere in `app/` that consumes
`ResolvedVerticalPage.attributes[].facet`. (`app/[locale]/(public)/search/page.tsx` has an
unrelated "facet" concept for the general search page, not connected to this code path.) It is a
documented placeholder for future faceted browse, not a working feature today.

**28. 文档描述和真实代码是否一致.**
No, on two material points: (a) the design doc's `VerticalId` union
(`docs/vertical-page-schema-v1.md:185`) lists 5 members (`education | mbti | culture | merch |
ecommerce`); the real code union (`lib/vertical_schema.ts:17`) has 3 (`education | mbti | merch`) —
culture and ecommerce are doc-only. (b) The doc's own §3 (implementation roadmap, line 275)
correctly describes this gap ("Vertical v2 — culture + ecommerce... once the first read-out
validates the approach"), so the doc is internally consistent about *itself* being ahead of the
code — the inconsistency is only in the top-of-file type signature quoted at line 185, which reads
as already-shipped when it is not.

**29. 哪些内容已经实现.**
- Schema registry for 3 verticals (education/mbti/merch), with attributes + knowledge slots
  (`lib/vertical_schema.ts`).
- Resolver + JSON-LD builder (`lib/nano_seo_utils.ts:399-529`).
- Render components — chip strip + knowledge section (`VerticalKnowledge.tsx`).
- Full wiring into the **template** page: chips, knowledge section, JSON-LD (`page.tsx`).
- One real content pilot: HSK bilingual reading template, authored in both `en` and `zh`.

**30. 哪些内容只存在于 design doc.**
- Ecommerce vertical (schema fields proposed in doc §2.5, no code).
- Culture vertical (mentioned as a v2 target, no code, no field proposal found in the excerpted
  sections read).
- Any taxonomy-axis cross-validation between `taxonomyAxis` strings and real `lib/taxonomy.json`
  entries (doc explains the intent; code stores the string but never validates or consumes it).
- Any faceted-browse consumption of `facet: true` fields (doc frames it as "future browse filter";
  code carries the flag but nothing reads it).

**31. 哪些内容已经部分实现.**
- MBTI and Merch: schema fully coded, render path fully wired (same template-page code path as
  education), but **zero authored content** exists for either — so the code works but has never
  been exercised end-to-end for these two verticals on any real page.
- i18n: values are per-locale-authorable and proven for one page (HSK); labels are not localized at
  all (hardcoded English in the schema file) — a structural gap that would surface on every future
  non-English vertical page, not just an unauthored one.
- Example-page vertical rendering: the render **components** (`VerticalAttributeChips`,
  `VerticalKnowledgeSection`) are generic enough to be reused on the example route without new
  component code, but nothing currently calls them there, and no attribute-derivation function
  exists to feed them per-example values (Q17-18).

**32. 哪些代码需要在研究完成后修改.**
Deferred to `VERTICAL_SCHEMA_GAP_ANALYSIS.md` (this round's Phase-6-facing deliverable) — per the
boss's brief, no code changes are decided or made in this phase. The candidates surfaced by this
audit (ecommerce schema addition, `deriveExampleAttributes`, per-example JSON-LD, attribute-label
i18n) are listed there as *candidates requiring research validation first*, not as approved work.

**33. 哪些功能与本轮老板要求没有直接关系.**
The `facet`/`taxonomyAxis` future-browse metadata (Q26-27) and the Culture vertical (Q7) are
adjacent design surface area not requested in this round's brief (§一 names MBTI, Education, Merch,
Ecommerce only; §十四 CSV schema does not request facet/taxonomy-axis fields). Flagged so they are
not accidentally pulled into scope during Phase 6.

**34. 当前代码是否适合继续扩展，还是需要先重构.**
Observation, not a decision (out of scope to decide this phase): the existing pattern — schema
registry → resolver → generic render components → template-page wiring — is uniform and additive;
adding an `ecommerce` entry to `VERTICAL_SCHEMAS` and authoring its `nano.json` content would follow
the exact same path already proven by HSK, with no visible structural blocker. The two gaps that
would need actual new code (not just config/content) are: (a) an example-page equivalent of the
template-page wiring, including a `deriveExampleAttributes`-shaped function (doesn't exist yet,
Q17-18); (b) attribute-label i18n (currently impossible without a code change, Q24). Whether to
build those now or defer is a Phase 6 decision, not this phase's.

---

## 3. Summary table

| Vertical | Schema in code | Authored content | Template page render | Example page render | JSON-LD (template) | JSON-LD (example) |
|---|---|---|---|---|---|---|
| Education | Yes (8 attrs / 3 knowledge) | 1 template (HSK, en+zh) | Yes | No | Yes | No (generic HowTo only) |
| MBTI | Yes (4 attrs / 7 knowledge) | 0 templates | Wired, unused | No | Wired, unused | No |
| Merch | Yes (7 attrs / 3 knowledge) | 0 templates | Wired, unused | No | Wired, unused | No |
| Ecommerce | **No** — not in `VerticalId` | N/A | N/A | N/A | N/A | N/A |
| Culture | **No** — not in `VerticalId`, not in this round's scope | N/A | N/A | N/A | N/A | N/A |

---

## 4. Uncertain items

- Whether any other route (e.g. a search/topic listing page) reads `resolveVerticalSections` or
  `buildVerticalJsonLd` was checked only via repo-wide grep for those two function names — the grep
  returned only the template `page.tsx` as a consumer, but this audit did not open every file in
  `app/` individually to rule out an indirect re-export path.
- Whether `lib/taxonomy.json`'s tier1-4 axes actually contain entries matching every
  `taxonomyAxis` string used in `vertical_schema.ts` (e.g. `"tier1:language|learning"`,
  `"content_shapes"`) was not verified value-by-value in this pass — only that the taxonomy file
  exists and has `tier1`–`tier4` top-level keys.
