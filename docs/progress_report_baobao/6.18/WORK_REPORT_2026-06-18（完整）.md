# Curify Self-evolving Search 工作日报

**日期：** 2026-06-19
**分支：** `baobao/multi-intent-topic-cooccurrence`

---

## TL;DR

- **Multi-Intent V0 可本地 Demo**：完成 Topic Co-occurrence + 8 Cluster 映射 + Intent Pills UI，Multi-Intent chip 基于内容 topic 共现生成，不依赖运行时 LLM zero-shot，并支持点击过滤。
- **`cat/cats` 路由修复**：发现 `cat` 被 redirect 到 `/topics/animal` 而 `cats` 不被 redirect 的不一致行为，Prompt 4.6 已修复，`cat`/`cats`/`Cat`/`CATS` 全部正确进入多意图搜索页。
- **6 条 WARN audit + metadata 修复**：Paris 7→2 条精确命中、childhood snacks 7→1 条，消除 cascade 假阳性；WARN 总数维持 19（未人为降低）。
- **External Signal Pilot 启动**：Bing API 已退役，切换为人工浏览器观测；5-query pilot 框架完成，`cat` 和 `paris travel itinerary` 截图与 notes 已完成，`v0_observations.json` 结构化填写待完成。
- **测试**：160 tests 全通过，TypeScript 零错误，Eval PASS=106/WARN=19/FAIL=0（125 条）。

---

## 1. 今日完成

### 1.1 Multi-Intent V0 与路由修复

**Topic Co-occurrence 基础**（昨日提交，今日验收）

每条 inspiration 的自身 topics 与父模板 topics 合并去重，生成 `mergedTopics`；对 Top-20 ranked inspirations 计算 topic 共现频次，每条结果对同一 topic 只计一次。**Intent chip 数据来源从原先的 matched templates 改为 Top-20 result-level 共现证据**，chip 完全由当前检索结果支撑，不是运行时 LLM zero-shot。

**8 个高层 Intent Cluster**（基于老板指定方向，完成 topic slug 映射与 ranking）

| Cluster | 中文标签 |
|---|---|
| `learning-materials` | 学习材料 |
| `visual-art` | 视觉与艺术 |
| `merch-commerce` | 商品与商业 |
| `social-personal` | 社交与个人 |
| `storytelling-identity` | 故事与身份 |
| `travel-place` | 旅行与地点 |
| `events-hot-now` | 活动与热点 |
| `diy-guides` | DIY 与指南 |

所有映射基于 nano_templates.json 和 nano_inspiration.json 中实际存在的 topic slug，无虚构。已实现：`?intent=<slug>` 过滤、active pill（含移除链接）、inspiration 和 template 同步过滤、无 cluster 达阈值时回退到 raw topic chips。

**Query Normalization 与 Business Override**

- 规范化：`cats → cat`，`kittens → kitten`
- 当前 Business Override 规则（3 条）：
  - `cat / cats → visual-art` 置顶
  - `kitten / kittens → visual-art` 置顶
  - `cat breeds → learning-materials` 置顶
- Override **只重排已有 evidence-backed cluster，不注入无内容证据的 cluster**

**Redirect 修复（Prompt 4.5 发现 → Prompt 4.6 修复）**

Prompt 4.5 验收时发现 `cat` 被 redirect 至 `/topics/animal`（旧 alias 配置），而 `cats` 留在搜索页。修复方式：新增 `shouldSkipTopicRedirect` 函数，有 Business Override 的 query 跳过 topic redirect。

最终路由行为：

| Query | 路由结果 |
|---|---|
| `cat`、`cats`、`Cat`、`CATS`、` cat `（含空格） | 全部进入 `/search`，Visual & Art 首位 chip |
| `dog` | 仍 redirect → `/topics/animal` ✅ |
| `travel` | 仍 redirect → `/topics/travel` ✅ |

---

### 1.2 WARN Audit 与 Metadata 修复

