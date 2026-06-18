"""Phase 2 of inspirations↔taxonomy alignment (2026-06-18).

Rule-based remap of `tags[]` values in nano_inspiration.json. Only
touches tags[] — never topics[] (per user constraint: topics drive
SEO pages, must remain append-only).

Three operations per record:
  1. RENAME: vocab-mismatch tags → canonical taxonomy slug
  2. EXPAND: composite tags → multiple atomic taxonomy slugs
  3. DROP:   generic-noise tags removed entirely

Then dedupe + sort.

Output: rewrites nano_inspiration.json + prints stats.
"""
import json
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]
INS_PATH = ROOT / "public" / "data" / "nano_inspiration.json"

# 1:1 vocab renames. Source value (lowercased) → canonical taxonomy slug.
RENAME: dict[str, str] = {
    "movie": "film",                       # T2.character.film
    "mexican": "mexico",                   # T3.travel.mexico
    "japanese": "japan",
    "korean": "korea",
    "french": "france",
    "british": "uk",
    "vietnamese": "vietnam",
    "3d map": "map",                       # T2.travel.map
    "ink wash": "ink",                     # T3.design.ink
    "city guide": "city",                  # T2.travel.city
    "travel itinerary": "itinerary",       # T2.travel.itinerary
    "fitness plan": "fitness",             # T2.lifestyle.fitness
    "personality quiz": "quiz",            # T2.personality.quiz
    "conversation": "dialogue",            # T2.language.dialogue
    "friendship": "relationship",          # T2.character.relationship
    "meal planning": "food",               # T2.travel.food
    "legends": "mythological-figures",     # new T3.culture (Phase 1)
    "chinese": "china",                    # T3.travel.china / T3.culture.china
    "object labeling": "object-labeling",  # new T3.design (Phase 1)
    "step-by-step tutorial": "step-by-step-tutorial",
    "before and after": "before-and-after",
    "workplace dynamics": "workplace-dynamics",
    "grammar correction": "grammar-correction",
    "early childhood": "early-childhood-learning",  # new audience axis (Phase 1)
    "language pair": "bilingual",          # collapsed into audience axis
    "kids": "kids-learning",               # collapsed into audience axis
    "educational": "kids-learning",        # collapsed into audience axis
    "festival": "festival",                # was unaligned, now in T3.culture
    "celebrity": "celebrity",              # was unaligned, now in T3.character
    "superhero": "superhero",
    "anthropomorphic": "anthropomorphic",
    "animal personification": "anthropomorphic",
    "villain": "villain",
    "detective": "detective",
    "scientist": "scientist",
    "founder": "founder",
    "cowboy": "cowboy",
    "infographic": "infographic",
    "comic": "comic",
    "caricature": "caricature",
    "miniature": "miniature",
    "calligraphy": "calligraphy",
    "business": "business",
    "health": "health",
    "productivity": "productivity",
    "shopping": "shopping",
    "hobbies": "hobbies",
    "sustainability": "sustainability",
    "anatomy": "anatomy",
    "literature": "literature",
    "music": "music",
    "technology": "technology",
    "fantasy": "fantasy",
    "adventure": "adventure",
    "crime": "crime",
    "western": "western",
    "military": "military",
    "thriller": "crime",                   # genre adjacency
    "action": "adventure",                 # genre adjacency
    "poetry": "poetry",
    "humor": "humor",
    "botanical": "botanical",
    "herbal": "herbal",
    "cuisine": "cuisine",
    "zodiac": "zodiac",
    "canada": "canada",
    "traditional-chinese-medicine": "traditional-chinese-medicine",
    "traditional chinese medicine": "traditional-chinese-medicine",
    "amusement-park": "amusement-park",
    "amusement park": "amusement-park",
    "train": "transportation",             # T2.language.transportation
    "advertisement": "promotional-poster", # T3.product.promotional-poster
    "home-organization": "interior",       # T2.lifestyle.interior
    "home organization": "interior",
}

