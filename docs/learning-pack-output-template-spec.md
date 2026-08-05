# Learning Pack — output-template spec (v1)

The fixed reference for the **"visual packaging" use case**: one topic/story → a finished, bilingual, illustrated, **print-ready PDF learning pack**. This is the thing ChatGPT + Canva + Twinkl each miss (text-only / manual / fixed-library). See demand read: `curify-studio/docs/teacher-learning-packs-demand-and-validation-2026-08-05.md`.

**Golden reference (already built):** the 西游记 pack from the `use-case-learning-packs` video — `curify-gallery/daily_inspirations/Jul_9/01–05_*.png` (numbered pages) + the reusable page-type templates in `daily_inspirations/Jul_14/`. Build to match these; don't reinvent.

---

## 1. What a Learning Pack is

A **fixed page-grammar** of N illustrated pages sharing one design system (scroll-banner header, bilingual title, colored rounded cards, instruction footer, themed illustration background), generated for **one topic**, assembled into a **print-ready PDF**, and registered in the pack catalog for point-based purchase.

Not: a single worksheet, or a text doc. The *pack* (multi-asset bundle) + the *finished visual* is the product.

---

## 2. Canonical page-grammar (v1 = 6 pages)

Each page is a full-bleed illustrated image from a real, already-shipped page-type template. **The whole pack is driven by ONE input** — the `cartoon_ip_theme` string (e.g. "Journey to the West / 西游记") is passed to every `cartoon-*` template, so one topic fans out into a coherent pack.

| # | Page type | Template (real, in `nano_templates.json`) | Param | Orientation |
|---|-----------|-------------------------------------------|-------|-------------|
| 0 | **Cover** | *(generate hero page — no dedicated cover template yet; see Open items)* | topic | portrait |
| 1 | **Vocabulary cards** (EN+中文, ~10 picture-words) | `template-cartoon-english-wordcard-learning-card` | `cartoon_ip_theme` | landscape-wide |
| 2 | **Mini-quiz worksheet** (Match / MCQ / fill-blank + word bank) | `template-cartoon-english-quiz-learning-card` | `cartoon_ip_theme` | landscape-wide |
| 3 | **Short script / story dialogue** (role-play) | `template-cartoon-mini-script-learning-card` | `cartoon_ip_theme` | landscape-wide |
| 4 | **Character relationship map** (bilingual) | `template-cartoon-character-map-learning-card` | `cartoon_ip_theme` | landscape-wide |
| 5 | **Subtitle / reading card** (bilingual scene lines) | `template-kids-bilingual-cartoon-learning-card` | `cartoon_theme` | landscape-wide |

**Optional add-on pages** (swap in by grade/subject, all real templates):
- Fill-in-the-blank worksheet — `template-kids-theme-fill-in-worksheet` (`topic`) — **portrait**
- Coloring page — `template-CVC-english-word-coloring-flower-card` (`word_family`) — line-art
- Phonics poster — `template-phonics-consonant-blend` / `template-kids-english-phonics-sentence-flashcard`
- Graded reading lesson — `template-hsk-bilingual-reading-text-lesson-poster` (`hsk_article_title`) — **portrait**
- Detailed vocab flashcards — `template-detailed-vocab-flashcard` (`chinese_word`)

> The Jul_9 pack also had a **05_ai_dialogue_practice** page — that's the **app-interactive** surface (see video frame lp_09 component grid), not a print page. Omit from the print PDF; it lives in the interactive product.

---

## 3. Single-input generation model

```
INPUT:  topic = "Journey to the West / 西游记"   (+ optional: grade band, target language pair)
STEP 1: theme = normalize(topic)  → the cartoon_ip_theme string
STEP 2: for each page-type in the grammar:
          img[i] = generate(template_id, { cartoon_ip_theme: theme })   # NANO_TEMPLATE_GENERATION
STEP 3: cover  = generate(cover, { topic })
STEP 4: pdf    = images_to_pdf.build_pdf([(cover,title), (img1,"Vocabulary"), ...], out.pdf, subtitle)
STEP 5: register pack in etsy_packs.json (+ backend twin) → sellable via points
```

One topic → 6 coordinated pages → one PDF. That's the whole pipeline.

---

## 4. Assembly — print-ready PDF

Use the existing assembler **`curify-frontend/scripts/images_to_pdf.py`** — do not write a new one.
- US-Letter, 200 DPI (1700×2200), 0.5" print-safe margins.
- Curify logo + wordmark in the **top** margin band; caption in the **bottom** band (both in white margin, never over art).
- CJK-safe caption font (STHeiti/Hiragino) — Chinese titles render.
- Call: `build_pdf([(img_path, caption), ...], "out.pdf", subtitle="西游记 · 双语学习包 · curify-ai.com")`

