#!/usr/bin/env python3
"""One-shot search_aliases top-up driven by docs/search-quality.md item 1.

Appends targeted aliases to inspiration records under specific template
families, without disturbing existing aliases. Idempotent — re-running
is safe (dedup-by-string).

Each family is `(template_ids, aliases [, inspiration_filter])`:
- Without `inspiration_filter`: every inspiration under the listed
  templates gets the aliases (template-level mode — high data
  redundancy reduction, but heterogeneous templates need careful
  curation).
- With `inspiration_filter`: only inspirations whose
  `params.<field>` matches any pattern (case-insensitive substring)
  get the aliases (inspiration-level mode — for templates where the
  alias only fits a subset of examples).
"""
import json
import re
from collections import OrderedDict
from pathlib import Path

REPO = Path('/Users/qqwjq/curify-frontend')
P = REPO / 'public/data/nano_inspiration.json'

# Family → (template_ids, aliases to append). Aliases mix EN + ZH so
# users in either language can find the templates. Source: the analyst
# reports + 2026-05-18 user reports, captured in docs/search-quality.md.
FAMILIES = OrderedDict([
    ('mbti_country', {
        # Tightened 2026-05-20: dropped universe-specific MBTI templates
        # (marvel/naruto/yellowstone/ghibli/friends/breaking bad/silicon
        # valley/nba/harry-potter/zhenhuan/princess-pearl/mbti-generic/
        # mbti-animal/mbti-contrast/mbti-stereotype-vs-reality/
        # mbti-relationship/chinese-classic-character-mbti/pop-culture-
        # matching-chart/city-mbti) — those carry MBTI-within-one-universe
        # content, not cross-cultural / global-influence content. Aliases
        # like "global influence" were producing 232+ false-positive hits.
        # Kept only templates whose entire content is country/cross-
        # cultural by construction.
        'templates': [
            'template-east-asian-culture-comparison-infographic',
            'template-country-top10-travel-destinations',
            'template-country-souvenirs-watercolor',
            'template-national-culture-history-infographic',
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
        # Tightened 2026-05-20: dropped template-herbal — it is medicinal
        # botanical / scientific illustration, not aesthetic-spring vibes.
        # Was driving 75 hits on `唯美春天` and 76 on `spring flowers`
        # despite being off-intent (user wants watercolor / cozy / soft,
        # not herb diagrams).
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
        # Tightened 2026-05-20: dropped template-vocabulary and
        # template-multilingual-vocabulary-poster-watercolor — those
        # cover hundreds of topic_names beyond weddings (Numbers, Body
        # Parts, Weather, etc.). Wedding alias now re-attached at
        # inspiration level via wedding_marriage_insp below.
        #
        # Tightened 2026-05-29: dropped 3 more over-spread templates
        # (template-costume: 47 records mostly about historical dynastic
        # dress, not weddings; template-fashion-before-after-outfit-
        # annotation-card: 7 generic outfit-annotation records; template-
        # lifestyle-photo-grid: 7 generic lifestyle records). Query
        # 'marriage' was returning 89 results with the first 5 being
        # costume entries unrelated to weddings (Tang qixiong, Ming
        # dragon robe, Qing buzi, Song beizi, Beijing opera armor). The
        # prune family wedding_marriage_overspread (in prune_search_
        # aliases.py) removes the orphan aliases from those 3 templates.
        'templates': [
            'template-east-asian-culture-comparison-infographic',
            'template-relationship-advice-infographic',
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
        # Tightened 2026-05-20: dropped template-mbti-contrast — that
        # template shows MBTI personality opposites (introvert vs
        # extrovert), which is loose-coupled to LINGUISTIC antonyms.
        # 27 false-positive hits on `反义词` per the relevance audit.
        'templates': [
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
        # Tightened 2026-05-20: dropped template-vocabulary — too
        # heterogeneous. Animal-themed vocab examples now matched via
        # animal_vocab_insp inspiration-level filter below.
        'templates': [
            'template-species',
            'template-species-science',
            'template-dog-breed-retro-infographic',
            'template-mbti-animal',
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
        # Tightened 2026-05-20: dropped template-vocabulary,
        # template-detailed-vocab-flashcard, template-language-word-
        # comparison-educational-poster, template-english-word-
        # difference-infographic, template-multilingual-vocabulary-
        # poster-watercolor — these templates carry many language pairs.
        # En-zh examples now matched via english_chinese_insp
        # inspiration-level filter (language_pair = en-zh).
        'templates': [
            'template-chinese-classic-character-mbti',
            'template-bilingual-object-structure-labeling',
            'template-chinese-character-learning-poster',
            'template-chinese-verb-opposite-infographic',
            'template-chinese-idiom-learning-card',
            'template-chinese-radical-learning',
            'template-cuisine-food-vocab-poster',
        ],
        'aliases': [
            'english-chinese','english chinese','chinese english','chinese-english',
            'en-zh','zh-en','bilingual english chinese','bilingual chinese english',
            '中英','中英对照','中英 双语','英汉','汉英','双语','双语对照','en zh','zh en',
        ],
    }),
    ('handcraft_diy_scrapbook', {
        # Tightened 2026-05-20: dropped template-multilingual-vocabulary-
        # poster-watercolor — it is vocab-rendered-in-watercolor, not
        # handcraft content. Handcraft alias now re-attached at
        # inspiration level via handcraft_scrapbook_insp below for the
        # few vocab examples whose topic_name actually mentions craft /
        # journal / scrapbook.
        'templates': [
            'template-vintage-travel-scrapbook-poster',
            'template-watercolor-theme-collage-illustration',
            'template-watercolor-travel-journal-collage',
            'template-watercolor-painting-tutorial-guide',
            'template-watercolor-world-map-illustration',
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
        # Tightened 2026-05-20: dropped template-clothing-evolution-
        # poster — it is fashion / culture history, not paper-cutting.
        # 17 false-positive hits on `paper cutting` per audit.
        'templates': [
            'template-intangible-heritage',
            'template-cultural-relic-retro-infographic',
            'template-guofeng-scroll',
            'template-solar-term',
            'template-east-asian-culture-comparison-infographic',
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
        #
        # Tightened 2026-05-29: dropped 3 over-spread templates
        # (fashion-ecommerce: isolated product shots like shoes/bag/hat;
        # portrait-retouching-blueprint: generic portrait retouching;
        # clothing-evolution-poster: historical clothing across eras).
        # These templates were flooding the top of /search?q=met+gala
        # and /search?q=red+carpet, pushing the literal-match
        # template-lifestyle-photo-grid-{met-gala-red-carpet,
        # paris-fashion-week} records past the 80-item /search cap.
        # Aliases removed via prune_search_aliases.py
        # `fashion_red_carpet_overspread` block.
        'templates': [
            'template-fashion-before-after-outfit-annotation-card',
            'template-fashion-inspired-gown-design-sheet',
            'template-personal-fashion-outfit-style-variations',
            'template-ai-outfit-try-on-poster',
            'template-ethnic-costume-deconstruction-board',
            'template-lifestyle-photo-grid',
            'template-hairstyle-color-recommendation',
        ],
        'aliases': [
            'red carpet','met gala','gala','runway','fashion show','couture','haute couture',
            'evening gown','ball gown','celebrity fashion','awards show','oscars',
            'oscars red carpet','met gala outfit','formal wear','black tie',
            '红毯','时装秀','礼服','晚礼服','高定','时尚晚会','颁奖典礼','明星红毯','奥斯卡','met 红毯',
        ],
    }),
    # ---- 2026-05-20 inspiration-level top-up. Counterpart to the
    # prune_search_aliases.py pass that removed these aliases from the
    # over-broad parent templates. Here we re-attach the aliases only on
    # inspirations whose params.topic_name actually matches the alias
    # intent. -----------------------------------------------------------
    ('wedding_marriage_insp', {
        'templates': [
            'template-vocabulary',
            'template-multilingual-vocabulary-poster-watercolor',
        ],
        'inspiration_filter': {
            'field': 'params.topic_name',
            'patterns': [
                'wedding','marriage','bride','bridal','ceremony','婚礼','结婚','婚纱','新娘',
            ],
        },
        'aliases': [
            'wedding','wedding planner','marriage','bride','groom','ceremony','vows',
            'engagement','anniversary','bridal','wedding invitation','wedding card',
            'wedding planning',
            '婚礼','结婚','婚纱','新娘','新郎','婚庆','婚礼策划','婚礼请柬','周年纪念','订婚',
        ],
    }),
    ('animal_vocab_insp', {
        'templates': ['template-vocabulary'],
        'inspiration_filter': {
            'field': 'params.topic_name',
            'patterns': [
                'animal','pet','dog','cat','bird','farm','forest','ocean','butterfly',
                'caterpillar','wildlife','insect','reptile','mammal','fish',
                '动物','宠物','野生',
            ],
        },
        'aliases': [
            'animal vocabulary','animal vocab','animal words','animal flashcards','animal names',
            'animals bilingual','animals english chinese','animal terms','animal kingdom',
            '动物词汇','动物 词汇','动物 单词','动物 词卡','动物名称','动物 双语','物种 词汇',
        ],
    }),
    ('english_chinese_insp', {
        'templates': [
            'template-vocabulary',
            'template-multilingual-vocabulary-poster-watercolor',
        ],
        'inspiration_filter': {
            'field': 'params.language_pair',
            'patterns': ['en-zh','zh-en'],
        },
        'aliases': [
            'english-chinese','english chinese','chinese english','chinese-english',
            'en-zh','zh-en','bilingual english chinese','bilingual chinese english',
            '中英','中英对照','中英 双语','英汉','汉英','双语','双语对照','en zh','zh en',
        ],
    }),
    ('handcraft_scrapbook_insp', {
        # Vocab cards generally aren't handcraft, but a few specifically
        # cover crafting / scrapbook / journal as their topic_name.
        'templates': [
            'template-vocabulary',
            'template-multilingual-vocabulary-poster-watercolor',
        ],
        'inspiration_filter': {
            'field': 'params.topic_name',
            'patterns': [
                'craft','handmade','scrapbook','journal','collage','diy',
                '手作','手工','手帐','拼贴','剪贴',
            ],
        },
        'aliases': [
            'handcraft','handmade','hand-crafted','diy','diy craft','crafting','crafts',
            'scrapbook','scrapbooks','scrapbooking','collage craft','journal craft',
            'art journal','watercolor crafting','craft tutorial',
            '手作','手工','手工艺','手工制作','拼贴','剪贴簿','手帐','手作 教程','手工 拼贴',
        ],
    }),
    # ── 2026-05-28 data-driven top-up: 5 failing queries from the 14-day
    # admin.py search panel (curify-studio admin.py section 6). For each
    # query, we identified the templates whose inspirations already carry
    # the content (verified by blob match), then explicitly alias them
    # so the production scoreBlob ranks them above the precision guard.
    # Queries: chiikawa (3 searches, 0 CTR), 下雨 (2, 0), samurai (1, 0),
    # 歷史 (1, 0), 路书 (1, 0).
    ('chiikawa_franchise', {
        'templates': [
            'template-fandom-character-grid-poster',
            'template-pop-culture-matching-chart',
            'template-celebrity-movie-group-poster',
            'template-mbti-generic',
            'template-vocabulary',
        ],
        'inspiration_filter': {
            'fields_any': [
                'params.theme',
                'params.theme_name',
                'params.character_set',
                'params.mbti_topic',
                'params.topic_name',
                'params.star_movie_group',
            ],
            'patterns': ['chiikawa', '吉伊卡哇', 'ちいかわ'],
        },
        'aliases': [
            'chiikawa','ちいかわ','吉伊卡哇','chii','nagano',
        ],
    }),
    ('samurai_franchise', {
        'templates': [
            'template-fandom-character-grid-poster',
            'template-mbti-generic',
            'template-historical-figure-profile-infographic',
        ],
        'inspiration_filter': {
            'fields_any': [
                'params.theme',
                'params.character_set',
                'params.mbti_topic',
                'params.topic',
                'params.topic_name',
            ],
            'patterns': ['samurai', '武士', '侍'],
        },
        'aliases': [
            'samurai','samurais','bushido','武士','侍','武士道','幕末','feudal japan',
            'shogun','shogunate','jidaigeki','时代剧','武家',
        ],
    }),
    ('weather_cjk', {
        # Single dedicated weather template — safe to apply template-wide.
        'templates': [
            'template-weather-education-infographic',
        ],
        'aliases': [
            '天气','下雨','雨','雨天','下雪','雪','雪天','晴天','阴天',
            '多云','刮风','大风','雷雨','暴雨','气象',
            '天氣','下雨天','陰天','颱風','台风','颶風',
            'rainy','snowy','sunny','cloudy','windy','stormy','thunderstorm','blizzard',
            'weather forecast','weather chart','climate',
        ],
    }),
    ('history_cjk', {
        # All 13 templates carry the `history` tier-2 topic. Adding CJK
        # history terms ensures 歷史 / 历史 / 历史人物 queries land instead
        # of returning empty (eval gap 2026-05-28).
        'templates': [
            'template-what-if-history',
            'template-historical-event-map-illustration',
            'template-figure-principles-infographic',
            'template-world-landmark-vintage-info-poster',
            'template-history-timeline-infographic',
            'template-artist-biography-infographic',
            'template-historical-figure-vs-infographic',
            'template-historical-figure-educational',
            'template-national-culture-history-infographic',
            'template-manga-artist-infographic-poster',
            'template-historical-figure-profile-infographic',
            'template-evolution-timeline-infographic',
            'template-historical-evolution-timeline-infographic',
        ],
        'aliases': [
            '历史','歷史','歷史人物','历史人物','歷史事件','历史事件','史','历史时期','歷史時期',
            '中国历史','中國歷史','世界历史','世界歷史','古代史','近代史','现代史','現代史',
            'historical figure','historical event','historical timeline','world history',
        ],
    }),
    ('itinerary_cjk', {
        'templates': [
            'template-travel',
            'template-series-travel',
            'template-travel-packing-guide-infographic',
            'template-tourist-spot-watercolor-map-infographic',
        ],
        'aliases': [
            '路书','旅行路书','行程','旅行行程','路线','旅行路线','旅游攻略','旅游线路',
            '路書','旅行路書','旅行路線','旅遊攻略',
            'roadbook','road book','travel route','itinerary plan','trip plan',
            'route plan','journey plan',
        ],
    }),
    # 2026-05-29 user-flagged: 'product design' returns only 3 results,
    # all from template-food-product-packaging-design (added yesterday).
    # Aliases the query to the 5 templates that actually host product
    # design content. This is idea-(a) in action — generic templates
    # (product-poster, fashion-ecommerce, industrial-design-concept-
    # sketch, product-theme-promotional-poster) serve broader queries
    # than their narrow names suggest, but only if we wire the aliases.
    ('product_design', {
        'templates': [
            'template-fashion-ecommerce',
            'template-industrial-design-concept-sketch',
            'template-product-poster',
            'template-product-theme-promotional-poster',
            'template-food-product-packaging-design',
        ],
        'aliases': [
            'product design','product mockup','packaging design','industrial design',
            'product photography','product showcase','mockup','commercial product',
            'consumer product design','product visual','retail design','product render',
            '产品设计','包装设计','工业设计','产品摄影','产品展示','商品设计','产品视觉',
            '商品摄影','零售设计','消费品设计',
        ],
    }),
    # 2026-05-31: backfill product tier-2 vocabulary onto existing inspirations
    # so strict-token search matches them on the canonical tier-2 word
    # (today they only match via parent-template topics, which is enough
    # for the topic page but not for explicit-token scoring). Skips
    # branding — no templates yet.
    ('product_tier2_packaging', {
        'templates': ['template-food-product-packaging-design'],
        'aliases': ['packaging','包装'],
    }),
    ('product_tier2_ecommerce', {
        'templates': ['template-fashion-ecommerce', 'template-ai-outfit-try-on-poster'],
        'aliases': ['ecommerce','e-commerce','电商'],
    }),
    ('product_tier2_showcase', {
        'templates': [
            'template-product-poster',
            'template-product-theme-promotional-poster',
            'template-interior-design-mood-board-generator',
            'template-industrial-design-concept-sketch',
        ],
        'aliases': ['showcase','产品展示'],
    }),
    # 2026-06-02 weekly cycle 2: 出海品牌 (cross-border ecom brand) surfaced
    # as a Chinese B2B query with no result. Tier-2 product (ecommerce +
    # branding + packaging) already exists; this top-up makes the queries
    # land on the existing product templates.
    ('cross_border_ecom_brand', {
        'templates': [
            'template-fashion-ecommerce',
            'template-product-poster',
            'template-product-theme-promotional-poster',
            'template-food-product-packaging-design',
        ],
        'aliases': [
            'cross-border', 'cross-border ecommerce', 'cross-border brand',
            'going-abroad brand', 'dtc cross-border', 'overseas market',
            'overseas brand', 'global expansion brand',
            '出海品牌', '跨境品牌', '跨境电商', '出海', '海外市场', '海外品牌',
            '全球化品牌', '出海营销',
        ],
    }),
    # 2026-06-07 — WC top-query content fidelity, precision-tightened.
    # Original families (commit 090b0f6c) used template-level scope on
    # history-timeline-infographic, which spread WC aliases to ALL 16
    # timeline inspirations including apple inc, coffee history, film
    # awards, vintage fashion, marketing agencies, fashion eras 1920-2020
    # — 9 non-WC timelines incorrectly matched WC queries (England 1966
    # → 17 hits, only 1 actually about 1966; Maradona Hand of God → 16,
    # only 1 actually about Maradona). Prune entry
    # `wc_history_timeline_overspread` in prune_search_aliases.py strips
    # the template-level alias spread; these families re-add the same
    # aliases with inspiration_filter scope so only on-content
    # inspirations match.
    ('wc_history_general', {
        'templates': [
            'template-history-timeline-infographic',
        ],
        'inspiration_filter': {
            'field': 'locales.en.title',
            'patterns': ['world cup', 'fifa'],
        },
        'aliases': [
            'Hand of God', 'Maradona Hand of God', 'Maradona 1986',
            'iconic World Cup moments', 'most memorable World Cup moments',
            'most memorable moments', 'World Cup memorable moments',
            'greatest World Cup moments', 'unforgettable World Cup moments',
            'defining World Cup moments', 'World Cup classic moments',
            'World Cup defining matches', 'World Cup iconic matches',
            'World Cup vintage squad', 'World Cup historic squad',
            'World Cup classic team', 'World Cup champion squad history',
            '世界杯经典时刻', '世界杯难忘时刻', '马拉多纳上帝之手',
            '上帝之手', '世界杯历史经典', '球王时刻',
            '世界杯最难忘瞬间', '世界杯历史时刻',
            '历届世界杯冠军', '经典国家队', '世界杯传奇阵容',
        ],
    }),
    ('wc_1966_specific', {
        'templates': [
            'template-history-timeline-infographic',
            'template-football-team-all-time-lineup-poster',
            'template-sports-iconic-event-analysis-poster',
            'template-celebrity-movie-group-poster',
        ],
        'inspiration_filter': {
            'field': 'locales.en.title',
            'patterns': ['1966'],
        },
        'aliases': [
            '1966 World Cup', '1966 England', 'England 1966',
            'England 1966 World Cup', 'England 1966 squad',
            'England 1966 winning XI', 'Geoff Hurst hat-trick',
            'Wembley 1966', 'wingless wonders',
            '1966年世界杯', '1966年英格兰', '英格兰1966',
        ],
    }),
    ('wc_2002_specific', {
        'templates': [
            'template-history-timeline-infographic',
            'template-football-team-all-time-lineup-poster',
            'template-sports-iconic-event-analysis-poster',
        ],
        'inspiration_filter': {
            'field': 'locales.en.title',
            'patterns': ['2002'],
        },
        'aliases': [
            '2002 World Cup', '2002 Brazil', 'Brazil 2002',
            'Brazil 2002 squad', 'Brazil 2002 Pentacampeao',
            'Pentacampeao XI', 'Ronaldo Nazario 2002',
            'Brazil vs Germany 2002', 'Yokohama 2002 final',
            '2002年世界杯', '2002年巴西', '巴西2002',
            '罗纳尔多2002', '五星巴西',
        ],
    }),
    # 2026-06-09 cycle 4 — `cr7` jersey-shortcut. 1 SEARCH_NORESULT on
    # 2026-06-06 from a user who tried the shortcut form rather than the
    # full name. Content exists across 18 inspirations (template-mbti-nba
    # "cristianoronaldo", soccer-star-comic-retro, Portugal 2026 WC squad,
    # Messi-vs-Ronaldo battle, etc.). Filter on cristiano / ronaldo /
    # portugal so the alias only attaches to on-content inspirations.
    ('cr7_ronaldo_shortcut', {
        'templates': [
            'template-soccer-star-comic-retro-poster-card',
            'template-celebrity-movie-group-poster',
            'template-world-cup-team-sticker-poster',
            'template-sports-battle',
            'template-mbti-nba',
        ],
        'inspiration_filter': {
            'fields_any': [
                'locales.en.title',
                'params.player_name',
                'params.team',
                'params.team_name',
                'params.star_movie_group',
            ],
            'patterns': ['cristiano', 'ronaldo', 'portugal'],
        },
        'aliases': [
            'cr7', 'CR7', 'c.r.7', 'ronaldo7', 'cr 7',
            '罗纳尔多', '克里斯蒂亚诺·罗纳尔多', 'C罗',
        ],
    }),
    # 2026-06-12 cycle 5 — "squad picture" intent. Noclick pull surfaced
    # users typing the phrase variations below — they DID get results (no
    # SEARCH_NORESULT), but didn't click. The result tiles match via
    # free-text on the title but no alias was hitting "squad picture" /
    # "group pic" / "team picture" specifically, so the LLM rewriter was
    # the only path. Add the phrasing aliases directly on the 5 WC squad
    # templates so the match is exact (alias > free-text > LLM rewriter).
    ('wc_squad_picture_phrasing', {
        'templates': [
            'template-celebrity-movie-group-poster',
            'template-world-cup-team-sticker-poster',
            'template-group-team-vertical-banner-country-poster',
            'template-soccer-star-comic-retro-poster-card',
            'template-football-team-all-time-lineup-poster',
        ],
        'inspiration_filter': {
            'fields_any': [
                'locales.en.title',
                'params.team',
                'params.team_name',
                'params.team_info',
                'params.player_name',
                'params.star_movie_group',
            ],
            # Match every squad poster — phrasing aliases apply broadly to
            # any team/player example on these templates.
            'patterns': ['squad', 'team', 'player', 'world cup', 'cup', '2026'],
        },
        'aliases': [
            'squad picture', 'squad pic', 'squad photo', 'squad poster',
            'team picture', 'team pic', 'team photo', 'team poster',
            'group pic', 'group picture', 'group photo', 'group poster',
            'national team picture', 'national team poster',
            'team squad', 'squad banner',
            'make squad picture', 'create team poster',
            '球队照', '阵容照', '阵容海报', '球队海报', '阵容图', '国家队照', '国家队海报',
        ],
    }),
    ('argentina_brazil_rivalry', {
        'templates': [
            'template-history-timeline-infographic',
            'template-sports-battle',
        ],
        'inspiration_filter': {
            'fields_any': [
                'locales.en.title',
                'params.home',
                'params.away',
                'params.team',
                'params.team_name',
                'params.player_name',
            ],
            'patterns': ['argentina', 'brazil', 'messi', 'maradona'],
        },
        'aliases': [
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
    # 2026-06-07 — merch / merchandise-design subject family. Paired with
    # the new tier-2 topic merch under design (lib/taxonomy.json) +
    # topics.merch i18n (messages/en/topics.json) + topics[] tagging on
    # the 4 IP-merch templates (template-ip-creative-cultural-goods-
    # mockup-set / template-ip-gift-box-stationery-set-mockup /
    # template-ip-character-sprite-emoji-sheet /
    # template-ip-emoji-sticker-sheet-poster). Bilingual aliases cover
    # production vocabulary (POD / DTG / screen-printing) so users on
    # either side of the merch-design pipeline land on the right templates.
    ('merchandise_design', {
        'templates': [
            'template-ip-creative-cultural-goods-mockup-set',
            'template-ip-gift-box-stationery-set-mockup',
            'template-ip-character-sprite-emoji-sheet',
            'template-ip-emoji-sticker-sheet-poster',
            'template-world-cup-team-sticker-poster',
            'template-food-photo-doodle-sticker-overlay',
        ],
        'aliases': [
            'merch', 'merchandise', 'merchandise design', 'merch design',
            'branded merchandise', 'promotional merchandise', 'swag',
            'print on demand', 'POD', 'on-demand printing',
            'screen printing', 'screen print', 'silkscreen',
            'DTG', 'direct to garment', 'sublimation printing',
            'sticker design', 'sticker sheet design',
            'IP merchandise', 'character merchandise',
            'cultural creative goods', 'cultural creative merchandise',
            't-shirt design', 'tee design', 'apparel design',
            'mug design', 'tote bag design',
            'gift box design', 'packaging mockup',
            'character sprite sheet', 'emoji sticker sheet',
            '周边', '周边设计', '周边商品', '文创周边',
            '文创商品', '文创设计', '潮玩周边',
            '印刷品', '印刷设计', '丝网印刷',
            '按需印刷', 'POD 周边', '热升华印刷',
            'T恤设计', 'T恤印花', '帆布袋设计',
            '马克杯设计', '贴纸设计', '贴纸表情包',
            '角色表情包', '角色三视图',
            '礼盒包装设计', '伴手礼设计',
        ],
    }),
])


def _inspiration_matches_filter(rec: dict, flt: dict) -> bool:
    """Check whether an inspiration's field contains any of the filter patterns.

    flt has `patterns` (list of case-insensitive substrings — match if any one
    appears) and EITHER:
      - `field`: dotted path into the record (e.g. 'params.topic_name')
      - `fields_any`: list of dotted paths — match if ANY field contains any
        pattern. Use when a franchise name (e.g. 'chiikawa') appears across
        multiple param shapes (params.theme, params.theme_name,
        params.character_set) within the family's templates.
    When the resolved field is missing or empty, that field does NOT match.
    """
    paths = flt.get('fields_any') or [flt['field']]
    patterns_lc = [pat.lower() for pat in flt['patterns']]
    for path in paths:
        val = rec
        for p in path.split('.'):
            if not isinstance(val, dict):
                val = None
                break
            val = val.get(p)
            if val is None:
                break
        if val is None:
            continue
        val_lc = str(val).lower()
        if any(pat in val_lc for pat in patterns_lc):
            return True
    return False


def main():
    data = json.loads(P.read_text(encoding='utf-8'))

    # Build two passes:
    #   template_level: tid -> set(aliases)              # applies to every record under tid
    #   inspiration_level: list of (templates, filter, aliases)  # filtered per-record
    template_level: dict[str, set[str]] = {}
    inspiration_level: list[tuple[set[str], dict, set[str]]] = []
    for fam in FAMILIES.values():
        flt = fam.get('inspiration_filter')
        alias_set = set(fam['aliases'])
        if flt is None:
            for tid in fam['templates']:
                template_level.setdefault(tid, set()).update(alias_set)
        else:
            inspiration_level.append((set(fam['templates']), flt, alias_set))

    total_added = 0
    touched_records = 0
    per_template_counts: dict[str, int] = {}
    for rec in data:
        tid = rec.get('template_id')
        existing = set(rec.get('search_aliases') or [])
        new: set[str] = set()

        # Template-level aliases
        if tid in template_level:
            new.update(template_level[tid] - existing)

        # Inspiration-level aliases
        for templates, flt, alias_set in inspiration_level:
            if tid not in templates:
                continue
            if not _inspiration_matches_filter(rec, flt):
                continue
            new.update(alias_set - existing - new)

        if not new:
            continue
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
