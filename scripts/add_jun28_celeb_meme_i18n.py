"""i18n for the new template-celebrity-meme-sticker-merchandise-collection-poster
(2026-06-28 drop, cherry-picked from hongjie28-patch-2)."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = ["template-celebrity-meme-sticker-merchandise-collection-poster"]

EN = {
    "template-celebrity-meme-sticker-merchandise-collection-poster": {
        "category": "Celebrity Viral Meme Sticker Pack + Merchandise Collection Poster",
        "description": "Generate a horizontal fan-merch display poster showcasing a celebrity / star's viral meme sticker pack alongside a full merchandise collection — sticker grid + apparel mockups + fan-design product traits — for any famous figure with iconic meme moments.",
        "title": "Nano Banana Prompt: Celebrity Meme Sticker Pack & Merch Collection Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template produces a horizontal two-column fan merchandise display poster. LEFT section: a large brush-stroke title + a grid of 6 unique die-cut cartoon sticker illustrations capturing iconic viral meme poses of the celebrity, each paired with a bold meme catchphrase + bottom feature-icon row (waterproof / vibrant print / residue-free peel / fan-made). RIGHT section: vertical merchandise mockup column showing how the sticker artwork applies to apparel (tee, hoodie, cap) and accessories (tote, mug, phone case). Pop / commercial fan-merch aesthetic.",
            "who": "Suitable for fan-merch creators on Etsy / Redbubble, sports-fan / pop-culture social media accounts pitching sticker drops, indie meme-merch brands needing a display-board mockup, and influencer / creator teams launching a star's branded merchandise line.",
            "how": [
                "Enter the celebrity meme theme — '[Star name] + [meme angle / catchphrase / domain]'.",
                "Sticker grid + mockup column + feature traits auto-compose into a horizontal display board.",
                "Generate the full meme sticker pack & merchandise collection poster."
            ],
            "prompts": [
                "哈兰德Haaland football meme sticker pack and apparel merchandise showcase board.",
                "C罗CR7 Portugal iconic meme moments sticker pack and cultural creative goods poster.",
                "Elon Musk tech-meme sticker collection and merchandise marketing long-image."
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
