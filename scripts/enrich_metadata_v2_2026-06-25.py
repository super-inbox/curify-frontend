"""P0.1 — Metadata Expansion v2 (2026-06-25).

Phase 3 (commit df03c8cb) gave inspirations an avg of 5 tags/record via
gpt-4o-mini, constrained to the existing taxonomy vocab. This script
broadens that pass:

  - Targets 30-50 tags per record across NINE axes (subject, style,
    scene, material, era, mood, audience, output, composition).
  - Spans inspirations (3071), templates (296), and gallery prompts
    (4117) — Phase 3 only hit inspirations.
  - VALIDATES against the union of taxonomy slugs (T1-4 + audience),
    dropping invalid suggestions silently (no hallucinated tags).
  - Append-only on existing tags[]; never removes Phase 3 work.

Usage:
  # Pilot 20 records dry-run (no write)
  OPENAI_API_KEY=... python3 scripts/enrich_metadata_v2_2026-06-25.py \\
      --kind inspirations --limit 20 --sample --dry-run

  # Full pass on inspirations
  OPENAI_API_KEY=... python3 scripts/enrich_metadata_v2_2026-06-25.py \\
      --kind inspirations --concurrency 12

  # Then templates + gallery prompts
  OPENAI_API_KEY=... python3 scripts/enrich_metadata_v2_2026-06-25.py --kind templates
  OPENAI_API_KEY=... python3 scripts/enrich_metadata_v2_2026-06-25.py --kind gallery
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Optional

try:
    from openai import OpenAI
except ImportError:
    print("openai package not installed", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
PATHS = {
    "inspirations": ROOT / "public" / "data" / "nano_inspiration.json",
    "templates":    ROOT / "public" / "data" / "nano_templates.json",
    "gallery":      ROOT / "public" / "data" / "nanobanana.json",
}
TAX_PATH = ROOT / "lib" / "taxonomy.json"
MODEL = "gpt-4o-mini"

# Target band: 30-50 tags. Below 30 = too thin for compound-query recall;
# above 50 = diminishing return + drift into noise.
TARGET_MIN_TAGS = 25
TARGET_MAX_TAGS = 55


def slugify(s: str) -> str:
    return s.lower().replace(" ", "-")


def build_vocab(tax: dict) -> dict:
    return {
        "subject_t1":   list(tax.get("tier1", [])),
        "subject_t2":   sorted({s for v in tax.get("tier2", {}).values() for s in v}),
        "subject_t3":   sorted({s for v in tax.get("tier3", {}).values() for s in v}),
        "entities_t4":  sorted({slugify(s) for k, v in tax.get("tier4", {}).items() if k != "_note" for s in v}),
        "audience":     list(tax.get("audience", [])),
    }


def build_valid_set(tax: dict) -> set:
    valid = set()
    for t in tax.get("tier1", []):
        valid.add(t.lower()); valid.add(slugify(t))
    for tier in ("tier2", "tier3", "tier4"):
        for k, v in tax.get(tier, {}).items():
            if k == "_note": continue
            if isinstance(v, list):
                for x in v:
                    valid.add(str(x).lower()); valid.add(slugify(str(x)))
    for a in tax.get("audience", []):
        valid.add(a.lower()); valid.add(slugify(a))
    return valid


SYSTEM_PROMPT = """You are a precise multi-axis tagger for visual content cards in an AI image-generation catalog.

For each record, return 30-50 GRANULAR tags drawn STRICTLY from the provided taxonomy vocabulary. Coverage across NINE axes:

  1. subject          (what is shown — fruit, animal, character, object, person, place)
  2. style            (illustration style — kawaii, cartoon, watercolor, ink, photorealistic, vintage, isometric, …)
  3. scene/setting    (where it takes place — office, kitchen, beach, museum, outdoor, classroom, …)
  4. material/medium  (depicted material — bronze, watercolor, embroidery, ceramic, paper-craft, …)
  5. era/period       (time signal — Tang dynasty, Y2K, retro, futuristic, mid-century, …)
  6. mood/aesthetic   (emotional tone — cozy, edgy, chic, serene, dramatic, whimsical, romantic, …)
  7. audience         (who is it for — kids-learning, early-childhood-learning, bilingual, professional)
  8. output type      (format — infographic, poster, sticker, flashcard, comic, daily-life-grid, …)
  9. composition      (layout — centered, grid, layered, isometric, split-screen, multi-panel, …)

