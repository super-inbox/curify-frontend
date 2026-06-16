"""Append i18n entries for 10 new templates from a multi-branch hongjie drop
(2026-06-16): hongjie28-patch-5 (6 templates) + hongjie28-patch-4 (1) +
hongjie28-patch-2 (3).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-classical-famous-painting-analysis-cartoon-infographic",
    "template-chikawa-monthly-calendar-vertical-poster",
    "template-historical-figure-biography-vintage-infographic",
    "template-musical-instrument-technical-infographic-poster",
    "template-kawaii-cartoon-ip-profile-grid-infographic",
    "template-exam-vocabulary-two-column-list-poster",
    "template-health-tips-six-method-cartoon-poster",
    "template-kid-friendly-grid-fun-fact-infographic",
    "template-nature-ecology-double-page-book-spread-infographic",
    "template-classic-spirits-cocktail-recipe-grid-poster",
]

EN = {
    "template-classical-famous-painting-analysis-cartoon-infographic": {
        "category": "Classical Famous Painting Analysis Cartoon Infographic",
        "description": "Generate a vertical art-appreciation infographic poster — soft aged cream paper background, central painting reproduction, cartoon-style annotations explaining composition, symbolism, era, and technique.",
        "title": "Nano Banana Prompt: Classical Painting Analysis Cartoon Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K art-appreciation infographic poster. Soft aged cream paper texture background. Central faithful reproduction of the painting subject (Mona Lisa / The Starry Night / Las Meninas / etc.), framed in a thin gold border. Surrounding the painting: cartoon-style annotation callouts pointing to composition focal points, symbolism, color theory, brushwork technique, and historical context. Side panels: artist mini-portrait + name + dates + movement label; bottom: timeline placement. Print-quality educational poster aesthetic.",
            "who": "Suitable for art teachers producing classroom posters, museum gift shops, art-history content creators, parents homeschooling art appreciation, and design students studying visual literacy.",
            "how": [
                "Enter painting + analysis focus in {painting_full_info} (e.g. 'Vermeer Girl with a Pearl Earring composition + light analysis').",
                "Aged cream paper texture + central painting reproduction auto-render.",
                "Cartoon callouts + side panels auto-compose.",
                "Generate a vertical 8K classical painting analysis infographic."
            ],
            "prompts": [
                "Generate a Mona Lisa composition + smile analysis cartoon infographic.",
                "Create a Van Gogh Starry Night brushwork analysis poster.",
                "Generate a Las Meninas symbolism breakdown educational poster."
            ]
        }},
    },
    "template-chikawa-monthly-calendar-vertical-poster": {
        "category": "Chiikawa Monthly Calendar Vertical Poster",
        "description": "Generate a vertical Chiikawa-style monthly calendar wallpaper — soft pastel background, large cute character illustration on top half, clean calendar grid below for the chosen month.",
        "title": "Nano Banana Prompt: Chiikawa Monthly Calendar Vertical Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K Chiikawa-style monthly calendar wallpaper. Solid soft pastel color background (different per month — March pink, July sky-blue, December warm beige, etc.). Top half features an oversized cute Chiikawa-style character illustration referencing the season (cherry-blossom Chiikawa, summer-festival Chiikawa, snow-day Chiikawa). Bottom half: clean white calendar grid for the chosen month with weekday headers and date numbers in a friendly rounded font. Print-ready phone-wallpaper and wall-poster sizes.",
            "who": "Suitable for Chiikawa fans, kawaii content creators, anime-merch designers, planner-stickers makers, and parents building cute-themed monthly reset rituals.",
            "how": [
                "Enter year + month + seasonal theme in {calendar_theme_info} (e.g. 'July 2026 summer-festival Chiikawa').",
                "Soft pastel background + giant cute Chiikawa illustration auto-render.",
                "Clean calendar grid auto-compose for the month.",
                "Generate a vertical 8K Chiikawa monthly calendar poster."
            ],
            "prompts": [
                "Generate a July 2026 summer-festival Chiikawa calendar poster.",
                "Create a March 2026 cherry-blossom Chiikawa wallpaper.",
                "Generate a December 2026 cozy holiday Chiikawa calendar."
            ]
        }},
    },
    "template-historical-figure-biography-vintage-infographic": {
        "category": "Historical Figure Biography Vintage Infographic",
        "description": "Generate a vertical vintage biography infographic — antique parchment background, central historical-figure portrait, timeline of key life events, signature accomplishments, and era context.",
        "title": "Nano Banana Prompt: Historical Figure Biography Vintage Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage biography infographic poster. Aged-parchment textured background. Central illustrated portrait of the historical figure in period-appropriate dress. Surrounding panels: birth/death dates, vertical timeline of 5-7 key life events with year markers, signature accomplishments / quotes, era + nationality + field labels, geographic map showing places lived. Antique-document aesthetic with sepia palette, serif typography, and hand-drawn decorative flourishes.",
            "who": "Suitable for history teachers building classroom material, history-podcast content creators, museum educators, students producing biography projects, and history-themed Etsy listing producers.",
            "how": [
                "Enter figure + biographical focus in {figure_full_info} (e.g. 'Marie Curie scientific achievements timeline').",
                "Antique parchment background + central illustrated portrait auto-render.",
                "Timeline + accomplishments panels auto-compose around the portrait.",
                "Generate a vertical 8K historical figure biography infographic."
            ],
            "prompts": [
                "Generate a Marie Curie biography timeline poster.",
                "Create a Leonardo da Vinci polymath achievements infographic.",
                "Generate a Frederick Douglass biographical vintage poster."
            ]
        }},
    },
    "template-musical-instrument-technical-infographic-poster": {
        "category": "Musical Instrument Technical Infographic Poster",
        "description": "Generate a vertical educational poster for any musical instrument — diagram with named parts, history & origin paragraph, common genres, playing technique callouts, famous players.",
        "title": "Nano Banana Prompt: Musical Instrument Technical Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K educational musical-instrument infographic poster. Stylized bold headline title at top. Central detailed instrument illustration (guitar / saxophone / violin / etc.) with numbered annotation pointers to anatomy parts (fretboard, bridge, soundhole, valves, reed, tuning pegs, etc.) plus a labeled key. Side panels: history & origin, common genres, signature playing techniques, and famous players. Music-classroom-poster aesthetic.",
            "who": "Suitable for music teachers, music-school decor, instrument-store displays, music-history content creators, music-streaming visual content, and beginner-instrument-buyer guide makers.",
            "how": [
                "Enter instrument + focus angle in {instrument_name_topic} (e.g. 'Fender Stratocaster electric guitar anatomy + tone').",
                "Detailed instrument illustration auto-renders with anatomy callouts.",
                "History / genre / technique panels auto-compose.",
                "Generate a vertical 8K musical instrument educational infographic."
            ],
            "prompts": [
                "Generate a Fender Stratocaster anatomy and tone poster.",
                "Create a saxophone history + genres + jazz techniques infographic.",
                "Generate a classical violin parts + bow technique educational poster."
            ]
        }},
    },
    "template-kawaii-cartoon-ip-profile-grid-infographic": {
        "category": "Kawaii Cartoon IP Profile Grid Infographic",
        "description": "Generate a vertical kawaii IP-character profile poster — soft cream background, oversized hand-drawn character introduction, grid of attribute cards (likes, dislikes, friends, favorite food, etc.).",
        "title": "Nano Banana Prompt: Kawaii Cartoon IP Profile Grid Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K kawaii IP-character profile infographic poster. Soft cream background. Top: oversized hand-drawn cute character introduction with sparkly eyes + signature pose. Below: a 2x3 (or 3x2) grid of mini-cards each illustrating one attribute — likes, dislikes, signature catchphrase, best friend, favorite food, hobby, lucky number, birthday — each rendered with a tiny themed icon. Subtle decorative stars, hearts, and confetti throughout. Phone-wallpaper-ready.",
            "who": "Suitable for kawaii IP creators introducing original characters (OCs), VTuber / streamer character profile cards, plushie / sticker brand product introductions, fan-art communities, and kids' party invitations.",
            "how": [
                "Enter character + theme in {ip_character_theme} (e.g. 'Miffy bunny Korean-coffee-shop intro card').",
                "Soft cream background + oversized hand-drawn character auto-render.",
                "Attribute grid cards auto-compose with themed icons.",
                "Generate a vertical 8K kawaii IP profile grid infographic."
            ],
            "prompts": [
                "Generate a Miffy Korean coffee-shop intro profile poster.",
                "Create an original kawaii bear OC profile grid card.",
                "Generate a Sanrio-style cat character introduction poster."
            ]
        }},
    },
    "template-exam-vocabulary-two-column-list-poster": {
        "category": "Exam Core Vocabulary Two-Column List Poster",
        "description": "Generate a vertical exam vocabulary cheat-sheet poster — two-column list of essential terms with example sentences, mnemonic visual icons, and key word highlights.",
        "title": "Nano Banana Prompt: Exam Vocabulary Two-Column List Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K exam-vocabulary reference poster. Solid soft single-color background. Huge bold centered title naming the exam + topic. Below: two parallel columns of essential vocabulary terms. Each entry: word + part of speech + clear definition + short example sentence + tiny mnemonic illustration. Color-coded highlights for the word, color-coded part-of-speech tags. Print-ready dorm-room study-poster aesthetic.",
            "who": "Suitable for SAT / IELTS / TOEFL / GRE / AP exam prep, university study-group makers, language-learning content creators, tutor produced reference handouts, and parents helping kids study.",
            "how": [
                "Enter exam + topic in {vocab_topic_info} (e.g. 'IELTS academic 30 high-frequency adjectives').",
                "Solid soft background + bold centered title auto-render.",
                "Two-column vocab list with mnemonic icons auto-compose.",
                "Generate a vertical 8K exam vocabulary cheat-sheet poster."
            ],
            "prompts": [
                "Generate an IELTS academic 30 adjectives cheat-sheet.",
                "Create an SAT essential 50 verbs two-column reference poster.",
                "Generate a TOEFL writing transition phrases study poster."
            ]
        }},
    },
    "template-health-tips-six-method-cartoon-poster": {
        "category": "Health Tips Six-Method Cartoon Poster",
        "description": "Generate a vertical health-tips popular-science poster — large bold title, central cartoon character demonstrating each tip, 6 numbered method cards with icon + short description.",
        "title": "Nano Banana Prompt: Health Tips Six-Method Cartoon Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K health-tips popular-science poster. Oversized bold hand-drawn main title at top. Central friendly cartoon character (doctor / nurse / cute animal mascot) demonstrating the wellness topic. 6 numbered method cards arranged in a 2x3 or 3x2 grid, each with a themed icon and a 1-2 sentence actionable tip. Soft pastel palette, hand-drawn outline style, magazine-health-section aesthetic.",
            "who": "Suitable for clinic / pharmacy / hospital waiting-room posters, health-coach social-media content, employee-wellness program materials, school-nurse classroom displays, and parents teaching kids healthy habits.",
            "how": [
                "Enter health topic in {health_topic_info} (e.g. 'six ways to lower blood pressure naturally').",
                "Bold hand-drawn title + central cartoon character auto-render.",
                "6 numbered method cards auto-compose with icons.",
                "Generate a vertical 8K health tips six-method poster."
            ],
            "prompts": [
                "Generate a 'six ways to lower blood pressure naturally' poster.",
                "Create a 'six tips for better sleep tonight' cartoon poster.",
                "Generate a 'six daily moves for back pain relief' health poster."
            ]
        }},
    },
    "template-kid-friendly-grid-fun-fact-infographic": {
        "category": "Kid-Friendly Grid Fun-Fact Infographic",
        "description": "Generate a vertical kids' science-popularization fact poster — eye-catching title, 4-column grid of fun facts each with cute illustration + short surprising fact.",
        "title": "Nano Banana Prompt: Kid-Friendly Grid Fun-Fact Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K kids-educational fun-fact infographic. Large eye-catching playful title at top. Below: neatly arranged 4-column (or 2x4 / 3x4) grid of fun-fact cards. Each card: a cute hand-drawn illustration + a 1-2 sentence surprising fact in kid-readable wording. Soft rainbow palette, big rounded fonts, friendly sticker-like card borders. Designed for classroom walls, kids-bedroom posters, and family-fridge magnets.",
            "who": "Suitable for elementary teachers, parents teaching curious kids, kids-content YouTube channels, children's museum signage, and learning-app marketing materials.",
            "how": [
                "Enter fun-fact topic in {fun_fact_topic} (e.g. '10 surprising facts about dinosaurs for kids').",
                "Playful title + 4-column card grid auto-render.",
                "Cute illustrations + kid-readable wording auto-compose.",
                "Generate a vertical 8K kid-friendly grid fun-fact infographic."
            ],
            "prompts": [
                "Generate a 'surprising dinosaur facts for kids' grid infographic.",
                "Create a 'fun facts about the human body' kids poster.",
                "Generate a 'weird ocean creatures' fun-fact grid for kids."
            ]
        }},
    },
    "template-nature-ecology-double-page-book-spread-infographic": {
        "category": "Nature Ecology Double-Page Book Spread Infographic",
        "description": "Generate a horizontal two-page children's nature science textbook spread — illustrated ecosystem diagram across both pages, labeled species, food-chain arrows, and short educational text blocks.",
        "title": "Nano Banana Prompt: Nature Ecology Double-Page Book Spread Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal 8K two-page children's nature-science textbook spread. Double-page layout: left page often features a habitat overview illustration with labeled species, right page shows food-chain arrows + close-up species portraits + 2-3 short educational text blocks. Hand-drawn watercolor-illustration style with soft naturalistic palette, ecology-textbook aesthetic. Designed for use in children's books, classroom posters, or printable homeschool handouts.",
            "who": "Suitable for homeschool parents, biology / ecology teachers, kids' book illustrators producing nature spreads, science-museum educators, and nature-themed brand content creators.",
            "how": [
                "Enter ecosystem topic in {ecology_topic_info} (e.g. 'rainforest canopy ecosystem for kids').",
                "Habitat overview + food-chain arrows auto-render across both pages.",
                "Species portraits + educational text blocks auto-compose.",
                "Generate a horizontal 8K ecology double-page book spread."
            ],
            "prompts": [
                "Generate a 'rainforest canopy ecosystem' kids book spread.",
                "Create a 'coral reef food chain' double-page nature infographic.",
                "Generate a 'wetland ecosystem species' children's book spread."
            ]
        }},
    },
    "template-classic-spirits-cocktail-recipe-grid-poster": {
        "category": "Classic Spirits Cocktail Recipe Grid Poster",
        "description": "Generate a vertical bartender cocktail recipe poster organized by base spirit — decorative title, grid of recipe cards each with ingredient list, garnish illustration, and prep notes.",
        "title": "Nano Banana Prompt: Classic Spirits Cocktail Recipe Grid Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K bartender cocktail-recipe infographic poster organized by base spirit (gin / vodka / rum / whiskey / tequila / mezcal). Huge decorative main title at top. Below: a grid of recipe cards (typically 6-9 cocktails per poster). Each card: cocktail name + glass-type icon + ingredient list with measurements + tiny illustrated garnish + 1-line prep note. Vintage menu-board aesthetic with serif typography, copper / amber palette, and decorative dividers between cards.",
            "who": "Suitable for cocktail bars / speakeasies producing menu wall-art, home-bar enthusiasts, bartending-school students, recipe-content creators, and gift-shop print listings.",
            "how": [
                "Enter base spirit + style in {base_spirit_info} (e.g. 'gin classic cocktails recipe grid poster').",
                "Decorative title + vintage menu-board background auto-render.",
                "Recipe cards with ingredients + garnish + prep notes auto-compose.",
                "Generate a vertical 8K cocktail recipe grid poster."
            ],
            "prompts": [
                "Generate a 'classic gin cocktails recipe grid' poster.",
                "Create a 'whiskey cocktails 6-recipe' bartender poster.",
                "Generate a 'mezcal cocktail recipe grid' speakeasy menu poster."
            ]
        }},
    },
}

# Map zh ← reuse EN if no specialized ZH; daily-drop pattern.
ZH = {tid: EN[tid] for tid in template_ids}

def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}
    for locale, content in by_locale.items():
        missing = [tid for tid in template_ids if tid not in content]
        if missing:
            raise SystemExit(f"FAIL: locale {locale} missing {missing}")
    total = 0
    for locale in LOCALES:
        p = MESSAGES / locale / "nano.json"
        if not p.exists():
            print(f"  SKIP (missing): {p}"); continue
        doc = json.loads(p.read_text(encoding="utf-8"))
        added = 0
        for tid in template_ids:
            if tid in doc:
                print(f"  ({locale}) already has {tid}, skipping"); continue
            doc[tid] = by_locale[locale][tid]
            added += 1; total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added}")
    print(f"\nDone. Added {total} ({len(template_ids)} × {len(LOCALES)}).")


if __name__ == "__main__":
    main()
