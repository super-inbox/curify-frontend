# Education cluster — audit 2026-09-16

_The 14-week readout on [`seo-flashcard-learning-batch-2026-06-10.md`](seo-flashcard-learning-batch-2026-06-10.md),
whose own measurement checkpoints (2026-06-17, 2026-06-24) were never collected, plus the current
state of every education surface. Owner: jay._

**Sources.** `raw/curify-ai.com-Performance-on-Search-2026-09-16/` (web, 2026-08-19 → 09-15),
`data/pinterest/demand-2026-08-19_2026-09-15.json` (image, same window),
`raw/gsc-cluster-audit-2026-08-31/` (prior window, 2026-08-02 → 08-29),
`raw/edu-check-2026-09-16.txt` → URL-Inspection, `data/pinterest/pins.jsonl`.
⚠️ The two windows **overlap by 11 days** — read direction, not multiples.

---

## Method: the cohort had to be split, or this reports MBTI as education

`flashcards` and `study-sheets` behave as **format** tags, not subject tags — every MBTI template
carries `flashcards`. A naive "education-tagged" filter returns 106 of 352 templates and hands
back the MBTI cluster. Two cohorts throughout:

- **CORE** (70 templates) — tagged `language`, `vocabulary`, `bilingual`, `kids-learning` or
  `education`. Subject-shaped.
- **FORMAT-ONLY** (36 templates) — carries only `flashcards` / `study-sheets`. Reported
  separately, and it is overwhelmingly MBTI.

Same trap as `feedback_format_overtagging` and the 09-05 note that `guides` / `comparison` sit in
`CONTENT_SIGNAL_TOPICS` while behaving like style tags. **Anyone re-running this must split it.**

⚠️ Second trap, hit and fixed while producing this: a regex containing `exam` matches every
`/example/` URL on the site. The first cut of this audit reported the MBTI example pages as
education for that reason.

---

## 1. The headline

**Education CORE earns ~1,181 impressions and 4 clicks per 28 days.** That is **4.5% of site
impressions and 0.6% of site clicks**, against ASL's 359 clicks in the same window.

### Web — 28d to 2026-09-15 (vs 2026-08-02 → 08-29)

| cohort | URLs | impressions | clicks | CTR |
|---|---:|---:|---:|---:|
| **CORE** templates + hubs | 144 | **601** (was 353) | **4** (was 2) | 0.67% |
| Education tool pages | 19 | 356 (was 193) | 9 (was 6) | 2.53% |
| Education blogs | 16 | 37 (was 31) | 1 (was 1) | 2.70% |
| _FORMAT-ONLY (≈ MBTI)_ | _277_ | _5,032_ | _18_ | _0.36%_ |

### Image — same window

| cohort | templates | impressions | clicks | CTR |
|---|---:|---:|---:|---:|
| **CORE** | 33 | **580** | **0** | **0.000%** |
| _FORMAT-ONLY_ | _22_ | _3,502_ | _5_ | _0.143%_ |
| everything else | 120 | 7,232 | 13 | 0.180% |

**It grew exactly with the site and captured none of the click growth.** CORE web impressions
+70% (353 → 601) over a window in which site clicks grew +162%. Education contributed 2 of roughly
390 new clicks.

---

## 2. Actual education demand reaching the site: 33 impressions, 1 click

ASL stripped out — an `english` token pulls the ASL cluster into any education filter.

| query | clicks | impr | position |
|---|---:|---:|---:|
| chinese radical poster | 0 | 11 | **1.8** |
| video to worksheet | 1 | 9 | 23.1 |
| chinese radicals poster | 0 | 8 | 4.3 |
| youtube worksheet generator | 0 | 2 | 23.0 |
| flashcard banana | 0 | 2 | 20.5 |
| create a worksheet from a youtube video | 0 | 1 | 41.0 |

`chinese radical poster` sits at **position 1.8 and takes zero clicks**. `template-chinese-radical-learning`
carries 103 image impressions and zero clicks. This is the MBTI shape — image-shaped demand,
answered in the SERP — on a cluster that does not even have MBTI's volume.

---

## 3. The 06-10 batch: 22 of 22 target terms return zero impressions

The 06-10 doc projected **~14,000 vol/month addressable** and shipped 3 retitles + 3 posts.

`visual learning` · `picture dictionary` · `printable flashcards` · `vocabulary flashcards` ·
`phonics flashcards` · `visual dictionary` · `biology flashcards` · `chemistry flashcards` ·
`animal flashcards` · `flashcards for kids` · `picture flashcards` · `visual vocabulary` ·
`kindergarten flashcards` · `science flashcards` · `english flashcards` · `language flashcards` ·
`preschool flashcards` · `esl flashcards` · `learning flashcards` · `plant flashcards` ·
`solar system flashcards` · `space flashcards`

