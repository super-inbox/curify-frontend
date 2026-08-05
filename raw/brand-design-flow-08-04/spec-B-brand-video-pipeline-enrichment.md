# Spec B — Brand video pipeline enrichment (5-step deliverable spine)

Enriches the existing `brand_to_video` pipeline (`curify-studio/dev/jayw/video_pipelines/brand_to_video/`, committed at `2df041d`; output in `curify-gallery/brand_brief/`) using the workflow video's structure. See `[[reference_brand_to_video_skill]]`.

## What exists vs. what the workflow video teaches

| | Current `brand_to_video` (agency-process spine) | Workflow video (deliverable-stack spine) |
|---|---|---|
| ① | 一句话需求 (brief: text OR ref image) | **订色彩规范** (palette FIRST — the hook) |
| ② | 创意探索 (3 moodboard directions) | **品牌 logo** (6 variants) |
| ③ | 精准微调 (move ONE variable) | **品牌字体** (6 font specimens) |
| ④ | 模版延展 (apply across cup/tote/gift-box) | **产品包装 + 店铺/门头** (with 色彩主字关系) |
| ⑤ | ending (logo outro / purple CTA) | **品牌套件 / Brand Kit** → one sentence applies the whole spec |

Both are 5-stage, but the current spine is *abstract* (explore → refine → apply) while the video's is *concrete and teachable* (each stage = a named deliverable a small brand actually needs). The video also ends on a stronger payoff: the **Brand Kit** that re-applies the spec with one sentence — "再也不用写复杂提示词." **Recommendation: keep the render engine, re-author the 4 content scenes + narration onto the deliverable-stack spine, and make the Brand Kit the closing beat.**

## Enriched narrative — 6 scenes (5 steps + CTA/outro)

Same render engine as the merch/IP series: PIL composites → pure-ffmpeg (letterbox + Ken-Burns zoompan + gentle xfade + rounded square-logo watermark + `curify-ai.com` + narration over ducked music). 1080×1920. Example brand: **CATTÉ COFFEE / 喵咖**.

| Scene | Label (中文 / EN) | Visual (asset) | Narration beat |
|---|---|---|---|
| 1 | 订色彩规范 / COLOR SYSTEM | palette card (5 vertical swatches + hex, "喵咖色彩规范") | "先订色彩规范，整个视觉基调就有了。上传一张品牌图，AI 提取 5 个色值。" |
| 2 | 品牌 Logo / LOGO | 6-variant logo sheet → zoom to the chosen main logo | "框选色卡，写清视觉元素，一次出 6 个 logo，挑一个当主标。" |
| 3 | 品牌字体 / TYPEFACE | 6 font specimens → the chosen packaging/shop fonts | "垫一张字体参考，出 6 款字体，字体设计器做出品牌专属字体，省下大几千。" |
| 4 | 包装 + 门头 / PACKAGING + STOREFRONT | **before/after** packaging (no 色彩主字关系 → flat / with it → clear focus) + 门头 shot | "写包装提示词一定要指定色彩主字关系，辨识度立刻拉满。门头、室内一起出。" |
| 5 | 品牌套件 / BRAND KIT | the Brand-Kit panel (logo + 5 colors + font + imagery + "使用此套件创建项目") | "把 logo、色卡、字体、包装全传进品牌套件。之后做周边、做 VI，一句话，AI 自动带入全套规范。" |
| 6 | CTA / outro | purple CTA card (EN) / logo animation (中文) | "五步，小白也能交付大厂级品牌全案。" → "Start your brand ›" |

**Scene 4 is the 微调 beat** — reuse the existing `精准微调` "move ONE variable" mechanic, but make the variable the transcript's **色彩主字关系** (color-hierarchy): a genuine before/after where recognizability jumps. Strongest on-screen proof in the whole cut.

**Scene 5 is the new payoff** — the current pipeline ends on a generic outro; the Brand Kit "one sentence applies everything" is a far stronger close and doubles as the spec for the Brand-Kit *product feature* (see `workflow-template-mapping.md` → feature gap).

## Asset generation (`gen_assets.py` for brand)

Follow the `ip_to_video`/`portrait_to_designset` pattern (Gemini `gemini-3-pro-image-preview`, backend venv, `GEMINI_API_KEY`). For a brand `{name, brief, palette}` produce the 5 stage assets — and generate them **from the real templates** (Spec A set) so the video demonstrates shipped surfaces, not bespoke renders:

1. **palette card** ← `template-theme-color-palette-card`
2. **6-variant logo sheet** ← `template-brand-logo-variant-set` (Spec A) → isolate the chosen logo
3. **6 font specimens** ← `template-brand-font-specimen-set`
4. **packaging before/after + storefront** ← `template-product-packaging-design` (toggle the 色彩主字关系 param for before/after) + `template-brand-storefront-signage-design`
5. **Brand Kit panel** ← composite of 1–4 (PIL card mirroring the video's 咖啡品牌套件 layout: Logo/Icon · 颜色 5 swatches · 字体 · 图像 · button)

For the first build, the tea-brand example already has crops in git; the CATTÉ COFFEE cat-café example can reuse the frames already extracted in `raw/brand-design-flow-08-04/`.

## Two language cuts (unchanged engine)
- **中文**: `build_composites.py` (Hiragino Sans GB) + `tts_cn.py` (`zh-CN-XiaoxiaoNeural`) + `render_brand_video.py`; ending = logo-animation outro.
- **English**: `en_composites.py` (Georgia serif) + `tts_en.py` (`en-US-JennyNeural`) + `en_render.py`; **timed `drawtext` subtitles** (NOT the `subtitles`/libass filter — it renders ~6.7× too big) + `.srt` sidecar; ending = purple CTA card.

Both grow from 5→6 scenes: extend `DURS` (per-scene seconds) **and** `NARR_DELAY` (ms onsets) together so each scene ≥ its narration line + ~0.35s, or lines bleed across the xfade. EN narration runs longer (≈6.7–7.0s/line) — size to the EN cut, it's the tighter constraint.

## Series consistency (parallel with edu / ecommerce / merch)
This is the **brand** entry in the 4-workflow series. Keep the shared spine so the series reads as one product: `input → [named deliverable stages] → apply-everywhere payoff → CTA`. The brand cut's differentiator is the **Brand Kit** payoff (persistence + one-sentence re-apply) — the analog of `ip_to_video`'s "one IP → full merch pack" and `portrait_to_designset`'s "one photo → 6 works."

## Build order
1. Restore `brand_to_video/` to disk from `2df041d` (`git checkout 2df041d -- dev/jayw/video_pipelines/brand_to_video/`).
2. Re-author the 4 content scene composites + narration lines onto the deliverable-stack spine above (CATTÉ COFFEE example first — assets partly ready in `raw/brand-design-flow-08-04/`).
3. Add scene 5 (Brand Kit composite) + re-time `DURS`/`NARR_DELAY` for 6 scenes.
4. Render both cuts → `curify-gallery/brand_brief/catte_coffee_brand_workflow{,_en}.mp4`.
5. Once Spec A's template set ships, wire `gen_assets.py` to pull stage assets from those templates so future brand videos regenerate end-to-end.

## Output
`curify-gallery/brand_brief/` (series home). Log in `curify-studio/docs/tool-inventory.md`.