Shipped exemplars to eyeball for quality bar: `curify-gallery/etsy-packs/*.pdf` (hsk, vocabulary, mbti, cuisine-cards, confuse-chinese-words, …).

---

## 5. Orientation decision (must resolve before build)

The `cartoon-*` learning-card family is **"Horizontal Wide Printable Worksheet" = landscape** (matches the Jul_9 1920×1080 pages). `images_to_pdf.py` targets **portrait Letter** and fits each image inside the margins → a landscape image lands centered with top/bottom whitespace.

Two viable v1 paths:
- **(A) Ship landscape** — set the PDF page to **US-Letter landscape** (swap `PAGE_W/PAGE_H`) so wide pages fill the sheet. Fastest; teachers print landscape fine. **Recommended for v1.**
- **(B) Portrait variants** — author portrait versions of the 5 cartoon page-types for true print-and-go A4 portrait (the AI-resistant format teachers said they want). Higher effort; do after v1 validates.

Mixed packs (e.g. adding the portrait `fill-in-worksheet`) → keep one orientation per pack for v1.

---

## 6. Catalog / sell schema

Register the finished pack in **BOTH** registries (per `[[etsy_pack_two_registries]]`):
- `curify-frontend/lib/etsy_packs.json`
- `curify-studio/curify_background/app/data/etsy_packs.json`

Entry shape (existing):
```json
{
  "sku": "journey-to-the-west-learning-pack",
  "title": "Journey to the West · Bilingual Learning Pack (6 printable pages)",
  "description": "6 print-ready EN+中文 pages: vocabulary cards, mini-quiz, story script, character map, reading card. For ESL / homeschool / classroom.",
  "cover_image": "/images/nano_insp/<cover>.jpg",
  "card_count": 6,
  "file_size_mb": <n>,
  "blob_path": "packs/sku/journey-to-the-west-learning-pack/pack-v1.zip",
  "version": 1,
  "etsy_listing_url": null,
  "active": true,
  "secret": null
}
```
Pricing = points, buy-once via Transaction invoice_id (per `[[project_pdf_packs_points]]`; free tier 5 / paid 50·100). Verify the live pack endpoint after adding.

---

## 7. Use-case surface (the rankable page)

Ship ONE **topic → learning-pack generator** surface (the T2 demand-capture test in the demand doc):
- Input: topic/story field → generate the 6-page pack.
- Seed with 3–5 pre-generated example packs as SEO/Pinterest bait: 西游记 (have it) + one Western-canon unit to test the cultural-range claim (e.g. Greek myths or a popular novel study) + one phonics/theme pack.
- **Instrument** with existing events: `searchbar-focus` + `auth-modal:<reason>` + generate-click + email-capture (per `[[project_funnel_instrumentation_5d_check]]`). Measure impressions → CTR → generate → capture.
- Value-prop copy leads on the validated wedge: **"Finished, illustrated, print-ready packs — original art (no clip-art licensing), generated to your topic. Not just text."**

Registry/index note: this is a **NANO_TEMPLATE_GENERATION** pack surface; lists that enumerate reproducible jobs need both nano job types (per `[[project_gallery_reproduce_surface]]`).

---

## 8. Open items before build

1. **Cover template** — no dedicated bilingual kids cover generator exists. Either add one, or reuse a hero illustration + PIL title band. (The `template-book-series-Journey-to-the-West` cover is Chinese-only adult "分析系列" — wrong register; don't reuse.)
2. **Orientation** — pick (A) landscape v1 vs (B) portrait variants (§5). Recommend A.
3. **Bilingual pair** — v1 fixed EN+中文 (what the templates output). Other language pairs = later template params.
4. **Grade banding** — `cartoon_ip_theme` currently carries all context in one string; if grade control is needed, extend the template params (opportunistic, per `[[feedback_enrich_taxonomy_during_generation]]`).
5. **Pack-flow consolidation** — `images_to_pdf.py` header notes it should later merge with the `/template-packs` flow (`lib/template_packs.json`). Keep v1 on `images_to_pdf.py`; unify later.

---

## TL;DR
Reference = **Jul_9 西游记 pack** (page-grammar) + **`images_to_pdf.py`** (print PDF) + **`etsy_packs.json`** (catalog). Build = one `cartoon_ip_theme` string → 5 real `cartoon-*` templates + a cover → `build_pdf` → register. Resolve cover + orientation, then ship the topic→pack surface and instrument it.
