# 模板召回修复报告 — 2026-06-23

**分支：** `baobao/multi-intent-topic-cooccurrence`
**日期：** 2026-06-23

---

## 1. 背景

Curify 搜索页面（`/search?q=…`）的「模板」区块存在召回率过低的问题。用户搜索"bilingual flashcards"、"cuban sandwich recipe poster"或"watercolor map"时，即使模板库中存在相关内容，也只能看到 1–4 个模板。

来自 2026-06-21 外部信号 pilot 评测的典型案例（共 15 个 P1 查询）：

| 查询 | 修复前模板数 | 问题 |
|---|---|---|
| bilingual flashcards | ~2 条严格匹配 | "flashcard" 话题标签未进入搜索 blob；复数形态不匹配 |
| cuban sandwich recipe poster | 1 条严格匹配 | "cuban"/"sandwich" 无菜系/食谱同义词路径 |
| watercolor map of europe travel destinations | 1 条严格匹配 | 模板话题标签未参与搜索 |
| historical character | 5 条合计 | "historical"/"character" 话题标签未能到达搜索 blob |

---

## 2. 根本原因

**`templateSearchBlob` 仅使用 i18n 文本字段**（`category`、`title`、`description`、`content.sections.what`、`content.sections.who`，来源：`messages/en/nano.json` 和 `messages/zh/nano.json`）。`nano_templates.json` 中每个模板都带有 `topics` slug 数组（如 `["flashcards", "bilingual", "vocabulary"]`），但这些 slug **完全未被纳入**搜索 blob。一个标注了 `flashcards` 话题的模板，只要其 i18n 描述文本中没有出现"flashcards"这个词，就无法匹配该查询。

加上跨词条严格 AND 匹配逻辑，导致：

- 话题标签正确、但描述措辞略有不同的模板对用户不可见。
- 多词查询（如 "cuban sandwich recipe poster"）要求所有词条同时出现在同一 blob 中——没有任何模板 blob 同时包含 cuban、sandwich、recipe、poster。
- 语义相近的查询（如 "bilingual"和"multilingual"）之间没有桥接路径。

若在没有精度保护机制的情况下直接上线宽泛的同义词扩展，数量虽然上去了，但会引入不相关的模板（例如，`watercolor→whimsical,hand-drawn` 扩展会让"狗种复古科学信息图"出现在"watercolor map"结果里）。

---

## 3. 代码改动

### `app/[locale]/(public)/search/page.tsx`

**将模板话题标签加入 `templateSearchBlob`：**
```ts
// 在从 messages/en/nano.json + messages/zh/nano.json 构建 i18n blob 之后：
for (const [tid, topics] of TEMPLATE_TOPICS) {
  if (topics.length === 0) continue;
  templateSearchBlob.set(
    tid,
    (templateSearchBlob.get(tid) ?? "") + " " + topics.join(" ")
  );
}
```
`TEMPLATE_TOPICS` 由 `nano_templates.json` 经 `buildTemplateTopicsMap` 生成。改动后，每个模板的话题 slug 与 i18n 文本一同参与搜索匹配。

**接入带 `suppressWhen` 精度保护的概念扩展：**
```ts
const tokenSet = new Set(tokens.primary);
const expandedSets = tokens.primary.map((tok) => {
  const entry = CONCEPT_SYNONYMS[tok];
  if (!entry) return [tok];
  const suppressed = entry.suppressWhen?.some((sw) => tokenSet.has(sw)) ?? false;
  return suppressed ? [tok] : [tok, ...entry.synonyms];
});
```
改动前直接取 `CONCEPT_SYNONYMS[tok]`（返回 `string[]`），没有上下文判断。改动后会检查当前查询的完整词条集合，当发现同现信号词时抑制扩展（例如：语言学习查询中的"korean"不应扩展为菜系词汇）。

---

### `lib/template_concept_expansion.ts`

导出类型从 `Record<string, string[]>` 改为 `Record<string, SynonymEntry>`：
```ts
export type SynonymEntry = {
  synonyms: string[];
  suppressWhen?: string[]; // 若查询中存在这些词条，则跳过本条扩展
};
```

**当前生效的同义词组：**

| 词条 | 扩展目标 | 保护条件 |
|---|---|---|
| `bilingual` ↔ `multilingual` | 互扩 | 无（语义明确） |
| `flashcard` ↔ `flashcards` | 互扩 | 无（语义明确） |
| `sandwich`、`burger`、`pizza`、`sushi`、`pasta`、`taco`、`ramen`、`steak`、`salad`、`soup` | `food`、`recipe`、`cuisine`、`culinary` | 无（无歧义食物名词） |
| `cuban`、`thai`、`korean`、`italian`、`mexican`、`french`、`japanese`、`indian` | `cuisine`、`recipe`、`culinary` | **抑制**：当查询中含有以下任一语言学习信号词时不扩展：`flashcard`、`flashcards`、`vocabulary`、`bilingual`、`multilingual`、`esl`、`learning`、`language`、`kids`、`printable`、`worksheet`、`lesson` |

