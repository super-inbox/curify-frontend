"""Append i18n entries for 5 new templates from hongjie28-patch-2 (2026-06-14 push).

Templates added:
  - template-vintage-musical-instrument-technical-illustration-poster
  - template-pro-athlete-stat-infographic-poster
  - template-sports-league-qb-team-order-infographic
  - template-high-saturation-sports-equipment-segment-card
  - template-two-column-sports-comparison-infographic

Patch-2 JSON had the usual trailing-comma malformation; the 5 new templates were
extracted via brace-tracking from the cleaned remote, parameters dict→list
normalized, rank_score=90 backfilled, and topics[] assigned at append time.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-vintage-musical-instrument-technical-illustration-poster",
    "template-pro-athlete-stat-infographic-poster",
    "template-sports-league-qb-team-order-infographic",
    "template-high-saturation-sports-equipment-segment-card",
    "template-two-column-sports-comparison-infographic",
]

EN = {
    "template-vintage-musical-instrument-technical-illustration-poster": {
        "category": "Vintage Musical Instrument Technical Illustration Poster",
        "description": "Generate a vintage technical-drawing-style illustration poster of musical instruments — patent-blueprint aesthetic, cross-section cutaways, mechanical part callouts, and aged paper texture.",
        "title": "Nano Banana Prompt: Vintage Musical Instrument Technical Illustration Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage technical-drawing-style illustration poster of musical instruments. Patent-blueprint aesthetic — sepia / aged-parchment background, detailed line-art rendering of instrument bodies with cross-section cutaways, mechanical part callouts (string anchors, valve mechanisms, bridge details, fingering positions), labeled measurement annotations, and a vintage serif title banner. Designed to feel like a 1900s industrial-design study or a museum-quality scientific plate.",
            "who": "Suitable for music school decor designers, vintage poster collectors, music-store owners producing wall art, classical-music content creators, and instrument-craft enthusiasts.",
            "how": [
                "Enter the instrument(s) + arrangement focus in {instrument_info} (e.g. 'Grand Piano + Pipe Organ technical study').",
                "Aged paper texture + sepia tone auto-render.",
                "Cross-section cutaways and part callouts auto-compose per instrument.",
                "Generate a vintage 8K technical-illustration poster."
            ],
            "prompts": [
                "Generate a Solo Violin technical drawing poster.",
                "Create a Grand Piano + Pipe Organ cross-section study.",
                "Generate a String + Brass Orchestra section technical plate."
            ]
        }},
    },
    "template-pro-athlete-stat-infographic-poster": {
        "category": "Pro Athlete Stat Infographic Poster",
        "description": "Generate a vertical career-statistics infographic poster for any pro athlete — hand-drawn sketch portrait centerpiece surrounded by modular data panels: career averages, honors list, technique breakdown, season trends, and signature quote.",
        "title": "Nano Banana Prompt: Pro Athlete Stat Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K career-statistics infographic poster for any pro athlete. Hand-drawn pencil-sketch full-body action portrait centerpiece, surrounded by modular data panels: career-average bar/pie charts, heat map, honors & trophy list, technique-motion breakdown with annotated callouts, season-trend line chart, milestone records, key single-game highlights, advanced efficiency metrics, and a signature athlete quote text box. Unified team primary-color scheme, clean white background, official sports-media data-visualization layout. Print-ready collectible quality.",
            "who": "Suitable for sports content creators, fan communities producing collectibles, sports-media designers needing player profile pages, fantasy-sports league recap posters, and youth-coaching reference materials.",
            "how": [
                "Enter the athlete + sport + team / event focus in {athlete_info} (e.g. 'Stephen Curry, NBA basketball, Golden State Warriors career stats').",
                "Pencil-sketch action portrait auto-renders.",
                "Modular stat / honor / technique / trend panels auto-compose around the portrait.",
                "Generate a vertical 8K pro-athlete stat infographic poster."
            ],
            "prompts": [
                "Generate a Stephen Curry NBA basketball career-stats infographic poster.",
                "Create a Novak Djokovic tennis serve-technique stats poster.",
                "Generate a Michael Phelps Olympic swimming career-data long infographic."
            ]
        }},
    },
    "template-sports-league-qb-team-order-infographic": {
        "category": "Sports League Team Order Infographic",
        "description": "Generate a vertical infographic ranking all teams of a sports league conference by founding year — vertical timeline column with team logo, founding year badge, home city, and quick-stat strip per team.",
        "title": "Nano Banana Prompt: Sports League Team Order Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K infographic ranking all teams of a sports league conference (NFL AFC/NFC, NBA East/West, NHL East/West, MLB AL/NL, etc.) by founding year — oldest at top, newest at bottom. Vertical timeline spine with: team logo + nickname, founding-year badge, home-city + stadium label, primary-color stripe, and a quick-stat strip (championships / playoff appearances / division titles). Clean league-style typography with conference color accents.",
            "who": "Suitable for sports trivia content creators, league-history educators, fantasy-sports content designers, sports-bar wall-art producers, and longtime fans curating historical reference posters.",
            "how": [
                "Enter the league + conference in {league_conference_info} (e.g. 'NFL AFC teams ranked by founding year').",
                "Vertical timeline spine + team-by-team rows auto-render.",
                "Logo + founding-year badge + city + quick-stats auto-compose per team.",
                "Generate a vertical 8K league-team-order infographic poster."
            ],
            "prompts": [
                "Generate an NFL AFC teams-by-founding-year infographic.",
                "Create an NBA Western Conference founding-year ranking poster.",
                "Generate an NHL Eastern Conference team-order history infographic."
            ]
        }},
    },
    "template-high-saturation-sports-equipment-segment-card": {
        "category": "High-Saturation Sports Equipment Segment Card",
        "description": "Generate a high-saturation collectible-style segment card of sports equipment — bold flat-color backgrounds with 2-4 equipment categories cleanly divided into color-blocked segments, each labeled with sport name and signature gear illustration.",
        "title": "Nano Banana Prompt: High-Saturation Sports Equipment Segment Card Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a square-format 8K high-saturation collectible card of sports equipment. Background divided into 2-4 vivid color-blocked segments (e.g. tennis-green / volleyball-orange / soccer-red / baseball-blue), each segment containing a centered illustration of the sport's signature gear (rackets, balls, gloves, bats) rendered in glossy flat-color style with subtle drop shadows. Sport-name label at the bottom of each segment in bold sans-serif. Premium trading-card aesthetic, minimal whitespace, instantly readable composition.",
            "who": "Suitable for sports-merch designers building sticker-pack or trading-card collections, kids' sports educators producing flash-cards, sporting-goods retailers running social-media campaigns, and fan-community gift-card creators.",
            "how": [
                "Enter the sports set in {sports_equipment_info} (e.g. 'tennis + volleyball + soccer + baseball equipment').",
                "Vivid color-blocked segments auto-render per sport.",
                "Signature equipment illustration auto-composes per segment.",
                "Generate a square 8K high-saturation sports equipment segment card."
            ],
            "prompts": [
                "Generate a basketball + tennis + badminton 3-segment equipment card.",
                "Create a tennis + volleyball + soccer + baseball 4-segment card.",
                "Generate a hockey + lacrosse + cricket 3-segment equipment card."
            ]
        }},
    },
    "template-two-column-sports-comparison-infographic": {
        "category": "Two-Column Sports Comparison Infographic",
        "description": "Generate a vertical 2-column comparison infographic for sports topics — side-by-side equipment / technique / category compare with shared attribute rows, color-coded columns, and a clear VS divider.",
        "title": "Nano Banana Prompt: Two-Column Sports Comparison Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K 2-column sports comparison infographic. Two color-coded columns separated by a bold central VS divider, each column featuring a hero illustration at top + attribute / spec rows aligned across the divider for instant side-by-side reading (e.g. material, weight, price tier, skill ceiling, durability, target use). Bottom verdict / recommendation banner. Clean magazine-editorial typography, designed for buyer guides + technique compares.",
            "who": "Suitable for sports buyer-guide content creators, sporting-goods reviewers, coaches producing technique-compare teaching materials, e-commerce product page designers, and fitness blogger comparison content.",
            "how": [
                "Enter the two items to compare in {sports_comparison_info} (e.g. 'cheap vs expensive badminton rackets material & performance').",
                "Two color-coded columns + central VS divider auto-render.",
                "Side-by-side attribute rows align automatically.",
                "Generate a vertical 8K 2-column sports comparison infographic."
            ],
            "prompts": [
                "Generate a cheap vs expensive badminton racket material comparison infographic.",
                "Create an indoor vs outdoor badminton equipment differences poster.",
                "Generate a beginner vs pro tennis racket spec comparison infographic."
            ]
        }},
    },
}

ZH = {
    "template-vintage-musical-instrument-technical-illustration-poster": {
        "category": "复古乐器技术插画海报",
        "description": "生成复古技术绘图风格的乐器插画海报——专利蓝图美学、剖面切割、机械部件标注、做旧纸张质感。",
        "title": "Nano Banana 提示词：复古乐器技术插画海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 复古技术绘图风格乐器插画海报。专利蓝图美学——做旧羊皮纸/棕褐色背景，精细线稿渲染乐器主体并带有剖面切割、机械部件标注（弦支点、阀门机构、桥架细节、指法位置）、标注尺寸、复古衬线标题横幅。整体如同一份 1900 年代工业设计研究或博物馆级科学图版。",
            "who": "适合音乐学校装饰设计师、复古海报收藏家、生产墙面艺术的乐器店店主、古典音乐内容创作者，以及乐器手作爱好者。",
            "how": [
                "在 {instrument_info} 中输入乐器+编排重点（如\"三角钢琴+管风琴技术研究\"）。",
                "自动渲染做旧纸张质感与棕褐色调。",
                "每件乐器自动排版剖面切割与部件标注。",
                "生成复古 8K 技术插画海报。"
            ],
            "prompts": [
                "生成独奏小提琴技术绘图海报。",
                "创建三角钢琴+管风琴剖面研究图。",
                "生成弦乐+铜管乐团声部技术图版。"
            ]
        }},
    },
    "template-pro-athlete-stat-infographic-poster": {
        "category": "职业运动员数据信息长图海报",
        "description": "生成任意职业运动员的竖版生涯数据信息长图海报——手绘素描肖像居中，外围模块化数据面板涵盖生涯均值、荣誉清单、技术分解、赛季趋势与签名语录。",
        "title": "Nano Banana 提示词：职业运动员数据信息长图海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 职业运动员生涯数据信息长图海报。中心是手绘铅笔素描风格的全身比赛动作肖像，外围环绕模块化数据面板：生涯均值柱状图/饼图、热区图、荣誉与奖杯清单、技术动作分解带注释、赛季趋势折线图、里程碑记录、关键单场表现、进阶效率指标、运动员经典语录文本框。统一队伍主题配色、纯白背景、官方体育媒体数据可视化排版，印刷级收藏品质。",
            "who": "适合体育内容创作者、生产收藏品的球迷社群、需要球员档案页的体育媒体设计师、梦幻体育联赛回顾海报、青少年教练参考材料。",
            "how": [
                "在 {athlete_info} 中输入运动员+运动项目+所属队伍/项目细分（如\"斯蒂芬·库里，NBA篮球，金州勇士球员生涯数据技术解析\"）。",
                "自动渲染铅笔素描动作肖像。",
                "数据/荣誉/技术/趋势模块面板自动围绕肖像排版。",
                "生成竖版 8K 职业运动员数据信息长图海报。"
            ],
            "prompts": [
                "生成斯蒂芬·库里 NBA 篮球生涯数据信息长图海报。",
                "创建德约科维奇网球发球技术生涯战绩海报。",
                "生成迈克尔·菲尔普斯奥运游泳生涯数据信息长图。"
            ]
        }},
    },
    "template-sports-league-qb-team-order-infographic": {
        "category": "体育联盟球队成立年份排序信息图",
        "description": "生成将体育联盟某分区所有球队按成立年份排序的竖版信息图——竖向时间线主轴，每支球队配队徽、成立年份徽章、主场城市及核心数据条。",
        "title": "Nano Banana 提示词：体育联盟球队成立年份排序信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 信息图，将体育联盟某分区（NFL 美东/美西、NBA 东/西部、NHL 东/西部、MLB 美联/国联等）所有球队按成立年份排序——最老球队居顶、最新居底。竖向时间线主轴上每行包含：队徽+昵称、成立年份徽章、主场城市+球场名、主队色色带、核心数据条（总冠军/季后赛次数/分区冠军）。简洁联盟风字体配以分区配色。",
            "who": "适合体育冷知识内容创作者、联盟历史科普者、梦幻体育内容设计师、体育主题餐吧墙面艺术生产商，以及整理历史参考海报的老球迷。",
            "how": [
                "在 {league_conference_info} 中输入联盟+分区（如\"NFL 美东球队按成立年份排序\"）。",
                "自动渲染竖向时间线主轴与逐队行。",
                "每支球队自动排版队徽+成立年份徽章+城市+核心数据。",
                "生成竖版 8K 联盟球队成立年份排序信息图海报。"
            ],
            "prompts": [
                "生成 NFL 美东球队成立年份信息图。",
                "创建 NBA 西部分区球队成立年份排序海报。",
                "生成 NHL 东部分区球队历史排序信息图。"
            ]
        }},
    },
    "template-high-saturation-sports-equipment-segment-card": {
        "category": "高饱和运动器材分段卡",
        "description": "生成高饱和度收藏卡风格的运动器材卡——大胆扁平色块背景，2-4 类运动器材按色块分段，每段配运动名称与标志装备插画。",
        "title": "Nano Banana 提示词：高饱和运动器材分段卡生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成方形 8K 高饱和度收藏卡风格运动器材卡。背景分为 2-4 个鲜艳色块（如网球绿/排球橙/足球红/棒球蓝），每个色块居中一件该运动标志装备插画（球拍、球、手套、球棒），采用光泽扁平色风格配微妙投影。每个分段底部以粗体无衬线字体标注运动名称。高级球星卡美学、留白极少、画面信息一眼可读。",
            "who": "适合制作贴纸包/球星卡合集的运动周边设计师、生产学习闪卡的儿童运动教育者、运营社媒活动的体育用品零售商，以及球迷社群礼品卡创作者。",
            "how": [
                "在 {sports_equipment_info} 中输入运动集合（如\"网球+排球+足球+棒球器材\"）。",
                "每项运动自动渲染鲜艳色块。",
                "每个分段自动排版标志装备插画。",
                "生成方形 8K 高饱和运动器材分段卡。"
            ],
            "prompts": [
                "生成篮球+网球+羽毛球三分段器材卡。",
                "创建网球+排球+足球+棒球四分段卡。",
                "生成冰球+长曲棍球+板球三分段器材卡。"
            ]
        }},
    },
    "template-two-column-sports-comparison-infographic": {
        "category": "双列运动对比信息图",
        "description": "生成竖版双列对比信息图用于运动主题——装备/技术/品类两两并排，共享属性行，色彩区分双列，居中清晰 VS 分隔。",
        "title": "Nano Banana 提示词：双列运动对比信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 双列运动对比信息图。两个色彩区分的纵列由居中粗体 VS 标志分隔，每列顶部一张主图，下方属性/规格行跨越分隔对齐以便一眼并读（如材质、重量、价位、技术上限、耐用性、目标用途）。底部一条结论/推荐横幅。简洁杂志编辑级字体，专为选购指南+技术对比设计。",
            "who": "适合运动选购指南内容创作者、体育用品评测人、生产技术对比教学材料的教练、电商商品详情页设计师，以及健身博主对比内容创作。",
            "how": [
                "在 {sports_comparison_info} 中输入两个对比对象（如\"低价 VS 高端羽毛球拍材质与性能\"）。",
                "自动渲染色彩区分的两列与居中 VS 分隔。",
                "属性行自动跨列对齐。",
                "生成竖版 8K 双列运动对比信息图。"
            ],
            "prompts": [
                "生成低价 VS 高端羽毛球拍材质对比信息图。",
                "创建室内 VS 室外羽毛球装备差异海报。",
                "生成初学者 VS 专业网球拍参数对比信息图。"
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
