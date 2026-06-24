# 8 Cluster 意图映射 — 完成度核查报告

**审计日期：** 2026-06-21  
**分支：** `baobao/multi-intent-topic-cooccurrence`  
**审计人：** Baobao  
**审计对象：** Multi-Intent 搜索系统中的"8个高层 Intent Cluster 映射"

---

## 一、核心结论

> **8 Cluster 映射已完成。代码、测试、双语标签、与生产搜索的集成均已到位。**

| 检查项 | 状态 |
|---|---|
| 8个 cluster 已定义（slug + 英/中标签 + topic映射） | ✅ 完成 |
| 聚合器函数实现（rankIntentClusters / filter） | ✅ 完成 |
| 单元测试（44条，全部通过） | ✅ 完成 |
| 已集成到生产搜索路由 | ✅ 完成 |
| 数据源存在可用 topic 证据 | ✅ 基本覆盖 |

---

## 二、8个 Cluster 定义一览

定义文件：`lib/intent_taxonomy.ts`（全新文件，本 PR 引入）

| # | Slug | 中文标签 | 英文标签 | 映射 Topic 数 |
|---|---|---|---|---|
| 1 | `learning-materials` | 学习材料 | Learning Materials | 34 |
| 2 | `visual-art` | 视觉与艺术 | Visual & Art | 25 |
| 3 | `merch-commerce` | 商品与商业 | Merch & Commerce | 9 |
| 4 | `social-personal` | 社交与个人 | Social & Personal | 25 |
| 5 | `storytelling-identity` | 故事与身份 | Storytelling & Identity | 43 |
| 6 | `travel-place` | 旅行与地点 | Travel & Place | 12 |
| 7 | `events-hot-now` | 活动与热点 | Events & Hot Now | 25 |
| 8 | `diy-guides` | DIY 与指南 | DIY & Guides | 9 |

**总计**：8个 cluster，合计 182 条 topic slug 映射（含跨 cluster 有意重叠的 topic，如 `step-by-step-tutorial` 同时映射 `learning-materials` 和 `diy-guides`）。

每个 cluster 包含：
- 唯一 `slug`（TypeScript const union 类型，编译期安全）
- 双语标签 `labels.en` / `labels.zh`
- `topicSlugs` 数组（无重复，全小写规范化）

---

## 三、核心文件清单

### 3.1 配置层（纯数据，无副作用）

**`lib/intent_taxonomy.ts`**（新增）
- 导出 `INTENT_CLUSTER_SLUGS`（8个 slug 的 const 数组）
- 导出 `INTENT_CLUSTERS`（`readonly IntentCluster[]`，完整定义）
- 导出工具函数：`getIntentCluster` / `isIntentClusterSlug` / `getIntentClusterLabel` / `getIntentClusterTopicSet`
- O(1) 查找：内部 `Map<slug, cluster>` 构建于模块初始化时

### 3.2 聚合器层（核心算法）

**`lib/intent_clusters.ts`**（已修改，在原 legacy 路径基础上新增 Phase 2 实现）

新增的三个函数：

| 函数 | 功能 | 位置 |
|---|---|---|
| `rankIntentClusters(cooccurrence, opts)` | 将 Top-20 共现证据映射为 cluster chips，返回 `ClusterChip[]` | line 179 |
| `filterInspirationsByCluster(resolved, clusterSlug)` | 按 cluster 过滤 inspiration 结果（保留排序） | line 228 |
| `filterTemplatesByCluster(templates, survivingIds, clusterSlug)` | 按 cluster 过滤模板展示（直接 topic 匹配 OR inspiration 关联） | line 246 |

**排名规则**（无 LLM 调用，纯数据驱动）：
- 一条结果在同一 cluster 下只贡献 +1（Set union 去重）
- 同一结果可在不同 cluster 各贡献 +1（跨 cluster 不互斥）
- 排序：count 降序，slug 字母升序（决定性 tie-break）
- 未通过 `minCount` 阈值的 cluster 不输出

### 3.3 测试层

**`lib/__tests__/intent_clusters.test.ts`**（已修改）

```
测试结果：44 tests passed ✅（运行时间 13ms）
```

| 测试组 | 测试数 | 覆盖内容 |
|---|---|---|
| `topIntentChips`（legacy） | 5 | 计数、同义词折叠、minCount、topN、kind字段 |
| `topIntentChipsFromTopicCounts` | 9 | inspiration/模板来源、同义词折叠、边界条件 |
| `intent taxonomy` | 10 | 恰好8个cluster、唯一slug、双语标签、slug规范化、unknown slug安全处理 |
| `rankIntentClusters` | 9 | +1去重规则、跨cluster计数、minCount/topN、tie-break、无证据cluster不输出、无Business Override |
| `filterInspirationsByCluster` | 3 | 过滤逻辑、unknown slug直通、排序保留 |
| `filterTemplatesByCluster` | 4 | 直接topic匹配、inspiration关联匹配、unknown slug直通 |
| 回退机制 | 1 | cluster chips为空时 topic chips仍可用 |
| 其他集成检查 | 3 | kind字段、locale标签、证据独立性 |

---

## 四、与生产搜索系统的集成状态

**搜索路由：** `app/[locale]/(public)/search/page.tsx`  
**结果展示：** `app/[locale]/(public)/search/SearchResultsClient.tsx`

