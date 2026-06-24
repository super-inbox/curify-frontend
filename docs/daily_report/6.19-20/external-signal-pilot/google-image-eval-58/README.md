# Google Images External Signal Collection — 58-Query Set

**Surface:** Google Images  
**Query count:** 58  
**Collection date:** 2026-06-20  
**Method:** Playwright headful browser (system Chrome)

## Why 58 queries (not 57)

The previous collection (`google-image-eval-57`) used 57 queries and explicitly *excluded* `maps`. This run adds `maps` as query #58, sourced from the `user-report-2026-06-05` group, to complete the external-signal pilot coverage.

`cat` is **not** a formal eval query — it appeared only as a field-format example in earlier pilot documentation.

## Query source

Queries are defined in `scripts/google-image-eval/queries.ts`, derived from `scripts/configs/search_eval_set.json`.

The 58-query ordered list:

| # | Query | Group |
|---|-------|-------|
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

## Collected fields

For each query:

- **labels** — Google Images top-of-page horizontal chip / topic labels (up to all visible chips; carousel-scrolled)
- **top10** — first 10 organic image results; each includes `rank`, `title`, `source`, `pageUrl`, `imageUrl`
- **screenshots** — 2 viewport screenshots: `page1` (initial load) and `page2` (after scrolling one viewport)

## How to run

```bash
# Install deps (once)
npm install
npx playwright install chromium

# Dry-run — print all 58 queries, no browser
npm run collect:google-images -- --dry-run

# Collect all 58 (resumes from last completed)
npm run collect:google-images

# Collect a single query
npm run collect:google-images -- --query-id 58
npm run collect:google-images -- --query "maps"

# Validate results
npm run validate:google-images
```

## Output directory

```
docs/external-signal-pilot/google-image-eval-58/
  README.md                  ← this file
  data/
    observations.json        ← all 58 query records (snake_case)
    collection_progress.csv  ← live progress tracker
    collection_errors.json   ← per-query error log
    run.log                  ← full run log
    validation-report.json   ← checks + summary
    per-query/
      001-q001.json          ← per-query doc (camelCase format)
      ...
      058-maps.json
  screenshots/
    001-q001/
      google-images-page1.png
      google-images-page2.png
    ...
    058-maps/
      google-images-page1.png
      google-images-page2.png
```

## CAPTCHA / manual intervention

The collector runs headful (visible browser). If Google detects unusual traffic:

1. A prompt appears in the terminal.
2. Complete the verification manually in the browser window.
3. Press **Enter** in the terminal to resume.
4. If you skip, the query is marked `status: captcha` and skipped.

The script **never** attempts to programmatically bypass verification.

## Validation summary

Run `npm run validate:google-images` for a full check. Key assertions:

- Total queries = 58
- First query = 单词, last query = maps
- No `cat` in the query list
- Query 35 = `动物 词汇` (space between words)
- Query 48 = `Spanish vocabulary printable` (capital S)
- Query 49 = `ESL flashcards printable` (all-caps ESL)
- Each complete query has ≥ 2 screenshots
- Each complete query has labels array
- Each complete query has topResults (up to 10)

## Collection summary

*(Updated after collection run)*

| Status | Count |
|--------|-------|
| ok / complete | — |
| partial | — |
| captcha / blocked | — |
| failed | — |
| pending | — |
