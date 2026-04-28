#!/usr/bin/env python3
"""
Label MBTI types for character preview images using OpenAI Vision.

Usage:
    OPENAI_API_KEY=sk-... python3 scripts/label_mbti_types.py

Output:
    scripts/mbti_labels.json  — mapping of entry id -> {mbti, character_name, ip, template_id}
"""

import json
import os
import time
from pathlib import Path

from openai import OpenAI

CDN_BASE = "https://cdn.curify-ai.com"

UNIVERSE_TEMPLATES = {
    "template-mbti-ghibli":       "Ghibli",
    "template-mbti-breakingbad":  "Breaking Bad",
    "template-friends-character-mbti": "Friends",
    "template-mbti-marvel":       "Marvel",
    "template-mbti-nba":          "NBA",
}

VALID_TYPES = {
    "INTJ","INTP","ENTJ","ENTP",
    "INFJ","INFP","ENFJ","ENFP",
    "ISTJ","ISFJ","ESTJ","ESFJ",
    "ISTP","ISFP","ESTP","ESFP",
}

def load_entries():
    path = Path(__file__).parent.parent / "public" / "data" / "nano_inspiration.json"
    data = json.loads(path.read_text())
    results = []
    for entry in data:
        tid = entry.get("template_id", "")
        for template_prefix, ip in UNIVERSE_TEMPLATES.items():
            if tid == template_prefix or tid.startswith(template_prefix + "-"):
                preview = entry.get("asset", {}).get("preview_image_url")
                name = entry.get("params", {}).get("character_name") or entry.get("id")
                if preview:
                    results.append({
                        "id": entry["id"],
                        "template_id": tid,
                        "ip": ip,
                        "character_name": name,
                        "preview_url": CDN_BASE + preview,
                    })
                break
    return results

def ask_mbti(client, image_url: str, character_name: str, ip: str):
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            max_tokens=10,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image_url",
                            "image_url": {"url": image_url, "detail": "low"},
                        },
                        {
                            "type": "text",
                            "text": (
                                f"This is an MBTI personality card for {character_name} from {ip}. "
                                "What 4-letter MBTI type is displayed on this card? "
                                "Reply with ONLY the 4-letter type, nothing else (e.g. INTJ)."
                            ),
                        },
                    ],
                }
            ],
        )
        raw = response.choices[0].message.content.strip().upper()
        # extract just the 4-letter type in case of extra text
        for word in raw.split():
            if word in VALID_TYPES:
                return word
        print(f"  WARNING: unexpected response '{raw}' for {character_name}")
        return None
    except Exception as e:
        print(f"  ERROR calling OpenAI for {character_name}: {e}")
        return None

def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("Set OPENAI_API_KEY before running this script.")

    client = OpenAI(api_key=api_key)
    entries = load_entries()
    print(f"Found {len(entries)} entries across 5 universes.\n")

    results = {}
    for i, entry in enumerate(entries, 1):
        print(f"[{i}/{len(entries)}] {entry['ip']} — {entry['character_name']} ({entry['id']})")
        mbti = ask_mbti(client, entry["preview_url"], entry["character_name"], entry["ip"])
        print(f"  → {mbti}")
        results[entry["id"]] = {
            "mbti": mbti,
            "character_name": entry["character_name"],
            "ip": entry["ip"],
            "template_id": entry["template_id"],
            "preview_url": entry["preview_url"],
        }
        time.sleep(0.3)  # stay well under rate limit

    out_path = Path(__file__).parent / "mbti_labels.json"
    out_path.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\nDone. Results written to {out_path}")

    # summary
    from collections import defaultdict
    by_type = defaultdict(list)
    for entry_id, info in results.items():
        if info["mbti"]:
            by_type[info["mbti"]].append(f"{info['ip']}: {info['character_name']}")
    print("\n--- Labels by MBTI type ---")
    for t in sorted(by_type):
        print(f"  {t}: {', '.join(by_type[t])}")

    missing = [eid for eid, info in results.items() if not info["mbti"]]
    if missing:
        print(f"\nFailed to label {len(missing)} entries: {missing}")

if __name__ == "__main__":
    main()
