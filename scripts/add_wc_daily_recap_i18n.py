"""Append i18n entries for template-wc-daily-recap-poster (2026-06-16).

Daily-fresh World Cup recap infographic — yesterday's results + scorers,
golden boot leaders, today's fixtures. Run each work session during the
tournament window (2026-06-15 → ~2026-07-19).
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = ["template-wc-daily-recap-poster"]

EN = {
    "template-wc-daily-recap-poster": {
        "category": "World Cup Daily Recap Poster",
        "description": "Generate a vertical daily World Cup recap infographic — yesterday's match results with scorers + minutes, current golden boot leaders, today's fixtures with multi-timezone times. One fresh visualization per day during the tournament.",
        "title": "Nano Banana Prompt: World Cup Daily Recap Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a vertical 8K daily World Cup 2026 recap infographic. Header (trophy + ball + date). Yesterday's results section: 2x2 grid of match cards with country flags, big bold score + FT pill, goal scorers with minute markers. Golden Boot Leaders box: chibi-style cartoon avatars of the current top scorers + tournament-total goals counter. Today's matches section: 4 fixture cards stacked vertically with multi-timezone time tables and venue info. Designed as a single-glance daily WC snapshot — fresh content for SEO + social + return-visitor surfaces during the tournament window.",
            "who": "Suitable for daily World Cup coverage during the tournament (~2026-06-11 to 2026-07-19), sports content creators producing daily-fresh posters, fan communities, broadcast-graphics teams, and site operators wanting a daily-changing hero image without manual layout work.",
            "how": [
                "Collect yesterday's match results + scorers + minutes (FIFA / ESPN / BBC Sport scrape or admin pull).",
                "Update cumulative golden boot leaders + tournament total goals.",
                "Pull today's fixtures + venues from the schedule.",
                "Pass everything as a single payload to {wc_daily_data} (one structured string).",
                "Generate the vertical 8K daily recap poster."
            ],
            "prompts": [
                "Generate yesterday's World Cup results + today's fixtures recap poster.",
                "Create a daily World Cup 2026 highlights infographic with scorers and tomorrow's matches.",
                "Generate a fresh FIFA WC daily recap with golden boot leaders + tournament goal counter."
            ]
        }},
    },
}

ZH = {
    "template-wc-daily-recap-poster": {
        "category": "世界杯每日战报海报",
        "description": "生成每日世界杯战报信息长图——昨日比赛结果与进球者+时间、当前金靴榜、今日赛程与多时区时间。比赛期间每天一张新鲜可视化。",
        "title": "Nano Banana 提示词：世界杯每日战报海报生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板生成竖版 8K 每日世界杯 2026 战报信息长图。顶部页眉（奖杯+足球+日期）。昨日战果板块：2x2 比赛卡片网格，含国旗、粗体大比分+FT标签、进球者与进球时间。金靴榜板块：Q版卡通头像呈现当前最佳射手+赛事进球总数。今日赛程板块：4 个赛程卡片竖向堆叠，含多时区时间表与场馆信息。设计为一眼可读的每日世界杯快照——比赛期间为 SEO、社媒及回访用户提供每日新鲜内容。",
            "who": "适合世界杯期间（约 2026-06-11 至 2026-07-19）的每日赛事报道、生产每日新鲜海报的体育内容创作者、球迷社群、电视转播图形团队，以及希望无需手工排版即可获得每日变化首图的运营。",
            "how": [
                "采集昨日比赛结果+进球者+时间（FIFA / ESPN / BBC Sport 抓取或后台拉取）。",
                "更新累计金靴榜与赛事总进球数。",
                "从赛程表获取今日比赛+场馆信息。",
                "将以上整合为单一 payload 传入 {wc_daily_data}（一段结构化字符串）。",
                "生成竖版 8K 每日战报海报。"
            ],
            "prompts": [
                "生成昨日世界杯战果+今日赛程战报海报。",
                "创建含进球者与明日赛程的世界杯 2026 每日精彩信息图。",
                "生成含金靴榜与赛事总进球计数的 FIFA 世界杯每日战报。"
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
    print(f"\nDone. Added {total} entries.")


if __name__ == "__main__":
    main()
