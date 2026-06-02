"""Append i18n entries for 3 new templates from hongjie28-patch-4 + hongjie28-patch-5 (2026-06-02 cycle).

Templates added:
  - template-football-tournament-group-stage-bracket-infographic (patch-4)
  - template-international-event-promotional-poster (patch-4)
  - template-player-vintage-stats-card-poster (patch-5)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v5 to avoid collision with prior hongjie28-patch-N cycles.
  - CRITICAL: nano.json structure is FLAT (template ids at top level).
    Use doc[tid] = ..., NOT doc.setdefault('nano', {})[tid] = ...
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-football-tournament-group-stage-bracket-infographic",
    "template-international-event-promotional-poster",
    "template-player-vintage-stats-card-poster",
]

EN = {
    "template-football-tournament-group-stage-bracket-infographic": {
        "category": "Football Tournament Fixture Infographic",
        "description": "Generate an official tournament fixture infographic — group stage tables + knockout bracket diagram + host region + trophy graphic for any international football tournament.",
        "title": "Nano Banana Prompt: Football Tournament Group Stage & Bracket Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K official football tournament fixture infographic for {topic}. The top header carries tournament name, trophy graphic, host region and competition dates. Eight color-blocked group tables list participating national teams; the lower section visualizes the knockout phase bracket with round names, match dates and final venue. The bottom band features host country flags and the tournament slogan.",
            "who": "Suitable for sports content creators, football editorial designers, sports betting / fantasy league products, fan communities producing matchday graphics, and brands publishing tournament-themed visuals.",
            "how": [
                "Enter the tournament in {topic} (e.g., 2026 FIFA World Cup, UEFA Euro 2028, Copa América 2026).",
                "Eight group tables auto-populate with participating national teams, color-blocked per group.",
                "Knockout bracket draws automatically with round names + venue + dates.",
                "Generate a vertical 4K official tournament fixture infographic."
            ],
            "prompts": [
                "Generate a 2026 FIFA World Cup group stage and bracket infographic.",
                "Create a UEFA Euro 2028 fixture infographic with all 24 teams.",
                "Generate a FIFA Women's World Cup 2027 expanded 32-team bracket infographic."
            ]
        }},
    },
    "template-international-event-promotional-poster": {
        "category": "International Event Promotional Poster",
        "description": "Generate an official promotional poster for any international event — sport, music festival, art season, Olympic Games — with bold street-paint typography, host city landmark scenery, and event branding.",
        "title": "Nano Banana Prompt: International Event Promotional Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K official promotional poster for any international event titled {topic}. An extra-large distressed white headline font occupies the top; the center features a photorealistic host-city landmark + event-iconic graphic (trophy / instrument / art piece). A green-red brush-stroke banner mid-lower carries a custom event slogan; the bottom section has the event schedule with calendar icon and official hashtag. Colorful confetti fragments scatter across the canvas.",
            "who": "Suitable for tournament organizers, music festival promoters, sports leagues, cultural event teams, sponsorship designers, and content creators covering major international events.",
            "how": [
                "Enter the event name in {topic} (e.g., 2026 FIFA World Cup, Milano Cortina 2026 Winter Olympics, Coachella 2026).",
                "Host-city landmark scenery + event-iconic graphic auto-compose center.",
                "Brush-stroke banner takes the event slogan; bottom section auto-populates dates + hashtag.",
                "Generate a vertical 4K street-paint promotional event poster."
            ],
            "prompts": [
                "Generate a 2026 FIFA World Cup promotional poster.",
                "Create a Milano Cortina 2026 Winter Olympics official poster.",
                "Generate a Coachella 2026 music festival promotional poster."
            ]
        }},
    },
    "template-player-vintage-stats-card-poster": {
        "category": "Vintage Player Stats Card Poster",
        "description": "Generate an antique golden-framed football player biography poster — portrait + career stats + trophy honours + ability ratings in classic vintage print aesthetic.",
        "title": "Nano Banana Prompt: Vintage Football Player Stats Card Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K vintage football player biography poster for {topic}. An ornate golden decorative border frames a central portrait of the player in national team jersey. Left vertical panel holds jersey number, nickname, club history, and career stats; right vertical panel carries national team data, trophy honours, and ability ratings. The bottom features the national flag, signature quote, and tournament slogan; a small match-action inset sits bottom-left. Dark navy textured vintage background with subtle stadium glow.",
            "who": "Suitable for soccer content creators, sports memorabilia designers, football fan communities, World Cup tribute publishers, and brands producing legacy-themed sports merchandise.",
            "how": [
                "Enter player name + national team in {topic} (e.g., Lionel Messi Argentina, Kylian Mbappé France, Marta Brazil).",
                "Portrait auto-composes inside the ornate golden frame.",
                "Left + right panels auto-populate stats / honours / ratings.",
                "Generate a vertical 4K antique vintage player biography poster."
            ],
            "prompts": [
                "Generate a Lionel Messi Argentina vintage stats card poster.",
                "Create a Kylian Mbappé France vintage stats card poster.",
                "Generate a Marta Brazil vintage stats card poster with her six FIFA Player of the Year wins."
            ]
        }},
    },
}

ZH = {
    "template-football-tournament-group-stage-bracket-infographic": {
        "category": "足球赛事赛程信息图",
        "description": "生成官方足球赛事赛程信息图 —— 小组赛分组表、淘汰赛对阵图、主办地与奖杯标识，适用于任何国际足球赛事。",
        "title": "Nano Banana 提示词：足球赛事小组赛与对阵信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版官方足球赛事赛程信息图，主题为 {topic}。顶部呈现赛事名称、奖杯图形、主办地区与比赛日期。八个彩色分组表列出各组参赛国家队；下方淘汰赛阶段对阵图标注每轮名称、比赛日期与决赛场地。底部以主办国国旗与赛事口号收尾。",
            "who": "适合体育内容创作者、足球编辑设计师、体育投注 / 梦幻联盟产品、制作比赛日图形的球迷社群，以及发布赛事主题视觉的品牌方。",
            "how": [
                "在 {topic} 输入赛事名称（例如：2026 FIFA 世界杯、欧洲杯 2028、美洲杯 2026）。",
                "八个小组自动生成参赛国家队列表，按组别使用不同色块。",
                "淘汰赛对阵图自动绘制每轮名称、场地、日期。",
                "生成 4K 竖版官方赛事赛程信息图。"
            ],
            "prompts": [
                "生成 2026 FIFA 世界杯小组赛与淘汰赛对阵信息图。",
                "生成欧洲杯 2028 完整 24 队赛程信息图。",
                "生成 FIFA 女足世界杯 2027 扩充至 32 队的对阵信息图。"
            ]
        }},
    },
    "template-international-event-promotional-poster": {
        "category": "国际赛事/活动宣传海报",
        "description": "为任意国际赛事/活动生成官方宣传海报 —— 体育、音乐节、艺术季、奥运 —— 大胆涂鸦字体、主办城市地标场景、赛事品牌元素。",
        "title": "Nano Banana 提示词：国际赛事/活动宣传海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版国际赛事/活动官方宣传海报，主题为 {topic}。顶部超大做旧白色粗体字体；中央为主办城市地标 + 赛事标志性图形（奖杯 / 乐器 / 艺术品）的写实合成。中下部绿红涂鸦笔触横幅承载自定义口号；底部呈现活动日程、日历图标与官方话题标签。整体散布彩色纸屑碎片。",
            "who": "适合赛事主办方、音乐节策划方、体育联盟、文化活动团队、赞助设计师，以及覆盖重大国际活动的内容创作者。",
            "how": [
                "在 {topic} 输入活动名称（例如：2026 FIFA 世界杯、米兰科尔蒂纳 2026 冬奥会、Coachella 2026）。",
                "主办城市地标 + 活动标志性图形自动合成中央。",
                "涂鸦笔触横幅承载活动口号；底部自动填入日期与话题标签。",
                "生成 4K 竖版涂鸦风格活动宣传海报。"
            ],
            "prompts": [
                "生成 2026 FIFA 世界杯宣传海报。",
                "生成米兰科尔蒂纳 2026 冬奥会官方海报。",
                "生成 Coachella 2026 音乐节宣传海报。"
            ]
        }},
    },
    "template-player-vintage-stats-card-poster": {
        "category": "复古球员数据卡海报",
        "description": "生成古典金框足球球员传记海报 —— 肖像 + 职业数据 + 奖项荣誉 + 能力评分，复古印刷美学呈现。",
        "title": "Nano Banana 提示词：复古足球球员数据卡海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版复古足球球员传记海报，主题为 {topic}。华丽的金色装饰边框围绕中央国家队球衣肖像；左侧竖栏呈现球衣号码、绰号、俱乐部经历与职业数据；右侧竖栏展示国家队数据、奖项荣誉与能力评分；底部为国旗、签名格言与赛事口号，左下角嵌入小幅比赛画面。深海军蓝复古纹理背景，配以微弱球场光影。",
            "who": "适合足球内容创作者、体育周边设计师、足球球迷社群、世界杯致敬出版方，以及制作传承主题体育周边的品牌方。",
            "how": [
                "在 {topic} 输入球员姓名 + 国家队（例如：Lionel Messi Argentina、Kylian Mbappé France、Marta Brazil）。",
                "肖像自动嵌入华丽金框中央。",
                "左右两栏自动填充数据 / 荣誉 / 评分。",
                "生成 4K 竖版古典复古球员传记海报。"
            ],
            "prompts": [
                "生成 Lionel Messi 阿根廷复古数据卡海报。",
                "生成 Kylian Mbappé 法国复古数据卡海报。",
                "生成 Marta 巴西复古数据卡海报，含她六次 FIFA 年度最佳球员荣誉。"
            ]
        }},
    },
}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}

    # Sanity-check coverage
    for locale, content in by_locale.items():
        missing = [tid for tid in template_ids if tid not in content]
        if missing:
            raise SystemExit(f"FAIL: locale {locale} missing {missing}")

    # CRITICAL: nano.json is FLAT at top level (memory feedback_daily_drop_i18n.md).
    total = 0
    for locale in LOCALES:
        p = MESSAGES / locale / "nano.json"
        if not p.exists():
            print(f"  SKIP (missing): {p}")
            continue
        doc = json.loads(p.read_text(encoding="utf-8"))
        added = 0
        for tid in template_ids:
            if tid in doc:
                print(f"  ({locale}) already has {tid}, skipping")
                continue
            doc[tid] = by_locale[locale][tid]
            added += 1
            total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added} template entries")

    print(f"\nDone. Added {total} template-locale entries ({len(template_ids)} templates × {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
