#!/usr/bin/env python3
"""One-shot search_aliases top-up driven by docs/search-quality.md item 1.

Appends targeted aliases to inspiration records under specific template
families, without disturbing existing aliases. Idempotent — re-running
is safe (dedup-by-string).
"""
import json
from collections import OrderedDict
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')
P = REPO / 'public/data/nano_inspiration.json'

# Family → (template_ids, aliases to append). Aliases mix EN + ZH so
# users in either language can find the templates. Source: the analyst
# reports + 2026-05-18 user reports, captured in docs/search-quality.md.
FAMILIES = OrderedDict([
    ('mbti_country', {
        'templates': [
            'template-mbti-animal','template-mbti-contrast','template-mbti-generic','template-mbti-marvel',
            'template-mbti-nba','template-mbti-siliconvalley','template-mbti-breakingbad','template-mbti-naruto',
            'template-mbti-yellowstone','template-mbti-ghibli','template-city-mbti',
            'template-chinese-classic-character-mbti','template-friends-character-mbti',
            'template-zhenhuan-mbti-character-analysis','template-princess-pearl-mbti-character-card',
            'template-mbti-relationship-infographic','template-harry-potter-mbti-infographic',
            'template-mbti-stereotype-vs-reality-infographic',
            'template-east-asian-culture-comparison-infographic',
            'template-country-top10-travel-destinations',
            'template-country-souvenirs-watercolor',
            'template-national-culture-history-infographic',
            'template-pop-culture-matching-chart',
        ],
        'aliases': [
            'global','world','international','cross-cultural','country','global influence',
            '全球','世界','国际','跨文化','国家','全球影响力',
        ],
    }),
    ('synonym_expressions', {
        'templates': [
            'template-native-english-expressions',
            'template-chinese-verb-opposite-infographic',
            'template-kids-opposite-concept-education',
        ],
        'aliases': [
            'theory','linguistics','synonym','antonym','advanced expressions',
            'one-word-many-meanings','word theory','language theory',
            '理论','同义词','反义词','语言学','高级表达','一词多义',
        ],
    }),
    ('travel_destination', {
        'templates': [
            'template-travel','template-city-miniature','template-series-travel',
            'template-3d-region-landmark-map','template-whimsical-travel-map',
            'template-historical-event-map-illustration','template-national-theme-map-infographic',
            'template-world-travel-map-illustration','template-country-top10-travel-destinations',
            'template-travel-packing-guide-infographic','template-vintage-travel-scrapbook-poster',
            'template-watercolor-world-map-illustration','template-watercolor-travel-journal-collage',
        ],
        'aliases': [
            'remote','destination','off-the-beaten-path','hidden gems','weekend getaway',
            'city escape','city escapes','escapes','itinerary','remote destination',
            '远程目的地','城市探索','隐藏景点','小众景点','短途旅行','周末游','旅行行程',
        ],
    }),
    ('expat_culture', {
        'templates': [
            'template-east-asian-culture-comparison-infographic',
            'template-country-top10-travel-destinations',
            'template-country-souvenirs-watercolor',
            'template-national-culture-history-infographic',
            'template-pop-culture-matching-chart',
        ],
        'aliases': [
            'expat','expatriate','living abroad','cross-cultural living','expat lifestyle',
            'china expat','expat insights',
            '外籍','海外生活','跨文化生活','在华外籍','外国人生活',
        ],
    }),
    ('spring_aesthetic', {
        'templates': [
            'template-watercolor-painting-tutorial-guide',
            'template-multilingual-vocabulary-poster-watercolor',
            'template-CVC-english-word-coloring-flower-card',
            'template-country-souvenirs-watercolor',
            'template-lifestyle-watercolor-infographic',
            'template-gardening-how-to-infographic',
            'template-watercolor-world-map-illustration',
            'template-watercolor-theme-collage-illustration',
            'template-watercolor-travel-journal-collage',
            'template-country-top10-travel-destinations',
            'template-herbal',
        ],
        'aliases': [
            'spring','aesthetic','aesthetic spring','floral','flower','botanical',
            'spring flowers','watercolor spring','soft aesthetic',
            '春天','唯美','唯美春天','美感','花卉','植物','春日','春季','水彩春天',
        ],
    }),
    ('portrait_id_photo', {
        'templates': [
            'template-portrait-retouching-blueprint',
            'template-hairstyle-color-recommendation',
            'template-lifestyle-photo-grid',
        ],
        'aliases': [
            'ID photo','passport photo','headshot','professional headshot','profile photo',
            'id photo style','retouched portrait',
            '证件照','身份证照','护照照','头像','证件 照','职业头像','证件 风格头像',
        ],
    }),
])


def main():
    data = json.loads(P.read_text(encoding='utf-8'))

    # template_id -> set of aliases to add (union across families)
    add_by_tid: dict[str, set[str]] = {}
    for fam in FAMILIES.values():
        for tid in fam['templates']:
            add_by_tid.setdefault(tid, set()).update(fam['aliases'])

    total_added = 0
    touched_records = 0
    per_template_counts: dict[str, int] = {}
    for rec in data:
        tid = rec.get('template_id')
        if tid not in add_by_tid:
            continue
        existing = set(rec.get('search_aliases') or [])
        new = add_by_tid[tid] - existing
        if not new:
            continue
        # Preserve original order; append new aliases at the end.
        rec['search_aliases'] = list(rec.get('search_aliases') or []) + sorted(new)
        total_added += len(new)
        touched_records += 1
        per_template_counts[tid] = per_template_counts.get(tid, 0) + 1

    P.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Touched {touched_records} inspirations across {len(per_template_counts)} templates')
    print(f'Total alias entries added (deduped): {total_added}')
    print()
    print('Per-template inspiration counts:')
    for tid in sorted(per_template_counts, key=lambda x: -per_template_counts[x]):
        print(f'  {tid:<60s} {per_template_counts[tid]}')


if __name__ == '__main__':
    main()
