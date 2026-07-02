"""Ship /blog/ai-product-photo-to-ecommerce-listing.

Anchors the /tools/ecommerce-photo demo. Survey of 6 image2image
templates that turn an uploaded object photo into an e-commerce
listing asset — cozy hero shots, 9:16 detail-shot layouts, outfit
try-ons, style variations, mood boards, before/after storage.

Same pattern as scripts/build_wimbledon_hub.py: idempotent upsert
into blogs.json + messages/en/blog.json.
"""
from __future__ import annotations
import json
from pathlib import Path
from collections import OrderedDict

REPO = Path(__file__).parent.parent
SLUG = "ai-product-photo-to-ecommerce-listing"
KEY = "aiProductPhotoToEcommerceListing"
DATE_HUMAN = "July 2, 2026"
DATE_ISO = "2026-07-02"

TITLE = "AI Product Photo to E-Commerce Listing Image: Upload Once, Ship in 30 Seconds"
META = ("Turn any product photo into a listing-ready e-commerce image without a "
        "photoshoot. 6 shipped Curify templates cover cozy hero shots (Etsy / DTC), "
        "9:16 detail-shot layouts (Shopee, TikTok Shop, RedNote), outfit try-ons, "
        "mood boards, and before/after storage. Upload once; template locks the style.")
SEO_KEYWORDS = ("ai ecommerce photo, product photo generator, upload product photo, "
                "etsy product photo ai, shopee listing image, tiktok shop product "
                "image, rednote listing image, ai product photo to listing, cozy "
                "product poster ai, fashion ecommerce ai image, ai outfit try on, "
                "interior mood board ai")

INTRO = (
    "*E-commerce listing photos* are the single highest-impact visual in the "
    "conversion funnel — the image that appears in search grids, on product "
    "cards, and at the top of the listing page. Etsy sellers see 20-35% CVR "
    "lift when the hero shot reads as *real brand* rather than *phone snapshot*. "
    "Traditional catalog photography means a studio, lighting kit, and "
    "photographer per SKU. That model doesn't scale below 500 units and pins "
    "independent sellers to phone-shot mediocrity — the visual gap between "
    "hobby-scale and brand-scale.\n\n"
    "The 2026 generation of image-to-image models (Nano Banana Pro, Gemini 3 Pro "
    "Image, GPT Image 2) ship the underlying capability. What was missing until "
    "now is the templating layer — a way to guarantee that every upload lands in "
    "the same visual register, so a 20-SKU catalog reads as one shoot instead of "
    "20 disparate AI outputs.\n\n"
    "Below: 6 shipped Curify templates that take an uploaded product photo and "
    "output a listing-ready image. Each one targets a specific e-commerce visual "
    "grammar (Etsy cozy hero, Shopee 9:16 detail, apparel try-on, fashion "
    "lookbook, home mood board, storage before/after). Pick the one matching "
    "where you list. Two are wrapped in the new "
    "[/tools/ecommerce-photo](/tools/ecommerce-photo) tool route — the other "
    "four remain accessible via their individual template pages."
)

WHAT_IS_TITLE = "What separates a listing-ready image from a generic AI upload"
WHAT_IS_CONTENT = (
    "Four ingredients:\n\n"
    "- **Product fidelity** — the AI must preserve the exact product identity "
    "(shape, proportions, color, materials, branding). Generic image2image "
    "models drift on all four; templated prompts encode the fidelity constraint "
    "up front.\n"
    "- **Composition grammar per marketplace** — Etsy converts on cozy warm hero "
    "shots. Shopee / TikTok Shop / RedNote convert on 9:16 vertical detail-shot "
    "layouts. Amazon converts on a clean white-background hero. Each is a "
    "different template.\n"
    "- **Catalog consistency** — 20 SKUs in a catalog should look like one shoot, "
    "not 20 disparate AI outputs. This is where templated generation dominates "
    "raw prompt engineering — the style locks once, every generation inherits.\n"
    "- **Ready-to-ship output** — no cropping, no color-correcting, no scene-"
    "cleaning. If the template output needs post-production, it's a mood board, "
    "not a listing image."
)

