"""Add EN + ZH i18n for the 4 new templates from hongjie28-patch-6 (2026-07-04 drop).

Templates:
  - template-football-star-chibi-sticker-set
  - template-world-cup-premium-gold-text-poster
  - template-japanese-traditional-music-instrument-info-poster
  - template-english-confusing-word-pair-educational-poster

Per memory feedback_daily_drop_i18n.md: i18n ships in the same workflow;
nano.json is FLAT (doc[tid] = ...). Writes en + zh; the other 8 locales are
filled by `node scripts/i18n_autotranslate.cjs --base en --files nano --skip zh --write`.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

template_ids = [
    "template-football-star-chibi-sticker-set",
    "template-world-cup-premium-gold-text-poster",
    "template-japanese-traditional-music-instrument-info-poster",
    "template-english-confusing-word-pair-educational-poster",
]

EN = {
    "template-football-star-chibi-sticker-set": {
        "category": "Football Star Chibi Sticker Set",
        "description": "Generate a 3×4 chibi football-player sticker sheet — 12 fixed-expression stickers with clean die-cut borders — for any national-team star and jersey.",
        "title": "Nano Banana Prompt: Football Star Chibi Sticker Set Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a 3×4 grid of cute chibi football-player stickers themed {player_nationality_jersey}. Each of the 12 stickers has a clean white die-cut border and a fixed universal expression — pointing & laughing, angry, crying, shocked, cheering, winking and more — on a plain off-white background, all wearing the player's national-team kit. Kawaii cartoon style, consistent character design across the sheet, print- and messaging-ready.",
            "who": "Suitable for football fans and fan communities, sports meme / sticker creators, matchday social content makers, merch designers, and messaging-app sticker-pack publishers.",
            "how": [
                "Enter the star + national team + jersey in {player_nationality_jersey} (e.g. 'Croatia Luka Modrić #10 checkered jersey').",
                "12 fixed-expression stickers auto-render in a 3×4 grid.",
                "Each sticker keeps the player's kit and a clean die-cut border.",
                "Generate a chibi football-star sticker sheet."
            ],
            "prompts": [
                "Generate a chibi sticker set for Erling Haaland, Norway #9.",
                "Create a sticker sheet for Lionel Messi, Argentina #10 albiceleste.",
                "Generate a chibi sticker pack for Kylian Mbappé, France #10."
            ]
        }},
    },
    "template-world-cup-premium-gold-text-poster": {
        "category": "World Cup Premium Gold Poster",
        "description": "Generate an epic cinematic World Cup poster with premium gold typography — legend farewell tribute or matchup layout — for any player or fixture.",
        "title": "Nano Banana Prompt: World Cup Premium Gold Text Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical epic cinematic FIFA World Cup promotional poster themed {poster_theme_type}, in one of two layouts: a Legend Farewell Tribute ('Twilight of the Gods') with a golden serif headline, poetic vintage quote and hero portrait; or a matchup layout with team crests, flags and fixture details. Premium gold typography, dramatic cinematic lighting, print-ready poster quality.",
            "who": "Suitable for football content creators, sports editorial designers, fan communities producing tribute and matchday graphics, and brands publishing World Cup-themed visuals.",
            "how": [
                "Enter the poster theme in {poster_theme_type} (e.g. 'Luka Modrić twilight retirement farewell tribute').",
                "Pick a farewell-tribute or matchup layout.",
                "Golden typography, portrait / crests and cinematic background auto-compose.",
                "Generate a premium gold-text World Cup poster."
            ],
            "prompts": [
                "Generate a Cristiano Ronaldo World Cup career farewell cinematic poster.",
                "Create a Cabo Verde vs Argentina 2026 World Cup matchup poster.",
                "Generate a Twilight of the Gods tribute poster for Luka Modrić."
            ]
        }},
    },
    "template-japanese-traditional-music-instrument-info-poster": {
        "category": "Japanese Instrument Info Poster",
        "description": "Generate a vintage washi-paper educational infographic poster about a traditional Japanese musical instrument — red seal title, labeled diagram, and history copy.",
        "title": "Nano Banana Prompt: Japanese Traditional Instrument Info Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical vintage washi-paper educational infographic poster themed {japanese_instrument_name}, in a unified modular series layout: a top area with a vertical red seal stamp bearing the kanji name plus a serif English title; a central labeled instrument illustration with structural annotations; and lower sections covering history, playing method and cultural context. Warm washi texture, elegant editorial layout, museum-print quality.",
            "who": "Suitable for music educators, cultural / museum content teams, traditional-arts enthusiasts, classroom and study-sheet makers, and designers building an instrument-series poster set.",
            "how": [
                "Enter the instrument in {japanese_instrument_name} (e.g. '13-string Koto zither', 'Shamisen three-string lute').",
                "Red seal kanji title and serif English title auto-set.",
                "Labeled instrument diagram and history sections auto-compose.",
                "Generate a vintage washi instrument infographic poster."
            ],
            "prompts": [
                "Generate an info poster for the Taiko barrel festival drum.",
                "Create a washi infographic for the Shamisen three-string lute.",
                "Generate an educational poster for the Sho court mouth organ."
            ]
        }},
    },
    "template-english-confusing-word-pair-educational-poster": {
        "category": "English Confusing Word Pair Poster",
        "description": "Generate a classroom educational poster contrasting a commonly confused English word pair — dual-column definitions, examples, and a memory tip.",
        "title": "Nano Banana Prompt: English Confusing Word Pair Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical elementary-classroom grammar learning poster themed {word_pair_title}, in a unified dual-column split layout: a header with a huge two-color [WordA VS WordB] title and a one-line core-difference subtitle; two columns each giving the word's part of speech, definition and example sentences; and a bottom memory tip. Clean bright classroom style, bold friendly type, print- and worksheet-ready.",
            "who": "Suitable for ESL / English teachers, elementary and homeschool educators, tutoring content makers, classroom-poster designers, and study-sheet publishers.",
            "how": [
                "Enter the word pair in {word_pair_title} (e.g. 'Loose vs Lose', 'Your vs You're').",
                "A two-color VS title and core-difference subtitle auto-set.",
                "Dual columns fill with definitions and example sentences.",
                "Generate an English confusing-word-pair educational poster."
            ],
            "prompts": [
                "Generate a poster for 'Advice vs Advise'.",
                "Create a classroom sheet for 'Accept vs Except'.",
                "Generate an educational poster for 'Complement vs Compliment'."
            ]
        }},
    },
}

ZH = {
    "template-football-star-chibi-sticker-set": {
        "category": "球星 Q 版表情贴纸包",
        "description": "为任意国家队球星与球衣生成 3×4 Q 版球员表情贴纸——12 个固定表情、干净模切白边。",
        "title": "Nano Banana 提示词：球星 Q 版表情贴纸包生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板以 {player_nationality_jersey} 为主题，生成 3×4 网格的可爱 Q 版球员贴纸。12 个贴纸各带干净模切白边与固定通用表情——指着大笑、愤怒、大哭、震惊、振臂欢呼、眨眼等——统一米白背景，均身着球员所属国家队球衣。Q 版卡通风格，整张贴纸角色设定一致，适合打印与聊天贴纸使用。",
            "who": "适合足球球迷与粉丝社群、体育梗图 / 贴纸创作者、比赛日社媒内容作者、周边设计师，以及聊天软件贴纸包发布者。",
            "how": [
                "在 {player_nationality_jersey} 输入球星 + 国家队 + 球衣（例如：Croatia Luka Modrić #10 格纹球衣）。",
                "12 个固定表情贴纸自动排入 3×4 网格。",
                "每个贴纸保留球员球衣与干净模切白边。",
                "生成 Q 版球星表情贴纸包。"
            ],
            "prompts": [
                "为挪威 9 号 Erling Haaland 生成 Q 版贴纸包。",
                "为阿根廷 10 号 Lionel Messi 制作蓝白间条球衣贴纸。",
                "为法国 10 号 Kylian Mbappé 生成 Q 版贴纸包。"
            ]
        }},
    },
    "template-world-cup-premium-gold-text-poster": {
        "category": "世界杯高级烫金海报",
        "description": "为任意球员或赛事生成史诗电影感世界杯海报，配高级烫金字体——传奇告别致敬或对阵版式。",
        "title": "Nano Banana 提示词：世界杯高级烫金海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板以 {poster_theme_type} 为主题，生成竖版史诗电影感 FIFA 世界杯宣传海报，可选两种版式：传奇告别致敬（诸神黄昏系列）——金色衬线主标题、复古诗意引言与英雄肖像；或对阵版式——队徽、国旗与赛事信息。高级烫金字体、戏剧化电影级光影、印刷级海报质感。",
            "who": "适合足球内容创作者、体育编辑设计师、制作致敬与比赛日图的球迷社群，以及发布世界杯主题视觉的品牌方。",
            "how": [
                "在 {poster_theme_type} 输入海报主题（例如：Luka Modrić 迟暮退役告别致敬）。",
                "选择告别致敬或对阵版式。",
                "金色字体、肖像 / 队徽与电影级背景自动排布。",
                "生成高级烫金世界杯海报。"
            ],
            "prompts": [
                "生成 Cristiano Ronaldo 世界杯生涯告别电影感海报。",
                "制作佛得角 vs 阿根廷 2026 世界杯对阵海报。",
                "为 Luka Modrić 生成诸神黄昏致敬海报。"
            ]
        }},
    },
    "template-japanese-traditional-music-instrument-info-poster": {
        "category": "日本传统乐器信息图海报",
        "description": "生成关于日本传统乐器的复古和纸科普信息图海报——红印落款标题、标注图解与历史文案。",
        "title": "Nano Banana 提示词：日本传统乐器信息图海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板以 {japanese_instrument_name} 为主题，生成竖版复古和纸科普信息图海报，采用统一模块化系列版式：顶部为竖排红印落款（含乐器汉字名）+ 衬线英文标题；中部为带结构标注的乐器图解；下方分区介绍历史、演奏方式与文化背景。温润和纸质感、优雅编辑排版、博物馆印刷级质感。",
            "who": "适合音乐教育者、文化 / 博物馆内容团队、传统艺术爱好者、课堂与学习单制作者，以及打造乐器系列海报的设计师。",
            "how": [
                "在 {japanese_instrument_name} 输入乐器（例如：十三弦筝、三味线）。",
                "红印汉字落款与衬线英文标题自动生成。",
                "带标注的乐器图解与历史分区自动排布。",
                "生成复古和纸乐器信息图海报。"
            ],
            "prompts": [
                "为太鼓（节庆桶鼓）生成信息图海报。",
                "为三味线制作和纸科普信息图。",
                "为笙（宫廷笙）生成科普海报。"
            ]
        }},
    },
    "template-english-confusing-word-pair-educational-poster": {
        "category": "易混淆英语单词对照海报",
        "description": "生成对照常见易混淆英语单词对的课堂教育海报——双栏释义、例句与记忆提示。",
        "title": "Nano Banana 提示词：易混淆英语单词对照海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板以 {word_pair_title} 为主题，生成竖版小学课堂语法学习海报，采用统一双栏分割版式：页眉为超大双色 [WordA VS WordB] 标题 + 一行核心区别副标题；两栏分别给出词性、释义与例句；底部为记忆提示。简洁明亮课堂风格、醒目友好字体，适合打印与练习单。",
            "who": "适合 ESL / 英语教师、小学与家庭教育者、辅导内容作者、课堂海报设计师，以及学习单发布者。",
            "how": [
                "在 {word_pair_title} 输入单词对（例如：Loose vs Lose、Your vs You're）。",
                "双色 VS 标题与核心区别副标题自动生成。",
                "双栏自动填充释义与例句。",
                "生成易混淆英语单词对照教育海报。"
            ],
            "prompts": [
                "为 'Advice vs Advise' 生成对照海报。",
                "为 'Accept vs Except' 制作课堂学习单。",
                "为 'Complement vs Compliment' 生成教育海报。"
            ]
        }},
    },
}


def main():
    by_locale = {"en": EN, "zh": ZH}
    for locale, content in by_locale.items():
        missing = [tid for tid in template_ids if tid not in content]
        if missing:
            raise SystemExit(f"FAIL: locale {locale} missing {missing}")

    total = 0
    for locale, content in by_locale.items():
        p = MESSAGES / locale / "nano.json"
        if not p.exists():
            print(f"  SKIP (missing): {p}")
            continue
        doc = json.loads(p.read_text(encoding="utf-8"))
        added = 0
        for tid in template_ids:
            if tid in doc:
                print(f"  ({locale}) already has {tid}, skipping")
                continue
            doc[tid] = content[tid]
            added += 1
            total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added} template entries")

    print(f"\nDone. Added {total} en/zh entries. Next: i18n_autotranslate for the other 8 locales.")


if __name__ == "__main__":
    main()
