#!/usr/bin/env python3
"""EN i18n for the 6 hongjie multi-branch templates (patch-2 x4, patch-7 x2), 2026-07-13.
Flat top-level keys into messages/en/nano.json; run i18n_autotranslate.cjs after."""
import json

EN = {
 "template-vintage-watercolor-hobby-sticker-sheet": {
  "category": "Vintage Watercolor Hobby Sticker Sheet",
  "description": "Generate a vintage watercolor sticker sheet themed around any hobby, with a headline banner and clipart set.",
  "title": "Nano Banana Prompt: Vintage Watercolor Hobby Sticker Sheet | Curify AI",
  "content": {"sections": {
   "what": "This template renders a vintage watercolor sticker sheet themed {hobby_theme}: a top headline banner plus a coordinated set of hand-painted clipart stickers for that hobby, on an aged-paper aesthetic.",
   "who": "Planner and journal makers, Etsy sticker sellers, hobby-brand creators, and craft communities.",
   "how": "Enter a hobby theme (name + subtitle + key objects). One click renders the sheet; swap hobbies to build a collection.",
   "prompts": "Try 'BAKING, subtitle Made With Love, baking tools & pastry clipart', 'GARDENING, subtitle Grow Your Joy, seedlings, trowel, watering can'."}}},
 "template-vintage-food-menu-scientific-sketch-illustration": {
  "category": "Vintage Food Menu Sketch Illustration",
  "description": "Turn any dish or menu theme into a vintage scientific-sketch food illustration poster.",
  "title": "Nano Banana Prompt: Vintage Food Menu Scientific Sketch Illustration | Curify AI",
  "content": {"sections": {
   "what": "This template renders a vintage scientific-sketch food illustration themed {food_theme}: dishes, ingredients and drinks drawn in a detailed hand-inked botanical/menu style with elegant labels.",
   "who": "Restaurants and cafes, menu designers, food bloggers, and culinary wall-art sellers.",
   "how": "Enter a dish or menu theme. One click renders the illustration; build a full menu series.",
   "prompts": "Try 'Cream seafood chowder with shrimp and mussels, citrus cocktail, coastal bistro menu sketch', 'Brunch spread — floral coffee, pastries, fruit plate'."}}},
 "template-clay-cute-3d-icon-grid-sheet": {
  "category": "Clay Cute 3D Icon Grid Sheet",
  "description": "Create a grid sheet of cute clay-style 3D icons for any theme.",
  "title": "Nano Banana Prompt: Clay Cute 3D Icon Grid Sheet | Curify AI",
  "content": {"sections": {
   "what": "This template renders a grid of cute soft-clay 3D icons themed {icon_theme}: a coordinated set of rounded, pastel claymation-style icons arranged in a clean grid.",
   "who": "App and UI designers, sticker and merch makers, content creators, and educators building themed icon sets.",
   "how": "Enter an icon theme and the objects to include. One click renders the grid; swap themes for more sets.",
   "prompts": "Try 'Office stationery clay icons — laptop, keyboard, printer, desk lamp, coffee mug', 'Gardening clay icons — seedling, trowel, watering can, flower pot'."}}},
 "template-surreal-macro-product-commercial-ad-poster": {
  "category": "Surreal Macro Product Ad Poster",
  "description": "Render a surreal macro-world commercial ad poster where a product becomes a tiny fantastical scene.",
  "title": "Nano Banana Prompt: Surreal Macro Product Commercial Ad Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a surreal macro-photography commercial poster themed {product_theme}: the product is reimagined as a miniature world (a watch dial as a swimming pool, etc.) that dramatizes a key feature.",
   "who": "Consumer-product brands, e-commerce sellers, and ad creatives who want a scroll-stopping hero visual.",
   "how": "Enter the product + the surreal scene that dramatizes its feature. One click renders the poster.",
   "prompts": "Try 'vivo round smartwatch, dial becomes a swimming pool, tiny swimmer, waterproof ad', 'coconut water bottle, jungle waterfall pouring from the cap'."}}},
 "template-9-grid-ecommerce-product-lifestyle-moodboard": {
  "category": "9-Grid E-commerce Product Moodboard",
  "description": "Build a 3x3 lifestyle moodboard that presents a product across nine on-brand scenes.",
  "title": "Nano Banana Prompt: 9-Grid E-commerce Product Lifestyle Moodboard | Curify AI",
  "content": {"sections": {
   "what": "This template renders a 3x3 lifestyle moodboard themed {product_name}: nine coordinated panels showing the product in aspirational use scenes, textures and details for a cohesive brand feed.",
   "who": "DTC and marketplace sellers, social-commerce managers, and brand designers building product feeds.",
   "how": "Enter the product name. One click renders the nine-panel moodboard; reuse across a catalog.",
   "prompts": "Try 'black semi-automatic espresso coffee machine', 'minimalist ceramic pour-over coffee set', 'linen bedding set in oatmeal'."}}},
 "template-football-f4-garden-romantic-academy-poster": {
  "category": "Football F4 Garden Academy Poster",
  "description": "Cast football stars as a romantic F4 garden-academy ensemble — group or solo character posters.",
  "title": "Nano Banana Prompt: Football F4 Garden Romantic Academy Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a romantic F4 garden-academy poster of football stars styled as elegant academy characters: {character_full_info}, in either a group ensemble or a solo character layout.",
   "who": "Football fan-content creators, fan-fiction and shipping communities, and sports-merch designers.",
   "how": "Choose group or solo poster mode, then enter the player line-up and personas. One click renders the poster.",
   "prompts": "Try mode 'Group ensemble cast poster' with 'full cast: Haaland The Ice Prince, Ronaldo The Eternal Star, Mbappé The Golden Boy'; or 'Solo individual character poster' with 'Erling Haaland, The Ice Prince'."}}},
}

def main():
    p = "messages/en/nano.json"
    d = json.load(open(p, encoding="utf-8"))
    for tid, entry in EN.items():
        d[tid] = entry
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"added {len(EN)} EN entries -> {p}")

if __name__ == "__main__":
    main()
