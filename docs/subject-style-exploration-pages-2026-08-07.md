# Subject-Based Style-Exploration Pages — Analysis & Design

_2026-08-07. Owner: jay. Workstream: Search + Content (Thread b — tagging/taxonomy). Motivated by the `template-fashion-ecommerce-sneakers` style exploration._

## TL;DR

- **Granularity = concrete niche.** The subject is **shoes**, **coffee shops**, **matcha brands**, **scented candles** — not a broad bucket like "apparel" or "e-commerce." (Alignment confirmed 2026-08-07.)
- The real gap is **style variety within a niche** — the "shoes has no distinct styles" problem. Our tag data can't measure it (aesthetic tags are over-applied: `illustration` on 82% of gallery prompts, `artistic` 87%, `photorealistic` 75%), so we **can't rank niches by existing style diversity**. The reliable lever is what we proved on shoes: **seed each niche with a few canonical, distinct styles by generation** (the sneaker playbook), then let the rail surface them.
- **Because we seed, depth is not a gate** — even a thin niche (candles 46, serum 10) qualifies. Depth only tells you whether the rail can *also* draw on existing content (Archetype A) or must generate first (Archetype B).
- **Design:** an **"Explore this <niche>" section on the inspiration/example page** — subject chips (→ `/topics/<niche>`) + a same-niche rail grouped by style. A subject-aware upgrade of the existing `buildOtherTemplateCards` rail (today ranks by global rank, ignoring subject — Thread b open item #6).

## Worked examples (example → chips → what shows below)

| Niche | Example (page you're on) | Subject chips | Rail below — "see it in other styles" | Status |
|---|---|---|---|---|
| **Shoes** | Street-Ready Sneakers (on-model) | `#运动鞋` `#footwear` `#电商模特图` | 街拍活力 · 极简棚拍 · 高奢时尚 · 温暖生活 · +your style | 4 styles **live in catalog ✓** |
| **Coffee shop** | Morrow Coffee — opening poster | `#咖啡馆` `#cafe brand` `#opening poster` | Warm Invitation · Minimalist · Artisanal · Retro Diner · +your style | **tool live** — Brand Direction Explorer |
| **Tea / matcha** | 山岚茶事 — brand moodboard | `#抹茶` `#茶饮品牌` `#packaging` | Modern Minimal · Earthy Elegance · Contemporary · +your style | seed (300 depth) |

## 1. The grounding case: shoes

`shoes/sneakers` has **111 items** but the surfaced results read as one look — product/fashion photography. That's why the exploration felt flat. We fixed it not by finding more shoe content but by **generating 4 canonical style directions** (街拍活力 / 极简棚拍 / 高奢时尚 / 温暖生活) for one product. That is the template this doc generalizes: **subject depth is table stakes; the product is curated style range.**

## 2. Method & data

- **Pool:** 3,647 inspirations (`public/data/nano_inspiration.json`, tags+topics+params) + 4,190 gallery prompts (`public/data/nanobanana.json`, tags) = **7,837 items**.
- **Subject axis:** taxonomy tier2–4 + free tags (`lib/taxonomy.json`).
- **Style axis:** `content_styles` — aesthetic / mood / lighting / temporal.
- **Honest caveat:** aesthetic tags are non-exclusive and over-applied, so per-item style can't be partitioned (an item is tagged `illustration` AND `artistic` AND `photorealistic` at once). → We report **depth (reliable)** as the gate and treat **style range as something we produce**, not measure.

## 3. Niches, sized (concrete-niche granularity)

`N` = combined depth (inspirations + gallery). Depth is **not** a gate (we seed) — it just tells whether the rail can draw on existing content. Education stays topic-level (different granularity).

| Domain | Niche | N | Treatment |
|---|---|--:|---|
| 电商 E-commerce (products) | jewelry / necklace | 224 | seed |
| 电商 E-commerce (products) | sunglasses / eyewear | 220 | seed |
| 电商 E-commerce (products) | **shoes / sneakers** | 172 | seed — **4 styles shipped ✓** |
| 电商 E-commerce (products) | handbag / tote | 87 | seed |
| 电商 E-commerce (products) | scented candle | 46 | thin → seed |
| 电商 E-commerce (products) | skincare / serum | 10 | thin → seed |
| 品牌+文创 Brand & Cultural | tea / matcha brand | 300 | seed |
| 品牌+文创 Brand & Cultural | florist / flowers | 295 | explore |
| 品牌+文创 Brand & Cultural | **coffee shop / cafe** | 249 | seed — **tool live (Brand Direction Explorer) ▶** |
| 品牌+文创 Brand & Cultural | museum 文创 artifact | 151 | explore (文创 wedge) |
| 品牌+文创 Brand & Cultural | bakery / bread | 15 | thin → seed |
| 包装 Packaging (consumables) | chocolate / dessert | 76 | seed |
| 包装 Packaging (consumables) | wine / spirits | 71 | seed |

(Scripts: `scratchpad/analyze_subjects.py` + `analyze_aesthetic.py` for buckets; niche-level pass inline in session.)

## 4. Two page archetypes

The subjects split cleanly by whether existing content already carries style range:

**A. Explore-from-existing** — *Education, Cultural, IP.* These are illustration-native and already span sub-styles (watercolor / retro / kawaii / 3d / ink). The rail can pull real same-subject examples and group them. **No generation needed to launch.**
→ vocabulary, science, animals, history, food-knowledge, IP characters, guofeng, museum artifacts, costumes, mythology, festivals, stickers.

**B. Style-seed (sneaker playbook)** — *E-commerce products + Packaging.* Commercially critical but visually monotonous (photoreal product shots). Generate ~4 canonical styles per subject (studio / lifestyle / editorial / street-or-luxe), drop them as bilingual inspirations, and the rail becomes the exploration.
→ shoes ✅, then **apparel, cosmetics, bags, food-packaging, cosmetic-packaging, eyewear**; Brand/Logo via the existing `template-brand-logo-variant-set`.

## 5. Feature design — "Explore this <subject>" section

**Where:** the inspiration/example page (`app/[locale]/(public)/nano-template/[slug]/example/[exampleId]/page.tsx`), between the workbench and the current "Other templates" rail. Also reusable on `/topics/<slug>`.

**What it is (per the brief — "an explore-this section with subject tags"):**
1. **Subject chips** — the example's subject tags (from `tags[]` ∩ subject-vocab, e.g. `sneakers · footwear · e-commerce`), rendered as chips linking to `/topics/<subject>`. Chips exclude style/mood/format tags (filter against `content_styles`).
2. **Same-subject rail** — other inspirations + gallery prompts sharing the subject, **grouped by style** where possible ("This subject in other styles"), falling back to newest/top-ranked. This is a **subject-aware `buildOtherTemplateCards`** — resolving Thread b open item #6 (today it ranks by global rank, so a Marvel-MBTI page shows watercolor maps).
3. **Heading copy:** `探索更多「运动鞋」/ Explore more sneakers` → the rail; `换个风格 / See other styles` when style-grouping is available.

**Data source (all existing):** subject match via `tags` / `search_aliases`; ranking by shared-subject count (Jaccard) then rank_score; routes via existing `/topics/[slug]` + `TOPIC_GALLERY_TAG`. No schema change.

```
┌─────────────────────────────────────────────┐
│  [ workbench / example hero ]                │
├─────────────────────────────────────────────┤
│  探索更多  Explore this subject               │
│  # 运动鞋   # 鞋类   # 电商详情                 │   ← subject chips → /topics/<subject>
│                                               │
│  换个风格  See it in other styles             │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐          │   ← same-subject rail,
│  │街拍│ │极简│ │高奢│ │温暖│ │ …  │          │     grouped by style when possible
│  └────┘ └────┘ └────┘ └────┘ └────┘          │
├─────────────────────────────────────────────┤
│  Other templates (existing, global)          │
└─────────────────────────────────────────────┘
```

## 6. Rollout

- **Phase 1 (build once, applies everywhere):** subject-chip + same-subject rail component on the example page; subject-tag filter (exclude `content_styles`), Jaccard ranking, `/topics/<subject>` links. Ships value for all Archetype-A subjects immediately from existing content.
- **Phase 2 (style-seed the commercial subjects):** run the sneaker playbook on the top E-commerce + Packaging subjects — **apparel → cosmetics → bags → food-packaging**. Each: generate 4 canonical styles (Gemini), drop as bilingual inspirations (the workflow we just ran for shoes), so the rail's "other styles" grouping is populated.
- **Phase 3 (SEO surface):** promote high-depth subjects to dedicated `/topics/<subject>` (or `/explore/<subject>`) style-gallery pages — server-rendered, one subject × many styles — feeding programmatic-SEO (Thread a item 9).

**First build targets:** Phase 1 component now; Phase 2 seed order **apparel, cosmetics, food-packaging** (highest commercial intent × depth after shoes).
