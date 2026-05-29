"""Append i18n entries for the 5 new nano templates from hongjie28-patch-2 cycle 3.

Templates added in commit (today, 2026-05-29):
  - template-professional-category-guide-infographic
  - template-mbti-group-anime-character-poster
  - template-self-help-infographic-poster
  - template-hairstyle-guide-infographic
  - template-self-help-book-visual-summary-infographic

Filename uses _v3 suffix because add_hongjie28_patch2_i18n.py was reused
twice already (April: zhenhuan/quote-poster; 2026-05-28: 4 templates).

Turkish entries use ASCII-only (no diacritics) per established convention.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-professional-category-guide-infographic",
    "template-mbti-group-anime-character-poster",
    "template-self-help-infographic-poster",
    "template-hairstyle-guide-infographic",
    "template-self-help-book-visual-summary-infographic",
]

entries = {
    "en": {
        "template-professional-category-guide-infographic": {
            "category": "Professional Category Guide",
            "description": "Create a clean, minimalist educational infographic poster guiding users through any professional category — interior design styles, wine pairings, coffee brewing, plant care, and beyond.",
            "title": "Nano Banana Prompt: Professional Category Guide Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K minimalist guide poster titled 'Professional {topic} Guide'. The layout is a structured multi-section grid with high-quality photos in 3 columns per category, clear labels, and short descriptions. Clean typography and a polished editorial aesthetic make it suitable for hand-out reference or wall display.",
                "who": "Suitable for editorial designers, brand educators, retail / hospitality teams making guest references, Pinterest creators, professional services explaining their categories visually, and anyone producing curated topic guides.",
                "how": [
                    "Enter a topic in {topic} (e.g., Interior Design Styles, Wine Pairing, Plant Care).",
                    "The poster auto-generates a multi-section layout with photos in 3-column grids.",
                    "Each category is labeled with clear typography and a short description.",
                    "Generate a vertical 4K minimalist professional category guide poster."
                ],
                "prompts": [
                    "Generate an Interior Design Styles professional guide poster.",
                    "Create a Wine Pairing Guide infographic with category sections.",
                    "Generate a Plant Care Guide with photo-grid categories."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI Group Anime Poster",
            "description": "Create a stylized anime character poster for any MBTI group (Analysts, Diplomats, Sentinels, Explorers) — 4 full-body characters in a unified color palette.",
            "title": "Nano Banana Prompt: MBTI Group Anime Character Poster Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K stylized anime poster titled 'MBTI {topic}'. Four full-body anime characters represent the types in the group, all dressed in a unified color palette matching the theme. Below the characters, small low-poly figures and 4-letter MBTI labels (e.g., INTJ, INTP, ENTJ, ENTP) clearly identify each type.",
                "who": "Suitable for MBTI content creators, anime / manga fans, personality enthusiasts, fan-art designers, social media accounts focused on MBTI, and anyone producing shareable MBTI-group content.",
                "how": [
                    "Enter an MBTI group in {topic} (e.g., Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "The poster auto-generates 4 anime characters in a unified color palette for that group.",
                    "Below the characters, low-poly figures and MBTI 4-letter codes label each type.",
                    "Generate a vertical 4K stylized anime MBTI group poster."
                ],
                "prompts": [
                    "Generate an Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI anime poster.",
                    "Create a Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI character poster.",
                    "Generate an Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI anime poster."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Self-Help Infographic",
            "description": "Create a cheerful, illustrated self-help infographic with numbered cartoon icons for any life-improvement topic — habits, routines, mindset shifts, and more.",
            "title": "Nano Banana Prompt: Self-Help Infographic Poster Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K cheerful self-help poster titled '{topic}'. The layout is a grid of numbered circular icons, each containing a small cartoon illustration of the activity or habit, paired with a clear title and a short explanation. Bright illustrative style and friendly typography make it easy to share.",
                "who": "Suitable for self-help content creators, wellness coaches, productivity bloggers, mental-health educators, social media accounts focused on personal growth, and Pinterest creators producing actionable habit posters.",
                "how": [
                    "Enter a self-help topic in {topic} (e.g., How to Get Unstuck in Life, Habits That Pay Off).",
                    "The poster auto-generates a grid of numbered circular icons with cartoon illustrations.",
                    "Each icon is paired with a clear title and a short actionable description.",
                    "Generate a vertical 4K cheerful illustrated self-help infographic poster."
                ],
                "prompts": [
                    "Generate a How to Get Unstuck in Life self-help infographic.",
                    "Create a Habits That Pay Off illustrated self-help poster.",
                    "Generate a Toxic Habits to Quit illustrated infographic."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Hairstyle Guide Infographic",
            "description": "Create a professional hairstyle analysis poster for any hair type — face shape, texture, density analysis, recommended cuts, length, and styling tips.",
            "title": "Nano Banana Prompt: Hairstyle Guide Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K hairstyle analysis poster titled '{topic}'. The structured layout includes hair analysis (face shape, texture, density), recommended vs not-recommended hairstyles, length recommendations, and styling tips with realistic illustrations. A professional editorial aesthetic supports both salon and home reference use.",
                "who": "Suitable for hair stylists, salon owners, beauty content creators, fashion bloggers, men's / women's grooming brands, Pinterest creators, and anyone producing hair-care educational content.",
                "how": [
                    "Enter a hairstyle topic in {topic} (e.g., Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "The poster auto-generates sections for face shape, texture, and density analysis.",
                    "Recommended hairstyles, lengths, and styling tips appear alongside realistic illustrations.",
                    "Generate a vertical 4K professional hairstyle guide infographic."
                ],
                "prompts": [
                    "Generate a Men's Wavy Medium Hair Guide infographic.",
                    "Create a Women's Curly Long Hair Guide with face shape and styling tips.",
                    "Generate a Women's Korean Short Hair Guide infographic."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Self-Help Book Summary",
            "description": "Create an illustrated visual summary infographic for any self-help book — central winding-path illustration with key concepts, definitions, and insights mapped along the journey.",
            "title": "Nano Banana Prompt: Self-Help Book Visual Summary Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K illustrated book summary poster titled '{topic}'. The layout centers a winding mountain path illustration, surrounded by key concepts, definitions, processes, and insights from the book. The metaphor of the journey reinforces the book's message visually while delivering a digestible at-a-glance summary.",
                "who": "Suitable for book bloggers, BookTok / Booktube creators, self-help readers building book notes, personal growth coaches, authors creating supplementary materials, and Pinterest creators producing book summaries.",
                "how": [
                    "Enter a self-help book title in {topic} (e.g., The Mountain Is You, Atomic Habits).",
                    "The poster auto-generates a central winding mountain path illustration.",
                    "Key concepts, definitions, processes, and insights from the book are mapped along the journey.",
                    "Generate a vertical 4K illustrated visual book summary infographic poster."
                ],
                "prompts": [
                    "Generate a 'The Mountain Is You' visual book summary infographic.",
                    "Create an 'Atomic Habits' illustrated book summary poster.",
                    "Generate a 'Mindset' (Carol Dweck) visual book summary infographic."
                ]
            }}
        }
    },
    "zh": {
        "template-professional-category-guide-infographic": {
            "category": "专业品类指南",
            "description": "围绕任意专业品类(室内设计风格、葡萄酒搭配、咖啡冲泡、植物养护等)生成简约风格的教育指南海报。",
            "title": "Nano Banana 提示词:专业品类指南信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板生成一张4K竖版极简指南海报,标题为'Professional {topic} Guide'。版面为多区块结构化布局,每个品类配有3列高质量图片、清晰标签和简短说明。干净排版与编辑级美学,既适合做参考资料,也适合上墙展示。",
                "who": "适合编辑设计师、品牌培训人员、零售/酒店的客用参考资料制作团队、Pinterest 创作者、需要可视化展示自身品类的专业服务,以及制作主题指南的创作者。",
                "how": [
                    "在 {topic} 中填入主题(例如:Interior Design Styles、Wine Pairing、Plant Care)。",
                    "海报自动生成多区块布局,每个区块为3列照片网格。",
                    "每个品类配有清晰排版的标签与简短描述。",
                    "生成4K竖版极简风专业品类指南海报。"
                ],
                "prompts": [
                    "生成'室内设计风格'专业指南海报。",
                    "创建包含品类区块的'葡萄酒搭配指南'信息图。",
                    "生成带图片网格的'植物养护指南'。"
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI 分组动漫海报",
            "description": "为任意MBTI分组(分析家、外交官、守卫者、探险家)生成统一配色的二次元动漫角色海报,展示4位全身角色。",
            "title": "Nano Banana 提示词:MBTI 分组动漫角色海报生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板生成一张4K竖版二次元动漫风海报,标题为'MBTI {topic}'。四位全身动漫角色代表该分组中的人格类型,统一配色契合主题。角色下方为小型低多边形人偶配合MBTI四字母代码(例如 INTJ、INTP、ENTJ、ENTP),清晰区分每种类型。",
                "who": "适合MBTI内容创作者、动漫/漫画爱好者、人格爱好者、同人创作者、人格主题社媒账号,以及制作易于分享的MBTI分组内容的创作者。",
                "how": [
                    "在 {topic} 中填入MBTI分组(例如:Analysts Group (INTJ, INTP, ENTJ, ENTP))。",
                    "海报自动生成该分组的4位动漫角色,统一配色。",
                    "角色下方出现低多边形人偶与MBTI四字母代码,标注各类型。",
                    "生成4K竖版二次元风MBTI分组动漫海报。"
                ],
                "prompts": [
                    "生成'分析家组 (INTJ, INTP, ENTJ, ENTP)' MBTI动漫海报。",
                    "为'外交官组 (INFJ, INFP, ENFJ, ENFP)'生成MBTI角色海报。",
                    "生成'探险家组 (ISTP, ISFP, ESTP, ESFP)' MBTI动漫海报。"
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "自我提升信息图",
            "description": "围绕任意自我提升主题(习惯、日常、心态转变等),生成带编号卡通图标的开朗插画信息图。",
            "title": "Nano Banana 提示词:自我提升信息图海报生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板生成一张4K竖版开朗自我提升海报,标题为'{topic}'。版面为编号圆形图标网格,每个图标内有该活动/习惯的小卡通插画,配合清晰标题与简短解释。明亮的插画风与友好排版便于分享。",
                "who": "适合自我提升内容创作者、健康教练、生产力博主、心理健康教育者、聚焦个人成长的社媒账号,以及制作可执行习惯海报的Pinterest创作者。",
                "how": [
                    "在 {topic} 中填入自我提升主题(例如:How to Get Unstuck in Life、Habits That Pay Off)。",
                    "海报自动生成带卡通插画的编号圆形图标网格。",
                    "每个图标配有清晰标题与简短可执行说明。",
                    "生成4K竖版开朗插画风自我提升信息图海报。"
                ],
                "prompts": [
                    "生成'如何走出人生瓶颈'自我提升信息图。",
                    "创建'能带来回报的习惯'插画式自我提升海报。",
                    "生成'值得戒掉的不良习惯'插画式信息图。"
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "发型指南信息图",
            "description": "为任意发型类型生成专业的发型分析海报,涵盖脸型、发质、密度分析、推荐发型、长度建议与造型技巧。",
            "title": "Nano Banana 提示词:发型指南信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板生成一张4K竖版发型分析海报,标题为'{topic}'。结构化版面包含发型分析(脸型、发质、密度)、推荐与不推荐的发型、长度建议、造型技巧,配真实风格插画。专业编辑级美学既适合美发店内部参考,也适合家庭使用。",
                "who": "适合理发师、美发店老板、美妆内容创作者、时尚博主、男士/女士护理品牌、Pinterest创作者,以及制作美发教育内容的创作者。",
                "how": [
                    "在 {topic} 中填入发型主题(例如:Men's Wavy Hair Guide、Women's Curly Long Hair Guide)。",
                    "海报自动生成脸型、发质、密度分析区块。",
                    "推荐发型、长度与造型技巧配合写实插画呈现。",
                    "生成4K竖版专业发型指南信息图。"
                ],
                "prompts": [
                    "生成'男士中长波浪发型指南'信息图。",
                    "创建包含脸型与造型技巧的'女士长卷发指南'。",
                    "生成'女士韩系短发指南'信息图。"
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "自我提升书籍可视化总结",
            "description": "为任意自我提升书籍生成插画式视觉总结信息图——中心绕山路径插画,沿途映射核心概念、定义与洞见。",
            "title": "Nano Banana 提示词:自我提升书籍可视化总结生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板生成一张4K竖版插画式书籍总结海报,标题为'{topic}'。版面以中心绕山路径插画为核心,周围分布书中的关键概念、定义、流程与洞见。旅程隐喻强化了书的核心信息,同时提供易消化的一图速览总结。",
                "who": "适合书评博主、BookTok/Booktube创作者、做读书笔记的自我提升读者、个人成长教练、制作补充材料的作者,以及制作书籍总结的Pinterest创作者。",
                "how": [
                    "在 {topic} 中填入自我提升书名(例如:The Mountain Is You、Atomic Habits)。",
                    "海报自动生成中心绕山路径插画。",
                    "书中的关键概念、定义、流程与洞见映射在沿途各点。",
                    "生成4K竖版插画式可视化书籍总结信息图海报。"
                ],
                "prompts": [
                    "为'The Mountain Is You'生成可视化书籍总结信息图。",
                    "创建'Atomic Habits'插画式书籍总结海报。",
                    "为'Mindset'(卡罗尔·德韦克)生成可视化书籍总结信息图。"
                ]
            }}
        }
    },
    "de": {
        "template-professional-category-guide-infographic": {
            "category": "Professioneller Kategorie-Guide",
            "description": "Erstellen Sie eine saubere, minimalistische Lerninfografik fuer jede professionelle Kategorie — Innendesignstile, Weinpairings, Kaffeebrauen, Pflanzenpflege und mehr.",
            "title": "Nano Banana Prompt: Professioneller Kategorie-Guide Infografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-Minimalismus-Guideposter mit dem Titel 'Professional {topic} Guide'. Die Mehrabschnitts-Rasterstruktur enthaelt hochwertige Fotos in 3 Spalten pro Kategorie, klare Beschriftungen und kurze Beschreibungen. Klare Typografie und polierte Editorial-Aesthetik eignen sich fuer Handout-Referenzen oder Wanddarstellung.",
                "who": "Geeignet fuer Editorial-Designer, Brand-Educator-Teams, Retail- und Hotelbetriebe, Pinterest-Creator, professionelle Dienstleister, die ihre Kategorien visualisieren, und alle, die kuratierte Themenleitfaeden produzieren.",
                "how": [
                    "Geben Sie ein Thema in {topic} ein (z.B. Interior Design Styles, Wine Pairing, Plant Care).",
                    "Das Poster generiert automatisch ein Mehrabschnitts-Layout mit Fotos in 3-Spalten-Rastern.",
                    "Jede Kategorie wird mit klarer Typografie und kurzer Beschreibung versehen.",
                    "Ein vertikales 4K-Minimalismus-Kategorie-Guideposter wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie ein Interior Design Styles Profi-Guideposter.",
                    "Erstellen Sie eine Wine Pairing Guide-Infografik mit Kategorieabschnitten.",
                    "Erstellen Sie einen Plant Care Guide mit Foto-Raster-Kategorien."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI-Gruppen-Anime-Poster",
            "description": "Erstellen Sie ein stilisiertes Anime-Charakterposter fuer jede MBTI-Gruppe (Analytiker, Diplomaten, Wachter, Forscher) mit 4 Ganzkoerperfiguren in einheitlicher Farbpalette.",
            "title": "Nano Banana Prompt: MBTI-Gruppen-Anime-Charakterposter-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-stilisiertes Anime-Poster mit dem Titel 'MBTI {topic}'. Vier Ganzkoerper-Anime-Charaktere repraesentieren die Typen der Gruppe, alle in einer einheitlichen Farbpalette zum Thema. Unter den Figuren stehen kleine Low-Poly-Figuren und MBTI-Vier-Buchstaben-Labels (z.B. INTJ, INTP, ENTJ, ENTP), die jeden Typ klar identifizieren.",
                "who": "Geeignet fuer MBTI-Content-Creator, Anime-/Manga-Fans, Persoenlichkeitsenthusiasten, Fan-Art-Designer, Persoenlichkeits-Social-Accounts und alle, die teilbare MBTI-Gruppeninhalte erstellen.",
                "how": [
                    "Geben Sie eine MBTI-Gruppe in {topic} ein (z.B. Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "Das Poster generiert vier Anime-Charaktere in einheitlicher Farbpalette fuer die Gruppe.",
                    "Darunter erscheinen Low-Poly-Figuren mit MBTI-Vier-Buchstaben-Codes.",
                    "Ein vertikales 4K-stilisiertes Anime-MBTI-Gruppenposter wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie ein Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI-Anime-Poster.",
                    "Erstellen Sie ein Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI-Charakterposter.",
                    "Erstellen Sie ein Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI-Anime-Poster."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Self-Help-Infografik",
            "description": "Erstellen Sie eine froehliche, illustrierte Self-Help-Infografik mit nummerierten Cartoon-Icons fuer jedes Selbstverbesserungsthema — Gewohnheiten, Routinen, Mindset-Shifts und mehr.",
            "title": "Nano Banana Prompt: Self-Help-Infografik-Poster-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-froehliches Self-Help-Poster mit dem Titel '{topic}'. Das Layout ist ein Raster nummerierter kreisfoermiger Icons mit kleinen Cartoon-Illustrationen der Aktivitaet oder Gewohnheit, kombiniert mit klarem Titel und kurzer Erklaerung. Helle Illustrationsstilistik und freundliche Typografie erleichtern das Teilen.",
                "who": "Geeignet fuer Self-Help-Content-Creator, Wellness-Coaches, Produktivitaets-Blogger, Mental-Health-Educator, Persoenlichkeitsentwicklungs-Social-Accounts und Pinterest-Creator, die handlungsorientierte Gewohnheitsposter produzieren.",
                "how": [
                    "Geben Sie ein Self-Help-Thema in {topic} ein (z.B. How to Get Unstuck in Life, Habits That Pay Off).",
                    "Das Poster generiert ein Raster nummerierter kreisfoermiger Icons mit Cartoon-Illustrationen.",
                    "Jedes Icon ist mit klarem Titel und kurzer Handlungsbeschreibung versehen.",
                    "Ein vertikales 4K-froehliches illustriertes Self-Help-Infografikposter wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie eine How to Get Unstuck in Life Self-Help-Infografik.",
                    "Erstellen Sie ein Habits That Pay Off illustriertes Self-Help-Poster.",
                    "Erstellen Sie eine Toxic Habits to Quit illustrierte Infografik."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Frisuren-Guide-Infografik",
            "description": "Erstellen Sie ein professionelles Frisuren-Analyseposter fuer jeden Haartyp — Gesichtsform, Textur, Dichteanalyse, empfohlene Schnitte, Laenge und Styling-Tipps.",
            "title": "Nano Banana Prompt: Frisuren-Guide-Infografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-Frisuren-Analyseposter mit dem Titel '{topic}'. Die strukturierte Layout enthaelt Haaranalyse (Gesichtsform, Textur, Dichte), empfohlene vs. nicht empfohlene Frisuren, Laengenempfehlungen und Styling-Tipps mit realistischen Illustrationen. Eine professionelle Editorial-Aesthetik unterstuetzt sowohl Salon- als auch Heim-Referenznutzung.",
                "who": "Geeignet fuer Friseure, Salonbesitzer, Beauty-Content-Creator, Fashion-Blogger, Maenner- und Frauen-Grooming-Marken, Pinterest-Creator und alle, die Haarpflege-Bildungsinhalte produzieren.",
                "how": [
                    "Geben Sie ein Frisurenthema in {topic} ein (z.B. Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "Das Poster generiert Abschnitte zu Gesichtsform-, Textur- und Dichteanalyse.",
                    "Empfohlene Frisuren, Laengen und Styling-Tipps erscheinen mit realistischen Illustrationen.",
                    "Eine vertikale 4K-professionelle Frisuren-Guide-Infografik wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie eine Men's Wavy Medium Hair Guide-Infografik.",
                    "Erstellen Sie einen Women's Curly Long Hair Guide mit Gesichtsform und Styling-Tipps.",
                    "Erstellen Sie eine Women's Korean Short Hair Guide-Infografik."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Self-Help-Buch-Visualzusammenfassung",
            "description": "Erstellen Sie eine illustrierte Visualzusammenfassungs-Infografik fuer jedes Self-Help-Buch — zentrale geschwungene Pfadillustration mit Schluesselkonzepten und Erkenntnissen entlang der Reise.",
            "title": "Nano Banana Prompt: Self-Help-Buch-Visualzusammenfassung-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-illustriertes Buchzusammenfassungsposter mit dem Titel '{topic}'. Im Zentrum steht eine geschwungene Bergpfad-Illustration, umgeben von Schluesselkonzepten, Definitionen, Prozessen und Erkenntnissen aus dem Buch. Die Reisemetapher verstaerkt die Botschaft des Buches visuell und liefert gleichzeitig eine verdauliche Zusammenfassung auf einen Blick.",
                "who": "Geeignet fuer Buchblogger, BookTok-/Booktube-Creator, Self-Help-Leser mit Buchnotizen, Personal-Growth-Coaches, Autoren ergaenzender Materialien und Pinterest-Creator, die Buchzusammenfassungen erstellen.",
                "how": [
                    "Geben Sie einen Self-Help-Buchtitel in {topic} ein (z.B. The Mountain Is You, Atomic Habits).",
                    "Das Poster generiert eine zentrale geschwungene Bergpfad-Illustration.",
                    "Schluesselkonzepte, Definitionen, Prozesse und Erkenntnisse aus dem Buch werden entlang der Reise platziert.",
                    "Ein vertikales 4K-illustriertes Buchzusammenfassungs-Infografikposter wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie eine 'The Mountain Is You' Buchzusammenfassung-Infografik.",
                    "Erstellen Sie ein 'Atomic Habits' illustriertes Buchzusammenfassungsposter.",
                    "Erstellen Sie eine 'Mindset' (Carol Dweck) Buchzusammenfassung-Infografik."
                ]
            }}
        }
    },
    "es": {
        "template-professional-category-guide-infographic": {
            "category": "Guia de Categoria Profesional",
            "description": "Crea un poster de infografia educativa limpio y minimalista para cualquier categoria profesional: estilos de diseno interior, maridajes de vino, preparacion de cafe, cuidado de plantas y mas.",
            "title": "Nano Banana Prompt: Generador de Infografia Guia de Categoria Profesional | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K minimalista titulado 'Professional {topic} Guide'. El diseno multi-seccion incluye fotos de alta calidad en 3 columnas por categoria, etiquetas claras y descripciones cortas. Tipografia limpia y estetica editorial pulida adecuadas para referencia o exhibicion en pared.",
                "who": "Adecuado para disenadores editoriales, formadores de marca, equipos de retail / hosteleria, creadores en Pinterest, servicios profesionales que visualizan sus categorias y quienes producen guias tematicas curadas.",
                "how": [
                    "Introduce un tema en {topic} (ej. Interior Design Styles, Wine Pairing, Plant Care).",
                    "El poster genera un diseno multi-seccion con fotos en cuadricula de 3 columnas.",
                    "Cada categoria se etiqueta con tipografia clara y una descripcion corta.",
                    "Se genera un poster vertical 4K minimalista de guia de categoria profesional."
                ],
                "prompts": [
                    "Genera un poster guia profesional de Estilos de Diseno Interior.",
                    "Crea una infografia Guia de Maridaje de Vinos con secciones por categoria.",
                    "Genera una Guia de Cuidado de Plantas con cuadricula de fotos."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "Poster Anime de Grupo MBTI",
            "description": "Crea un poster estilizado anime para cualquier grupo MBTI (Analistas, Diplomaticos, Centinelas, Exploradores) con 4 personajes de cuerpo completo en paleta unificada.",
            "title": "Nano Banana Prompt: Generador de Poster Anime de Grupo MBTI | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K estilo anime titulado 'MBTI {topic}'. Cuatro personajes anime de cuerpo completo representan los tipos del grupo, todos vestidos en una paleta unificada. Debajo, pequenas figuras low-poly y etiquetas MBTI de 4 letras (ej. INTJ, INTP, ENTJ, ENTP) identifican cada tipo.",
                "who": "Adecuado para creadores de contenido MBTI, fans de anime / manga, entusiastas de la personalidad, fan-art designers, cuentas de redes sociales sobre MBTI y quienes producen contenido MBTI compartible.",
                "how": [
                    "Introduce un grupo MBTI en {topic} (ej. Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "El poster genera 4 personajes anime en paleta unificada para ese grupo.",
                    "Debajo aparecen figuras low-poly y codigos MBTI de 4 letras identificando cada tipo.",
                    "Se genera un poster vertical 4K anime de grupo MBTI."
                ],
                "prompts": [
                    "Genera un poster Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI anime.",
                    "Crea un poster Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI.",
                    "Genera un poster Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI anime."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Infografia de Autoayuda",
            "description": "Crea una infografia de autoayuda alegre e ilustrada con iconos numerados para cualquier tema de mejora personal: habitos, rutinas, cambios de mentalidad y mas.",
            "title": "Nano Banana Prompt: Generador de Infografia de Autoayuda | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K alegre de autoayuda titulado '{topic}'. El diseno es una cuadricula de iconos circulares numerados, cada uno con una pequena ilustracion cartoon de la actividad, junto a titulo claro y explicacion breve. Estilo ilustrativo luminoso y tipografia amistosa facilitan compartirlo.",
                "who": "Adecuado para creadores de contenido de autoayuda, coaches de bienestar, blogueros de productividad, educadores de salud mental, cuentas sociales sobre crecimiento personal y creadores en Pinterest.",
                "how": [
                    "Introduce un tema de autoayuda en {topic} (ej. How to Get Unstuck in Life, Habits That Pay Off).",
                    "El poster genera una cuadricula de iconos circulares numerados con ilustraciones cartoon.",
                    "Cada icono lleva un titulo claro y una descripcion accionable corta.",
                    "Se genera un poster vertical 4K alegre ilustrado de autoayuda."
                ],
                "prompts": [
                    "Genera una infografia de autoayuda How to Get Unstuck in Life.",
                    "Crea un poster ilustrado Habits That Pay Off de autoayuda.",
                    "Genera una infografia ilustrada Toxic Habits to Quit."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Infografia Guia de Peinados",
            "description": "Crea un poster profesional de analisis de peinado para cualquier tipo de cabello: forma del rostro, textura, densidad, cortes recomendados, longitudes y consejos de styling.",
            "title": "Nano Banana Prompt: Generador de Infografia Guia de Peinados | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K de analisis de peinado titulado '{topic}'. El diseno estructurado incluye analisis del cabello (forma del rostro, textura, densidad), peinados recomendados vs no recomendados, longitudes y consejos de styling con ilustraciones realistas. Estetica editorial profesional util en salon y en casa.",
                "who": "Adecuado para estilistas, propietarios de salones, creadores de contenido de belleza, blogueros de moda, marcas de cuidado personal masculino / femenino, creadores en Pinterest y educadores de cuidado capilar.",
                "how": [
                    "Introduce un tema de peinado en {topic} (ej. Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "El poster genera secciones de forma del rostro, textura y densidad.",
                    "Peinados recomendados, longitudes y consejos de styling aparecen con ilustraciones realistas.",
                    "Se genera una infografia vertical 4K profesional de guia de peinados."
                ],
                "prompts": [
                    "Genera una infografia Men's Wavy Medium Hair Guide.",
                    "Crea una guia Women's Curly Long Hair con forma del rostro y styling.",
                    "Genera una infografia Women's Korean Short Hair Guide."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Resumen Visual de Libro de Autoayuda",
            "description": "Crea un resumen visual infografico ilustrado para cualquier libro de autoayuda — ilustracion central de camino serpenteante con conceptos clave e ideas a lo largo del viaje.",
            "title": "Nano Banana Prompt: Generador de Resumen Visual de Libro de Autoayuda | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K de resumen de libro ilustrado titulado '{topic}'. El diseno centra una ilustracion de camino serpenteante de montana, rodeada por conceptos clave, definiciones, procesos e ideas del libro. La metafora del viaje refuerza el mensaje visualmente y entrega un resumen digestible de un vistazo.",
                "who": "Adecuado para blogueros de libros, creadores de BookTok / Booktube, lectores que toman notas, coaches de crecimiento personal, autores creando materiales complementarios y creadores en Pinterest.",
                "how": [
                    "Introduce un titulo de libro de autoayuda en {topic} (ej. The Mountain Is You, Atomic Habits).",
                    "El poster genera una ilustracion central de camino serpenteante de montana.",
                    "Conceptos clave, definiciones, procesos e ideas del libro se mapean a lo largo del viaje.",
                    "Se genera un poster vertical 4K ilustrado de resumen visual de libro."
                ],
                "prompts": [
                    "Genera una infografia resumen visual de 'The Mountain Is You'.",
                    "Crea un poster resumen ilustrado de 'Atomic Habits'.",
                    "Genera una infografia resumen visual de 'Mindset' (Carol Dweck)."
                ]
            }}
        }
    },
    "fr": {
        "template-professional-category-guide-infographic": {
            "category": "Guide de Categorie Professionnelle",
            "description": "Creez une affiche d'infographie pedagogique epuree et minimaliste pour toute categorie professionnelle: styles d'amenagement interieur, accords mets-vins, preparation du cafe, soin des plantes et plus.",
            "title": "Nano Banana Prompt: Generateur d'Infographie Guide de Categorie Professionnelle | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K minimaliste intitulee 'Professional {topic} Guide'. La mise en page multi-sections inclut des photos haute qualite en 3 colonnes par categorie, des etiquettes claires et de courtes descriptions. Typographie soignee et esthetique editoriale polie adaptee a la reference distribuee ou a l'affichage mural.",
                "who": "Convient aux designers editoriaux, formateurs de marque, equipes retail / hotelerie, createurs Pinterest, services professionnels qui visualisent leurs categories et toute personne produisant des guides thematiques cures.",
                "how": [
                    "Saisissez un sujet dans {topic} (ex. Interior Design Styles, Wine Pairing, Plant Care).",
                    "L'affiche genere une mise en page multi-sections avec photos en grilles de 3 colonnes.",
                    "Chaque categorie est etiquetee avec une typographie claire et une courte description.",
                    "Une affiche verticale 4K minimaliste de guide de categorie professionnelle est generee."
                ],
                "prompts": [
                    "Generez une affiche guide professionnelle Styles d'Amenagement Interieur.",
                    "Creez une infographie Guide d'Accords Mets-Vins avec sections par categorie.",
                    "Generez un Guide de Soin des Plantes avec grilles de photos."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "Affiche Anime de Groupe MBTI",
            "description": "Creez une affiche stylisee de personnages anime pour tout groupe MBTI (Analystes, Diplomates, Sentinelles, Explorateurs) avec 4 personnages plein corps dans une palette unifiee.",
            "title": "Nano Banana Prompt: Generateur d'Affiche Anime de Groupe MBTI | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K stylisee anime intitulee 'MBTI {topic}'. Quatre personnages anime plein corps representent les types du groupe, tous habilles dans une palette unifiee. En dessous, de petites figures low-poly et les codes MBTI 4 lettres (ex. INTJ, INTP, ENTJ, ENTP) identifient chaque type.",
                "who": "Convient aux createurs de contenu MBTI, fans d'anime/manga, passionnes de personnalite, designers fan-art, comptes sociaux personnalite et toute personne produisant du contenu MBTI partageable.",
                "how": [
                    "Saisissez un groupe MBTI dans {topic} (ex. Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "L'affiche genere 4 personnages anime dans une palette unifiee pour le groupe.",
                    "En dessous apparaissent des figures low-poly et les codes MBTI 4 lettres.",
                    "Une affiche verticale 4K stylisee anime de groupe MBTI est generee."
                ],
                "prompts": [
                    "Generez une affiche Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI anime.",
                    "Creez une affiche Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI.",
                    "Generez une affiche Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI anime."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Infographie Developpement Personnel",
            "description": "Creez une infographie developpement personnel joyeuse et illustree avec icones numerotees pour tout sujet d'amelioration: habitudes, routines, changements de mentalite et plus.",
            "title": "Nano Banana Prompt: Generateur d'Infographie Developpement Personnel | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K joyeuse de developpement personnel intitulee '{topic}'. La mise en page est une grille d'icones circulaires numerotees, chacune avec une petite illustration cartoon de l'activite, accompagnee d'un titre clair et d'une explication courte. Style illustratif lumineux et typographie amicale faciles a partager.",
                "who": "Convient aux createurs de contenu developpement personnel, coachs bien-etre, blogueurs productivite, educateurs sante mentale, comptes sociaux croissance personnelle et createurs Pinterest.",
                "how": [
                    "Saisissez un sujet dans {topic} (ex. How to Get Unstuck in Life, Habits That Pay Off).",
                    "L'affiche genere une grille d'icones circulaires numerotees avec illustrations cartoon.",
                    "Chaque icone est associee a un titre clair et une description actionnable courte.",
                    "Une affiche verticale 4K joyeuse illustree de developpement personnel est generee."
                ],
                "prompts": [
                    "Generez une infographie How to Get Unstuck in Life.",
                    "Creez une affiche illustree Habits That Pay Off.",
                    "Generez une infographie illustree Toxic Habits to Quit."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Infographie Guide Coiffure",
            "description": "Creez une affiche professionnelle d'analyse de coiffure pour tout type de cheveux: forme du visage, texture, densite, coupes recommandees, longueurs et conseils de coiffage.",
            "title": "Nano Banana Prompt: Generateur d'Infographie Guide Coiffure | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K d'analyse coiffure intitulee '{topic}'. La mise en page structuree inclut analyse capillaire (forme du visage, texture, densite), coiffures recommandees vs non recommandees, longueurs et conseils de coiffage avec illustrations realistes. Esthetique editoriale professionnelle utile en salon et a la maison.",
                "who": "Convient aux coiffeurs, proprietaires de salons, createurs de contenu beaute, blogueurs mode, marques de soin homme/femme, createurs Pinterest et educateurs de soins capillaires.",
                "how": [
                    "Saisissez un sujet dans {topic} (ex. Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "L'affiche genere des sections analyse forme du visage, texture et densite.",
                    "Coiffures recommandees, longueurs et conseils apparaissent avec illustrations realistes.",
                    "Une infographie verticale 4K professionnelle de guide coiffure est generee."
                ],
                "prompts": [
                    "Generez une infographie Men's Wavy Medium Hair Guide.",
                    "Creez un guide Women's Curly Long Hair avec forme du visage et coiffage.",
                    "Generez une infographie Women's Korean Short Hair Guide."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Resume Visuel de Livre Developpement",
            "description": "Creez un resume visuel infographique illustre pour tout livre de developpement personnel — illustration centrale de chemin sinueux avec concepts cles et idees le long du parcours.",
            "title": "Nano Banana Prompt: Generateur de Resume Visuel de Livre Developpement | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K de resume de livre illustre intitulee '{topic}'. La mise en page centre une illustration de chemin de montagne sinueux, entouree de concepts cles, definitions, processus et idees du livre. La metaphore du voyage renforce le message visuellement et offre un resume digestible d'un coup d'oeil.",
                "who": "Convient aux blogueurs livres, createurs BookTok / Booktube, lecteurs prenant des notes, coachs croissance personnelle, auteurs creant des supports complementaires et createurs Pinterest.",
                "how": [
                    "Saisissez un titre de livre dans {topic} (ex. The Mountain Is You, Atomic Habits).",
                    "L'affiche genere une illustration centrale de chemin de montagne sinueux.",
                    "Concepts cles, definitions, processus et idees du livre sont places le long du parcours.",
                    "Une affiche verticale 4K illustree de resume visuel de livre est generee."
                ],
                "prompts": [
                    "Generez une infographie resume visuel de 'The Mountain Is You'.",
                    "Creez une affiche resume illustree de 'Atomic Habits'.",
                    "Generez une infographie resume visuel de 'Mindset' (Carol Dweck)."
                ]
            }}
        }
    },
    "hi": {
        "template-professional-category-guide-infographic": {
            "category": "व्यावसायिक श्रेणी गाइड",
            "description": "किसी भी व्यावसायिक श्रेणी (आंतरिक डिज़ाइन शैलियाँ, वाइन पेयरिंग, कॉफी ब्रूइंग, पौधों की देखभाल आदि) के लिए स्वच्छ, मिनिमलिस्ट शैक्षिक इन्फोग्राफिक पोस्टर बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: व्यावसायिक श्रेणी गाइड इन्फोग्राफिक जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट 'Professional {topic} Guide' शीर्षक वाला 4K वर्टिकल मिनिमलिस्ट गाइड पोस्टर तैयार करता है। बहु-अनुभाग ग्रिड में प्रति श्रेणी 3 कॉलम में उच्च गुणवत्ता वाली तस्वीरें, स्पष्ट लेबल और संक्षिप्त विवरण हैं। साफ टाइपोग्राफी और परिष्कृत संपादकीय सौंदर्य संदर्भ या दीवार प्रदर्शन के लिए उपयुक्त हैं।",
                "who": "संपादकीय डिज़ाइनरों, ब्रांड शिक्षकों, रिटेल/हॉस्पिटैलिटी टीमों, Pinterest क्रिएटर्स, अपनी श्रेणियों को दृश्य रूप से दिखाने वाली पेशेवर सेवाओं और चयनित विषय गाइड बनाने वालों के लिए उपयुक्त।",
                "how": [
                    "{topic} में विषय दर्ज करें (जैसे Interior Design Styles, Wine Pairing, Plant Care)।",
                    "पोस्टर बहु-अनुभाग लेआउट और 3-कॉलम फोटो ग्रिड स्वचालित रूप से तैयार करता है।",
                    "प्रत्येक श्रेणी को स्पष्ट टाइपोग्राफी और संक्षिप्त विवरण के साथ लेबल किया जाता है।",
                    "4K वर्टिकल मिनिमलिस्ट व्यावसायिक श्रेणी गाइड पोस्टर तैयार करें।"
                ],
                "prompts": [
                    "Interior Design Styles के लिए व्यावसायिक गाइड पोस्टर तैयार करें।",
                    "श्रेणी अनुभागों के साथ Wine Pairing Guide इन्फोग्राफिक बनाएं।",
                    "फोटो-ग्रिड श्रेणियों के साथ Plant Care Guide तैयार करें।"
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI ग्रुप एनिमे पोस्टर",
            "description": "किसी भी MBTI समूह (एनालिस्ट्स, डिप्लोमैट्स, सेंटिनल्स, एक्सप्लोरर्स) के लिए एकीकृत रंग पैलेट में 4 पूर्ण-शरीर पात्रों के साथ स्टाइलिश एनिमे पात्र पोस्टर बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: MBTI ग्रुप एनिमे पात्र पोस्टर जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट 'MBTI {topic}' शीर्षक वाला 4K वर्टिकल स्टाइलिश एनिमे पोस्टर तैयार करता है। चार पूर्ण-शरीर एनिमे पात्र समूह के प्रकारों का प्रतिनिधित्व करते हैं, सभी एकीकृत रंग पैलेट में। पात्रों के नीचे, छोटी low-poly आकृतियाँ और MBTI 4-अक्षर लेबल (जैसे INTJ, INTP, ENTJ, ENTP) प्रत्येक प्रकार की पहचान करते हैं।",
                "who": "MBTI कंटेंट क्रिएटर्स, एनिमे/मंगा प्रशंसकों, व्यक्तित्व उत्साही, fan-art डिज़ाइनरों, MBTI केंद्रित सोशल मीडिया खातों और साझा करने योग्य MBTI समूह कंटेंट बनाने वालों के लिए उपयुक्त।",
                "how": [
                    "{topic} में MBTI समूह दर्ज करें (जैसे Analysts Group (INTJ, INTP, ENTJ, ENTP))।",
                    "पोस्टर उस समूह के 4 एनिमे पात्र एकीकृत रंग पैलेट में स्वचालित रूप से तैयार करता है।",
                    "पात्रों के नीचे low-poly आकृतियाँ और MBTI 4-अक्षर कोड प्रत्येक प्रकार को लेबल करते हैं।",
                    "4K वर्टिकल स्टाइलिश एनिमे MBTI समूह पोस्टर तैयार करें।"
                ],
                "prompts": [
                    "Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI एनिमे पोस्टर तैयार करें।",
                    "Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI पात्र पोस्टर बनाएं।",
                    "Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI एनिमे पोस्टर तैयार करें।"
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "स्व-सहायता इन्फोग्राफिक",
            "description": "जीवन सुधार के किसी भी विषय (आदतें, दिनचर्या, मानसिकता परिवर्तन आदि) के लिए संख्यांकित कार्टून आइकन के साथ हर्षित, सचित्र स्व-सहायता इन्फोग्राफिक बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: स्व-सहायता इन्फोग्राफिक पोस्टर जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाला 4K वर्टिकल हर्षित स्व-सहायता पोस्टर तैयार करता है। लेआउट संख्यांकित गोलाकार आइकन का ग्रिड है, प्रत्येक में गतिविधि/आदत का छोटा कार्टून चित्रण, स्पष्ट शीर्षक और संक्षिप्त व्याख्या। उज्ज्वल चित्रण शैली और मित्रवत टाइपोग्राफी इसे साझा करना आसान बनाती हैं।",
                "who": "स्व-सहायता कंटेंट क्रिएटर्स, वेलनेस कोचों, उत्पादकता ब्लॉगरों, मानसिक स्वास्थ्य शिक्षकों, व्यक्तिगत विकास केंद्रित सोशल मीडिया खातों और Pinterest क्रिएटर्स के लिए उपयुक्त।",
                "how": [
                    "{topic} में स्व-सहायता विषय दर्ज करें (जैसे How to Get Unstuck in Life, Habits That Pay Off)।",
                    "पोस्टर कार्टून चित्रों के साथ संख्यांकित गोलाकार आइकन का ग्रिड स्वचालित रूप से तैयार करता है।",
                    "प्रत्येक आइकन को स्पष्ट शीर्षक और संक्षिप्त कार्ययोग्य विवरण के साथ जोड़ा जाता है।",
                    "4K वर्टिकल हर्षित सचित्र स्व-सहायता इन्फोग्राफिक पोस्टर तैयार करें।"
                ],
                "prompts": [
                    "How to Get Unstuck in Life स्व-सहायता इन्फोग्राफिक तैयार करें।",
                    "Habits That Pay Off सचित्र स्व-सहायता पोस्टर बनाएं।",
                    "Toxic Habits to Quit सचित्र इन्फोग्राफिक तैयार करें।"
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "हेयरस्टाइल गाइड इन्फोग्राफिक",
            "description": "किसी भी बाल प्रकार के लिए पेशेवर हेयरस्टाइल विश्लेषण पोस्टर बनाएं: चेहरे का आकार, बनावट, घनत्व, अनुशंसित कट, लंबाई और स्टाइलिंग टिप्स।",
            "title": "Nano Banana प्रॉम्प्ट: हेयरस्टाइल गाइड इन्फोग्राफिक जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाला 4K वर्टिकल हेयरस्टाइल विश्लेषण पोस्टर तैयार करता है। संरचित लेआउट में बाल विश्लेषण (चेहरे का आकार, बनावट, घनत्व), अनुशंसित बनाम गैर-अनुशंसित हेयरस्टाइल, लंबाई और स्टाइलिंग टिप्स यथार्थवादी चित्रों के साथ शामिल हैं। पेशेवर संपादकीय सौंदर्य सैलून और घरेलू उपयोग दोनों के लिए उपयुक्त।",
                "who": "हेयर स्टाइलिस्टों, सैलून मालिकों, सौंदर्य कंटेंट क्रिएटर्स, फैशन ब्लॉगरों, पुरुष/महिला ग्रूमिंग ब्रांडों, Pinterest क्रिएटर्स और बाल देखभाल शैक्षिक कंटेंट बनाने वालों के लिए उपयुक्त।",
                "how": [
                    "{topic} में हेयरस्टाइल विषय दर्ज करें (जैसे Men's Wavy Hair Guide, Women's Curly Long Hair Guide)।",
                    "पोस्टर चेहरे का आकार, बनावट और घनत्व विश्लेषण अनुभाग स्वचालित रूप से तैयार करता है।",
                    "अनुशंसित हेयरस्टाइल, लंबाई और स्टाइलिंग टिप्स यथार्थवादी चित्रों के साथ दिखाई देते हैं।",
                    "4K वर्टिकल पेशेवर हेयरस्टाइल गाइड इन्फोग्राफिक तैयार करें।"
                ],
                "prompts": [
                    "Men's Wavy Medium Hair Guide इन्फोग्राफिक तैयार करें।",
                    "चेहरे के आकार और स्टाइलिंग के साथ Women's Curly Long Hair Guide बनाएं।",
                    "Women's Korean Short Hair Guide इन्फोग्राफिक तैयार करें।"
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "स्व-सहायता पुस्तक दृश्य सारांश",
            "description": "किसी भी स्व-सहायता पुस्तक के लिए सचित्र दृश्य सारांश इन्फोग्राफिक बनाएं — केंद्रीय घुमावदार पथ चित्रण के साथ यात्रा में मुख्य अवधारणाएँ और अंतर्दृष्टि।",
            "title": "Nano Banana प्रॉम्प्ट: स्व-सहायता पुस्तक दृश्य सारांश जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाला 4K वर्टिकल सचित्र पुस्तक सारांश पोस्टर तैयार करता है। लेआउट केंद्रीय घुमावदार पर्वत पथ चित्रण को केंद्रित करता है, जिसके चारों ओर पुस्तक की मुख्य अवधारणाएँ, परिभाषाएँ, प्रक्रियाएँ और अंतर्दृष्टि हैं। यात्रा का रूपक पुस्तक के संदेश को दृश्य रूप से सुदृढ़ करता है, साथ ही एक पाचक एक नज़र सारांश देता है।",
                "who": "पुस्तक ब्लॉगरों, BookTok/Booktube क्रिएटर्स, पुस्तक नोट्स बनाने वाले स्व-सहायता पाठकों, व्यक्तिगत विकास कोचों, पूरक सामग्री बनाने वाले लेखकों और Pinterest क्रिएटर्स के लिए उपयुक्त।",
                "how": [
                    "{topic} में स्व-सहायता पुस्तक का शीर्षक दर्ज करें (जैसे The Mountain Is You, Atomic Habits)।",
                    "पोस्टर केंद्रीय घुमावदार पर्वत पथ चित्रण स्वचालित रूप से तैयार करता है।",
                    "पुस्तक की मुख्य अवधारणाएँ, परिभाषाएँ, प्रक्रियाएँ और अंतर्दृष्टि यात्रा में मैप होती हैं।",
                    "4K वर्टिकल सचित्र दृश्य पुस्तक सारांश इन्फोग्राफिक पोस्टर तैयार करें।"
                ],
                "prompts": [
                    "'The Mountain Is You' दृश्य पुस्तक सारांश इन्फोग्राफिक तैयार करें।",
                    "'Atomic Habits' सचित्र पुस्तक सारांश पोस्टर बनाएं।",
                    "'Mindset' (Carol Dweck) दृश्य पुस्तक सारांश इन्फोग्राफिक तैयार करें।"
                ]
            }}
        }
    },
    "ja": {
        "template-professional-category-guide-infographic": {
            "category": "プロフェッショナル分野ガイド",
            "description": "インテリアデザインスタイル、ワインペアリング、コーヒー抽出、植物ケアなど、あらゆるプロフェッショナル分野向けのクリーンでミニマルな教育インフォグラフィックポスターを作成します。",
            "title": "Nano Bananaプロンプト:プロフェッショナル分野ガイドインフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは 'Professional {topic} Guide' を題名にした4K縦型ミニマルガイドポスターを生成します。多セクションのグリッドレイアウトで、各分野ごとに3列の高品質写真、明確なラベル、短い説明が並びます。クリーンなタイポグラフィと洗練されたエディトリアル美学で、配布資料にも壁面表示にも使えます。",
                "who": "エディトリアルデザイナー、ブランド研修担当、リテール/ホスピタリティの顧客向け資料制作チーム、Pinterestクリエイター、自身のカテゴリを可視化したいプロフェッショナル、テーマ別ガイドを作る制作者に最適。",
                "how": [
                    "{topic} に主題を入力(例:Interior Design Styles、Wine Pairing、Plant Care)。",
                    "ポスターが3列写真グリッドの多セクションレイアウトを自動生成します。",
                    "各分野は明確なタイポグラフィと短い説明でラベル付けされます。",
                    "4K縦型ミニマルなプロフェッショナル分野ガイドポスターを生成します。"
                ],
                "prompts": [
                    "Interior Design Styles のプロフェッショナルガイドポスターを生成。",
                    "分野セクション付きの Wine Pairing Guide インフォグラフィックを作成。",
                    "写真グリッド分野の Plant Care Guide を生成。"
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTIグループアニメポスター",
            "description": "MBTIの各グループ(アナリスト、ディプロマット、センチネル、エクスプローラー)向けに、統一カラーパレットで4体の全身アニメキャラクターを配した、スタイリッシュなアニメポスターを作成します。",
            "title": "Nano Bananaプロンプト:MBTIグループアニメキャラクターポスタージェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは 'MBTI {topic}' を題名にした4K縦型スタイリッシュアニメポスターを生成します。4体の全身アニメキャラクターがグループ内の各タイプを表し、テーマに合わせた統一カラーパレットで配色。キャラクターの下には小さなローポリ人形とMBTI4文字ラベル(例:INTJ、INTP、ENTJ、ENTP)が各タイプを明示します。",
                "who": "MBTIコンテンツクリエイター、アニメ/マンガファン、性格論愛好家、ファンアートデザイナー、MBTI関連SNSアカウント、シェアしやすいMBTIグループ素材を作る人に最適。",
                "how": [
                    "{topic} にMBTIグループを入力(例:Analysts Group (INTJ, INTP, ENTJ, ENTP))。",
                    "ポスターが該当グループの4体のアニメキャラクターを統一カラーパレットで自動生成。",
                    "キャラクターの下にローポリ人形とMBTI4文字コードが各タイプを示します。",
                    "4K縦型スタイリッシュアニメMBTIグループポスターを生成します。"
                ],
                "prompts": [
                    "Analysts Group (INTJ, INTP, ENTJ, ENTP) のMBTIアニメポスターを生成。",
                    "Diplomats Group (INFJ, INFP, ENFJ, ENFP) のMBTIキャラクターポスターを作成。",
                    "Explorers Group (ISTP, ISFP, ESTP, ESFP) のMBTIアニメポスターを生成。"
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "セルフヘルプ インフォグラフィック",
            "description": "習慣、ルーチン、マインドセット転換など、あらゆる人生改善トピック向けに、ナンバリングされたカートゥーンアイコンを使った明るく親しみやすいセルフヘルプインフォグラフィックを作成します。",
            "title": "Nano Bananaプロンプト:セルフヘルプインフォグラフィックポスタージェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした4K縦型の明るいセルフヘルプポスターを生成します。レイアウトは番号付き円形アイコンのグリッドで、各アイコンには活動/習慣の小さなカートゥーンイラストが入り、明確なタイトルと短い説明が並びます。明るいイラスト調と親しみやすいタイポグラフィでシェアしやすい構成です。",
                "who": "セルフヘルプ系コンテンツクリエイター、ウェルネスコーチ、生産性ブロガー、メンタルヘルス教育者、自己成長系SNSアカウント、行動指針ポスターを作るPinterestクリエイターに最適。",
                "how": [
                    "{topic} にセルフヘルプ主題を入力(例:How to Get Unstuck in Life、Habits That Pay Off)。",
                    "ポスターがカートゥーンイラスト付きの番号付き円形アイコングリッドを自動生成。",
                    "各アイコンは明確なタイトルと短い行動指針説明と組み合わされます。",
                    "4K縦型の明るいイラスト調セルフヘルプインフォグラフィックポスターを生成します。"
                ],
                "prompts": [
                    "How to Get Unstuck in Life のセルフヘルプインフォグラフィックを生成。",
                    "Habits That Pay Off のイラスト調セルフヘルプポスターを作成。",
                    "Toxic Habits to Quit のイラスト調インフォグラフィックを生成。"
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "ヘアスタイルガイド インフォグラフィック",
            "description": "あらゆる髪質向けの専門的なヘアスタイル分析ポスターを作成。顔型、テクスチャ、密度の分析、推奨カット、長さ、スタイリングのコツを掲載します。",
            "title": "Nano Bananaプロンプト:ヘアスタイルガイドインフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした4K縦型ヘアスタイル分析ポスターを生成します。構造化レイアウトに、ヘア分析(顔型、テクスチャ、密度)、推奨ヘア vs 非推奨ヘア、長さの推奨、スタイリングのコツがリアルなイラストと共に並びます。プロフェッショナルなエディトリアル美学で、サロン用にも自宅参考用にも使えます。",
                "who": "ヘアスタイリスト、サロンオーナー、ビューティーコンテンツクリエイター、ファッションブロガー、メンズ/レディースグルーミングブランド、Pinterestクリエイター、ヘアケア教育コンテンツを作る人に最適。",
                "how": [
                    "{topic} にヘアスタイル主題を入力(例:Men's Wavy Hair Guide、Women's Curly Long Hair Guide)。",
                    "ポスターが顔型・テクスチャ・密度の分析セクションを自動生成。",
                    "推奨ヘアスタイル、長さ、スタイリングのコツがリアルなイラストと共に表示。",
                    "4K縦型プロフェッショナルヘアスタイルガイドインフォグラフィックを生成します。"
                ],
                "prompts": [
                    "Men's Wavy Medium Hair Guide のインフォグラフィックを生成。",
                    "顔型とスタイリング付きの Women's Curly Long Hair Guide を作成。",
                    "Women's Korean Short Hair Guide のインフォグラフィックを生成。"
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "セルフヘルプ書籍 ビジュアル要約",
            "description": "セルフヘルプ書籍向けのイラスト調ビジュアル要約インフォグラフィックを作成。中心の蛇行する山道イラストに、書中の主要概念や洞察を配置します。",
            "title": "Nano Bananaプロンプト:セルフヘルプ書籍ビジュアル要約インフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした4K縦型のイラスト書籍要約ポスターを生成します。レイアウトは中心の蛇行する山道イラストを核に、その周囲に書中の主要概念、定義、プロセス、洞察を配置。旅というメタファーで書のメッセージを視覚的に強化しつつ、消化しやすい一目要約を提供します。",
                "who": "書評ブロガー、BookTok/Booktubeクリエイター、読書ノートを作るセルフヘルプ読者、自己成長コーチ、補助資料を作る著者、書籍要約を作るPinterestクリエイターに最適。",
                "how": [
                    "{topic} にセルフヘルプ書名を入力(例:The Mountain Is You、Atomic Habits)。",
                    "ポスターが中心の蛇行する山道イラストを自動生成。",
                    "書中の主要概念、定義、プロセス、洞察が旅の各点にマッピングされます。",
                    "4K縦型イラスト調ビジュアル書籍要約インフォグラフィックポスターを生成します。"
                ],
                "prompts": [
                    "'The Mountain Is You' のビジュアル書籍要約インフォグラフィックを生成。",
                    "'Atomic Habits' のイラスト書籍要約ポスターを作成。",
                    "'Mindset' (Carol Dweck) のビジュアル書籍要約インフォグラフィックを生成。"
                ]
            }}
        }
    },
    "ko": {
        "template-professional-category-guide-infographic": {
            "category": "전문 카테고리 가이드",
            "description": "인테리어 디자인 스타일, 와인 페어링, 커피 브루잉, 식물 관리 등 어떤 전문 카테고리든 깔끔하고 미니멀한 교육 인포그래픽 포스터를 생성하세요.",
            "title": "Nano Banana 프롬프트: 전문 카테고리 가이드 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 'Professional {topic} Guide' 제목의 4K 세로형 미니멀 가이드 포스터를 생성합니다. 다중 섹션 레이아웃에 카테고리별로 3열 고품질 사진, 명확한 라벨, 짧은 설명이 들어갑니다. 깔끔한 타이포그래피와 세련된 에디토리얼 미감으로 배포 자료나 벽면 전시에 모두 적합합니다.",
                "who": "에디토리얼 디자이너, 브랜드 교육 담당자, 리테일·호스피탈리티 팀의 고객용 참고 자료 제작자, Pinterest 크리에이터, 자신의 카테고리를 시각화하고 싶은 전문 서비스, 큐레이션된 주제별 가이드를 만드는 누구에게나 적합.",
                "how": [
                    "{topic} 에 주제를 입력 (예: Interior Design Styles, Wine Pairing, Plant Care).",
                    "포스터가 3열 사진 그리드의 다중 섹션 레이아웃을 자동 생성합니다.",
                    "각 카테고리에는 깔끔한 타이포그래피와 짧은 설명이 붙습니다.",
                    "4K 세로형 미니멀한 전문 카테고리 가이드 포스터가 생성됩니다."
                ],
                "prompts": [
                    "Interior Design Styles 전문 가이드 포스터를 생성.",
                    "카테고리 섹션이 있는 Wine Pairing Guide 인포그래픽을 생성.",
                    "사진 그리드 카테고리가 있는 Plant Care Guide를 생성."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI 그룹 애니메 포스터",
            "description": "MBTI 그룹(분석가, 외교관, 관리자, 탐험가)별로 통일된 컬러 팔레트에 4명의 전신 애니메 캐릭터를 배치한 스타일리시한 애니메 포스터를 생성하세요.",
            "title": "Nano Banana 프롬프트: MBTI 그룹 애니메 캐릭터 포스터 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 'MBTI {topic}' 제목의 4K 세로형 스타일리시 애니메 포스터를 생성합니다. 4명의 전신 애니메 캐릭터가 그룹의 각 유형을 대표하고, 모두 테마에 맞춘 통일 팔레트로 의상이 통일됩니다. 캐릭터 아래에는 작은 로우폴리 피규어와 MBTI 4글자 라벨(예: INTJ, INTP, ENTJ, ENTP)이 각 유형을 명확히 표시합니다.",
                "who": "MBTI 콘텐츠 크리에이터, 애니메·만화 팬, 성격 유형 애호가, 팬아트 디자이너, MBTI 중심 SNS 계정, 공유하기 좋은 MBTI 그룹 콘텐츠를 만드는 누구에게나 적합.",
                "how": [
                    "{topic} 에 MBTI 그룹을 입력 (예: Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "포스터가 해당 그룹의 4명의 애니메 캐릭터를 통일 팔레트로 자동 생성합니다.",
                    "캐릭터 아래에 로우폴리 피규어와 MBTI 4글자 코드가 각 유형을 라벨링합니다.",
                    "4K 세로형 스타일리시 애니메 MBTI 그룹 포스터가 생성됩니다."
                ],
                "prompts": [
                    "Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI 애니메 포스터를 생성.",
                    "Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI 캐릭터 포스터를 생성.",
                    "Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI 애니메 포스터를 생성."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "자기계발 인포그래픽",
            "description": "습관, 루틴, 마인드셋 변화 등 어떤 자기계발 주제든, 번호가 매겨진 카툰 아이콘이 있는 밝고 일러스트풍의 자기계발 인포그래픽을 생성하세요.",
            "title": "Nano Banana 프롬프트: 자기계발 인포그래픽 포스터 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목의 4K 세로형 밝은 자기계발 포스터를 생성합니다. 레이아웃은 번호가 매겨진 원형 아이콘 그리드이며, 각 아이콘 안에는 활동/습관의 작은 카툰 일러스트가 들어가고 명확한 제목과 짧은 설명이 따라옵니다. 밝은 일러스트 스타일과 친근한 타이포그래피로 쉽게 공유할 수 있습니다.",
                "who": "자기계발 콘텐츠 크리에이터, 웰니스 코치, 생산성 블로거, 정신 건강 교육자, 개인 성장 중심 SNS 계정, 실행 가능한 습관 포스터를 만드는 Pinterest 크리에이터에게 적합.",
                "how": [
                    "{topic} 에 자기계발 주제를 입력 (예: How to Get Unstuck in Life, Habits That Pay Off).",
                    "포스터가 카툰 일러스트가 있는 번호 매김 원형 아이콘 그리드를 자동 생성합니다.",
                    "각 아이콘에는 명확한 제목과 짧은 실행 설명이 결합됩니다.",
                    "4K 세로형 밝은 일러스트 자기계발 인포그래픽 포스터가 생성됩니다."
                ],
                "prompts": [
                    "How to Get Unstuck in Life 자기계발 인포그래픽을 생성.",
                    "Habits That Pay Off 일러스트 자기계발 포스터를 생성.",
                    "Toxic Habits to Quit 일러스트 인포그래픽을 생성."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "헤어스타일 가이드 인포그래픽",
            "description": "어떤 모발 유형이든 전문 헤어스타일 분석 포스터를 생성하세요. 얼굴형, 텍스처, 밀도 분석, 추천 컷, 길이, 스타일링 팁이 포함됩니다.",
            "title": "Nano Banana 프롬프트: 헤어스타일 가이드 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목의 4K 세로형 헤어스타일 분석 포스터를 생성합니다. 구조적 레이아웃에 모발 분석(얼굴형, 텍스처, 밀도), 추천 vs 비추천 헤어스타일, 길이 추천, 스타일링 팁이 사실적인 일러스트와 함께 포함됩니다. 전문적 에디토리얼 미감으로 살롱과 가정에서 모두 참고할 수 있습니다.",
                "who": "헤어 스타일리스트, 살롱 오너, 뷰티 콘텐츠 크리에이터, 패션 블로거, 남성·여성 그루밍 브랜드, Pinterest 크리에이터, 헤어 케어 교육 콘텐츠를 만드는 사람에게 적합.",
                "how": [
                    "{topic} 에 헤어스타일 주제를 입력 (예: Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "포스터가 얼굴형·텍스처·밀도 분석 섹션을 자동 생성합니다.",
                    "추천 헤어스타일, 길이, 스타일링 팁이 사실적인 일러스트와 함께 표시됩니다.",
                    "4K 세로형 전문 헤어스타일 가이드 인포그래픽이 생성됩니다."
                ],
                "prompts": [
                    "Men's Wavy Medium Hair Guide 인포그래픽을 생성.",
                    "얼굴형과 스타일링이 포함된 Women's Curly Long Hair Guide를 생성.",
                    "Women's Korean Short Hair Guide 인포그래픽을 생성."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "자기계발서 비주얼 요약",
            "description": "어떤 자기계발서든 일러스트풍 비주얼 요약 인포그래픽을 생성하세요. 중앙의 굽이치는 길 일러스트에 책의 핵심 개념과 통찰이 여정을 따라 배치됩니다.",
            "title": "Nano Banana 프롬프트: 자기계발서 비주얼 요약 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목의 4K 세로형 일러스트 책 요약 포스터를 생성합니다. 레이아웃은 중앙의 굽이치는 산길 일러스트를 중심으로, 책의 핵심 개념, 정의, 프로세스, 통찰이 그 주변에 배치됩니다. 여정이라는 은유가 책의 메시지를 시각적으로 강화하면서, 한눈에 소화 가능한 요약을 제공합니다.",
                "who": "북 블로거, BookTok/Booktube 크리에이터, 독서 노트를 만드는 자기계발 독자, 개인 성장 코치, 보조 자료를 만드는 작가, 책 요약을 만드는 Pinterest 크리에이터에게 적합.",
                "how": [
                    "{topic} 에 자기계발서 제목을 입력 (예: The Mountain Is You, Atomic Habits).",
                    "포스터가 중앙의 굽이치는 산길 일러스트를 자동 생성합니다.",
                    "책의 핵심 개념, 정의, 프로세스, 통찰이 여정을 따라 매핑됩니다.",
                    "4K 세로형 일러스트 비주얼 책 요약 인포그래픽 포스터가 생성됩니다."
                ],
                "prompts": [
                    "'The Mountain Is You' 비주얼 책 요약 인포그래픽을 생성.",
                    "'Atomic Habits' 일러스트 책 요약 포스터를 생성.",
                    "'Mindset' (Carol Dweck) 비주얼 책 요약 인포그래픽을 생성."
                ]
            }}
        }
    },
    "ru": {
        "template-professional-category-guide-infographic": {
            "category": "Профессиональный гид по категориям",
            "description": "Создайте чистый минималистичный образовательный постер-инфографику для любой профессиональной категории — стили интерьера, винные пары, заваривание кофе, уход за растениями и многое другое.",
            "title": "Nano Banana промпт: Генератор инфографики профессионального гида по категориям | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K-постер минималистичного гида с заголовком 'Professional {topic} Guide'. Многосекционный сетчатый макет содержит высококачественные фото в 3 столбцах на категорию, чёткие подписи и короткие описания. Чистая типографика и отточенная редакционная эстетика подходят как для раздаточных материалов, так и для настенного показа.",
                "who": "Подходит редакционным дизайнерам, бренд-педагогам, командам ретейла и хостеса, делающим клиентские материалы, Pinterest-авторам, профессиональным сервисам, визуализирующим свои категории, и всем, кто делает курируемые тематические гиды.",
                "how": [
                    "Введите тему в {topic} (например, Interior Design Styles, Wine Pairing, Plant Care).",
                    "Постер автоматически создаёт многосекционный макет с фото в сетках по 3 столбца.",
                    "Каждая категория сопровождается чёткой подписью и кратким описанием.",
                    "Создаётся вертикальный 4K минималистичный постер профессионального гида."
                ],
                "prompts": [
                    "Создайте профессиональный постер-гид Interior Design Styles.",
                    "Создайте инфографику Wine Pairing Guide с категориальными секциями.",
                    "Создайте Plant Care Guide с сетками фото по категориям."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "Аниме-постер группы MBTI",
            "description": "Создайте стилизованный аниме-постер с персонажами для любой группы MBTI (Аналитики, Дипломаты, Стражи, Исследователи) — 4 персонажа в полный рост в единой палитре.",
            "title": "Nano Banana промпт: Генератор аниме-постера группы MBTI | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K стилизованный аниме-постер с заголовком 'MBTI {topic}'. Четыре аниме-персонажа в полный рост представляют типы группы, все одеты в единой палитре, соответствующей теме. Под персонажами небольшие лоу-поли фигурки и MBTI 4-буквенные метки (например, INTJ, INTP, ENTJ, ENTP) чётко идентифицируют каждый тип.",
                "who": "Подходит MBTI-контент-мейкерам, фанатам аниме/манги, энтузиастам типологии личности, фан-арт-дизайнерам, тематическим соцсетям и всем, кто делает шеринговый MBTI-групповой контент.",
                "how": [
                    "Введите MBTI-группу в {topic} (например, Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "Постер автоматически создаёт 4 аниме-персонажа в единой палитре для этой группы.",
                    "Под персонажами появляются лоу-поли фигурки и MBTI 4-буквенные коды.",
                    "Создаётся вертикальный 4K стилизованный аниме-постер группы MBTI."
                ],
                "prompts": [
                    "Создайте Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI аниме-постер.",
                    "Создайте Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI-постер.",
                    "Создайте Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI аниме-постер."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Инфографика саморазвития",
            "description": "Создайте жизнерадостную иллюстрированную инфографику по саморазвитию с нумерованными мультяшными иконками для любой темы улучшения жизни — привычек, рутин, изменений мышления и многого другого.",
            "title": "Nano Banana промпт: Генератор инфографики-постера саморазвития | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K жизнерадостный постер саморазвития с заголовком '{topic}'. Макет — сетка нумерованных круглых иконок, каждая с небольшой мультяшной иллюстрацией активности или привычки, сопровождаемой чётким заголовком и кратким объяснением. Яркий иллюстративный стиль и дружелюбная типографика облегчают шеринг.",
                "who": "Подходит контент-мейкерам саморазвития, велнес-коучам, блогерам продуктивности, педагогам ментального здоровья, тематическим соцсетям личностного роста и Pinterest-авторам.",
                "how": [
                    "Введите тему саморазвития в {topic} (например, How to Get Unstuck in Life, Habits That Pay Off).",
                    "Постер автоматически создаёт сетку нумерованных круглых иконок с мультяшными иллюстрациями.",
                    "Каждая иконка сопровождается чётким заголовком и кратким действенным описанием.",
                    "Создаётся вертикальный 4K жизнерадостный иллюстрированный постер саморазвития."
                ],
                "prompts": [
                    "Создайте инфографику саморазвития How to Get Unstuck in Life.",
                    "Создайте иллюстрированный постер саморазвития Habits That Pay Off.",
                    "Создайте иллюстрированную инфографику Toxic Habits to Quit."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Инфографика гид по причёскам",
            "description": "Создайте профессиональный постер анализа причёски для любого типа волос — форма лица, текстура, плотность, рекомендуемые стрижки, длина и советы по укладке.",
            "title": "Nano Banana промпт: Генератор инфографики-гида по причёскам | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K постер анализа причёски с заголовком '{topic}'. Структурированный макет включает анализ волос (форма лица, текстура, плотность), рекомендуемые vs не рекомендуемые причёски, рекомендации по длине и советы по укладке с реалистичными иллюстрациями. Профессиональная редакционная эстетика подходит как для салона, так и для домашнего использования.",
                "who": "Подходит парикмахерам, владельцам салонов, бьюти-контент-мейкерам, фэшн-блогерам, мужским/женским грумминг-брендам, Pinterest-авторам и педагогам по уходу за волосами.",
                "how": [
                    "Введите тему причёски в {topic} (например, Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "Постер автоматически создаёт секции анализа формы лица, текстуры и плотности.",
                    "Рекомендуемые причёски, длины и советы по укладке появляются с реалистичными иллюстрациями.",
                    "Создаётся вертикальная 4K профессиональная инфографика-гид по причёскам."
                ],
                "prompts": [
                    "Создайте инфографику Men's Wavy Medium Hair Guide.",
                    "Создайте Women's Curly Long Hair Guide с формой лица и укладкой.",
                    "Создайте инфографику Women's Korean Short Hair Guide."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Визуальное резюме книги саморазвития",
            "description": "Создайте иллюстрированную инфографику визуального резюме для любой книги саморазвития — центральная иллюстрация извивающегося пути с ключевыми концепциями и инсайтами вдоль путешествия.",
            "title": "Nano Banana промпт: Генератор визуального резюме книги саморазвития | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K иллюстрированный постер резюме книги с заголовком '{topic}'. Макет центрирует иллюстрацию извивающейся горной тропы, окружённую ключевыми концепциями, определениями, процессами и инсайтами из книги. Метафора путешествия усиливает послание книги визуально, обеспечивая при этом усваиваемое резюме с одного взгляда.",
                "who": "Подходит книжным блогерам, BookTok/Booktube-авторам, читателям-саморазвитчикам, делающим заметки, коучам личностного роста, авторам, создающим вспомогательные материалы, и Pinterest-авторам книжных резюме.",
                "how": [
                    "Введите название книги саморазвития в {topic} (например, The Mountain Is You, Atomic Habits).",
                    "Постер автоматически создаёт центральную иллюстрацию извивающейся горной тропы.",
                    "Ключевые концепции, определения, процессы и инсайты из книги размещаются вдоль путешествия.",
                    "Создаётся вертикальный 4K иллюстрированный постер визуального резюме книги."
                ],
                "prompts": [
                    "Создайте инфографику визуального резюме 'The Mountain Is You'.",
                    "Создайте иллюстрированный постер резюме 'Atomic Habits'.",
                    "Создайте инфографику визуального резюме 'Mindset' (Carol Dweck)."
                ]
            }}
        }
    },
    "tr": {
        "template-professional-category-guide-infographic": {
            "category": "Profesyonel Kategori Rehberi",
            "description": "Ic mekan tasarim stilleri, sarap eslestirme, kahve demleme, bitki bakimi gibi her tur profesyonel kategori icin temiz, minimal egitim infografigi posteri olusturun.",
            "title": "Nano Banana Prompt: Profesyonel Kategori Rehber Infografik Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon 'Professional {topic} Guide' baslikli 4K dikey minimal rehber posteri uretir. Coklu bolum izgaralarinda her kategori icin 3 sutunda yuksek kaliteli fotograflar, net etiketler ve kisa aciklamalar yer alir. Temiz tipografi ve cilalanmis editorial estetigi hem dagitim hem duvar gosterimi icin uygundur.",
                "who": "Editorial tasarimcilar, marka egitmenleri, perakende/konaklama ekipleri, Pinterest ureticileri, kategorilerini gorsellestiren profesyonel hizmetler ve kuratoryal tema rehberleri ureten herkes icin uygundur.",
                "how": [
                    "{topic} alanina konu girin (orn. Interior Design Styles, Wine Pairing, Plant Care).",
                    "Poster, 3 sutunlu fotograf izgarali coklu bolum duzenini otomatik olusturur.",
                    "Her kategori temiz tipografi ve kisa aciklamayla etiketlenir.",
                    "4K dikey minimal profesyonel kategori rehber posteri uretilir."
                ],
                "prompts": [
                    "Interior Design Styles profesyonel rehber posteri olusturun.",
                    "Kategori bolumlu Wine Pairing Guide infografigi olusturun.",
                    "Fotograf izgara kategorili Plant Care Guide olusturun."
                ]
            }}
        },
        "template-mbti-group-anime-character-poster": {
            "category": "MBTI Grup Anime Posteri",
            "description": "Her MBTI grubu (Analistler, Diplomatlar, Sentineller, Kasifler) icin birlesik renk paletinde 4 tam boy karakterli stilize anime karakter posteri olusturun.",
            "title": "Nano Banana Prompt: MBTI Grup Anime Karakter Posteri Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon 'MBTI {topic}' baslikli 4K dikey stilize anime posteri uretir. Dort tam boy anime karakteri gruptaki tipleri temsil eder; hepsi temayla uyumlu birlesik bir renk paletinde giyinmistir. Karakterlerin altinda kucuk low-poly figurler ve MBTI 4 harfli etiketler (orn. INTJ, INTP, ENTJ, ENTP) her tipi acikca tanimlar.",
                "who": "MBTI icerigi ureticileri, anime/manga hayranlari, kisilik tipi meraklilari, fan art tasarimcilari, MBTI odakli sosyal medya hesaplari ve paylasilabilir MBTI grup icerigi uretenler icin uygundur.",
                "how": [
                    "{topic} alanina MBTI grubu girin (orn. Analysts Group (INTJ, INTP, ENTJ, ENTP)).",
                    "Poster gruba ait 4 anime karakteri birlesik renk paletinde otomatik olusturur.",
                    "Karakterlerin altinda low-poly figurler ve MBTI 4 harfli kodlar her tipi etiketler.",
                    "4K dikey stilize anime MBTI grup posteri uretilir."
                ],
                "prompts": [
                    "Analysts Group (INTJ, INTP, ENTJ, ENTP) MBTI anime posteri olusturun.",
                    "Diplomats Group (INFJ, INFP, ENFJ, ENFP) MBTI karakter posteri olusturun.",
                    "Explorers Group (ISTP, ISFP, ESTP, ESFP) MBTI anime posteri olusturun."
                ]
            }}
        },
        "template-self-help-infographic-poster": {
            "category": "Kisisel Gelisim Infografigi",
            "description": "Aliskanliklar, rutinler, zihniyet degisiklikleri gibi her tur kisisel gelisim konusu icin numaralandirilmis karikatur ikonlu, neseli ve resimli kisisel gelisim infografigi olusturun.",
            "title": "Nano Banana Prompt: Kisisel Gelisim Infografik Posteri Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli 4K dikey neseli kisisel gelisim posteri uretir. Yerlesim numaralandirilmis dairesel ikonlardan olusan bir izgaradir; her ikonun icinde aktivite/aliskanlik icin kucuk karikatur cizimi, net baslik ve kisa aciklama bulunur. Parlak resim tarzi ve samimi tipografi paylasimi kolaylastirir.",
                "who": "Kisisel gelisim icerik ureticileri, wellness koclari, verimlilik blog yazarlari, ruh sagligi egitimcileri, kisisel gelisim odakli sosyal medya hesaplari ve Pinterest ureticileri icin uygundur.",
                "how": [
                    "{topic} alanina kisisel gelisim konusu girin (orn. How to Get Unstuck in Life, Habits That Pay Off).",
                    "Poster karikatur ciizimli numaralandirilmis dairesel ikon izgarasini otomatik olusturur.",
                    "Her ikon net baslik ve kisa eyleme yonelik aciklamayla eslesir.",
                    "4K dikey neseli resimli kisisel gelisim infografigi posteri uretilir."
                ],
                "prompts": [
                    "How to Get Unstuck in Life kisisel gelisim infografigi olusturun.",
                    "Habits That Pay Off resimli kisisel gelisim posteri olusturun.",
                    "Toxic Habits to Quit resimli infografik olusturun."
                ]
            }}
        },
        "template-hairstyle-guide-infographic": {
            "category": "Sac Modeli Rehber Infografigi",
            "description": "Her sac tipi icin profesyonel sac modeli analiz posteri olusturun: yuz sekli, doku, yogunluk analizi, onerilen kesimler, uzunluk ve sekillendirme ipuclari.",
            "title": "Nano Banana Prompt: Sac Modeli Rehber Infografik Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli 4K dikey sac modeli analiz posteri uretir. Yapilandirilmis yerlesimde sac analizi (yuz sekli, doku, yogunluk), onerilen vs onerilmeyen sac modelleri, uzunluk onerileri ve sekillendirme ipuclari gercekci ciizimlerle birlikte yer alir. Profesyonel editorial estetigi hem salon hem ev kullanimina uygundur.",
                "who": "Sac stilistleri, salon sahipleri, guzellik icerigi ureticileri, moda blog yazarlari, erkek/kadin grooming markalari, Pinterest ureticileri ve sac bakimi egitim icerigi uretenler icin uygundur.",
                "how": [
                    "{topic} alanina sac modeli konusu girin (orn. Men's Wavy Hair Guide, Women's Curly Long Hair Guide).",
                    "Poster yuz sekli, doku ve yogunluk analiz bolumlerini otomatik olusturur.",
                    "Onerilen sac modelleri, uzunluklar ve sekillendirme ipuclari gercekci ciizimlerle gosterilir.",
                    "4K dikey profesyonel sac modeli rehber infografigi uretilir."
                ],
                "prompts": [
                    "Men's Wavy Medium Hair Guide infografigi olusturun.",
                    "Yuz sekli ve sekillendirme dahil Women's Curly Long Hair Guide olusturun.",
                    "Women's Korean Short Hair Guide infografigi olusturun."
                ]
            }}
        },
        "template-self-help-book-visual-summary-infographic": {
            "category": "Kisisel Gelisim Kitabi Gorsel Ozet",
            "description": "Her kisisel gelisim kitabi icin resimli gorsel ozet infografigi olusturun — merkezde kivrimli bir yol ciizimi, yolculuk boyunca yerlestirilmis ana kavramlar ve icgoruler.",
            "title": "Nano Banana Prompt: Kisisel Gelisim Kitabi Gorsel Ozet Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli 4K dikey resimli kitap ozeti posteri uretir. Yerlesim merkezde kivrimli bir dag yolu ciizimini esas alir; etrafinda kitabin ana kavramlari, tanimlari, surecleri ve icgorularinden olusan unsurlar bulunur. Yolculuk metaforu kitabin mesajini gorsel olarak pekistirirken bir bakista anlasilir bir ozet sunar.",
                "who": "Kitap blog yazarlari, BookTok/Booktube ureticileri, kitap notu cikaran kisisel gelisim okuyuculari, kisisel gelisim koclari, ek materyal hazirlayan yazarlar ve kitap ozetleri ureten Pinterest ureticileri icin uygundur.",
                "how": [
                    "{topic} alanina kisisel gelisim kitap basligi girin (orn. The Mountain Is You, Atomic Habits).",
                    "Poster merkezde kivrimli dag yolu ciizimini otomatik olusturur.",
                    "Kitabin ana kavramlari, tanimlari, surecleri ve icgoruleri yolculuk boyunca haritalanir.",
                    "4K dikey resimli gorsel kitap ozeti infografigi posteri uretilir."
                ],
                "prompts": [
                    "'The Mountain Is You' gorsel kitap ozeti infografigi olusturun.",
                    "'Atomic Habits' resimli kitap ozeti posteri olusturun.",
                    "'Mindset' (Carol Dweck) gorsel kitap ozeti infografigi olusturun."
                ]
            }}
        }
    },
}

# Sanity-check: every locale must contain every template_id
for locale in LOCALES:
    if locale not in entries:
        raise SystemExit(f"missing locale {locale} in entries dict")
    missing = [tid for tid in template_ids if tid not in entries[locale]]
    if missing:
        raise SystemExit(f"locale {locale} missing template_ids: {missing}")

for locale in LOCALES:
    path = MESSAGES / locale / "nano.json"
    with open(path) as f:
        data = json.load(f)
    for tid in template_ids:
        data[tid] = entries[locale][tid]
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")
    print(f"Updated {path}")

print("All locales done")
