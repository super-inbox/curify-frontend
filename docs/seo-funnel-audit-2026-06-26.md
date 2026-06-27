# SEO funnel audit — 2026-06-26

GSC 28-day pull (2026-05-26 → 2026-06-23) cross-referenced against the
3-child sitemap (sitemap.xml + sitemap-blogs.xml + sitemap-examples.xml).
Answering: *we have ~25k SEO pages — why only hundreds of GSC clicks/day?
How do we get to 10k/day?*

Scripts: `scripts/audit_gsc_full.cjs` (paginated GSC pull) +
`scripts/seo_funnel_audit.py` (cross-ref + bot subtraction). Raw data:
`raw/gsc-audit-2026-06-26/`.

---

## Headline numbers

| | 28d total | per day |
|---|---|---|
| **Clicks** | 5,975 | **213** |
| Impressions | 378,803 | 13,529 |
| Blended CTR | 1.58% | — |
| **Blended CTR after bot subtraction** | **4.02%** | — |

Real-human CTR ≈ 4% (healthy). The 1.58% headline is depressed by AI-bot
crawl-noise impressions (see Bot subtraction below).

## The funnel — the headline diagnosis

| Stage | Pages | % of sitemap |
|---|---|---|
| Sitemap URLs | **25,764** | 100% |
| Sitemap ∩ GSC (any impression in 28d) | **3,465** | **13.4%** |
| Avg position ≤ 20 | 4,552 | 17.7% |
| Avg position ≤ 10 | 3,521 | 13.7% |
| Avg position ≤ 3 | 438 | 1.7% |
| **Got ≥1 click** | **319** | **1.2%** |
| Got ≥5 clicks | 34 | 0.1% |
| **Sitemap URLs MISSING from GSC** | **22,299** | **86.6%** |

**87% of our SEO pages are invisible to Google.** That's the headline.
We don't have a "many keywords" problem — we have a "Google ignores
most of our pages" problem.

## Click concentration

| | Clicks | % |
|---|---|---|
| Top 25 pages | 5,525 | **92.5%** |
| Top 5 pages | 5,029 | 84.2% |
| Top 3 pages (all WC) | 4,538 | **76.0%** |

Top 5 clicked pages (28d):

| Clicks | Impr | Position | Page |
|---:|---:|---:|---|
| 1,719 | 41,570 | 7.1 | `/blog/brazil-argentina-soccer-poster-prompts` |
| 1,535 | 42,167 | 6.7 | `/blog/portugal-soccer-poster-prompts` |
| 1,284 | 11,390 | 5.5 | `/blog/world-cup-2026-ai-prompt-hub` |
| 329 | 3,629 | 6.7 | `/blog/50-world-cup-2026-ai-prompts` |
| 179 | 4,090 | 7.0 | `/blog/france-soccer-poster-prompts` |

**Three World Cup blog posts are 76% of our entire SEO traffic.** Strip
those out and we're at ~50 clicks/day across the rest of the platform.

## Route family yield

| Family | Sitemap | In GSC | Cov % | Top-20 | Clicks | Impr | CTR | Avg pos |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **blog** | 960 | 436 | **45.4%** | 391 | **5,410** | 347,488 | 1.56% | 11.8 |
| nano_template_example | **17,650** | 2,610 | 14.8% | 2,348 | 150 | 17,924 | 0.84% | 10.6 |
| nano_banana_prompt | 4,610 | 1,088 | 23.6% | 1,028 | 101 | 3,594 | 2.81% | 9.3 |
| nano_template_index | 514 | 358 | **69.6%** | 325 | 94 | 3,354 | 2.80% | 10.1 |
| home | 1 | 2 | — | 2 | 89 | 837 | **10.6%** | 6.0 |
| **tool** | 100 | 65 | **65.0%** | 58 | **78** | 2,257 | 3.46% | 11.3 |
| topic_hub | 1,740 | 299 | **17.2%** | 263 | 36 | 2,623 | 1.37% | 11.6 |
| use_case | 100 | 10 | **10.0%** | 10 | **0** | 48 | 0.00% | 7.5 |
| nano_template_carousel | 1 | 80 | — | 76 | 0 | 242 | 0% | 9.1 |

