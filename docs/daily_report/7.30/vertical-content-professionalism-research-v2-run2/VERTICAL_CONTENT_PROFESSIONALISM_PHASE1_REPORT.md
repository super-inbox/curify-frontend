# 垂类内容专业性研究 Phase 1 报告 — MBTI / Education / Merch

**research_run_id:** vertical-content-professionalism-research-v2-run2
**本轮日期:** 2026-07-31
**本轮范围:** MBTI、Education、Merch 三个垂类的竞品研究总结、统一页面框架设计、VerticalPageSchema v2 设计建议、pilot 页面推荐。
**Ecommerce:** 本轮明确暂缓（deferred），详见下方"Ecommerce status"章节。

---

# Executive Summary

本轮基于此前已完成的竞品研究证据（24 条搜索记录、24 张 SERP 截图、24 张内部页面截图），完成了 MBTI、
Education、Merch 三个垂类的专业页面 Pattern 总结、统一页面框架设计，并将研究结论映射到现有
`VerticalPageSchema`（`lib/vertical_schema.ts`）代码上，提出了设计层面的 v2 建议。

- **MBTI：** 6 个搜索词，6 个 SERP 结果，6 个内部页面，选出 4 个代表页面（2 个作为视觉参考排除）。
- **Education：** 6 个搜索词，6 个 SERP 结果，6 个内部页面，选出 4 个代表页面（2 个排除）。
- **Merch：** 6 个搜索词，6 个 SERP 结果，6 个内部页面，选出 4 个代表页面（2 个排除）。
- **Ecommerce：** 本轮明确暂缓，不纳入本轮 Pattern 总结，仅保留既有 6 条搜索记录作为证据留存。

**核心结论：** 三个垂类反复出现的专业模块高度一致——**内部关联链接（related content）**是本轮三个垂类
各自独立发现的最强共性 Pattern；除此之外，MBTI/Merch 都体现出"结构化属性标签 + 权威知识区块"的模式，
Education 则体现出"面包屑导航 + 同页面下的子主题广度覆盖"模式。Curify 当前代码已经为这些模式打好了地基
（`VerticalAttributeChips`、`VerticalKnowledgeSection`、`buildVerticalJsonLd` 均已实现并在模板页接入），
但 MBTI 和 Merch **零内容**，Education 仅有 1 个已上线试点（HSK），且 example 页面完全没有渲染任何垂类内容
——这是本轮审计确认的最大结构性缺口。

**下一步：** 复核本文档的统一框架和 Schema v2 设计建议，确认后按 `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`
中列出的、已在代码库中验证真实存在的候选模板启动试点内容撰写；Ecommerce 需在 Phase 2 单独重新搜索研究。

---

# Boss Requirement Mapping

| # | 老板要求 | 状态 | 说明 |
|---|---|---|---|
| 1 | 每类更换搜索词 | **COMPLETE**（MBTI/Education/Merch）；**DEFERRED**（Ecommerce） | MBTI/EDU/MER 各 6 个搜索词已实际执行；MBTI 的 6 词中有 1 词与原计划（`mbti jude bellingham`）不一致，实际执行的是替代词 `MBTI comparison chart`，已在 `DATA_QUALITY_ISSUES.md` 中记录，未重新搜索修正 |
| 2 | 查看排名靠前页面 | **COMPLETE**（三垂类） | 全部 18 条记录（MBTI/EDU/MER 各 6 条）均记录了 organic_rank（1–5 名）及结果标题/URL |
| 3 | 打开内部页面 | **COMPLETE**（三垂类） | 全部 18 条记录均有对应的 `*_content.png` 内部页面截图，路径已写入 `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` |
| 4 | 每类选 3–5 个代表页面 | **COMPLETE** | MBTI 选中 4 个、Education 选中 4 个、Merch 选中 4 个，均在 3–5 区间内；Ecommerce 0 个（暂缓，不计入） |
| 5 | 总结 Pattern | **COMPLETE**（三垂类） | `MBTI_COMPETITOR_PATTERN.md`、`EDUCATION_COMPETITOR_PATTERN.md`、`MERCH_COMPETITOR_PATTERN.md` 三份文档，每个 Pattern 均标注证据页面 |
| 6 | 设计统一框架 | **COMPLETE** | `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md`，区分 common / vertical-specific / conditional 三类模块 |
| 7 | 设计垂类模块 | **COMPLETE** | 同上文档 §B，MBTI/Education/Merch 各自的专属模块列表，均回溯到具体 Pattern 证据 |
| 8 | 映射 VerticalPageSchema | **COMPLETE** | `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md`，审计现有代码字段 + 提出设计层面的 v2 pseudo-schema，未修改任何源代码 |
| 9 | 推荐 pilot 页面 | **COMPLETE**（有限定条件） | `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`，11 个候选模板均在本轮直接核实其在 `public/data/nano_templates.json` 中真实存在且未被人工撰写内容；GSC 数据引用自设计文档 2026-07-28 的既有挖掘结果，本轮未重新拉取，实施前需重新拉取确认 |

