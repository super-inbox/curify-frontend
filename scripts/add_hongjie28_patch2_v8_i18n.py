"""Append i18n entries for 4 new templates from hongjie28-patch-2 (2026-06-07 push).

Templates added:
  - template-world-cup-debut-team-preview-poster   (vertical sports debut preview)
  - template-science-myth-bust-infographic-poster  ("SCIENCE LORE" myth-vs-truth poster)
  - template-brand-ip-mascot-design-board          (brand mascot character design sheet)
  - template-sports-iconic-event-analysis-poster   (horizontal cinematic event retrospective)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v8 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid], NOT doc.setdefault('nano', {})[tid].
  - EN authored for all 4 templates + ZH translations; other 8 locales
    fall back to EN and pick up native translations on the next
    i18n_autotranslate.cjs sweep.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-world-cup-debut-team-preview-poster",
    "template-science-myth-bust-infographic-poster",
    "template-brand-ip-mascot-design-board",
    "template-sports-iconic-event-analysis-poster",
]

EN = {
    "template-world-cup-debut-team-preview-poster": {
        "category": "World Cup Debut Team Preview",
        "description": "Generate a vertical sports preview poster for any World Cup debut team — bold textured headline, central squad visual, key player highlights, and tournament-debut narrative.",
        "title": "Nano Banana Prompt: World Cup Debut Team Preview Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K dramatic commercial sports poster for any World Cup debut team. Top section features a bold textured headline title; central main visual layers squad photography with tactical formation diagrams; lower panels carry key player highlights, qualifying-path stats, and the debut-tournament narrative arc.",
            "who": "Suitable for sports content creators, World Cup fandoms covering underdogs, betting and fantasy-league publishers, national-team merch designers, and editorial outlets producing debut-team explainers.",
            "how": [
                "Enter the debut team name + narrative angle in {team_info} (e.g. 'Uzbekistan Historic Debut — Central Asia's first World Cup squad').",
                "Squad photo + tactical diagram auto-compose in the visual zone.",
                "Player highlights + qualifying-path stats auto-populate the panels.",
                "Generate a vertical 8K debut-team preview poster."
            ],
            "prompts": [
                "Generate an Uzbekistan World Cup 2026 historic debut preview poster.",
                "Create a Curaçao giant-killers debut preview with squad highlights.",
                "Generate a Cabo Verde first World Cup appearance preview poster."
            ]
        }},
    },
    "template-science-myth-bust-infographic-poster": {
        "category": "Science Myth-Busting Infographic",
        "description": "Generate a vertical 'SCIENCE LORE' myth-busting poster — red MYTH headline at top, debunking science explanation in the middle, citation-style proof panels at the bottom.",
        "title": "Nano Banana Prompt: Science Myth-Bust Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K educational poster under the 'SCIENCE LORE' series. Top section carries the 'MYTH' headline in a red rectangular box with a kawaii illustration of the misconception. Middle section explains the actual science with diagrams, charts, or process illustrations. Bottom carries source citations and a 'TRUTH' summary chip.",
            "who": "Suitable for science-communication accounts, classroom poster sellers, school librarians, parent/educator content creators, museum gift-shop product lines, and STEM-focused educational publishers.",
            "how": [
                "Enter the myth + correction angle in {myth_info} (e.g. 'Goldfish have a 3-second memory — actually months').",
                "MYTH headline + kawaii misconception illustration auto-render in the top box.",
                "Science explanation + diagrams auto-populate the middle section.",
                "Generate a vertical 8K 'SCIENCE LORE' poster."
            ],
            "prompts": [
                "Generate a SCIENCE LORE poster on the 3-second goldfish memory myth.",
                "Create a SCIENCE LORE infographic on the 'we only use 10% of our brain' myth.",
                "Generate a SCIENCE LORE poster on the 'lightning never strikes twice' myth."
            ]
        }},
    },
    "template-brand-ip-mascot-design-board": {
        "category": "Brand IP Mascot Design Board",
        "description": "Generate a clean white-background brand mascot character style guide — hero mascot, color palette, pose sheet, expression set, brand voice notes — all unified under one IP identity.",
        "title": "Nano Banana Prompt: Brand IP Mascot Design Board Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates an 8K clean white-background character style guide poster for any brand. Layout divides into clear sections: top-left main mascot hero shot with brand title, top-right color palette swatches, middle pose sheet with 4-6 character poses, bottom-left expression / emoticon set, bottom-right brand voice + tone notes. All sections unified under the brand's IP identity.",
            "who": "Suitable for in-house brand teams launching mascots, agencies pitching mascot redesigns, indie brand owners building character IP, kids-product brand managers, and IP-licensing intermediaries presenting mascot families.",
            "how": [
                "Enter the brand name + mascot character description + main color in {brand_info} (e.g. 'Curify AI Curi — friendly AI character in purple gradient').",
                "Hero mascot shot + color palette + pose sheet + expression set auto-compose.",
                "Brand voice notes auto-populate the lower-right panel.",
                "Generate an 8K white-background mascot design board poster."
            ],
            "prompts": [
                "Generate a Curify AI Curi mascot design board in purple gradient with friendly AI character.",
                "Create a Spotify Soni mascot design board in green gradient with music-themed character.",
                "Generate a LEGO Brixo mascot design board with primary-color block character."
            ]
        }},
    },
    "template-sports-iconic-event-analysis-poster": {
        "category": "Iconic Sports Event Analysis Poster",
        "description": "Generate a horizontal cinematic sports infographic poster for any iconic moment — archival match photos, tactical diagrams, quote blocks, timeline panels, side-by-side comparisons, multi-angle controversy analysis.",
        "title": "Nano Banana Prompt: Iconic Sports Event Analysis Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal 8K cinematic sports infographic poster themed around an iconic event. Large bold dual-language headline at the top; centerpiece composites archival match photos, key moment stills, or tactical diagrams; additional sections carry quote blocks, timeline / evolution graphics, side-by-side comparisons, and match stats panels. Style: gritty vintage textured aesthetic with aged paper overlays, gold metallic accents, and stadium spotlight lighting.",
            "who": "Suitable for sports historians, retrospective documentary marketers, sports-bar wall print sellers, fantasy-league commentators, and sports-bottling cultural-events publishers covering the long arc of iconic matches.",
            "how": [
                "Enter the iconic event + layout theme in {event_info} (e.g. 'Maradona Hand of God 1986 Legacy Retrospective' or 'Hand of God & VAR Evolution Timeline').",
                "Archival match photo composite + tactical diagram auto-render at the center.",
                "Quote blocks, timeline graphics, comparison panels auto-populate around the centerpiece.",
                "Generate a horizontal 8K cinematic sports analysis poster."
            ],
            "prompts": [
                "Generate a Hand of God 1986 Legacy Retrospective horizontal analysis poster.",
                "Create a Hand of God vs Goal of the Century side-by-side comparison poster.",
                "Generate a Zidane Headbutt 2006 Final Multi-Angle Controversy Analysis poster."
            ]
        }},
    },
}

ZH = {
    "template-world-cup-debut-team-preview-poster": {
        "category": "世界杯首秀球队预览海报",
        "description": "为任意世界杯首秀球队生成竖版体育预览海报 —— 粗体纹理标题、中央阵容视觉、关键球员亮点、首秀征程叙事。",
        "title": "Nano Banana 提示词：世界杯首秀球队预览海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意世界杯首秀球队生成 8K 竖版戏剧化商业体育海报。顶部呈现粗体纹理标题；中央主视觉将阵容摄影与战术阵型图层叠合成；下方面板呈现关键球员亮点、晋级路径数据，以及首秀征程叙事弧线。",
            "who": "适合体育内容创作者、关注黑马球队的世界杯粉丝、博彩/梦幻联盟发布方、国家队周边设计师，以及制作首秀球队解析的编辑媒体。",
            "how": [
                "在 {team_info} 输入首秀球队名 + 叙事角度（例如：'乌兹别克斯坦历史首秀 —— 中亚首支世界杯阵容'）。",
                "阵容照 + 战术图自动合成至视觉区。",
                "球员亮点 + 晋级路径数据自动填充面板。",
                "生成 8K 竖版首秀球队预览海报。"
            ],
            "prompts": [
                "生成乌兹别克斯坦 2026 世界杯历史首秀预览海报。",
                "生成库拉索黑马首秀预览,含阵容亮点。",
                "生成佛得角首次世界杯预览海报。"
            ]
        }},
    },
    "template-science-myth-bust-infographic-poster": {
        "category": "科学辟谣信息图海报",
        "description": "生成'科学辟谣'系列竖版海报 —— 顶部红色 MYTH 标题、中部辟谣科学解释、底部引用式证据面板。",
        "title": "Nano Banana 提示词：科学辟谣信息图海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成'SCIENCE LORE'系列 8K 竖版科普海报。顶部红色矩形框内呈现'MYTH'标题与误解的卡通插画。中部以图表、流程图或过程插图解释真实科学。底部呈现来源引用和'TRUTH'摘要标签。",
            "who": "适合科普账号、课堂海报售卖者、学校图书馆员、家长/教育者内容创作者、博物馆礼品店产品线,以及 STEM 教育发布方。",
            "how": [
                "在 {myth_info} 输入误解 + 纠正角度（例如：'金鱼只有 3 秒记忆 —— 实际可达数月'）。",
                "MYTH 标题 + 卡通误解插画自动呈现在顶部框中。",
                "科学解释 + 图表自动填充中部。",
                "生成 8K 竖版'SCIENCE LORE'海报。"
            ],
            "prompts": [
                "生成关于'金鱼 3 秒记忆'误解的 SCIENCE LORE 海报。",
                "生成关于'人类只用 10% 大脑'误解的 SCIENCE LORE 信息图。",
                "生成关于'闪电不会击中同一处两次'误解的 SCIENCE LORE 海报。"
            ]
        }},
    },
    "template-brand-ip-mascot-design-board": {
        "category": "品牌 IP 吉祥物设计板",
        "description": "生成白底品牌吉祥物角色风格指南 —— 主吉祥物、配色系、姿态合集、表情包、品牌语调说明,统一于品牌 IP 标识下。",
        "title": "Nano Banana 提示词：品牌 IP 吉祥物设计板生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成任意品牌 8K 白底角色风格指南海报。布局清晰分区：左上主吉祥物海报与品牌标题、右上配色色板、中部 4-6 个姿态合集、左下表情/小图标合集、右下品牌语调说明。各区块统一于品牌 IP 标识下。",
            "who": "适合上线吉祥物的品牌内部团队、提案吉祥物重设的设计代理、构建角色 IP 的独立品牌主、儿童产品品牌经理,以及呈现吉祥物家族的 IP 授权方。",
            "how": [
                "在 {brand_info} 输入品牌名 + 吉祥物角色描述 + 主色（例如：'Curify AI Curi —— 紫色渐变友好型 AI 角色'）。",
                "主吉祥物 + 配色色板 + 姿态合集 + 表情包自动合成。",
                "品牌语调说明自动填充右下面板。",
                "生成 8K 白底吉祥物设计板海报。"
            ],
            "prompts": [
                "生成 Curify AI Curi 吉祥物设计板,紫色渐变友好型 AI 角色。",
                "生成 Spotify Soni 吉祥物设计板,绿色渐变音乐主题角色。",
                "生成 LEGO Brixo 吉祥物设计板,原色积木角色。"
            ]
        }},
    },
    "template-sports-iconic-event-analysis-poster": {
        "category": "经典体育事件分析海报",
        "description": "为任意经典体育时刻生成横版电影感体育信息图海报 —— 历史比赛照、战术图、引用块、时间轴面板、对比并排、多角度争议分析。",
        "title": "Nano Banana 提示词：经典体育事件分析海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成围绕经典体育事件的 8K 横版电影感信息图海报。顶部大幅双语粗体标题；中心区合成历史比赛照、关键时刻定格,或战术图;周围分区呈现引用块、时间轴/演变图、对比并排,以及比赛数据面板。风格：粗粝复古纹理质感配旧纸覆叠、金属金色点缀、球场聚光灯打光。",
            "who": "适合体育历史研究者、回顾类纪录片营销方、体育酒吧墙印售卖者、梦幻联盟解说员,以及覆盖经典比赛长弧线的体育文化事件发布方。",
            "how": [
                "在 {event_info} 输入经典事件 + 布局主题（例如：'马拉多纳上帝之手 1986 传奇回顾'或'上帝之手与 VAR 演变时间轴'）。",
                "历史比赛照合成 + 战术图自动呈现于中心。",
                "引用块、时间轴图形、对比面板自动填充周围。",
                "生成 8K 横版电影感体育分析海报。"
            ],
            "prompts": [
                "生成'上帝之手 1986 传奇回顾'横版分析海报。",
                "生成'上帝之手 vs 世纪进球'并排对比海报。",
                "生成'齐达内 2006 决赛头槌多角度争议分析'海报。"
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

    print(f"\nDone. Added {total} template-locale entries ({len(template_ids)} templates × {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
