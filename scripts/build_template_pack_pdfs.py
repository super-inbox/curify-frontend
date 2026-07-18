# -*- coding: utf-8 -*-
"""Reusable builder for downloadable template PDF packs (free 5 / paid 50 / 100).

Packs are PRE-BUILT static PDFs (there is no server-side PDF generation) uploaded
to Azure blob at `packs/{template_id}/pack-{size}.pdf`; the backend just serves +
charges. This script assembles those PDFs offline via the shared print pipeline
`scripts/images_to_pdf.py` (US-Letter, print margins, Curify logo in the margin,
CJK-safe captions).

Two image sources:
  - clean-dir  : a folder of clean (non-watermark) PNGs — for paid packs (e.g. HSK).
  - gallery    : a template's existing example images pulled from
                 public/data/nano_inspiration.json (these are WATERMARKED on disk —
                 fine for a free lead-magnet 5-pack).

Usage:
    python scripts/build_template_pack_pdfs.py            # build everything in PACKS
    python scripts/build_template_pack_pdfs.py <template_id>   # just one template

Output: raw/template-packs/{template_id}/pack-{size}.pdf  (ready to upload).
"""
import json, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "scripts"))
from images_to_pdf import build_pdf  # noqa: E402

OUT_ROOT = os.path.join(ROOT, "raw", "template-packs")
NANO_INSP = os.path.join(ROOT, "public", "data", "nano_inspiration.json")
NANO_INSP_DIR = os.path.join(ROOT, "public", "images", "nano_insp")
SUBTITLE = "拼音 + 汉字 · curify-ai.com"
HSK_TEMPLATE = "template-hsk-bilingual-reading-text-lesson-poster"

# ---- HSK: clean cards in the deck's category order (source of truth = the plan) ----
HSK_REVIEW = os.path.join(ROOT, "raw", "hsk2-reading-deliverable", "cards-generated-review")
HSK_PLAN = os.path.join(ROOT, "raw", "hsk2-reading-deliverable", "hsk2_reading_generation_plan.json")
HSK_ORDER = ["world-classic-fairy-tales", "chinese-classics-fables", "daily-life", "nature-seasons"]


def hsk_items(n=None):
    plan = json.load(open(HSK_PLAN))
    items, i = [], 0
    for cat in HSK_ORDER:
        for card in plan["categories"][cat]["cards"]:
            path = os.path.join(HSK_REVIEW, f'{card["id_suffix"]}.png')
            if not os.path.exists(path):
                continue
            i += 1
            items.append((path, f'{i}. {card["title_zh"]} · {card["title_en"]}'))
            if n and i >= n:
                return items
    return items


def gallery_items(template_id, n):
    """First n example images for a template, pulled from nano_inspiration.json.
    Images on disk are watermarked (OK for a free pack)."""
    recs = [r for r in json.load(open(NANO_INSP)) if r.get("template_id") == template_id]
    items = []
    for r in recs:
        url = (r.get("asset") or {}).get("image_url") or ""
        fname = os.path.basename(url)
        path = os.path.join(NANO_INSP_DIR, fname)
        if url and os.path.exists(path):
            items.append((path, ""))
        if len(items) >= n:
            break
    return items


# ---- pack build list. `source`: ("hsk",) or ("gallery", template_id) ----
PACKS = [
    {"template_id": HSK_TEMPLATE, "size": 5,  "source": ("hsk",), "subtitle": "HSK 2 · " + SUBTITLE},
    {"template_id": HSK_TEMPLATE, "size": 50, "source": ("hsk",), "subtitle": "HSK 2 · " + SUBTITLE},
    # curated free 5-packs for education templates get appended by the driver below
]


def resolve_items(pack):
    kind = pack["source"][0]
    if kind == "hsk":
        return hsk_items(pack["size"] if pack["size"] < 50 else None)
    if kind == "gallery":
        return gallery_items(pack["source"][1], pack["size"])
    raise ValueError(kind)


def build_one(pack):
    items = resolve_items(pack)
    if len(items) < pack["size"]:
        print(f"  SKIP {pack['template_id']} pack-{pack['size']}: only {len(items)} images (need {pack['size']})")
        return None
    items = items[: pack["size"]]
    out_dir = os.path.join(OUT_ROOT, pack["template_id"])
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, f"pack-{pack['size']}.pdf")
    _, pages, size = build_pdf(items, out, subtitle=pack.get("subtitle", SUBTITLE))
    mb = os.path.getsize(out) / 1e6
    print(f"  OK {pack['template_id']} pack-{pack['size']}: {pages}p {size[0]}x{size[1]} {mb:.1f}MB -> {out}")
    return out


def load_extra_packs():
    """Optional config file listing more packs to build:
       scripts/configs/template_packs_build.json = [{template_id, size, source:["gallery"|"hsk", id?], subtitle?}]"""
    cfg = os.path.join(ROOT, "scripts", "configs", "template_packs_build.json")
    if not os.path.exists(cfg):
        return []
    out = []
    for p in json.load(open(cfg)):
        out.append({"template_id": p["template_id"], "size": p["size"],
                    "source": tuple(p["source"]), "subtitle": p.get("subtitle", SUBTITLE)})
    return out


def main():
    only = sys.argv[1] if len(sys.argv) > 1 else None
    packs = PACKS + load_extra_packs()
    if only:
        packs = [p for p in packs if p["template_id"] == only]
    print(f"building {len(packs)} pack(s) -> {OUT_ROOT}")
    for p in packs:
        build_one(p)


if __name__ == "__main__":
    main()
