"""SEO funnel audit: sitemap → GSC impressions → top-20 → clicks
+ bot-pattern subtraction + breakdown by route family."""
import csv
import re
from collections import Counter, defaultdict

SITEMAP = "/tmp/curify_sitemap_audit/all_urls.txt"
PAGES_CSV = "/Users/qqwjq/curify-frontend/raw/gsc-audit-2026-06-26/Pages-all.csv"
QUERIES_CSV = "/Users/qqwjq/curify-frontend/raw/gsc-audit-2026-06-26/Queries-all.csv"

# Load sitemap URLs and classify by route family + locale
def classify(url):
    path = url.replace("https://www.curify-ai.com", "")
    m = re.match(r"^/([a-z]{2})/", path)
    locale = m.group(1) if m else "en"
    rest = path[3:] if m else path
    if rest.startswith("/nano-template/"):
        if "/example/" in rest:
            return "nano_template_example", locale
        if "/carousel/" in rest:
            return "nano_template_carousel", locale
        return "nano_template_index", locale
    if rest.startswith("/nano-banana-pro-prompts/"):
        return "nano_banana_prompt", locale
    if rest.startswith("/topics/"):
        return "topic_hub", locale
    if rest.startswith("/blog/"):
        return "blog", locale
    if rest.startswith("/tools/"):
        return "tool", locale
    if rest.startswith("/use-cases/"):
        return "use_case", locale
    if rest in ("", "/"):
        return "home", locale
    return "other", locale


sitemap_urls = set()
sitemap_buckets = Counter()
sitemap_by_locale = Counter()
with open(SITEMAP) as f:
    for line in f:
        url = line.strip()
        if not url:
            continue
        sitemap_urls.add(url)
        bucket, locale = classify(url)
        sitemap_buckets[bucket] += 1
        sitemap_by_locale[locale] += 1

print(f"=== SITEMAP ===")
print(f"  total sitemap URLs: {len(sitemap_urls):,}")
print(f"  by route family:")
for k, n in sitemap_buckets.most_common():
    print(f"    {n:>8,}  {k}")
print()

# Load GSC pages
gsc_pages = []
with open(PAGES_CSV) as f:
    r = csv.DictReader(f)
    for row in r:
        gsc_pages.append({
            "page": row["Page"],
            "clicks": int(row["Clicks"]),
            "impressions": int(row["Impressions"]),
            "position": float(row["Position"]),
        })

total_clicks = sum(p["clicks"] for p in gsc_pages)
total_impr = sum(p["impressions"] for p in gsc_pages)
print(f"=== GSC PAGES (28d: 2026-05-26 → 2026-06-23) ===")
print(f"  pages with impressions:    {len(gsc_pages):,}")
print(f"  total clicks:              {total_clicks:,}    ({total_clicks/28:.0f}/day)")
print(f"  total impressions:         {total_impr:,}    ({total_impr/28:.0f}/day)")
print(f"  blended CTR:               {100*total_clicks/total_impr:.2f}%")
print()

# Funnel: sitemap → in-GSC → top-20-pos → top-10-pos → got-clicks
gsc_pages_set = set(p["page"] for p in gsc_pages)
in_gsc = len(gsc_pages_set & sitemap_urls)
not_in_gsc = len(sitemap_urls - gsc_pages_set)
gsc_pages_not_in_sitemap = len(gsc_pages_set - sitemap_urls)

top20 = [p for p in gsc_pages if p["position"] <= 20]
top10 = [p for p in gsc_pages if p["position"] <= 10]
top3 = [p for p in gsc_pages if p["position"] <= 3]
clicked = [p for p in gsc_pages if p["clicks"] > 0]
clicked_5plus = [p for p in gsc_pages if p["clicks"] >= 5]

