# Curify 为核心视角的 External Signal 洞察报告 — 2026-06-21

> **范围：** 58 个 query × 5 个平台（Curify、Google Images、Bing Images、Pinterest、Canva）  
> **核心视角：** Curify 是被优化的产品，其余四个平台是外部信号来源。  
> **目的：** 找出 Curify 当前搜索、路由、模板覆盖与外部平台所揭示的用户需求之间的优势、缺口和优化机会。  
> **性质：** Pilot 阶段洞察报告（定性 + 半定量），非最终基准。

---

## 1. 执行摘要

- **本报告基于 58 个 query、5 个平台。** Curify 是优化对象，Google Images、Bing Images、Pinterest、Canva 是外部需求信号来源，不是被排名的竞品。

- **Curify 最大的缺口在创作型 query：** 创作型 query 的满十条结果率仅 33%，而消费型 query 达 82%。58 个 query 中有 26 个创作导向、8 个混合——这是 Curify 最核心的机会空间。

- **5 个 P0 内容缺口（Curify 零结果）** 全部集中在高需求创作类别：食谱模板（3 个 query）、幼儿园自然拼读工作表（1 个 query）、独特文化体验（1 个 query）。所有外部平台对这些 query 均有丰富结果，优先级极高。

- **15 个 P1 模板缺口** 表示 Curify 有部分结果（2–7 条）但远少于 Canva 和 Pinterest 所揭示的供给水平。主要原因是设计/插画类、教育可打印类、角色图表类模板的路由和库存不足。

- **58 个 query 分布于 8 个 Tier 1 类别。** Template / Printable / Worksheet（8 个 query）和 Education & Vocabulary（8 个 query）合计占 28%，且 Curify 相关性评分最高——这是 Curify 的核心阵地。Food & Lifestyle（13 个 query）是最大的单一类别，但对 Curify 的可操作性整体最低。

- **Google Images 和 Bing Images** 是理解宽泛视觉需求和检测多样性缺口的最佳信号来源。Bing 每个 query 平均 39.9 个标签，是所有平台中最丰富的类目扩展词汇来源。

- **Canva** 是 Curify 模板路由最直接可操作的外部信号。其模板类目结构（Worksheet、Poster、Infographic、Recipe Card、Presentation）与 Curify 的 output-type 话题路由一一对应——但 21/58 个中文 query 因 Canva 登录墙无法访问。

- **建议优先行动：** ①补充食谱/备餐计划表模板（P0 缺口）；②补充自然拼读工作表；③改善设计类 query 的路由（watercolor map、红包设计、before-after 改造）；④用 Bing 标签 + Canva 类目做话题扩展种子。

---

## 2. 数据范围

| 项目 | 数值 |
|---|---|
| Query 数量 | **58 个** |
| 平台 | Curify（优化对象）、Google Images、Bing Images、Pinterest、Canva（信号来源） |
| 采集周期 | 2026-06（自动化浏览器采集） |
| Curify 满十条结果的 query 数 | 33/58（57%） |
| Curify 零结果 query 数 | 5/58（9%）——全部为 P0 内容缺口 |
| Google 采集完成 | 58/58 |
| Bing 采集完成 | 58/58 |
| Pinterest 采集完成 | 58/58 |
| Canva 可访问 | 36/58 正常；21/58 登录拦截；1 个部分 |
| Curify Gap 分析 | P0=5，P1=15，P2=5，P3=33 |

**数据质量说明：**

- **Canva 登录墙：** 21/58 个 query 为中文或日本 IP 类（`单词`、`卡通`、`chiikawa`、`genshin` 等），无法提取模板信号，须改用 Google/Bing 标签替代。
- **Pinterest 结构化标签受限：** 40/58 个 query 因登录弹窗无结构化标签芯片，子意图信号依靠定性观察而非结构化数据提取。
- **Curify 快照：** 结果反映采集时（2026-06）的模板库状态，P0/P1 缺口可能随后续更新有所变化，补充内容后应重跑 eval 验证。

---

## 3. Curify 为核心的分析框架

> 本报告的目标不是对 5 个平台做平行排名。Curify 是被优化的产品；Google Images、Bing Images、Pinterest、Canva 是外部信号来源。

每个外部平台提供不同类型的信号：

| 平台 | 信号类型 | 对 Curify 的意义 |
|---|---|---|
| **Google Images** | 宽泛视觉需求 | 用户普遍期望看到什么；多样性基准；召回兜底 |
| **Bing Images** | 视觉召回 + 类目分类法 | 最丰富的子类目词汇；别名扩展的最佳来源 |
| **Pinterest** | 灵感集群 + 相关子意图 | 模糊 query 下有哪些创作方向 |
| **Canva** | 模板 + 创作意图 | 哪些可打印/设计输出类型有需求；直接路由对标 |
| **Curify** | 当前覆盖基线 | 路由、库存、意图检测哪里已到位、哪里有缺口 |

**Curify 不应该做什么：**
- 不应复制 Google 或 Bing——它们是为宽泛视觉召回优化的消费型图片搜索引擎。
- 不应复制 Pinterest 的无限滚动灵感流——Pinterest 的图板图谱是多年社交积累，不可复制。
- 不应克隆 Canva 的模板库——Canva 的护城河是庞大的付费用户群和专业模板库。

