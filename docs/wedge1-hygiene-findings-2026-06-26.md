# W1.7 hygiene audit findings — 2026-06-26

> Gate audit before pumping internal links at the 22,299 "invisible" pages.
> Sampled 40 URLs per family (275 total) from the invisible cohort and
> HEAD/GET'd each for status, `<meta robots>`, `<link rel="canonical">`,
> `X-Robots-Tag`. Scripts: `scripts/sample_invisible_pages.cjs`. Raw:
> `raw/gsc-audit-2026-06-26/hygiene-2026-06-26.json`.

## Summary

**54 of 275 sampled URLs (19.6%) are flagged.** Two structural blockers
account for almost all of them — both are *intentional* noindex policies
that nonetheless leak into the sitemap, inflating the "invisible 22k"
number. **Both must be fixed BEFORE the link-injection wedges (W1.1-W1.5)
ship, otherwise we waste authority on pages Google is told to ignore.**

| Family | Sampled | Status 200 | noindex | canonical→other-page | Verdict |
|---|---:|---:|---:|---:|---|
| topic_hub | 40 | 40 | **17 (43%)** | 0 | **BLOCKER — fix sitemap** |
| nano_banana_prompt (= tag pages) | 40 | 40 | **37 (93%)** | **37 (93%)** | **BLOCKER — fix sitemap** |
| blog | 40 | 40 | 0 | 0 | ✓ clean |
| use_case | 40 | 40 | 0 | 0 | ✓ clean |
| tool | 35 | 35 | 0 | 0 | ✓ clean |
| nano_template_index | 40 | 40 | 0 | 0 | ✓ clean |
| nano_template_example | 40 | 40 | 0 | 0 | ✓ clean |

All 275 returned HTTP 200 — no 4xx/5xx/3xx issues. The blockers are
**meta robots / canonical**, not broken pages.

## Blocker 1 — Topic-hub sitemap leaks 710 noindex URLs

`app/[locale]/(public)/topics/[slug]/page.tsx:62-68` does:

```tsx
if (!isLocalizedTopic(slug)) {
  return { robots: { index: false, follow: false }, ... };
}
```

`isLocalizedTopic()` returns true iff the topic has an i18n entry in
`messages/en/topics.json`. So topics referenced by templates but lacking
authored i18n render `noindex,nofollow` — the i18n-gating policy from
`docs/search-and-content.md` (Rounds 2B/2D).

**The sitemap doesn't apply the same filter.** `app/sitemap.xml/route.ts:92`
`getTopicRoutes()` enumerates every `topics` field from `nano_templates.json`
and dumps them — no `LOCALIZED_TOPIC_IDS` check.

**Quantified gap:**

| | Count |
|---|---:|
| Template-referenced topics in sitemap | 174 |
| ∩ `LOCALIZED_TOPIC_IDS` (real indexable) | **103** |
| Not in i18n (rendered noindex) | **71** |
| × 10 locales = noindex URLs in sitemap | **710** |

That's 41% of the topic_hub sitemap entries that we explicitly told
Google to ignore. The "topic_hub: 1,740 → 17% in GSC" headline from
the funnel audit was inflated by these 710 URLs.

**True topic_hub coverage:** 299 in GSC / 1,030 indexable = **29%** (still bad, but 1.7× better than the headline).

Sample of currently-noindex'd topics (71 entries; partial list):
`3d, abstract, anthropomorphic, art, artistic, before-and-after,
bilingual, bold, calendar, calligraphy, calm, captivating,
character-card, cinematic, concept-sketch, cosmetic-packaging, cozy,
dramatic, dramatic-lighting, dreamy, dynamic, early-childhood-learning,
festive, flat-lay, futuristic, gift-packaging, glossy, gold, health,
humorous, ...`

Mostly mood/style descriptors and product types. Some (e.g.
`early-childhood-learning`, `bilingual`, `gift-packaging`) deserve real
topic pages with i18n authoring — should be promoted, not deindexed.
Others (e.g. `3d`, `glossy`, `humorous`, `dramatic-lighting`) are style
modifiers and probably shouldn't have dedicated topic pages at all.

## Blocker 2 — Nano-banana tag pages: 90% noindex + canonical-collapse

The 4,610 sitemap URLs classified as `nano_banana_prompt` in the funnel
audit are **ALL tag pages** (`/nano-banana-pro-prompts/tag/[slug]`),
not prompt detail pages. There are **0** `/nano-banana-pro-prompts/[id]`
detail URLs in the sitemap.

**The 4,610 break down as 461 tag slugs × 10 locales.** Of the 40
sampled, 37 (93%) had:

- `<meta name="robots" content="noindex, follow">`
- `<link rel="canonical" href="https://www.curify-ai.com/nano-banana-pro-prompts/tag/[slug]">` (canonical-collapse all non-EN locales to EN)

This is intentional canonical consolidation — fine policy. But the
sitemap is signaling these 4,149 noindex'd URLs as fresh content,
diluting crawl budget and trust signals.

**Quantified gap:**