**Prompt 5（纯审计）** 对 6 条 WARN query 完成根因分类，归纳为四类问题：

1. **topics 缺失**：大批 inspirations 的 `topics: []`，导致 cluster 无法感知内容意图
2. **English search_aliases 缺失**：中国建筑、warmup 系列等仅有中文 aliases，英文 query 不可见
3. **Template description cascade false positive**：description 中的举例词（"Paris landmarks"、"childhood snacks"）被 strict 匹配器索引，导致该 template 下所有 inspiration 批量假阳性命中
4. **Catalog depth / format coverage gap**：真实内容数量不足，metadata 修复无法替代新内容

6 条 WARN query 及各自核心问题：

| Query | 主要问题 |
|---|---|
| `before after kitchen organization makeover` | Catalog depth gap：仅 1 条 before-after，expected=moderate 需 3+ |
| `paris travel itinerary` | Description cascade（7 条假阳性） + catalog content gap |
| `architecture empire state building` | 中文 aliases only，英文 query 不可见 |
| `childhood snacks then vs now` | Description cascade（7 条假阳性） |
| `warmup routine running checklist` | "checklist" 不存在于任何 warmup 字段 |
| `vintage stamp collection garden birds` | strict-before-relaxed 导致 4 条相关 siblings 被丢弃 |

**Prompt 6（安全修复）** 对 `nano_inspiration.json` 和 `messages/en/nano.json` 实施精准修复：

- `public/data/nano_inspiration.json`：修改 21 条记录，包括 warmup 7 条、vintage-stamp 5 条、architecture 4 条、then-vs-now 1 条、Paris 2 条和 before-after kitchen 2 条。
- `messages/en/nano.json`：2 条 template description 移除具体举例词（移除"Paris landmarks, Rome hidden gems"和"childhood"等污染词）
- 新增 `lib/__tests__/search_metadata_scenarios.test.ts`：30 条 metadata 回归测试

精度变化：

| Query | 修复前 strict | 修复后 strict | 变化 |
|---|---|---|---|
| `paris travel itinerary` | 7（5 条假阳性） | 2 | cascade 消除 |
| `childhood snacks then vs now` | 7（6 条假阳性） | 1 | cascade 消除 |
| `architecture empire state building` | 1 | 1（+英文可见） | 检索可达性提升 |
| `vintage stamp collection garden birds` | 1 strict | 1 strict + 4 relaxed | siblings 现可通过 relaxed 访问 |

**WARN 总数维持 19 条**——目标是消除假阳性、提升精度，而非修改 expected bucket 强行得 PASS。6 条 query 在 metadata 修复后仍存在不同程度的 catalog depth 或 format coverage gap，需新增模板或 inspirations 才能达到 expected bucket。

**Prompt 6.5（Paris topic 语义复核）** 专项复核 `Historic Landmarks of Paris` 的 `topics: ["france","travel","itinerary"]`。结论：`itinerary` 语义准确，模板内容为 ordered route / guided path，**无额外代码修改**。真实缺口是 catalog 中缺少 1-day/3-day/5-day itinerary、day-by-day planner、printable travel planner 等格式的内容，而非 topic 标注错误。

---

### 1.3 External Signal Research 与 Manual Pilot

**Prompt 7** 完成 External Signal 研究方案设计：`ExternalSignalRecord` JSON schema、11 种 surface 枚举（refinement chip、related search、autocomplete 等）、20-query research set、Curify / Bing / Pinterest 三平台比较方法论。

**Prompt 7.5 修正 Bing API 结论**：Bing Image Search API v7 已于 2025-08-11 退役，`api.bing.microsoft.com/v7.0/` 端点全部不可用。Prompt 7 中申请 API key、建立 Bing collector 的方案**全部作废**。Pinterest 公共 API 不支持 general query → pins 搜索，不使用 Playwright / scraper。

**V0 最终方案**：Bing Images 和 Pinterest 均采用**人工浏览器观测**（截图 + Markdown notes），是当前项目权限、成本和范围下采用的 V0 方案。

