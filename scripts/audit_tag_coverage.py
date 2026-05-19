#!/usr/bin/env python3
"""Audit gallery-tag → topic coverage.

Reads lib/generated/nanobanana_prompts_metadata.json for the tag-count
metadata, parses lib/topicRegistry.ts to extract TOPIC_GALLERY_TAG +
EXTRA_TAG_TO_TOPICS values, and reports the % of tag occurrences that
land in a topic via either bridge.

Run after editing the registry to confirm the coverage % moves in the
direction the proposal at docs/gallery-tag-taxonomy.md predicted.
"""
import json
import re
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')


def parse_registry_tags():
    """Pull tag keys + topic values from the two reverse-map blocks in
    topicRegistry.ts. Robust to comment lines and trailing commas, but
    expects the entries to be in the form `key: ["topic", ...]`.

    Returns (topic_gallery_tag: dict[topic, tag], extra: dict[tag, [topic]]).
    """
    src = (REPO / 'lib/topicRegistry.ts').read_text(encoding='utf-8')

    def block(name: str) -> str:
        # Match: const NAME ... = { ... };
        m = re.search(rf'const\s+{name}[^=]*=\s*\{{(.+?)\n\}}', src, re.S)
        if not m:
            raise RuntimeError(f'Could not locate {name} block in topicRegistry.ts')
        return m.group(1)

    def kv_lines(blk: str):
        for line in blk.splitlines():
            line = line.split('//', 1)[0].strip()
            if not line:
                continue
            # key: value
            m = re.match(r'^"?([^":,]+?)"?\s*:\s*(.+?),?\s*$', line)
            if not m:
                continue
            yield m.group(1).strip(), m.group(2).strip()

    # TOPIC_GALLERY_TAG: topic -> "tag string"
    gallery: dict[str, str] = {}
    for k, v in kv_lines(block('TOPIC_GALLERY_TAG')):
        sv = v.strip().strip('"').strip("'")
        gallery[k] = sv

    # EXTRA_TAG_TO_TOPICS: tag -> ["topic", ...]
    extra: dict[str, list[str]] = {}
    for k, v in kv_lines(block('EXTRA_TAG_TO_TOPICS')):
        items = re.findall(r'"([^"]+)"', v)
        if items:
            extra[k] = items

    return gallery, extra


def main():
    meta = json.loads(
        (REPO / 'lib/generated/nanobanana_prompts_metadata.json').read_text(encoding='utf-8')
    )['metadata']
    all_tags = {t['tag']: t['count'] for t in meta['tags']}
    total = sum(all_tags.values())

    gallery, extra = parse_registry_tags()
    mapped = set(gallery.values()) | set(extra.keys())

    mapped_occ = 0
    unmapped: list[tuple[str, int]] = []
    for tag, ct in all_tags.items():
        if tag in mapped:
            mapped_occ += ct
        else:
            unmapped.append((tag, ct))

    pct = 100 * mapped_occ / total if total else 0
    print(f'Gallery prompts: {meta["total"]} ({len(all_tags)} distinct tags, {total} tag-occurrences)')
    print(f'TOPIC_GALLERY_TAG entries: {len(gallery)} (tag values reused: {len(set(gallery.values()))})')
    print(f'EXTRA_TAG_TO_TOPICS entries: {len(extra)}')
    print(f'Mapped distinct tags: {len(mapped & set(all_tags.keys()))}')
    print()
    print(f'Mapped tag-occurrences:   {mapped_occ:>6d} / {total} ({pct:.1f}%)')
    print(f'Unmapped tag-occurrences: {total - mapped_occ:>6d} / {total} ({100 - pct:.1f}%)')
    print(f'Unmapped distinct tags:   {len(unmapped)}')
    print()
    unmapped.sort(key=lambda x: -x[1])
    print('Top 30 unmapped tags by prompt count:')
    for tag, ct in unmapped[:30]:
        print(f'  {tag:<25s} {ct:>4d}')


if __name__ == '__main__':
    main()
