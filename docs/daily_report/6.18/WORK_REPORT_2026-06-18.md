# 2026-06-18 Daily Report — Multi-Intent Search

## 1. 今日目标

今日目标是使 Multi-Intent 搜索意图识别完全依赖 Curify 现有内容 topic 数据，而非运行时 LLM 零样本分类。具体来说，通过分析 Top-20 搜索结果的 topic 共现频率，将内容证据映射到 8 个高层创作意图集群（Intent Cluster），并在搜索结果页以 Chip Pills 形式呈现，支持用户按意图维度缩窄结果。

---

## 2. 今日完成

1. **代码库与搜索流水线 Audit**  
   系统梳理了 `/search` 页面的匹配逻辑、template topics 数据来源（`nano_templates.json`，107 个唯一 topic slug）、inspiration topics（`nano_inspiration.json`，276 个唯一 topic slug）及现有 `within=` chip 机制。

2. **Topic 解析层（`lib/topic_resolver.ts`，已提交）**  
   - 每条 inspiration 记录从自身 topics 字段提取主题  
   - 通过 `template_id` 关联父模板的 topics 字段  
   - 两者合并去重，得到每条结果的 `mergedTopics`

3. **Top-20 共现计算（`lib/topic_cooccurrence.ts`，已提交）**  
   - 取排名前 20 的 inspiration 结果  
   - 每条结果对每个 topic 最多贡献 +1（Set 去重）  
   - 分别统计 inspiration-only、template-only、merged 三套频次，并附带 `resultIds` 以供上层去重

4. **原始 Intent Pills 接入（`lib/intent_clusters.ts`，已提交）**  
   `topIntentChipsFromTopicCounts` 将共现数据映射到 19 个 OUTPUT_TYPE_SLUG（infographic、flashcards、wall-art 等），以频次降序渲染 "Explore further" chip 行；`within=<slug>` 参数将结果缩窄到对应 topic。

5. **八个高层 Intent Cluster（`lib/intent_taxonomy.ts`，未提交）**  
   新建纯配置模块，定义 8 个 cluster，每项包含稳定 slug、中英文标签、以及审核自现有数据的 topic slug 映射：

   | Slug | English Label | 中文标签 |
   |---|---|---|
   | `learning-materials` | Learning Materials | 学习材料 |
   | `visual-art` | Visual & Art | 视觉与艺术 |
   | `merch-commerce` | Merch & Commerce | 商品与商业 |
   | `social-personal` | Social & Personal | 社交与个人 |
   | `storytelling-identity` | Storytelling & Identity | 故事与身份 |
   | `travel-place` | Travel & Place | 旅行与地点 |
   | `events-hot-now` | Events & Hot Now | 活动与热点 |
   | `diy-guides` | DIY & Guides | DIY 与指南 |

   所有映射 topic slug 均在 `nano_templates.json`、`nano_inspiration.json` 或 `taxonomy.json` 中有实际记录，无虚构 slug。

6. **`intent=<cluster-slug>` 过滤（`page.tsx`，未提交）**  
   服务端解析并验证 `intent` URL 参数，有效值触发两级过滤：(a) inspiration 结果按 `mergedTopics` 与 cluster topic set 的交集过滤，保留原排序；(b) template 栏按直接 topic 匹配或关联 inspiration 存活情况包含。`intent` 优先级高于 `within`，两者同时存在时 `within` 被 suppress。

7. **原有 `within=` 行为完全兼容**  
   `within=` 参数行为、active pill 样式、tracking 事件均未变动；cluster pill 使用独立参数 `intent=`，两套 chip 互不干扰。

8. **单元测试与 TypeScript 验证（`lib/__tests__/intent_clusters.test.ts`，未提交）**  
   新增 24 个 intent taxonomy + cluster ranking + filtering 测试用例，与原有 20 项相加共 74 个测试全部通过；`npx tsc --noEmit` 零错误。

---

## 3. 核心实现逻辑

