#!/usr/bin/env python3
"""Measure deliverable-type routing on the benchmark.

The success criterion has CHANGED from the abstention framing. For a gap query
the right answer is not "abstain" — 22 of the 23 are achievable, just not as a
single template. So we score: did the agent choose the right SHAPE of plan?

  gap + brand/VI wording      -> expect "system"  (a ladder, multi-step)
  gap + a count               -> expect "batch"
  gap + edit wording + image  -> expect "edit"
  direct                      -> expect "single"  (must NOT regress)
"""
import json, re, sys, time, urllib.request
from collections import defaultdict

PLAN = "http://localhost:3000/api/design-agent/plan"
Q = "/Users/qqwjq/curify-studio/dev/jayw/design-agent-v0/eval/tool_intent_queries.jsonl"

SYSTEM_RE = re.compile(r"完整|整套|全套|系统|视觉识别|品牌视觉|品牌形象|系列|\bvi\b|identity", re.I)
BATCH_RE = re.compile(r"\d{1,3}\s*(?:个|张|款|种|色|sku)", re.I)
EDIT_RE = re.compile(r"换背景|替换|精修|修图|去背|抠图|增强|质感|细节增强", re.I)


def expected(q):
    t = q["query"]
    if BATCH_RE.search(t):
        return "batch"
    if EDIT_RE.search(t):
        return "edit"
    if SYSTEM_RE.search(t):
        return "system"
    return None  # no strong lexical expectation


def plan(query, has_image=False):
    req = urllib.request.Request(
        PLAN, data=json.dumps({"query": query, "hasImage": has_image, "locale": "en"}).encode(),
        headers={"Content-Type": "application/json"})
    for a in range(2):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read())
        except Exception:
            if a:
                return None
            time.sleep(2)
    return None


qs = [json.loads(l) for l in open(Q, encoding="utf-8") if l.strip()]
gap = [q for q in qs if q.get("coverage") == "gap"]
direct = [q for q in qs if q.get("coverage") == "direct"]

print(f"=== {len(gap)} gap queries — did the plan shape change? ===")
shapes = defaultdict(int)
multi = 0
hits = tot = 0
for q in gap:
    exp = expected(q)
    # edits only make sense with a reference image
    p = plan(q["query"], has_image=(exp == "edit"))
    if not p:
        print(f"  ERROR {q['id']}")
        continue
    d = (p.get("routing") or {}).get("deliverable") or {}
    got, nsteps = d.get("type", "?"), len(p.get("steps") or [])
    shapes[got] += 1
    if nsteps > 1:
        multi += 1
    if exp:
        tot += 1
        ok = got == exp
        hits += ok
        print(f"  {'OK ' if ok else 'MISS'} {q['id']} exp={exp:9s} got={got:11s} steps={nsteps}  {q['query'][:38]}")

print(f"\nplan shapes on gap: {dict(shapes)}")
print(f"multi-step plans: {multi}/{len(gap)}  ({100*multi//max(len(gap),1)}%)")
if tot:
    print(f"shape accuracy where lexically expected: {hits}/{tot} ({100*hits//tot}%)")

print(f"\n=== {len(direct)} direct queries — regression check ===")
sing = ok1 = 0
for q in direct:
    p = plan(q["query"])
    if not p:
        continue
    d = (p.get("routing") or {}).get("deliverable") or {}
    if d.get("type") == "single":
        sing += 1
    if p.get("steps"):
        ok1 += 1
print(f"still routed 'single': {sing}/{len(direct)} ({100*sing//len(direct)}%)")
print(f"still produced a plan:  {ok1}/{len(direct)} ({100*ok1//len(direct)}%)")
