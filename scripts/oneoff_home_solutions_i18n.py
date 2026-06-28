#!/usr/bin/env python3
"""One-off: inject home.hero / home.solutions / home.workflow i18n into all
locale home.json files for the storytelling homepage. Replaces the stale
(unused) home.hero. Run from repo root."""
import json, pathlib

LOCALES = ["en", "zh", "de", "es", "fr", "ja", "ko", "ru", "tr", "hi"]
SOL_KEYS = ["merch", "design", "education", "video", "marketing", "developers"]
WF_KEYS = ["find", "understand", "create", "adapt", "scale"]

T = {
 "en": {
  "hero": ["Don't just make an image.", "Finish the job.",
    "Curify helps you search inspiration, generate visuals, localize for the world, and scale across every channel — design, education, marketing, and commerce.",
    "Explore solutions", "Browse the gallery"],
  "sol": ["One platform. Six ways to use it.", "Pick the job you're here to do.", "Explore →", {
    "merch": ["Merch & POD", "Turn one character into 100 products."],
    "design": ["Designers", "Find better design inspiration in seconds."],
    "education": ["Education", "Create bilingual learning content at scale."],
    "video": ["Video Creators", "Translate and subtitle videos for global audiences."],
    "marketing": ["Marketing & SEO", "Build multilingual visual content that ranks."],
    "developers": ["Developers", "Integrate visual AI into your own product."]}],
  "wf": ["One workflow, end to end.", "From a single idea to production-ready content, in any language.", {
    "find": ["Find inspiration", "Search the gallery and asset library."],
    "understand": ["Understand designs", "Extract reusable subjects, text & style tags."],
    "create": ["Create visuals", "Generate from AI templates and prompts."],
    "adapt": ["Adapt for production", "Typography, print-ready files & product mockups."],
    "scale": ["Scale globally", "Translate, localize & distribute via SEO + API."]}],
 },
 "zh": {
  "hero": ["不只是生成一张图片，", "把整件事做完。",
    "Curify 帮你搜索灵感、生成视觉内容、本地化到全球，并在每个渠道规模化——设计、教育、营销与电商。",
    "浏览解决方案", "浏览图库"],
  "sol": ["一个平台，六种用法。", "选择你要完成的工作。", "了解更多 →", {
    "merch": ["商品设计与 POD", "一个创意，变成 100 款产品。"],
    "design": ["设计师", "几秒钟找到可复用的设计灵感。"],
    "education": ["教育", "规模化生成双语学习内容。"],
    "video": ["视频创作者", "为全球观众翻译并加字幕。"],
    "marketing": ["营销与 SEO", "打造能带来排名的多语种视觉内容。"],
    "developers": ["开发者", "几天内把视觉 AI 接入你的产品。"]}],
  "wf": ["一条端到端的工作流。", "从一个创意到可投产的内容，任意语言。", {
    "find": ["寻找灵感", "在图库与素材库中搜索。"],
    "understand": ["理解设计", "提取可复用的主体、文字与风格标签。"],
    "create": ["创作视觉", "用 AI 模板与提示词生成。"],
    "adapt": ["适配生产", "排版、可印刷文件与产品样机。"],
    "scale": ["全球规模化", "通过 SEO + API 翻译、本地化与分发。"]}],
 },
 "de": {
  "hero": ["Mach nicht nur ein Bild.", "Bring die Arbeit zu Ende.",
    "Curify hilft dir, Inspiration zu finden, Visuals zu generieren, weltweit zu lokalisieren und über jeden Kanal zu skalieren – Design, Bildung, Marketing und Commerce.",
    "Lösungen entdecken", "Galerie durchsuchen"],
  "sol": ["Eine Plattform. Sechs Anwendungen.", "Wähle die Aufgabe, die du erledigen willst.", "Entdecken →", {
    "merch": ["Merch & POD", "Aus einer Idee 100 Produkte machen."],
    "design": ["Designer", "Finde wiederverwendbare Design-Inspiration in Sekunden."],
    "education": ["Bildung", "Erstelle zweisprachige Lerninhalte in großem Maßstab."],
    "video": ["Video-Creator", "Übersetze und untertitle Videos für ein globales Publikum."],
    "marketing": ["Marketing & SEO", "Baue mehrsprachige visuelle Inhalte, die ranken."],
    "developers": ["Entwickler", "Integriere visuelle KI in Tagen statt Monaten in dein Produkt."]}],
  "wf": ["Ein Workflow, von Anfang bis Ende.", "Von einer Idee zu produktionsreifen Inhalten, in jeder Sprache.", {
    "find": ["Inspiration finden", "Durchsuche Galerie und Asset-Bibliothek."],
    "understand": ["Designs verstehen", "Extrahiere wiederverwendbare Motive, Texte & Stil-Tags."],
    "create": ["Visuals erstellen", "Generiere aus KI-Vorlagen und Prompts."],
    "adapt": ["Für die Produktion anpassen", "Typografie, druckfertige Dateien & Produkt-Mockups."],
    "scale": ["Global skalieren", "Übersetzen, lokalisieren & verteilen via SEO + API."]}],
 },
 "es": {
  "hero": ["No solo hagas una imagen.", "Termina el trabajo.",
    "Curify te ayuda a buscar inspiración, generar visuales, localizar para el mundo y escalar en cada canal: diseño, educación, marketing y comercio.",
    "Explorar soluciones", "Explorar la galería"],
  "sol": ["Una plataforma. Seis formas de usarla.", "Elige el trabajo que vienes a hacer.", "Explorar →", {
    "merch": ["Merch y POD", "Convierte una idea en 100 productos."],
    "design": ["Diseñadores", "Encuentra inspiración de diseño reutilizable en segundos."],
    "education": ["Educación", "Crea contenido educativo bilingüe a escala."],
    "video": ["Creadores de video", "Traduce y subtitula videos para audiencias globales."],
    "marketing": ["Marketing y SEO", "Crea contenido visual multilingüe que posiciona."],
    "developers": ["Desarrolladores", "Integra IA visual en tu producto en días, no meses."]}],
  "wf": ["Un flujo de trabajo, de principio a fin.", "De una sola idea a contenido listo para producción, en cualquier idioma.", {
    "find": ["Encontrar inspiración", "Busca en la galería y la biblioteca de recursos."],
    "understand": ["Entender diseños", "Extrae sujetos, textos y etiquetas de estilo reutilizables."],
    "create": ["Crear visuales", "Genera a partir de plantillas de IA y prompts."],
    "adapt": ["Adaptar para producción", "Tipografía, archivos listos para imprimir y mockups de producto."],
    "scale": ["Escalar globalmente", "Traduce, localiza y distribuye con SEO + API."]}],
 },
 "fr": {
  "hero": ["Ne faites pas qu'une image.", "Allez au bout du travail.",
    "Curify vous aide à trouver l'inspiration, générer des visuels, localiser pour le monde entier et passer à l'échelle sur tous les canaux : design, éducation, marketing et commerce.",
    "Explorer les solutions", "Parcourir la galerie"],
  "sol": ["Une plateforme. Six façons de l'utiliser.", "Choisissez le travail que vous venez accomplir.", "Explorer →", {
    "merch": ["Merch & POD", "Transformez une idée en 100 produits."],
    "design": ["Designers", "Trouvez une inspiration design réutilisable en quelques secondes."],
    "education": ["Éducation", "Créez du contenu pédagogique bilingue à grande échelle."],
    "video": ["Créateurs vidéo", "Traduisez et sous-titrez vos vidéos pour un public mondial."],
    "marketing": ["Marketing & SEO", "Créez du contenu visuel multilingue qui se positionne."],
    "developers": ["Développeurs", "Intégrez l'IA visuelle à votre produit en jours, pas en mois."]}],
  "wf": ["Un workflow, de bout en bout.", "D'une seule idée à un contenu prêt pour la production, dans toutes les langues.", {
    "find": ["Trouver l'inspiration", "Cherchez dans la galerie et la bibliothèque d'assets."],
    "understand": ["Comprendre les designs", "Extrayez sujets, textes et tags de style réutilisables."],
    "create": ["Créer des visuels", "Générez à partir de modèles IA et de prompts."],
    "adapt": ["Adapter pour la production", "Typographie, fichiers prêts à imprimer et mockups produit."],
    "scale": ["Passer à l'échelle mondiale", "Traduisez, localisez et diffusez via SEO + API."]}],
 },
 "ja": {
  "hero": ["画像を作るだけで終わらせない。", "仕事をやり切る。",
    "Curify は、インスピレーションの検索、ビジュアル生成、世界向けのローカライズ、あらゆるチャネルでのスケールを支援します——デザイン、教育、マーケティング、コマース。",
    "ソリューションを見る", "ギャラリーを見る"],
  "sol": ["ひとつのプラットフォーム、6つの使い方。", "あなたがやりたい仕事を選んでください。", "詳しく見る →", {
    "merch": ["グッズデザイン & POD", "1つのアイデアを100の製品に。"],
    "design": ["デザイナー", "再利用できるデザインのヒントを数秒で。"],
    "education": ["教育", "バイリンガルの学習コンテンツを大規模に作成。"],
    "video": ["動画クリエイター", "世界中の視聴者向けに翻訳・字幕付け。"],
    "marketing": ["マーケティング & SEO", "検索で上位に入る多言語ビジュアルを作成。"],
    "developers": ["開発者", "ビジュアルAIを数日で自社プロダクトに組み込む。"]}],
  "wf": ["端から端まで、ひとつのワークフロー。", "1つのアイデアから、あらゆる言語で本番品質のコンテンツへ。", {
    "find": ["インスピレーションを探す", "ギャラリーと素材ライブラリを検索。"],
    "understand": ["デザインを理解する", "再利用できる被写体・テキスト・スタイルタグを抽出。"],
    "create": ["ビジュアルを作る", "AIテンプレートとプロンプトから生成。"],
    "adapt": ["本番用に調整する", "タイポグラフィ、印刷対応ファイル、製品モックアップ。"],
    "scale": ["グローバルに拡大する", "SEO + API で翻訳・ローカライズ・配信。"]}],
 },
 "ko": {
  "hero": ["이미지 한 장으로 끝내지 마세요.", "일을 끝내세요.",
    "Curify는 영감 검색, 비주얼 생성, 전 세계 현지화, 모든 채널로의 확장을 도와줍니다 — 디자인, 교육, 마케팅, 커머스.",
    "솔루션 둘러보기", "갤러리 둘러보기"],
  "sol": ["하나의 플랫폼, 여섯 가지 활용법.", "당신이 하려는 일을 선택하세요.", "자세히 보기 →", {
    "merch": ["머치 디자인 & POD", "하나의 아이디어를 100개의 제품으로."],
    "design": ["디자이너", "재사용 가능한 디자인 영감을 몇 초 만에."],
    "education": ["교육", "이중 언어 학습 콘텐츠를 대규모로 제작."],
    "video": ["영상 크리에이터", "전 세계 시청자를 위해 번역하고 자막을 입히세요."],
    "marketing": ["마케팅 & SEO", "검색 상위에 오르는 다국어 비주얼 콘텐츠."],
    "developers": ["개발자", "몇 달이 아닌 며칠 만에 비주얼 AI를 제품에 통합."]}],
  "wf": ["처음부터 끝까지, 하나의 워크플로우.", "하나의 아이디어에서 어떤 언어로든 바로 쓸 수 있는 콘텐츠까지.", {
    "find": ["영감 찾기", "갤러리와 에셋 라이브러리에서 검색."],
    "understand": ["디자인 이해하기", "재사용 가능한 피사체·텍스트·스타일 태그 추출."],
    "create": ["비주얼 만들기", "AI 템플릿과 프롬프트로 생성."],
    "adapt": ["프로덕션에 맞게 조정", "타이포그래피, 인쇄용 파일, 제품 목업."],
    "scale": ["글로벌 확장", "SEO + API로 번역·현지화·배포."]}],
 },
 "ru": {
  "hero": ["Не просто создайте картинку.", "Доведите дело до конца.",
    "Curify помогает искать вдохновение, генерировать визуалы, локализовать для всего мира и масштабировать на любом канале — дизайн, образование, маркетинг и коммерция.",
    "Смотреть решения", "Открыть галерею"],
  "sol": ["Одна платформа. Шесть способов использования.", "Выберите задачу, которую хотите решить.", "Подробнее →", {
    "merch": ["Мерч и POD", "Превратите одну идею в 100 товаров."],
    "design": ["Дизайнеры", "Находите готовое к повторному использованию вдохновение за секунды."],
    "education": ["Образование", "Создавайте двуязычные учебные материалы в любом объёме."],
    "video": ["Видеоавторы", "Переводите и добавляйте субтитры для мировой аудитории."],
    "marketing": ["Маркетинг и SEO", "Создавайте многоязычный визуальный контент, который ранжируется."],
    "developers": ["Разработчики", "Внедрите визуальный ИИ в свой продукт за дни, а не месяцы."]}],
  "wf": ["Один сквозной рабочий процесс.", "От одной идеи до готового к публикации контента на любом языке.", {
    "find": ["Найти вдохновение", "Ищите в галерее и библиотеке ассетов."],
    "understand": ["Понять дизайн", "Извлекайте повторно используемые объекты, текст и теги стиля."],
    "create": ["Создать визуалы", "Генерируйте по ИИ-шаблонам и промптам."],
    "adapt": ["Адаптировать для продакшена", "Типографика, файлы для печати и мокапы продукта."],
    "scale": ["Масштабировать глобально", "Переводите, локализуйте и распространяйте через SEO + API."]}],
 },
 "tr": {
  "hero": ["Sadece bir görsel yapma.", "İşi bitir.",
    "Curify; ilham aramana, görseller üretmene, dünyaya yerelleştirmene ve her kanalda ölçeklenmene yardımcı olur — tasarım, eğitim, pazarlama ve ticaret.",
    "Çözümleri keşfet", "Galeriye göz at"],
  "sol": ["Tek platform. Altı kullanım şekli.", "Yapmak istediğin işi seç.", "Keşfet →", {
    "merch": ["Merch ve POD", "Tek bir fikri 100 ürüne dönüştür."],
    "design": ["Tasarımcılar", "Yeniden kullanılabilir tasarım ilhamını saniyeler içinde bul."],
    "education": ["Eğitim", "İki dilli eğitim içeriğini ölçekli üret."],
    "video": ["Video Üreticileri", "Videolarını küresel izleyiciler için çevir ve altyazıla."],
    "marketing": ["Pazarlama ve SEO", "Üst sıralara çıkan çok dilli görsel içerik oluştur."],
    "developers": ["Geliştiriciler", "Görsel yapay zekâyı ürününe aylar değil günler içinde ekle."]}],
  "wf": ["Baştan sona tek bir iş akışı.", "Tek bir fikirden, her dilde üretime hazır içeriğe.", {
    "find": ["İlham bul", "Galeride ve varlık kütüphanesinde ara."],
    "understand": ["Tasarımları anla", "Yeniden kullanılabilir özneleri, metni ve stil etiketlerini çıkar."],
    "create": ["Görseller oluştur", "Yapay zekâ şablonları ve istemlerinden üret."],
    "adapt": ["Üretime uyarla", "Tipografi, baskıya hazır dosyalar ve ürün maketleri."],
    "scale": ["Küresel ölçekle", "SEO + API ile çevir, yerelleştir ve dağıt."]}],
 },
 "hi": {
  "hero": ["सिर्फ़ एक इमेज मत बनाइए।", "काम पूरा कीजिए।",
    "Curify आपको प्रेरणा खोजने, विज़ुअल बनाने, दुनिया भर के लिए लोकलाइज़ करने और हर चैनल पर स्केल करने में मदद करता है — डिज़ाइन, शिक्षा, मार्केटिंग और कॉमर्स।",
    "समाधान देखें", "गैलरी देखें"],
  "sol": ["एक प्लेटफ़ॉर्म। उपयोग के छह तरीके।", "वह काम चुनिए जो आप करने आए हैं।", "और देखें →", {
    "merch": ["मर्च डिज़ाइन और POD", "एक आइडिया को 100 प्रोडक्ट्स में बदलें।"],
    "design": ["डिज़ाइनर", "सेकंडों में दोबारा इस्तेमाल होने लायक डिज़ाइन प्रेरणा पाएं।"],
    "education": ["शिक्षा", "बड़े पैमाने पर द्विभाषी शिक्षण सामग्री बनाएं।"],
    "video": ["वीडियो क्रिएटर", "वैश्विक दर्शकों के लिए वीडियो का अनुवाद और सबटाइटल करें।"],
    "marketing": ["मार्केटिंग और SEO", "रैंक करने वाला बहुभाषी विज़ुअल कंटेंट बनाएं।"],
    "developers": ["डेवलपर", "महीनों नहीं, दिनों में अपने प्रोडक्ट में विज़ुअल AI जोड़ें।"]}],
  "wf": ["शुरू से अंत तक, एक ही वर्कफ़्लो।", "एक आइडिया से किसी भी भाषा में प्रोडक्शन-तैयार कंटेंट तक।", {
    "find": ["प्रेरणा खोजें", "गैलरी और एसेट लाइब्रेरी में खोजें।"],
    "understand": ["डिज़ाइन समझें", "दोबारा इस्तेमाल होने लायक सब्जेक्ट, टेक्स्ट और स्टाइल टैग निकालें।"],
    "create": ["विज़ुअल बनाएं", "AI टेम्पलेट्स और प्रॉम्प्ट से जनरेट करें।"],
    "adapt": ["प्रोडक्शन के लिए ढालें", "टाइपोग्राफी, प्रिंट-तैयार फ़ाइलें और प्रोडक्ट मॉकअप।"],
    "scale": ["वैश्विक स्तर पर स्केल करें", "SEO + API के ज़रिए अनुवाद, लोकलाइज़ और वितरण करें।"]}],
 },
}

root = pathlib.Path("messages")
for loc in LOCALES:
    p = root / loc / "home.json"
    data = json.loads(p.read_text(encoding="utf-8"))
    home = data["home"]
    tr = T[loc]
    h = tr["hero"]
    home["hero"] = {"title1": h[0], "title2": h[1], "subtitle": h[2], "ctaPrimary": h[3], "ctaSecondary": h[4]}
    s = tr["sol"]
    home["solutions"] = {"heading": s[0], "subheading": s[1], "explore": s[2],
                         "items": {k: {"label": s[3][k][0], "message": s[3][k][1]} for k in SOL_KEYS}}
    w = tr["wf"]
    home["workflow"] = {"heading": w[0], "subheading": w[1],
                        "steps": {k: {"title": w[2][k][0], "desc": w[2][k][1]} for k in WF_KEYS}}
    p.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{loc}: updated home.hero/solutions/workflow")
print("done")
