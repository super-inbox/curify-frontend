# Visual Search Eval + External Signals — Curify vs Pinterest / Bing / Google / Canva
### (a.k.a. External Signals for Visual Search Evaluation)

**Date filed:** 2026-06-14  ·  **Extended 2026-06-27** with Baobao's discovery+crawling track, a Relevance-Labeling bootstrap plan (we have none today), and a Hybrid-Google-results section.
**Owner:** **Baobao** (UIUC CS Master).
**Status:** Strategic framing — pilot scoped, full execution post-WC. Documents the *what & why* so a future implementation pass has the rationale already settled.

---

## TL;DR

**Don't try to replicate Pinterest.**

For Curify, what matters is *evaluating whether Pinterest is even the right benchmark* — not crawling Pinterest's index. Build a 100-query, 5-surface, 3-dimension manual-scored eval first; let it tell us where Curify already wins, and treat Pinterest as a **demand-discovery signal**, not a destination to copy.

---

## The wrong question

> "How do we get Pinterest data for our search eval?"

This frames Pinterest as the gold standard we're trying to match. It anchors on Pinterest's strengths (vast human-curated inventory) and ignores Curify's: actionability (copy / remix / generate).

## Why Pinterest replication doesn't work anyway

### Pinterest's API surface (current state)
- **Search API** — essentially closed to the public
- **Content Discovery API** — heavily rate-limited, narrow scope
- The pattern we'd want — `query → top 100 pins` — is not supported

### Alternative methods (compared)

| Method | What it gives | Cost | Problem |
|---|---|---|---|
| `site:pinterest.com <query>` via Google | A handful of Pinterest pages per query | Free | Sparse; SERP-biased; doesn't reflect what Pinterest's own search returns |
| SERP scraping (commercial tools) | Image-results breakdown across Pinterest / Etsy / Canva | $$ | Tells us which sites dominate Google Images, not what Pinterest itself surfaces |
| Playwright against pinterest.com | Real top-20 per query | Engineering + ban risk | Pinterest has aggressive bot-detection — captcha, rate-limit, IP block. Doesn't scale, and gets fragile fast |

### Verdict

For a few dozen queries, **manual screenshot** of Pinterest's own search page is more honest and cheaper than any of these.

---

## The right question

> "What is a good visual search result *for our user*?"

Curify, Pinterest, Bing, and Canva are not the same product:

| Surface | What it's actually for |
|---|---|
| **Curify** | Relevance + diversity + **actionability** (copy / remix / generate) |
| **Pinterest** | Inspiration breadth — *human-curated visual demand* |
| **Bing / Google Images** | Coverage of the open web — finding any image that exists |
| **Canva** | Editable templates — adjacent but workflow-bound |

A query like `brazil world cup poster` is good on each surface for different reasons. The eval has to score that *difference*, not just rank-correlate against Pinterest.

---

## Proposed framework

### 1. Query set (~100, balanced across our content surfaces)

| Bucket | Sample queries |
|---|---|
| Travel | `paris travel poster`, `japan itinerary`, `dubai map travel guide` |
| Education | `animal flashcards`, `solar system infographic`, `kids english colors vocabulary cards` |
| Merch | `tea brand mascot`, `museum merchandise`, `brand logo design board` |
| Sports / WC | `brazil world cup poster`, `messi wallpaper`, `england 1966 squad` |
| Lifestyle | `interior design home guide`, `vintage fashion lookbook`, `pet care guide infographic` |
| Culture | `world cuisine food poster`, `ethnic costume deconstruction board`, `cultural festival illustration poster` |
| Character | `mbti enfp career poster`, `anime character group poster` |
| Empirically-validated | `amusement park map infographic`, `ai dub`, `evolution snacks` |

Seeds: ~50 already calibrated in `lib/popularPrefillQueries.ts` + ~50 picked to span gaps and competitor strengths.

### 2. Comparison surfaces

For each query, capture top-N results from:

| Surface | Capture method |
|---|---|
| Curify | `/search?q=<query>` — top 20 inspirations |
| Pinterest | Manual screenshot of search page — top 20 pins |
| Google Images | Manual screenshot — top 20 results |
| Bing Images | Manual screenshot — top 20 results |
| Canva (templates) | Manual screenshot of template-search — top 20 |

### 3. Evaluation dimensions

| Dimension | Definition | Scoring |
|---|---|---|
| **Relevance** | Does each result look like what the user asked for? | 0–5 per surface, per query |
| **Diversity** | Are results visually / topically varied, or do they all look the same? | 0–5 per surface, per query |
| **Actionability** | Can the user *do something* with this result? Copy, remix, generate, edit. | 0–5 per surface, per query |