Hard rules:
  - Only return slugs from the provided vocabulary. NEVER invent slugs (validation will drop invalid ones silently — wastes the gen).
  - Aim for 30-50 tags. Less is fine if axes don't apply; more risks noise.
  - Be specific when a specific slug exists (e.g. "mbti-infj" beats "personality", "spanish-cuisine" beats "food").
  - Don't repeat near-synonyms (e.g. "kawaii" + "cute" — pick one).
  - Skip audience slugs unless the card is CLEARLY for that audience (vocab cards, kids worksheets, etc.).
  - Output JSON: {"tags": ["slug1", "slug2", …]}"""


def build_user_prompt(record: dict, kind: str, vocab: dict, ctx_template: Optional[dict] = None) -> str:
    """Build a per-record user prompt. ctx_template (parent template for
    inspirations) is woven in so the LLM has style/format context."""
    if kind == "inspirations":
        en = (record.get("locales") or {}).get("en") or {}
        title = en.get("title") or en.get("category") or ""
        params = record.get("params") or {}
        tpl_topics = (ctx_template or {}).get("topics") or []
        existing = record.get("tags") or []
        ctx = (
            f"  template_id: {record.get('template_id')}\n"
            f"  template_topics: {json.dumps(tpl_topics)}\n"
            f"  title: {title}\n"
            f"  params: {json.dumps(params, ensure_ascii=False)}\n"
            f"  existing_tags: {json.dumps(existing)}"
        )
    elif kind == "templates":
        en = (record.get("locales") or {}).get("en") or {}
        title = en.get("category") or ""
        existing = record.get("topics") or []
        bp = (en.get("base_prompt") or "")[:600]
        ctx = (
            f"  template_id: {record.get('id')}\n"
            f"  category: {title}\n"
            f"  base_prompt_excerpt: {bp}\n"
            f"  existing_topics: {json.dumps(existing)}"
        )
    elif kind == "gallery":
        existing = record.get("tags") or []
        ctx = (
            f"  prompt_id: {record.get('id')}\n"
            f"  title: {record.get('title') or ''}\n"
            f"  description: {(record.get('description') or '')[:300]}\n"
            f"  category: {record.get('category') or ''}\n"
            f"  layoutCategory: {record.get('layoutCategory') or ''}\n"
            f"  domainCategory: {record.get('domainCategory') or ''}\n"
            f"  existing_tags: {json.dumps(existing)}"
        )
    else:
        raise ValueError(f"unknown kind: {kind}")

    return f"""Vocabulary (use ONLY these slugs):
  subject_t1: {json.dumps(vocab["subject_t1"])}
  subject_t2: {json.dumps(vocab["subject_t2"])}
  subject_t3: {json.dumps(vocab["subject_t3"])}
  entities_t4: {json.dumps(vocab["entities_t4"])}
  audience: {json.dumps(vocab["audience"])}

Record ({kind}):
{ctx}

