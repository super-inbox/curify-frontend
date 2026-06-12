"""Content-mining pass over public/data/nanobanana.json (4,117 prompts).

Adds 16 truly new gallery prompt tags + boosts 4 under-tagged existing
tags by scanning each prompt's title + description + promptText +
topic + domainCategory for keyword / phrase matches. Updates the prompt
records in-place, then regenerates lib/generated/nanobanana_prompts_metadata.json
with the new counts.

Pruning rationale: see the per-tag analysis in chat — the 16 new tags
target genuine gaps (graphic-design / branding / web-design / 90s /
cyberpunk / pixar / double-exposure / gradient / drinks / desserts /
outerwear / streetwear / sneakers / bedroom / outdoor / digital-art).
The 4 promoted tags (studio / café / interior / 3d) currently sit at
count=1 but have real evidence in the sample.

Pattern matching is conservative (word-boundary regex, multi-phrase
alternation, optional domainCategory filter) — false positives are
worse than false negatives at this scale.
"""
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROMPTS_PATH = ROOT / "public/data/nanobanana.json"
META_PATH = ROOT / "lib/generated/nanobanana_prompts_metadata.json"


# ── Tag patterns ──────────────────────────────────────────────────────────
#
# Each entry: tag → list of regex patterns (anchored / word-boundaried).
# Optional `domain` filter restricts the prompt's domainCategory to one
# of the listed values (case-insensitive). Hits on EITHER a regex OR the
# domain filter qualify the prompt for the tag.

TAG_RULES: dict[str, dict] = {
    # ── 16 truly new tags ─────────────────────────────────────────────
    "graphic-design": {
        "patterns": [r"\bgraphic\s+design\b", r"\bgraphic\s+designer\b"],
        "domain": ["Graphic Design"],
    },
    "digital-art": {
        "patterns": [r"\bdigital\s+(art|painting|illustration)\b"],
        "domain": ["Digital Art", "3D Art & Modeling"],
    },
    "branding": {
        "patterns": [
            r"\bbrand(?:ing)?\s+(identity|guidelines)\b",
            r"\blogo\s+design\b",
            r"\bbrand\s+system\b",
        ],
        "domain": ["Branding & Identity"],
    },
    "web-design": {
        "patterns": [
            r"\bweb\s+design\b",
            r"\bwebsite\s+(design|layout|mockup)\b",
            r"\blanding\s+page\b",
            r"\bui\s+design\b",
        ],
        "domain": ["Web Design"],
    },
    "90s": {
        # Specifically 1990s — distinct from y2k (early 2000s) and vintage (broad).
        "patterns": [
            r"\b90'?s\b",
            r"\bnineties\b",
            r"\b1990s\b",
        ],
    },
    "cyberpunk": {
        "patterns": [r"\bcyber\s*punk\b", r"\bcyberpunk\s+aesthetic\b"],
    },
    "pixar": {
        "patterns": [
            r"\bpixar\s*(?:-?\s*inspired|style|like)?\b",
        ],
    },
    "double-exposure": {
        "patterns": [r"\bdouble[\s-]?exposure\b"],
    },
    "gradient": {
        # "Gradient" as a deliberate color treatment, not just any gradient.
        "patterns": [
            r"\b(?:color|colour)\s+gradient\b",
            r"\bgradient\s+(?:background|of\s+colors?|colour|color)\b",
            r"\b(?:vibrant|smooth|soft|pastel)\s+gradient\b",
        ],
    },
    "drinks": {
        # Distinct subject category from food: focuses on beverages.
        "patterns": [
            r"\b(beverages?|drinks?|cocktails?|smoothies?|mocktails?)\b",
            r"\b(matcha|cappuccino|espresso|latte|americano|frappuccino)\b",
            r"\biced\s+(coffee|tea|matcha|drink)\b",
            r"\b(green\s+drink|fruit\s+juice|kombucha)\b",
        ],
    },
    "desserts": {
        "patterns": [
            r"\bdessert(s)?\b",
            r"\b(cookies?|cake|pastry|pastries|macaron|tiramisu|cheesecake|brownie)\b",
            r"\bice\s+cream\b",
        ],
    },
    "outerwear": {
        # Apparel subject; deliberately excludes generic "shirt".
        "patterns": [
            r"\b(outerwear|jacket|coat|parka|trench\s*coat|blazer|hoodie|windbreaker|puffer)\b",
        ],
    },
    "streetwear": {
        "patterns": [
            r"\bstreet\s*(wear|style|fashion)\b",
            r"\burban\s+fashion\b",
            r"\bhypebeast\b",
            r"\boversized\s+hoodie\b",
        ],
    },
    "sneakers": {
        "patterns": [
            r"\bsneakers?\b",
            r"\b(nike|adidas|jordan|new\s+balance|yeezy)\s+(shoes?|sneakers?)\b",
            r"\b(running|athletic|trainer)\s+shoes\b",
        ],
    },
    "bedroom": {
        # Setting; avoid bare "bed" (too ambiguous).
        "patterns": [
            r"\bbedroom\b",
            r"\b(?:on|in)\s+(?:her|his|their|the)?\s*bed\b",
            r"\bnightstand\b",
            r"\bbedding\b",
        ],
    },
    "outdoor": {
        # Setting; pair with outdoor-specific terms.
        "patterns": [
            r"\boutdoors?\b",
            r"\bopen\s+air\b",
            r"\b(?:in|at)\s+the\s+wild\b",
            r"\bfield\s+(?:trip|outing)\b",
        ],
    },

    # ── 4 tags to PROMOTE (currently count=1, real signal in sample) ───
    "studio": {
        "patterns": [
            r"\b(photo|fashion|art|design)\s+studio\b",
            r"\bin\s+(?:the|a)\s+studio\b",
            r"\bstudio\s+(?:setting|shoot|lighting|portrait|background)\b",
            r"\bchic\s+studio\b",
        ],
    },
    "café": {
        # ASCII fallback also caught — café spelled "cafe" is common.
        "patterns": [
            r"\bcaf[eé]\b",
            r"\bcoffee\s+(shop|house|bar)\b",
            r"\bbistro\b",
        ],
    },
    "interior": {
        "patterns": [
            r"\binterior\s+(design|decor|setting|space|view)\b",
            r"\b(modern|minimalist|cozy|chic|luxurious)\s+interior\b",
            r"\b(living\s+room|dining\s+room)\b",
        ],
        "domain": ["Interior Design"],
    },
    "3d": {
        "patterns": [
            r"\b3d\s+(art|model(?:ing)?|render(?:ing)?|illustration|animation|character)\b",
            r"\bthree[\s-]dimensional\b",
            r"\bisometric\s+3d\b",
        ],
        "domain": ["3D Art & Modeling"],
    },
}


