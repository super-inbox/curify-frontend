# Bing Images — 58-Query Evaluation Collection

Side-by-side comparison dataset alongside `google-image-eval-58` and `curify-search-eval-58`.

## Overview

| Field | Value |
|---|---|
| Surface | Bing Images (`www.bing.com/images/search`) |
| Query count | **58** |
| Query source | Same set as `google-image-eval-58` and `curify-search-eval-58` |
| Collection method | Playwright browser (headful by default) |
| Locale | `mkt=en-US&setlang=en-US` |
| SafeSearch | `Moderate` |

## Why 58, not 57?

Query 58 (`maps`) was added from `user-report-2026-06-05` after the original 57-query set was defined. All three eval collections (Google Images, Curify, Bing Images) share the same 58 queries.

## Why not `cat`?

`cat` appeared in an early Google Images demonstration run but was never part of the formal eval set. It is explicitly excluded and verified by `assertQueries()`.

## Collected data per query

- **labels / chips**: Related search pills, image-category chips, filter chips visible in the Bing Images UI (not nav tabs, not ads)
- **top 10 image results**: title, source domain, pageUrl, imageUrl, thumbnailUrl, visibleText — read from DOM attributes without clicking into the detail panel
- **2 screenshots**: `bing-images-page1.png` (first viewport after load) and `bing-images-page2.png` (after scrolling ~900 px)

## Collection URL pattern

```
https://www.bing.com/images/search?q=<encoded_query>&mkt=en-US&setlang=en-US&safeSearch=Moderate
```

## Directory layout

```
docs/external-signal-pilot/bing-image-eval-58/
  README.md
  data/
    observations.json          — master JSON (all 58 queries)
    observations.csv           — flat CSV for spreadsheet analysis
    collection_progress.csv    — live progress during collection
    per-query/
      001-dan-ci.json
      ...
      058-maps.json
    run.log
    validation-report.json
  screenshots/
    001-dan-ci/
      bing-images-page1.png
      bing-images-page2.png
    ...
    058-maps/
      bing-images-page1.png
      bing-images-page2.png
```

## How to run

```bash
# Prerequisites: playwright installed (already in devDependencies)
# If not already installed:
npx playwright install chromium

# Dry run
npm run collect:bing-images -- --dry-run

# Single query test (query 58 = "maps")
npm run collect:bing-images -- --query-id 58

# Full collection
npm run collect:bing-images -- --force

# Headless
npm run collect:bing-images -- --force --headless

# Validate
npm run validate:bing-images
```

## Blocked / CAPTCHA handling

- **Cookie consent** (Microsoft's `#bnp_btn_accept`): auto-accepted
- **CAPTCHA / unusual traffic**: script pauses, prints instructions, waits for you to resolve in the open browser window, then press Enter
- **Consent redirect** (`consent.microsoft.com`): auto-detected; if not resolved, query is marked `blocked`
- Never bypasses CAPTCHA programmatically
- Blocked queries are skipped; already-collected data is preserved

## Empty / error handling

| Status | Meaning |
|---|---|
| `ok` | ≥5 results + screenshots collected |
| `ok_empty` | Page loaded, no image results |
| `blocked` | CAPTCHA/consent not resolved |
| `error` | Unhandled exception |
| `partial` | Some data but not complete |

## Collection summary

<!-- Updated by validate:bing-images -->
Run `npm run validate:bing-images` to see current counts.

## 58 Queries

| # | Query | Group |
|---|---|---|
| 1 | 单词 | user-2026-05-20 |
| 2 | 卡通 | user-2026-05-20 |
| 3 | 吉伊卡哇 | user-2026-05-20 |
| 4 | 家居装饰 | user-2026-05-20 |
| 5 | 工程 | user-2026-05-20 |
| 6 | 植物 | user-2026-05-20 |
| 7 | 水果中文 | user-2026-05-20 |
| 8 | 电商详情图 | user-2026-05-20 |
| 9 | 自行车 | user-2026-05-20 |
| 10 | 葡萄酒 | user-2026-05-20 |
| 11 | 蔬菜 | user-2026-05-20 |
| 12 | 词汇 | user-2026-05-20 |
| 13 | 趣味经济学知识科普 | user-2026-05-20 |
| 14 | 音乐 | user-2026-05-20 |
| 15 | 食物 | user-2026-05-20 |
| 16 | 香薰 | user-2026-05-20 |
| 17 | 唯美春天 | user-report-2026-05-18 |
| 18 | 证件照 | user-report-2026-05-18 |
| 19 | 手作 | user-report-2026-05-18 |
| 20 | historical character | reddit |
| 21 | future characters | reddit |
| 22 | homophones and homonyms | reddit |
| 23 | english-chinese | reddit |
| 24 | language learning expressions | reddit |
| 25 | global influence | reddit |
| 26 | remote destination | reddit |
| 27 | unique cultural experiences | reddit |
| 28 | short city escapes | reddit |
| 29 | creative comfort food | reddit |
| 30 | mbti marvel | popular |
| 31 | spring flowers | popular |
| 32 | 反义词 | popular |
| 33 | paper cutting | popular |
| 34 | met gala | gsc-zero |
| 35 | 动物 词汇 | synthetic |
| 36 | wedding planner | synthetic |
| 37 | minimalist autumn outfit for japan travel | progseo-2026-05-26 |
| 38 | infj vs entp dating compatibility chart | progseo-2026-05-26 |
| 39 | cuban sandwich recipe poster | progseo-2026-05-26 |
| 40 | bilingual flashcards for kids learning korean fruits | progseo-2026-05-26 |
| 41 | watercolor map of europe travel destinations | progseo-2026-05-26 |
| 42 | monstera plant care guide infographic | progseo-2026-05-26 |
| 43 | marvel mbti character chart 16 types | progseo-2026-05-26 |
| 44 | lunar new year red envelope graphic design | progseo-2026-05-26 |
| 45 | 1950s vintage diner illustration retro poster | progseo-2026-05-26 |
| 46 | before after kitchen organization makeover | progseo-2026-05-26 |
| 47 | phonics worksheets kindergarten | pinterest-discovery-2026-05-29 |
| 48 | Spanish vocabulary printable | pinterest-discovery-2026-05-29 |
| 49 | ESL flashcards printable | pinterest-discovery-2026-05-29 |
| 50 | easy weeknight dinners healthy | pinterest-discovery-2026-05-29 |
| 51 | gluten free dinner ideas | pinterest-discovery-2026-05-29 |
| 52 | meal prep weekly recipes | pinterest-discovery-2026-05-29 |
| 53 | cozy reading aesthetic | pinterest-discovery-2026-05-29 |
| 54 | book lovers gift guide | pinterest-discovery-2026-05-29 |
| 55 | chiikawa | user-weekly-2026-05-30 |
| 56 | samurai | user-weekly-2026-05-30 |
| 57 | genshin | user-weekly-2026-05-30 |
| 58 | maps | user-report-2026-06-05 |
