#!/usr/bin/env python3
"""text_overlay_no_prompt_engineering.py — non-destructive text overlay for social covers (deterministic, no AI).

Adds a hook line (CJK or Latin) ON TOP of an image WITHOUT altering the source pixels — the
text is composited on a copy, so it is exact, reversible, and safe for watermarked artwork.
This is the deterministic counterpart to scripts/image_text_overlay_agent.cjs (which uses an
LLM + Gemini to bake text INTO the image). Use THIS when the artwork must stay untouched and
you want precise, on-brand typography; use the agent when you want AI-integrated lettering.

Three styles:
  top      — full-width color banner at the top + accent underline (bold 小红书 hook)
  bottom   — dark gradient caption rising from the bottom + accent bar (elegant, art stays visible)
  meme     — film-subtitle style: white text + black stroke, no banner (for 电影截图配字幕 memes;
             --text is the bottom punchline, --subtitle an optional smaller setup line on top)
  sticker  — floating rounded white pill, center-top, colored text + soft shadow (playful)

Usage:
  python scripts/text_overlay_no_prompt_engineering.py <image> --text "不写提示词怎么生成？"                 # all 3 styles + contact sheet
  python scripts/text_overlay_no_prompt_engineering.py <image> --text "..." --style top --out out/
  python scripts/text_overlay_no_prompt_engineering.py <image> --text "..." --subtitle "上传参考图，一键复刻"  # add a second line
  python scripts/text_overlay_no_prompt_engineering.py <image> --text "..." --accent 99,66,204               # custom brand color

Deps: Pillow. CJK font: Hiragino Sans GB (macOS). Output: <out>/<stem>-<style>.jpg (source untouched).
"""
import os, sys, argparse
from PIL import Image, ImageDraw, ImageFont, ImageFilter

HG = "/System/Library/Fonts/Hiragino Sans GB.ttc"        # CJK-capable, has Latin
GOLD = (244, 201, 78); WHITE = (255, 255, 255)

def font(sz):
    try: return ImageFont.truetype(HG, sz, index=1)      # index 1 = bold weight
    except Exception: return ImageFont.truetype(HG, sz)

def text_wh(d, t, ft):
    b = d.textbbox((0, 0), t, font=ft); return b[2]-b[0], b[3]-b[1]

def fit_font(d, text, max_w, hi, lo=28):
    """Largest font size in [lo,hi] whose text width fits max_w."""
    while hi > lo:
        mid = (hi + lo + 1) // 2
        if text_wh(d, text, font(mid))[0] <= max_w: lo = mid
        else: hi = mid - 1
    return lo

def _grad(w, h, top, bot, alpha_top=None, alpha_bot=None):
    """Vertical gradient strip. If alphas given, returns RGBA."""
    rgba = alpha_top is not None
    col = Image.new("RGBA" if rgba else "RGB", (1, h))
    for y in range(h):
        t = y / max(1, h-1)
        c = tuple(int(top[i]*(1-t)+bot[i]*t) for i in range(3))
        if rgba: c = c + (int(alpha_top*(1-t)+alpha_bot*t),)
        col.putpixel((0, y), c)
    return col.resize((w, h))

