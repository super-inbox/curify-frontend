"""LLM-driven multi-label output-type tagging for nano_templates.json.

For each of the 287 templates, asks gpt-4o-mini which of the 19 newly-
added (or newly-i18n'd) output-type slugs apply. Validates against the
allowed vocabulary; merges into template.topics[] (append-only — never
removes existing topics, per the SEO-pages constraint).

Mirrors scripts/enrich_inspiration_tags_phase3_2026-06-18.py (which did
the same pattern for 3071 inspirations at ~$1 total cost).

Usage:
  # Pilot 15 templates dry-run
  OPENAI_API_KEY=... python3 scripts/tag_templates_output_types_2026-06-19.py --limit 15 --sample --dry-run

  # Full pass
  OPENAI_API_KEY=... python3 scripts/tag_templates_output_types_2026-06-19.py --concurrency 12
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    print("openai package not installed", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"

MODEL = "gpt-4o-mini"

# The 19 output-type slugs introduced in commit 81896cda. Any tag the
# LLM proposes outside this set is dropped silently — keeps the pass
# strictly scoped to "what users want to MAKE" and prevents drift into
# other taxonomy axes that already have good coverage from Phase 3.
ALLOWED_SLUGS = [
    # 5 vocab-only entries newly localized
    "infographic", "anatomy", "comic", "step-by-step-tutorial", "illustration",
    # 14 newly added entries
    "flashcards", "recipes", "mind-maps", "study-sheets", "art-prints",
    "wall-art", "memes", "social-media-posts", "stickers", "mascots",
    "character-ip", "fan-art", "selfies", "scrapbooks",
]
ALLOWED_SET = set(ALLOWED_SLUGS)


SYSTEM_PROMPT = """You are a precise output-type classifier for AI image-generation templates.

Each template produces a particular kind of visual asset (a flashcard, a poster, a sticker, an infographic, etc.). You must identify ALL output types that genuinely describe the template's primary output, drawn STRICTLY from a fixed vocabulary.

Rules:
  - Only return slugs from the provided vocabulary. Never invent slugs.
  - Multi-label: a template may produce multiple output types (e.g. a vocabulary poster is BOTH 'flashcards' and 'wall-art' if it's poster-sized; an infographic that doubles as wall art gets 'infographic' AND 'wall-art').
  - Be conservative — only tag what the template GENUINELY produces. Don't stretch ("learning poster" ≠ 'flashcards' unless it's actually a flashcard).
  - Skip slugs that are clearly inapplicable. Most templates will match 0-3 slugs from this vocabulary.
  - If nothing applies cleanly, return an empty list. That's fine.
  - Output JSON: {"output_types": ["slug1", "slug2", ...]}

