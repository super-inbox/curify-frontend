# MBTI & Character — evergreen cluster build scope

> Drafted 2026-07-05. First "make-Curify-best-in-field" evergreen cluster per the H2
> strategic direction in `workstream-seo-smm-growth.md`. Chosen because it's the only
> candidate scoring on **every** demand axis: rising GSC (100→500 impr/day through the WC
> period), best click-conversion of any cluster, proven multilingual queries, and the
> deepest topic supply we own (44 templates + a working test). **This is a connect-and-deepen
> build, not a greenfield build — most rungs already exist and are under-exposed.**

## What already exists (do NOT rebuild)

| Rung asset | Where | State |
|---|---|---|
| **MBTI test / quiz** | `MBTIQuizWidget.tsx` + `MBTIQuizCapsule.tsx` | Works, but **only surfaced on `/topics/[slug]`** |
| **16 type result pages** | `/personality/[type]` (`page.tsx` + `PersonalityResultClient.tsx`) | Live; content thin; **appears missing from sitemap** |
| **Type copy / metadata** | `lib/mbti-meta.ts` | 16 types, taglines+descriptions **EN/zh/es only** |
| **Poster generator** | `/api/personality-poster/route.tsx` | Exists as API; **not surfaced as a `/tools/*` page** |
| **44 character/MBTI templates** | `nano_templates.json` | 27 MBTI variants (Marvel, Naruto, Ghibli, NBA, Breaking Bad, Yellowstone, Harry Potter, Friends, Disney, Silicon Valley, Zhenhuan, city-mbti, sports-team, anime-crew…) + fandom grids, sticker sheets, character cards |
| **Gallery pack** | `packs/mbti-character/` | Hundreds of Marvel/Ghibli/Friends card images |
| **3 blogs** | `mbti-character-generator`, `character-prompt-generator`, `mbti-relationship-style-visualizer` | Under-invested vs a rising 44-template cluster |
| **Topic hubs** | `/topics/character` (children: mbti/anime/sports/film/relationship/portrait/comparison/groups) + `/topics/personality` | Live; taxonomy is rich |

## Critical gaps (the actual work)

1. **No `/personality` hub landing page** — only `[type]` children exist. Nothing on-site targets
   the head terms **"mbti test" / "personality test"** (highest-volume queries in the cluster).
2. **`/personality/*` is CONFIRMED absent from `app/sitemap.xml/route.ts`** (2026-07-05 — the
   route enumerates tools/prompts/nano-templates/use-cases/topics/blog, no `personality` or
   `MBTI_TYPES` reference). The 16 type pages are invisible to Google's crawl except via internal
   links. **Single highest-leverage fix in the cluster.**
3. **Quiz is buried** — `MBTIQuizWidget` only renders inside `/topics/[slug]`, not on a dedicated
   hub, the homepage, or the type pages.
4. **i18n gap** — `mbti-meta.ts` is EN/zh/es only, but GSC shows live Korean / Russian / zh-TW
   demand (`캐릭터 프롬프트`, `нарута мбти`, `人格測驗`). Proven demand we don't serve.
5. **No generation tool destination** — the poster API + gallery `NANO_FREEFORM` pipeline exist
   but there's no `/tools/mbti-*` page for SEO to rank and convert into.
6. **Cluster pieces aren't interlinked** — test ↔ 16 type pages ↔ 44 templates ↔ 3 blogs ↔ 2 topic
   hubs are largely disconnected; no authority graph binds them into one cluster.

## The ladder (rung → have → gap)

| # | Rung | Have? | Gap / action |
|---|---|---|---|
| 1 | Head hub — "mbti test / personality test" | ○ | **Build `/personality` hub** (quiz hero + 16 type links + template gallery + blogs) |
| 2 | 16 type result pages | ✅ thin | Sitemap + enrich (per-type templates, FAQ, share-poster CTA) |
| 3 | Character MBTI charts (44 tmpl) | ✅ strong | Interlink to hub + type pages; expand fandoms via trend |
| 4 | Fandom / anime character grids | ✅ | Interlink; these are the biggest supply |
| 5 | Character **sticker packs** (=Merch rung) | ✅ tmpl | Surface as tool; absorbs the Merch cluster |
| 6 | Character **wallpapers** (=Social rung) | ◐ partial | Add wallpaper output; absorbs Social cluster |
| 7 | "Which [franchise] character are you" quizzes | ◐ `personality-choice-quiz-card` | Templatize per fandom (Naruto/Marvel/HP quizzes) |

