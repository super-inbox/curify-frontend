#!/usr/bin/env python3
"""Author the type/level middle-tier vertical content and inject `__vgroup:*`
entries into messages/en/nano.json. Also strip level-specific fields off the HSK
template (they now live in the hsk:N groups), so cards stop inheriting HSK 2.

Idempotent: re-running overwrites the __vgroup:* entries and re-strips the HSK
template. English only for this pass; translate for other locales as follow-up.
"""
import json, sys, io

NANO = sys.argv[1]  # path to messages/en/nano.json

# ── MBTI type profiles (generic to the type, NOT the character) ──────────────
DIM = {
    "E": "Extraverted", "I": "Introverted", "N": "Intuitive", "S": "Sensing",
    "T": "Thinking", "F": "Feeling", "J": "Judging", "P": "Perceiving",
}
NICK = {
    "ENFP": "The Campaigner", "ENTJ": "The Commander", "ENTP": "The Debater",
    "ESFP": "The Entertainer", "ESTJ": "The Executive", "INFJ": "The Advocate",
    "INFP": "The Mediator", "INTJ": "The Architect", "INTP": "The Logician",
    "ISFP": "The Adventurer", "ISTJ": "The Logistician", "ISTP": "The Virtuoso",
}
# strengths, weaknesses, communication, relationships, career, compatibility
MBTI = {
 "ENFP": ("Infectious enthusiasm, imagination, and a gift for connecting with people and rallying them around an idea.",
          "Can over-commit, lose focus on follow-through, and struggle with routine and detail work.",
          "Warm, expressive, and idea-driven — thinks out loud and energizes a room.",
          "Seeks deep, authentic connection and freedom; values partners who share their curiosity.",
          "Thrives in creative, people-facing, or entrepreneurial roles that reward vision and flexibility.",
          "Pairs well with INTJ or INFJ, whose depth and structure ground their ideas."),
 "ENTJ": ("Decisive, strategic, and driven — natural at organizing people and resources toward a goal.",
          "Can be impatient, blunt, and dismissive of feelings or slower processes.",
          "Direct and goal-oriented; states the plan and expects results.",
          "Loyal and committed, but expects competence and shared ambition from partners.",
          "Excels in leadership, strategy, and building or scaling organizations.",
          "Complements INTP or INFP, who add reflection and empathy to their drive."),
 "ENTP": ("Quick, inventive, and endlessly curious — great at reframing problems and debating ideas.",
          "May argue for sport, resist routine, and leave projects unfinished once the puzzle is solved.",
          "Playful and provocative; challenges assumptions to find a better angle.",
          "Values intellectual spark and banter; needs partners who can keep up and push back.",
          "Fits innovation, product, consulting, and any role rewarding ideas over process.",
          "Balances well with INFJ or INTJ, who turn their ideas into follow-through."),
 "ESFP": ("Spontaneous, warm, and present — brings energy, fun, and practical care to the moment.",
          "Can avoid long-term planning and get restless with abstraction or delayed payoff.",
          "Expressive and hands-on; connects through shared experience and doing.",
          "Generous and affectionate; thrives on lively, appreciative company.",
          "Shines in performance, hospitality, sales, and roles full of people and action.",
          "Matches well with ISTJ or ISFJ, who add steadiness to their spontaneity."),
 "ESTJ": ("Organized, dependable, and results-focused — keeps people and systems on track.",
          "Can be rigid, controlling, and impatient with ambiguity or unproven ideas.",
          "Clear, direct, and rule-based; says what needs doing and by when.",
          "Committed and traditional; values reliability and clear expectations.",
          "Strong in operations, management, and any role rewarding order and accountability.",
          "Complements ISFP or INFP, who soften their structure with warmth."),
 "INFJ": ("Insightful, principled, and quietly determined — reads people and pursues meaning.",
          "Prone to perfectionism, burnout, and withdrawing when overwhelmed.",
          "Thoughtful and warm; prefers depth and one-on-one over surface chatter.",
          "Seeks rare, authentic bonds built on shared values and trust.",
          "Drawn to counseling, writing, mission-led and human-centered work.",
          "Pairs deeply with ENFP or ENTP, whose energy draws them out."),
 "INFP": ("Idealistic, empathetic, and imaginative — guided by strong inner values.",
          "Can be self-critical, conflict-averse, and impractical about logistics.",
          "Gentle and sincere; communicates best in writing and safe, personal settings.",
          "Devoted and deep; needs partners who honor their values and space.",
          "Fits creative, humanitarian, and meaning-rich work over rigid hierarchy.",
          "Balances with ENFJ or ENTJ, who help translate ideals into action."),
 "INTJ": ("Strategic, independent, and visionary — builds long-range systems and plans.",
          "Can seem aloof, overly critical, and dismissive of emotion or convention.",
          "Precise and economical; shares conclusions, not the running commentary.",
          "Selective and loyal; values competence, autonomy, and intellectual respect.",
          "Excels in strategy, research, engineering, and architecting the big picture.",
          "Complements ENFP or ENTP, whose openness balances their intensity."),
 "INTP": ("Analytical, original, and curious — dissects ideas and finds the underlying logic.",
          "May over-analyze, procrastinate, and neglect practical or social follow-through.",
          "Precise and questioning; more comfortable with ideas than small talk.",
          "Values intellectual companionship and independence over convention.",
          "Fits research, engineering, and any role rewarding deep problem-solving.",
          "Pairs well with ENTJ or ESTJ, who drive their insights into results."),
 "ISFP": ("Artistic, adaptable, and quietly intense — expresses values through action and craft.",
          "Can be conflict-averse, hard to read, and reluctant to plan far ahead.",
          "Understated and nonverbal; shows more through what they do than say.",
          "Warm and loyal to a close circle; needs space and genuine respect.",
          "Thrives in design, craft, performance, and hands-on creative work.",
          "Matches with ESFJ or ESTJ, who offer structure and steady support."),
 "ISTJ": ("Dependable, thorough, and principled — the backbone people count on.",
          "Can be inflexible, resistant to change, and slow to voice feelings.",
          "Factual and measured; prefers clear facts over speculation.",
          "Steadfast and traditional; values commitment and consistency.",
          "Strong in operations, finance, law, and any role rewarding rigor.",
          "Complements ESFP or ESTP, who bring spontaneity to their order."),
 "ISTP": ("Practical, cool under pressure, and endlessly resourceful — masters tools and systems.",
          "Can seem detached, avoid commitment, and grow bored by routine.",
          "Terse and action-first; solves quietly rather than explaining.",
          "Independent and low-drama; values partners who respect their autonomy.",
          "Fits engineering, mechanics, athletics, and hands-on troubleshooting.",
          "Pairs with ESFJ or ESTJ, who add warmth and structure."),
}

