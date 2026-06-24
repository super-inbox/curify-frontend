# External Signal Pilot 洞察报告 — 2026-06-23（中文版）

> **范围：** 58 个 query × 5 个平台（Curify、Google Images、Bing Images、Pinterest、Canva）  
> **目的：** 综合 External Signal Pilot 采集结果，为 Curify 搜索策略提供数据依据。  
> **性质：** Pilot 阶段洞察报告（定性 + 半定量），非最终基准。  
> **更新说明：** 本版相比 2026-06-21 版，有两项更新：① Pinterest label 数据已从自动采集替换为手工补全（58/58 query 均已核查）；② Curify 搜索结果已于 2026-06-23 重新采集（内容缺口修复后），ok_empty 从 5 个降至 4 个，P3 从 33 升至 37。

---

## 1. 执行摘要

- **58 个 query** 跨 5 个平台完成采集。Query 集涵盖 8 个一级话题分类（Tier 1），**词汇与语言（21%）** 和 **角色/IP/流行文化（19%）** 是最大的两个类别——均与 Curify 核心模板库直接相关。

- **Google Images 和 Bing Images** 是最佳的宽泛召回消费型基准。Google 对全部 58 个 query 100% 返回完整结果，平均 17.8 个相关搜索标签；Bing 更进一步，平均 39.9 个标签——是所有平台中类目扩展信号最丰富的来源。

- **Pinterest** 提供最佳的视觉多样性与子意图发现能力。经手工补全后，58/58 query 均已核查，**36/58（62%）query 获得有效 One Bar 子意图芯片标签**（全量平均 12.4 个/query，非零 query 均值 19.9 个/query）。芯片内容呈现精细子意图而非宽泛类目，对 Curify 话题路由扩展具有直接参考价值。仍有 22/58 query 经手工核查无法采集标签。label 数据来源：手工采集，非自动化。

- **Canva** 专为创意/模板搜索设计，与 Curify 模板路由的可比性最高。英文 query 表现良好（36/58 成功），但中文和日本流行文化 query 几乎全部登录拦截（21/58），是需要标注的数据质量缺口。

- **消费 vs. 创作分布：** 25 个 query 偏消费导向，26 个偏创作导向，7 个混合。Curify 在消费型 query 上表现良好（完整十条结果率：89%），创作型 query 完整十条结果率已提升至 40%——仍是主要成长空间，但有明显改善。

- **Curify Gap 分析（2026-06-23 重采）：** 4 个 P0 内容缺口（简易工作日晚餐、无麸质餐食、备餐食谱、独特文化体验），12 个 P1 模板缺口，5 个 P2 召回缺口。37/58 个 query 表现正常（较上次 +4）。幼儿园自然拼读工作表（phonics worksheets kindergarten）已从 P0 改善至 P1（现有 4 条结果）。

- **下一步建议：** 以 Canva 的英文模板分类作为创作型 query 的路由种子；以 Bing 的相关搜索标签做类目/话题扩展；以 Pinterest 手工补全的 One Bar 子意图芯片构建话题别名词表。

---

## 2. 数据范围

| 项目 | 数值 |
|---|---|
| Query 数量 | **58 个** |
| 平台 | Curify、Google Images、Bing Images、Pinterest、Canva |
| 采集周期 | 2026-06（自动化浏览器采集）；Pinterest label 2026-06-23 手工补全 |
| Curify 有结果的 query | 54/58 正常，4 个空结果（2026-06-23 重采） |
| Google 采集完成 | 58/58 |
| Bing 采集完成 | 58/58 |
| Pinterest 采集完成 | 58/58（Top-10 结果）；36/58 有手工 label；22/58 无 label |
| Canva 可访问 | 36/58 正常，21/58 登录拦截，1 个部分 |
| 报告性质 | Pilot 洞察（定性 + 半定量） |

**数据质量说明：**

- Canva 登录拦截的 21/58 个 query 主要是中文 query（`单词`、`卡通`、`植物`等）及两个日本流行文化 query（`chiikawa`、`genshin`），无法提取模板结果。
- Pinterest 自动采集受登录弹窗限制，原有 40/58 个 query 标签数为零（18/58 有标签，平均仅 0.6 个/query）。经手工补全，58/58 query 均已核查；36/58（62%）query 获得有效 One Bar 子意图芯片标签（全量均值 12.4 个/query，非零均值 19.9 个/query），22/58 经手工核查仍为零——这些 query Pinterest 本身不生成子意图芯片。手工 label 详见 `pinterest-manual-label-summary-2026-06-23.csv`。
- Curify 4 个空结果 query（2026-06-23 重采）：`unique cultural experiences`、`easy weeknight dinners healthy`、`gluten free dinner ideas`、`meal prep weekly recipes`。`phonics worksheets kindergarten` 已修复（现返回 4 条结果，从 P0 升至 P1）。