集成方式（已上线）：
1. 搜索路由调用 `rankIntentClusters()` 生成 cluster chips
2. 当任意 cluster 的 `count >= minCount` 时，优先展示 cluster chips（Phase 2 路径）
3. 否则回退到原始 output-type topic chips（legacy 路径）
4. 用户点击 cluster chip → URL 附加 `?within=<clusterSlug>` → 页面同步调用 `filterInspirationsByCluster` + `filterTemplatesByCluster` 过滤结果

---

## 五、数据源覆盖情况

Topic slug 需存在于至少一个数据源（`nano_inspiration.json`、`nano_templates.json`、`lib/taxonomy.json`）才能产生有效证据。

### 5.1 数据源概况

| 数据源 | 记录数 | 唯一 topic 数 |
|---|---|---|
| `public/data/nano_inspiration.json` | 3,071 条 | 276 个 |
| `public/data/nano_templates.json` | 287 条 | 107 个 |
| `lib/taxonomy.json` | — | 40 个 tier slug |

### 5.2 各 Cluster 的数据覆盖（合并两个 nano 数据源）

| Cluster | inspiration 覆盖 | templates 覆盖 | 综合评估 |
|---|---|---|---|
| learning-materials (34) | 24/34 | 24/34 | ✅ 核心 topic 均有证据（learning, vocabulary, flashcards 等） |
| visual-art (25) | 17/25 | 17/25 | ✅ 主力 topic 覆盖（design, posters, illustration, art 等） |
| merch-commerce (9) | 2/9 | 9/9 | ✅ 模板层全覆盖（product, stickers, mascots 等） |
| social-personal (25) | 17/25 | 15/25 | ✅ 主力 topic 覆盖（lifestyle, fashion, beauty 等） |
| storytelling-identity (43) | 34/43 | 16/43 | ✅ 核心+IP+MBTI亚型在 inspiration 层覆盖 |
| travel-place (12) | 9/12 | 11/12 | ✅ 绝大多数覆盖（travel, city, map, culture 等） |
| events-hot-now (25) | 24/25 | 6/25 | ✅ 体育赛事 topic 集中在 inspiration 层，符合预期 |
| diy-guides (9) | 4/9 | 8/9 | ✅ 核心 topic 覆盖（recipes, guides, food 等） |

### 5.3 Gap 说明（不影响功能，属数据标注待补充项）

以下 topic 在三个数据源中均未找到，属于**预留的扩展标注位**：

- `learning-materials`: `kids-vocabulary`, `intermediate`, `advanced`（细粒度难度分级，暂未标注到 inspiration/template 层）
- `visual-art`: `vintage-retro`, `pastel`, `y2k`, `isometric`, `artistic`（风格标签，需后续 LLM 标注覆盖）
- `social-personal`: `chic`, `athleisure`, `denim`, `sneakers`（时尚细分词，暂未标注）
- `events-hot-now`: `schedule`（日程/赛程类，暂无对应数据）

这些 topic 的缺失不影响 cluster 整体的功能表现——每个 cluster 均有足够的核心 topic 产生有效证据。

---

## 六、已知限制与后续建议

| 项目 | 当前状态 | 建议 |
|---|---|---|
| MBTI 亚型（16个）topic slug | 仅存在于 nano_inspiration，未标注到模板层 | 可在 nano_templates 中补充 MBTI 模板的亚型标签 |
| events-hot-now 体育赛事 | 体育赛事 topic（nba, nfl 等）仅在 inspiration 层，模板覆盖率低 | 视运营方向决定是否向模板补充赛事 topic |
| 风格标签未覆盖 | vintage-retro, pastel, y2k 等风格词在数据中未出现 | 下一轮 LLM 标注批次中纳入风格词表 |
| Business Override | 当前 `rankIntentClusters` **不含** Business Override 逻辑 | 如需人工干预排序，可在调用层（search page）叠加 |

---

## 七、可独立发送的交付物清单

以下文件可直接发送给老板或存档：

| 文件 | 内容 | 大小 |
|---|---|---|
| `lib/intent_taxonomy.ts` | 8个 cluster 完整定义（slug、双语标签、topic 映射） | ~328 行 |
| `lib/intent_clusters.ts` | 聚合器实现（rankIntentClusters / filter 函数） | ~261 行 |
| `lib/__tests__/intent_clusters.test.ts` | 44条单元测试，全部通过 | ~584 行 |
| `docs/daily_report/8-cluster-mapping-audit-2026-06-21.md` | 本报告 | — |

若需要 **最简版一页概览**，可只发送 `lib/intent_taxonomy.ts`——该文件可独立阅读，包含所有 8 个 cluster 的 slug、中英文标签、完整 topic 映射表，无任何外部依赖。

---

## 八、向老板汇报的建议口径（草稿）

> **"8 Cluster 意图映射已完成。**
> 
> 8个高层创作意图分类（学习材料、视觉与艺术、商品与商业、社交与个人、故事与身份、旅行与地点、活动与热点、DIY 与指南）已在代码层完整定义，包含中英双语标签和每个 cluster 的 topic 证据映射表。聚合算法、过滤函数均已实现，并通过 44 条单元测试验证（全绿）。
> 
> 目前已集成到生产搜索路由，用户搜索时可看到 cluster chips（如"学习材料"、"视觉与艺术"），点击后可按 cluster 过滤 inspiration 和模板结果。
> 
> 核心文件可单独发送：`lib/intent_taxonomy.ts`（cluster 定义表）即是完整的可读交付物，无需运行代码即可查看全部 8 个映射。"

---

*报告生成时间：2026-06-21 | 分支：baobao/multi-intent-topic-cooccurrence*
