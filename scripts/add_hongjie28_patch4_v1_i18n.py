"""Append i18n entries for 1 new template from hongjie28-patch-4 (2026-06-15 push).

Template added:
  - template-sports-court-shot-trajectory-analysis-infographic
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = [
    "template-sports-court-shot-trajectory-analysis-infographic",
]

EN = {
    "template-sports-court-shot-trajectory-analysis-infographic": {
        "category": "Sports Court Shot Trajectory Analysis Infographic",
        "description": "Generate a vertical tactical shot-map infographic — top-down/isometric court layout with color-coded curved trajectory lines from athlete positions to target zones, tiny cartoon player markers, and a full data table of attempts, success rates, and per-player metrics.",
        "title": "Nano Banana Prompt: Sports Court Shot Trajectory Analysis Infographic Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K tactical shot-trajectory infographic poster for any sport. Layout: bold main title + quote at top; full top-down or isometric official court floor at center; multiple uniquely color-coded curved trajectory lines originating from athlete positions to target zones, each labeled with an index marker; tiny simplified cartoon player figures at each starting position; bottom data table with athlete name, team, match date, position, shot attempts, success rate, and detailed metrics. Color legend ties trajectory lines to table rows. Clean modern sports-analytics graphic design, soft flat illustration court texture, distinct bright trajectory colors, professional print-poster quality.",
            "who": "Suitable for sports analysts producing match-review collateral, coaches teaching shot selection / tactical patterns, sports-media designers needing data-viz posters, fantasy-sports content creators, and broadcast-graphics producers.",
            "how": [
                "Enter the sport + analysis focus in {sport_analysis_topic} (e.g. 'NBA player full-court shot point hit-rate visualization chart').",
                "Top-down / isometric court auto-renders for the matching sport.",
                "Color-coded trajectories + cartoon player markers + data table auto-compose.",
                "Generate a vertical 8K shot-trajectory tactical analysis infographic."
            ],
            "prompts": [
                "Generate a soccer long-range volley shot trajectory tactical analysis poster.",
                "Create an NBA player full-court shot point hit-rate visualization chart.",
                "Generate a tennis serve placement line-route grand-slam technique analysis infographic."
            ]
        }},
    },
}

ZH = {
    "template-sports-court-shot-trajectory-analysis-infographic": {
        "category": "运动场地射击轨迹分析信息图",
        "description": "生成竖版战术射击轨迹信息图——俯视/等距球场布局配色编码曲线轨迹自运动员位置至目标区域、卡通运动员位置标记，底部完整数据表（出手次数、命中率、个人指标）。",
        "title": "Nano Banana 提示词：运动场地射击轨迹分析信息图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 战术射击轨迹信息图海报，适用任意运动项目。布局：顶部粗体主标题+引言；中央为完整俯视或等距官方球场地面布局；多条色彩独特的曲线轨迹从运动员位置出发延伸至目标区域，每条配索引标记；每个起始位置放置卡通化运动员小人；底部完整数据表格含运动员姓名、队伍、比赛日期、位置、出手次数、命中率及详细指标。颜色图例将轨迹与表格行对应。简洁现代运动数据可视化设计、柔和扁平球场材质、鲜明轨迹色、印刷海报级专业品质。",
            "who": "适合制作赛后复盘材料的体育分析师、教学射击选择/战术阵型的教练、需要数据可视化海报的体育媒体设计师、梦幻体育内容创作者，以及电视转播图形制作人。",
            "how": [
                "在 {sport_analysis_topic} 中输入运动项目+分析重点（如\"NBA球员全场投篮点位命中统计可视化图表\"）。",
                "自动渲染对应运动项目的俯视/等距球场。",
                "色彩编码轨迹+卡通球员标记+数据表格自动排版。",
                "生成竖版 8K 射击轨迹战术分析信息图。"
            ],
            "prompts": [
                "生成足球远距离凌空射门轨迹战术分析数据海报。",
                "创建 NBA 球员全场投篮点位命中统计可视化图表。",
                "生成网球不同发球落点线路大赛技术解析信息长图。"
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
            print(f"  SKIP (missing): {p}"); continue
        doc = json.loads(p.read_text(encoding="utf-8"))
        added = 0
        for tid in template_ids:
            if tid in doc:
                print(f"  ({locale}) already has {tid}, skipping"); continue
            doc[tid] = by_locale[locale][tid]
            added += 1; total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added}")
    print(f"\nDone. Added {total} entries ({len(template_ids)} × {len(LOCALES)}).")


if __name__ == "__main__":
    main()
