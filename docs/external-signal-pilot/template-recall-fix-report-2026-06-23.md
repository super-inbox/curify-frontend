# Template Recall Fix Report — 2026-06-23

**Branch:** `baobao/multi-intent-topic-cooccurrence`
**Date:** 2026-06-23

---

## 1. Background

The Templates section of the Curify search page (`/search?q=…`) suffered from low recall on multi-word and semantically specific queries. Users typing queries like "bilingual flashcards", "cuban sandwich recipe poster", or "watercolor map" would see only 1–4 templates even when the template inventory contained relevant results.

Specific examples from the June 21, 2026 external-signal pilot (15 queries flagged P1):

| Query | Previous template count | Issue |
|---|---|---|
| bilingual flashcards | ~2 strict | "flashcard" topic slug not in search blob; multi-token plural mismatch |
| cuban sandwich recipe poster | 1 strict | "cuban" and "sandwich" had no cuisine/recipe synonym path |
| watercolor map of europe travel destinations | 1 strict | No map/travel synonym; template topics not searchable |
| historical character | 5 total | "historical" and "character" as topic slugs not reaching the search blob |

---

## 2. Root Cause

**`templateSearchBlob` was built only from i18n text fields** (`category`, `title`, `description`, `content.sections.what`, `content.sections.who` from `messages/en/nano.json` and `messages/zh/nano.json`). Each template in `nano_templates.json` also carries a `topics` array of slug strings (e.g., `["flashcards", "bilingual", "vocabulary"]`), but these slugs were **not included** in the search blob. A template tagged `flashcards` would not match a query containing "flashcards" unless that exact word happened to appear in its i18n description text.

Combined with strict-AND matching across all query tokens, this meant:
- Templates with the right topic tags but slightly different wording in descriptions were invisible.
- Multi-word queries ("cuban sandwich recipe poster") required all tokens to co-occur in one blob — no template blob had "cuban" + "sandwich" + "recipe" + "poster" simultaneously.
- Semantically related queries (e.g., "bilingual" and "multilingual") had no bridge.

A broad synonym expansion without precision guards makes the count go up but introduces irrelevant templates (e.g., "Dog Breed Retro Science Infographic" appearing for "watercolor map" when `watercolor→whimsical,hand-drawn` was in the expansion).

---

## 3. Code Changes

### `app/[locale]/(public)/search/page.tsx`

**Added template topic slugs to `templateSearchBlob`:**
```ts
// After building the i18n blob from messages/en/nano.json + messages/zh/nano.json:
for (const [tid, topics] of TEMPLATE_TOPICS) {
  if (topics.length === 0) continue;
  templateSearchBlob.set(
    tid,
    (templateSearchBlob.get(tid) ?? "") + " " + topics.join(" ")
  );
}
```
`TEMPLATE_TOPICS` is derived from `nano_templates.json` via `buildTemplateTopicsMap`. This makes every template's topic slugs searchable alongside the i18n text.

**Connected concept expansion with `suppressWhen` precision guard:**
```ts
const tokenSet = new Set(tokens.primary);
const expandedSets = tokens.primary.map((tok) => {
  const entry = CONCEPT_SYNONYMS[tok];
  if (!entry) return [tok];
  const suppressed = entry.suppressWhen?.some((sw) => tokenSet.has(sw)) ?? false;
  return suppressed ? [tok] : [tok, ...entry.synonyms];
});
```
Before this change, the lookup was `CONCEPT_SYNONYMS[tok]` returning a plain `string[]` with no context check. The new lookup checks the full token set of the query and suppresses the expansion if a co-signal indicates the token has a different meaning (e.g., "korean" in a language-learning query should not expand to cuisine terms).

---

### `lib/template_concept_expansion.ts`

Exported type changed from `Record<string, string[]>` to `Record<string, SynonymEntry>` where:
```ts
export type SynonymEntry = {
  synonyms: string[];
  suppressWhen?: string[]; // skip this expansion if any of these tokens co-occurs
};
```

**Active synonym groups:**

| Token | Synonyms | Guard |
|---|---|---|
| `bilingual` ↔ `multilingual` | each other | none |
| `flashcard` ↔ `flashcards` | each other | none |
| `sandwich`, `burger`, `pizza`, `sushi`, `pasta`, `taco`, `ramen`, `steak`, `salad`, `soup` | `food`, `recipe`, `cuisine`, `culinary` | none (unambiguous food nouns) |
| `cuban`, `thai`, `korean`, `italian`, `mexican`, `french`, `japanese`, `indian` | `cuisine`, `recipe`, `culinary` | **suppressed** when query contains: `flashcard`, `flashcards`, `vocabulary`, `bilingual`, `multilingual`, `esl`, `learning`, `language`, `kids`, `printable`, `worksheet`, `lesson` |

