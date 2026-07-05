# Use-case chip click analysis — 2026-07-03

Ad-hoc pull answering: **are the use-case chips on the template + example
pages getting clicked at all**, specifically for the 4 currently-prioritized
personas (Growth Agencies / Designers / DTC Brands / Merch Operators)?

**Window:** trailing 30 days.
**Bot-free:** UA-regex filter + drop single-event sessions (matches the admin
`_bot_free_cte` chain).
**Pull script:** `~/curify-studio/dev/jayw/admin_analysis/use_case_chip_clicks_pull.py`

## Chip event shape

From `app/[locale]/_components/UseCaseChipsRow.tsx`:

- `action_type` = `CLICK`
- `content_id`  = `use-case:<slug>` (e.g. `use-case:for-designers`)
- `content_type` = `topic_capsule`
- `view_mode` = `cards`

Chip surfaces (per the component docstring):
- **EntryBar** (desktop, all pages — this is the main surface)
- `/nano-template/[slug]` (**mobile-only** — desktop already has EntryBar at top)
- `/nano-template/[slug]/example/[exampleId]` (**mobile-only**, same reason)
- Carousel overlay (any viewport — the overlay covers SiteTopBar)

## Headline

**53 use-case chip clicks in 30 days across all 10 personas.**
That is ~1.8 clicks/day for the entire chip surface. Context: 215 EntryBar-item
clicks + 4,786 other CLICK events in the same window. Chips are not a
meaningful discovery path today.

## Persona rank (all 10 personas, 30d)

| # | Persona | Clicks | Unique users | Unique sessions | Target-4 |
|---:|---|---:|---:|---:|:---:|
| 1 | Creators | 12 | 12 | 12 | |
| 2 | Designers | 10 | 8 | 8 | ★ |
| 3 | EdTech & Publishers | 6 | 6 | 6 | |
| 3 | ESL Learners | 6 | 4 | 4 | |
| 5 | Growth Agencies | 4 | 4 | 4 | ★ |
| 5 | Merch Operators | 4 | 4 | 4 | ★ |
| 5 | Parents | 4 | 3 | 3 | |
| 5 | DTC Brands | 4 | 4 | 4 | ★ |
| 9 | Programmatic SEO | 3 | 2 | 2 | |
| — | Freight Brokers | 0 | — | — | |

At this volume, rank is noisy — Creators 12 vs Designers 10 vs the four-way
tie at 4 is not statistically distinguishable.

## Target 4 personas — clicks by page-route family

| Route family | Growth Agencies | Designers | DTC Brands | Merch Operators |
|---|---:|---:|---:|---:|
| `/use-cases/[slug]` (chip-to-chip nav) | 3 | 6 | 3 | 1 |
| `/nano-template/[slug]/example/[exampleId]` | 1 | 1 | 0 | 1 |
| `/nano-template/[slug]` | **0** | **0** | **0** | **0** |
| `/topics/[slug]` | 0 | 0 | 1 | 1 |
| `/carousel/template-example/[slug]/[exampleId]` | 0 | 1 | 0 | 0 |
| `/inspiration-hub` | 0 | 1 | 0 | 0 |
| `/` | 0 | 1 | 0 | 0 |
| Other / null | 0 | 0 | 0 | 1 |
| **Total** | **4** | **10** | **4** | **4** |

## Findings

1. **Template pages (`/nano-template/[slug]`): 0 target-persona chip clicks
   in 30 days.** The chip surface is effectively invisible there.
2. **Example pages (`/nano-template/[slug]/example/[exampleId]`): 3 target-persona
   chip clicks in 30 days.** Barely a signal (1 each for Growth Agencies /
   Designers / Merch Operators; 0 for DTC Brands).
3. **Most target-persona chip clicks fire from `/use-cases/[slug]` itself
   (13 of 22, ~59%).** Users flipping between persona pages once already
   inside the use-cases hub — the chip is helping them switch personas, not
   entering the funnel.
4. **Freight Brokers = 0 clicks / 30 days.** Consistent with the low overall
   surface visibility of `for-forwarder-back-office`.
5. **Chip is mobile-only on template + example pages** (desktop already shows
   the full EntryBar), which partially explains #1 and #2 — but not fully,
   since EntryBar itself only pulled 215 clicks over the same 30 days.

## What we do NOT know

- **Impression / view rate.** Current tracking captures CLICK only, not VIEW.
  We cannot compute CTR on the chip row — the low absolute click count could
  be low visibility (nobody sees the chips) OR low interest (people see them
  and skip). Would require adding a VIEW event on the chip row to distinguish.

## Decision

**No product change now.** Documented as reference for future decisions. The
data is too low-signal to prioritize a chip redesign or removal; the more
useful next investment is instrumentation (see "What we do NOT know") before
touching the surface.

If the chip surface becomes a candidate for either doubling down or removal,
re-run the pull script and check whether the surface has crossed a
double-digit clicks-per-day threshold.

## Related

- Pull script: `~/curify-studio/dev/jayw/admin_analysis/use_case_chip_clicks_pull.py`
- Chip component: `app/[locale]/_components/UseCaseChipsRow.tsx`
- Persona registry: `lib/use-cases.ts`
- Chip label i18n: `messages/en/common.json` → `entryBar.useCases`
- Admin `chip_clicker` cohort (uses `content_id LIKE 'use-case%'`):
  `~/curify-studio/curify_background/app/crud/admin.py` line ~1053
- Workstream: `docs/workstream-seo-smm-growth.md` (Growth Analytics leg)
