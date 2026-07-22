# -*- coding: utf-8 -*-
"""Build the vertical "IP merch design-workflow" showcase video for one IP,
mirroring the capybara / Hello Kitty / Miffy precedent
(curify-gallery/Marketing_media/<ip>_design_workflow.mp4).

Format: 1080x1920, ~13s, panels
  YOUR CHARACTER (source) -> 9 EXPRESSIONS (emotion-grid) -> STICKER PACK
  -> ON MERCH (merch-mockup) -> Curify outro
each panel = blurred cover-fill background + the image contained/centered + Curify
logo (top-left) + a caption pill (bottom) + curify-ai.com watermark, with a gentle
zoom and crossfades, over a music bed.

Usage:
  python scripts/build_ip_merch_video.py <ip-key> <source.png> <emotion.png> \
      <sticker.png> <mockup.png> <music.mp3> <out.mp4>
"""
import os, sys, subprocess, tempfile
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1920
PANEL_SEC = 2.9
XFADE = 0.5
FPS = 30
INDIGO = (91, 63, 214)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOGO = os.path.join(ROOT, "public", "curify_logo_1024.png")


def _font(size, bold=True):
    for p in (["/System/Library/Fonts/Supplemental/Arial Bold.ttf"] if bold else
              ["/System/Library/Fonts/Supplemental/Arial.ttf"]):
        if os.path.exists(p):
            try: return ImageFont.truetype(p, size)
            except Exception: pass
    return ImageFont.load_default()


def _cover(img, w, h):
    s = max(w / img.width, h / img.height)
    im = img.resize((int(img.width * s) + 1, int(img.height * s) + 1), Image.LANCZOS)
    x = (im.width - w) // 2; y = (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def content_panel(img_path, caption, logo):
    im = Image.open(img_path).convert("RGB")
    # blurred cover-fill background, slightly darkened
    bg = _cover(im, W, H).filter(ImageFilter.GaussianBlur(40))
    dark = Image.new("RGB", (W, H), (0, 0, 0))
    bg = Image.blend(bg, dark, 0.28)
    page = bg
    d = ImageDraw.Draw(page)
    # contained image, centered, with a soft white card behind
    box_w, box_h = int(W * 0.9), int(H * 0.62)
    s = min(box_w / im.width, box_h / im.height)
    nw, nh = int(im.width * s), int(im.height * s)
    im2 = im.resize((nw, nh), Image.LANCZOS)
    ix, iy = (W - nw) // 2, (H - nh) // 2
    d.rectangle([ix - 16, iy - 16, ix + nw + 16, iy + nh + 16], fill=(255, 255, 255))
    page.paste(im2, (ix, iy))
    # logo top-left
    lg = logo.resize((104, 104), Image.LANCZOS)
    page.paste(lg, (44, 52), lg)
    # caption pill (bottom third)
    cf = _font(58, bold=True)
    tw = d.textlength(caption, font=cf)
    pill_w, pill_h = int(tw + 72), 104
    px, py = (W - pill_w) // 2, int(H * 0.80)
    d.rounded_rectangle([px, py, px + pill_w, py + pill_h], radius=24, fill=INDIGO)
    d.text((px + 36, py + (pill_h - 58) // 2 - 4), caption, font=cf, fill=(255, 255, 255))
    # watermark
    wf = _font(30, bold=False)
    wm = "curify-ai.com"
    ww = d.textlength(wm, font=wf)
    d.text((W - ww - 40, H - 60), wm, font=wf, fill=(235, 235, 235))
    return page


def outro_panel(logo):
    page = Image.new("RGB", (W, H), (36, 20, 92))
    d = ImageDraw.Draw(page)
    # vertical gradient
    top, bot = (54, 32, 128), (22, 12, 60)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    lg = logo.resize((240, 240), Image.LANCZOS)
    page.paste(lg, ((W - 240) // 2, int(H * 0.30)), lg)
    d.text((W // 2, int(H * 0.30) + 300), "Curify", font=_font(96, bold=True), fill=(255, 255, 255), anchor="ma")
    l1 = _font(56, bold=False)
    for i, line in enumerate(["One character →", "a full merch pack."]):
        d.text((W // 2, int(H * 0.52) + i * 76), line, font=l1, fill=(226, 220, 255), anchor="ma")
    # button pill
    bt = _font(52, bold=True); label = "Upload your IP  ›"
    bw = d.textlength(label, font=bt); pw, ph = int(bw + 96), 120
    bx, by = (W - pw) // 2, int(H * 0.68)
    d.rounded_rectangle([bx, by, bx + pw, by + ph], radius=60, fill=(124, 92, 246))
    d.text((W // 2, by + ph // 2), label, font=bt, fill=(255, 255, 255), anchor="mm")
    wf = _font(30, bold=False)
    d.text((W // 2, H - 60), "curify-ai.com", font=wf, fill=(210, 205, 235), anchor="ma")
    return page


def main():
    ip, src, emo, stk, mock, music, out = sys.argv[1:8]
    logo = Image.open(LOGO).convert("RGBA")
    panels = [
        (src, "YOUR CHARACTER"),
        (emo, "9 EXPRESSIONS"),
        (stk, "STICKER PACK"),
        (mock, "ON MERCH"),
    ]
    tmp = tempfile.mkdtemp(prefix=f"ipvid-{ip}-")
    frame_paths = []
    for i, (p, cap) in enumerate(panels):
        fp = os.path.join(tmp, f"p{i}.png")
        content_panel(p, cap, logo).save(fp)
        frame_paths.append(fp)
    op = os.path.join(tmp, "outro.png")
    outro_panel(logo).save(op)
    frame_paths.append(op)

    n = len(frame_paths)
    # per-panel zoompan clips, then xfade chain, then music.
    d_frames = int(PANEL_SEC * FPS)
    inputs = []
    for fp in frame_paths:
        inputs += ["-loop", "1", "-t", f"{PANEL_SEC}", "-i", fp]
    inputs += ["-i", music]
    # build filter: zoompan each, then sequential xfade
    fc = []
    for i in range(n):
        fc.append(
            f"[{i}:v]scale={W}:{H},zoompan=z='min(zoom+0.0009,1.10)':d={d_frames}:"
            f"x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},setsar=1[v{i}]"
        )
    prev = "v0"
    total = PANEL_SEC
    for i in range(1, n):
        off = total - XFADE
        out_lbl = f"x{i}"
        fc.append(f"[{prev}][v{i}]xfade=transition=fade:duration={XFADE}:offset={off:.3f}[{out_lbl}]")
        prev = out_lbl
        total += PANEL_SEC - XFADE
    vdur = total
    fc.append(f"[{n}:a]afade=t=in:st=0:d=0.6,afade=t=out:st={vdur-1.0:.3f}:d=1.0,atrim=0:{vdur:.3f}[a]")
    filter_complex = ";".join(fc)
    cmd = ["ffmpeg", "-y", *inputs, "-filter_complex", filter_complex,
           "-map", f"[{prev}]", "-map", "[a]", "-c:v", "libx264", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "160k", "-shortest", "-r", str(FPS), out]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    print(f"OK {ip} -> {out}  ({vdur:.1f}s)")


if __name__ == "__main__":
    main()
