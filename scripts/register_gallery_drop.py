#!/usr/bin/env python3
"""Append a reviewed gallery manifest without rewriting existing IDs or records."""
import argparse
import json
from pathlib import Path


def register(source, entries):
    existing = json.loads(source)
    if not isinstance(existing, list):
        raise ValueError('Gallery must be a JSON array')
    by_id = {str(item['id']): item for item in existing}
    by_url = {item.get('imageUrl'): item for item in existing}
    additions = []
    for entry in entries:
        identity = str(entry['id'])
        if not isinstance(entry['id'], int) or not 0 < entry['id'] < 2**53:
            raise ValueError('New IDs must be positive JavaScript-safe integers')
        for field in ('title', 'description', 'promptText', 'imageUrl', 'createdAt'):
            if not isinstance(entry.get(field), str) or not entry[field].strip():
                raise ValueError(f'Missing {field}: {identity}')
        if identity in by_id:
            if by_id[identity] != entry:
                raise ValueError(f'ID conflict: {identity}')
            continue
        if entry['imageUrl'] in by_url:
            raise ValueError(f'Image URL already registered: {identity}')
        if not entry.get('tags'):
            raise ValueError(f'Missing tags: {identity}')
        additions.append(entry)
        by_id[identity] = entry
        by_url[entry['imageUrl']] = entry
    if not additions:
        return source, 0
    # Preserve all existing bytes, including integers above JS's safe range.
    prefix = source.rstrip()
    if not prefix.endswith(']'):
        raise ValueError('Expected closing array bracket')
    prefix = prefix[:-1].rstrip()
    block = ',\n'.join('\n'.join('  ' + line for line in json.dumps(x, ensure_ascii=False, indent=2).splitlines()) for x in additions)
    return prefix + (',\n' if existing else '\n') + block + '\n]\n', len(additions)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('manifest', type=Path)
    parser.add_argument('--gallery', type=Path, default=Path('public/data/nanobanana.json'))
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    manifest = json.loads(args.manifest.read_text())
    updated, count = register(args.gallery.read_text(), [item['entry'] for item in manifest['items']])
    if not args.check and count:
        args.gallery.write_text(updated)
    print(f'{count} new gallery entries' + (' (dry run)' if args.check else ''))


if __name__ == '__main__':
    main()