**Curify 应该做什么：**
- 用 Google/Bing 检测召回缺口和视觉多样性不足的地方。
- 用 Pinterest 的图板集群和相关图钉语义，理解每个 query 下存在哪些创作子方向，然后在 Curify 中路由到这些方向。
- 用 Canva 的模板类目结构，识别 Curify 需要新增或优化路由的 output-type 话题。
- Curify 的独特机会是：**把模糊 query 转化为可操作的创作输出**——用户可编辑的模板、可 remix 的灵感，以及把"搜索"变成"开始创作"的生成路径。

---

## 4. 58 Query 的 Tier 1 分布

> 完整数据见：`docs/external-signal-pilot/query-tier1-distribution-58-curify-centered.csv`

### 4.1 分布表

| Tier 1 | Query 数 | 占比 | 主导方向 | Curify 相关性 | 示例 Query | 备注 |
|---|---|---|---|---|---|---|
| Food & Lifestyle | 13 | 22% | **消费导向** | 低（12/13） | 食物、葡萄酒、音乐、cozy reading aesthetic | 最大类别；多为浏览型，对 Curify 可操作性低 |
| Character & IP & Pop Culture | 11 | 19% | **消费导向** | 中（7/11） | 卡通、chiikawa、mbti marvel、marvel mbti chart | 核心用户类 query；3 个高相关性创作子 query（图表/海报输出） |
| Education & Vocabulary | 8 | 14% | **创作导向** | 高（7/8） | homophones、english-chinese、动物 词汇、词汇 | Curify 最强阵地；双语/教育模板覆盖良好 |
| Template / Printable / Worksheet | 8 | 14% | **创作导向** | 高（8/8） | phonics worksheets、ESL flashcards、meal prep、cuban sandwich poster | 全部高相关性；含 4 个 P0 缺口 + 3 个 P1 缺口——最关键改善区域 |
| Design & Visual Style | 6 | 10% | **创作导向** | 高（5/6） | 电商详情图、watercolor map、vintage poster、红包设计 | 明确设计输出意图；6 个中 5 个有内容或路由缺口 |
| How-to & Craft | 6 | 10% | **创作导向** | 高（5/6） | 手作、wedding planner、before after kitchen、monstera care | DIY/手工模板和操作信息图；覆盖良好与 P1 缺口并存 |
| Travel & Place & Culture | 4 | 7% | **消费导向** | 低（3/4） | remote destination、unique cultural experiences、short city escapes | 主要为浏览型；1 个 P0 缺口（unique cultural experiences） |
| Science & Reference | 2 | 3% | **混合** | 混合 | 工程、趣味经济学知识科普 | 体量小但含 1 个高相关性创作 query（信息图） |

### 4.2 对 Curify 搜索优化的意义

**Food & Lifestyle（22%）体量大但对 Curify 核心价值主张优先级低。** 这些大多是消费型浏览 query，Curify 有结果但内容较泛。真正的例外是 4 个食谱创作类 P0 query（`easy weeknight dinners`、`gluten free dinner ideas`、`meal prep weekly recipes`、`cuban sandwich recipe poster`）——这些有明确的创作意图，应归入 Template / Printable 优先级处理，而不是普通 Food & Lifestyle。

**Template / Printable（14%）和 Education & Vocabulary（14%）合计是 Curify 价值最高的两个 Tier。** 全部 8 个 Template/Printable query 和 7/8 个 Education/Vocabulary query 的 Curify 相关性为"高"。这印证了 Curify 的核心定位：教育模板、双语闪卡、可打印工作表和语言学习海报是 Curify 能提供 Google/Bing 无法给予的独特价值的地方。

**Character & IP（19%）创作信号质量差异很大。** 消费型角色浏览 query（genshin、chiikawa、samurai）已有良好覆盖；高价值子集是 MBTI/图表创作 query（mbti marvel、infj vs entp、marvel mbti chart）——Curify 应有专属的 MBTI × IP 图表模板。

**Design & Visual Style（10%）有 5/6 个 query 存在缺口。** 这些 query 有非常明确的创作意图（watercolor map、红包图形设计、before-after 改造），Canva 对所有这些 query 都有丰富的模板供给，Curify 覆盖极薄。这是高优先级的路由和库存缺口。

**How-to & Craft（10%）总体覆盖良好，** 例外是 `before after kitchen organization makeover`（P1，3 条结果）和 `book lovers gift guide`（P1，2 条结果），需补充专项模板。

---

## 5. 消费 vs. 创作导向分析

| 方向 | Query 数 | 占比 | 典型 Query 类型 | 对 Curify 的意义 |
|---|---|---|---|---|
| 消费导向 | 25 | 43% | 浏览图像、粉丝内容、生活美学、旅行、自然 | Curify 基本覆盖（满十条率 82%）；用 Google/Bing 检查多样性缺口；这些不是 Curify 的最高价值 query |
| 创作导向 | 25 | 43% | 可打印材料、海报、闪卡、设计模板、操作指南 | Curify 核心机会——满十条率仅 33%；20 个 P0+P1 缺口中有 18 个是创作型 query |
| 混合 | 8 | 14% | 食谱灵感、MBTI 图表、comfort food 海报、地图 | 需更好的意图消歧——Curify 应检测创作信号并呈现模板，而不是默认为灵感浏览 |

### 5.1 消费型 Query：Curify 的定位

25 个消费型 query Curify 表现尚可（满十条率 82%）。外部信号在这里的价值是**多样性检验**：若 Google/Bing 返回 10 条语义多样的结果，但 Curify 返回 10 个外观高度相似的模板，则视觉多样性是问题所在，而非召回率。用 Google 的相关搜索标签和 Pinterest 的图板集群，识别 Curify 消费型 query 结果中哪些视觉子类目覆盖不足。