**Every one: zero impressions.** Not low CTR, not bad position — zero.

The batch-3 KD terms fare the same: `worksheet generator` (2,400/mo, KD 35),
`english vocabulary flashcards` (140/mo, KD 34), `ai worksheet generator`, `flashcard maker`,
`vocabulary flashcards` — **all zero**.

### Its pages are alive, so this is not an execution failure

| page | index state | last crawl |
|---|---|---|
| `/blog/phonics-flashcards-ai-templates` | Submitted and indexed | 2026-08-25 |
| `/blog/subject-flashcards-biology-chemistry-ai` | Submitted and indexed | 2026-06-10 |
| `/blog/vocabulary-flashcards-ai-templates` | Submitted and indexed | 2026-06-10 |
| `/blog/weird-science-facts-classroom-engagement` | Submitted and indexed | 2026-08-08 |
| `/blog/bilingual-ai-flashcards-early-childhood-education` | **folded to `/`** | 2026-06-12 (pre-fix) |
| `/blog/visual-learning-tools` | **Crawled – not indexed** | **2026-05-29** |

---

## 4. Two mechanical findings, both actionable, neither about content

### 4a. ⚠️ The Tier-1 retitle on the batch's biggest term never reached the page

The 06-10 doc logs `/blog/visual-learning-tools` retitled to *"Visual Learning: AI Tools,
Flashcards, and Infographics for Modern Classrooms"* — head term `visual learning`, **4,400/mo,
the highest volume in the batch**, with a ticked checkbox. Commit `6e73d5e8` did change
`messages/en/blog.json` → `visualLearningTools.title`.

**Production has served the old title for 14 weeks:**

> `Visual Learning Tools: How Students, Parents, and Teachers Can Transform Education`

Cause: it is a **dedicated route** whose `layout.tsx` carries a hardcoded
`export const metadata`, so nothing in `messages/*/blog.json` can reach it. This is
`feedback_dedicated_blog_route_metadata` — verify the rendered `<title>` with curl, not the
source file.

**Six dedicated routes still carry a static metadata export; two have drifted from their i18n
title:**

| slug | served `<title>` | `blog.json` says |
|---|---|---|
| `visual-learning-tools` | Visual Learning Tools: How Students, Parents… | Visual Learning: AI Tools, Flashcards, and Infographics… |
| `character-prompt-generator` | Character Prompt Generator: Complete Guide to AI Character Design | Character Prompt Generator: MBTI for Naruto, Yellowstone, Marvel, Harry Potter + 8 More Universes |

The other four (`best-ai-tools`, `content-multiplication-system`, `nano-banana-dedicated`,
`viral-learning-content`) have no `blog.json` entry, so they are not drifted — but they are the
same latent trap.

**Fix, one line each:** replace the static export with
`export const generateMetadata = dedicatedBlogMetadata("<slug>")`, the helper
`weird-science-facts-classroom-engagement/layout.tsx` already uses — which is why *that* Tier-1
retitle did land. ⚠️ Deliberately **not shipped today**: blog titles are frozen until the 09-23
locale A/B readout. `character-prompt-generator` matters independently of education — it is the
post the `BlogCTACard` override table calls out as "25+ clicks across locales".

### 4b. Five of nine education topic hubs are 404

| 200 | 404 |
|---|---|
| `/topics/language` · `/topics/flashcards` · `/topics/vocabulary` · `/topics/study-sheets` | `/topics/education` · `/topics/learning-materials` · `/topics/bilingual` · `/topics/kids-learning` · `/topics/teaching` |

This is 09-05 cause 2 — **117 of 226 template topics resolve to 404** — still unfixed, and
`education` (13 templates) is one of the named cases. Per `project_new_page_crawl_collapse`,
**alias the dead ones onto the live four** rather than minting thin new pages.

The four live hubs earned **101 impressions and 0 clicks** across all locales (positions 4.3–26.8).
`/topics/language` is worth noting separately: it takes 6 organic impressions, but it was the
landing page for 1point3acres — 27 visitors at a 33% act rate, the best-converting external source
ever measured. **Its value is referral, not organic, and nothing in this audit changes that.**

---

## 5. Not an indexation problem

URL-Inspection over 20 education URLs (hubs, templates, tool, blogs): **18 "Submitted and
indexed"**, most crawled in September. One never crawled
(`/nano-template/chinese-idiom-learning-card`, "Discovered"), one folded pre-fix.

