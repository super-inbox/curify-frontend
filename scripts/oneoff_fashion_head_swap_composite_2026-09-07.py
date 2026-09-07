"""
Align a re-framed generated head-swap crop back onto the original crop, then
paste the head into the untouched 4000x5328 original.

The generator re-composes the frame, so the transform (uniform scale +
translation) is recovered by normalized-cross-correlation template matching of
two GARMENT landmarks — patches of unchanged content well below the hair —
across a scale sweep. Only the head region is then blended in, feathered, so
the garment, body and background stay exactly as photographed.

usage: python3 oneoff_fashion_head_swap_composite_2026-09-07.py <job> <generated.png> <out.jpg> [--debug]
"""
import sys, json
import numpy as np
from PIL import Image, ImageFilter, ImageDraw

RAW = "/Users/qqwjq/curify-frontend/raw/fashion-change-09-07"

# All boxes are (x0, y0, x1, y1) in 1600x1600 crop-local coordinates.
JOBS = {
    # `head` is a polygon, not a box: it drops low over the jacket and background
    # on either side to swallow the long blonde hair, but lifts to mid-neck in the
    # centre so the seam lands on bare skin instead of crossing the tee neckline.
    "model-1": dict(
        src=f"{RAW}/model-1.jpg", ox=1080, oy=80, size=1600, blur=45,
        head=[(360, 140), (1190, 140), (1190, 1150), (360, 1150)],
        marks=[(950, 1150, 1250, 1500), (420, 1120, 640, 1520)],
        neck_guard=(555, 935, 1015, 1215),
    ),
    "model-2": dict(
        src=f"{RAW}/model-2.jpg", ox=1050, oy=450, size=1600, blur=50,
        head=[(340, 140), (1440, 140), (1440, 1330), (950, 1330),
              (950, 1180), (665, 1180), (665, 1330), (340, 1330)],
        marks=[(700, 1350, 1010, 1590), (340, 1290, 560, 1590)],
        neck_guard=(610, 1110, 1000, 1350),
    ),
}

WORK = 800  # resolution the search runs at, in the original crop's frame


def gray(im, size=None):
    if size:
        im = im.resize((size, size), Image.LANCZOS)
    return np.asarray(im.convert("L"), dtype=np.float64) / 255.0


def match(img, tpl):
    """Normalized cross-correlation of `tpl` over `img`. Returns (score, y, x)."""
    ih, iw = img.shape
    th, tw = tpl.shape
    if th > ih or tw > iw:
        return -1.0, 0, 0
    t = tpl - tpl.mean()
    tnorm = np.sqrt((t * t).sum())
    if tnorm < 1e-9:
        return -1.0, 0, 0

    fh, fw = ih + th, iw + tw
    num = np.fft.irfft2(np.fft.rfft2(img, s=(fh, fw)) *
                        np.conj(np.fft.rfft2(t, s=(fh, fw))), s=(fh, fw))
    num = num[: ih - th + 1, : iw - tw + 1]

    # local sums of img and img^2 over the template window, via integral images
    def win(a):
        c = np.cumsum(np.cumsum(np.pad(a, ((1, 0), (1, 0))), 0), 1)
        return (c[th:, tw:] - c[:-th, tw:] - c[th:, :-tw] + c[:-th, :-tw])

    s1, s2 = win(img), win(img * img)
    n = th * tw
    var = s2 - s1 * s1 / n
    denom = np.sqrt(np.maximum(var, 0)) * tnorm
    ncc = np.where(denom > 1e-9, num / np.maximum(denom, 1e-9), -1.0)
    idx = int(np.argmax(ncc))
    y, x = divmod(idx, ncc.shape[1])
    return float(ncc[y, x]), y, x


