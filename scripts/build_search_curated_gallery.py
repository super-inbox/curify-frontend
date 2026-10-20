"""Build the small, reviewed search/detail index from canonical gallery records."""
import json
from pathlib import Path

IDS = {1994022879051014400, 2026102001, 2026102002}

def build():
    records = json.loads(Path('public/data/nanobanana.json').read_text())
    selected = [r for r in records if r['id'] in IDS]
    assert {r['id'] for r in selected} == IDS
    return [dict(id=r['id'], title=r['title'], description=r['description'],
                 prompt=r['promptText'], imageURL=r['imageUrl'], tags=r['tags'],
                 aliases=r.get('aliases', [])) for r in selected]

if __name__ == '__main__':
    Path('lib/generated/search-curated-gallery.json').write_text(
        json.dumps(build(), ensure_ascii=False, indent=2) + '\n')