MODELS_TITLE = "6 templates, 6 e-commerce visual grammars"
MODELS_CONTENT = (
    "All 6 templates below take `requires_image_upload: True` — you supply a "
    "reference photo of your actual product. The AI preserves identity (shape, "
    "proportions, colors, materials, controls, branding) and replaces the scene "
    "/ composition / lighting.\n\n"
    "**Template → marketplace fit**:\n\n"
    "| Template | Grammar | Best marketplace |\n"
    "| --- | --- | --- |\n"
    "| `template-product-poster` | Cozy warm hero shot | Etsy, DTC brand pages, Shopify |\n"
    "| `template-fashion-ecommerce` | 9:16 vertical detail-shot | Shopee, TikTok Shop, RedNote, Lazada |\n"
    "| `template-ai-outfit-try-on-poster` | 3-panel try-on | Apparel on any marketplace |\n"
    "| `template-personal-fashion-outfit-style-variations` | Lookbook style-variation grid | Fashion shop-by-look rails |\n"
    "| `template-interior-design-mood-board-generator` | Interior mood board | Home / decor / aromatherapy |\n"
    "| `template-home-organization-before-after` | Before/after transformation | Storage organizers / home-goods |\n\n"
    "The new [/tools/ecommerce-photo](/tools/ecommerce-photo) tool wraps the top "
    "two (product-poster + fashion-ecommerce) into a focused upload → listing-"
    "image flow. The other four remain accessible via their template pages for "
    "narrower niches."
)

HOW_TITLE = "The 6 templates"

STEP1_TITLE = "1. Cozy warm hero shot — template-product-poster"
STEP1_CONTENT = (
    "The Etsy / DTC brand aesthetic. Soft interior lighting, natural props, "
    "wooden-surface staging, warm color register. Reads as *artisan*, not "
    "*mass-market*. This template preserves product identity precisely — same "
    "shape, proportions, colors, materials, controls, branding — and drops it "
    "into a cozy warm scene the Etsy shopper visually maps to *handmade / "
    "small-batch / real person behind this*.\n\n"
    "![Aromatherapy diffuser rendered as a cozy warm-lit product poster with "
    "wooden shelf and natural props]"
    "(/images/nano_insp/template-product-poster-aromatherapy-diffuser.jpg)\n\n"
    "**Best for**: candle makers, aromatherapy sellers, home-goods brands, "
    "artisan coffee roasters, plant shops, ceramicists, small-batch skincare, "
    "anyone listing on Etsy or a DTC storefront where brand-warmth matters more "
    "than clinical precision.\n\n"
    "**Try it**: [Open the Product Poster template →]"
    "(/nano-template/product-poster) — or use the "
    "[/tools/ecommerce-photo](/tools/ecommerce-photo) wrapper for the upload → "
    "listing-image flow."
)

STEP2_TITLE = "2. 9:16 vertical detail-shot — template-fashion-ecommerce"
STEP2_CONTENT = (
    "The Shopee / TikTok Shop / RedNote (Xiaohongshu) grammar. Clean background, "
    "feature callouts, larger product-in-frame ratio optimized for mobile grids. "
    "The 9:16 aspect is native to the platforms fashion + accessory sellers "
    "actually convert on — vertical formats occupy 2.4× more screen real estate "
    "than square on a mobile feed, which is where 90% of these platforms' "
    "traffic lives.\n\n"
    "![Cycling jersey rendered as a 9:16 vertical e-commerce detail-shot layout "
    "with aerodynamic feature callouts]"
    "(/images/nano_insp/template-fashion-ecommerce-cycling-jersey-aerodynamic.jpg)\n\n"
    "**Best for**: clothing, jewelry, accessories, headphones, small consumer "
    "electronics, home hardware, beauty devices — anything that lists on Shopee, "
    "Lazada, TikTok Shop, RedNote (Xiaohongshu), or Chinese-language "
    "marketplaces where the detail-shot-with-callout is the SERP visual.\n\n"
    "**Try it**: [Open the Fashion E-Commerce template →]"
    "(/nano-template/fashion-ecommerce) — or use the "
    "[/tools/ecommerce-photo](/tools/ecommerce-photo) wrapper for the same "
    "upload flow."
)

STEP3_TITLE = "3. 3-panel outfit try-on — template-ai-outfit-try-on-poster"
STEP3_CONTENT = (
    "The apparel-specific listing format. Upload a character reference photo + "
    "an outfit reference, get back a 3-panel poster: original character, styled "
    "outfit on the character, standalone outfit. Solves the biggest apparel "
    "listing problem — buyers want to see the item worn, not just on a hanger.\n\n"
    "![Preppy academia female outfit try-on 3-panel — original character, styled "
    "on-model shot, standalone outfit reference]"
    "(/images/nano_insp/template-ai-outfit-try-on-poster-preppy-academia-female.jpg)\n\n"
    "**Best for**: independent clothing brands, thrift resellers, print-on-demand "
    "apparel, anyone selling wearables where the on-model shot matters more than "
    "the flat-lay.\n\n"
    "**Try it**: [Open the AI Outfit Try-On Poster template →]"
    "(/nano-template/ai-outfit-try-on-poster)."
)

