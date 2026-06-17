"""Phase 3 of inspirations↔taxonomy alignment (2026-06-18).

LLM-driven tag enrichment for nano_inspiration.json. For each record,
asks gpt-4o-mini to propose 3-6 granular tags drawn STRICTLY from the
taxonomy vocabulary (T1-4 + audience). Merges into record.tags[].

Constraints:
  - Never touches record.topics[] (SEO-bearing, append-only).
  - Output is validated against the taxonomy vocab; any slug not in
    vocab is dropped silently (no hallucinated tags get through).
  - Existing record.tags[] is preserved + extended (not replaced),
    after dedupe.

Usage:
  # Pilot 30 records (mix of tagged + untagged)
  OPENAI_API_KEY=... python3 scripts/enrich_inspiration_tags_phase3_2026-06-18.py --limit 30 --dry-run

  # Full run with file write
  OPENAI_API_KEY=... python3 scripts/enrich_inspiration_tags_phase3_2026-06-18.py --concurrency 12
"""
from __future__ import annotations

import argparse
import json
import os
import random
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Optional

try:
    from openai import OpenAI
except ImportError:
    print("openai package not installed — install with: pip install openai", file=sys.stderr)
    sys.exit(1)

ROOT = Path(__file__).resolve().parents[1]
INS_PATH = ROOT / "public" / "data" / "nano_inspiration.json"
TMPL_PATH = ROOT / "public" / "data" / "nano_templates.json"
TAX_PATH = ROOT / "lib" / "taxonomy.json"

MODEL = "gpt-4o-mini"


def slugify(s: str) -> str:
    return s.lower().replace(" ", "-")


def load_inputs():
    ins = json.loads(INS_PATH.read_text(encoding="utf-8"))
    tmpls = json.loads(TMPL_PATH.read_text(encoding="utf-8"))
    tax = json.loads(TAX_PATH.read_text(encoding="utf-8"))
    templates_by_id = {t["id"]: t for t in tmpls}
    return ins, templates_by_id, tax


def build_vocab(tax: dict) -> dict:
    """Return a compact dict the LLM sees. Group by axis for clarity."""
    vocab = {}
    vocab["subject_t1"] = list(tax.get("tier1", []))
    # T2 — domain subdivisions per T1
    vocab["subject_t2"] = sorted({s for v in tax.get("tier2", {}).values() for s in v})
    # T3 — formats / styles / specific subjects per T1 cross-table
    vocab["subject_t3"] = sorted({s for v in tax.get("tier3", {}).values() for s in v})
    # T4 — entity vocabulary (use slugified for tag consistency)
    vocab["entities_t4"] = sorted({slugify(s) for k, v in tax.get("tier4", {}).items() if k != "_note" for s in v})
    vocab["audience"] = list(tax.get("audience", []))
    return vocab


def build_valid_slug_set(tax: dict) -> set:
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


SYSTEM_PROMPT = """You are a precise taxonomy classifier for visual content cards.

Given a single template-example record (its template, title, parameters), you produce 3-6 GRANULAR tags drawn STRICTLY from the provided taxonomy vocabulary. Tags describe the card's:
  - subject (what is depicted)
  - format / style / layout (how it is depicted)
  - audience (who it is for, if applicable)
  - entity (the specific name from params — fruit name, country, character, cuisine, etc.)

Rules:
  - Only return slugs that appear in the vocabulary. Never invent slugs.
  - Prefer the most SPECIFIC slug available (e.g., "mbti-infj" beats "personality", "japan" beats "travel").
  - Include the entity slug if the params point at a specific item in the entity vocab.
  - Include at most one audience slug (only if the card is clearly for kids/early-childhood/bilingual learners/professionals).
  - Skip generic tags (subject T1 alone) when a more specific subject T2/T3 is already present.
  - Output JSON: {"tags": ["slug1", "slug2", ...]}"""


def build_user_prompt(record: dict, template: Optional[dict], vocab: dict) -> str:
    en = (record.get("locales") or {}).get("en") or {}
    title = en.get("title") or en.get("category") or ""
    params = record.get("params") or {}
    tpl_topics = (template or {}).get("topics") or []
    current_tags = record.get("tags") or []

    return f"""Vocabulary (use ONLY these slugs):
  subject_t1: {json.dumps(vocab["subject_t1"])}
  subject_t2: {json.dumps(vocab["subject_t2"])}
  subject_t3: {json.dumps(vocab["subject_t3"])}
  entities_t4: {json.dumps(vocab["entities_t4"])}
  audience: {json.dumps(vocab["audience"])}

Record:
  id: {record.get("id")}
  template_id: {record.get("template_id")}
  template_topics: {json.dumps(tpl_topics)}
  title: {title}
  params: {json.dumps(params, ensure_ascii=False)}
  existing_tags: {json.dumps(current_tags)}

Produce 3-6 granular tags from the vocabulary that describe this card."""


