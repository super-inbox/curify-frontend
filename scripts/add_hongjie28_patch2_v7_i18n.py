"""Append i18n entries for 4 new IP merchandise templates from hongjie28-patch-2 (2026-06-05 push).

Templates added:
  - template-ip-creative-cultural-goods-mockup-set  (full stationery merchandise flatlay)
  - template-ip-gift-box-stationery-set-mockup      (gift-box packaged set)
  - template-ip-character-sprite-emoji-sheet        (emotion/turnaround sprite sheet)
  - template-ip-emoji-sticker-sheet-poster          (sticker-sheet poster)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v7 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid], NOT doc.setdefault('nano', {})[tid].
  - EN is the default fallback for all non-ZH locales; i18n_autotranslate.cjs
    can post-translate later.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-ip-creative-cultural-goods-mockup-set",
    "template-ip-gift-box-stationery-set-mockup",
    "template-ip-character-sprite-emoji-sheet",
    "template-ip-emoji-sticker-sheet-poster",
]

EN = {
    "template-ip-creative-cultural-goods-mockup-set": {
        "category": "IP Cultural & Stationery Merchandise Mockup",
        "description": "Generate a full IP-themed cultural merchandise flatlay — notebook, tote, fan, mug, stickers, keychain, gift box — all printed with your custom character art and brand color palette.",
        "title": "Nano Banana Prompt: IP Cultural & Stationery Merchandise Mockup Set Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a top-down 8K commercial flatlay of a complete IP-derivative stationery merchandise set on a warm beige base background. The full lineup — spiral notebook, hardcover journal, canvas tote, folding fan, eye mask, lanyard, acrylic keychain, die-cut stickers, washi tape, ceramic mug, tumbler, throw pillow, ballpoint pen, phone case, gift box — is uniformly printed with your IP character illustration and matching brand title text, in the IP's signature color palette.",
            "who": "Suitable for IP licensors and creators pitching merchandise lines, museum / cultural-creative gift shop teams, indie illustrators productizing characters, brand designers building lookbooks, and IP collaboration proposals.",
            "how": [
                "Enter the IP character name + brand slogan + art style direction in {ip_info} (e.g., 熊猫茶师 古风国画Q版熊猫穿汉服品茶 豆绿色主色调).",
                "All merchandise items auto-render with the chosen character art and color palette.",
                "Style is auto-tuned per IP — gongbi / cute cartoon / new-Chinese-style / streetwear illustration.",
                "Generate a top-down 8K cultural merchandise flatlay mockup poster."
            ],
            "prompts": [
                "Generate an IP merchandise flatlay for 熊猫茶师 panda tea master in gongbi style with dou-green palette.",
                "Create an IP cultural goods set for 墨狐书生 ink fox scholar in burgundy ink-wash style.",
                "Generate a 祥龙纳福 blessing dragon Q-version new-Chinese-style merchandise flatlay in jade green."
            ]
        }},
    },
    "template-ip-gift-box-stationery-set-mockup": {
        "category": "IP Gift Box Stationery Packaging Mockup",
        "description": "Generate a top-down mockup of an open IP-themed gift packaging box — branded lid, fitted sponge tray with silicone keychain, stickers, notepad, tumbler, capped pen, spiral notebook, all printed with your custom character.",
        "title": "Nano Banana Prompt: IP Gift Box Stationery Set Mockup Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a top-down 8K mockup of an open rectangular IP-themed gift packaging box. The lid's inner side carries the IP brand headline; a white sponge inner tray with pre-cut slots holds matching merchandise: silicone doll keychain, sticker sheet, memo notepad, portable tumbler, character-capped ball pen, and spiral notebook — all printed with your custom IP character and brand color palette.",
            "who": "Suitable for IP merchandise teams launching boxed sets, K-pop / anime / character brand collabs, museum gift shops curating gift bundles, corporate-gift designers, and crowdfunding campaigns for character merchandise.",
            "how": [
                "Enter the IP character name + core color + character style in {ip_info} (e.g., 釜山布吉鸭 Busan Boogi Duck mustard yellow chubby duck).",
                "Box lid, sponge tray slots, and all items auto-fill with your character art.",
                "Brand palette is auto-derived from your IP's core color.",
                "Generate a top-down 8K open gift box mockup poster."
            ],
            "prompts": [
                "Generate a Busan Boogi Duck mustard-yellow IP gift box mockup with chubby duck character.",
                "Create an IP gift box mockup for a streetwear shark mascot in navy + neon-orange palette.",
                "Generate a new-Chinese-style 祥龙 dragon gift box mockup in jade green + gold palette."
            ]
        }},
    },
    "template-ip-character-sprite-emoji-sheet": {
        "category": "IP Character Sprite & Emoji Sheet",
        "description": "Generate a vertical IP character design sheet — multi-pose emotion sprites on top (cheering, grumpy, typing, confused, sleeping), full turnaround views on bottom — for any IP character on a clean white background.",
        "title": "Nano Banana Prompt: IP Character Sprite & Emoji Sheet Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K character design sheet for any IP character on a clean white background. The upper multi-grid panel shows independent cartoon frames of the character in various emotion + action poses — cheering with pom-poms, annoyed grumpy face, typing on laptop, confused with question mark, sleeping, dancing. The lower turnaround panel shows front / 3/4 / side / back views for asset-ready character design.",
            "who": "Suitable for IP designers building character bibles, indie animators producing reaction sprites, sticker pack creators, brand mascot developers, and game/app teams needing character turnaround references.",
            "how": [
                "Enter the IP name + character feature + main color in {ip_info} (e.g., 毕业羊驼 graduation alpaca cream-white wool graduation cap).",
                "Multi-pose emotion sprites auto-render in the upper panel.",
                "Full turnaround views auto-render in the lower panel.",
                "Generate a vertical 8K character design sheet on white background."
            ],
            "prompts": [
                "Generate a graduation alpaca character sprite sheet with cap and gown in cream-white wool.",
                "Create a streetwear shark mascot sprite + turnaround sheet in navy + neon-orange.",
                "Generate a magical girl cat character sprite sheet in pastel pink + lavender."
            ]
        }},
    },
    "template-ip-emoji-sticker-sheet-poster": {
        "category": "IP Emoji Sticker Sheet Poster",
        "description": "Generate a vertical IP emoticon sticker collection poster — large hero illustration with speech bubble on top, grid of small emoji panels below, on a soft warm base with faint character watermark.",
        "title": "Nano Banana Prompt: IP Emoji Sticker Sheet Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K IP cartoon sticker collection poster. The top section features a large main character illustration with speech bubble and the IP name headline. Below, a neat grid layout holds multiple independent small emoji panels — each a single self-contained emotion or action sticker. Background is a soft solid warm base with a faint repeated character watermark.",
            "who": "Suitable for IP creators launching sticker packs (LINE / WhatsApp / Telegram), printable sticker shop sellers, fandom merchandise designers, indie illustrators building reaction sets, and brand mascot rollouts.",
            "how": [
                "Enter the IP name + character feature + main color + drawing style in {ip_info} (e.g., 越南橘猫 Vietnamese orange cat in flat illustration style).",
                "Hero illustration + speech bubble + IP name auto-render at the top.",
                "Grid of small emoji panels auto-fills below with varied poses and reactions.",
                "Generate a vertical 8K IP emoji sticker sheet poster."
            ],
            "prompts": [
                "Generate a Vietnamese orange cat IP emoji sticker sheet poster in flat illustration style.",
                "Create an Empress Cow Cat IP sticker sheet poster with regal palace styling in red + gold.",
                "Generate a streetwear shark mascot emoji sticker sheet in navy + neon-orange."
            ]
        }},
    },
}

ZH = {
    "template-ip-creative-cultural-goods-mockup-set": {
        "category": "IP 文创周边整套平铺样机",
        "description": "为任意 IP 角色生成完整文创周边平铺样机 —— 笔记本、托特包、折扇、马克杯、贴纸、钥匙扣、礼盒等，统一印有你的角色插画与品牌配色。",
        "title": "Nano Banana 提示词：IP 文创周边整套平铺样机生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意 IP 角色生成 8K 顶视图商业平铺样机：暖米色背景上整齐摆放完整文创周边整套 —— 螺旋笔记本、精装日记本、帆布托特包、手持折扇、眼罩、挂绳工牌、亚克力钥匙扣、模切贴纸、和纸胶带、陶瓷马克杯、随行杯、方形抱枕、圆珠笔、手机壳、礼盒包装 —— 全部统一印有 IP 角色插画与品牌标题文字,色彩取自 IP 主色调。",
            "who": "适合 IP 授权方与创作者向品牌方提案周边线、博物馆/文创礼品店团队、独立插画师 IP 产品化、品牌设计师做 lookbook,以及 IP 联名提案。",
            "how": [
                "在 {ip_info} 输入 IP 角色名 + 品牌口号 + 美术风格方向（例如：熊猫茶师 古风国画Q版熊猫穿汉服品茶 豆绿色主色调）。",
                "所有周边商品自动套用所选角色插画与配色。",
                "美术风格按 IP 自动适配 —— 工笔/Q 版卡通/新中式/潮玩插画。",
                "生成 8K 顶视图文创周边整套平铺样机海报。"
            ],
            "prompts": [
                "生成 熊猫茶师 古风国画Q版周边平铺,豆绿色配色。",
                "生成 墨狐书生 国风水墨周边整套,酒红棕配色。",
                "生成 祥龙纳福 新中式Q版周边平铺,青绿配色。"
            ]
        }},
    },
    "template-ip-gift-box-stationery-set-mockup": {
        "category": "IP 礼盒文创整套包装样机",
        "description": "为任意 IP 角色生成开盒礼盒包装顶视样机 —— 印有品牌标题的盒盖内侧,海绵内托整齐装载硅胶钥匙扣、贴纸、便签、随行杯、笔与笔记本,统一印有你的角色。",
        "title": "Nano Banana 提示词：IP 礼盒文创整套包装样机生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意 IP 角色生成 8K 顶视图开盒长方形 IP 主题礼盒样机。盒盖内侧印有 IP 品牌标题;白色海绵内托预切固定槽位整齐摆放配套商品：硅胶玩偶钥匙扣、装饰贴纸、便签本、便携随行杯、角色封顶圆珠笔、螺旋装订笔记本 —— 全部印有你的 IP 角色与品牌配色。",
            "who": "适合上架礼盒装的 IP 周边团队、K-pop/动漫/角色品牌联名、博物馆礼品店礼盒策展、企业礼品设计师,以及众筹角色周边项目。",
            "how": [
                "在 {ip_info} 输入 IP 角色名 + 主色 + 角色风格描述（例如：釜山布吉鸭 Busan Boogi Duck 芥末黄圆润鸭子）。",
                "盒盖、海绵托槽位与所有商品自动填充你的角色。",
                "品牌配色按 IP 主色自动派生。",
                "生成 8K 顶视图开盒礼盒样机海报。"
            ],
            "prompts": [
                "生成 釜山布吉鸭 芥末黄圆润鸭子 IP 礼盒样机。",
                "生成 潮牌鲨鱼吉祥物 海军蓝+霓虹橘 IP 礼盒样机。",
                "生成 新中式 祥龙 IP 礼盒样机,青绿+金箔配色。"
            ]
        }},
    },
    "template-ip-character-sprite-emoji-sheet": {
        "category": "IP 角色表情与三视图设定页",
        "description": "为任意 IP 角色生成竖版角色设定页 —— 上部多格情绪表情立绘（欢呼/生气/打字/疑问/睡觉）,下部完整三视图,白底清爽呈现。",
        "title": "Nano Banana 提示词：IP 角色表情与三视图设定页生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意 IP 角色生成 8K 竖版白底角色设定页。上部多格面板呈现角色在多种情绪与动作姿势的独立卡通画格：举彩球欢呼、气鼓鼓生气脸、敲笔记本电脑、举问号疑问、睡觉、跳舞。下部三视图面板呈现正面/四分之三/侧面/背面视角,可直接作为角色设计素材使用。",
            "who": "适合搭建角色 bible 的 IP 设计师、做反应表情包的独立动画师、贴纸包创作者、品牌吉祥物开发者,以及需要角色三视图参考的游戏/应用团队。",
            "how": [
                "在 {ip_info} 输入 IP 名 + 角色特征 + 主色（例如：毕业羊驼 graduation alpaca 奶白色羊毛 学士帽）。",
                "多姿势情绪表情自动生成至上部面板。",
                "完整三视图自动生成至下部面板。",
                "生成 8K 竖版白底角色设定页。"
            ],
            "prompts": [
                "生成 毕业羊驼 角色表情+三视图设定页,奶白色羊毛 学士帽学位袍。",
                "生成 潮牌鲨鱼吉祥物 表情+三视图,海军蓝+霓虹橘。",
                "生成 魔法少女猫 角色设定页,粉彩+薰衣草紫。"
            ]
        }},
    },
    "template-ip-emoji-sticker-sheet-poster": {
        "category": "IP 表情贴纸合集海报",
        "description": "为任意 IP 角色生成竖版表情贴纸合集海报 —— 顶部大主角插画配对话框,下方网格小表情面板,暖色底+淡角色水印。",
        "title": "Nano Banana 提示词：IP 表情贴纸合集海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意 IP 角色生成 8K 竖版卡通表情贴纸合集海报。顶部呈现大主角插画 + 对话气泡 + IP 名标题。下方网格布局排列多个独立小表情面板 —— 每格一个自包含情绪或动作贴纸。背景采用暖色实色底 + 淡淡重复角色水印图案。",
            "who": "适合上架贴纸包的 IP 创作者（LINE/WhatsApp/Telegram）、可印刷贴纸店家、粉丝周边设计师、做反应表情合集的独立插画师,以及品牌吉祥物上线。",
            "how": [
                "在 {ip_info} 输入 IP 名 + 角色特征 + 主色 + 画风（例如：越南橘猫 Vietnamese orange cat 扁平插画风格）。",
                "顶部大主角插画 + 对话框 + IP 名自动生成。",
                "下方网格小表情面板自动填充多种姿势与反应。",
                "生成 8K 竖版 IP 表情贴纸合集海报。"
            ],
            "prompts": [
                "生成 越南橘猫 IP 表情贴纸合集海报,扁平插画风格。",
                "生成 皇后牛奶猫 IP 贴纸海报,宫廷红+金配色。",
                "生成 潮牌鲨鱼吉祥物 IP 表情贴纸合集,海军蓝+霓虹橘。"
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

    print(f"\nDone. Added {total} template-locale entries ({len(template_ids)} templates × {len(LOCALES)} locales).")


if __name__ == "__main__":
    main()
