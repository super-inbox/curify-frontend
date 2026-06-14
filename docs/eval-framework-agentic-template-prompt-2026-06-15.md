# Agentic eval framework — Template-Augmented Image Creation Benchmark (TAIC)

**Date filed:** 2026-06-15
**Status:** Strategic framing — not yet executed. Parallel companion to `docs/eval-framework-visual-search-benchmark-2026-06-14.md` (Curify vs Pinterest/Bing/Google/Canva search eval). Documents the *what & why* so a future implementation pass has the rationale settled.

---

## TL;DR

The "Curify vs Pinterest" search eval frames Curify as a *retrieval* product. But what Curify actually does is an **agentic workflow**:

```
User Intent → Agent → Template Selection → Prompt Construction → Image Generation
```

So the right benchmark isn't "does Curify search match Pinterest?" — it's **"does our Agent + Template Layer outperform raw / engineered prompting at completing the user's creation task?"**

The proposed benchmark is **TAIC — Template-Augmented Image Creation**: 100 real creation needs, three approaches (Raw GPT / Prompt Engineering / Curify Agent), four dimensions scored by LLM judges, plus a multi-turn variant that measures turns-to-success.

If TAIC shows e.g. Raw=62, PromptEng=74, Curify=88 — the story we're telling is *"Structured Template + Agent Planning > Free-form Prompting"*, which is a much bigger narrative (product, research, fundraising) than *"Curify search beats Pinterest"*.

---

## The wrong question

> "How does Curify's search compare to Pinterest's?"

This anchors on retrieval. Pinterest is a retrieval product; Curify is not. We'd be benchmarking the wrong axis and competing in a saturated lane.

## The right question

> "Does Agent + Template Layer complete the user's creation task better than other prompting approaches?"

This anchors on completion of intent — the actual job-to-be-done — and shifts the comparator from Pinterest to **alternative prompting strategies for image generation**. That's the lane where Curify's architecture is differentiated, and where the answer (if positive) generalizes beyond Curify.

---

## Four evaluation layers

A complete agentic eval stacks four layers, each progressively harder + more aligned to real product value.

### Layer 1 — Agent Selection Evaluation (function-calling style)

The most tractable. Given a user input, the Agent must:
1. Identify the task type
2. Select a template
3. Fill in parameters

Example:

```
Input:  "Make a retro soccer poster for Messi"
Gold:   {
          "template": "soccer-star-comic-retro-poster",
          "player":   "Messi",
          "style":    "retro"
        }
```

Build 100 user intents with **gold template + gold slots**, measure:
- **Template Accuracy** — did the agent pick the right template?
- **Slot Accuracy** — did it extract the right parameter values?

Lineage: OpenAI function-calling benchmark, Berkeley Function Calling Leaderboard. Cheap to instrument, regression-test on every agent prompt change.

### Layer 2 — Workflow Evaluation (architecture comparison)

Same input, different pipelines, compare end-output:

| Approach | Pipeline |
|---|---|
| Baseline | `"Messi poster"` → raw GPT prompt → image |
| Curify | `"Messi poster"` → Agent → soccer poster template → structured prompt → image |

We're not benchmarking the model — both run the same image model. We're benchmarking the **workflow** (does the template layer + agent planning lift output quality?).

### Layer 3 — Creation Success Rate (the key metric)

The most product-aligned. For each task, an LLM judge (GPT-4o / Gemini / Claude) rates the output on:
- **Visual quality**
- **Instruction following**
- **Commercial usability**
- **Design consistency**

A task is "succeeded" if it clears thresholds on all four. Aggregate:

```
Curify Agent workflow:  83% success rate
Naive prompting:        61% success rate
```

Why this is better than BLEU / ROUGE / Recall@10: those are retrieval/text metrics. Image creation cares about whether the output is *usable*, not whether it matches a reference. Task Success Rate (TSR) is the metric the modern agent literature has converged on.

### Layer 4 — Multi-Turn Creation Evaluation (frontier)

Real agents iterate. The single-shot eval misses the actual user experience:

```
User:   Make a Messi poster
Agent:  Generate
User:   Make it more vintage
Agent:  Refine
User:   Change to comic style
Agent:  Refine
```

Metrics:
- **Turns-to-success** — how many turns until the judge says "done"?
- **Success@3 turns** — fraction of tasks satisfied within 3 turns
- **Refinement quality** — does each turn measurably improve, or does the agent oscillate?

Lineage: Anthropic Computer Use, OpenAI Agent Bench, SWE-Bench multi-turn variants. This is the direction the field is moving and where the differentiation actually lives.

---

## Proposed benchmark: TAIC

**Name:** Template-Augmented Image Creation Benchmark

### Query set (100 real creation needs, balanced)

| Bucket | Sample intents |
|---|---|
| Education | teacher worksheet, language flash card, animal flashcards |
| Sports / WC | world cup poster, messi wallpaper, soccer team lineup |
| Travel | vintage travel poster, japan itinerary, paris travel guide |
| Lifestyle | fashion mood board, vintage outfit lookbook |
| Character | character profile card, mbti compatibility chart |
| Reference | historical timeline, science fact infographic |
| Product / Merch | product packaging, tea brand mascot, merch sticker pack |

