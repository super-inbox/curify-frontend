"""i18n for the new template-wc-knockout-matchup-poster (2026-06-28 drop)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = ["template-wc-knockout-matchup-poster"]

EN = {
    "template-wc-knockout-matchup-poster": {
        "category": "World Cup Knockout Matchup Poster",
        "description": "Vertical fight-poster-style 1v1 matchup poster for FIFA World Cup 2026 knockout fixtures — two stars face off on top with team-themed backgrounds, light info strip below (basics + what-to-watch).",
        "title": "Nano Banana Prompt: World Cup Knockout Matchup Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template produces a vertical fight-poster-style matchup poster for any World Cup knockout fixture. The top 70% is a 1v1 battle visual — two stylized full-body player illustrations face off across a split-screen background that uses each country's sports-poster visual vocabulary (no literal flag-tearing or militaristic motifs). A huge gold metallic VS letterform sits between them. The bottom 30% is a light info strip with two columns: Match Basics (date / venue / coaches / odds) and What to Watch (4 emoji-led one-liners). Clean magazine-cover aesthetic.",
            "who": "Suitable for football fans wanting a shareable poster for an upcoming knockout fixture, sports-bar operators printing matchday posters, fantasy/predictions content creators on social media, and anyone tracking the World Cup 2026 bracket who wants a visual creation for any X-vs-Y fixture.",
            "how": [
                "Enter the matchup string — '[Team A] vs [Team B] · [Stage] · [Venue] · [Star A] vs [Star B]'.",
                "The system fills both teams' sports-poster backgrounds, places the two stars, and assembles the info strip.",
                "Generate a vertical fight-poster matchup ready to share or print."
            ],
            "prompts": [
                "Brazil vs Japan · Round of 32 · NRG Stadium · Vinícius vs Kubo.",
                "France vs Sweden · Round of 32 · MetLife · Mbappé vs Gyökeres.",
                "Germany vs Paraguay · Round of 32 · Gillette · Musiala vs Almirón."
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
            if tid in doc: continue
            doc[tid] = by_locale[locale][tid]; added += 1; total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added}")
    print(f"\nDone. Added {total} ({len(template_ids)} × {len(LOCALES)}).")


if __name__ == "__main__":
    main()
