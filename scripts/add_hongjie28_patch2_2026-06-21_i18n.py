"""i18n for 3 new templates from hongjie28-patch-2 (2026-06-21 push)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = [
    "template-anime-crew-vintage-newspaper-character-infographic-poster",
    "template-kids-origami-step-tutorial-infographic-poster",
    "template-vintage-fruit-market-label-poster",
]

EN = {
    "template-anime-crew-vintage-newspaper-character-infographic-poster": {
        "category": "Anime Crew Vintage Newspaper Character Infographic Poster",
        "description": "Generate a vintage newspaper-style anime crew infographic poster — full crew lineup with character profile panels, faction insignia, and aged-paper masthead aesthetic.",
        "title": "Nano Banana Prompt: Anime Crew Vintage Newspaper Character Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage newspaper-style anime crew infographic poster. Aged sepia paper texture, bold masthead title with anime name + crew designation, full-body crew lineup hero illustration at top, multi-column character profile panels with name + role + signature ability, faction insignia + small action vignettes, classified-ad / breaking-news typographic decorations. Authentic vintage newspaper layout.",
            "who": "Suitable for anime fan-art creators, fandom merchandise designers, manga publishing fan zines, anime convention poster sellers, and bias wall decor makers.",
            "how": [
                "Enter the anime + crew designation (e.g. 'One Piece Straw Hat Pirates').",
                "Vintage newspaper layout + crew lineup + profile panels auto-compose.",
                "Generate a vertical 8K anime crew newspaper infographic poster."
            ],
            "prompts": [
                "Generate a One Piece Straw Hat Pirates newspaper poster.",
                "Create a Naruto Shinobi World crew infographic.",
                "Generate an Attack on Titan Survey Corps vintage newspaper poster."
            ]
        }},
    },
    "template-kids-origami-step-tutorial-infographic-poster": {
        "category": "Kids Origami Step Tutorial Infographic Poster",
        "description": "Generate a vertical kids origami step-by-step tutorial poster — numbered folding diagrams with arrows, kawaii final result, paper-craft aesthetic.",
        "title": "Nano Banana Prompt: Kids Origami Step Tutorial Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K kids origami step-by-step tutorial infographic poster. Bright pastel paper-craft background, numbered sequential fold diagrams with dashed-line + arrow indicators, kawaii cartoon hand-drawn callouts, large final result illustration at bottom, materials list + difficulty badge. Cute-classroom poster aesthetic.",
            "who": "Suitable for parents, primary-school teachers, craft-class instructors, kids-activity bloggers, and homeschool curriculum publishers.",
            "how": [
                "Enter the origami subject (e.g. 'paper boat' or 'origami crane').",
                "Numbered fold diagrams + arrows + final result + materials list auto-compose.",
                "Generate a vertical 8K kids origami step tutorial poster."
            ],
            "prompts": [
                "Generate a paper boat origami step tutorial poster.",
                "Create an origami crane folding tutorial infographic.",
                "Generate a jumping frog origami step-by-step poster."
            ]
        }},
    },
    "template-vintage-fruit-market-label-poster": {
        "category": "Vintage Fruit Market Label Poster",
        "description": "Generate a vintage fruit-market label poster — botanical illustration of the fruit, classic typeface brand name, crate-stamp aesthetics, art-deco border.",
        "title": "Nano Banana Prompt: Vintage Fruit Market Label Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage fruit market label poster. Faded cream paper background, botanical illustration of the fruit at center, ornate art-deco border, classic serif typeface brand name banner, small region-of-origin stamp + grade badge, fruit variety + harvest year footer text. 1920s American produce-crate-label aesthetic.",
            "who": "Suitable for farm-to-table brands, kitchen wall-art shops, vintage market booth signage, recipe-blog headers, and Etsy print-on-demand sellers.",
            "how": [
                "Enter the fruit name (e.g. 'orange' or 'lemon').",
                "Botanical illustration + art-deco border + crate-stamp typography auto-compose.",
                "Generate a vertical 8K vintage fruit market label poster."
            ],
            "prompts": [
                "Generate a vintage lemon market label poster.",
                "Create a vintage orange crate label print.",
                "Generate a vintage strawberry market label art print."
            ]
        }},
    },
}

ZH = {tid: EN[tid] for tid in template_ids}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}
    total = 0
    for locale in LOCALES:
        p = MESSAGES / locale / "nano.json"
        if not p.exists():
            print(f"  SKIP (missing): {p}"); continue
        doc = json.loads(p.read_text(encoding="utf-8"))
        added = 0
        for tid in template_ids:
            if tid in doc:
                continue
            doc[tid] = by_locale[locale][tid]
            added += 1; total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added}")
    print(f"\nDone. Added {total} ({len(template_ids)} × {len(LOCALES)}).")


if __name__ == "__main__":
    main()
