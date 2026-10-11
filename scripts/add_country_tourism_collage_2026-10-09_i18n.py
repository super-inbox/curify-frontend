#!/usr/bin/env python3
"""Add i18n for template-country-tourism-collage-poster across all 10 locales.

Pattern mirrors scripts/add_4_new_templates_i18n.py: messages/<locale>/nano.json is
FLAT, so the template id is a direct top-level key.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TID = "template-country-tourism-collage-poster"

E = {
    "en": {
        "category": "Country Tourism Collage Poster",
        "description": "Turn any country name into a magazine-cover tourism poster: a 3D marble title in flag colours, the hero landmark, a seamless panorama of signature places, and a foreground still life of local food.",
        "title": "Nano Banana Prompt: Country Tourism Collage Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template builds a vertical, photorealistic national-tourism poster for any country. A giant carved-marble title takes the country's flag colours; the most iconic landmark rises at the centre; monuments, skyline and native landscapes flow around it as one continuous panorama; people in traditional dress, a native animal and a still life of signature dishes complete the scene, framed by small serif captions.",
            "who": "Built for tourism boards, destination marketers, hotel and travel brands, travel creators and teachers who need a striking country poster, or a whole consistent series of them, for campaigns, social posts, classrooms or wall art.",
            "how": [
                "Enter a country name (e.g. Japan, Italy, Brazil).",
                "The template renders a 4:5 poster with a 3D title in the country's flag colours.",
                "The hero landmark sits at the centre, surrounded by a seamless panorama of signature places.",
                "Traditional dress, native wildlife and a food still life add culture and depth.",
                "Swap the country name to produce a matching series for every destination."
            ],
            "prompts": [
                "Create a country tourism collage poster for Japan: Mount Fuji, Kyoto temples, cherry blossoms and sushi.",
                "Design a magazine-cover tourism poster for Italy with the Colosseum at the centre and pasta and espresso up front.",
                "Generate a national tourism collage poster for Egypt: the pyramids, the Nile, a camel caravan and koshari."
            ]
        }}
    },
    "zh": {
        "category": "国家旅游拼贴海报",
        "description": "输入任意国家名，生成杂志封面级的国家旅游海报：国旗配色的立体大理石标题、中央标志性地标、无缝衔接的全景名胜，以及前景的当地美食静物。",
        "title": "Nano Banana Prompt: 国家旅游拼贴海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "此模板为任意国家生成竖版、照片级写实的国家旅游海报。巨大的大理石雕刻标题采用国旗配色；最具代表性的地标在中央耸立；古迹、城市天际线和自然风光围绕它融合成一整幅连续全景；身着传统服饰的人物、本土动物和招牌美食静物让画面更完整，四周配以精致的小号衬线文字。",
            "who": "适合文旅局、目的地营销、酒店与旅行品牌、旅行博主和老师——需要一张抓眼球的国家海报，或者一整套风格统一的系列海报，用于宣传活动、社交媒体、课堂或装饰画。",
            "how": [
                "输入一个国家名（例如：日本、意大利、巴西）。",
                "模板生成 4:5 竖版海报，标题为该国国旗配色的立体字。",
                "中央是标志性地标，周围是无缝衔接的名胜全景。",
                "传统服饰、本土动物和美食静物增加文化感和层次。",
                "只换国家名，就能为每个目的地生成风格一致的系列海报。"
            ],
            "prompts": [
                "为日本生成国家旅游拼贴海报：富士山、京都寺庙、樱花和寿司。",
                "为意大利设计杂志封面风旅游海报，斗兽场居中，前景是意面和意式浓缩。",
                "为埃及生成国家旅游拼贴海报：金字塔、尼罗河、骆驼商队和埃及杂豆饭。"
            ]
        }}
    },
    "de": {
        "category": "Länder-Tourismus-Collage-Poster",
        "description": "Verwandle jeden Ländernamen in ein Tourismusposter im Magazin-Cover-Stil: 3D-Marmortitel in Flaggenfarben, das Wahrzeichen im Zentrum, ein nahtloses Panorama und ein Stillleben mit lokaler Küche.",
        "title": "Nano Banana Prompt: Länder-Tourismus-Collage-Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "Diese Vorlage erstellt ein fotorealistisches Hochformat-Tourismusposter für jedes Land. Ein riesiger Marmortitel trägt die Flaggenfarben; das bekannteste Wahrzeichen steht im Zentrum; Monumente, Skyline und Landschaften fließen zu einem durchgehenden Panorama zusammen; Menschen in Tracht, ein heimisches Tier und ein Stillleben typischer Gerichte runden die Szene ab.",
            "who": "Für Tourismusverbände, Destinationsmarketing, Hotel- und Reisemarken, Reise-Creator und Lehrkräfte, die ein starkes Länderposter oder eine ganze einheitliche Serie für Kampagnen, Social Media, Unterricht oder Wandkunst brauchen.",
            "how": [
                "Gib einen Ländernamen ein (z. B. Japan, Italien, Brasilien).",
                "Die Vorlage rendert ein 4:5-Poster mit 3D-Titel in den Flaggenfarben.",
                "Das Wahrzeichen steht im Zentrum, umgeben von einem nahtlosen Panorama.",
                "Tracht, heimische Tiere und ein Essens-Stillleben sorgen für Kultur und Tiefe.",
                "Tausche den Ländernamen und erhalte eine passende Serie für jedes Reiseziel."
            ],
            "prompts": [
                "Erstelle ein Tourismus-Collage-Poster für Japan: Fuji, Tempel in Kyoto, Kirschblüten und Sushi.",
                "Gestalte ein Magazin-Cover-Poster für Italien mit dem Kolosseum im Zentrum und Pasta und Espresso im Vordergrund.",
                "Generiere ein Tourismus-Collage-Poster für Ägypten: Pyramiden, Nil, Kamelkarawane und Koshari."
            ]
        }}
    },
    "es": {
        "category": "Póster collage turístico de país",
        "description": "Convierte el nombre de cualquier país en un póster turístico tipo portada de revista: título 3D de mármol con los colores de la bandera, el monumento icónico, un panorama continuo y un bodegón de comida local.",
        "title": "Nano Banana Prompt: Generador de pósters collage turísticos de países | Curify AI",
        "content": {"sections": {
            "what": "Esta plantilla crea un póster turístico vertical y fotorrealista para cualquier país. Un enorme título de mármol tallado lleva los colores de la bandera; el monumento más icónico se alza en el centro; monumentos, skyline y paisajes fluyen en un único panorama continuo; personas con trajes tradicionales, un animal autóctono y un bodegón de platos típicos completan la escena.",
            "who": "Ideal para oficinas de turismo, marketing de destinos, marcas de hoteles y viajes, creadores de viajes y docentes que necesitan un póster de país impactante, o una serie coherente, para campañas, redes sociales, clases o decoración.",
            "how": [
                "Escribe el nombre de un país (p. ej. Japón, Italia, Brasil).",
                "La plantilla genera un póster 4:5 con un título 3D en los colores de la bandera.",
                "El monumento principal ocupa el centro, rodeado de un panorama continuo.",
                "Trajes tradicionales, fauna autóctona y un bodegón gastronómico aportan cultura y profundidad.",
                "Cambia el país y obtén una serie a juego para cada destino."
            ],
            "prompts": [
                "Crea un póster collage turístico de Japón: el monte Fuji, templos de Kioto, cerezos y sushi.",
                "Diseña un póster tipo portada de revista de Italia con el Coliseo en el centro y pasta y espresso en primer plano.",
                "Genera un póster collage turístico de Egipto: pirámides, el Nilo, una caravana de camellos y koshari."
            ]
        }}
    },
    "fr": {
        "category": "Affiche collage touristique de pays",
        "description": "Transformez n'importe quel nom de pays en affiche touristique façon couverture de magazine : titre 3D en marbre aux couleurs du drapeau, monument emblématique, panorama continu et nature morte gastronomique.",
        "title": "Nano Banana Prompt : Générateur d'affiches collage touristiques de pays | Curify AI",
        "content": {"sections": {
            "what": "Ce modèle crée une affiche touristique verticale et photoréaliste pour n'importe quel pays. Un immense titre en marbre sculpté reprend les couleurs du drapeau ; le monument le plus emblématique s'élève au centre ; monuments, skyline et paysages s'enchaînent en un seul panorama continu ; personnages en costume traditionnel, animal emblématique et nature morte de spécialités complètent la scène.",
            "who": "Pour les offices de tourisme, le marketing de destination, les marques d'hôtellerie et de voyage, les créateurs de contenu voyage et les enseignants qui ont besoin d'une affiche de pays percutante, ou d'une série cohérente, pour des campagnes, les réseaux sociaux, la classe ou la décoration.",
            "how": [
                "Saisissez un nom de pays (ex. Japon, Italie, Brésil).",
                "Le modèle génère une affiche 4:5 avec un titre 3D aux couleurs du drapeau.",
                "Le monument phare trône au centre, entouré d'un panorama continu.",
                "Costumes traditionnels, faune locale et nature morte gourmande apportent culture et profondeur.",
                "Changez de pays pour obtenir une série assortie pour chaque destination."
            ],
            "prompts": [
                "Crée une affiche collage touristique pour le Japon : mont Fuji, temples de Kyoto, cerisiers en fleurs et sushis.",
                "Conçois une affiche façon couverture de magazine pour l'Italie, le Colisée au centre, pâtes et espresso au premier plan.",
                "Génère une affiche collage touristique pour l'Égypte : pyramides, Nil, caravane de chameaux et koshari."
            ]
        }}
    },
    "hi": {
        "category": "देश पर्यटन कोलाज पोस्टर",
        "description": "किसी भी देश के नाम से मैगज़ीन-कवर जैसा पर्यटन पोस्टर बनाएं: झंडे के रंगों में 3D संगमरमर शीर्षक, बीच में प्रमुख स्मारक, निर्बाध पैनोरमा और स्थानीय व्यंजनों का स्टिल लाइफ।",
        "title": "Nano Banana Prompt: देश पर्यटन कोलाज पोस्टर जनरेटर | Curify AI",
        "content": {"sections": {
            "what": "यह टेम्पलेट किसी भी देश के लिए एक लंबवत, फोटोरियलिस्टिक राष्ट्रीय पर्यटन पोस्टर बनाता है। विशाल नक्काशीदार संगमरमर शीर्षक झंडे के रंगों में होता है; सबसे प्रसिद्ध स्मारक बीच में खड़ा होता है; स्मारक, शहर का क्षितिज और प्राकृतिक दृश्य एक निरंतर पैनोरमा में घुल-मिल जाते हैं; पारंपरिक वेशभूषा में लोग, एक स्थानीय जानवर और प्रसिद्ध व्यंजनों का स्टिल लाइफ दृश्य को पूरा करते हैं।",
            "who": "पर्यटन बोर्ड, डेस्टिनेशन मार्केटर्स, होटल और ट्रैवल ब्रांड, ट्रैवल क्रिएटर्स और शिक्षकों के लिए, जिन्हें अभियानों, सोशल पोस्ट, कक्षा या दीवार कला के लिए एक आकर्षक देश पोस्टर या पूरी एकरूप श्रृंखला चाहिए।",
            "how": [
                "किसी देश का नाम दर्ज करें (जैसे जापान, इटली, ब्राज़ील)।",
                "टेम्पलेट झंडे के रंगों वाले 3D शीर्षक के साथ 4:5 पोस्टर बनाता है।",
                "मुख्य स्मारक बीच में होता है, चारों ओर निर्बाध पैनोरमा।",
                "पारंपरिक वेशभूषा, स्थानीय वन्यजीव और व्यंजन स्टिल लाइफ संस्कृति और गहराई जोड़ते हैं।",
                "देश का नाम बदलें और हर गंतव्य के लिए मेल खाती श्रृंखला पाएं।"
            ],
            "prompts": [
                "जापान के लिए पर्यटन कोलाज पोस्टर बनाएं: माउंट फ़ूजी, क्योटो के मंदिर, चेरी ब्लॉसम और सुशी।",
                "इटली के लिए मैगज़ीन-कवर पोस्टर डिज़ाइन करें, बीच में कोलोसियम और आगे पास्ता व एस्प्रेसो।",
                "मिस्र के लिए पर्यटन कोलाज पोस्टर बनाएं: पिरामिड, नील नदी, ऊंटों का कारवां और कोशरी।"
            ]
        }}
    },
    "ja": {
        "category": "国別観光コラージュポスター",
        "description": "国名を入れるだけで雑誌の表紙のような観光ポスターに。国旗カラーの立体大理石タイトル、中央のランドマーク、シームレスなパノラマ、手前には郷土料理のスティルライフ。",
        "title": "Nano Banana Prompt: 国別観光コラージュポスター ジェネレーター | Curify AI",
        "content": {"sections": {
            "what": "このテンプレートは、あらゆる国の縦長・フォトリアルな観光ポスターを作成します。巨大な大理石彫刻風タイトルは国旗の色をまとい、最も象徴的なランドマークが中央にそびえ、名所・都市景観・自然風景がひと続きのパノラマとして周囲に広がります。伝統衣装の人物、固有の動物、名物料理のスティルライフが画面を完成させます。",
            "who": "観光局、デスティネーションマーケター、ホテル・旅行ブランド、旅行クリエイター、教師など、キャンペーンやSNS、授業、ウォールアート用にインパクトのある国別ポスター、または統一感のあるシリーズが必要な方に。",
            "how": [
                "国名を入力します（例：日本、イタリア、ブラジル）。",
                "国旗カラーの立体タイトル付き4:5ポスターが生成されます。",
                "中央にランドマーク、その周囲にシームレスなパノラマが広がります。",
                "伝統衣装、固有の動物、料理のスティルライフが文化と奥行きを加えます。",
                "国名を変えるだけで、すべての目的地で統一されたシリーズが作れます。"
            ],
            "prompts": [
                "日本の観光コラージュポスターを作成：富士山、京都の寺院、桜、寿司。",
                "コロッセオを中央に、手前にパスタとエスプレッソを配したイタリアの雑誌表紙風ポスターをデザイン。",
                "エジプトの観光コラージュポスターを生成：ピラミッド、ナイル川、ラクダのキャラバン、コシャリ。"
            ]
        }}
    },
    "ko": {
        "category": "국가 관광 콜라주 포스터",
        "description": "국가 이름만 넣으면 잡지 표지 같은 관광 포스터 완성: 국기 색상의 3D 대리석 타이틀, 중앙의 대표 랜드마크, 끊김 없는 파노라마, 전경의 현지 음식 정물.",
        "title": "Nano Banana Prompt: 국가 관광 콜라주 포스터 생성기 | Curify AI",
        "content": {"sections": {
            "what": "이 템플릿은 어떤 국가든 세로형 포토리얼 관광 포스터로 만들어 줍니다. 거대한 대리석 조각 타이틀은 국기 색상을 입고, 가장 상징적인 랜드마크가 중앙에 우뚝 서며, 유적·도시 스카이라인·자연 풍경이 하나의 연속된 파노라마로 이어집니다. 전통 의상을 입은 인물, 토종 동물, 대표 음식 정물이 장면을 완성합니다.",
            "who": "캠페인, SNS, 수업, 월아트용으로 임팩트 있는 국가 포스터나 통일된 시리즈가 필요한 관광청, 여행지 마케터, 호텔·여행 브랜드, 여행 크리에이터, 교사에게 적합합니다.",
            "how": [
                "국가 이름을 입력하세요 (예: 일본, 이탈리아, 브라질).",
                "국기 색상의 3D 타이틀이 들어간 4:5 포스터가 생성됩니다.",
                "대표 랜드마크가 중앙에, 그 주위로 끊김 없는 파노라마가 펼쳐집니다.",
                "전통 의상, 토종 동물, 음식 정물이 문화와 깊이를 더합니다.",
                "국가 이름만 바꾸면 모든 여행지에 맞는 시리즈를 만들 수 있습니다."
            ],
            "prompts": [
                "일본 관광 콜라주 포스터 만들기: 후지산, 교토 사찰, 벚꽃, 스시.",
                "콜로세움을 중앙에, 전경에 파스타와 에스프레소를 둔 이탈리아 잡지 표지 스타일 포스터 디자인.",
                "이집트 관광 콜라주 포스터 생성: 피라미드, 나일강, 낙타 카라반, 코샤리."
            ]
        }}
    },
    "ru": {
        "category": "Туристический коллаж-постер страны",
        "description": "Превратите название любой страны в туристический постер в стиле обложки журнала: 3D-заголовок из мрамора в цветах флага, главная достопримечательность, бесшовная панорама и натюрморт с местной кухней.",
        "title": "Nano Banana Prompt: Генератор туристических коллаж-постеров стран | Curify AI",
        "content": {"sections": {
            "what": "Этот шаблон создаёт вертикальный фотореалистичный туристический постер для любой страны. Огромный резной мраморный заголовок окрашен в цвета флага; самая узнаваемая достопримечательность возвышается в центре; памятники, панорама города и природа сливаются в единую непрерывную панораму; люди в национальных костюмах, местное животное и натюрморт из фирменных блюд завершают сцену.",
            "who": "Для туристических офисов, маркетинга направлений, гостиничных и туристических брендов, тревел-авторов и учителей, которым нужен эффектный постер страны или целая единая серия для кампаний, соцсетей, уроков или декора.",
            "how": [
                "Введите название страны (например, Япония, Италия, Бразилия).",
                "Шаблон создаёт постер 4:5 с 3D-заголовком в цветах флага.",
                "Главная достопримечательность в центре, вокруг — бесшовная панорама.",
                "Национальные костюмы, местная фауна и натюрморт с едой добавляют культуры и глубины.",
                "Замените название страны и получите единую серию для каждого направления."
            ],
            "prompts": [
                "Создай туристический коллаж-постер Японии: Фудзи, храмы Киото, сакура и суши.",
                "Оформи постер в стиле обложки журнала для Италии: Колизей в центре, паста и эспрессо на переднем плане.",
                "Сгенерируй туристический коллаж-постер Египта: пирамиды, Нил, караван верблюдов и кошари."
            ]
        }}
    },
    "tr": {
        "category": "Ulke Turizm Kolaj Posteri",
        "description": "Herhangi bir ulke adini dergi kapagi tarzinda bir turizm posterine donusturun: bayrak renklerinde 3D mermer baslik, merkezde ikonik simge yapi, kesintisiz bir panorama ve yerel yemeklerden bir naturmort.",
        "title": "Nano Banana Prompt: Ulke Turizm Kolaj Posteri Olusturucu | Curify AI",
        "content": {"sections": {
            "what": "Bu sablon her ulke icin dikey, fotogercekci bir ulusal turizm posteri olusturur. Dev oyma mermer baslik bayrak renklerini tasir; en ikonik simge yapi merkezde yukselir; anitlar, sehir silueti ve dogal manzaralar tek bir kesintisiz panoramada birlesir; geleneksel kiyafetli insanlar, yerli bir hayvan ve meshur yemeklerden bir naturmort sahneyi tamamlar.",
            "who": "Kampanyalar, sosyal medya, ders veya duvar sanati icin etkileyici bir ulke posterine ya da tutarli bir seriye ihtiyac duyan turizm ofisleri, destinasyon pazarlamacilari, otel ve seyahat markalari, seyahat icerik ureticileri ve ogretmenler icin.",
            "how": [
                "Bir ulke adi girin (orn. Japonya, Italya, Brezilya).",
                "Sablon, bayrak renklerinde 3D baslikli 4:5 bir poster olusturur.",
                "Ana simge yapi merkezde, etrafinda kesintisiz bir panorama yer alir.",
                "Geleneksel kiyafetler, yerli yaban hayati ve yemek naturmortu kultur ve derinlik katar.",
                "Ulke adini degistirin, her destinasyon icin uyumlu bir seri elde edin."
            ],
            "prompts": [
                "Japonya icin turizm kolaj posteri olustur: Fuji Dagi, Kyoto tapinaklari, kiraz cicekleri ve sushi.",
                "Italya icin merkezde Kolezyum, on planda makarna ve espresso olan dergi kapagi tarzi bir poster tasarla.",
                "Misir icin turizm kolaj posteri uret: piramitler, Nil, deve kervani ve koshari."
            ]
        }}
    },
}

for loc, entry in E.items():
    p = ROOT / "messages" / loc / "nano.json"
    raw = p.read_text(encoding="utf-8")
    data = json.loads(raw)
    data[TID] = entry
    out = json.dumps(data, ensure_ascii=False, indent=2)
    p.write_text(out + ("\n" if raw.endswith("\n") else ""), encoding="utf-8")
    print(f"✓ {loc}")
