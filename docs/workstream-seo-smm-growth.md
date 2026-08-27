# Workstream: SEO + SMM + Growth Analytics — Scope

> Defined 2026-06-26. **Last updated 2026-08-25.** This is the scope/definition of the "SEO + SMM +
> Growth Analytics" workstream. Living doc. Per memory `feedback_workstream_scope_growth_seo_blogs.md`,
> this workstream's scope = growth / SEO / blogs only (the daily-content-drop
> hongjie-patch workflow is a SEPARATE workstream).

This workstream has three legs that converge on one outcome: **measurable
revenue + retention growth** for the platform and (under the 2026-06-26 POD
reframe) for the merchants who use it.

---

## 2026-08-07 — state of play (catch-up for 2026-07-14 → 08-07)

_The doc's previous dated entry was 2026-07-13. This section is the current read; the leg
sections below hold the standing scope. Read this first._

### Traffic reality — the evergreen base is decaying, not flat

Three consecutive 28-day GSC windows, split WC vs non-WC by URL pattern (sources:
`raw/gsc-prior-2026-06-15/`, `raw/gsc-recent-2026-07-13/`, `raw/gsc-2026-08-03/`, and the fresh
API pull `raw/gsc-2026-08-07/w28/`):

| Window | Total clicks | Total impr | Non-WC impr | Non-WC impr/day |
|---|---:|---:|---:|---:|
| 2026-05-19 → 06-15 | 5,405 | 257,240 | 48,048 | **1,716** |
| 2026-06-16 → 07-13 | 1,156 | 148,526 | 24,439 | **873** |
| 2026-07-06 → 08-02 | 190 | 12,615 | 10,658 | **381** |
| 2026-07-09 → 08-05 (API) | 160 | 11,789 | 10,054 | **359** |

**This corrects the July framing.** The "non-WC floor is ~1,200–1,400 impr/day" line recorded on
2026-07-05 is no longer true — the non-WC base fell **1,716 → 359 impr/day (-79%) in two months**.
Site total is now **~420 impr/day, ~6 clicks/day**.

Caveat on the headline number: the 148K-impression middle window is dominated by a single page —
`/blog/world-cup-2026-top-contenders` took **91,062 impressions and 1 click** (61% of that window)
off the semifinal refresh. So the raw "-91% impressions" is mostly that spike unwinding. The real
signal is the **non-WC column**, which decays steadily and independently of WC.

### Why: the canonical fold is the dominant suppressor — and it is NOT yet cleared

**Diagnosed 2026-08-04** (memory `project_blog_canonical_fold`): **44/103 blogs (43%) folded into
the homepage canonical** — `coverage="Duplicate without user-selected canonical"`,
`googleCanonical=https://www.curify-ai.com/`. Root cause was **not** the canonical tag (present and
correct in SSR); it was that every page shipped an identical **1.6MB inline i18n catalog** (97% of
2.17MB HTML) via `NextIntlClientProvider`, making unrelated pages ~90% byte-identical to Googlebot
→ near-duplicate clustering → collapse to the homepage. Same suppressor hits the example pages
(memory `project_mbti_names_ctr_bleed`).

**Fix shipped and live:** `f93bad79` + `c2759e55` (`lib/client-messages.ts` `pickClientMessages()`)
— merged to main, confirmed in production 2026-08-05. Verified live 2026-08-07: a blog page is now
**735KB total / 555KB largest inline chunk** (was 2.17MB / 1,616KB).

**Verification 2026-08-07 (URL Inspection API, 13 pages) — the fold has NOT lifted, because Google
has not recrawled:**

| Page | Coverage | lastCrawl | googleCanonical |
|---|---|---|---|
| `…/example/template-mbti-nba-erling-haaland` | **Submitted and indexed** ✅ | 2026-07-25 | self |
| `…/example/template-mbti-nba-jude` | Duplicate w/o user-selected canonical | 2026-07-30 | homepage |
| `/blog/world-cup-2026-ai-prompt-hub` | Duplicate w/o user-selected canonical | 2026-07-31 | homepage |
| `/blog/ai-packaging-design-guide` | Duplicate w/o user-selected canonical | 2026-07-28 | homepage |
| `/blog/portugal-soccer-poster-prompts` | Duplicate w/o user-selected canonical | 2026-07-23 | homepage |
| `/blog/voice-cloning-tools` | Duplicate w/o user-selected canonical | 2026-07-17 | homepage |
| `/blog/france-soccer-poster-prompts` | Duplicate w/o user-selected canonical | **2026-08-07** | homepage |

Two reads, both actionable:

1. **The 08-04 Indexing-API ping of the 48 folded URLs fired one day BEFORE the fix went live
   (08-05)** — so whatever recrawl it triggered hit the still-bloated HTML. Memory predicted exactly
   this ("recrawl alone will likely RE-FOLD until the 1.6MB bloat is fixed"). **The ping needs to be
   re-fired now that the fix is live.** A 12-blog random sample on 08-07 shows 6 folded / 3 indexed /
   2 crawled-not-indexed / 1 discovered-not-indexed — i.e. **fold rate unchanged (~50%)**, and
   **11 of 12 were last crawled before 2026-08-05**. Organic recrawl of the blog corpus spans
   March–August; waiting is not a plan.
2. **One page WAS crawled post-fix (france-soccer-poster-prompts, 2026-08-07T04:07Z) and still
   folded.** Caveats: it is a genuine country-swap near-duplicate of the portugal/brazil posts (a
   bad test case), and GSC coverage state can lag canonical re-evaluation after a fresh crawl. But
   it is a warning that the trim was **necessary-not-sufficient**: measured 08-07, two unrelated
   blog pages were still **99% similar whole-page** (555KB shared catalog vs ~180KB unique article)
   — down from 97% shared to 75% shared, which is not obviously enough separation. That drove the
   follow-up ship below.

### The 08-04 trim broke 6 live blog posts — fixed 2026-08-07 (`98b0e4b5`)

Auditing the residual payload surfaced a **production regression in the fold fix itself**. The
08-04 trim identified blog articles by sniffing field names (`whatIsContent`, `step1Content`, …).
About 21 posts render their body through a **dedicated CLIENT component**
(`useTranslations("blog.<ns>")`), and the heuristic stripped 7 of those namespaces — so those pages
served **raw i18n keys instead of prose**. Confirmed live before the fix:

| Page | raw i18n keys in HTML |
|---|---:|
| `/blog/ai-video-dubbing-tutorial` | 91 |
| `/blog/best-ai-tools` | 71 |
| `/blog/best-programmatic-seo-tools` | 71 |
| `/blog/mbti-relationship-style-visualizer` | 43 |
| `/blog/weird-science-facts-classroom-engagement` | 43 |
| `/blog/ai-collage-digital-wallpaper-guide` | 35 |

Note the compounding irony: a page whose article text is replaced by key strings has *lost its
unique content*, which makes it **more** near-duplicate, not less — the opposite of what the trim
was for.

**Fix (`98b0e4b5`, on `jwang/vercel`):**
- The field-name guess is gone. `scripts/scan_blog_client_namespaces.cjs` statically scans the
  source for every client component that reads a blog namespace and emits
  `lib/blog-client-namespaces.generated.ts`; a namespace a client reads is **never** stripped.
  Run with `--check` to fail CI when the map goes stale.
