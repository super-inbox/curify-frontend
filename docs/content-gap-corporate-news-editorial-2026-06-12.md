# Content gap: Corporate news editorial hero illustration

**Date:** 2026-06-12
**Source:** `raw/content-gap-06-11/meta_layoff.jpeg` — third-party article hero (Meta layoff coverage, OutLever / State of AI byline)
**Outcome:** New template `template-corporate-news-editorial-hero` shipped

## The gap

The source image is a standard business-news editorial hero: monochrome
illustration with a single brand-color accent on the company logo. This
style is bread-and-butter for publishers covering corporate strategy,
layoffs, fundraises, product launches, regulatory news — Stratechery,
The Information, Axios, OutLever, B2B SaaS newsletter writers all
produce one per article.

Curify's existing template catalog covered adjacent shapes:

| Template | What it generates | Fit for corporate-news hero |
|---|---|---|
| `template-iconic-sports-event-analysis-poster` | Cinematic sports retrospective poster | Sports-coded, tonally wrong |
| `template-hot-event-analysis` | Analytical 3-tier infographic with cause / impact | Strong companion piece, but portrait, infographic — not a hero |
| `template-weird-science-facts-infographic` | Kawaii pastel educational panels | Tonally catastrophic on serious news |
| `template-iconic-sports-event-analysis-poster` (other variants) | Sports-themed | All wrong tone |

Each could be force-fit, but the result was visibly off (see eyeball
batch at `raw/content-gap-06-11/eyeball/` for proof). The shape /
visual language / tone of a template are not free parameters — they're
baked into the base_prompt. Filling the gap requires a new template,
not a creative use of an existing one.

## The eyeball comparison

Four generations of the Meta layoff story via different templates:

1. **NEW corporate-news-editorial-hero** — nailed the source. Monochrome + Meta blue accent on logo, "PERSONAL ITEMS" boxes, crowd of stylized workers exiting Meta HQ. 3:2 landscape, article-header-ready.
2. **template-hot-event-analysis** — analytical infographic. Different use case (deep-dive companion piece, not hero), but strong and usable.
3. **template-sports-iconic-event-analysis-poster** — gold-metallic sports aesthetic on layoff news. Tonal mismatch obvious.
4. **template-weird-science-facts-infographic** — kawaii pastel pivoting chameleon and smiling severance coins. Tonally catastrophic.

Validation: the new prompt did approximate the source style on the first
generation; Gemini 3 Pro Image executes the monochrome-with-single-accent
technique cleanly. Style is viable.

## The new template

**`template-corporate-news-editorial-hero`** (ships 2026-06-12)

- One param: `event_info` (combines event description + company name +
  brand color hex + scene specifics)
- Topics: `["design", "posters", "trending", "ai", "character"]`
- rank_score: 90 (median)
- Style: monochrome editorial illustration with single brand-color
  accent, 3:2 landscape, paper / newsprint texture overlay
- Seed example: Meta $115M Workforce Academy pivot

Three other Meta layoff examples were also ingested (via the existing
sports / weird-science / hot-event templates) so each template's content
library grows alongside, and the comparative eyeball remains discoverable
on the topic pages.

## Adjacent gaps to consider (queued)

The corporate-news hero unlocks a vertical for business-content
publishers. Adjacent template families that fit the same publisher
audience:

- `template-corporate-strategy-pivot-infographic` — companion to the
  hero, showing the strategic pivot timeline / before-after / numbers
- `template-funding-announcement-editorial-hero` — Series A / IPO /
  M&A announcements in the same monochrome-with-accent style
- `template-industry-trend-editorial-hero` — industry-wide stories
  without a single company centerpiece
- `template-regulatory-action-editorial-hero` — antitrust / SEC /
  FTC / EU news, with government building setting

Each of these is a separate template, not a parameter of the same
template — same finding as this exercise: tone + composition are
template-shaped, not param-shaped.
