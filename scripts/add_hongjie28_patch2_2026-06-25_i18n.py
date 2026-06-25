"""i18n for the 1 new template from hongjie28-patch-2 (2026-06-25 push)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = [
    "template-chinese-ancient-bronze-cultural-creative-product-technical-design-sheet",
]

EN = {
    "template-chinese-ancient-bronze-cultural-creative-product-technical-design-sheet": {
        "category": "Chinese Ancient Bronze Cultural Creative Product Technical Design Sheet",
        "description": "Generate a vertical technical design sheet for a cultural-creative product based on an ancient Chinese bronze artifact — front/side/exploded views + material specs + craft annotations.",
        "title": "Nano Banana Prompt: Chinese Ancient Bronze Cultural Creative Product Technical Design Sheet Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K technical design sheet for a museum-shop / cultural-creative (文创) product whose form derives from an ancient Chinese bronze artifact (e.g. bronze beast → phone stand, soap dish, paperweight). Includes orthographic front and side views, exploded breakdown, material + finish callouts, craft technique annotations, dimension labels, and brand stamp footer. Blueprint-style technical drafting aesthetic with bronze-patina accent palette.",
            "who": "Suitable for museum gift-shop product designers, cultural-IP merch teams, ancient-artifact-inspired homeware brands (Bronze · Tang · Ming era), industrial designers building heritage-themed product lines, and Etsy sellers building IP collections.",
            "how": [
                "Enter the bronze-artifact-inspired product idea (e.g. 'beast phone stand' or 'beast soap dish').",
                "Multi-view technical drafting + material specs + craft annotations auto-compose.",
                "Generate a vertical 8K Chinese bronze cultural-creative product design sheet."
            ],
            "prompts": [
                "Generate a bronze beast phone stand design sheet.",
                "Create a bronze taotie soap dish design sheet.",
                "Generate a bronze ding cauldron tea-light holder technical sheet."
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
