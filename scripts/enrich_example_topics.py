"""Per-example topic enrichment + redundant-tag pruning.

Two passes, both run from the same `topics` registry vs template boilerplate:

(a) ENRICHER — for under-tagged examples on a curated set of templates,
    derive subject topic(s) from `params.<key>` via per-template rules.
    Adds tier-3 subjects (food-and-drink / nature / animals / weather /
    space / china etc.) that are sitting in params today but absent from
    `topics[]`. Covers 6 high-volume templates that account for ~250 of
    the 2,334 under-tagged examples.

(b) PRUNER — for over-tagged examples (≥6 topics), drop any topic that
    is already on the parent template. Per memory
    feedback_template_topics_should_be_boilerplate.md: template.topics
    is boilerplate (Info-Type + Layout); per-example topics should carry
    ONLY the variable subject. Redundant boilerplate on examples is
    cosmetic noise — the runtime union still surfaces it via the
    template_subjects reverse map.

After both passes, build_template_subjects.cjs should be re-run so the
reverse map picks up the new tier-3 entries.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSP = ROOT / "public/data/nano_inspiration.json"
TPL = ROOT / "public/data/nano_templates.json"


# Per-template enrichment rules. Each rule: (param_key, [(regex, [topics])]).
# The regex is matched case-insensitively against the param value.
# Topics added are deduped on insert.
ENRICH_RULES = {
    "template-kids-vocabulary-poster": ("theme_name", [
        (r"fruit|vegetable",                  ["food-and-drink"]),
        (r"animal|insect|sea\s*animal",       ["animals"]),
        (r"weather",                          ["weather"]),
        (r"body|anatom",                      ["body"]),
        (r"emotion|feeling",                  ["emotions"]),
        (r"music|instrument",                 ["school"]),
        (r"transport|vehicle",                ["transportation"]),
        (r"school|classroom",                 ["school"]),
        (r"famil",                            ["family"]),
        (r"plant|flower|tree|nature",         ["nature"]),
        (r"space|planet|star",                ["space"]),
        (r"celebra|festival|holiday",         ["celebration"]),
    ]),
    "template-herbal": ("herb_name", [
        # Every herbal example gets `nature` since the variable subject is a
        # specific plant; herb-specific names aren't in our TIER3/4 vocab.
        (r".+",                               ["nature"]),
    ]),
    "template-vocabulary": ("topic_name", [
        (r"animal",                           ["animals"]),
        (r"weather",                          ["weather"]),
        (r"space|planet|star",                ["space"]),
        (r"food|drink|fruit|coffee|banana|cuisine", ["food-and-drink"]),
        (r"body|anatomy",                     ["body"]),
        (r"emotion|feeling",                  ["emotions"]),
        (r"family",                           ["family"]),
        (r"school|classroom",                 ["school"]),
        (r"transport|vehicle",                ["transportation"]),
        (r"plant|tree|flower|nature",         ["nature"]),
    ]),
    "template-food": ("food_name", [
        (r".+",                               ["food-and-drink"]),
        (r"italian|pasta|pizza|risotto",      ["italy"]),
        (r"korean|kimchi|bibimbap|bulgogi",   ["korea"]),
        (r"japan|sushi|ramen|tempura|sukiyaki|udon|miso", ["japan"]),
        (r"chinese|peking|sichuan|cantonese|dim\s*sum|guilin|kut\s*teh", ["china"]),
        (r"thai|pad\s*thai|tom\s*yum",        ["thailand"]),
        (r"vietnam|pho|banh|spring\s*roll",   ["vietnam"]),
        (r"indian|curry|biryani|naan",        ["india"]),
        (r"mexican|taco|burrito|enchilada",   ["mexico"]),
        (r"french|baguette|croissant|coq",    ["france"]),
        (r"spanish|paella|tapas",             ["spain"]),
        (r"brazil|feijoada|moqueca",          ["brazil"]),
    ]),
    "template-travel": ("destination", [
        # Chinese cities (the bulk of current examples)
        (r"beijing|shanghai|guangzhou|shenzhen|chengdu|chongqing|"
         r"xi'?an|sanya|hangzhou|nanjing|tianjin|xishuangbanna|harbin|"
         r"qingdao|wuhan|kunming|dalian|suzhou", ["china"]),
        # Other countries' famous cities
        (r"tokyo|kyoto|osaka|hokkaido|okinawa", ["japan"]),
        (r"seoul|busan|jeju",                  ["korea"]),
        (r"paris|nice|marseille|lyon",         ["france"]),
        (r"barcelona|madrid|seville|valencia", ["spain"]),
        (r"rome|milan|venice|florence",        ["italy"]),
        (r"berlin|munich|hamburg",             ["germany"]),
        (r"london|edinburgh|manchester",       ["uk"]),
        (r"new\s*york|los\s*angeles|chicago|miami|san\s*francisco|boston|"
         r"vegas",                             ["united-states"]),
        (r"mexico|cancun|tulum|cdmx",          ["mexico"]),
        (r"bangkok|phuket|chiang\s*mai",       ["thailand"]),
        (r"hanoi|saigon|ho\s*chi\s*minh|halong", ["vietnam"]),
        (r"singapore",                         ["singapore"]),
        (r"cairo|alexandria|luxor",            ["egypt"]),
        (r"sydney|melbourne|brisbane",         ["australia"]),
        (r"athens|santorini|crete",            ["greece"]),
        (r"moscow|st\.?\s*petersburg",         ["russia"]),
        (r"lisbon|porto",                      ["portugal"]),
        (r"tehran|isfahan|shiraz",             ["iran"]),
        (r"delhi|mumbai|bangalore|jaipur|agra", ["india"]),
        (r"sao\s*paulo|rio\s*de\s*janeiro",    ["brazil"]),
    ]),
    "template-costume": ("costume_style", [
        # All present examples are dynastic / Chinese-opera — China geo + culture
        (r"beijing|peking|opera|ming|qing|tang|song|han|chinese|hanfu|buzi|"
         r"qixiong|dragon\s*robe|cheongsam|qipao", ["china"]),
        (r"kimono|yukata|haori|japanese", ["japan"]),
        (r"hanbok|korean",                ["korea"]),
        (r"saree|indian|kurta",           ["india"]),
        (r"thai|sinh",                    ["thailand"]),
        (r"vietnam|ao\s*dai",             ["vietnam"]),
    ]),
}


def _matches(pattern: str, value: str) -> bool:
    return bool(re.search(pattern, value, re.IGNORECASE))


def enrich(insp, tpl_by_id):
    """Pass (a): add tier-3 subject topics on under-tagged examples per rules."""
    added_per_template = {}
    for e in insp:
        tid = e.get("template_id")
        rule = ENRICH_RULES.get(tid)
        if not rule:
            continue
        # Skip if already tagged (>=3 topics) — the rules are for under-tagged.
        if len(e.get("topics") or []) >= 3:
            continue
        param_key, patterns = rule
        value = (e.get("params") or {}).get(param_key)
        if not value or not isinstance(value, str):
            continue
        existing = list(e.get("topics") or [])
        added: list[str] = []
        for pat, topics in patterns:
            if _matches(pat, value):
                for t in topics:
                    if t not in existing and t not in added:
                        added.append(t)
        if added:
            e["topics"] = existing + added
            added_per_template[tid] = added_per_template.get(tid, 0) + 1
    return added_per_template


def prune(insp, tpl_by_id):
    """Pass (b): drop boilerplate topics from over-tagged examples (≥6 topics)."""
    pruned_per_template = {}
    total_removed = 0
    for e in insp:
        topics = list(e.get("topics") or [])
        if len(topics) < 6:
            continue
        tid = e.get("template_id")
        tpl_topics = set((tpl_by_id.get(tid) or {}).get("topics") or [])
        if not tpl_topics:
            continue
        kept = [t for t in topics if t not in tpl_topics]
        # Only persist if we actually dropped something AND we leave at least
        # 1 subject topic on the example. If the entire topics set was
        # boilerplate, leave it alone — that's a different (under-tagged)
        # problem the enricher should address.
        removed = [t for t in topics if t in tpl_topics]
        if removed and kept:
            e["topics"] = kept
            pruned_per_template[tid] = pruned_per_template.get(tid, 0) + 1
            total_removed += len(removed)
    return pruned_per_template, total_removed


def main():
    insp = json.loads(INSP.read_text(encoding="utf-8"))
    tpl = json.loads(TPL.read_text(encoding="utf-8"))
    tpl_by_id = {t["id"]: t for t in tpl}

    print("=== Pass (a): enrich under-tagged examples ===")
    enriched = enrich(insp, tpl_by_id)
    total_enriched = sum(enriched.values())
    for tid, n in sorted(enriched.items(), key=lambda kv: -kv[1]):
        print(f"  +{n:>4} examples enriched on {tid}")
    print(f"  TOTAL: {total_enriched} examples enriched")

    print()
    print("=== Pass (b): prune redundant boilerplate from over-tagged examples ===")
    pruned, total_removed = prune(insp, tpl_by_id)
    for tid, n in sorted(pruned.items(), key=lambda kv: -kv[1]):
        print(f"  -{n:>4} examples pruned on {tid}")
    print(f"  TOTAL: {sum(pruned.values())} examples pruned, {total_removed} topic-entries removed")

    INSP.write_text(json.dumps(insp, indent=2, ensure_ascii=False), encoding="utf-8")
    print()
    print(f"  wrote {INSP}")


if __name__ == "__main__":
    main()