# Composite tags → multiple atomic taxonomy slugs (1:N).
EXPAND: dict[str, list[str]] = {
    "ecommerce showcase": ["ecommerce", "showcase"],   # T2.product.ecommerce + T3.product
    "regional cuisine": ["food", "cuisine"],
    "historical fashion": ["fashion", "vintage"],
    "cultural heritage": ["culture", "history"],
    "nature science": ["nature", "science"],
    "character analysis": ["character"],               # drop the noisy "analysis" half
    "food science": ["food", "science"],
    "food-science": ["food", "science"],
    "city guide": ["city"],                            # already in RENAME but kept for safety
}

# Tags to drop entirely (generic noise — no taxonomy value).
DROP = {
    "colorful",
    "traditional",
    "cultural",
    "analysis",
    "equipment",
    "transformation",
    "franchise fandom",     # resolve via topics + per-record franchise tags instead
    "ecommerce showcase",   # handled by EXPAND above; safety drop of literal form
    "strategy",             # too generic
    "career",               # too generic (rolls up into business)
}


def remap_one(tag: str) -> list[str]:
    """Return the rewritten list of slugs for a single input tag."""
    key = tag.strip().lower()
    if key in DROP:
        return []
    if key in EXPAND:
        # Run each expanded slug back through RENAME so we get canonical form
        return [RENAME.get(s.lower(), s) for s in EXPAND[key]]
    if key in RENAME:
        return [RENAME[key]]
    # Already canonical or unhandled — keep as-is (lowercased; spaces → hyphens)
    return [key.replace(" ", "-")]


def main() -> None:
    ins = json.loads(INS_PATH.read_text(encoding="utf-8"))
    tax = json.loads((ROOT / "lib" / "taxonomy.json").read_text(encoding="utf-8"))

    # Build the full valid-slug set (T1-4 + audience) for post-remap audit.
    # T4 entries are Title Case ("Traditional Chinese Medicine") but
    # inspiration tags are kebab-case ("traditional-chinese-medicine"),
    # so add both forms to the valid set.
    def slugify(s: str) -> str:
        return s.lower().replace(" ", "-")
    valid: set[str] = set()
    for t in tax.get("tier1", []):
        valid.add(t.lower()); valid.add(slugify(t))
    for tier in ("tier2", "tier3", "tier4"):
        for v in tax.get(tier, {}).values():
            if isinstance(v, list):
                for x in v:
                    valid.add(str(x).lower())
                    valid.add(slugify(str(x)))
    for a in tax.get("audience", []):
        valid.add(a.lower()); valid.add(slugify(a))

    rewritten_records = 0
    dropped_tags = 0
    renamed_tags = 0
    expanded_tags = 0
    untouched_tags = 0

    for e in ins:
        tags = e.get("tags") or []
        if not tags:
            continue
        new_tags: list[str] = []
        changed = False
        for t in tags:
            key = t.strip().lower()
            mapped = remap_one(t)
            if not mapped:
                dropped_tags += 1
                changed = True
                continue
            if key in EXPAND:
                expanded_tags += 1
                changed = True
            elif key in RENAME and RENAME[key] != key:
                renamed_tags += 1
                changed = True
            else:
                untouched_tags += 1
            new_tags.extend(mapped)
        # Dedupe + sort for determinism
        new_tags = sorted(set(new_tags))
        if new_tags != tags:
            e["tags"] = new_tags
            if changed:
                rewritten_records += 1

    INS_PATH.write_text(
        json.dumps(ins, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    # Post-audit: count remaining unaligned tags
    leftover = Counter()
    for e in ins:
        for t in (e.get("tags") or []):
            if t.lower() not in valid:
                leftover[t] += 1

    total_distinct_now = len({t for e in ins for t in (e.get("tags") or [])})
    print(f"  rewritten records: {rewritten_records}")
    print(f"  tags dropped:      {dropped_tags}")
    print(f"  tags renamed:      {renamed_tags}")
    print(f"  tags expanded:     {expanded_tags}")
    print(f"  tags untouched:    {untouched_tags}")
    print(f"  distinct tag vocab now: {total_distinct_now}")
    print(f"\n  remaining UNALIGNED tags ({len(leftover)} kinds, {sum(leftover.values())} usages):")
    for t, c in leftover.most_common(40):
        print(f"    {c:>4}  {t}")


if __name__ == "__main__":
    main()
