"""i18n for the 1 new template from the 2026-06-27 daily drop:
   template-brand-identity-moodboard-visual-system-poster
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = ["template-brand-identity-moodboard-visual-system-poster"]

EN = {
    "template-brand-identity-moodboard-visual-system-poster": {
        "category": "Brand Identity Moodboard Visual System Poster",
        "description": "Generate a vertical 9-grid brand visual identity moodboard poster — logo lockup, color palette, packaging mockups, outdoor billboard, staff uniform + tote + t-shirt application — for any commercial store brand theme.",
        "title": "Nano Banana Prompt: Brand Identity Moodboard Visual System Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template produces a complete brand visual identity moodboard collage — vertical 9-block grid covering primary logo lockup with slogan, outdoor circular wall sign mockup, monochrome/color logo variants, official brand color palette with hex codes, product packaging mockups (shopping bag, container, accessories), a large outdoor billboard advertising display, and three real-life application mockups (staff uniform cap & apron, customer carrying tote bag, mannequin wearing brand t-shirt). Clean commercial brand-design presentation aesthetic, unified brand tone, realistic mockup photography, minimalist white background with thin dividing borders.",
            "who": "Suitable for brand designers building pitch decks, agency teams presenting brand-system rationales, indie founders mocking up a new store concept (coffee shop / bakery / grocery / pet / bookstore / gym), small-batch product brands needing a visual-identity board for investor decks, and Etsy-style sellers spec'ing out a unified brand look.",
            "how": [
                "Enter the brand theme — '[business type] + [brand name]' (e.g. 'GreenBasket grocery store full VI visual identity board').",
                "9-block grid auto-composes logo + palette + packaging + outdoor + uniform + tote + mannequin mockups.",
                "Generate a vertical brand identity moodboard visual system poster."
            ],
            "prompts": [
                "Generate a GreenBasket grocery store full VI visual identity board.",
                "Create a PAW PARADISE pet shop brand color logo application collage poster.",
                "Generate a BREW & CO specialty coffee shop brand standards visual showcase."
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
