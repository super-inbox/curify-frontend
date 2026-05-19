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
    # ---- 2026-05-19 eval-driven top-up (rewriter base->union lift > 10x
    # or content-gap adjacency on the 28-query regression set) -----------
    ('wedding_marriage', {
        # `wedding planner` lifted from 15 base hits to 409 with the
        # rewriter (27x). Templates already have wedding inspirations
        # but no wedding-direction aliases on the parent.
        'templates': [
            'template-costume',
            'template-east-asian-culture-comparison-infographic',
            'template-fashion-before-after-outfit-annotation-card',
            'template-lifestyle-photo-grid',
            'template-relationship-advice-infographic',
            'template-vocabulary',
            'template-multilingual-vocabulary-poster-watercolor',
            'template-celebration-illustration-poster',
            'template-cultural-festival-poster',
        ],
        'aliases': [
            'wedding','wedding planner','marriage','bride','groom','ceremony','vows',
            'engagement','anniversary','bridal','wedding invitation','wedding card',
            'wedding planning',
            '婚礼','结婚','婚纱','新娘','新郎','婚庆','婚礼策划','婚礼请柬','周年纪念','订婚',
        ],
    }),
    ('antonym_chinese', {
        # `反义词` lifted from 22 to 246 with rewriter (11x). Existing
        # synonym_expressions family already aliases antonym/反义词, but
        # template-mbti-contrast and word-comparison templates are
        # missing from it. Also strengthens the en-zh side.
        'templates': [
            'template-mbti-contrast',
            'template-chinese-verb-opposite-infographic',
            'template-kids-opposite-concept-education',
            'template-language-word-comparison-educational-poster',
            'template-english-word-difference-infographic',
            'template-emotion-vs-emotion-illustration',
        ],
        'aliases': [
            'antonym','antonyms','opposite','opposites','contrast pair','contrasting words',
            'word contrast','bilingual antonym','english chinese opposite',
            '反义','反义词','对比','反义中英','中英对照','中英对比','反义词卡','对比 词',
        ],
    }),
    ('animal_vocab_crosslingual', {
        # `动物 词汇` lifted from 8 to 133 with rewriter (17x). Per-language
        # animal vocab templates exist but the cross-lingual phrasing
        # was not aliased.
        'templates': [
            'template-species',
            'template-species-science',
            'template-dog-breed-retro-infographic',
            'template-mbti-animal',
            'template-vocabulary',
            'template-cartoon-english-vocabulary-flashcards',
            'template-children-english-vocab-spelling',
            'template-detailed-vocab-flashcard',
            'template-group-vocab-category',
            'template-stick-figure-vocab',
            'template-bilingual-object-structure-labeling',
            'template-kids-vocabulary-poster',
            'template-pet-care-guide',
            'template-pet-safe-human-food-infographic',
        ],
        'aliases': [
            'animal vocabulary','animal vocab','animal words','animal flashcards','animal names',
            'animals bilingual','animals english chinese','animal terms','animal kingdom',
            '动物词汇','动物 词汇','动物 单词','动物 词卡','动物名称','动物 双语','物种 词汇',
        ],
    }),
    ('expression_phrase', {
        # `language learning expressions` lifted 10 to 186 (19x). Templates
        # already tagged `expressions` but their alias index is thin on
        # the words a user actually types ("phrase", "idiom", "习语").
        'templates': [
            'template-english-top5-phrases',
            'template-english-dialogue-scene',
            'template-native-english-expressions',
            'template-english-phrasal-verb',
            'template-chinese-idiom-learning-card',
        ],
        'aliases': [
            'expression','expressions','phrase','phrases','idiom','idioms','slang',
            'native expressions','common phrases','daily expressions','everyday expressions',
            'language learning expressions','phrasal verb','phrasal verbs',
            '表达','短语','日常表达','常用表达','地道表达','习语','谚语','俚语','短语动词',
        ],
    }),
    ('english_chinese_bilingual', {
        # `english-chinese` (hyphenated) lifted 0 to 259 — the rewriter
        # rescues it because the catalog blob never carries the
        # hyphenated form as a strict token. Aliasing the bilingual
        # template set closes the gap without relying on rewriter.
        'templates': [
            'template-chinese-classic-character-mbti',
            'template-bilingual-object-structure-labeling',
            'template-chinese-character-learning-poster',
            'template-chinese-verb-opposite-infographic',
            'template-chinese-idiom-learning-card',
            'template-chinese-radical-learning',
            'template-cuisine-food-vocab-poster',
            'template-vocabulary',
            'template-detailed-vocab-flashcard',
            'template-language-word-comparison-educational-poster',
            'template-english-word-difference-infographic',
            'template-multilingual-vocabulary-poster-watercolor',
        ],
        'aliases': [
            'english-chinese','english chinese','chinese english','chinese-english',
            'en-zh','zh-en','bilingual english chinese','bilingual chinese english',
            '中英','中英对照','中英 双语','英汉','汉英','双语','双语对照','en zh','zh en',
        ],
    }),
    ('handcraft_diy_scrapbook', {
        # `手作` (2-char CJK, no bigrams) lifted 0 to 173 via rewriter
        # rescue. Aliasing the scrapbook / watercolor / collage / journal
        # template family closes it directly.
        'templates': [
            'template-vintage-travel-scrapbook-poster',
            'template-watercolor-theme-collage-illustration',
            'template-watercolor-travel-journal-collage',
            'template-watercolor-painting-tutorial-guide',
            'template-watercolor-world-map-illustration',
            'template-multilingual-vocabulary-poster-watercolor',
            'template-lifestyle-watercolor-infographic',
        ],
        'aliases': [
            'handcraft','handmade','hand-crafted','diy','diy craft','crafting','crafts',
            'scrapbook','scrapbooks','scrapbooking','collage craft','journal craft',
            'art journal','watercolor crafting','craft tutorial',
            '手作','手工','手工艺','手工制作','拼贴','剪贴簿','手帐','手作 教程','手工 拼贴',
        ],
    }),
    ('world_cuisines_comfort_food', {
        # `creative comfort food` stayed thin (2 hits) even with rewriter.
        # Adjacent-template gap closure: alias the world-cuisines /
        # recipe template set with the comfort-food vocabulary.
        'templates': [
            'template-cuisine-food-vocab-poster',
            'template-food',
            'template-recipe',
            'template-fruit',
            'template-varieties-food-poster',
            'template-premium-recipe-card-infographic',
            'template-nutrition-food-guide-poster',
            'template-anatomy-cut-guide',
            'template-organ-health-food-guide-infographic',
        ],
        'aliases': [
            'comfort food','creative comfort food','world cuisines','world cuisine',
            'regional cuisine','traditional cuisine','traditional dish','signature dish',
            'family recipe','home cooking','soul food','street food','national cuisine',
            'cuisine guide','recipe inspiration',
            '家常菜','美食','世界美食','各国美食','招牌菜','传统菜','慰藉美食','街头美食','家常 食谱',
        ],
    }),
    ('paper_cutting_kirigami', {
        # `paper cutting` stayed at 1 hit. The intangible-heritage,
        # cultural-relic, and guofeng templates are the natural
        # adjacency — alias them with paper-art vocabulary.
        'templates': [
            'template-intangible-heritage',
            'template-cultural-relic-retro-infographic',
            'template-guofeng-scroll',
            'template-solar-term',
            'template-east-asian-culture-comparison-infographic',
            'template-clothing-evolution-poster',
            'template-national-culture-history-infographic',
        ],
        'aliases': [
            'paper cutting','papercraft','paper craft','paper art','jianzhi','kirigami',
            'origami','paper folding','traditional paper art','chinese paper cutting',
            'decorative paper','paper silhouette','paper stencil',
            '剪纸','折纸','纸艺','中国剪纸','纸雕','纸工艺','传统剪纸','纸艺 装饰',
        ],
    }),
    ('fashion_red_carpet', {
        # `met gala` stayed at 1 hit. Existing fashion templates cover
        # outfit / styling but never alias the red-carpet / gala /
        # couture vocabulary that the gsc-zero query uses.
        'templates': [
            'template-fashion-ecommerce',
            'template-fashion-before-after-outfit-annotation-card',
            'template-fashion-inspired-gown-design-sheet',
            'template-personal-fashion-outfit-style-variations',
            'template-ai-outfit-try-on-poster',
            'template-clothing-evolution-poster',
            'template-ethnic-costume-deconstruction-board',
            'template-lifestyle-photo-grid',
            'template-portrait-retouching-blueprint',
            'template-hairstyle-color-recommendation',
        ],
        'aliases': [
            'red carpet','met gala','gala','runway','fashion show','couture','haute couture',
            'evening gown','ball gown','celebrity fashion','awards show','oscars',
            'oscars red carpet','met gala outfit','formal wear','black tie',
            '红毯','时装秀','礼服','晚礼服','高定','时尚晚会','颁奖典礼','明星红毯','奥斯卡','met 红毯',
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
