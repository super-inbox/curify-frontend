# Use Case — Brand Design Studios (New-Consumer / 大健康)

> **Filed:** 2026-07-03 · **Status:** outreach demo asset (not yet a shipped
> `/use-cases/for-brand-design-studios` landing page). Use this as the
> template for showing a boutique brand-design studio owner what Curify's
> workflow looks like end-to-end for their category.
> **Related doc:** `docs/workstream-vertical-use-cases.md` (index).
> **Reproducible pipeline:** `scripts/oneoff_brand_design_workflow_demo_2026-07-03.cjs`
> + `scripts/oneoff_brand_design_portfolio_pdf_2026-07-03.sh`.

---

## Who this is for

Small-to-mid boutique brand design studios (10+ years of experience,
5–20 staff, do proposal-heavy work for new-consumer / 新消费 / 大健康
brands). Owner/creative-director persona.

Their pain, distilled:
- Client requests moodboards for direction-setting → they scrape Pinterest
  and hand-cut collages, 1–2 days per proposal.
- Once direction is picked, "make the main subject bigger / smaller /
  more central" is a full re-render loop — every tweak feels like a
  fresh card pull.
- After the visual is signed off, translating to production assets
  (paper cups, tote bags, gift boxes, standard packaging) is another
  round of manual work + drift.

They already know how to design. What they lack is a *speed layer*
that removes the Pinterest-hunt / gacha-regeneration / print-adaptation
tax without giving up creative control.

---

## The 3-panel "contrast puzzle" framework

Do NOT lead with pretty pictures. Lead with the **workflow**. A senior
designer respects craft, not screenshot dumps. Each panel demonstrates
one leverage point over the incumbent workflow:

| Panel | 中文 name | Deliverable | Payload / promise |
|---|---|---|---|
| **1 · 意图探索** | 提案前置 · 情绪板 | 3 direction moodboards for the same brief (hero + swatches + material intent) | Replaces Pinterest scraping — 3 direction options in seconds |
| **2 · 变量微调** | 中期控管 · 精确控制 | Same locked direction, 3 renders with ONE knob moved (e.g. subject-scale 10/20/30%) | Precise variable control — not gacha regeneration |
| **3 · 落地延展** | 后期落地 · 打印模版 | Same visual applied to paper cup, tote, lid-and-base gift box | Production-ready, not concept art — the "杀伤力最大的一招" |

Ship it as a 5-page PDF (cover + 3 panel pages + partnership/CTA
page), NOT a single stitched image. A senior designer expects a
proper deck.

---

## Reproducing the demo for a new prospect

### Step 1 — Pick a virtual brief

Match the studio's actual portfolio niche. The default reference is
**Oriental botanical herbal tea packaging** (「东方植物草本风 · 茶饮包装」).
Swap if their portfolio is dominated by beauty / snacks / wellness /
pet, etc.

Locked case parameters used in the reference build:

```
Brand:    「青野」 (Qingye)
Product:  白毫银针 (Silver Needle white tea)
Aesthetic: minimalist Zen white-space + hand-painted botanical
Palette:  sage green #A7B39A · cream #F5EFE3 · warm ink #2C2A25 · gold-leaf #C0A15C
```

For a new brief, change: brand name (Chinese preferred), product,
aesthetic keywords, palette hexes. Keep the layout constant so
Panel 2 (variable tuning) can reuse the same-asset-different-scale
demo trick.

### Step 2 — Generate the 9 workflow frames

```bash
node scripts/oneoff_brand_design_workflow_demo_2026-07-03.cjs
```

Produces 9 images at `raw/brand-design-portfolio/`:

- `panel1_moodboard_{zen,apothecary,modern}.jpg` — 3 direction options
  for Panel 1. Each is a magazine-style moodboard composite carrying
  hero visual + color swatches with hex + material intent samples.
- `panel2_ratio_{10,20,30}.jpg` — same brand at 10/20/30% subject scale.
  Prompts include the same locked BRAND context block + a "SAME asset,
  ONLY scale changes" constraint so the swatches / palette / botanical
  stay identical across the three.
- `panel3_mockup_{cup,bag,box}.jpg` — Zen visual applied to double-wall
  paper cup / kraft tote / lid-and-base gift box.

Model: `gemini-3-pro-image-preview` for all 9 (Chinese labels + high
visual fidelity). Total render time ~4 min for the batch.

### Step 3 — Assemble the 5-page PDF

```bash
bash scripts/oneoff_brand_design_portfolio_pdf_2026-07-03.sh
```

