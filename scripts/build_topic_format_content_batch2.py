#!/usr/bin/env python3
"""Second batch of visual-format rich content → messages/{en,zh}/topics.json.
Idempotent. Formats: study-sheets, social-media-posts, recipes, packaging,
mind-maps, branding."""
import json, sys

EN = {
 "study-sheets": {
   "lead": "Study sheets and worksheets condense a topic into a practice-ready page — vocabulary drills, exercises, and revision summaries. Curify builds a clean, printable worksheet from your subject in seconds.",
   "howToTitle": "How to make a study sheet",
   "howTo": ["Pick a study-sheet or worksheet template.", "Enter your subject, terms, or questions.", "Generate an organized, illustrated sheet.", "Download or print it, or grab a PDF pack."],
   "usesTitle": "What you can make",
   "uses": ["Vocabulary and language practice", "Exam and revision study sheets", "Kids' learning and phonics worksheets", "Subject cheat-summaries", "Printable classroom handouts"],
   "faqTitle": "Study sheet FAQ",
   "faq": [
     {"q": "Can I print the study sheets?", "a": "Yes — they export at high resolution and several templates offer a downloadable print-ready PDF pack."},
     {"q": "Can I use my own content?", "a": "Yes. Enter your terms or questions and Curify lays out and illustrates the sheet for you."},
     {"q": "Are bilingual sheets supported?", "a": "Many are — language templates pair English with Chinese and other languages on the same sheet."},
   ],
 },
 "social-media-posts": {
   "lead": "Social media posts and carousels turn an idea into scroll-stopping, on-brand slides for Instagram, RedNote, or TikTok. Curify lays out a cohesive multi-slide post from your topic.",
   "howToTitle": "How to make a social media post",
   "howTo": ["Pick a social post or carousel template.", "Add your topic, key points, and any names.", "Generate a set of matching, ready-to-post slides.", "Download and post, or refine and regenerate."],
   "usesTitle": "What you can make",
   "uses": ["Instagram and RedNote carousels", "Tip, how-to, and listicle posts", "Product and promotion posts", "Quote and meme posts", "Event and announcement posts"],
   "faqTitle": "Social post FAQ",
   "faq": [
     {"q": "Can I make a multi-slide carousel?", "a": "Yes — carousel templates generate a set of matching slides that read as one cohesive post."},
     {"q": "Are the posts sized for social platforms?", "a": "Yes, outputs are formatted for social feeds and stories so they're ready to upload."},
     {"q": "Do I need design skills?", "a": "No. Pick a template, add your points, and Curify handles the layout and styling."},
   ],
 },
 "recipes": {
   "lead": "Recipe cards make a dish look appetizing and easy to follow — ingredients, steps, and a hero image in one tidy card. Curify designs a beautiful recipe card from your recipe.",
   "howToTitle": "How to make a recipe card",
   "howTo": ["Pick a recipe-card template.", "Enter the dish, ingredients, and steps.", "Generate an illustrated, easy-to-follow card.", "Download or print, or save a recipe pack."],
   "usesTitle": "What you can make",
   "uses": ["Illustrated recipe cards", "Cuisine and dish guides", "Food and cooking tip cards", "Menu-style presentation cards", "Printable recipe collections"],
   "faqTitle": "Recipe card FAQ",
   "faq": [
     {"q": "Can I use my own recipe?", "a": "Yes — enter your ingredients and steps and Curify designs the card around them."},
     {"q": "Can I print recipe cards?", "a": "Yes, cards export at high resolution suitable for printing or a recipe binder."},
     {"q": "Can I make a whole collection?", "a": "Yes — build a set of matching cards, and several templates offer a downloadable pack."},
   ],
 },
 "packaging": {
   "lead": "Packaging visuals show your product wrapped, boxed, or labeled — so a brand idea looks shelf-ready. Curify renders packaging concepts and mockups from your description or artwork.",
   "howToTitle": "How to make a packaging design",
   "howTo": ["Pick a packaging template — box, label, pouch, or gift box.", "Describe the product and brand, or upload your artwork.", "Generate a packaging concept with realistic materials.", "Download the image for your deck, listing, or factory brief."],
   "usesTitle": "What you can make",
   "uses": ["Box and carton designs", "Label and pouch concepts", "Gift-box and hamper presentations", "Food and beverage packaging", "Brand packaging mockups"],
   "faqTitle": "Packaging FAQ",
   "faq": [
     {"q": "Can I put my own logo or artwork on the packaging?", "a": "Yes — several templates let you upload your design so it appears on the package."},
     {"q": "Is this a design or a mockup?", "a": "Both — Curify can render a fresh packaging concept or present your design on a realistic package."},
     {"q": "Can I use it for an online store?", "a": "Yes, the images work as professional product and listing visuals."},
   ],
 },
 "mind-maps": {
   "lead": "Mind maps branch a central idea into connected concepts — perfect for explaining structure, an ontology, or a study topic at a glance. Curify generates a clear, illustrated mind map from your subject.",
   "howToTitle": "How to make a mind map",
   "howTo": ["Pick a mind-map template.", "Enter your central topic and its branches.", "Generate a clear, connected, illustrated map.", "Download to study, present, or print."],
   "usesTitle": "What you can make",
   "uses": ["Study and revision maps", "Concept and ontology maps", "Animal and science structure maps", "Brainstorm and planning maps", "Educational explainer diagrams"],
   "faqTitle": "Mind map FAQ",
   "faq": [
     {"q": "Can I define my own branches?", "a": "Yes — enter the central topic and the branches, and Curify lays out and illustrates the map."},
     {"q": "How many branches can it show?", "a": "Templates handle several levels of branches while keeping the map readable at a glance."},
     {"q": "Can I print or present it?", "a": "Yes, mind maps export at high resolution for slides, handouts, or wall printing."},
   ],
 },
 "branding": {
   "lead": "Brand identity boards pull a brand's look into one visual system — logo direction, colors, type, and mood. Curify explores a cohesive brand board from your brief, so a brand idea becomes something you can see.",
   "howToTitle": "How to make a brand board",
   "howTo": ["Pick a brand-identity or moodboard template.", "Describe the brand — name, feel, and audience.", "Generate a cohesive visual system and direction.", "Refine the direction and regenerate, or apply it to mockups."],
   "usesTitle": "What you can make",
   "uses": ["Brand moodboards and visual systems", "Logo and color direction", "Full-VI presentation boards", "Packaging and application previews", "Brand pitch and deck visuals"],
   "faqTitle": "Brand board FAQ",
   "faq": [
     {"q": "Do I need design skills?", "a": "No. Describe the brand and Curify explores a coherent visual direction — colors, type, mood, and applications."},
     {"q": "Is this a final logo?", "a": "It's a direction and visual system to align on; you can iterate and then apply the look to mockups and packaging."},
     {"q": "Can I present it to a client?", "a": "Yes — the boards are built to look like a professional brand presentation."},
   ],
 },
}