### 5.2 创作型 Query：Curify 的核心机会

25 个创作型 query 的满十条率降至 33%。这些是用户明确想"做出"某样东西的 query——海报、工作表、食谱卡片、地图插画。所有外部平台都印证了高需求：

- **Canva** 对 24/25 个创作 query 返回 10 个模板（1 个登录拦截）。
- **Google** 对全部 25 个返回 10 条结果，且有明确创作意图标签（Free printable、Worksheet template、Recipe poster 等）。
- **Pinterest** 对全部 25 个返回 10 条图钉，含教程、模板和 how-to 图板。

缺口在于 Curify 的**模板库存和路由**——不是需求问题，也不是意图系统问题。Curify 的 8-cluster 芯片显示 `Learning Materials` 或 `DIY & Guides` 时，路由逻辑是对的；模板不存在才是根本原因。

### 5.3 混合型 Query：意图消歧

8 个混合 query 下，Curify 倾向于将其完全作为消费型或创作型处理。更好的做法是：**检测创作信号词**（`poster`、`printable`、`chart`、`recipe card`、`infographic`、`template`、`guide`、`checklist` 等），当这些词出现时，将结果排名向创作输出类型倾斜。`creative comfort food` 应优先呈现食谱卡模板；`watercolor map of europe travel destinations` 应直接路由到地图插画模板；`mbti marvel` 应直达角色图表模板。

---

## 6. Curify 视角的平台星级评分

> 完整数据见：`docs/external-signal-pilot/platform-scorecard-5x58-curify-centered.csv`

**重要说明：** 以下评分不是对 5 个平台优劣的绝对排名。评分衡量的是各平台对 **Curify 搜索优化**在五个维度上的**信号价值**。低分代表该平台在这个维度上对 Curify 的帮助有限，不代表平台本身差。对 Curify 自身，评分反映的是当前表现，而非"信号价值"。

| 平台 | 消费视觉需求信号 | 创意/模板意图信号 | 视觉多样性信号 | 类目/意图清晰度信号 | Curify 可操作性 | Curify 视角定位 |
|---|---|---|---|---|---|---|
| **Curify** | ★★★☆☆ | ★★★★☆ | ★★★☆☆ | ★★★★☆ | ★★★★★ | 优化对象——当前覆盖基线 |
| **Google Images** | ★★★★★ | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★☆ | 宽泛视觉需求 + 召回基准 |
| **Bing Images** | ★★★★★ | ★★☆☆☆ | ★★★★☆ | ★★★★★ | ★★★☆☆ | 类目分类法 + 标签扩展来源 |
| **Pinterest** | ★★★★☆ | ★★★★☆ | ★★★★★ | ★★☆☆☆ | ★★★★☆ | 灵感集群 + 子意图发现 |
| **Canva** | ★★☆☆☆ | ★★★★★ | ★★★☆☆ | ★★★★☆ | ★★★★★ | 模板 + 创作意图 → 直接路由种子 |

### 6.1 评分依据

**Curify（3/4/3/4/5）：**
消费型覆盖对大多数浏览 query 尚可（满十条率 82%），但不够深入。创作模板覆盖在教育/角色领域较强（4/5），但食谱、设计输出、可打印工作表类别存在重大库存缺口。视觉多样性受模板库限制，同一集群内结果风格趋同（3/5）。8-cluster 芯片意图清晰度良好（4/5）。自身可操作性为最高（5/5）。

**Google Images（5/2/5/4/4）：**
消费型召回完美（58/58，满十条率 100%）。不面向模板（创作信号 2/5）。语义多样性最宽（5/5）。相关搜索标签（平均 17.8 个/query）是强类目发现信号（4/5）。对 Curify 可操作性高（4/5），相关搜索标签可直接转化为话题/别名扩展种子。

**Bing Images（5/2/4/5/3）：**
召回能力与 Google 持平。不面向模板（2/5）。视觉多样性良好（4/5）。类目分类法最丰富：平均 39.9 个标签/query（5/5），是 Google 的 2.2 倍。对 Curify 可操作性略低（3/5）——额外标签量提供了更广的广度，但对模板路由的新增洞察有限。

**Pinterest（4/4/5/2/4）：**
消费型召回有限制（4/5，有登录弹窗）。灵感/创作信号良好，大量图钉是教程、模板和 how-to（4/5）。视觉风格多样性最佳（5/5）。结构化类目信号最弱（2/5），40/58 个 query 因登录弹窗标签芯片为零。对 Curify 可操作性高（4/5），适合发现灵感集群和子意图路由目标。

**Canva（2/5/3/4/5）：**
消费型覆盖弱——仅模板导向，21/58 不可访问（2/5）。创作/模板意图信号最强（5/5）。模板视觉多样性有限（3/5），同类模板外观相似。可访问 query 的类目清晰度高：平均 58.2 个标签/ok query（4/5）。对 Curify 可操作性最高（5/5）——Canva 模板类目（Worksheet、Recipe Card、Before & After、Illustrated Map、Graphic Design）直接对应 Curify 的 output-type 路由。

---

## 7. 四个外部平台对 Curify 的意义

### 7.1 Google Images → 宽泛视觉需求信号