建立的研究 artifacts：

- `data/external_signals/README.md`
- `data/external_signals/v0_query_set.json`（5-query pilot 查询集）
- `data/external_signals/v0_observations.json`（结构已建立，外部平台字段为 pending_manual_capture）
- `data/external_signals/v0_manual_collection_template.md`

**5-query pilot**（cat / paris / science poster / paris travel itinerary / warmup routine running checklist），今日完成 **2/5** 的三平台截图采集与人工 notes，`v0_observations.json` 结构化字段**待填写**。

---

## 2. 关键数据与验证结果

| 验证项 | 结果 |
|---|---|
| Unit tests | **160 / 160 通过**，6 files |
| TypeScript | `npx tsc --noEmit` **零错误** |
| Eval PASS / WARN / FAIL | **106 / 19 / 0**（共 125 条） |
| nano_inspiration.json 修改 | **21 条**记录 |
| messages/en/nano.json 修改 | **2 条** template description |
| Formal pilot 完成 | **2 / 5** query |
| 正式 pilot 截图（cat + paris_travel_itinerary） | **17 张** PNG |
| 额外探索截图（beijing，不在正式 pilot 内） | 9 张 PNG |
| 截图总计 | **26 张** PNG |

**Localhost 验证结论（全部通过）**：Intent chips 正常显示 · Active pill 与移除链接正确 · Invalid intent slug 静默忽略 · `cat/cats` 路由一致 · `dog/travel` redirect 无回归 · 6 条 WARN query 均返回 HTTP 200，cascade 假阳性已消除

测试随实现阶段逐步扩展，最终达到 6 个 test files、160 项测试全部通过。所有修改当前仅在本地工作树，**尚未 push，不影响远程主分支**（Prompt 2 对应的 co-occurrence 基础已单独提交 commit `ca338b48`）。

---

## 3. Pilot 主要发现

### 3.1 `cat`（截图 8 张，`cat_notes.md`）

**Curify Explore further**

| Cluster | 结果数 |
|---|---|
| Visual & Art | 12 |
| Social & Personal | 9 |
| Learning Materials | 7 |
| Storytelling & Identity | 6 |
| Merch & Commerce | 4 |

**Bing 主要 refinement chips**：Cat Art · Cat Meme · Cat Breeds · Cute Cats · Cat ClipArt · Cursed Cat · Banana Cat · CatDog · Silly Cat

**Pinterest 主要 refinement chips**：Meme · Pfp · Drawing · Cute · Nyan · Tattoo · Black · Jelly

**结论**：Curify 的 Visual & Art 置顶与外部信号基本一致。Bing / Pinterest 对 Meme、PFP、Drawing、Cute art style 等细分方向比 Curify 更突出，当前搜索页没有明显呈现 Cat PFP / Cat Meme 专项入口。是否属于真实 catalog gap 仍需运行 coverage scoring 确认。

---

### 3.2 `paris travel itinerary`（截图 9 张，`paris_travel_itinerary_notes.md`）

**Curify**：Few results，精确结果约 2 条（paris miniature + Historic Landmarks of Paris）；cluster chips 仅 Travel & Place(2)、Visual & Art(2)；内容以 map / route infographic 为主。

**Bing 主要 chips / related searches**：3-Day Itinerary Paris · Paris 5 Day Itinerary · Best 8 Day Paris Itinerary · Neighborhood Map · Versailles · Southern France · Paris Itinerary Planner · First-Time Visitor · Printable Itinerary

**Pinterest 主要发现**：3–4 day itinerary infographic · day-by-day 规划图 · Paris bucket list · tourist maps · printable travel templates

**结论**：Bing / Pinterest 对 N-Day itinerary、first-time visitor、neighborhood map、printable planner 覆盖极为细分；Curify 当前缺少完整的 day-by-day itinerary planning 内容格式。这是 catalog / format coverage gap，不是 Paris topic metadata 标注错误。

---

## 4. 当前进度

