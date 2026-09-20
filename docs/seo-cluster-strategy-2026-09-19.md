# SEO cluster strategy — 2026-09-19

_Triggered by a FixThePhoto teardown dropped into `raw/seo-retouching-09-19/discussion.txt`, and
by pulling the image-SEO readout three days ahead of its 09-22 checkpoint. Owner: jay._

**Sources.** `raw/curify-ai.com-Performance-on-Search-2026-09-16/` (web, 2026-08-19 → 09-15),
live `type:"image"` GSC pulls run today for 2026-08-02 → 08-29 and 2026-08-31 → 09-17,
URL Inspection over 9 URLs, and live SERP inspection of `fashion design template` and
`dress template`.

⚠️ `raw/curify-ai.com-Performance-on-Search-2026-08-17/` is a **one-day** export (10 clicks, 399
impressions, a single Chart row). It is not a usable prior window. Use
`raw/gsc-cluster-audit-2026-08-31/` (28d, 08-02 → 08-29), which overlaps the current window by
11 days — read direction, not multiples.

---

## Headline: this audit cancelled more work than it created

Four P0 items were planned. **Three resolved to verdicts rather than code**, and two of those were
planned against source-of-truth claims that live verification falsified. The one item that
produced a decision closed a cluster rather than opening one.

That is the intended function of the verification rules, and it is worth stating plainly rather
than quietly deleting the tickets.

---

## 1. The image ship: discovery worked, ranking did not

`08092e73` (image sitemaps) + `a21cd21b` (topic-page alt), read PRE 08-02→08-29 vs POST
08-31→09-17. Windows are unequal, so everything is **per-day**.

| | PRE | POST | |
|---|---:|---:|---|
| impressions/day | 680 | 2,678 | +294% |
| clicks/day | 1.4 | 5.1 | +264% |
| **position** | **41.2** | **40.2** | **−1.0, noise** |
| **CTR** | **0.205%** | **0.191%** | **down** |
| URLs earning impressions | 770 | 1,333 | +73% |
| distinct queries | 1,921 | 4,040 | +110% |

`project_image_search_surface` pre-registered the criterion: *"Judge it on position and CTR, not
raw impressions."* **On its own criterion this is a negative.** We serve four times the images, to
twice the queries, on nearly twice the URLs — at the same position and the same CTR. A sitemap
buys discovery. It does not buy ranking, and nothing here suggests more of it would.

⚠️ **Confounded.** Web grew over the same window (455 → 1,090 impressions/day, position 19.5 →
11.3). Image grew about 2× faster than web, which is suggestive of a real effect on *coverage* but
is not clean attribution.

⚠️ **The designated indicator went backwards.** `nail art designs`: 23 impr at pos 11.7 → 40 impr
at pos **21.8**, still zero clicks. The larger variant `nails art design` carries 362 impressions
at pos 24.4, also zero. The whole nail/beauty cluster is **0 clicks across both windows** on
1,470 impressions.

**Consequence: the image sitemap / alt-text lever is spent. Do not queue more of it.**

### Image demand by cluster

| cluster | impr/day PRE → POST | clicks | CTR | pos PRE → POST |
|---|---:|---:|---:|---:|
| mbti | 83 → 235 | 6 | 0.142% | 36.6 → 42.2 |
| **fashion/apparel** | **5 → 91** | 5 | **0.305%** | **43.5 → 25.9** |
| soccer/WC | 38 → 91 | 0 | 0.000% | 54.6 → 52.0 |
| nail/beauty | 9 → 67 | 0 | 0.000% | 69.5 → 43.3 |
| anime/IP | 12 → 64 | 2 | 0.173% | 77.9 → 71.0 |
| education | 3 → 11 | 0 | 0.000% | 66.5 → 50.4 |
| product/ecommerce | 3 → 7 | 1 | 0.746% | 49.0 → 51.6 |

