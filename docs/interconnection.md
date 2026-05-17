# Blog ⇄ Use Case ⇄ Tool — Interconnection Audit & Plan

_Last updated: 2026-05-18 (all P0 shipped + P1 top-traffic CTA audit). Owner: jay. Update after every push that touches `BlogCTACard.tsx`, `ToolsGrid.tsx`, `UseCaseClient.tsx`, `tool-generic-client.tsx`, or the registry files (`lib/use-cases.ts`, `lib/tools-registry.ts`)._

## Why this doc exists

The blog catalog, the use-case landing pages, and the tools surface are the three GTM destinations. Today only the blog-side fans out cleanly (via `BlogCTACard`); the other two surfaces are largely dead-ends. A reader who lands on `/tools/video-dubbing` can't easily get to the relevant blog playbook; a reader on `/use-cases/for-marketers` has no path to a "how to ship distribution" post. That asymmetry caps the funnel: traffic compounds within one surface and leaks at the boundary.

This doc is the single source of truth for the interconnection work — what fans out where, what's still a dead-end, and what mappings drive each fan-out.

---

## Google traffic context (May 2026, 30-day window)

Source: GSC export `Pages.csv` at the repo root (1,022 URLs total — 1,194 clicks, 60,785 impressions).

| Surface | Pages | Clicks | Impressions | CTR |
| --- | --- | --- | --- | --- |
| Nano-template **example** detail | 188 | 225 | 4,604 | 4.89% |
| **Blog** posts | 163 | 206 | **31,879** | 0.65% |
| Nano-template detail (index per template) | 178 | 199 | 6,556 | 3.04% |
| Gallery prompt detail | 234 | 147 | 4,860 | 3.02% |
| Home (`/`) | 1 | 127 | 2,577 | 4.93% |
| Gallery prompt tag pages | 63 | 58 | 3,408 | 1.70% |
| **Tools** | 19 | 45 | 1,859 | 2.42% |
| Topics | 19 | 8 | 339 | 2.36% |
| **Use cases** | 2 | 1 | 34 | 2.94% |

**Reads of the data — directly drives the priority ranking below:**

- **Blog is the dominant acquisition surface.** 52% of all impressions (31,879 / 60,785) land on blog URLs. CTR is dismal (0.65%) so most impressions never reach the post — that's the blog-quality.md bleeder track. Once a reader DOES land, the `BlogCTACard` fan-out is the conversion lever. Strengthening blog → tool / use-case / contact is the **single highest-leverage interconnection axis**.
- **Nano-template detail + example pages already get 35% of clicks** (424 / 1,194 total). Healthier surface than blog at the click step, but those pages have their own in-hero topic chips + use-case chips and don't yet route readers into the conversion funnel.
- **Tools surface is under-leveraged.** 45 clicks across 19 pages. `/tools/video-dubbing` ranks at position **55.7** (still below the visible page); CTR on tools listings is 2.42%. Tool detail dead-ends (no outbound to blogs, use-cases, or other tools) compound the under-leverage — once a user arrives, there is no path to deepen the visit.
- **Use cases are essentially invisible to Google** — 1 click in 30 days. Until GSC discovers them, the only realistic traffic path is internal (blog → use-case, tool → use-case). Use-case interconnection is "build for future demand" rather than "harvest current funnel."

**Top 5 single-page traffic sources** (where every fan-out improvement compounds):

| URL | Clicks | Impr | CTR | Position |
| --- | --- | --- | --- | --- |
| `/` (home) | 127 | 2,577 | 4.93% | 5.59 |
| `/ko/blog/character-prompt-generator` | 25 | 355 | 7.04% | 7.53 |
| `/es/blog/asl-video-translator` | 23 | 300 | 7.67% | 6.71 |
| `/blog/mbti-character-generator` | 22 | 448 | 4.91% | 6.44 |
| `/tools/video-dubbing` | 15 | 594 | 2.53% | 55.70 |

**Top 5 high-impression bleeders** (low CTR — `docs/blog-quality.md` owns the title/meta rewrites, listed here as cross-reference):

