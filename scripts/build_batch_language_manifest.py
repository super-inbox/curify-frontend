#!/usr/bin/env python3
"""Generate a batch-generation manifest for the low-language templates.

Output: scripts/batch_language_manifest_<date>.json — one entry per
(template_id, target language_pair, topic_name | scene_type), capped at
10 themes × 2 templates × 4 low-languages = 80 entries.

The manifest is the handoff artifact to whatever image-generation
pipeline produces the actual JPGs. Each entry carries:
  - target inspiration id  (the id the catalog will use once images land)
  - template_id            (template-vocabulary or template-word-scene)
  - params                 (language_pair + topic_name|scene_type)
  - expected image path    (where the generator should drop the file)
  - expected preview path  (where the preview thumbnail lands)

Topic and scene curation: 10 universal, culture-agnostic vocabulary
themes and 10 universal scenes — chosen because they map cleanly to
every target language without requiring locale-specific adaptation.

Re-run with `--themes ...` / `--scenes ...` / `--langs ...` to override.
"""
import argparse
import json
import re
from datetime import date
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')

# Low-languages: everything in the SUPPORTED_LANGUAGE_PAIRS picker
# *except* en-zh. ko/ja/es each have ~3-4 examples per language template
# today; fr was orphaned under the old "English-French" label until the
# previous commit normalized it.
DEFAULT_LANGS = ['en-ko', 'en-ja', 'en-es', 'en-fr']

# Long-form label per pair (matches the existing ID convention
# `template-vocabulary-english-<long-lang>-<topic-slug>`).
LANG_LONG = {
    'en-ko': 'english-korean',
    'en-ja': 'english-japanese',
    'en-es': 'english-spanish',
    'en-fr': 'english-french',
}

# Curated topic_names for template-vocabulary. Universal foundational
# vocabulary — works for every target language without locale-specific
# adaptation. Drawn from the existing en-zh set (106 distinct topics)
# to ensure they pair cleanly with the prompt the template already
# emits in en-zh.
DEFAULT_VOCAB_THEMES = [
    "Numbers and Counting",
    "Rainbow Colors",
    "Fruits",
    "Vegetables",
    "Farm Animals",
    "Family Members",
    "Body Parts",
    "Weather",
    "Daily Routines",
    "Breakfast Foods",
]

# Curated scene_types for template-word-scene. Universal scenes — same
# rationale as the vocabulary themes; drawn from the existing en-zh
# scene_type set so each scene has a known-good base prompt.
DEFAULT_SCENES = [
    "Park",
    "Restaurant",
    "Classroom",
    "Kitchen",
    "Beach",
    "Library",
    "Hospital",
    "Grocery Store",
    "Airport",
    "Living Room",
]


def slugify(s: str) -> str:
    """Match the existing record-id slug convention: lowercase, kebab."""
    s = s.lower()
    s = re.sub(r"[^a-z0-9]+", "-", s)
    return s.strip("-")


def vocab_entries(langs, themes):
    out = []
    for pair in langs:
        long_lang = LANG_LONG[pair]
        for theme in themes:
            slug = slugify(theme)
            rec_id = f"template-vocabulary-{long_lang}-{slug}"
            out.append({
                "id": rec_id,
                "template_id": "template-vocabulary",
                "params": {
                    "language_pair": pair,
                    "topic_name": theme,
                },
                "expected_image": f"/images/nano_insp/{rec_id}.jpg",
                "expected_preview": f"/images/nano_insp_preview/{rec_id}-prev.jpg",
                "topics_seed": ["english-" + pair.split("-", 1)[1]],
            })
    return out


def word_scene_entries(langs, scenes):
    out = []
    for pair in langs:
        long_lang = LANG_LONG[pair]
        for scene in scenes:
            slug = slugify(scene)
            rec_id = f"template-word-scene-{long_lang}-{slug}"
            out.append({
                "id": rec_id,
                "template_id": "template-word-scene",
                "params": {
                    "language_pair": pair,
                    "scene_type": scene,
                },
                "expected_image": f"/images/nano_insp/{rec_id}.jpg",
                "expected_preview": f"/images/nano_insp_preview/{rec_id}-prev.jpg",
                "topics_seed": ["english-" + pair.split("-", 1)[1]],
            })
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--langs", nargs="+", default=DEFAULT_LANGS,
                    help="Language pairs to generate for (e.g. en-ko en-fr)")
    ap.add_argument("--themes", nargs="+", default=DEFAULT_VOCAB_THEMES,
                    help="topic_name values for template-vocabulary")
    ap.add_argument("--scenes", nargs="+", default=DEFAULT_SCENES,
                    help="scene_type values for template-word-scene")
    ap.add_argument("--out", default=None,
                    help="Output path (default: scripts/batch_language_manifest_<today>.json)")
    args = ap.parse_args()

    all_entries = vocab_entries(args.langs, args.themes) + \
                  word_scene_entries(args.langs, args.scenes)

    # Drop entries whose target id already exists in the catalog —
    # avoids overwriting curated work and keeps the gen pipeline focused
    # on the actual gaps.
    imgs = json.loads((REPO / "public/data/nano_inspiration.json").read_text(encoding="utf-8"))
    existing_ids = {i["id"] for i in imgs}
    entries = [e for e in all_entries if e["id"] not in existing_ids]
    skipped = [e["id"] for e in all_entries if e["id"] in existing_ids]

    today = date.today().isoformat()
    out_path = Path(args.out) if args.out else REPO / f"scripts/batch_language_manifest_{today}.json"
    manifest = {
        "generated_at": today,
        "langs": list(args.langs),
        "vocab_themes": list(args.themes),
        "scenes": list(args.scenes),
        "count": len(entries),
        "skipped_already_exist": skipped,
        "entries": entries,
    }
    out_path.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
                        encoding="utf-8")
    print(f"Wrote {len(entries)} entries to {out_path}")
    print(f"  langs:           {args.langs}")
    print(f"  vocab themes:    {len(args.themes)} for template-vocabulary")
    print(f"  scenes:          {len(args.scenes)} for template-word-scene")
    print(f"  skipped existing: {len(skipped)}")
    for s in skipped:
        print(f"    - {s}")


if __name__ == "__main__":
    main()
