"""Enrich nano_templates.json `topics[]` for the 10 templates that fell
into the '(other)' visual-layer bucket during the 2026-06-18 audit.

Adds an existing format-indicating taxonomy slug (information-card,
posters, or learning) per template so each template now lands in its
correct visual-layer bucket. All added slugs have EN i18n in
messages/en/topics.json (verified 2026-06-19) — they become navigable
/topics/<slug> pages, not just matcher vocab.

Append-only: never removes existing topics, per the policy that topics[]
drives dedicated SEO pages.

Character + costume verdict: both prompts explicitly produce infographic
outputs (template-costume literally says 'generate a vertical 3:4
infographic'; template-character is a layered character design
breakdown). Both go to infographic, not flashcard.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"

ENRICH = {
    # → infographic (information-card = T2.learning, the canonical
    # single-subject card-format slug)
    "template-food":                          ["information-card"],
    "template-fruit":                         ["information-card"],
    "template-training-muscle-equipment":     ["information-card"],
    "template-character":                     ["information-card"],
    "template-costume":                       ["information-card"],
    # → poster (T2.design slug is 'posters' plural)
    "template-guofeng-scroll":                ["posters"],
    "template-constellation-steampunk":       ["posters"],
    "template-poetry-ink-wash-illustration":  ["posters"],
    # → learning-asset (T1 'learning' alongside existing 'guides')
    "template-fat-loss-plan":                 ["learning"],
    "template-warmup-routine":                ["learning"],
}


def main() -> None:
    tmpls = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    by_id = {t["id"]: t for t in tmpls}
    missing = [tid for tid in ENRICH if tid not in by_id]
    if missing:
        raise SystemExit(f"FAIL: missing templates {missing}")

    changes = []
    for tid, adds in ENRICH.items():
        t = by_id[tid]
        current = list(t.get("topics") or [])
        added = [a for a in adds if a not in current]
        if added:
            t["topics"] = current + added
            changes.append((tid, current, t["topics"]))

    TPL_PATH.write_text(
        json.dumps(tmpls, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  updated {len(changes)}/{len(ENRICH)} templates\n")
    for tid, before, after in changes:
        added = [x for x in after if x not in before]
        print(f"  {tid}")
        print(f"    before: {before}")
        print(f"    +added: {added}")


if __name__ == "__main__":
    main()
