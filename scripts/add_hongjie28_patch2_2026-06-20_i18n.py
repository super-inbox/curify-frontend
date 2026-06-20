"""i18n for 3 new templates from hongjie28-patch-2 (2026-06-20 push)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = [
    "template-full-year-12-month-cartoon-character-calendar-poster",
    "template-men-lifestyle-step-guide-infographic-poster",
    "template-ballroom-dance-step-vintage-tutorial-infographic",
]

EN = {
    "template-full-year-12-month-cartoon-character-calendar-poster": {
        "category": "Full Year 12-Month Cartoon Character Calendar Poster",
        "description": "Generate a horizontal full-year wall calendar poster — 12 seasonal cartoon character vignettes with weekly calendar grids, in a cute official IP art style.",
        "title": "Nano Banana Prompt: Full Year 12-Month Cartoon Character Calendar Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal full-year wall calendar poster themed on a single cartoon IP. Layout: 3 rows × 4 columns monthly grid with a unique seasonal character vignette + weekly date table per month. Cute official IP art style, soft pastel palette, minimalist printable annual planner aesthetic.",
            "who": "Suitable for cartoon fans, IP merchandise designers, classroom decor printers, holiday gift creators, and Etsy stationery shops shipping annual planner posters.",
            "how": [
                "Enter the cartoon IP + year (e.g. '2026 Snoopy Peanuts full year horizontal calendar').",
                "12-month grid + seasonal vignettes + weekly tables auto-compose.",
                "Generate a horizontal 8K full-year cartoon calendar poster."
            ],
            "prompts": [
                "Generate a 2026 Studio Ghibli annual calendar poster.",
                "Create a 2026 Chiikawa cartoon character calendar.",
                "Generate a 2026 Crayon Shin-chan full year calendar poster."
            ]
        }},
    },
    "template-men-lifestyle-step-guide-infographic-poster": {
        "category": "Men's Lifestyle Step Guide Infographic Poster",
        "description": "Generate a vertical men's daily routine tutorial infographic — full-body hero photo, 5-step numbered sequence, tip checklist, product showcase grid, and footer quote.",
        "title": "Nano Banana Prompt: Men's Lifestyle Step Guide Infographic Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K men's daily routine tutorial infographic poster. Full-body male model header, dark navy navigation bar, 5-column numbered step flow with demo photos + subtitles, tip checklist + budget product grid, footer inspirational quote. Navy + royal blue masculine commercial design.",
            "who": "Suitable for men's grooming brands, fitness coaches, lifestyle creators, DTC men's product marketers, and Pinterest tutorial publishers.",
            "how": [
                "Enter the men's lifestyle topic (e.g. 'home workout plan' or 'work dress code guide').",
                "Hero photo + 5-step grid + tip checklist + product showcase auto-compose.",
                "Generate a vertical 8K men's lifestyle step-guide infographic poster."
            ],
            "prompts": [
                "Generate a men's home workout plan infographic poster.",
                "Create a men's daily nutrition plan step-by-step guide.",
                "Generate a men's haircut style guide poster."
            ]
        }},
    },
    "template-ballroom-dance-step-vintage-tutorial-infographic": {
        "category": "Ballroom Dance Step Vintage Tutorial Infographic",
        "description": "Generate a vertical vintage-style ballroom dance step tutorial infographic — numbered footwork diagrams, posture illustrations, partner positions, and choreography notes.",
        "title": "Nano Banana Prompt: Ballroom Dance Step Vintage Tutorial Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K vintage-style ballroom dance step tutorial infographic. Numbered footwork diagrams, partner-position illustrations, posture cues, choreography notes, and rhythm timing. Sepia-toned art-deco aesthetic, hand-drawn illustration style, printable wall-art quality.",
            "who": "Suitable for dance studios, ballroom instructors, vintage dance event organizers, wedding-dance tutorial creators, and dance-class flyer designers.",
            "how": [
                "Enter the dance + step (e.g. 'waltz box step' or 'tango walk').",
                "Footwork diagrams + posture illustrations + rhythm cues auto-compose.",
                "Generate a vertical 8K vintage ballroom dance tutorial infographic."
            ],
            "prompts": [
                "Generate a waltz box step vintage tutorial infographic.",
                "Create a tango walk dance step guide poster.",
                "Generate a swing rock triple step vintage tutorial."
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