def render(base, text, style, accent, subtitle=None):
    W, H = base.size
    accent_d = tuple(max(0, int(c*0.6)) for c in accent)     # darker accent for gradients
    im = base.copy().convert("RGBA")
    d = ImageDraw.Draw(im)

    if style == "top":
        fs = fit_font(d, text, int(W*0.90), 108); ft = font(fs)
        tw, th = text_wh(d, text, ft)
        bh = th + (150 if subtitle else 96)
        im.paste(_grad(W, bh, accent, accent_d).convert("RGBA"), (0, 0))
        d = ImageDraw.Draw(im)
        d.text(((W-tw)/2, 34), text, font=ft, fill=WHITE)
        if subtitle:
            sf = font(max(30, fs*4//10)); sw, sh = text_wh(d, subtitle, sf)
            d.text(((W-sw)/2, 34+th+18), subtitle, font=sf, fill=(255, 255, 255, 235))
        d.rectangle([0, bh, W, bh+6], fill=GOLD+(255,))

    elif style == "bottom":
        gh = int(H*0.20)
        im.alpha_composite(_grad(W, gh, (10,10,18), (10,10,18), 0, 235), (0, H-gh))
        d = ImageDraw.Draw(im)
        fs = fit_font(d, text, int(W*0.90), 100); ft = font(fs)
        tw, th = text_wh(d, text, ft)
        bar_y = H - th - (110 if subtitle else 60)
        d.rectangle([(W-90)//2, bar_y-24, (W+90)//2, bar_y-14], fill=GOLD+(255,))
        d.text(((W-tw)/2, bar_y), text, font=ft, fill=WHITE)
        if subtitle:
            sf = font(max(28, fs*38//100)); sw, sh = text_wh(d, subtitle, sf)
            d.text(((W-sw)/2, bar_y+th+14), subtitle, font=sf, fill=(230, 230, 236, 255))

    elif style == "sticker":
        fs = fit_font(d, text, int(W*0.82), 92); ft = font(fs)
        tw, th = text_wh(d, text, ft)
        padx, pady = 60, 40
        pw, ph = tw + 2*padx, th + 2*pady + (46 if subtitle else 0)
        px, py = (W-pw)//2, 64
        sh = Image.new("RGBA", (W, H), (0,0,0,0))
        ImageDraw.Draw(sh).rounded_rectangle([px, py+14, px+pw, py+ph+14], radius=min(ph//2, 70), fill=(30,20,60,120))
        im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(16)))
        d = ImageDraw.Draw(im)
        d.rounded_rectangle([px, py, px+pw, py+ph], radius=min(ph//2, 70), fill=(255,255,255,242), outline=accent+(255,), width=6)
        d.text((px+padx, py+pady-th//4), text, font=ft, fill=accent+(255,))
        if subtitle:
            sf = font(max(26, fs*34//100)); sw, sh2 = text_wh(d, subtitle, sf)
            d.text(((W-sw)/2, py+pady-th//4+th+8), subtitle, font=sf, fill=accent_d+(255,))
    elif style == "meme":
        # Film-still meme: the native format for 电影截图配字幕 — white text with a
        # black stroke, centred, sitting ON the image with no banner or gradient.
        # `text` is the bottom punchline (subtitle-line); `subtitle` is an optional
        # smaller setup line at the top. Deliberately no brand colour: the joke
        # reads as a movie subtitle, and an accent bar would break the illusion.
        stroke = max(3, int(min(W, H) * 0.010))

        # 0.82 not 0.92: a real subtitle keeps side margin. Wall-to-wall text
        # reads as a caption bar, not a subtitle.
        fs = fit_font(d, text, int(W * 0.82), int(H * 0.105), lo=22)
        ft = font(fs)
        tw, th = text_wh(d, text, ft)
        by = H - th - int(H * 0.09)
        d.text(((W - tw) / 2, by), text, font=ft, fill=WHITE,
               stroke_width=stroke, stroke_fill=(0, 0, 0, 255))

        if subtitle:
            sf_size = fit_font(d, subtitle, int(W * 0.70), max(24, int(fs * 0.78)), lo=20)
            sf = font(sf_size)
            sw, sh2 = text_wh(d, subtitle, sf)
            d.text(((W - sw) / 2, int(H * 0.055)), subtitle, font=sf, fill=WHITE,
                   stroke_width=max(2, stroke - 1), stroke_fill=(0, 0, 0, 255))

    else:
        raise SystemExit(f"unknown style: {style}")
    return im.convert("RGB")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("image")
    ap.add_argument("--text", required=True)
    ap.add_argument("--subtitle", default=None)
    ap.add_argument("--style", default="all", choices=["top", "bottom", "sticker", "meme", "all"])
    ap.add_argument("--accent", default="99,66,204", help="R,G,B brand color (default Curify purple)")
    ap.add_argument("--out", default=None, help="output dir (default: alongside source)")
    a = ap.parse_args()
    accent = tuple(int(x) for x in a.accent.split(","))
    base = Image.open(a.image).convert("RGB")
    stem = os.path.splitext(os.path.basename(a.image))[0]
    out = a.out or os.path.dirname(os.path.abspath(a.image)); os.makedirs(out, exist_ok=True)
    styles = ["top", "bottom", "sticker"] if a.style == "all" else [a.style]
    paths = []
    for s in styles:
        im = render(base, a.text, s, accent, a.subtitle)
        p = os.path.join(out, f"{stem}-overlay-{s}.jpg"); im.save(p, quality=92); paths.append(p); print("wrote", p)
    if a.style == "all":
        W, H = base.size; tw = 360; th = int(H*tw/W)
        cs = Image.new("RGB", (tw*3+40, th+20), "white")
        for i, p in enumerate(paths): cs.paste(Image.open(p).resize((tw, th)), (i*(tw+10)+10, 10))
        cp = os.path.join(out, f"{stem}-overlay-contact.jpg"); cs.save(cp, quality=92); print("wrote", cp)

if __name__ == "__main__":
    main()
