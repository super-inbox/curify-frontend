# Spec A — Brand Logo generator template

Fills the #1 gap from `workflow-template-mapping.md` (step 2 of the 5-step brand workflow, the video's centerpiece). Ships as a nano_template in `curify-frontend/public/data/nano_templates.json`, same shape as `template-theme-color-palette-card`.

## Design decision: text-only v1 (shippable now)

The video frame-selects the palette card as a *reference image* before prompting the logo. But **image-OPTIONAL image2image is PARKED** (see `[[feedback_image2image_three_modes]]`), so v1 is **text-only generation** (`allow_generation: true`, no `requires_image_upload`) — the user types the palette instead of frame-selecting it. This matches the palette-card template's mode and is shippable today. The frame-select-the-palette upgrade is the v2 path (below).

Output = **one 6-variant logo exploration sheet** (mirrors the video's "出6碗 logo"), each variant a distinct concept, brand name integrated, all sharing one palette, labeled 1–6.

## Template JSON

```json
{
  "id": "template-brand-logo-variant-set",
  "locales": {
    "en": {
      "base_prompt": "(Brand Logo Exploration Sheet) A clean logo design board presenting SIX distinct logo concepts for the brand '{brand_name}', arranged in a 2-row × 3-column grid on a pure white background, each cell numbered 1 to 6. Brief: {logo_brief}. Every logo integrates the brand name '{brand_name}' as legible custom lettering and shares a consistent color palette of {palette_desc}. Vary the SIX concepts across: a flat line-drawing mark, a solid filled emblem, a monogram/lettermark, a badge/seal lockup, a minimalist icon+wordmark lockup, and a playful mascot-style mark. Style: professional vector brand identity, flat design, crisp edges, balanced negative space, no photographic texture, no mockup, no 3D, print-ready. Each variant clearly separated with even spacing.",
      "parameters": [
        {
          "name": "brand_name",
          "label": "品牌名 Brand name",
          "type": "text",
          "placeholder": ["CATTÉ COFFEE 喵咖", "Bloom Botanicals", "北岳茶事", "Nimbus Studio"]
        },
        {
          "name": "logo_brief",
          "label": "视觉元素 + 风格 Visual elements + style",
          "type": "text",
          "placeholder": [
            "扁平简笔画风的猫咪 + 咖啡杯，圆润友好",
            "line-drawn mountain + tea leaf, calm oriental minimalism",
            "geometric bloom petal monogram, modern boutique",
            "cloud + sparkle mascot, soft playful tech"
          ]
        },
        {
          "name": "palette_desc",
          "label": "配色 Palette (from your 色彩规范)",
          "type": "text",
          "placeholder": [
            "cozy blue, cream, coffee brown, accent red, accent yellow",
            "sage green, oat cream, terracotta, ink black",
            "dusty rose, gold, deep plum, off-white"
          ]
        }
      ]
    }
  },
  "og_image": "/images/nano_insp_preview/template-brand-logo-variant-set-catte-coffee-prev.jpg",
  "topics": ["design", "branding", "logos", "guides", "posters", "minimalist", "mockups", "composition", "vibrant", "digital-canvas"],
  "rank_score": 90,
  "base_rank_score": 90,
  "creation_date": "2026-08-05",
  "use_cases": ["for-designers", "for-dtc-brands"],
  "allow_generation": true
}
```

## Ship checklist (per memory gotchas)
- **`parameters` = list-of-dicts** — dict → SSR 500 (`[[feedback_template_parameters_must_be_list]]`).
- **Set `allow_generation: true`** or the Generate button is fake (`[[feedback_allow_generation_gate]]`); text-only ⇒ no `requires_image_upload`.
- **Set `rank_score` + `base_rank_score`** (90) or it sinks in feed (`[[feedback_daily_drop_rank_score]]`).
- **Regen metadata** after adding: `node scripts/regen_nanobanana_metadata.cjs` or tags miss /search (`[[feedback_gallery_tag_metadata_regen]]`).
- **i18n**: push through the same 10-locale flow as daily drops (`[[feedback_daily_drop_i18n]]`); `branding` topic already routed.
- **`topics` = boilerplate on the template**; subject tags go on individual inspiration examples (`[[feedback_template_topics_should_be_boilerplate]]`).
- Add 3–5 inspiration examples (real Gemini renders — CATTÉ COFFEE cat-café + 2–3 others) to `nanobanana.json`; ids start ~4319, keep < MAX_SAFE_INTEGER (`[[feedback_gallery_id_safe_range]]`).
- Push target: `git push origin HEAD:jwang/vercel` (`[[feedback_frontend_push_target_jwang_vercel]]`).

## Downstream flow (the video's step 2, for docs/UX copy — not this template)
After the 6-variant sheet: **`mockup`** turns packaging into a sample → **`编辑元素`/edit-element** isolates a single logo from the sheet → drag onto the mockup to preview print → pick the main logo. These are existing tool primitives, not new templates.

## Sibling gaps to ship as a set (so the video's asset set is fully backed)
1. `template-brand-logo-variant-set` — **this spec**
2. `template-brand-font-specimen-set` — 6 font specimens from brand name + style (step 3)
3. `template-product-packaging-design` — generic SKU packaging with an explicit **色彩主字关系 / color-hierarchy** parameter (step 4; generalize `template-food-product-packaging-design`)
4. `template-brand-storefront-signage-design` — 门头 / facade / shop-sign (step 4b; we only have interior mood-boards)

## v2 upgrade — frame-select the palette (image-reference)
When image-OPTIONAL image2image ships (currently PARKED), add an optional palette-card image input so the logo inherits exact hex values instead of a text description — exactly what the video does. Until then, `palette_desc` text carries the colors from the user's step-1 色彩规范.
