#!/usr/bin/env python3
"""Add EN i18n for the 11 hongjie multi-branch templates (patch-2/4/5/6), 2026-07-09.
Writes FLAT top-level keys into messages/en/nano.json (template id = direct key).
Run i18n_autotranslate.cjs --base en --files nano --write afterwards to fill the
other 9 locales (it translates only-missing keys)."""
import json, os

EN = {
 "template-vietnam-traditional-handicraft-village-curved-wave-art-poster": {
  "category": "Vietnam Handicraft Village Art Poster",
  "description": "Turn any Vietnamese traditional-handicraft village theme into a curved-wave 3D micro-scene cultural art poster.",
  "title": "Nano Banana Prompt: Vietnam Traditional Handicraft Village Art Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a vertical cultural art poster themed {vietnamese_handicraft_theme}: a Vietnamese traditional-handicraft village (lacquerware, brass instruments, bamboo weaving, …) as a curved-wave 3D miniature scene with rich, dark, textured styling.",
   "who": "Culture and heritage publishers, Vietnam travel and craft brands, museum shops, and creators building regional-craft content series.",
   "how": "Enter a craft-village theme (village name + craft + style cue). One click renders the poster; swap the theme to build a full handicraft-village series.",
   "prompts": "Try 'Phạm Pháo brass instrument handicraft village 3D realistic cultural poster', 'Cát Đằng bamboo-core lacquerware village spiral-wave miniature scene art poster'."}}},
 "template-mechanical-keycap-mini-diorama-3d-art-poster": {
  "category": "Keycap Micro-Diorama 3D Art Poster",
  "description": "Generate a mechanical-keycap micro-diorama — a tiny 3D world built inside a single keycap.",
  "title": "Nano Banana Prompt: Mechanical Keycap Mini Diorama 3D Art Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a macro 3D-illustration poster themed {diorama_scene_theme}: a transparent mechanical keycap containing a tiny detailed diorama (a programmer's cyber hut, a cozy bedroom, …) in miniature-figurine style.",
   "who": "Mechanical-keyboard and desk-setup brands, tech creators, and merch designers making collectible keycap art.",
   "how": "Enter a keycap + scene theme. One click renders the micro-diorama poster; vary the scene to build a keycap collection.",
   "prompts": "Try 'ESC keycap transparent shell, programmer coding late at night in a cyber micro-hut, 3D macro illustration', 'ENTER keycap hacker server-room miniature scene realistic render'."}}},
 "template-one-piece-valentine-flat-magazine-character-card-poster": {
  "category": "One Piece Valentine Character Card",
  "description": "Create a flat magazine-style Valentine collectible character card for a One Piece hero.",
  "title": "Nano Banana Prompt: One Piece Valentine Flat Magazine Character Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a vertical flat magazine-style collectible character card themed {one_piece_character_name}: a One Piece character in a Valentine's theme (heart motifs, gifts, trendy flat illustration).",
   "who": "Anime fan-content creators, sticker and card sellers, and Valentine-campaign designers.",
   "how": "Enter the character + Valentine styling. One click renders the card; swap characters to build a set.",
   "prompts": "Try 'Monkey D. Luffy red-ribbon gift Valentine minimalist illustration poster', 'Nami One Piece Valentine trendy flat character card'."}}},
 "template-amazon-product-six-grid-infographic-listing-poster": {
  "category": "Amazon Six-Grid Listing Infographic",
  "description": "Build a six-grid Amazon main-image / listing infographic that sells a product's features at a glance.",
  "title": "Nano Banana Prompt: Amazon Product Six-Grid Listing Infographic | Curify AI",
  "content": {"sections": {
   "what": "This template renders an Amazon-style six-grid product detail board themed {product_full_name}: six feature panels highlighting benefits, specs and use scenes in a clean e-commerce listing layout.",
   "who": "Amazon and DTC sellers, e-commerce operators, and product-marketing designers.",
   "how": "Enter the full product name + key selling points. One click renders the six-grid board; reuse across a catalog.",
   "prompts": "Try 'BlendLife pink portable rechargeable juicer cup Amazon six-grid detail board', 'ANC wireless earbuds six-panel feature infographic listing image'."}}},
 "template-micro-worker-big-smartphone-ecommerce-store-3d-art-poster": {
  "category": "Micro-Worker Giant Smartphone E-commerce 3D",
  "description": "Render a surreal 3D ad: tiny craftsman workers building a brand's online store on a giant smartphone.",
  "title": "Nano Banana Prompt: Micro-Worker Big Smartphone E-commerce 3D Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a hyper-real 3D commercial poster themed {brand_store_theme}: miniature worker figures constructing a brand's online storefront on and around a giant smartphone.",
   "who": "E-commerce brands, marketplace sellers, and agency creatives who want a scroll-stopping store-launch visual.",
   "how": "Enter the brand + store theme. One click renders the surreal 3D scene; swap brands for campaign variants.",
   "prompts": "Try 'LV luxury online mall giant smartphone miniature craftsman 3D surreal commercial poster', 'Nike sportswear e-commerce page micro-worker realistic render'."}}},
 "template-einstein-character-russian-product-ad-poster": {
  "category": "Einstein Russian Product Ad Poster",
  "description": "Create a Russian-language e-commerce ad poster featuring an Einstein-style character endorsing a product.",
  "title": "Nano Banana Prompt: Einstein Character Russian Product Ad Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a Russian-language product advertisement poster themed {russian_product_theme}: an Einstein-style character presenting the product with bold retail styling and Cyrillic copy.",
   "who": "Sellers targeting Russian-speaking markets, cross-border e-commerce operators, and ad designers.",
   "how": "Enter the product + Russian ad theme. One click renders the ad poster; reuse across a product line.",
   "prompts": "Try '925 silver vintage punk ring set Russian e-commerce Einstein character ad poster', 'hair curling wand Russian retail Einstein endorsement poster'."}}},
 "template-bilingual-chinese-vocabulary-word-card-poster": {
  "category": "Bilingual Chinese Vocabulary Word Card",
  "description": "Generate a bilingual Chinese vocabulary word card with pinyin, character and English meaning.",
  "title": "Nano Banana Prompt: Bilingual Chinese Vocabulary Word Card Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders a bilingual vocabulary word card themed {chinese_vocab_word}: the Chinese word with pinyin on top, the character in a grid box, and the English meaning, in a clean study-card layout.",
   "who": "Chinese-language teachers, ESL/CSL tutors, and parents building bilingual flashcard sets.",
   "how": "Enter a word as 'character pinyin English'. One click renders the card; batch words into a deck.",
   "prompts": "Try '时间 shíjiān time', '朋友 péngyou friend', '学校 xuéxiào school'."}}},
 "template-hsk-bilingual-reading-text-lesson-poster": {
  "category": "HSK Bilingual Reading Lesson Poster",
  "description": "Create an HSK-leveled bilingual reading worksheet poster from any short story or topic.",
  "title": "Nano Banana Prompt: HSK Bilingual Reading Text Lesson Poster | Curify AI",
  "content": {"sections": {
   "what": "This template renders an HSK-leveled bilingual reading lesson poster themed {hsk_article_title}: a short graded Chinese reading passage with English support, formatted as a classroom worksheet.",
   "who": "HSK and Chinese-language teachers, tutoring platforms, and self-study learners.",
   "how": "Enter the HSK level + article title/topic. One click renders the reading worksheet; build a leveled library.",
   "prompts": "Try 'HSK1 A Day at School reading worksheet', 'HSK3 Snow White and the Seven Dwarfs graded reader', 'HSK4 The Boy Who Cried Wolf'."}}},
 "template-vintage-classic-novel-book-summary-infographic-poster": {
  "category": "Vintage Classic Novel Summary Infographic",
  "description": "Turn a classic novel into a vintage book-summary infographic poster.",
  "title": "Nano Banana Prompt: Vintage Classic Novel Book Summary Infographic | Curify AI",
  "content": {"sections": {
   "what": "This template renders a vintage-styled book-summary infographic themed {novel_full_title}: key characters, themes, plot arc and takeaways of a classic novel in an elegant retro editorial layout.",
   "who": "Book clubs, English-literature teachers, study-guide creators, and reading-content publishers.",
   "how": "Enter the novel title + author. One click renders the summary poster; build a classics series.",
   "prompts": "Try 'Anne of Green Gables by L.M. Montgomery vintage novel summary infographic', 'The Old Man and the Sea by Ernest Hemingway book summary poster'."}}},
 "template-3d-chibi-football-player-turnaround-sheet": {
  "category": "3D Chibi Football Player Turnaround",
  "description": "Generate a Pixar-style 3D chibi football-figurine turnaround sheet (front, side, back) for any player.",
  "title": "Nano Banana Prompt: 3D Chibi Football Player Turnaround Sheet | Curify AI",
  "content": {"sections": {
   "what": "This template renders a clean three-view turnaround sheet of a Pixar-style chibi figurine for footballer {player_name} in jersey {jersey_number}: front, side and back views in full national-team kit on a white background.",
   "who": "Football fan-merch designers, collectible-figure makers, and sports content creators.",
   "how": "Enter the player + national-team kit and jersey number. One click renders the turnaround; swap players for a squad set.",
   "prompts": "Try player_name 'Neymar, Brazil national team yellow home kit' + jersey_number '10'; 'Erling Haaland, Norway red home kit' + '9'."}}},
 "template-chinese-compound-word-literacy-cartoon": {
  "category": "Chinese Compound Word Literacy Cartoon",
  "description": "Teach a Chinese two-character compound word with a cute character + character = word cartoon.",
  "title": "Nano Banana Prompt: Chinese Compound Word Literacy Cartoon | Curify AI",
  "content": {"sections": {
   "what": "This template renders a cute pastel literacy cartoon themed {compound_word_info}: left illustration for the first character + middle illustration for the second + right illustration for the compound word, each with pinyin, character grid and English meaning.",
   "who": "Preschool and primary Chinese teachers, bilingual parents, and early-literacy content creators.",
   "how": "Enter the word set as 'char1(pinyin,meaning,hint) + char2(...) + compound(...)'. One click renders the card; build a literacy series.",
   "prompts": "Try '海(hǎi,sea,waves) + 豚(tún,pig,pig) + 海豚(hǎi tún,dolphin,dolphin)', '熊(xióng,bear) + 猫(māo,cat) + 熊猫(xióng māo,panda)'."}}},
}

def main():
    p = "messages/en/nano.json"
    d = json.load(open(p, encoding="utf-8"))
    added = 0
    for tid, entry in EN.items():
        d[tid] = entry  # FLAT top-level key (mirrors add_4_new_templates_i18n.py)
        added += 1
    json.dump(d, open(p, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"added {added} EN entries -> {p}")

if __name__ == "__main__":
    main()