**使用的输入文件：**
- `docs/external-signal-pilot/google-image-eval-58/data/observations.json`
- `docs/external-signal-pilot/bing-image-eval-58/data/observations.json`
- `docs/external-signal-pilot/pinterest-search-eval-58/data/observations.json`
- `docs/external-signal-pilot/canva-search-eval-58/data/observations.json`
- `docs/external-signal-pilot/curify-search-eval-58/data/observations.json`
- `docs/external-signal-pilot/external-signal-5x2-query-classification-58.csv`
- `docs/external-signal-pilot/external-signal-5x2-summary.csv`
- `docs/external-signal-pilot/curify-gap-analysis-58.csv`
- `docs/external-signal-pilot/pinterest-manual-label-summary-2026-06-23.csv`（新增，手工 label）

---

## 3. 58 个 Query 的 Tier 1 分布

> 完整数据见：`docs/external-signal-pilot/query-tier1-distribution-58.csv`

### 3.1 分布表

| Tier 1 | Query 数 | 占比 | 主导方向 | 示例 Query | 备注 |
|---|---|---|---|---|---|
| 词汇与语言 | 12 | 21% | **创作导向** | 单词、phonics worksheets、ESL flashcards、bilingual flashcards | 最强创作类别——12 个中 11 个明确寻求可打印材料/模板 |
| 角色/IP/流行文化 | 11 | 19% | **消费导向** | 卡通、chiikawa、genshin、mbti marvel、samurai | 主要为浏览/粉丝型；3 个子 query 有创作意图（MBTI 图表、相性对比图） |
| 生活方式与审美 | 8 | 14% | **消费导向** | 家居装饰、音乐、met gala、cozy reading aesthetic | 情绪/浏览型 query；创作需求为次要 |
| 艺术与设计 | 7 | 12% | **创作导向** | 电商详情图、watercolor map、vintage poster、red envelope design | 明确设计输出意图；用户期待直接可用的模板 |
| 食物与食谱 | 6 | 10% | **混合** | 食物、cuban sandwich recipe poster、meal prep weekly recipes | 两极分化：2 个浏览型，4 个食谱创作型（海报/计划表输出） |
| DIY/如何做/手工 | 5 | 9% | **创作导向** | 手作、paper cutting、kitchen makeover、趣味经济学知识科普 | 手工/操作类 query，期待过程可视化内容或模板 |
| 自然与植物 | 5 | 9% | **消费导向** | 植物、蔬菜、spring flowers、monstera care guide | 主要为视觉浏览；1 个创作型（monstera infographic） |
| 旅行/地点/文化 | 4 | 7% | **消费导向** | remote destination、unique cultural experiences、short city escapes | 旅行灵感浏览；无明确模板输出意图 |

### 3.2 导向汇总

| 方向 | Query 数 | 占比 | 典型 Query 类型 |
|---|---|---|---|
| 消费导向 | 25 | 43% | 浏览图像、粉丝内容、审美、旅行、自然 |
| 创作导向 | 26 | 45% | 可打印材料、海报、闪卡、设计模板、操作教程 |
| 混合 | 7 | 12% | 食谱灵感、MBTI 图表、comfort food、地图 |

### 3.3 关键观察

**58 个 query 整体偏创作导向（45% 创作 vs 43% 消费）。** 这是刻意为之的组合设计——eval 集旨在压测 Curify 的模板路由能力，而非代表通用网页搜索流量分布。消费型 query 的作用是验证 Curify 在优化创作需求的同时不回归通用视觉搜索。

**词汇与语言（12 个 query，21%）是最大的单一类别。** 几乎所有 query 都明确寻求可打印/教育材料。Curify 在这类 query 上表现良好（12 个全有结果），这也代表了 Curify 最核心的可寻址场景：老师、语言学习者和学生搜索可打印闪卡、词汇海报和双语图表。

**角色/IP（11 个 query，19%）是最大的消费导向类别。** 这些高互动型消费 query（动漫、游戏角色、MBTI）Curify 表现尚可（11 个均有结果），但结果深度参差不齐——部分 query 只显示 5–7 条而非满格。

**食物与食谱（6 个 query，10%）失败率最高。** 4/6 个食谱创作类 query 空结果或结果极少：`easy weeknight dinners`、`gluten free dinner ideas`、`meal prep weekly recipes` 的 Curify 结果均为零。这三者在 Google、Pinterest、Canva 上的结果均十分丰富，是最清晰的内容缺口。

---

## 4. 消费 vs. 创作导向分析

### 4.1 核心分层

| 类别 | 平台 | 定位 |
|---|---|---|
| **消费型基准** | Google Images、Bing Images | 衡量宽泛视觉召回；发现用户搜索某个 query 的真实含义 |
| **创作/灵感型基准** | Pinterest、Canva | 发现模板意图、设计子类目、创作需求信号 |
| **Curify 目标区间** | — | 创作优先，但须保持基本消费型召回能力 |

**为什么 Google 和 Bing 是消费型基准：**
Google 和 Bing 索引了整个互联网。它们的图片搜索结果反映的是用户在输入一个 query 时广泛期望"看到"什么——照片、编辑图、网页截图。它们不为创意使用而策划，而是为视觉召回和相关性服务。对 Curify 而言，它们是"兜底检验"：如果 Curify 对某个 Google 能返回 10 条丰富结果的 query 返回空结果，说明存在根本性的内容或分词问题。