def mbti_entry(code):
    dims = " · ".join(DIM[c] for c in code)
    s = MBTI[code]
    return {
        "content": {
            "label": f"{code} · {NICK[code]}",
            "attributes": {"type_code": code, "type_nickname": NICK[code], "dimensions": dims},
            "vertical": {
                "strengths": s[0], "weaknesses": s[1], "communication": s[2],
                "relationships": s[3], "career": s[4], "compatibility": s[5],
            },
        }
    }

# ── HSK level profiles (correct per level) ───────────────────────────────────
HSK = {
 "1": ("HSK 1", "6–8", "Beginner",
       "Read short, fully-pinyin sentences using the ~150 core HSK 1 words and recognize the most common characters in context.",
       "One bilingual reading card: a simple illustrated scene, ~150-word HSK 1 vocabulary, pinyin above every character, and an English gloss.",
       "HSK 1 is the entry level of the Chinese proficiency scale (~150 words, basic greetings, numbers, and everyday nouns). Reading is supported by full pinyin."),
 "2": ("HSK 2", "8–10", "Beginner",
       "Read short bilingual passages using the ~300 HSK 2 words, following simple everyday narratives with pinyin support.",
       "One bilingual reading card: an illustrated story, ~300-word HSK 2 vocabulary, pinyin above the characters, and an English translation.",
       "HSK 2 (~300 words cumulative) covers simple daily topics — family, time, shopping, and routines — in short connected sentences."),
 "3": ("HSK 3", "9–12", "Elementary",
       "Read connected multi-sentence passages using the ~600 HSK 3 words, handling everyday topics with reduced pinyin scaffolding.",
       "One bilingual reading card: a short narrative, ~600-word HSK 3 vocabulary, selective pinyin, and an English translation.",
       "HSK 3 (~600 words cumulative) marks the elementary threshold — learners manage basic communication across life, study, and work situations."),
 "4": ("HSK 4", "11–14", "Intermediate",
       "Read longer passages and simple stories using the ~1,200 HSK 4 words, following plot and inference with minimal pinyin.",
       "One bilingual reading card: an extended story, ~1,200-word HSK 4 vocabulary, minimal pinyin, and an English translation.",
       "HSK 4 (~1,200 words cumulative) is the intermediate level — learners discuss a fairly wide range of topics fluently in Chinese."),
}

def hsk_entry(level):
    grade, age, diff, obj, inc, bg = HSK[level]
    return {
        "content": {
            "label": grade,
            "attributes": {"grade_band": grade, "age_range": age, "difficulty": diff},
            "vertical": {"learning_objective": obj, "includes": inc, "background": bg},
        }
    }

# ── inject ───────────────────────────────────────────────────────────────────
raw = open(NANO, encoding="utf-8").read()
d = json.loads(raw)

for code in MBTI:
    d[f"__vgroup:mbti:{code}"] = mbti_entry(code)
for lvl in HSK:
    d[f"__vgroup:hsk:{lvl}"] = hsk_entry(lvl)

# Strip level-specific fields off the HSK template — they now come from the
# hsk:N group. Keep the truly-shared attributes (subject/skill/resource/etc.).
HSK_TID = "template-hsk-bilingual-reading-text-lesson-poster"
hc = d.get(HSK_TID, {}).get("content", {})
if hc:
    attrs = hc.get("attributes") or {}
    for k in ("grade_band", "age_range", "difficulty"):
        attrs.pop(k, None)
    hc["attributes"] = attrs
    hc["vertical"] = {}  # learning_objective/includes/background now per-level

open(NANO, "w", encoding="utf-8").write(json.dumps(d, indent=2, ensure_ascii=False) + "\n")
print(f"injected {len(MBTI)} mbti + {len(HSK)} hsk groups; stripped HSK template level fields")