print(f"=== FUNNEL ===")
print(f"  sitemap URLs:                {len(sitemap_urls):>8,}      100%")
print(f"  sitemap ∩ GSC (any impr):    {in_gsc:>8,}       {100*in_gsc/len(sitemap_urls):>5.1f}%")
print(f"  any GSC impr (incl non-sm):  {len(gsc_pages):>8,}")
print(f"  avg position ≤ 20:           {len(top20):>8,}       {100*len(top20)/len(sitemap_urls):>5.1f}%  of sitemap")
print(f"  avg position ≤ 10:           {len(top10):>8,}       {100*len(top10)/len(sitemap_urls):>5.1f}%  of sitemap")
print(f"  avg position ≤ 3:            {len(top3):>8,}       {100*len(top3)/len(sitemap_urls):>5.1f}%  of sitemap")
print(f"  got ≥1 click:                {len(clicked):>8,}       {100*len(clicked)/len(sitemap_urls):>5.1f}%  of sitemap")
print(f"  got ≥5 clicks (28d):         {len(clicked_5plus):>8,}       {100*len(clicked_5plus)/len(sitemap_urls):>5.1f}%  of sitemap")
print(f"  sitemap URLs MISSING from GSC: {not_in_gsc:>6,}    ({100*not_in_gsc/len(sitemap_urls):.1f}%)")
print(f"  GSC pages NOT in sitemap:    {gsc_pages_not_in_sitemap:>8,}")
print()

# Group by route family — where are clicks concentrated?
def route_of(url):
    bucket, _ = classify(url) if url.startswith("https://www.curify-ai.com") else (("external", "en") if "://" in url else (classify(url) if url.startswith("/") else ("external", "en")))
    return bucket

family_stats = defaultdict(lambda: {"pages": 0, "clicks": 0, "impr": 0, "pos_sum": 0, "ranking_pages": 0})
for p in gsc_pages:
    if p["page"].startswith("https://www.curify-ai.com"):
        bucket, _ = classify(p["page"])
    else:
        bucket = "external"
    fs = family_stats[bucket]
    fs["pages"] += 1
    fs["clicks"] += p["clicks"]
    fs["impr"] += p["impressions"]
    fs["pos_sum"] += p["position"]
    if p["position"] <= 20:
        fs["ranking_pages"] += 1

print(f"=== CLICKS + IMPRESSIONS BY ROUTE FAMILY ===")
rows = []
for bucket, fs in sorted(family_stats.items(), key=lambda x: -x[1]["clicks"]):
    sitemap_n = sitemap_buckets.get(bucket, 0) or 1
    ctr = 100 * fs["clicks"] / max(fs["impr"], 1)
    avg_pos = fs["pos_sum"] / max(fs["pages"], 1)
    coverage = 100 * fs["pages"] / sitemap_n if sitemap_n else 0
    rows.append((bucket, sitemap_n, fs["pages"], coverage, fs["ranking_pages"], fs["clicks"], fs["impr"], ctr, avg_pos))

print(f"  {'family':<26} {'sitemap':>8} {'inGSC':>7} {'cov%':>6} {'top20':>6} {'clicks':>7} {'impr':>9} {'CTR%':>6} {'avgPos':>7}")
for r in rows:
    print(f"  {r[0]:<26} {r[1]:>8,} {r[2]:>7,} {r[3]:>5.1f}% {r[4]:>6,} {r[5]:>7,} {r[6]:>9,} {r[7]:>5.2f}% {r[8]:>6.1f}")
print()

# Now: bot-pattern subtraction on queries
def is_bot_pattern(q):
    """5+ words AND 3+ country names AND time marker AND 0 clicks → AI bot source-gathering."""
    countries = ["argentina","brazil","france","portugal","spain","italy","germany","england","mexico","colombia",
                 "japan","korea","china","india","usa","america","canada","netherlands","belgium","croatia","morocco",
                 "uruguay","ecuador","peru","chile","poland","denmark","sweden","switzerland","austria","cameroon",
                 "senegal","ghana","nigeria","egypt","tunisia","algeria","ivory","saudi","iran","qatar","panama"]
    time_markers = ["2026","2027","world cup","wc 2026","tournament","group stage","predictions","contenders","favorites","comparison"," vs ","versus","top 10","top 5","best of"]
    words = q.lower().split()
    if len(words) < 5:
        return False
    country_hits = sum(1 for c in countries if c in q.lower())
    if country_hits < 3:
        return False
    if not any(t in q.lower() for t in time_markers):
        return False
    return True

