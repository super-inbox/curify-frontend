#!/usr/bin/env python3
"""Lightweight offline validation for gallery.html.

Research-artifact validator only (not part of the production build).
Checks: HTML structure, embedded data integrity, local thumbnail
resolution, filter presence, absence of external thumbnail/iframe
dependencies, outbound-link validity, and card-count reconciliation
against SOURCE_CANDIDATES.csv.
"""
import csv
import json
import os
import re
import sys
from urllib.parse import urlparse

HERE = os.path.dirname(os.path.abspath(__file__))
GALLERY = os.path.join(HERE, "gallery.html")
CANDIDATES_CSV = os.path.join(HERE, "SOURCE_CANDIDATES.csv")

failures = []
warnings = []


def check(label, condition, detail=""):
    status = "PASS" if condition else "FAIL"
    print(f"[{status}] {label}" + (f" — {detail}" if detail else ""))
    if not condition:
        failures.append(label)


# 1. HTML exists
check("gallery.html exists", os.path.isfile(GALLERY))
if not os.path.isfile(GALLERY):
    sys.exit(1)

with open(GALLERY, encoding="utf-8") as f:
    html = f.read()

# 2. Well-formed standalone document
check("has <!DOCTYPE html>", html.strip().lower().startswith("<!doctype html>"))
check("has <html> and </html>", "<html" in html and "</html>" in html)
check("has <head> and </head>", "<head>" in html and "</head>" in html)
check("has <body> and </body>", "<body>" in html and "</body>" in html)
check("has non-empty <title>", bool(re.search(r"<title>[^<]+</title>", html)))

# 3. Embedded data loads
m = re.search(r'<script id="gallery-data" type="application/json">(.*?)</script>', html, re.S)
check("gallery-data script tag found", m is not None)
data = []
if m:
    try:
        data = json.loads(m.group(1))
        check("embedded JSON parses", True)
    except json.JSONDecodeError as e:
        check("embedded JSON parses", False, str(e))

# 4. Card count reconciliation
with open(CANDIDATES_CSV, newline="", encoding="utf-8") as f:
    candidate_rows = list(csv.DictReader(f))
check(
    "record count == 47",
    len(data) == 47,
    f"found {len(data)}",
)
check(
    "record count matches SOURCE_CANDIDATES.csv",
    len(data) == len(candidate_rows),
    f"gallery={len(data)} candidates={len(candidate_rows)}",
)

# 5. No duplicate records
ids = [r.get("source_id") for r in data]
check("no duplicate source_id in embedded data", len(ids) == len(set(ids)))

# 6. All thumbnail relative paths resolve locally
missing_thumbs = []
external_thumbs = []
for r in data:
    thumb = r.get("thumbnail", "")
    parsed = urlparse(thumb)
    if parsed.scheme in ("http", "https"):
        external_thumbs.append(r.get("source_id"))
        continue
    if not os.path.isfile(os.path.join(HERE, thumb)):
        missing_thumbs.append(r.get("source_id"))
check("all thumbnail paths are local (no http/https thumbnail src)", len(external_thumbs) == 0, str(external_thumbs))
check("all 47 local thumbnail files resolve on disk", len(missing_thumbs) == 0, str(missing_thumbs))

# 7. No external thumbnail <img> tags anywhere in the raw HTML (defensive, beyond the JSON data check)
img_srcs = re.findall(r'<img[^>]+src="([^"]+)"', html)
external_imgs = [s for s in img_srcs if s.startswith("http://") or s.startswith("https://")]
check("no hardcoded external <img src> in markup", len(external_imgs) == 0, str(external_imgs))

# 8. No iframe / embedded external pages
check("no <iframe> anywhere in gallery.html", "<iframe" not in html.lower())

# 9. Filters present
for filter_id in ["f-domain", "f-query", "f-type", "f-review", "quality-toggle", "f-search"]:
    check(f'filter control "{filter_id}" present', f'id="{filter_id}"' in html)

# 10. Outbound canonical links: syntactically valid http(s) URLs, match source records
bad_urls = []
mismatched_canonical = []
cand_by_id = {r["source_id"]: r for r in candidate_rows}
for r in data:
    canon = r.get("canonical_url", "")
    parsed = urlparse(canon)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        bad_urls.append((r.get("source_id"), canon))
    cand = cand_by_id.get(r.get("source_id"))
    if cand and cand["canonical_url"] != canon:
        mismatched_canonical.append(r.get("source_id"))
check("all canonical_url values are syntactically valid http(s) URLs", len(bad_urls) == 0, str(bad_urls))
check("all canonical_url values match SOURCE_CANDIDATES.csv", len(mismatched_canonical) == 0, str(mismatched_canonical))

# 11. Outbound links open in new tab, not same-window navigation away from the gallery
check(
    'gallery uses target="_blank" rel="noopener" for outbound links (script-level check)',
    'target = "_blank"' in html and 'noopener' in html,
)

# 12. Unsafe text escaping: rendering path must avoid innerHTML for source-derived fields
check(
    "no innerHTML assignment used for source-derived text fields (DOM textContent API used instead)",
    "innerHTML" not in html or html.count("innerHTML") <= 2,  # allow reset-clears like grid.innerHTML = ""
)
innerHTML_uses = re.findall(r'[\w.]+\.innerHTML\s*=\s*[^;]+;', html)
non_empty_clears = [u for u in innerHTML_uses if '""' not in u and "''" not in u]
check("all innerHTML assignments are empty-string clears only (no raw data injected)", len(non_empty_clears) == 0, str(non_empty_clears))

print()
print(f"TOTAL CHECKS FAILED: {len(failures)}")
if failures:
    for f in failures:
        print(" -", f)
    sys.exit(1)
print("ALL CHECKS PASSED")