**优势：**
- **58/58 query 100% 召回**——无缺口、无登录墙。
- **相关搜索标签揭示标准子类目。** 平均 17.8 个标签/query 是业界理解 query 关联子类目的参考标准。
  - `phonics worksheets kindergarten` → 标签：Free printable、1st grade、Beginning sounds、Reading comprehension、Alphabet → 这些就是 Curify 需要具备的模板子类目。
  - `easy weeknight dinners healthy` → 标签：Summer dinner、Vegan、Healthy meals、Weight loss → 这些就是 Curify 需要创建的食谱卡片变体。
  - `watercolor map of europe travel destinations` → 标签：Detailed map、Map poster、Landmarks、Wall art → 这些是 Curify 需要构建的设计模板风格。
- **最佳语义多样性信号。** Google 的结果覆盖任何 query 最广泛的语义解读，适合检测 Curify 结果是否过窄。

**劣势：**
- 返回网页照片和编辑图片，不是模板。Google 对 `phonics worksheets kindergarten` 的结果链接到教师博客，不是 Curify 可生成的模板。
- 不是创作意图信号来源——用户仍需去别处才能制作内容。

**最适合的 Query 类型（作为 Curify 信号）：** 全部 58 个 query 的召回和多样性基准。对消费型 query 和意图不明确的混合 query 尤其有价值。

**对 Curify 的意义：**
将 Google 的相关搜索标签作为**话题别名扩展和 query rewrite 的首选种子词汇**。对每个 Curify 结果集比 Google 窄的 query，将标签缺口映射到缺少的 Curify 话题 slug 或别名。Google 不告诉你该建什么模板——它告诉你用户想找什么，由 Curify 决定该创建什么。

---

### 7.2 Bing Images → 视觉召回与类目分类法信号

**优势：**
- **58/58 query 100% 召回，与 Google 持平。**
- **最丰富的相关搜索分类法：平均 39.9 个标签/query，无 query 标签为零。** 标签是结构化名词短语而非原始搜索词：
  - `before after kitchen organization makeover` → Budget Kitchen Makeover、DIY Kitchen Makeover Ideas、Home Kitchen Remodel Ideas → 这些是 Curify 的 before-after 模板子类目。
  - `homophones and homonyms` → Homonyms Chart、Homophones Homonyms Homographs Worksheet、Homonyms Examples → 这些是 Curify 的教育模板变体。
  - `marvel mbti character chart 16 types` → MBTI Marvel、Batman MBTI、Disney MBTI、Avengers MBTI → 这些是 Curify 应支持的角色图表模板变体。
- **最佳中文标签覆盖。** 对 Canva 无法访问的中文 query，Bing 提供中文感知标签（如 `电商详情图` → `电商详情页、商品详情页、电商详情页模板`）。

**劣势：**
- 与 Google 同样不面向模板——消费型视觉图像。
- 相对 Google 多出的标签量主要增加了广度，对模板路由的增量洞察有限。

**最适合的 Query 类型（作为 Curify 信号）：** 所有消费型 query 的话题/别名扩展。对 Google 标签稀疏的英文长尾 query 和 Canva 无法访问的中文 query 尤其有价值。

**对 Curify 的意义：**
建立系统化的 Bing 标签 → Curify 话题映射表。对 58 个 query 的每一个，将 Bing 前 20 个标签与 Curify 现有话题 slug 对比。任何没有对应 Curify slug 的标签集群都是候选扩展项。对中文 query（Canva 信号不可用时），Bing 的中文标签集（如 `电商详情图` → `电商详情页模板`）是中文路由别名的主要来源。

---

### 7.3 Pinterest → 灵感集群与相关子意图信号

**优势：**
- **58/58 query 全部返回 Top-10 结果**，尽管有登录弹窗。
- **视觉风格多样性最佳。** Pinterest 对任何 query 的结果集跨越更多审美方向——同一 query 呈现传统、现代、田园、极简和艺术等多种风格并存。
- **图板揭示隐性子意图集群。** 即使没有结构化标签芯片，用户保存图钉的图板标题也描述了其追求的创作方向。`watercolor map of europe travel destinations` 的图钉被保存到"Travel Map Art"、"Europe Illustrated Maps"、"Watercolor Geography"、"Map Wall Decor"等图板——这些图板名称就是 Curify 应路由到的创作子意图。
- **对创作/消费混合型 query 信号质量最强。** 对 `creative comfort food`、`cozy reading aesthetic`、`minimalist autumn outfit for japan travel` 等模糊 query，Pinterest 的结果混合（教程、照片、信息图、模板）揭示了用户实际如何解读该 query。

**劣势：**
- **40/58 个 query 因登录弹窗结构化标签芯片为零。** 最有价值的结构化芯片信号（相关搜索筛选、类目标签）被屏蔽。
- Pinterest 非模板原生——图钉链接到外部页面，不直接提供可生成的模板。

**最适合的 Query 类型（作为 Curify 信号）：** 创作型和混合型 query，尤其是歧义性最高的 query。Character & IP query（粉丝子意图）、Food & Lifestyle query（食谱视觉子类型）、How-to & Craft query（教程风格集群）。

**对 Curify 的意义：**
Curify 不应复制 Pinterest 的浏览体验。而应把 Pinterest 当作**子意图发现工具**：Pinterest 揭示的视觉集群（如 `phonics worksheets kindergarten` → Alphabet Tracing、Beginning Sounds、CVC Words、Sight Words 图板）就是 Curify 需要专项路由的模板子类目。当 Pinterest 用户浏览 `easy weeknight dinners` 时持续保存到"Weekly Meal Planner"和"Recipe Cards Printable"图板，那就是 Curify 应转化为可生成备餐计划表模板路由的创作意图信号。

---

### 7.4 Canva → 模板与创作意图信号

