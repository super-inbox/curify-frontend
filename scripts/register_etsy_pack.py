# -*- coding: utf-8 -*-
"""Zip a curated pack folder and register the SKU in BOTH registries.

Two registries is not redundancy — the frontend renders /pack/<sku> and the backend
serves the download. A SKU present in only one produces a landing page whose download
404s, so this writes both from one record and refuses to write a partial pair.

Metadata (title/description) lives in scripts/configs/etsy_pack_copy.json so the copy
is reviewable in git rather than buried in a shell history.

Usage:
    python scripts/register_etsy_pack.py <sku> [<sku>…]
    python scripts/register_etsy_pack.py --activate <sku>     # flip active after upload

Registering does NOT upload. Order matters:
    1. python scripts/register_etsy_pack.py <sku>          (active=false)
    2. node scripts/build_template_packs.cjs --mode=sku --sku=<sku>
    3. python scripts/register_etsy_pack.py --activate <sku>
Flipping active before the ZIP is on Azure gives buyers a live page with a dead
download.
"""
import collections, io, json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FE = os.path.join(ROOT, "lib", "etsy_packs.json")
BE = "/Users/qqwjq/curify-studio/curify_background/app/data/etsy_packs.json"
COPY = os.path.join(ROOT, "scripts", "configs", "etsy_pack_copy.json")


def load(p):
    return json.load(io.open(p, encoding="utf-8"), object_pairs_hook=collections.OrderedDict)


def save(p, d):
    io.open(p, "w", encoding="utf-8").write(json.dumps(d, ensure_ascii=False, indent=2) + "\n")


def images(sku):
    d = os.path.join(ROOT, "packs", sku)
    if not os.path.isdir(d):
        sys.exit(f"no such pack folder: packs/{sku}")
    return sorted(f for f in os.listdir(d) if f.lower().endswith((".jpg", ".jpeg", ".png")))


def build_zip(sku):
    src, files = os.path.join(ROOT, "packs", sku), images(sku)
    out = os.path.join(ROOT, "raw", "etsy-packs", f"{sku}-v1.zip")
    os.makedirs(os.path.dirname(out), exist_ok=True)
    if os.path.exists(out):
        os.remove(out)
    subprocess.run(["zip", "-q", "-j", out] + [os.path.join(src, f) for f in files], check=True)
    return out, len(files), os.path.getsize(out) / 1e6


def activate(skus):
    for path in (FE, BE):
        d = load(path)
        hit = [r for r in d["packs"] if r["sku"] in skus]
        missing = skus - {r["sku"] for r in hit}
        if missing:
            sys.exit(f"{os.path.basename(path)}: not registered: {', '.join(sorted(missing))}")
        for r in hit:
            r["active"] = True
        save(path, d)
        print(f"  {os.path.basename(path)}: activated {len(hit)}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit(__doc__)
    if "--activate" in sys.argv:
        return activate(set(args))

    copy = load(COPY)
    fe, be = load(FE), load(BE)
    fe_have = {r["sku"] for r in fe["packs"]}
    be_have = {r["sku"] for r in be["packs"]}

    for sku in args:
        if sku not in copy:
            sys.exit(f"no title/description for '{sku}' in scripts/configs/etsy_pack_copy.json")
        zpath, count, mb = build_zip(sku)
        rec = collections.OrderedDict([
            ("sku", sku), ("title", copy[sku]["title"]), ("description", copy[sku]["description"]),
            ("cover_image", f"/images/nano_insp/{images(sku)[0]}"), ("card_count", count),
            ("file_size_mb", round(mb, 1)),
            ("blob_path", f"packs/sku/{sku}/pack-v1.zip"), ("version", 1),
            ("etsy_listing_url", None), ("active", False), ("secret", None),
        ])
        if sku not in fe_have:
            fe["packs"].append(rec)
        if sku not in be_have:
            be["packs"].append(json.loads(json.dumps(rec)))
        print(f"  {sku:<26} {count} cards  {mb:5.1f} MB  -> {os.path.basename(zpath)}")

    save(FE, fe)
    save(BE, be)
    n_fe, n_be = len(fe["packs"]), len(be["packs"])
    print(f"  registries: frontend {n_fe}, backend {n_be}" + ("" if n_fe == n_be else "  <-- OUT OF SYNC"))
    print("  active=false — upload the ZIPs, then re-run with --activate")


if __name__ == "__main__":
    main()