def enrich_one(client, record: dict, template: Optional[dict], vocab: dict, valid: set) -> tuple:
    """Returns (record_id, new_tags, dropped_invalid)."""
    prompt = build_user_prompt(record, template, vocab)
    try:
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
            return (record["id"], [], [])
        # Validate against vocab
        kept, dropped = [], []
        for t in proposed:
            if not isinstance(t, str): continue
            key = t.strip().lower()
            if key in valid:
                kept.append(key)
            else:
                # Try slugified
                k2 = slugify(t)
                if k2 in valid:
                    kept.append(k2)
                else:
                    dropped.append(t)
        # Merge with existing tags
        existing = record.get("tags") or []
        merged = sorted(set([*existing, *kept]))
        return (record["id"], merged, dropped)
    except Exception as e:
        return (record["id"], [], [f"ERROR: {e}"])


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=0, help="Process only N records (0=all)")
    ap.add_argument("--concurrency", type=int, default=8)
    ap.add_argument("--dry-run", action="store_true", help="Print proposals, don't write file")
    ap.add_argument("--prefer-untagged", action="store_true", help="Process untagged records first")
    ap.add_argument("--sample", action="store_true", help="Limit is a random sample, not first-N")
    args = ap.parse_args()

    if not os.environ.get("OPENAI_API_KEY"):
        print("OPENAI_API_KEY not set", file=sys.stderr)
        sys.exit(1)

    ins, templates_by_id, tax = load_inputs()
    vocab = build_vocab(tax)
    valid = build_valid_slug_set(tax)
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"], timeout=60.0)

    targets = list(ins)
    if args.prefer_untagged:
        untagged = [e for e in ins if not e.get("tags")]
        tagged = [e for e in ins if e.get("tags")]
        targets = untagged + tagged
    if args.sample and args.limit:
        random.seed(7)
        targets = random.sample(targets, min(args.limit, len(targets)))
    elif args.limit:
        targets = targets[: args.limit]

    print(f"Vocab sizes: T1={len(vocab['subject_t1'])}, T2={len(vocab['subject_t2'])}, T3={len(vocab['subject_t3'])}, T4_entities={len(vocab['entities_t4'])}, audience={len(vocab['audience'])}")
    print(f"Processing {len(targets)} records (concurrency={args.concurrency}, dry_run={args.dry_run})\n")

    results = {}
    drops = {}
    sample_log = []

    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futs = {
            pool.submit(enrich_one, client, r, templates_by_id.get(r["template_id"]), vocab, valid): r["id"]
            for r in targets
        }
        done = 0
        for fut in as_completed(futs):
            rid, new_tags, dropped = fut.result()
            results[rid] = new_tags
            if dropped:
                drops[rid] = dropped
            done += 1
            if done % 25 == 0:
                print(f"  ...{done}/{len(targets)}")

    # Always show 5 sample proposals
    rec_by_id = {e["id"]: e for e in ins}
    sample_ids = list(results.keys())[:5]
    print("\n── SAMPLE PROPOSALS ──")
    for rid in sample_ids:
        e = rec_by_id[rid]
        old = e.get("tags") or []
        new = results[rid]
        added = sorted(set(new) - set(old))
        print(f"\n▸ {rid}")
        print(f"  template: {e['template_id']}")
        en = (e.get('locales') or {}).get('en') or {}
        print(f"  title:    {(en.get('title') or en.get('category') or '?')[:80]}")
        print(f"  params:   {json.dumps(e.get('params') or {}, ensure_ascii=False)[:120]}")
        print(f"  old tags: {old}")
        print(f"  +added:   {added}")
        print(f"  final:    {new}")

    if drops:
        invalid_only = {k: v for k, v in drops.items() if not v[0].startswith("ERROR")}
        errors = {k: v for k, v in drops.items() if v[0].startswith("ERROR")}
        print(f"\n  dropped-invalid records: {len(invalid_only)}")
        print(f"  errored records:         {len(errors)}")
        if errors:
            for k, v in list(errors.items())[:3]:
                print(f"    {k}: {v[0]}")

    if args.dry_run:
        print(f"\n[dry-run] would update {sum(1 for r in targets if results.get(r['id']) and set(results[r['id']]) != set(r.get('tags') or []))} records")
        return

    changed = 0
    for r in targets:
        new = results.get(r["id"])
        if not new:
            continue
        if set(new) != set(r.get("tags") or []):
            r["tags"] = new
            changed += 1

    INS_PATH.write_text(
        json.dumps(ins, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"\n  updated {changed} records, wrote {INS_PATH}")


if __name__ == "__main__":
    main()