```text
Query
→ 现有搜索检索（strict-AND + relaxed，含 LLM rewrite）
→ Top 20 排名 inspiration 结果
→ inspiration.topics + 父模板 topics
→ 合并去重（mergedTopics，每条结果每个 slug 最多 +1）
→ 共现频次统计（TopicCooccurrenceResult.mergedTopicCounts）
→ 高层 Intent Cluster 映射（8 clusters，每结果对同一 cluster 最多 +1）
→ Cluster Chips 排序展示 / ?intent= 过滤
```

**关键设计原则：**

- **数据驱动，非 LLM 生成**：Cluster 权重完全来自当前搜索结果的 topic 共现频次，不依赖运行时 LLM 分类。
- **一票制**：一条 result 无论携带多少个属于同一 cluster 的 topic，对该 cluster 只贡献 +1。
- **跨 cluster 独立计票**：同一 result 的 topics 若属于不同 cluster（如 `science` → Learning Materials，`posters` → Visual & Art），两个 cluster 各得 +1，相互独立。
- **Fallback 机制**：若所有 cluster 均未达到 `minCount` 阈值，自动回退展示原有 OUTPUT_TYPE_SLUG topic chips。

---

## 4. 验证结果

| 检查项 | 结果 |
|---|---|
| Unit tests | **74 passed / 74**（3 test files） |
| TypeScript (`tsc --noEmit`) | **零错误** |
| Git whitespace check (`git diff --check`) | **通过** |
| 受保护 JSON 数据集 | **无变动**（nano_templates.json、nano_inspiration.json、taxonomy.json） |
| package.json / lockfile | **无变动** |
| Runtime LLM 调用新增 | **否** |
| Business Override 新增 | **否** |

**浏览器验收：**

- 早前已本地验证 Topic Co-occurrence 版本（commit `ca338b48`）在以下 query 的表现：`cats`、`science poster`、`dinosaur poster`、`?within=infographic`。
- **本次新增的八个高层 Cluster Pills（`intent=` 参数）尚未完成本地页面视觉验收，待补充。**

---

## 5. 当前代码状态

- **Branch**：`baobao/multi-intent-topic-cooccurrence`
- **最新 commit**：`ca338b48 feat(search): add topic co-occurrence intent evidence`
- **高层 Cluster 相关变更（本次新增）：尚未提交**，当前为 working tree 修改状态

已修改/新建的文件（均未提交）：

| 文件 | 状态 |
|---|---|
| `lib/intent_taxonomy.ts` | 新建（未跟踪） |
| `lib/intent_clusters.ts` | 修改 |
| `app/[locale]/(public)/search/page.tsx` | 修改 |
| `app/[locale]/(public)/search/SearchResultsClient.tsx` | 修改 |
| `lib/__tests__/intent_clusters.test.ts` | 修改 |

---

## 6. 当前结论

Multi-Intent 搜索已建立完整的数据驱动基础：topic 解析、共现计算、8 个高层 Intent Cluster 映射及 `intent=` 过滤均已在本地通过自动化验证。所有 intent 信号均来自 Curify 现有内容数据，排名逻辑纯粹由证据决定，尚未引入任何业务优先级提升逻辑。当前代码可运行、可测试，等待 review 后合并提交。

---

## 7. 下一步

1. **实现可配置 Business Override**：为 Learning Materials（EdTech 方向）和 Merch & Commerce 实现优先级提升配置，支持运营侧调整而无需改动核心排名代码。
2. **本地浏览器验收八个高层 Cluster Pills**：验证 `intent=` 过滤、active pill 显示、× 移除行为及 chip 样式在主要 query（cats、science poster、dinosaur poster）下的实际表现。
3. **修复 `cat` / `cats` 路由一致性问题**：当前单数/复数查询存在跳转不一致的情况，需统一处理。
4. **调查并改善六个 WARN 查询的召回率**：针对已标记的低召回率 query，分析原因并补充 alias 或 template 标签。
5. **Bing Image API 与 Pinterest 结果获取调研**：评估外部图片来源的集成可行性与数据格式。
6. **文档合并**：将项目实现说明合并到搜索评估 Markdown 主文档（`search-and-content.md`）。