**为什么 Canva 和 Pinterest 是创作/意图型基准：**
Canva 的整个产品就是模板搜索——它是目前最直接的外部创作意图信号源。当 Canva 对"phonics worksheets kindergarten"返回 10 个模板而 Curify 返回 0 个时，这就是一个直接的模板缺口信号。Pinterest 的 One Bar 子意图芯片揭示了用户如何细分宽泛 query：当 Pinterest 对`monstera plant care guide infographic`展示 Indoor、Swiss cheese、Adansonii、Thai constellation 等芯片时，这些芯片正是用户真实子需求的精炼表达，也是 Curify 路由应该对准的子意图节点。

**Curify 应该成为什么：**
Curify 不是 Google 或 Bing 的复制品，它的工作不是宽泛的图片召回。它的工作是接收用户的搜索 query，然后呈现最好的"可生成、可改编、可直接使用"的内容——模板、灵感图和设计素材。消费型 query 告诉我们用户想"找到"什么；创作型 query 告诉我们用户想"做出"什么。Curify 需要同时服务两类需求，但以创作为优先偏向。

### 4.2 各 Tier 建议行动

| Tier 1 | 推荐信号来源 | Curify 行动方向 |
|---|---|---|
| 词汇与语言 | Canva（模板分类）+ Bing（标签扩展）+ Pinterest（子意图芯片） | 补充缺失的可打印模板；改善双语路由；参考 Pinterest 芯片扩展别名 |
| 角色/IP/流行文化 | Google（宽泛召回）+ Pinterest（粉丝子意图芯片） | 确保全覆盖；用 Pinterest 芯片（如 chiikawa→桌布/拼豆/著色）做话题扩展 |
| 生活方式与审美 | Pinterest（子意图芯片 + 情绪板集群） | 无紧急行动；保持覆盖；Pinterest 芯片（如 samurai→Tattoo/Japanese art/Pfp）可补充风格子意图 |
| 艺术与设计 | Canva（模板分类） | 优先级高：这些 query 期待直接的模板输出 |
| 食物与食谱 | Canva + Pinterest（子意图芯片） | P0 缺口：紧急补充食谱海报/计划表模板；Pinterest 芯片（High protein/Low carb/Kid friendly）可指导模板分类 |
| DIY/如何做 | Canva + Pinterest | 补充操作可视化模板；增加流程信息图路由 |
| 自然与植物 | Google + Pinterest | 主要为浏览型；优先级低 |
| 旅行/地点/文化 | Pinterest + Google | 保持覆盖；本次 eval 未发现重大缺口 |

---

## 5. 5 平台星级评分表

> 完整数据见：`docs/external-signal-pilot/platform-scorecard-5x58.csv`

| 平台 | 消费搜索覆盖 | 创意/模板导向 | 视觉多样性 | 类目/意图清晰度 | Curify 可操作性 |
|---|---|---|---|---|---|
| **Curify** | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ |
| **Google Images** | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ |
| **Bing Images** | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ |
| **Pinterest** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ |
| **Canva** | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ |

**评分维度说明（1–5 星）：**

- **消费搜索覆盖** — 该平台是否能为 58 个 query 提供宽泛的消费型视觉搜索服务？
- **创意/模板导向** — 该平台是否呈现模板、可打印材料、设计参考或创意输出意图？
- **视觉多样性** — 搜索结果的风格、类目、版式、用途和语义覆盖是否足够多样？
- **类目/意图清晰度** — 该平台是否通过子类目、标签筛选、相关搜索、图板等方式清晰呈现 query 意图？
- **Curify 可操作性** — 该平台的信号能否直接用于改善 Curify 的搜索、路由或内容策略？

### 5.1 评分理由

**Curify（3/4/3/4/5）：** 8-cluster 意图芯片系统提供了出色的意图清晰度。消费型覆盖良好（89% 满十条），创作型 query 完整十条结果率已升至 40%（较上次 +7pp），但仍有结构性模板缺口。视觉多样性受模板驱动限制，风格范围较窄。

**Google Images（5/2/5/4/4）：** 消费型召回完美。相关搜索标签（平均 17.8 个/query）是极佳的意图信号。完全不面向模板——返回的是网页照片，不是可生成的内容。

**Bing Images（5/2/4/5/3）：** 召回能力与 Google 持平。相关搜索分类法最丰富：平均每个 query 39.9 个标签，是 Google 的 2.2 倍。类目扩展可操作性高，但对模板路由的直接指导有限。

**Pinterest（4/4/5/3/4）：** 视觉多样性和灵感集群最佳。手工补全后 36/58 query 获得 One Bar 子意图芯片（全量均值 12.4 个/query，接近 Google 17.8 的水平），芯片质量高，呈现精细子意图锚点而非宽泛类目。22/58 query 经手工核查仍无法采集标签，故类目/意图清晰度较自动采集有显著改善但未达 4 星。

**Canva（2/5/3/4/5）：** 与 Curify 直接可比。100% 模板导向。中文 query 失败（21/58 登录拦截）是已知局限——全部为中文或日本流行文化 query。对 36 个可访问的英文 query，Canva 的模板类目筛选（ok query 平均 43 个标签）是 Curify 模板路由最丰富的外部结构化信号。