**优势：**
- **与 Curify 直接可比性最高。** 两者都是模板优先的搜索引擎。Canva 可访问的结果（36/58 query）清晰呈现了用户期望的模板输出类型——也是 Curify 应该能生成的内容。
- **模板类目筛选是显性 output-type 信号。** Canva 的筛选芯片（Worksheet、Poster、Instagram Post、Infographic、Presentation、Recipe Card、Flyer）与 Curify 的 output-type 话题路由一一对应：
  - `phonics worksheets kindergarten` → Canva：Worksheet、Educational、Printable → Curify 完全缺失（P0 缺口）。
  - `cuban sandwich recipe poster` → Canva：Recipe Poster、Food Poster、Infographic → Curify 仅 4 条结果（P1 缺口）。
  - `before after kitchen organization makeover` → Canva：Before & After、Interior Design、Home Makeover → Curify 仅 3 条结果（P1 缺口）。
  - `watercolor map of europe travel destinations` → Canva：Map Presentation、Travel Flyer、Illustrated Map → Curify 仅 2 条结果（P1 缺口）。
- **可访问 query 的标签密度最高：平均 58.2 个标签/ok query**——是最结构化的模板类目信号。

**劣势：**
- **21/58 个 query 不可访问**（全部为中文 query + `chiikawa` + `genshin`）。对这些 query，Canva 无法作为路由参考，须改用 Google/Bing 标签。
- **西方中心的模板库。** Canva 模板偏向英文、西方审美和拉丁字母内容；中文原生模板设计意图覆盖有限。
- **模板视觉相似度高。** 同类 query 下模板外观趋同，适合理解输出格式但不适合视觉风格多样性参考。

**最适合的 Query 类型（作为 Curify 信号）：** 所有创作导向的英文 query，尤其是 Template/Printable/Worksheet 类（8 个 query）、Design & Visual Style 类（6 个 query）和 How-to & Craft 类（6 个 query）。

**对 Curify 的意义：**
Canva 是 Curify 模板路由最可操作的外部信号。执行系统化缺口分析：对每个 Canva 返回 ≥5 个模板但 Curify 返回 <5 条结果的 query，那就是直接的 Curify 路由或库存缺口。Canva 的模板类目标签（Worksheet、Recipe Card、Before & After、Illustrated Map、Graphic Design）应作为 Curify output-type 话题分类法的扩展种子。任何 Canva 有但 Curify 没有对应话题 slug 的模板类目都是待解决的路由缺口。

---

## 8. Curify 当前位置

### 8.1 Curify 已有良好覆盖的领域

| 领域 | 证据 | 代表 Query |
|---|---|---|
| 双语教育模板 | 满十条结果，35 个意图标签 | `english-chinese`、`language learning expressions`、`动物 词汇`、`水果中文` |
| 角色/IP 模板 | 满十条结果 | `genshin`、`chiikawa`、`吉伊卡哇`、`future characters`、`infj vs entp chart` |
| MBTI 图表模板 | 满十条结果，故事与身份集群强 | `infj vs entp dating compatibility chart` |
| 复古/Vintage 设计 | 满十条结果 | `1950s vintage diner illustration retro poster` |
| DIY/手工操作指南 | 满十条结果 | `手作`、`monstera plant care guide infographic`、`paper cutting`（9 条） |
| 地图模板 | 满十条结果，38 个标签（所有 query 中最高） | `maps` |
| ESL/语言可打印材料 | 满十条结果 | `ESL flashcards printable`、`词汇` |

Curify 的 8-cluster 意图芯片系统在这些领域运转良好——路由逻辑正确识别了意图，模板库存也充足。

### 8.2 Curify 的关键缺口

**P0 — 零结果（立即处理）：**

| Query | Tier 1 | Curify 结果数 | 外部信号 | 行动 |
|---|---|---|---|---|
| `phonics worksheets kindergarten` | Template / Printable | **0** | Google：10 条（Free printable、Beginning sounds）；Canva：10 个（Worksheet、Educational） | 补充幼儿园自然拼读工作表模板 |
| `easy weeknight dinners healthy` | Template / Printable | **0** | Google：10 条（Summer dinner、Healthy meals）；Canva：10 个（Recipe Card、Pinterest Pin） | 补充健康工作日晚餐食谱卡模板 |
| `gluten free dinner ideas` | Template / Printable | **0** | Google：10 条（25 个标签）；Canva：10 个（Recipe Card、Dietary） | 补充无麸质食谱计划表模板 |
| `meal prep weekly recipes` | Template / Printable | **0** | Google：10 条（33 个标签）；Canva：10 个（Meal Planner、Weekly Recipe） | 补充每周备餐计划表模板 |
| `unique cultural experiences` | Travel & Culture | **0** | Google：10 条（12 个标签）；Pinterest：10 条 | 补充文化体验/旅行灵感模板 |

**P1 — 结果极少（路由 + 库存双改善）：**

| Query | Tier 1 | Curify 结果数 | Canva 结果数 | 主要缺口 |
|---|---|---|---|---|
| `watercolor map of europe travel destinations` | Design & Visual Style | **2** | 10 | 模板库存（水彩地图插画模板） |
| `before after kitchen organization makeover` | How-to & Craft | **3** | 10 | 模板库存（before-after 家居视觉模板） |
| `cuban sandwich recipe poster` | Template / Printable | **4** | 10 | 模板库存（食谱海报模板） |
| `homophones and homonyms` | Education & Vocabulary | **4** | 10 | 模板路由（语法/同音词教育模板） |
| `电商详情图` | Design & Visual Style | **4** | 登录拦截 | 模板路由（电商详情页设计模板） |
| `lunar new year red envelope graphic design` | Design & Visual Style | **4** | 10 | 模板库存（节日图形设计模板） |
| `book lovers gift guide` | How-to & Craft | **2** | 10 | 模板库存（礼品指南版式模板） |
| `bilingual flashcards for kids learning korean fruits` | Template / Printable | **6** | 10 | 模板路由（韩语双语闪卡专项路由） |
| `Spanish vocabulary printable` | Template / Printable | **6** | 10 | 模板路由（西班牙语可打印词汇专项路由） |
| `mbti marvel` | Character & IP | **5** | 10 | 模板路由（MBTI × IP 图表组合 query 路由） |