Scoring is **manual** for the first pass (one or two reviewers). Once we have ~30 queries scored, train a rubric / consider an LLM rater for scale.

### 4. Output

Per query, a 5×3 score matrix (15 numbers). Aggregate across query buckets to find:
- Where Curify already wins (= moat to defend)
- Where Curify loses on relevance (= content / matching gap to close)
- Where Curify loses on diversity (= ranker bias)
- Where Curify loses on actionability (= UX gap; should be rare — actionability is our axis)

---

## Strategic framing (the bigger point)

> **Pinterest = human-curated visual demand**
> **Curify = AI-generated visual supply**

These are different sides of the funnel. Pinterest tells us *what people want to see*; Curify lets them *make a personalized version of it*. The implication:

- Pinterest isn't a competitor we replace — it's an **upstream demand signal** we mine.
- The flow we want is: `Pinterest trend observed → Curify template / pack built → Curify wins that query`.
- This is already how we've found wins in *Hairstyle*, *Travel*, *Collage*, *Merch*.

So the eval's job isn't "how close is Curify to Pinterest"; it's **"which queries should we win, and have we?"**

---

## Phased plan

| Phase | Effort | Deliverable |
|---|---|---|
| **P1 — Pilot (this month)** | ~1 day of manual screenshotting + scoring for 20 queries | Spot-check whether the framework yields actionable findings before committing to full 100 |
| **P2 — Full scoring (next month)** | ~3 days for 100 queries × 5 surfaces × 3 dimensions | The actual benchmark; identifies category leaders |
| **P3 — Repeat cadence** | Monthly or quarterly | Track moat formation as we ship content / matching improvements |

**Out of scope (deliberately):**
- Building any Pinterest-API integration or scraper
- Automated SERP harvesting
- Real-time comparison dashboards

These all assume "match Pinterest." We don't.

---

## Extension A — Crawling & Discovery (Baobao's track) — added 2026-06-27

The 5-platform comparison Baobao already produced is a **marketing-class artifact** — `"We benchmarked Google, Canva, and Pinterest against Curify on Visual Intent. Here is the massive gap we found"` is the LinkedIn / Twitter post draft. The eval work above asks "where do we win?" — this extension asks **"what should we add to the catalog so we win more queries?"**

### The Content Gap Fulfillment Pipeline

A four-stage automated loop turning external demand signals into Curify catalog additions:

```
   ① CRAWL                ② DIFF                  ③ GAP MINE         ④ AUTO-FILL
─────────────────    ───────────────────    ──────────────────   ────────────────────
Pinterest trends     Inner-join against     Top-N "high-demand    For each gap, hit
+ Etsy bestsellers   nano_templates +       low-supply" topics    the Curify backend
+ Google Trends      taxonomy.json +        ↓                     to mass-generate
+ Reddit r/X         template_subjects                            with auto-tagging
+ TikTok hashtags    map.                   Tag candidates by     + i18n + CDN sync.
                                            intent cluster.
```

- **Why automate:** the bronze-worker case (`docs/search-retrieval-improvement-plan-2026-06-25.md` worked example) cost ~2 hours of human attention to spot, design, generate, and tag. The same loop, automated, should cover ~50 viral compound queries per week.
- **Why on Baobao:** this is canonical CS-Master data-engineering work — crawling, diffing, scheduled pipelines, structured output. Aligns with where his skill stack actually pays off.
- **Resume framing:** *"Built an end-to-end automated data pipeline that identified market gaps in a 7K-asset image catalog and scaled the SEO-optimized asset library by X% over 8 weeks."*

### Where each crawled source maps in the existing system

