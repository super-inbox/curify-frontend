# Programmatic SEO — turn self-evolving search into Google-indexable topic hubs

_Status: spec, not built. Filed 2026-05-27. Tracked as Thread d open item 9 in `docs/search-and-content.md`._

## The strategic framing

The self-evolving-search workstream is producing a **content engine** that:

1. Detects demand (SEARCH_NORESULT + SEARCH_LOWRESULT events, GSC zero-CTR queries, Reddit signals)
2. Maps demand to templates (LLM matcher in `lib/searchTemplateMatch.ts`)
3. Generates content where the catalog is thin (batch-gen pipeline)

But the **output surface is internal-only**. Today every win from this engine — better tokenization, the Generation Bridge, gap classification, content drops — improves the experience of users who **already arrived** at curify-ai.com. Googlebot can't see any of it.

This work bridges that gap: turn each curated query into a static, Google-indexable **topic hub page** that Google ranks, indexes, and sends traffic to. The same engine, two output surfaces:

```
                                                  ┌──────────────────┐
                                              ┌─→ │  /search?q=…     │  internal users
                                              │   └──────────────────┘
   demand signals ─→ matcher ─→ batch-gen ────┤
                                              │   ┌──────────────────┐
                                              └─→ │  /topic-hub/<slug>│  Googlebot → external SEO traffic
                                                  └──────────────────┘
```

## The first-step audit (2026-05-27)

Of the **46 queries in `search_eval_set.json`**, only **1** (`english-chinese`) has a Google-indexable static URL today. The other 45 are search-only — they render at `/search?q=<query>`, which Googlebot:

- Cannot reach (no `<a>` link from any indexable page leads to that query)
- Wouldn't index even if it could (Google's anti-thin-content policy on internal search pages)
- Cannot render properly when the results page is server-rendered against a query string

So **the entire output of the self-evolving search engine is currently invisible to Google**. This is the lowest-hanging fruit in the workstream — the engine exists; we just haven't built the export surface.

## Three barriers to organic discoverability (and the fixes)

| Barrier | Why default doesn't work | Fix |
|---|---|---|
| **Googlebot doesn't type in search boxes** | Crawler follows `<a href>`; never POSTs to /search | Generate semantic-slug URLs (`/topic-hub/<slug>`) that crawl naturally |
| **Client-side rendering returns empty shells** | If results hydrate after JS, Googlebot sees empty HTML | Server-render the topic-hub page (same as `/topics/<slug>` today) |
| **Anti-Slop: Google penalizes internal-search pages** | `/search?q=…` pages tagged as "thin content" / "doorway pages" | Wrap content in topic-hub format: H1 + intro paragraph + curated image grid + downloads + cross-links. Looks like an editorial topic page, not a search result. |

## Page anatomy — what a topic-hub looks like

For query `bilingual flashcards for kids learning korean fruits`, slug `bilingual-korean-fruit-flashcards`:

```
URL: /topic-hub/bilingual-korean-fruit-flashcards
H1:  Bilingual Korean Fruit Flashcards for Kids
intro paragraph (LLM-generated, 80-120 words, distinct from /search snippet):
  "Korean-English fruit flashcards are one of the most-searched ESL
   starters for preschool teachers and bilingual parents. This page
   collects the templates Curify offers for generating them: from the
   canonical bilingual vocabulary card to the watercolor kids-poster
   variant. Pick a layout, type the language pair (en-ko works best),
   and Curify produces a printable JPEG you can use as a wall card,
   a magnet, or a TikTok-style ESL reel asset."

[ Section A: Examples ]
  Grid of 12-20 actual generated inspirations matching the query.
  Each card → /nano-template/<slug>/example/<id>.

[ Section B: Generate yourself ]
  3-5 LLM-matched templates with suggested params filled in.
  Each card → /nano-template/<slug>?<params>#reproduce.

[ Section C: Related topic hubs ]
  Cross-links to 4-6 sibling pages:
  - Bilingual English-Spanish Fruit Flashcards
  - Bilingual Korean Animal Flashcards
  - Korean Vocabulary Wall Posters
  Internal links form the "Hub & Spoke" structure Google uses to
  understand topic clustering.

[ JSON-LD: CollectionPage + ItemList schema ]
[ Sitemap: indexable on the en locale; non-en locales canonical to en
  to avoid duplicate-content penalty. ]
```

