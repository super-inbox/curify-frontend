#!/usr/bin/env python3
"""Remove overspread aliases from inspiration records.

Pairs with scripts/topup_search_aliases.py — the topup script adds
aliases to every inspiration under a listed template (template-level
mode). When the chosen template set is too heterogeneous, the alias
overshoots — e.g. "wedding" added to all template-vocabulary records
including ones about Numbers, Weather, Body Parts. This script does
the inverse: takes a list of (template_id, aliases_to_remove) pairs
and strips the alias strings from every matching inspiration's
`search_aliases` array.

Idempotent — re-running with the same prune config is a no-op once the
aliases are gone. Companion to topup_search_aliases.py which is also
idempotent on append (dedup-by-string).

Created 2026-05-20 to clean up the precision overspread surfaced by
scripts/eval_relevance_audit.cjs. See docs/search-and-content.md for
the full audit and decision queue.
"""
import json
from collections import OrderedDict
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')
P = REPO / 'public/data/nano_inspiration.json'

# (template_id, aliases_to_remove). When an inspiration's template_id
# matches and one of its search_aliases entries is in the alias list,
# remove that entry. Case-insensitive.
#
# Source: scripts/eval_relevance_audit.cjs revealed which template-
# level aliases were creating false-positives. Verdicts captured in
# conversation 2026-05-20.
PRUNE = OrderedDict([
    # mbti_country aliases overshot — Marvel/Naruto/Friends/Yellowstone
    # etc. universes are NOT cross-cultural content. The aliases stay on
    # the actually-country-themed templates (east-asian-culture-comparison,
    # country-top10-travel-destinations, etc.).
    ('mbti_country_universe_overspread', {
        'templates': [
            'template-mbti-marvel',
            'template-mbti-nba',
            'template-mbti-siliconvalley',
            'template-mbti-breakingbad',
            'template-mbti-naruto',
            'template-mbti-yellowstone',
            'template-mbti-ghibli',
            'template-mbti-relationship-infographic',
            'template-harry-potter-mbti-infographic',
            'template-mbti-stereotype-vs-reality-infographic',
            'template-friends-character-mbti',
            'template-zhenhuan-mbti-character-analysis',
            'template-princess-pearl-mbti-character-card',
            'template-pop-culture-matching-chart',
            'template-chinese-classic-character-mbti',
            'template-mbti-animal',
            'template-mbti-contrast',
            'template-mbti-generic',
        ],
        'aliases': [
            'global','world','international','cross-cultural','country','global influence',
            '全球','世界','国际','跨文化','国家','全球影响力',
        ],
    }),
    # template-herbal is medicinal botanical, not aesthetic spring vibes.
    # `唯美春天` recall stays via the actually-aesthetic templates
    # (watercolor-* family).
    ('herbal_aesthetic_overspread', {
        'templates': ['template-herbal'],
        'aliases': [
            'spring','aesthetic','aesthetic spring','floral','flower','botanical',
            'spring flowers','watercolor spring','soft aesthetic',
            '春天','唯美','唯美春天','美感','花卉','植物','春日','春季','水彩春天',
        ],
    }),
    # template-vocabulary covers 100+ topic_names — only a tiny fraction
    # are wedding/animal/wine/en-zh-only/handcraft. The aliases re-attach
    # at inspiration granularity below.
    ('vocabulary_overspread', {
        'templates': [
            'template-vocabulary',
            'template-multilingual-vocabulary-poster-watercolor',
        ],
        'aliases': [
            # wedding family
            'wedding','wedding planner','marriage','bride','groom','ceremony','vows',
            'engagement','anniversary','bridal','wedding invitation','wedding card',
            'wedding planning',
            '婚礼','结婚','婚纱','新娘','新郎','婚庆','婚礼策划','婚礼请柬','周年纪念','订婚',
            # animal vocab cross-lingual
            'animal vocabulary','animal vocab','animal words','animal flashcards','animal names',
            'animals bilingual','animals english chinese','animal terms','animal kingdom',
            '动物词汇','动物 词汇','动物 单词','动物 词卡','动物名称','动物 双语','物种 词汇',
            # english-chinese bilingual
            'english-chinese','english chinese','chinese english','chinese-english',
            'en-zh','zh-en','bilingual english chinese','bilingual chinese english',
            '中英','中英对照','中英 双语','英汉','汉英','双语','双语对照','en zh','zh en',
            # handcraft/scrapbook
            'handcraft','handmade','hand-crafted','diy','diy craft','crafting','crafts',
            'scrapbook','scrapbooks','scrapbooking','collage craft','journal craft',
            'art journal','watercolor crafting','craft tutorial',
            '手作','手工','手工艺','手工制作','拼贴','剪贴簿','手帐','手作 教程','手工 拼贴',
        ],
    }),
    # template-clothing-evolution-poster is fashion/culture history — paper
    # cutting wasn't a meaningful match. Keep paper-cut aliases on
    # intangible-heritage / cultural-relic / guofeng-scroll which actually
    # depict paper-cut content.
    ('clothing_paper_overspread', {
        'templates': ['template-clothing-evolution-poster'],
        'aliases': [
            'paper cutting','papercraft','paper craft','paper art','jianzhi','kirigami',
            'origami','paper folding','traditional paper art','chinese paper cutting',
            'decorative paper','paper silhouette','paper stencil',
            '剪纸','折纸','纸艺','中国剪纸','纸雕','纸工艺','传统剪纸','纸艺 装饰',
        ],
    }),
    # template-mbti-contrast shows MBTI personality OPPOSITES (introvert
    # vs extrovert), which is loose-coupled to linguistic antonyms. Keep
    # antonym recall via chinese-verb-opposite + kids-opposite-concept +
    # language-word-comparison.
    ('mbti_contrast_antonym_overspread', {
        'templates': ['template-mbti-contrast'],
        'aliases': [
            'antonym','antonyms','opposite','opposites','contrast pair','contrasting words',
            'word contrast','bilingual antonym','english chinese opposite',
            '反义','反义词','对比','反义中英','中英对照','中英对比','反义词卡','对比 词',
        ],
    }),
    # 2026-05-29: fashion_red_carpet over-spread on 3 broad templates was
    # flooding the top of /search?q=met+gala (~30 results in positions
    # 1-30: portrait-retouching-blueprint-en 1..5, fashion-ecommerce-*
    # 20+ records, clothing-evolution-poster-* 5+ records). This pushed
    # the literal-match template-lifestyle-photo-grid-met-gala-red-carpet
    # and template-lifestyle-photo-grid-paris-fashion-week records past
    # the 80-item /search cap to positions 80-81.
    # Paired with the tightening of the topup family in
    # scripts/topup_search_aliases.py (same date) — those 3 templates
    # are no longer listed there, so this prune removes the orphan
    # aliases without risk of re-add.
    ('fashion_red_carpet_overspread', {
        'templates': [
            'template-fashion-ecommerce',
            'template-portrait-retouching-blueprint',
            'template-clothing-evolution-poster',
        ],
        'aliases': [
            'red carpet','met gala','gala','runway','fashion show','couture','haute couture',
            'evening gown','ball gown','celebrity fashion','awards show','oscars',
            'oscars red carpet','met gala outfit','formal wear','black tie',
            '红毯','时装秀','礼服','晚礼服','高定','时尚晚会','颁奖典礼','明星红毯','奥斯卡','met 红毯',
        ],
    }),
    # 2026-05-29: wedding_marriage over-spread surfaced via user query
    # 'marriage' returning 89 results with first 5 being template-costume
    # entries unrelated to weddings (Tang qixiong, Ming dragon robe,
    # Qing buzi, Song beizi, Beijing opera armor). template-costume
    # mostly covers historical dynastic dress; only certain styles
    # (qixiong, hanfu wedding variants) are wedding-relevant. template-
    # fashion-before-after-outfit-annotation-card and template-lifestyle-
    # photo-grid are generic outfit/lifestyle templates where wedding
    # was over-spread. Paired with the tightening in topup_search_
    # aliases.py wedding_marriage family (same date).
    ('wedding_marriage_overspread', {
        'templates': [
            'template-costume',
            'template-fashion-before-after-outfit-annotation-card',
            'template-lifestyle-photo-grid',
        ],
        'aliases': [
            'wedding','wedding planner','marriage','bride','groom','ceremony','vows',
            'engagement','anniversary','bridal','wedding invitation','wedding card',
            'wedding planning',
            '婚礼','结婚','婚纱','新娘','新郎','婚庆','婚礼策划','婚礼请柬','周年纪念','订婚',
        ],
    }),
    # 2026-06-07 — WC alias overspread on history-timeline-infographic
    # (introduced by commit 090b0f6c via template-level scope). Aliases
    # added for England 1966 / Brazil 2002 / Maradona Hand of God /
    # iconic moments etc. spread to all 16 timeline inspirations,
    # including apple inc, coffee history, film awards, vintage fashion,
    # marketing agencies, etc. — 9 non-WC timelines now incorrectly
    # match WC queries. This prune entry strips the WC aliases globally;
    # topup_search_aliases.py re-adds them with inspiration_filter scope
    # (title contains 'world cup'/'fifa' for general WC queries,
    # title contains '1966'/'2002'/'argentina'/'brazil' for the
    # year-or-country-specific queries) on the same date.
    ('wc_history_timeline_overspread', {
        'templates': [
            'template-history-timeline-infographic',
            'template-sports-battle',
        ],
        'aliases': [
            # wc_iconic_moments_history family aliases (commit 090b0f6c)
            'Hand of God', 'Maradona Hand of God', 'Maradona 1986',
            'iconic World Cup moments', 'most memorable World Cup moments',
            'most memorable moments', 'World Cup memorable moments',
            'greatest World Cup moments', 'unforgettable World Cup moments',
            'defining World Cup moments', 'World Cup classic moments',
            'World Cup defining matches', 'World Cup iconic matches',
            '世界杯经典时刻', '世界杯难忘时刻', '马拉多纳上帝之手',
            '上帝之手', '世界杯历史经典', '球王时刻',
            '世界杯最难忘瞬间', '世界杯历史时刻',
            # wc_vintage_year_squad family aliases (commit 090b0f6c)
            '1966 World Cup', '1966 England', 'England 1966',
            'England 1966 World Cup', 'England 1966 squad',
            '2002 World Cup', '2002 Brazil', 'Brazil 2002',
            'Brazil 2002 squad', '1970 Brazil', 'Brazil 1970',
            '1986 Argentina', 'Argentina 1986', '1998 France', 'France 1998',
            'World Cup vintage squad', 'World Cup historic squad',
            'World Cup classic team', 'World Cup champion squad history',
            '1966年世界杯', '2002年世界杯', '历届世界杯冠军',
            '经典国家队', '世界杯传奇阵容',
            # argentina_brazil_rivalry family aliases (commit 090b0f6c)
            'Argentina vs Brazil', 'Brazil vs Argentina',
            'Argentina-Brazil', 'Brazil-Argentina',
            'Argentina vs Brazil all time', 'Brazil vs Argentina all time',
            'Argentina Brazil rivalry', 'Brazil Argentina rivalry',
            'South American rivalry', 'South American football rivalry',
            'Superclásico de las Américas', 'Superclasico de las Americas',
            'Albiceleste vs Seleção', 'Albiceleste vs Selecao',
            'CONMEBOL rivalry',
            '阿根廷vs巴西', '巴西vs阿根廷', '阿根廷巴西',
            '巴西阿根廷', '南美足球宿敌', '南美双雄',
            '阿根廷对巴西', '巴西对阿根廷',
        ],
    }),
])


