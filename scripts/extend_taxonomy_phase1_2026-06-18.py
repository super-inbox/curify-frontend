"""Phase 1 of inspirations↔taxonomy alignment (2026-06-18).

Adds taxonomy vocabulary surfaced by the 100 unaligned `tags` in
nano_inspiration.json. NEW entries are appended to existing T3 buckets
or to a new top-level `audience` axis. No i18n added (per
topicRegistry.ts gating, vocab without i18n is matcher-only — that is
exactly what we want for these internal tag values).

Safety: only ADDs to taxonomy.json. Never removes existing entries.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TAX_PATH = ROOT / "lib" / "taxonomy.json"

# Per-bucket additions. All slugs are lowercased-with-hyphens (T3 style).
T3_ADDS = {
    "design": [
        "infographic",
        "comic",
        "caricature",
        "miniature",
        "calligraphy",
        "object-labeling",
        "before-and-after",
        "step-by-step-tutorial",
    ],
    "character": [
        "superhero",
        "celebrity",
        "anthropomorphic",
        "villain",
        "detective",
        "scientist",
        "founder",
        "cowboy",
        "soccer",
    ],
    "lifestyle": [
        "business",
        "workplace-dynamics",
        "health",
        "productivity",
        "shopping",
        "hobbies",
        "sustainability",
        "humor",
        "botanical",
        "herbal",
        "zodiac",
    ],
    "culture": [
        "festival",
        "mythological-figures",
        "east-asian-culture",
        "cuisine",
    ],
    "learning": [
        "anatomy",
        "literature",
        "music",
        "technology",
        "fantasy",
        "adventure",
        "crime",
        "western",
        "military",
    ],
    "language": [
        "grammar-correction",
        "poetry",
    ],
    "travel": [
        "canada",
    ],
}

# New T4 entity categories. Title-cased per existing T4 convention
# (e.g. "Forest Animals", "Bordeaux"). No i18n needed for T4.
T4_ADDS = {
    "places-scenes": [
        "Kitchen", "Library", "Supermarket", "Classroom", "Laboratory",
        "Playground", "Cafe", "Restaurant", "Park", "Bedroom",
        "Amusement Park", "Office", "Gym", "Hospital", "Hotel",
    ],
    "cities": [
        "Beijing", "Bangkok", "Paris", "London", "Tokyo", "New York",
        "Shanghai", "Seoul", "Mumbai", "Dubai", "Sydney",
        "Rio de Janeiro", "Mexico City", "Istanbul", "Hong Kong",
    ],
    "zodiac": [
        "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
        "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
    ],
    "traditional-medicine": [
        "Traditional Chinese Medicine", "Herbalism", "Ayurveda",
    ],
}

# New top-level axis (per user decision 2026-06-18). Orthogonal to
# Subject/Format/Layout — describes who the content is FOR. Lives only
# on inspirations.tags[] (matcher recall), never on topics[].
AUDIENCE_AXIS = [
    "kids-learning",          # collapses 'kids' + 'early childhood' + 'educational'
    "early-childhood-learning",
    "bilingual",
    "professional",
]


def main() -> None:
    tax = json.loads(TAX_PATH.read_text(encoding="utf-8"))

    added_t3 = 0
    for bucket, new_slugs in T3_ADDS.items():
        existing = set(tax["tier3"][bucket])
        for s in new_slugs:
            if s not in existing:
                tax["tier3"][bucket].append(s)
                added_t3 += 1

    added_t4 = 0
    for bucket, new_entities in T4_ADDS.items():
        if bucket not in tax["tier4"]:
            tax["tier4"][bucket] = []
        existing = set(tax["tier4"][bucket])
        for e in new_entities:
            if e not in existing:
                tax["tier4"][bucket].append(e)
                added_t4 += 1

    audience_added = 0
    if "audience" not in tax:
        tax["audience"] = []
    existing_aud = set(tax["audience"])
    for a in AUDIENCE_AXIS:
        if a not in existing_aud:
            tax["audience"].append(a)
            audience_added += 1

    TAX_PATH.write_text(
        json.dumps(tax, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  +T3 entries: {added_t3}")
    print(f"  +T4 entries: {added_t4} (across {len(T4_ADDS)} new/existing buckets)")
    print(f"  +audience axis entries: {audience_added}")
    print(f"  taxonomy.json updated")


if __name__ == "__main__":
    main()