**MBTI dominates image search exactly as it dominates web, at the same ~0% CTR.** That is a second
independent surface agreeing with the 09-16 web verdict. No further action on MBTI, on either
surface.

**Sizing note that should govern all image work:** the image surface ran 45,534 impressions → 87
clicks in 18 days, against web's 18,528 → 672. Image is **2.5× the impressions and 13% of the
clicks** — roughly **1/29th the value per impression**. Image is a discovery and brand surface,
not a traffic surface.

---

## 2. The fashion-template cluster — CLOSED, and it is a format failure, not an authority gap

Fashion was the only cluster whose position materially improved (43.5 → 25.9), the only one with a
respectable CTR (0.305%), and the fastest-growing (18× per day).
`/nano-template/fashion-inspired-gown-design-sheet` went 541 impr / 0 clicks / pos 44.4 →
**3,317 impr / 10 clicks / pos 30.1** and is now the site's #1 image page.

The query set looked like a gift — eight terms at **pos 4–14 with zero clicks between them**:

| impr | pos | query |
|---:|---:|---|
| 178 | **4.6** | fashion design template |
| 114 | 11.8 | dress template |
| 72 | 13.2 | fashion drawing template |
| 55 | 13.5 | dress design template |
| 42 | 14.2 | fashion illustration template |
| 26 | 12.0 | template for fashion design |
| 25 | 11.6 | outfit design template |
| 14 | **6.1** | fashion dress template |

And the surface split is extreme. Same vocabulary, same 18 days:

| | queries | impressions | clicks |
|---|---:|---:|---:|
| image | 236 | **1,675** | 5 |
| web | 4 | **6** | 0 |

**279:1.** A web-only read calls this cluster dead; the image read calls it the best thing we have.
Per `project_serp_format_match`, the tiebreaker is the SERP, so both SERPs were inspected live.

### What page 1 actually is

**`fashion design template`** — four sponsored results above the fold (START by WGSN, LOOK AI,
Scribd, Futuriza Studio), then a **ten-image pack**, then only **four organic results**, then a
second sponsored block:

| # | result | shape |
|---|---|---|
| 1 | Canva — *Free fashion business design collection* | template library |
| 2 | Pinterest — *540 Best Fashion templates ideas in 2026* | board |
| 3 | Adobe Stock — *"Fashion Template" Images – Browse 33,679…* | stock asset search |
| 4 | Figma — *Free Fashion Website Templates to Edit & Download* | community files |

**`dress template`** — the same shape: Adobe Stock (*856,945 results*), Pinterest (Garment Sewing
board), Magnific (*Dress template Vectors – Download Free*), Mood Sewciety (*100+ Free Dress
Sewing Patterns*), CapCut (*Clothing Template*).

### The verdict, and why it is not fixable with better copy

1. **The artifact wanted is a production INPUT; we ship a production OUTPUT.** The image pack is
   blank **croquis** — figure outlines a designer sketches on. Pinterest's own snippet reads
   *"male croquis, model figure template, design figure template."* The `dress template` intent
   splits between **sewing patterns** and **downloadable vectors**. Our page emits a *finished AI
   gown design sheet*. We rank in the image grid because our sketches visually resemble a croquis,
   not because we answer the query.
2. **The winning page type is a downloadable asset library** — Canva, Adobe Stock, Figma Community,
   Pinterest, Magnific. Matching that shape means hosting an asset library, not adding copy to a
   generator page. This is the documented failure mode: ranking with the wrong page type converts
   at zero, and an in-page CTA cannot fix it because the decision happens on the SERP.
3. **Authority gap on top of format gap** — the incumbents are Canva, Adobe, Figma and Pinterest.

**Closed. Do not pull KD on this cluster**; KD would have said "go" and it would have been the
fourth KD-only failure. The zero clicks at position 4.6 are now explained rather than mysterious.

### ⭐ The one thing worth carrying forward