def main():
    data = json.loads(P.read_text(encoding='utf-8'))

    # (template_id, alias_lc) -> True for fast lookup
    remove_by_tid: dict[str, set[str]] = {}
    for fam in PRUNE.values():
        alias_lc = {a.lower() for a in fam['aliases']}
        for tid in fam['templates']:
            remove_by_tid.setdefault(tid, set()).update(alias_lc)

    total_removed = 0
    touched_records = 0
    per_template_counts: dict[str, int] = {}
    for rec in data:
        tid = rec.get('template_id')
        if tid not in remove_by_tid:
            continue
        existing = rec.get('search_aliases')
        if not existing:
            continue
        to_remove = remove_by_tid[tid]
        kept = [a for a in existing if a.lower() not in to_remove]
        removed_count = len(existing) - len(kept)
        if removed_count == 0:
            continue
        rec['search_aliases'] = kept
        total_removed += removed_count
        touched_records += 1
        per_template_counts[tid] = per_template_counts.get(tid, 0) + 1

    P.write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(f'Touched {touched_records} inspirations across {len(per_template_counts)} templates')
    print(f'Total alias entries removed: {total_removed}')
    if per_template_counts:
        print()
        print('Per-template inspiration counts (records with at least 1 removal):')
        for tid in sorted(per_template_counts, key=lambda x: -per_template_counts[x]):
            print(f'  {tid:<60s} {per_template_counts[tid]}')


if __name__ == '__main__':
    main()
