# -*- coding: utf-8 -*-
"""Build the 6-page 电商视觉 小册子 (A4 portrait) — sibling of curify_merch.pdf.

Design DNA is lifted from ~/curify-gallery/client_VC_portfolio/curify_merch.pdf
(the merch/IP booklet): cream base, deep-navy header blocks and side panels with
vertical Chinese text, gold hairlines and numerals, big 黑体 Chinese headings with
a letterspaced English subtitle underneath. Colours were sampled from that PDF
(navy #08144E, cream #F8F4EC / #F7F3DE, gold #C9A24C).

Positioning note — this booklet is NOT a translation of the merch one. The merch
booklet sells 情绪价值 (emotional premium, IP-led). E-commerce operators are paid
on a different number: 点击率 and 转化率, under an 上新 cadence a photoshoot cannot
match. So the spine here is:
    一张产品图 → 全渠道成套上架素材，当天出稿。

Imagery is extracted from the existing portfolios in client_VC_portfolio/ plus a
frame from ecommerce_workflow/sneakers_viral_en.mp4. Contact QR codes are cropped
from page 6 of curify_merch.pdf so the contact info matches the merch booklet.

⚠️ QR EXTRACTION — the first build (2026-08-12) cropped the QR codes too tightly and
shipped codes that DID NOT SCAN. A QR needs its quiet zone (≥4 modules of blank
margin) intact, and clipping even one finder pattern kills it. The current assets
were cut with a 14% margin around the detected module block and verified by decoding
them back out of the finished PDF:
    website QR -> https://www.curify-ai.com/zh/use-cases/for-merch-operators
The WeChat code will not decode with OpenCV — it carries a centre logo overlay that
standard decoders choke on and WeChat's own scanner recovers via error correction.
Verify that one by eye (three finder patterns + clear margin) or with a phone.
Re-verify both after ANY change to page 6 geometry or output resolution.

NOTE: that website QR points at the MERCH persona page — it was copied verbatim from
the merch booklet on the "same contact info" instruction. It is very likely the wrong
destination for an e-commerce prospect. Regenerate it if a better landing page exists.

Usage:
    python3 scripts/oneoff_ecommerce_booklet_pdf_2026-08-12.py [--assets DIR] [--out FILE]

`--assets` must contain the pre-cropped source images (see `prepare_assets.sh`
alongside this file, or regenerate with the crop block in the session notes).
"""
import argparse
import os
from PIL import Image, ImageDraw, ImageFont

# ── canvas ────────────────────────────────────────────────────────────────
# Layout is authored in LOGICAL units (1240×1754 = A4 @150dpi, matching the sibling
# portfolios) and rendered onto an S× canvas. Everything below — coordinates, font
# sizes, box geometry — stays in logical units; ScaledDraw does the multiplication.
#
# S was 1 until 2026-08-13. At 150 dpi the rasterised CJK strokes were visibly soft
# and broke up at print size / on zoom (the whole page is one flat image in the PDF,
# so there is no vector text to fall back on). S=2 puts the page at 300 dpi, which
# is the floor for print-quality type.
W, H = 1240, 1754
S = 2
PAGE_DPI = 150 * S

# ── palette (sampled from curify_merch.pdf) ───────────────────────────────
NAVY      = (8, 20, 78)
NAVY_DEEP = (5, 16, 74)
NAVY_SOFT = (28, 44, 112)
CREAM     = (248, 244, 236)
CREAM_W   = (255, 251, 247)
CREAM_Y   = (247, 243, 222)
GOLD      = (201, 162, 76)
GOLD_LT   = (219, 190, 126)
INK       = (28, 30, 42)
MUTED     = (104, 104, 116)
PURPLE    = (75, 63, 160)
WHITE     = (255, 255, 255)

# ── fonts ─────────────────────────────────────────────────────────────────
# Hiragino Sans GB, not STHeiti (used until 2026-08-13). Two reasons:
#   1. STHeiti has only Light and Medium. Light is too thin to hold up as body copy
#      at 20-24px; Medium as the only alternative made everything shout. Hiragino
#      GB has W3 (a true regular) and W6 (bold), which is the pairing this layout
#      wants.
#   2. STHeiti .ttc index 0 is Heiti **TC** — traditional forms. The default index=0
#      meant simplified copy was being set in a traditional face. Hiragino Sans GB
#      is a Simplified (国标) face throughout.
F_CJK = "/System/Library/Fonts/Hiragino Sans GB.ttc"
CJK_W6 = 2   # bold      — headings, labels, numerals
CJK_W3 = 0   # regular   — body copy
F_EN    = "/System/Library/Fonts/Avenir Next.ttc"
F_EN_B  = "/System/Library/Fonts/Avenir Next.ttc"

_cache = {}


def font(path, size, index=0):
    """Fonts are built at S× so glyphs are rendered at the real device resolution."""
    key = (path, size, index)
    if key not in _cache:
        try:
            _cache[key] = ImageFont.truetype(path, int(round(size * S)), index=index)
        except Exception:
            _cache[key] = ImageFont.load_default()
    return _cache[key]