---

## 6. 各平台深度洞察

### 6.1 Curify

**优势：**
- 8-cluster 意图芯片系统提供了所有平台中最清晰的结构化意图导航（集群 → 子话题 → 结果下钻）。
- 教育/词汇类 query 表现强劲：12 个词汇与语言类 query 全部有结果；`english-chinese`、`ESL flashcards printable`、`bilingual flashcards` 均实现满十条。
- 角色/IP 类 query 表现良好：11 个全部有结果；`genshin`、`chiikawa`、`samurai` 均达到满十条。
- **64%（37/58）的 query 结果正常**（Gap 分析为 P3），较上次 +4。

**劣势：**
- **食谱内容缺口（P0，仍有 3 个）：** `easy weeknight dinners`、`gluten free dinner ideas`、`meal prep weekly recipes` 仍返回 0 条结果；`unique cultural experiences` 同样为零。这些是 Google、Pinterest、Canva 均有丰富内容的高需求创作 query。`phonics worksheets kindergarten` 已修复（现有 4 条结果），但仍为 P1 模板缺口。
- **创作型 query 的满十条结果率 40%**（30 个创作 query 中 12 个达到满十条，较上次 +2）。`before after kitchen organization makeover`（3 条）、`lunar new year red envelope`（4 条）、`bilingual flashcards`（5 条）等 query 仍严重不足——用户流失风险较高。
- **视觉多样性偏窄。** Curify 的结果主题一致性强，但视觉风格单一——同一 query 下的结果缺乏风格多样性。
- **中文消费型 query 表现优于英文创作型 query** ——与 Curify 战略定位的优先级正好相反。

**最适合的 Query 类型：** 词汇/教育模板、角色/IP 海报、双语闪卡、MBTI 图表。

**Curify 应从自身数据学到什么：** 8-cluster 意图系统运转正常。缺口不在路由逻辑——在模板库存。每个 P0/P1 缺口都代表一个"路由会成功，但模板不存在"的场景。

---

### 6.2 Google Images

**优势：**
- **58/58 query 100% 召回** ——无缺口、无登录墙、无空结果。
- **相关搜索标签（平均 17.8 个/query）** 揭示了用户与每个 query 关联的标准子类目。示例：`phonics worksheets kindergarten` → 标签：Free printable、1st grade、Beginning sounds、Reading comprehension、Alphabet；`cuban sandwich recipe poster` → 标签：Cuban Sandwich Bread、Classic Cuban Sandwich、Authentic Cuban Sandwich。
- **最适合理解 query 语义范围：** Google 的结果展示了一个 query 可以涵盖的完整语义区间，包括 Curify 尚未服务的长尾和边缘场景。

**劣势：**
- **完全不面向模板。** 结果是网页照片、编辑图片、图库图像，没有可打印材料，没有设计输出意图。
- **视觉多样性是横向广度，不是纵向深度。** Google 展示最广泛的语义解读，但不提供某一风格的深度。

**最适合的 Query 类型：** 作为所有类型 query 的召回基准；对消费型浏览 query 尤其有价值，理解语义范围最重要。

**Curify 应从中学到什么：**
- 将 Google 相关搜索标签作为 **query 意图分类学的种子词表。** 每个 query 的标签揭示 5–10 个子类目，可直接用于指导 Curify 的话题路由和别名扩展。
- 用 Google 的结果多样性检测 Curify 结果的语义过窄问题（Google 对一个 query 展示 10 种不同解读，Curify 却展示 10 个外观相似的结果，则多样性是症结所在）。
- 监测哪些 query 有 Google 标签但 Curify 没有对应的话题芯片——这些是路由缺口。

---

### 6.3 Bing Images

**优势：**
- **100% 召回，与 Google 持平。** 全部 58 个 query 返回满十条结果。
- **所有平台中最丰富的类目分类法：平均每个 query 39.9 个标签**（Google 的 2.2 倍，Curify 的 4.5 倍）。没有任何 query 标签为零。示例：`maps` → 40 个标签（World Map、Old Map、Map Art、Map of the USA、Kids Map、Antique Map……）；`phonics worksheets` → 40 个标签（Free Kindergarten、Phonics Reading、Alphabet Activities……）。
- **标签质量比 Google 更结构化。** Bing 的相关搜索标签倾向于使用名词短语而非原始搜索词，可直接作为话题/类目词元使用。

**劣势：**
- **在创意意图上与 Google 无明显差异。** 结果同样是网页图片，不是模板。
- **对 Curify 的直接可操作性较低**，因为信号最适合用于类目扩展，而非直接的模板路由。相对 Google 多出的标签量主要增加了广度，而非质的新洞察。

**最适合的 Query 类型：** 所有消费型 query 的类目扩展；对 Google 标签稀疏的长尾英文 query 尤其有价值。

**Curify 应从中学到什么：**
- **将 Bing 的 40 标签集作为话题/别名扩展的首选词汇来源。** 对任何 Curify 话题较薄的 query，Bing 标签是最丰富的外部参考。
- 将 Bing 标签与 Curify 现有话题分类法对比——任何没有对应 Curify 话题 slug 的标签集群都是候选新增话题。
- 对英文标签稀疏的中文 query，Bing 的中文感知搜索管道提供了有用的标签集（例如 `单词` → `英语单词、英文单词、单词表`）。

