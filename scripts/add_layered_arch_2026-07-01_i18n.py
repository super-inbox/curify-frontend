"""i18n for the new template-layered-systems-architecture (2026-07-01 drop).

Same shape as prior daily-drop i18n scripts (see add_jun28_celeb_meme_i18n.py):
seeds all 10 locales with the EN blob so nothing 404s; ZH copy mirrors EN
until the periodic autotranslate job runs.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MESSAGES = ROOT / "messages"
LOCALES = ["en", "zh", "de", "es", "fr", "hi", "ja", "ko", "ru", "tr"]
template_ids = ["template-layered-systems-architecture"]

EN = {
    "template-layered-systems-architecture": {
        "category": "Layered Systems Architecture Poster",
        "description": "Generate a clean, portrait 4:5 layered-architecture poster — 3 to 7 named layers stacked top-to-bottom with sub-item pills and downward flow arrows — for engineering documentation, tech blogs, and platform onboarding decks.",
        "title": "Nano Banana Prompt: Layered Systems Architecture Poster Generator | Curify AI",
        "content": {"sections": {
            "what": "This template produces a reference-grade layered-architecture diagram: a portrait 4:5 poster with a bold title, an optional subtitle, and 3 to 7 evenly-weighted horizontal panels stacked top-to-bottom. Each panel carries a numbered chip (L1, L2, …), the layer name, and 2 to 5 sub-item pills rendered as small rounded rectangles with monospace labels. Thin downward arrows connect the layers so the flow reads top→bottom. Engineering aesthetic — flat vector, warm-white background, muted developer-palette accents, no cartoons.",
            "who": "Suitable for platform / infra / ML engineers publishing systems-design breakdowns on LinkedIn / X / Xiaohongshu, tech-blog authors illustrating architecture posts, engineering managers producing onboarding decks and platform overviews, and dev-tool / cloud / MLOps startups needing clean marketing diagrams.",
            "how": [
                "Enter the stack title (e.g. 'AI/ML Job Orchestration', 'LLM Inference Stack', 'Modern Data Pipeline').",
                "Add a short subtitle tagline (optional) — one line describing the flow.",
                "Provide the layers block: one line per layer in the form 'Lk — Name: item, item, item'. 3 to 7 layers, 2 to 5 items each.",
                "Generate the layered architecture poster."
            ],
            "prompts": [
                "AI/ML Job Orchestration — L1 API: Submit, Cancel, Status; L2 Execution: Queue, Worker, Sync/Async; L3 Reliability: Retry, Checkpoint, Failover; L4 Resources: CPU, GPU, Memory, Model Loading; L5 Scalability: Storage, Horizontal Scaling, Monitoring, Autoscaling.",
                "LLM Inference Stack — L1 Client, L2 Gateway, L3 Orchestrator, L4 Router, L5 Inference, L6 Runtime, L7 Hardware.",
                "Modern Data Pipeline — L1 Ingest: Kafka, Kinesis; L2 Storage: S3, Delta Lake, Iceberg, Parquet, Snowflake; L3 Compute: Spark, Flink; L4 Transform: dbt, Airflow, Dagster, Prefect; L5 Serve: BI, ML, API."
            ]
        }},
    },
}
ZH = {tid: EN[tid] for tid in template_ids}


def main():
    by_locale = {locale: (ZH if locale == "zh" else EN) for locale in LOCALES}
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
                continue
            doc[tid] = by_locale[locale][tid]
            added += 1
            total += 1
        if added:
            p.write_text(json.dumps(doc, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            print(f"  {locale}: +{added}")
        else:
            print(f"  {locale}: (already present)")
    print(f"\nDone. Added {total} ({len(template_ids)} × {len(LOCALES)}).")


if __name__ == "__main__":
    main()
