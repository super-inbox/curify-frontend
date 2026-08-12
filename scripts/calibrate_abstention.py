#!/usr/bin/env python3
"""P0-A — measure abstention calibration against the 100-query benchmark.

Runs every tool_intent_query through the matcher and reports the confidence
distribution per coverage class. The question is not "does it match?" but
"does confidence SEPARATE gap from direct?" — the shipped 0.60 floor is useless
if out-of-scope queries score 0.75-0.85.

Usage:  calibrate_abstention.py <label> [endpoint]
Cache warning: searchTemplateMatch keeps a process-local LRU, so restart the
dev server between prompt changes or you will measure the old prompt.
"""
import json, sys, time, urllib.request, urllib.error
from collections import defaultdict

LABEL = sys.argv[1] if len(sys.argv) > 1 else "run"
ENDPOINT = sys.argv[2] if len(sys.argv) > 2 else "http://localhost:3000/api/search-template-match"
QUERIES = "/Users/qqwjq/curify-studio/dev/jayw/design-agent-v0/eval/tool_intent_queries.jsonl"
OUT = f"/private/tmp/claude-501/-Users-qqwjq-curify-frontend/4be4d68d-1e1d-499c-82ff-12b1f0014678/scratchpad/calib_{LABEL}.json"


def route(query, tries=2):
    for a in range(tries):
        try:
            req = urllib.request.Request(
                ENDPOINT, data=json.dumps({"query": query}).encode(),
                headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=90) as r:
                return json.loads(r.read()).get("matches", [])
        except Exception:
            if a == tries - 1:
                return None
            time.sleep(2)
    return None


rows = []
qs = [json.loads(l) for l in open(QUERIES, encoding="utf-8") if l.strip()]
print(f"[{LABEL}] {len(qs)} queries → {ENDPOINT}\n")
for i, q in enumerate(qs, 1):
    m = route(q["query"])
    if m is None:
        print(f"  {i:3d}/{len(qs)} ERROR {q['id']}")
        continue
    top = max((x.get("confidence", 0) for x in m), default=0.0)
    rows.append({"id": q["id"], "coverage": q.get("coverage"), "n_matches": len(m),
                 "top_conf": top, "query": q["query"]})
    if i % 20 == 0:
        print(f"  {i:3d}/{len(qs)}")

json.dump(rows, open(OUT, "w"), ensure_ascii=False, indent=1)

by = defaultdict(list)
for r in rows:
    by[r["coverage"]].append(r)


def mean(xs):
    return sum(xs) / len(xs) if xs else 0.0


print(f"\n=== {LABEL} — {len(rows)} scored ===")
print(f"{'coverage':10s} {'n':>3s} {'match%':>7s} {'mean_conf':>10s} {'>=0.60':>7s} {'>=0.75':>7s}")
for cov in ("direct", "adjacent", "gap"):
    sub = by.get(cov, [])
    if not sub:
        continue
    print(f"{cov:10s} {len(sub):3d} {100*mean([1 if r['n_matches'] else 0 for r in sub]):6.0f}% "
          f"{mean([r['top_conf'] for r in sub]):10.2f} "
          f"{100*mean([1 if r['top_conf'] >= .60 else 0 for r in sub]):6.0f}% "
          f"{100*mean([1 if r['top_conf'] >= .75 else 0 for r in sub]):6.0f}%")

d, g = [r["top_conf"] for r in by.get("direct", [])], [r["top_conf"] for r in by.get("gap", [])]
print(f"\nseparation (mean direct - mean gap): {mean(d)-mean(g):+.3f}")
print("threshold sweep — keep direct, reject gap:")
best = None
for t in [x / 100 for x in range(40, 96, 5)]:
    keep = mean([1 if c >= t else 0 for c in d])
    rej = mean([1 if c < t else 0 for c in g])
    score = keep + rej
    flag = ""
    if best is None or score > best[0]:
        best, flag = (score, t), "  <-- best"
    print(f"  t={t:.2f}  direct kept {100*keep:3.0f}%   gap rejected {100*rej:3.0f}%   sum={score:.2f}{flag}")
print(f"\nbest threshold ≈ {best[1]:.2f} (sum={best[0]:.2f}; 2.00 = perfect separation)")
