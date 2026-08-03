#!/usr/bin/env python3
"""Expand VerticalPageSchema coverage — author content.attributes/vertical for
high-impression (GSC) pages across education / merch / mbti verticals.
Template-level for education+merch (applies to all examples); example-level for
mbti (per-character). Injects into messages/{en,zh}/nano.json. Idempotent."""
import json, sys

# ---- EN ----
EN_TEMPLATE = {
 "template-english-confusing-word-pair-educational-poster": {
   "attributes": {"grade_band":"All levels","age_range":"10+","subject":"English","skill":"Vocabulary","resource_type":"Educational poster","duration_min":"10 min","difficulty":"Beginner–Intermediate","language_mode":"Bilingual EN–ZH"},
   "vertical": {
     "learning_objective":"Tell apart commonly confused English word pairs (e.g. affect vs. effect) and use each correctly, with a memorable example for every pair.",
     "includes":"One illustrated poster: a confusing word pair, a plain-language definition of each word, example sentences, and a quick mnemonic tip.",
     "background":"Confusable word pairs are one of the most frequent sources of writing errors for English learners; pairing each with a picture and an example sentence anchors the distinction in memory."}
 },
 "template-chinese-verb-opposite-infographic": {
   "attributes": {"grade_band":"Intermediate","age_range":"8+","subject":"Chinese (Mandarin)","skill":"Vocabulary","resource_type":"Infographic","duration_min":"10 min","difficulty":"Intermediate","language_mode":"Bilingual EN–ZH"},
   "vertical": {
     "learning_objective":"Learn pairs of opposite Chinese verbs (antonyms) with their pinyin and meanings, building active vocabulary through contrast.",
     "includes":"One infographic: pairs of opposite verbs shown with characters, pinyin, an English gloss, and a small illustration for each.",
     "background":"Teaching verbs in opposite pairs (open/close, buy/sell) uses contrast to make each word easier to recall than learning them in isolation."}
 },
 "template-weather-education-infographic": {
   "attributes": {"grade_band":"Elementary","age_range":"6–10","subject":"Science","skill":"Reading & vocabulary","resource_type":"Infographic","duration_min":"10 min","difficulty":"Beginner","language_mode":"Bilingual EN–ZH"},
   "vertical": {
     "learning_objective":"Recognize common weather types and the basic science behind them, with the vocabulary to describe the weather.",
     "includes":"One infographic: illustrated weather types with labels, a short explanation of each, and key vocabulary.",
     "background":"Weather is a concrete, everyday science topic that pairs naturally with picture-based vocabulary for young learners."}
 },
 "template-original-character-sticker-pack": {
   "attributes": {"product_type":"Die-cut sticker pack","material":"Vinyl","process":"Die-cut print","dimensions":"Sheet + individual cuts","print_spec":"300 DPI, transparent PNG","color_profile":"CMYK-ready","use_case":"IP / merch"},
   "vertical": {
     "cultural_background":"Original-character sticker packs turn a mascot or persona into a collectible set — the core unit of the 谷子 (goods) and creator-merch economy.",
     "design_requirements":"A consistent character model across poses, clean silhouettes for die-cutting, bold readable expressions, and a transparent background.",
     "manufacturing_notes":"Export as high-resolution transparent PNGs; add a cut line and bleed for die-cut printing and print-on-demand fulfillment."}
 },
}
EN_EXAMPLE = {
 "template-mbti-nba": {
   "template-mbti-nba-michaeljordan": {
     "attributes": {"type_code":"ESTP","type_nickname":"The Entrepreneur","dimensions":"Extraverted · Sensing · Thinking · Perceiving","subject_kind":"Character personality card"},
     "vertical": {
       "traits":"Michael Jordan is often typed as an ESTP — fiercely competitive, present-focused, and at his best under pressure, reading the game and acting decisively in the moment.",
       "strengths":"Relentless drive, clutch decision-making, and the ability to raise his level when the stakes are highest — ESTP boldness turned into an unmatched will to win.",
       "weaknesses":"That same intensity could read as impatience or a hard edge with teammates who didn't match his competitive standard.",
       "communication":"Direct and challenging — he led by example and by daring others to meet him, not by soft reassurance.",
       "relationships":"Loyal to a tight circle who earned his respect through effort and performance.",
       "career":"The ultimate competitor's arena — a stage that rewards nerve, improvisation, and raw will, which is peak ESTP territory.",
       "compatibility":"Works best alongside steady, structured types who provide the framework his in-the-moment brilliance can build on."}
   }
 }
}