def cjk_b(sz):  return font(F_CJK, sz, index=CJK_W6)
def cjk_l(sz):  return font(F_CJK, sz, index=CJK_W3)
def en_b(sz):   return font(F_EN_B, sz, index=1)   # Demi
def en_r(sz):   return font(F_EN, sz, index=0)


# ── scaling layer ─────────────────────────────────────────────────────────
class ScaledDraw:
    """ImageDraw proxy mapping logical coords onto the S× canvas.

    Exists so the whole layout below can stay written in the 1240×1754 units it was
    designed in while actually rendering at S×. Only the primitives know about S:
    coordinates are multiplied on the way in, and textlength is divided on the way
    out so the wrapping maths keeps working in logical units.
    """

    def __init__(self, draw):
        self._d = draw

    @staticmethod
    def _p(v):
        if isinstance(v, (int, float)):
            return v * S
        return tuple(c * S for c in v)

    def text(self, xy, s, font=None, fill=None, anchor=None, **kw):
        self._d.text(self._p(xy), s, font=font, fill=fill, anchor=anchor, **kw)

    def textlength(self, s, font=None):
        # back to logical units — callers compare this against logical widths
        return self._d.textlength(s, font=font) / S

    def rectangle(self, box, fill=None, outline=None, width=1):
        self._d.rectangle(self._p(box), fill=fill, outline=outline, width=max(1, int(width * S)))

    def rounded_rectangle(self, box, radius=0, fill=None, outline=None, width=1):
        self._d.rounded_rectangle(self._p(box), radius=radius * S, fill=fill,
                                  outline=outline, width=max(1, int(width * S)))

    def ellipse(self, box, fill=None, outline=None, width=1):
        self._d.ellipse(self._p(box), fill=fill, outline=outline, width=max(1, int(width * S)))

    def line(self, box, fill=None, width=1):
        self._d.line(self._p(box), fill=fill, width=max(1, int(width * S)))


def new_page(bg):
    """An S× page plus a logical-unit drawing surface for it."""
    page = Image.new("RGB", (W * S, H * S), bg)
    return page, ScaledDraw(ImageDraw.Draw(page))


def paste(page, im, xy):
    """Paste at a LOGICAL coordinate (the image itself must already be S×-sized)."""
    page.paste(im, (int(xy[0] * S), int(xy[1] * S)))


# ── primitives ────────────────────────────────────────────────────────────
def text(d, xy, s, f, fill, anchor="la", spacing=0):
    """Draw text; `spacing` adds uniform letter-spacing (per-char draw)."""
    if not spacing:
        d.text(xy, s, font=f, fill=fill, anchor=anchor)
        return
    x, y = xy
    total = sum(d.textlength(ch, font=f) + spacing for ch in s) - spacing
    if anchor[0] == "m":
        x -= total / 2
    elif anchor[0] == "r":
        x -= total
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill, anchor="l" + anchor[1])
        x += d.textlength(ch, font=f) + spacing


# 禁则处理 — characters that may never START a line (closing punctuation), and
# characters that may never END one (opening brackets). Without this the greedy
# wrapper strands a lone 。 or ， at the head of a line, which reads as broken
# Chinese typesetting to exactly the buyers this booklet is for.
NO_LINE_START = "。，、；：？！）】》」』”’%…·"
NO_LINE_END = "（【《「『“‘"
_LATIN = set("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")


def wrap_cjk(d, s, f, max_w):
    """Greedy wrap for CJK / mixed text, with 禁则处理 and no mid-word latin breaks."""
    lines, cur = [], ""
    i, n = 0, len(s)
    while i < n:
        ch = s[i]
        if ch == "\n":
            lines.append(cur); cur = ""; i += 1; continue

        # keep a run of latin/digits together so "banner" never splits as "banne r"
        if ch in _LATIN:
            j = i
            while j < n and s[j] in _LATIN:
                j += 1
            tok = s[i:j]
        else:
            tok = ch
            j = i + 1

        if d.textlength(cur + tok, font=f) <= max_w or not cur:
            cur += tok
            i = j
            continue

        # would overflow -> break, but never leave closing punctuation orphaned
        if tok and tok[0] in NO_LINE_START and cur:
            cur += tok          # let this line run slightly long rather than orphan 。
            i = j
            lines.append(cur); cur = ""
            continue
        while cur and cur[-1] in NO_LINE_END:
            tok = cur[-1] + tok
            cur = cur[:-1]
        lines.append(cur)
        cur = tok
        i = j
    if cur:
        lines.append(cur)
    return lines


def para(d, xy, s, f, fill, max_w, lh):
    x, y = xy
    for ln in wrap_cjk(d, s, f, max_w):
        d.text((x, y), ln, font=f, fill=fill)
        y += lh
    return y