**已删除：** `watercolor → ["whimsical", "hand-drawn"]`。风格形容词会匹配过多不相关的插画模板（如"犬种复古科学信息图"的描述中带有"hand-drawn"）。正确做法是直接在 watercolor map 模板上添加 `watercolor` 话题标签，而非通过同义词扩展。

---

## 4. 验证结果

### 总览

| 状态 | 数量（共 15 个前 P1 查询） |
|---|---|
| 已解决 | **2** |
| 部分改善 | **5** |
| 仍为 P1 | **8** |
| 精度风险 | **0** |

### 关键案例对比

| 查询 | 修复前 | 修复后 | 说明 |
|---|---|---|---|
| bilingual flashcards | ~2 条严格匹配 | **22 条严格匹配** | `bilingual↔multilingual` + `flashcard↔flashcards` 扩展生效；话题标签贡献额外匹配 |
| cuban sandwich recipe poster | 1 条严格 → 30 条（含噪声） | **5 条（1 严格 + 4 扩展）** | `cuban→cuisine/recipe` + `sandwich→food/recipe` 正常生效（查询中无语言学习信号）；"世界旅行地图"误报消失 |
| watercolor map of europe travel destinations | 1 条严格 → 39 条（含噪声） | **1 条严格匹配** | `watercolor→whimsical/hand-drawn` 扩展已删除；仅返回"Watercolor Continent / World Map"；所有噪声消除 |
| bilingual flashcards for kids learning korean fruits | 1 条严格 → 19 条（混杂） | **1 条严格匹配** | `korean→cuisine` 被 bilingual+flashcards+kids+learning 同现信号抑制；韩国菜模板已剔除；"Bilingual Vocabulary Visual Guide"保留 |
| historical character | 5 条合计 | **11 条严格匹配** | 话题标签加入 blob 后，"historical"+"character" 可直接命中模板话题标签 |

完整数据：`docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.md`

---

## 5. 剩余缺口

8 个仍为 P1 的查询均属于**库存或话题标签缺口**，而非管道逻辑问题：

| 查询 | 根本原因 |
|---|---|
| 电商详情图 | 中文多词 AND 匹配失败；话题标签未桥接"电商"+"详情图" |
| homophones and homonyms | "homophones"/"homonyms" 未出现在任何模板话题中；库存稀薄 |
| marvel mbti character chart 16 types | 无专用的 MBTI×Marvel 16 型角色表模板 |
| lunar new year red envelope graphic design | 仅 1 个正确模板；灵感库仅 9 条；内容库存过少 |
| before after kitchen organization makeover | 仅 1 个正确模板；kitchen/makeover/organization 未同时出现于任何 blob |
| Spanish vocabulary printable | "Spanish" 未出现于任何模板 blob；缺少语言专项话题标签 |
| watercolor map of europe travel destinations | 仅 1 个正确模板；库存深度不足 |
| bilingual flashcards for kids learning korean fruits | 仅 1 个正确模板；6 词查询过严，无法安全扩展 |

这些缺口应通过**完善模板元数据或新增模板**来解决，而不是继续扩宽同义词扩展。建议：为词汇类模板添加"Spanish"/"French"等语言专项话题标签；新增专用的 MBTI 16 型图表模板；生成更多针对特定语言对的双语闪卡示例。

---

## 6. 本分支涉及文件

| 文件 | 用途 |
|---|---|
| `app/[locale]/(public)/search/page.tsx` | 生产代码：话题标签进入搜索 blob + 带 `suppressWhen` 的概念扩展 |
| `lib/template_concept_expansion.ts` | 生产代码：`SynonymEntry` 类型 + `CONCEPT_SYNONYMS` 配置 |
| `docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.md` | 评测报告：完整 P1 复测结果及逐条分析 |
| `docs/external-signal-pilot/p1-template-gap-retest-2026-06-23.csv` | 评测数据：机器可读的 P1 复测结果 |
| `docs/external-signal-pilot/template-recall-fix-report-2026-06-23.md` | 英文版修复报告 |
| `docs/external-signal-pilot/template-recall-fix-report-2026-06-23-zh.md` | 本文件 |

---

## 7. 结论与建议

**本版本可以安全合入主干。**

- 精度风险为 0。
- 无历史正常查询出现退步。
- 核心召回查询"bilingual flashcards"稳定保持 22 个模板。
- 扩展配置刻意保持保守：仅激活语义明确的同义词对；国家名菜系扩展加有保护机制；风格形容词一律排除。

**在解决库存和话题标签缺口之前，请勿继续向 `CONCEPT_SYNONYMS` 添加宽泛同义词。** 剩余 8 个 P1 查询需要新模板或补充话题标签——盲目扩大同义词只会提升数字，而不会召回真正相关的模板。