Seeds: ~42 already in `lib/popularPrefillQueries.ts` (calibrated for content) + ~58 to span agent-difficult cases (ambiguous intent, mixed multi-domain, refinement-heavy).

### Comparators

| Approach | What it does |
|---|---|
| **A — Raw GPT Prompting** | User intent → image model directly. No prompt engineering, no template. |
| **B — Prompt Engineering** | User intent → hand-crafted detailed prompt → image model. Represents a skilled user prompting carefully. |
| **C — Curify Agent + Template Layer** | User intent → agent → template selection → structured prompt → image model. The production system. |

All three call the *same* underlying image model so we isolate the prompt-layer contribution.

### Judges + scoring

LLM jury — GPT-4o + Gemini + Claude (or any two-of-three) score each output on:
- Visual quality (0-5)
- Instruction following (0-5)
- Commercial readiness (0-5)
- Design consistency (0-5)

"Success" = all four ≥ 3. Aggregate as Task Success Rate per approach.

### Output

Expected shape of a useful result:

```
Approach              TSR     Vis    Instr   Comm    Cons
A — Raw Prompting     62%     3.1    2.8     2.5     2.9
B — Prompt Eng        74%     3.6    3.5     3.2     3.4
C — Curify Agent      88%     4.1    4.3     4.0     4.2
```

The headline isn't the absolute numbers — it's the gap and where it comes from (which dimension lifts most? which task buckets resist?).

---

## Strategic framing (the bigger story)

> **Search eval (parallel doc):** Where Curify already wins on retrieval, treating Pinterest as upstream demand signal.
> **Agentic eval (this doc):** Whether Curify's architectural bet — Template + Agent layer over a generic image model — actually pays off.

The two evals answer different questions. They aren't redundant; they're complementary axes for the *same* product:

- **Search eval** validates the *content* side (do we have the right templates / examples for what users want?)
- **Agentic eval** validates the *architecture* side (does our prompt-layer stack outperform raw / engineered prompting?)

If TAIC results favor Curify, the story moves from *"better content library"* to:

> *"Structured Template + Agent Planning > Free-form Prompting"*

That generalizes beyond Curify to a broader claim about how AI creation products should be built — useful for product positioning, research papers, and fundraising narratives in equal measure.

---

## Phased plan

| Phase | Effort | Deliverable |
|---|---|---|
| **P1 — Layer-1 pilot** | ~2 days | 100 (intent → gold template+slots) pairs labeled; baseline Template/Slot accuracy for the current agent prompt; regression test in place. |
| **P2 — Layer-3 pilot** | ~3 days | 20 of the 100 intents run through A/B/C, scored by GPT-4o judge. Sanity-check that the rubric discriminates. |
| **P3 — Full TAIC** | ~1 week | Full 100 × 3 approaches × 4 dimensions scored by 2-of-3 LLM jury. Public-style benchmark report. |
| **P4 — Layer-4 multi-turn** | ~1 week | 30 of the 100 promoted to multi-turn scripts; measure Turns-to-success + Success@3. |

**Out of scope (deliberately):**
- Training a custom judge model — use frontier APIs for v1
- Real-time benchmark dashboard
- Comparison against other agent products (Manus, GenSpark, etc.) — first prove the layer adds value vs. its absence

---

## Open questions for next pass

1. **Judge calibration** — at what point do we audit LLM-judge scores against human scores to validate the rubric? Sample 20 / 100 / 50?
2. **Image model isolation** — should all three approaches use the *same* image model, or do we also vary it? (Probably same model for v1; image-model comparison is a separate axis.)
3. **Multi-turn scripting** — pre-scripted user turns vs. an LLM playing the user? Latter is more realistic but adds variance.
4. **Refinement-quality metric** — how do we score whether each turn *improved* vs. oscillated? Pairwise judge?
5. **Cross-cultural intents** — does the same 100 work across en/zh/etc., or do we need per-locale query sets?

---

## Where this slots vs current work

This is **not P0**. Currently P0 is:
- Daily content drops (recurring)
- Funnel data check 2026-06-17 (#78)
- WC schedule TZ fix before knockouts (#82)

TAIC belongs to the **post-WC strategic window** (mid-July onwards), alongside the visual-search eval. The two should be planned together as a single benchmark workstream:

| Track | Doc | Lead question |
|---|---|---|
| Search-axis | `eval-framework-visual-search-benchmark-2026-06-14.md` | Which queries should we win, and have we? |
| Agentic-axis | `eval-framework-agentic-template-prompt-2026-06-15.md` (this) | Does our Template + Agent layer beat raw / engineered prompting? |

Pickup signal: after WC traffic relaxes (post knockouts ~2026-07-19), or earlier if a fundraising / positioning conversation needs the architecture-evidence story.