- **Route-scoped payload.** Those ~21 articles (~217KB) used to ride along on all ~20k pages. The
  layout now reads `x-pathname` and keeps only the current route's article, so a blog page ships
  its own (unique) body and every other page ships none. This is free: the `(public)` layout's
  `generateMetadata` **already** calls `headers()`, so the tree is dynamically rendered either way
  — verified on prod (`cache-control: private, no-cache`, `x-vercel-cache: MISS`). Two rejected
  alternatives, recorded so they aren't re-tried: a nested `NextIntlClientProvider` (use-intl's
  `IntlProvider` **replaces** `messages` instead of merging, so shared children like RelatedBlogs /
  BlogCTACard would lose their namespaces), and prerender-safe route detection (there is none that
  doesn't read headers).
- `nanoPromptsTags` (~41KB, read only by a server page) dropped from the client payload too.

**Client catalog per page: 1,935KB → 543KB (08-05) → 336KB now**; the 21 blog routes with a client
component land at 340–355KB. Verified on a dev server across 13 routes (the 6 repaired posts, 4
folded blogs, home, `/topics`, `/blog`, a `/zh/` blog route): 0 raw keys, 0 MISSING_MESSAGE, prose
renders, related-blog titles intact, `tsc` clean.

**This resets the fold clock.** The recrawl push below should fire *after* this deploys, not before
— the same one-day-early mistake as the 08-04 ping would waste it again.

### MBTI CTR bleed — fold cleared where recrawled, CTR still not recovering

The 07-24 fixes (`8be3591a` title dedup · `97d552f2` MBTI lastmod · top-60 Indexing-API ping) plus
`ac3093ec` (07-26, "Basketball Card"→"Football Card" in EN + 9 locales) are **all on main and live**
(verified 08-07: titles render clean, absolute self-canonical). Pre/post read from the fresh pull
(`raw/gsc-2026-08-07/{pre_mbti,post_mbti}/`, 12 days each side of the ship):

| Window | MBTI clicks | MBTI impr | CTR |
|---|---:|---:|---:|
| 2026-07-12 → 07-23 (pre) | 9 | 1,903 | 0.47% |
| 2026-07-25 → 08-05 (post) | 9 | 2,282 | **0.39%** |

**No CTR recovery yet.** Impressions grew +20% while the site fell — MBTI remains the one growing
cluster, consistent with the 07-05 cluster-scorecard pick. What did change: the ranking URL moved
from the `/tr/` localized variant to the **unprefixed EN** page (hreflang/canonical fix working),
and `erling-haaland` **un-folded** (self-canonical, "Submitted and indexed") after its 07-25
recrawl. Yet it still earns 831 impr / 1 click at pos 9.5. Since the title is now clean and the
fold is gone on that URL, the residual gap is **position (9–10) + intent mismatch** — "erling
haaland mbti" searchers want a personality answer, not an AI-image template page. **Next lever for
this cluster is answer-shaped content on the page (the VerticalPageSchema Knowledge pillar), not
more title surgery.** `jude` (927 impr / 3 clicks) is still folded — it needs the re-ping above.

### What shipped 2026-07-14 → 08-07

**SEO — technical / indexation**
- **Wedge1 hygiene gate PASSED** 2026-07-14 — 0/280 sampled URLs flagged (was 54/275 = 19.6%).
  Sitemap 25,764 → 14,650. **And link injection turned out to be already shipped** (W1.1/W1.2/W1.4
  live since 06-27) — the June "these edges are missing" premise is STALE; don't rebuild. Remaining
  genuine gaps are narrow: example→tools (0), blog→tools (0), home→blog (0), topic breadth (21 of
  104 slugs home-linked). Memory `project_wedge1_indexation`.
- `4a21ce4b` (07-31) noindex generator-demo example pages, canonical to the template.
- `f429f55a` (08-06) home feed capped to 80 curated cards (~345 → ~728KB payload). The homepage
  still ships a ~726KB own-data chunk — a **separate** perf item from the i18n fold.
- **Negative-SEO disavow** prepared 2026-07-29 — `raw/seo-disavow-2026-07-29/disavow.txt`, 58
  domains (`seo-cartel-*.xyz` coffee-varietal PBN + 3 IP clusters). **Manual upload only.** Framed
  honestly as hygiene/insurance, not a penalty fix — nearly every toxic link is nofollow, and
  Semrush Authority Score is not a Google ranking factor. Memory `project_negative_seo_disavow`.

**SEO — content authority (the strategic shift of this period)**
- **VerticalPageSchema v1** — `docs/vertical-page-schema-v1.md` (07-28, from
  `raw/seo-content-authority-07-28/discussion.txt`). Reframes the problem from "get more pages
  discovered" to **"once discovered, why should Google rank them?"** Answer: a vertical
  domain-knowledge layer on the existing URLs — 4 pillars **Know → Structure → Show → Make**.
  Knowledge (prose) authored at **template** level; Attributes (ontology values) at **example**
  level — because **85% of nano-template impressions land on example pages** and pasting identical
  prose across 88 examples would be a duplicate-content own-goal. Ships: `672c48fe` (v1 + HSK
  pilot) · `05940a13`/`258dc8b8` (top-6 → top-20 MBTI + edu/merch, 10-locale i18n) ·
  `fd4dc1e3` (15 GSC-high-impression example pages) · `9481e0c0` (drop duplicative `includes` slot).
  Companion docs: `a45318d7` template-vs-example pillar split + 12-template pilot, `06f282be`
  GSC-mined pilot cohort.
- **Visual-format ontology** — `f89f53d1` (08-03) visible rich content (lead + how-to + uses + FAQ +
  JSON-LD) on visual-format topic pages, `a9b5125a` +6 more formats, `946d4a08`/`0cfb6971` 8-locale
  backfill, `5120af77` 7 design/commerce topics enriched. Memory `project_visual_format_ontology`.
- **2026-07-24 SEMrush KD review** (recorded in `docs/blog-quality.md`): **pos 40+ or absent on
  every saved KD head term** despite having content — programmatic-seo-tool pos 40,
  ai-product-photo-generator not ranking, ai-worksheet-generator not ranking, ai-packaging-design
  pos 39. Root causes: (1) **page-type⇄intent mismatch** — "X generator" SERPs rank free-TOOL
  landing pages (NoteGPT, MagicSchool, Fotor, Flair), not blogs; (2) domain-authority gap. Levers:
  ship `/tools/<x>` for head terms with blog as spoke; chase the differentiated long-tail we win
  ("worksheet generator FROM VIDEO" — demo video embedded on `/blog/video-to-learning-pack`,
  `3f9806a6`); push near-page-1 pages. Memory `project_weekly_semrush_kd`.

**SMM — the FB reset (biggest SMM change since the doc was written)**
- **Diagnosis 2026-08-04** (memory `project_fb_follower_growth`): Page `885537721308600` "Curify AI"
  at **89 followers** after ~50 posts in 6 days (8.3/day). Four structural faults, all against the
  Account-Positioning playbook: (1) **~90% photo carousels** — the proven-dead format; (2) content =
  template-**generator showcases** (product-output paradox) rather than the reach-authority identity
  (Sinosphere culture/awe); (3) **external link in every post body** → FB reach throttle; (4) 8/day
  of low-engagement posts trains the algo down. Plus a QA bug that shipped a post captioned with raw
  prompt JSON.
- **Fix merged** (curify-studio PR #417, `3f71edb`, merged `15cee0a` 08-05): FB carousels disabled
  (single native posts), CTA link moved to the **first comment** via `_comment_on_post()`,
  `_social_title()` guard rejects JSON/prompt-blob captions. `86a123e` (08-06) fixed a missing CTA
  url + added a second (education) Page.
- **Native-video track live** (`3ba763d`): `facebook_client.post_video_to_facebook_page()` +
  `scripts/run_fb_video_batch.py`. Ran live — **all 8 八仙 (Eight Immortals) videos scheduled as
  native FB video, 1/day 2026-08-05 → 08-12 @16:00 UTC**, culture-forward hooks, no body link,
  public-domain (no IP risk). This is the first test of the reach-authority identity as a
  *follower-growth* play rather than a broadcast.
- **Still open:** Sinosphere infographic queue; cadence cut on the photo autopost
  (`autopost.yaml` cron 8/day → 1-2/day); the short-video library (curify-gallery `merch_IP`,
  `ecommerce_workflow`) is still NOT in the autopost item pool.

### Checkpoints — dated, with owner action

_Updated 2026-08-10. The three deploy-gated rows below are **done**; corrections to the
2026-08-07 diagnosis are in the section that follows._

| Due | Check | Method | Status |
|---|---|---|---|
| ~~now~~ | ~~Merge `jwang/vercel` → main and deploy `98b0e4b5`~~ | normal deploy | **DONE** — `98b0e4b5` + `0c4ceb9b` on main + live |
| ~~after deploy~~ | ~~Re-verify the 6 repaired posts render prose on prod~~ | curl | **DONE 08-10** — 0 raw keys on all 6; blog HTML 480KB |
| ~~after deploy~~ | ~~Re-fire Indexing-API ping on the folded set~~ | `submit_indexing_api.cjs` | **DONE 08-10** — 42 URLs, 0 failed |
| ~~2026-08-12~~ | ~~八仙 FB video series → pull `fan_count`~~ | Graph API | **DONE 08-12: 89 → 90.** But the 8 reels got **0–1 views each** — the thesis was never actually tested. See the SMM note below. |
| 2026-08-17 | **Un-fold check on the 42 pinged URLs** (ping fired 08-10; allow ~1wk) | re-run `scan_fold.cjs` | **DONE 08-25** — fold 43→34, but 29 of 34 never recrawled; see the 08-25 section |
| 2026-08-19 | Blog un-fold confirmation + CTR capture-rate re-measure | GSC pull + URL Inspection | **DONE 08-25** — indexed 60→49; blog indexation is DECLINING |
| 2026-08-24 | **FAQPage effect on MBTI CTR** — compare capture rate vs the 10% baseline below, NOT raw clicks | position-bucket CTR table | **DONE 08-25** — capture 3.4%→1.4%; demand is image-shaped, markup cannot fix it |
| 2026-08-25 | Wedge1 8-week post-ship measurement | per-family distinct-impressed-URL breadth, WC-stripped | pending |
| ~~overdue~~ | ~~SEMrush KD pull~~ | screenshots → `docs/blog-quality.md` | **DONE 08-10** — 6/13 returned data; recorded in `docs/blog-quality.md` |
| 2026-08-17 | **Re-measure `programmatic seo tools` (KD 10, was pos 24) + `ai packaging design` (KD 29, was pos 39)** — two suppressors lifted this week (fold + title). Do this BEFORE writing new copy | GSC pull | **DONE 08-25** — both went backwards; packaging design to ZERO impressions |
| open | Disavow upload (manual, no API) | search.google.com/search-console/disavow-links | awaiting user |

---

## 2026-08-25 — four overdue checkpoints measured. Three negatives and one reframe.

_All four were pending from the 08-10 checkpoint table. None of the interventions worked;
the useful output is why._

### 1+3. Un-fold check on the 42 pinged URLs + blog re-sweep

Full URL-Inspection sweep of all 105 blogs (the 42-URL ping list was never recorded as a
list, so this re-derives it):

| state | count |
|---|---:|
| Submitted and indexed | **49** |
| Duplicate without user-selected canonical (folded) | **34** |
| Crawled – currently not indexed | 16 |
| Discovered – currently not indexed | 6 |

Fold is down 43 → 34, and 33 of the 34 still fold to `/`. **But 29 of those 34 have not been
recrawled since before the 08-05 fix** — crawl dates run 06-22 to 07-10, i.e. 15 days after a
ping that was supposed to force a revisit. The ping did not force recrawls.

**Worse, blog indexation is going backwards.** The 08-19 sweep recorded 60 indexed of 103.
Today: 49 of 105. Eleven posts left "indexed" for crawled-not-indexed or discovered. The fold
count improving is not the same as the situation improving.

### 2. `programmatic seo tools` + `ai packaging design` re-measure

Six weeks before the ping vs the two weeks after, normalised per day:

| cluster | before | after |
|---|---|---|
| `programmatic seo*` | 27 impr (0.6/day), pos 19.7, **0 clicks** | 3 impr (0.2/day), pos 15.0, **0 clicks** |
| `*packaging design*` | 230 impr (5.5/day), pos 36.2, **0 clicks** | **0 impressions** |

Position nudged up for one while impressions fell two-thirds; the other disappeared. **Neither
keyword has ever produced a single click.** The checkpoint said to do this before writing new
copy — the answer is don't.

### 4. FAQPage effect on MBTI CTR — and the reframe

| window | impressions | clicks | capture rate |
|---|---:|---:|---:|
| before FAQPage (07-13 → 08-09) | 3,001 | 4 | **3.4%** |
| after FAQPage (08-11 → 08-24) | 1,251 | 1 | **1.4%** |

Positions 1–8 returned **zero clicks in both windows**, across 4,252 impressions.

**Then the actual explanation: the demand is image-shaped.** Split by search type for the same
window, MBTI pages get **3,339 impressions from IMAGE search vs 2,885 from web**, and image
CTR is **0.03%** — one click from 3,339 impressions. People find our MBTI cards as pictures,
look at them, and never need the page. FAQPage markup only affects the web SERP, so it could
never have moved this. Do not attempt further snippet surgery on MBTI pages.

⚠️ **Baseline discrepancy:** the 08-10 section records a 10% capture rate; this measurement
puts the "before" window at 3.4% using standard position-CTR benchmarks. Different benchmark
table or page set — treat them as separate series, not a like-for-like decline.

### What these four together say

The Indexing API does not trigger recrawls for this site (29 of 34 unrecrawled after 15 days,
plus the separate 08-18 experiment where treatment and control both crawled 1 of 3). Two
tracked keywords are dead. The MBTI CTR problem is an image-search artifact, not a markup
problem. **Every remaining lever in this workstream is upstream of the SERP: which pages
exist, and whether the directory they live in is worth crawling.**

---

## 2026-08-10 — corrections + the two P0s worked

### RESULT of the Indexing-API experiment — read 2026-08-25

| arm | crawled | indexed |
|---|---|---|
| treatment (pinged 08-18) | 1 of 3 | **1 of 3** — `/tools/die-cut-sticker-file`, crawled 08-23 |
| control (never pinged) | 1 of 3 | 0 of 3 — `brand-font-specimen-set` crawled 08-25, "crawled – not indexed" |

**Verdict: the ping is not the lever, and n is too small to claim it is.** Both arms got
exactly one page crawled in seven days. The single treatment success is also the page that
received the biggest link fix on 08-17 (1 → 4 inbound sources including the home page), so
its indexation cannot be attributed to the ping. `acrylic-factory-export` got links (1 → 3)
AND a ping and is still never-crawled.

**What actually worked in the same window, with neither:** the two blog posts published
08-18 were crawled and indexed within a day, unpinged, on one inbound link. That remains the
strongest signal, and it points at prefix quality rather than links or pings — `/blog` earns
712.8 impressions/page against `/nano-template`'s 9.4 across 3,966 pages.

**Actions:** stop spending Indexing-API quota on `/tools/*` and `/nano-template/*`. Treat
`/blog/*` as the ranking surface and tool pages as click destinations. The 3,966-page
`/nano-template/` tranche generating ~9 impressions each is the thing to fix.

### Indexing-API experiment — submitted 2026-08-18, READ 2026-08-25

Deployed the link fix (`564ff33c`) and submitted 3 URLs. **This is the decision point for
the whole indexation plan**: if a direct submission with links in place does not produce a
crawl, link topology is not the lever and the remaining 16 audit URLs need a different
approach.

**Treatment — links added 08-17, pinged 08-18:**

| URL | inbound sources before → after | state at submit |
|---|---|---|
| `/tools/die-cut-sticker-file` | 1 → **4** (tools, home, topics/merch, use-cases/merch-ops) | never crawled |
| `/tools/acrylic-factory-export` | 1 → **3** (tools, use-cases/merch-ops, use-cases/designers) | never crawled |

**Treatment — links already existed for weeks, pinged 08-18:**

| URL | inbound sources | state at submit |
|---|---|---|
| `/nano-template/ip-character-expression-sheet` | home ×2, `/topics/merch` ×5, `/use-cases/for-merch-operators` ×7 | never crawled |

This one separates the two variables. It has had links from *indexed* pages all along and
was never fetched, so if it now indexes, the ping did the work, not the links.

**CONTROL — links but deliberately NOT pinged.** These are ladder steps, so they already
carry home + topic-page links on exactly the pattern applied to the treatment group. Leaving
them un-pinged is what makes the read interpretable:

- `/nano-template/brand-font-specimen-set` (never crawled)
- `/nano-template/brand-vi-full-visual-pack-mockup` (never crawled)
- `/nano-template/amazon-product-six-grid-infographic-listing-poster` (never crawled)
- `/nano-template/chocolate-giftbox-packaging` (unknown to Google)
- `/nano-template/eco-farm-food-uniform-product-label` (unknown to Google)

**How to read it on 08-25:**

- treatment crawled, control not → **ping is the lever**; spend the 200/day quota on the
  never-crawled backlog.
- both crawled → the 08-17 links did it; pings are unnecessary and the recipe is free.
- neither crawled → link topology is NOT sufficient. Stop the link-injection plan and treat
  this as a site-authority problem.
- crawled but "Crawled – currently not indexed" → worst case, and the same verdict
  `/topics/language` and 4 edtech templates already carry: Google looked and declined. That
  is a content problem, not a plumbing one, and no amount of linking or pinging fixes it.

Do NOT ping the control group before the 08-25 read, however tempting.

---

### New pages stopped being crawled around mid-July (2026-08-17)

`/tools/packaging-mockup` came back **"Duplicate without user-selected canonical",
`googleCanonical: https://www.curify-ai.com/`** — folded to the home page. It looked like a
page defect. It is not. **Six hypotheses tested and all eliminated:**

| # | hypothesis | measurement | verdict |
|---|---|---|---|
| 1 | near-duplicate of the home page | folded page 0.669 visible-text similarity; **indexed** sibling 0.857 | ❌ backwards |
| 2 | page absent at crawl time | merged to main 08-09 00:50 UTC, crawled 04:55 UTC | ❌ live 4 h prior |
| 3 | the i18n-namespace 404 (`ba7d6358`) | that bug hit acrylic/sticker-factory-export, not this | ❌ wrong page |
| 4 | canonical buried past head | byte 3,980 of a 6,413-byte head — same as the indexed page | ❌ visible |
| 5 | tool pages duplicate each other | pairwise visible-text similarity **0.10–0.22** | ❌ not close |
| 6 | thin content | `speech-translator` is **indexed at 4,685 B**, thinner than every non-indexed page | ❌ no threshold |

**The variable that separates them perfectly (12/12, zero overlap) is AGE.**

| indexed | added | | not indexed | added |
|---|---|---|---|---|
| bilingual-subtitles, style-transfer, video-dubbing, speech-translator | 03-04 | | die-cut-sticker-file | 08-06 |
| ai-product-photo-generator | 05-31 | | packaging-mockup | 08-06 |
| ecommerce-photo | 07-02 | | brand-direction-explorer | 08-12 |
| character-sticker-sheet, mockup | 07-11 | | acrylic-factory-export | 08-16 |

Every tool page added **on or before 07-11 is indexed**; every one added **since 08-06 is
not**. This is the site-wide *"Discovered — currently not indexed"* bucket seen from inside a
single route. **Do not look for page defects on new pages — the crawl never happened.**

**Inbound internal links track the one exception.** `/tools` is indexed (crawled 08-09) and
links to all four new tools, so *discovery* is not the gap — Google found them and declined
to fetch. What differed:

- `/tools/packaging-mockup` — **3** inbound sources (`/tools`, `/topics/packaging`, home) → **crawled 08-09**
- `/tools/die-cut-sticker-file` — **1** (`/tools` only) → never crawled
- `/tools/acrylic-factory-export` — **1** (`/tools` only) → never crawled

So the lever is **link paths from pages Google actually crawls**, not page content. Fixed in
`564ff33c`: merch ladder step 6 → die-cut (renders on home + `/topics/merch`, the same slot
that got packaging-mockup crawled), and the two tools added to `for-merch-operators` /
`for-designers` in `lib/use-cases.ts` — which `lib/tool-personas.ts` already claimed, so this
was the missing half of an existing mapping. Link counts: die-cut **1 → 4**, acrylic **1 → 3**.

⚠️ **Sequencing:** submit these to the Indexing API only *after* the links deploy. Pinging
first repeats the packaging-mockup outcome — a crawl that arrives before there is any reason
to index. Useless link sources measured on the way: `/topics/stickers` (never crawled) and
`/use-cases/for-dtc-brands` (itself folded).

---

### The fold fix is CONFIRMED working (and two earlier explanations were wrong)

Full URL-Inspection sweep of **all 103 blogs**: **60 indexed clean · 41 folded but never
recrawled since the 08-05 fix · 2 folded despite a post-fix recrawl · 0 errors.**

**`/blog/world-cup-2026-ai-prompt-hub` un-folded** — self-canonical, "Submitted and indexed",
recrawled 08-07. It was the biggest traffic-bearing casualty (831 impr / 30 clk), so the
mechanism is proven end-to-end. The fold is a **recrawl-latency** problem now, not a
payload problem: 41 of the 43 still-folded blogs simply have not been revisited.

**Two claims in the 08-07 section are retracted:**

1. **"france/portugal/brazil are genuine country-swap near-duplicates" — false.** Measured
   visible-text similarity: france↔portugal **0.284**, france↔brazil **0.142**,
   portugal↔brazil **0.105**. Not near-duplicates. That explanation should not be reused.
2. **Neither residual payload nor content volume separates folded from un-folded.**
   Whole-page HTML similarity against an unrelated blog: un-folded wc-hub **0.943**, folded
   france **0.957** — indistinguishable. Folded portugal carries *more* unique text (16,903
   chars) than un-folded wc-hub (16,416); cleanly-indexed travel-itinerary has only 8,232.
   **So the "next lever = trim `topics` (~153KB)" row in the 08-07 table was aimed at the
   wrong target and is dropped.**

Real residual exposure: unique visible text is **1.6–3.0% of page bytes** (~500KB HTML
carrying 8–17K chars). Absolute size fell 4.5× (2.17MB → 735KB → **480KB**) but pages are
still ~95% shared chrome. Fixing that ratio means less chrome per page, not a smaller catalog.

### P0 #1 — Indexing-API ping: FIRED 2026-08-10

42 URLs (41 folded-and-stale blogs + `…/example/template-mbti-nba-jude`), 0 failed. Targets
were selected as **folded AND last-crawled before 2026-08-05**, so no quota went to pages
Google has already re-evaluated post-fix — the mistake that wasted the 08-04 ping.

### P0 #2 — CTR bleed: quantified, and the assumed fix was already shipped

Actual CTR vs position-typical CTR, all queries, 7d (08-03→08-09):

| pos | impr | clicks | actual | typical | expected |
|---|---:|---:|---:|---:|---:|
| 4 | 27 | **0** | 0% | 8% | 2.2 |
| 7 | 71 | **0** | 0% | 4% | 2.8 |
| 9 | 264 | 1 | 0.38% | 2.5% | 6.6 |
| **top-10** | **534** | **2** | — | — | **~20** |

**We capture 10% of position-normal CTR.** Positions 2–8 return literally zero. Site-wide,
**276 of 288 top-10-ranking pages (96%) earn zero clicks = 63% of top-10 impressions.**
This is a real anomaly, not "we rank at 9".

**The assumed fix — put the MBTI type in the title — is already live** and is not the lever:
prod serves `Erling Haaland — ISTP Goal Scorer MBTI Football Card`, and the ru/es/ko variants
are properly localized. Do not redo title surgery.

**What was actually missing:** example pages carry `Article` + `HowTo` + `HowToStep` JSON-LD
and **no `FAQPage`** — we mark ourselves up as a TOOL for a query whose intent is a QUESTION.
Worse, the Pillar-1 authored knowledge (`traits`, `strengths`, `career`, `compatibility`…)
never reached the markup at all. Shipped `buildVerticalFaqJsonLd()`
(`lib/nano_seo_utils.ts`): emits FAQPage from that authored prose, led by
*"What is {name}'s MBTI type?"* — the exact bleeding query. Suppressed when there is no
authored content, so no page ships an empty FAQPage. 8 assertions; suite 303 green.

**Measure on 08-24 with the capture-rate table above, not raw clicks** — raw clicks move with
impressions and will mislead.

### 2026-08-12 — growth suggestions, ranked (updated)

_Four of the five are **removing a blocker on something that already works**, not
producing new content. Ranked by evidence × addressable size × effort._

**#1 `brand-direction-explorer` — the best-converting surface was hidden. STARTED 08-12.**

| signal | value |
|---|---|
| projects in the week to 08-11 | **6 of 20 (30%)** — highest-throughput surface on the site |
| behaviour | generate → download → generate → download loops (users 1269, 1399) |
| TOOL_REGISTRY / `/tools` / sitemap | **absent from all three** |
| robots | **`noindex, nofollow`** |
| Google | **"URL is unknown to Google" — never crawled** |

Shipped as a pitch/demo surface; the noindex was right then and wrong now.

**Done 08-12 — now a first-class tool at `/tools/brand-direction-explorer`.**
Removed the noindex, added canonical + hreflang, and (per operator decision)
**moved it under `/tools/<slug>` rather than leaving it standalone**: added a
`TOOL_REGISTRY` entry with a new `brand_direction` action, authored the
`brandDirectionExplorer` + `tools.brand_direction_explorer` namespaces across all
10 locales (en/zh authored, 8 carry the EN copy), and wired the bespoke
`BrandDirectionExplorerClient` into `tool-generic-client`'s action branch — the
same mechanism `costume_tryon` and `product_video` use, so the interactive UI
moved intact. `for-designers` and `for-dtc-brands` now reference it through
`toolSlugs` (the demo-card workaround was removed as redundant).

The old URL **301s** to the new one (`next.config.ts`, plus the locale variant),
so the sitemap entry and the crawl request already made are not wasted. The
sitemap now emits it via `getToolRoutes()` instead of `STATIC_ROUTES`.

*Follow-up:* ping `/tools/brand-direction-explorer` to the Indexing API after the
merge — the old URL was never crawled, so there is no equity to inherit; the new
URL needs its own discovery. Note the route is `dynamic = "force-dynamic"`, so
every crawl is an origin render — free while nothing crawled it, worth watching now.

**#2 `/topics/language` — proven external demand, blocked at indexation.**
Landing page for **1point3acres**, the best-converting external source found:
27 visitors at a **33% act rate** (vs Facebook's 1,557 visitors at ~0), entirely
unplanned. Status: **"Crawled – currently not indexed", last crawled 2026-05-27.**
Two moves: fix indexation, and treat the forum placement as repeatable rather than
accidental — one link outperformed a third of the social output.

**#3 Pinterest — the structural bet.** The only platform in the mix that is **not
a recommendation feed**: a visual search engine with persistent, indexable pins,
so identity-drift does not apply and product content is not penalised — which is
exactly what kills YouTube (median 6) and FB (median 15). 2,600+ prompt images and
the template-example library are already produced. The playbook has no row for it.
Highest upside, zero current presence.

**#4 Unserved on-site search demand.** 36 `SEARCH_LOWRESULT` events clustered in
merch substrate — `挂绳`/lanyard, `手机壳`, `瓶子`, `雕像`, `咖啡杯`, `手提袋`,
`charm`, `puzzle` — all ≤4 results, plus `bobblehead` at **zero**. People are
on-site, typing what they want, leaving empty. Lines up with the
`die cut sticker maker` cluster (KD 25) and the first paying customer's segment.

**#5 CTR recovery — largest mechanical multiplier, smallest absolute base.**
288 pages rank top-10 and capture **10% of position-normal CTR**; 63% of top-10
impressions earn zero clicks. Half-normal ≈ 5× the clicks with no new content and
no ranking work. Honest caveat: 5× of ~6 clicks/day is still small — it is the
leading indicator, not the revenue event. First experiment is the FAQPage schema
(measure 08-24).

### 2026-08-12 — FB Reels: it is a distribution problem, not a content problem

**Correction to the first read of this checkpoint.** I initially closed it as "8
culture-forward videos → +1 follower, so the follower-growth thesis fails." That
was wrong: pulling the reel-level numbers shows the 八仙 videos **got 0–1 views
each**. Nothing was tested. You cannot judge content nobody saw.

Full page inventory (Graph `/video_reels`, 24 reels, all `published=true`,
`privacy=Public`):

| views | len | posted | caption |
|---:|---:|---|---|
| **3,365** | 30s | 2026-03-23 01:25 | 400 years of American history, kindly produced… |
| **18** | 35s | 2026-03-23 09:29 | 400 years of American history, brought to you… |
| 209 | 21s | 2026-07-04 | Luka Modrić / croatia |
| 34 | 11s | 2026-01-23 | Olympic Park covered by snow |
| … | | | (long tail 24 → 4) |
| 0–1 ×7 | 13s | 2026-08-04 | 八仙 series |

**The decisive fact is the top two rows.** The SAME Americana content, posted the
same day 8 hours apart, got **3,365 vs 18 views — a 187× spread**. Content
category cannot explain that. The 3,365 was an algorithmic lottery win, not a
reproducible property of the content.

Supporting numbers: **Americana alone is 88% of all views the page has ever
earned** (3,365 of 3,813 across 24 reels), and **22 of 24 reels are under 35
views**, median ≈15. That is the real baseline; 3,365 is an outlier, not a
benchmark. fan_count over the same window: 89 → **90**.

**Do NOT run the 5-category reel test.** With a 187× noise floor on identical
content and a ~15-view median, no 5-arm comparison at this volume can produce a
readable result. Content selection is not the binding variable — distribution is,
and a 90-follower page with no engagement history has none to allocate.

**Also correct the referral read.** FB strips all path info (every referrer is a
bare host: `m.facebook.com`, `l.facebook.com`, …), so Page posts, reels and
personal group posts are **indistinguishable** in `user_interactions`. The 八仙
reels carried no body link by design, so they *structurally cannot* generate
referral traffic. The 114 FB visitors / 0 projects over 14d therefore measures the
autopost + **manual group posting**, not reels — and the deep, curated landing
pages (`/nano-template/east-asian-culture-comparison-infographic` 18 visitors,
`/tools/chinese-costume-tryon` 10, `/topics/*`) look like hand-placed group links.
**That is the channel actually producing traffic, and it is manual.** Systematize
that before producing more reels.

### SEMrush KD — pulled 2026-08-10 (full table in `docs/blog-quality.md`)

**Result: 6 of 13 returned data; the 7 zero-result terms were the commercial MBTI
variants — there is no commercial-intent MBTI demand at all.** The MBTI cluster is
~95% of impressions and structurally informational, so it is a brand surface, not a
conversion path. `programmatic seo tools` is the best ratio in the set (KD **10**,
CPC **$8.98**) and acting on it surfaced a title bug suppressing 10 posts — see
`docs/blog-quality.md` and the commit for `_dedicated-metadata.ts`.

Original proposed set, for the record:

Do **not** pull KD on `<name> mbti` head terms: we already rank pos 8–9 there and the
constraint is intent, not difficulty. Pull these three groups:

1. **Commercial variants of what we already rank for** — `mbti poster generator`,
   `mbti character card maker`, `personality poster maker`, `mbti art generator`.
2. **The decaying evergreen base** (359 impr/day, −79%) — `ai packaging design`,
   `ai sticker design prompts`, `ai product photo generator`, `ai travel itinerary template`,
   `ai video dubbing`, `voice cloning tools`, `programmatic seo tools`.
3. **The POD/merch wedge** (where the paying customer is) — `die cut sticker maker`,
   `custom sticker design ai`, `print on demand design generator`, `merch design generator`.

Skip World-Cup terms — the 91K-impression spike unwound and will not return.

Supporting signal for group 3: on-site search shows an unserved merch-substrate cluster —
`挂绳`/lanyard, `手机壳`, `瓶子`, `雕像`, `咖啡杯`, `手提袋` all returning ≤4 results, and
`bobblehead` returning none.

---

## 1. SEO — programmatic discoverability

**In scope:**
- Topic-hub pages at `/topics/<slug>` (~99 unlocalized + ~50 localized today)
- Tool detail pages at `/tools/<slug>`
- Use-case landing pages at `/use-cases/<slug>` (cross-references workstream D)
- Blog content at `/blog/<slug>` (~50+ live posts; backlog tracked in
  `project_blog_*.md` memory)
- Sitemap + canonical URL discipline (memory `reference_curify_canonical_url.md`)
- GSC + Indexing API loop (memory `reference_gsc_api_access.md`)

**Anchors:**
- `docs/seo-funnel-audit-2026-06-26.md` — **headline diagnosis: 87% of sitemap pages are invisible to Google; 76% of clicks from 3 WC posts; 5 wedges to grow from 213→10k clicks/day**
- `docs/wedge1-indexation-rescue-scope-2026-06-26.md` — **W1 scope (7 work items, 4-5 weeks, +770-1,930 clicks/day projected over 8 weeks)**
- `docs/wedge1-hygiene-findings-2026-06-26.md` — **W1.7 findings: 4,859 of 25,764 sitemap URLs are intentionally noindex (710 thin topics + 4,149 non-EN tag pages); 2 new sitemap-cleanup gates added before link injection**
- `scripts/audit_gsc_full.cjs` + `scripts/seo_funnel_audit.py` + `scripts/sample_invisible_pages.cjs` — re-runnable audit pipeline

**W1.7a + W1.7b shipped 2026-06-26 on `jwang/vercel`:**
- Commit `a0a12ab4` — `app/sitemap.xml/route.ts`: filter noindex topics via `isLocalizedTopic()` + collapse tag pages to EN only. Sitemap URL count 25,764 → 20,905 (-4,859). NO direct click lift expected; success criteria = sitemap coverage 13.4% → ~17% over 4-8 weeks via `seo_funnel_audit.py` re-run. Re-audit checkpoint: 2026-07-24.
- Commit `14db8c81` — audit pipeline + 4 findings/scope docs.

**W1.1 + W1.4 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `c5eea10e` — new `HomeDiscoveryStrip.tsx` server component renders below `HomeToolsStrip` with two chip rows: top-36 enabled topics (sorted by template count) linking to `/topics/*`, and all live use-cases (filtered by `hiddenFromChips`) linking to `/use-cases/*`. Wired through `HomeClient` via a new `discoveryStrip: ReactNode` prop. i18n: 4 keys under `home.discovery`, autotranslated to all 9 non-EN locales. Verified on dev: /en renders 41 unique `/topics/*` + 9 unique `/use-cases/*` outbound links; zh works with localized chip titles. Expected lift: +220-530 clicks/day over 4-8 weeks. Re-audit checkpoint: ~2026-08-21.
- Commit `a7f8911d` (follow-up fix) — silenced MISSING_MESSAGE warnings for the 27 stub topic entries (have `.displayName` only, missing `.title`/`.description`/`.keywords`). Three layered fixes: new `FULLY_LOCALIZED_TOPIC_IDS` set + `isFullyLocalizedTopic()` helper in topicRegistry_pure; filter applied in HomeDiscoveryStrip (41 → 39 unique chips); `t.has()` pre-check added to `makeSafeTranslator` and the topics-page metadata safeT so missing-key lookups never trigger next-intl's dev warning.

**W1.2 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `39831424` — new `ExampleRelatedTopics.tsx` server component at the bottom of `/nano-template/[slug]/example/[id]`. Expands the template+example topic seed via tier-1 ancestors + tier-2 parents + curated related entries (from `getTier1Ancestor`/`getParentTopic`/`getRelatedTopics` in topicRegistry_pure), all filtered through `isFullyLocalizedTopic`, capped at 8 chips. i18n: 2 keys under `nanoTemplate.relatedTopics`, autotranslated to all 9 non-EN locales. Verified on dev (Brazil WC example): 12 unique `/topics/*` outbound links (was ~7 before); "Related topics" / "相关主题" section renders cleanly. Tonnage: ~88k new internal links across 17,650 example URLs — biggest single source of authority injection in W1. Expected lift: +300-600 clicks/day in 6-10 weeks. Re-audit checkpoint: ~2026-09-04.

**W1.3 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `7bbf5eff` — new `BlogRelatedHubs.tsx` server component renders below `BlogCTACard` on `/blog/[slug]`. Two-tier mapping at `utils/blog-related-hubs.ts`: per-slug curated entries for high-traffic blogs (WC + mega-hubs + sticker + MBTI) + category-derived defaults for the long tail. Filters through `isFullyLocalizedTopic`, capped at 6 chips. i18n: 2 keys under `nanoTemplate.blogRelatedHubs`, autotranslated to all 9 non-EN locales. Verified on dev: brazil-argentina blog gets world-cup+posters+sports chips; category-defaulted blogs get the category's default topic; zh locale renders 浏览相关主题. Tools NOT surfaced (BlogCTACard already handles). Caveat: covers only `/blog/[slug]` pipeline — the 33 dedicated route folders bypass this ship (memory `feedback_blog_slug_pipeline.md`). Most top-traffic blogs ARE on the [slug] pipeline so impact lands on the right surfaces. Expected lift: +200-500 clicks/day in 4-8 weeks. Re-audit checkpoint: ~2026-08-21.

**W1.5 shipped 2026-06-27 on `jwang/vercel`:**
- Commit `2b8df121` — new `PromptTryInTool.tsx` server component on `/nano-banana-pro-prompts/[id]`. Adds one outbound /tools/* link per prompt detail (~4,117 pages, previously zero outbound to tools). Two-tier match in `promptToolMatch.ts`: tag-based override (product / manga / subtitle / style etc.) + round-robin default across live tools (status=create|demo) via prompt-id hash. Bug caught + fixed during dev: nanobanana.json carries NUMERIC ids, `simpleHash` returned 0 silently on a number — fixed by stringifying. i18n: 3 keys under `nanoTemplate.promptTryInTool`, autotranslated to all 9 non-EN locales. Verified on dev: 5 sampled prompts distribute across 4 distinct /tools/* slugs (round-robin works); zh locale renders 在 Curify 工具中尝试此功能. Expected lift: +30-100 clicks/day in 4-8 weeks (smaller than topic-chip wedges since each prompt picks ONE tool, but compounds with task #103 once AI-assistant crawlers are unblocked).
- `docs/programmatic-seo-topic-hubs.md` — the topic-hub framework
- `docs/search-quality.md` — internal search quality (companion to A workstream)
- `docs/interconnection.md` — blog ↔ use-case ↔ tool cross-link layer
- `docs/blog-quality.md` — quality improvement track (P0/P1 fluff telltales)
- `docs/search-retrieval-improvement-plan-2026-06-25.md` — retrieval plan
- `docs/eval-framework-visual-search-benchmark-2026-06-14.md` + `docs/eval-framework-visual-intent-routing-2026-06-15.md` — search eval framework
- `docs/home-discoverability-ideas-2026-06-14.md` — homepage discoverability
- `docs/content-gap-corporate-news-editorial-2026-06-12.md` + `docs/seo-business-news-visualization-batch-2026-06-12.md` — corporate news editorial
- `docs/seo-flashcard-learning-batch-2026-06-10.md` + `docs/seo-travel-batch-2026-06-10.md` — programmatic batch ships
- `docs/taxonomy-gap-canva-pinterest-2026-06-14.md` — taxonomy gap audit
- `docs/template-matching-section-a-vs-b-2026-06-17.md` — template matching A/B
- `docs/video-user-attribution-2026-06-26.md` — channel attribution for video users

**Recent ships worth tracking:**
- 4 mega-hubs (anti-listicle Path A): WC + sticker + packaging + makeover (tasks #102 + #104)
- robots.txt expansion blocking 11 more crawlers from `/nano-template/*` + `/nano-banana-pro-prompts/*` (task #105, commit 94c0e6ac) — Vercel cost reduction
- Indexing API pushes: 10 homepage URLs (brand SERP cleanup), 10 inspiration-hub URLs (structured-data error cleanup 2026-06-23)

**GSC 404 report — legacy carousel URLs (RESOLVED, 2026-07-04):** the `raw/curify-ai.com-Coverage-Drilldown-2026-07-03/` "Not found (404)" export shows 642 URLs; **~524 (82%) are legacy `/nano-template/[slug]/carousel/[exampleId]` URLs across all 10 locales** — the pre-`016f8a14` (2026-05-13 route unification) carousel path, which moved to `/carousel/template-example/[slug]/[exampleId]`. **Already fixed:** commit `f52d67bd` (2026-05-31) added the 308 permanent redirect in `next.config.ts:114-123`; verified live 2026-07-04 — single hop old→new, destination returns 200. GSC count already fell 735→642 as Google recrawled, then plateaued ~2026-06-12. **No code action — the only lever is clicking "Validate Fix" in GSC to prompt recrawl.** Remaining buckets are low-value: ~75 `/i/<uuid>` inspiration deep-links (genuine 404, route removed, no clean map — leave or 410 later) + 6 `battle/…/example/*.jpg` image files crawled as pages; rest of the 676 table rows is CSV multi-line noise, not real URLs. Don't re-investigate carousel 404s on the next GSC pull.

**GSC "Duplicate without user-selected canonical" — P0 FIXED (2026-07-11):** GSC Page Indexing
showed **9,882 "Duplicate without user-selected canonical"** + **10,579 "Crawled - currently not
indexed"** (the "87% invisible" made concrete). Drilled in via the **URL Inspection API**
(`urlInspection.index.inspect`, service account `curify@…`, `sc-domain:curify-ai.com`) on
representative URL patterns. **Root cause:** the **example pages**
`/nano-template/[slug]/example/[exampleId]` — the **biggest URL class (17,650)** + the W1.2
internal-link target — emitted a **RELATIVE** `rel=canonical` (`href="/nano-template/…"`), while
the template-detail page emitted an absolute one. The route's `generateMetadata` set
`alternates.canonical = canonicalPath` (a relative path); Next.js only absolutizes a relative
canonical when `metadataBase` is set, which this route does NOT inherit (only `lib/nano_seo_utils.ts`
sets it). Google won't accept a relative self-canonical → deduped every example page to `/` →
"Duplicate without user-selected canonical." **Fix:** commit **`3fb7b42f`** on `jwang/vercel` —
prepend `SITE_URL` to the `canonical`, `languages[lng]` (hreflang), and `x-default` in the example
page `generateMetadata` (matches the template-detail page's `getCanonicalUrl`). Verified on dev: EN
example → absolute self-canonical; localized variants → `noindex` + absolute canonical→EN. **Action
after deploy: click "Validate Fix" on the duplicate-canonical issue in GSC to prompt recrawl; watch
the 9,882 bucket drain + index coverage climb over the following weeks — the single highest-yield
technical SEO reclaim.** Triage of the other buckets: **10,579 "crawled-not-indexed"** = content
quality (the cluster-depth work / Driver 1, NOT a code fix); **17,425 noindex** = intentional
(non-authored localized template/example variants — URL-Inspection sample confirmed NO EN core pages
were caught, so no regression); redirects (3,297) / 404 (642) / alternate-canonical (372) =
expected/known. Method note: GSC coverage *categories* aren't bulk-exportable via API — confirm
patterns by inspecting representative URLs, not a full pull.

**H2-2026 strategic direction (2026-07-05, from `raw/seo-drop-07-05/`):** two independent
reads (an advisor memo + the Reddit "sudden GSC drop" thread) confirm our own funnel-audit
diagnosis — **the June collapse was NOT a site-wide penalty; it was the World Cup topic
cluster reaching end-of-life while nothing evergreen picked up the slack** (WC = 76% of
clicks). A penalty hits all topics + impressions + rankings together; ours didn't. Three
growth layers proposed, documented here as direction (not yet scoped into tasks):
- **Layer 1 — Evergreen depth:** chase **100 topic clusters Google considers "best-in-field,"
  not 10k shallow pages.** Do ONE topic all the way down (Animals → Flashcards → Poster →
  Worksheet → Quiz → Coloring) rather than 100 topics an inch deep. Candidates: Language,
  Flashcards, Merch Design, Printable, Poster, Education. *(Gap vs today: W1 is breadth-first
  internal linking; no explicit deep-cluster play yet.)*
- **Layer 2 — Trending, productized:** the WC muscle systematized — daily Twitter/YouTube/Reddit
  → "top-N hot things today" → Curify assets → Social+SEO. "Don't treat WC as an exception."
  *(Nascent: `hot_topics.json` + `viral_video_ideas_*.json` exist; not yet a repeatable engine.)*
- **Layer 3 — Living Content:** be *more* aggressive on programmatic SEO, but turn **"AI
  generation" into "AI maintenance"** — pages get daily updates / +examples / +images / +FAQ
  / +prompts / +video so Google reads them as maintained. *(Gap: we're generate-and-publish.)*
- **SEO Ops Dashboard (metric reframe):** stop watching daily clicks (laggy + WC-confounded);
  watch ① new-page **index rate** ② **impression growth** (leads clicks) ③ **topical authority**
  by cluster ④ **page aging** (90/180d → auto-regen). These are leading indicators — the
  answer to the opaque-algo + lag concern is to steer by faster signals we control.

**⭐ If we do only ONE SEO thing:** pick **ONE evergreen cluster and make Curify the objectively
best result in the world for it** — the full ladder, with original images + interactivity +
generation that pure-AI-blog competitors structurally can't match. Rationale tied to the
opaque/laggy-algo concern: "be genuinely the best page for this query" is the *only* strategy
robust to every algo update — you're not gaming a signal you can't see, you're building the
thing the algo is trying to find. Measure it by **impression growth on that one cluster**
(leading, un-confounded), not sitewide clicks. WC already proved Google *will* hand Curify
large traffic; the open question is only how many evergreen clusters can replicate that curve.

**Cluster scorecard (2026-07-05, 4-source analysis — supply / blog / tool / long-term GSC demand).**
Eight candidate clusters rated against real data (template+gallery supply in `nano_templates.json`
+ `nanobanana.json`; blog coverage in `blogs.json`; live tools in `lib/tools-registry.ts`; 8
chronological GSC exports 2026-05-13→06-26, window-normalized to impr/day). ●●●=strong ●●=mod
●=weak ○=none ◐=demo-only:

| Cluster | Supply | Blog | Tool | GSC demand (non-WC) | Tier |
|---|:--:|:--:|:--:|:--:|---|
| **MBTI & Character** | ●●● 44 tmpl + test | ●● 3 | ○ | ●●● rising 100→500/d, best CTR, multilingual | **T1 — the pick** |
| Infographics | ●●● 73% of lib | ●●● 8 | ○ | ●● ~300/d but ~1 click/d | *format substrate, not a cluster* |
| Travel posters & maps | ●●● 37 tmpl + 503 gallery | ● ~2 | ○ | ●● emerging ~30/d steady | T2 — deepen |
| Recipe & food cards | ●● 20 tmpl + 182 | ○ 0 | ○ | ●● emerging ~20/d steady | T2 — greenfield |
| Education / Flashcards | ●● 42 core | ●●● 9 | ○ | ● 5–20/d | T3 — content ahead of demand |
| Commerce & product poster | ●●● 24 tmpl / 954 gallery (23%) | ●●● 8 | ◐ 2 demo | ● ~10/d | T3 — POD/commercial track |
| Merch design | ●● 25 (built-ahead) | ●●● 9 | ○ | ○ **0 impressions** | T3 — POD, gate on signal |
| Social media assets | ●● 42 | ● incidental | ○ | ○ noise | fold into MBTI/Merch |
| *(off-list)* Voice/Video AI tools | — | ●●● 14 | ●●● live | ●●● durable ~400/d floor, weak CTR | defend (fix CTR) |

Reads: (1) **MBTI & Character is the one clear winner** — only cluster scoring on *every* demand
axis (rising GSC, best conversion, multilingual queries `naruto mbti`/`캐릭터 프롬프트`/`нарута мбти`,
deepest topic supply). Corrects the earlier Flashcards lean — Flashcards has supply+blogs but
5–20 impr/d (demand-from-zero). (2) **"Infographics" is the house format, not a cluster** (73% of
templates, ~88% of gallery layout) — treat as substrate + a CTR-rescue optimization, not a
best-in-field bet. (3) **Merch + Commerce are business bets, not SEO-demand bets** — Merch has 0
organic impressions, yet Commerce is the biggest gallery bucket (954, users *make* these) → belong
to the POD track (tool-conversion + trending + social), not the evergreen-SEO bet. (4) Most durable
non-WC evergreen is off-list — **Voice/Video AI tools** (~400 impr/d floor = the live backend; weak
CTR is the gap). WC = 87% of impressions at peak; the non-WC floor is ~1,200–1,400 impr/d.
> ⚠️ **Superseded 2026-08-07:** the non-WC floor is not a floor — it fell to **359 impr/day** by the
> 07-09→08-05 window (-79% in two months). See the 2026-08-07 state-of-play section at the top; the
> cluster *ranking* below still stands, the traffic baseline does not.

**First cluster = MBTI & Character.** The MBTI ladder absorbs two weaker clusters as lower rungs:
MBTI test → character MBTI charts → fandom/anime grids → character **sticker packs** (=Merch rung)
→ character **wallpapers** (=Social rung) → "which [franchise] character are you" quizzes. Build
scope in `docs/mbti-character-cluster-build-2026-07-05.md`.

**Growth-driver framing (2026-07-11).** Session-wide synthesis: growth = **traffic × conversion**,
with **two real drivers** (everything else is enabler or noise):
- **Driver 1 — capture proven evergreen demand** (top of funnel): best-in-field cluster *depth*
  (not breadth) + a productized trending engine. Evidence: WC proved Google will hand Curify
  traffic; 87% of pages invisible; MBTI demand is rising + multilingual.
- **Driver 2 — convert traffic into a generation** (middle of funnel): **the auth wall is the
  bottleneck** (100% of creation auth-gated, 0 anon) and **image gen only converts where a
  functional, ranking `/tools` surface exists**. Levers: **anon-generate-once** + a functional
  tool surface per cluster (lever #1 generalized). Image gen is already #2 & accelerating.
- **Amplifier — SMM** as demand-sensing + identity-matched distribution (not broadcast).
- **NOT drivers:** page-size/2MB fix (crawl enabler), breadth/thin pages, engagement features for
  the ~150-DAU base (already ~85-90% convert), DAU vanity (the "900" was bots — memory
  `project_why_no_image_gen` + the 2026-07-07 refined-DAU bot-filter fix).

MBTI is sequenced against both drivers (Phase 1 closes a full demand→conversion loop:
M1b hub + M4 tool + **anon-generate-once**, piloted on MBTI because it's preset/text-driven =
no `/images/upload` anon gate). Full phased plan in `docs/mbti-character-cluster-build-2026-07-05.md`
§ "Sequencing — mapped to the two growth drivers".

## 2. SMM — Social Media Marketing / autopost

> **Operating frame (2026-07-05): Account Positioning, not Content Strategy.** Full playbook:
> `docs/smm-account-positioning-playbook-2026-07-05.md` (from `raw/seo-drop-07-05/smm-discussion.txt`).
> Each account has an algo-assigned identity; posting off-identity ("Position Drift") tanks the
> account — proven by Jay's X account (400 impr → dead after AI-art posts relabeled it Tech→AI Art).
> The playbook's 账号定位表 (allow/ban per account) + named weekly Series (固定栏目) are the
> deliverables. Operational hook: **autopost must enforce per-account allow/ban** — Curify FB
> carousel broadcast is a pause candidate (FB limits pure-template/external-link posts).

**In scope:**
- Autopost pipeline in `curify-studio/curify_background/` (Twitter + FB; the
  hash-bucketed slots framework in `app/utils/autopost_utils.py`)
- Pinterest lead-discovery (memory `reference_pinterest_lead_discovery.md`)
- RedNote → WeChat funnel for CN factory leads (memory `feedback_cn_vertical_reply_channel.md`)

**Anchors:**
- `~/curify-studio/curify_background/app/utils/autopost_utils.py` — selection + posting core
- `~/curify-studio/curify_background/app/utils/facebook_client.py` — FB single-photo + carousel publish
- `~/curify-studio/gtm_tools/pinterest_lead_discovery_keywords.md` — Pinterest ICP keywords

**Shipped to main:**
- Themed-day rotation (Mon=MBTI → Sun=specialty cadence) — commit `93fdf60`, merged via PR #382
- Engagement-prompt captions (FB + Twitter) — commit `bb90daf`, merged via PR #384

**On `jwang/card-narration-refactor`, pending merge to main:**
- Carousel-batch generator v1 (bucket-then-group) — commit `0fc94ce`
- Carousel-batch generator v2 (global template-first selection) — commit `e721e82` (2026-06-26)
- v2 supersedes v1: the bucket-then-group strategy hit 0 carousels in practice because
  MD5 across 400 buckets spread popular families too wide (e.g. `template-vocabulary`'s
  168 items max-out at 2-in-bucket). v2 picks the template family GLOBALLY by slot+theme,
  slides a CAROUSEL_MAX-sized window per slot. Tested against the real corpus: 24/24
  simulated slots produce a carousel. Cap = 3-8 photos (memory `feedback_fb_carousel_size_cap.md`).
- ~~Once merged, expect 6 FB carousels/day replacing the current single-photo broadcast.~~

> ⚠️ **REVERSED 2026-08-04/05 — do not ship the carousel batcher.** The 89-follower diagnosis found
> FB photo carousels are the *proven-dead* format for this Page, so `3f71edb` **disabled FB
> carousels entirely** (dispatch no longer calls `pick_carousel_global`). The carousel-batch
> generator on `jwang/card-narration-refactor` is now dead code for FB — do not merge it as a
> growth ship. Current FB direction = single native posts + native video, CTA link in the first
> comment. See the 2026-08-07 state-of-play section and memory `project_fb_follower_growth`.

**Queued (not started):**
- Cadence cut: `autopost.yaml` cron 8/day → 1-2/day (an 8/day low-engagement firehose trains the
  algo down)
- Sinosphere infographic queue (the reach-authority identity per `feedback_smm_account_positioning`)
- Add the short-video library (curify-gallery `merch_IP`, `ecommerce_workflow`) to the autopost item
  pool — today only the 八仙 batch was scheduled, by hand
- Group-aware FB routing (use item `topics` to pick 5-10 relevant groups vs blanket cross-post)
- Spam-risk audit on cross-post volume

## 3. Growth Analytics

**In scope:**
- iDAU bot-filter / DAU
- Actions per Route rollups
- Session Engagement Funnel by landing route
- Search Queries (NORESULT / LOWRESULT rollups, query-level weight=1 per memory
  `feedback_search_event_weighting.md`)
- GSC pulls (weekly cadence per memory `feedback_gsc_weekly_review.md`)
- Video-user attribution
- Conversion-funnel + auth-wall analysis

**Anchors:**
- `~/curify-studio/curify_background/app/crud/admin.py` — the 7-query analytics
  module (memory `reference_growth_analytics.md`)
- `scripts/pull_gsc_performance.cjs` + `scripts/submit_indexing_api.cjs`
- `~/curify-studio/dev/jayw/admin_analysis/` — ad-hoc analysis scripts
  (funnel pulls, search-eval cycles, video-user attribution)

**Date-stamped findings docs (most recent first):**
- **GSC state-of-play + canonical-fold verification (2026-08-07)** — in the top section of this doc.
  Raw pulls: `raw/gsc-2026-08-07/w28` (28d), `pre_mbti` (07-12→07-23), `post_mbti` (07-25→08-05),
  produced by `node scripts/pull_gsc_performance.cjs --from=… --to=… --out=…`. URL-Inspection
  verification recipe in memory `project_mbti_names_ctr_bleed` (run from `curify-frontend` or set
  `NODE_PATH` to its `node_modules` — the SA JSON lives in curify-studio).
- **First paid user + near-converter analysis (2026-07-13)** — memory `project_first_paid_user`.
  First paying customer (user 1359) = a **Spanish-speaking football-sticker POD maker**: Google
  organic → landed directly on the `/nano-template/*/example/*` page for
  `template-football-star-chibi-sticker-set` → **generated die-cut stickers within seconds** (signup
  fired 3s prior — generate intent triggered the auth wall) → returned 3 days, 13 freeform gens (0
  failed) → exhausted free credits → **bought $5/50 credits** (Stripe top-up, stayed FREE). Validates
  the POD reframe (revenue), the **example-page SEO funnel** (the 17,650-page class whose canonical
  bug was just fixed — widening it feeds this), freeform **sticker/line-art** tooling, and
  football/WC as a *revenue* lane. **Near-converters:** funnel = 612 users → **196 activated** → **1
  paid (0.5%)**; **no POD/sticker/football lookalikes exist** (payer is the only one). Credit-
  exhaustion near-converters exist (generic gens, hobbyists, didn't pay). **Strategic read: the
  revenue bottleneck is COMMERCIAL INTENT, not activation** — lever = acquire more POD/merch-intent
  users via the sticker/merch SEO+WC funnel, not "convert more hobbyists." **Leaks:** search friction
  (9/12 of the payer's searches were LOW/NO-RESULT on football/merch/Spanish terms) + Spanish demand.
  Actions: email the customer for feedback; more football/club sticker+line-art templates (WC 2026
  live); fix football/merch/Spanish search.
- **Why few image-gen projects (2026-07-07)** — memory `project_why_no_image_gen`. Diagnosed
  "why aren't users generating images": premise partly outdated (image gen = #2 job type,
  accelerating Apr 4→Jun 24 users, 95% success — not broken/unwanted). Real cause is
  **surface+intent**: every backend `create` tool is video/audio, image `/tools/*` were
  demo-only, so image creators land on `/nano-template/*` (Google/SEO) while video creators
  land on `/tools/*`. `nano_freeform_generation`=0 is *unreached-not-broken* (buried on
  gallery-detail behind sign-in+10-credit); auth wall is universal (0 anon creation). **Lever
  #1 = give image gen rankable `/tools/*` surfaces** — step 1 shipped 2026-07-07
  (`ai-product-photo-generator` DEMO→real generate tool; commit `a90a9ab0`), tracked in
  `curify-studio/docs/{tool-inventory,workstream-tooling-and-engineering}.md`.
- `docs/use-case-chip-clicks-2026-07-03.md` — persona-chip click volume
  across the 4 target personas (Growth Agencies / Designers / DTC Brands /
  Merch Operators). 53 clicks / 30d total across all 10 personas; 0 on
  template pages; 3 on example pages. Chips are not a meaningful discovery
  path today; no product change taken pending impression instrumentation.
  Pull script at
  `~/curify-studio/dev/jayw/admin_analysis/use_case_chip_clicks_pull.py`
- `docs/video-user-attribution-2026-06-26.md` — channel + landing mix for
  208 video-project users; only ~15% attributable (2-month user_interactions
  retention vs 11-month project history); script at
  `~/curify-studio/dev/jayw/admin_analysis/video_user_attribution.py`
  (memory `reference_video_user_attribution.md`)
- `docs/conversion-funnel-auth-wall-2026-06-12.md` — auth-wall conversion audit
- `~/curify-studio/docs/dau-activation-analysis-2026-06-12.md` — DAU activation
- `~/curify-studio/docs/scaling-audit-2026-06-10.md` — infra scaling audit
- `~/curify-studio/docs/reengagement-2026-06-01.md` — reengagement analysis

**Indexing API operational notes:**
- 3-day API → UI lag vs 1-day GSC UI lag (memory `reference_gsc_api_access.md`)
- 1-3d SERP-position flux after a push (memory `feedback_indexing_api_reindex_flux.md`)
- Default-skip on new blogs — fire only on explicit request (memory `feedback_indexing_api_default_skip.md`)
- Submit all 10 locales (memory `feedback_indexing_api_all_locales.md`)

---

## POD / Merch Design strategic reframe — 2026-06-26

Workstream reframe per 2026-06-26 strategy discussion. **Curify recenters around
Merch Design + POD as the primary revenue surface.** This workstream's job under
the POD lens: turn the Tools-track output (mockups, designs, ad creatives) into
**measurable revenue** — for Curify (membership credits) and for the merchants
who use the platform.

The reframe collapses the three legs into one mental model:
*Curify is the **Merchant Growth Engine** — it produces the design, distributes
it, and proves the conversion.*

Companion deltas live in:
- `curify-frontend/docs/search-and-content.md` → demand-sensing + intent routing
- `curify-studio/docs/workstream-tooling-and-engineering.md` → POD design + mockup tooling
- `curify-frontend/docs/workstream-vertical-use-cases.md` → 4 high-margin POD niche packages

### Reframe in one paragraph

Today the SMM track is a *broadcast* loop (post Curify gallery + template
examples on Twitter+FB on a hash-bucketed cron). Under POD, SMM becomes a
*conversion* loop — the social post is the top of a funnel that goes
mockup → click → product detail → checkout. SEO shifts from "rank Curify pages"
to *also* "help Curify merchants rank on Etsy/Shopify/Amazon". Growth analytics
shifts from "DAU/session" to *also* "design conversion rate" — which Curify
design types actually sell?

### Work items (POD lens)

#### SMM track

| # | Title | Effort |
|---|---|---|
| POD-C1 | **One-click cross-platform distribution** — from a Curify mockup (POD-B4 output) → Pinterest / Instagram / TikTok Shop / FB Marketplace. Extend `autopost_utils.py` with a `merch_mockup` post type that carries product + price + checkout-URL metadata, plus per-platform copy variants. Lives under existing GALLERY_BUCKETS / NANO_INSPIRATION_BUCKETS pattern but new bucket | 1wk |
| POD-C2 | **Platform-trend feedback loop** — instrument click + save + repin rates by design *style* and *platform*. Surfaces "Pinterest converts 2.4× better on vintage-illustration than photoreal for sticker SKUs". Feeds back to the Tools workstream as new style-preset requests (POD-B3) and to the Search workstream as ranker weighting (POD-A1) | 3-5d |
| POD-C3 | **Themed-day rotation extended for POD** — current themed-day rotation (Mon-Sun cadence in `93fdf60`) is template-centric. Add a parallel POD rotation: e.g. *Sticker Sunday / Apparel Monday / Mug Tuesday* — each day pushes a curated batch from POD-B4 mockups with category-tuned hashtags | 2-3d |
| POD-C4 | **WeChat / RedNote outbound pack for CN factory leads** — productize the current ad-hoc "WeChat share pack" work item (W4 in `project_merch_imagery_backlog_2026_06_18.md`) into a script that takes a CN factory persona + product category → outputs a 5-8-image deck ready for WeChat paste. Reply channel is WeChat not email (memory `feedback_cn_vertical_reply_channel.md`) | 2-3d |

#### SEO track

| # | Title | Effort |
|---|---|---|
| POD-C5 | **Marketplace listing optimizer (Etsy / Shopify / Redbubble / Amazon Merch)** — net-new merchant-facing tool. Input: design + product category. Output: long-tail-keyword-optimized title, description, tag set ranking in each marketplace's internal search. Each marketplace has different ranking signals (Etsy weights tags heavily; Amazon weights title + bullets). Built as a `curify-frontend` route `/tools/listing-optimizer` + a `curify_background` pipeline | 1.5-2wk |
| POD-C6 | **Programmatic SEO: POD-niche topic hubs** — extend `programmatic-seo-topic-hubs.md` framework with a *POD-niche* page anatomy: `/pod-niches/[slug]` for queries like *"funny dachshund t-shirt designs"*, *"engineer sarcasm mug designs"*. Each page surfaces: trending designs (from POD-A2 daily drop) + the mockup tool (POD-B4) + a *"sell this on Etsy"* CTA into POD-C5 | 1wk Phase 0, 2-3wk to scale |
| POD-C7 | **Blog hub for POD operators** — new blog category `pod-operators` with persona-shaped posts (e.g. *"How to test 20 designs / week on Etsy without burning ad budget"*, *"Sticker SKU velocity wall: 20-design problem"* — see `reference_merch_operators_vertical.md` for Reddit demand mining). 3-5 P0 posts. Cross-links into POD-C5 + POD-C6 | 1wk for first 3, then weekly cadence |
| POD-C8 | **Curify ↔ merchant cross-link layer** — extend `interconnection.md` mapping tables with `pod-niche → tool/blog/use-case` mappings so the new POD-C6 pages aren't dead-ends. Mirrors the existing tier-1 topic ↔ use-case wiring | 2-3d after C6 |

#### Growth Analytics track

| # | Title | Effort |
|---|---|---|
| POD-C9 | **Design conversion-rate analytics** — extend `app/crud/admin.py` with a query bank: which design style → most mockup-clicks → most listing-optimizer runs → most outbound-share fires. Net new metric: "design conversion funnel" alongside the existing engagement funnel. Requires event-logging discipline in POD-B4/B6/C5 from day 1 | 1wk (3d for events, 2d for queries, 2d for admin panel rendering) |
| POD-C10 | **Niche-discovery weekly report** — automate the POD-A4 output as a weekly admin-only report: top 20 underserved POD niches surfaced from SEARCH_NORESULT + GSC zero-CTR + Pinterest search-volume + Reddit demand-mining. Drives blog cadence (POD-C7) and Tools roadmap (POD-B3 style presets) | 3-4d, then weekly cron |
| POD-C11 | **Merchant-side cohort analytics** — once a small POD-merchant userbase exists (post POD-C5 ship + first 50 merchant signups), instrument cohort retention + per-merchant SKU yield. Gates monetization decisions (membership pricing, credit cost) for the POD track | gated on POD-C5 + 50 merchant signups |

### Why this belongs as its own workstream (vs scattered across SEO + SMM + Analytics)

Under the pre-POD framing, SEO + SMM + Analytics were three loosely-coordinated
channels driving generic traffic to a generic platform. Under POD, the three
become **one funnel for one customer (the POD merchant)** — design produced by
Tools, distributed by SMM, ranked by SEO, measured by Analytics. Splitting them
across docs hides the funnel; unifying them here surfaces it.

### Sequencing recommendation

1. **POD-C9** events first (3d) — instrument before the new tools ship,
   otherwise we ship blind same as the recurring lesson from the existing
   mini-tools
2. **POD-C1 + POD-C3** next in parallel (SMM extensions, low-risk, reuse
   existing autopost machinery)
3. **POD-C5** (1.5-2wk) — the listing optimizer is the merchant-facing hero
   feature; gates POD-C6 / POD-C7 / POD-C11
4. **POD-C7** in parallel with C5 (blog content has independent value)
5. **POD-C6 + POD-C8** after C5 (programmatic SEO + cross-link layer)
6. **POD-C2 + POD-C4** as the social distribution machine matures
7. **POD-C10 + POD-C11** are the measurement loops — start C10 once C7 needs
   weekly content fuel; start C11 when there's a merchant cohort to measure

### Open questions

- Listing-optimizer (POD-C5) is the biggest single item. Should it ship as a
  one-shot generator (lowest-friction MVP) or as an Etsy/Shopify *integration*
  (higher-stickiness but slower to build)? MVP first, integrate based on
  conversion signal.
- POD-C6 programmatic pages risk duplicate content vs existing `/topics/` and
  the WC-style strategic-reframe expansion plans. Need an explicit canonical /
  taxonomy answer before scaling past Phase 0.
- Does POD-C11 require its own analytics database table (`pod_merchant_events`)
  or can it ride on the existing `user_interactions` schema with a discriminator?
  (Probably the latter — 2-month retention limit on `user_interactions` is the
  main risk per memory `reference_video_user_attribution.md`.)

---

## 2026-08-26 — sitemap-examples: locale A/B instead of a site-wide cut

**Reverted an over-aggressive cut and replaced it with a measured experiment.**
The 08-25 change took `sitemap-examples.xml` from 11,190 → 3,146 URLs (−72%) by
de-listing every locale variant without a 90d impression. That was the right
*hypothesis* (hreflang, not `<loc>`, is the discovery mechanism for alternates)
asserted as a *conclusion*. A site-wide cut also destroys the evidence: if
traffic later drops there is no way to tell "hreflang was sufficient" apart from
"we buried 7,319 URLs."

**Now:** 11,190 → **8,232** (−2,958, −26.4%), composed of
- 958 URLs dropped by the `noindex` gate (already-approved hygiene — these pages
  emit `noindex, follow` and canonical to their template, so advertising them
  contradicted their own meta),
- 1 by the thin-locale gate (effectively a no-op; kept as a guard), and
- **1,999 as the treatment arm of a live A/B.**

**Design.** Eligible pool = non-EN example URLs with **zero impressions in BOTH a
180d and a 28d window**, surviving the noindex/thin gates so the arms aren't
contaminated by URLs dropped for other reasons. Treatment (1,999) de-listed;
control (4,670) stays listed. Stratified by locale, so both arms carry the same
language mix at a consistent ~1:2.3 ratio. Assignment is a djb2 hash of the path,
not `Math.random` — rerunning reproduces the identical split, so the cohort is
rebuildable and auditable. Every URL starts at zero impressions, so **any** later
impression is attributable.

- Build: `scripts/build_example_sitemap_experiment.cjs` → `public/data/example_sitemap_experiment.json`
- Read out: `scripts/read_example_sitemap_experiment.cjs` (**due ~2026-09-23**)
- Primary metric: share of URLs per arm gaining ≥1 impression. Arms are unequal
  by design — **compare rates, never counts.**
- **Do not regenerate the cohort mid-flight.** It reshuffles arms and destroys
  the comparison.

**Gate A is cheaper than it looked.** The noindex gate drops 3,121 impressions /
68 clicks measured over 180d, which reads alarming — but only **72 impressions /
3 clicks** of that falls in the last 28d. The noindex rule shipped 2026-07-31, so
a 180d window straddles it and most of that traffic predates the rule. It is
already gone and the sitemap is not what's holding it.

**Two bugs caught by verifying against the rendered sitemap rather than a replica:**
1. **Invented locales.** The builder hardcoded a locale list including `ar` and
   `pt`. This site ships `tr` and `ru` and neither `ar` nor `pt` — so 1,922 of the
   assigned URLs *could not exist*. They'd have sat in both arms as permanent
   zeroes and guaranteed a null result no matter what the sitemap did. The
   builder now parses `i18n/routing.ts` and throws on an implausible parse.
   Confirmed by exact arithmetic: the phantom locales accounted for precisely the
   1,370 missing control URLs and 552 of 553 hreflang misses.
2. **An entry could vanish entirely.** A few examples have no `en` locale (e.g.
   `locales: {zh}`). If every locale they have lands in treatment, the filter
   empties and the example emits no `<url>` at all — which deletes its hreflang
   block too, since alternates live *inside* the entry. Treatment would then mean
   "removed from discovery entirely," breaking exactly what the experiment
   measures. Fixed in both layers: the route never lets `emitLocales` go empty,
   and the builder only treats examples that also emit a bare-EN entry.

Verified on the dev-rendered XML: treatment 0/1,999 listed, control 4,670/4,670
listed, treatment 1,999/1,999 still hreflang-reachable, `<url>` count == `<loc>`
count (8,232).

---

## 2026-08-27 — A1/B1 readout + 30/60-day checkpoints

Both posts published **2026-08-18**. Both are **indexed** — A1 crawled 08-19, one day
after publish. Against the rest of this workstream (tool pages from 08-06 still not
indexed, `/topics/stickers` never crawled) **the blog surface is by far the fastest
route into the index**, which should drive sequencing decisions elsewhere.

| post | 28d impr | clicks | named queries |
|---|---|---|---|
| `/blog/best-claude-code-design-skills` | 25 | 0 | 5 (1 impression each) |
| `/blog/character-turnaround-sheet-guide` | 1 | 0 | 0 |

**Do not touch the SERP copy — the sample cannot support any conclusion.** Expected
clicks at benchmark CTR for the observed positions is **0.18**, and
**P(0 clicks | benchmark CTR holds) = 82.8%**. Zero is the single most likely outcome.
It takes ~59 impressions at pos ~6 before a zero is significant at p<.05; we have 5
named. The "pos 6 / pos 4" figures are each derived from a SINGLE impression — one
appearance, not a ranking. A1's title/description/H1 were checked and are strong and
correctly served by `[slug]` (no dedicated-route metadata trap). Changing copy now
would only reset what little signal exists.

Note GSC page-level (25) and query-level (5) totals disagree because rare queries are
anonymized. Use page-level for volume, query-level for diagnosis — never mix them.

### CHECKPOINT 2026-09-17 (30d)
Re-pull both posts. Expect A1 to clear ~59 impressions; only then is a CTR read valid.
If impressions are still <30, the constraint is demand or depth, NOT the SERP — go get
external volume data rather than rewriting titles. `raw/seo-kd-08-10/` is a screenshot,
not a dataset; this needs a real SEMrush pull.

### CHECKPOINT 2026-10-17 (60d)
Decide A4/A5 on evidence. A5 (`codex skills`, 1,900/mo, KD 47) is the volume prize and
today we have **zero impressions on any codex term** despite A1's description naming
Codex — consistent with the spec's ladder (19 → 27 → 36 → 47), which defers A5 until
A1–A4 build authority. If A1 has not cleared ~100 impressions by 60d, do not attempt
A5; the ladder has not been earned.

---

## 2026-08-27 — fashion KD (SEMrush) and what it rules out

Source: `raw/fashion-seo-08-27/` (SEMrush bulk keyword analysis, 19 terms).
**Recorded here because the screenshot is the only copy** — `raw/seo-kd-08-10/` is
also just a screenshot, and that is why the "is there demand for codex terms"
question could not be answered from local data on 08-26.

| keyword | intent | volume | KD | CPC | our asset |
|---|---|---|---|---|---|
| dress for body type | I | 550,000 | 39 | $0.60 | fashion-shape-guide-infographic (indexed, pos 6.9) |
| seasonal color analysis | I | 5,400 | 35 | $0.87 | hairstyle-color-recommendation (FOLDED) |
| personal color analysis | I | 3,600 | 38 | $0.91 | same (FOLDED) |
| ai outfit generator | I | 1,300 | 30 | $1.08 | — |
| **hairstyle for face shape** | I | **1,000** | **23** | $0.64 | **hairstyle-guide-infographic (indexed)** |
| **haircut for face shape** | I | **880** | **25** | $0.64 | **same** |
| ai try on clothes | I | 390 | 35 | $1.15 | chinese-costume-tryon (indexed, 0 impr) |
| how to dress for your body shape | I | 390 | 35 | $1.12 | fashion-shape-guide-infographic |
| **best hairstyle for my face shape** | C | **320** | **24** | $0.72 | **hairstyle-guide-infographic** |
| what colors suit me | I | 320 | 30 | $0.49 | — |
| what to wear for your body type | I | 70 | 33 | $1.15 | fashion-shape-guide-infographic |
| virtual try on ai | I | 50 | 35 | $1.04 | — |
| body shape style guide | — | 20 | n/a | $0.98 | — |

**Only three terms are green, and they are one cluster: face-shape hairstyle
(KD 23-25, ~2,200/mo combined).** Everything else is KD 30-39 — precisely the band
`blog-quality.md` records us as "pos 40+ or absent on ALL" head terms, with the
root cause logged as a domain-authority gap, not content. So the rest of this list
is not a content problem and should not be attacked with more pages.

**Do not read `dress for body type` as a win.** 550,000/mo at KD 39 with us at
pos 6.9 is not credible on its face, and the position rests on **10 impressions
over 180 days**. A position averaged over 10 impressions is one appearance, not a
ranking — the same error made with A1's "pos 6" (1 impression). Treat the volume
figure as suspect too: it is ~100x its nearest neighbours in the same list.

**Actions taken.** Retitled `template-hairstyle-guide-infographic` — already
indexed and self-canonical, but titled "Hairstyle Guide Infographic Generator"
with the target phrase only in the description. Now
"Hairstyle for Face Shape — AI Haircut Guide" (exact head term, front-loaded,
59 chars incl. suffix), description leading with "best hairstyle for your face
shape" to also cover the KD 24 variant. 10 locales. Scoped recrawl via
`FASHION_RECRAWL_TEMPLATE_IDS` — one template, not a group bump.

**Deprioritised with reason:** the colour-analysis cluster (KD 35-38) has the
volume but its asset `hairstyle-color-recommendation` is **folded to the homepage
canonical**, so it would need both an un-fold and authority we do not have.
General virtual try-on (KD 35) is retail-giant territory and our try-on tool is
Chinese-costume-specific — a page-type/intent mismatch.

### `/blog/50-ai-makeover-prompts` — folded, now linked

Confirmed folded (`Duplicate without user-selected canonical`, googleCanonical=`/`).
**The recorded root cause did not hold.** `project_blog_canonical_fold` attributes
folds to the 1.6MB i18n catalog making pages near-identical — but measured, the
folded page is the *healthiest* of the three: 88.7% script boilerplate and 15,858
visible chars, versus 93.0%/10,592 and 93.6%/8,404 for two blogs that ARE indexed.
Markup is clean too: distinct 107-char title, matching h1, correct self-canonical,
served by `[slug]`.

What it actually had was **one inbound internal link** — the `/blog` index — and
zero blogs referencing it. Added it to the `relatedLinks` of three verified-indexed
siblings (`ai-makeover-templates`, `style-transfer-ai-guide`,
`chinese-costume-history-infographic`), taking it to 4 sources, per the ≥3-crawled-
sources rule in `project_new_page_crawl_collapse`. Its 107-char title also truncates
at ~60 in SERP; left alone for now since the fold is the binding constraint.

**Trap worth remembering:** `RelatedBlogs` slices `relatedLinks` to **3**
(`maxRelated = 3`). Appending to a list that already had 3+ entries renders
NOTHING — the first attempt here silently added zero links to two of the three
donors, and looked correct in the JSON. Verified against the rendered page, not
the data. Fixed by moving the target to position 1, which displaces
`ip-merch-design-ai-workflow` and `image-generation-model-comparison` from those
two pages' visible related lists.

**This is a bet, not a fix.** Request Indexing does not override duplicate
detection, and links are the only lever with evidence behind them here.

---

## Related docs / threads
- `docs/search-and-content.md` — Search & Content workstream (companion A)
- `~/curify-studio/docs/workstream-tooling-and-engineering.md` — Tools workstream (companion B)
- `docs/workstream-vertical-use-cases.md` — Vertical Use Cases workstream (companion D)
- `docs/programmatic-seo-topic-hubs.md` — SEO programmatic framework
- `docs/interconnection.md` — cross-link layer
- `docs/blog-quality.md` — blog editorial track
- `~/curify-studio/curify_background/app/crud/admin.py` — growth analytics queries
- `~/curify-studio/curify_background/app/utils/autopost_utils.py` — SMM autopost
- `~/curify-studio/gtm_tools/pinterest_lead_discovery_keywords.md` — Pinterest playbook
