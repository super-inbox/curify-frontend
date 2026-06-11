# SEO opportunity — Business news visualization (3-tier taxonomy demo, 2026-06-12)

_Strategic batch — KD analysis + the 3-tier-taxonomy positioning angle the user surfaced 2026-06-12. Pair with `docs/blog-quality.md` and the prior 2026-06-10/11 KD batches (flashcards + travel)._

_Owner: jay. Last updated: 2026-06-12._

## The strategic angle

Curify's generation + visual-search engine composes three orthogonal axes:

1. **Subject / event** — what the visualization is about (a company, an industry move, an earnings beat, a founder, a product launch)
2. **Information type** — the cognitive shape of the visual (comparison, timeline, profile, explainer)
3. **Layout / style** — the design language (infographic poster, retro vintage card, ink-wash, minimal, isometric)

Most "AI infographic" tools (Venngage, Piktochart, Canva) ship templates one-by-one. Curify's engine composes the three axes — *"Tesla vs Rivian, as a competitor comparison infographic, in retro-vintage style"* is a single prompt that traverses all three tiers.

**Business news visualization** is a high-leverage demo of the 3-tier framing because:
- Every business news event maps cleanly onto info-type (timeline / comparison / profile / explainer)
- The audience is large and underserved (analysts, founders, investors, B2B marketers, content creators)
- KD is achievable (12-40 across the batch)
- CPC signals high commercial intent ($3-10), so even modest traffic monetizes well

## KD data (8 queries, ~1,370 combined vol/mo)

| Query | Intent | KD | Vol | CPC | Read |
|---|---|---|---|---|---|
| **competitor comparison** | I + C | 25 🟢 | **480** | $8.64 | Highest vol; head term + commercial intent |
| business infographic | I | 33 🟡 | 210 | $4.10 | Borderline KD, broad |
| **company timeline** | I | **17 🟢** | 210 | $3.11 | **Lowest KD with decent vol** |
| business timeline | I | 26 🟢 | 170 | $9.33 | Good KD, high CPC |
| company infographic | I | 40 🟡 | 90 | $9.51 | Higher KD; defer |
| startup infographic | I | 24 🟢 | 90 | $0.00 | Niche, green-dot |
| **company comparison** | I + C | **12 🟢🟢** | 70 | $10.39 | **Easiest KD in batch**, highest CPC, commercial intent |
| business infographic template | I | 30 🟡 | 50 | $3.21 | Template intent |

**Skip:** business planning template, business case study, etc — none of these surfaced in the user's pull, treat as out-of-scope.

## Curify template inventory (selected, by info-type)

### Comparison templates (anchors for "competitor / company comparison")
- **`template-finance-comparison-infographic`** — 2026-06-08 freed of the misleading `product` topic tag (taxonomy commit `a5b02600`); now properly positioned for the comparison-infographic family. **Primary anchor for the flagship comparison post.**
- `template-historical-figure-vs-infographic` — adapt: founder-vs-founder, CEO-vs-CEO
- `template-animation-studio-comparison-infographic` — direct studio-comparison pattern, transferable to company-vs-company
- `template-east-asian-culture-comparison-infographic` — broader 1v1 cultural comparison pattern
- `template-then-vs-now-comparison-infographic` — temporal comparison (good for "company before/after IPO")
- `template-character-comparison` / `template-mbti-contrast` / `template-language-word-comparison-educational-poster` — generic 1v1 patterns to borrow visual structure from

### Timeline templates (anchors for "company / business timeline")
- **`template-history-timeline-infographic`** — primary anchor
- **`template-evolution-timeline-infographic`** — secondary; especially strong for company-product-line evolution
- `template-flowing-journey-infographic` — flowing journey arc
- `template-personal-journey-wolf-path-illustration` — visual variant
- `template-life-journey-curve-infographic` — curve-style journey
- `template-clothing-evolution-poster` — visual transferable to product-line evolution

### Profile / business templates
- `template-financial-habit-infographic-poster` — anchor for individual founder / financial story infographics
- `template-cartoon-character-profile-card-kawaii-style` — adapt for founder profile cards

## Blog topic recommendations