The ads on that SERP are not selling templates. **Futuriza Studio is bidding on
*"Flatlay AI Fashion Visuals · on-model photos · upload your Garment reference"*** and LOOK AI on
*"Turn Clothes into Model Shots · Flat Sketch Tool."* That is **the capability we already built** —
the flatlay → on-model lookbook pipeline and the 夏可 lookbook client work. The market is real and
being paid for; it is simply attached to a different query set than the one we accidentally rank
for. **That query set has never had KD pulled.** It is the strongest lead this audit produced, and
it belongs to the apparel/ecommerce lane, not to "fashion templates."

---

## 3. Two planned P0 items were falsified by live verification

Both were planned from claims in `workstream-seo-smm-growth.md` that were true when written and
have since been superseded — by commits made **the same day**.

### 3a. `portrait photo editing` does not need a spoke page. It is already the title.

The 09-15 entry lists `portrait photo editing` (110/mo, **KD 11**, $3.53 — the easiest term in the
whole pull) as *"⚠️ none — spoke not built"*, and a separate correction states that
`portrait photo retouching` *"appears nowhere on the page."* A `/tools/portrait-photo-editing`
build was scoped against those rows.

Curled live today:

```
<title>  Wedding & Portrait Photo Editing — Free, No Sign-In | Curify Studio
<h1>     Wedding & portrait photo editing
<meta>   Free wedding and portrait photo editing. Flyaways, skin, eyes and garment creases…
```

The exact phrase `portrait photo editing` appears **19 times** in the rendered HTML;
`portrait photo retouching` appears **4 times**. Commit **`f03cdc68` (09-15 20:08)** —
*"put both target terms in the title, and correct two rows I got wrong"* — did this, for exactly
the reason the spoke was proposed: *"portrait photo editing is 110/mo at KD 11, the easiest term in
the whole pull."*

**A second slug would have been a near-duplicate on the same `photo_retouch` pipeline, competing
with a page that already carries the term in its title.** That is the pattern this repo has
refused before — `sticker-factory-export` was 301'd onto `die-cut-sticker-file`, and a second
`asl-translator` slug was rejected outright because *"a near-identical second slug would split that
signal."* We are watching that exact pathology play out in ASL right now (§4).

**There is no data yet.** `/tools/wedding-photo-editing` has **zero rows** in the 09-16 Pages.csv
because it shipped on 09-15, the last day of the window. The term is targeted; whether it ranks is
a 10-27 question. **Nothing to build.**

### 3b. `/use-cases/for-photographers` is not missing links. Its linkers are stale.

Recorded 09-16 as *"URL is unknown to Google — never crawled… needs a link from an indexed page."*
Today it inspects as **"Discovered – currently not indexed"** — one step further along — and it
appears in `sitemap.xml` 20 times.

It already has **five inbound links, four of them from pages verified indexed today**:

| source | coverage | last crawl |
|---|---|---|
| `/tools/wedding-photo-editing` | Submitted and indexed | 2026-09-15 |
| `/use-cases/for-creators` | Submitted and indexed | 2026-07-12 |
| `/use-cases/for-designers` | Submitted and indexed | 2026-09-10 |
| `/use-cases/for-marketers` | Submitted and indexed | 2026-09-10 |
| `/use-cases/for-dtc-brands` | _not inspected_ | — |

**Every one of the four inspected crawls predates the link.** The persona page shipped 09-15 and the reverse
`USE_CASES[].toolSlugs` edge shipped **09-16** (`256e3bb4`). So the ≥3-links precondition is
already satisfied in the markup and **invisible to Google**, because no linking page has been
recrawled since the links appeared.

⚠️ Note what this does to the rule itself. The ≥3-indexed-links precondition is stated as a
property of the *target*, but it is actually a property of the *linking pages' crawl dates*. A page
can satisfy it perfectly and still never be crawled. **Adding a sixth link would have changed
nothing.**

