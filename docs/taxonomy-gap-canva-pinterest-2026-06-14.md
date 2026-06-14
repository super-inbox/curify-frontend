# Taxonomy gap report — Canva + Pinterest vs Curify (2026-06-14)

Source: 3 xlsx files at `curify-gallery/daily_inspirations/Jun_12/`
- `Canva 一级&二级分类目录.xlsx` (10 tier-1, 83 tier-2 — use-case oriented)
- `Pinterest 一级&二级分类目录.xlsx` (20 tier-1, ~190 tier-2 — lifestyle-interest oriented)
- `Curify-AI 分类目录（一级+二级）.xlsx` (8 tier-1, 43 entries — curated subset, not the actual taxonomy)

Compared against `lib/taxonomy.json` (10 tier-1, ~70 tier-2).

---

## Top-line read

The two competitor taxonomies are oriented differently:

- **Pinterest = lifestyle-interest** (Art / Home Decor / Wedding / Parenting / Photography…). Subject-driven discovery surface.
- **Canva = use-case / output-type** (Social Media / Office / Ecommerce / Video / Print / Branding / Web…). Format-driven productivity surface.
- **Curify** = hybrid leaning Pinterest-ish (subject tier-1) + a thin format axis (`design`, `product`, `world-cup`).

So the gaps come in two flavors:
1. **Pinterest gap** = lifestyle verticals we don't cover as subjects → maps to *content gen* opportunities (new templates).
2. **Canva gap** = output formats we don't generate at all → maps to *template-shape* opportunities (new generators).

---

## Pinterest tier-1 vs Curify (subject coverage)

### Already covered in some form (6)

| Pinterest | Curify hook |
|---|---|
| Design | `design` tier-1 (posters, mockups, merch, composition) |
| Beauty | `lifestyle.beauty` tier-2 |
| Food & Drinks | `travel.food` + `culture.food` tier-2 (scattered, not a tier-1) |
| Travel | `travel` tier-1 |
| Sports | `world-cup` tier-1 + `character.sports` (no general sports tier-1) |
| Architecture | `learning.architecture` tier-2 (treated as a learning topic) |

### Missing entirely (14) — ranked by content-monetization potential

| # | Pinterest tier-1 | Sample tier-2 | Why it matters |
|---|---|---|---|
| 1 | **Wedding** | 婚礼策划/流程, 婚纱/礼服/穿搭, 婚礼场地/布置, 婚礼请柬/纸品 | High-intent commercial vertical, Etsy-friendly, evergreen |
| 2 | **Parenting** | 宝宝护理, 辅食/宝宝食谱, 早教/启蒙, 亲子互动, 儿童穿搭 | Massive Pinterest surface; we have `kids-vocabulary` but no parenting umbrella |
| 3 | **Home Decor** | 卧室, 客厅, 厨房, 浴室, 阳台 — by-room split | `lifestyle.interior` exists but we have NO room-level decomposition |
| 4 | **Health** | 健身, 瑜伽, 健康饮食, 减肥, 心理健康 | `lifestyle.fitness` + `lifestyle.finance` exist but health-tier-1 unifies them |
| 5 | **Quotes** | 励志, 爱情, 友情, 人生感悟, 职场 | High virality, low gen cost — easy template family |
| 6 | **Art** | 绘画, 素描, 数字艺术, 雕塑, 摄影艺术 | Art-style genres — could feed into `design.posters` family |
| 7 | **Entertainment** | 电影/电视剧/综艺, 音乐, 游戏, 动漫, 明星 | We have `character.anime` + `character.film`; missing music/games/celebrity |
| 8 | **DIY & Crafts** | 手工DIY, 编织, 木工, 皮革, 陶艺 | Tutorial-format, complements existing guides |
| 9 | **Photography** | 人像, 风景, 美食, 旅行, 婚礼 | Photo-genre subject for future image-gen surfaces |
| 10 | **Event Planning** | 生日派对, 节日活动, 公司活动, 婚礼, 展会 | Adjacent to Wedding; share templates |
| 11 | **Women's Fashion** | 日常穿搭, 职场, 休闲, 复古, 大码 | We have `lifestyle.fashion` flat; no gender-split + style-genre split |
| 12 | **Men's Fashion** | (parallel to women's) | Pinterest splits gender; we don't |
| 13 | **Electronics & Tech** | 手机/数码, 电脑, 耳机, 相机, 智能家居 | Buying-guide + comparison-infographic territory |
| 14 | **Education** | 学习技巧, 学科知识, 语言学习, 编程, 艺术 | We have `learning.*` but as topic-grouped; Pinterest splits by *method* (how-to-study) |

---

## Canva tier-1 vs Curify (format/output coverage)

