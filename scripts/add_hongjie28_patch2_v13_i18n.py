"""Append i18n entries for 5 new templates from hongjie28-patch-2 (2026-06-13 push).

Templates added:
  - template-isometric-business-process-roadmap-infographic
  - template-person-self-portrait-infographic-poster
  - template-disney-dual-character-intro-book-spread
  - template-popular-science-health-infographic-poster
  - template-custom-ip-character-profile-poster-card

Note: this patch had a particularly messy JSON shape (missing array
close + multiple unbalanced braces near the end). Resolved by extracting
the 5 new template blocks via brace-tracking and appending to the
clean local file. Standard pipeline otherwise.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-isometric-business-process-roadmap-infographic",
    "template-person-self-portrait-infographic-poster",
    "template-disney-dual-character-intro-book-spread",
    "template-popular-science-health-infographic-poster",
    "template-custom-ip-character-profile-poster-card",
]

EN = {
    "template-isometric-business-process-roadmap-infographic": {
        "category": "Isometric Business Process Roadmap Infographic",
        "description": "Generate a horizontal 2.5D isometric workflow roadmap infographic — flowing curved pathway through numbered process stages, each with isometric office scene illustrations and detailed task lists.",
        "title": "Nano Banana Prompt: Isometric Business Process Roadmap Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal 8K business process roadmap infographic in 2.5D isometric line art style. Flowing curved pathway connects sequential numbered process stages; each stage carries a labeled title box + bullet-point task list and a matching minimalist isometric office scene (office staff, laptop, servers, warehouse, analytics dashboard, rockets, social media icons). Top displays the bold main title. Unified purple accent color scheme, clean modular layout, print-ready commercial PPT flowchart quality.",
            "who": "Suitable for B2B SaaS product marketing, operations consulting deck designers, internal-comms teams documenting workflows, startup growth playbook authors, and B-school instructors producing teaching slides on business processes.",
            "how": [
                "Enter the process topic + scope in {process_topic_info} (e.g. 'Digital Transformation Roadmap full process flowchart').",
                "Flowing curved pathway + sequential numbered stages auto-render.",
                "Isometric office scene illustrations auto-compose per stage.",
                "Generate a horizontal 8K isometric business process roadmap infographic."
            ],
            "prompts": [
                "Generate a Digital Transformation Roadmap full process flowchart.",
                "Create a New Employee Onboarding Journey roadmap infographic.",
                "Generate an E-commerce Order Fulfillment process roadmap."
            ]
        }},
    },
    "template-person-self-portrait-infographic-poster": {
        "category": "Person Self-Portrait Infographic Poster",
        "description": "Generate a vertical self-portrait infographic poster for any person — central portrait flanked by labeled module panels covering identity, skills, interests, hobbies, and signature attributes.",
        "title": "Nano Banana Prompt: Person Self-Portrait Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K self-portrait infographic poster for any individual. Central portrait illustration flanked by labeled module panels covering identity (name + role), skills & expertise, interests & hobbies, signature attributes, and signature accomplishments. Clean typographic hierarchy, designed for personal-brand / professional-introduction usage.",
            "who": "Suitable for personal brand builders, content creators producing 'about me' posters, job-seekers crafting infographic CVs, music / sports / tech personalities, and HR teams producing employee-spotlight materials.",
            "how": [
                "Enter the person + signature traits in {person_info} (e.g. 'Rock Bassist Musician — 10-year touring career, vintage gear collector, indie label founder').",
                "Central portrait auto-renders.",
                "Identity / skills / interests / signature module panels auto-compose around the portrait.",
                "Generate a vertical 8K self-portrait infographic poster."
            ],
            "prompts": [
                "Generate a Rock Bassist Musician self-portrait infographic poster.",
                "Create a Tech Startup Founder self-portrait infographic.",
                "Generate a Marathon Runner self-portrait infographic."
            ]
        }},
    },
    "template-disney-dual-character-intro-book-spread": {
        "category": "Disney Dual Character Intro Book Spread",
        "description": "Generate an open-book magazine spread introducing two Disney characters side-by-side — character art on each page, name + role + signature traits, and shared universe context.",
        "title": "Nano Banana Prompt: Disney Dual Character Intro Book Spread Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal open-book magazine-style spread introducing two Disney characters side-by-side. Each character occupies one page: portrait art at top, character name + role banner, signature trait highlights, and quick-fact panel. The center spine carries shared universe / film context. Children's-book illustration style with warm earthy palette.",
            "who": "Suitable for Disney fan-art creators, kids' bedtime-story content creators, parent + educator content producers, Disney-themed party invitation designers, and merch designers building character-bundle storyboards.",
            "how": [
                "Enter the two character names + shared context in {character_pair_info} (e.g. 'Belle & Beast — Beauty and the Beast forbidden romance').",
                "Each character auto-renders on its page with portrait + name + trait highlights.",
                "Center spine auto-populates with shared universe context.",
                "Generate a Disney dual-character intro book spread."
            ],
            "prompts": [
                "Generate a Belle & Beast — Beauty and the Beast dual-character book spread.",
                "Create a Ariel & Eric — Little Mermaid dual-character intro spread.",
                "Generate an Anna & Elsa — Frozen sister dual-character book spread."
            ]
        }},
    },
    "template-popular-science-health-infographic-poster": {
        "category": "Popular Science Health Infographic Poster",
        "description": "Generate a vertical health-science infographic poster — bold headline, multi-module layout with myth correction, truth explanation, data visualization (pie / bar charts, timelines), and cartoon character mascots.",
        "title": "Nano Banana Prompt: Popular Science Health Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K health-science popularization poster. Large bold headline at top; page split into independent content modules with clear subtitles: misconception correction, truth explanation, classification overview, pros & cons analysis, hazard description, coping solutions, plus survey pie / bar charts, timeline flow charts and data visualization. Decorated with relevant cute flat cartoon character illustrations, symbolic icons, and decorative geometric elements. Soft flat vector illustration style, coordinated unified color scheme, readable font hierarchy, clean white background — print-ready for health-science campaigns.",
            "who": "Suitable for public-health communicators, family-doctor practices producing waiting-room education posters, nutrition / wellness brand content marketers, public-health agencies running campaigns, and health-tech app designers producing educational in-app content.",
            "how": [
                "Enter the health topic + angle in {knowledge_topic_info} (e.g. 'Sugar-Free Food Misconceptions popular-science explainer').",
                "Module sections auto-compose around the central topic.",
                "Cartoon mascots + data visualization auto-render at appropriate positions.",
                "Generate a vertical 8K health-science infographic poster."
            ],
            "prompts": [
                "Generate a Sugar-Free Food Misconceptions popular-science infographic.",
                "Create a Sleep Disorder Causes, Hazards & Scientific Coping poster.",
                "Generate a Pandemic-Era Anxiety Emotion popular-science infographic."
            ]
        }},
    },
    "template-custom-ip-character-profile-poster-card": {
        "category": "Custom IP Character Profile Poster Card",
        "description": "Generate a vertical IP character official-profile poster card — central full-body main illustration plus modules for design concept, three-view schematic, character profile, expression set, peripheral mockups, and brand color palette.",
        "title": "Nano Banana Prompt: Custom IP Character Profile Poster Card Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K IP character design showcase card. Central large full-body IP character illustration; layout divided into standardized modules: IP design concept summary, front / side / back three-view schematic, character basic setting profile, multi-expression emoji set, peripheral application mockups (keychain, tote bag, sticker, pillow), brand color palette display. Consistent unified brand color system, decorative borders matching the IP style, clear text-box segmentation, directional guide arrows. Complete VI presentation layout.",
            "who": "Suitable for in-house brand teams launching IP mascots, agencies pitching mascot redesigns, IP licensing intermediaries presenting characters, kids-product brand managers, indie creators building stylized character bibles, and product designers preparing investor / partner decks.",
            "how": [
                "Enter the IP name + style + setting in {ip_name_desc} (e.g. '江源水豚 Capybara wetland-guardian IP, traditional Chinese knot dress, 2D flat cartoon').",
                "Central full-body IP character auto-renders.",
                "Three-view schematic + expression set + peripheral mockups + color palette auto-populate the modules.",
                "Generate a vertical 8K custom IP character profile poster card."
            ],
            "prompts": [
                "Generate a 江源水豚 Capybara wetland-guardian IP profile card with traditional Chinese knot dress.",
                "Create a 青榄小菊 anthropomorphic kid mosquito-repellent brand IP profile card.",
                "Generate a Sora Penguin Antarctic-explorer IP profile card."
            ]
        }},
    },
}

ZH = {
    "template-isometric-business-process-roadmap-infographic": {
        "category": "等距业务流程路线图信息图",
        "description": "为任意业务流程生成横版 2.5D 等距线条艺术信息图 —— 流畅曲线连接编号阶段,每段配等距办公场景插画与任务清单。",
        "title": "Nano Banana 提示词:等距业务流程路线图信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 8K 横版业务流程路线图信息图,2.5D 等距线条艺术风格。流畅曲线连接编号阶段;每段配带标题盒 + 任务清单的极简等距办公场景(职员、笔电、服务器、仓库、分析仪表板、火箭、社交媒体图标)。顶部呈现粗体大标题。紫色为统一强调色,模块布局整洁,商业 PPT 印刷品质。",
            "who": "适合 B2B SaaS 产品营销、咨询公司提案设计师、内部沟通团队梳理流程、初创公司增长 Playbook 作者,以及商学院讲师制作业务流程教学幻灯。",
            "how": [
                "在 {process_topic_info} 输入流程主题 + 范围(例如:'数字化转型路线图完整流程图')。",
                "曲线路径 + 编号阶段自动呈现。",
                "等距办公场景插画自动合成至各阶段。",
                "生成 8K 横版等距业务流程路线图信息图。"
            ],
            "prompts": [
                "生成数字化转型路线图完整流程图。",
                "生成新员工入职旅程路线图信息图。",
                "生成电商订单履行流程路线图。"
            ]
        }},
    },
    "template-person-self-portrait-infographic-poster": {
        "category": "人物自画像信息图海报",
        "description": "为任意人物生成竖版自画像信息图海报 —— 中心肖像辅以身份/技能/兴趣/标志性属性模块面板。",
        "title": "Nano Banana 提示词:人物自画像信息图海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意个人生成 8K 竖版自画像信息图海报。中央人物肖像插画,周围排列标注模块面板,涵盖身份(姓名 + 职务)、技能与专长、兴趣与爱好、标志性属性,以及代表性成就。清晰排版层级,适合个人品牌 / 专业介绍。",
            "who": "适合构建个人品牌者、制作'关于我'海报的内容创作者、设计信息图简历的求职者、音乐/体育/科技领域的人格,以及制作员工聚光灯材料的 HR 团队。",
            "how": [
                "在 {person_info} 输入人物 + 标志性特征(例如:'摇滚贝斯手 —— 10 年巡演生涯、复古设备收藏家、独立厂牌创办人')。",
                "中心肖像自动呈现。",
                "身份/技能/兴趣/标志性模块面板自动围绕肖像合成。",
                "生成 8K 竖版自画像信息图海报。"
            ],
            "prompts": [
                "生成摇滚贝斯手自画像信息图海报。",
                "生成科技创业者自画像信息图。",
                "生成马拉松跑者自画像信息图。"
            ]
        }},
    },
    "template-disney-dual-character-intro-book-spread": {
        "category": "迪士尼双角色介绍绘本跨页",
        "description": "为两个迪士尼角色生成杂志风跨页绘本介绍 —— 每页配角色插画 + 姓名 + 角色 + 标志性特征,中线呈现共同宇宙背景。",
        "title": "Nano Banana 提示词:迪士尼双角色介绍绘本跨页生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成横版打开杂志风跨页,左右并列介绍两位迪士尼角色。每位角色占据一页:顶部肖像、姓名 + 角色标语、标志性特征亮点,以及小贴士面板。中线区呈现共同宇宙/影片背景。儿童绘本插画风格,暖色调大地色配色。",
            "who": "适合迪士尼同人创作者、儿童睡前故事内容创作者、家长与教育者内容制作方、迪士尼主题派对邀请函设计师,以及构建角色套装故事板的周边设计师。",
            "how": [
                "在 {character_pair_info} 输入两位角色 + 共同背景(例如:'贝儿与野兽 —— 美女与野兽的禁忌恋情')。",
                "每位角色自动以肖像 + 姓名 + 特征亮点呈现。",
                "中线区自动填充共同宇宙背景。",
                "生成迪士尼双角色介绍绘本跨页。"
            ],
            "prompts": [
                "生成贝儿与野兽 —— 美女与野兽双角色绘本跨页。",
                "生成爱丽尔与埃里克 —— 小美人鱼双角色介绍跨页。",
                "生成安娜与艾莎 —— 冰雪奇缘姐妹双角色绘本跨页。"
            ]
        }},
    },
    "template-popular-science-health-infographic-poster": {
        "category": "健康科普信息长图海报",
        "description": "为任意健康主题生成竖版科普信息长图海报 —— 粗体标题、模块化布局:误区、真相讲解、数据可视化、卡通形象。",
        "title": "Nano Banana 提示词:健康科普信息长图海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 8K 竖版健康科普信息海报。顶部粗体大标题;页面分为多个独立内容模块,带清晰副标题:误区纠正、真相讲解、分类介绍、利弊分析、危害描述、应对方案,以及调查饼图/柱状图、时间线流程图与数据可视化。配相关可爱扁平卡通形象插画、象征性图标与装饰几何元素。柔和扁平矢量风格,统一协调主色,层次清晰字体,纯白底,印刷品质,适合健康科普传播。",
            "who": "适合公共健康传播者、家庭医生诊所制作候诊室教育海报、营养/健康品牌的内容营销人员、开展运动的公共卫生机构,以及制作 App 内教学内容的健康科技设计师。",
            "how": [
                "在 {knowledge_topic_info} 输入健康主题 + 角度(例如:'无糖食品误区科普详解')。",
                "模块分区围绕中心主题自动合成。",
                "卡通形象 + 数据可视化自动呈现于合适位置。",
                "生成 8K 竖版健康科普信息海报。"
            ],
            "prompts": [
                "生成无糖食品误区科普信息海报。",
                "生成睡眠障碍成因、危害与科学应对海报。",
                "生成疫情期间焦虑情绪科普信息长图。"
            ]
        }},
    },
    "template-custom-ip-character-profile-poster-card": {
        "category": "定制 IP 角色档案海报卡",
        "description": "为任意 IP 角色生成官方档案竖版海报卡 —— 中心全身主插画 + 设计概念/三视图/角色档案/表情包/周边样机/品牌色板模块。",
        "title": "Nano Banana 提示词:定制 IP 角色档案海报卡生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 8K 竖版 IP 角色设计展示卡。中央大幅全身 IP 角色主插画;布局划分为标准化模块:IP 设计概念概述、正/侧/背三视图、角色基本设定档案、多表情包、周边应用样机(钥匙扣、托特包、贴纸、抱枕),以及品牌色板展示。统一品牌色系,装饰边框契合 IP 风格,清晰文字框分区,引导箭头标注。完整 VI 呈现布局。",
            "who": "适合上线 IP 吉祥物的内部品牌团队、提案吉祥物重设的代理机构、向品牌呈现角色待审的 IP 授权方、儿童产品品牌经理、构建风格化角色圣经的独立创作者,以及为投资人/合作方准备提案的产品设计师。",
            "how": [
                "在 {ip_name_desc} 输入 IP 名称 + 风格 + 设定(例如:'江源水豚国风湿地守护者 IP,中式盘扣绿色服饰,2D 扁平卡通')。",
                "中央全身 IP 角色自动呈现。",
                "三视图 + 表情包 + 周边样机 + 色板自动填充模块。",
                "生成 8K 竖版定制 IP 角色档案海报卡。"
            ],
            "prompts": [
                "生成江源水豚国风湿地守护者 IP 档案卡,中式盘扣服饰。",
                "生成青榄小菊驱蚊品牌孩童拟人 IP 档案卡。",
                "生成空空企鹅南极探险家 IP 档案卡。"
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
