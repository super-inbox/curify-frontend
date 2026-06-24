# Content Production Smoke Test — 2026-06-23

## 1. 目标

验证 content production workflow 端到端可跑通：
从一个 low-result query 出发，完成 query → intent routing → template matching → generation config → image generation → auto-tag / search_aliases → nano_inspiration 入库 → 搜索验证的完整链路。

## 2. 本次选择的 query

**`ESL flashcards printable`**

- 选择原因：eval 集中 P1 缺口，当前仅 3 hits（moderate），且全部命中同一模板 `children-english-vocab-spelling`；内容安全（教育类），无 IP/版权风险
- 验证工具：`scripts/score_user_queries.cjs`

## 3. 执行流程

| 步骤 | 工具 / 操作 | 结果 |
|---|---|---|
| Intent routing | 分析 query 意图 | Tier I: `language`，Tier II: `vocabulary/flashcard`，创作/教育型 |
| Template matching | 查 `nano_templates.json` | 匹配 `template-vocabulary`（en-es × School Supplies） |
| Config 生成 | 手写 config JSON | `scripts/configs/low_result_smoke_2026-06-23.json` |
| Dry-run | `--dry-run` | ✅ Added: 1, Skipped: 0, Failed: 0 |
| Image generation | Gemini `gemini-3-pro-image-preview` | ✅ 生成 662KB 词汇闪卡图片 |
| Watermark | ImageMagick `applyTiledWatermark` | ✅（需临时 `brew install imagemagick`） |
| Auto-tag | gpt-4o-mini，`auto_tag.cjs` | ✅ 打 Tier-3 tag: `school` |
| Search aliases | gpt-4o-mini，`enrichSearchAliases` | ✅ 初始 8 条；手动追加 8 条 ESL/printable alias |
| 入库 | 写入 `nano_inspiration.json` | ✅ record 已存在 |

## 4. 生成结果

**Record ID：** `template-vocabulary-english-spanish-school-supplies`

| 字段 | 值 |
|---|---|
| `template_id` | `template-vocabulary` |
| `params` | `{"language_pair":"en-es","topic_name":"School Supplies"}` |
| `topics` | `language, vocabulary, kawaii, intermediate, flashcards, illustration, art-prints, wall-art, english-spanish, school` |
| `search_aliases`（16 条） | school supplies, material escolar, bilingual vocabulary, 双语词汇, flashcards, 学习卡片, educational poster, 教育海报, **ESL flashcards printable**, **ESL flashcards**, **ESL vocabulary flashcards**, **printable flashcards**, printable vocabulary cards, English vocabulary flashcards, school supplies flashcards, classroom vocabulary flashcards |
| 图片 | `public/images/nano_insp/template-vocabulary-english-spanish-school-supplies.jpg`（662 KB） |
| 预览 | `public/images/nano_insp_preview/template-vocabulary-english-spanish-school-supplies-prev.jpg`（41 KB） |

## 5. 搜索验证结果

| Query | 生成前 | 生成后 | 变化 |
|---|---|---|---|
| `ESL flashcards printable` | 3 hits | **4 hits** | ✅ +1，新 record 直接召回 |
| `ESL flashcards` | 3 hits | **4 hits** | ✅ +1 |
| `printable flashcards` | — | **12 hits**（vocabulary×3） | ✅ 可召回 |
| `Spanish vocabulary printable` | 15 hits | **16 hits** | ✅ +1 |
| `material escolar` | 0 hits | **1 hit** | ✅ 西班牙语可直接命中 |
| `school supplies vocabulary` | 10 hits | **10 hits**（vocabulary×1） | ✅ 已可召回 |


## 7. 需要提交的文件

**本次 smoke test 产出（建议单独提交）：**

```
scripts/configs/low_result_smoke_2026-06-23.json    # smoke test config（新增）
public/data/nano_inspiration.json                   # 含新 record + ESL alias（已修改）
public/images/nano_insp/template-vocabulary-english-spanish-school-supplies.jpg         # 新增图片 662KB
public/images/nano_insp_preview/template-vocabulary-english-spanish-school-supplies-prev.jpg  # 新增预览 41KB
docs/content-production-smoke-test-2026-06-23.md    # 本报告（新增）
```

**注意：`nano_inspiration.json` 包含混合改动。** 除 smoke test 的新 record 外，此文件还包含分支上已有的 `topup_search_aliases.py` 改动（给大量 word-scene 记录追加了 `"闪卡"` alias）。这些是合法的 content 改动，但与 smoke test 无关。**建议一并纳入本次提交**（同属 content production 范畴），或单独拆成两个 commit。

**不建议在本次 commit 中包含的文件（属于其他 feature 分支改动）：**

```
app/[locale]/(public)/search/SearchResultsClient.tsx   # multi-intent topic co-occurrence feature
lib/intent_clusters.ts                                 # 同上
lib/__tests__/intent_clusters.test.ts                  # 同上
package.json / package-lock.json                       # 同上（新依赖）
.gitignore                                             # 待确认归属
```

## 8. 建议 commit message

```
content: add en-es school supplies vocabulary flashcard (ESL smoke test)

Smoke test run for content production workflow (docs/batch-generation.md).
Fills P1 gap on "ESL flashcards printable" query (3 → 4 hits):

- New record: template-vocabulary × en-es × School Supplies
- 16 search_aliases covering ESL/printable/Spanish vocabulary surface
  (incl. ESL flashcards printable, material escolar, bilingual vocabulary)
- Also: topup_search_aliases — added 闪卡 alias to existing word-scene records

Config: scripts/configs/low_result_smoke_2026-06-23.json
CDN sync: pending GCS access on deploy host (images in public/ only)
```