Produce 30-50 granular tags from the vocabulary across the 9 axes."""


def enrich_one(client, record, kind, vocab, valid, ctx_template=None):
    """Returns (record_id, kept_tags_list, dropped_invalid_list)."""
    rid = record.get("id") or record.get("template_id") or "?"
    try:
        prompt = build_user_prompt(record, kind, vocab, ctx_template)
        res = client.chat.completions.create(
            model=MODEL,
            response_format={"type": "json_object"},
            temperature=0.1,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
        text = res.choices[0].message.content or "{}"
        parsed = json.loads(text)
        proposed = parsed.get("tags") or []
        if not isinstance(proposed, list):
            return (rid, [], [])
        kept, dropped = [], []
        for t in proposed:
            if not isinstance(t, str): continue
            slug = t.strip().lower()
            if slug in valid:
                kept.append(slug)
            else:
                slug2 = slugify(t)
                if slug2 in valid: kept.append(slug2)
                else: dropped.append(t)
        return (rid, kept, dropped)
    except Exception as e:
        return (rid, [], [f"ERROR: {e}"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--kind", required=True, choices=list(PATHS.keys()))
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sample", action="store_true")
    args = ap.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not set", file=sys.stderr); sys.exit(1)

    tax = json.loads(TAX_PATH.read_text(encoding="utf-8"))
    vocab = build_vocab(tax)
    valid = build_valid_set(tax)
    print(f"Vocab: T1={len(vocab['subject_t1'])} T2={len(vocab['subject_t2'])} T3={len(vocab['subject_t3'])} T4={len(vocab['entities_t4'])} audience={len(vocab['audience'])} | valid-slug set={len(valid)}")

    path = PATHS[args.kind]
    data = json.loads(path.read_text(encoding="utf-8"))
    # gallery prompts are wrapped
    if args.kind == "gallery" and isinstance(data, dict):
        records = data.get("prompts", [])
    else:
        records = data
    print(f"loaded {len(records)} {args.kind} records from {path.name}")

    # For inspirations: build a parent-template lookup for context
    ctx_lookup = {}
    if args.kind == "inspirations":
        tmpls = json.loads(PATHS["templates"].read_text(encoding="utf-8"))
        ctx_lookup = {t["id"]: t for t in tmpls}

    targets = list(records)
    if args.sample and args.limit:
        random.seed(11)
        targets = random.sample(targets, min(args.limit, len(targets)))
    elif args.limit:
        targets = targets[: args.limit]
    print(f"processing {len(targets)} (concurrency={args.concurrency}, dry_run={args.dry_run})\n")

    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], timeout=60.0)
    results = {}
    drops = {}

    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futs = {}
        for r in targets:
            ctx = ctx_lookup.get(r.get("template_id")) if args.kind == "inspirations" else None
            futs[pool.submit(enrich_one, client, r, args.kind, vocab, valid, ctx)] = r
        done = 0
        for fut in as_completed(futs):
            rid, kept, dropped = fut.result()
            results[rid] = kept
            if dropped: drops[rid] = dropped
            done += 1
            if done % 25 == 0: print(f"  ...{done}/{len(targets)}")

    # Stats
    kept_counts = [len(v) for v in results.values()]
    avg = sum(kept_counts) / max(1, len(kept_counts))
    print(f"\n── STATS ──")
    print(f"  avg tags/record: {avg:.1f}")
    print(f"  hit 25+ threshold: {sum(1 for c in kept_counts if c >= 25)}/{len(kept_counts)}")
    print(f"  records with errors: {sum(1 for v in drops.values() if v and v[0].startswith('ERROR'))}")
    print(f"  records with invalid drops: {sum(1 for v in drops.values() if v and not v[0].startswith('ERROR'))}")

    # Sample preview
    rec_by_id = {(r.get('id') or r.get('template_id')): r for r in records}
    sample_ids = list(results.keys())[:5]
    print("\n── SAMPLE ──")
    for rid in sample_ids:
        r = rec_by_id.get(rid, {})
        existing = r.get("tags") if args.kind != "templates" else (r.get("topics") or [])
        existing = existing or []
        new = results[rid]
        added = sorted(set(new) - set(existing))
        print(f"\n▸ {rid}  ({len(existing)} → {len(set(new) | set(existing))} tags, +{len(added)} new)")
        print(f"  +added (first 15): {added[:15]}")

    if args.dry_run:
        will_update = sum(1 for r in targets if results.get(r.get('id') or r.get('template_id'), []) and set(results[r.get('id') or r.get('template_id')]) - set(r.get('tags') if args.kind != 'templates' else (r.get('topics') or []) or []))
        print(f"\n[dry-run] would update {will_update} records")
        return

    # Apply. Append-only on tags[] (or topics[] for templates).
    field = "tags" if args.kind != "templates" else "topics"
    changed = 0
    for r in records:
        rid = r.get('id') or r.get('template_id')
        new = results.get(rid)
        if not new: continue
        existing = list(r.get(field) or [])
        added = [t for t in new if t not in existing]
        if added:
            r[field] = existing + added
            changed += 1

    if args.kind == "gallery" and isinstance(data, dict):
        data["prompts"] = records
        text = json.dumps(data, ensure_ascii=False, indent=2)
    else:
        text = json.dumps(records, ensure_ascii=False, indent=2)
    path.write_text(text + "\n", encoding="utf-8")
    print(f"\n  updated {changed} {args.kind} records, wrote {path.name}")


if __name__ == "__main__":
    main()
