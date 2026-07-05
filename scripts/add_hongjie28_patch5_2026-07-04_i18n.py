"""Add EN + ZH i18n for the 3 new templates from hongjie28-patch-5 (2026-07-04 drop).

Templates (patch-4's 3 were deferred — shipped with no example images):
  - template-amazon-long-scroll-product-infographic-template
  - template-eco-farm-food-uniform-product-label
  - template-luxury-vintage-gem-necklace-design-sheet

Per memory feedback_daily_drop_i18n.md:
  - i18n ships in the same workflow (not a follow-up).
  - nano.json structure is FLAT (template ids at top level): doc[tid] = ...
This script writes en + zh (hand-authored); the other 8 locales are filled by
`node scripts/i18n_autotranslate.cjs --base en --files nano --write` right after.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

template_ids = [
    "template-amazon-long-scroll-product-infographic-template",
    "template-eco-farm-food-uniform-product-label",
    "template-luxury-vintage-gem-necklace-design-sheet",
]

EN = {
    "template-amazon-long-scroll-product-infographic-template": {
        "category": "Amazon Long-Scroll Product Infographic",
        "description": "Generate a full-length vertical Amazon listing infographic — hero banner, old-vs-new comparison, core tech feature grid, lifestyle usage scenes, and a spec table — for any cross-border e-commerce product.",
        "title": "Nano Banana Prompt: Amazon Long-Scroll Product Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a full long vertical Amazon listing marketing infographic for {product_full_name}. Layout, top to bottom: a hero banner with a multi-angle product render, headline, selling-point icon tags, brand logo and certification badges; an old-vs-new comparison block; a 3-panel core technology feature grid with internal cutaway renders; a multi-scenario lifestyle usage grid; and a bottom specification table. Clean modern e-commerce visual design, cohesive brand palette, print-ready detail-page quality.",
            "who": "Suitable for Amazon / cross-border e-commerce sellers, DTC brand marketers, product-listing designers, agencies producing detail-page creative, and dropshippers building conversion-focused listings.",
            "how": [
                "Enter the full product name in {product_full_name} (e.g. 'RANVOO portable high-speed cooling handheld fan').",
                "Hero banner, comparison block, feature grid and lifestyle scenes auto-compose top to bottom.",
                "Spec table and certification badges auto-populate.",
                "Generate a full-length vertical Amazon product infographic."
            ],
            "prompts": [
                "Generate an Amazon long-scroll infographic for a portable espresso coffee maker.",
                "Create a cross-border listing infographic for ANC bluetooth earbuds.",
                "Generate a vertical detail-page infographic for a UV-sterilizing smart water bottle."
            ]
        }},
    },
    "template-eco-farm-food-uniform-product-label": {
        "category": "Eco Farm Food Product Label",
        "description": "Generate a minimalist organic farm food packaging label — brand header, color-swatch palette, die-cut product photo window, oversized product name, and feature copy — as a unified brand-series template.",
        "title": "Nano Banana Prompt: Eco Farm Food Product Label Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical minimalist organic farm food packaging label for {food_product_name}. Clean white base with a unified brand system: a top brand header with logo, name and a 4-swatch color palette; a central irregular die-cut window filled with close-up product photography; an oversized vertical product name aligned to the right edge; a lower text area with short natural / handmade / organic feature copy; and a base band with certifications or origin. Cohesive, premium packaging-label aesthetic.",
            "who": "Suitable for organic / artisan food brands, farm-to-table producers, packaging designers, private-label grocery lines, and makers needing a consistent label series across SKUs.",
            "how": [
                "Enter the product category in {food_product_name} (e.g. 'aged artisan cheese', '100% Arabica roasted coffee beans').",
                "The die-cut window fills with matching close-up product photography.",
                "Brand header, color swatches and feature copy auto-compose.",
                "Generate a vertical organic farm food product label."
            ],
            "prompts": [
                "Generate an eco farm label for raw unfiltered natural honey.",
                "Create a minimalist packaging label for cold-pressed extra virgin olive oil.",
                "Generate a product label for sourdough artisan bread."
            ]
        }},
    },
    "template-luxury-vintage-gem-necklace-design-sheet": {
        "category": "Vintage Gem Necklace Design Sheet",
        "description": "Generate a dual-column jewelry design presentation board — hand-drawn technical concept sketch with annotations on the left, realistic finished-pendant product renders on the right — for a vintage baroque gemstone necklace.",
        "title": "Nano Banana Prompt: Vintage Gem Necklace Design Sheet Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical jewelry concept design layout board for {jewelry_theme_name}. Split dual-column layout: the left is a hand-drawn technical sketch concept sheet — title, theme copy, an annotated front-view line drawing, a side-view sketch, material and relief-motif detail panels, and a material spec list with dimensions; the right stacks two realistic product renders — an overhead front shot and a macro side detail of the finished silver pendant on a neutral matte background. Elegant antique jewelry design-portfolio aesthetic.",
            "who": "Suitable for jewelry designers building concept boards, fine-jewelry brands pitching collections, craft / maker portfolios, design students, and boutiques presenting bespoke pieces.",
            "how": [
                "Enter the necklace theme in {jewelry_theme_name} (e.g. 'Angel Fountain cherub aquamarine silver necklace').",
                "The left column auto-draws the annotated technical concept sketch.",
                "The right column renders overhead + macro product shots of the finished pendant.",
                "Generate a vertical vintage gemstone necklace design sheet."
            ],
            "prompts": [
                "Generate a design sheet for a Lotus Pond mother-of-pearl gem pendant.",
                "Create a concept board for a forest-stream vintage carved aqua-crystal silver necklace.",
                "Generate a jewelry design sheet for a baroque cherub aquamarine pendant."
            ]
        }},
    },
}

ZH = {
    "template-amazon-long-scroll-product-infographic-template": {
        "category": "亚马逊长图商品信息图",
        "description": "为任意跨境电商商品生成完整竖版亚马逊详情长图——主图横幅、新旧对比、核心科技功能网格、生活场景与规格参数表。",
        "title": "Nano Banana 提示词：亚马逊长图商品信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为 {product_full_name} 生成完整竖版亚马逊营销详情长图。自上而下布局：多角度产品主图横幅 + 主标题 + 卖点图标标签 + 品牌 logo 与认证徽章；新旧版本对比区块；三格核心科技功能网格（含内部结构剖切渲染）；多场景生活方式使用网格；底部规格参数表。简洁现代电商视觉、统一品牌配色、印刷级详情页质感。",
            "who": "适合亚马逊 / 跨境电商卖家、DTC 品牌营销、商品详情页设计师、代运营创意团队，以及打造高转化 listing 的商家。",
            "how": [
                "在 {product_full_name} 输入完整商品名称（例如：RANVOO 便携式高速制冷手持小风扇）。",
                "主图横幅、对比区块、功能网格与生活场景自上而下自动排布。",
                "规格参数表与认证徽章自动填充。",
                "生成完整竖版亚马逊商品详情长图。"
            ],
            "prompts": [
                "生成便携意式浓缩咖啡机的亚马逊长图信息图。",
                "为主动降噪蓝牙耳机制作跨境电商详情长图。",
                "生成紫外线杀菌智能保温杯的竖版详情信息图。"
            ]
        }},
    },
    "template-eco-farm-food-uniform-product-label": {
        "category": "有机农场食品标签",
        "description": "生成极简有机农场食品包装标签——品牌页眉、配色色卡、异形开窗产品照、超大商品名与特性文案，统一品牌系列模板。",
        "title": "Nano Banana 提示词：有机农场食品标签生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为 {food_product_name} 生成竖版极简有机农场食品包装标签。纯白底 + 统一品牌系统：顶部品牌页眉（logo、品牌名与四色色卡）；中部异形开窗填充产品特写摄影；超大竖排商品名右对齐；下方短文案介绍天然 / 手作 / 有机特性；底部为认证或产地信息。统一、高级的包装标签美学。",
            "who": "适合有机 / 手作食品品牌、农场直供生产者、包装设计师、自有品牌商超系列，以及需要跨 SKU 统一标签系列的商家。",
            "how": [
                "在 {food_product_name} 输入商品品类（例如：陈年手工奶酪、100% 阿拉比卡烘焙咖啡豆）。",
                "开窗区域自动填充对应产品特写摄影。",
                "品牌页眉、色卡与特性文案自动排布。",
                "生成竖版有机农场食品标签。"
            ],
            "prompts": [
                "为纯天然未过滤蜂蜜生成有机农场标签。",
                "为冷压特级初榨橄榄油制作极简包装标签。",
                "为手工酸种面包生成产品标签。"
            ]
        }},
    },
    "template-luxury-vintage-gem-necklace-design-sheet": {
        "category": "复古宝石项链设计稿",
        "description": "为复古巴洛克宝石项链生成双栏珠宝设计展示板——左侧手绘技术概念草图带标注，右侧成品吊坠写实产品渲染图。",
        "title": "Nano Banana 提示词：复古宝石项链设计稿生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为 {jewelry_theme_name} 生成竖版珠宝概念设计版面板。左右双栏布局：左侧为手绘技术草图概念稿——大标题、主题文案、带结构标注的正视线稿、侧视草图、材质与浮雕纹样细节面板，以及含尺寸数据的材质规格清单；右侧上下叠放两张写实产品渲染——成品银吊坠的俯视正面图 + 微距侧面细节图，中性哑光背景。优雅复古珠宝设计作品集美学。",
            "who": "适合制作概念板的珠宝设计师、推介系列的高级珠宝品牌、手作 / 匠人作品集、设计专业学生，以及展示定制款的精品店。",
            "how": [
                "在 {jewelry_theme_name} 输入项链主题（例如：天使喷泉小天使海蓝宝石银项链）。",
                "左栏自动绘制带标注的技术概念草图。",
                "右栏渲染成品吊坠的俯视图与微距细节图。",
                "生成竖版复古宝石项链设计稿。"
            ],
            "prompts": [
                "为莲池母贝宝石吊坠生成设计稿。",
                "为林间溪流复古雕刻海蓝水晶银项链制作概念板。",
                "为巴洛克小天使海蓝宝石吊坠生成珠宝设计稿。"
            ]
        }},
    },
}


def main():
    by_locale = {"en": EN, "zh": ZH}
    for locale, content in by_locale.items():
        missing = [tid for tid in template_ids if tid not in content]
        if missing:
            raise SystemExit(f"FAIL: locale {locale} missing {missing}")

    total = 0
    for locale, content in by_locale.items():
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
            doc[tid] = content[tid]
            added += 1
            total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added} template entries")

    print(f"\nDone. Added {total} en/zh entries. Next: i18n_autotranslate for the other 8 locales.")


if __name__ == "__main__":
    main()