Produces `raw/brand-design-portfolio/workflow_demo_portfolio.pdf` — an
A4-ish (1240×1750) 5-page deck mirroring the visual DNA of the
Curify intro-to-merch reference deck stored at
`raw/brand-design-portfolio/intro-to-merch/`.

Structure:

| Page | Title | Key elements |
|---|---|---|
| 1 | Cover — 「东方植物草本风」茶饮包装 · 提案工作流 | Left navy vertical band, big CN + EN subtitle, moodboard-zen hero, Curify wordmark |
| 2 | 提案前置 · 情绪板探索 | 3 direction tiles + value bullets + pull-quote |
| 3 | 中期控管 · 变量微调 | 3 subject-scale variations + value bullets + pull-quote |
| 4 | 后期落地 · 自动化模版延展 | 3 mockup tiles + value bullets + pull-quote |
| 5 | 合作模式 · 共创机制 | 3 partnership tiers (敏捷试错包 / 命题风格定制 / SaaS API 深度接入) |

Palette used to match the reference deck: cream `#F5EFE3` base,
navy `#1B2757` headers, gold `#C9A24C` accents, warm ink `#2C2A25`
body text, muted `#7A736A` captions. CJK font: STHeiti Medium via
`fc-list :lang=zh`.

The composer is pure ImageMagick — no puppeteer / headless-chrome
dependency. PDF is built by `magick page1.jpg page2.jpg … -quality 90
-density 150 workflow_demo_portfolio.pdf`.

### Step 4 — Customize before sending

Two edits worth making per-prospect before hitting send:

1. **P5 partnership pricing** — the reference deck's page 5 wording is
   used verbatim; if the actual tier for this designer differs (custom
   rate, co-creation split, exclusive vertical), edit that block.
2. **Opening note** — the 「青野」 brand is a virtual case. Add a
   one-line message in the send ("以下为工作流演示，非真实案例；
   若换到您服务的品类，输出形态一致") so she doesn't think you're
   showing an ex-client.

---

## Why 3 panels (not more, not less)

Discovered during the 2026-07-03 conversation with the Niice Design
studio owner. Her ask was 「生成的方向我看看啥样的」 — she wanted to
see WHAT we generate. Answering with a single stitched moodboard image
under-delivered on her real question, which was **whether the workflow
maps to how she actually works**.

The 3-panel structure directly answers her workflow's three highest-
friction steps:

- **Front-end friction** (moodboarding) — Panel 1 shows we replace
  Pinterest-hunt with parallel generation.
- **Mid-project friction** (client asks "make the box bigger") — Panel 2
  shows we can move one knob without re-drawing the piece.
- **Back-end friction** (delivering to print) — Panel 3 shows the same
  visual carries through to production templates without redesign.

Cutting any panel (or adding a 4th "feature dump" panel) breaks the
1-friction-per-panel discipline and turns the deck into a screenshot
brochure. Keep it at 3.

---

## Followups if this converts

If a brand-design-studio prospect signs on (any tier from P5), consider
promoting to a live persona:

- Add `for-brand-design-studios` slug to `lib/use-cases.ts` alongside
  `for-agencies` (adjacent persona).
- Ship `/use-cases/for-brand-design-studios` landing following the
  standard `UseCaseClient.tsx` pattern with hero video (30s of the
  workflow) + curated moodboard/mockup examples + tool cards.
- Add to the shipped-verticals table in
  `docs/workstream-vertical-use-cases.md` (row: `for-brand-design-studios`).
- Consider whether the 3-panel workflow deserves its own template
  family (e.g. `template-brand-workflow-moodboard-triple` +
  `template-brand-workflow-scale-triple`) — this would let the
  designer trigger the same workflow inside Curify with their client's
  brief as input.

Don't pre-build these before conversion. Live-only policy per
`feedback_tool_ship_persona_remapping` — persona goes live when there's
a real user, not before.

---

## Reference assets

- `raw/brand-design-portfolio/` — the entire output tree (9 frames +
  PDF + preview JPEGs + intermediate composites).
- `raw/brand-design-portfolio/intro-to-merch/` — the reference deck
  visual DNA (Curify's own intro-to-merch 5-page portfolio). This is
  the aesthetic anchor: cream base / navy header / gold accents /
  big CN title with EN subtitle / vertical side band / numbered
  callouts.
- `scripts/oneoff_brand_design_workflow_demo_2026-07-03.cjs` —
  gemini image-gen batch (9 frames).
- `scripts/oneoff_brand_design_portfolio_pdf_2026-07-03.sh` —
  ImageMagick 5-page PDF composer.