def vtext(d, xy, s, f, fill, lh=None, spacing=0):
    """Vertical Chinese text, top-down — the side-panel device from the merch deck."""
    x, y = xy
    lh = lh or (f.size + spacing)
    for ch in s:
        d.text((x, y), ch, font=f, fill=fill, anchor="ma")
        y += lh
    return y


def rounded(d, box, r, fill=None, outline=None, width=1):
    d.rounded_rectangle(box, radius=r, fill=fill, outline=outline, width=width)


def fit_cover(im, w, h):
    """Center-crop to exactly w×h."""
    src_r, dst_r = im.width / im.height, w / h
    if src_r > dst_r:
        nw = int(im.height * dst_r)
        im = im.crop(((im.width - nw) // 2, 0, (im.width + nw) // 2, im.height))
    else:
        nh = int(im.width / dst_r)
        im = im.crop((0, (im.height - nh) // 2, im.width, (im.height + nh) // 2))
    return im.resize((w, h), Image.LANCZOS)


def paste_card(page, path, box, radius=10, border=None):
    """Paste an image center-cropped into a LOGICAL box, with rounded corners.

    The source is resampled straight to device pixels (box × S) so photography keeps
    the full resolution the higher-DPI page can carry.
    """
    x0, y0, x1, y1 = (int(v * S) for v in box)
    w, h = x1 - x0, y1 - y0
    im = fit_cover(Image.open(path).convert("RGB"), w, h)
    r = int(radius * S)
    mask = Image.new("L", (w, h), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    page.paste(im, (x0, y0), mask)
    if border:
        ImageDraw.Draw(page).rounded_rectangle(
            (x0, y0, x1, y1), radius=r, outline=border, width=2 * S
        )


def logo(page, xy, height=42, dark=True):
    """Logo + wordmark at a LOGICAL position; `height` is the logical mark height."""
    p = os.path.join(os.path.dirname(__file__), "..", "public", "curify_logo_1024.png")
    if not os.path.exists(p):
        return
    im = Image.open(p).convert("RGBA")
    dev_h = int(height * S)
    dev_w = int(im.width * dev_h / im.height)
    im = im.resize((dev_w, dev_h), Image.LANCZOS)
    page.paste(im, (int(xy[0] * S), int(xy[1] * S)), im)
    d = ScaledDraw(ImageDraw.Draw(page))
    d.text((xy[0] + dev_w / S + 12, xy[1] + height / 2), "Curify",
           font=en_b(int(height * 0.82)), fill=WHITE if not dark else NAVY, anchor="lm")


def header_block(page, cn, en, kicker=None, h=180):
    """Navy banner with gold kicker + cream CN title + letterspaced EN — merch deck device."""
    d = ScaledDraw(ImageDraw.Draw(page))
    d.rectangle((0, 0, W, h), fill=NAVY)
    # gold sweep at the bottom edge
    d.rectangle((0, h - 5, W, h), fill=GOLD)
    y = 44
    if kicker:
        text(d, (78, y), kicker, en_b(19), GOLD_LT, spacing=3)
        y += 30
    d.text((78, y), cn, font=cjk_b(52), fill=CREAM_W)
    text(d, (80, y + 70), en, en_r(21), GOLD_LT, spacing=6)
    return h


def side_panel(page, cn_vertical, x=1055, y0=210, y1=1600, width=125, note=None):
    """Right-hand navy panel with vertical Chinese — the merch deck's signature."""
    d = ScaledDraw(ImageDraw.Draw(page))
    d.rectangle((x, y0, x + width, y1), fill=NAVY)
    d.rectangle((x, y0, x + width, y0 + 4), fill=GOLD)
    cx = x + width // 2
    vtext(d, (cx, y0 + 60), cn_vertical, cjk_b(38), CREAM_W, lh=52)
    if note:
        yy = y1 - 40 - 26 * len(note)
        d.line((cx - 22, yy - 26, cx + 22, yy - 26), fill=GOLD, width=2)
        for ln in note:
            d.text((cx, yy), ln, font=cjk_l(19), fill=GOLD_LT, anchor="ma")
            yy += 26


def footer(page, dark=False, page_no=None):
    d = ScaledDraw(ImageDraw.Draw(page))
    y = H - 96
    if page_no:
        d.text((W - 78, y + 22), page_no, font=en_r(20),
               fill=GOLD if dark else MUTED, anchor="rm")
    logo(page, (72, y), height=40, dark=not dark)


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 1 — COVER
# ══════════════════════════════════════════════════════════════════════════
def page_cover(A, cfg):
    page, d = new_page(CREAM_W)

    # soft cream field with a faint navy corner wash
    d.rectangle((0, 0, W, 96), fill=NAVY)
    d.rectangle((0, 96, W, 101), fill=GOLD)

    y = 235
    text(d, (W // 2, y), "AI E-COMMERCE VISUAL STUDIO", en_b(21), GOLD, anchor="ma", spacing=7)

    y += 62
    d.text((W // 2, y), cfg["slogan_cn"], font=cjk_b(78), fill=NAVY, anchor="ma")
    y += 108
    d.text((W // 2, y), cfg["sub_cn"], font=cjk_l(38), fill=NAVY_SOFT, anchor="ma")

    y += 76
    d.line((W // 2 - 90, y, W // 2 + 90, y), fill=GOLD, width=2)
    y += 30
    text(d, (W // 2, y), cfg["slogan_en"], en_r(23), MUTED, anchor="ma", spacing=4)

    # hero strip — three pieces of real work
    top = 640
    gap = 22
    cw = (W - 150 - gap * 2) // 3
    ch = 470
    x = 75
    for p in cfg["cover_images"]:
        paste_card(page, os.path.join(A, p), (x, top, x + cw, top + ch), radius=14)
        x += cw + gap

    # three proof chips under the strip
    y = top + ch + 54
    chips = cfg["cover_chips"]
    cwid = (W - 150 - 2 * 20) // 3
    x = 75
    for cn, en in chips:
        rounded(d, (x, y, x + cwid, y + 96), 12, fill=CREAM_Y, outline=(228, 222, 202))
        d.text((x + cwid // 2, y + 32), cn, font=cjk_b(28), fill=NAVY, anchor="ma")
        d.text((x + cwid // 2, y + 68), en, font=en_r(16), fill=MUTED, anchor="ma")
        x += cwid + 20

    # closing line
    d.text((W // 2, y + 150), cfg["cover_line"], font=cjk_l(27), fill=NAVY_SOFT, anchor="ma")

    logo(page, (75, H - 130), height=48, dark=True)
    text(d, (W - 75, H - 106), "curify-ai.com", en_r(20), MUTED, anchor="ra", spacing=2)
    return page


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 2 — 行业洞察 INSIGHT
# ══════════════════════════════════════════════════════════════════════════
def page_insight(A, cfg):
    page, d = new_page(CREAM_Y)

    # left navy panel with vertical title
    pw = 300
    d.rectangle((0, 0, pw, H), fill=NAVY)
    d.rectangle((pw - 5, 0, pw, H), fill=GOLD)
    rounded(d, (48, 60, pw - 48, 190), 6, fill=NAVY_SOFT)
    d.text(((48 + pw - 48) // 2, 96), "行业洞察", font=cjk_b(44), fill=CREAM_W, anchor="ma")
    text(d, ((48 + pw - 48) // 2, 152), "— INSIGHT —", en_b(17), GOLD_LT, anchor="ma", spacing=3)
    vtext(d, (pw // 2, 300), cfg["insight_vertical"], cjk_b(46), CREAM_W, lh=64)

    # right content
    x = pw + 70
    maxw = W - x - 70
    y = 96
    for ln in wrap_cjk(d, cfg["insight_title"], cjk_b(42), maxw):
        d.text((x, y), ln, font=cjk_b(42), fill=NAVY)
        y += 58

    y += 26
    y = para(d, (x, y), cfg["insight_lead"], cjk_l(24), INK, maxw, 40)

    y += 44
    for i, (h1, body) in enumerate(cfg["insight_points"], 1):
        d.ellipse((x, y, x + 34, y + 34), fill=NAVY)
        d.text((x + 17, y + 17), str(i), font=en_b(20), fill=CREAM_W, anchor="mm")
        d.text((x + 50, y - 2), h1, font=cjk_b(29), fill=NAVY, anchor="la")
        yy = para(d, (x + 50, y + 46), body, cjk_l(22), (46, 48, 60), maxw - 50, 36)
        y = yy + 22
        if i < len(cfg["insight_points"]):
            for dx in range(x, x + maxw - 40, 12):
                d.line((dx, y, dx + 6, y), fill=(216, 208, 184), width=1)
            y += 30

    # pain-point block — height measured from the wrapped EN lines so the last
    # item can never spill below the panel
    y += 6
    f_en = cjk_l(18)
    en_lines = [wrap_cjk(d, p_en, f_en, maxw - 80) for _, p_en in cfg["insight_pains"]]
    box_h = 74 + sum(34 + 26 * len(ls) + 14 for ls in en_lines)
    rounded(d, (x, y, x + maxw, y + box_h), 10, fill=(252, 249, 238), outline=(226, 216, 188))
    d.text((x + 26, y + 22), "行业痛点", font=cjk_b(26), fill=GOLD)
    yy = y + 70
    for (p_cn, _), ls in zip(cfg["insight_pains"], en_lines):
        d.ellipse((x + 28, yy + 9, x + 40, yy + 21), fill=NAVY)
        d.text((x + 54, yy), p_cn, font=cjk_b(22), fill=NAVY)
        ey = yy + 32
        for ln in ls:
            d.text((x + 54, ey), ln, font=f_en, fill=(96, 94, 90))
            ey += 26
        yy = ey + 14
    y += box_h + 44

    # bottom proof ladder — one input, five outputs. Fills the page and *shows*
    # the claim the three points above only assert.
    d.text((x, y), cfg["ladder_title"], font=cjk_b(28), fill=NAVY)
    y += 52
    steps = cfg["ladder"]
    gapx = 12
    sw = (maxw - gapx * (len(steps) - 1)) // len(steps)
    for i, (cn, en) in enumerate(steps):
        sx = x + i * (sw + gapx)
        fill = NAVY if i == 0 else CREAM_W
        rounded(d, (sx, y, sx + sw, y + 92), 8, fill=fill, outline=(226, 216, 188))
        d.text((sx + sw // 2, y + 28), cn, font=cjk_b(20),
               fill=CREAM_W if i == 0 else NAVY, anchor="ma")
        d.text((sx + sw // 2, y + 58), en, font=en_r(13),
               fill=GOLD_LT if i == 0 else MUTED, anchor="ma")
        if i < len(steps) - 1:
            d.text((sx + sw + gapx // 2, y + 46), "›", font=en_b(24), fill=GOLD, anchor="mm")

    footer(page, dark=False, page_no="02")
    return page


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 3 — 我们的解决方案 SOLUTIONS
# ══════════════════════════════════════════════════════════════════════════
def page_solutions(A, cfg):
    page, d = new_page(CREAM_Y)
    header_block(page, "我们的解决方案", "SOLUTIONS", h=180)
    side_panel(page, cfg["sol_vertical"], x=1055, y0=210, y1=1520, width=125,
               note=["成套交付", "当天出稿", "全渠道适配"])

    x, maxw = 78, 1055 - 78 - 56
    y = 232
    d.text((x, y), cfg["sol_title"], font=cjk_b(46), fill=NAVY)
    text(d, (x + 2, y + 62), cfg["sol_title_en"], en_r(23), GOLD, spacing=5)

    y += 122
    y = para(d, (x, y), cfg["sol_lead"], cjk_l(23), INK, maxw, 38)

    y += 46
    for i, (num, h1, body) in enumerate(cfg["sol_items"], 1):
        rounded(d, (x, y, x + maxw, y + 196), 12, fill=CREAM_W, outline=(230, 222, 200))
        d.text((x + 34, y + 34), num, font=en_b(46), fill=GOLD)
        d.line((x + 116, y + 34, x + 116, y + 92), fill=(220, 212, 190), width=2)
        d.text((x + 142, y + 30), h1, font=cjk_b(31), fill=NAVY)
        para(d, (x + 142, y + 84), body, cjk_l(22), (46, 48, 60), maxw - 190, 36)
        y += 220

    # delivery workflow — fills the gap above the bottom bar and answers the
    # first question every operator asks: "what do I actually have to give you?"
    wy = H - 190 - 150
    d.text((x, wy - 46), cfg["flow_title"], font=cjk_b(26), fill=NAVY)
    steps = cfg["flow"]
    gapx = 14
    sw = (maxw - gapx * (len(steps) - 1)) // len(steps)
    for i, (cn, en) in enumerate(steps):
        sx = x + i * (sw + gapx)
        rounded(d, (sx, wy, sx + sw, wy + 96), 8,
                fill=NAVY if i == 0 else CREAM_W, outline=(226, 216, 188))
        d.text((sx + sw // 2, wy + 28), cn, font=cjk_b(21),
               fill=CREAM_W if i == 0 else NAVY, anchor="ma")
        d.text((sx + sw // 2, wy + 60), en, font=en_r(14),
               fill=GOLD_LT if i == 0 else MUTED, anchor="ma")
        if i < len(steps) - 1:
            d.text((sx + sw + gapx // 2, wy + 48), "›", font=en_b(26), fill=GOLD, anchor="mm")

    # bottom navy bar with four capability labels
    by = H - 190
    d.rectangle((0, by, W, H), fill=NAVY)
    d.rectangle((0, by, W, by + 5), fill=GOLD)
    n = len(cfg["sol_chips"])
    seg = (W - 300) // n
    for i, (cn, en) in enumerate(cfg["sol_chips"]):
        cx = 70 + seg * i + seg // 2
        d.text((cx, by + 52), cn, font=cjk_b(23), fill=CREAM_W, anchor="ma")
        d.text((cx, by + 88), en, font=en_r(15), fill=GOLD_LT, anchor="ma")
        if i < n - 1:
            d.line((70 + seg * (i + 1), by + 48, 70 + seg * (i + 1), by + 108),
                   fill=NAVY_SOFT, width=2)
    logo(page, (W - 250, by + 60), height=46, dark=False)
    return page


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 4 — 精选案例 CASES
# ══════════════════════════════════════════════════════════════════════════
def page_cases(A, cfg):
    page, d = new_page(CREAM_W)
    header_block(page, "精选案例与应用场景", "CASES", h=180)

    # left purple-navy accent strip with vertical text
    d.rectangle((0, 180, 92, H - 120), fill=NAVY)
    vtext(d, (46, 300), cfg["cases_vertical"], cjk_b(34), CREAM_W, lh=46)

    x0, maxw = 132, W - 132 - 70
    y = 224
    for idx, case in enumerate(cfg["cases"], 1):
        # case label
        rounded(d, (x0, y, x0 + 62, y + 40), 6, fill=NAVY)
        d.text((x0 + 31, y + 20), f"0{idx}", font=en_b(24), fill=GOLD_LT, anchor="mm")
        d.text((x0 + 80, y + 20), case["title"], font=cjk_b(29), fill=NAVY, anchor="lm")
        y += 58

        # image row
        imgs = case["images"]
        gap = 14
        cw = (maxw - gap * (len(imgs) - 1)) // len(imgs)
        chh = case.get("h", 250)
        xx = x0
        for p in imgs:
            paste_card(page, os.path.join(A, p), (xx, y, xx + cw, y + chh), radius=10)
            xx += cw + gap
        y += chh + 16

        # 项目解析
        rounded(d, (x0, y, x0 + maxw, y + case.get("bh", 132)), 10,
                fill=CREAM_Y, outline=(230, 222, 200))
        d.text((x0 + 24, y + 20), "项目解析", font=cjk_b(22), fill=GOLD)
        para(d, (x0 + 24, y + 58), case["body"], cjk_l(21), (46, 48, 60), maxw - 48, 33)
        y += case.get("bh", 132) + 34

    footer(page, dark=False, page_no="04")
    return page


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 5 — 合作模式 PARTNERSHIP
# ══════════════════════════════════════════════════════════════════════════
def page_partnership(A, cfg):
    page, d = new_page(CREAM_W)
    header_block(page, "灵活的合作与交付模式", "PARTNERSHIP", h=180)
    side_panel(page, cfg["part_vertical"], x=1055, y0=210, y1=1420, width=125)

    x, maxw = 78, 1055 - 78 - 56
    y = 236
    y = para(d, (x, y), cfg["part_lead"], cjk_l(24), INK, maxw, 40)
    y += 40

    accents = [NAVY, PURPLE, GOLD]
    for i, item in enumerate(cfg["part_items"]):
        bh = 250
        rounded(d, (x, y, x + maxw, y + bh), 12, fill=CREAM_Y, outline=(230, 222, 200))
        d.rectangle((x, y + 10, x + 7, y + bh - 10), fill=accents[i % 3])
        d.text((x + 36, y + 26), f"{i+1}.", font=en_b(50), fill=accents[i % 3])
        d.text((x + 116, y + 34), item["name"], font=cjk_b(31), fill=NAVY)
        d.text((x + 116, y + 80), item["tag"], font=cjk_l(21), fill=MUTED)

        yy = y + 122
        for lbl, val in item["rows"]:
            d.text((x + 116, yy), lbl, font=cjk_b(21), fill=accents[i % 3])
            para(d, (x + 186, yy), val, cjk_l(21), (46, 48, 60), maxw - 230, 32)
            yy += 58
        y += bh + 26

    footer(page, dark=False, page_no="05")
    return page


# ══════════════════════════════════════════════════════════════════════════
#  PAGE 6 — 联系我们
# ══════════════════════════════════════════════════════════════════════════
def page_contact(A, cfg):
    page, d = new_page(CREAM_W)
    d.rectangle((0, 0, W, 96), fill=NAVY)
    d.rectangle((0, 96, W, 101), fill=GOLD)

    y = 300
    d.text((110, y), "联系我们", font=cjk_b(76), fill=NAVY)
    y += 118
    d.line((112, y, 112 + 150, y), fill=GOLD, width=2)
    y += 28
    text(d, (110, y), "GET IN TOUCH", en_r(26), MUTED, spacing=8)

    y += 150
    for ln in cfg["contact_lines"]:
        d.text((110, y), ln, font=cjk_b(34), fill=NAVY_SOFT)
        y += 56
    y += 20
    d.line((112, y, 112 + 110, y), fill=GOLD, width=2)
    y += 26
    text(d, (110, y), cfg["contact_en"], en_r(20), MUTED, spacing=3)

    # QR codes
    qy = H - 470
    qs = 210
    for i, (p, cn, en) in enumerate(cfg["contact_qr"]):
        qx = W - 110 - (len(cfg["contact_qr"]) - i) * (qs + 40) + 40
        im = Image.open(os.path.join(A, p)).convert("RGB").resize(
            (qs * S, qs * S), Image.LANCZOS
        )
        paste(page, im, (qx, qy))
        d.rectangle((qx - 1, qy - 1, qx + qs, qy + qs), outline=(226, 220, 206), width=1)
        d.text((qx + qs // 2, qy + qs + 18), cn, font=cjk_b(22), fill=NAVY, anchor="ma")
        d.text((qx + qs // 2, qy + qs + 48), en, font=en_r(16), fill=MUTED, anchor="ma")

    # oversized, very faint wordmark — the merch booklet uses a mascot watermark
    # here; we have no ecommerce mascot, so the mark carries the same job.
    mark = os.path.join(os.path.dirname(__file__), "..", "public", "curify_logo_1024.png")
    if os.path.exists(mark):
        m = Image.open(mark).convert("RGBA")
        side = 560
        m = m.resize((side * S, int(m.height * side * S / m.width)), Image.LANCZOS)
        alpha = m.split()[3].point(lambda v: int(v * 0.07))
        m.putalpha(alpha)
        page.paste(m, ((W - side - 60) * S, int(H * 0.30 * S)), m)

    logo(page, (110, H - 210), height=58, dark=True)
    text(d, (110, H - 128), "curify-ai.com", en_r(21), MUTED, spacing=2)
    return page


# ══════════════════════════════════════════════════════════════════════════
CONFIG = {
    # ── COVER ────────────────────────────────────────────────────────────
    "slogan_cn": "一张产品图，撑起全渠道上新",
    "sub_cn": "您的敏捷电商视觉引擎",
    "slogan_en": "ONE PRODUCT PHOTO. EVERY CHANNEL.",
    "cover_images": ["sneaker_main.png", "listing_00.png", "promo_L0.png"],
    "cover_chips": [
        ("主图 · 详情页", "Main image & detail page"),
        ("场景图 · 模特图", "Scene & model shots"),
        ("大促 · 快闪主视觉", "Campaign & pop-up KV"),
    ],
    "cover_line": "不用拍摄 · 当天出稿 · 中英双语 · 平台合规尺寸",

    # ── INSIGHT ──────────────────────────────────────────────────────────
    "insight_vertical": "主图决定点击详情页决定转化",
    "insight_title": "上新越来越快，\n拍摄却越来越慢",
    "insight_lead": "电商的竞争已经从「有没有货」转向「谁的图先被点开」。"
                    "主图决定点击率，详情页决定转化率，而这两件事的产能，"
                    "长期被拍摄周期和设计排期卡住。",
    "insight_points": [
        ("点击率之战", "同一件商品，主图差一版，点击率可以差出数倍。"
                    "平台流量按点击分配，主图不是美术问题，是流量问题。"),
        ("上新节奏 vs 拍摄周期", "一次商业拍摄从约档到出图通常 3–7 天、单 SKU 成本数百至数千元；"
                            "而店铺的上新节奏是每周、甚至每天。产能天然对不上。"),
        ("一款商品，多套素材", "主图六宫格、详情页长图、场景图、短视频、多语言版本——"
                          "同一件商品要重复生产 5–10 套素材，人力被无限稀释。"),
    ],
    "insight_pains": [
        ("拍摄成本高、周期长", "Shoots are slow and expensive — and they don't scale with your launch cadence"),
        ("多渠道 / 多语言重复劳动", "Every channel and language means re-doing the same asset set"),
        ("AI 直出的图往往不能直接用", "Raw AI output: off colour, warped CJK type, product fidelity drift"),
    ],

    "ladder_title": "一张产品图，展开成一整套上架素材",
    "ladder": [
        ("一张产品图", "One photo"),
        ("主图六宫格", "Six-grid main"),
        ("详情页长图", "Detail page"),
        ("场景 / 模特图", "Scene & model"),
        ("9:16 短视频", "Short video"),
    ],

    # ── SOLUTIONS ────────────────────────────────────────────────────────
    "sol_vertical": "成套上架素材",
    "sol_title": "您的敏捷电商视觉引擎",
    "sol_title_en": "Agile E-commerce Visual Engine",
    "sol_lead": "给我们一张产品图，或者一句需求描述。我们交付的不是几张图，"
                "而是一整套可以直接上架的素材——并且保证商品本体保真、"
                "色调统一、中英文字不变形、尺寸符合平台规范。",
    "sol_items": [
        ("01", "一图成套：从单张产品图到全渠道素材",
         "主图六宫格 + 详情页长图 + 场景图 / 模特图 + 9:16 短视频，一次生成、风格统一。"
         "同一套视觉语言横跨 Amazon / 天猫 / 独立站 / 社媒，不再各做各的。"),
        ("02", "商业级可用：解决 AI 出图「最后一公里」",
         "商品本体保真不漂移、色调可控可复现、中英双语排版不扭曲、"
         "分辨率与留白符合平台规范——直接上架，而不是回 PS 再修一轮。"),
        ("03", "上新速度即竞争力：当天出稿、低成本试款",
         "常规批次当天出稿。以极低成本批量试款、测款，用真实点击数据决定哪一款值得投产，"
         "把试错成本从「一场拍摄」降到「一次生成」。"),
    ],
    "flow_title": "交付流程",
    "flow": [
        ("一张产品图 / 一句需求", "Photo or brief"),
        ("风格方向确认", "Direction"),
        ("成套出图", "Full asset set"),
        ("上架 / 投放", "Live"),
    ],
    "sol_chips": [
        ("商品保真", "Product fidelity"),
        ("色调可控", "Consistent colour"),
        ("双语排版", "Bilingual type"),
        ("平台合规", "Platform-ready"),
    ],

    # ── CASES ────────────────────────────────────────────────────────────
    "cases_vertical": "真实交付",
    "cases": [
        {
            "title": "案例一：运动鞋 — 主图 / 详情页 / 短视频",
            "images": ["sneaker_main.png", "sneaker_b.png", "sneaker_c.png", "sneaker_d.png"],
            "h": 236,
            "body": "以一双实拍运动鞋为输入，输出四种电商风格的主图（纯净背景、极简棚拍、"
                    "生活场景、氛围光影），并延展为详情页长图与 9:16 短视频。"
                    "同一双鞋、同一套配色逻辑，覆盖从主图到社媒的全链路，无需重新拍摄。",
            "bh": 140,
        },
        {
            "title": "案例二：大促与活动快闪 — 主视觉 KV",
            "images": ["promo_L0.png", "promo_R0.png", "promo_R1.png"],
            "h": 200,
            "body": "面向节日大促与活动快闪场景的主视觉：平面与 3D 场景均可，"
                    "含中英双语排版、系列延展（主图 / banner / 长图）。"
                    "从一句 brief 到整套上线可用的活动视觉，时效性强的节点也来得及。",
            "bh": 116,
        },
        {
            "title": "案例三：家纺与饮品 — 场景摄影级视觉",
            "images": ["textile_00.png", "textile_11.png", "bev_01.png", "bev_10.png"],
            "h": 190,
            "body": "白棚家纺主图（防水演示 / 面料纹理 / 卧室成品）与自然光饮品场景图，"
                    "统一色调、统一光位，成系列产出——解决同一类目下多 SKU 视觉不统一的问题。",
            "bh": 108,
        },
    ],

    # ── PARTNERSHIP ──────────────────────────────────────────────────────
    "part_vertical": "按节奏合作",
    "part_lead": "为了匹配不同规模商家的上新节奏，我们提供三种合作方式：",
    "part_items": [
        {
            "name": "单品试做包", "tag": "按 SKU 计费 · 适合先验证效果",
            "rows": [("模式：", "挑 1–3 个 SKU，交付完整一套上架素材（主图 + 详情页 + 场景图）。"),
                     ("优势：", "成本低、周期短，用真实上架数据判断是否值得铺开。")],
        },
        {
            "name": "店铺上新包", "tag": "按月 / 按批量 · 适合稳定上新的店铺",
            "rows": [("模式：", "按月承接上新批次，统一风格库与色调规范，全渠道成套交付。"),
                     ("优势：", "视觉资产沉淀为店铺专属风格库，越用越一致、越用越快。")],
        },
        {
            "name": "API / 供应链深度接入", "tag": "适合平台方、代运营与 SaaS",
            "rows": [("模式：", "以 API 形式接入选品、生成、排版流程，嵌入既有系统。"),
                     ("优势：", "把「出图」变成系统能力，随 SKU 库自动扩张，无需扩编设计团队。")],
        },
    ],

    # ── CONTACT ──────────────────────────────────────────────────────────
    "contact_lines": ["让每一次上新，", "都有一套配得上它的视觉"],
    "contact_en": "Every Launch Deserves Better Visuals",
    "contact_qr": [("qr_web.png", "官网二维码", "Website"),
                   ("qr_wechat.png", "微信二维码", "WeChat")],
}


def main():
    ap = argparse.ArgumentParser()
    here = os.path.dirname(os.path.abspath(__file__))
    ap.add_argument("--assets", default=os.path.join(here, "_ecommerce_booklet_assets"))
    ap.add_argument("--out", default=os.path.join(here, "..", "curify_ecommerce.pdf"))
    a = ap.parse_args()

    A = a.assets
    pages = [
        page_cover(A, CONFIG),
        page_insight(A, CONFIG),
        page_solutions(A, CONFIG),
        page_cases(A, CONFIG),
        page_partnership(A, CONFIG),
        page_contact(A, CONFIG),
    ]
    out = os.path.abspath(a.out)
    # Pillow encodes PDF pages as JPEG at quality=75 by default, which rings around
    # every glyph edge — a real part of why the first build read as soft, on top of
    # the resolution. quality=95 with subsampling=0 (4:4:4) keeps the chroma at full
    # resolution too, which matters here because the type is navy/purple on cream and
    # chroma subsampling smears exactly those coloured edges.
    pages[0].save(out, "PDF", resolution=float(PAGE_DPI), save_all=True,
                  append_images=pages[1:], quality=95, subsampling=0)
    print(f"wrote {out}  ({len(pages)} pages)")


if __name__ == "__main__":
    main()