---

### 6.4 Pinterest

**优势：**
- **58/58 query 100% 返回结果**，全部 Top-10 图钉结果均已采集。
- **手工补全后，36/58（62%）query 获得有效 One Bar 子意图芯片标签**，较自动采集时的 18/58（31%）显著改善。718 个标签合计，全量均值 12.4 个/query，非零 query 均值 19.9 个/query，最高单 query 达 27 个（`met gala`）。
- **One Bar 芯片质量高——呈现精细子意图锚点，而非宽泛类目标签。** 这是 Pinterest 与 Bing/Google 最大的质量差异。示例：
  - `吉伊卡哇` → 桌布、小桃、小八、拼豆、著色圖、電腦桌布……（角色衍生品子意图）
  - `monstera plant care guide infographic` → Indoor、Swiss cheese、Adansonii、Thai constellation、Moss pole……（品种/护理子意图）
  - `samurai` → Tattoo、Japanese art、Pfp、Mask、Outfit、Wallpaper 4k……（视觉风格/用途子意图）
  - `easy weeknight dinners healthy` → High protein、Low carb、Kid friendly、Gluten free、Clean eating……（饮食偏好子意图）
  - `香薰` → 包装、氛围图、新中式、观夏、祖马龙、礼盒……（产品品类/品牌子意图）
- **消费型 query 的 label 覆盖更优：** 消费型 28 个 query 中 21 个（75%）有 label，均值 17.4 个/query；创作型 30 个 query 中 15 个（50%）有 label，均值 7.7 个/query。
- **所有平台中视觉多样性最高。** Pinterest 对任何 query 的结果集都跨越多种视觉风格、使用场景和审美方向。
- **对中文 query 的子意图信号尤具价值。** 即便简短的中文 query（`植物`、`香薰`、`自行车`），其 One Bar 芯片也揭示了丰富的产品/设计/场景子类目，是 Canva 因登录拦截所无法提供的中文语境信号。
- **灵感到创作的转化信号极强。** Pinterest 图钉混合了照片、插画、信息图和模板，结果集本身就展示了每个 query 的消费/创作比例。

**劣势：**
- **22/58（38%）query 经手工核查仍无 label。** 这些 query Pinterest 本身不生成 One Bar 芯片，主要集中在英文长尾创作型 query（`cuban sandwich recipe poster`、`bilingual flashcards`、`watercolor map`、`lunar new year red envelope`等）及部分 CJK 短语（`家居装饰`、`食物`、`唯美春天`等）。完整列表见 `pinterest-manual-label-missing-queries-2026-06-23.csv`。
- **手工采集限制了可重现性。** label 数据来自人工操作，不同会话、不同时间访问 Pinterest 可能得到不同的芯片集合；此数据不等同于全自动化采集，不宜直接用于实时信号管道。
- **非模板原生。** Pinterest 图钉链接到外部页面；与 Canva 不同，没有"编辑此模板"入口。创意意图信号是灵感性的，不能直接用于模板路由。
- **图板标题（最丰富的隐性意图信号）本次未系统采集。** 当前 pilot 采集了 Top-10 图钉但未提取图板元数据；完整采集图板标题是后续改善方向。

**最适合的 Query 类型：** 消费型灵感 query（角色/IP、生活方式、审美、食物/食谱）、中文短语 query（子意图扩展）、视觉子意图发现。

**Curify 应从中学到什么：**
- **将 Pinterest One Bar 芯片直接纳入 Curify 话题别名词表和子意图路由扩展。** 36 个 query 的 718 个手工标签已按 `pinterest-manual-label-summary-2026-06-23.csv` 结构化存储，可直接作为话题 slug 候选词参考。
- **按意图方向区分使用策略：** 消费型 query（21/28 有 label，均值 17.4）的 Pinterest 芯片可用于路由子意图扩展；创作型 query（15/30 有 label，均值 7.7）的芯片较少，需要补充 Canva 和 Bing 信号。
- **中文消费型 query 优先使用 Pinterest 芯片：** `香薰`→包装/氛围图/新中式、`自行车`→插画/复古/贴纸、`卡通`→狗狗/Logo/著色畫——这些芯片揭示了 Curify 中文模板路由可以对准的子场景。
- **将 Pinterest 的视觉多样性作为 Curify 结果多样性对标基准。** 若 Pinterest 对某 query 呈现 10 种风格迥异的图钉，而 Curify 只呈现外观相似的模板，多样性就是症结所在。

---

### 6.5 Canva

**优势：**
- **所有外部平台中与 Curify 最直接可比**——两者都是模板优先的搜索引擎。
- **36/58 个 query 可访问**，全部返回模板分类结果。Ok query 的标签结构最为丰富（平均 43 个标签/ok query）。
- **模板类目筛选是显性意图信号。** Canva 的筛选芯片（如"演示文稿"、"Instagram 帖子"、"工作表"、"信息图"）直接对应 Curify 用于话题路由的输出类型词汇。
- **英文 query 的创作意图信号最佳。** 对 `phonics worksheets kindergarten`、`ESL flashcards printable`、`cuban sandwich recipe poster`、`1950s vintage diner retro poster`——Canva 的结果恰好是 Curify 应该路由到的模板格式和风格。
- **模板格式多样性清晰可读。** Canva 对 `language learning expressions` 的结果包含：闪卡套装、海报版式、演示文稿幻灯片、工作表模板——均为不同的输出类型，构成了 Curify 所需的创意意图分类法。

