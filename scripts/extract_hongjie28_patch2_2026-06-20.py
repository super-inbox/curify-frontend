"""Extract NEW templates from origin/hongjie28-patch-2 and append them to
public/data/nano_templates.json on the current branch.

Patch-branch JSON gotchas handled (per feedback_hongjie_patch_branches):
  - Unescaped interior quotes inside base_prompt strings
  - "parameters" delivered as dict instead of [list-of-dicts]
  - Stale base, so set-diff by template id (not git diff)

Adds per `feedback_daily_drop_rank_score`: rank_score=90 backfill.
Per `feedback_daily_drop_i18n`: i18n is written by a SEPARATE companion
script (this script handles the JSON extraction only).
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"


def fetch_patch_raw() -> str:
    res = subprocess.run(
        ["git", "show", "origin/hongjie28-patch-2:public/data/nano_templates.json"],
        capture_output=True, text=True, check=True,
    )
    return res.stdout


def extract_template_blocks(raw: str) -> list[str]:
    """Walk the file character-by-character, tracking braces only OUTSIDE
    string literals. Each top-level {...} block (inside the outer [...])
    is one template. Returns the raw block strings, in order."""
    # Find the outer array opener
    start = raw.find("[")
    if start < 0:
        raise ValueError("no outer [ found")
    blocks = []
    depth = 0
    in_string = False
    escape_next = False
    block_start = -1
    i = start + 1
    while i < len(raw):
        c = raw[i]
        if escape_next:
            escape_next = False
        elif c == "\\" and in_string:
            escape_next = True
        elif c == '"':
            in_string = not in_string
        elif not in_string:
            if c == "{":
                if depth == 0:
                    block_start = i
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0 and block_start >= 0:
                    blocks.append(raw[block_start : i + 1])
                    block_start = -1
            elif c == "]" and depth == 0:
                break
        i += 1
    return blocks


def repair_block(block: str) -> str:
    """Repair patch-2-specific JSON issues inside one template block.

    1. Interior unescaped quotes inside base_prompt. We grab the
       base_prompt field via outer-quote tracking then escape any
       \"-not-preceded-by-\\ that lives BETWEEN the outer quotes.
    2. parameters: { ... } instead of parameters: [ { ... } ] — wrap.
    3. trailing commas before } or ].
    """
    # 1. base_prompt interior quote escape
    out = []
    i = 0
    while i < len(block):
        idx = block.find('"base_prompt":', i)
        if idx < 0:
            out.append(block[i:])
            break
        out.append(block[i:idx])
        # Find the opening quote of the value
        j = idx + len('"base_prompt":')
        while j < len(block) and block[j] in " \t\n\r":
            j += 1
        if j >= len(block) or block[j] != '"':
            out.append(block[idx:j])
            i = j
            continue
        # Walk to the closing quote, escaping any interior naked quote
        out.append(block[idx:j + 1])  # include the opening quote
        k = j + 1
        repaired = []
        while k < len(block):
            ch = block[k]
            if ch == "\\":
                repaired.append(ch)
                if k + 1 < len(block):
                    repaired.append(block[k + 1])
                k += 2
                continue
            if ch == '"':
                # Is this the actual closing quote? Look ahead: if next
                # non-whitespace is "," or "}" or "\n", it's likely the
                # closer. Otherwise it's an interior naked quote — escape.
                lookahead = k + 1
                while lookahead < len(block) and block[lookahead] in " \t":
                    lookahead += 1
                if lookahead < len(block) and block[lookahead] in ",\n\r}":
                    repaired.append('"')
                    k += 1
                    break
                else:
                    repaired.append('\\"')
                    k += 1
                    continue
            repaired.append(ch)
            k += 1
        out.append("".join(repaired))
        i = k
    fixed = "".join(out)

    # 2. parameters: { ... } → parameters: [ { ... } ]
    # Simple textual rewrite: when we see `"parameters": {` followed by
    # `"name":`, wrap the {...} in [...].
    def wrap_params(m):
        return '"parameters": [{' + m.group(1) + "}]"
    fixed = re.sub(
        r'"parameters":\s*\{(.*?)\}(?=\s*\})',
        wrap_params,
        fixed,
        flags=re.DOTALL,
    )

    # 3. trailing commas
    fixed = re.sub(r",(\s*[\]\}])", r"\1", fixed)
    return fixed


def main() -> None:
    raw = fetch_patch_raw()
    print(f"patch-2 raw length: {len(raw)}")

    blocks = extract_template_blocks(raw)
    print(f"extracted {len(blocks)} template blocks from patch-2")

    # Parse each block individually
    patch_templates = []
    parse_errors = []
    for idx, b in enumerate(blocks):
        try:
            patch_templates.append(json.loads(repair_block(b)))
        except json.JSONDecodeError as e:
            parse_errors.append((idx, str(e), b[:200]))
    print(f"parsed: {len(patch_templates)} / {len(blocks)}")
    if parse_errors:
        print(f"\nparse errors ({len(parse_errors)}):")
        for idx, err, head in parse_errors[:5]:
            print(f"  block #{idx}: {err}")
            print(f"    head: {head[:120]}")
        sys.exit(1)

    # Diff vs current
    cur = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    cur_ids = {t["id"] for t in cur}
    patch_ids = {t["id"] for t in patch_templates}
    new_ids = patch_ids - cur_ids
    print(f"\ncurrent templates: {len(cur_ids)}")
    print(f"patch-2 templates: {len(patch_ids)}")
    print(f"NEW in patch-2:    {len(new_ids)}")
    if not new_ids:
        print("\nnothing to add; exiting cleanly")
        return

    # Filter to new + backfill rank_score
    new_templates = [t for t in patch_templates if t["id"] in new_ids]
    for t in new_templates:
        if t.get("rank_score") is None:
            t["rank_score"] = 90
        if t.get("base_rank_score") is None:
            t["base_rank_score"] = 90
        # Defensive — normalize parameters if the regex didn't catch it
        # (e.g. the inner dict was multiline structured differently).
        locales = t.get("locales") or {}
        for lc, lcdata in list(locales.items()):
            params = (lcdata or {}).get("parameters")
            if isinstance(params, dict):
                lcdata["parameters"] = [params]

    print("\nNew templates to append:")
    for t in new_templates:
        print(f"  + {t['id']}")

    # Append + write
    cur.extend(new_templates)
    TPL_PATH.write_text(
        json.dumps(cur, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    # Re-read to verify JSON is still valid
    json.loads(TPL_PATH.read_text(encoding="utf-8"))
    print(f"\n  wrote {len(cur)} templates → {TPL_PATH}")


if __name__ == "__main__":
    main()
