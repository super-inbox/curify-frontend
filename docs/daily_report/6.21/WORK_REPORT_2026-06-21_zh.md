# 工作报告 — 2026-06-21

> **关于 query 数量的说明：** 当前 repo 数据文件中实际使用的是 **58 个 query**。本报告所有分析均基于实际 58-query 数据集执行。

---

## 1. 任务完成情况

| 要求 | 今天完成了什么 | 状态 | 依据 / 文件 |
|---|---|---|---|
| **a.** 生产代码 + progress docs 推到 branch | 两个修复 commit 已推到 `baobao/multi-intent-topic-cooccurrence`；docs 已在本地生成，待单独 docs commit | 代码 ✅ 已推 · Docs ⏳ 待提交 | [Branch 链接](https://github.com/super-inbox/curify-frontend/tree/baobao/multi-intent-topic-cooccurrence) |
| **c.** 5 个平台搜索结果都有，需要总结 insight | 生成了 5-platform 平行对比报告和 Curify-centered 报告，各附 CSV | ✅ 已完成（本地） | `EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md`、`CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` |
| **d.** 58 query tier 1 分布；5 平台对比（consumer vs creator、diversity、星级评分、重点类目） | Tier-1 分布 CSV + 平台评分 CSV 已生成（两版各一套）；星级表 + 定性 insight 已写入报告 | ✅ 已完成（本地） | `query-tier1-distribution-58*.csv`、`platform-scorecard-5x58*.csv` |
| **e.** 修复 recall 不全的 query | 通过 alias / metadata 修复 6 条 query 的 recall；剩余缺口已标注为模板库存不足问题 | ✅ 已完成 + 已推 | `d25921dc`、`lib/__tests__/thin_recall_queries.test.ts` |

---

## 2. Remote Branch 推送情况

**Branch 名称：** `baobao/multi-intent-topic-cooccurrence`  
**Branch 链接：** https://github.com/super-inbox/curify-frontend/tree/baobao/multi-intent-topic-cooccurrence  
**Tracking 状态：** 与 `origin/baobao/multi-intent-topic-cooccurrence` 保持同步（`git branch -vv` 已确认）  
**main：** 未修改

### 今天推上去的 commits

#### `9f4836f2` — fix: improve metadata coverage for warn queries

| 文件 | 改动 |
|---|---|
| `public/data/nano_inspiration.json` | 为 6 条 WARN query 补充 metadata / search_aliases |
| `messages/en/nano.json` | 修复关联 WARN 条目的 locale copy |
| `lib/__tests__/search_metadata_scenarios.test.ts` | 新增 497 行测试，防止 WARN 修复回归 |

#### `d25921dc` — fix: improve recall for thin search queries

| 文件 | 改动 |
|---|---|
| `public/data/nano_inspiration.json` | 添加 search_aliases 提升 6 条 thin-result query 的 recall |
| `lib/__tests__/thin_recall_queries.test.ts` | 新增 412 行测试，锁定 strict-recall 基线 |

#### `ca338b48` — feat(search): add topic co-occurrence intent evidence *(更早)*
Topic co-occurrence 信号已并入搜索 intent pipeline，已推，无需改动。

---

## 3. WARN Query Metadata 修复（`9f4836f2`）

**修了什么：** 之前 audit 结果为 WARN 级别的 6 条 query（metadata 缺失或不足、无 search_aliases、locale copy 不完整）均已修复。

**改动文件：**
- `public/data/nano_inspiration.json` — metadata / alias 补充（净增 197 行）
- `messages/en/nano.json` — locale copy 修正（净增 4 行）
- `lib/__tests__/search_metadata_scenarios.test.ts` — 新增测试套件（+497 行）

**为什么满足 WARN 修复要求：**  
测试套件现在会对每条原 WARN query 断言 metadata 正确存在。后续若有回归，测试会在 merge 前失败报警。

---

## 4. Thin Recall 修复（`d25921dc`）

### 各 query 修复结果

| Query | 修复前 strict recall | 修复后 strict recall | 修复方式 | 备注 |
|---|---|---|---|---|
| book lovers gift guide | 0 | 7 | alias / metadata | 改善明显，alias 覆盖效果好 |
| Spanish vocabulary printable | 0 | 15 | alias / metadata | recall 大幅恢复 |
| bilingual flashcards for kids learning korean fruits | 0 | 1 | alias / metadata | 部分改善——需要更多韩语双语闪卡模板 |
| lunar new year red envelope graphic design | 0 | 8 | alias / metadata | 文化类 query recall 恢复良好 |
| watercolor map of europe travel destinations | 0 | 1 | alias / metadata | 部分改善——需要更多欧洲旅行地图模板 |
| cuban sandwich recipe poster | 0 | 1 | alias / metadata | 部分改善——需要更多食谱海报模板 |

### Alias / metadata 无法解决的问题——模板库存缺口

以下缺口是纯 recall 修复无法覆盖的，需要补充新模板内容：

- **工程 / 技术图表类** — 当前只有约 6 条 strict match，需要 `engineering blueprint / technical diagram` 类型模板。
- **欧洲水彩旅行地图** — 现在能召回 1 条，如需有竞争力的结果集，需要更多 Europe travel destination map 模板。
- **韩语双语水果闪卡** — 现在能召回 1 条，若要更广覆盖，需要专门的韩语双语闪卡模板。
- **古巴三明治食谱海报** — 现在能召回 1 条，如需达到约 10 条，需要更多 recipe poster 模板。

以上标注为**内容 / 模板库存缺口**，建议纳入后续内容采购 sprint。

---

## 5. External Signal Insights（要求 c & d）

针对 **58 queries × 5 platforms**，产出了两个版本的报告。

### 第一版 — 5-Platform 平行对比版

**定位：** 把 Curify、Google Images、Bing Images、Pinterest、Canva 作为 5 个平台进行横向平行对比。

**覆盖内容：**
- 58 query tier-1 分布
- Consumer-oriented / Creator-oriented / Mixed query 分类
- 各平台 diversity 和类目广度
- 各维度 5 颗星评分（5 个平台各得几颗星）
- 平台级定性 insight
- 每个 query 下的重点类目

**文件：**

| 文件 | 状态 |
|---|---|
| `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` | ✅ 已生成 |
| `docs/external-signal-pilot/query-tier1-distribution-58.csv` | ✅ 已生成 |
| `docs/external-signal-pilot/platform-scorecard-5x58.csv` | ✅ 已生成 |
| `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md` | ✅ 已生成（中文版，供内部 review） |

---

### 第二版 — Curify-Centered 版 ⭐ 推荐主报告

**定位：** 以 Curify 为被优化对象，将 Google Images、Bing Images、Pinterest、Canva 作为 external signals，分析这些信号如何帮助改善 Curify 的 search、routing 和 template matching。

**各平台信号角色：**
- **Google Images / Bing Images** → 宏观视觉需求、consumer 搜索覆盖、diversity 信号、类目扩展
- **Pinterest** → 灵感聚类、相关子意图、视觉风格多样性
- **Canva** → 模板 / 可打印 / creator intent 信号
- **Curify** → 当前内容覆盖基线、routing 缺口、模板 / 可操作性缺口检测

**覆盖内容：**
- Curify 搜索结果与外部平台信号的对齐 / 偏差
- 基于 external signal 重叠度的 per-query Curify opportunity 评分
- 针对 search recall、intent routing、话题扩展、template matching、内容缺口检测的具体优化建议

**文件：**

| 文件 | 状态 |
|---|---|
| `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` | ✅ 已生成 |
| `docs/external-signal-pilot/query-tier1-distribution-58-curify-centered.csv` | ✅ 已生成 |
| `docs/external-signal-pilot/platform-scorecard-5x58-curify-centered.csv` | ✅ 已生成 |
| `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md` | ✅ 已生成（中文版，供内部 review） |

---

### 推荐提交顺序

1. **主报告：** `CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` — 产品优化视角，对 Curify search / routing 路线图直接可用。
2. **辅助分析：** `EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` — 横向平台对比 + 星级评分，适合作为附件或横向 benchmark 讨论。

---

## 6. 文件清单

### 已推到 remote branch

| 文件 | 对应 commit |
|---|---|
| `public/data/nano_inspiration.json` | `9f4836f2`、`d25921dc` |
| `messages/en/nano.json` | `9f4836f2` |
| `lib/__tests__/search_metadata_scenarios.test.ts` | `9f4836f2` |
| `lib/__tests__/thin_recall_queries.test.ts` | `d25921dc` |

### External signal insight 报告 — 本地已生成 / 待 docs commit

**5-platform 平行对比版：**
- `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md`
- `docs/external-signal-pilot/query-tier1-distribution-58.csv`
- `docs/external-signal-pilot/platform-scorecard-5x58.csv`
- `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md`

**Curify-centered 版：**
- `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md`
- `docs/external-signal-pilot/query-tier1-distribution-58-curify-centered.csv`
- `docs/external-signal-pilot/platform-scorecard-5x58-curify-centered.csv`
- `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md`

### 工作报告 — 本地已生成 / 待 docs commit

- `docs/daily_report/WORK_REPORT_2026-06-21.md`（英文版）
- `docs/daily_report/WORK_REPORT_2026-06-21_zh.md`（本文件）

---

## 7. 当前状态

| 项目 | 状态 |
|---|---|
| 生产修复 commits（WARN + thin recall） | ✅ 已推到 `origin/baobao/multi-intent-topic-cooccurrence` |
| Topic co-occurrence feature commit | ✅ 已推（更早） |
| External signal insight 报告（两版） | ✅ 本地已生成 — **待 docs commit** |
| 工作报告 | ✅ 本地已生成 — **待 docs commit** |
| `main` branch | 未修改 |

---