| Source | What it gives | Existing diff target |
|---|---|---|
| Pinterest search-page trending boards | Visual-format compound queries | `nano_templates.json topics[]` ∪ `taxonomy.json tier-3` |
| Etsy bestseller listings (printable / digital art) | Sellable-merch query patterns | `template_subjects` + `topics[]` |
| Google Trends (rising image queries) | Mainstream demand by region | per-locale top queries via `lib/popularPrefillQueries.ts` |
| Reddit r/* visual subs (e.g. `r/Posters`, `r/IDAP`) | Compound-niche queries (the `青铜打工小兽` class) | rewriter catalog context `lib/searchRewrite.ts CATALOG_CONTEXT` |
| TikTok creator hashtags (image-gen tagged) | New aesthetic / style movements | `tier3.design + tier3.lifestyle` (style + mood slugs) |

Each source produces a structured weekly diff against the local catalog; the diff feeds Curify's existing template-and-inspiration generation infrastructure (`scripts/configs/*_seeds*.json` → `add_*_templates_*.py` → daily content drop flow).

### Cadence + ownership

- Weekly cron — runs every Monday morning, output → `docs/discovery_diff/YYYY-MM-DD.md`.
- Diff includes: net-new viral compound queries, demand→supply ratio per intent cluster, top-3 generation candidates per gap.
- Baobao reviews → marks "auto-generate," "manual generate," or "skip" per row.
- Auto-generates flow through existing daily-drop infrastructure (no net-new pipeline).

---

## Extension B — Relevance labeling (we have none today) — added 2026-06-27

**The honest current state:** Curify has zero pairwise relevance labels. The Section A matcher uses `tags ∪ topics` intersection as a proxy ("if the query token is in a record's tag set, it's relevant"). That's a recall heuristic, not a relevance signal — every record either matches or doesn't, no graded ordering.

This blocks several things:
- We can't compute NDCG @ K (the standard ranking metric).
- We can't train a learned reranker.
- We can't tell whether the P0.2 multi-hit boost is over-/under-tuned at +8%.
- We can't tell the agentic-eval comparator (D/E in the VIR eval) "you ranked the wrong template higher" — only "you missed it entirely."

### Bootstrap plan — 4 weeks, ~200 queries × ~10 ranked candidates each

Reuses the same query set that drives the search benchmark above. Three-stage bootstrap from cheap to costly:

| Stage | Method | Cost | What we get |
|---|---|---|---|
| 1. Implicit | Pull existing `SEARCH → CLICK` events from admin SQL: (query, clicked content_id) pairs over the last 90d, weighted by recency | ~½ day | Free graded signal at the *click* end of the funnel. Noisy because users only click what we showed them — strong selection bias |
| 2. Pairwise | Random-pair sample: for ~200 queries, generate ~10 candidates per query (top-K from current matcher + 2 distractors from random tags), present 5 random pairs each to a labeler ("which is more relevant to the query?") | ~1 week of Baobao's time | ~1,000 pairwise judgments. Train an LR / GBM pairwise model → continuous relevance score per (query, doc) |
| 3. LLM-judge | GPT-4o judges the same pairs with a strict rubric (subject match, info-type match, layout match, audience match). Calibrate against the Stage 2 human labels | ~$50 + 2 days | Scale the pairwise model to all (query, top-K) pairs in the eval set without further human cost |

### Why this is a Baobao deliverable

Pairwise labeling + bootstrap to a learned reranker is a textbook CS Master / IR-systems project, not an exploratory research one. Three stages each produce a usable artifact even if the next stage stalls:
- After Stage 1: a click-log-based relevance proxy already usable for offline regression testing.
- After Stage 2: a pairwise reranker callable from the matcher.
- After Stage 3: the dataset that the agentic-eval rerankers (VIR doc Phase 4 hybrid + LLM reranker) actually need to train against.

### The hidden gain

Once relevance labels exist, **the search-vs-Pinterest-vs-Google scoring above stops being manual.** The judge calibrated in Stage 3 scales straight onto the cross-surface eval — 100 queries × 5 surfaces × 3 dimensions becomes one weekend of LLM-judge runs instead of one week of human review.

---

## Extension C — Hybrid Google results — added 2026-06-27

The single biggest gap in the 5-platform comparison is **coverage of long-tail / niche queries** — Curify's 7K-asset catalog can't compete with Google Images' billion-scale index on (e.g.) `vintage Polish movie poster style for marketing`. Even after Baobao's Content Gap Fulfillment Pipeline (Extension A), the long tail will always lag.

### The proposal: hybrid result rail

When Section A returns thin results (the `LOW_RESULT_THRESHOLD=5` gate), append a **read-only Google Images rail** below the Curify results:

```
   USER:  vintage Polish movie poster
   ─────────────────────────────────────────────────────
   Curify results          [3 inspirations + 1 template] ← native, copy/remix
   ─────────────────────────────────────────────────────
   Inspiration from elsewhere ↓                          ← read-only, click-out
   ─────────────────────────────────────────────────────
   Google Images thumbnails  [12 results]
       ↳ each click → opens the source URL in a new tab
       ↳ each pin → "I want to make something like this" CTA →
           routes back to Curify's nearest template (uses the
           Hybrid retriever from the VIR doc)
```

The rail is **discovery-only** — not a competing creation surface. The CTA on each Google thumbnail is the real product play: it routes back to "make something like this with Curify," which exercises both the VIR routing layer (find nearest template for the visual) AND the Baobao Content Gap Pipeline (if no template matches, file the gap for next-week's generation cron).

### Why this earns its place in the eval framework

The hybrid rail is the natural product surface for the **External Signals for Visual Search Evaluation** thesis: external signals (Google) feed the eval framework (does Curify cover this?) feed the discovery pipeline (if not, why not, can we?). Without it, the eval is academic — with it, the eval drives a concrete user-visible improvement.

### Implementation sketch (Phase 3 / 4 of Baobao's track)

- **Source:** Google Custom Search API (Image search) — modest QPS, the per-query cost is bounded by the thin-results gate so we only call when actually needed.
- **Caching:** 7-day key by (query, locale) — bot/garbage queries already short-circuited upstream.
- **CTA target:** "Make with Curify" → routes through the VIR Hybrid retriever (Phase 4 in `eval-framework-visual-intent-routing-2026-06-15.md`) using the image's title + alt text as the query.
- **Tracking:** new `nano_external_inspiration_click` event with `content_id = "google:<url-hash>"` so admin SQL can measure click-through rate from the external rail back into Curify creation.

### Risk + mitigation

- **Risk:** users click out, never come back. **Mitigation:** the CTA on each thumbnail is the funnel back in; tracking measures this directly. If `external_click → curify_create` conversion < 8%, kill the rail.
- **Risk:** copyright / takedown surface. **Mitigation:** never proxy the images — hotlink + show source domain badge prominently. Identical pattern to how Pinterest itself surfaces external content.

---

## Open questions for next pass

1. **Reviewer protocol** — one person scores both surfaces (cheap, biased) or two-person blind (better, slower)?
2. **Per-locale scoring** — do we score `世界杯海报` separately from `world cup poster`? (probably yes for top-2 locales)
3. **LLM rater training** — at what point is it worth feeding the manual scores to gpt-4o-mini for scale?
4. **Where the scores live** — admin panel section, doc, or sheet?

---

## Where this slots vs current work

This is **not P0**. Currently P0 is:
- Daily content drops (recurring)
- Funnel data check 2026-06-17 (#78)
- WC schedule TZ fix before knockouts (#82)

This framework belongs to the **post-WC** strategic window (mid-July onwards), when the active-tournament traffic pressure relaxes and we can do measured benchmarking. Filing it now so the *why* is settled before someone asks "should we just scrape Pinterest?"

---

## Baobao's track summary — 8-week schedule

The original visual-search eval (Phases P1-P3 above) + the three Extensions (A, B, C added 2026-06-27) compose into Baobao's quarter:

| Phase | Weeks | Deliverable |
|---|---|---|
| **B-Phase 1 — 5-platform benchmark** | wk 1-2 | Manual scoring of 100 queries × 5 surfaces × 3 dimensions. **Output: LinkedIn / Twitter post draft** *"We benchmarked Google, Canva, and Pinterest against Curify on Visual Intent. Here is the massive gap we found."* (already drafted by Baobao — final polish + publish in week 2). |
| **B-Phase 2 — Crawl & gap pipeline (Extension A)** | wk 3-4 | Weekly cron pulling Pinterest / Etsy / Google Trends / Reddit / TikTok → diff against catalog → publish `docs/discovery_diff/YYYY-MM-DD.md`. First diff lands week 3; first auto-generated gap-fill batch ships via daily-drop in week 4. |
| **B-Phase 3 — Relevance labeling bootstrap (Extension B)** | wk 5-6 | Implicit (click logs) + pairwise (1K judgments) + LLM-judge calibration. Output: a per-(query, doc) relevance score callable from the matcher and from the agentic-eval reranker (VIR doc Phase 4). |
| **B-Phase 4 — Hybrid Google rail (Extension C)** | wk 7-8 | `LOW_RESULT_THRESHOLD` triggers a Google Images discovery rail with "Make with Curify" CTA. Tracking on `external_click → curify_create`. Sized as a Phase 4 feature, not a heroic build — re-uses the VIR Hybrid retriever for the "make with" route. |

Across the 8 weeks, the work feeds both the eval framework (Phase 1) AND the catalog itself (Phase 2-4 close gaps the eval surfaces). Pairs cleanly with Rong's 8-week Generative-Retrieval track in `docs/eval-framework-visual-intent-routing-2026-06-15.md` — Baobao = "find the gaps," Rong = "close the gaps with better routing."

---

## See also

- [`eval-framework-visual-intent-routing-2026-06-15.md`](./eval-framework-visual-intent-routing-2026-06-15.md) — Generative Retrieval for Template Recommendation (Rong's track). Sister doc.
- [`workstream-agentic-image-rong.md`](./workstream-agentic-image-rong.md) — Multi-modal Commercial Agent Pipeline (Rong's execution arm).
- [`search-retrieval-improvement-plan-2026-06-25.md`](./search-retrieval-improvement-plan-2026-06-25.md) — Current P0.1 + P0.2 ship (Multi-query Retrieval already shipped; relevance labeling is the missing piece that unblocks the next round).
- [`search-and-content.md`](./search-and-content.md) — Strategic umbrella.