**劣势：**
- **21/58 登录拦截，全部为中文或日本流行文化 query。** 这是最大的局限：Canva 对未登录的中文搜索全线拦截。所有中文 query（`单词`、`卡通`、`植物`等）及 `chiikawa`/`genshin` 均无法访问。
- **西方中心的模板库。** 即使对可访问的 query，Canva 模板也偏向英文、西方审美和拉丁字母内容，中文原生模板设计意图覆盖有限。
- **模板视觉相似度较高。** 同类 query 下（例如所有"vocabulary flashcard"结果）模板版式几乎相同——视觉多样性低于 Pinterest 和 Google。

**最适合的 Query 类型：** 教育模板、食谱海报、设计输出 query（婚礼策划、图形设计）、生活方式/审美模板、MBTI 图表。

**Curify 应从中学到什么：**
- **将 Canva 的 ok query 模板分类作为 Curify 话题分类法的直接路由种子。** 当 Canva 把"phonics worksheets"的结果归类为"工作表"、"教育"、"可打印"时，这些就是 Curify 应该确保已映射的输出类型话题。
- **将 Canva 的 ok query 与 Curify 的模板缺口对比。** 任何 Canva 返回 10 个模板但 Curify 只返回 <5 个的 query 就是 P1 模板缺口。本次 eval 中共有 15 个这样的 query。
- **中文 query 路由不能以 Canva 为参考。** 改用 Google/Bing 标签和 Pinterest 手工芯片。
- **Canva 的 isPro 标志**（在结果元数据中可见）标识了哪些模板类别是付费/免费的——对理解商业模板市场格局有参考价值。

---

## 7. 跨平台综合洞察

### 7.1 各信号需求的最佳平台

| 信号需求 | 最佳平台 | 次选平台 | 备注 |
|---|---|---|---|
| 宽泛视觉消费型召回 | Google Images | Bing Images | 作为覆盖兜底；若 Curify 无法匹配，说明存在根本缺口 |
| 类目/子意图分类法（宽泛） | Bing Images | Google Images | Bing 每 query 40 个标签是最丰富的结构化词汇 |
| 精细子意图锚点 | Pinterest（手工芯片） | Bing Images | Pinterest One Bar 芯片揭示用户级子需求细分；质量高于 Bing 的类目标签 |
| 视觉灵感集群 | Pinterest | Google Images | Pinterest 视觉多样性最高；子意图信号丰富 |
| 模板/创作意图 | Canva | Pinterest | Canva 与 Curify 模板路由直接可比 |
| 中文 query 语义情报 | Pinterest（手工芯片）+ Google | Bing Images | Canva 无法访问；Pinterest 中文 query 芯片覆盖 21/28 消费型 query |
| 内容缺口检测 | Canva + Google | Curify Gap CSV | Canva 有 10 个模板但 Curify 有 0–4 个 → P0/P1 缺口 |

### 7.2 消费–创作轴上的平台定位

```
消费导向 ◄────────────────────────────────────► 创作导向

  Google      Bing       Pinterest     Curify      Canva
  Images      Images     （灵感+芯片）  （模板）    （模板）
  ★★★★★       ★★★★★      ★★★★          ★★★★        ★★★★★
```

- **Google 和 Bing** 锚定消费端。它们的价值在于召回完整性和类目广度。它们告诉你一个 query "意味着什么"，而不是"用它能做什么"。
- **Pinterest** 横跨中间地带。面向消费者（浏览/收藏图钉），但毗邻创作（大量图钉是模板、教程和操作指南）。手工补全的 One Bar 芯片使其在"灵感 → 精细子意图 → 创作"的转化路径上信号更完整。
- **Curify 和 Canva** 锚定创作端。两者都是模板优先的。共同的短板是消费型覆盖——在宽泛视觉浏览方面，两者都不如 Google/Bing。

### 7.3 多样性分析

| 平台 | 多样性类型 | 评分 | 备注 |
|---|---|---|---|
| Google Images | 语义广度 | ★★★★★ | 覆盖最多样的 query 解读 |
| Pinterest | 视觉风格广度 | ★★★★★ | 每个 query 的审美/风格种类最多；One Bar 芯片进一步结构化子意图 |
| Bing Images | 类目深度 | ★★★★☆ | 子类目标签最多；视觉风格略窄于 Google |
| Curify | 模板格式多样性 | ★★★☆☆ | 集群多样性良好，但模板视觉风格单一 |
| Canva | 输出类型多样性 | ★★★☆☆ | 输出类型清晰，但风格偏窄 |

### 7.4 意图/类目清晰度

