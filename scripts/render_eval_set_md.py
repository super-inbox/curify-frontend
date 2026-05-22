#!/usr/bin/env python3
"""Render scripts/configs/search_eval_set.json as a Markdown table for human
review (e.g. side-by-side Pinterest comparison input).

Writes docs/search-eval-set.md. Re-run after eval_set edits so the
companion doc stays in sync with the canonical JSON.
"""
import json
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')
SRC = REPO / 'scripts/configs/search_eval_set.json'
OUT = REPO / 'docs/search-eval-set.md'


def main():
    data = json.loads(SRC.read_text(encoding='utf-8'))
    queries = data['queries']

    lines = []
    lines.append('# Search Evaluation Query Set')
    lines.append('')
    lines.append(
        f'_Auto-generated from `scripts/configs/search_eval_set.json` '
        f'({data.get("generated_at", "—")}, last recalibrated '
        f'{data.get("last_recalibrated", "—")}). Re-run '
        f'`python3 scripts/render_eval_set_md.py` after editing the JSON._'
    )
    lines.append('')
    lines.append(data.get('description', ''))
    lines.append('')
    lines.append('## Expected legend')
    lines.append('')
    lines.append('| Bucket | Means |')
    lines.append('| --- | --- |')
    for k, v in data.get('expected_legend', {}).items():
        lines.append(f'| `{k}` | {v} |')
    lines.append('')
    redirect_note = data.get('redirect_bypass_note')
    if redirect_note:
        lines.append(f'**Redirect bypass note:** {redirect_note}')
        lines.append('')

    # Group queries by source so the doc reads cleanly.
    by_source: dict[str, list[dict]] = {}
    for q in queries:
        by_source.setdefault(q.get('source', 'unknown'), []).append(q)

    # Display order: real users first, then reddit themes, then synthetic.
    order = [
        'user-2026-05-20',
        'user-report-2026-05-18',
        'reddit',
        'popular',
        'gsc-zero',
        'synthetic',
    ]
    for src in order:
        rows = by_source.get(src, [])
        if not rows:
            continue
        del by_source[src]
        lines.append(f'## {src} ({len(rows)} queries)')
        lines.append('')
        lines.append('| # | Query | Expected | Notes |')
        lines.append('| --- | --- | --- | --- |')
        for i, q in enumerate(rows, 1):
            # Pipe-safe escape — replace `|` with `\|` in notes
            notes = (q.get('notes') or '').replace('|', '\\|')
            lines.append(
                f"| {i} | `{q['query']}` | `{q['expected']}` | {notes} |"
            )
        lines.append('')

    # Any leftover sources we did not pre-order
    for src, rows in by_source.items():
        lines.append(f'## {src} ({len(rows)} queries)')
        lines.append('')
        lines.append('| # | Query | Expected | Notes |')
        lines.append('| --- | --- | --- | --- |')
        for i, q in enumerate(rows, 1):
            notes = (q.get('notes') or '').replace('|', '\\|')
            lines.append(
                f"| {i} | `{q['query']}` | `{q['expected']}` | {notes} |"
            )
        lines.append('')

    lines.append('## How to use this set for side-by-side comparison')
    lines.append('')
    lines.append('For each query in this table, type it verbatim into both')
    lines.append('Curify (`/search?q=<query>`) and Pinterest, then compare:')
    lines.append('')
    lines.append('- Does the platform return any results at all?')
    lines.append('- How relevant are the top 4–6 results to the query intent?')
    lines.append('- Are CJK queries handled (`葡萄酒`, `音乐`, `自行车`, `端午节`)?')
    lines.append('- Are hyphenated / compound queries handled (`english-chinese`, '
                 '`水果中文`)?')
    lines.append('- Where the `expected` column says `empty`, do both platforms')
    lines.append('  fail equally, or does one surface adjacent content the other')
    lines.append('  misses?')
    lines.append('')
    lines.append('Capture findings in a sibling table for each platform; any')
    lines.append('query where Curify is materially worse than Pinterest becomes')
    lines.append('a thread-a (recall) or thread-c (content) backlog item.')

    OUT.write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'Wrote {OUT} — {len(queries)} queries across {len(by_source) + len(order)} source buckets')


if __name__ == '__main__':
    main()