**What this reveals:**

- `/blog/*` is the engine: 45% sitemap coverage, 5,410 clicks (90% of total)
- `/tools/*` has the **highest yield per page** (78 clicks ÷ 100 sitemap = 0.78 clicks/page; 0.6 clicks/page/week)
- `/nano-template/*` indexes are decent (70% coverage); example pages (17,650 of them) are mostly invisible
- `/nano-banana-pro-prompts/*` (4,610 pages) → 101 clicks. 0.022 clicks/page. Almost zero ROI per page.
- `/topics/*` is bleeding: 1,740 pages → 36 clicks. **5% of impressions, 0.6% of clicks.** The programmatic topic-hub strategy is not paying off in current form.
- `/use-cases/*` is dead: 100 pages, 0 clicks. Worth investigating canonicals + internal links.
- `nano_template_carousel`: 80 GSC pages, 0 clicks, NOT in sitemap. These are orphan-but-crawled (the carousel URLs duplicate the example URLs — already filed as task #79).

## Bot subtraction (per `feedback_gsc_bot_pattern_exclusion.md`)

| | Value |
|---|---|
| Total queries | 5,912 |
| **AI-bot pattern flagged** (5+ words + 3+ countries + time marker + 0 clicks) | **3,358 (57%)** |
| Bot impressions | **63,243 (58% of query-level impressions)** |
| Real human impressions ≈ | 45,687 |
| Real CTR ≈ | **4.02%** |

Bottom 4 single highest-impression queries are ALL bot pattern (e.g.
"world cup 2026 favorites odds brazil france argentina spain" — 719 impr,
0 clicks). The page-level signal `/blog/world-cup-2026-top-contenders`
gets **173,656 impressions and 12 clicks (0.01% CTR)** — almost entirely
bot pattern. Strip those out and CTR on real-human impressions is fine
across the rest of the corpus.

## Locale split

| Locale | Clicks (28d) | Pages in GSC |
|---|---:|---:|
| en | **5,539 (93%)** | 1,977 |
| es | 122 | 316 |
| zh | 100 | 880 |
| ko | 86 | 481 |
| fr | 32 | 209 |
| tr | 29 | 282 |
| ja | 24 | 249 |
| de | 19 | 251 |
| ru | 19 | 253 |
| hi | 4 | 72 |

**Non-EN = 25% of sitemap but 7% of clicks.** Either translation quality
is too thin to rank or non-EN pages aren't getting authority via internal
links. Big asymmetric upside if fixable.

---

## What needs to be true to reach 10k/day

Current: 213 clicks/day. Target: 10,000 clicks/day = **47×** growth.

We don't have a "scale to more pages" problem — we already have 25k. We
have **two interlocking problems**:

1. **Indexation/visibility cap** — 87% of pages don't show in GSC at all
2. **Concentration risk** — 76% of clicks are 3 WC pages that **will deflate after July 2026**

If WC clicks halve after the tournament (realistic), we drop from 213/day
to ~120/day baseline. That's the floor — not the ceiling we're growing from.

## Five wedges, ranked by expected payoff

### Wedge 1 — Indexation rescue (highest leverage, lowest risk)

22,299 sitemap URLs invisible to Google. Even if 25% of those become
visible at 1-2 impressions/week ranking ≤20, that's a structural shift
in baseline. Mechanism: internal link layer (interconnection.md), Indexing
API submissions, hub-spoke wiring, audit of canonicals + duplicate-content.

**Expected lift:** +500-1,500 clicks/day (3-6 months). Cheap to start.

### Wedge 2 — Replicate the WC playbook before WC deflates

The 3 WC posts ranking #5-7 for "{country} prompt" head terms is the
shipped, proven formula. Same pattern works for:
- NBA Finals / Champions League / F1 / Olympics (sports-event recurring)
- Anime season debuts (recurring)
- K-Pop comebacks (recurring)
- Movie/TV release events (e.g. Avatar 3, House of Dragon S3)
- Holiday cycles (Christmas, Halloween, Lunar New Year posters)

Each playbook clone = ~1,000 clicks/month at peak. **5 clones operating
year-round = 5k clicks/month baseline + spikes.** Critical: must be IN
PLACE before WC2026 deflates (mid-July).

**Expected lift:** +500-1,500 clicks/day in 3-6 months.

### Wedge 3 — Non-EN audit + rescue

25% of sitemap, 7% of clicks. Non-EN search is structurally less
competitive in most languages — should over-index relative to EN, not
under-index. Hypotheses: translation thinness, missing internal links,
sitemap signaling issues. Even a 2× non-EN share would add 400 clicks/day
to the baseline.

**Expected lift:** +200-800 clicks/day. Medium effort.

### Wedge 4 — Topic-hub rescue or sunset

1,740 `/topics/*` pages → 36 clicks (0.6% of total) → **0.02 clicks/page/month.**
The current programmatic topic-hub strategy is failing. Either:
- (a) Fix it — diagnose why coverage is 17% (canonicals? thin content?
  duplicating the blog hubs?)
- (b) Sunset most of them — concentrate authority on a curated 50-100
  high-quality topic hubs instead

This is also the highest-risk family for Helpful Content classifier penalties.

**Expected lift if fixed:** +200-500 clicks/day. Or if sunsetted,
upstream authority benefits.

### Wedge 5 — Tool page expansion

`/tools/*` has the best per-page yield (0.78 clicks/page). Doubling to
200-300 tool pages produces more measurable clicks than another 5,000
example pages. Each new tool page also attracts ChatGPT/Perplexity
referrals (memory `reference_video_user_attribution.md` shows ChatGPT
already sending users to `/tools/[slug]`).

**Expected lift:** +200-500 clicks/day per 100 new tools. Slow to ship.

---

## Realistic ceiling

Stacking all five wedges at conservative estimates: **+1,600-4,800 clicks/day**
on top of the post-WC baseline of ~120/day. Realistic destination in 6
months: **1,700-5,000 clicks/day.**

**To hit 10k/day** requires one of:

1. **A 6th wedge — a single head-term hero ranking.** "AI poster generator"
   at rank #1 globally is potentially ~30k/month from one keyword
   (~1k/day). Three of those = 3k/day from hero pages alone. Slow + uncertain.
2. **One of the 5 wedges over-performs by 3-5×.** Most likely candidate
   is Wedge 2 (event playbook) — if 10 event verticals all hit WC-level
   numbers concurrently, that's 5k clicks/day from playbook-cloned content alone.
3. **Authority shift from off-site work** — backlinks, brand-search growth,
   Wikipedia citations. Compounds, slow.

The honest 12-month answer: 5,000 clicks/day is achievable; 10,000/day
requires a structural win (hero ranking, brand authority, or playbook
over-performance).

---

## Recommended sequencing

1. **Wedge 1 (Indexation rescue)** — 2-3 weeks of internal-link wiring +
   targeted Indexing API submissions. Move first; payoff compounds for
   every other wedge.
2. **Wedge 2 (Event playbook)** — pick the next event (NBA Finals?
   Olympics 2028? Anime fall 2026?) and ship 1 vertical end-to-end as a
   reusable template. Before WC deflates.
3. **Wedge 4 (Topic-hub triage)** — 1 week to decide fix-or-sunset.
   Likely the highest-risk family in current form (Helpful Content).
4. **Wedge 3 (Non-EN audit)** — 1 week of diagnostics; fixes likely
   incremental + cheap.
5. **Wedge 5 (Tool expansion)** — ongoing; compounds with ChatGPT
   referrals.

## Caveats

- 28-day window only. Doesn't account for seasonality (WC inflation
  IS the seasonality here).
- Bot-pattern subtraction uses the heuristic from
  `feedback_gsc_bot_pattern_exclusion.md`. Real bot share may be higher
  (Perplexity / Claude / SGE don't fully self-identify).
- GSC API returns max ~5k unique pages per dimension even with pagination.
  Hard cap on visibility into the long tail.
- "avg position ≤ 10" can be misleading: a page with 1 impression at
  position 5 counts the same as 100 impressions averaging 5. Real
  ranking discipline lives in the ≥5-clicks cohort (34 pages).
- Sitemap audit doesn't catch noindex'd pages, robots-blocked URLs,
  or canonical-collapsing — assume coverage is *better* than the headline
  by 5-10% if those exist.