Home and `/tools` do not link it, by design — `hiddenFromChips: true` keeps a B2B named-account
surface out of the consumer chip row (`UseCaseChipsRow.tsx:76`; note it does **not** gate
`getPersonasForTool`). The tension is real: hidden from chips means few linkers, and few linkers
means a slow crawl.

**Action is an operator recrawl request, not code.**

---

## 4. Correction: the ASL position→CTR premise does not survive its own test

An earlier framing of the ASL work was *"consolidate, improve position, CTR follows."* Tested on
the 40 ASL queries in this window:

| slice | clicks / impressions | CTR | wtd pos |
|---|---|---:|---:|
| generic queries at pos <9 | 7 / 97 | **7.2%** | 7.3 |
| generic queries at pos ≥9 | 49 / 517 | **9.5%** | 13.0 |

Position is **not** driving CTR in the range we occupy. The "free" slice converts at 26.9% but
sits at position 3.8, so word and position are confounded and n=4. The honest statement is that
**this data cannot support position→click arithmetic in this cluster** — not that the relationship
is inverted. Any ASL lift estimate built on a CTR curve should be discarded.

What is not in doubt: **ASL is 359 of 786 clicks (46% of the site)**, it is a cluster of 15+
variants at pos 4–14, and the blog still cannibalizes the tool on the head term —
`asl video translator` splits 321 impressions between `/tools/asl-video-translator` (251 impr,
33 clicks, pos 13.9) and `/blog/asl-video-translator` (70 impr, **1 click**, pos 38.8). The
Spanish side is worse: `traductor de lenguaje de señas en video` splits **136 impressions across
seven `#anchor` fragments of one blog post for zero clicks.**

The consolidation links shipped **09-16, three days ago**. **Read them at the next pull; do not
ship on top of an unread experiment** — that is precisely how the 09-09 fold verdict went wrong.

---

## 5. Photo editing / retouching — cluster state, and the SERP says the authority bar is LOW

_Added 2026-09-20, answering the FixThePhoto teardown directly._

### 5a. What exists

| surface | index state |
|---|---|
| `/tools/wedding-photo-editing` — `action: photo_retouch`, anonymous, no sign-in, no credits | **indexed 09-15** |
| `/blog/wedding-photo-retouching-cost` | **indexed 09-15** |
| `/nano-template/studio-digital-backdrop-scene` — the locked-subject background rebuild | indexed 09-09 |
| `/blog/50-ai-makeover-prompts` | indexed 09-10 |
| `/topics/portrait` | indexed 06-19 |
| `/use-cases/for-photographers` | ⛔ **Discovered – never crawled** |
| `/nano-template/portrait-retouching-blueprint` | ⛔ **folded to `/`** on a **2026-07-08** crawl |

Plus three more templates (`fashion-before-after-outfit-annotation-card`,
`figure-to-abstract-portrait-series`, `home-organization-before-after`) and three adjacent tools
(`ai-product-photo-generator`, `ecommerce-photo`, `style-transfer`).

**2 of 7 pages are broken, and neither needs a new page to fix.** Backend is
`POST /photo-retouch/generate`; ⚠️ `retouch_pipeline.py:326` raises `NO_FACE`, and the endpoint
takes exactly **one `File`** — no batch, no gallery, no LUT match.

### 5b. ⚠️ Correction: the "retouch cluster is the best CTR after ASL" claim was a regex artifact

An earlier cut of this workstream reported the cluster at 10 clicks / 4.63% CTR / pos 10.5. That
was wrong. `portrait` matched `cristiano ronaldo portugal 2026 portrait` (277 image impressions,
World Cup) and `skin` matched `night skincare routine` (~90). **The clicks belonged to AI-makeover
and portrait-*generation* pages, not to retouching.**