def build_haystack(p: dict) -> str:
    """One concatenated lowercased string for regex matching."""
    parts = [
        p.get("title", ""),
        p.get("description", ""),
        p.get("promptText", ""),
        p.get("topic", ""),
        p.get("domainCategory", ""),
        " ".join(p.get("tags") or []),
    ]
    return " ".join(str(s) for s in parts if s).lower()


def domain_matches(p: dict, domains: list[str]) -> bool:
    return (p.get("domainCategory") or "").lower() in {d.lower() for d in domains}


def qualifies(p: dict, rule: dict, haystack: str) -> bool:
    if "domain" in rule and domain_matches(p, rule["domain"]):
        return True
    return any(re.search(pat, haystack) for pat in rule["patterns"])


def main():
    data = json.loads(PROMPTS_PATH.read_text(encoding="utf-8"))
    prompts = data["prompts"]
    print(f"Loaded {len(prompts)} prompts from {PROMPTS_PATH.name}")

    # Before counts
    before = Counter()
    for p in prompts:
        for t in p.get("tags") or []:
            before[t.lower()] += 1

    # Pass 1: tag each prompt
    added_by_tag = Counter()
    for p in prompts:
        haystack = build_haystack(p)
        existing = set(t.lower() for t in (p.get("tags") or []))
        for tag, rule in TAG_RULES.items():
            if tag in existing:
                continue
            if qualifies(p, rule, haystack):
                tags = list(p.get("tags") or [])
                tags.append(tag)
                p["tags"] = tags
                existing.add(tag)
                added_by_tag[tag] += 1

    # After counts
    after = Counter()
    for p in prompts:
        for t in p.get("tags") or []:
            after[t.lower()] += 1

    print("\n=== Per-tag delta ===")
    print(f"  {'tag':<22} {'before':>7} {'added':>6} {'after':>7}")
    print(f"  {'-'*22} {'-'*7} {'-'*6} {'-'*7}")
    for tag in TAG_RULES.keys():
        b = before.get(tag, 0)
        a = after.get(tag, 0)
        added = added_by_tag.get(tag, 0)
        print(f"  {tag:<22} {b:>7} {added:>6} {a:>7}")

    # Persist updated prompts
    PROMPTS_PATH.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\n  wrote updated prompts to {PROMPTS_PATH}")

    # Regenerate metadata file (tag + count list, sorted desc).
    # Preserve any tags that aren't in TAG_RULES (the existing 144 stay
    # untouched in their count, since the rules don't fire on already-
    # tagged prompts).
    #
    # TAG_DENYLIST mirrors scripts/regen_nanobanana_metadata.cjs — keep
    # in sync. Filters internal-only and meta-shape tags that shouldn't
    # surface as canonical tag-listing pages. The underlying prompt
    # records still carry the strings; this filter is metadata-side only.
    TAG_DENYLIST = {
        "none",
        "subject",
        "text",
        "photograph",
        "realistic",
        "revealing-female",  # internal curation tag
    }
    all_tag_counts = Counter()
    for p in prompts:
        for t in p.get("tags") or []:
            tag = t.lower()
            if tag in TAG_DENYLIST:
                continue
            all_tag_counts[tag] += 1

    tag_list = [{"tag": tag, "count": n} for tag, n in all_tag_counts.most_common()]
    meta_doc = {"metadata": {"tags": tag_list}}
    META_PATH.write_text(json.dumps(meta_doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"  wrote regenerated metadata to {META_PATH}")
    print(f"  total tags in metadata: {len(tag_list)} (was 144)")


if __name__ == "__main__":
    main()