ZH = {
 "study-sheets": {
   "lead": "学习表和练习单把一个主题浓缩成一张可直接练习的页面——词汇练习、习题和复习摘要。Curify 几秒钟就能根据你的主题生成一张整洁、可打印的学习表。",
   "howToTitle": "如何制作学习表",
   "howTo": ["选择学习表或练习单模板。", "输入主题、词条或题目。", "生成条理清晰、配图的表单。", "下载或打印，或获取 PDF 卡包。"],
   "usesTitle": "你可以做什么",
   "uses": ["词汇与语言练习", "考试与复习学习表", "儿童启蒙与拼读练习单", "学科速记摘要", "可打印的课堂讲义"],
   "faqTitle": "学习表常见问题",
   "faq": [
     {"q": "学习表可以打印吗？", "a": "可以——以高分辨率导出，多个模板还提供可打印的 PDF 卡包。"},
     {"q": "可以用我自己的内容吗？", "a": "可以。输入你的词条或题目，Curify 会为你排版并配图。"},
     {"q": "支持双语表单吗？", "a": "很多都支持——语言模板可在同一张表上将英语与中文等语言配对。"},
   ],
 },
 "social-media-posts": {
   "lead": "社媒帖子与轮播图能把一个想法变成吸睛、统一风格的图文，适配 Instagram、小红书或 TikTok。Curify 会根据你的主题排出一整套连贯的多图帖子。",
   "howToTitle": "如何制作社媒帖子",
   "howTo": ["选择社媒帖子或轮播模板。", "填写主题、要点和名称。", "生成一整套风格统一、可直接发布的图片。", "下载发布，或调整后重新生成。"],
   "usesTitle": "你可以做什么",
   "uses": ["Instagram 与小红书轮播", "干货、教程与清单帖", "产品与促销帖", "语录与梗图帖", "活动与公告帖"],
   "faqTitle": "社媒帖子常见问题",
   "faq": [
     {"q": "可以做多图轮播吗？", "a": "可以——轮播模板会生成一整套风格一致的图片，读起来是连贯的一条帖子。"},
     {"q": "帖子尺寸适配社媒平台吗？", "a": "适配，输出按社媒信息流和快拍尺寸排布，可直接上传。"},
     {"q": "需要设计基础吗？", "a": "不需要。选模板、填要点，Curify 负责版式与风格。"},
   ],
 },
 "recipes": {
   "lead": "食谱卡让一道菜看起来诱人、易于跟做——食材、步骤和主图集于一张整洁的卡片。Curify 会根据你的食谱设计一张精美的食谱卡。",
   "howToTitle": "如何制作食谱卡",
   "howTo": ["选择食谱卡模板。", "输入菜名、食材和步骤。", "生成配图、易跟做的卡片。", "下载或打印，或保存食谱卡包。"],
   "usesTitle": "你可以做什么",
   "uses": ["插画风食谱卡", "菜系与菜品指南", "美食与烹饪贴士卡", "菜单式展示卡", "可打印的食谱合集"],
   "faqTitle": "食谱卡常见问题",
   "faq": [
     {"q": "可以用我自己的食谱吗？", "a": "可以——输入食材和步骤，Curify 会围绕它们设计卡片。"},
     {"q": "食谱卡可以打印吗？", "a": "可以，卡片以高分辨率导出，适合打印或做成食谱册。"},
     {"q": "可以做一整套合集吗？", "a": "可以——制作一整套风格统一的卡片，多个模板还提供可下载卡包。"},
   ],
 },
 "packaging": {
   "lead": "包装设计把你的产品以盒装、袋装或贴标形式呈现，让品牌创意看起来可直接上架。Curify 能根据你的描述或作品渲染包装概念与样机。",
   "howToTitle": "如何制作包装设计",
   "howTo": ["选择包装模板——盒、标签、袋或礼盒。", "描述产品和品牌，或上传你的作品。", "生成材质逼真的包装概念。", "下载图片用于演示、详情页或工厂简报。"],
   "usesTitle": "你可以做什么",
   "uses": ["盒型与纸盒设计", "标签与软袋概念", "礼盒与礼篮呈现", "食品与饮料包装", "品牌包装样机"],
   "faqTitle": "包装常见问题",
   "faq": [
     {"q": "可以把我自己的 logo 或作品放到包装上吗？", "a": "可以——多个模板支持上传你的设计，让它出现在包装上。"},
     {"q": "这是设计还是样机？", "a": "两者皆可——Curify 既能生成全新的包装概念，也能把你的设计呈现在逼真的包装上。"},
     {"q": "可以用于网店吗？", "a": "可以，这些图片可作为专业的产品与详情页视觉。"},
   ],
 },
 "mind-maps": {
   "lead": "思维导图把一个中心概念发散成相互关联的节点——非常适合一眼讲清结构、知识体系或学习主题。Curify 会根据你的主题生成一张清晰、配图的思维导图。",
   "howToTitle": "如何制作思维导图",
   "howTo": ["选择思维导图模板。", "输入中心主题及其分支。", "生成清晰、连贯、配图的导图。", "下载用于学习、演示或打印。"],
   "usesTitle": "你可以做什么",
   "uses": ["学习与复习导图", "概念与知识体系图", "动物与科学结构图", "头脑风暴与规划图", "教学讲解示意图"],
   "faqTitle": "思维导图常见问题",
   "faq": [
     {"q": "可以自定义分支吗？", "a": "可以——输入中心主题和分支，Curify 会为你排布并配图。"},
     {"q": "能展示多少层分支？", "a": "模板可处理多层分支，同时保持导图一眼可读。"},
     {"q": "可以打印或演示吗？", "a": "可以，思维导图以高分辨率导出，适合幻灯片、讲义或墙面打印。"},
   ],
 },
 "branding": {
   "lead": "品牌视觉板把一个品牌的调性汇聚成一套视觉系统——logo 方向、配色、字体与情绪。Curify 会根据你的简报探索一套连贯的品牌视觉板，让品牌创意变得可见。",
   "howToTitle": "如何制作品牌视觉板",
   "howTo": ["选择品牌视觉或情绪板模板。", "描述品牌——名称、气质与受众。", "生成连贯的视觉系统与方向。", "调整方向后重新生成，或应用到样机上。"],
   "usesTitle": "你可以做什么",
   "uses": ["品牌情绪板与视觉系统", "logo 与配色方向", "全套 VI 呈现板", "包装与应用预览", "品牌提案与演示视觉"],
   "faqTitle": "品牌视觉板常见问题",
   "faq": [
     {"q": "需要设计基础吗？", "a": "不需要。描述品牌，Curify 会探索连贯的视觉方向——配色、字体、情绪与应用。"},
     {"q": "这是最终 logo 吗？", "a": "这是用于统一共识的方向与视觉系统；你可以迭代，再把风格应用到样机和包装上。"},
     {"q": "可以拿给客户看吗？", "a": "可以——这些板专为呈现专业的品牌提案效果而设计。"},
   ],
 },
}

def inject(path, data):
    d = json.load(open(path, encoding="utf-8")); topics = d["topics"]; n = 0
    for slug, block in data.items():
        if slug not in topics:
            print(f"  WARN {slug} missing in {path}"); continue
        topics[slug]["format"] = block; n += 1
    open(path, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
    print(f"  injected {n} into {path}")

base = sys.argv[1]
inject(f"{base}/messages/en/topics.json", EN)
inject(f"{base}/messages/zh/topics.json", ZH)