## Work items (prioritized)

- **M1a — sitemap fix. ✅ SHIPPED 2026-07-05 (working tree, pending push to `jwang/vercel`).**
  `app/sitemap.xml/route.ts` now emits the 16 `/personality/[TYPE]` pages for en/zh/es (uppercase
  canonical to match the page; hreflang restricted to the 3 hand-localized locales — same
  duplicate-canonical discipline as nano-template routes; expand to ko/ru after M3). **Verified:**
  rendered sitemap returns HTTP 200 with 48 new `/personality/*` `<loc>` entries (16 × en/zh/es),
  correct hreflang + x-default, lastmod 2026-07-05, priority 0.7. This unlocks 16 pages that were
  invisible to Google's crawl — the fastest impression unlock in the cluster.
  - *Follow-up (do in M3):* the type page's own `generateMetadata` declares hreflang for **all 10**
    locales via `getLanguagesMap`, so the 7 EN-fallback locales are still advertised on-page even
    though the sitemap omits them. Restrict `getLanguagesMap` for `/personality/*` to the localized
    set once ko/ru copy lands, to fully close the duplicate-canonical surface.
- **M1b — `/personality` hub landing page.** Build the `/personality` index (currently only
  `[type]` children exist): quiz hero (`MBTIQuizWidget`), 16 type chips → the now-indexable type
  pages, character-template gallery, the 3 blogs. Targets the head terms **"mbti test" /
  "personality test"** — nothing on-site ranks for them today. Add to `STATIC_ROUTES` (or a new
  section) in the sitemap once built. *~2-3d.*
- **M2 — Interlink the cluster** into one authority graph: hub ↔ type pages ↔ templates ↔ blogs ↔
  `/topics/character` + `/topics/personality`. Reuse the W1 `RelatedTopics` server-component
  pattern. *~2d.*
- **M3 — i18n `mbti-meta.ts` to ko + ru (+ zh-TW).** Proven multilingual demand. *~1d.*
- **M4 — `/tools/mbti-character-generator`** surfacing the existing poster API / `NANO_FREEFORM`
  pipeline as a discoverable, convertible tool (the cluster's only conversion endpoint today is a
  buried API). *~3-4d.*
- **M5 — Blogs 3 → ~10:** head-term post ("MBTI test"), per-fandom posts (Naruto/Marvel/Ghibli/HP
  "which character are you"), "MBTI × [trend]" evergreen. Cross-link into hub + tool. *weekly cadence.*
- **M6 — Living-content loop:** hub + type pages get fresh examples / +FAQ / +new-fandom prompts on
  a cadence (the "AI maintenance" Layer-3 principle) so Google reads the cluster as maintained.
- **M7 — Fandom expansion (Layer-2 trending hook):** new franchises added by trend signal (new
  anime season, blockbuster) — the trending engine feeds the evergreen cluster.

## Measurement (leading indicators, not sitewide clicks)

- **North star:** MBTI-cluster **impressions/day** (the GSC bucket already built in the 4-source
  analysis) — track weekly; baseline ~500/day (pages) as of 06-26.
- **Leading:** `/personality` hub index status (M1); `/personality/[type]` impressions post-sitemap;
  query position for "mbti test" / "personality test" / per-fandom head terms; ko/ru impressions post-M3.
- **Conversion:** `/tools/mbti-*` generation runs (M4) — the value-capture rung.

## Sequencing

**M1a ✅ done** (sitemap unlock) → **M1b** (head-term hub) → **M2 + M3** (interlink + i18n; cheap,
high-leverage, parallel) → **M4** (conversion endpoint) → **M5** in parallel (independent content
value) → **M6** standing maintenance loop → **M7** opportunistic off the trending engine.

## Status log

- **2026-07-05** — M1a shipped to working tree (sitemap emits 48 `/personality/*` URLs, verified via
  rendered sitemap). Pending push to `jwang/vercel`. After push + deploy: request GSC re-crawl of
  the sitemap, then watch `/personality/[type]` index status + impressions as the M1 success signal.
  Everything below (M1b–M7) is scoped and not started.
