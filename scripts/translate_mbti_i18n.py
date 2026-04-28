#!/usr/bin/env python3
"""
Translate the 17 new personality/mbti-* topic entries from en/home.json
into all other locale home.json files using OpenAI.

Usage:
    OPENAI_API_KEY=sk-... python3 scripts/translate_mbti_i18n.py
"""

import json, os, time
from pathlib import Path
from openai import OpenAI

ROOT = Path(__file__).parent.parent / "messages"

LOCALE_NAMES = {
    "zh": "Simplified Chinese",
    "ja": "Japanese",
    "ko": "Korean",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "hi": "Hindi",
    "ru": "Russian",
    "tr": "Turkish",
}

NEW_KEYS = [
    "personality",
    "mbti-intj","mbti-intp","mbti-entj","mbti-entp",
    "mbti-infj","mbti-infp","mbti-enfj","mbti-enfp",
    "mbti-istj","mbti-isfj","mbti-estj","mbti-esfj",
    "mbti-istp","mbti-isfp","mbti-estp","mbti-esfp",
]

def get_en_entries():
    en = json.loads((ROOT / "en" / "home.json").read_text())
    topics = en.get("topics", en)  # handle both flat and nested
    # walk to find the keys
    for section in en.values() if isinstance(en, dict) else [en]:
        if isinstance(section, dict):
            for k in NEW_KEYS:
                if k in section:
                    return {k: section[k] for k in NEW_KEYS if k in section}
    return {}

def find_topic_section(data: dict):
    """Return the dict that contains topic slug keys."""
    for v in data.values():
        if isinstance(v, dict) and "mbti" in v:
            return v
    return data

def translate(client, entries: dict, lang_name: str) -> dict:
    prompt = (
        f"Translate the following JSON topic metadata entries from English to {lang_name}. "
        "Keep JSON keys unchanged. Translate only the values of 'displayName', 'title', and 'description'. "
        "Keep MBTI type codes (INTJ, ENFP, etc.) and proper nouns (Ghibli, Marvel, Breaking Bad, Friends) unchanged. "
        "Return only valid JSON, no markdown fences.\n\n"
        + json.dumps(entries, ensure_ascii=False, indent=2)
    )
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        max_tokens=4000,
        messages=[{"role": "user", "content": prompt}],
    )
    raw = resp.choices[0].message.content.strip()
    # strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0]
    return json.loads(raw)

def main():
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise SystemExit("Set OPENAI_API_KEY before running.")

    client = OpenAI(api_key=api_key)

    en_path = ROOT / "en" / "home.json"
    en_data = json.loads(en_path.read_text())
    topic_section_en = find_topic_section(en_data)
    en_entries = {k: topic_section_en[k] for k in NEW_KEYS if k in topic_section_en}

    print(f"Found {len(en_entries)} entries to translate.\n")

    for locale, lang_name in LOCALE_NAMES.items():
        path = ROOT / locale / "home.json"
        if not path.exists():
            print(f"  SKIP {locale} — home.json not found")
            continue

        data = json.loads(path.read_text())
        topic_section = find_topic_section(data)

        already = [k for k in NEW_KEYS if k in topic_section]
        if len(already) == len(NEW_KEYS):
            print(f"  SKIP {locale} — all entries already present")
            continue

        print(f"  Translating {lang_name} ({locale})...")
        translated = translate(client, en_entries, lang_name)

        # merge into the topic section
        for k, v in translated.items():
            topic_section[k] = v

        path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
        print(f"  Done {locale}.")
        time.sleep(0.5)

    print("\nAll locales updated.")

if __name__ == "__main__":
    main()