# ---- ZH ----
ZH_TEMPLATE = {
 "template-english-confusing-word-pair-educational-poster": {
   "attributes": {"grade_band":"全阶段","age_range":"10+","subject":"英语","skill":"词汇","resource_type":"教学海报","duration_min":"10 分钟","difficulty":"初级—中级","language_mode":"中英双语"},
   "vertical": {
     "learning_objective":"区分英语中常见易混词对（如 affect 与 effect），并能正确使用，每对都配一个好记的例子。",
     "includes":"一张配图海报：一对易混词、每个词的通俗释义、例句，以及一个速记小贴士。",
     "background":"易混词对是英语学习者写作出错最常见的来源之一；为每对配上图画和例句，能把区别牢牢印在记忆里。"}
 },
 "template-chinese-verb-opposite-infographic": {
   "attributes": {"grade_band":"中级","age_range":"8+","subject":"中文（普通话）","skill":"词汇","resource_type":"信息图","duration_min":"10 分钟","difficulty":"中级","language_mode":"中英双语"},
   "vertical": {
     "learning_objective":"学习成对的反义中文动词及其拼音和释义，通过对比积累主动词汇。",
     "includes":"一张信息图：成对的反义动词，配汉字、拼音、英文释义和每个词的小插图。",
     "background":"以反义成对（开/关、买/卖）来教动词，利用对比让每个词比孤立记忆更容易记住。"}
 },
 "template-weather-education-infographic": {
   "attributes": {"grade_band":"小学","age_range":"6–10","subject":"科学","skill":"阅读与词汇","resource_type":"信息图","duration_min":"10 分钟","difficulty":"初级","language_mode":"中英双语"},
   "vertical": {
     "learning_objective":"认识常见天气类型及其背后的基本科学原理，并掌握描述天气的词汇。",
     "includes":"一张信息图：配图的天气类型及标注、每种天气的简短说明和关键词汇。",
     "background":"天气是贴近生活、具象的科学主题，非常适合与图画词汇结合，供低龄学习者使用。"}
 },
 "template-original-character-sticker-pack": {
   "attributes": {"product_type":"刀模贴纸包","material":"乙烯基","process":"刀模印刷","dimensions":"整张 + 单枚裁切","print_spec":"300 DPI，透明 PNG","color_profile":"可 CMYK 印刷","use_case":"IP / 文创"},
   "vertical": {
     "cultural_background":"原创角色贴纸包把一个吉祥物或人设变成可收藏的一套——正是谷子经济与创作者周边的核心单元。",
     "design_requirements":"多姿势下角色形象保持一致、便于刀模的干净轮廓、醒目易读的表情，以及透明背景。",
     "manufacturing_notes":"导出高分辨率透明 PNG；为刀模印刷与按需生产加上裁切线与出血。"}
 },
}
ZH_EXAMPLE = {
 "template-mbti-nba": {
   "template-mbti-nba-michaeljordan": {
     "attributes": {"type_code":"ESTP","type_nickname":"企业家","dimensions":"外向 · 实感 · 思考 · 知觉","subject_kind":"角色人格卡"},
     "vertical": {
       "traits":"迈克尔·乔丹常被归为 ESTP——极度好胜、专注当下，越是高压越出色，能在瞬间读懂比赛并果断出手。",
       "strengths":"永不停歇的驱动力、关键时刻的决断，以及在最紧要关头把状态拉满的能力——ESTP 的果敢化作无与伦比的求胜欲。",
       "weaknesses":"同样的强度，有时会让达不到其竞争标准的队友感到不耐烦或过于强硬。",
       "communication":"直接而具挑战性——他以身作则、以激将带动他人，而非柔性的安抚。",
       "relationships":"对以努力和表现赢得他尊重的小圈子极为忠诚。",
       "career":"极致竞争者的舞台——奖励胆识、临场应变与纯粹意志，正是 ESTP 的巅峰领域。",
       "compatibility":"与沉稳、有结构的类型搭配最佳，他们能为其临场的天赋提供可依托的框架。"}
   }
 }
}

def apply(path, tmpl, exm):
    d = json.load(open(path, encoding="utf-8")); n = 0
    for tid, block in tmpl.items():
        node = d.get(tid)
        if not node: print(f"  MISSING template {tid} in {path}"); continue
        c = node.setdefault("content", {})
        c["attributes"] = block["attributes"]; c["vertical"] = block["vertical"]; n += 1
    for tid, exs in exm.items():
        node = d.get(tid)
        if not node: print(f"  MISSING template {tid} in {path}"); continue
        c = node.setdefault("content", {}); examples = c.setdefault("examples", {})
        for eid, block in exs.items():
            examples[eid] = {"attributes": block["attributes"], "vertical": block["vertical"]}; n += 1
    open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f"  enriched {n} nodes in {path}")

base = sys.argv[1]
apply(f"{base}/messages/en/nano.json", EN_TEMPLATE, EN_EXAMPLE)
apply(f"{base}/messages/zh/nano.json", ZH_TEMPLATE, ZH_EXAMPLE)
