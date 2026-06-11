"""Append i18n entries for the new template-corporate-news-editorial-hero.

Shipped 2026-06-12 alongside the meta-layoff eyeball drop. Single-template
addition; not a hongjie patch cycle. EN + ZH authored; 8 other locales
fall back to EN pending the next i18n_autotranslate.cjs sweep.

The template fills a clear content gap for business-news editorial
illustration — monochrome with single brand-color accent, the style used
by publishers like OutLever / The Information / Stratechery / Axios.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"

LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]

template_ids = ["template-corporate-news-editorial-hero"]

EN = {
    "template-corporate-news-editorial-hero": {
        "category": "Corporate News Editorial Hero",
        "description": "Generate a monochrome editorial article-header illustration of a corporate news event — desaturated greys with a single brand-color accent on the company logo. Editorial style favored by business publishers (Stratechery, The Information, OutLever, Axios).",
        "title": "Nano Banana Prompt: Corporate News Editorial Hero Illustration Generator | Curify AI",
        "content": {"sections": {
            "what": "This template generates a horizontal 3:2 editorial article-header illustration depicting any corporate news event. Modern corporate setting with the company name prominently in branded signage; stylized realistic-illustrated figures (employees, executives, customers, partners) acting out the news event in the foreground. Style: monochrome desaturation to charcoal/grey across the entire scene EXCEPT ONE accent color — the company brand color — applied only to the logo signage and minimal branded accent elements. Subtle paper / newsprint texture overlay for editorial feel.",
            "who": "Suitable for business journalists and editors at publishers like The Information / Stratechery / Axios / OutLever / Substack writers producing per-article hero visuals, corporate communications teams creating press release covers, content marketers at B2B SaaS / fintech / VC firms producing thought-leadership pieces, and PR agencies building news-cycle visual assets.",
            "how": [
                "Enter the corporate event + company + brand color in {event_info} (e.g. 'Meta lays off 8,000 workers and pivots with $115M America's Workforce Academy — workers exiting Meta HQ carrying personal items boxes, Meta blue #1877F2 accent').",
                "Architectural setting + crowd of figures auto-render in the foreground.",
                "Monochrome treatment with single-accent brand color auto-applied to logo signage.",
                "Generate a 3:2 editorial article-header illustration ready for use as an article hero."
            ],
            "prompts": [
                "Generate a Meta layoff editorial hero — workers exiting HQ carrying personal items boxes, Meta blue #1877F2 accent.",
                "Create an OpenAI $300B valuation milestone editorial hero — celebratory office moment, OpenAI green #74AA9C accent.",
                "Generate a Tesla Cybertruck recall editorial hero — service center with rows of returned trucks, Tesla red #CC0000 accent."
            ]
        }},
    },
}

ZH = {
    "template-corporate-news-editorial-hero": {
        "category": "企业新闻编辑头图",
        "description": "为任意企业新闻事件生成单色编辑头图 —— 灰度色调 + 单一品牌色点缀于品牌标识。商业出版人(Stratechery、The Information、OutLever、Axios)惯用的编辑风格。",
        "title": "Nano Banana 提示词:企业新闻编辑头图生成器 | Curify AI",
        "content": {"sections": {
            "what": "本模板为任意企业新闻事件生成 3:2 横版编辑文章头图。现代企业场景,品牌标识显眼呈现于建筑外立面;前景配多名风格化写实插画人物(员工、高管、客户、合作伙伴),演绎新闻事件。风格:全场景灰度去饱和(炭灰色调),仅保留单一品牌强调色 —— 即公司主色 —— 应用于标识与极简品牌点缀。叠加纸张/新闻纸纹理,呈现编辑感。",
            "who": "适合商业媒体的记者与编辑(The Information、Stratechery、Axios、OutLever)制作单篇文章头图、企业公关团队制作新闻稿封面、B2B SaaS/金融科技/风投机构的内容营销人员制作思想领导力素材,以及为新闻周期构建视觉资产的公关代理机构。",
            "how": [
                "在 {event_info} 输入企业事件 + 公司 + 品牌色(例如:'Meta 裁员 8000 人,投入 1.15 亿美元启动美国劳动力学院 —— 员工抱着私人物品箱走出 Meta 总部,Meta 蓝 #1877F2 强调')。",
                "建筑场景 + 前景人群自动渲染。",
                "单色处理 + 品牌色单一强调自动应用于标识。",
                "生成 3:2 横版编辑文章头图,可直接用作文章头图。"
            ],
            "prompts": [
                "生成 Meta 裁员编辑头图 —— 员工抱物品箱走出总部,Meta 蓝 #1877F2 强调。",
                "生成 OpenAI 估值 3000 亿美元里程碑编辑头图 —— 庆祝办公场景,OpenAI 绿 #74AA9C 强调。",
                "生成特斯拉 Cybertruck 召回编辑头图 —— 服务中心成排召回卡车,特斯拉红 #CC0000 强调。"
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
