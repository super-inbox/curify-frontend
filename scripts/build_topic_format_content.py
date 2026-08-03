#!/usr/bin/env python3
"""Inject a `format` rich-content block into visual-format topic entries in
messages/en/topics.json and messages/zh/topics.json. Idempotent (overwrites the
format block). Renders visibly via TopicFormatContent on /topics/<slug>."""
import json, sys

EN = {
 "infographic": {
   "lead": "Infographics turn dense information — data, steps, comparisons, timelines — into a single scannable visual. On Curify you describe the topic and get a finished, on-brand infographic in seconds, with no design or prompt-writing skills needed.",
   "howToTitle": "How to make an infographic",
   "howTo": [
     "Pick an infographic template below, or start from your own topic.",
     "Fill in your subject, key points, and language — Curify plans the layout for you.",
     "Generate; the AI arranges text, icons, and color into a clean composition.",
     "Download the high-resolution image, or tweak any detail and regenerate.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Educational explainers and study summaries",
     "Business, process, and how-it-works diagrams",
     "Cultural, food, and travel information cards",
     "Data and statistics visualizations",
     "Bilingual (EN–ZH) learning posters",
   ],
   "faqTitle": "Infographic FAQ",
   "faq": [
     {"q": "Do I need design skills to make an infographic?", "a": "No. Curify handles layout, hierarchy, icons, and color automatically — you provide the topic and key points, and the AI composes a finished infographic."},
     {"q": "Can I make bilingual infographics?", "a": "Yes. Many templates support English–Chinese and other language pairs, so the same infographic renders in two languages at once."},
     {"q": "What resolution do I get?", "a": "Infographics export as high-resolution images suitable for sharing on social media or printing as posters."},
   ],
 },
 "posters": {
   "lead": "Posters make a subject look striking and shareable — events, travel, quotes, characters, or products. Describe what you want and Curify composes a balanced, eye-catching poster you can post or print.",
   "howToTitle": "How to make a poster",
   "howTo": [
     "Choose a poster template that matches your subject or mood.",
     "Add your title, details, and any names — the AI handles typography and layout.",
     "Generate to see a finished, print-ready poster.",
     "Refine the wording or style and regenerate until it's right.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Event, match, and schedule posters",
     "Travel and landmark wall art",
     "Quote and typography posters",
     "Character, sports, and fan posters",
     "Product and promotional posters",
   ],
   "faqTitle": "Poster FAQ",
   "faq": [
     {"q": "Can I print the posters?", "a": "Yes — posters export at high resolution suitable for printing as wall art or promotional prints."},
     {"q": "Can I add my own text?", "a": "Absolutely. You supply the title and details, and Curify arranges the typography and composition around them."},
     {"q": "Do I need to write a prompt?", "a": "No. Pick a template and fill in a few fields — there's no prompt engineering required."},
   ],
 },
 "stickers": {
   "lead": "Sticker packs turn a character, mascot, or idea into a set of expressive, die-cut-ready designs. Curify generates a full sheet of matching stickers you can share, sell, or print.",
   "howToTitle": "How to make a sticker pack",
   "howTo": [
     "Pick a sticker template — mascots, emoji sheets, chibi packs, and more.",
     "Describe your character or upload a reference to base it on.",
     "Generate a full sheet of matching sticker poses and expressions.",
     "Download as images, or take them to print-ready die-cut files.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Character and mascot sticker sheets",
     "Emoji and expression packs",
     "Chibi and kawaii sticker sets",
     "IP and fan-art collections",
     "Print-on-demand and Etsy sticker products",
   ],
   "faqTitle": "Sticker FAQ",
   "faq": [
     {"q": "Can I make a whole matching set at once?", "a": "Yes. Sticker templates generate a full sheet of consistent poses and expressions, not just a single image."},
     {"q": "Can I sell the stickers?", "a": "Curify's sticker outputs are built for print-on-demand and marketplaces like Etsy — many include die-cut-ready options."},
     {"q": "Can I base stickers on my own character?", "a": "Yes — several templates let you upload a reference so the set is based on your mascot or design."},
   ],
 },
 "flashcards": {
   "lead": "Flashcards make vocabulary, facts, and concepts easy to learn at a glance. Curify generates illustrated, often bilingual cards from your word list or topic — ready to study, print, or share.",
   "howToTitle": "How to make flashcards",
   "howTo": [
     "Choose a flashcard template for your subject or language pair.",
     "Enter your words, terms, or topic — the AI illustrates each card.",
     "Generate a consistent set of study-ready cards.",
     "Download or print the deck, or download a PDF pack.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Vocabulary and language cards (EN–ZH and more)",
     "Science, history, and biology fact cards",
     "Kids' learning and phonics decks",
     "Exam and revision study sheets",
     "Printable classroom material",
   ],
   "faqTitle": "Flashcard FAQ",
   "faq": [
     {"q": "Are the flashcards bilingual?", "a": "Many are — language templates pair English with Chinese, French, Japanese, Korean, Spanish, and more."},
     {"q": "Can I print a whole deck?", "a": "Yes. Sets export as images and several templates offer a downloadable print-ready PDF pack."},
     {"q": "Can I use my own word list?", "a": "Yes — enter your terms and Curify illustrates and lays out each card for you."},
   ],
 },
 "comparison": {
   "lead": "Comparison visuals make two things easy to weigh side by side — before vs after, A vs B, this vs that. Curify lays out the contrast clearly so the difference reads instantly.",
   "howToTitle": "How to make a comparison chart",
   "howTo": [
     "Pick a comparison or versus template.",
     "Enter the two subjects and the points you want to contrast.",
     "Generate a balanced side-by-side layout.",
     "Download or refine the points and regenerate.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Before-and-after transformations",
     "A vs B and 1v1 battle cards",
     "Product and option comparison charts",
     "Then-vs-now and evolution visuals",
     "Pros-and-cons decision aids",
   ],
   "faqTitle": "Comparison FAQ",
   "faq": [
     {"q": "How many things can I compare?", "a": "Most templates focus on a clear two-way comparison, which is what reads best at a glance; multi-column charts are available for some subjects."},
     {"q": "Can I do before-and-after?", "a": "Yes — before/after and then-vs-now are among the most popular comparison formats on Curify."},
     {"q": "Do I need to design the layout?", "a": "No. You supply the two subjects and the points; the AI builds the balanced layout."},
   ],
 },
 "mockups": {
   "lead": "Mockups show a design on a real product — merch, packaging, a device, or a retail display — so it looks finished and sellable. Curify renders professional product mockups from your idea or artwork.",
   "howToTitle": "How to make a product mockup",
   "howTo": [
     "Choose a mockup template — apparel, packaging, gift box, device, and more.",
     "Describe the product or upload your design or logo.",
     "Generate a realistic mockup with lighting and context.",
     "Download the image for your listing, deck, or store.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Merch and apparel mockups",
     "Packaging and gift-box presentations",
     "Brand and full-VI visual packs",
     "IP and character goods displays",
     "Ecommerce product listing images",
   ],
   "faqTitle": "Mockup FAQ",
   "faq": [
     {"q": "Can I put my own logo or design on the mockup?", "a": "Yes — several mockup templates let you upload your artwork or logo so it appears on the product."},
     {"q": "Are mockups good for online stores?", "a": "Yes. They're built to look like professional product photos for listings, decks, and marketing."},
     {"q": "Do I need photography or 3D software?", "a": "No. Curify renders the product, lighting, and setting for you from a description."},
   ],
 },
 "guides": {
   "lead": "Guides and cheat sheets pack a how-to, routine, or reference into one clear visual. Curify turns your steps or tips into a tidy, illustrated guide people can follow at a glance.",
   "howToTitle": "How to make a guide",
   "howTo": [
     "Pick a guide or cheat-sheet template.",
     "Enter your steps, tips, or reference points.",
     "Generate an organized, illustrated layout.",
     "Download to share or print as a reference card.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Step-by-step how-to guides",
     "Cheat sheets and quick-reference cards",
     "Fitness, packing, and routine guides",
     "Etiquette and do's-and-don'ts cards",
     "Recipe and food tip guides",
   ],
   "faqTitle": "Guide FAQ",
   "faq": [
     {"q": "What kinds of guides can I make?", "a": "Anything sequential or reference-based — how-tos, routines, checklists, cheat sheets, and tip cards all work well."},
     {"q": "Can I include my own steps?", "a": "Yes — you provide the steps or points and Curify handles the layout, numbering, and icons."},
     {"q": "Can I print the guide?", "a": "Yes, guides export at high resolution and several offer a downloadable print-ready pack."},
   ],
 },
 "map": {
   "lead": "Visual maps make a place, route, or region come alive — travel destinations, landmarks, food origins, or itineraries. Curify illustrates a clear, characterful map from your subject.",
   "howToTitle": "How to make a visual map",
   "howTo": [
     "Choose a map template — country, city, landmark, or itinerary.",
     "Enter the place and the points or stops you want to show.",
     "Generate an illustrated, easy-to-read map.",
     "Download as wall art or a shareable travel visual.",
   ],
   "usesTitle": "What you can make",
   "uses": [
     "Illustrated travel and country maps",
     "City and landmark map posters",
     "Itinerary and route visuals",
     "Food-origin and cultural maps",
     "Watercolor and vintage map wall art",
   ],
   "faqTitle": "Map FAQ",
   "faq": [
     {"q": "Are these accurate geographic maps?", "a": "They're illustrated, stylized maps meant for storytelling and wall art rather than precise navigation."},
     {"q": "Can I mark my own stops or landmarks?", "a": "Yes — enter the places or route points you want featured and the AI lays them out."},
     {"q": "Can I print a map as wall art?", "a": "Yes, maps export at high resolution suitable for framing and printing."},
   ],
 },
}