| Canva category | Curify coverage | Notes |
|---|---|---|
| Charts & Infographics | **STRONG** | Curify's core surface |
| Social Media | **PARTIAL** | We have `design.posters`; no IG-shape/TikTok-cover/LinkedIn-banner/YouTube-thumbnail format-specific generators |
| Ecommerce & Marketing | **PARTIAL** | `product.ecommerce` + `product.packaging` cover product; missing storefront banner, coupon, price-tag, live-stream cover |
| Print Materials | **PARTIAL** | `design.posters`, `design.merch` cover some; missing leaflet, menu, ticket, invitation, sticker, business-card |
| Education & Teaching | **PARTIAL** | `learning.*` topic exists; missing courseware/worksheet/study-notes/mind-map formats |
| Logo & Branding | **PARTIAL** | `product.branding` exists; missing brand VI package, brand guideline, watermark |
| Personal & Life | **PARTIAL** | `culture` + `lifestyle` + `travel` cover some subjects; missing journal/calendar/photo-album/greeting-card/recipe-book formats |
| **Office & Workplace** | **WEAK** | `corporate-news-editorial-hero` just landed; missing PPT, resume, business-card, certificate, invitation, brochure, report formats |
| **Video Editing** | **MISSING** | No video-thumbnail / vlog-template / intro-outro generators (multi-modal expansion) |
| **Website & Ads** | **MISSING** | No web-banner / landing-page / email-template / app-icon generators |

---

## Hongjie's xlsx "Curify-AI" curated subset — what it's actually telling us

Despite the file name "分类目录", this is **not a taxonomy** — it's a list of 8 verticals + their key templates (bilingual labels are template-named). It reads as a *strategic focus list*:

| Vertical | Implication |
|---|---|
| Travel (9 entries) | Travel + maps + city-landmark is a deep investment area |
| Food (8 entries) | Food/cuisine/anatomy infographics — already strong, keep building |
| Fitness (6 entries) | Workout / yoga / anatomy / weight-loss-plan — focused area |
| Nostalgia (6 entries) | Vintage poster family, retro infographics, generation comparison |
| City (2 entries) | Light area — possibly merge with Travel |
| Fashion (3 entries) | Fashion + portrait + beauty step-by-step — light, may need expansion |
| Finance (1 entry) | Single entry — needs expansion |
| Guides (8 entries) | Step-by-step guide family (cross-vertical) |

**Reading between the lines:** the Curify xlsx isn't suggesting we adopt this as our taxonomy — it's saying these 8 are the verticals where we already have / want to push deeper template coverage. The other tier-1s (character, personality, language, learning, design, product, world-cup) are absent because they're *infrastructure* topics, not lifestyle verticals.

---

## Recommended prioritization (turning gaps into action)

### Quick wins (template family additions, no taxonomy change)
- **Quotes** family — 5-10 templates, low cost, high virality
- **Wedding** family — Etsy-monetizable, evergreen, 10-15 templates
- **Parenting** umbrella — group existing kids-vocab/family content + add baby-care/early-ed templates

### Medium-lift (taxonomy + content)
- **Home Decor by-room** — promote `lifestyle.interior` to a tier-1 OR add room-level tier-3 (bedroom/living-room/kitchen/bathroom)
- **Health as tier-1** — promote and unify fitness + nutrition + mental health
- **Fashion gender split** — add women's + men's tier-2 under existing fashion

### Strategic (template-shape expansion, new generators)
- **Office formats** (PPT/resume/business card/certificate) — Canva's strongest contested area
- **Print materials** (leaflet/menu/ticket) — pairs with Etsy/print-on-demand strategy
- **Web & ads formats** (web banner/landing page) — new generator surface

### Park / deprioritize
- Video editing (cross-modal, separate workstream)
- Website & ads (separate engineering investment)
- DIY & Crafts (low monetization)
- Architecture-as-tier-1 (keep under learning)

---

## Integration into `lib/taxonomy.json` — proposed first cut

Most actionable taxonomy edits (no template work needed):

```diff
tier1:
+ "wedding"
+ "parenting"
+ "quotes"
+ "health"

tier2:
  lifestyle:
+   "home-decor-bedroom", "home-decor-living-room", "home-decor-kitchen", "home-decor-bathroom"
  character:
+   "music", "celebrity", "games"
  design:
+   "social-media-instagram", "social-media-tiktok", "social-media-youtube"
  product:
+   "logo", "vi-package", "watermark"
  wedding (NEW):
+   "wedding-planning", "wedding-dress", "wedding-venue", "wedding-invitation", "wedding-photography"
  parenting (NEW):
+   "newborn-care", "baby-food", "early-education", "kids-fashion", "family-activities"
  quotes (NEW):
+   "motivational", "love", "friendship", "life-wisdom", "career"
  health (NEW):
+   "yoga", "nutrition", "weight-loss", "mental-health", "fitness-routine"  # promote from lifestyle.fitness
```

Open questions:
1. Should Health subsume `lifestyle.fitness` + `lifestyle.beauty`, or stay parallel?
2. Should Wedding be tier-1 or tier-2 under a new "Events" tier-1 (events covers wedding + parties + corporate)?
3. Where does Photography land — its own tier-1 or under Design?

---

## Next steps (deferred — gap report only, no code changes shipped)

1. **User confirms which gap families to act on first** (recommended: Wedding + Quotes for quick wins, Health-as-tier-1 for strategic).
2. **For each confirmed family**: spec template prompts → patch-2 daily drop ingestion → topic tagging.
3. **Taxonomy edits**: tier-1 + tier-2 additions land via a single `lib/taxonomy.json` patch with full i18n in `messages/<locale>/topics.json` (10 locales).
4. **Cross-check with existing patches**: many patch-2 templates may already qualify for these new categories (auto-retag pass after taxonomy lands).