---

# Cross-vertical findings

1. **内部关联链接（Related content / internal linking）是三个垂类各自独立确认的最强共性 Pattern。**
   MBTI（type/角色关联链接）、Education（子主题广度 + 相关资源）、Merch（相关产品推荐）三份 Pattern
   文档在互不参照的情况下，都将"永不让页面成为死胡同"列为反复出现的模块。Curify 当前模板页和 example
   页均无此模块（仅有一个 sr-only 的 topic chip 链接）。
2. **结构化属性标签（attribute chip）是 MBTI 和 Merch 共有的模式**（type_code、material/product_type
   等），Curify 的 `VerticalAttributeChips` 组件已经实现并可直接复用，只是从未被填充内容。
3. **权威知识区块（segmented knowledge）** 在 MBTI（MBTI_04/05）和 Education（EDU_02/04）都有体现，
   对应 Curify 已有的 `VerticalKnowledgeSection` 组件和 knowledge slots 设计。
4. **信任/来源信号** 以三种不同形式分别出现在三个垂类（Merch 的产地/公益背书、MBTI 的评分方法论、
   Education 的更新日期），说明这是一个真实存在但需要"垂类定制化"而非统一硬编码的模块。

# Vertical differences

三个垂类不能套用同一套通用文案，原因：

- **页面类型本身不同：** MBTI 选中页面横跨"实体集合+档案页"（MBTI_01）、"单实体档案页"（MBTI_04）、
  "商品集合页"（MBTI_02）、"编辑向数据工具页"（MBTI_05）四种类型；Education 横跨"模板市场集合页"
  （EDU_01/06）、"资源中心"（EDU_02）、"编辑内容中心"（EDU_04）；Merch 横跨"单品详情页"（MER_01/04）
  和"市场集合页"（MER_05/06）。三个垂类内部尚且类型多样，跨垂类更不能强行统一。
- **专业性的来源不同：** MBTI 的专业性来自"类型体系 + 多系统标签 + 社区共识"；Education 来自"分级/
  分科/分技能的教学元数据 + 广度覆盖"；Merch 来自"材质/工艺规格 + 文化故事 + 信任背书"。三者的核心
  知识字段（`AttributeDef`/`KnowledgeSlotDef`）本就不同，这也是 Curify 现有 schema 设计（三套独立
  attributes/knowledgeSlots）正确的地方，不应合并成一套通用字段。

# Current Curify gaps

基于本轮代码审计（`CURRENT_IMPLEMENTATION_AUDIT.md`）与三份 Pattern 文档的 Gap 分析：

- **Generic copy：** MBTI、Merch 的所有模板均无任何已撰写的 attributes/knowledge 内容（审计 Q4-5），
  Education 仅 1 个模板（HSK）有内容，页面呈现与其他任意垂类的模板毫无区别。
- **Limited entity/topic context：** 没有任何页面能回答"这个 MBTI 类型是什么/这个磁贴是什么材质"这类
  问题，因为知识字段是空的。
- **Weak professional modules：** 关联链接模块完全不存在；面包屑在模板页不可见（只有 sr-only 的
  topic 链接，`page.tsx:198-203`）。
