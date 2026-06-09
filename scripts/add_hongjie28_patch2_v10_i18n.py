"""Append i18n entries for 5 new templates from hongjie28-patch-2 (2026-06-09 push).

Templates added:
  - template-disney-character-color-grid-art          (4x4 Disney character color-themed mosaic)
  - template-asl-sign-language-tutorial-infographic   (vertical ASL signing tutorial poster)
  - template-educational-topic-cheat-sheet-poster     (study-guide cheat sheet poster)
  - template-figure-to-abstract-portrait-series       (2x2 photo-to-abstract portrait series)
  - template-crafting-step-by-step-tutorial-infographic (numbered crafting how-to poster)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v10 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid].
  - EN authored for all 5 templates + ZH translations; other 8 locales
    fall back to EN and pick up native translations on the next
    i18n_autotranslate.cjs sweep.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-disney-character-color-grid-art",
    "template-asl-sign-language-tutorial-infographic",
    "template-educational-topic-cheat-sheet-poster",
    "template-figure-to-abstract-portrait-series",
    "template-crafting-step-by-step-tutorial-infographic",
]

EN = {
    "template-disney-character-color-grid-art": {
        "category": "Disney Character Color Grid Art",
        "description": "Generate a 4x4 mosaic poster of 16 Disney characters in a single unified color theme — heroes, villains, sidekicks, animals all rendered in the same palette for instant fan recognition.",
        "title": "Nano Banana Prompt: Disney Character Color Grid Art Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a 4x4 square grid mosaic poster on a single Disney color theme. Each of the 16 frames contains a different Disney character (heroes, villains, animals, sidekicks) rendered in a matching color palette and consistent illustration style; backgrounds tinted to the same hue family unify the grid into one bold piece of fan art.",
            "who": "Suitable for Disney fan-art creators, kids-room print sellers, color-theme nursery designers, Etsy + Redbubble print operators, and merch designers building gift bundles for the Disney superfan demographic.",
            "how": [
                "Enter the color theme + Disney characters in {color_theme_info} (e.g. 'Purple theme Disney character grid, with Cheshire Cat, Yzma, Rapunzel, etc.').",
                "16-character 4x4 grid auto-composes with consistent palette and tinted backgrounds.",
                "Each character rendered in the matching style for visual unity.",
                "Generate a 4x4 Disney character color-themed mosaic poster."
            ],
            "prompts": [
                "Generate a Purple-theme Disney character grid with Cheshire Cat, Yzma, Rapunzel.",
                "Create a Green-theme Disney character grid with Mike Wazowski, Tinker Bell, Mulan.",
                "Generate a Pink-theme Disney character grid with Ariel, Minnie Mouse, Piglet."
            ]
        }},
    },
    "template-asl-sign-language-tutorial-infographic": {
        "category": "ASL Sign Language Tutorial Infographic",
        "description": "Generate a vertical educational infographic teaching any ASL sign — bold section headers, sign demonstration photos, handshape / location / movement breakdown, and memory mnemonics.",
        "title": "Nano Banana Prompt: ASL Sign Language Tutorial Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical educational ASL infographic poster. Layout: bold section headers + color-coded panels + clear step-by-step sign demonstrations. Includes main title, sign demonstration photos, key points, handshape / location / movement parameters, memory mnemonics, and related-sign comparisons. Clean, classroom-ready typography.",
            "who": "Suitable for ASL tutors and educators, Deaf-community content creators, parents of Deaf or HoH children, K-12 inclusive-education poster sellers, sign-language app marketers, and ASL student-handbook publishers.",
            "how": [
                "Enter the ASL sign + tutorial angle in {asl_topic_info} (e.g. 'ASL sign for GREAT tutorial infographic').",
                "Sign demonstration photos + handshape / location / movement breakdown auto-compose.",
                "Memory mnemonics + related-sign comparisons populate the side panels.",
                "Generate a vertical educational ASL tutorial infographic poster."
            ],
            "prompts": [
                "Generate an ASL tutorial infographic for the sign 'GREAT'.",
                "Create an ASL handshape / location / movement parameter guide infographic.",
                "Generate an ASL 'BIG' vs 'VERY BIG' comparison tutorial poster."
            ]
        }},
    },
    "template-educational-topic-cheat-sheet-poster": {
        "category": "Educational Topic Cheat Sheet Poster",
        "description": "Generate a vertical study-guide cheat sheet for any subject — colorful section headers, key concepts, formulas, diagrams, step-by-step explanations, and illustrative icons.",
        "title": "Nano Banana Prompt: Educational Topic Cheat Sheet Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K study-guide cheat sheet poster on any educational topic. Colorful infographic-style layout with clear section headers organized into panels containing key concepts, formulas, diagrams, and step-by-step explanations. Illustrative icons and example diagrams reinforce each concept, designed for fast subject-matter recall on exam day.",
            "who": "Suitable for K-12 + college study-guide sellers, classroom teachers preparing wall references, online tutors building course collateral, AP / IB / IGCSE exam prep brands, and student note-taking content creators on TikTok / Instagram.",
            "how": [
                "Enter the subject + topic in {subject_topic_info} (e.g. 'Chemistry important reactions cheat sheet').",
                "Section headers + key concepts + formulas + diagrams auto-compose in colorful panels.",
                "Illustrative icons + step-by-step explanations populate the body.",
                "Generate a vertical 8K educational cheat sheet poster."
            ],
            "prompts": [
                "Generate a Chemistry important reactions cheat sheet poster.",
                "Create a Physics electric charges and fields formula sheet poster.",
                "Generate a Stoichiometry study-guide infographic poster."
            ]
        }},
    },
    "template-figure-to-abstract-portrait-series": {
        "category": "Figure-to-Abstract Portrait Series",
        "description": "Generate a 2x2 portrait evolution grid — original B&W photo, stylized vector portrait, geometric abstraction, fully non-figurative composition — for any historical figure or icon.",
        "title": "Nano Banana Prompt: Figure-to-Abstract Portrait Series Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a 2x2 grid of artworks showing the evolution of a portrait from photo to abstract. Top-left: the original black-and-white reference photograph. Top-right: stylized modern vector portrait in bold flat colors. Bottom-left: geometric abstraction with clean shapes. Bottom-right: fully non-figurative composition derived from the same color and shape language. A clean white background unifies the series.",
            "who": "Suitable for gallery wall print designers, modernist art Etsy stores, biographical print sellers (architects, composers, scientists, artists), interior design / mid-century-modern decor brands, and art-history educators producing visual-style comparison teaching aids.",
            "how": [
                "Enter the subject + abstraction reference in {subject_photo_info} (e.g. 'Architect De Stijl style portrait series inspired by Mondrian').",
                "Original B&W photo + stylized vector portrait auto-render in the top row.",
                "Geometric abstraction + non-figurative composition auto-render in the bottom row.",
                "Generate a 2x2 figure-to-abstract portrait evolution series."
            ],
            "prompts": [
                "Generate an Architect De Stijl style portrait series inspired by Mondrian.",
                "Create a Composer Kandinsky-inspired abstract portrait evolution series.",
                "Generate an Artist Picasso-style cubist to abstract portrait series."
            ]
        }},
    },
    "template-crafting-step-by-step-tutorial-infographic": {
        "category": "Crafting Step-by-Step Tutorial Infographic",
        "description": "Generate a cute pastel crafting how-to poster with numbered steps, process screenshots / illustrations, arrows guiding the eye, and decorative icons — perfect for Cricut, vinyl, paper craft, or any DIY workflow.",
        "title": "Nano Banana Prompt: Crafting Step-by-Step Tutorial Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K crafting tutorial infographic poster. Cute, friendly design with numbered steps, process screenshots or illustrations of each stage, arrows guiding the eye through the workflow, and a warm pastel color palette. Includes decorative icons + tools-required panel + finished-piece hero shot at the top.",
            "who": "Suitable for crafting + Cricut + Silhouette content creators, DIY blog publishers building printable tutorials, paper-craft Etsy sellers, hobbyist YouTubers needing thumbnail companion graphics, and craft-supply brands producing in-pack instruction sheets.",
            "how": [
                "Enter the crafting topic + workflow in {craft_topic_info} (e.g. 'How to upload an SVG file to Cricut Design Space').",
                "Numbered steps + process screenshots / illustrations auto-compose.",
                "Tools-required panel + decorative icons populate the layout.",
                "Generate a vertical 8K crafting step-by-step tutorial poster."
            ],
            "prompts": [
                "Generate a tutorial poster for uploading an SVG file to Cricut Design Space.",
                "Create a beginner's guide poster for using Cricut Maker.",
                "Generate a step-by-step tutorial poster for vinyl decal making."
            ]
        }},
    },
}

ZH = {
    "template-disney-character-color-grid-art": {
        "category": "迪士尼角色配色网格艺术",
        "description": "为单一迪士尼配色主题生成 4x4 角色马赛克海报 —— 16 位角色(英雄、反派、伙伴、动物)统一在同一色彩家族下,瞬间唤起粉丝认同。",
        "title": "Nano Banana 提示词:迪士尼角色配色网格艺术生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成基于单一迪士尼配色主题的 4x4 方格马赛克海报。16 个独立方框各呈现一位迪士尼角色(英雄、反派、动物、伙伴),配色统一、插画风格一致;背景色调归于同一色系,使整幅作品视觉统一,成为一件大胆的粉丝艺术。",
            "who": "适合迪士尼同人创作者、儿童房印刷品售卖者、配色主题婴儿房设计师、Etsy 与 Redbubble 印刷店运营者,以及为迪士尼超级粉丝构建礼品套装的周边设计师。",
            "how": [
                "在 {color_theme_info} 输入配色主题 + 迪士尼角色(例如:'紫色主题迪士尼网格 —— 柴郡猫、伊兹玛、长发公主等')。",
                "16 个角色 4x4 网格自动合成,配色一致 + 背景色调统一。",
                "每个角色以匹配风格呈现,确保视觉统一。",
                "生成 4x4 迪士尼角色配色主题马赛克海报。"
            ],
            "prompts": [
                "生成紫色主题迪士尼角色网格,含柴郡猫、伊兹玛、长发公主。",
                "生成绿色主题迪士尼角色网格,含毛怪麦克、奇妙仙子、花木兰。",
                "生成粉色主题迪士尼角色网格,含小美人鱼、米妮、小猪皮杰。"
            ]
        }},
    },
    "template-asl-sign-language-tutorial-infographic": {
        "category": "ASL 手语教学信息图",
        "description": "为任意 ASL 手势生成竖版教学信息图 —— 加粗章节标题、手势演示照、手型/位置/动作分解、记忆口诀。",
        "title": "Nano Banana 提示词:ASL 手语教学信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 ASL 手语教学信息图海报。布局:加粗章节标题 + 色彩分区面板 + 清晰的逐步手势示范。包括主标题、手势演示照、要点、手型/位置/动作三要素、记忆口诀,以及相关手势对比。教室友好的简洁排版。",
            "who": "适合 ASL 老师与教育者、聋人社群内容创作者、聋哑/听障儿童家长、K-12 包容教育海报售卖者、手语 app 营销方,以及 ASL 学生手册出版方。",
            "how": [
                "在 {asl_topic_info} 输入 ASL 手势 + 教学角度(例如:'ASL 手势 GREAT 教学信息图')。",
                "手势演示照 + 手型/位置/动作三要素自动合成。",
                "记忆口诀 + 相关手势对比填充侧边栏。",
                "生成竖版 ASL 手语教学信息图海报。"
            ],
            "prompts": [
                "生成 ASL 手势 'GREAT' 教学信息图。",
                "生成 ASL 手型/位置/动作参数指南信息图。",
                "生成 ASL 'BIG' vs 'VERY BIG' 对比教学海报。"
            ]
        }},
    },
    "template-educational-topic-cheat-sheet-poster": {
        "category": "教育主题速查表海报",
        "description": "为任意学科生成竖版学习速查表 —— 彩色章节标题、核心概念、公式、图解、分步解析、配套插图图标。",
        "title": "Nano Banana 提示词:教育主题速查表海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意教育主题生成 8K 竖版学习速查表海报。彩色信息图风格布局,章节标题清晰,分区呈现核心概念、公式、图解、分步解析。配套插图图标 + 示例图,强化每个概念,专为考试日快速回忆而设计。",
            "who": "适合 K-12 与大学速查表售卖者、为墙面教学制作参考图的课堂教师、构建课程辅料的在线辅导师、AP/IB/IGCSE 备考品牌,以及 TikTok/Instagram 笔记类内容创作者。",
            "how": [
                "在 {subject_topic_info} 输入学科 + 主题(例如:'化学重要反应速查表')。",
                "章节标题 + 核心概念 + 公式 + 图解自动合成为彩色面板。",
                "插图图标 + 分步解析填充主体。",
                "生成 8K 竖版教育速查表海报。"
            ],
            "prompts": [
                "生成化学重要反应速查表海报。",
                "生成物理'电荷与场'公式速查表海报。",
                "生成化学计量学学习指南信息图海报。"
            ]
        }},
    },
    "template-figure-to-abstract-portrait-series": {
        "category": "肖像到抽象演变系列",
        "description": "为任意历史人物或文化偶像生成 2x2 肖像演变 —— 黑白原照、风格化矢量、几何抽象、纯非具象构图。",
        "title": "Nano Banana 提示词:肖像到抽象演变系列生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 2x2 网格肖像演变作品。左上:黑白原始参考照片;右上:大胆扁平配色的现代矢量肖像;左下:几何抽象,简洁几何形状;右下:从同一色彩与形状语言衍生的纯非具象构图。白色底统一整组作品。",
            "who": "适合画廊墙印设计师、现代主义艺术 Etsy 店、传记类印刷品售卖者(建筑师、作曲家、科学家、艺术家)、中世纪现代装饰品牌,以及制作视觉风格对比教学的艺术史教育者。",
            "how": [
                "在 {subject_photo_info} 输入主题 + 抽象参考(例如:'建筑师 De Stijl 风格肖像演变,蒙德里安风格')。",
                "黑白原照 + 风格化矢量肖像自动渲染于上排。",
                "几何抽象 + 非具象构图自动渲染于下排。",
                "生成 2x2 肖像到抽象演变系列。"
            ],
            "prompts": [
                "生成建筑师 De Stijl 风格肖像演变系列,蒙德里安灵感。",
                "生成作曲家康定斯基风格抽象肖像演变系列。",
                "生成艺术家毕加索立体到抽象风格肖像演变系列。"
            ]
        }},
    },
    "template-crafting-step-by-step-tutorial-infographic": {
        "category": "手作分步教程信息图",
        "description": "生成可爱粉彩手作教程海报 —— 编号步骤、过程截图/插画、引导箭头、装饰图标,适用于 Cricut、贴纸、纸艺等任何 DIY 流程。",
        "title": "Nano Banana 提示词:手作分步教程信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 8K 竖版手作教程信息图海报。可爱、友好的设计风格,编号步骤 + 每步流程截图或插画 + 引导眼球的箭头 + 暖色粉彩配色。包括装饰图标、所需工具面板,以及顶部成品英雄图。",
            "who": "适合手作 + Cricut + Silhouette 内容创作者、构建可打印教程的 DIY 博客发布方、纸艺 Etsy 售卖者、需要缩略图配套图形的 YouTube 手作博主,以及制作包装内说明书的手工原料品牌。",
            "how": [
                "在 {craft_topic_info} 输入手作主题 + 流程(例如:'如何上传 SVG 文件到 Cricut Design Space')。",
                "编号步骤 + 流程截图/插画自动合成。",
                "所需工具面板 + 装饰图标填充布局。",
                "生成 8K 竖版手作分步教程海报。"
            ],
            "prompts": [
                "生成上传 SVG 文件到 Cricut Design Space 的教程海报。",
                "生成 Cricut Maker 新手使用指南海报。",
                "生成乙烯基贴纸制作分步教程海报。"
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
