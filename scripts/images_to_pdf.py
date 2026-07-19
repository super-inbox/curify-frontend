# -*- coding: utf-8 -*-
"""Simple, reusable image → print-ready PDF pipeline.

- 1 image per page (US Letter by default), sized to fit inside a safe print margin.
- Curify logo + wordmark in the TOP margin band and an optional caption in the
  BOTTOM margin band — both live in the white margin, never over the image content.
- CJK-safe caption font so Chinese titles render.

Reusable: pass a list of (image_path, caption) pairs. (We can consolidate this with
the /template-packs pack flow later.)

Usage (as a module):
    from images_to_pdf import build_pdf
    build_pdf([(img1, "title1"), (img2, "title2")], "out.pdf", subtitle="HSK 2 · 拼音 + 汉字 · curify-ai.com")
"""
import os
from PIL import Image, ImageDraw, ImageFont

DPI = 200
# US Letter @ DPI
PAGE_W, PAGE_H = int(8.5 * DPI), int(11 * DPI)        # 1700 x 2200
MARGIN = int(0.5 * DPI)                                # 0.5" safe print margin (100px)
HEADER_H = int(0.6 * DPI)                              # logo band inside the printable area
FOOTER_H = int(0.42 * DPI)                             # caption band
GAP = int(0.12 * DPI)
INK = (34, 34, 34); GRAY = (120, 120, 120); LINE = (228, 228, 228)
LOGO_PATH = os.path.join(os.path.dirname(__file__), "..", "public", "curify_logo_1024.png")


def _font(size, cjk=False, bold=False):
    cands = (["/System/Library/Fonts/STHeiti Medium.ttc",
              "/System/Library/Fonts/Hiragino Sans GB.ttc"] if cjk else
             ["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else
             ["/System/Library/Fonts/Supplemental/Arial.ttf"])
    cands += ["/System/Library/Fonts/STHeiti Medium.ttc"]  # CJK fallback
    for p in cands:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()


def _make_page(img_path, caption, subtitle, logo):
    page = Image.new("RGB", (PAGE_W, PAGE_H), "white")
    d = ImageDraw.Draw(page)

    # ---- header band (top margin zone): centered logo + "Curify" ----
    lh = int(0.34 * DPI)
    lg = logo.resize((lh, lh), Image.LANCZOS)
    brand, bf = "Curify", _font(int(0.30 * DPI), bold=True)
    bw = d.textlength(brand, font=bf)
    gx = (PAGE_W - (lh + int(0.09 * DPI) + bw)) // 2
    hy = MARGIN + (HEADER_H - lh) // 2
    page.paste(lg, (int(gx), int(hy)), lg)
    d.text((gx + lh + int(0.09 * DPI), MARGIN + (HEADER_H - int(0.30 * DPI)) // 2), brand, font=bf, fill=INK)
    d.line([(MARGIN, MARGIN + HEADER_H), (PAGE_W - MARGIN, MARGIN + HEADER_H)], fill=LINE, width=2)

    # ---- image: fit inside the printable content box, centered ----
    box_x0, box_y0 = MARGIN, MARGIN + HEADER_H + GAP
    box_x1, box_y1 = PAGE_W - MARGIN, PAGE_H - MARGIN - FOOTER_H - GAP
    bw_, bh_ = box_x1 - box_x0, box_y1 - box_y0
    im = Image.open(img_path).convert("RGB")
    scale = min(bw_ / im.width, bh_ / im.height)
    nw, nh = int(im.width * scale), int(im.height * scale)
    im = im.resize((nw, nh), Image.LANCZOS)
    ix = box_x0 + (bw_ - nw) // 2
    iy = box_y0 + (bh_ - nh) // 2
    page.paste(im, (ix, iy))
    d.rectangle([ix - 1, iy - 1, ix + nw, iy + nh], outline=(220, 220, 220), width=1)

    # ---- footer band (bottom margin zone): caption + subtitle ----
    fy = PAGE_H - MARGIN - FOOTER_H
    cf, sf = _font(int(0.16 * DPI), cjk=True), _font(int(0.13 * DPI), cjk=True)
    if caption:
        d.text((MARGIN, fy + int(0.05 * DPI)), caption, font=cf, fill=INK)
    if subtitle:
        sw = d.textlength(subtitle, font=sf)
        d.text((PAGE_W - MARGIN - sw, fy + int(0.08 * DPI)), subtitle, font=sf, fill=GRAY)
    return page


def build_pdf(items, out_path, subtitle=""):
    """items: list of (image_path, caption) or bare image_path strings."""
    logo = Image.open(LOGO_PATH).convert("RGBA")
    norm = [(x, "") if isinstance(x, str) else x for x in items]
    pages = [_make_page(p, c, subtitle, logo) for p, c in norm]
    pages[0].save(out_path, save_all=True, append_images=pages[1:], resolution=float(DPI))
    return out_path, len(pages), pages[0].size


if __name__ == "__main__":
    import sys, json
    # driver: python images_to_pdf.py manifest.json out.pdf "subtitle"
    manifest = json.load(open(sys.argv[1]))
    out, n, size = build_pdf(manifest, sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "")
    print(f"saved {n}-page PDF -> {out} ({size[0]}x{size[1]}px @ {DPI}dpi)")
