# Visual search eval framework — Curify vs Pinterest / Bing / Google / Canva

**Date filed:** 2026-06-14
**Status:** Strategic framing — not yet executed. Documents the *what & why* so a future implementation pass has the rationale already settled.

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
