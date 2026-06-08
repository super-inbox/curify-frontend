"""Append i18n entries for 3 new templates from hongjie28-patch-2 (2026-06-08 push).

Templates added:
  - template-football-team-all-time-lineup-poster      (vertical 4-4-2 pitch all-time XI poster)
  - template-ip-character-design-specification-sheet   (clean white-bg character spec sheet)
  - template-sports-ball-evolution-infographic         (horizontal sports-ball evolution timeline)

Per memory feedback_daily_drop_i18n.md:
  - Suffix _v9 to avoid collision with prior hongjie28-patch-2 cycles.
  - nano.json is FLAT at top level: doc[tid], NOT doc.setdefault('nano', {})[tid].
  - EN authored for all 3 templates + ZH translations; other 8 locales
    fall back to EN and pick up native translations on the next
    i18n_autotranslate.cjs sweep.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-football-team-all-time-lineup-poster",
    "template-ip-character-design-specification-sheet",
    "template-sports-ball-evolution-infographic",
]

EN = {
    "template-football-team-all-time-lineup-poster": {
        "category": "Football Team All-Time Lineup Poster",
        "description": "Generate a vertical football tactics poster with any team's all-time starting XI on a classic 4-4-2 pitch — team crest, eleven star players in position, signature formation grid.",
        "title": "Nano Banana Prompt: Football Team All-Time Lineup Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K football tactics poster for any club or national team's all-time starting XI. Layout: top-down view of a classic 4-4-2 football pitch with crisp white lines on lush green grass; team crest in the top-left corner; the starting 11 legendary players placed in their natural tactical positions with portrait photos, names, and historic shirt numbers; team identity bar across the bottom.",
            "who": "Suitable for football fan-art creators, national-team merch designers, fantasy-league commentators, sports-bar wall print sellers, and football-historian publishers building all-time XI editorials.",
            "how": [
                "Enter the team name + all-time starting XI in {team_info} (e.g. 'Brazil National Team All-Time Greatest XI' or 'FC Barcelona All-Time Legends Lineup').",
                "Team crest auto-renders in the top-left corner.",
                "11 legendary players auto-place in 4-4-2 positions with portraits, names, shirt numbers.",
                "Generate a vertical 8K all-time XI football tactics poster."
            ],
            "prompts": [
                "Generate a Brazil National Team All-Time Greatest XI poster in a 4-4-2 formation.",
                "Create an FC Barcelona All-Time Legends Lineup poster.",
                "Generate an Argentina National Team All-Time Best Squad tactics poster."
            ]
        }},
    },
    "template-ip-character-design-specification-sheet": {
        "category": "IP Character Design Specification Sheet",
        "description": "Generate a clean white-background technical design document for any IP mascot — side-view golden-ratio construction, color palette, multi-angle turnaround, expression grid, brand-voice notes.",
        "title": "Nano Banana Prompt: IP Character Design Specification Sheet Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates an 8K clean white-background technical design specification sheet for any IP character. Layout: top section shows the character's side-view construction using golden ratio and grid system with construction circles and proportional guides; middle carries color palette swatches with hex codes and the full character turnaround (front / side / back / three-quarter); lower section delivers an expression grid, signature poses, and brand-voice tone notes — all unified under a single IP identity.",
            "who": "Suitable for in-house brand teams launching a mascot IP, agencies pitching mascot redesigns, IP-licensing intermediaries presenting characters for approval, kids-product brand managers, and indie creators building stylized character bibles.",
            "how": [
                "Enter the IP character name + core color + species in {ip_info} (e.g. 'Meituan Kangaroo Mascot, bright yellow color scheme, simple flat line art style').",
                "Side-view golden-ratio construction auto-renders in the top section.",
                "Color palette + multi-angle turnaround + expression grid auto-compose across the lower sections.",
                "Generate an 8K white-background IP character design specification sheet."
            ],
            "prompts": [
                "Generate a Meituan Kangaroo Mascot design specification sheet in bright yellow flat line art.",
                "Create a Cute Brown Bear Mascot spec sheet in warm brown and beige tones with rounded cartoon proportions.",
                "Generate a Blue Penguin Mascot specification sheet in clean vector illustration with a blue and white palette."
            ]
        }},
    },
    "template-sports-ball-evolution-infographic": {
        "category": "Sports Ball Evolution Infographic",
        "description": "Generate a horizontal infographic poster tracking any sport's ball evolution — Early Era leather originals on the left, Modern Era branded balls on the right, hero ball at center with material and design annotations.",
        "title": "Nano Banana Prompt: Sports Ball Evolution Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal 8K infographic poster on the evolution of any sport's ball. Layout: title bar at the top ('THE EVOLUTION OF [SPORT] BALLS 18XX-2026'); left side covers the Early Era (old leather balls with launch dates and material notes); right side covers the Modern Era (modern branded balls with launch dates); a large hero ball anchors the center with material, stitching, and design annotations, surrounded by historical milestones and brand collaborators.",
            "who": "Suitable for sports equipment brands (Wilson, Adidas, Rawlings) producing brand-history merch, sports museums and hall-of-fame retail, sporting goods e-commerce publishers, sports-history educators, and content creators producing equipment-evolution reels.",
            "how": [
                "Enter the sport + ball type + brand in {sport_ball_info} (e.g. 'FIFA World Cup football evolution with Adidas balls' or 'Basketball evolution timeline with Wilson NBA ball').",
                "Early Era leather originals auto-render on the left side with launch dates.",
                "Modern Era branded balls auto-render on the right; hero ball + annotations auto-compose at center.",
                "Generate a horizontal 8K sports-ball evolution infographic poster."
            ],
            "prompts": [
                "Generate a Basketball evolution timeline infographic with the Wilson NBA ball as hero.",
                "Create a FIFA World Cup football evolution infographic featuring Adidas balls.",
                "Generate an MLB baseball evolution infographic with Rawlings balls."
            ]
        }},
    },
}

ZH = {
    "template-football-team-all-time-lineup-poster": {
        "category": "足球队史最佳阵容海报",
        "description": "为任意球队的历史最佳首发 XI 生成竖版 4-4-2 战术海报 —— 队徽、11 位传奇球员各居其位、经典阵型网格。",
        "title": "Nano Banana 提示词：足球队史最佳阵容海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意俱乐部或国家队的历史最佳首发 XI 生成 8K 竖版足球战术海报。布局：俯视经典 4-4-2 球场,白色清晰边线 + 翠绿草地;左上队徽;11 位传奇球员按战术位置依次排开,配人像照、姓名、历史球衣号;底部为球队标识栏。",
            "who": "适合足球同人创作者、国家队周边设计师、梦幻联盟解说员、体育酒吧墙印售卖者,以及制作历史最佳 XI 编辑栏目的足球史发布方。",
            "how": [
                "在 {team_info} 输入球队名 + 历史首发 XI（例如：'巴西国家队史最佳 XI'或'巴塞罗那俱乐部传奇阵容'）。",
                "队徽自动呈现在左上角。",
                "11 位传奇球员自动以 4-4-2 阵型排位,配人像、姓名、球衣号。",
                "生成竖版 8K 历史最佳 XI 足球战术海报。"
            ],
            "prompts": [
                "生成巴西国家队史最佳 XI 海报,采用 4-4-2 阵型。",
                "生成巴塞罗那俱乐部传奇阵容海报。",
                "生成阿根廷国家队史最佳阵容战术海报。"
            ]
        }},
    },
    "template-ip-character-design-specification-sheet": {
        "category": "IP 角色设计规范表",
        "description": "为任意 IP 吉祥物生成白底技术设计文档 —— 侧视黄金分割构造、配色色板、多视角转身图、表情网格、品牌语调说明。",
        "title": "Nano Banana 提示词：IP 角色设计规范表生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意 IP 角色生成 8K 白底技术设计规范表。布局：顶部以黄金分割与网格系统呈现角色侧视构造,辅以构造圆和比例参考线;中部呈现配色色板(含十六进制色值)与完整角色转身图(正/侧/背/四分之三);下部为表情网格、招牌姿态、品牌语调说明 —— 全部统一于单一 IP 标识下。",
            "who": "适合上线吉祥物 IP 的品牌内部团队、提案吉祥物重设的设计代理、向品牌呈现角色待审的 IP 授权方、儿童产品品牌经理,以及构建风格化角色圣经的独立创作者。",
            "how": [
                "在 {ip_info} 输入 IP 角色名 + 主色 + 物种（例如：'美团袋鼠吉祥物,亮黄配色,简洁线条扁平风'）。",
                "侧视黄金分割构造自动呈现在顶部。",
                "配色色板 + 多视角转身图 + 表情网格自动合成至下部。",
                "生成 8K 白底 IP 角色设计规范表。"
            ],
            "prompts": [
                "生成美团袋鼠吉祥物设计规范表,亮黄色扁平线条风。",
                "生成可爱棕熊吉祥物规范表,暖棕米色调 + 圆润卡通比例。",
                "生成蓝企鹅吉祥物规范表,清新矢量插画 + 蓝白色板。"
            ]
        }},
    },
    "template-sports-ball-evolution-infographic": {
        "category": "运动球类演变信息图",
        "description": "为任意运动的球类演变生成横版信息图海报 —— 左侧 Early Era 真皮原型、右侧 Modern Era 品牌球、中心英雄球带材质与设计标注。",
        "title": "Nano Banana 提示词：运动球类演变信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成任意运动球类演变的 8K 横版信息图海报。布局：顶部标题栏('THE EVOLUTION OF [SPORT] BALLS 18XX-2026');左侧 Early Era(早期真皮球类 + 发布日期 + 材质说明);右侧 Modern Era(现代品牌球类 + 发布日期);中心大幅英雄球带材质、缝线、设计标注,周围环绕历史里程碑与品牌合作伙伴。",
            "who": "适合运动器材品牌(Wilson、Adidas、Rawlings)制作品牌史周边、体育博物馆与名人堂零售、体育用品电商发布方、体育史教育者,以及制作器材演变短视频的内容创作者。",
            "how": [
                "在 {sport_ball_info} 输入运动 + 球类 + 品牌（例如：'FIFA 世界杯足球演变(Adidas 系列)'或'NBA 篮球演变时间轴(Wilson)'）。",
                "左侧自动呈现 Early Era 真皮原型 + 发布日期。",
                "右侧自动呈现 Modern Era 品牌球;中心英雄球 + 标注自动合成。",
                "生成 8K 横版运动球类演变信息图海报。"
            ],
            "prompts": [
                "生成 Wilson NBA 篮球为英雄球的篮球演变时间轴信息图。",
                "生成 FIFA 世界杯足球演变信息图,主打 Adidas 系列。",
                "生成 MLB 棒球演变信息图,主打 Rawlings 系列。"
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
