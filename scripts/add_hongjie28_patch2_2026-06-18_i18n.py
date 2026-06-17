"""Append i18n entries for 5 new templates from hongjie28-patch-2 (2026-06-18 push)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = [
    "template-fruit-commercial-lifestyle-infographic-poster",
    "template-educational-flashcard-ontology-mindmap-infographic",
    "template-musical-score-illustrated-art-poster",
    "template-vintage-collage-fashion-collection-poster",
    "template-kpop-idol-profile-vintage-passport-poster",
]

EN = {
    "template-fruit-commercial-lifestyle-infographic-poster": {
        "category": "Fruit Commercial Lifestyle Infographic Poster",
        "description": "Generate a vertical commercial fruit-lifestyle poster — vivid fruit hero shot, nutrition facts panel, recipe suggestions, seasonality calendar, and brand-style copy.",
        "title": "Nano Banana Prompt: Fruit Commercial Lifestyle Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K commercial fruit lifestyle infographic poster. Hero shot of the fruit at center (whole + cut + styled), nutrition facts panel (vitamin / fiber / kcal), recipe suggestion cards, seasonality calendar bar, and brand-style headline copy. Bright commercial photography aesthetic with magazine-grade typography.",
            "who": "Suitable for grocery brands, fruit producers, healthy-eating bloggers, smoothie / juice shops, and meal-kit marketers building shelf-talker or in-store collateral.",
            "how": [
                "Enter the fruit + lifestyle angle (e.g. 'strawberry summer freshness').",
                "Hero shot + nutrition panel + recipe cards auto-compose.",
                "Generate a vertical 8K fruit commercial lifestyle poster."
            ],
            "prompts": [
                "Generate a strawberry summer freshness commercial poster.",
                "Create a blueberry antioxidant lifestyle infographic.",
                "Generate a mango tropical breakfast commercial poster."
            ]
        }},
    },
    "template-educational-flashcard-ontology-mindmap-infographic": {
        "category": "Educational Flashcard Ontology Mindmap Infographic",
        "description": "Generate a vertical educational mindmap poster — central concept with radiating ontology branches, each branch carrying mini-flashcards with definitions, examples, and icons.",
        "title": "Nano Banana Prompt: Educational Flashcard Ontology Mindmap Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K educational ontology mindmap infographic. Central concept node with 5-7 radiating branches; each branch contains 2-3 mini-flashcards (term + definition + tiny illustrated icon). Color-coded branches, organized hierarchy, school-classroom poster aesthetic.",
            "who": "Suitable for teachers building knowledge-map posters, study-group note creators, EdTech content producers, exam-prep tutors, and homeschoolers organizing curricula visually.",
            "how": [
                "Enter the concept + breakdown angle (e.g. 'photosynthesis ontology mindmap').",
                "Central node + radiating branches + mini-flashcards auto-render.",
                "Generate a vertical 8K educational mindmap infographic."
            ],
            "prompts": [
                "Generate a photosynthesis ontology mindmap poster.",
                "Create a cell biology mindmap with flashcard branches.",
                "Generate an English grammar parts-of-speech mindmap poster."
            ]
        }},
    },
    "template-musical-score-illustrated-art-poster": {
        "category": "Musical Score Illustrated Art Poster",
        "description": "Generate a vertical illustrated music-score art poster — staff and notes flowing across the page integrated with thematic illustrations, ornamented title, composer credit.",
        "title": "Nano Banana Prompt: Musical Score Illustrated Art Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K illustrated music-score art poster. Stylized staff with notes flowing across the page, fully integrated with thematic illustrations (forest / sea / city / dance) that visually echo the music's mood. Ornamented title in classical or art-nouveau type, composer credit + opus number. Print-quality wall-art aesthetic.",
            "who": "Suitable for music school decor, concert program covers, classical-music gift shops, music-themed wedding stationery, and recital poster designers.",
            "how": [
                "Enter the piece + mood / theme (e.g. 'Debussy Clair de Lune moonlit garden').",
                "Staff + integrated illustration auto-compose.",
                "Generate a vertical 8K illustrated music-score art poster."
            ],
            "prompts": [
                "Generate a Debussy Clair de Lune moonlit garden poster.",
                "Create a Vivaldi Four Seasons spring illustrated score poster.",
                "Generate a Beethoven Moonlight Sonata art poster."
            ]
        }},
    },
    "template-vintage-collage-fashion-collection-poster": {
        "category": "Vintage Collage Fashion Collection Poster",
        "description": "Generate a vertical vintage fashion-collection collage poster — torn paper / magazine cutout aesthetic, hand-stamped headlines, mixed garment photography, brand or season label.",
        "title": "Nano Banana Prompt: Vintage Collage Fashion Collection Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage fashion-collection collage poster. Layered torn-paper / magazine-cutout aesthetic; mixed garment photography (full-body + flat-lay + accessories) overlaid with hand-stamped headlines, tape, ticket stubs, and price tags. Sepia + saturated accent color palette. Brand or season label at the top.",
            "who": "Suitable for indie fashion brands, vintage / thrift shops, lookbook designers, fashion-zine creators, and Etsy listing producers.",
            "how": [
                "Enter the brand + season / collection vibe (e.g. 'Parisian vibes Alba summer').",
                "Torn-paper background + layered garment cutouts auto-compose.",
                "Generate a vertical 8K vintage collage fashion collection poster."
            ],
            "prompts": [
                "Generate a Parisian vibes Alba summer collection poster.",
                "Create a retro chic vibes Mersi Ltd collection poster.",
                "Generate a SRD new accessory collection vintage collage poster."
            ]
        }},
    },
    "template-kpop-idol-profile-vintage-passport-poster": {
        "category": "Kpop Idol Profile Vintage Passport Poster",
        "description": "Generate a vertical minimalist K-pop member profile poster — vintage passport / ID-card aesthetic, idol portrait + name + stage role + group, Korean biography paragraph, halftone graphics.",
        "title": "Nano Banana Prompt: Kpop Idol Profile Vintage Passport Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K minimalist K-pop member profile poster in a vintage passport / ID-card aesthetic. Thin light rectangular border, idol portrait at left, member name + stage role + group at right, Korean biography paragraph, halftone dotted star graphic, KOREAN SUPERSTAR rubber-stamp header. Pastel cream / soft pink palette with one bold accent.",
            "who": "Suitable for K-pop fan-art creators, fandom merchandise designers, individual or group profile posters, light-stick / album promotional collateral, and bias wall decor.",
            "how": [
                "Enter the group + member or full-group theme (e.g. 'NewJeans Hanni profile card').",
                "Vintage passport border + portrait + biography panel auto-compose.",
                "Generate a vertical 8K K-pop idol profile passport-style poster."
            ],
            "prompts": [
                "Generate a NewJeans Hanni vintage passport profile poster.",
                "Create a BTS Jungkook member profile card.",
                "Generate an aespa Karina K-pop superstar profile poster."
            ]
        }},
    },
}

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