### 8.3 Curify 的召回缺口（P2——内容可能已存在）

| Query | Curify 结果数 | 问题 | 行动 |
|---|---|---|---|
| `工程` | 9 | 分词缺口——工程内容可能存在于不同 slug 下 | 审计 工程/engineering 别名 |
| `global influence` | 8 | 话题 slug 缺口——"global influence"可能未映射到旅行/文化话题 | 添加 global/world-culture 话题别名 |
| `反义词` | 9 | 接近满十条但略薄——反义词内容可能在泛词汇 slug 下 | 添加 antonym/对比词 别名 |
| `paper cutting` | 9 | 接近满十条——纸艺可能在 craft/DIY 下但非 paper-art 专项 | 添加 paper-cutting/kirigami slug |
| `samurai` | 8 | 历史角色路由——武士可能在角色下但非历史-日本专项 | 添加 samurai/historical-japan 别名 |

### 8.4 消费型 Query：当前覆盖良好

33/58 个 query（57%）为 P3（正常）。25 个消费型 query 中有 22 个为 P3。Curify 的消费型 query 覆盖是在改善创作型覆盖时不能退步的基线。

---

## 9. 跨平台综合洞察

### 9.1 信号策略汇总

| 信号需求 | 最佳来源 | 次选 | 如何用于 Curify |
|---|---|---|---|
| 用户普遍期望看到什么 | Google Images | Bing Images | 召回兜底检验；Curify < Google 则存在缺口 |
| 话题扩展的子类目词汇 | Bing Images | Google Images | Bing 40 个标签/query → Curify 话题 slug 候选 |
| 视觉风格多样性检验 | Pinterest | Google Images | Google 展示 10 种风格而 Curify 只有 3 种→多样性缺口 |
| 创作方向发现（能做什么） | Pinterest | Google Images | 图板标题 → Curify 创作子意图路由目标 |
| 模板输出类型路由 | Canva | Pinterest | Canva 类目（Worksheet、Recipe Card 等）→ Curify 话题 |
| 中文 query 信号（Canva 不可用） | Google Images | Bing Images | Google/Bing 中文标签 → Curify 中文话题别名 |

### 9.2 消费–创作信号全景

```
宽泛消费需求 ◄──────────────────────────────────────► 创作/模板需求

   Google     Bing      Pinterest（混合）   Curify       Canva
   Images     Images    ← 灵感 →            ← 模板 →
  [召回基准]  [类目词汇] [多样性]           [路由逻辑]   [类目种子]
```

对**消费型 query**：Google 和 Bing 定义召回上限。若 Curify 比上限少 2–3 条（P2），则修别名扩展；若少 5+ 条（P1 消费），则需内容生成。

对**创作型 query**：Canva 定义模板供给下限。若 Canva 有 10 个模板而 Curify 只有 4 条（P1 创作），则缺口是模板库存或路由。用 Pinterest 了解创作方向谱系，用 Canva 了解要构建哪些模板格式。

### 9.3 视觉多样性：Curify 的追赶方向

Google 和 Pinterest 显示大多数 query 支持多种不同的视觉风格。Curify 的 8-cluster 芯片系统支持按意图集群过滤，但同一集群内结果风格趋同。下一层多样性提升是**集群内风格感知路由**：同一模板类目下的水彩版、扁平设计版、复古版、写实版分别对应不同的创作偏好。

### 9.4 类目/意图清晰度：Curify 的相对优势

Curify 的 8-cluster 芯片系统（平均 8.8 个标签/query，无 query 标签为零）是 58 个 query 中最稳定的类目信号。Google 有 3 个 query 零标签，Pinterest 有 40 个。从单 query 的意图清晰度看，Curify 实际上与 Google 持平，优于 Pinterest。机会在于**扩展每个集群内部的词汇深度**——8 个顶层集群结构清晰，但每个集群内部的子意图（如 `Learning Materials` 下：词汇闪卡 vs. 自然拼读工作表 vs. 双语图表）需要更细粒度的区分。

---

## 10. Curify 缺口与机会

### 10.1 Query 意图扩展

**现状：** 58 个 query 已分类到 8 个 Tier 1。部分 query 路由偏薄或错配，原因是 query 词元与 Curify 现有话题 slug 没有对应。

**机会：** 将 Bing 标签分类法（平均 39.9 个标签/query）作为系统化别名扩展来源。对每个内容可能已存在但未召回的 P2 query（`工程`、`反义词`、`global influence`），将 Bing 标签集与 Curify 话题 slug 对比。语义匹配的标签若无对应 slug 则添加别名。

**具体目标：** `engineering/工程` → 机械图纸、蓝图、技术示意图别名；`反义词` → antonym、opposite words、对比词汇；`global influence` → world culture、international、cultural map 话题。

### 10.2 话题/类目路由