The page differs from `/topics/<slug>` (which exists for declared tier-1/2/3 topics) in two ways:

1. **Source of truth**: topic pages key off `lib/taxonomy.json`; topic-hubs key off a per-slug manifest that's generated/curated separately
2. **Granularity**: topics are broad (`food`, `mbti`, `seasonal`); topic-hubs are long-tail-specific (`bilingual-korean-fruit-flashcards`, `cuban-sandwich-recipe-poster`)

## Source pipeline — what queries become topic-hubs

Three input streams, deduplicated by canonical slug:

| Source | Selection rule | Volume |
|---|---|---|
| **GSC top queries** | `Pages.csv` queries with impressions ≥ 30 AND CTR < 3% AND position 5-20 (rankable but not yet ranked) | ~20-50 per refresh |
| **Internal SEARCH_NORESULT + LOWRESULT** | Distinct queries (weight=1 per memory) with ≥ 2 users in last 30 days | ~10-30 per month |
| **Curated long-tail (ProgSEO seeds)** | Hand-picked from competitor research or product-led intuition (e.g. the 10 ProgSEO demo queries) | ~10 per push |

Each candidate slug runs through gating:

1. **Catalog readiness**: do we have ≥ 5 matching inspirations OR ≥ 2 high-confidence matcher templates?
2. **Intent clarity**: does the query map to a single image-content intent? (LLM judge — same gate as gap-classifier Phase 1)
3. **Cannibalization check**: does an existing `/topics/<slug>` already cover this? Skip to avoid splitting Google's authority signal.

Slugs that pass → enter the manifest → render the topic-hub page → submit to sitemap.

Slugs that fail catalog-readiness → queue for batch-gen (Generation Bridge / gap-classifier) → recheck weekly.

## Implementation phases

### Phase 0 — Foundation (1 day)

Build the infrastructure without launching any pages:

- `lib/topic_hubs.json` — manifest schema: `[{ slug, query, intro?, created_at, source }]`
- `app/[locale]/(public)/topic-hub/[slug]/page.tsx` — server-rendered route, reads manifest + assembles page
- `app/sitemap-topic-hubs.ts` — emits sitemap entries for manifest slugs (10 locale URLs each, en canonical)
- 404 for any slug not in manifest

Page renders correctly when fed a manifest entry; sitemap is empty until Phase 1.

### Phase 1 — Ship 20 high-confidence topic-hubs (2-3 days)

Hand-curate 20 manifest entries from the highest-impressions GSC queries that have catalog content. Slugs like:

- `mbti-marvel-character-chart`
- `watercolor-europe-travel-map`
- `cuban-sandwich-recipe-poster`
- `monstera-plant-care-guide`
- `marvel-mbti-personality-chart`
- `bilingual-flashcards-korean-fruits`
- `before-after-kitchen-organization`
- `lunar-new-year-red-envelope-poster`
- `1950s-vintage-diner-retro-poster`
- `infj-entp-dating-compatibility`

(All overlap with the ProgSEO eval set — so the matcher coverage is already validated for these.)

For each: write a 80-120 word LLM-generated intro (gpt-4o-mini, cached), pin 8-12 inspirations + 3 templates. Render. Submit sitemap. Watch GSC for indexation over 2 weeks.

### Phase 2 — Auto-generation pipeline (1 week)

After Phase 1 proves the format gets indexed:

- `scripts/generate_topic_hub.py` — takes a slug + query, runs the matcher + scoring + intro-generation, writes to manifest
- Connect to gap-classifier (Thread d #6): `CONTENT_GAP_BATCH_GEN` verdicts → auto-queue topic-hub creation after batch-gen completes
- Weekly review surface in admin: pending topic-hub candidates, approve/reject batches

### Phase 3 — Cross-link layer + internal hub (half-week)

- Auto-generate "Related topic hubs" section by topic-overlap (Jaccard over inspiration topics)
- New `/topic-hub` index page listing all hubs grouped by tier-1
- Footer link block on home + blog posts pointing into hub index ("Trending Topics" / "Popular Searches")

### Phase 4 — Measurement loop (ongoing)

- Per-hub: impressions, clicks, position from GSC API; click-through to template gen tracked via `topic_hub:<slug>` content_id
- Promote winners (move from /topic-hub/<slug> to a higher-authority shape — maybe upgrade to a /topics/<slug> if pattern matures)
- Retire losers (manifest entry removed; 410 Gone or 301 to closest topic)

## Risks + open questions

1. **Duplicate content with /topics/<slug>** — if a manifest slug overlaps with an existing topic slug, Google sees two pages competing for the same query. Mitigation: cannibalization check at slug-gen time, OR `canonical` from topic-hub → /topics page when both exist.

2. **Anti-Slop trigger if intro paragraphs are too templated** — Google detects LLM-generated boilerplate. Mitigation: intro generation pulls from query-specific facts (template names, sample params, count of inspirations) so each page has unique numbers and proper nouns.

3. **Hreflang strategy** — 10 locales. Strict approach (each locale gets indexable + locale-specific intro) is content-heavy; cheap approach (en canonical + non-en hreflang pointing at en) lets en accrue all PageRank.

4. **Sitemap submission velocity** — generating 100+ pages at once trips the freshness signal. Batch in 10-20 per week.

5. **Internal cannibalization with `/search`** — what happens when a user clicks Section A on /topic-hub/<slug> and lands on the existing template page, vs. coming in via /search? Should be identical experience; just different entry vector. Worth a quick QA.

6. **AI Overview defenses** — Google's AI Overviews summarize topic-hubs but may not link out. Mitigation: structured-data schema (CollectionPage / ItemList / FAQ) + concrete actionable widgets (Generate buttons) that AI Overview can't replicate.

## Success criteria

Phase 1 success after 30 days:

- ≥ 60% of the 20 hub URLs indexed by Google (manual check via `site:` operator or GSC Coverage report)
- ≥ 5 of 20 ranking on page 1 for their target query
- ≥ 500 total impressions/week across the 20 URLs
- ≥ 10 clicks/week landing on hub pages from organic search

Phase 2 success after another 30 days:

- Auto-generation pipeline produces ≥ 5 new hubs/week from pipeline-suggested slugs
- 0 manual-approval bottlenecks beyond the weekly review

## File layout (when built)

```
curify-frontend/
  lib/
    topic_hubs.json                              # manifest
    topic_hub_intros.json                        # generated intros (cached)
  app/[locale]/(public)/
    topic-hub/
      [slug]/page.tsx                            # individual hub page
      page.tsx                                   # /topic-hub index of all hubs
  app/
    sitemap-topic-hubs.ts                        # sitemap entries
  scripts/
    generate_topic_hub.py                        # one-shot generator (Phase 2)
    audit_topic_hub_coverage.cjs                 # check which eval queries lack a hub
  docs/
    programmatic-seo-topic-hubs.md               # this spec
```

## Why this is the highest-priority item in the workstream

Comparing against the open items in Thread d:

| Item | Volume | Output |
|---|---|---|
| **#5 Reddit revival** | 200 phrases re-LLM'd from static file | Internal proposal queue; 0 SEO impact |
| **#6 Gap classifier Phase 1** | ~5 queries/week classified | Faster manual triage; 0 SEO impact |
| **#7 Long-CJK matcher** | Long-tail query class | Better internal recall on a narrow surface |
| **#8 Generation Bridge Phase 2** | CTR measurement on existing surface | Validates Phase 1 was right |
| **#9 Topic-hub pipeline (this)** | 20-50 new indexable URLs/month | New organic traffic stream — turns the whole self-evolving search engine into a growth flywheel |

Every other item improves internal UX. This one is the **only** item that converts the workstream's output into external traffic. **Prioritize ahead of everything else when bandwidth allows.**
