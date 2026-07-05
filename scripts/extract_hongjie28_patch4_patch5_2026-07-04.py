"""Extract NEW templates from origin/hongjie28-patch-4 + origin/hongjie28-patch-5
and append them to public/data/nano_templates.json on the current branch.

Adapted from extract_hongjie28_patch2_2026-06-20.py. Same brace-tracked
per-template extraction, plus two extra repairs seen in the 2026-07-04 drop:

  - RAW (unescaped) newlines inside base_prompt strings  -> json.loads(strict=False)
  - stray `,-` artifact after a parameter value          -> fix_stray_artifacts()

Per feedback_daily_drop_rank_score: rank_score / base_rank_score = 90 backfill.
Per feedback_daily_drop_i18n: i18n is a SEPARATE companion script.
Per feedback_template_parameters_must_be_list: normalize parameters dict -> [dict]
at both top level and per-locale.

Usage:
  python3 scripts/extract_hongjie28_patch4_patch5_2026-07-04.py --dry-run
  python3 scripts/extract_hongjie28_patch4_patch5_2026-07-04.py
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"
# 2026-07-04 drop: patch-4's 3 new templates (amazon-six-grid, micro-worker,
# einstein-russian-ad) shipped with NO example images anywhere (no gallery
# drop, no approved user-gen in Supabase, missing og_image previews), so they
# would render as broken cards. Deferred until their images land in
# curify-gallery. patch-5 (3 fully-imaged templates, Jul_3) and patch-6
# (4 fully-imaged templates, Jul_4) are consumed here. Idempotent: re-running
# only appends ids not already present in nano_templates.json.
BRANCHES = ["origin/hongjie28-patch-5", "origin/hongjie28-patch-6"]


def fetch_patch_raw(branch: str) -> str:
    res = subprocess.run(
        ["git", "show", f"{branch}:public/data/nano_templates.json"],
        capture_output=True, text=True, check=True,
    )
    return res.stdout


def extract_template_blocks(raw: str) -> list:
    """Char-walk the file tracking braces only OUTSIDE string literals.
    Each top-level {...} block inside the outer [...] is one template."""
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
                    blocks.append(raw[block_start:i + 1])
                    block_start = -1
            elif c == "]" and depth == 0:
                break
        i += 1
    return blocks


def fix_stray_artifacts(block: str) -> str:
    """Remove the `,-` stray-dash artifact: a comma then a lone `-` before
    the next key (`"type": "text",-\\n  "placeholder"`). Collapse to a
    plain comma. Also strip trailing commas before } or ]."""
    block = re.sub(r",\s*-(\s*[\r\n]+\s*[\"}\]])", r",\1", block)
    block = re.sub(r",(\s*[\]\}])", r"\1", block)
    return block


def repair_block(block: str) -> str:
    """Escape interior unescaped quotes inside base_prompt, wrap
    parameters:{...} into parameters:[{...}], strip trailing commas."""
    out = []
    i = 0
    while i < len(block):
        idx = block.find('"base_prompt":', i)
        if idx < 0:
            out.append(block[i:])
            break
        out.append(block[i:idx])
        j = idx + len('"base_prompt":')
        while j < len(block) and block[j] in " \t\n\r":
            j += 1
        if j >= len(block) or block[j] != '"':
            out.append(block[idx:j])
            i = j
            continue
        out.append(block[idx:j + 1])
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

    def wrap_params(m):
        return '"parameters": [{' + m.group(1) + "}]"
    fixed = re.sub(r'"parameters":\s*\{(.*?)\}(?=\s*\})', wrap_params, fixed, flags=re.DOTALL)
    fixed = re.sub(r",(\s*[\]\}])", r"\1", fixed)
    return fixed


def parse_block(b: str):
    """Try progressively-more-invasive repairs; least surgery first.
    strict=False tolerates raw control chars (newlines) inside strings."""
    candidates = [b, fix_stray_artifacts(b), repair_block(fix_stray_artifacts(b)), repair_block(b)]
    last_err = None
    for cand in candidates:
        try:
            return json.loads(cand, strict=False)
        except json.JSONDecodeError as e:
            last_err = e
    raise last_err


def normalize_params(t: dict) -> None:
    if isinstance(t.get("parameters"), dict):
        t["parameters"] = [t["parameters"]]
    for lc, lcdata in list((t.get("locales") or {}).items()):
        params = (lcdata or {}).get("parameters")
        if isinstance(params, dict):
            lcdata["parameters"] = [params]


def main() -> None:
    dry = "--dry-run" in sys.argv

    all_patch = {}
    for branch in BRANCHES:
        raw = fetch_patch_raw(branch)
        blocks = extract_template_blocks(raw)
        parsed, errors = [], []
        for idx, b in enumerate(blocks):
            try:
                parsed.append(parse_block(b))
            except json.JSONDecodeError as e:
                errors.append((idx, str(e), b[:160]))
        print(f"{branch}: {len(blocks)} blocks, parsed {len(parsed)}")
        if errors:
            print(f"  parse errors ({len(errors)}):")
            for idx, err, head in errors[:8]:
                print(f"    block #{idx}: {err}\n      head: {head[:110]}")
            sys.exit(1)
        for t in parsed:
            all_patch.setdefault(t["id"], t)  # first wins across branches

    cur = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    cur_ids = {t["id"] for t in cur}
    new_ids = [tid for tid in all_patch if tid not in cur_ids]
    print(f"\ncurrent: {len(cur_ids)} | patch union: {len(all_patch)} | NEW: {len(new_ids)}")
    if not new_ids:
        print("nothing to add; exiting")
        return

    new_templates = [all_patch[tid] for tid in new_ids]
    for t in new_templates:
        if t.get("rank_score") is None:
            t["rank_score"] = 90
        if t.get("base_rank_score") is None:
            t["base_rank_score"] = 90
        normalize_params(t)

    print("\nNew templates:")
    for t in new_templates:
        top_p = t.get("parameters")
        top_shape = ("list" if isinstance(top_p, list) else type(top_p).__name__)
        loc_shapes = {lc: ("list" if isinstance((d or {}).get("parameters"), list)
                           else type((d or {}).get("parameters")).__name__)
                      for lc, d in (t.get("locales") or {}).items()}
        print(f"  + {t['id']}")
        print(f"      rank_score={t.get('rank_score')} topics={t.get('topics')!r} "
              f"top_params={top_shape} locale_params={loc_shapes} "
              f"locales={list((t.get('locales') or {}).keys())}")

    if dry:
        print("\n[dry-run] no write.")
        return

    cur.extend(new_templates)
    TPL_PATH.write_text(json.dumps(cur, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    json.loads(TPL_PATH.read_text(encoding="utf-8"))  # re-validate
    print(f"\nwrote {len(cur)} templates -> {TPL_PATH}")


if __name__ == "__main__":
    main()
