"""Add 3 new templates (Bronze-Worker case, Option C, 2026-06-24):

  - template-original-character-daily-life-grid
  - template-original-character-sticker-pack
  - template-modernized-artifact-poster

Each template gets en + zh base_prompt + a single freeform `concept` param
(deliberately broad so the template stays usable across viral compound
queries: bronze worker, terracotta gym-goer, jade hipster, etc.).

The script appends to public/data/nano_templates.json AND writes the
i18n payload to messages/{en,zh}/nano.json (auto-translated to 8 other
locales by a separate i18n_autotranslate run).

Topics on each template draw from the 5 new T3 slugs added in the same
session (original-ip, modernized-artifact, daily-life-grid,
narrative-comic, cultural-fusion) plus existing slugs (character,
posters, design, wall-art, etc.).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"
EN_NANO = ROOT / "messages" / "en" / "nano.json"
ZH_NANO = ROOT / "messages" / "zh" / "nano.json"

TEMPLATES = [
    # ──────────────────────────────────────────────────────────────────
    {
        "id": "template-original-character-daily-life-grid",
        "locales": {
            "en": {
                "base_prompt": "(Original Character Daily Life Grid Illustrator) Generate a vertical 8K 2x3 (six-panel) daily-life infographic of an original anthropomorphized character based on the user-specified concept '{concept}'. Each panel shows the SAME character in a different everyday scene (commute / morning coffee / office meeting / lunch break / evening grocery / weekend rest). The character design MUST stay perfectly consistent across all six panels — same proportions, color palette, signature accessory, facial features — only the setting + pose + expression change.\n\nLayout: top header band with the character's name and a short one-line tagline (e.g. \"Bronze Worker — surviving the 9-to-5\"); 2x3 grid below, each panel ~480x540px with rounded corners, light cream background, soft drop shadow; each panel has a tiny caption text underneath in clean sans-serif noting the scene (\"Monday Standup\", \"3pm Energy Dip\", etc.); footer band with three small icon stats (energy / mood / coffee level).\n\nStyle: cute editorial flat illustration, warm pastel palette, hand-drawn linework, subtle texture, social-media-friendly aesthetic, designed to read as a cohesive character-introduction sheet. Subject: original character '{concept}' across six everyday office-worker scenarios.",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "Character Concept",
                     "placeholder": [
                         "Bronze worker mythical beast",
                         "Terracotta warrior gym-goer",
                         "Jade hipster barista",
                         "Ming vase office worker"
                     ]}
                ],
            },
            "zh": {
                "base_prompt": "（原创角色日常生活六宫格插画师）根据用户指定的概念【{concept}】，生成一张8K竖版2x3（六宫格）原创拟人化角色日常生活信息图。每一格展示同一角色在不同的日常场景中（通勤 / 早晨咖啡 / 办公室会议 / 午餐休息 / 傍晚购物 / 周末休息）。六格中的角色设定必须完全一致——相同比例、配色、标志性配饰、面部特征——仅场景、姿势和表情变化。\n\n版式：顶部横幅写角色名称和一行简短标语（例如\"青铜打工小兽——努力撑过朝九晚五\"）；下方为2x3网格，每格约480x540像素，圆角，浅米色背景，柔和阴影；每格下方用干净无衬线字体写小标题（例如\"周一站会\"\"下午三点的疲惫\"）；底部横幅放三个小图标统计（能量/心情/咖啡量）。\n\n风格：可爱编辑风扁平插画，温暖柔和色调，手绘线条，微妙纹理，社媒友好美学，呈现连贯的角色介绍图。主题：原创角色【{concept}】在六个日常打工场景中。",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "角色概念",
                     "placeholder": [
                         "青铜打工小兽",
                         "兵马俑健身爱好者",
                         "翡翠潮流咖啡师",
                         "明代花瓶上班族"
                     ]}
                ],
            },
        },
        "topics": ["character", "posters", "design", "original-ip", "daily-life-grid",
                   "anthropomorphic", "wall-art", "infographic"],
        "base_rank_score": 90,
        "rank_score": 90,
        "creation_date": "2026-06-24",
        "allow_generation": True,
    },
    # ──────────────────────────────────────────────────────────────────
    {
        "id": "template-original-character-sticker-pack",
        "locales": {
            "en": {
                "base_prompt": "(Original Character Sticker Pack Designer) Generate a vertical 8K sticker-pack sheet for an original anthropomorphized character based on the user-specified concept '{concept}'. Layout: top band with the character's name in playful display type + tiny tagline; 3x3 grid of nine die-cut sticker-style poses, each in a different emotional state (happy / tired / shocked / proud / confused / excited / lazy / angry / loving). Each sticker has a thin white die-cut border with subtle drop shadow, transparent-style background per cell.\n\nThe character design MUST stay perfectly consistent across all nine stickers — same proportions, color palette, signature accessory, defining silhouette — only facial expression and small props change. Each sticker carries a tiny hand-lettered caption tag (\"mood: monday\", \"yes please\", \"ugh.\" etc.) integrated into the design.\n\nStyle: cute kawaii flat illustration, bold outlines suitable for sticker cutting, vibrant saturated palette, social-media + messaging-app friendly. Subject: original character '{concept}' as a 9-pose emotion sticker pack.",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "Character Concept",
                     "placeholder": [
                         "Bronze worker mythical beast",
                         "Terracotta warrior gym-goer",
                         "Anthropomorphized matcha latte",
                         "Office plant succulent buddy"
                     ]}
                ],
            },
            "zh": {
                "base_prompt": "（原创角色贴纸包设计师）根据用户指定的概念【{concept}】，生成一张8K竖版原创拟人化角色贴纸包。版式：顶部横幅放角色名（俏皮展示字体）+ 小标语；3x3九宫格九个模切贴纸式姿势，每个不同情绪（开心/疲惫/震惊/自豪/困惑/兴奋/慵懒/生气/爱意）。每张贴纸细白模切边框+柔和阴影，背景透明感。\n\n九张贴纸的角色设定必须完全一致——相同比例、配色、标志性配饰、识别度高的剪影——仅表情和小道具变化。每张贴纸带一个手写小标签（\"周一心情\"\"好的好的\"\"哎\"等）融入设计。\n\n风格：可爱卡哇伊扁平插画，粗实线适合贴纸切割，饱和鲜艳配色，适配社媒+聊天软件。主题：原创角色【{concept}】九姿势情绪贴纸包。",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "角色概念",
                     "placeholder": [
                         "青铜打工小兽",
                         "兵马俑健身爱好者",
                         "拟人化抹茶拿铁",
                         "办公室多肉小伙伴"
                     ]}
                ],
            },
        },
        "topics": ["character", "design", "original-ip", "stickers", "anthropomorphic",
                   "kawaii", "posters", "social-media-posts"],
        "base_rank_score": 90,
        "rank_score": 90,
        "creation_date": "2026-06-24",
        "allow_generation": True,
    },
    # ──────────────────────────────────────────────────────────────────
    {
        "id": "template-modernized-artifact-poster",
        "locales": {
            "en": {
                "base_prompt": "(Modernized Artifact Poster Illustrator) Generate a vertical 8K poster taking a historical cultural artifact and re-imagining it in a modern everyday context, based on the user-specified concept '{concept}'. The poster shows the artifact ANTHROPOMORPHIZED — given simple cartoon eyes, tiny limbs, modern accessories — placed in a contemporary setting (coffee shop / subway / gym / office / weekend brunch) while retaining its historical aesthetic surface (bronze patina / clay texture / lacquer finish / jade translucency, whichever matches the artifact's original material).\n\nLayout: artifact-as-character occupies the center, taking ~60% of the frame; modern setting illustrated around it in a slightly faded background style; top banner with display-type title pairing the artifact's name + its modern role (e.g. \"BRONZE WORKER — corporate ascendancy\"); bottom-left small label panel with three lines: artifact name + dynasty/era / original function / modern reincarnation; bottom-right tiny museum-card-style date stamp.\n\nStyle: editorial illustrated poster, warm muted palette, hand-drawn texture, blends historical artifact gravitas with playful modern whimsy. Subject: historical artifact '{concept}' anthropomorphized into a modern everyday scene.",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "Artifact + Modern Role",
                     "placeholder": [
                         "Bronze ding cauldron as corporate executive",
                         "Terracotta warrior as gym personal trainer",
                         "Tang horse figurine as ride-share driver",
                         "Ming vase as coffee shop barista"
                     ]}
                ],
            },
            "zh": {
                "base_prompt": "（现代化文物海报插画师）根据用户指定的概念【{concept}】，生成一张8K竖版海报，将历史文物重新置于现代日常情境中。海报中文物被拟人化——加上简单的卡通眼睛、小四肢、现代配饰——置于当代场景（咖啡店/地铁/健身房/办公室/周末早午餐）中，同时保留其历史美学表面（青铜锈/陶土肌理/漆器/玉石半透明，匹配文物的原始材质）。\n\n版式：文物拟人化角色占中心约60%画面；周围用稍微淡化的背景风格画出现代场景；顶部横幅放文物名称+现代角色标题（例如\"青铜打工小兽——职场进阶记\"）；左下角小标签面板写三行：文物名+朝代/原始用途/现代化身；右下角博物馆卡片式小日期戳。\n\n风格：编辑风插画海报，温暖柔和配色，手绘肌理，将文物历史厚重感与现代日常俏皮感融合。主题：历史文物【{concept}】拟人化进入现代日常场景。",
                "parameters": [
                    {"name": "concept", "type": "text", "label": "文物+现代角色",
                     "placeholder": [
                         "司母戊鼎做企业高管",
                         "兵马俑做健身私教",
                         "唐三彩马俑做网约车司机",
                         "明代花瓶做咖啡师"
                     ]}
                ],
            },
        },
        "topics": ["culture", "posters", "design", "modernized-artifact", "cultural-fusion",
                   "anthropomorphic", "original-ip", "wall-art", "infographic"],
        "base_rank_score": 90,
        "rank_score": 90,
        "creation_date": "2026-06-24",
        "allow_generation": True,
    },
]

# i18n payload (nano.json — category/description/title/content)
EN_I18N = {
    "template-original-character-daily-life-grid": {
        "category": "Original Character Daily Life Grid",
        "description": "Generate a 2x3 daily-life infographic of an original anthropomorphized character — six consistent panels showing the SAME character across everyday scenes.",
        "title": "Nano Banana Prompt: Original Character Daily Life Grid Generator | Curify AI",
        "content": {"sections": {
            "what": "Vertical 8K 2x3 six-panel daily-life infographic. The SAME character is shown across six consistent everyday scenes (commute, coffee, meeting, lunch, grocery, weekend) with identical proportions / palette / signature accessory — only pose, setting, and expression change. Editorial flat-illustration aesthetic, warm pastel palette, social-media-ready.",
            "who": "Suitable for original-character creators, anthropomorphized-concept illustrators (bronze worker, terracotta gym-goer, etc.), Xiaohongshu / Instagram lifestyle content makers, brand mascot designers building a character bible.",
            "how": [
                "Enter the character concept (e.g. 'Bronze worker mythical beast' or 'Terracotta warrior gym-goer').",
                "Six daily-life panels + character-consistency check auto-compose.",
                "Generate a vertical 8K 2x3 daily-life grid."
            ],
            "prompts": [
                "Generate a bronze worker mythical beast daily-life grid.",
                "Create a terracotta warrior gym-goer 6-panel sheet.",
                "Generate a jade hipster barista daily-life infographic."
            ]
        }},
    },
    "template-original-character-sticker-pack": {
        "category": "Original Character Sticker Pack",
        "description": "Generate a 3x3 nine-pose emotion sticker pack of an original anthropomorphized character — identical character across nine different expressions.",
        "title": "Nano Banana Prompt: Original Character Sticker Pack Generator | Curify AI",
        "content": {"sections": {
            "what": "Vertical 8K 3x3 sticker-pack sheet. Nine die-cut sticker-style poses of one original anthropomorphized character, each in a different emotional state (happy / tired / shocked / proud / confused / excited / lazy / angry / loving). Consistent character design + tiny hand-lettered caption tags. Kawaii flat-illustration aesthetic, bold outlines for sticker cutting.",
            "who": "Suitable for original-character creators, mascot designers, sticker-pack sellers (Etsy, Line / WeChat), content creators building a character emoji set, IP-merch designers.",
            "how": [
                "Enter the character concept (e.g. 'Bronze worker mythical beast').",
                "Nine emotion poses + caption tags + die-cut layout auto-compose.",
                "Generate a vertical 8K nine-pose sticker pack."
            ],
            "prompts": [
                "Generate a bronze worker mythical beast 9-pose sticker pack.",
                "Create an anthropomorphized matcha latte sticker sheet.",
                "Generate an office plant succulent buddy emotion stickers."
            ]
        }},
    },
    "template-modernized-artifact-poster": {
        "category": "Modernized Artifact Poster",
        "description": "Generate a vertical poster taking a historical cultural artifact and re-imagining it anthropomorphized in a modern everyday role.",
        "title": "Nano Banana Prompt: Modernized Artifact Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "Vertical 8K poster re-imagining a historical artifact (bronze cauldron, terracotta warrior, Tang horse figurine, Ming vase, etc.) ANTHROPOMORPHIZED into a contemporary everyday role (corporate executive, gym trainer, ride-share driver, barista). Preserves the artifact's historical material aesthetic — bronze patina, clay texture, lacquer, jade — while placing it in a modern setting. Editorial illustrated poster, museum-card-style metadata footer.",
            "who": "Suitable for cultural museums + heritage shops modernizing IP, art-fusion content creators, original-IP designers, brand campaigns blending cultural heritage with everyday relatability.",
            "how": [
                "Enter the artifact + modern role (e.g. 'Bronze ding cauldron as corporate executive').",
                "Anthropomorphized artifact + modern setting + dynasty metadata footer auto-compose.",
                "Generate a vertical 8K modernized-artifact poster."
            ],
            "prompts": [
                "Generate a bronze ding cauldron as corporate executive poster.",
                "Create a terracotta warrior as gym trainer modernized poster.",
                "Generate a Tang horse figurine as ride-share driver poster."
            ]
        }},
    },
}
ZH_I18N = {tid: EN_I18N[tid] for tid in EN_I18N}  # zh content placeholder = en (translator handles per-locale later)


def main():
    # 1. Append templates to nano_templates.json
    tmpls = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    existing_ids = {t["id"] for t in tmpls}
    added = 0
    for t in TEMPLATES:
        if t["id"] in existing_ids:
            print(f"  (skip exists) {t['id']}")
            continue
        tmpls.append(t)
        added += 1
        print(f"  + {t['id']}")
    TPL_PATH.write_text(json.dumps(tmpls, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"  templates: +{added} (total {len(tmpls)})\n")

    # 2. Append i18n payload to en + zh nano.json
    for path, payload in ((EN_NANO, EN_I18N), (ZH_NANO, ZH_I18N)):
        doc = json.loads(path.read_text(encoding="utf-8"))
        n = 0
        for tid, body in payload.items():
            if tid in doc:
                print(f"  (skip i18n exists) {path.name} :: {tid}")
                continue
            doc[tid] = body
            n += 1
        path.write_text(json.dumps(doc, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"  {path.parent.name}/nano.json: +{n}")


if __name__ == "__main__":
    main()