STEP4_TITLE = "4. Lookbook style variations — template-personal-fashion-outfit-style-variations"
STEP4_CONTENT = (
    "Upload one reference photo of a person, get back a lookbook grid: the same "
    "person styled across N different outfit variations. Identity preserved "
    "across every panel. Perfect for a *shop by look* listing rail.\n\n"
    "![Fashion lookbook style-variation grid — same model rendered in multiple "
    "outfit combinations for a shop-by-look listing rail]"
    "(/images/nano_insp/template-personal-fashion-outfit-style-variations-women-1.jpg)\n\n"
    "**Best for**: seasonal capsule collections, styling services, personal "
    "shoppers, curated-vintage sellers who need a coordinated lookbook shoot "
    "without a photographer.\n\n"
    "**Try it**: [Open the Fashion Style Variations template →]"
    "(/nano-template/personal-fashion-outfit-style-variations)."
)

STEP5_TITLE = "5. Room → mood board — template-interior-design-mood-board-generator"
STEP5_CONTENT = (
    "Upload a photo of a real room, get back a vertical interior-design mood "
    "board — the swatch + palette + product callout format that home-goods "
    "sellers use to sell an *aesthetic*, not just an object. The listing "
    "shifts from *product page* to *design system*.\n\n"
    "![Aromatherapy spa-corner mood board — vertical interior-design layout "
    "with product callouts and color-palette swatches]"
    "(/images/nano_insp/template-interior-design-mood-board-generator-aromatherapy-spa-corner.jpg)\n\n"
    "**Best for**: home-goods, decor, aromatherapy, candles, wall art — anything "
    "where the buyer's intent is *make the room feel like this* rather than "
    "*buy this exact object*.\n\n"
    "**Try it**: [Open the Interior Mood Board template →]"
    "(/nano-template/interior-design-mood-board-generator)."
)

TOOLS_TITLE = "6. Before / after storage — template-home-organization-before-after"
TOOLS_CONTENT = (
    "Upload a photo of an unorganized space (closet, kitchen drawer, desk, "
    "shelf), get back a before/after transformation poster. The dominant listing "
    "format for storage organizers, drawer dividers, closet systems, pantry "
    "labels — categories where the value prop *IS* the transformation.\n\n"
    "![Home organization before / after transformation — closet with organizer "
    "system rendered side-by-side]"
    "(/images/nano_insp/template-home-organization-before-after-closet.jpg)\n\n"
    "**Best for**: storage organizer sellers, home-goods brands with "
    "transformation-based value props, organizing services, professional "
    "organizers building a portfolio.\n\n"
    "**Try it**: [Open the Home Organization Before/After template →]"
    "(/nano-template/home-organization-before-after)."
)

CHALLENGES_TITLE = "Where these templates still fail (and how to fix)"
CHALLENGES_CONTENT = (
    "- **Small-object identity drift** — jewelry, watch faces, and other sub-"
    "2cm detail features can drift on the first pass. Fix: upload a hero shot "
    "with clean lighting and shallow depth of field so the model has strong "
    "identity signal.\n"
    "- **Text on packaging** — printed labels and small text on packaging can "
    "render as garbled glyphs. Fix: for text-heavy packaging use the dedicated "
    "[`template-food-product-packaging-design`](/nano-template/food-product-packaging-design) "
    "which is tuned for label preservation, or ship the templated shot as the "
    "*hero* and use your original photo as one of the secondary listing images.\n"
    "- **Amazon compliance** — pure white background required. None of these 6 "
    "templates optimize for pure white; use the raw image-to-image mini-tool for "
    "background removal after generating the hero shot elsewhere.\n"
    "- **Print-quality resolution** — templated output ships at screen quality "
    "(1024-2048 px). For POD or print catalog, upscale via the print-ready "
    "pipeline (backlog, not yet shipped) or Topaz Gigapixel.\n"
    "- **Multi-color / multi-variant SKUs** — a single upload cannot generate "
    "all 12 color variants of the same shirt. Fix: run each color as a separate "
    "template call, or wait for the batch upload flow (early access) which "
    "accepts a folder of variant references and returns a coordinated set.\n"
    "- **Reflective / mirror-finish surfaces** — chrome, polished stainless "
    "steel, and glass distort under scene replacement because the AI has to "
    "invent the new reflection. Fix: upload with a plain background and let the "
    "template handle the scene, but expect one or two regen passes for luxury-"
    "grade finish."
)