### Tier 1 — flagship 3-tier-taxonomy demonstration (P0)

1. **Company Comparison Infographics: AI Templates for Competitor Battles** — combines:
   - "company comparison" (KD 12 🟢🟢, vol 70)
   - "competitor comparison" (KD 25 🟢, vol 480)
   - "business infographic" tail (KD 33 🟡, vol 210)
   - **Combined: ~760 vol/mo at KD 12-33**
   - Anchor: `template-finance-comparison-infographic` (just freed up — perfect fit), plus borrowed visual patterns from `template-historical-figure-vs-infographic` and `template-animation-studio-comparison-infographic`
   - **The flagship post for demonstrating the 3-tier composability** — same comparison engine renders Tesla vs Rivian as an infographic OR as a retro vintage card OR as a minimal-data-viz panel
   - Worked examples: Tesla vs Rivian (EV), OpenAI vs Anthropic (AI), Shopify vs Webflow (B2B SaaS), Stripe vs PayPal (payments)

### Tier 1 — Timeline post (P0, sibling to flagship)

2. **Company Timeline Infographics: AI Templates for Founder-to-IPO Stories** — combines:
   - "company timeline" (KD 17 🟢, vol 210)
   - "business timeline" (KD 26 🟢, vol 170)
   - **Combined: ~380 vol/mo at KD 17-26**
   - Anchor: `template-history-timeline-infographic` + `template-evolution-timeline-infographic`
   - Worked examples: Apple 1976-2026, Tesla 2003-2025, Stripe 2009-2025, Shopify 2006-2025
   - Demonstrates the same engine on a different info-type (timeline vs comparison) — second proof-point of the 3-tier composability

### Tier 2 — niche / lower-KD spokes (P1)

3. **Startup Infographic Templates** — KD 24 🟢, vol 90. Anchor on `template-financial-habit-infographic-poster` + a founder-profile card variant. Niche, but green-dot.

### Tier 3 — defer

4. **Business Infographic Templates (hub)** — KD 30 🟡, vol 50. Higher effort for less return; queue as a hub after Tier 1+2 ship.

### Skip
- company infographic (KD 40) — too hard, vol thin

## Hub-and-spoke shape

```
                  ┌─ Flagship: Company Comparison Infographics (P0, ~760 vol)
3-tier taxonomy ──┤
positioning      ├─ Company Timeline Infographics (P0, ~380 vol)
                 └─ Startup Infographic Templates (P1, ~90 vol)
```

All three posts reference back to the 3-tier framing in their intro (subject × info-type × style), making the *engine* visible as a Curify differentiator. Cross-link aggressively.

## Estimated ROI if Tier 1 ships

- Combined addressable: ~1,140 vol/mo
- KD: 12-26 (all green-dot)
- Realistic capture at SERP pos 5-8 with 4-6% CTR: **45-70 clicks/month** organic
- Plus the strategic-positioning value of demonstrating the 3-tier composability angle to potential B2B users and partners

CPC signal ($3-10) suggests these readers convert into paid-tier users at meaningfully higher rates than the consumer-style flashcard/travel content (CPC $0.30-1.00). Worth the priority.

## Tasks queued

- **#91** — Tier 1 #1: Company Comparison Infographics flagship (KD 12-33, vol 760 combined)
- **#92** — Tier 1 #2: Company Timeline Infographics (KD 17-26, vol 380 combined)
- **#93** — Tier 2: Startup Infographic Templates (KD 24, vol 90)
- **#94** — Backlog: Business Infographic Templates hub (KD 30, vol 50)

## Cross-refs

- `docs/seo-flashcard-learning-batch-2026-06-10.md` — flashcard batch (T1 shipped, T2 partial)
- `docs/seo-travel-batch-2026-06-10.md` — travel batch (T1 shipped, T2 pending)
- `docs/blog-quality.md` — master log
- `feedback_template_topic_source_of_truth.md` — nano_templates.json topics source of truth (relevant when SEO-tagging the finance-comparison template into the new "business" subject if we register it)
- `feedback_bundled_blog_ship_pattern.md` — bundle 2-3 posts in one shipping window if the user greenlights multiple