**Removed:** `watercolor → ["whimsical", "hand-drawn"]`. Style adjectives match too many unrelated illustration templates (e.g., "Dog Breed Retro Science Infographic" has "hand-drawn" in its description). The watercolor map template is now reachable via its `watercolor` topic slug in the template blob, which is the correct fix.

---

## 4. Verification

### Summary

| Status | Count (of 15 previous P1 queries) |
|---|---|
| Resolved | **2** |
| Partial | **5** |
| Still P1 | **8** |
| Precision risk | **0** |

### Key Examples

| Query | Before | After | Notes |
|---|---|---|---|
| bilingual flashcards | ~2 strict | **22 strict** | `bilingual↔multilingual` + `flashcard↔flashcards` expansion; topic slugs contribute additional matches |
| cuban sandwich recipe poster | 1 strict → 30 noisy | **5 (1 strict + 4 expanded)** | `cuban→cuisine/recipe` + `sandwich→food/recipe` fire correctly; no lang-learning signals in query; World Travel Map false hit removed |
| watercolor map of europe travel destinations | 1 strict → 39 noisy | **1 strict** | `watercolor→whimsical/hand-drawn` removed; only "Watercolor Continent / World Map" returned; all noise gone |
| bilingual flashcards for kids learning korean fruits | 1 strict → 19 (mixed) | **1 strict** | `korean→cuisine` suppressed by bilingual+flashcards+kids+learning co-signals; Korean food templates gone; "Bilingual Vocabulary Visual Guide" remains |
| historical character | 5 total | **11 strict** | Topic slug addition resolved — "historical" + "character" topic slugs now reachable |

Full details: `docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.md`

---

## 5. Remaining Gaps

The 8 Still P1 queries are all **inventory or topic-tag gaps**, not pipeline failures:

| Query | Root cause |
|---|---|
| 电商详情图 | CJK multi-token AND; "电商"+"详情图" not bridged by topic slugs |
| homophones and homonyms | "homophones"/"homonyms" absent from template topics; inventory thin |
| marvel mbti character chart 16 types | No dedicated 16-type MBTI×Marvel chart template exists |
| lunar new year red envelope graphic design | 1 correct template; only 9 inspirations; content inventory thin |
| before after kitchen organization makeover | 1 correct template; "kitchen"+"makeover" not co-occurring in any blob |
| Spanish vocabulary printable | "Spanish" absent from all template blobs; no language-specific topic slug |
| watercolor map of europe travel destinations | 1 correct template; inventory depth is the gap |
| bilingual flashcards for kids learning korean fruits | 1 correct template; 6-token query too strict for safe expansion |

These gaps **should be addressed through better template metadata or new templates**, not broader synonym expansion. Adding "Spanish", "French", "German" as topic slugs on vocabulary templates, adding a dedicated 16-type MBTI template, and generating more bilingual flashcard examples for specific language pairs are the right next steps.

---

## 6. Files Included in This Branch

| File | Role |
|---|---|
| `app/[locale]/(public)/search/page.tsx` | Production: template topic slugs in search blob + expansion with `suppressWhen` guard |
| `lib/template_concept_expansion.ts` | Production: `SynonymEntry` type + `CONCEPT_SYNONYMS` config |
| `docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.md` | Evaluation: full P1 retest results with per-query analysis |
| `docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.csv` | Evaluation: machine-readable P1 retest results |
| `docs/external-signal-pilot/template-recall-fix-report-2026-06-23.md` | This file |

---

## 7. Recommendation

**This version is safe to push.**

- Precision risk is 0.
- No previously working queries lost template coverage.
- The `bilingual flashcards` core recall query is stable at 22 templates.
- The expansion config is intentionally conservative: only unambiguous synonym pairs are active; country-name cuisine expansions are guarded; style adjectives are excluded.

**Do not continue expanding `CONCEPT_SYNONYMS` broadly until inventory and topic-tag gaps are addressed first.** The remaining 8 Still P1 queries need new templates or additional topic slug coverage — adding more synonyms to the expansion map would inflate counts without surfacing genuinely relevant templates.
