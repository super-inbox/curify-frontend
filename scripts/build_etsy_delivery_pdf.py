# -*- coding: utf-8 -*-
"""Build the Etsy delivery PDF for a pack SKU — one hero image + one redemption link.

This is the file the Etsy buyer downloads after purchase. It is NOT the pack itself:
the pack is a ZIP on Azure, and this PDF is the only thing that carries the buyer to
it. Previously hand-made in Canva (the example under curify-gallery/etsy-packs was
produced that way), which does not scale past a handful of SKUs and drifts in layout
between them.

The link MUST be a real PDF link annotation, not just text on the page. An Etsy buyer
reading on a phone will tap, not retype a URL — a text-only URL silently loses most
redemptions. That is the single reason this uses reportlab rather than the Pillow
pipeline in scripts/images_to_pdf.py, which cannot emit annotations.

Attribution: every generated link carries ?c=<code> (default etsy-<sku>-listing) so
redemptions are attributable per listing in the backend logs. See
docs/etsy-packs.md "Attribution codes".

Usage:
    python scripts/build_etsy_delivery_pdf.py                 # every active pack
    python scripts/build_etsy_delivery_pdf.py <sku> [<sku>…]  # specific SKUs
    python scripts/build_etsy_delivery_pdf.py --code=etsy-fall-sale <sku>

Output: raw/etsy-packs/<sku>-delivery.pdf
"""
import io, json, os, sys, urllib.request

from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REGISTRY = os.path.join(ROOT, "lib", "etsy_packs.json")
OUT_DIR = os.path.join(ROOT, "raw", "etsy-packs")
CDN = "https://cdn.curify-ai.com"
SITE = "https://www.curify-ai.com"
PAGE_W, PAGE_H = letter
MARGIN = 54  # 0.75"


def load_packs(include_inactive=False):
    """active=False packs are pre-launch: the ZIP is not on Azure yet. Their PDF is
    still needed to prepare the Etsy listing, so --include-inactive allows it."""
    with open(REGISTRY, encoding="utf-8") as fh:
        packs = json.load(fh)["packs"]
    return packs if include_inactive else [p for p in packs if p.get("active")]


def fetch_cover(path, sku=None):
    """Resolve the hero image, cleanest source first.

    1. packs/<sku>/<name> — the CLEAN pre-watermark copy. This must win: the buyer
       has already paid, and shipping them a watermarked hero looks like a mistake.
       The gallery copy under public/images/nano_insp/ has the SAME FILENAME but is
       watermarked in place at ingest, so resolving cover_image naively picks the
       wrong bytes (measured: 939,876 watermarked vs 1,026,644 clean).
    2. public/<cover_image> — local gallery copy; fine for packs with a dedicated
       pack-*-cover asset that was never watermarked.
    3. CDN — for packs whose local copies are gone.
    """
    name = os.path.basename(path)
    if sku:
        clean = os.path.join(ROOT, "packs", sku, name)
        if os.path.exists(clean):
            with open(clean, "rb") as fh:
                return io.BytesIO(fh.read())
    if not path.startswith("http"):
        local = os.path.join(ROOT, "public", path.lstrip("/"))
        if os.path.exists(local):
            with open(local, "rb") as fh:
                return io.BytesIO(fh.read())
    url = path if path.startswith("http") else f"{CDN}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "curify-pack-builder"})
    with urllib.request.urlopen(req, timeout=60) as r:
        if r.status != 200:
            raise RuntimeError(f"cover {url} returned HTTP {r.status}")
        return io.BytesIO(r.read())


def wrap(c, text, font, size, max_w):
    c.setFont(font, size)
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = f"{cur} {w}".strip()
        if c.stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build(pack, code=None):
    sku = pack["sku"]
    url = f"{SITE}/pack/{sku}?c={code or f'etsy-{sku}-listing'}"
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f"{sku}-delivery.pdf")

    c = canvas.Canvas(out, pagesize=letter)
    c.setTitle(pack["title"])
    y = PAGE_H - MARGIN

    # Title
    for line in wrap(c, pack["title"], "Helvetica-Bold", 17, PAGE_W - 2 * MARGIN):
        y -= 22
        c.setFont("Helvetica-Bold", 17)
        c.drawString(MARGIN, y, line)

    # Hero image, aspect preserved, capped so the CTA always stays above the fold
    y -= 18
    img = ImageReader(fetch_cover(pack["cover_image"], sku))
    iw, ih = img.getSize()
    max_w, max_h = PAGE_W - 2 * MARGIN, 430
    scale = min(max_w / iw, max_h / ih)
    w, h = iw * scale, ih * scale
    y -= h
    c.drawImage(img, (PAGE_W - w) / 2, y, width=w, height=h,
                preserveAspectRatio=True, mask="auto")

    # Instruction + the tappable link. drawString paints the glyphs; linkURL is what
    # makes the region clickable — both are required.
    y -= 42
    c.setFont("Helvetica", 12)
    c.drawCentredString(PAGE_W / 2, y,
                        f"Your {pack['card_count']} printable files — tap below to download:")
    y -= 30
    c.setFont("Helvetica-Bold", 13)
    c.setFillColorRGB(0.29, 0.11, 0.71)
    c.drawCentredString(PAGE_W / 2, y, url)
    tw = c.stringWidth(url, "Helvetica-Bold", 13)
    c.linkURL(url, ((PAGE_W - tw) / 2 - 6, y - 8, (PAGE_W + tw) / 2 + 6, y + 16),
              relative=0, thickness=0)
    c.setFillColorRGB(0, 0, 0)

    y -= 26
    c.setFont("Helvetica", 9.5)
    c.setFillColorRGB(0.42, 0.42, 0.42)
    c.drawCentredString(PAGE_W / 2, y, "No account needed. The link stays valid — re-download any time.")
    c.setFillColorRGB(0, 0, 0)

    c.showPage()
    c.save()
    return out, url


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    code = next((a.split("=", 1)[1] for a in sys.argv[1:] if a.startswith("--code=")), None)
    packs = load_packs("--include-inactive" in sys.argv)
    if args:
        by_sku = {p["sku"]: p for p in packs}
        missing = [s for s in args if s not in by_sku]
        if missing:
            sys.exit(f"unknown or inactive sku: {', '.join(missing)}")
        packs = [by_sku[s] for s in args]
    for p in packs:
        out, url = build(p, code)
        print(f"  {p['sku']:<26} {os.path.getsize(out)/1024:6.0f} KB  {url}")
    print(f"  {len(packs)} PDF(s) -> raw/etsy-packs/")


if __name__ == "__main__":
    main()