**Real cluster demand, 28d to 2026-09-17, web: 7 queries / 11 impressions / 0 clicks** — and they
are not demand: `ai video restoration online`, the quoted `"ai retouching"` and
`"aftershoot" "culling"` (competitor research, plausibly ours), a literal prompt-injection string
at position 2.0, `ai bio makeover`, `prompt makeovers`.

| page | impr | clicks | pos |
|---|---:|---:|---:|
| `/tools/wedding-photo-editing` | **6** | 0 | **5.7** |
| `/blog/wedding-photo-retouching-cost` | 18 | 0 | 11.1 |

**Both shipped 09-15; the window ends 09-17 — three days in-window.** Six impressions over three
days is a ~60/month run-rate at position 5.7. Too early to call either way.
**Anyone re-running this must filter by PAGE, not by a query regex.**

### 5c. ⭐ The SERP verdict: the authority bar on service-intent terms is low

This is the finding that changes the roadmap, and it is the opposite of the fashion result.

**`wedding photo editing` (390/mo, KD 19)** — a genuinely mixed SERP. Ads from all-in-one AI photo
editors and Bazaart; organic holds an Imagen listicle, a **Google Play app**, Pinterest,
**ON1's tool landing page** (`on1.com/wedding-photo-editor`), a photographer's workflow blog
(Miranda Gates), **and `amyellisphotography.com/editing-page` — "Private Wedding Photo Editor," a
solo freelancer's service page.** Image and video packs both present.

**`outsource wedding photo editing` (90/mo, KD 7)** — dominated end to end by **small independent
editing services**: Katie Rivera Private Photo Editor, Photosmoothie, SunTec India, DIGI-TEXX,
kasaneedits.com.

**A solo photographer's editing page ranks page 1 on a 390/mo term.** That is a completely
different competitive picture from the two SERPs that closed clusters this week:

| query | page 1 is | verdict |
|---|---|---|
| `fashion design template` | Canva · Adobe Stock · Figma · Pinterest | **closed** — asset libraries, wrong artifact |
| `portrait photo editing` | Canva · Google Photos · Fotor · Photoroom | free-editor SERP, entrenched |
| **`wedding photo editing`** | **ON1 · solo freelancers · listicles · Pinterest** | **winnable** |
| **`outsource wedding photo editing`** | **small independent editing services** | **winnable** |

**So the constraint here is not authority — it is that our service page has never been crawled.**
`/use-cases/for-photographers` is the correct page type for the KD-7 outsource intent, and it is
invisible. That reframes the whole FixThePhoto question below.

### 5d. What the FixThePhoto comparison actually licenses

| | FixThePhoto | Curify |
|---|---:|---:|
| organic keywords | 286,700 | — |
| organic traffic | ~344,000 | ~938 clicks/28d **site-wide, all clusters** |
| referring domains | **27,800** | small; the 07-29 audit analysed 68, of which 58 were a PBN |
| articles | **19,000+** | 108 |
| operating since | **2003** | — |

**Their 344K does not come from retouching terms** — `shutterfly` 1.5M, `walmart photo` 301K,
`premiere pro tutorial` 673K, `webcam toy` 49.5K. The service pages sit on twenty years of
unrelated photography media. Copying that is the 19,000-article play, and rejecting it was right.

What survives is their **layer-2 job pages** — pages named for the job the trade names. And §5c
says we do not need their authority to win the service-intent terms anyway.

**⭐ The better precedent is internal.** ASL went **28 → 540 clicks in one window** on this same
domain with this same authority, and nobody has explained why. That is worth more than further
FixThePhoto analysis.

### 5e. The 10-27 gate, pre-registered

Measured on `/tools/wedding-photo-editing`, 28d, web:

| | criterion | consequence |
|---|---|---|
| **PASS** | ≥150 impressions **and** position <15 on `wedding photo editing` | job-page layer opens |
| **MARGINAL** | 50–150 impressions | extend one window, do not build |
| **FAIL** | <50 impressions after six weeks indexed | ⚠️ given §5c, a FAIL is **not** an authority verdict — re-check crawl state first |