| 平台 | 清晰度来源 | 平均标签数 | 备注 |
|---|---|---|---|
| Bing Images | 相关搜索芯片 | 39.9 | 最佳结构化分类法，100% query 覆盖 |
| Canva | 模板类目筛选 | 43（ok query） | 创作意图最佳；21 个 query 不可访问 |
| Google Images | 相关搜索 | 17.8 | 质量好，数量较少 |
| Pinterest | One Bar 子意图芯片（手工） | 12.4（全量）/ 19.9（非零均值） | 手工补全后 36/58 有标签，22/58 仍为零；芯片精细度优于 Bing/Google |
| Curify | 意图集群芯片 | 8.8 | 8-cluster 系统；清晰但词汇范围窄 |

---

## 8. Curify 缺口与机会

### 8.1 Curify 不应该成为什么

Curify **不应该**试图复制 Google Images 或 Bing Images。这两个平台在广度、速度和开放网络图片召回上的优势是结构性的，无法竞争。同样，Curify 不应该试图复制 Pinterest 的无限滚动灵感流——Pinterest 的图板图谱需要多年积累，不可复制。

### 8.2 Curify 真正的机会

Curify 的护城河是 **搜索 → 生成 → 使用** 的完整链路。用户在 Google 上找到一个词汇海报，还需要去别的地方才能制作它。用户在 Pinterest 收藏了一个食谱图钉，还需要找模板。Curify 是那个"搜索结果本身就是可生成内容"的地方。这意味着：

1. **Query 意图扩展：** 用 Google/Bing 标签识别一个 query 承载的宽泛子意图；用 Pinterest One Bar 芯片识别用户层面的精细子需求。两者叠加后映射到 Curify 的 8-cluster 系统，确保每个子意图背后都有对应的模板。

2. **话题/类目路由改善：** 用 Canva 的模板类目（英文 query）和 Pinterest 手工芯片（中英文 query 均覆盖），作为 Curify 话题分类法扩展的种子词汇。每个 Canva 有但 Curify 没有对应话题 slug 的模板类目，都是路由缺口。每个 Pinterest 芯片中出现但 Curify 尚无对应标签的子意图词，都是别名扩展候选项。

3. **模板匹配与库存：** P0/P1 缺口（16 个 query，28% 的 eval 集，较上次 -4）不是路由失败——是库存失败。8-cluster 系统的路由逻辑是对的，模板不存在才是根本原因。优先级：紧急补充食谱海报/计划表模板（P0），然后是教育可打印材料变体（P1）。

4. **规模化内容缺口检测：** 5 平台 eval 框架应每季度运行一次。任何 Google/Bing/Pinterest 中 ≥2 个平台返回满十条结果但 Curify 返回 <5 条的 query，都应标记为缺口并纳入处理队列——要么补充新模板，要么改善分词。

5. **更好的创意结果呈现：** 即使 Curify 有结果，视觉多样性也低于 Pinterest/Google。8-cluster 芯片支持过滤，但同一 cluster 内的结果外观趋同。在 cluster 内提升风格多样性（水彩 vs. 扁平设计 vs. 复古）是下一个展示质量的提升点。

### 8.3 Gap 汇总

| 严重程度 | 数量 | Query 列表（2026-06-23 重采） | 建议行动 |
|---|---|---|---|
| P0 — 内容缺口 | 4 | easy weeknight dinners、gluten-free dinner ideas、meal prep weekly recipes、unique cultural experiences | 通过内容生成批次补充模板；立即处理 |
| P1 — 模板缺口 | 12 | 电商详情图、趣味经济学知识科普、homophones and homonyms、bilingual flashcards、watercolor map、marvel mbti chart、lunar new year red envelope、kitchen makeover、**phonics worksheets**（新入）、Spanish vocab、ESL flashcards、book lovers gift guide | 为这些创作意图补充专项模板 |
| P2 — 召回缺口 | 5 | 工程、historical character、mbti marvel、paper cutting、cuban sandwich recipe poster | 审计别名和分词；内容可能已存在但未被召回 |
| P3 — 正常 | 37 | 单词、genshin、chiikawa、english-chinese、met gala、global influence、反义词、samurai、wedding planner 等 | 监控回归；无需立即行动 |

---

## 9. 建议下一步

1. **修复 P0 内容缺口（立即，4 个 query）：** 启动内容生成批次，目标是食谱海报模板（`easy weeknight dinners`、`gluten free dinner ideas`、`meal prep weekly recipes`）和旅行文化体验模板（`unique cultural experiences`）。`phonics worksheets kindergarten` 已从 P0 修复至 P1（现有 4 条结果），但仍需补充模板至满十条。

2. **解决 P1 模板缺口（短期，12 个 query）：** 对每个 P1 query，验证 Curify 路由在模板存在的情况下是否能正常工作。以 Canva 的 ok query 模板分类作为待补充模板的风格/格式参考。

3. **用 Bing 的 40 标签集扩展 Curify 的话题别名词汇。** 对 58 个 query 的每一个，将 Bing 相关搜索标签与 Curify 现有话题 slug 集对比。任何没有对应话题 slug 的标签集群都是分类法扩展候选项。

