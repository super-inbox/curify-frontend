# Brand workflow video → template mapping + gap analysis (2026-08-05)

Source: `raw/brand-design-flow-08-04/` (WeChat workflow video 103s + transcript).
Example brand in video: **CATTÉ COFFEE / 喵咖** (cat-café), ending on a "咖啡品牌套件 / Brand Kit".

## The 5-step workflow (as demonstrated)

> "从色彩规范、logo、字体、产品包装、店铺设计，到全套 VI 视觉，只需要 5 步。最后一步至少能帮你手写 90% 的提示词。跑下来哪怕小白也能交付大厂级别的品牌全案。"

| # | Step | What the user does | Tools invoked in video (not templates) |
|---|------|--------------------|------------------------------|
| 1 | **订色彩规范** (do FIRST) | Upload a reference brand image → AI extracts ~5 color values → vertical-stripe palette card with hex labels ("喵咖色彩规范") | — |
| 2 | **品牌 Logo** | Frame-select the palette card + prompt defining visual elements/style (e.g. "喵卡 flat line-drawing") → **6 logo variants**; `mockup` turns packaging into a sample; `编辑元素` (edit-element) separates a single logo → drag onto mockup; pick the main logo | mockup, edit-element |
| 3 | **品牌字体** | Reference font image + brand name → **6 font specimens**; pick red for packaging / blue for shop-name; `标记模式` (mark-mode) + extract prompt; `字体设计器` (font-designer) makes the brand's own font ("省下大几千设计费") | mark-mode, font-designer |
| 4 | **产品包装 & 店铺设计** | Packaging prompt **MUST specify 色彩主字关系** (color-hierarchy) or the packaging has no visual focus; then 门头 (storefront) + interior prompts | — |
| 5 | **形成品牌体系 (品牌套件 / "the world")** | Upload logo + color card + font + packaging into the **Brand Kit** → standardized VI system → then **one sentence** auto-applies the full spec to any merch / VI, style-consistent | Brand Kit ("使用此套件创建项目") |

## Step → existing template mapping (346 templates scanned)

| Step | Best existing template(s) | Coverage |
|------|---------------------------|----------|
| 1 · 色彩规范 | `template-theme-color-palette-card` | ✅ **direct match** — but check it supports *image-upload → extract* mode, not just text→palette |
| 2 · Logo | `template-brand-ip-mascot-design-board` (mascot, adjacent) | ⚠️ **GAP — no standalone multi-variant logo generator** |
| 2 · mockup / apply-logo | `template-brand-vi-full-visual-pack-mockup`, `template-ip-creative-cultural-goods-mockup-set`, `template-ip-gift-box-stationery-set-mockup` | ✅ mockup surfaces exist |
| 3 · 品牌字体 | — | ❌ **GAP — no typography / font-specimen / brand-font template** |
| 4 · 产品包装 | `template-food-product-packaging-design`, `template-chocolate-giftbox-packaging` | ⚠️ **partial — food/gift only; no generic product packaging with explicit 色彩主字关系 control** |
| 4 · 店铺 / 门头 | `template-interior-design-mood-board-generator`, `template-interior-design-moodboard` | ⚠️ **partial — interiors only; no storefront / 门头 / signage / facade template** |
| 5 · 品牌体系 | `template-brand-vi-full-visual-pack-mockup`, `template-brand-identity-moodboard-visual-system-poster`, `template-brand-ip-full-design-board` | ✅ VI-system boards exist — but as **one-shot all-in-one**, not the persistent, re-appliable Brand Kit the video shows |

## Missing templates (the real gaps)

1. **Standalone brand Logo generator** — 6-variant logo from `{palette card + brand name + style prompt}`. Highest-value gap; logo is step 2 of every brand build and we have none. (Mascot board ≠ logo.)
2. **Brand Typography / Font** — font-specimen generator (6 specimens from a reference font image + brand name), and a "brand-font" specimen board. Entirely absent.
3. **Storefront / 门头 / signage design** — retail facade + shop-sign template. We only have *interior* mood-boards. This is the outward brand touchpoint.
4. **Generic product packaging (with 色彩主字关系 control)** — generalize beyond food/chocolate to any SKU, and surface the *color-hierarchy* parameter the transcript flags as the make-or-break.

### Not a template gap — a product-feature gap
- **品牌套件 / Brand Kit** ("the world") is not a template; it's a **persistent brand-asset store** (logo + colors + font + imagery) that lets *one sentence* auto-inject the full spec into any downstream generation. This is the strongest idea in the video and a **feature/pipeline capability**, not a nano_template. Our closest analog is the one-shot VI-pack template — the difference is *persistence + re-application*.
- Supporting tool primitives shown but not owned as templates: `mockup`, `编辑元素/edit-element` (isolate one logo from a sheet), `标记模式/mark-mode` (region select), `字体设计器/font-designer`.

## Brand video-pipeline enrichment

Current brand pipeline narrative (per your description): **brand idea → creative exploration → 微调 → apply to products** — a 3-beat arc, parallel to the education / ecommerce / merch workflow videos (`video_pipelines/`: `ip_to_video`, `portrait_to_designset` pattern = *input → asset set → narrated 9:16*).

The workflow video is a **richer, more legible 5-beat spine** that maps cleanly onto that arc:

| Current 3-beat | Enriched 5-beat (from workflow video) |
|----------------|----------------------------------------|
| brand idea | **① 色彩规范** — upload/idea → palette card (the "do this first" hook) |
| creative exploration | **② logo** (6 variants) → **③ font** (6 specimens) |
| 微调 | **④ packaging + storefront** with 色彩主字关系 control |
| apply to products | **⑤ Brand Kit → one sentence → merch / VI, style-consistent** (the payoff shot) |

**Concrete enrichment recommendations:**
1. **Re-cut the brand video to the 5-step spine** — same "input → asset set → 9:16 narrated" engine, but scenes = palette → logo grid → font specimens → packaging+storefront → Brand-Kit-applies-everywhere. The step-5 "one sentence applies the whole spec" is the strongest closing beat; make it the CTA.
2. **Lead with the color-spec hook** ("先订色彩规范，整个基调就有了") — it's a memorable, teachable first move and differentiates from generic "type a prompt" demos.
3. **Show the Brand Kit persistence** — the emotional payoff is *consistency without re-prompting*. Even if the Kit feature isn't fully built, the video can stage it; it also becomes the spec for the feature.
4. **Feed the pipeline from the 4 new templates** once built (logo, font, storefront, generic-packaging) so the video's asset set is generated by real shipped surfaces, mirroring how `ip_to_video` pulls from real template examples.
5. **Keep the 微调 beat explicit** — the transcript's 色彩主字关系 correction ("without it packaging has no visual focus, with it recognizability jumps") is a perfect on-screen before/after for the 微调 scene.

## Suggested build order (by leverage)
1. Logo generator template (unblocks step 2 + the video's centerpiece)
2. Generic product-packaging template w/ 色彩主字关系 param (step 4, revenue-adjacent)
3. Storefront / 门头 template (step 4b, rounds out the brand touchpoints)
4. Brand-font specimen template (step 3)
5. Brand Kit as a **pipeline/product feature** (step 5 — persistent asset store + one-sentence apply)
