"""Append i18n entries for the 4 new nano templates from hongjie28-patch-2.

Templates added in commit 742f28c (daily-content-drop 2026-05-28):
  - template-food-product-packaging-design
  - template-educational-career-field-infographic
  - template-lunar-new-year-red-envelope-set
  - template-mbti-personality-compatibility-infographic

Note (2026-05-29): this filename previously held a different i18n script
from an earlier hongjie28-patch-2 cycle (April: zhenhuan / quote-poster
templates). That content was already merged into nano.json long ago;
overwriting here for the current cycle.

Turkish entries use ASCII-only (no diacritics) per established convention.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-food-product-packaging-design",
    "template-educational-career-field-infographic",
    "template-lunar-new-year-red-envelope-set",
    "template-mbti-personality-compatibility-infographic",
]

entries = {
    "en": {
        "template-food-product-packaging-design": {
            "category": "Food Product Packaging Design",
            "description": "Generate a premium minimalist packaging design for any food product with brand logo, product photo window, feature icons, and net weight text.",
            "title": "Nano Banana Prompt: Food Product Packaging Design Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K premium food product packaging poster for '{topic}'. The layout features a bold product name, brand logo, product photo in a window, key feature icons, and net weight text. A minimalist modern aesthetic with a theme-matching color palette and clean typography delivers a polished retail-ready feel.",
                "who": "Suitable for food brand designers, CPG marketers, packaging design students, product photographers, dropshipping sellers, indie food makers, and content creators producing food product mockups.",
                "how": [
                    "Enter a food product type in {topic} (e.g., Organic Rolled Oats, Italian Pasta Sauce).",
                    "The poster auto-generates a vertical package with product name, brand logo, and product photo window.",
                    "Key feature icons and net weight text are laid out beneath the photo.",
                    "Generate a vertical 4K minimalist food packaging design poster."
                ],
                "prompts": [
                    "Generate an Organic Rolled Oats premium packaging design.",
                    "Create a Double Chocolate Cookies food product packaging poster.",
                    "Generate an Italian Pasta Sauce minimalist packaging design."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Career Field Infographic",
            "description": "Create a structured educational infographic explaining any career or academic field — key aspects, real-world applications, skills, and goals.",
            "title": "Nano Banana Prompt: Educational Career Field Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K educational infographic poster titled '{topic}'. The layout has 4 main sections explaining key aspects of the field, plus real-world applications, key skills/tools, and goals. Cartoon-style illustrations of professionals appear alongside section dividers. A friendly cartoon aesthetic with bold headings and vibrant color coding makes it accessible for students.",
                "who": "Suitable for educators, school counselors, university career-services teams, education content creators, parents helping kids explore careers, EdTech product designers, and bloggers covering academic fields.",
                "how": [
                    "Enter a career or academic field in {topic} (e.g., Industrial Engineering, Food Science).",
                    "The poster auto-generates 4 sections covering key aspects, applications, skills, and goals.",
                    "Cartoon professionals and scene illustrations appear alongside each section.",
                    "Generate a vertical 4K cartoon-style career field educational infographic."
                ],
                "prompts": [
                    "Generate an Industrial Engineering career field infographic.",
                    "Create a Food Science educational career poster with applications and skills.",
                    "Generate a Healthcare Technology career field infographic for high schoolers."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Red Envelope Set Showcase",
            "description": "Create a festive product display poster showcasing a set of four lunar new year red envelope designs with the theme of your choice.",
            "title": "Nano Banana Prompt: Lunar New Year Red Envelope Set Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K festive product showcase for a set of four red envelopes titled '{topic}'. Four different envelope designs are displayed side-by-side, each labeled with a name and keyword. A decorative title banner sits at the top and a footer note describes the set. Festive illustration style with a soft pastel background gives it a clean product-photography feel.",
                "who": "Suitable for stationery designers, lunar new year gift brands, Etsy / Shopify sellers, festive product photographers, social media designers, paper-goods Pinterest creators, and gift-shop e-commerce teams.",
                "how": [
                    "Enter a red envelope theme in {topic} (e.g., Dragon Year, Cat-themed, Floral Blessing).",
                    "Four envelope variants are auto-laid out side-by-side with names and keywords.",
                    "A decorative title banner appears at the top and a footer note at the bottom.",
                    "Generate a vertical 4K festive lunar new year red envelope set product showcase."
                ],
                "prompts": [
                    "Generate a Dragon Year Red Envelopes product showcase.",
                    "Create a Cat-themed Red Envelopes festive set display.",
                    "Generate a Floral Blessing Red Envelopes product photography poster."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI Compatibility Infographic",
            "description": "Generate a cute, cartoon-style MBTI compatibility infographic comparing two personality types with traits, cognitive functions, and relationship sliders.",
            "title": "Nano Banana Prompt: MBTI Personality Compatibility Infographic Generator | Curify AI",
            "content": {"sections": {
                "what": "This template generates a vertical 4K cartoon-style infographic poster titled '{topic}'. The split-screen layout compares two MBTI personality types with key traits, cognitive functions, character illustrations, and color themes. The center includes a compatibility summary, interaction dynamics description, and sliders for communication, shared interests, and conflict potential. Soft pastel colors, whimsical cartoon style, decorative hearts and sparkles.",
                "who": "Suitable for MBTI content creators, personality enthusiasts, dating app marketing teams, relationship coaches, social media accounts focused on personality, and anyone producing shareable MBTI-pair content.",
                "how": [
                    "Enter an MBTI pairing in {topic} (e.g., INTJ & ENFP Compatibility, INFP & ENTJ Relationship).",
                    "The poster auto-generates a split-screen with traits, cognitive functions, and character illustrations for both types.",
                    "The center compatibility section shows interaction dynamics and compatibility sliders.",
                    "Generate a vertical 4K pastel cartoon MBTI compatibility infographic."
                ],
                "prompts": [
                    "Generate an INTJ & ENFP compatibility infographic with traits and sliders.",
                    "Create an INFP & ENTJ relationship MBTI pairing poster.",
                    "Generate an ISTP & ESFJ pairing MBTI compatibility infographic."
                ]
            }}
        }
    },
    "zh": {
        "template-food-product-packaging-design": {
            "category": "食品包装设计",
            "description": "为任意食品生成高级简约风格的包装设计,包含品牌Logo、产品照片窗口、特色图标和净含量信息。",
            "title": "Nano Banana 提示词:食品包装设计生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板可为'{topic}'生成一张4K竖版的高端食品包装海报。画面包含醒目的产品名称、品牌Logo、照片窗口、关键特色图标以及净含量文字。简约现代的整体美学,搭配契合主题的配色与干净字体,呈现可直接上架的零售感。",
                "who": "适合食品品牌设计师、消费品营销人员、包装设计学生、产品摄影师、独立食品创作者以及制作食品包装样机的内容创作者。",
                "how": [
                    "在 {topic} 中填入食品类型(例如:有机燕麦、意式番茄酱)。",
                    "海报自动生成竖版包装,包含产品名、品牌Logo和产品照片窗口。",
                    "特色图标与净含量文字会自动排版在照片下方。",
                    "生成4K竖版的简约风食品包装设计海报。"
                ],
                "prompts": [
                    "生成'有机燕麦'高端包装设计海报。",
                    "为'双重巧克力曲奇'生成食品包装海报。",
                    "生成'意式番茄酱'简约风包装设计。"
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "职业领域信息图",
            "description": "为任意职业或学科领域生成结构化教育信息图,涵盖核心方向、实际应用、技能与发展目标。",
            "title": "Nano Banana 提示词:职业领域教育信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板可生成一张4K竖版教育信息图,标题为'{topic}'。版面包含4个主区块,讲解该领域的核心方向,再加上实际应用、关键技能/工具和发展目标。每个区块旁配有友好的卡通人物与场景插画,标题鲜明、配色鲜亮,适合学生阅读。",
                "who": "适合教师、学校就业辅导员、高校职业发展中心、教育内容创作者、帮助孩子探索职业的家长、教育科技产品设计师以及涵盖学科领域的博主。",
                "how": [
                    "在 {topic} 中填入职业或学科(例如:工业工程、食品科学)。",
                    "海报自动生成4个区块,涵盖核心方向、应用、技能与目标。",
                    "卡通职业人物与场景插画会出现在各区块旁。",
                    "生成4K竖版的卡通风职业领域教育信息图。"
                ],
                "prompts": [
                    "生成'工业工程'职业领域信息图。",
                    "为'食品科学'生成包含应用与技能的教育海报。",
                    "为高中生生成'医疗科技'职业领域信息图。"
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "红包套装展示",
            "description": "围绕指定主题,生成展示四款农历新年红包设计的节日产品海报。",
            "title": "Nano Banana 提示词:农历新年红包套装生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板可生成一张4K竖版节日产品展示海报,主题为'{topic}'。四款红包并排展示,每款都标注名称和关键词。顶部为装饰性标题横幅,底部附套装说明。节日感插画风格搭配柔和粉彩背景,呈现干净的产品摄影感。",
                "who": "适合文具设计师、新年礼品品牌、Etsy/Shopify卖家、节日产品摄影师、节日社媒设计师、纸艺手作Pinterest创作者以及礼品店电商团队。",
                "how": [
                    "在 {topic} 中填入红包主题(例如:龙年、猫咪主题、花卉祝福)。",
                    "四款红包变体自动并排排版,标注名称与关键词。",
                    "顶部出现装饰性标题横幅,底部出现套装说明。",
                    "生成4K竖版的节日感农历新年红包套装产品展示。"
                ],
                "prompts": [
                    "生成'龙年红包'产品展示海报。",
                    "为'猫咪主题红包'生成节日套装展示。",
                    "生成'花卉祝福红包'产品摄影海报。"
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI 匹配度信息图",
            "description": "生成一张可爱卡通风的MBTI匹配度信息图,对比两种人格的特质、认知功能与关系滑块。",
            "title": "Nano Banana 提示词:MBTI 人格匹配度信息图生成器 | Curify AI",
            "content": {"sections": {
                "what": "本模板可生成一张4K竖版卡通风信息图,标题为'{topic}'。左右分屏对比两种MBTI人格,展示关键特质、认知功能、角色插画和配色。中央区域包含匹配度总结、互动动态描述以及沟通、共同兴趣与冲突可能性的滑条。柔和粉彩配色,梦幻卡通风格,装饰性爱心与闪光。",
                "who": "适合MBTI内容创作者、人格爱好者、约会App营销团队、亲密关系教练、人格主题社媒账号,以及任何制作易于分享的MBTI配对内容的创作者。",
                "how": [
                    "在 {topic} 中填入MBTI配对(例如:INTJ & ENFP 匹配度、INFP & ENTJ 关系)。",
                    "海报自动生成左右分屏,展示两种人格的特质、认知功能与角色插画。",
                    "中央匹配度区域会展示互动动态与匹配度滑块。",
                    "生成4K竖版的粉彩卡通风MBTI匹配度信息图。"
                ],
                "prompts": [
                    "生成'INTJ & ENFP 匹配度'信息图,含特质与滑块。",
                    "为'INFP & ENTJ 关系'生成MBTI配对海报。",
                    "生成'ISTP & ESFJ 配对'MBTI匹配度信息图。"
                ]
            }}
        }
    },
    "de": {
        "template-food-product-packaging-design": {
            "category": "Lebensmittel-Verpackungsdesign",
            "description": "Erstellen Sie ein hochwertiges, minimalistisches Verpackungsdesign fuer jedes Lebensmittelprodukt mit Markenlogo, Produktfoto, Feature-Icons und Gewichtsangabe.",
            "title": "Nano Banana Prompt: Lebensmittelverpackungsdesign-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-Verpackungsposter fuer '{topic}'. Das Layout enthaelt einen praegnanten Produktnamen, das Markenlogo, ein Produktfoto im Fensterausschnitt, Symbole fuer Hauptmerkmale und die Gewichtsangabe. Minimalistisch-moderne Aesthetik mit themengerechter Farbpalette und klarer Typografie sorgen fuer ein verkaufsfertiges Erscheinungsbild.",
                "who": "Geeignet fuer Lebensmittel-Brand-Designer, CPG-Marketer, Studierende des Verpackungsdesigns, Produktfotografen, Dropshipping-Verkaeufer, unabhaengige Lebensmittelhersteller und Content-Creator, die Verpackungs-Mockups erstellen.",
                "how": [
                    "Geben Sie in {topic} eine Lebensmittelsorte ein (z.B. Bio-Haferflocken, italienische Pastasauce).",
                    "Das Poster generiert automatisch eine vertikale Verpackung mit Produktname, Logo und Foto-Fenster.",
                    "Feature-Icons und Gewichtsangabe werden unter dem Foto platziert.",
                    "Ein vertikales 4K-Minimalismus-Verpackungsdesign-Poster wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie ein hochwertiges Bio-Haferflocken-Verpackungsdesign.",
                    "Erstellen Sie ein Verpackungsposter fuer Double Chocolate Cookies.",
                    "Erstellen Sie ein minimalistisches Verpackungsdesign fuer italienische Pastasauce."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Berufsfeld-Infografik",
            "description": "Erstellen Sie eine strukturierte Lerninfografik fuer jedes Berufs- oder Studienfeld mit Schluesselaspekten, Anwendungen, Faehigkeiten und Zielen.",
            "title": "Nano Banana Prompt: Berufsfeld-Lerninfografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt eine vertikale 4K-Lerninfografik mit dem Titel '{topic}'. Vier Hauptabschnitte erklaeren Schluesselaspekte des Feldes, ergaenzt um Anwendungen, Faehigkeiten/Werkzeuge und Ziele. Cartoonartige Illustrationen von Fachleuten begleiten die Trennlinien. Freundlicher Cartoon-Stil mit fetten Ueberschriften und kraeftiger Farbcodierung macht den Inhalt fuer Lernende zugaenglich.",
                "who": "Geeignet fuer Lehrkraefte, Studienberater, Karriereservices an Universitaeten, Bildungs-Content-Creator, Eltern auf Berufserkundung mit Kindern, EdTech-Designer und Blogger, die Studienfelder behandeln.",
                "how": [
                    "Geben Sie in {topic} ein Berufs- oder Studienfeld ein (z.B. Wirtschaftsingenieurwesen, Lebensmittelwissenschaft).",
                    "Das Poster erzeugt vier Abschnitte zu Schluesselaspekten, Anwendungen, Faehigkeiten und Zielen.",
                    "Cartoon-Fachleute und Szenen erscheinen neben jedem Abschnitt.",
                    "Eine vertikale 4K-Cartoon-Berufsfeld-Lerninfografik wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie eine Berufsfeld-Infografik zu Wirtschaftsingenieurwesen.",
                    "Erstellen Sie ein Lerninfografik-Poster zu Lebensmittelwissenschaft mit Anwendungen und Faehigkeiten.",
                    "Erstellen Sie eine Berufsfeld-Infografik zu Medizintechnik fuer Oberschueler."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Rote-Umschlaege-Set Showcase",
            "description": "Erstellen Sie ein festliches Produkt-Display-Poster mit vier roten Umschlagdesigns zum chinesischen Neujahr in einem Thema Ihrer Wahl.",
            "title": "Nano Banana Prompt: Chinesisches-Neujahr-Rote-Umschlaege-Set-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt ein vertikales 4K-Showcase fuer ein Set aus vier roten Umschlaegen mit dem Titel '{topic}'. Vier verschiedene Umschlagdesigns werden nebeneinander praesentiert, jedes mit Name und Schluesselwort. Ein dekoratives Banner steht oben, ein Set-Footer unten. Festlicher Illustrationsstil mit weichem Pastell-Hintergrund vermittelt ein sauberes Produktfotografie-Gefuehl.",
                "who": "Geeignet fuer Papeterie-Designer, Neujahrsgeschenkmarken, Etsy- und Shopify-Verkaeufer, festliche Produktfotografen, Social-Media-Designer rund um die Feiertage, Pinterest-Creator und Geschenkshop-Ecommerce-Teams.",
                "how": [
                    "Geben Sie in {topic} ein Thema ein (z.B. Drachenjahr, Katzenmotiv, Bluetensegen).",
                    "Vier Umschlagvarianten werden nebeneinander mit Namen und Schluesselwoertern angeordnet.",
                    "Ein dekoratives Banner erscheint oben, ein Set-Hinweis unten.",
                    "Ein vertikales 4K-Showcase fuer das festliche Neujahrs-Umschlag-Set wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie ein Drachenjahr-Rote-Umschlaege-Showcase.",
                    "Erstellen Sie ein festliches Set-Display mit Katzenmotiv-Umschlaegen.",
                    "Erstellen Sie ein Produktfoto-Poster mit Bluetensegen-Umschlaegen."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI Kompatibilitaets-Infografik",
            "description": "Erstellen Sie eine niedliche Cartoon-Infografik zur MBTI-Kompatibilitaet mit Merkmalen, kognitiven Funktionen und Beziehungs-Slidern.",
            "title": "Nano Banana Prompt: MBTI-Kompatibilitaets-Infografik-Generator | Curify AI",
            "content": {"sections": {
                "what": "Diese Vorlage erzeugt eine vertikale 4K-Cartoon-Infografik mit dem Titel '{topic}'. Ein Split-Screen-Layout vergleicht zwei MBTI-Typen mit Schluesselmerkmalen, kognitiven Funktionen, Charakterillustrationen und Farbthemen. Die Mitte enthaelt eine Kompatibilitaetszusammenfassung, eine Beschreibung der Interaktionsdynamik sowie Slider fuer Kommunikation, gemeinsame Interessen und Konfliktpotenzial. Weiche Pastellfarben, verspielter Cartoon-Stil, dekorative Herzen und Funkeln.",
                "who": "Geeignet fuer MBTI-Content-Creator, Persoenlichkeitsenthusiasten, Marketing-Teams von Dating-Apps, Beziehungscoaches, Persoenlichkeits-Social-Accounts und alle, die teilbare MBTI-Paar-Inhalte erstellen.",
                "how": [
                    "Geben Sie in {topic} eine MBTI-Paarung ein (z.B. INTJ & ENFP Kompatibilitaet, INFP & ENTJ Beziehung).",
                    "Das Poster generiert einen Split-Screen mit Merkmalen, kognitiven Funktionen und Charakterillustrationen beider Typen.",
                    "Die zentrale Kompatibilitaetssektion zeigt Interaktionsdynamik und Slider.",
                    "Eine vertikale 4K-Pastell-Cartoon-MBTI-Kompatibilitaets-Infografik wird erstellt."
                ],
                "prompts": [
                    "Erstellen Sie eine INTJ & ENFP Kompatibilitaets-Infografik mit Merkmalen und Slidern.",
                    "Erstellen Sie ein MBTI-Paar-Poster zu INFP & ENTJ Beziehung.",
                    "Erstellen Sie eine ISTP & ESFJ Paarungs-Infografik."
                ]
            }}
        }
    },
    "es": {
        "template-food-product-packaging-design": {
            "category": "Diseno de Empaque Alimentario",
            "description": "Genera un diseno de empaque premium y minimalista para cualquier producto alimentario con logo de marca, foto del producto, iconos de caracteristicas y peso neto.",
            "title": "Nano Banana Prompt: Generador de Diseno de Empaque Alimentario | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K de empaque premium para '{topic}'. El diseno incluye un nombre de producto destacado, el logo de la marca, una foto del producto en ventana, iconos de caracteristicas y peso neto. Estetica minimalista moderna con paleta de colores tematica y tipografia limpia para un acabado listo para venta.",
                "who": "Adecuado para disenadores de marcas alimentarias, marketers de bienes de consumo, estudiantes de diseno de empaques, fotografos de producto, vendedores dropshipping, productores independientes y creadores de contenido.",
                "how": [
                    "Introduce un tipo de producto en {topic} (ej. Avena Organica, Salsa de Pasta Italiana).",
                    "El poster genera un empaque vertical con nombre, logo y ventana de foto.",
                    "Los iconos de caracteristicas y el peso neto se colocan bajo la foto.",
                    "Se genera un poster 4K vertical de diseno minimalista de empaque alimentario."
                ],
                "prompts": [
                    "Genera un diseno premium de empaque para Avena Organica.",
                    "Crea un poster de empaque para Galletas de Doble Chocolate.",
                    "Genera un diseno minimalista de empaque para Salsa de Pasta Italiana."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Infografia de Campo Profesional",
            "description": "Crea una infografia educativa estructurada para cualquier carrera o campo academico, con aspectos clave, aplicaciones reales, habilidades y objetivos.",
            "title": "Nano Banana Prompt: Generador de Infografia Educativa de Carreras | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K titulado '{topic}'. El diseno tiene 4 secciones principales que explican aspectos clave del campo, mas aplicaciones reales, habilidades/herramientas y objetivos. Ilustraciones cartoon de profesionales acompanan las secciones. Estilo cartoon amistoso con titulos en negrita y codigo de colores vibrante, accesible para estudiantes.",
                "who": "Adecuado para educadores, orientadores escolares, servicios de carrera universitarios, creadores de contenido educativo, padres orientando a sus hijos, disenadores EdTech y bloggers que cubren campos academicos.",
                "how": [
                    "Introduce un campo profesional o academico en {topic} (ej. Ingenieria Industrial, Ciencia de los Alimentos).",
                    "El poster genera 4 secciones que cubren aspectos clave, aplicaciones, habilidades y objetivos.",
                    "Ilustraciones cartoon de profesionales aparecen junto a cada seccion.",
                    "Se genera una infografia educativa cartoon vertical 4K."
                ],
                "prompts": [
                    "Genera una infografia profesional para Ingenieria Industrial.",
                    "Crea un poster educativo para Ciencia de los Alimentos con aplicaciones y habilidades.",
                    "Genera una infografia profesional para Tecnologia Sanitaria para estudiantes de secundaria."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Set de Sobres Rojos",
            "description": "Crea un poster festivo que muestre un set de cuatro disenos de sobres rojos de ano nuevo lunar con el tema que elijas.",
            "title": "Nano Banana Prompt: Generador de Set de Sobres Rojos Ano Nuevo Lunar | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K festivo de producto para un set de cuatro sobres rojos titulado '{topic}'. Cuatro disenos diferentes se muestran lado a lado, cada uno con nombre y palabra clave. Un banner decorativo encabeza la composicion y una nota al pie describe el set. Estilo ilustrativo festivo con fondo pastel suave y aire de fotografia de producto.",
                "who": "Adecuado para disenadores de papeleria, marcas de regalos de ano nuevo lunar, vendedores en Etsy / Shopify, fotografos de productos festivos, disenadores de redes sociales, creadores en Pinterest y equipos de e-commerce de tiendas de regalos.",
                "how": [
                    "Introduce un tema en {topic} (ej. Ano del Dragon, Tematica de Gatos, Bendicion Floral).",
                    "Cuatro variantes de sobre se disponen lado a lado con nombre y palabra clave.",
                    "Aparecen un banner decorativo arriba y una nota al pie.",
                    "Se genera un poster vertical 4K del set festivo de sobres rojos."
                ],
                "prompts": [
                    "Genera un set de sobres rojos del Ano del Dragon.",
                    "Crea una presentacion festiva de set de sobres con tematica de gatos.",
                    "Genera un poster de producto con sobres rojos de Bendicion Floral."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "Infografia de Compatibilidad MBTI",
            "description": "Genera una infografia cartoon de compatibilidad MBTI comparando dos tipos con rasgos, funciones cognitivas y sliders de relacion.",
            "title": "Nano Banana Prompt: Generador de Infografia de Compatibilidad MBTI | Curify AI",
            "content": {"sections": {
                "what": "Esta plantilla genera un poster vertical 4K estilo cartoon titulado '{topic}'. El diseno de pantalla dividida compara dos tipos MBTI con rasgos clave, funciones cognitivas, ilustraciones de personajes y paletas de color. El centro incluye un resumen de compatibilidad, descripcion de dinamica de interaccion y sliders de comunicacion, intereses compartidos y conflicto. Pastel suave, estilo cartoon caprichoso, corazones y destellos decorativos.",
                "who": "Adecuado para creadores de contenido MBTI, entusiastas de la personalidad, equipos de marketing de apps de citas, coaches de relaciones, cuentas de redes sociales y cualquiera que produzca contenido MBTI compartible.",
                "how": [
                    "Introduce una pareja MBTI en {topic} (ej. INTJ & ENFP Compatibilidad, INFP & ENTJ Relacion).",
                    "El poster genera una pantalla dividida con rasgos, funciones cognitivas e ilustraciones para ambos tipos.",
                    "La seccion central muestra dinamica de interaccion y sliders de compatibilidad.",
                    "Se genera una infografia vertical 4K pastel cartoon de compatibilidad MBTI."
                ],
                "prompts": [
                    "Genera una infografia INTJ & ENFP con rasgos y sliders.",
                    "Crea un poster MBTI de INFP & ENTJ Relacion.",
                    "Genera una infografia ISTP & ESFJ de compatibilidad MBTI."
                ]
            }}
        }
    },
    "fr": {
        "template-food-product-packaging-design": {
            "category": "Design d'Emballage Alimentaire",
            "description": "Generez un design d'emballage premium et minimaliste pour tout produit alimentaire avec logo, photo produit, icones de caracteristiques et poids net.",
            "title": "Nano Banana Prompt: Generateur de Design d'Emballage Alimentaire | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K d'emballage premium pour '{topic}'. La mise en page comprend un nom de produit en evidence, le logo, une photo dans une fenetre, des icones de caracteristiques et le poids net. Esthetique moderne minimaliste avec palette de couleurs thematique et typographie nette pour un rendu pret a vendre.",
                "who": "Convient aux designers de marques alimentaires, marketeurs CPG, etudiants en design d'emballage, photographes produit, vendeurs dropshipping, artisans alimentaires independants et createurs de mockups.",
                "how": [
                    "Saisissez un type de produit dans {topic} (ex. Flocons d'Avoine Bio, Sauce Pates Italienne).",
                    "L'affiche genere automatiquement un emballage vertical avec nom, logo et fenetre photo.",
                    "Les icones de caracteristiques et le poids net se placent sous la photo.",
                    "Une affiche 4K verticale minimaliste de design d'emballage est generee."
                ],
                "prompts": [
                    "Generez un design premium d'emballage pour Flocons d'Avoine Bio.",
                    "Creez une affiche d'emballage pour Cookies Double Chocolat.",
                    "Generez un design minimaliste pour Sauce Pates Italienne."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Infographie de Domaine Professionnel",
            "description": "Creez une infographie pedagogique structuree pour toute carriere ou domaine academique avec aspects cles, applications, competences et objectifs.",
            "title": "Nano Banana Prompt: Generateur d'Infographie de Domaine Professionnel | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K intitulee '{topic}'. La mise en page comporte 4 sections principales expliquant les aspects cles du domaine, plus applications, competences/outils et objectifs. Des illustrations cartoon de professionnels accompagnent les separateurs. Style cartoon amical, titres marques, codage couleur vibrant, accessible aux eleves.",
                "who": "Convient aux enseignants, conseillers d'orientation, services carriere universitaires, createurs de contenu educatif, parents accompagnant l'exploration de carrieres, designers EdTech et blogueurs couvrant des domaines academiques.",
                "how": [
                    "Saisissez un domaine professionnel dans {topic} (ex. Genie Industriel, Sciences Alimentaires).",
                    "L'affiche genere 4 sections couvrant aspects cles, applications, competences et objectifs.",
                    "Des illustrations cartoon apparaissent aux cotes de chaque section.",
                    "Une infographie pedagogique cartoon verticale 4K est generee."
                ],
                "prompts": [
                    "Generez une infographie de domaine pour Genie Industriel.",
                    "Creez une affiche pedagogique pour Sciences Alimentaires avec applications et competences.",
                    "Generez une infographie de domaine pour Technologie de la Sante destinee aux lyceens."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Set d'Enveloppes Rouges",
            "description": "Creez une affiche festive de presentation produit pour un set de quatre enveloppes rouges du Nouvel An lunaire dans le theme de votre choix.",
            "title": "Nano Banana Prompt: Generateur de Set d'Enveloppes Rouges Nouvel An Lunaire | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K festive presentant un set de quatre enveloppes rouges intitule '{topic}'. Quatre designs differents sont affiches cote a cote, chacun avec un nom et un mot-cle. Une banniere decorative en haut, une note de pied en bas. Style illustratif festif sur fond pastel doux, ambiance photo produit propre.",
                "who": "Convient aux designers de papeterie, marques de cadeaux du Nouvel An lunaire, vendeurs Etsy / Shopify, photographes produit festifs, designers reseaux sociaux, createurs Pinterest et equipes e-commerce de boutiques cadeaux.",
                "how": [
                    "Saisissez un theme dans {topic} (ex. Annee du Dragon, Theme Chats, Benediction Florale).",
                    "Quatre variantes d'enveloppes sont disposees cote a cote avec noms et mots-cles.",
                    "Une banniere decorative apparait en haut et une note de pied en bas.",
                    "Une affiche 4K festive de set d'enveloppes rouges du Nouvel An lunaire est generee."
                ],
                "prompts": [
                    "Generez une presentation produit Enveloppes Rouges Annee du Dragon.",
                    "Creez un set festif d'enveloppes rouges Theme Chats.",
                    "Generez une affiche photo produit avec Enveloppes Rouges Benediction Florale."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "Infographie de Compatibilite MBTI",
            "description": "Generez une infographie cartoon de compatibilite MBTI comparant deux types avec traits, fonctions cognitives et curseurs de relation.",
            "title": "Nano Banana Prompt: Generateur d'Infographie de Compatibilite MBTI | Curify AI",
            "content": {"sections": {
                "what": "Ce modele genere une affiche verticale 4K cartoon intitulee '{topic}'. La mise en page en ecran scinde compare deux types MBTI avec traits cles, fonctions cognitives, illustrations de personnages et palettes de couleurs. Le centre inclut un resume de compatibilite, une description de dynamique d'interaction et des curseurs pour communication, interets partages et potentiel de conflit. Pastels doux, style cartoon ludique, coeurs et etincelles decoratifs.",
                "who": "Convient aux createurs de contenu MBTI, passionnes de personnalite, equipes marketing d'applications de rencontre, coaches en relations, comptes sociaux personnalite et quiconque produit du contenu MBTI a partager.",
                "how": [
                    "Saisissez un appariement MBTI dans {topic} (ex. INTJ & ENFP Compatibilite, INFP & ENTJ Relation).",
                    "L'affiche genere un ecran scinde avec traits, fonctions cognitives et illustrations pour les deux types.",
                    "La section centrale de compatibilite affiche dynamique d'interaction et curseurs.",
                    "Une infographie verticale 4K pastel cartoon de compatibilite MBTI est generee."
                ],
                "prompts": [
                    "Generez une infographie INTJ & ENFP avec traits et curseurs.",
                    "Creez une affiche d'appariement MBTI pour INFP & ENTJ Relation.",
                    "Generez une infographie d'appariement ISTP & ESFJ."
                ]
            }}
        }
    },
    "hi": {
        "template-food-product-packaging-design": {
            "category": "खाद्य उत्पाद पैकेजिंग डिज़ाइन",
            "description": "किसी भी खाद्य उत्पाद के लिए ब्रांड लोगो, उत्पाद फोटो विंडो, फीचर आइकन और नेट वज़न के साथ प्रीमियम मिनिमलिस्ट पैकेजिंग डिज़ाइन तैयार करें।",
            "title": "Nano Banana प्रॉम्प्ट: खाद्य उत्पाद पैकेजिंग डिज़ाइन जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' के लिए एक 4K वर्टिकल प्रीमियम खाद्य उत्पाद पैकेजिंग पोस्टर तैयार करता है। लेआउट में बोल्ड उत्पाद नाम, ब्रांड लोगो, विंडो में उत्पाद फोटो, मुख्य फीचर आइकन और नेट वज़न शामिल हैं। मिनिमलिस्ट आधुनिक सौंदर्य, थीम-संगत रंग पैलेट और साफ टाइपोग्राफी इसे रिटेल-रेडी रूप देते हैं।",
                "who": "खाद्य ब्रांड डिज़ाइनरों, CPG मार्केटर्स, पैकेजिंग डिज़ाइन छात्रों, प्रोडक्ट फोटोग्राफरों, ड्रॉपशिपिंग विक्रेताओं, स्वतंत्र खाद्य निर्माताओं और मॉकअप बनाने वाले कंटेंट क्रिएटर्स के लिए उपयुक्त।",
                "how": [
                    "{topic} में खाद्य उत्पाद प्रकार दर्ज करें (जैसे Organic Rolled Oats, Italian Pasta Sauce)।",
                    "पोस्टर स्वचालित रूप से उत्पाद नाम, लोगो और फोटो विंडो के साथ वर्टिकल पैकेज तैयार करता है।",
                    "फीचर आइकन और नेट वज़न फोटो के नीचे रखे जाते हैं।",
                    "4K वर्टिकल मिनिमलिस्ट खाद्य पैकेजिंग डिज़ाइन पोस्टर तैयार करें।"
                ],
                "prompts": [
                    "Organic Rolled Oats के लिए प्रीमियम पैकेजिंग डिज़ाइन तैयार करें।",
                    "Double Chocolate Cookies के लिए खाद्य पैकेजिंग पोस्टर बनाएं।",
                    "Italian Pasta Sauce के लिए मिनिमलिस्ट पैकेजिंग डिज़ाइन तैयार करें।"
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "कैरियर क्षेत्र इन्फोग्राफिक",
            "description": "किसी भी कैरियर या शैक्षणिक क्षेत्र के मुख्य पहलू, अनुप्रयोग, कौशल और लक्ष्य के साथ संरचित शैक्षिक इन्फोग्राफिक बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: शैक्षिक कैरियर क्षेत्र इन्फोग्राफिक जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाला एक 4K वर्टिकल शैक्षिक इन्फोग्राफिक पोस्टर तैयार करता है। लेआउट में क्षेत्र के मुख्य पहलू समझाते हुए 4 मुख्य अनुभाग हैं, साथ ही वास्तविक अनुप्रयोग, कौशल/उपकरण और लक्ष्य। प्रत्येक अनुभाग के साथ पेशेवरों की कार्टून शैली में चित्र दिखाई देते हैं। बोल्ड शीर्षक और जीवंत रंग कोडिंग छात्रों के लिए सुलभ है।",
                "who": "शिक्षकों, स्कूल काउंसलरों, विश्वविद्यालय कैरियर सेवाओं, शिक्षा कंटेंट क्रिएटर्स, बच्चों को कैरियर समझाने वाले अभिभावकों, EdTech डिज़ाइनरों और शैक्षणिक क्षेत्रों पर ब्लॉग करने वालों के लिए उपयुक्त।",
                "how": [
                    "{topic} में कैरियर या शैक्षणिक क्षेत्र दर्ज करें (जैसे Industrial Engineering, Food Science)।",
                    "पोस्टर 4 अनुभाग तैयार करता है: मुख्य पहलू, अनुप्रयोग, कौशल और लक्ष्य।",
                    "प्रत्येक अनुभाग के साथ कार्टून पेशेवर और दृश्य चित्र दिखाई देते हैं।",
                    "4K वर्टिकल कार्टून शैली में कैरियर क्षेत्र शैक्षिक इन्फोग्राफिक तैयार करें।"
                ],
                "prompts": [
                    "Industrial Engineering के लिए कैरियर क्षेत्र इन्फोग्राफिक तैयार करें।",
                    "Food Science के लिए अनुप्रयोग और कौशल के साथ शैक्षिक पोस्टर बनाएं।",
                    "हाई स्कूल छात्रों के लिए Healthcare Technology कैरियर इन्फोग्राफिक तैयार करें।"
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "लाल लिफाफा सेट प्रदर्शनी",
            "description": "अपनी पसंद की थीम के साथ चार चंद्र नववर्ष लाल लिफाफा डिज़ाइनों के सेट को प्रदर्शित करने वाला उत्सव पोस्टर बनाएं।",
            "title": "Nano Banana प्रॉम्प्ट: चंद्र नववर्ष लाल लिफाफा सेट जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाले चार लाल लिफाफों के सेट के लिए एक 4K वर्टिकल उत्सव उत्पाद प्रदर्शनी तैयार करता है। चार अलग-अलग लिफाफा डिज़ाइन साथ-साथ दिखाए जाते हैं, प्रत्येक नाम और कीवर्ड के साथ। शीर्ष पर सजावटी शीर्षक बैनर और नीचे सेट का विवरण। उत्सव चित्रण शैली और मुलायम पेस्टल पृष्ठभूमि स्वच्छ उत्पाद-फोटोग्राफी अनुभव देती है।",
                "who": "स्टेशनरी डिज़ाइनरों, चंद्र नववर्ष उपहार ब्रांडों, Etsy/Shopify विक्रेताओं, उत्सव उत्पाद फोटोग्राफरों, सोशल मीडिया डिज़ाइनरों, Pinterest क्रिएटर्स और उपहार दुकान ई-कॉमर्स टीमों के लिए उपयुक्त।",
                "how": [
                    "{topic} में लाल लिफाफा थीम दर्ज करें (जैसे Dragon Year, Cat-themed, Floral Blessing)।",
                    "चार लिफाफा वेरिएंट नाम और कीवर्ड के साथ साथ-साथ स्वचालित रूप से व्यवस्थित होते हैं।",
                    "शीर्ष पर सजावटी शीर्षक बैनर और नीचे फूटर नोट दिखाई देते हैं।",
                    "4K वर्टिकल उत्सव चंद्र नववर्ष लाल लिफाफा सेट उत्पाद प्रदर्शनी तैयार करें।"
                ],
                "prompts": [
                    "Dragon Year Red Envelopes उत्पाद प्रदर्शनी तैयार करें।",
                    "Cat-themed Red Envelopes उत्सव सेट प्रदर्शनी बनाएं।",
                    "Floral Blessing Red Envelopes उत्पाद फोटोग्राफी पोस्टर तैयार करें।"
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI अनुकूलता इन्फोग्राफिक",
            "description": "लक्षणों, संज्ञानात्मक कार्यों और संबंध स्लाइडर के साथ दो व्यक्तित्व प्रकारों की तुलना करने वाली प्यारी कार्टून शैली MBTI अनुकूलता इन्फोग्राफिक तैयार करें।",
            "title": "Nano Banana प्रॉम्प्ट: MBTI व्यक्तित्व अनुकूलता इन्फोग्राफिक जनरेटर | Curify AI",
            "content": {"sections": {
                "what": "यह टेम्पलेट '{topic}' शीर्षक वाला एक 4K वर्टिकल कार्टून शैली इन्फोग्राफिक पोस्टर तैयार करता है। स्प्लिट-स्क्रीन लेआउट दो MBTI व्यक्तित्व प्रकारों की तुलना मुख्य लक्षणों, संज्ञानात्मक कार्यों, चरित्र चित्रों और रंग थीम के साथ करता है। केंद्र में अनुकूलता सारांश, इंटरैक्शन डायनामिक्स विवरण और संचार, साझा रुचियों एवं संघर्ष क्षमता के स्लाइडर हैं। मुलायम पेस्टल रंग, चंचल कार्टून शैली, सजावटी दिल और चमक।",
                "who": "MBTI कंटेंट क्रिएटर्स, व्यक्तित्व उत्साही, डेटिंग ऐप मार्केटिंग टीमों, रिलेशनशिप कोचों, व्यक्तित्व सोशल मीडिया खातों और साझा करने योग्य MBTI जोड़ी कंटेंट बनाने वाले किसी भी व्यक्ति के लिए उपयुक्त।",
                "how": [
                    "{topic} में MBTI जोड़ी दर्ज करें (जैसे INTJ & ENFP Compatibility, INFP & ENTJ Relationship)।",
                    "पोस्टर दोनों प्रकारों के लक्षणों, संज्ञानात्मक कार्यों और चरित्र चित्रों के साथ स्प्लिट-स्क्रीन तैयार करता है।",
                    "केंद्रीय अनुकूलता अनुभाग इंटरैक्शन डायनामिक्स और स्लाइडर दिखाता है।",
                    "4K वर्टिकल पेस्टल कार्टून MBTI अनुकूलता इन्फोग्राफिक तैयार करें।"
                ],
                "prompts": [
                    "लक्षणों और स्लाइडर के साथ INTJ & ENFP अनुकूलता इन्फोग्राफिक तैयार करें।",
                    "INFP & ENTJ रिलेशनशिप MBTI जोड़ी पोस्टर बनाएं।",
                    "ISTP & ESFJ जोड़ी MBTI अनुकूलता इन्फोग्राफिक तैयार करें।"
                ]
            }}
        }
    },
    "ja": {
        "template-food-product-packaging-design": {
            "category": "食品パッケージデザイン",
            "description": "ブランドロゴ、商品写真ウィンドウ、特徴アイコン、内容量テキストを備えた、あらゆる食品向けのプレミアム・ミニマルなパッケージデザインを生成します。",
            "title": "Nano Bananaプロンプト:食品パッケージデザインジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' の4K縦型プレミアム食品パッケージポスターを生成します。レイアウトには大きな商品名、ブランドロゴ、ウィンドウ内の商品写真、特徴アイコン、内容量テキストが含まれます。ミニマルで現代的な美意識、テーマに合わせた配色、洗練された書体により、すぐ陳列できる仕上がりになります。",
                "who": "食品ブランドデザイナー、CPGマーケター、パッケージデザイン学生、商品写真家、ドロップシッピング販売者、独立系食品メーカー、商品モックアップを作るコンテンツクリエイターに最適。",
                "how": [
                    "{topic} に食品の種類を入力(例:Organic Rolled Oats、Italian Pasta Sauce)。",
                    "ポスターが商品名・ロゴ・写真ウィンドウ付きの縦型パッケージを自動生成します。",
                    "特徴アイコンと内容量テキストが写真の下に自動配置されます。",
                    "4K縦型ミニマル食品パッケージデザインポスターを生成します。"
                ],
                "prompts": [
                    "Organic Rolled Oats のプレミアムパッケージデザインを生成。",
                    "Double Chocolate Cookies の食品パッケージポスターを作成。",
                    "Italian Pasta Sauce のミニマルパッケージデザインを生成。"
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "キャリア分野インフォグラフィック",
            "description": "あらゆる職業・学問分野について、要点、応用、スキル、目標を整理した構造化教育インフォグラフィックを作成します。",
            "title": "Nano Bananaプロンプト:キャリア分野教育インフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした4K縦型教育インフォグラフィックポスターを生成します。4つの主要セクションが分野の要点を説明し、実応用、スキル/ツール、目標を補足します。プロフェッショナルや関連シーンのカートゥーンイラストが各セクションに添えられます。明朗な見出しと鮮やかな色分けで、学習者にも親しみやすい構成です。",
                "who": "教員、進路指導員、大学キャリアセンター、教育系コンテンツ作家、子どもの進路探しを支援する保護者、EdTechデザイナー、学問分野を扱うブロガーに最適。",
                "how": [
                    "{topic} に職業・学問分野を入力(例:Industrial Engineering、Food Science)。",
                    "ポスターが要点・応用・スキル・目標の4セクションを自動生成します。",
                    "カートゥーンのプロフェッショナルや場面が各セクションに登場します。",
                    "4K縦型カートゥーン調キャリア分野教育インフォグラフィックを生成します。"
                ],
                "prompts": [
                    "Industrial Engineering のキャリア分野インフォグラフィックを生成。",
                    "Food Science の応用・スキル付き教育ポスターを作成。",
                    "高校生向けの Healthcare Technology キャリア分野インフォグラフィックを生成。"
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "紅包セット展示",
            "description": "選んだテーマで、旧正月の紅包(レッドエンベロープ)4種をまとめた華やかな商品展示ポスターを作成します。",
            "title": "Nano Bananaプロンプト:旧正月紅包セットジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした、4種の紅包セットの4K縦型展示ポスターを生成します。4つの異なるデザインが横並びで配置され、それぞれ名称とキーワードが付きます。上部に装飾的なタイトルバナー、下部にセット説明のフッターが入ります。華やかなイラスト調と柔らかなパステル背景で、清潔感のある商品写真の雰囲気に仕上がります。",
                "who": "ステーショナリーデザイナー、旧正月ギフトブランド、Etsy / Shopify セラー、季節商品の写真家、SNSデザイナー、Pinterest クリエイター、ギフトショップEC運用チームに最適。",
                "how": [
                    "{topic} に紅包テーマを入力(例:Dragon Year、Cat-themed、Floral Blessing)。",
                    "4つの紅包バリエーションが名称とキーワードと共に自動配置されます。",
                    "上部に装飾的タイトルバナー、下部にフッターが入ります。",
                    "4K縦型の華やかな旧正月紅包セット展示ポスターを生成します。"
                ],
                "prompts": [
                    "Dragon Year Red Envelopes の商品展示ポスターを生成。",
                    "Cat-themed Red Envelopes の華やかなセット展示を作成。",
                    "Floral Blessing Red Envelopes の商品写真ポスターを生成。"
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI 相性インフォグラフィック",
            "description": "特性、認知機能、関係性スライダーで二つのタイプを比較する、かわいいカートゥーン調のMBTI相性インフォグラフィックを生成します。",
            "title": "Nano Bananaプロンプト:MBTI性格相性インフォグラフィックジェネレーター | Curify AI",
            "content": {"sections": {
                "what": "このテンプレートは '{topic}' を題名にした4K縦型カートゥーン調インフォグラフィックポスターを生成します。スプリットスクリーンのレイアウトで2つのMBTIタイプの主要特性、認知機能、キャラクターイラスト、色テーマを比較。中央には相性まとめ、相互作用の解説、コミュニケーション・共通の興味・衝突可能性のスライダーが配置されます。柔らかなパステル、遊び心のあるカートゥーン、装飾的なハートとスパークル。",
                "who": "MBTIコンテンツクリエイター、性格論ファン、デーティングアプリのマーケ、関係性コーチ、性格系SNSアカウント、共有しやすいMBTIペア素材を作る人に最適。",
                "how": [
                    "{topic} にMBTIペアを入力(例:INTJ & ENFP Compatibility、INFP & ENTJ Relationship)。",
                    "ポスターが両タイプの特性・認知機能・キャラクターイラスト付きスプリットスクリーンを自動生成。",
                    "中央の相性セクションが相互作用とスライダーを表示します。",
                    "4K縦型のパステルカートゥーンMBTI相性インフォグラフィックを生成します。"
                ],
                "prompts": [
                    "特性とスライダー付き INTJ & ENFP 相性インフォグラフィックを生成。",
                    "INFP & ENTJ 関係のMBTIペアポスターを作成。",
                    "ISTP & ESFJ ペアのMBTI相性インフォグラフィックを生成。"
                ]
            }}
        }
    },
    "ko": {
        "template-food-product-packaging-design": {
            "category": "식품 패키지 디자인",
            "description": "브랜드 로고, 제품 사진 윈도우, 특징 아이콘, 내용량 텍스트를 갖춘 어떤 식품에도 어울리는 프리미엄 미니멀 패키지 디자인을 생성하세요.",
            "title": "Nano Banana 프롬프트: 식품 패키지 디자인 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 을 위한 4K 세로형 프리미엄 식품 패키지 포스터를 생성합니다. 굵은 제품명, 브랜드 로고, 윈도우 안의 제품 사진, 주요 특징 아이콘, 내용량 텍스트가 배치됩니다. 미니멀한 현대적 미감, 테마에 맞춘 색감, 깔끔한 타이포그래피로 곧바로 진열 가능한 분위기를 만듭니다.",
                "who": "식품 브랜드 디자이너, CPG 마케터, 패키지 디자인 학생, 제품 사진가, 드롭쉬핑 셀러, 인디 식품 제작자, 제품 목업을 만드는 콘텐츠 크리에이터에게 적합.",
                "how": [
                    "{topic} 에 식품 종류를 입력 (예: Organic Rolled Oats, Italian Pasta Sauce).",
                    "포스터가 제품명, 로고, 사진 윈도우가 포함된 세로형 패키지를 자동 생성합니다.",
                    "특징 아이콘과 내용량이 사진 아래에 배치됩니다.",
                    "4K 세로형 미니멀 식품 패키지 디자인 포스터가 생성됩니다."
                ],
                "prompts": [
                    "Organic Rolled Oats 프리미엄 패키지 디자인을 생성.",
                    "Double Chocolate Cookies 식품 패키지 포스터를 생성.",
                    "Italian Pasta Sauce 미니멀 패키지 디자인을 생성."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "직업 분야 인포그래픽",
            "description": "어떤 직업이나 학문 분야든 핵심 측면, 실제 적용, 기술, 목표를 정리한 구조적 교육용 인포그래픽을 만드세요.",
            "title": "Nano Banana 프롬프트: 직업 분야 교육 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목의 4K 세로형 교육 인포그래픽 포스터를 생성합니다. 4개의 주요 섹션이 해당 분야의 핵심을 설명하고, 실제 적용, 기술/도구, 목표가 함께 다뤄집니다. 각 섹션 옆에는 직업인 카툰 일러스트가 배치됩니다. 친근한 카툰 스타일, 굵은 헤딩, 생동감 있는 색상 코딩으로 학생도 쉽게 이해할 수 있습니다.",
                "who": "교사, 진로 상담사, 대학 커리어 센터, 교육 콘텐츠 제작자, 자녀의 진로 탐색을 돕는 부모, EdTech 디자이너, 학문 분야를 다루는 블로거에게 적합.",
                "how": [
                    "{topic} 에 직업/학문 분야를 입력 (예: Industrial Engineering, Food Science).",
                    "포스터가 핵심·적용·기술·목표 4개 섹션을 자동 생성합니다.",
                    "카툰 직업인과 장면 일러스트가 각 섹션에 등장합니다.",
                    "4K 세로형 카툰 스타일의 직업 분야 교육 인포그래픽이 생성됩니다."
                ],
                "prompts": [
                    "Industrial Engineering 직업 분야 인포그래픽을 생성.",
                    "Food Science 의 적용·기술이 포함된 교육 포스터를 생성.",
                    "고등학생용 Healthcare Technology 직업 분야 인포그래픽을 생성."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "세뱃돈 봉투 세트 쇼케이스",
            "description": "원하는 테마로 음력 새해 빨간 봉투(세뱃돈 봉투) 네 가지를 한 세트로 보여주는 축제 분위기의 제품 포스터를 만드세요.",
            "title": "Nano Banana 프롬프트: 음력 새해 빨간 봉투 세트 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목으로 빨간 봉투 4개 세트의 4K 세로형 축제 제품 쇼케이스를 생성합니다. 네 가지 다른 디자인이 나란히 배치되며, 각각 이름과 키워드가 표시됩니다. 상단에 장식 타이틀 배너, 하단에 세트 설명 푸터가 들어갑니다. 축제 일러스트 스타일과 부드러운 파스텔 배경으로 깔끔한 제품 사진 분위기를 연출합니다.",
                "who": "문구 디자이너, 음력 새해 선물 브랜드, Etsy/Shopify 셀러, 축제 시즌 제품 사진가, 명절 SNS 디자이너, Pinterest 크리에이터, 선물용품 이커머스 팀에게 적합.",
                "how": [
                    "{topic} 에 봉투 테마를 입력 (예: Dragon Year, Cat-themed, Floral Blessing).",
                    "네 가지 봉투 변형이 이름·키워드와 함께 나란히 자동 배치됩니다.",
                    "상단에 장식 타이틀 배너, 하단에 푸터 노트가 표시됩니다.",
                    "4K 세로형 음력 새해 빨간 봉투 세트 쇼케이스 포스터가 생성됩니다."
                ],
                "prompts": [
                    "Dragon Year Red Envelopes 제품 쇼케이스를 생성.",
                    "Cat-themed Red Envelopes 축제 세트 디스플레이를 생성.",
                    "Floral Blessing Red Envelopes 제품 사진 포스터를 생성."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI 궁합 인포그래픽",
            "description": "특성, 인지 기능, 관계 슬라이더로 두 성격 유형을 비교하는 귀여운 카툰 스타일의 MBTI 궁합 인포그래픽을 생성하세요.",
            "title": "Nano Banana 프롬프트: MBTI 성격 궁합 인포그래픽 생성기 | Curify AI",
            "content": {"sections": {
                "what": "이 템플릿은 '{topic}' 제목의 4K 세로형 카툰 인포그래픽 포스터를 생성합니다. 좌우 분할 레이아웃이 두 MBTI 유형의 주요 특성, 인지 기능, 캐릭터 일러스트, 컬러 테마를 비교합니다. 중앙에는 궁합 요약, 상호작용 다이내믹스 설명, 의사소통·공통 관심사·갈등 가능성 슬라이더가 포함됩니다. 부드러운 파스텔, 사랑스러운 카툰 스타일, 장식적인 하트와 반짝임.",
                "who": "MBTI 콘텐츠 크리에이터, 성격유형 애호가, 데이팅 앱 마케팅 팀, 관계 코치, 성격유형 중심 SNS 계정, 공유하기 좋은 MBTI 페어 콘텐츠를 만드는 누구에게나 적합.",
                "how": [
                    "{topic} 에 MBTI 페어를 입력 (예: INTJ & ENFP Compatibility, INFP & ENTJ Relationship).",
                    "포스터가 두 유형의 특성·인지 기능·캐릭터 일러스트가 있는 좌우 분할을 자동 생성합니다.",
                    "중앙 궁합 섹션이 상호작용 다이내믹스와 슬라이더를 보여줍니다.",
                    "4K 세로형 파스텔 카툰 MBTI 궁합 인포그래픽이 생성됩니다."
                ],
                "prompts": [
                    "특성과 슬라이더가 있는 INTJ & ENFP 궁합 인포그래픽을 생성.",
                    "INFP & ENTJ 관계 MBTI 페어 포스터를 생성.",
                    "ISTP & ESFJ 페어 MBTI 궁합 인포그래픽을 생성."
                ]
            }}
        }
    },
    "ru": {
        "template-food-product-packaging-design": {
            "category": "Дизайн упаковки пищевого продукта",
            "description": "Создайте премиальный минималистичный дизайн упаковки для любого пищевого продукта с логотипом, фото продукта в окне, иконками характеристик и весом нетто.",
            "title": "Nano Banana промпт: Генератор дизайна упаковки пищевого продукта | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K-постер премиальной упаковки для '{topic}'. В компоновке — крупное название продукта, логотип бренда, фото продукта в окне, иконки ключевых характеристик и текст с весом нетто. Минималистичная современная эстетика, тематическая палитра и чистая типографика создают вид, готовый к продаже.",
                "who": "Подходит дизайнерам пищевых брендов, CPG-маркетологам, студентам упаковочного дизайна, фотографам продуктов, дропшипперам, независимым производителям и контент-мейкерам, делающим макапы упаковки.",
                "how": [
                    "Введите тип продукта в {topic} (например, Organic Rolled Oats, Italian Pasta Sauce).",
                    "Постер автоматически генерирует вертикальную упаковку с названием, логотипом и окном фото.",
                    "Иконки характеристик и вес нетто размещаются под фотографией.",
                    "Создаётся вертикальный 4K-постер минималистичной упаковки пищевого продукта."
                ],
                "prompts": [
                    "Создайте премиальный дизайн упаковки для Organic Rolled Oats.",
                    "Создайте постер упаковки для Double Chocolate Cookies.",
                    "Создайте минималистичный дизайн упаковки для Italian Pasta Sauce."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Инфографика профессиональной области",
            "description": "Создайте структурированную образовательную инфографику для любой профессии или академической области: ключевые аспекты, реальные применения, навыки и цели.",
            "title": "Nano Banana промпт: Генератор образовательной инфографики профессиональной области | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K-постер инфографики с заголовком '{topic}'. В компоновке — 4 основных раздела с ключевыми аспектами области, плюс реальные применения, навыки/инструменты и цели. Мультяшные иллюстрации специалистов сопровождают разделители. Дружелюбный мультяшный стиль, жирные заголовки и яркое цветовое кодирование делают материал доступным для учеников.",
                "who": "Подходит учителям, школьным консультантам, университетским службам карьеры, создателям образовательного контента, родителям, помогающим детям с выбором профессии, EdTech-дизайнерам и блогерам, освещающим академические области.",
                "how": [
                    "Введите профессиональную или академическую область в {topic} (например, Industrial Engineering, Food Science).",
                    "Постер автоматически создаёт 4 раздела: аспекты, применения, навыки и цели.",
                    "Мультяшные специалисты и сцены появляются рядом с каждым разделом.",
                    "Создаётся вертикальная 4K мультяшная образовательная инфографика профессиональной области."
                ],
                "prompts": [
                    "Создайте инфографику профессиональной области для Industrial Engineering.",
                    "Создайте образовательный постер для Food Science с применениями и навыками.",
                    "Создайте инфографику профессии Healthcare Technology для старшеклассников."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Витрина набора красных конвертов",
            "description": "Создайте праздничный продуктовый постер с набором из четырёх дизайнов красных конвертов лунного Нового года на любую тему.",
            "title": "Nano Banana промпт: Генератор набора красных конвертов лунного Нового года | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальную 4K праздничную витрину набора из четырёх красных конвертов с заголовком '{topic}'. Четыре разных дизайна показаны рядом, каждый с названием и ключевым словом. Сверху декоративный баннер заголовка, снизу — подпись о наборе. Праздничный иллюстративный стиль с мягким пастельным фоном создаёт чистое ощущение продуктовой фотографии.",
                "who": "Подходит дизайнерам канцелярии, брендам подарков лунного Нового года, продавцам Etsy/Shopify, праздничным фотографам продуктов, дизайнерам соцсетей, Pinterest-авторам и e-commerce-командам магазинов подарков.",
                "how": [
                    "Введите тему конвертов в {topic} (например, Dragon Year, Cat-themed, Floral Blessing).",
                    "Четыре варианта конвертов автоматически выстраиваются в ряд с названиями и ключевыми словами.",
                    "Сверху появляется декоративный баннер, снизу — подпись о наборе.",
                    "Создаётся вертикальный 4K праздничный постер набора красных конвертов."
                ],
                "prompts": [
                    "Создайте витрину набора Dragon Year Red Envelopes.",
                    "Создайте праздничную витрину Cat-themed Red Envelopes.",
                    "Создайте постер продуктовой фотографии Floral Blessing Red Envelopes."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "Инфографика совместимости MBTI",
            "description": "Создайте милую мультяшную инфографику совместимости MBTI, сравнивающую два типа личности по чертам, когнитивным функциям и слайдерам отношений.",
            "title": "Nano Banana промпт: Генератор инфографики совместимости MBTI | Curify AI",
            "content": {"sections": {
                "what": "Этот шаблон создаёт вертикальный 4K мультяшный постер инфографики с заголовком '{topic}'. Сплит-скрин сравнивает два типа MBTI по ключевым чертам, когнитивным функциям, иллюстрациям персонажей и цветовым темам. В центре — резюме совместимости, описание динамики взаимодействия и слайдеры коммуникации, общих интересов и потенциала конфликта. Мягкие пастельные цвета, причудливый мультяшный стиль, декоративные сердца и блёстки.",
                "who": "Подходит MBTI-контент-мейкерам, энтузиастам типологии личности, маркетинговым командам дейтинг-приложений, коучам по отношениям, тематическим соцсетям и всем, кто делает шеринговый MBTI-парный контент.",
                "how": [
                    "Введите пару MBTI в {topic} (например, INTJ & ENFP Compatibility, INFP & ENTJ Relationship).",
                    "Постер автоматически создаёт сплит-скрин с чертами, когнитивными функциями и иллюстрациями для обоих типов.",
                    "Центральная секция совместимости показывает динамику взаимодействия и слайдеры.",
                    "Создаётся вертикальная 4K пастельная мультяшная инфографика совместимости MBTI."
                ],
                "prompts": [
                    "Создайте инфографику совместимости INTJ & ENFP с чертами и слайдерами.",
                    "Создайте постер MBTI-пары INFP & ENTJ Relationship.",
                    "Создайте инфографику совместимости пары ISTP & ESFJ."
                ]
            }}
        }
    },
    "tr": {
        "template-food-product-packaging-design": {
            "category": "Gida Urunu Ambalaj Tasarimi",
            "description": "Marka logosu, urun fotograf penceresi, ozellik ikonlari ve net agirlik metni ile herhangi bir gida urunu icin premium minimal ambalaj tasarimi olusturun.",
            "title": "Nano Banana Prompt: Gida Urunu Ambalaj Tasarimi Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' icin 4K dikey premium gida urunu ambalaj posteri uretir. Yerlesimde belirgin urun adi, marka logosu, pencerede urun fotografi, ana ozellik ikonlari ve net agirlik metni bulunur. Minimal modern estetik, temaya uygun renk paleti ve temiz tipografi ile rafa hazir bir gorunum sunar.",
                "who": "Gida marka tasarimcilari, CPG pazarlamacilari, ambalaj tasarimi ogrencileri, urun fotografcilari, dropshipping saticilari, bagimsiz gida ureticileri ve urun mockup'lari hazirlayan icerik ureticileri icin uygundur.",
                "how": [
                    "{topic} alanina gida turunu girin (orn. Organic Rolled Oats, Italian Pasta Sauce).",
                    "Poster urun adi, logo ve fotograf penceresiyle dikey ambalaji otomatik olusturur.",
                    "Ozellik ikonlari ve net agirlik fotografin altina yerlestirilir.",
                    "4K dikey minimal gida ambalaj tasarimi posteri uretilir."
                ],
                "prompts": [
                    "Organic Rolled Oats icin premium ambalaj tasarimi olusturun.",
                    "Double Chocolate Cookies icin gida ambalaji posteri olusturun.",
                    "Italian Pasta Sauce icin minimal ambalaj tasarimi olusturun."
                ]
            }}
        },
        "template-educational-career-field-infographic": {
            "category": "Kariyer Alani Infografigi",
            "description": "Herhangi bir kariyer veya akademik alan icin temel yonler, gercek uygulamalar, beceriler ve hedefler iceren yapilandirilmis egitim infografigi olusturun.",
            "title": "Nano Banana Prompt: Egitim Kariyer Alani Infografik Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli 4K dikey egitim infografigi posteri uretir. Yerlesimde alanin temel yonlerini aciklayan 4 ana bolum, ardindan gercek uygulamalar, beceriler/araclar ve hedefler bulunur. Profesyonellerin karikatur cizimleri her bolume eslik eder. Samimi karikatur stili, kalin basliklar ve canli renk kodlamasi ile ogrenciler icin erisilebilir.",
                "who": "Ogretmenler, okul rehber danismanlari, universite kariyer merkezleri, egitim icerigi ureticileri, cocuklarinin kariyer kesfine yardim eden ebeveynler, EdTech tasarimcilari ve akademik alanlar hakkinda blog yazanlar icin uygundur.",
                "how": [
                    "{topic} alanina kariyer veya akademik alani girin (orn. Industrial Engineering, Food Science).",
                    "Poster temel yonler, uygulamalar, beceriler ve hedefler icin 4 bolum otomatik olusturur.",
                    "Her bolumun yanina karikatur profesyonel ve sahne cizimleri yerlestirilir.",
                    "4K dikey karikatur tarzi kariyer alani egitim infografigi uretilir."
                ],
                "prompts": [
                    "Industrial Engineering icin kariyer alani infografigi olusturun.",
                    "Food Science icin uygulamalar ve becerilerle egitim posteri olusturun.",
                    "Lise ogrencileri icin Healthcare Technology kariyer infografigi olusturun."
                ]
            }}
        },
        "template-lunar-new-year-red-envelope-set": {
            "category": "Kirmizi Zarf Seti Vitrini",
            "description": "Seciminizdeki temayla, lunar yeni yili icin dort kirmizi zarf tasariminin yer aldigi festival temasli urun posteri olusturun.",
            "title": "Nano Banana Prompt: Lunar Yeni Yil Kirmizi Zarf Seti Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli dort kirmizi zarftan olusan set icin 4K dikey festival urun vitrini uretir. Dort farkli zarf tasarimi yan yana gosterilir; her birinin yaninda ad ve anahtar kelime bulunur. Ustte dekoratif baslik banti, altta set notu yer alir. Festival illustrasyon tarzi ve yumusak pastel arka plan ile temiz urun fotografi havasi verir.",
                "who": "Kirtasiye tasarimcilari, lunar yeni yil hediye markalari, Etsy / Shopify saticilari, sezonluk urun fotografcilari, sosyal medya tasarimcilari, Pinterest ureticileri ve hediye dukkani e-ticaret ekipleri icin uygundur.",
                "how": [
                    "{topic} alanina zarf temasi girin (orn. Dragon Year, Cat-themed, Floral Blessing).",
                    "Dort zarf varyasyonu ad ve anahtar kelimeyle yan yana otomatik dizilir.",
                    "Ustte dekoratif baslik banti, altta set notu gorunur.",
                    "4K dikey festival lunar yeni yil kirmizi zarf seti urun vitrini uretilir."
                ],
                "prompts": [
                    "Dragon Year Red Envelopes urun vitrini olusturun.",
                    "Cat-themed Red Envelopes festival set sunumu olusturun.",
                    "Floral Blessing Red Envelopes urun fotografi posteri olusturun."
                ]
            }}
        },
        "template-mbti-personality-compatibility-infographic": {
            "category": "MBTI Uyumluluk Infografigi",
            "description": "Ozellikler, bilissel fonksiyonlar ve iliski sliderlari ile iki kisilik tipini karsilastiran sirin karikatur tarzinda MBTI uyumluluk infografigi olusturun.",
            "title": "Nano Banana Prompt: MBTI Kisilik Uyumluluk Infografik Olusturucu | Curify AI",
            "content": {"sections": {
                "what": "Bu sablon '{topic}' baslikli 4K dikey karikatur tarzi infografik posteri uretir. Bolunmus ekran yerlesimi iki MBTI tipini temel ozellikler, bilissel fonksiyonlar, karakter cizimleri ve renk temalariyla karsilastirir. Merkezde uyumluluk ozeti, etkilesim dinamigi aciklamasi ve iletisim, ortak ilgi ile catisma potansiyeli icin sliderlar bulunur. Yumusak pastel renkler, esprili karikatur tarzi, dekoratif kalpler ve isiltilar.",
                "who": "MBTI icerigi ureticileri, kisilik tipi meraklilari, tanisma uygulamalarinin pazarlama ekipleri, iliski koclari, kisilik odakli sosyal medya hesaplari ve paylasilabilir MBTI cift icerigi uretenler icin uygundur.",
                "how": [
                    "{topic} alanina MBTI eslesmesi girin (orn. INTJ & ENFP Compatibility, INFP & ENTJ Relationship).",
                    "Poster iki tipin ozellikleri, bilissel fonksiyonlari ve karakter cizimleriyle bolunmus ekran otomatik olusturur.",
                    "Merkez uyumluluk bolumu etkilesim dinamigini ve sliderlari gosterir.",
                    "4K dikey pastel karikatur MBTI uyumluluk infografigi uretilir."
                ],
                "prompts": [
                    "Ozellikler ve sliderlarla INTJ & ENFP uyumluluk infografigi olusturun.",
                    "INFP & ENTJ iliski MBTI cift posteri olusturun.",
                    "ISTP & ESFJ eslesmesi MBTI uyumluluk infografigi olusturun."
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
