"""Backfill per-example country topic tags on untagged WC examples.

Cycle-4 audit (2026-06-09) found 22 untagged WC examples across 4 templates.
Template-level topics[] already carries the boilerplate (sports, world-cup,
soccer, character, posters, etc.), so per-example tags add ONLY the country
tag (and history for retro/iconic examples). Country tags come from the
existing TIER3_GEO set in lib/searchIndex.ts:

  japan, korea, china, india, france, spain, italy, germany, mexico,
  brazil, thailand, vietnam, singapore, egypt, australia, greece,
  russia, portugal, uk, middle-east, united-states, iran

Examples for nations not in TIER3_GEO (Canada, Senegal, Morocco, Cape Verde,
Curacao, Uzbekistan, Saudi Arabia, Uruguay) get NO country tag — they still
surface via the template's inherited world-cup + sports topics. Expanding
TIER3_GEO for the long tail of WC 2026 nations is a separate strategic
decision (would need i18n in 10 locales per country).

Also sets template-level topics[] on template-world-cup-debut-team-preview-poster
(shipped with empty topics[] in patch-2 v8).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
INSPIRATIONS = ROOT / "public/data/nano_inspiration.json"
TEMPLATES = ROOT / "public/data/nano_templates.json"

# Per-example tag additions. Keys are full inspiration ids.
PER_EXAMPLE_TAGS = {
    # soccer-star-comic-retro-poster-card — player → country
    "template-soccer-star-comic-retro-poster-card-cristiano-ronaldo-portugal":
        ["portugal"],
    "template-soccer-star-comic-retro-poster-card-harry-kane-england":
        ["uk"],
    "template-soccer-star-comic-retro-poster-card-kilian-mbappe-france":
        ["france"],
    "template-soccer-star-comic-retro-poster-card-pedri-spain":
        ["spain"],
    "template-soccer-star-comic-retro-poster-card-thomas-muller-germany":
        ["germany"],
    "template-soccer-star-comic-retro-poster-card-zidane-2006-world-cup":
        ["france", "history"],
    "template-soccer-star-comic-retro-poster-card-ra-l-jim-nez-0tr5s38":     # Raul Jimenez
        ["mexico"],
    "template-soccer-star-comic-retro-poster-card-pulisic":                   # Christian Pulisic
        ["united-states"],
    "template-soccer-star-comic-retro-poster-card-03mdiig":                   # 奥乔亚 / Ochoa
        ["mexico"],
    # jonathan-david (Canada), sadio-mane (Senegal), achraf-hakimi (Morocco) →
    # no tier-3 country tag, inherit world-cup/sports only

    # player-vintage-stats-card-poster
    "template-player-vintage-stats-card-poster-france-brais-samba":
        ["france"],
    "template-player-vintage-stats-card-poster-france-dayot-upamecano":
        ["france"],
    "template-player-vintage-stats-card-poster-usa-chris-richards":
        ["united-states"],
    "template-player-vintage-stats-card-poster-usa-matt-turner":
        ["united-states"],

    # group-team-vertical-banner-country-poster
    "template-group-team-vertical-banner-country-poster-group-h-spain-caboverde-saudiarabia-uruguay":
        ["spain"],

    # world-cup-debut-team-preview-poster — all debut nations are outside TIER3_GEO
    # (Cape Verde, Curacao, Uzbekistan); skip per-example country tags, rely on
    # template-level boilerplate added below.
}

# Template-level boilerplate for templates shipped with empty topics[]
TEMPLATE_TOPICS_FIX = {
    "template-world-cup-debut-team-preview-poster": [
        "sports", "world-cup", "soccer", "groups", "posters",
    ],
}


def main():
    insp = json.loads(INSPIRATIONS.read_text(encoding="utf-8"))
    by_id = {e["id"]: e for e in insp}

    applied = 0
    skipped = []
    for eid, tags in PER_EXAMPLE_TAGS.items():
        e = by_id.get(eid)
        if not e:
            skipped.append(eid)
            continue
        existing = e.get("topics") or []
        merged = list(dict.fromkeys(existing + tags))  # dedupe, preserve order
        e["topics"] = merged
        applied += 1
        print(f"  {eid[-70:]}: + {tags}")

    if skipped:
        print(f"\nSKIPPED (id not found): {len(skipped)}")
        for s in skipped:
            print(f"  {s}")

    INSPIRATIONS.write_text(json.dumps(insp, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nApplied per-example tags to {applied} inspirations.")

    # Template-level boilerplate fix
    tpls = json.loads(TEMPLATES.read_text(encoding="utf-8"))
    tpl_by_id = {t["id"]: t for t in tpls}
    tpl_applied = 0
    for tid, topics in TEMPLATE_TOPICS_FIX.items():
        t = tpl_by_id.get(tid)
        if not t:
            print(f"TEMPLATE SKIP (id not found): {tid}")
            continue
        existing = t.get("topics") or []
        if existing:
            print(f"  template {tid}: already has topics={existing}, skipping")
            continue
        t["topics"] = topics
        tpl_applied += 1
        print(f"  template {tid}: set topics={topics}")
    if tpl_applied:
        TEMPLATES.write_text(json.dumps(tpls, indent=2, ensure_ascii=False), encoding="utf-8")
        print(f"Applied template-level boilerplate to {tpl_applied} templates.")


if __name__ == "__main__":
    main()