queries_data = []
with open(QUERIES_CSV) as f:
    r = csv.DictReader(f)
    for row in r:
        queries_data.append({
            "query": row["Query"],
            "clicks": int(row["Clicks"]),
            "impressions": int(row["Impressions"]),
            "position": float(row["Position"]),
        })

total_q_impr = sum(q["impressions"] for q in queries_data)
total_q_clicks = sum(q["clicks"] for q in queries_data)
bot_queries = [q for q in queries_data if is_bot_pattern(q["query"]) and q["clicks"] == 0]
bot_impr = sum(q["impressions"] for q in bot_queries)

print(f"=== BOT-PATTERN IMPRESSION SUBTRACTION (per feedback_gsc_bot_pattern_exclusion.md) ===")
print(f"  total queries:               {len(queries_data):,}")
print(f"  total impressions:           {total_q_impr:,}")
print(f"  total clicks:                {total_q_clicks:,}")
print(f"  bot-pattern queries flagged: {len(bot_queries):,}  (5+ words, 3+ countries, time marker, 0 clicks)")
print(f"  bot-pattern impressions:     {bot_impr:,}  ({100*bot_impr/total_q_impr:.1f}% of total)")
print(f"  REAL human impressions ≈    {total_q_impr - bot_impr:,}")
print(f"  REAL blended CTR ≈          {100*total_q_clicks/(total_q_impr - bot_impr):.2f}%")
print()

# Top clicked queries
top_clicked = sorted(queries_data, key=lambda x: -x["clicks"])[:15]
print(f"=== TOP 15 CLICKED QUERIES ===")
print(f"  {'clicks':>6} {'impr':>7} {'pos':>5}  query")
for q in top_clicked:
    print(f"  {q['clicks']:>6,} {q['impressions']:>7,} {q['position']:>5.1f}  {q['query'][:60]}")
print()

# Top impression queries that don't convert
high_impr_low_ctr = sorted(
    [q for q in queries_data if q["impressions"] >= 500 and q["clicks"] <= 1],
    key=lambda x: -x["impressions"]
)[:15]
print(f"=== TOP 15 HIGH-IMPR / ≤1-CLICK QUERIES (CTR opportunity, after bot subtraction) ===")
print(f"  {'impr':>7} {'clicks':>6} {'pos':>5}  query")
for q in high_impr_low_ctr:
    botted = "BOT?" if is_bot_pattern(q["query"]) else "    "
    print(f"  {q['impressions']:>7,} {q['clicks']:>6,} {q['position']:>5.1f}  {botted} {q['query'][:60]}")
print()

# Top 25 pages by clicks (where is the click revenue actually concentrated?)
top_pages = sorted(gsc_pages, key=lambda x: -x["clicks"])[:25]
print(f"=== TOP 25 PAGES BY CLICKS ===")
print(f"  {'clicks':>6} {'impr':>7} {'CTR':>6} {'pos':>5}  page")
cumul = 0
for p in top_pages:
    cumul += p["clicks"]
    ctr = 100 * p["clicks"] / max(p["impressions"], 1)
    short = p["page"].replace("https://www.curify-ai.com", "")[:75]
    print(f"  {p['clicks']:>6,} {p['impressions']:>7,} {ctr:>5.1f}% {p['position']:>5.1f}  {short}")
print(f"  Top 25 pages = {cumul:,} clicks = {100*cumul/total_clicks:.1f}% of all clicks")
print()

# Locale split of clicks
locale_clicks = Counter()
locale_pages = Counter()
for p in gsc_pages:
    if not p["page"].startswith("https://www.curify-ai.com"):
        continue
    pathp = p["page"].replace("https://www.curify-ai.com", "")
    m = re.match(r"^/([a-z]{2})/", pathp)
    locale = m.group(1) if m else "en"
    locale_clicks[locale] += p["clicks"]
    locale_pages[locale] += 1

print(f"=== LOCALE SPLIT ===")
print(f"  {'locale':<6} {'clicks':>8} {'pages':>7}")
for loc, n in locale_clicks.most_common():
    print(f"  {loc:<6} {n:>8,} {locale_pages[loc]:>7,}")