# zh translations (parallel structure)
ZH = {
 "infographic": {
   "lead": "信息图把密集的信息——数据、步骤、对比、时间线——浓缩成一张一眼就能看懂的视觉图。在 Curify，你只需描述主题，几秒钟就能得到一张成品信息图，无需设计基础，也不用写提示词。",
   "howToTitle": "如何制作信息图",
   "howTo": ["从下方选择一个信息图模板，或直接输入你的主题。", "填写主题、要点和语言——Curify 会自动为你规划版式。", "点击生成，AI 会把文字、图标和配色排成整洁的构图。", "下载高清图片，或修改任意细节后重新生成。"],
   "usesTitle": "你可以做什么",
   "uses": ["教学讲解与学习摘要", "商业、流程与原理示意图", "文化、美食与旅行信息卡", "数据与统计可视化", "中英双语学习海报"],
   "faqTitle": "信息图常见问题",
   "faq": [
     {"q": "做信息图需要设计基础吗？", "a": "不需要。Curify 会自动处理版式、层级、图标和配色——你只要提供主题和要点，AI 就能生成成品信息图。"},
     {"q": "可以做双语信息图吗？", "a": "可以。许多模板支持中英等语言组合，同一张信息图能同时呈现两种语言。"},
     {"q": "生成的分辨率如何？", "a": "信息图以高分辨率图片导出，适合社媒分享或作为海报打印。"},
   ],
 },
 "posters": {
   "lead": "海报能让主题变得醒目、易于传播——活动、旅行、语录、角色或产品。描述你的想法，Curify 就能排出一张构图平衡、吸睛的海报，随时发布或打印。",
   "howToTitle": "如何制作海报",
   "howTo": ["选择一个契合主题或氛围的海报模板。", "填写标题、细节和名称——AI 负责排版与构图。", "点击生成，得到一张可直接打印的成品海报。", "调整文案或风格后重新生成，直到满意。"],
   "usesTitle": "你可以做什么",
   "uses": ["活动、赛事与赛程海报", "旅行与地标装饰画", "语录与文字海报", "角色、体育与粉丝海报", "产品与宣传海报"],
   "faqTitle": "海报常见问题",
   "faq": [
     {"q": "海报可以打印吗？", "a": "可以，海报以高分辨率导出，适合作为装饰画或宣传物打印。"},
     {"q": "可以加入我自己的文字吗？", "a": "当然可以。你提供标题和细节，Curify 会围绕它们排布文字与构图。"},
     {"q": "需要写提示词吗？", "a": "不需要。选择模板、填几个字段即可，完全不用做提示词工程。"},
   ],
 },
 "stickers": {
   "lead": "贴纸包能把一个角色、吉祥物或创意变成一整套富有表现力、可做刀模的贴纸设计。Curify 会生成一整张风格统一的贴纸，供你分享、售卖或打印。",
   "howToTitle": "如何制作贴纸包",
   "howTo": ["选择贴纸模板——吉祥物、表情包、Q 版贴纸等。", "描述你的角色，或上传参考图作为基础。", "生成一整张姿势与表情统一的贴纸。", "以图片下载，或进一步导出可做刀模的印刷文件。"],
   "usesTitle": "你可以做什么",
   "uses": ["角色与吉祥物贴纸表", "表情与情绪贴纸包", "Q 版与可爱风贴纸套装", "IP 与同人合集", "按需印刷与 Etsy 贴纸商品"],
   "faqTitle": "贴纸常见问题",
   "faq": [
     {"q": "可以一次生成整套统一的贴纸吗？", "a": "可以。贴纸模板会生成一整张姿势与表情一致的贴纸，而不只是单张图。"},
     {"q": "贴纸可以拿去售卖吗？", "a": "Curify 的贴纸输出专为按需印刷和 Etsy 等平台设计，许多还带有可做刀模的选项。"},
     {"q": "可以基于我自己的角色做贴纸吗？", "a": "可以，多个模板支持上传参考图，让整套贴纸基于你的吉祥物或设计。"},
   ],
 },
 "flashcards": {
   "lead": "闪卡让词汇、知识点和概念一眼就能记住。Curify 会根据你的单词表或主题生成配图、常为双语的卡片，随时学习、打印或分享。",
   "howToTitle": "如何制作闪卡",
   "howTo": ["为你的主题或语言组合选择闪卡模板。", "输入单词、术语或主题——AI 为每张卡配图。", "生成一整套风格统一、便于学习的卡片。", "下载或打印整副卡，或下载 PDF 卡包。"],
   "usesTitle": "你可以做什么",
   "uses": ["词汇与语言卡（中英等）", "科学、历史与生物知识卡", "儿童启蒙与拼读卡", "考试复习学习表", "可打印的课堂材料"],
   "faqTitle": "闪卡常见问题",
   "faq": [
     {"q": "闪卡是双语的吗？", "a": "很多都是——语言模板可将英语与中文、法语、日语、韩语、西班牙语等配对。"},
     {"q": "可以打印一整副卡吗？", "a": "可以。整套以图片导出，多个模板还提供可打印的 PDF 卡包。"},
     {"q": "可以用我自己的单词表吗？", "a": "可以——输入你的术语，Curify 会为每张卡配图并排版。"},
   ],
 },
 "comparison": {
   "lead": "对比图让两样东西一目了然地并排比较——前后对比、A 与 B、这个与那个。Curify 会把对比排得清清楚楚，让差异一眼可见。",
   "howToTitle": "如何制作对比图",
   "howTo": ["选择对比或对决模板。", "输入两个主体和你想对比的要点。", "生成平衡的左右并排版式。", "下载，或修改要点后重新生成。"],
   "usesTitle": "你可以做什么",
   "uses": ["前后对比与蜕变", "A 与 B、1v1 对决卡", "产品与选项对比图", "今昔对比与演化图", "利弊决策辅助图"],
   "faqTitle": "对比图常见问题",
   "faq": [
     {"q": "可以对比几样东西？", "a": "多数模板聚焦清晰的两方对比，这样最一目了然；部分主题也支持多列对比表。"},
     {"q": "可以做前后对比吗？", "a": "可以——前后对比和今昔对比是 Curify 上最受欢迎的对比格式之一。"},
     {"q": "需要自己设计版式吗？", "a": "不需要。你提供两个主体和要点，AI 负责搭建平衡的版式。"},
   ],
 },
 "mockups": {
   "lead": "样机把设计呈现在真实产品上——周边、包装、设备或零售陈列——让它看起来成品化、可售卖。Curify 能根据你的创意或作品渲染专业的产品样机。",
   "howToTitle": "如何制作产品样机",
   "howTo": ["选择样机模板——服装、包装、礼盒、设备等。", "描述产品，或上传你的设计或 logo。", "生成带光影与场景的逼真样机。", "下载图片用于商品详情、演示或店铺。"],
   "usesTitle": "你可以做什么",
   "uses": ["周边与服装样机", "包装与礼盒呈现", "品牌与全套 VI 视觉包", "IP 与角色商品陈列", "电商产品详情图"],
   "faqTitle": "样机常见问题",
   "faq": [
     {"q": "可以把我自己的 logo 或设计放到样机上吗？", "a": "可以——多个样机模板支持上传你的作品或 logo，让它出现在产品上。"},
     {"q": "样机适合网店使用吗？", "a": "适合。它们专为呈现专业产品照效果而设计，可用于详情页、演示和营销。"},
     {"q": "需要摄影或 3D 软件吗？", "a": "不需要。Curify 会根据描述为你渲染产品、光影和场景。"},
   ],
 },
 "guides": {
   "lead": "指南和速查卡把一套教程、流程或参考浓缩进一张清晰的视觉图。Curify 把你的步骤或要点整理成整洁、配图的指南，让人一看就会。",
   "howToTitle": "如何制作指南",
   "howTo": ["选择指南或速查卡模板。", "输入你的步骤、技巧或参考要点。", "生成条理清晰、配图的版式。", "下载分享，或作为参考卡打印。"],
   "usesTitle": "你可以做什么",
   "uses": ["分步操作指南", "速查卡与快速参考卡", "健身、打包与日常流程指南", "礼仪与宜忌卡", "食谱与美食小贴士"],
   "faqTitle": "指南常见问题",
   "faq": [
     {"q": "可以做哪些类型的指南？", "a": "任何有顺序或参考性质的内容——操作步骤、流程、清单、速查卡和贴士卡都很合适。"},
     {"q": "可以放入我自己的步骤吗？", "a": "可以——你提供步骤或要点，Curify 负责版式、编号和图标。"},
     {"q": "指南可以打印吗？", "a": "可以，指南以高分辨率导出，部分还提供可打印的卡包。"},
   ],
 },
 "map": {
   "lead": "可视化地图让一个地方、路线或区域鲜活起来——旅行目的地、地标、美食起源或行程。Curify 会根据你的主题绘制一张清晰、有个性的地图。",
   "howToTitle": "如何制作可视化地图",
   "howTo": ["选择地图模板——国家、城市、地标或行程。", "输入地点以及你想展示的要点或站点。", "生成一张配图、易读的地图。", "作为装饰画或可分享的旅行图下载。"],
   "usesTitle": "你可以做什么",
   "uses": ["插画风旅行与国家地图", "城市与地标地图海报", "行程与路线图", "美食起源与文化地图", "水彩与复古地图装饰画"],
   "faqTitle": "地图常见问题",
   "faq": [
     {"q": "这些是精确的地理地图吗？", "a": "它们是插画化、风格化的地图，用于讲故事和装饰，而非精确导航。"},
     {"q": "可以标注我自己的站点或地标吗？", "a": "可以——输入你想展示的地点或路线站点，AI 会为你排布。"},
     {"q": "地图可以作为装饰画打印吗？", "a": "可以，地图以高分辨率导出，适合装裱和打印。"},
   ],
 },
}

def inject(path, data):
    d = json.load(open(path, encoding="utf-8"))
    topics = d["topics"]
    n = 0
    for slug, block in data.items():
        if slug not in topics:
            print(f"  WARN {slug} missing in {path} — skipping")
            continue
        topics[slug]["format"] = block
        n += 1
    open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f"  injected {n} format blocks into {path}")

base = sys.argv[1]
inject(f"{base}/messages/en/topics.json", EN)
inject(f"{base}/messages/zh/topics.json", ZH)
