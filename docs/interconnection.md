# Blog ⇄ Use Case ⇄ Tool — Interconnection Audit & Plan

_Last updated: 2026-05-17 (initial draft). Owner: jay. Update after every push that touches `BlogCTACard.tsx`, `ToolsGrid.tsx`, `UseCaseClient.tsx`, `tool-generic-client.tsx`, or the registry files (`lib/use-cases.ts`, `lib/tools-registry.ts`)._

## Why this doc exists

The blog catalog, the use-case landing pages, and the tools surface are the three GTM destinations. Today only the blog-side fans out cleanly (via `BlogCTACard`); the other two surfaces are largely dead-ends. A reader who lands on `/tools/video-dubbing` can't easily get to the relevant blog playbook; a reader on `/use-cases/for-marketers` has no path to a "how to ship distribution" post. That asymmetry caps the funnel: traffic compounds within one surface and leaks at the boundary.

This doc is the single source of truth for the interconnection work — what fans out where, what's still a dead-end, and what mappings drive each fan-out.

---

## Current cross-link inventory (2026-05-17)

| From → To | Blog | Tools | Use Cases | Templates | Contact / Mentor |
| --- | --- | --- | --- | --- | --- |
| **Blog post** (`/blog/[slug]`) | RelatedBlogs widget | `BlogCTACard` ✓ | `BlogCTACard` ✓ (nano-template / learning-education) | embedded grids on a few posts | `BlogCTACard` ✓ |
| **Tools index** (`/tools`) | — | tool cards (grouped video / image / audio) | — | — | — |
| **Tool detail** (`/tools/[slug]`) | **— gap (P0 #1)** | only via the index | **— gap (P0 #1)** | — | — |
| **Use case** (`/use-cases/[slug]`) | **— gap (P0 #2)** | `ToolsGrid` ✓ | sibling persona chips at the bottom ✓ | nano-template feed cards ✓ | — |

**Two-line summary:**
- Blogs already fan out to tools / use-cases / contact / mentor via `BlogCTACard`. Good.
- Tools and use-cases don't fan back into blogs, and tool detail pages don't fork to use-cases either. Bad.

Plus a data-side gap: `lib/use-cases.ts` currently has every persona mapped to the same two tools (`video-dubbing`, `bilingual-subtitles`). That's not signal; it's static boilerplate.

---

## What's already shipped (recent context)

| Date | Commit | What |
| --- | --- | --- |
| 2026-05-17 | `ac14131` | `BlogCTACard.tsx` — per-category fan-out from blog posts to tool / contact / mentor. |
| 2026-05-17 | `d6ca86a` | Expanded `BlogCTACard` mapping to cover nano-template + learning-education; introduced `ToolsGrid.tsx` so `/use-cases/[slug]` reuses the `/tools` card style. Plus 4 blog category reassignments. |
| 2026-05-17 | `cb5a074` | Earlier blog metaDescription / lastmod sweep — not interconnection per se, but shipped the categorization that the BlogCTACard map keys off. |

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

### Persona → Blog categories (new — needed by P0 #2)
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

### P0 #1 — Tool detail pages get "Related reading" + "Who it's for"
Edit `app/[locale]/(public)/tools/[slug]/tool-generic-client.tsx`. Add two sections above the existing "Why" / "FAQ" / "deep" blocks:

1. **Related reading** — pull blog posts whose `category` is in the tool's category list (from the [Tool slug → Blog categories table](#tool-slug--blog-categories-new--needed-by-p0-1) above). Top 3 by `lastmod` desc. Reuse the `RelatedBlogs` component from `app/[locale]/(public)/blog/[slug]/page.tsx:397`. The component currently filters by the current-blog's category; lift the filter into a prop so the tool detail page can pass its own categories list.
2. **Who it's for** — render `<UseCaseChipsRow filterTo={personas} />` where `personas` is the inverse of `USE_CASES[].toolSlugs` for this tool. With the new mapping table above, `video-dubbing` shows `[for-marketers, for-parents, for-esl-learners, for-creators]` (excluding designers and publishers).

### P0 #2 — Use case pages surface "Related reading"
Edit `app/[locale]/(public)/use-cases/[slug]/UseCaseClient.tsx`. Insert a "Related reading" block between the templates grid and the sibling persona chips at the bottom. 3-6 cards. Mapping from [Persona → Blog categories table](#persona--blog-categories-new--needed-by-p0-2).

Use the same `RelatedBlogs` component as in P0 #1.

### P0 #3 — Fix the flat tool mapping in `lib/use-cases.ts`
Replace the current uniform `["video-dubbing", "bilingual-subtitles"]` per persona with the [Persona → Tool slugs table](#persona--tool-slugs-replacement-for-the-current-flat-mapping-in-libuse-casests) above. Pure data change. After this lands:
- `ToolsGrid` on each use-case page becomes actually different per persona.
- The inverse-lookup on the tool detail page (#1) becomes meaningful.

### P1 — Tools index surfaces persona chips per tool card
On `/tools`, each tool card grows a small "for X / for Y" persona row at the bottom (deriving from `lib/use-cases.ts` reverse lookup). Visual polish, weaker ROI than fixing the dead-ends — defer to P1.

### P1 — Per-post tool override on blog posts (overrides `CREATOR_TOOL_OVERRIDES`)
Already partially in `BlogCTACard.tsx` for two posts. Grow the table to cover the long-tail creator-tools posts that map to specific tools (e.g. `lip-sync-business-guide → /tools/lip-sync` once that tool exists).

### P1 — Inline mid-post CTA on long blog posts
On the `docs/blog-quality.md` shortlist (#4 there). When this lands, it interacts with this doc — the inline CTA should reuse the same `BlogCTACard` category mapping so blog → tool / contact stays one source of truth.

### P2 — Add a "What tools were used" tag on individual blog posts
Per-post structured pointer that's stronger than the category default. Useful for engineering deep-dives that mix multiple tools. Not urgent; revisit once P0 #1-3 ship.

---

## Suggested sequencing

1. **Day 1:** P0 #3 (data — 5 minutes) + P0 #1 (tool-detail wiring — ~1 hour with i18n strings). Single commit.
2. **Day 2:** P0 #2 (use-case wiring). Separate commit.
3. **Day 3:** Re-run the local QA — visit one tool detail page, one use-case page, one blog post; confirm bidirectional cross-links. Update this doc with "what shipped" rows + check off the resolved gaps in the inventory table.

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

---

_This doc is the GTM connectivity layer. Update after every push that touches the surfaces or registries above._
