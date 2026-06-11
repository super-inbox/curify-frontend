"""Append i18n entries for 6 new templates from hongjie28-patch-2 (2026-06-11 push).

Templates added:
  - template-character-multi-panel-comic-strip-poster       (3x3 classic comic-strip grid)
  - template-brand-vi-full-visual-pack-mockup               (full brand visual identity board)
  - template-football-player-graffiti-poster                (vertical illustrated player poster)
  - template-vintage-football-jersey-intro-watercolor-poster (classic jersey watercolor feature)
  - template-brand-ip-full-design-board                     (brand-IP character design board)
  - template-theme-color-palette-card                       (themed scene color palette card)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v12 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid].
  - EN authored for all 6 templates + ZH translations; other 8 locales
    fall back to EN and pick up native translations on the next
    i18n_autotranslate.cjs sweep.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-character-multi-panel-comic-strip-poster",
    "template-brand-vi-full-visual-pack-mockup",
    "template-football-player-graffiti-poster",
    "template-vintage-football-jersey-intro-watercolor-poster",
    "template-brand-ip-full-design-board",
    "template-theme-color-palette-card",
]

EN = {
    "template-character-multi-panel-comic-strip-poster": {
        "category": "Multi-Panel Classic Comic Strip Poster",
        "description": "Generate a vertical multi-panel comic strip poster — 3x3 (or custom) grid of classic characters with bold stylized title banner, each panel an iconic moment.",
        "title": "Nano Banana Prompt: Multi-Panel Classic Comic Strip Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical multi-panel comic strip poster on any anime / cartoon theme. Fixed-grid layout (3 rows x 3 panels by default) with a bold stylized title banner at top; each panel features a classic character in an individual iconic moment, building toward a single collectible composition with consistent stylization across the strip.",
            "who": "Suitable for anime / cartoon fan-art creators, classic-cartoon nostalgia print sellers, kids' room wall-art designers, fandom-merch Etsy / Redbubble operators, and educators producing visual-storytelling teaching aids.",
            "how": [
                "Enter the anime / cartoon theme in {anime_cartoon_theme_info} (e.g. 'Looney Tunes classic character highlight comic strip').",
                "Title banner auto-renders at the top.",
                "9 panels auto-compose with iconic-moment scenes of each character.",
                "Generate a vertical multi-panel comic strip poster."
            ],
            "prompts": [
                "Generate a Looney Tunes classic character highlight comic strip poster.",
                "Create a Captain Tsubasa football iconic moves manga panel comic poster.",
                "Generate a The Simpsons Springfield character multi-panel comic collage."
            ]
        }},
    },
    "template-brand-vi-full-visual-pack-mockup": {
        "category": "Brand Full VI Visual Identity Pack Mockup",
        "description": "Generate a complete brand visual identity showcase — main poster, social banners, packaging cups, tote bags, labels, stickers, tickets, ribbons, mobile mockups — all in a unified design collage.",
        "title": "Nano Banana Prompt: Brand Full VI Visual Identity Pack Mockup Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a complete brand visual design showcase board for any brand category. Collage layout combines the main brand poster, social media banners, packaging (cups, bottles, bags), tote bags, labels, stickers, admission tickets, ribbon tags, and mobile mockups — all unified under the brand's character IP and color system. Ready as a pitch-deck or capability-deck hero.",
            "who": "Suitable for in-house brand teams pitching a new VI system, agencies showcasing brand-launch capabilities, indie brand owners building deck collateral, IP-licensing intermediaries demonstrating multi-surface mockups, and product designers preparing investor decks.",
            "how": [
                "Enter the brand + category + character info in {brand_category_info} (e.g. '想浮咖啡, coffee drink brand, otter cartoon IP').",
                "Main poster + social banners + packaging + tote + labels + tickets + mobile auto-compose.",
                "Character IP + color system unify the collage.",
                "Generate a complete brand VI visual identity pack mockup."
            ],
            "prompts": [
                "Generate a 想浮 Coffee brand VI pack with otter cartoon IP.",
                "Create a Temp Bakery brand VI pack with bread / pastry cartoon IP.",
                "Generate a 向野而生 outdoor camping brand VI pack with veggie-fruit cartoon IP."
            ]
        }},
    },
    "template-football-player-graffiti-poster": {
        "category": "Football Player Graffiti Style Poster",
        "description": "Generate a vertical graffiti-style football player poster — central colored illustration in club jersey, right-side B&W sketch close-ups, urban street-art typography.",
        "title": "Nano Banana Prompt: Football Player Graffiti Style Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical illustration poster of any football player. Central full-body colored illustration of the player in their official club jersey; right side stacked B&W sketch close-up panels (face, upper body, signature pose); urban street-art typography across the layout. Pose, sponsor and crest carried through faithfully.",
            "who": "Suitable for football fan-art creators, jersey-history print sellers, football-bar wall print stores, player-merch Etsy / Redbubble operators, and brand marketers producing player-feature collateral around club launches.",
            "how": [
                "Enter the player + team / jersey in {player_team_info} (e.g. 'Toni Kroos Real Madrid white home jersey').",
                "Central full-body colored illustration auto-renders.",
                "Right-side B&W sketch close-up panels + street typography auto-compose.",
                "Generate a graffiti-style football player poster."
            ],
            "prompts": [
                "Generate a Toni Kroos Real Madrid white home jersey graffiti poster.",
                "Create a Lionel Messi Inter Miami pink jersey art poster.",
                "Generate a Lionel Messi Barcelona classic striped jersey graffiti poster."
            ]
        }},
    },
    "template-vintage-football-jersey-intro-watercolor-poster": {
        "category": "Vintage Football Jersey Introduction Watercolor Poster",
        "description": "Generate a vertical watercolor poster feature for any classic football jersey — full kit illustration, crest + sponsor logo, season year typography, player association tag.",
        "title": "Nano Banana Prompt: Vintage Football Jersey Watercolor Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical illustrated jersey feature poster. Large stylized season-year title at top; central full watercolor drawing of the classic football jersey with complete crest, sponsor logo, collar and detailing; player association tag (the legend who wore it) and optional historical context panel. Soft watercolor strokes evoke nostalgia.",
            "who": "Suitable for football kit historians + content creators, vintage-jersey resellers and collectors, classic-football brand owners (Copa90, Classic Football Shirts), retro merch designers, and football-bar / pub print sellers.",
            "how": [
                "Enter the jersey + player in {jersey_info} (e.g. 'Manchester United 2008 home AIG jersey, Cristiano Ronaldo feature').",
                "Full watercolor jersey illustration auto-renders at center.",
                "Crest, sponsor, season year, player association auto-populate the layout.",
                "Generate a vintage football jersey watercolor feature poster."
            ],
            "prompts": [
                "Generate a Manchester United 2008 home AIG jersey poster featuring Cristiano Ronaldo.",
                "Create a Fiorentina 98-99 Nintendo sponsor jersey poster featuring Batistuta.",
                "Generate a Barcelona 99-00 away centenary jersey poster featuring Rivaldo."
            ]
        }},
    },
    "template-brand-ip-full-design-board": {
        "category": "Brand IP Full Design Display Board",
        "description": "Generate a vertical official IP design display board — main IP character at top, numbered modules covering design language, expression sheet, pose sheet, color system, scenario applications.",
        "title": "Nano Banana Prompt: Brand IP Full Design Display Board Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K official IP design presentation board. Top area features the main IP character paired with a prominent project title banner; below, the page splits into independent numbered modules — design language, expression sheet, pose sheet, color system, brand voice, and scenario / application mockups — for a presentation-ready showcase.",
            "who": "Suitable for in-house brand teams approving a mascot launch, agencies pitching IP redesigns, IP-licensing intermediaries presenting full character bibles, kids-product brand managers, and product designers building investor / partner decks.",
            "how": [
                "Enter the IP design info in {ip_design_info} (e.g. '江源水豚IP, Shanghai Dongtan wetland eco-guardian, traditional Chinese knot dress').",
                "Main IP character + title banner auto-render at the top.",
                "Numbered modules + scenario applications auto-compose below.",
                "Generate a vertical 8K brand IP full design display board."
            ],
            "prompts": [
                "Generate a 江源水豚 (Capybara) IP design board with Chinese guardian dress.",
                "Create a 青榄小菊 mosquito-repellent IP design board with chrysanthemum kid character.",
                "Generate a 沪澜浣熊 Shanghai raccoon eco-guardian IP design board in purple Hanfu."
            ]
        }},
    },
    "template-theme-color-palette-card": {
        "category": "Themed Scene Color Palette Card",
        "description": "Generate a vertical color reference card with a full themed background illustration and labeled hex-coded color swatches running down the left edge.",
        "title": "Nano Banana Prompt: Themed Scene Color Palette Card Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical color reference card. Beautiful full-background illustration matching the theme; left-side vertically arranged rectangular color swatch blocks, each block embeds a clear hex color code label. The result is presentation-ready for designers, color-grading reference, and themed mood-board work.",
            "who": "Suitable for graphic designers and digital illustrators, interior + brand-system designers building palette references, art-style content creators on Pinterest / Instagram, color-grading filmmakers, and design educators producing color-theory teaching aids.",
            "how": [
                "Enter the theme + style in {color_theme_info} (e.g. 'Deep-sea whale-shark blue-purple watercolor palette card').",
                "Full themed background illustration auto-renders.",
                "Color swatch blocks + hex code labels populate the left edge.",
                "Generate a vertical themed color palette card."
            ],
            "prompts": [
                "Generate a deep-sea whale-shark blue-purple watercolor palette card.",
                "Create a tropical-coral Studio Ghibli palette card.",
                "Generate a pink-purple gradient betta-fish realistic palette card."
            ]
        }},
    },
}

ZH = {
    "template-character-multi-panel-comic-strip-poster": {
        "category": "经典动漫多格漫画海报",
        "description": "生成竖版多格漫画海报 —— 3x3(或自定义)经典角色网格,顶部大标题旗帜,每格定格一个标志性瞬间。",
        "title": "Nano Banana 提示词:经典动漫多格漫画海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意动漫/卡通主题生成竖版多格漫画海报。固定网格布局(默认 3 行 x 3 格)+ 顶部大胆风格化标题旗帜;每格定格一个经典角色的标志性瞬间,整组风格统一,形成收藏感强的整体构图。",
            "who": "适合动漫/卡通同人创作者、经典动画怀旧印刷品售卖者、儿童房墙艺设计师、Etsy/Redbubble 同好周边运营者,以及制作视觉叙事教学的教育者。",
            "how": [
                "在 {anime_cartoon_theme_info} 输入动漫/卡通主题(例如:'Looney Tunes 经典角色精选漫画')。",
                "标题旗帜自动呈现于顶部。",
                "9 格自动合成各角色的标志性瞬间。",
                "生成竖版多格漫画海报。"
            ],
            "prompts": [
                "生成 Looney Tunes 经典角色精选漫画海报。",
                "生成《足球小将》经典招式漫画格海报。",
                "生成《辛普森一家》斯普林菲尔德角色多格漫画拼贴。"
            ]
        }},
    },
    "template-brand-vi-full-visual-pack-mockup": {
        "category": "品牌全套 VI 视觉识别包样机",
        "description": "为任意品牌生成完整视觉识别展示 —— 主海报、社交横幅、包装杯、托特包、标签、贴纸、入场券、丝带吊牌、移动端样机 —— 统一于角色 IP + 配色。",
        "title": "Nano Banana 提示词:品牌全套 VI 视觉识别包生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意品牌类别生成完整视觉设计展示板。拼贴布局合并主海报、社交媒体横幅、包装(杯、瓶、袋)、托特包、标签、贴纸、入场券、丝带吊牌、移动端样机 —— 全部统一于品牌角色 IP 与配色系统下。直接可用作品牌提案或能力展示主图。",
            "who": "适合内部品牌团队提案新 VI 系统、代理机构展示品牌上线能力、独立品牌主构建展示物料、IP 授权方呈现多面样机,以及为投资人/合作方准备提案的产品设计师。",
            "how": [
                "在 {brand_category_info} 输入品牌 + 类别 + 角色信息(例如:'想浮咖啡,咖啡饮品品牌,水獭卡通 IP')。",
                "主海报 + 社交横幅 + 包装 + 托特 + 标签 + 入场券 + 移动端自动合成。",
                "角色 IP + 配色系统将整组拼贴视觉串联。",
                "生成品牌全套 VI 视觉识别包样机。"
            ],
            "prompts": [
                "生成想浮咖啡品牌 VI 全包,水獭卡通 IP 主形象。",
                "生成 Temp 烘焙店品牌 VI 全包,面点拟人卡通 IP。",
                "生成向野而生户外露营市集品牌 VI 全包,蔬果拟人 IP。"
            ]
        }},
    },
    "template-football-player-graffiti-poster": {
        "category": "足球球星涂鸦风海报",
        "description": "生成竖版涂鸦风格球星海报 —— 中心彩色全身插画 + 右侧黑白速写特写、街头艺术字体。",
        "title": "Nano Banana 提示词:足球球星涂鸦风海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意足球球星生成竖版插画海报。中央为球员身着官方俱乐部球衣的彩色全身插画;右侧叠放多幅黑白速写特写面板(面部、上身、招牌姿态);整体配街头艺术字体。姿态、赞助、队徽完整呈现。",
            "who": "适合足球同人创作者、球衣史印刷品售卖者、足球酒吧墙印店、球星周边 Etsy/Redbubble 运营者,以及在俱乐部上线时制作球星专题物料的品牌营销方。",
            "how": [
                "在 {player_team_info} 输入球员 + 球队/球衣(例如:'托尼·克罗斯皇马白色主场球衣')。",
                "中心彩色全身插画自动呈现。",
                "右侧黑白速写特写面板 + 街头字体自动合成。",
                "生成涂鸦风格足球球星海报。"
            ],
            "prompts": [
                "生成托尼·克罗斯皇马白色主场球衣涂鸦海报。",
                "生成梅西迈阿密国际粉色球衣艺术海报。",
                "生成梅西巴塞罗那经典条纹球衣涂鸦海报。"
            ]
        }},
    },
    "template-vintage-football-jersey-intro-watercolor-poster": {
        "category": "复古足球球衣水彩介绍海报",
        "description": "为任意经典足球球衣生成竖版水彩特写海报 —— 完整球衣插画、队徽 + 赞助商标、赛季年份字体、传奇球员关联标签。",
        "title": "Nano Banana 提示词:复古足球球衣水彩介绍海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版球衣专题插画海报。顶部大胆风格化呈现赛季年份大标题;中心是经典足球球衣的完整水彩绘制,包含队徽、赞助商标、衣领与细节;辅以传奇球员关联标签(穿过这件球衣的传奇)与可选的历史背景面板。柔和水彩笔触唤起怀旧感。",
            "who": "适合足球球衣史研究者与内容创作者、复古球衣转售者与收藏家、复古足球品牌主(Copa90、Classic Football Shirts)、复古周边设计师,以及足球酒吧/酒馆印刷品售卖者。",
            "how": [
                "在 {jersey_info} 输入球衣 + 球员(例如:'曼联 2008 年主场 AIG 赞助球衣,克里斯蒂亚诺·罗纳尔多专题')。",
                "完整水彩球衣插画自动呈现于中心。",
                "队徽、赞助、赛季年份、球员关联自动填充。",
                "生成复古足球球衣水彩特写海报。"
            ],
            "prompts": [
                "生成曼联 2008 年主场 AIG 球衣海报,主打 C 罗。",
                "生成佛罗伦萨 98-99 任天堂赞助球衣海报,主打巴蒂斯图塔。",
                "生成巴塞罗那 99-00 客场百年纪念球衣海报,主打里瓦尔多。"
            ]
        }},
    },
    "template-brand-ip-full-design-board": {
        "category": "品牌 IP 全套设计展板",
        "description": "生成竖版官方 IP 设计展板 —— 顶部主 IP 角色 + 编号模块覆盖设计语言、表情、姿态、配色、场景应用。",
        "title": "Nano Banana 提示词:品牌 IP 全套设计展板生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成 8K 竖版官方 IP 设计提案展板。顶部呈现主 IP 角色 + 显眼项目标题旗帜;下方分独立编号模块 —— 设计语言、表情表、姿态表、配色系统、品牌语调、场景/应用样机 —— 形成提案级展示。",
            "who": "适合上线吉祥物的内部品牌团队、提案 IP 重设的代理机构、呈现完整角色圣经的 IP 授权方、儿童产品品牌经理,以及构建投资人/合作方提案的产品设计师。",
            "how": [
                "在 {ip_design_info} 输入 IP 设计信息(例如:'江源水豚 IP,上海东滩湿地国风环保守护者,中式盘扣服饰')。",
                "主 IP 角色 + 标题旗帜自动呈现于顶部。",
                "编号模块 + 场景应用自动合成于下方。",
                "生成 8K 竖版品牌 IP 全套设计展板。"
            ],
            "prompts": [
                "生成江源水豚 IP 设计展板,中式守护者服饰。",
                "生成青榄小菊驱蚊拟人 IP 设计展板,菊花孩童形象。",
                "生成沪澜浣熊上海生态守护 IP 设计展板,紫色汉服。"
            ]
        }},
    },
    "template-theme-color-palette-card": {
        "category": "主题场景配色色卡",
        "description": "生成竖版配色参考卡 —— 完整主题背景插画 + 左侧带十六进制色值的色块排列。",
        "title": "Nano Banana 提示词:主题场景配色色卡生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版配色参考卡。完整主题背景插画;左侧竖向排列的矩形色块,每块嵌入清晰的十六进制色值标签。成品可直接用作设计师配色参考、调色参考与主题情绪板。",
            "who": "适合平面设计师与数字插画师、构建色板参考的室内 + 品牌系统设计师、Pinterest/Instagram 艺术风格内容创作者、调色师,以及制作色彩理论教学的设计教育者。",
            "how": [
                "在 {color_theme_info} 输入主题 + 风格(例如:'深海鲸鲨蓝紫水彩配色色卡')。",
                "完整主题背景插画自动呈现。",
                "色块 + 十六进制色值标签填充左侧。",
                "生成竖版主题配色色卡。"
            ],
            "prompts": [
                "生成深海鲸鲨蓝紫水彩配色色卡。",
                "生成热带珊瑚海底吉卜力动画风配色色卡。",
                "生成粉紫渐变斗鱼写实质感配色色卡。"
            ]
        }},
    },
}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}

    for locale, content in by_locale.items():
        missing = [tid for tid in template_ids if tid not in content]
        if missing:
            raise SystemExit(f"FAIL: locale {locale} missing {missing}")

    total = 0
    for locale in LOCALES:
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
            doc[tid] = by_locale[locale][tid]
            added += 1
            total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added} template entries")

    print(f"\nDone. Added {total} template-locale entries ({len(template_ids)} templates x {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