### 已完成

- Topic Resolver + Co-occurrence（commit ca338b48）
- 8 Cluster 映射 + Intent Pills UI + `?intent=` 过滤
- Query Normalization + Business Override（3 条规则）
- `cat/cats` redirect 修复（+ `shouldSkipTopicRedirect` 15 条测试）
- 6 条 WARN query 深度审计
- Metadata 安全修复（21 条 inspiration + 2 条 template description）+ 30 条回归测试
- Paris itinerary topic 语义复核（itinerary 语义准确，无改动）
- External signal schema 设计 + 20-query research set + 比较方法论
- 5-query pilot 框架和 data 目录建立
- `cat` 三平台人工采集（截图 8 张 + notes）
- `paris travel itinerary` 三平台人工采集（截图 9 张 + notes）
- 160 tests / TypeScript 零错误 / Eval PASS=106 WARN=19 FAIL=0

### 进行中

- `v0_observations.json` 结构化填写（外部平台字段仍为 pending_manual_capture）
- 本分支后续修改尚未 push，等待最终 review 后统一提交

### 尚未完成

- 5-query pilot 剩余 3 个 query（`paris`、`science poster`、`warmup routine running checklist`）三平台采集
- `v0_observations.json` 完整填写
- V0 cross-platform comparison report
- Curify coverage scoring（外部信号 → cluster 覆盖率评分）
- 20-query 研究集全量采集 / 100-query benchmark
- 新内容优先级决策（Paris N-Day Itinerary、Cat PFP template 等）
- 将最终结论合并到 `docs/search-and-content.md`
- commit / PR

---

## 5. 下一步（按优先级）

1. 完成剩余 3 个 pilot query 截图与 notes（`paris`、`science poster`、`warmup routine running checklist`）
2. 填写 `v0_observations.json`：将 5 个 query 的观测结果结构化，完成 signal_type、curify_cluster、evidence 字段
3. 生成 V0 comparison report：列出 Curify 已覆盖 / 内容薄弱 / 完全缺失的方向
4. 根据 report 讨论新内容优先级（Paris day-by-day itinerary、Cat PFP、`architecture` 西方建筑扩充等）
5. 整理提交：commit 全部代码、测试、metadata 修改，创建 PR

---

## 6. 主要产出

**Prompt 报告（11 个）**：`claude_audit_report.md` · `claude_prompt2_result.md` · `claude_prompt3_result.md` · `claude_prompt4_result.md` · `claude_prompt4_5_result.md` · `claude_prompt4_6_redirect_fix_result.md` · `claude_prompt5_warn_audit_result.md` · `claude_prompt6_safe_warn_fixes_result.md` · `claude_prompt6_5_paris_topic_review.md` · `claude_prompt7_external_signal_research_plan.md` · `claude_prompt7_5_manual_pilot_setup.md`

**核心实现**：`lib/topic_resolver.ts` · `lib/topic_cooccurrence.ts` · `lib/intent_taxonomy.ts` · `lib/intent_clusters.ts`（修改）· `lib/query_normalize.ts` · `lib/search_business_override.ts` · `app/.../search/page.tsx`（修改）· `app/.../search/SearchResultsClient.tsx`（修改）

**测试（6 files / 160 tests）**：`topic_resolver.test.ts`(20) · `topic_cooccurrence.test.ts`(10) · `intent_clusters.test.ts`(44) · `query_normalize.test.ts`(22) · `search_business_override.test.ts`(34) · `search_metadata_scenarios.test.ts`(30)

**Metadata**：`public/data/nano_inspiration.json`（21 条修改）· `messages/en/nano.json`（2 条修改）

**External Signal Pilot**：`data/external_signals/`（README · v0_query_set.json · v0_observations.json · v0_manual_collection_template.md）· `docs/external-signal-pilot/cat_notes.md` · `docs/external-signal-pilot/paris_travel_itinerary_notes.md` · `docs/external-signal-pilot/screenshots/`（26 张 PNG）
