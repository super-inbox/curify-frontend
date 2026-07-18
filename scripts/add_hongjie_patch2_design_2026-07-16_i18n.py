# -*- coding: utf-8 -*-
"""EN i18n for the 3 hongjie patch-2 design-presentation templates, 2026-07-16."""
import json
EN = {
 "template-minimalist-product-design-presentation-board": {
  "category": "Minimalist Product Design Board",
  "description": "Turn a product concept into a clean minimalist product-design presentation board.",
  "title": "Nano Banana Prompt: Minimalist Product Design Presentation Board | Curify AI",
  "content": {"sections": {
   "what": "This template renders a minimalist product-design presentation board themed {product_design_info}: a fixed multi-module layout with a hero product render, design-inspiration notes, feature callouts, materials/colorways and specs in a clean editorial grid.",
   "who": "Product and industrial designers, hardware startups, agencies, and design students building pitch/portfolio boards.",
   "how": "Enter the product name + design story (inspiration, key features, materials). One click renders the board.",
   "prompts": "Try 'WAVE Portable Speaker, coastal fluid-curve inspiration, fabric + aluminum', 'AURA Smart Lamp, minimalist Scandinavian concept'."}}},
 "template-interior-design-moodboard": {
  "category": "Interior Design Moodboard",
  "description": "Generate a styled interior-design moodboard for any space and aesthetic.",
  "title": "Nano Banana Prompt: Interior Design Moodboard | Curify AI",
  "content": {"sections": {
   "what": "This template renders an interior-design moodboard themed {interior_style_theme}: a coordinated board with room render, material and finish swatches, color palette, furniture and decor references, and style notes.",
   "who": "Interior designers, home stagers, renovation clients, and decor content creators.",
   "how": "Enter the space + style (e.g. 'Japandi living room', 'modern charcoal luxury residence'). One click renders the moodboard.",
   "prompts": "Try 'Modern Luxury Charcoal Residence, dark elegant palette', 'Japandi living room, warm wood + linen', 'Coastal minimalist bedroom'."}}},
 "template-industrial-design-product-presentation-board": {
  "category": "Industrial Design Presentation Board",
  "description": "Create an industrial-design product presentation board with renders, callouts and specs.",
  "title": "Nano Banana Prompt: Industrial Design Product Presentation Board | Curify AI",
  "content": {"sections": {
   "what": "This template renders an industrial-design product presentation board themed {product_design_param}: hero render plus tagline, feature/benefit callouts, usage scenes, dimensions and material specs in a polished product-marketing layout.",
   "who": "Industrial designers, DTC and hardware brands, crowdfunding creators, and design agencies.",
   "how": "Enter the product name, tagline and key features. One click renders the presentation board.",
   "prompts": "Try 'PORTABLE BLENDER BOTTLE, Portable. Powerful. Fresh.', 'Ergonomic Office Chair, all-day comfort'."}}},
}
def main():
    p="messages/en/nano.json"; d=json.load(open(p,encoding="utf-8"))
    for tid,e in EN.items(): d[tid]=e
    json.dump(d,open(p,"w",encoding="utf-8"),ensure_ascii=False,indent=2)
    print(f"added {len(EN)} EN entries -> {p}")
if __name__=="__main__": main()