Grade at T+14 minimum.

**Copy rules if the layer opens** — write **"editing"**, never "retouching" (69 of 104 buyer posts
say "edit", exactly one says "retouch"), and never **"AI-powered"** (*"I don't want to use any AI
editors"* is a direct quote). Lead with the constraint: *nothing moves but what you asked for.*

## Open

- **Verify the `/blog/ghost-mannequin-ai-guide` recrawl landed** (operator requested 2026-09-19).
  Check `lastCrawl` at ~09-26 with `scripts/_foldscan.cjs`; if still pre-09-01 by **10-06**, fall
  back to Validate Fix while there is latency budget before the **10-13** low-KD readout.
- **Validate Fix on the carousel 404 cohort** — 346 of 539, 15/16 sampled already 308 → 200.
- ✅ **`/use-cases/for-photographers` submitted to GSC for crawling 2026-09-20 (operator).**
  Links exist (five, four from pages verified indexed) but every inspected linker crawl predated
  the link. **Verify at ~09-27** with `scripts/_foldscan.cjs` — the state to look for is
  `Discovered – currently not indexed` → `Submitted and indexed`. Per §5c this page is the
  correct page type for the KD-7 `outsource wedding photo editing` intent, on a SERP held by
  solo freelancers, so getting it crawled is the single highest-value unblock in the cluster.
- **Validate Fix on `/nano-template/portrait-retouching-blueprint`** — folded to `/` on a
  **2026-07-08** crawl, i.e. pre-dating the 09-01 canonical fix. It is the only retouching URL
  that ranks (pos 2.3) and it cannot rank as itself. Last remaining Phase-0 item.
- **Pull KD on the on-model / flatlay query set** that Futuriza and LOOK AI are bidding on. This is
  §2's forward pointer and the only new lead this audit produced.
- **Real-estate editing stays gated on the capability probe.** `retouch_pipeline.py:326` raises
  `NO_FACE` on an empty room. Stage one room against BoxBrownie's $30 output and decide from the
  pixels before any page is scoped.
- **ASL consolidation read** at the next pull.
- Unchanged: blog titles and `sitemap-examples.xml` frozen to **09-23**; RSC-payload topic filter
  held to **10-03**.

## Not doing, with the reason

| | why |
|---|---|
| More image sitemap / alt work | Moved coverage, not position or CTR. Lever spent. |
| Fashion-template pages | Format mismatch (§2). Closed before KD was pulled, deliberately. |
| `/tools/portrait-photo-editing` | The term is already the live `<title>` (§3a). |
| More links to `/use-cases/for-photographers` | Five exist; the blocker is recrawl (§3b). |
| Anything MBTI | Zero-click on **both** web and image. Two fixes already failed. |
| Anything education | 22 of 22 target terms at zero with pages indexed and ranking. |
| `/tools/video-dubbing` recovery | 864 impressions at pos 72.1 on a KD-72 term. Wrong fight. |
| IP exposure (Shin-chan / Straits Times) | Reviewed by the operator 2026-09-19 and accepted as-is. |

## Cross-refs

- [`workstream-seo-smm-growth.md`](workstream-seo-smm-growth.md) — §2026-09-15 (retouching KD),
  §2026-09-16 (five readouts), §2026-09-17 (the 539 404s)
- [`education-cluster-audit-2026-09-16.md`](education-cluster-audit-2026-09-16.md) — the cluster-verdict format this follows
- `raw/seo-retouching-09-19/discussion.txt` — the FixThePhoto teardown that triggered this
- `~/curify-gtm/docs/reddit-demand-mining-retouching-2026-09-15.md` — buyer vocabulary and the real-estate promotion
- `~/curify-studio/docs/photo-retouching.md` — capability state and the `NO_FACE` constraint