CURIFY_TITLE = "Why templated beats prompt-engineered for listing images"
CURIFY_CONTENT = (
    "Three reasons the templated output beats raw prompt engineering, even with "
    "the same underlying model (Nano Banana Pro):\n\n"
    "- **Composition encoding** — the template has cozy-hero / 9:16-detail / "
    "try-on-3-panel / mood-board / before-after composition already baked in. "
    "You supply the product; the model gets a complete spec instead of having "
    "to invent the format. Zero prompt iteration.\n"
    "- **Product-fidelity constraints** — every template's underlying prompt "
    "starts with a *preserve exact product identity* clause (shape, colors, "
    "materials, controls, branding). Raw prompts skip this and drift by "
    "generation 3-5.\n"
    "- **Catalog consistency** — 20 SKUs generated through one template all "
    "look like one shoot. 20 SKUs prompt-engineered separately look like 20 "
    "different AI outputs. Consistency is what buyers register as *real brand*; "
    "inconsistency reads as *marketplace reseller*.\n\n"
    "For the broader catalog play, see [/blog/ai-product-photo-generator-guide]"
    "(/blog/ai-product-photo-generator-guide) — the same infrastructure powers "
    "programmatic-SEO landing pages at 500+ SKU scale. For the merch / POD "
    "workflow, see [/use-cases/for-merch-operators](/use-cases/for-merch-operators). "
    "For the strategic frame on why templated Completion beats raw Generation, "
    "see [/blog/programmatic-seo-dtc-visual-first](/blog/programmatic-seo-dtc-visual-first)."
)

CONCLUSION_TITLE = "Upload once — 30 seconds to a listing image"
CONCLUSION_CONTENT = (
    "Try the wrapped tool at [/tools/ecommerce-photo](/tools/ecommerce-photo) — "
    "single upload, pick cozy hero or 9:16 detail, done. For the narrower "
    "categories (apparel, fashion lookbook, home mood board, storage before/"
    "after), open the specific template linked above.\n\n"
    "Building a catalog at 20+ SKU scale? [Reach out via /contact](/contact) "
    "for early access to the batch pipeline — upload a folder of product photos, "
    "get back a coordinated set of listing images with locked visual style "
    "across the whole line."
)

NANO_TEMPLATES = [
    {
        "groupKey": "ecommerce-photo-hub-product-poster-aromatherapy-diffuser",
        "template_id": "template-product-poster",
        "sample_parameters": {"product_context": "Aromatherapy diffuser cozy warm-lit poster"},
        "category": "product",
        "description": "Cozy warm hero shot — Etsy / DTC brand aesthetic",
        "image_urls": ["/images/nano_insp/template-product-poster-aromatherapy-diffuser.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-product-poster-aromatherapy-diffuser-prev.jpg"],
    },
    {
        "groupKey": "ecommerce-photo-hub-fashion-ecommerce-cycling-jersey",
        "template_id": "template-fashion-ecommerce",
        "sample_parameters": {"product_context": "Cycling jersey 9:16 vertical detail-shot"},
        "category": "product",
        "description": "9:16 vertical detail-shot — Shopee / TikTok Shop / RedNote",
        "image_urls": ["/images/nano_insp/template-fashion-ecommerce-cycling-jersey-aerodynamic.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-fashion-ecommerce-cycling-jersey-aerodynamic-prev.jpg"],
    },
    {
        "groupKey": "ecommerce-photo-hub-outfit-try-on-preppy-academia-female",
        "template_id": "template-ai-outfit-try-on-poster",
        "sample_parameters": {"outfit_context": "Preppy academia female — 3-panel try-on"},
        "category": "fashion",
        "description": "3-panel outfit try-on — apparel listing format",
        "image_urls": ["/images/nano_insp/template-ai-outfit-try-on-poster-preppy-academia-female.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-ai-outfit-try-on-poster-preppy-academia-female-prev.jpg"],
    },
    {
        "groupKey": "ecommerce-photo-hub-fashion-style-variations-women",
        "template_id": "template-personal-fashion-outfit-style-variations",
        "sample_parameters": {"lookbook_context": "Women's lookbook — style variations grid"},
        "category": "fashion",
        "description": "Lookbook style-variation grid — shop-by-look listing rail",
        "image_urls": ["/images/nano_insp/template-personal-fashion-outfit-style-variations-women-1.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-personal-fashion-outfit-style-variations-women-1-prev.jpg"],
    },
    {
        "groupKey": "ecommerce-photo-hub-interior-mood-board-aromatherapy",
        "template_id": "template-interior-design-mood-board-generator",
        "sample_parameters": {"room_context": "Aromatherapy spa corner mood board"},
        "category": "interior",
        "description": "Room → interior mood board — sell the aesthetic",
        "image_urls": ["/images/nano_insp/template-interior-design-mood-board-generator-aromatherapy-spa-corner.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-interior-design-mood-board-generator-aromatherapy-spa-corner-prev.jpg"],
    },
    {
        "groupKey": "ecommerce-photo-hub-home-organization-before-after-closet",
        "template_id": "template-home-organization-before-after",
        "sample_parameters": {"space_context": "Closet — before/after storage transformation"},
        "category": "interior",
        "description": "Before/after storage — organizer / home-goods listing format",
        "image_urls": ["/images/nano_insp/template-home-organization-before-after-closet.jpg"],
        "preview_image_urls": ["/images/nano_insp_preview/template-home-organization-before-after-closet-prev.jpg"],
    },
]

