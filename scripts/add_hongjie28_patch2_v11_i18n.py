"""Append i18n entries for 6 new templates from hongjie28-patch-2 (2026-06-10 push).

Templates added:
  - template-disney-character-costume-themed-grid-collection   (4x3 Disney character costume grid)
  - template-city-landmark-fridge-magnet-collection            (city-landmark fridge magnet set)
  - template-museum-gift-themed-merchandise-collection-display (art-themed merchandise display)
  - template-football-tournament-retro-infographic-poster      (tournament retro infographic)
  - template-football-themed-ball-infographic                  (circular football-ball infographic)
  - template-sport-rules-handdrawn-infographic                 (hand-drawn sport rules guide)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v11 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid].
  - EN authored for all 6 templates + ZH translations; other 8 locales
    fall back to EN and pick up native translations on the next
    i18n_autotranslate.cjs sweep.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-disney-character-costume-themed-grid-collection",
    "template-city-landmark-fridge-magnet-collection",
    "template-museum-gift-themed-merchandise-collection-display",
    "template-football-tournament-retro-infographic-poster",
    "template-football-themed-ball-infographic",
    "template-sport-rules-handdrawn-infographic",
]

EN = {
    "template-disney-character-costume-themed-grid-collection": {
        "category": "Disney Character Costume Themed Grid",
        "description": "Generate a 4x3 grid poster featuring a Disney character in 12 themed costumes — fantasy, pirate, superhero, astronaut, chef, fairy tale — each in a circular portrait against a unified color background.",
        "title": "Nano Banana Prompt: Disney Character Costume Themed Grid Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a 4x3 grid poster of any Disney character in 12 unique themed costumes (fantasy, pirate, superhero, astronaut, chef, fairy tale, etc.). Each costume rendered as a circular portrait, all set against a unified solid color background for a clean, collectible-style fan piece.",
            "who": "Suitable for Disney fan-art creators, kids-room print sellers on Etsy / Redbubble, dress-up / cosplay community content creators, parent gift-shop operators, and merch designers targeting Disney superfan personas.",
            "how": [
                "Enter the Disney character + costume range in {character_info} (e.g. 'Mickey Mouse in various fantasy and lifestyle costumes').",
                "12 circular costume portraits auto-compose in a 4x3 grid.",
                "Unified color background ties the collection together visually.",
                "Generate a Disney character costume-themed 4x3 grid poster."
            ],
            "prompts": [
                "Generate a Mickey Mouse costume-themed 4x3 grid in fantasy and lifestyle outfits.",
                "Create a Minnie Mouse adventure-themed costume grid collection.",
                "Generate a classic Disney character fairy tale and pop culture costume grid."
            ]
        }},
    },
    "template-city-landmark-fridge-magnet-collection": {
        "category": "City Landmark Fridge Magnet Collection",
        "description": "Generate a set of 4-6 fridge magnet designs featuring iconic landmarks of any city, each framed in a decorative border — clean line art with flat vibrant colors, Chinese-illustration aesthetic.",
        "title": "Nano Banana Prompt: City Landmark Fridge Magnet Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a set of 4-6 fridge magnet designs themed around any city's iconic landmarks. Each magnet features one landmark or scenic spot, framed in a decorative border (flower, cloud, or geometric shape). Style: clean line art with flat, vibrant colors and a Chinese-illustration aesthetic.",
            "who": "Suitable for city-tourism merch designers, museum gift shop operators, travel-souvenir Etsy stores, urban fashion brands, and content creators building city-themed printable collections.",
            "how": [
                "Enter the city + landmark list in {city_info} (e.g. 'Yangzhou city landmarks (Ge Garden, Slender West Lake, Five Pavilion Bridge)').",
                "Each landmark auto-renders in a unique decorative-border frame.",
                "Style is unified across all magnets in the set.",
                "Generate a 4-6 piece city landmark fridge magnet collection."
            ],
            "prompts": [
                "Generate a Yangzhou city landmarks fridge magnet set (Ge Garden, Slender West Lake, Five Pavilion Bridge).",
                "Create a Nanjing landmark enamel pin-style fridge magnet collection.",
                "Generate a Suzhou garden-themed fridge magnet design set."
            ]
        }},
    },
    "template-museum-gift-themed-merchandise-collection-display": {
        "category": "Museum Gift Themed Merchandise Display",
        "description": "Generate a clean product showcase poster for an art-themed merchandise collection — tote bags, mugs, notebooks, puzzles, apparel, accessories — all featuring iconic artwork motifs.",
        "title": "Nano Banana Prompt: Museum Gift Merchandise Display Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a stylized product-photography showcase poster for an art-themed merchandise collection. Layout arranges tote bags, mugs, notebooks, stationery, puzzles, apparel, and accessories — all featuring iconic artwork motifs (Van Gogh / Monet / Klimt / etc.) — into a clean composition suitable for museum-gift-shop catalog use.",
            "who": "Suitable for museum gift shop merchandising teams, art-themed Etsy + print-on-demand sellers, museum-collab brand managers (Uniqlo UT, MoMA Design Store), and content creators producing art-history-driven merch reels.",
            "how": [
                "Enter the artist / artwork + theme in {art_theme_info} (e.g. 'Van Gogh Starry Night themed mystery box collection').",
                "Tote bags + mugs + stationery + apparel auto-arrange into a showcase composition.",
                "Iconic motifs unify the collection visually.",
                "Generate an art-themed merchandise collection display poster."
            ],
            "prompts": [
                "Generate a Van Gogh Starry Night mystery box merchandise display poster.",
                "Create a Monet Water Lilies stationery and apparel line showcase.",
                "Generate a Museum of Fine Arts Boston Van Gogh merchandise set display."
            ]
        }},
    },
    "template-football-tournament-retro-infographic-poster": {
        "category": "Football Tournament Retro Infographic",
        "description": "Generate a vertical retro infographic poster for any football tournament — title/dates, key facts, group tables, knockout bracket, final match details, mascot illustration, vintage typography.",
        "title": "Nano Banana Prompt: Football Tournament Retro Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K retro infographic poster for any football tournament. Clear sections: tournament title + dates, key facts panel, group stage tables, knockout bracket results, final match details, tournament mascot illustration, and vintage typography across the layout for a collectible nostalgia aesthetic.",
            "who": "Suitable for football historians and retro-fan creators, sports-bar wall print sellers, vintage-football brand owners (Copa90, Classic Football Shirts), and merch designers building retro-tournament collections.",
            "how": [
                "Enter the tournament + year in {tournament_info} (e.g. '1986 FIFA World Cup Mexico infographic poster').",
                "Group tables + bracket + final auto-populate the section panels.",
                "Tournament mascot + vintage typography auto-render.",
                "Generate a vertical 8K football tournament retro infographic poster."
            ],
            "prompts": [
                "Generate a 1986 FIFA World Cup Mexico retro infographic poster.",
                "Create a 2006 FIFA World Cup Germany results chart poster.",
                "Generate a UEFA Euro 2000 tournament summary infographic."
            ]
        }},
    },
    "template-football-themed-ball-infographic": {
        "category": "Football Themed Ball Infographic",
        "description": "Generate a circular infographic styled as a football — hexagonal panels each carrying a fact or statistic, central title illustration, designed to look like a real branded ball.",
        "title": "Nano Banana Prompt: Football Themed Ball Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a circular infographic designed as a stylized football. The ball is divided into hexagonal panels, each containing a fact, statistic, or key detail about the topic. The center features a large title illustration, and the overall shape mirrors a real branded football (Adidas Telstar / Jabulani / Brazuca / Al Rihla style).",
            "who": "Suitable for football educators producing classroom posters, sports-fact content creators on Instagram / TikTok, FIFA / UEFA fan-engagement teams, and youth football academies producing intro-to-the-game collateral.",
            "how": [
                "Enter the football topic in {football_topic_info} (e.g. '2026 FIFA World Cup facts infographic').",
                "Hexagonal panels auto-populate with facts / stats / key details.",
                "Central title illustration anchors the design.",
                "Generate a circular football-shaped infographic."
            ],
            "prompts": [
                "Generate a 2026 FIFA World Cup facts ball infographic.",
                "Create a FIFA organization information ball infographic.",
                "Generate a football rules and regulations ball diagram."
            ]
        }},
    },
    "template-sport-rules-handdrawn-infographic": {
        "category": "Sport Rules Hand-Drawn Infographic",
        "description": "Generate an educational hand-drawn infographic for any sport — players, scoring, serving, fouls, court diagram, equipment — playful color sections with cartoon illustrations.",
        "title": "Nano Banana Prompt: Sport Rules Hand-Drawn Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K educational infographic poster for any sport. Playful, hand-drawn style with colorful sections covering players, scoring, serving, fouls / violations, court diagram, and equipment. Each section includes simple cartoon illustrations and accessible explanations suitable for kids or beginner learners.",
            "who": "Suitable for PE teachers and youth sports coaches, kids' sports-camp marketing teams, parent / educator content creators, sports-toy and equipment brand managers, and classroom-poster Etsy sellers.",
            "how": [
                "Enter the sport + audience angle in {sport_info} (e.g. 'Basketball rules infographic for kids').",
                "Section headers + cartoon illustrations auto-populate the layout.",
                "Court diagram + equipment guide round out the educational coverage.",
                "Generate a vertical 8K hand-drawn sport rules infographic."
            ],
            "prompts": [
                "Generate a Basketball rules infographic for kids.",
                "Create a Futsal basic rules hand-drawn poster.",
                "Generate a Badminton simplified rules guide infographic."
            ]
        }},
    },
}

ZH = {
    "template-disney-character-costume-themed-grid-collection": {
        "category": "迪士尼角色变装主题网格合集",
        "description": "为迪士尼角色生成 4x3 网格海报,12 个主题变装造型 —— 奇幻、海盗、超级英雄、宇航员、厨师、童话等 —— 圆形肖像 + 统一配色背景。",
        "title": "Nano Banana 提示词:迪士尼角色变装主题网格生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意迪士尼角色生成 4x3 网格海报,呈现 12 套独特主题变装(奇幻、海盗、超级英雄、宇航员、厨师、童话等)。每套造型以圆形肖像呈现,统一纯色背景将整组作品视觉串联,成为一件干净、收藏感强的粉丝作品。",
            "who": "适合迪士尼同人创作者、Etsy/Redbubble 儿童房印刷品售卖者、变装/角色扮演社区内容创作者、家长礼品店运营者,以及面向迪士尼超级粉丝群体的周边设计师。",
            "how": [
                "在 {character_info} 输入迪士尼角色 + 变装范围(例如:'米奇变装合集 —— 奇幻与日常风格')。",
                "12 个圆形变装肖像自动以 4x3 网格合成。",
                "统一配色背景将整组视觉串联。",
                "生成迪士尼角色变装主题 4x3 网格海报。"
            ],
            "prompts": [
                "生成米奇变装合集 4x3 网格 —— 奇幻与日常风格。",
                "生成米妮探险主题变装网格合集。",
                "生成经典迪士尼角色童话与流行文化变装网格。"
            ]
        }},
    },
    "template-city-landmark-fridge-magnet-collection": {
        "category": "城市地标冰箱贴合集",
        "description": "为任意城市生成 4-6 件地标冰箱贴设计 —— 每件呈现一处地标,配装饰边框(花形、云形或几何),清新线条 + 扁平鲜艳色 + 中式插画美学。",
        "title": "Nano Banana 提示词:城市地标冰箱贴生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意城市生成 4-6 件冰箱贴设计合集。每件冰箱贴聚焦一处地标或景点,以装饰边框(花形、云形或几何形)框定。风格:清新线条 + 扁平鲜艳配色 + 中式插画美学。",
            "who": "适合城市旅游周边设计师、博物馆礼品店运营者、旅行纪念品 Etsy 店、城市潮牌主理人,以及制作城市主题可印刷合集的内容创作者。",
            "how": [
                "在 {city_info} 输入城市 + 地标列表(例如:'扬州城市地标 —— 个园、瘦西湖、五亭桥')。",
                "每处地标自动呈现于独特装饰边框中。",
                "全组风格统一。",
                "生成 4-6 件城市地标冰箱贴合集。"
            ],
            "prompts": [
                "生成扬州城市地标冰箱贴合集(个园、瘦西湖、五亭桥)。",
                "生成南京地标景泰蓝徽章风冰箱贴合集。",
                "生成苏州园林主题冰箱贴设计合集。"
            ]
        }},
    },
    "template-museum-gift-themed-merchandise-collection-display": {
        "category": "博物馆礼品主题周边合集展示",
        "description": "为艺术主题周边合集生成清新产品展示海报 —— 帆布袋、马克杯、笔记本、拼图、服装、配饰 —— 全部融入经典艺术品图案。",
        "title": "Nano Banana 提示词:博物馆礼品周边合集展示生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成艺术主题周边合集的风格化产品摄影展示海报。布局排列帆布袋、马克杯、笔记本、文具、拼图、服装与配饰 —— 全部融入经典艺术品图案(梵高/莫奈/克里姆特等)—— 形成适合博物馆礼品店目录使用的整洁构图。",
            "who": "适合博物馆礼品店周边商品团队、艺术主题 Etsy 与 POD 售卖者、博物馆联名品牌经理(优衣库 UT、MoMA Design Store),以及制作艺术史驱动型周边短视频的内容创作者。",
            "how": [
                "在 {art_theme_info} 输入艺术家/作品 + 主题(例如:'梵高《星夜》主题盲盒合集')。",
                "帆布袋 + 马克杯 + 文具 + 服装自动排列为展示构图。",
                "经典图案将整组合集视觉串联。",
                "生成艺术主题周边合集展示海报。"
            ],
            "prompts": [
                "生成梵高《星夜》盲盒周边合集展示海报。",
                "生成莫奈睡莲文具与服装产品线展示海报。",
                "生成波士顿艺术博物馆梵高周边合集展示海报。"
            ]
        }},
    },
    "template-football-tournament-retro-infographic-poster": {
        "category": "足球赛事复古信息图海报",
        "description": "为任意足球赛事生成竖版复古信息图海报 —— 标题/日期、要点、小组赛表、淘汰赛对阵、决赛细节、吉祥物插画、复古字体。",
        "title": "Nano Banana 提示词:足球赛事复古信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意足球赛事生成 8K 竖版复古信息图海报。清晰分区呈现:赛事标题 + 日期、要点面板、小组赛表、淘汰赛对阵结果、决赛细节、赛事吉祥物插画,辅以复古字体形成收藏向怀旧美学。",
            "who": "适合足球历史研究者与复古球迷创作者、体育酒吧墙印售卖者、复古足球品牌主(Copa90、Classic Football Shirts),以及构建复古赛事合集的周边设计师。",
            "how": [
                "在 {tournament_info} 输入赛事 + 年份(例如:'1986 年墨西哥世界杯信息图海报')。",
                "小组赛表 + 对阵 + 决赛自动填充各分区。",
                "赛事吉祥物 + 复古字体自动呈现。",
                "生成 8K 竖版足球赛事复古信息图海报。"
            ],
            "prompts": [
                "生成 1986 年墨西哥世界杯复古信息图海报。",
                "生成 2006 年德国世界杯赛果图表海报。",
                "生成 2000 年欧洲杯赛事总结信息图。"
            ]
        }},
    },
    "template-football-themed-ball-infographic": {
        "category": "足球造型信息图",
        "description": "生成造型为足球的圆形信息图 —— 六边形面板各承载一条事实/数据,中心配大幅标题插画,整体仿真品牌足球。",
        "title": "Nano Banana 提示词:足球造型信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成造型为风格化足球的圆形信息图。整球以六边形面板划分,每个面板承载关于主题的一条事实、统计或要点。中心配大幅标题插画,整体仿真品牌足球(Adidas Telstar/Jabulani/Brazuca/Al Rihla 风格)。",
            "who": "适合制作课堂海报的足球教育者、Instagram/TikTok 体育趣闻内容创作者、FIFA/UEFA 球迷互动团队,以及制作足球入门素材的青训学院。",
            "how": [
                "在 {football_topic_info} 输入足球主题(例如:'2026 FIFA 世界杯趣闻信息图')。",
                "六边形面板自动填充事实/数据/要点。",
                "中心标题插画固定整体构图。",
                "生成造型为足球的圆形信息图。"
            ],
            "prompts": [
                "生成 2026 FIFA 世界杯趣闻足球造型信息图。",
                "生成 FIFA 组织资料足球造型信息图。",
                "生成足球规则与规定的球形图解。"
            ]
        }},
    },
    "template-sport-rules-handdrawn-infographic": {
        "category": "运动规则手绘信息图",
        "description": "为任意运动生成手绘风教学信息图 —— 球员、得分、发球、犯规、场地图解、装备 —— 活泼配色 + 卡通插画。",
        "title": "Nano Banana 提示词:运动规则手绘信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意运动生成 8K 竖版教学信息图海报。活泼手绘风格,彩色分区涵盖球员、得分、发球、犯规/违例、场地图解与装备。每个分区配简洁卡通插画与亲切讲解,适合儿童或入门学习者。",
            "who": "适合体育老师与青少年教练、儿童体育营销团队、家长/教育者内容创作者、运动玩具与器材品牌经理,以及课堂海报 Etsy 售卖者。",
            "how": [
                "在 {sport_info} 输入运动 + 受众角度(例如:'儿童篮球规则信息图')。",
                "分区标题 + 卡通插画自动填充布局。",
                "场地图解 + 装备指南补全教学覆盖。",
                "生成 8K 竖版手绘运动规则信息图。"
            ],
            "prompts": [
                "生成儿童篮球规则信息图。",
                "生成五人制足球基本规则手绘海报。",
                "生成羽毛球简易规则指南信息图。"
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

    print(f"\nDone. Added {total} template-locale entries ({len(template_ids)} templates x {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
