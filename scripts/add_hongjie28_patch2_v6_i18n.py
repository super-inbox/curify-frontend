"""Append i18n entries for 3 new templates from hongjie28-patch-2 (2026-06-04 cycle).

Templates added:
  - template-global-city-walkability-infographic-card    (BOILERPLATE)
  - template-sports-team-mbti-character-card-poster      (BOILERPLATE)
  - template-group-team-vertical-banner-country-poster   (subject-bound: WC group banners)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v6 to avoid collision with prior hongjie28-patch-N cycles.
  - CRITICAL: nano.json is FLAT at top level. Use doc[tid], NOT
    doc.setdefault('nano', {})[tid].
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-global-city-walkability-infographic-card",
    "template-sports-team-mbti-character-card-poster",
    "template-group-team-vertical-banner-country-poster",
]

EN = {
    "template-global-city-walkability-infographic-card": {
        "category": "Global City Walkability Infographic",
        "description": "Generate a grid-layout walkability infographic poster for any list of global cities — flags, landmark photos, walkability scores, and pedestrian-first urban design highlights.",
        "title": "Nano Banana Prompt: Global City Walkability Infographic Card Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K grid-layout walkability infographic poster for any list of global cities. Each city panel features a small national flag, bold city/country title, large realistic panoramic landmark cityscape, walkability score, and key pedestrian-first urban design highlights. Layout works for 4-9 cities per poster.",
            "who": "Suitable for urban planners, travel content creators, sustainable mobility advocates, real estate agents specializing in walkable neighborhoods, expat content publishers, and city tourism boards.",
            "how": [
                "Enter a comma-separated city list in {city_list_info} (e.g., Copenhagen Denmark, Amsterdam Netherlands, Paris France).",
                "Each city auto-populates with flag, landmark cityscape, walkability score, and key features.",
                "Grid layout adjusts based on number of cities (4-9 typical).",
                "Generate a vertical 4K walkability infographic poster."
            ],
            "prompts": [
                "Generate a walkability infographic for European capitals: Copenhagen, Amsterdam, Paris, Zurich.",
                "Create a walkable Asian metropolises poster: Tokyo, Singapore, Seoul, Hong Kong.",
                "Generate a walkable American cities infographic: NYC, San Francisco, Boston, Chicago."
            ]
        }},
    },
    "template-sports-team-mbti-character-card-poster": {
        "category": "Sports Team MBTI Character Card",
        "description": "Generate a vertical MBTI character card poster for any sports team — national flag, team crest, squad silhouette, MBTI type analysis, playing-style breakdown, and tactical character traits.",
        "title": "Nano Banana Prompt: Sports Team MBTI Character Card Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K MBTI character card poster for any sports team. Top header carries the team name in oversized bold typography paired with national flag/crest. Middle visual zone features squad silhouette / action player illustration / tactical formation graphic. Bottom panels list MBTI type explanation, playing-style traits, and signature tactical character.",
            "who": "Suitable for sports content creators, MBTI fandom communities, fantasy league publishers, sports merchandise designers, and brands producing team-archetype visual content.",
            "how": [
                "Enter the team name + MBTI type in {team_mbti_info} (e.g., Brazil National Football Team ESFP, Spain INTP).",
                "National flag/crest + squad silhouette auto-compose in the visual zone.",
                "MBTI traits + playing-style breakdown auto-populate the lower panels.",
                "Generate a vertical 4K sports team MBTI character card poster."
            ],
            "prompts": [
                "Generate a Brazil National Football Team ESFP MBTI character card.",
                "Create an Argentina National Football Team ESTJ MBTI poster.",
                "Generate a Spain National Football Team INTP tiki-taka MBTI poster."
            ]
        }},
    },
    "template-group-team-vertical-banner-country-poster": {
        "category": "World Cup Group Banner Poster",
        "description": "Generate a vertical group-stage banner poster for any World Cup or international tournament group — pennant-style flags, country crests, captain portraits, and group narratives.",
        "title": "Nano Banana Prompt: World Cup Group Banner Country Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K group-stage banner poster for any World Cup or international tournament group. The image splits into equal vertical pointed-bottom pennant banners — one per participating nation. Each pennant top displays the country's national flag and coat of arms; middle features captain portrait and signature visual; bottom carries tournament info and group identifier.",
            "who": "Suitable for World Cup content creators, soccer publishers, sports betting / fantasy league products, fan communities producing matchday graphics, and brands publishing tournament-themed visuals.",
            "how": [
                "Enter the tournament group in {group_countries_info} (e.g., 2026 World Cup Group A: Mexico, Poland, Saudi Arabia, Argentina).",
                "Vertical pennant banners auto-populate per nation with flag, crest, captain.",
                "Tournament header + group identifier render at the top.",
                "Generate a vertical 4K group-stage banner poster."
            ],
            "prompts": [
                "Generate a 2026 World Cup Group A banner: Mexico, Poland, Saudi Arabia, Argentina.",
                "Create a 2026 World Cup Group C banner with Brazil, Senegal, Iran, Australia.",
                "Generate a Euro Cup Group C banner: Portugal, Jamaica, Uzbekistan, Colombia."
            ]
        }},
    },
}

ZH = {
    "template-global-city-walkability-infographic-card": {
        "category": "全球城市步行友好信息图",
        "description": "为任意全球城市列表生成网格布局的步行友好性信息图海报 —— 国旗、地标照片、步行评分、行人优先城市设计亮点。",
        "title": "Nano Banana 提示词：全球城市步行友好信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意全球城市列表生成 4K 竖版网格步行友好性信息图。每个城市面板包含小型国旗、加粗的城市/国家标题、写实城市全景地标、步行评分以及行人优先的城市设计亮点。布局适配 4-9 个城市。",
            "who": "适合城市规划师、旅行内容创作者、可持续交通倡导者、专注步行社区的房产经纪人、海外内容发布者，以及城市旅游局。",
            "how": [
                "在 {city_list_info} 输入逗号分隔的城市列表（例如：Copenhagen Denmark、Amsterdam Netherlands、Paris France）。",
                "每个城市自动生成国旗、地标、步行评分与关键特性。",
                "根据城市数量（通常 4-9 个）自动调整网格布局。",
                "生成 4K 竖版步行友好性信息图海报。"
            ],
            "prompts": [
                "生成欧洲首都步行友好信息图：哥本哈根、阿姆斯特丹、巴黎、苏黎世。",
                "生成步行友好亚洲大都市海报：东京、新加坡、首尔、香港。",
                "生成步行友好美国城市信息图：纽约、旧金山、波士顿、芝加哥。"
            ]
        }},
    },
    "template-sports-team-mbti-character-card-poster": {
        "category": "球队 MBTI 性格卡海报",
        "description": "为任意体育球队生成竖版 MBTI 性格卡海报 —— 国旗、队徽、阵容剪影、MBTI 类型解读、踢法风格拆解、战术性格特征。",
        "title": "Nano Banana 提示词：球队 MBTI 性格卡海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意体育球队生成 4K 竖版 MBTI 性格卡海报。顶部超大粗体队名搭配国旗/队徽。中央视觉区呈现阵容剪影/球员动作插画/战术阵型图。底部面板列出 MBTI 类型解读、踢法风格特征与标志性战术性格。",
            "who": "适合体育内容创作者、MBTI 粉丝社群、梦幻联盟发布方、运动周边设计师，以及制作球队原型视觉内容的品牌方。",
            "how": [
                "在 {team_mbti_info} 输入队名 + MBTI 类型（例如：Brazil National Football Team ESFP、Spain INTP）。",
                "国旗/队徽 + 阵容剪影自动合成至视觉区。",
                "MBTI 特质 + 踢法风格自动填入底部面板。",
                "生成 4K 竖版球队 MBTI 性格卡海报。"
            ],
            "prompts": [
                "生成巴西国家足球队 ESFP MBTI 性格卡。",
                "生成阿根廷国家足球队 ESTJ MBTI 海报。",
                "生成西班牙国家足球队 INTP 传控风 MBTI 海报。"
            ]
        }},
    },
    "template-group-team-vertical-banner-country-poster": {
        "category": "世界杯小组横幅海报",
        "description": "为任意世界杯或国际赛事小组生成竖版小组横幅海报 —— 锦旗式国旗、国家队徽、队长肖像与小组叙事。",
        "title": "Nano Banana 提示词：世界杯小组横幅海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意世界杯或国际赛事小组生成 4K 竖版小组横幅海报。画面分割为等宽竖向尖底锦旗式横幅 —— 每个参赛国家一条横幅。每条锦旗顶部呈现国旗与国徽；中部为队长肖像与标志性视觉；底部带有赛事信息与小组标识。",
            "who": "适合世界杯内容创作者、足球发布者、体育投注/梦幻联盟产品、制作比赛日图形的球迷社群，以及发布赛事主题视觉的品牌方。",
            "how": [
                "在 {group_countries_info} 输入赛事小组（例如：2026 World Cup Group A: Mexico, Poland, Saudi Arabia, Argentina）。",
                "竖向锦旗按国家自动生成，含国旗、队徽、队长。",
                "赛事抬头 + 小组标识在顶部呈现。",
                "生成 4K 竖版小组横幅海报。"
            ],
            "prompts": [
                "生成 2026 世界杯 A 组横幅：墨西哥、波兰、沙特阿拉伯、阿根廷。",
                "生成 2026 世界杯 C 组横幅：巴西、塞内加尔、伊朗、澳大利亚。",
                "生成欧洲杯 C 组横幅：葡萄牙、牙买加、乌兹别克斯坦、哥伦比亚。"
            ]
        }},
    },
}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}

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