| | Count |
|---|---:|
| Tag pages in sitemap | 4,610 |
| EN tag pages (indexable) | 461 |
| Non-EN tag pages (noindex + canonical→EN) | **4,149** |

That's 4,149 URLs the sitemap shouldn't have. Combined with the 710
topic_hub leaks: **4,859 sitemap entries are noindex by policy.**

## Implication for the "invisible 22k"

| | Count | % |
|---|---:|---:|
| Sitemap URLs (original audit) | 25,764 | 100% |
| **Intentionally noindex'd** | **4,859** | **18.9%** |
| True indexable sitemap | **20,905** | 81.1% |
| In GSC | 3,465 | — |
| True coverage rate | — | **16.6%** |
| True "invisible" indexable URLs | **17,440** | 67.7% of intended-indexable |

The headline "87% invisible" was inflated by ~19% noindex-by-policy.
Reframed: **68% of indexable pages don't surface in GSC** — still a major
problem, but more tractable.

## What this changes in the Wedge 1 plan

The `docs/wedge1-indexation-rescue-scope-2026-06-26.md` work-item list
gains TWO new sitemap-cleanup gates that **must ship before any link
injection**:

### W1.7a — Topic sitemap filter (NEW gate, 1-2 hours)

Add `isLocalizedTopic()` filter to `getTopicRoutes()` in
`app/sitemap.xml/route.ts:92-107`. Reduces sitemap by **710 URLs**.

```ts
import { isLocalizedTopic } from "@/lib/topicRegistry_pure";
// ...
return Array.from(templateLevelTopics)
  .filter((tp) => isLocalizedTopic(tp))
  .map((tp) => `/topics/${tp}`);
```

**Decision needed:** the 71 currently-noindex'd topics fall into 3 buckets:
1. **Promote to indexable** by authoring i18n: `early-childhood-learning`,
   `bilingual`, `gift-packaging`, `cosmetic-packaging`, `calendar`,
   `character-card`, `calligraphy`, `concept-sketch`, `flat-lay`,
   `health` — likely 15-25 worth promoting.
2. **Keep noindex (and remove from sitemap)**: style modifiers (`3d`,
   `glossy`, `humorous`, `dramatic-lighting`, `cinematic`, etc.) —
   probably 40-50.
3. **Possibly remove the templates' topic tags too**: very thin overlap
   (`anthropomorphic`, `captivating`, `dreamy`) — 5-10.

### W1.7b — Tag-page sitemap filter (NEW gate, 1-2 hours)

Restrict `getTagRoutes()` to EN-only OR add `noindex` check during
sitemap generation. Reduces sitemap by **4,149 URLs**. Look at
`app/sitemap.xml/route.ts` `getTagRoutes()` (around the same area as
`getTopicRoutes`).

Same canonical-collapse pattern should apply to any other family that
canonicalizes non-EN → EN. Worth a check.

### Expected-lift recalibration

The original W1 plan projected +770-1,930 clicks/day from link injection
across 22,299 invisible URLs. The real target is 17,440 URLs (not 22k).
Lift estimates per family revise:

| Wedge | Old estimate | Revised estimate |
|---|---|---|
| W1.1 home → topics | +200-500 / day | +200-450 / day (1,030 indexable topics vs 1,740 nominal) |
| W1.2 example → topics | +300-700 / day | +300-600 / day (cleaner topic destinations) |
| W1.3 blog → topics + tools | +200-500 / day | unchanged |
| W1.4 use-case surfaces | +20-80 / day | unchanged |
| W1.5 banana → tools | +50-150 / day | +30-100 / day (smaller indexable surface) |
| **Total** | +770-1,930 | **+750-1,650 / day** |

Negligible drop. The main benefit of the cleanup is **reclaimed crawl
budget + cleaner trust signals**, not direct click lift.

## Recommended updated sequencing

```
Day 1:  W1.7a + W1.7b (sitemap cleanup PR)  ─── ship first, isolated
Week 1: W1.1 (home → topics) + W1.4 (use-case)   ─── PR after Day 1 deploys
Week 2: W1.2 (example → topics)
Week 3: W1.3 (blog → topics + tools)
Week 4: W1.5 (banana → tools)
Week 5: W1.6 (Indexing API priority push)
```

Sitemap cleanup deploys first so crawl-budget reclaim has 1-2 weeks to
take effect before the link-injection wedges add new structure.

## Decisions needed before kickoff

1. **W1.7a topic disposition.** For each of the 71 currently-noindex'd
   topics: promote (author i18n + keep in sitemap), demote (keep noindex,
   remove from sitemap), or drop entirely (remove from template topic
   arrays too). Recommended triage as 15-25 / 40-50 / 5-10 split above
   — needs sign-off.
2. **W1.7b tag disposition.** Confirm the EN-only canonical-collapse
   policy is final. (It looks intentional.) If yes, just remove non-EN
   from sitemap. If we want non-EN tag pages indexable in the future,
   that's a different scope.
3. **Are there other sitemap leaks I haven't checked?** This audit only
   sampled 40/family. Worth a 200-URL sweep on the remaining clean
   families (blog, use_case, tool, nano_template_*) to confirm 0% rate
   isn't sampling noise.