BLOG_ENTRY = OrderedDict([
    ("slug", SLUG),
    ("title", TITLE),
    ("date", DATE_HUMAN),
    ("readTime", "7 min read"),
    ("tag", "Product Photo"),
    ("image", "/images/nano_insp/template-fashion-ecommerce-cycling-jersey-aerodynamic.jpg"),
    ("heroLink", "/tools/ecommerce-photo"),
    ("category", "nano-template"),
    ("relatedLinks", [
        "ai-product-photo-generator-guide",
        "programmatic-seo-dtc-visual-first",
        "ip-merch-design-ai-workflow",
    ]),
    ("lastmod", DATE_ISO),
    ("metaDescription", META),
    ("nanoTemplates", NANO_TEMPLATES),
])

MESSAGES_ENTRY = OrderedDict([
    ("title", TITLE),
    ("metaDescription", META),
    ("seoKeywords", SEO_KEYWORDS),
    ("date", DATE_HUMAN),
    ("readTime", "7 min read"),
    ("intro", INTRO),
    ("whatIsTitle", WHAT_IS_TITLE),
    ("whatIsContent", WHAT_IS_CONTENT),
    ("modelsTitle", MODELS_TITLE),
    ("modelsContent", MODELS_CONTENT),
    ("howTitle", HOW_TITLE),
    ("step1Title", STEP1_TITLE),
    ("step1Content", STEP1_CONTENT),
    ("step2Title", STEP2_TITLE),
    ("step2Content", STEP2_CONTENT),
    ("step3Title", STEP3_TITLE),
    ("step3Content", STEP3_CONTENT),
    ("step4Title", STEP4_TITLE),
    ("step4Content", STEP4_CONTENT),
    ("step5Title", STEP5_TITLE),
    ("step5Content", STEP5_CONTENT),
    ("toolsTitle", TOOLS_TITLE),
    ("toolsContent", TOOLS_CONTENT),
    ("challengesTitle", CHALLENGES_TITLE),
    ("challengesContent", CHALLENGES_CONTENT),
    ("curifyTitle", CURIFY_TITLE),
    ("curifyContent", CURIFY_CONTENT),
    ("conclusionTitle", CONCLUSION_TITLE),
    ("conclusionContent", CONCLUSION_CONTENT),
])


def upsert_blogs_json() -> None:
    path = REPO / "public" / "data" / "blogs.json"
    data = json.loads(path.read_text())
    data = [b for b in data if b.get("slug") != SLUG]
    data.insert(0, BLOG_ENTRY)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"✓ blogs.json — upserted {SLUG} at index 0")


def upsert_messages_json() -> None:
    path = REPO / "messages" / "en" / "blog.json"
    data = json.loads(path.read_text(), object_pairs_hook=OrderedDict)
    if KEY in data:
        del data[KEY]
    data[KEY] = MESSAGES_ENTRY
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    wc = sum(len(str(v).split()) for v in MESSAGES_ENTRY.values() if isinstance(v, str))
    print(f"✓ messages/en/blog.json — upserted {KEY}  (~{wc} words)")


if __name__ == "__main__":
    upsert_blogs_json()
    upsert_messages_json()
    print("\nNext:")
    print("  1. Edit blog-config.ts (namespaceMap + availableKeys)")
    print("  2. Edit blog-related-hubs.ts")
    print("  3. Run: node scripts/i18n_autotranslate.cjs --base en --files blog home --chunkSize 5 --write")