4. **将 Pinterest 手工 One Bar 芯片纳入话题别名和子意图词表建设。** `pinterest-manual-label-summary-2026-06-23.csv` 中 36 个 query 的 718 个芯片标签，是直接可用的子意图词汇资产。优先处理消费型中文 query（21/28 覆盖，均值 17.4）和 P2 召回缺口 query（如 `工程`→デザイン/Logo/插画，`反义词`→中文/Worksheet/幼儿园）。

5. **正式化 Canva vs. Curify 英文 query 模板对比。** 对 36 个 Canva 可访问的英文 query，构建系统化对比：Canva 模板类目 → Curify 话题 slug 映射。缺口 = 待补充话题；匹配 = 当前路由质量指标。

6. **将 eval 集从 58 扩展至约 200 个 query，按 Tier 1 分层抽样。** 当前 58 个 query 过度代表了词汇与语言（21%），低代表了食物与食谱（10%）和旅行（7%）。按 Tier 1 分层的 200 query 集能为每个类别提供更可靠的信号。

7. **将平台评分卡运营化为季度基准。** 每次 Curify 搜索重大更新后重跑全部 5 个平台采集器。追踪：每平台满十条结果率、平均标签数、Curify vs. Canva 结果数量对等情况。趋势比单点快照更具行动意义。

---

## 10. 附录

### 10.1 本次生成的文件

| 文件 | 用途 |
|---|---|
| `docs/external-signal-pilot/query-tier1-distribution-58.csv` | 58 query 的 Tier 1 分类，含消费/创作导向和关键类目 |
| `docs/external-signal-pilot/platform-scorecard-5x58.csv` | 5 平台 × 5 维度星级评分表 |
| `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` | 英文版原始报告 |
| `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md` | 2026-06-21 中文版（自动采集数据，已归档） |
| `docs/external-signal-pilot/pinterest-manual-label-summary-2026-06-23.csv` | Pinterest 手工 label 汇总（58 query，718 个标签） |
| `docs/external-signal-pilot/pinterest-manual-label-missing-queries-2026-06-23.csv` | Pinterest 经手工核查仍无 label 的 22 个 query 列表 |
| `docs/external-signal-pilot/EXTERNAL_SIGNAL_INSIGHTS_2026-06-23_zh.md` | 本报告（Pinterest 手工数据更新版，中文） |

### 10.2 复用的已有文件（未修改）

| 文件 | 用途 |
|---|---|
| `docs/external-signal-pilot/external-signal-5x2-query-classification-58.csv` | Query 意图（消费/创作）分类 |
| `docs/external-signal-pilot/external-signal-5x2-summary.csv` | 5 平台 × 2 意图聚合统计（Pinterest 行反映自动采集数据） |
| `docs/external-signal-pilot/curify-gap-analysis-58.csv` | 每个 query 的 P0/P1/P2/P3 缺口严重程度 |
| `docs/external-signal-pilot/external-signal-5x2-comparison-58.md` | 早期 5×2 对比报告 |

### 10.3 已知局限

- **Canva 中文缺口：** 21/58 个 query 因中文 query 的登录墙不可访问。无法使用 Canva 作为中文模板需求分析的参考。
- **Pinterest label 手工补全：** 原自动采集 40/58 query 标签为零。经手工补全，36/58 query 获得 One Bar 子意图芯片数据（全量均值 12.4 个/query），22/58 query 经手工核查 Pinterest 本身不生成芯片。手工数据不可自动重现；不同会话访问结果可能存在差异，不宜直接用于实时管道。
- **Curify 结果是时间点快照。** eval 于 2026-06 采集，Curify 的模板库持续更新；补充内容后应重跑 eval 以衡量改善效果。
- **无跨平台结果去重。** 同一图片/模板可能出现在多个平台；本次 eval 未追踪跨平台重叠。
- **星级评分为定性判断**，基于 58 个 query eval 集中观察到的平台行为，非统计严格意义上的量化评分。
- **Pinterest 图板标题未采集。** 当前 pilot 采集了 Top-10 图钉但未提取图板元数据；图板标题是更隐性也更丰富的意图信号，建议作为下一步采集目标。

### 10.4 各平台数据质量

| 平台 | 完整覆盖 | 主要局限 |
|---|---|---|
| Google Images | 58/58 | 本次 eval 无局限 |
| Bing Images | 58/58 | 本次 eval 无局限 |
| Pinterest | 58/58 结果；36/58 有 label（手工补全，原 18/58 自动采集）| 22/58 query 经手工核查仍无 label；label 数据为手工采集，非自动化，不可重现性需标注 |
| Canva | 36/58 | 中文 + 日本流行文化 = 21/58 登录拦截 |
| Curify | 54/58 正常，4 个空结果（2026-06-23 重采） | 内容缺口（P0 食谱/旅行类 query）；phonics worksheets 已从 P0 改善至 P1 |

---

*报告生成时间：2026-06-23 | 分支：baobao/multi-intent-topic-cooccurrence | Query 数：58 | 平台数：5*  
*Pinterest label 数据：手工补全（2026-06-23），详见 `pinterest-manual-label-summary-2026-06-23.csv`*  
*Curify 结果：2026-06-23 重采（内容缺口修复后），ok=54 ok_empty=4 P3=37*