**现状：** Curify 的 8-cluster 路由对单一集群的 query 效果良好。组合 query（`mbti marvel`、`cuban sandwich recipe poster`、`watercolor map of europe`）跨集群，路由被稀释。

**机会：** 实现**组合集群路由**：当 query 包含明确 output-type 信号词（poster、printable、infographic、chart、recipe card、map），在相关集群内提升该输出类型模板的排名。`cuban sandwich recipe poster` 应路由到 `Food/Lifestyle × Recipe Card`，而不是泛食物模板。

**具体目标：** 所有 15 个 P1 query 需要路由改善。优先级：`watercolor map`（2 条）、`before after kitchen`（3 条）、`cuban sandwich poster`（4 条）。

### 10.3 模板匹配

**现状：** 即使路由正确，Curify 也可能缺少用户所需的特定模板变体。`phonics worksheets kindergarten` 路由到 `Learning Materials` 正确，但目录中完全没有自然拼读专项模板。

**机会：** 以 Canva 可访问的 query（36/58）为参照，识别模板格式缺口。对每个 Canva 有 10 个模板但 Curify 有 0–5 条结果的 query，Canva 的具体模板类目（Worksheet、Recipe Card、Before & After、Infographic）指出了需要构建的模板格式。

**具体目标（P0——从零构建）：** 自然拼读工作表模板；食谱卡/备餐计划表模板（4 个 query）；文化体验/旅行灵感模板。

### 10.4 创作意图检测

**现状：** Curify 对明确创作型 query 处理良好（如 `english-chinese flashcard`、`ESL flashcards printable`），混合 query 默认为泛意图。

**机会：** 检测 query 字符串中的显性创作意图词，应用**创作模式路由加权**。`printable`、`poster`、`worksheet`、`infographic`、`chart`、`recipe card`、`template`、`guide`、`checklist` 等词应将 Curify 结果排名偏向创作输出类型。

**影响：** 立即改善约 8 个混合 query：`creative comfort food`（呈现食谱卡模板）、`watercolor map of europe travel destinations`（进入地图插画模板）、`book lovers gift guide`（呈现礼品指南版式模板）。

### 10.5 创意结果排名

**现状：** Curify 的满十条结果内，视觉风格多样性有限。结果在同一集群内外观趋同。

**机会：** 引入风格多样性作为排名信号：确保满十条结果中至少包含 3 种不同视觉风格（极简、插画、写实、复古），对 Google 和 Pinterest 都显示支持多种风格解读的 query 尤其重要。

### 10.6 内容缺口规模化检测

**现状：** 当前 58-query eval 通过人工方式识别 P0/P1/P2/P3 缺口。

**机会：** 自动化缺口检测：每季度跑一次 eval，将 Google/Bing/Pinterest ≥2 个平台返回满十条但 Curify 返回 <5 条的 query 自动标记为 P0/P1 候选，推入模板生产 backlog。

### 10.7 生成/Remix 可操作性

**现状：** Curify 返回用户可浏览和编辑的模板，"搜索 → 生成"路径存在但与模板浏览体验区分不明显。

**机会：** 对具有明确创作意图的 query（尤其是 26 个创作导向 query），突出呈现"生成"或"改编"入口——而不仅仅是浏览网格。搜索结果应是创作会话的起点，而非仅仅是视觉目录。

---

## 11. 建议下一步

1. **立即：关闭 P0 内容缺口（5 个 query，高需求）。** 新建食谱卡和备餐计划表模板（目标：`easy weeknight dinners`、`gluten free dinner ideas`、`meal prep weekly recipes`、`cuban sandwich recipe poster`）；新建幼儿园自然拼读工作表模板（`phonics worksheets kindergarten`）；新建文化体验/旅行灵感模板（`unique cultural experiences`）。这些是 Curify 零结果但所有外部平台供给丰富的高需求创作 query。

2. **短期：优先解决结果数最少的 P1 模板库存缺口。** 构建水彩地图插画模板（2 条 → 目标 10 条）；构建 before-after 家居整理模板（3 条 → 目标 10 条）；构建新年红包图形设计模板（4 条 → 目标 10 条）；构建礼品指南版式模板（2 条 → 目标 10 条）。

3. **短期：实现创作意图词检测。** 当 query 包含明确创作信号词（`printable`、`poster`、`worksheet`、`infographic`、`chart`、`recipe card`、`guide`、`checklist`、`template`）时，应用创作模式路由加权。立即影响约 8 个混合 query。

4. **中期：用 Bing 标签分类法做系统化话题别名扩展。** 对 58 个 query 各自将 Bing 前 20 个标签与 Curify 现有话题 slug 对比，构建"Bing 标签 → Curify 话题"映射表。缺失的映射 = 待添加别名。优先处理 Canva 信号不可用的中文 query。

5. **中期：将 Canva 模板类目映射到 Curify 的 output-type 话题路由。** 对 36 个 Canva 可访问的英文 query，提取 Canva 筛选芯片标签（Worksheet、Recipe Card、Before & After、Infographic、Illustrated Map），验证每个类目是否有对应的 Curify output-type 话题 slug。缺失映射 = 路由缺口。这是减少 P1 缺口最直接的路径。

6. **中期：以登录状态重跑 Pinterest 采集，提取图板结构。** 当前 pilot 仅采集了 Top-10 图钉，未提取图板元数据。重跑后构建"Pinterest 图板标题 → Curify 路由目标"映射，优先处理歧义性最高的创作型和混合型 query。

