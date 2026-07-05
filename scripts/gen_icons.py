"""Regenerate the icon set from public/curify_logo_1024.png.

Run whenever the master logo changes:
    python3 scripts/gen_icons.py

Emits:
    app/icon.png          — 512×512, used for the browser tab / <link rel=icon> at auto-detected sizes
    app/apple-icon.png    — 180×180, iOS home-screen icon
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


if __name__ == "__main__":
    main()
