#!/usr/bin/env python3
"""
Apply MBTI labels from mbti_labels.json to nano_inspiration.json,
and generate public/data/mbti_characters.json for the quiz widget.

Run AFTER label_mbti_types.py has produced scripts/mbti_labels.json.

Usage:
    python3 scripts/apply_mbti_labels.py
"""

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).parent.parent
LABELS_PATH  = Path(__file__).parent / "mbti_labels.json"
INSP_PATH    = ROOT / "public" / "data" / "nano_inspiration.json"
OUT_PATH     = ROOT / "public" / "data" / "mbti_characters.json"

UNIVERSE_TEMPLATES = {
    "template-mbti-ghibli":            "Ghibli",
    "template-mbti-breakingbad":       "Breaking Bad",
    "template-friends-character-mbti": "Friends",
    "template-mbti-marvel":            "Marvel",
    "template-mbti-nba":               "NBA",
}

def get_ip(template_id: str) -> str | None:
    for prefix, ip in UNIVERSE_TEMPLATES.items():
        if template_id == prefix or template_id.startswith(prefix + "-"):
            return ip
    return None

def main():
    if not LABELS_PATH.exists():
        raise SystemExit(f"Labels file not found: {LABELS_PATH}\nRun label_mbti_types.py first.")

    labels: dict = json.loads(LABELS_PATH.read_text())
    insp: list   = json.loads(INSP_PATH.read_text())

    # Build lookup: entry id → label info
    label_map = {eid: info for eid, info in labels.items() if info.get("mbti")}
    print(f"Loaded {len(label_map)} labelled entries.")

    patched = 0
    for entry in insp:
        info = label_map.get(entry["id"])
        if not info:
            continue
        mbti_tag = f"mbti-{info['mbti'].lower()}"
        topics = entry.get("topics") or []
        # remove any stale mbti-* tags then add the correct one
        topics = [t for t in topics if not t.startswith("mbti-")]
        topics.append(mbti_tag)
        entry["topics"] = topics
        patched += 1

    print(f"Patched {patched} entries in nano_inspiration.json.")
    INSP_PATH.write_text(json.dumps(insp, indent=2, ensure_ascii=False) + "\n")

    # Build mbti_characters.json  {MBTI_TYPE: [{name, img, ip, templateSlug}]}
    by_type: dict[str, list] = defaultdict(list)
    seen_ids: set[str] = set()

    for entry in insp:
        info = label_map.get(entry["id"])
        if not info:
            continue
        mbti = info["mbti"]
        ip   = get_ip(entry.get("template_id", ""))
        if not ip:
            continue
        preview = entry.get("asset", {}).get("preview_image_url")
        name    = entry.get("params", {}).get("character_name") or entry["id"]
        slug    = entry.get("template_id", "")

        dedup_key = f"{mbti}:{ip}:{name}"
        if dedup_key in seen_ids:
            continue
        seen_ids.add(dedup_key)

        by_type[mbti].append({
            "name":         name,
            "img":          preview,
            "ip":           ip,
            "templateSlug": slug,
        })

    # Sort each list by ip for consistent ordering
    for mbti in by_type:
        by_type[mbti].sort(key=lambda c: c["ip"])

    OUT_PATH.write_text(json.dumps(by_type, indent=2, ensure_ascii=False) + "\n")
    print(f"Generated {OUT_PATH.name} with {sum(len(v) for v in by_type.values())} character entries.")

    print("\n--- Characters per MBTI type ---")
    for t in sorted(by_type):
        names = ", ".join(f"{c['ip']}: {c['name']}" for c in by_type[t])
        print(f"  {t}: {names}")

    missing = set([
        "INTJ","INTP","ENTJ","ENTP",
        "INFJ","INFP","ENFJ","ENFP",
        "ISTJ","ISFJ","ESTJ","ESFJ",
        "ISTP","ISFP","ESTP","ESFP",
    ]) - set(by_type.keys())
    if missing:
        print(f"\nWARNING: No characters found for: {sorted(missing)}")

if __name__ == "__main__":
    main()