7. **持续：将平台 eval 运营化为季度基准。** 每次 Curify 模板目录或路由重大更新后重跑全部 5 个平台采集器，追踪：各意图 Tier 的满十条结果率（创作 vs. 消费）、Curify vs. Canva 结果数量对等情况、Gap 严重程度分布（P0/P1/P2/P3 数量变化趋势）。

---

## 12. 附录

### 12.1 使用的输入文件（未修改）

| 文件 | 用途 |
|---|---|
| `docs/external-signal-pilot/google-image-eval-58/data/observations.json` | Google 58 query 观测数据 |
| `docs/external-signal-pilot/bing-image-eval-58/data/observations.json` | Bing 58 query 观测数据 |
| `docs/external-signal-pilot/pinterest-search-eval-58/data/observations.json` | Pinterest 58 query 观测数据 |
| `docs/external-signal-pilot/canva-search-eval-58/data/observations.json` | Canva 58 query 观测数据 |
| `docs/external-signal-pilot/curify-search-eval-58/data/observations.json` | Curify 58 query 观测数据 |
| `docs/external-signal-pilot/external-signal-5x2-query-classification-58.csv` | Query 意图分类（消费/创作） |
| `docs/external-signal-pilot/curify-gap-analysis-58.csv` | 每 query 的 Gap 严重程度（P0–P3） |
| `docs/external-signal-pilot/external-signal-5x2-summary.csv` | 平台级聚合统计 |

### 12.2 新增的文件（未覆盖任何已有文件）

| 文件 | 用途 |
|---|---|
| `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md` | 英文版主报告 |
| `docs/external-signal-pilot/CURIFY_CENTERED_EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md` | 本报告（中文版） |
| `docs/external-signal-pilot/query-tier1-distribution-58-curify-centered.csv` | 58 query Curify 视角 Tier1 分类，含 `curify_relevance` 和 `curify_gap_or_opportunity` 字段 |
| `docs/external-signal-pilot/platform-scorecard-5x58-curify-centered.csv` | 5 平台 Curify 视角信号评分表 |

**确认未覆盖：** `EXTERNAL_SIGNAL_INSIGHTS_2026-06-21.md`、`EXTERNAL_SIGNAL_INSIGHTS_2026-06-21_zh.md`、`query-tier1-distribution-58.csv`、`platform-scorecard-5x58.csv`、`curify-gap-analysis-58.csv`、`external-signal-5x2-query-classification-58.csv`、`external-signal-5x2-summary.csv`、`external-signal-5x2-comparison-58.md`。

### 12.3 已知局限

- **Canva 中文缺口：** 21/58 个 query 不可访问（全部为中文 + `chiikawa` + `genshin`）。这些 query 的创作意图信号仅能依靠 Google/Bing 标签。
- **Pinterest 结构化标签：** 40/58 个 query 因登录弹窗标签芯片为零，Pinterest 子意图洞察为定性观察而非结构化数据提取。
- **Curify 快照：** 模板目录状态反映 2026-06 采集时的情况。P0/P1 缺口可能随目录更新而改变；补充内容后应重跑 eval 验证。
- **星级评分为定性判断：** 评分基于 58-query pilot 中观察到的平台行为，非统计严格意义上的多维量化基准。

### 12.4 Curify 机会最大的 Query 示例

**最高优先级创作缺口（Curify=0，Canva=10）：**
- `phonics worksheets kindergarten` — Google 标签：Free printable、Beginning sounds、Alphabet → 构建：自然拼读工作表模板
- `meal prep weekly recipes` — Canva：Meal Planner、Weekly Recipe → 构建：每周备餐计划表模板
- `easy weeknight dinners healthy` — Canva：Recipe Card、Dinner Recipes Pinterest Pin → 构建：健康工作日晚餐食谱卡模板

**高优先级设计路由缺口（Curify<4，Canva=10）：**
- `watercolor map of europe travel destinations` — Google 标签：Map poster、Wall art、Landmarks → 构建：水彩插画地图模板
- `before after kitchen organization makeover` — Bing：Budget Kitchen Makeover、DIY Kitchen Makeover Ideas → 构建：before-after 家居整理模板
- `book lovers gift guide` — Canva：Gift Guide、Book Lover、Reader Gifts → 构建：礼品指南版式模板

**高优先级组合 query 路由缺口（Curify 4–7 条，需路由改善）：**
- `mbti marvel` — Bing：MBTI Marvel、Avengers MBTI、Disney MBTI → 改善：MBTI × IP 图表组合路由
- `bilingual flashcards for kids learning korean fruits` — Canva：Educational Flashcard、Korean Language → 改善：韩语双语闪卡专项路由
- `lunar new year red envelope graphic design` — Canva：Festive Template、Graphic Design → 改善：春节图形设计模板路由

### 12.5 各平台数据质量汇总

| 平台 | 可访问 query 数 | 主要局限 | 信号可靠性 |
|---|---|---|---|
| Google Images | 58/58 | 无 | 高 |
| Bing Images | 58/58 | 无 | 高 |
| Pinterest | 58/58 结果；18/58 有结构化标签 | 登录弹窗屏蔽标签芯片 | 中（结果多样性：高；结构化标签：低） |
| Canva | 36/58 | 中文 + 日本流行文化 = 登录拦截 | 英文 query 高；中文 query 无 |
| Curify | 53/58 正常；5/58 零结果 | P0 内容缺口 | 高（本报告的优化对象，不是信号来源） |

---

*报告生成时间：2026-06-21 | 分支：baobao/multi-intent-topic-cooccurrence | 58 个 query | 5 个平台 | Curify 为核心视角*
