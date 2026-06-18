"""Apply a +20 rank_score boost to all image2image templates
(requires_image_upload=true) in public/data/nano_templates.json.

Preserves existing per-template tuning by adding to the CURRENT
rank_score rather than overwriting. base_rank_score is left alone.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TPL_PATH = ROOT / "public" / "data" / "nano_templates.json"
BOOST = 20.0


def main() -> None:
    tmpls = json.loads(TPL_PATH.read_text(encoding="utf-8"))
    changes = []
    for t in tmpls:
        if not t.get("requires_image_upload"):
            continue
        before = t.get("rank_score")
        if before is None:
            before = t.get("base_rank_score", 90)
        after = round(float(before) + BOOST, 2)
        t["rank_score"] = after
        changes.append((t["id"], before, after))

    TPL_PATH.write_text(
        json.dumps(tmpls, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"  boosted {len(changes)} image2image templates by +{BOOST}\n")
    for tid, b, a in sorted(changes, key=lambda x: -x[2]):
        print(f"  {tid:<60} {b} → {a}")


if __name__ == "__main__":
    main()
