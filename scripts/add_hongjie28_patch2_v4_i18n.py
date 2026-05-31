"""Append i18n entries for the 3 new templates from hongjie28-patch-2 (2026-05-31 cycle).

Templates added:
  - template-world-cup-team-sticker-poster
  - template-yellow-themed-illustrated-journey-infographic
  - template-sports-trophy-infographic

Per memory feedback_daily_drop_i18n.md, the file is suffixed _v4 to avoid the
historical add_hongjie28_patch2_i18n.py file (different templates, April cycle).

EN + ZH hand-written. Other 8 locales use EN copy as fallback.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-world-cup-team-sticker-poster",
    "template-yellow-themed-illustrated-journey-infographic",
    "template-sports-trophy-infographic",
]

# ── EN ──────────────────────────────────────────────────────────────────────
EN = {
    "template-world-cup-team-sticker-poster": {
        "category": "World Cup Team Sticker Poster",
        "description": "Generate a vibrant, sticker-collage poster celebrating a national football team — players, jerseys, badges, and World Cup glory moments arranged as a fan-art-style spread.",
        "title": "Nano Banana Prompt: World Cup Team Sticker Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K sticker-style poster celebrating a national football team. Star players, kit jerseys, team badges, trophy moments, and iconic match-day imagery are arranged as overlapping fan-art stickers across a bold backdrop in the team's colors. The composition feels like a passionate supporter's locker — collectible, energetic, and World-Cup-themed.",
            "who": "Suitable for World Cup content creators, sports merchandise designers, football fan communities, Pinterest creators, sports bloggers, and brands producing tournament-themed visuals.",
            "how": [
                "Enter a national football team in {topic} (e.g., Brazil National Team, Argentina National Team).",
                "Star players, jerseys, badges, and trophy moments auto-populate as overlapping stickers.",
                "Background takes the team's primary colors with subtle World Cup motifs.",
                "Generate a vertical 4K fan-art sticker-collage poster."
            ],
            "prompts": [
                "Generate a 'Brazil National Team' World Cup sticker poster with five-time-champion legacy.",
                "Create an 'Argentina National Team' sticker poster celebrating the 2022 World Cup win.",
                "Generate a 'France National Team' World Cup sticker poster with Mbappé and Griezmann."
            ]
        }},
    },
    "template-yellow-themed-illustrated-journey-infographic": {
        "category": "Yellow Journey Infographic",
        "description": "Create a warm, yellow-themed illustrated infographic mapping any journey or process step-by-step — perfect for self-help, productivity, learning, and lifestyle guides.",
        "title": "Nano Banana Prompt: Yellow-Themed Illustrated Journey Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K illustrated infographic mapping any journey or process across a yellow-toned canvas. A winding path or staged layout connects 5-8 illustrated milestone scenes, each with a short label and a soft hand-drawn vignette. The mustard/honey/cream palette gives the piece a warm, optimistic, self-help feel that reads well on both web and print.",
            "who": "Suitable for self-help authors, productivity bloggers, lifestyle creators, course designers, educators teaching process-driven content, and brands producing aspirational visuals.",
            "how": [
                "Enter a journey or process topic in {topic} (e.g., Healthy Lifestyle Journey, Time Management Mastery).",
                "5-8 illustrated milestones auto-populate along a winding path or staged composition.",
                "Yellow / mustard / honey / cream palette unifies the scene; soft hand-drawn vignettes accent each step.",
                "Generate a vertical 4K warm-yellow illustrated journey infographic."
            ],
            "prompts": [
                "Generate a 'Healthy Lifestyle Journey' yellow-themed illustrated infographic.",
                "Create a 'Time Management Mastery' yellow journey infographic with 6 milestone steps.",
                "Generate a 'Sustainable Living Guide' yellow-toned illustrated path infographic."
            ]
        }},
    },
    "template-sports-trophy-infographic": {
        "category": "Sports Trophy Infographic",
        "description": "Generate a clean infographic spotlighting a sports trophy — its design, history, weight, materials, past winners, and iconic moments — in a museum-card style.",
        "title": "Nano Banana Prompt: Sports Trophy Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 4K infographic profiling a sports trophy. The hero is a hyperrealistic render of the trophy itself, accompanied by labeled callouts for materials, dimensions, weight, and design provenance; a sidebar lists past winners and championship years; a band along the bottom highlights iconic moments and quotes from winning teams or athletes. Style reads like a sports museum exhibit card.",
            "who": "Suitable for sports content creators, trophy and memorabilia collectors, sports museums, sports merch brands, Pinterest creators, and sports-history writers.",
            "how": [
                "Enter a trophy name in {topic} (e.g., FIFA World Cup Trophy, Olympic Gold Medal, UEFA Champions League Trophy).",
                "A hyperrealistic trophy render takes center; callouts label materials, weight, designer.",
                "Sidebar auto-populates past winners and championship years.",
                "Generate a vertical 4K sports trophy museum-card infographic."
            ],
            "prompts": [
                "Generate a 'FIFA World Cup Trophy' infographic with materials, weight, and past winners.",
                "Create a 'UEFA Champions League Trophy' museum-style infographic with iconic finals moments.",
                "Generate an 'Olympic Gold Medal' infographic spanning Summer and Winter Games history."
            ]
        }},
    },
}

# ── ZH ──────────────────────────────────────────────────────────────────────
ZH = {
    "template-world-cup-team-sticker-poster": {
        "category": "世界杯球队贴纸海报",
        "description": "生成一张富有激情的国家队世界杯贴纸海报 —— 球星、球衣、队徽、奖杯瞬间，以球迷艺术拼贴风格集中呈现。",
        "title": "Nano Banana 提示词：世界杯球队贴纸海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版国家队主题贴纸拼贴海报。明星球员、球衣、队徽、奖杯瞬间和经典比赛画面以重叠贴纸风格分布在球队主色调背景上。整体效果像球迷储物柜：收藏感强、能量饱满、世界杯氛围浓厚。",
            "who": "适合世界杯内容创作者、运动商品设计师、足球粉丝社群、Pinterest 创作者、体育博主以及输出赛事主题视觉的品牌方。",
            "how": [
                "在 {topic} 输入国家队名（例如：Brazil National Team、Argentina National Team）。",
                "明星球员、球衣、队徽、奖杯瞬间将自动以贴纸形式叠加生成。",
                "背景采用该队主色调，并加入低调的世界杯元素。",
                "生成 4K 竖版球迷艺术贴纸拼贴海报。"
            ],
            "prompts": [
                "生成『巴西国家队』世界杯贴纸海报，突出五冠王传承。",
                "生成『阿根廷国家队』世界杯贴纸海报，致敬 2022 年夺冠。",
                "生成『法国国家队』世界杯贴纸海报，包含姆巴佩、格列兹曼等元素。"
            ]
        }},
    },
    "template-yellow-themed-illustrated-journey-infographic": {
        "category": "黄色调旅程信息图",
        "description": "生成温暖的黄色调插画风信息图，分步呈现任意旅程或流程 —— 适用于自我提升、效率、学习、生活方式类指南。",
        "title": "Nano Banana 提示词：黄色调插画旅程信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版插画风信息图，将任意旅程或流程绘制在黄色调画布上。一条蜿蜒的路径或分段构图串联 5-8 个里程碑插画场景，每个节点配有简短标签和手绘小插图。芥末黄／蜂蜜色／米色为主调，呈现温暖、积极、自我提升的氛围，网页与印刷皆宜。",
            "who": "适合自助类作者、效率博主、生活方式创作者、课程设计师、流程类教学的教育者，以及输出向往感视觉的品牌方。",
            "how": [
                "在 {topic} 输入旅程或流程主题（例如：Healthy Lifestyle Journey、Time Management Mastery）。",
                "5-8 个里程碑插画将沿弯路或分段构图自动生成。",
                "黄色／芥末／蜂蜜／米色调统一画面；手绘小插图点缀每一步。",
                "生成 4K 竖版暖黄色调插画旅程信息图。"
            ],
            "prompts": [
                "生成『健康生活旅程』黄色调插画信息图。",
                "生成『时间管理精通之路』黄色旅程信息图，含 6 个里程碑。",
                "生成『可持续生活指南』黄色调插画路径信息图。"
            ]
        }},
    },
    "template-sports-trophy-infographic": {
        "category": "体育奖杯信息图",
        "description": "生成介绍体育奖杯的信息图 —— 设计、历史、重量、材质、历届冠军、经典瞬间，以博物馆展卡风格呈现。",
        "title": "Nano Banana 提示词：体育奖杯信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 4K 竖版体育奖杯信息图。主体是奖杯本身的超写实渲染，旁边标注材质、尺寸、重量、设计师等信息；侧边栏列出历届冠军与年份；底部条带呈现经典夺冠瞬间或获奖者语录。整体观感如同体育博物馆的展览说明卡。",
            "who": "适合体育内容创作者、奖杯纪念品收藏者、体育博物馆、运动周边品牌、Pinterest 创作者，以及撰写体育历史的作者。",
            "how": [
                "在 {topic} 输入奖杯名称（例如：FIFA World Cup Trophy、Olympic Gold Medal、UEFA Champions League Trophy）。",
                "中央生成奖杯超写实渲染，旁注材质、重量、设计师等信息。",
                "侧边栏自动填入历届冠军与年份。",
                "生成 4K 竖版体育奖杯博物馆展卡式信息图。"
            ],
            "prompts": [
                "生成『FIFA 世界杯奖杯』信息图，含材质、重量、历届冠军。",
                "生成『欧冠奖杯』博物馆风格信息图，含经典决赛瞬间。",
                "生成『奥运金牌』信息图，覆盖夏季与冬季奥运历史。"
            ]
        }},
    },
}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}

    # Sanity check — every locale must cover every template
    for locale, content in by_locale.items():
        for tid in template_ids:
            if tid not in content:
                raise SystemExit(f"FAIL: locale {locale} missing entry for {tid}")

    # IMPORTANT: nano.json structure is FLAT at the top level — template ids
    # are direct keys (NOT nested under a 'nano' wrapper). The first run of
    # this script wrote to doc['nano'][tid] which caused UI fallback to
    # `nano.template-X.category` raw key. Fixed to use top-level assignment
    # (mirrors scripts/add_4_new_templates_i18n.py and all prior daily-drop
    # i18n scripts). Memory: feedback_daily_drop_i18n.md updated.
    total_added = 0
    for locale in LOCALES:
        nano_path = MESSAGES / locale / "nano.json"
        if not nano_path.exists():
            print(f"  SKIP (missing): {nano_path}")
            continue
        doc = json.loads(nano_path.read_text(encoding="utf-8"))
        added_here = 0
        for tid in template_ids:
            if tid in doc:
                print(f"  ({locale}) already has {tid}, skipping")
                continue
            doc[tid] = by_locale[locale][tid]
            added_here += 1
            total_added += 1
        if added_here:
            nano_path.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added_here} template entries")

    print(f"\nDone. Added {total_added} template-locale entries ({len(template_ids)} templates × {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
