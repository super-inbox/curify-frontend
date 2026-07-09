"""Regenerate the icon set from public/curify_logo_1024.png.

Run whenever the master logo changes:
    python3 scripts/gen_icons.py

Emits:
    app/icon.png          — 512×512, used for the browser tab / <link rel=icon> at auto-detected sizes
    app/apple-icon.png    — 180×180, iOS home-screen icon
    app/favicon.ico       — multi-size .ico (16–256), the /favicon.ico older browsers + crawlers
                            (e.g. TikTok app-review) fetch. MUST be regenerated with the rest or it
                            drifts to a stale logo — that mismatch failed a 2026-07-08 TikTok review.
    public/icon-192.png   — 192×192, PWA manifest
    public/icon-512.png   — 512×512, PWA manifest (any + maskable)

Next.js 15 App Router auto-detects app/icon.png and app/apple-icon.png
from the filesystem; app/manifest.ts references the public/icon-{192,512}.png
for PWA installability.
"""
from pathlib import Path

from PIL import Image

REPO = Path(__file__).parent.parent
SRC = REPO / "public" / "curify_logo_1024.png"
TARGETS = {
    REPO / "app" / "icon.png": 512,
    REPO / "app" / "apple-icon.png": 180,
    REPO / "public" / "icon-192.png": 192,
    REPO / "public" / "icon-512.png": 512,
}


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"master missing: {SRC}")
    src = Image.open(SRC)
    print(f"source: {src.size} mode={src.mode}")
    for path, size in TARGETS.items():
        resized = src.resize((size, size), Image.LANCZOS)
        resized.save(path, "PNG", optimize=True)
        print(f"  {size}×{size} → {path.relative_to(REPO)}")

    # favicon.ico — multi-size so the browser tab matches the rest of the brand.
    ico_path = REPO / "app" / "favicon.ico"
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    base = src.resize((256, 256), Image.LANCZOS)
    base.save(ico_path, format="ICO", sizes=ico_sizes)
    print(f"  ico {ico_sizes[0][0]}–{ico_sizes[-1][0]} → {ico_path.relative_to(REPO)}")


if __name__ == "__main__":
    main()
