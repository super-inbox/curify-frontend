# Pinterest Search — 58-Query Evaluation Collection

Side-by-side comparison dataset alongside `google-image-eval-58`, `bing-image-eval-58`, and `curify-search-eval-58`.

## Overview

| Field | Value |
|---|---|
| Surface | Pinterest pin search (`www.pinterest.com/search/pins/`) |
| Query count | **58** |
| Query source | Same set as all other eval collectors |
| Collection method | Playwright browser (headful by default) |
| Locale | en-US, America/Los_Angeles |

## Why 58, not 57?

Query 58 (`maps`) was added from `user-report-2026-06-05` after the original 57-query set was defined. All four eval collections share the same 58 queries.

## Why not `cat`?

`cat` appeared in an early Google Images demonstration run but was never part of the formal eval set. It is explicitly excluded and verified by `assertQueries()` on every run.

## Collected data per query

- **labels / chips**: Pinterest guided search chips, filter chips, related search suggestions visible in the Pinterest search UI (not nav, not pin card titles, not login buttons)
- **top 10 pin results**: title, description, source, pinUrl, imageUrl, thumbnailUrl, visibleText — read from DOM without clicking into pin detail pages
- **2 screenshots**: `pinterest-search-page1.png` (first viewport after load) and `pinterest-search-page2.png` (after scrolling ~900 px)

## Collection URL pattern

```
https://www.pinterest.com/search/pins/?q=<encoded_query>
```

## Directory layout

```
docs/external-signal-pilot/pinterest-search-eval-58/
  README.md
  data/
    observations.json           — master JSON (all 58 queries)
    observations.csv            — flat CSV for spreadsheet analysis
    collection_progress.csv     — live progress during collection
    per-query/
      001-dan-ci.json
      ...
      058-maps.json
    run.log
    validation-report.json
  screenshots/
    001-dan-ci/
      pinterest-search-page1.png
      pinterest-search-page2.png
    ...
    058-maps/
      pinterest-search-page1.png
      pinterest-search-page2.png
```

## How to run

```bash
# Dry run
npm run collect:pinterest-search -- --dry-run

# Single query test (query 58 = "maps")
npm run collect:pinterest-search -- --query-id 58

# Full collection
npm run collect:pinterest-search -- --force

# Headless
npm run collect:pinterest-search -- --force --headless

# Validate
npm run validate:pinterest-search
```

## Login wall / CAPTCHA handling

Pinterest aggressively shows login modals and login walls to unauthenticated users.

| Scenario | Handling |
|---|---|
| Cookie consent popup | Auto-accept via `#onetrust-accept-btn-handler` etc. |
| Dismissible login modal | Try close button / Escape key |
| Hard login wall (page fully blocked) | Pause + prompt user to handle manually, then press Enter |
| CAPTCHA / bot detection | Pause + prompt, then press Enter |
| Never bypasses | Login, CAPTCHA, or bot detection are never programmatically bypassed |

If a query is blocked:
- A debug screenshot is saved to `screenshots/<NNN>-debug-<reason>.png`
- The query is marked `login_required`, `captcha`, or `blocked`
- Collection continues with the next query

## Empty / error handling

| Status | Meaning |
|---|---|
| `ok` | ≥5 pin results + screenshots collected |
| `ok_empty` | Page loaded, no pin results |
| `login_required` | Login wall not cleared |
| `captcha` | CAPTCHA not cleared |
| `blocked` | Other access block |
| `error` | Unhandled exception |
| `partial` | Some data collected but not complete |

## Collection summary

<!-- Updated by validate:pinterest-search -->
Run `npm run validate:pinterest-search` to see current counts.

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
