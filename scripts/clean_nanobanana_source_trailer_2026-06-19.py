"""Clean scraping-artifact trailers (and matching instruction prefix) from
public/data/nanobanana.json prompt text.

Pattern surfaced 2026-06-19 from id=4300:
  - Optional leading wrapper:
      "Create a detailed, optimized prompt for image generation based on
       the provided content:\n\n\""
  - The actual content
  - Trailing source/image artifact:
      "\n\n---\nSource: <url>\nImage: <url>"

Coverage scan: 3032/4117 prompts (74%) have the standard trailer; 62 of
those also have the instruction prefix. Strips both — leaves the actual
prompt text intact.

Usage:
  python3 scripts/clean_nanobanana_source_trailer_2026-06-19.py --dry-run
  python3 scripts/clean_nanobanana_source_trailer_2026-06-19.py
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PATH = ROOT / "public" / "data" / "nanobanana.json"

PREFIX_RE = re.compile(
    r'^Create a detailed, optimized prompt for image generation based on '
    r'the provided content:\s*\n\s*"'
)
# Trailing "---\nSource: <url>\nImage: <url>" — captures the standard
# scrape-output trailer.
TRAILER_RE = re.compile(
    r'\s*\n+---\s*\n\s*Source:\s*https?://\S+'
    r'(?:\s*\n\s*Image:\s*https?://\S+)?\s*$',
    re.IGNORECASE,
)
# Naked source/image trailer (no --- separator) — handles a few records
# where the scraper omitted the separator.
NAKED_SOURCE_RE = re.compile(
    r'\s*\n+Source:\s*https?://\S+'
    r'(?:\s*\n\s*Image:\s*https?://\S+)?\s*$',
    re.IGNORECASE,
)


def clean_prompt(pt: str) -> str:
    """Strip trailer + optional instruction prefix. Returns the cleaned text."""
    out = pt
    # Trailer first (so the prefix-quote stripping logic below sees the real tail)
    out = TRAILER_RE.sub("", out)
    out = NAKED_SOURCE_RE.sub("", out)
    out = out.rstrip()
    # Instruction prefix + its opening quote (only when present)
    if PREFIX_RE.match(out):
        out = PREFIX_RE.sub("", out)
        # The opening quote had no matching close in the source, but if one
        # exists trailing, strip it too (cleanup of edge cases)
        if out.endswith('"'):
            out = out[:-1].rstrip()
    return out


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    raw = json.loads(PATH.read_text(encoding="utf-8"))
    is_wrapped = isinstance(raw, dict) and "prompts" in raw
    arr = raw["prompts"] if is_wrapped else raw

    trailer_stripped = 0
    prefix_stripped = 0
    unchanged = 0
    samples = []
    for p in arr:
        pt = p.get("promptText") or ""
        if not pt:
            unchanged += 1
            continue
        had_trailer = bool(TRAILER_RE.search(pt) or NAKED_SOURCE_RE.search(pt))
        had_prefix = bool(PREFIX_RE.match(pt))
        cleaned = clean_prompt(pt)
        if cleaned == pt:
            unchanged += 1
            continue
        if had_trailer: trailer_stripped += 1
        if had_prefix: prefix_stripped += 1
        if len(samples) < 3:
            samples.append((p.get("id"), pt[:120], cleaned[:120]))
        p["promptText"] = cleaned

    print(f"  trailers stripped:   {trailer_stripped}")
    print(f"  prefixes stripped:   {prefix_stripped}")
    print(f"  unchanged:           {unchanged}")
    print(f"  total prompts:       {len(arr)}")

    print(f"\n  SAMPLES (id | before[:120] → after[:120]):")
    for pid, before, after in samples:
        print(f"\n    id={pid}")
        print(f"      before: {before!r}")
        print(f"      after:  {after!r}")

    if args.dry_run:
        print("\n[dry-run] no file written")
        return

    if is_wrapped:
        raw["prompts"] = arr
        out_text = json.dumps(raw, ensure_ascii=False, indent=2)
    else:
        out_text = json.dumps(arr, ensure_ascii=False, indent=2)
    PATH.write_text(out_text + "\n", encoding="utf-8")
    print(f"\n  wrote {PATH}")


if __name__ == "__main__":
    main()