def align(orig, genr, marks, size):
    """Best (scale, ox, oy, score): place genr resized to size*scale at (ox, oy)."""
    k = WORK / size
    o = gray(orig, WORK)
    tpls = []
    for (x0, y0, x1, y1) in marks:
        b = [int(round(v * k)) for v in (x0, y0, x1, y1)]
        tpls.append((o[b[1]:b[3], b[0]:b[2]], b[0], b[1]))

    def probe(s):
        w = int(round(WORK * s))
        g = gray(genr, w)
        tot, offs = 0.0, []
        for tpl, tx, ty in tpls:
            sc, my, mx = match(g, tpl)
            tot += sc
            offs.append((tx - mx, ty - my))
        spread = float(np.hypot(offs[0][0] - offs[1][0], offs[0][1] - offs[1][1]))
        ox = float(np.mean([a for a, _ in offs])) / k
        oy = float(np.mean([b for _, b in offs])) / k
        return tot / len(tpls), spread, ox, oy

    # the generator usually keeps the frame; take that answer when it is convincing
    ncc, spread, ox, oy = probe(1.0)
    if ncc >= 0.97 and spread <= 3 and abs(ox) <= 3 and abs(oy) <= 3:
        return (ncc, 1.0, ox, oy, ncc, spread)

    best = None
    for s in np.arange(0.55, 1.46, 0.01):
        w = int(round(WORK * s))
        g = gray(genr, w)
        tot, offs = 0.0, []
        for tpl, tx, ty in tpls:
            sc, my, mx = match(g, tpl)
            tot += sc
            offs.append((tx - mx, ty - my))
        # the two landmarks must agree on where the generated frame sits
        spread = np.hypot(offs[0][0] - offs[1][0], offs[0][1] - offs[1][1])
        score = tot / len(tpls) - 0.004 * spread
        if best is None or score > best[0]:
            ox = float(np.mean([a for a, _ in offs]))
            oy = float(np.mean([b for _, b in offs]))
            best = (score, float(s), ox / k, oy / k, tot / len(tpls), spread)
    return best


def color_match(src, ref, mask):
    out = src.astype(np.float32).copy()
    for c in range(3):
        a, b = src[..., c][mask], ref[..., c][mask]
        sa = a.std()
        g = float(np.clip((b.std() / sa) if sa > 1e-3 else 1.0, 0.88, 1.14))
        out[..., c] = (out[..., c] - a.mean()) * g + b.mean()
    return np.clip(out, 0, 255)


def main():
    job_id, gen_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
    J = JOBS[job_id]
    size = J["size"]

    full = Image.open(J["src"]).convert("RGB")
    orig = full.crop((J["ox"], J["oy"], J["ox"] + size, J["oy"] + size))
    genr = Image.open(gen_path).convert("RGB")

    score, s, px, py, ncc, spread = align(orig, genr, J["marks"], size)

    w = int(round(size * s))
    placed = Image.new("RGB", (size, size), (255, 255, 255))
    placed.paste(genr.resize((w, w), Image.LANCZOS), (int(round(px)), int(round(py))))

    o = np.asarray(orig, dtype=np.float32)
    p = np.asarray(placed, dtype=np.float32)

    # colour-match on the landmark band, which is common content
    band = np.zeros(o.shape[:2], dtype=bool)
    band[min(m[1] for m in J["marks"]):] = True
    p = color_match(p, o, band)

    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).polygon(J["head"], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(J["blur"]))
    a = np.asarray(m, dtype=np.float32) / 255.0

    # Neck guard: around the neck the generated head often has a longer neck than
    # the model, and blending skin over the black tee leaves a translucent band.
    # Inside the guard box, never write where the ORIGINAL is dark (the tee).
    gx0, gy0, gx1, gy1 = J["neck_guard"]
    lum = np.asarray(orig.convert("L"), dtype=np.float32)
    # the tee reads ~26; the darkest hair/jaw shadow ~112, so this only spares the tee
    bright = np.clip((lum - 42.0) / 33.0, 0.0, 1.0)
    bright = np.asarray(Image.fromarray((bright * 255).astype(np.uint8))
                        .filter(ImageFilter.GaussianBlur(4)), dtype=np.float32) / 255.0
    box = Image.new("L", (size, size), 0)
    ImageDraw.Draw(box).rectangle([gx0, gy0, gx1, gy1], fill=255)
    box = np.asarray(box.filter(ImageFilter.GaussianBlur(38)), dtype=np.float32) / 255.0
    a = (a * (1.0 - box * (1.0 - bright)))[..., None]

    out_crop = Image.fromarray(np.clip(o * (1 - a) + p * a, 0, 255).astype(np.uint8))
    result = full.copy()
    result.paste(out_crop, (J["ox"], J["oy"]))
    result.save(out_path, quality=95, subsampling=0)

    print(json.dumps({"job": job_id, "gen": gen_path.split("/")[-1], "scale": round(s, 3),
                      "off": [round(px, 1), round(py, 1)], "ncc": round(ncc, 4),
                      "spread": round(spread, 1), "out": out_path.split("/")[-1]}))


if __name__ == "__main__":
    main()