- **Insufficient evidence/trust modules：** 没有任何垂类有信任/来源/方法论说明的现成模块。
- **Shallow internal linking：** 模板 → example 之间、模板与模板之间均缺少"相关内容"级别的链接。
- **Generic structured data：** example 页面目前只输出统一的 `HowTo` JSON-LD，与垂类完全无关（审计
  Q16）；模板页虽然已经支持垂类 JSON-LD，但因为没有内容而从未真正输出过 MBTI/Merch 的结构化数据。
- **Example page lacks vertical rendering：** 这是本轮审计确认的最大结构性缺口——`VerticalAttributeChips`
  /`VerticalKnowledgeSection`/`buildVerticalJsonLd` 均未在 example 路由下被调用过，且
  `deriveExampleAttributes`（或同类函数）在仓库中完全不存在（审计 Q13-18）。

# Proposed direction

1. **一套通用布局系统（one common layout system）：** 面包屑 + H1 + 关联链接 + 结构化数据等通用模块
   统一实现一次，跨三个垂类复用（见 `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md` §A）。
2. **垂类专属结构化内容（vertical-specific structured content）：** 保留三套独立的 attributes/
   knowledgeSlots（现有设计已经是对的），只在此基础上增补 `relatedContent`/`faq`/`source` 等可选字段
   （见 `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md`）。
3. **条件渲染（conditional rendering）：** 延续现有"无内容则不渲染"的 null-safe 原则，新增模块同样
   遵循这一原则，不为空数据渲染空白区块。
4. **渐进式 pilot（incremental pilots）：** 不做批量生成，延续现有设计文档已经验证过的"小批量试点 +
   测量 + 决策"节奏，本轮已提出 11 个经代码库验证的真实候选模板（见
   `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md`）。
5. **可衡量的 SEO 验证（measurable SEO validation）：** 沿用设计文档已采用的"自比较"测量法——对比每个
   enrich 后模板自身 4–6 周前后的 GSC 表现（impressions、平均排名、Generate CTR、富结果资格），而非
   严格 A/B 对照组。

# Ecommerce status

Ecommerce was intentionally deferred from Phase 1 and will be researched separately in Phase 2.
Existing Ecommerce screenshots are visual references only and were not used to define professional
Ecommerce page patterns. Ecommerce 也不在 `VerticalId`（`lib/vertical_schema.ts:17`）中——它在代码中
完全未实现（审计 Q6），本轮也未新增任何 Ecommerce 相关代码或 schema 字段。既有的 6 条 Ecommerce
搜索记录和截图在 `COMPETITOR_RESEARCH_RESULTS_FINAL.csv` 中全部标记 `selected=NO`，作为历史证据保留，
不用于本轮任何 Pattern 或框架结论。

# Next actions

1. Review Phase 1 framework — 复核 `VERTICAL_PAGE_COMMON_FRAMEWORK_V2.md` 的模块划分是否符合预期。
2. Confirm schema changes — 复核 `VERTICAL_PAGE_SCHEMA_V2_RECOMMENDATION.md` 的字段设计，确认是否
   进入实际代码改动阶段（本轮未修改任何 schema 源代码）。
3. Choose pilot pages — 从 `PILOT_PAGE_REFACTOR_RECOMMENDATIONS.md` 的 Pilot 1/Pilot 2/Later 名单中
   确认优先顺序，实施前重新拉取 GSC 数据核实信号仍然有效。
4. Implement selected pilots — 按确认的 pilot 名单撰写 en/zh 内容，复用 HSK 已验证的渲染路径；如需
   `relatedContent`/`deriveExampleAttributes` 等新能力，需先完成对应代码开发（非本轮范围）。
5. Separately research Ecommerce — Phase 2 单独针对 Ecommerce 执行全新的 Google 搜索与竞品研究，
   不复用本轮任何 Ecommerce 证据作为 Pattern 结论。
6. Compare ranking/indexing/engagement after launch — 按设计文档既定的 4–6 周测量窗口，对比 pilot
   模板上线前后的 GSC 指标与 Generate CTR。
