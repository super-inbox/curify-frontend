"""Append i18n entries for the 5 new templates added in hongjie28-patch-2.

Mirrors the structure of the previous batch script: dict[locale][template_id]
containing category / description / title / content.sections.{what,who,how,prompts}.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-verb-action-learning-cards",
    "template-pet-care-guide",
    "template-9-traits-info-grid",
    "template-english-phrasal-verb",
    "template-hairstyle-color-recommendation",
]

entries = {
    "en": {
        "template-verb-action-learning-cards": {
            "category": "Action Verb Learning Cards",
            "description": "Create a 3x3 grid of cartoon action verb learning cards with friendly illustrations and bold typography for any vocabulary theme.",
            "title": "Nano Banana Prompt: Action Verb Learning Cards Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a clean 3x3 grid of 9 individual learning cards on a white background. Each card shows a cartoon-style person performing an action paired with the corresponding verb in bold sans-serif. Warm muted colors and consistent character design make it ideal for ESL classrooms and kids' vocabulary practice.",
                "who": "Suitable for ESL teachers, language learning app designers, early childhood educators, parents teaching vocabulary, content creators making educational flashcards, and tutors preparing classroom materials.",
                "how": [
                    "Choose a learning theme (e.g., Basic Verbs & Actions, Everyday Activities, Emotions).",
                    "9 cards are auto-laid out in a 3x3 grid with consistent character design.",
                    "Each cell pairs a cartoon illustration with the verb in bold sans-serif typography.",
                    "Generate a vertical 4K children's-book-style flashcard poster."
                ],
                "prompts": [
                    "Generate Basic Verbs & Actions cards: run, jump, eat, sleep, read, write, walk, swim, dance.",
                    "Create Emotions & Expressions cards: happy, sad, angry, surprised, tired, excited, calm, confused, proud.",
                    "Generate Movement & Sports cards: kick, throw, catch, climb, ride, run, stretch, swim, jump."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Pet Care Infographic",
            "description": "Generate a complete 5-section pet care guide infographic for any pet type and age, with cartoon illustrations and emoji-driven bullet points.",
            "title": "Nano Banana Prompt: Pet Care Guide Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template produces a vertical pastel-background infographic poster covering Diet & Nutrition, Exercise, Health Care, Grooming, and Training & Socialization for any pet. Each section gets its own color, cartoon illustration, and emoji-driven bullet text — clean rounded section cards keep it scannable.",
                "who": "Suitable for pet adoption agencies, breeder accounts, veterinary clinics, pet supply brands, pet bloggers, new pet owners, and educational content creators.",
                "how": [
                    "Choose a pet type (e.g., British Shorthair Cat, Corgi Puppy, Labrador Dog).",
                    "Specify the age (e.g., 5-Month-Old, 1-Year-Old, Senior).",
                    "Five color-coded sections auto-fill with care advice tailored to type and age.",
                    "Generate a vertical 4K pastel infographic with cartoon illustrations."
                ],
                "prompts": [
                    "Generate a 5-Month-Old British Shorthair Cat care guide infographic.",
                    "Create a Senior Labrador Dog complete care guide poster.",
                    "Generate a 2-Month-Old Corgi Puppy care guide with all 5 sections."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9-Traits Infographic",
            "description": "Create a clean 3x3 trait grid infographic on any topic, each cell pairing a cartoon trait illustration with a bold title and short subtitle.",
            "title": "Nano Banana Prompt: 9-Traits Information Grid Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a square infographic poster titled '9 Traits of [Topic]' with 9 minimalist cartoon trait illustrations in a 3x3 grid. Each cell pairs a friendly illustration with a bold trait title and short descriptive subtitle — great for personal development, leadership, and self-help content.",
                "who": "Suitable for personal development creators, life coaches, leadership trainers, self-help authors, motivational social media accounts, HR teams, and content marketers.",
                "how": [
                    "Enter the infographic topic (e.g., Quality Partner, Leadership, Self-Improvement).",
                    "9 trait cells are auto-generated with cartoon illustrations and bold titles.",
                    "Minimalist line art on a white background keeps the layout clean and shareable.",
                    "Generate a square 4K infographic ready for Instagram, Pinterest, or LinkedIn."
                ],
                "prompts": [
                    "Generate '9 Traits of a Quality Partner' infographic with cartoon illustrations.",
                    "Create '9 Traits of Leadership' grid poster with trait titles and subtitles.",
                    "Generate '9 Traits of Self-Improvement' infographic for motivational sharing."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "English Phrasal Verb Poster",
            "description": "Generate an 8-phrase phrasal verb learning poster around any core verb, with example sentences and flat icons in a vertical list layout.",
            "title": "Nano Banana Prompt: English Phrasal Verb Learning Poster Generator | Curify AI",
            "content": {"sections": {
                "what": "This template creates a vertical educational poster titled '8 Phrases with [Verb]' on a light cream background. Each list item pairs a flat icon, the phrasal verb in bold blue, and a clear example sentence with the verb highlighted — ideal for ESL classrooms and self-study printables.",
                "who": "Suitable for ESL teachers, language tutors, language learning app designers, content creators making English learning printables, students preparing for English exams, and bilingual content creators.",
                "how": [
                    "Choose a core verb (e.g., BREAK, TAKE, GO, PUT).",
                    "8 phrasal verbs are auto-generated as a vertical list.",
                    "Each item shows an icon, the bold phrasal verb, and an example sentence.",
                    "Generate a vertical 4K cream-background printable poster."
                ],
                "prompts": [
                    "Generate '8 Phrases with BREAK' poster (break down, break up, break in, etc.).",
                    "Create '8 Phrases with TAKE' learning poster with example sentences.",
                    "Generate '8 Phrases with PUT' poster for ESL classroom display."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Hairstyle Recommendation Infographic",
            "description": "Use a reference portrait to generate a beauty guide poster showing 6 personalized hairstyle and hair-color recommendations in circular preview tiles.",
            "title": "Nano Banana Prompt: Hairstyle and Color Recommendation Generator | Curify AI",
            "content": {"sections": {
                "what": "This template uses a reference portrait to generate a beauty consultation poster. The original photo sits on the left at full size; the right shows 6 circular previews in a 2x3 grid, each rendering a different hairstyle and color inspired by the subject. Clean white background and consistent skin tone across all variants keep the focus on the styling.",
                "who": "Suitable for hairstylists, salon owners, beauty content creators, personal stylists, beauty app designers, anyone planning a hair makeover, and beauty consultants.",
                "how": [
                    "Upload a reference portrait of yourself or a client.",
                    "The template auto-generates 6 personalized hairstyle and color combinations.",
                    "Each preview is labeled with the hairstyle name and matching hair color.",
                    "Generate a high-resolution beauty consultation poster."
                ],
                "prompts": [
                    "Generate a hairstyle recommendation poster for an oval face shape with 6 styles.",
                    "Create a hairstyle and color guide for a round face with warm-toned recommendations.",
                    "Generate a beauty makeover poster with 6 trendy hairstyle options."
                ]
            }}
        }
    },
    "zh": {
        "template-verb-action-learning-cards": {
            "category": "动作动词学习卡",
            "description": "生成3x3卡通动作动词学习卡片网格，配以友好插图和粗体字体，适用于任何词汇主题。",
            "title": "Nano Banana 提示：动作动词学习卡生成器 | Curify AI",
            "content": {"sections": {
                "what": "该模板在白色背景上生成3x3的9张独立学习卡片。每张卡片展示卡通风格的人物动作，搭配粗体无衬线字体的动词。柔和暖色调和一致的角色设计，非常适合ESL课堂和儿童词汇练习。",
                "who": "适合ESL教师、语言学习应用设计师、幼儿教育工作者、教孩子词汇的家长、制作教育闪卡的内容创作者及备课的家教。",
                "how": [
                    "选择学习主题（如：基础动词与动作、日常活动、情绪表达）。",
                    "9张卡片自动以3x3网格布局，角色设计保持一致。",
                    "每个单元格搭配卡通插图和粗体无衬线字体的动词。",
                    "生成竖版4K儿童绘本风格的闪卡海报。"
                ],
                "prompts": [
                    "生成基础动词与动作卡：跑、跳、吃、睡、读、写、走、游泳、跳舞。",
                    "创建情绪表达卡：开心、悲伤、生气、惊讶、疲倦、兴奋、平静、困惑、骄傲。",
                    "生成动作与运动卡：踢、扔、接、爬、骑、跑、伸展、游泳、跳。"
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "宠物饲养指南信息图",
            "description": "为任何宠物类型和年龄生成完整的5部分宠物饲养指南信息图，配卡通插图和emoji要点。",
            "title": "Nano Banana 提示：宠物饲养指南信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "该模板生成竖版淡彩背景信息图海报，涵盖饮食营养、运动活动、健康护理、清洁美容、训练社交5个部分。每部分有独立配色、卡通插图和emoji要点 — 圆角白色卡片让内容易读易分享。",
                "who": "适合宠物领养机构、繁育者账号、兽医诊所、宠物用品品牌、宠物博主、新晋宠物主人和教育内容创作者。",
                "how": [
                    "选择宠物类型（如：英短猫、柯基幼犬、拉布拉多犬）。",
                    "指定年龄（如：5个月大、1岁、老年期）。",
                    "5个配色部分根据类型和年龄自动填充饲养建议。",
                    "生成竖版4K淡彩信息图，配卡通插图。"
                ],
                "prompts": [
                    "生成5个月大英短猫的完整饲养指南信息图。",
                    "创建老年拉布拉多犬完整饲养指南海报。",
                    "生成2个月大柯基幼犬5部分饲养指南。"
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9特质信息图",
            "description": "围绕任何主题创建简洁的3x3特质网格信息图，每格搭配卡通特质插图、粗体标题和简短副标题。",
            "title": "Nano Banana 提示：9特质信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "该模板生成方形信息图海报，标题为'[主题]的9个特质'，配以3x3网格中9张简约卡通特质插图。每格搭配友好插画、粗体特质标题和简短描述副标题 — 非常适合个人成长、领导力和自助类内容。",
                "who": "适合个人成长内容创作者、生活教练、领导力培训师、自助类作者、励志社交媒体账号、HR团队和内容营销人员。",
                "how": [
                    "输入信息图主题（如：优质伴侣、领导力、自我提升）。",
                    "9个特质单元格自动生成，配卡通插图和粗体标题。",
                    "白色背景上的极简线条艺术让布局简洁易分享。",
                    "生成方形4K信息图，适合Instagram、Pinterest、LinkedIn。"
                ],
                "prompts": [
                    "生成'优质伴侣的9个特质'信息图，配卡通插图。",
                    "创建'领导力的9个特质'网格海报，含特质标题和副标题。",
                    "生成'自我提升的9个特质'信息图，适合励志分享。"
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "英语短语动词海报",
            "description": "围绕任何核心动词生成包含8个短语的短语动词学习海报，配例句和扁平图标，采用竖版列表布局。",
            "title": "Nano Banana 提示：英语短语动词学习海报生成器 | Curify AI",
            "content": {"sections": {
                "what": "该模板生成竖版教育海报，标题为'[动词]的8个短语'，浅奶油色背景。每个列表项搭配扁平图标、粗体蓝色短语动词和清晰例句（动词部分加粗高亮）— 非常适合ESL课堂和自学打印用。",
                "who": "适合ESL教师、语言导师、语言学习应用设计师、制作英语学习打印资料的内容创作者、备考英语考试的学生和双语内容创作者。",
                "how": [
                    "选择核心动词（如：BREAK、TAKE、GO、PUT）。",
                    "8个短语动词自动生成为竖版列表。",
                    "每项展示图标、粗体短语动词和例句。",
                    "生成竖版4K奶油色背景打印海报。"
                ],
                "prompts": [
                    "生成'BREAK的8个短语'海报（break down、break up、break in等）。",
                    "创建'TAKE的8个短语'学习海报，含例句。",
                    "生成'PUT的8个短语'海报，适合ESL课堂展示。"
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "发型颜色推荐信息图",
            "description": "基于参考人像生成美妆指南海报，以圆形预览图展示6款个性化发型和发色推荐。",
            "title": "Nano Banana 提示：发型与颜色推荐生成器 | Curify AI",
            "content": {"sections": {
                "what": "该模板基于参考人像生成美妆咨询海报。原始照片置于左侧全尺寸展示；右侧2x3网格展示6张圆形预览，每张呈现受参考对象启发的不同发型和发色。干净的白色背景和所有变体一致的肤色，让重点聚焦在造型上。",
                "who": "适合发型师、沙龙店主、美妆内容创作者、个人造型师、美妆应用设计师、计划改造发型的人和美妆顾问。",
                "how": [
                    "上传你或客户的参考人像照片。",
                    "模板自动生成6种个性化发型与发色组合。",
                    "每张预览标注发型名称和对应发色。",
                    "生成高分辨率美妆咨询海报。"
                ],
                "prompts": [
                    "为鹅蛋脸生成发型推荐海报，含6款风格。",
                    "为圆脸创建发型与颜色指南，提供暖色调推荐。",
                    "生成美妆改造海报，含6款时尚发型选择。"
                ]
            }}
        }
    },
    "de": {
        "template-verb-action-learning-cards": {
            "category": "Aktionsverb-Lernkarten",
            "description": "Erstelle ein 3x3-Raster mit Cartoon-Aktionsverb-Lernkarten mit freundlichen Illustrationen und fetter Typografie fuer jedes Vokabelthema.",
            "title": "Nano Banana Prompt: Aktionsverb-Lernkarten-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein 3x3-Raster mit 9 Lernkarten auf weissem Hintergrund. Jede Karte zeigt eine Cartoon-Person, die eine Aktion ausfuehrt, mit dem Verb in fetter Sans-Serif-Schrift.",
                "who": "Geeignet fuer ESL-Lehrer, Sprachlern-App-Designer, Paedagogen im Vorschulbereich, Eltern und Tutoren.",
                "how": [
                    "Waehle ein Lernthema (z. B. Grundverben, Alltagsaktivitaeten, Emotionen).",
                    "9 Karten werden automatisch im 3x3-Raster angeordnet.",
                    "Jede Zelle kombiniert Cartoon-Illustration und fettgedrucktes Verb.",
                    "Generiere ein vertikales 4K-Lernkartenposter im Kinderbuchstil."
                ],
                "prompts": [
                    "Grundverben-Karten: laufen, springen, essen, schlafen, lesen, schreiben, gehen, schwimmen, tanzen.",
                    "Emotionen-Karten: gluecklich, traurig, wuetend, ueberrascht, muede, aufgeregt, ruhig, verwirrt, stolz.",
                    "Bewegungs-Karten: treten, werfen, fangen, klettern, reiten, laufen, dehnen, schwimmen, springen."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Haustier-Pflegeinfografik",
            "description": "Erstelle eine vollstaendige 5-Abschnitt-Haustier-Pflegeinfografik fuer jeden Tiertyp und jedes Alter mit Cartoon-Illustrationen.",
            "title": "Nano Banana Prompt: Haustier-Pflege-Infografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erstellt ein vertikales Pastell-Infografik-Poster mit 5 Abschnitten: Ernaehrung, Bewegung, Gesundheit, Pflege und Training & Sozialisation.",
                "who": "Geeignet fuer Tieradoptionsstellen, Zuechter, Tierkliniken, Heimtierbedarf-Marken, Tier-Blogger und neue Tierhalter.",
                "how": [
                    "Waehle den Tiertyp (z. B. Britisch Kurzhaar, Corgi-Welpe, Labrador).",
                    "Gib das Alter an (z. B. 5 Monate, 1 Jahr, Senior).",
                    "5 farbcodierte Abschnitte fuellen sich automatisch mit Pflegehinweisen.",
                    "Generiere eine vertikale 4K-Pastell-Infografik mit Cartoon-Illustrationen."
                ],
                "prompts": [
                    "Pflegeinfografik fuer eine 5 Monate alte Britisch Kurzhaar.",
                    "Pflegeinfografik fuer einen Senior Labrador.",
                    "Pflegeinfografik fuer einen 2 Monate alten Corgi-Welpen."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9-Eigenschaften Infografik",
            "description": "Erstelle eine 3x3-Eigenschaften-Rasterinfografik zu jedem Thema mit Cartoon-Illustrationen und fetten Titeln pro Zelle.",
            "title": "Nano Banana Prompt: 9-Eigenschaften-Infografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein quadratisches Infografik-Poster '9 Eigenschaften von [Thema]' mit 9 minimalistischen Cartoon-Illustrationen in einem 3x3-Raster.",
                "who": "Geeignet fuer Personal-Development-Creator, Life-Coaches, Fuehrungstrainer, Selbsthilfeautoren und Content-Marketer.",
                "how": [
                    "Gib das Thema ein (z. B. Qualitaetspartner, Fuehrung, Selbstverbesserung).",
                    "9 Eigenschaftszellen werden automatisch generiert.",
                    "Minimalistische Linienkunst auf weissem Hintergrund.",
                    "Generiere eine quadratische 4K-Infografik fuer Social Media."
                ],
                "prompts": [
                    "9 Eigenschaften eines Qualitaetspartners-Infografik.",
                    "9 Eigenschaften der Fuehrung-Rasterposter.",
                    "9 Eigenschaften der Selbstverbesserung-Infografik."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "Englisches Phrasal-Verb-Poster",
            "description": "Generiere ein 8-Phrasen-Phrasal-Verb-Lernposter um jedes Kernverb mit Beispielsaetzen und flachen Icons in vertikaler Liste.",
            "title": "Nano Banana Prompt: Englisches Phrasal-Verb-Lernposter-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erstellt ein vertikales Lernposter '8 Phrasen mit [Verb]' auf hellem Cremehintergrund mit flachen Icons und Beispielsaetzen.",
                "who": "Geeignet fuer ESL-Lehrer, Sprachtutoren, Sprachlern-App-Designer und Englisch-Lernende.",
                "how": [
                    "Waehle ein Kernverb (z. B. BREAK, TAKE, GO, PUT).",
                    "8 Phrasal Verbs werden als vertikale Liste generiert.",
                    "Jeder Eintrag zeigt Icon, Phrasal Verb und Beispielsatz.",
                    "Generiere ein vertikales 4K-Druckposter."
                ],
                "prompts": [
                    "8 Phrasen mit BREAK Poster.",
                    "8 Phrasen mit TAKE Lernposter.",
                    "8 Phrasen mit PUT Klassenzimmerposter."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Frisuren- und Farbempfehlungs-Infografik",
            "description": "Verwende ein Referenzportraet, um ein Beauty-Guide-Poster mit 6 personalisierten Frisur- und Farbempfehlungen in runden Vorschau-Kacheln zu erzeugen.",
            "title": "Nano Banana Prompt: Frisuren- und Farbempfehlungs-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage nutzt ein Referenzportraet, um ein Beauty-Beratungsposter zu generieren. Links Originalfoto, rechts 6 runde Vorschauen in einem 2x3-Raster mit unterschiedlichen Frisuren und Farben.",
                "who": "Geeignet fuer Friseure, Salonbesitzer, Beauty-Content-Creator, Personal Stylists und Beauty-Berater.",
                "how": [
                    "Lade ein Referenzportraet hoch.",
                    "Die Vorlage generiert 6 personalisierte Frisur- und Farbkombinationen.",
                    "Jede Vorschau wird mit Frisurname und Haarfarbe beschriftet.",
                    "Generiere ein hochaufloesendes Beauty-Beratungsposter."
                ],
                "prompts": [
                    "Frisurempfehlungsposter fuer ovales Gesicht mit 6 Stilen.",
                    "Frisur- und Farbguide fuer rundes Gesicht mit Warmton-Empfehlungen.",
                    "Beauty-Makeover-Poster mit 6 angesagten Frisuren."
                ]
            }}
        }
    },
    "es": {
        "template-verb-action-learning-cards": {
            "category": "Tarjetas de Aprendizaje de Verbos de Accion",
            "description": "Crea una cuadricula 3x3 de tarjetas de aprendizaje de verbos de accion con ilustraciones amigables y tipografia en negrita para cualquier tema de vocabulario.",
            "title": "Nano Banana Prompt: Generador de Tarjetas de Verbos de Accion | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera una cuadricula limpia 3x3 de 9 tarjetas individuales sobre fondo blanco. Cada tarjeta muestra un personaje de dibujos animados realizando una accion con el verbo en negrita.",
                "who": "Adecuado para profesores de ESL, disenadores de apps de idiomas, educadores infantiles, padres y creadores de contenido educativo.",
                "how": [
                    "Elige un tema de aprendizaje (p. ej., Verbos Basicos, Actividades Diarias, Emociones).",
                    "9 tarjetas se disponen automaticamente en cuadricula 3x3.",
                    "Cada celda combina ilustracion y verbo en tipografia destacada.",
                    "Genera un poster vertical 4K estilo libro infantil."
                ],
                "prompts": [
                    "Tarjetas de verbos basicos: correr, saltar, comer, dormir, leer, escribir.",
                    "Tarjetas de emociones: feliz, triste, enojado, sorprendido, cansado.",
                    "Tarjetas de movimiento: patear, lanzar, trepar, montar, estirar."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Infografia de Cuidado de Mascotas",
            "description": "Genera una infografia completa de cuidado de mascotas en 5 secciones para cualquier tipo y edad de mascota.",
            "title": "Nano Banana Prompt: Generador de Infografia de Cuidado de Mascotas | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla produce un poster vertical de fondo pastel con 5 secciones: Dieta, Ejercicio, Salud, Aseo y Entrenamiento.",
                "who": "Adecuado para agencias de adopcion, criadores, clinicas veterinarias, marcas de mascotas y nuevos duenos.",
                "how": [
                    "Elige el tipo de mascota (p. ej., Gato Britanico, Cachorro Corgi, Labrador).",
                    "Especifica la edad (p. ej., 5 meses, 1 ano, adulto mayor).",
                    "5 secciones se rellenan automaticamente con consejos.",
                    "Genera una infografia vertical 4K en pastel."
                ],
                "prompts": [
                    "Guia de cuidado para Gato Britanico de 5 meses.",
                    "Guia para Labrador adulto mayor.",
                    "Guia para Cachorro Corgi de 2 meses."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "Infografia de 9 Rasgos",
            "description": "Crea una infografia de cuadricula 3x3 sobre cualquier tema, cada celda con ilustracion, titulo y subtitulo.",
            "title": "Nano Banana Prompt: Generador de Infografia de 9 Rasgos | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster cuadrado '9 Rasgos de [Tema]' con 9 ilustraciones minimalistas en cuadricula 3x3.",
                "who": "Adecuado para creadores de desarrollo personal, life coaches, autores de autoayuda y marketers.",
                "how": [
                    "Ingresa el tema (p. ej., Pareja Ideal, Liderazgo, Mejora Personal).",
                    "9 celdas se generan automaticamente.",
                    "Arte de linea minimalista sobre fondo blanco.",
                    "Genera una infografia cuadrada 4K para redes sociales."
                ],
                "prompts": [
                    "Infografia '9 Rasgos de una Pareja Ideal'.",
                    "Poster '9 Rasgos del Liderazgo'.",
                    "Infografia '9 Rasgos de la Mejora Personal'."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "Poster de Verbos Compuestos en Ingles",
            "description": "Genera un poster de aprendizaje de 8 frases de verbos compuestos en torno a cualquier verbo principal con frases de ejemplo.",
            "title": "Nano Banana Prompt: Generador de Poster de Verbos Compuestos en Ingles | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla crea un poster vertical '8 Frases con [Verbo]' sobre fondo crema con iconos planos y frases de ejemplo.",
                "who": "Adecuado para profesores de ESL, tutores de idiomas y estudiantes de ingles.",
                "how": [
                    "Elige un verbo principal (p. ej., BREAK, TAKE, GO, PUT).",
                    "Se generan 8 verbos compuestos en lista vertical.",
                    "Cada item muestra icono, verbo y frase de ejemplo.",
                    "Genera un poster vertical 4K imprimible."
                ],
                "prompts": [
                    "Poster '8 Frases con BREAK'.",
                    "Poster '8 Frases con TAKE'.",
                    "Poster '8 Frases con PUT' para aulas de ESL."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Infografia de Recomendacion de Peinado y Color",
            "description": "Usa un retrato de referencia para generar un poster con 6 recomendaciones de peinado y color personalizadas en vistas circulares.",
            "title": "Nano Banana Prompt: Generador de Recomendacion de Peinado y Color | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla usa un retrato para generar un poster de consulta de belleza con la foto original a la izquierda y 6 vistas circulares con peinados y colores diferentes a la derecha.",
                "who": "Adecuado para estilistas, propietarios de salones, creadores de contenido de belleza y consultores de imagen.",
                "how": [
                    "Sube un retrato de referencia.",
                    "La plantilla genera 6 combinaciones de peinado y color.",
                    "Cada vista muestra el nombre del peinado y color.",
                    "Genera un poster de consulta de belleza en alta resolucion."
                ],
                "prompts": [
                    "Poster para rostro ovalado con 6 estilos.",
                    "Guia de peinado y color para rostro redondo en tonos calidos.",
                    "Poster de cambio de imagen con 6 peinados de moda."
                ]
            }}
        }
    },
    "fr": {
        "template-verb-action-learning-cards": {
            "category": "Cartes d'Apprentissage de Verbes d'Action",
            "description": "Creez une grille 3x3 de cartes d'apprentissage de verbes d'action avec illustrations amicales et typographie en gras.",
            "title": "Nano Banana Prompt: Generateur de Cartes de Verbes d'Action | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une grille 3x3 de 9 cartes d'apprentissage individuelles sur fond blanc. Chaque carte montre un personnage cartoon executant une action avec le verbe en gras.",
                "who": "Convient aux enseignants ESL, concepteurs d'applications linguistiques, educateurs prescolaires et createurs de contenu educatif.",
                "how": [
                    "Choisissez un theme (p. ex. Verbes de base, Activites quotidiennes, Emotions).",
                    "9 cartes s'organisent automatiquement en grille 3x3.",
                    "Chaque cellule associe illustration et verbe en gras.",
                    "Generez une affiche verticale 4K style livre pour enfants."
                ],
                "prompts": [
                    "Cartes de verbes de base: courir, sauter, manger, dormir, lire.",
                    "Cartes d'emotions: heureux, triste, en colere, surpris, fatigue.",
                    "Cartes de mouvements: lancer, attraper, grimper, monter, etirer."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Infographie de Soins pour Animaux",
            "description": "Generez une infographie complete de soins en 5 sections pour tout type et age d'animal de compagnie.",
            "title": "Nano Banana Prompt: Generateur d'Infographie de Soins pour Animaux | Curify AI",
            "content": {"sections": {
                "what": "Ce modele produit une affiche verticale en pastel avec 5 sections: Alimentation, Exercice, Sante, Toilettage et Education.",
                "who": "Convient aux agences d'adoption, eleveurs, cliniques veterinaires, marques d'animalerie et nouveaux proprietaires.",
                "how": [
                    "Choisissez le type d'animal (p. ex. British Shorthair, Corgi, Labrador).",
                    "Specifiez l'age (p. ex. 5 mois, 1 an, senior).",
                    "5 sections se remplissent automatiquement.",
                    "Generez une infographie verticale 4K pastel."
                ],
                "prompts": [
                    "Guide pour British Shorthair de 5 mois.",
                    "Guide pour Labrador senior.",
                    "Guide pour Corgi de 2 mois."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "Infographie 9 Traits",
            "description": "Creez une infographie 3x3 de traits sur n'importe quel theme avec illustrations, titres et sous-titres.",
            "title": "Nano Banana Prompt: Generateur d'Infographie 9 Traits | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche carree '9 Traits de [Theme]' avec 9 illustrations minimalistes en grille 3x3.",
                "who": "Convient aux createurs de developpement personnel, coachs de vie, auteurs et marketeurs.",
                "how": [
                    "Entrez le theme (p. ex. Partenaire Ideal, Leadership).",
                    "9 cellules sont generees automatiquement.",
                    "Art au trait minimaliste sur fond blanc.",
                    "Generez une infographie carree 4K."
                ],
                "prompts": [
                    "Infographie '9 Traits du Partenaire Ideal'.",
                    "Affiche '9 Traits du Leadership'.",
                    "Infographie '9 Traits de l'Amelioration Personnelle'."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "Affiche de Verbes a Particule Anglais",
            "description": "Generez une affiche d'apprentissage de 8 expressions de verbes a particule autour d'un verbe principal.",
            "title": "Nano Banana Prompt: Generateur d'Affiche de Verbes a Particule Anglais | Curify AI",
            "content": {"sections": {
                "what": "Ce modele cree une affiche verticale '8 Phrases avec [Verbe]' sur fond creme avec icones plats et phrases d'exemple.",
                "who": "Convient aux professeurs ESL, tuteurs et apprenants d'anglais.",
                "how": [
                    "Choisissez un verbe (p. ex. BREAK, TAKE, GO, PUT).",
                    "8 verbes a particule sont generes en liste verticale.",
                    "Chaque element affiche icone, verbe et phrase.",
                    "Generez une affiche verticale 4K imprimable."
                ],
                "prompts": [
                    "Affiche '8 Phrases avec BREAK'.",
                    "Affiche '8 Phrases avec TAKE'.",
                    "Affiche '8 Phrases avec PUT'."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Infographie de Recommandation Coiffure et Couleur",
            "description": "Utilisez un portrait de reference pour generer une affiche beaute avec 6 recommandations personnalisees de coiffure et couleur.",
            "title": "Nano Banana Prompt: Generateur de Recommandation Coiffure et Couleur | Curify AI",
            "content": {"sections": {
                "what": "Ce modele utilise un portrait pour generer une affiche de consultation beaute avec photo originale a gauche et 6 apercus circulaires a droite.",
                "who": "Convient aux coiffeurs, proprietaires de salons, createurs de contenu beaute et stylistes.",
                "how": [
                    "Telechargez un portrait de reference.",
                    "Le modele genere 6 combinaisons de coiffure et couleur.",
                    "Chaque apercu est etiquete avec le nom et la couleur.",
                    "Generez une affiche de consultation beaute haute resolution."
                ],
                "prompts": [
                    "Affiche pour visage ovale avec 6 styles.",
                    "Guide pour visage rond en tons chauds.",
                    "Affiche relooking avec 6 coiffures tendances."
                ]
            }}
        }
    },
    "hi": {
        "template-verb-action-learning-cards": {
            "category": "क्रिया शब्द सीखने के कार्ड",
            "description": "किसी भी शब्दावली थीम के लिए मैत्रीपूर्ण चित्रों और बोल्ड टाइपोग्राफी के साथ कार्टून क्रिया शब्द सीखने के कार्डों का 3x3 ग्रिड बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: क्रिया शब्द सीखने के कार्ड जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट सफेद पृष्ठभूमि पर 9 अलग-अलग सीखने के कार्डों का साफ 3x3 ग्रिड बनाता है। प्रत्येक कार्ड में कार्टून-शैली का व्यक्ति क्रिया करता दिखाया जाता है।",
                "who": "ESL शिक्षकों, भाषा सीखने वाले ऐप डिजाइनरों, बाल शिक्षकों और शैक्षिक सामग्री निर्माताओं के लिए उपयुक्त।",
                "how": [
                    "सीखने की थीम चुनें (जैसे: मूल क्रियाएं, दैनिक गतिविधियां, भावनाएं)।",
                    "9 कार्ड स्वचालित रूप से 3x3 ग्रिड में व्यवस्थित होते हैं।",
                    "प्रत्येक सेल में कार्टून चित्र और बोल्ड क्रिया।",
                    "वर्टिकल 4K बच्चों की किताब शैली का पोस्टर बनाएं।"
                ],
                "prompts": [
                    "मूल क्रियाएं: दौड़ना, कूदना, खाना, सोना, पढ़ना, लिखना।",
                    "भावनाएं: खुश, उदास, गुस्सा, आश्चर्यचकित, थका, उत्साहित।",
                    "गतिविधियां: फेंकना, पकड़ना, चढ़ना, सवारी करना।"
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "पालतू देखभाल इन्फोग्राफिक",
            "description": "किसी भी पालतू प्रकार और उम्र के लिए कार्टून चित्रों के साथ पूर्ण 5-खंड पालतू देखभाल गाइड इन्फोग्राफिक बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: पालतू देखभाल गाइड इन्फोग्राफिक जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट 5 खंडों वाला वर्टिकल पेस्टल इन्फोग्राफिक बनाता है: आहार, व्यायाम, स्वास्थ्य, सफाई और प्रशिक्षण।",
                "who": "पालतू एडॉप्शन एजेंसियों, ब्रीडर्स, पशु चिकित्सालयों, पालतू ब्रांडों और नए मालिकों के लिए उपयुक्त।",
                "how": [
                    "पालतू प्रकार चुनें (जैसे: ब्रिटिश शॉर्टहेयर बिल्ली, कॉर्गी पिल्ला, लैब्राडोर)।",
                    "उम्र निर्दिष्ट करें (जैसे: 5 महीने, 1 वर्ष, वरिष्ठ)।",
                    "5 खंड स्वचालित रूप से देखभाल सलाह से भरते हैं।",
                    "वर्टिकल 4K पेस्टल इन्फोग्राफिक बनाएं।"
                ],
                "prompts": [
                    "5 महीने की ब्रिटिश शॉर्टहेयर बिल्ली के लिए देखभाल गाइड।",
                    "वरिष्ठ लैब्राडोर के लिए पूर्ण देखभाल पोस्टर।",
                    "2 महीने के कॉर्गी पिल्ले के लिए देखभाल गाइड।"
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9-गुण इन्फोग्राफिक",
            "description": "किसी भी विषय पर 3x3 गुण ग्रिड इन्फोग्राफिक बनाएं, प्रत्येक सेल में चित्र, शीर्षक और उप-शीर्षक।",
            "title": "Nano Banana प्रॉम्प्ट: 9-गुण सूचना ग्रिड जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '[विषय] के 9 गुण' शीर्षक का वर्गाकार पोस्टर बनाता है, 3x3 ग्रिड में 9 न्यूनतम कार्टून चित्रों के साथ।",
                "who": "व्यक्तिगत विकास निर्माताओं, लाइफ कोचेज, स्व-सहायता लेखकों और मार्केटर्स के लिए उपयुक्त।",
                "how": [
                    "इन्फोग्राफिक विषय दर्ज करें (जैसे: गुणवत्ता साथी, नेतृत्व, आत्म-सुधार)।",
                    "9 गुण सेल स्वचालित रूप से बनते हैं।",
                    "सफेद पृष्ठभूमि पर न्यूनतम लाइन कला।",
                    "सोशल मीडिया के लिए वर्गाकार 4K इन्फोग्राफिक बनाएं।"
                ],
                "prompts": [
                    "'गुणवत्ता साथी के 9 गुण' इन्फोग्राफिक।",
                    "'नेतृत्व के 9 गुण' पोस्टर।",
                    "'आत्म-सुधार के 9 गुण' इन्फोग्राफिक।"
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "अंग्रेजी फ्रेज़ल वर्ब पोस्टर",
            "description": "उदाहरण वाक्यों के साथ किसी भी मुख्य क्रिया के 8 फ्रेज़ल वर्ब लर्निंग पोस्टर बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: अंग्रेजी फ्रेज़ल वर्ब लर्निंग पोस्टर जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट हल्के क्रीम पृष्ठभूमि पर '[क्रिया] के साथ 8 फ्रेज़' शीर्षक का वर्टिकल पोस्टर बनाता है।",
                "who": "ESL शिक्षकों, भाषा शिक्षकों और अंग्रेजी सीखने वालों के लिए उपयुक्त।",
                "how": [
                    "मुख्य क्रिया चुनें (जैसे: BREAK, TAKE, GO, PUT)।",
                    "8 फ्रेज़ल वर्ब वर्टिकल सूची में बनते हैं।",
                    "प्रत्येक आइटम में आइकन, क्रिया और उदाहरण।",
                    "वर्टिकल 4K प्रिंट करने योग्य पोस्टर बनाएं।"
                ],
                "prompts": [
                    "'BREAK के साथ 8 फ्रेज़' पोस्टर।",
                    "'TAKE के साथ 8 फ्रेज़' पोस्टर।",
                    "'PUT के साथ 8 फ्रेज़' पोस्टर।"
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "हेयरस्टाइल और रंग सिफारिश इन्फोग्राफिक",
            "description": "गोलाकार पूर्वावलोकन के साथ 6 व्यक्तिगत हेयरस्टाइल और रंग सिफारिशों के साथ ब्यूटी गाइड पोस्टर बनाने के लिए संदर्भ चित्र का उपयोग करें।",
            "title": "Nano Banana प्रॉम्प्ट: हेयरस्टाइल और रंग सिफारिश जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट संदर्भ चित्र का उपयोग करके ब्यूटी कंसल्टेशन पोस्टर बनाता है, बाईं ओर मूल फोटो और दाईं ओर 2x3 ग्रिड में 6 गोलाकार पूर्वावलोकन।",
                "who": "हेयरस्टाइलिस्ट, सैलून मालिकों, ब्यूटी क्रिएटर्स और स्टाइलिस्टों के लिए उपयुक्त।",
                "how": [
                    "संदर्भ चित्र अपलोड करें।",
                    "टेम्पलेट 6 हेयरस्टाइल और रंग संयोजन बनाता है।",
                    "प्रत्येक पूर्वावलोकन हेयरस्टाइल नाम और रंग के साथ लेबल किया जाता है।",
                    "उच्च-रिज़ॉल्यूशन ब्यूटी कंसल्टेशन पोस्टर बनाएं।"
                ],
                "prompts": [
                    "अंडाकार चेहरे के लिए 6 शैलियों के साथ पोस्टर।",
                    "गोल चेहरे के लिए हेयरस्टाइल और रंग गाइड।",
                    "6 ट्रेंडी हेयरस्टाइल विकल्पों के साथ ब्यूटी मेकओवर पोस्टर।"
                ]
            }}
        }
    },
    "ja": {
        "template-verb-action-learning-cards": {
            "category": "アクション動詞学習カード",
            "description": "あらゆる語彙テーマに対応した、親しみやすいイラストと太字タイポグラフィを備えた漫画調アクション動詞学習カードの3x3グリッドを作成します。",
            "title": "Nano Banana プロンプト：アクション動詞学習カードジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは白背景に9枚の学習カードからなる3x3グリッドを生成します。各カードには漫画風の人物が動作を行う様子と、対応する動詞が太字サンセリフで表示されます。",
                "who": "ESL教師、語学アプリデザイナー、幼児教育者、語彙を教える保護者、教育用フラッシュカード制作者に適しています。",
                "how": [
                    "学習テーマを選択（例：基本動詞、日常活動、感情表現）。",
                    "9枚のカードが自動的に3x3グリッドに配置されます。",
                    "各セルに漫画イラストと太字の動詞が組み合わされます。",
                    "縦長4Kの絵本風フラッシュカードポスターを生成します。"
                ],
                "prompts": [
                    "基本動詞カード：走る、跳ぶ、食べる、寝る、読む、書く、歩く、泳ぐ、踊る。",
                    "感情表現カード：嬉しい、悲しい、怒り、驚き、疲れ、興奮、落ち着き、困惑、誇り。",
                    "動作スポーツカード：蹴る、投げる、捕る、登る、乗る、走る、伸ばす、泳ぐ、跳ぶ。"
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "ペットケアインフォグラフィック",
            "description": "あらゆるペットの種類と年齢に対応した、漫画イラスト付きの完全な5セクションペットケアガイドインフォグラフィックを生成します。",
            "title": "Nano Banana プロンプト：ペットケアガイドインフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは食事と栄養、運動、健康管理、お手入れ、しつけと社会化の5セクションを含む縦長パステル背景のインフォグラフィックポスターを生成します。",
                "who": "ペット譲渡機関、ブリーダー、動物病院、ペット用品ブランド、ペットブロガー、新規飼い主に適しています。",
                "how": [
                    "ペットの種類を選択（例：ブリティッシュショートヘア、コーギーパピー、ラブラドール）。",
                    "年齢を指定（例：5ヶ月、1歳、シニア）。",
                    "5つのセクションが種類と年齢に応じて自動的に埋まります。",
                    "縦長4Kパステルインフォグラフィックを生成します。"
                ],
                "prompts": [
                    "5ヶ月のブリティッシュショートヘアのケアガイド。",
                    "シニアラブラドールの完全ケアガイドポスター。",
                    "2ヶ月のコーギーパピーの5セクションケアガイド。"
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9つの特性インフォグラフィック",
            "description": "あらゆるトピックの3x3特性グリッドインフォグラフィックを作成します。各セルに漫画イラスト、太字タイトル、短いサブタイトルが入ります。",
            "title": "Nano Banana プロンプト：9つの特性情報グリッドジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは『[トピック]の9つの特性』というタイトルの正方形ポスターを生成し、3x3グリッドに9つのミニマル漫画イラストを配置します。",
                "who": "自己啓発クリエイター、ライフコーチ、リーダーシップトレーナー、自己啓発書著者、コンテンツマーケターに適しています。",
                "how": [
                    "インフォグラフィックトピックを入力（例：理想のパートナー、リーダーシップ、自己改善）。",
                    "9つの特性セルが自動生成されます。",
                    "白背景にミニマルラインアートで構成。",
                    "Instagram、Pinterest、LinkedIn向けの正方形4Kインフォグラフィックを生成します。"
                ],
                "prompts": [
                    "「理想のパートナーの9つの特性」インフォグラフィック。",
                    "「リーダーシップの9つの特性」グリッドポスター。",
                    "「自己改善の9つの特性」インフォグラフィック。"
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "英語句動詞ポスター",
            "description": "コア動詞を中心に、例文とフラットアイコンを含む8つの句動詞学習ポスターを縦リストレイアウトで生成します。",
            "title": "Nano Banana プロンプト：英語句動詞学習ポスタージェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは薄いクリーム背景に「[動詞]を使った8つのフレーズ」というタイトルの縦長教育ポスターを作成します。",
                "who": "ESL教師、語学講師、語学アプリデザイナー、英語学習プリントを作るクリエイターに適しています。",
                "how": [
                    "コア動詞を選択（例：BREAK、TAKE、GO、PUT）。",
                    "8つの句動詞が縦リストとして自動生成されます。",
                    "各項目にアイコン、太字の句動詞、例文が表示されます。",
                    "縦長4Kクリーム背景の印刷可能ポスターを生成します。"
                ],
                "prompts": [
                    "「BREAKを使った8つのフレーズ」ポスター。",
                    "「TAKEを使った8つのフレーズ」学習ポスター。",
                    "「PUTを使った8つのフレーズ」ESL教室用ポスター。"
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "ヘアスタイル＆カラーおすすめインフォグラフィック",
            "description": "参照ポートレートを使用して、円形プレビュータイルに6つのパーソナライズされたヘアスタイルとヘアカラーのおすすめを表示するビューティーガイドポスターを生成します。",
            "title": "Nano Banana プロンプト：ヘアスタイル＆カラーおすすめジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは参照ポートレートを使用してビューティー相談ポスターを生成します。元の写真は左側にフルサイズで表示され、右側には2x3グリッドの6つの円形プレビューが表示されます。",
                "who": "ヘアスタイリスト、サロンオーナー、ビューティーコンテンツクリエイター、パーソナルスタイリスト、ビューティーコンサルタントに適しています。",
                "how": [
                    "自分自身またはクライアントの参照ポートレートをアップロードします。",
                    "テンプレートが6つのパーソナライズされたヘアスタイルとカラーの組み合わせを自動生成します。",
                    "各プレビューにヘアスタイル名と対応するヘアカラーがラベル付けされます。",
                    "高解像度のビューティー相談ポスターを生成します。"
                ],
                "prompts": [
                    "卵型の顔向け、6スタイルのヘアスタイルおすすめポスター。",
                    "丸顔向け、暖色系のヘアスタイル＆カラーガイド。",
                    "6つのトレンディなヘアスタイルオプションのビューティーメイクオーバーポスター。"
                ]
            }}
        }
    },
    "ko": {
        "template-verb-action-learning-cards": {
            "category": "동작 동사 학습 카드",
            "description": "친근한 일러스트와 굵은 타이포그래피로 모든 어휘 주제에 대한 만화 동작 동사 학습 카드의 3x3 그리드를 만드세요.",
            "title": "Nano Banana 프롬프트: 동작 동사 학습 카드 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 흰색 배경에 9개의 개별 학습 카드로 구성된 깔끔한 3x3 그리드를 생성합니다. 각 카드에는 동작을 수행하는 만화 스타일의 인물과 해당 동사가 굵은 산세리프 글꼴로 표시됩니다.",
                "who": "ESL 교사, 언어 학습 앱 디자이너, 영유아 교육자, 어휘를 가르치는 부모, 교육용 플래시카드 제작 콘텐츠 크리에이터에게 적합합니다.",
                "how": [
                    "학습 주제 선택 (예: 기본 동사, 일상 활동, 감정).",
                    "9장의 카드가 일관된 캐릭터 디자인으로 3x3 그리드에 자동 배치됩니다.",
                    "각 셀은 만화 일러스트와 굵은 산세리프 동사를 결합합니다.",
                    "세로형 4K 어린이 책 스타일 플래시카드 포스터를 생성합니다."
                ],
                "prompts": [
                    "기본 동사 카드: 달리다, 점프하다, 먹다, 자다, 읽다, 쓰다, 걷다, 수영하다, 춤추다.",
                    "감정 표현 카드: 행복, 슬픔, 화남, 놀람, 피곤, 신남, 차분, 혼란, 자랑스러움.",
                    "동작 스포츠 카드: 차다, 던지다, 잡다, 오르다, 타다, 달리다, 늘리다, 수영하다, 점프하다."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "반려동물 케어 인포그래픽",
            "description": "모든 반려동물 유형과 나이에 맞춰 만화 일러스트와 이모지 포인트가 포함된 5섹션 케어 가이드 인포그래픽을 생성합니다.",
            "title": "Nano Banana 프롬프트: 반려동물 케어 가이드 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 식이와 영양, 운동, 건강 관리, 그루밍, 훈련과 사회화의 5개 섹션을 다루는 세로형 파스텔 배경 인포그래픽 포스터를 만듭니다.",
                "who": "반려동물 입양 기관, 분양자, 동물병원, 반려동물 용품 브랜드, 펫블로거, 신규 반려인에게 적합합니다.",
                "how": [
                    "반려동물 유형 선택 (예: 브리티시 숏헤어, 코기 강아지, 라브라도르).",
                    "나이 지정 (예: 생후 5개월, 1세, 시니어).",
                    "5개의 색상 구분 섹션이 유형과 나이에 따라 자동으로 채워집니다.",
                    "세로형 4K 파스텔 인포그래픽을 생성합니다."
                ],
                "prompts": [
                    "생후 5개월 브리티시 숏헤어 케어 가이드.",
                    "시니어 라브라도르 완전 케어 가이드 포스터.",
                    "생후 2개월 코기 강아지 5섹션 케어 가이드."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9가지 특성 인포그래픽",
            "description": "모든 주제에 대한 깔끔한 3x3 특성 그리드 인포그래픽을 만들고, 각 셀에 만화 일러스트, 굵은 제목, 짧은 부제를 포함합니다.",
            "title": "Nano Banana 프롬프트: 9가지 특성 정보 그리드 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '[주제]의 9가지 특성'이라는 정사각형 인포그래픽 포스터를 생성하고, 3x3 그리드에 9개의 미니멀 만화 특성 일러스트를 배치합니다.",
                "who": "자기 계발 크리에이터, 라이프 코치, 리더십 트레이너, 자기계발서 저자, 동기 부여 SNS 계정, HR 팀에 적합합니다.",
                "how": [
                    "인포그래픽 주제 입력 (예: 이상적인 파트너, 리더십, 자기 개선).",
                    "9개의 특성 셀이 자동 생성됩니다.",
                    "흰색 배경의 미니멀 라인 아트로 깔끔하게 구성됩니다.",
                    "Instagram, Pinterest, LinkedIn에 적합한 정사각형 4K 인포그래픽을 생성합니다."
                ],
                "prompts": [
                    "'이상적인 파트너의 9가지 특성' 인포그래픽.",
                    "'리더십의 9가지 특성' 그리드 포스터.",
                    "'자기 개선의 9가지 특성' 인포그래픽."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "영어 구동사 포스터",
            "description": "핵심 동사를 중심으로 예문과 플랫 아이콘이 있는 8구절 구동사 학습 포스터를 세로 목록 레이아웃으로 생성합니다.",
            "title": "Nano Banana 프롬프트: 영어 구동사 학습 포스터 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 라이트 크림 배경에 '[동사]을 사용한 8개의 구절'이라는 제목의 세로형 교육 포스터를 만듭니다.",
                "who": "ESL 교사, 언어 튜터, 언어 학습 앱 디자이너, 영어 학습 인쇄물 콘텐츠 크리에이터, 영어 시험 준비 학생에게 적합합니다.",
                "how": [
                    "핵심 동사 선택 (예: BREAK, TAKE, GO, PUT).",
                    "8개의 구동사가 세로 목록으로 자동 생성됩니다.",
                    "각 항목에 아이콘, 굵은 구동사, 예문이 표시됩니다.",
                    "세로형 4K 크림 배경 인쇄 가능 포스터를 생성합니다."
                ],
                "prompts": [
                    "'BREAK을 사용한 8개의 구절' 포스터.",
                    "'TAKE을 사용한 8개의 구절' 학습 포스터.",
                    "'PUT을 사용한 8개의 구절' ESL 교실 포스터."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "헤어스타일 & 컬러 추천 인포그래픽",
            "description": "참조 인물 사진을 사용하여 원형 미리보기 타일에 6가지 맞춤형 헤어스타일과 헤어컬러 추천을 표시하는 뷰티 가이드 포스터를 생성합니다.",
            "title": "Nano Banana 프롬프트: 헤어스타일 & 컬러 추천 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 참조 인물 사진을 사용하여 뷰티 컨설팅 포스터를 생성합니다. 원본 사진은 왼쪽에 전체 크기로, 오른쪽에는 2x3 그리드의 6개 원형 미리보기가 표시됩니다.",
                "who": "헤어스타일리스트, 살롱 오너, 뷰티 콘텐츠 크리에이터, 퍼스널 스타일리스트, 뷰티 앱 디자이너, 뷰티 컨설턴트에게 적합합니다.",
                "how": [
                    "본인 또는 고객의 참조 인물 사진을 업로드합니다.",
                    "템플릿이 6가지 맞춤형 헤어스타일과 컬러 조합을 자동 생성합니다.",
                    "각 미리보기에 헤어스타일 이름과 헤어컬러가 라벨링됩니다.",
                    "고해상도 뷰티 컨설팅 포스터를 생성합니다."
                ],
                "prompts": [
                    "타원형 얼굴을 위한 6가지 스타일의 헤어스타일 추천 포스터.",
                    "둥근 얼굴을 위한 웜톤 헤어스타일 & 컬러 가이드.",
                    "6가지 트렌디한 헤어스타일 옵션의 뷰티 메이크오버 포스터."
                ]
            }}
        }
    },
    "ru": {
        "template-verb-action-learning-cards": {
            "category": "Uchebnye Kartochki Glagolov Dejstviya",
            "description": "Sozdajte setku 3x3 multiplikatsionnykh uchebnykh kartochek glagolov dejstviya s druzhelyubnymi illyustratsiyami i zhirnoj tipografiej.",
            "title": "Nano Banana Prompt: Generator Kartochek Glagolov Dejstviya | Curify AI",
            "content": {"sections": {
                "what": "Etot shableon generiruet chistuyu setku 3x3 iz 9 otdel'nykh uchebnykh kartochek na belom fone.",
                "who": "Podkhodit dlya prepodavatelej ESL, dizajnerov yazykovyh prilozhenij, pedagogov rannego detstva i sozdatelej obrazovatel'nogo kontenta.",
                "how": [
                    "Vyberite temu obucheniya (naprimer: bazovye glagoly, povsednevnye dejstviya, emocii).",
                    "9 kartochek avtomaticheski raspolagayutsya v setke 3x3.",
                    "Kazhdaya yachejka sochetaet illyustratsiyu i glagol zhirnym shriftom.",
                    "Generiruetsya vertikal'nyj 4K poster v stile detskoj knigi."
                ],
                "prompts": [
                    "Bazovye glagoly: bezhat', prygat', est', spat', chitat', pisat'.",
                    "Emotsii: schastlivyj, grustnyj, serdityj, udivlennyj, ustalyj.",
                    "Dvizheniya: brosat', lovit', lazat', katat'sya, tyanut'sya."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Infografika po Ukhodu za Pitomtsem",
            "description": "Generiruet polnuyu infografiku po ukhodu za pitomtsem v 5 sekciyah dlya lyubogo tipa i vozrasta.",
            "title": "Nano Banana Prompt: Generator Infografiki Ukhoda za Pitomtsami | Curify AI",
            "content": {"sections": {
                "what": "Etot shableon proizvodit vertikal'nyj postel'nyj poster s 5 sekciyami: pitanie, fizicheskaya aktivnost', zdorov'e, ukhod, vospitanie.",
                "who": "Podkhodit dlya organizacij po peredache zhivotnykh, zavodchikov, veterinarnyh klinik, brendov tovarov dlya pitomtsev i novykh vladel'tsev.",
                "how": [
                    "Vyberite tip pitomtsa (naprimer: britanskaya korotkosherstnaya, korgi, labrador).",
                    "Ukazhite vozrast (naprimer: 5 mesyacev, 1 god, senior).",
                    "5 cvetnyh sekcij avtomaticheski zapolnyayutsya.",
                    "Generiruetsya vertikal'naya 4K postel'naya infografika."
                ],
                "prompts": [
                    "Rukovodstvo po ukhodu za 5-mesyachnoj britanskoj koshkoj.",
                    "Polnoe rukovodstvo po ukhodu za pozhilym labradorom.",
                    "Rukovodstvo po ukhodu za 2-mesyachnym shenkom korgi."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "Infografika 9 Kachestv",
            "description": "Sozdajte chistuyu infografiku 3x3 kachestv po lyuboj teme s illyustratsiyami i zhirnymi zagolovkami.",
            "title": "Nano Banana Prompt: Generator Infografiki 9 Kachestv | Curify AI",
            "content": {"sections": {
                "what": "Etot shableon generiruet kvadratnyj poster '9 Kachestv [Temy]' s 9 minimalisticheskimi illyustratsiyami v setke 3x3.",
                "who": "Podkhodit dlya sozdatelej kontenta lichnostnogo rosta, lajf-kouchej, avtorov literatury samopomoshchi i marketologov.",
                "how": [
                    "Vvedite temu (naprimer: idealnyj partner, liderstvo, samosovershenstvovanie).",
                    "9 yacheyek kachestv generiruyutsya avtomaticheski.",
                    "Minimalisticheskoe linejnoe iskusstvo na belom fone.",
                    "Generiruetsya kvadratnaya 4K infografika dlya socsetej."
                ],
                "prompts": [
                    "Infografika '9 Kachestv Idealnogo Partnera'.",
                    "Poster '9 Kachestv Liderstva'.",
                    "Infografika '9 Kachestv Samosovershenstvovaniya'."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "Poster Anglijskih Frazovykh Glagolov",
            "description": "Generiruet poster s 8 frazami frazovykh glagolov vokrug osnovnogo glagola s primerami predlozhenij.",
            "title": "Nano Banana Prompt: Generator Postera Anglijskih Frazovykh Glagolov | Curify AI",
            "content": {"sections": {
                "what": "Etot shableon sozdaet vertikal'nyj poster '8 Fraz s [Glagolom]' na svetlom kremovom fone s ploskimi ikonkami.",
                "who": "Podkhodit dlya prepodavatelej ESL, yazykovyh tutorov i izuchayushchih anglijskij yazyk.",
                "how": [
                    "Vyberite glagol (naprimer: BREAK, TAKE, GO, PUT).",
                    "8 frazovykh glagolov generiruyutsya v vertikal'nom spiske.",
                    "Kazhdyj punkt soderjit ikonku, glagol i primer.",
                    "Generiruetsya vertikal'nyj 4K poster dlya pechati."
                ],
                "prompts": [
                    "Poster '8 Fraz s BREAK'.",
                    "Poster '8 Fraz s TAKE'.",
                    "Poster '8 Fraz s PUT'."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Infografika Rekomendacij Pricheski i Tsveta",
            "description": "Ispol'zuet referensnyj portret dlya generacii beauty-postera s 6 personalizovannymi rekomendaciyami pricheski i tsveta.",
            "title": "Nano Banana Prompt: Generator Rekomendacij Pricheski i Tsveta | Curify AI",
            "content": {"sections": {
                "what": "Etot shableon ispol'zuet referensnyj portret dlya sozdaniya beauty-konsul'tacionnogo postera. Originalnoe foto sleva, sprava 6 kruglykh prosmotrov v setke 2x3.",
                "who": "Podkhodit dlya parikmaherov, vladel'tsev salonov, sozdatelej beauty-kontenta i stilistov.",
                "how": [
                    "Zagruzite referensnyj portret.",
                    "Shableon generiruet 6 kombinacij pricheski i tsveta.",
                    "Kazhdyj prosmotr podpisyvaetsya nazvaniem pricheski i tsvetom.",
                    "Generiruetsya beauty-konsul'tacionnyj poster vysokogo razresheniya."
                ],
                "prompts": [
                    "Poster dlya ovalnogo lica s 6 stilyami.",
                    "Rukovodstvo po pricheskam dlya kruglogo lica v teplyh tonah.",
                    "Beauty-poster s 6 trendovymi pricheskami."
                ]
            }}
        }
    },
    "tr": {
        "template-verb-action-learning-cards": {
            "category": "Eylem Fiili Ogrenim Kartlari",
            "description": "Herhangi bir kelime temasi icin dostane illustrasyonlar ve kalin tipografi ile karikatur eylem fiili ogrenim kartlarinin 3x3 izgarasini olusturun.",
            "title": "Nano Banana Prompt: Eylem Fiili Ogrenim Karti Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon beyaz arka plan uzerinde 9 ayri ogrenim kartindan olusan temiz bir 3x3 izgara olusturur.",
                "who": "ESL ogretmenleri, dil ogrenim uygulamasi tasarimcilari, erken cocukluk egitimcileri ve egitim icerik ureticileri icin uygundur.",
                "how": [
                    "Bir ogrenim temasi secin (orn. Temel Fiiller, Gunluk Aktiviteler, Duygular).",
                    "9 kart 3x3 izgara duzeninde otomatik olarak yerlestirilir.",
                    "Her hucre karikatur illustrasyon ve kalin yazitipi ile fiili eslestirir.",
                    "Dikey 4K cocuk kitabi tarzi flashcard posteri olusturun."
                ],
                "prompts": [
                    "Temel fiil kartlari: kosmak, ziplamak, yemek, uyumak, okumak, yazmak.",
                    "Duygu kartlari: mutlu, uzgun, kizgin, sasirmis, yorgun.",
                    "Hareket kartlari: tekme atmak, atmak, yakalamak, tirmanmak."
                ]
            }}
        },
        "template-pet-care-guide": {
            "category": "Evcil Hayvan Bakim Infografigi",
            "description": "Her evcil hayvan turu ve yasi icin karikatur illustrasyonlu tam 5 bolumlu evcil hayvan bakim rehberi infografigi olusturun.",
            "title": "Nano Banana Prompt: Evcil Hayvan Bakim Infografigi Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon Beslenme, Egzersiz, Saglik, Bakim ve Egitim olmak uzere 5 bolumlu dikey pastel arka planli bir infografik posteri uretir.",
                "who": "Evcil hayvan sahiplendirme kuruluslari, breederlar, veteriner klinikleri, evcil hayvan markalari ve yeni sahipler icin uygundur.",
                "how": [
                    "Evcil hayvan turunu secin (orn. Britanya Kisa Tuylu Kedi, Corgi Yavrusu, Labrador).",
                    "Yas belirtin (orn. 5 Aylik, 1 Yasinda, Yasli).",
                    "5 renk kodlu bolum tur ve yasa gore otomatik doldurulur.",
                    "Dikey 4K pastel infografik olusturun."
                ],
                "prompts": [
                    "5 aylik Britanya Kisa Tuylu Kedi bakim rehberi.",
                    "Yasli Labrador tam bakim rehberi posteri.",
                    "2 aylik Corgi yavrusu bakim rehberi."
                ]
            }}
        },
        "template-9-traits-info-grid": {
            "category": "9 Ozellik Infografigi",
            "description": "Herhangi bir konuda 3x3 ozellik izgarasi infografigi olusturun, her hucre karikatur illustrasyon, kalin baslik ve kisa altbaslik icerir.",
            "title": "Nano Banana Prompt: 9 Ozellik Bilgi Izgarasi Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '[Konu]nun 9 Ozelligi' baslikli kare infografik posteri uretir, 3x3 izgarada 9 minimal karikatur ozellik illustrasyonu ile.",
                "who": "Kisisel gelisim icerik ureticileri, yasam koclari, liderlik egitmenleri, kisisel gelisim yazarlari ve icerik pazarlamacilari icin uygundur.",
                "how": [
                    "Infografik konusunu girin (orn. Kaliteli Partner, Liderlik, Kisisel Gelisim).",
                    "9 ozellik hucresi otomatik olusturulur.",
                    "Beyaz arka plan uzerinde minimalist cizgi sanati.",
                    "Sosyal medya icin kare 4K infografik olusturun."
                ],
                "prompts": [
                    "'Kaliteli Bir Partnerin 9 Ozelligi' infografigi.",
                    "'Liderligin 9 Ozelligi' izgara posteri.",
                    "'Kisisel Gelisimin 9 Ozelligi' infografigi."
                ]
            }}
        },
        "template-english-phrasal-verb": {
            "category": "Ingilizce Phrasal Verb Posteri",
            "description": "Bir cekirdek fiil etrafinda 8 phrasal verb ogrenim posteri olusturun, ornek cumleler ve dikey liste duzeniyle.",
            "title": "Nano Banana Prompt: Ingilizce Phrasal Verb Ogrenim Posteri Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon acik krem arka planli '[Fiil] ile 8 Ifade' baslikli dikey egitim posteri olusturur.",
                "who": "ESL ogretmenleri, dil tutorlari ve Ingilizce ogrenenler icin uygundur.",
                "how": [
                    "Bir cekirdek fiil secin (orn. BREAK, TAKE, GO, PUT).",
                    "8 phrasal verb dikey liste olarak otomatik olusturulur.",
                    "Her oge ikon, kalin phrasal verb ve ornek cumle gosterir.",
                    "Dikey 4K yazdirilabilir poster olusturun."
                ],
                "prompts": [
                    "'BREAK ile 8 Ifade' posteri.",
                    "'TAKE ile 8 Ifade' ogrenim posteri.",
                    "'PUT ile 8 Ifade' posteri."
                ]
            }}
        },
        "template-hairstyle-color-recommendation": {
            "category": "Sac Modeli ve Renk Onerisi Infografigi",
            "description": "Referans portre kullanarak dairesel onizleme karelerinde 6 kisisellestirilmis sac modeli ve renk onerisi gosteren bir guzellik rehberi posteri olusturun.",
            "title": "Nano Banana Prompt: Sac Modeli ve Renk Onerisi Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon referans portre kullanarak guzellik danismanligi posteri olusturur. Orijinal fotograf solda tam boy, sagda 2x3 izgarada 6 dairesel onizleme.",
                "who": "Sac stilistleri, salon sahipleri, guzellik icerik ureticileri, kisisel stilistler ve guzellik danismanlari icin uygundur.",
                "how": [
                    "Kendinizin veya musterinin referans portresini yukleyin.",
                    "Sablon 6 kisisellestirilmis sac modeli ve renk kombinasyonu uretir.",
                    "Her onizleme sac modeli adi ve uygun renkle etiketlenir.",
                    "Yuksek cozunurluklu guzellik danismanligi posteri olusturun."
                ],
                "prompts": [
                    "Oval yuz icin 6 stilli sac modeli onerisi posteri.",
                    "Yuvarlak yuz icin sicak tonlu sac modeli ve renk rehberi.",
                    "6 trend sac modeli secenekli guzellik makyaji posteri."
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