| URL | Impressions | Clicks | CTR | Position |
| --- | --- | --- | --- | --- |
| `/blog/image-generation-model-comparison` | 5,180 | 2 | 0.04% | 7.88 |
| `/blog/f5-tts-voice-cloning` | 3,579 | 9 | 0.25% | 7.25 |
| `/blog/what-is-voice-cloning` | 1,933 | 0 | 0% | 11.81 |
| `/blog/10-prompting-tips-video-generation` | 1,251 | 0 | 0% | 8.16 |
| `/blog/voice-cloning-tools` | 913 | 0 | 0% | 6.76 |

---

## Current cross-link inventory (2026-05-17)

| From → To | Blog | Tools | Use Cases | Templates | Contact / Mentor |
| --- | --- | --- | --- | --- | --- |
| **Blog post** (`/blog/[slug]`) | RelatedBlogs widget | `BlogCTACard` ✓ | `BlogCTACard` ✓ (nano-template / learning-education) | embedded grids on a few posts | `BlogCTACard` ✓ |
| **Tools index** (`/tools`) | — | tool cards (grouped video / image / audio) | — | — | — |
| **Tool detail** (`/tools/[slug]`) | **`RelatedBlogsByCategory` ✓ (P0 #1a)** | **`ToolsGrid` of siblings ✓ (P0 #1c)** | **`UseCaseChipsRow` + linked "Who Uses" headers ✓ (P0 #1b)** | — | — |
| **Use case** (`/use-cases/[slug]`) | **`RelatedBlogsByCategory` ✓ (P0 #3)** | `ToolsGrid` ✓ (now persona-tailored after P0 #2) | sibling persona chips at the bottom ✓ | nano-template feed cards ✓ | — |

**Three-line summary:**
- Blogs already fan out to tools / use-cases / contact / mentor via `BlogCTACard`. Good.
- Tools detail pages don't fan to blogs, use-cases, or sibling tools — every tool page is a dead-end. Bad and under-leveraged given the small but non-zero tool traffic.
- Use-case pages don't link to blogs, though use-case traffic is currently near-zero so this is the lower-priority gap.

Plus a data-side gap: `lib/use-cases.ts` currently has every persona mapped to the same two tools (`video-dubbing`, `bilingual-subtitles`). That's not signal; it's static boilerplate.

---

## What's already shipped (recent context)

| Date | Commit | What |
| --- | --- | --- |
| 2026-05-17 | `ac14131` | `BlogCTACard.tsx` — per-category fan-out from blog posts to tool / contact / mentor. |
| 2026-05-17 | `d6ca86a` | Expanded `BlogCTACard` mapping to cover nano-template + learning-education; introduced `ToolsGrid.tsx` so `/use-cases/[slug]` reuses the `/tools` card style. Plus 4 blog category reassignments. |
| 2026-05-17 | `cb5a074` | Earlier blog metaDescription / lastmod sweep — not interconnection per se, but shipped the categorization that the BlogCTACard map keys off. |
| 2026-05-17 | `4d2dbeb` | **P0 #1 + #2 shipped.** Per-persona tool ordering in `lib/use-cases.ts` (designers now an empty list — honest; publishers single tool). Tool detail page gains three outbound sections — "Who it’s for" persona chips, "Related tools" sibling-group grid, "Related reading" blog cards. Each "deep.usecases" subsection header on the tool page is now a Link to its persona use-case page so the in-prose "Who Uses X?" section gains the same fan-out. New helpers: `getPersonasForTool` in `lib/use-cases.ts`, `getSiblingTools` + `TOOL_BLOG_CATEGORIES` in `lib/tools-registry.ts`. New component: `RelatedBlogsByCategory.tsx` (sibling of `RelatedBlogs` that takes a categories list instead of a current-slug). 3 new i18n keys under `interconnection.*` fanned out to all 9 non-en locales. |
| 2026-05-18 | `e07be2c` | **P0 #3 shipped.** `/use-cases/[slug]` now renders a "Related reading" block between the templates grid and the sibling persona chips, pulling from `PERSONA_BLOG_CATEGORIES` in `lib/use-cases.ts` (per `docs/interconnection.md` Persona → Blog categories table). Max 6 cards, sorted by `lastmod` desc. Reuses the `RelatedBlogsByCategory` component shipped with P0 #1. |
| 2026-05-18 | _(pending push)_ | **P1 top-traffic CTA audit shipped.** `BlogCTACard.tsx` gains a per-post full-override mechanism (`BLOG_POST_OVERRIDES`). Four top-traffic posts now bypass their category default and route to higher-intent destinations: `character-prompt-generator` and `mbti-character-generator` → `/topics/character` + `/use-cases/for-creators`; `10-prompting-tips-nano-banana` → `/topics/character` + `/tools`; `ai-collage-digital-wallpaper-guide` → `/topics/design` + `/use-cases/for-designers`. `asl-video-translator` and `f5-tts-voice-cloning` already route well via category default and need no override. |

---

## Mapping tables driving the fan-outs

These are the load-bearing data shapes. Whenever the catalog changes, these tables get updated.

### Blog category → BlogCTACard target (current — already wired in `BlogCTACard.tsx`)
| Blog category | Primary CTA | Secondary CTA |
| --- | --- | --- |
| `video-translation-dubbing` / `video-dubbing` | `/tools/video-dubbing` | `/contact` |
| `creator-tools` | per-post tool override OR `/tools` index | _none_ |
| `ds-ai-engineering` | MentorCruise | `/contact` |
| `content-automation` | `/contact` | Calendly direct |
| `nano-template` | `/contact` | `/tools` |
| `learning-education` | `/contact` | `/tools` |

Per-post creator-tools overrides table is `CREATOR_TOOL_OVERRIDES` in `BlogCTACard.tsx`. Two entries today: `video-transcription-business-guide → /tools/video-transcription`, `10-prompting-tips-video-generation → /tools/video-dubbing`. Grow it as new posts ship.

**Per-post full-override table** is `BLOG_POST_OVERRIDES` in `BlogCTACard.tsx` — used when a high-traffic post deserves a fundamentally different CTA than its category default, not just a different tool URL. Current entries (driven by the GSC top-traffic audit):

| Slug | Default (would-be) | Override primary | Override secondary |
| --- | --- | --- | --- |
| `character-prompt-generator` | `/tools` (creator-tools) | `/topics/character` | `/use-cases/for-creators` |
| `mbti-character-generator` | `/contact` (nano-template) | `/topics/character` | `/use-cases/for-creators` |
| `10-prompting-tips-nano-banana` | `/contact` (nano-template) | `/topics/character` | `/tools` |
| `ai-collage-digital-wallpaper-guide` | `/contact` (nano-template) | `/topics/design` | `/use-cases/for-designers` |

Add an entry when a top-clicked post's category default sends readers somewhere noticeably off-intent.

### Tool slug → Blog categories (new — needed by P0 #1)
For the "Related reading" block on tool detail pages. Filters `public/data/blogs.json` server-side.

| Tool slug | Blog categories to surface |
| --- | --- |
| `video-dubbing` | `video-translation-dubbing`, `video-dubbing` |
| `bilingual-subtitles` | `video-translation-dubbing`, `creator-tools` |
| `voice-clone` | `video-translation-dubbing` |
| `speech-translator` | `video-translation-dubbing` |
| `video-transcription` | `creator-tools`, `video-translation-dubbing` |

### Persona → Tool slugs (replacement for the current flat mapping in `lib/use-cases.ts`)
| Persona | Tools (ordered by relevance) |
| --- | --- |
| `for-marketers` | `video-dubbing`, `bilingual-subtitles` |
| `for-parents` | `bilingual-subtitles`, `video-dubbing` |
| `for-esl-learners` | `bilingual-subtitles`, `voice-clone` |
| `for-creators` | `video-dubbing`, `bilingual-subtitles`, `speech-translator` |
| `for-designers` | _(empty — designers use templates, not video tools today)_ |
| `for-publishers` | `bilingual-subtitles` |

The `for-designers` empty list is deliberate. Render the persona chip on the tool-detail page only if the tool appears in any persona's list — designers don't show up under the video-dubbing "Who's it for" because they don't ship video.

### Tool slug → Sibling tools (new — needed by P0 #1c)

For the "Related tools" block on each tool detail page. Drives in-product tool-use depth. Derived from the `groupId` in `lib/tools-registry.ts`, so this table reflects the current registry and updates automatically when a new tool is added:

| Group | Tools (siblings cross-link within group) |
| --- | --- |
| `video` | `video-dubbing`, `bilingual-subtitles`, `video-transcript-generator`, `youtube-subtitle-downloader`, `video-subtitle-extractor`, `translate-subtitles`, `video-summarizer`, `storyboard-generator` |
| `image` | `image-translation`, `manga-translation`, `style-transfer` |
| `audio` | `voice-clone`, `speech-translator` |

Render top 3 same-group siblings, excluding the current tool. Cap at 3 to keep the section dense. Skip the section entirely if a group has only one tool (image / audio rule out today's `style-transfer` if only it ships, etc.).

### Persona → Blog categories (new — needed by P0 #3)
For the "Related reading" block on use-case pages.

| Persona | Blog categories to surface |
| --- | --- |
| `for-marketers` | `content-automation`, `creator-tools` |
| `for-parents` | `learning-education` |
| `for-esl-learners` | `video-translation-dubbing`, `learning-education` |
| `for-creators` | `creator-tools`, `nano-template` |
| `for-designers` | `nano-template` |
| `for-publishers` | `nano-template`, `learning-education` |

Top N (likely 3-6) by `lastmod` desc within those categories, rendered with the existing `RelatedBlogCard` component.

---

## Next-up shortlist

**Prioritization read of the GSC data:** Blog is the biggest acquisition surface (52% of impressions) and routes via `BlogCTACard` ✓. The next highest-leverage gaps are **tool detail outbound** (small surface but every visitor is at the bottom of the funnel, and today they hit a dead-end) and **fixing the persona→tools mapping data** (unblocks both tool-detail "Who it's for" and use-case `ToolsGrid` differentiation). Use-case → blog is real interconnection but ranks lower since use-case traffic is currently 1 click / 30 days.

### ~~P0 #1 — Tool detail pages get three outbound sections~~ ✓ shipped 2026-05-17
Edit `app/[locale]/(public)/tools/[slug]/tool-generic-client.tsx`. Add three sections above the existing "Why" / "FAQ" / "deep" blocks. **Biggest leverage point in this plan** — every tool visitor is at the bottom of the conversion funnel, today's tools surface gets 45 clicks / 1,859 impressions in 30 days, and every dead-end tool page wastes the intent.

**#1a — Related reading.** Pull blog posts whose `category` is in the tool's category list (from the [Tool slug → Blog categories table](#tool-slug--blog-categories-new--needed-by-p0-1) above). Top 3 by `lastmod` desc. Reuse the `RelatedBlogs` component from `app/[locale]/(public)/blog/[slug]/page.tsx:397`. Lift the filter from the current-blog's category into a prop so the tool detail page can pass its own list.

**#1b — Who it's for.** Render `<UseCaseChipsRow filterTo={personas} />` where `personas` is the inverse of `USE_CASES[].toolSlugs` for this tool. With the new mapping table below, `video-dubbing` shows `[for-marketers, for-parents, for-esl-learners, for-creators]`.

**#1c — Related tools.** Same-group sibling tools (3 max) from the [Tool slug → Sibling tools table](#tool-slug--sibling-tools-new--needed-by-p0-1c). Reuse the existing `ToolsGrid` component with a 3-column layout. Directly addresses the **tool-use-depth** gap — keeps users in the tool funnel instead of bouncing back to `/tools` index or leaving.

### ~~P0 #2 — Fix the flat persona→tools mapping in `lib/use-cases.ts`~~ ✓ shipped 2026-05-17
**Pure data change. Prerequisite for P0 #1b** — the inverse-lookup on the tool detail page can't produce meaningful persona chips while every persona maps to the same two tools.

Replace the current uniform `["video-dubbing", "bilingual-subtitles"]` per persona with the [Persona → Tool slugs table](#persona--tool-slugs-replacement-for-the-current-flat-mapping-in-libuse-casests) below.

After this lands:
- `ToolsGrid` on each use-case page becomes actually different per persona.
- The inverse-lookup on the tool detail page (#1b) becomes meaningful.
- 5 minutes of edit time.

### ~~P0 #3 — Use case pages surface "Related reading"~~ ✓ shipped 2026-05-18
Edit `app/[locale]/(public)/use-cases/[slug]/UseCaseClient.tsx`. Insert a "Related reading" block between the templates grid and the sibling persona chips at the bottom. 3-6 cards. Mapping from [Persona → Blog categories table](#persona--blog-categories-new--needed-by-p0-3).

**Lower than #1 because use-case traffic is currently 1 click / 30 days** — this is "build for future demand," not "harvest current funnel." Worth shipping in the same week since it's quick and the symmetry matters once GSC starts indexing the persona pages.

### ~~P1 — Internal-link strength from high-traffic blog posts~~ ✓ shipped 2026-05-18
First-pass audit complete. The four worst-routed top-traffic posts (`character-prompt-generator`, `mbti-character-generator`, `10-prompting-tips-nano-banana`, `ai-collage-digital-wallpaper-guide`) now route via `BLOG_POST_OVERRIDES` to `/topics/character` or `/topics/design` plus a persona use-case — the actual destinations readers came for. `asl-video-translator` and `f5-tts-voice-cloning` already routed well via the `video-translation-dubbing` category default and got no override.

Re-audit after the next GSC re-pull (4-week cadence) — if a freshly-trending post deserves the override treatment, add an entry to `BLOG_POST_OVERRIDES` in `BlogCTACard.tsx`.

### P1 — Tools index surfaces persona chips per tool card
On `/tools`, each tool card grows a small "for X / for Y" persona row at the bottom (deriving from `lib/use-cases.ts` reverse lookup). Visual polish; weaker ROI than fixing the dead-ends. Pairs naturally with P0 #2.

### P1 — Per-post tool override on blog posts (extend `CREATOR_TOOL_OVERRIDES`)
Already partially in `BlogCTACard.tsx` for two posts. Grow the table to cover the long-tail creator-tools posts that map to specific tools.

### P1 — Inline mid-post CTA on long blog posts
On the `docs/blog-quality.md` shortlist (#4 there). When this lands, the inline CTA should reuse the same `BlogCTACard` category mapping so blog → tool / contact stays one source of truth.

### P2 — Add a "What tools were used" tag on individual blog posts
Per-post structured pointer that's stronger than the category default. Useful for engineering deep-dives that mix multiple tools. Not urgent; revisit once P0 #1-3 ship.

---

## Suggested sequencing

1. **Day 1:** P0 #2 (data — 5 min) + P0 #1 (a + b + c, tool-detail wiring — ~1.5 hours). Single commit. Biggest funnel-leverage win.
2. **Day 2:** P0 #3 (use-case "Related reading"). Separate commit.
3. **Day 3:** Re-run local QA — visit one tool detail page, one use-case page, one blog post; confirm bidirectional cross-links. Update this doc's inventory table + add "what shipped" rows.
4. **Week 2:** P1 #4 (high-traffic blog post audit) — use the [Top 5 single-page traffic sources](#google-traffic-context-may-2026-30-day-window) above as the input list.
5. **Re-pull GSC after 4 weeks** — measure whether tools / use-case page clicks moved. If tool detail page sessions go up but tool-page bounce stays high, the dead-end fix isn't enough and the next experiment is mid-page CTAs or feature highlights.

---

## Where things live

| Surface | Path |
| --- | --- |
| Blog CTA card (category-aware fan-out) | `app/[locale]/_components/BlogCTACard.tsx` |
| Tools grid (shared between `/tools` and `/use-cases`) | `app/[locale]/_components/ToolsGrid.tsx` |
| Use-case chips row | `app/[locale]/_components/UseCaseChipsRow.tsx` |
| Related blogs widget | `app/[locale]/_components/RelatedBlogs.tsx` (used in blog `[slug]/page.tsx`) |
| Tool detail page | `app/[locale]/(public)/tools/[slug]/tool-generic-client.tsx` |
| Use-case page | `app/[locale]/(public)/use-cases/[slug]/UseCaseClient.tsx` |
| Use-case registry | `lib/use-cases.ts` |
| Tools registry | `lib/tools-registry.ts` |
| Blog catalog | `public/data/blogs.json` |
| Blog i18n content | `messages/<locale>/blog.json` |
| Sibling status docs | `docs/blog-quality.md`, `docs/search-quality.md` |
| GSC export (refresh monthly) | `Pages.csv` at repo root |

---

_This doc is the GTM connectivity layer. Update after every push that touches the surfaces or registries above._