Education is indexed, it ranks — often at position 1–8 — and nobody clicks.

---

## 6. The worksheet retarget worked, on the slice the doc said to score it against

The 2026-09-01 batch-3 retarget of `/tools/worksheet-from-video`, read early against its
**2026-10-01** checkpoint:

| | prior (08-02 → 08-29) | now (08-19 → 09-15) |
|---|---|---|
| `/tools/worksheet-from-video` | 4 impr, pos 21.5, 0 clicks | **63 impr, pos 10.3, 2 clicks** |
| locale variants | — | +20 impr across de/es/fr/hi/ko/tr |

Impressions ×15, position halved, first clicks. **But the queries are the video-qualified tail** —
`video to worksheet` (9), `youtube worksheet generator` (2),
`create a worksheet from a youtube video` (1) — and the 2,400/mo head term `worksheet generator`
is still **zero**. Exactly as the ship note predicted: score it against the video slice, not the
volume. The conclusion it pre-registered stands — *the page needs a text/topic input, not a better
title*.

**HSK, for completeness: 1 impression, one URL, both windows.** The VerticalPageSchema HSK pilot
(`672c48fe`) and the 50-card PDF deliverable have produced nothing in search.

---

## 7. The one live education signal is on Pinterest, and it is a format not a subject

`edtech` is the **largest board — 19 of 77 published Pins (25%)**. Of the three Pins that earned
anything in the 2026-09-16 readout, one is on it:

> `template-professional-category-guide-infographic-interior-design-styles` —
> **21 impressions / 3 saves = 14% save rate**, the best creative signal in the account, 28× the
> Nanjing magnet's 0.5%.

Note what it actually is: an **education format** (category guide / visual cheat sheet) applied to
a **non-education subject**. That is consistent with the batch-4 "collection grid" finding —
the surface is rewarding the *shape*, not the topic. It is not evidence that education sells.

---

## 8. What this says

1. **The 06-10 thesis is falsified, and cleanly.** 22 of 22 terms at zero, with the pages indexed
   and ranking. ~14,000 projected vol/month produced 1 click in 28 days. This is not a
   title problem, a depth problem or an indexation problem — the demand does not arrive.
2. **Education demand that does arrive is image-shaped and converts at 0.000%** — 580 image
   impressions, zero clicks, and a web term sitting at position 1.8 with none either. The 08-25
   MBTI instruction applies unchanged: **no further snippet or markup surgery here.**
3. **Do not commission new education content on KD alone.** Three heuristics have now died in this
   workstream (`AI + service noun`, trade-vocabulary, and now specific-artifact for this cluster);
   the education batch is the largest single counter-example — every term was KD 6–40, several
   🟢, and all produced zero.
4. **The two cheap things worth doing are mechanical, not editorial**: the static-metadata fix
   (§4a) and aliasing the five 404 hubs onto the live four (§4b). Both are after 09-23.

---

## Open

- **After 2026-09-23** — `dedicatedBlogMetadata()` on the six static routes. Verify by curling the
  rendered `<title>`, never the source.
- **Alias the five 404 education topics** onto `/topics/language|flashcards|vocabulary|study-sheets`.
- **`/nano-template/chinese-idiom-learning-card` has never been crawled** — it needs an inbound
  link from an indexed page, now a demonstrated lever (see the 09-16 crawl checkpoint).
- **`/blog/visual-learning-tools` is "Crawled – not indexed" since 2026-05-29.** Fixing its title
  does nothing until it is recrawled; sequence the link first, then the title.
- **Do not re-pull KD on this cluster** without a demand signal that is not KD. The volume numbers
  were real and arrived as nothing.
- `/blog/bilingual-ai-flashcards-early-childhood-education` is folded on a pre-fix crawl
  (2026-06-12) and will clear on recrawl — no action.

## Cross-refs

- [`seo-flashcard-learning-batch-2026-06-10.md`](seo-flashcard-learning-batch-2026-06-10.md) — the batch this reads out
- [`workstream-seo-smm-growth.md`](workstream-seo-smm-growth.md) — §2026-09-16 for the site-wide readout this was pulled alongside
- `~/curify-studio/docs/workstream-education-content-supply.md` — the education workstream (HELD); this audit is the organic-search half of why
- `~/curify-studio/docs/teacher-learning-packs-demand-and-validation-2026-08-05.md` — the demand-side read (wedge = visual packaging, not text)
- `docs/blog-quality.md` — running KD/quality log
