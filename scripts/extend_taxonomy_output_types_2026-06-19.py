"""Phase B+C of intent-cluster taxonomy fill (2026-06-19).

B. Add EN+ZH i18n displayName for 5 vocab-only slugs that were already
   in taxonomy but not localized:
     infographic, anatomy, comic, step-by-step-tutorial, illustration

C. Add 14 missing output-type slugs to lib/taxonomy.json + EN+ZH i18n.
   Output types describe "what users want to make" — the missing entries
   cluster heavily in Merch & Social (stickers, mascots, selfies, memes)
   which have the strongest demand signal but weakest taxonomy coverage.

After this script runs, follow up with scripts/i18n_autotranslate.cjs
to fill the 8 non-EN locales (de/es/fr/hi/ja/ko/ru/tr).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAX = ROOT / "lib" / "taxonomy.json"
TOPICS_EN = ROOT / "messages" / "en" / "topics.json"
TOPICS_ZH = ROOT / "messages" / "zh" / "topics.json"

# ── C: 14 new output-type slugs → tier placement ──────────────────────────
NEW_SLUGS = {
    # T2 entries (subject-domain subdivisions)
    "flashcards":        ("tier2", "learning"),
    "recipes":           ("tier2", "lifestyle"),
    # T3 entries (formats / styles / specific output types)
    "mind-maps":         ("tier3", "design"),
    "study-sheets":      ("tier3", "design"),
    "art-prints":        ("tier3", "design"),
    "wall-art":          ("tier3", "design"),
    "memes":             ("tier3", "design"),
    "social-media-posts":("tier3", "design"),
    "stickers":          ("tier3", "product"),
    "mascots":           ("tier3", "character"),
    "character-ip":      ("tier3", "character"),
    "fan-art":           ("tier3", "character"),
    "selfies":           ("tier3", "lifestyle"),
    "scrapbooks":        ("tier3", "travel"),
}

# ── B+C: EN+ZH displayName for the full 19-entry set ─────────────────────
# Action-oriented framing — these are what users want to MAKE, surfaced
# directly as topic page H1s and chip labels in the Phase 1 chip aggregator.
DISPLAY_NAMES_EN = {
    # B: 5 vocab-only slugs needing i18n
    "infographic":            "Infographics",
    "anatomy":                "Anatomy",
    "comic":                  "Comic",
    "step-by-step-tutorial":  "Step-by-Step Tutorials",
    "illustration":           "Illustration",
    # C: 14 new slugs
    "flashcards":             "Flashcards",
    "recipes":                "Recipes",
    "mind-maps":              "Mind Maps",
    "study-sheets":           "Study Sheets",
    "art-prints":             "Art Prints",
    "wall-art":               "Wall Art",
    "memes":                  "Memes",
    "social-media-posts":     "Social Media Posts",
    "stickers":               "Stickers",
    "mascots":                "Mascots",
    "character-ip":           "Character IP",
    "fan-art":                "Fan Art",
    "selfies":                "Selfies",
    "scrapbooks":             "Travel Scrapbooks",
}

DISPLAY_NAMES_ZH = {
    "infographic":            "信息图",
    "anatomy":                "解剖图",
    "comic":                  "漫画",
    "step-by-step-tutorial":  "步骤教程",
    "illustration":           "插画",
    "flashcards":             "闪卡",
    "recipes":                "食谱",
    "mind-maps":              "思维导图",
    "study-sheets":           "学习表",
    "art-prints":             "艺术挂画",
    "wall-art":               "墙面艺术",
    "memes":                  "梗图",
    "social-media-posts":     "社媒帖子",
    "stickers":               "贴纸",
    "mascots":                "吉祥物",
    "character-ip":           "角色IP",
    "fan-art":                "同人创作",
    "selfies":                "自拍",
    "scrapbooks":             "旅行剪贴册",
}


def main() -> None:
    # C: extend taxonomy
    tax = json.loads(TAX.read_text(encoding="utf-8"))
    added = 0
    for slug, (tier, bucket) in NEW_SLUGS.items():
        existing = tax[tier].setdefault(bucket, [])
        if slug not in existing:
            existing.append(slug)
            added += 1
    TAX.write_text(json.dumps(tax, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  +{added} slugs to taxonomy.json")

    # B+C: i18n displayName for all 19 slugs
    for locale, names in (("en", DISPLAY_NAMES_EN), ("zh", DISPLAY_NAMES_ZH)):
        path = TOPICS_EN if locale == "en" else TOPICS_ZH
        d = json.loads(path.read_text(encoding="utf-8"))
        topics = d.setdefault("topics", {})
        added_i18n = 0
        for slug, display in names.items():
            if slug not in topics:
                topics[slug] = {"displayName": display}
                added_i18n += 1
            elif "displayName" not in topics[slug]:
                topics[slug]["displayName"] = display
                added_i18n += 1
        path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  +{added_i18n} {locale} displayNames")


if __name__ == "__main__":
    main()
