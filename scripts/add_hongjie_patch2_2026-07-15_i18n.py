# -*- coding: utf-8 -*-
"""EN i18n for the 6 hongjie patch-2 kids/cartoon English-learning-card templates, 2026-07-15."""
import json

EN = {
 "template-kids-bilingual-cartoon-learning-card": {
  "category": "Bilingual Cartoon Learning Card",
  "description": "Turn a favorite cartoon into a bilingual (English + Chinese) subtitle learning card for kids.",
  "title": "Nano Banana Prompt: Kids Bilingual Cartoon Learning Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a wide bilingual learning worksheet themed {cartoon_theme}: a matching scene illustration with a 10-line story subtitle table (English + Chinese) and a vocabulary tips box, framed by a decorative scroll border.",
   "who": "ESL / bilingual teachers, parents, and early-education content creators.",
   "how": "Enter a cartoon theme (title + scene + art style). One click renders the card; swap cartoons to build a series.",
   "prompts": "Try 'Peppa Pig, pig family jump muddy puddles, picture-book flat style', 'Havoc in Heaven, Sun Wukong fights heavenly soldiers, Chinese watercolor style'."}}},
 "template-cartoon-english-quiz-learning-card": {
  "category": "Cartoon English Quiz Card",
  "description": "Make a cartoon-themed English quiz learning card from any kids' cartoon IP.",
  "title": "Nano Banana Prompt: Cartoon English Quiz Learning Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a cartoon-themed English quiz card themed {cartoon_ip_theme}: illustrated question items and answer choices built around the cartoon's story and characters, in a playful kid-friendly layout.",
   "who": "ESL teachers, tutoring platforms, and parents building fun English practice for kids.",
   "how": "Enter the cartoon IP + scene. One click renders the quiz card; vary the IP for a quiz set.",
   "prompts": "Try 'The Three Little Pigs, straw/wood/brick houses vs big bad wolf', 'Calabash Brothers, seven gourd brothers fight the snake demon'."}}},
 "template-cartoon-english-wordcard-learning-card": {
  "category": "Cartoon English Word Card",
  "description": "Generate a cartoon-themed English vocabulary word card for young learners.",
  "title": "Nano Banana Prompt: Cartoon English Word Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a cartoon-themed vocabulary word card themed {cartoon_ip_theme}: a scene illustration paired with a themed English word list (with meanings) drawn from the cartoon's story.",
   "who": "ESL / vocabulary teachers, parents, and kids' English content creators.",
   "how": "Enter the cartoon IP + a word list. One click renders the word card; build a vocabulary series.",
   "prompts": "Try 'Calabash Brothers — gourd, brother, mountain, rescue, demon, brave', 'Black Cat Detective — police, forest, guard, chase, clever'."}}},
 "template-cartoon-mini-script-learning-card": {
  "category": "Cartoon Mini-Script Learning Card",
  "description": "Create a cartoon mini-script (dialogue) card kids can read aloud and role-play in English.",
  "title": "Nano Banana Prompt: Cartoon Mini-Script Learning Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a cartoon mini-script learning card themed {cartoon_ip_theme}: a short scripted scene with a character list, English dialogue lines and acting tips, so kids can read aloud and role-play.",
   "who": "ESL / drama teachers, tutoring platforms, and parents doing read-aloud practice.",
   "how": "Enter the cartoon IP + scene + character list. One click renders the script card.",
   "prompts": "Try 'Black Cat Detective — chasing the grain-thief rats in the forest', 'Havoc in Heaven — Sun Wukong storms the Heavenly Palace'."}}},
 "template-kids-english-phonics-sentence-flashcard": {
  "category": "Kids English Phonics & Sentence Flashcard",
  "description": "Build a preschool English phonics or theme-sentence flashcard (printable worksheet).",
  "title": "Nano Banana Prompt: Kids English Phonics & Sentence Flashcard | Curify AI",
  "content": {"sections": {
   "what": "This template renders a printable preschool flashcard themed {flashcard_custom_info}: an alphabet-phonics card (letter + example words) or a theme-sentence card (sentence + highlight word + picture), in a clean 2-row + bottom-4 layout.",
   "who": "Preschool and early-ESL teachers, parents, and homeschool educators.",
   "how": "Enter the mode and content — 'Alphabet Phonics | Letter Dd | dog | duck, doll, drum, desk' or 'Theme Sentence | I see a pink … | pink'. One click renders the flashcard.",
   "prompts": "Try 'Mode 1 Alphabet Phonics | Letter Dd | dog | duck, doll, drum, desk', 'Mode 2 Theme Sentence | I like to play | play'."}}},
 "template-cartoon-character-map-learning-card": {
  "category": "Cartoon Character Map Learning Card",
  "description": "Make a cartoon character relationship map that teaches characters and their relations in English.",
  "title": "Nano Banana Prompt: Cartoon Character Map Learning Card | Curify AI",
  "content": {"sections": {
   "what": "This template renders a cartoon character-relationship map themed {cartoon_ip_theme}: 3 core characters with their traits and relationships, plus a story-focus sentence, on a themed scene background.",
   "who": "ESL / reading teachers, parents, and kids' story-comprehension content creators.",
   "how": "Enter the cartoon IP, the characters and their relations. One click renders the character map.",
   "prompts": "Try 'Havoc in Heaven — Jade Emperor, Sun Wukong, Erlang Shen', 'Three Little Pigs — three pigs and the big bad wolf'."}}},
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
