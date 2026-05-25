#!/usr/bin/env python3
"""Mark revealing-imagery gallery prompts with a `revealing-female` tag.

Uses a deliberately tight heuristic: explicit clothing / pose / body-anchored
descriptors only. False-positive risks (e.g. `teddy bear`, `nude lipstick`,
`reveals charm`) are excluded via word-anchored patterns and compound matches.

Once a prompt carries `revealing-female`, the topic-page rendering layer
(app/[locale]/(public)/topics/[slug]/page.tsx) filters it out of the gallery
row by default. The tag itself is added to TAG_DENYLIST in
scripts/regen_nanobanana_metadata.cjs so it does NOT appear in the canonical
tag list (no /nano-banana-pro-prompts/tag/revealing-female page), but the
marker stays on each prompt's `tags` array so other contexts can filter.

Idempotent — re-running adds the tag only to records that don't already have it.
Created 2026-05-21 per user request to keep mood / lighting / seasonal /
cultural-festivals topic-page gallery rows family-friendly.
"""
import json
import re
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')
P = REPO / 'public/data/nanobanana.json'
TAG = 'revealing-female'

# Tight, precision-tuned pattern. Word-anchored to avoid false positives:
#   - `teddy` removed (matches `teddy bear`)
#   - `nude` / `naked` anchored to body / figure context (skips fashion
#     `nude color`, `nude heels`)
#   - `low-cut` anchored to clothing (skips `low-cut hair`)
EXPLICIT = re.compile(
    r'\b('
    # Clothing
    r'lingerie|bikini|swimsuit|negligee|garter|garters|fishnet|'
    r'bralette|babydoll|chemise|thong|panties|underwear|undergarment|'
    # Pose / style genres
    r'boudoir|burlesque|pin.?up|cheesecake|glamour shot|'
    # Body / state descriptors
    r'topless|cleavage|midriff[- ]?bared|midriff\s+(?:exposed|bare)|'
    r'low.?cut\s+(?:top|dress|blouse|bodice)|plunging neckline|sheer fabric|'
    r'see.?through|skimpy|barely covered|barely.?there|revealing outfit|'
    r'revealing dress|provocative pose|sultry pose|seductive pose|risqu|erotic|'
    # Nude / naked must be body-anchored
    r'(?:fully|partially|completely)\s+nude|'
    r'nude\s+(?:body|figure|model|photo|portrait|silhouette|art)|'
    r'naked\s+(?:body|figure|skin|form|silhouette)|'
    # Wet / suggestive
    r'wet shirt|wet.?look photo|drenched (?:in|with)|wet.?t.?shirt|'
    # Other markers
    r'voluptuous|busty|bustier|peekaboo|side.?boob|'
    r'pin-up girl|sex.?appeal'
    r')\b',
    re.IGNORECASE,
)

# Hard tags that strongly imply the content even without text match.
HARD_TAGS = {'boudoir', 'lingerie'}


def is_revealing(p: dict) -> bool:
    text = ' '.join([
        p.get('title') or '',
        p.get('description') or '',
        p.get('promptText') or '',
    ])
    if EXPLICIT.search(text):
        return True
    if HARD_TAGS & set(p.get('tags') or []):
        return True
    return False


def main():
    data = json.loads(P.read_text(encoding='utf-8'))
    prompts = data if isinstance(data, list) else data.get('prompts', [])

    tagged = 0
    already = 0
    samples_added = []
    for p in prompts:
        if not is_revealing(p):
            continue
        tags = p.get('tags') or []
        if TAG in tags:
            already += 1
            continue
        p['tags'] = list(tags) + [TAG]
        tagged += 1
        if len(samples_added) < 8:
            samples_added.append((p.get('id'), (p.get('title') or '')[:80]))

    P.write_text(
        json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8',
    )
    print(f'Tagged {tagged} prompts with `{TAG}`')
    print(f'Skipped {already} already-tagged')
    print()
    print('First 8 newly-tagged samples:')
    for pid, title in samples_added:
        print(f'  id={pid}  title=`{title}`')


if __name__ == '__main__':
    main()