Vocabulary semantics (so you classify correctly):
  - flashcards: a single-subject card meant for learning/study (vocabulary card, MBTI card, character card)
  - infographic: data-rich visual with multiple panels/labels/diagrams
  - anatomy: structural breakdown / exploded view / labeled parts
  - comic: comic panel / sequential art / strip
  - illustration: stylized drawn imagery (default for kawaii/cartoon/watercolor outputs)
  - step-by-step-tutorial: how-to or procedural sequence with steps
  - mind-maps: central concept with radiating branches
  - study-sheets: worksheet, fill-in, practice exercise sheet
  - art-prints / wall-art: poster-format decorative wall hanging (use both if it's clearly that)
  - memes: humorous / meme-format image
  - social-media-posts: square/portrait social-feed-format content (Instagram/Xiaohongshu style)
  - stickers: cutout sticker / sticker-pack format
  - mascots: brand mascot / cute character figure
  - character-ip: original character intellectual property
  - fan-art: derivative work of an existing character/franchise
  - selfies: portrait-style AI personal photo
  - recipes: cooking recipe card / food preparation guide
  - scrapbooks: scrapbook/collage/travel-journal aesthetic"""


def build_user_prompt(t: dict) -> str:
    en = (t.get("locales") or {}).get("en") or {}
    base_prompt = (en.get("base_prompt") or "")[:1800]  # cap to keep cost low
    topics = t.get("topics") or []
    return f"""Vocabulary (use ONLY these slugs):
{json.dumps(ALLOWED_SLUGS)}

Template:
  id: {t.get("id")}
  current topics: {json.dumps(topics)}
  base_prompt: {base_prompt}

Which output types from the vocabulary does this template's output match?"""


def classify_one(client, tpl: dict):
    try:
        res = client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            temperature=0.1,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": build_user_prompt(tpl)},
            ],
        )
        text = res.choices[0].message.content or "{}"
        parsed = json.loads(text)
        proposed = parsed.get("output_types") or []
        if not isinstance(proposed, list):
            return (tpl["id"], [], [])
        kept, dropped = [], []
        for s in proposed:
            if not isinstance(s, str):
                continue
            slug = s.strip().lower()
            if slug in ALLOWED_SET:
                kept.append(slug)
            else:
                dropped.append(s)
        return (tpl["id"], kept, dropped)
    except Exception as e:
        return (tpl["id"], [], [f"ERROR: {e}"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sample", action="store_true")
    args = ap.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    tmpls = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    targets = list(tmpls)
    if args.sample and args.limit:
        random.seed(11)
        targets = random.sample(targets, min(args.limit, len(targets)))
    elif args.limit:
        targets = targets[: args.limit]

    print(f"Vocab size: {len(ALLOWED_SLUGS)} output-type slugs")
    print(f"Processing {len(targets)} templates (concurrency={args.concurrency}, dry_run={args.dry_run})\n")

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], timeout=60.0)
    results = {}
    drops = {}
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futs = {pool.submit(classify_one, client, t): t["id"] for t in targets}
        done = 0
        for fut in as_completed(futs):
            tid, kept, dropped = fut.result()
            results[tid] = kept
            if dropped:
                drops[tid] = dropped
            done += 1
            if done % 25 == 0:
                print(f"  ...{done}/{len(targets)}")

    # Sample preview
    by_id = {t["id"]: t for t in tmpls}
    sample_ids = list(results.keys())[:8]
    print("\n── SAMPLE CLASSIFICATIONS ──")
    for tid in sample_ids:
        t = by_id[tid]
        existing = t.get("topics") or []
        new = results[tid]
        added = sorted(set(new) - set(existing))
        print(f"\n▸ {tid}")
        print(f"  existing topics: {existing}")
        print(f"  + output types:  {new}")
        print(f"  net new tags:    {added}")

    # Stats
    by_slug = {}
    for tid, slugs in results.items():
        for s in slugs:
            by_slug.setdefault(s, 0)
            by_slug[s] += 1
    print(f"\n── COVERAGE PER SLUG ──")
    for slug in ALLOWED_SLUGS:
        print(f"  {slug:<22}  {by_slug.get(slug, 0):>4}")

    errors = {k: v for k, v in drops.items() if v and v[0].startswith("ERROR")}
    invalid = {k: v for k, v in drops.items() if v and not v[0].startswith("ERROR")}
    print(f"\n  errored: {len(errors)} | dropped-invalid: {len(invalid)}")
    if errors:
        for k, v in list(errors.items())[:3]:
            print(f"    {k}: {v[0]}")

    if args.dry_run:
        would_change = sum(1 for t in targets if (set(results.get(t["id"], [])) - set(t.get("topics") or [])))
        print(f"\n[dry-run] would update {would_change} templates")
        return

    changed = 0
    for t in tmpls:
        new = results.get(t["id"])
        if not new:
            continue
        existing = t.get("topics") or []
        added = [s for s in new if s not in existing]
        if added:
            t["topics"] = existing + added
            changed += 1

    TPL_PATH.write_text(json.dumps(tmpls, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"\n  updated {changed} templates, wrote {TPL_PATH}")


if __name__ == "__main__":
    main()
