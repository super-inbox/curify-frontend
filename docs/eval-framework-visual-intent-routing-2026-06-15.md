# Visual Intent Routing — eval framework

**Date filed:** 2026-06-15  ·  **Renamed from "Agentic Evaluation" 2026-06-17** (the agentic framing was too undefined; this name captures the actual problem).
**Status:** Strategic framing — not yet executed. Parallel companion to `docs/eval-framework-visual-search-benchmark-2026-06-14.md` (Curify vs Pinterest/Bing/Google/Canva search eval).

---

## TL;DR

Curify's core decision is **visual intent routing**: given a user query, which visual format best serves it?

```
Query: "Paris"

Should this become:
  ▸ Travel Poster?
  ▸ Travel Guide?
  ▸ Watercolor Map?
  ▸ City-Miniature Illustration?
  ▸ Vintage Travel Scrapbook?
```

That routing decision IS the product. Every Curify template represents one valid visual format for one or more query types; the matcher's job is to pick the right one (or 2-3 right ones). Everything downstream — parameter extraction, generation, rendering — only matters once the routing is right.

The eval has to measure the routing accuracy directly. Higher-order benchmarks (workflow, multi-turn, task success) build on top of it but **routing accuracy is the load-bearing metric**.

We had earlier framed this as "Agentic Evaluation" — that name was buzzy and undefined. "Visual Intent Routing" is sharper: it names the actual problem.

---

## The wrong frames

> "How well does Curify search compare to Pinterest?"
> "How smart is our agent?"
> "Does our LLM matcher beat raw prompting?"

These are second-order. The first-order question is **does the matcher pick the right visual format for the user's intent?** Get that wrong, every other metric is rearranging deck chairs.

## The right frame

> "Given a query that has multiple valid visual realizations, does the system route to the format the user actually wanted?"

Worked examples:

| Query | Valid formats (a sampling) | Right pick depends on |
|---|---|---|
| `Paris` | travel-poster · watercolor-map · city-miniature · travel-itinerary · vintage-scrapbook · landmark-collage | implied user goal (decoration vs planning vs souvenir) |
| `Messi` | celebrity-movie-group-poster · soccer-star-comic-retro-poster · player-vintage-stats-card · world-cup-team-sticker | use-case (fan poster vs stats nerd vs sticker pack) |
| `MBTI INFJ` | mbti-animal · mbti-generic · character-analysis · pop-culture-matching-chart · 9-traits-info-grid | personalization angle (animal mascot vs analysis vs match-with-X) |
| `dinosaurs` | species-deep-dive · kid-fun-fact-grid · ecology-book-spread · vocabulary-card · evolution-timeline | audience (kid education vs paleontology nerd vs vocab learner) |

The product is built on the implicit claim that **for each query, there's a single best visual format we can recover from intent signals.** The eval tests that claim.

---

## Four evaluation layers (bottom-up)

Same structure as before, just reframed under the VIR umbrella.

### Layer 1 — Template Routing Accuracy
The most tractable. Given a user input, the system picks ONE template (or 2-3 with the gold one in top-k).

```
Input:  "Make a retro soccer poster for Messi"
Gold:   template-soccer-star-comic-retro-poster
       (NOT: template-celebrity-movie-group-poster — different style axis)
```

Metric: **top-1 / top-3 routing accuracy** on a labeled set. The admin portal Agentic Eval tab (consider renaming to "Visual Intent Routing") operationalizes this. Lineage: function-calling / Berkeley FCL benchmarks.

**Connection to the 3-tier ontology:** the gold template lives in a 3D cell `Subject × Info-type × Layout` (see `docs/search-and-content.md#three-tier-ontology`). A correct route picks the cell that matches the user's implied (subject, info-type, layout). A wrong route picks a neighbor cell — usually right on subject, wrong on info-type or layout (e.g., picked a "single character profile" when the query implied "16-character matching chart"). The eval doubles as ontology validation.

### Layer 2 — Slot Accuracy
Did the system extract the right parameter values from the query?

```
Input:  "Messi poster"
Gold:   { star_movie_group: "Lionel Messi (Argentina)" }
```

Lower-stakes than routing — wrong template = wrong output; wrong slot = recoverable.

### Layer 3 — End-to-end Task Success Rate
LLM-judge rubric on the actual rendered image. Visual quality / instruction following / commercial usability / design consistency. Aggregate as TSR. This is the product-aligned metric — it tells us whether the routing decision actually paid off after generation.

### Layer 4 — Multi-Turn Routing Refinement
Real user sessions iterate. Same intent often produces multiple turns ("make it more vintage", "change style to comic"). Metric: turns-to-success, success@3 turns. Lineage: Anthropic Computer Use, OpenAI Agent Bench.

---

## Proposed benchmark: VIRB (Visual Intent Routing Benchmark)

(Earlier called TAIC — Template-Augmented Image Creation. Same content, renamed for consistency.)

### Query set (~100, balanced by AMBIGUITY)

- **Low ambiguity** (~30): query specifies subject + format clearly. `brazil 2026 world cup squad poster`, `mbti enfp personality poster`, `kids english animals vocabulary cards`. Routing here is the regression baseline — any drift signals deeper trouble.
- **Medium ambiguity** (~50): query specifies subject but format is implied. `Paris`, `Messi`, `MBTI INFJ`, `dinosaurs`. **This is where routing matters most.**
- **High ambiguity / multi-valid** (~20): query has multiple equally-valid routes. `Brazil` could be food / travel / WC / culture — ground truth here is a SET of acceptable routes, not a single gold.

### Comparators

All call the same image model — we isolate the prompt-layer + routing contribution.

| Approach | Pipeline |
|---|---|
| **A — Raw GPT** | User intent → image model directly. No routing, no template. |
| **B — Prompt Engineering** | User intent → hand-crafted detailed prompt → image model. Skilled-user baseline. |
| **C — Curify (today)** | User intent → LLM template-routing → structured prompt → image model. |
| **D — Curify + topic-augmented blob** | C with the matcher catalog blob enriched by `topics[] + archetype` (Section-B Option B from `project_section_b_evolution_options`). |
| **E — Curify hybrid** | C with taxonomy pre-filter then LLM ranker (Section-B Option C). |

### Judge + scoring

LLM jury (GPT-4o + Gemini + Claude, 2-of-3 agreement) on each rendered output: Visual / Instruction / Commercial / Consistency (0-5 each). Success = all four ≥ 3. Aggregate as TSR per approach.

### Output shape (illustrative)

```
Approach              Top-1 Route   Top-3 Route   TSR
A — Raw Prompting     —            —             62%
B — Prompt Eng        —            —             74%
C — Curify (today)    52%          78%           81%
D — + topic blob      66%          85%           87% (hypothetical)
E — Hybrid            71%          91%           90% (hypothetical)
```

The headline isn't absolute numbers; it's the **gap and where it comes from**. Specifically: how much of the TSR lift is attributable to better routing vs better generation prompts vs better LLM picks?

---

## Strategic framing

> **Search eval (companion doc):** Where do we already win on retrieval? Treats Pinterest as upstream demand signal.
> **Visual Intent Routing eval (this doc):** Does our routing layer actually pick the right visual format for the user's intent?

If VIR results favor Curify, the story moves from *"we have a good content library"* to *"we ship a routing layer that beats free-form prompting at picking the right visual format."* That's a defensible product claim, not a content claim — generalizes beyond Curify to how AI creation products should be built.

---

## Phased plan

| Phase | Effort | Deliverable |
|---|---|---|
| **P1 — L1 routing pilot** | ~2 days | 100 (intent → gold template+slots) pairs labeled in the admin dashboard. Establishes baseline top-1 / top-3 routing accuracy for the current matcher. |
| **P2 — L3 TSR pilot** | ~3 days | 20 of the 100 intents run through A/B/C, scored by GPT-4o judge. Sanity-check the rubric discriminates. |
| **P3 — Full VIRB** | ~1 week | Full 100 × 5 approaches × 4 dimensions scored by 2-of-3 LLM jury. Public-style benchmark report. |
| **P4 — Multi-turn L4** | ~1 week | 30 of the 100 promoted to multi-turn scripts; measure Turns-to-success + Success@3. |

**Out of scope (deliberately):**
- Custom judge model — use frontier APIs for v1
- Real-time benchmark dashboard
- Comparison against other agent products (Manus, GenSpark, etc.) — first prove the routing layer adds value vs its absence

---

## Open questions

1. **Multi-valid ground truth** — for high-ambiguity queries, how do we score "right" when 3 templates are all defensible? Top-k overlap? Human jury vote?
2. **Judge calibration** — at what sample size do we audit LLM-judge scores against human scores?
3. **Image model isolation** — same model across all approaches for v1, or also vary?
4. **Multi-turn scripting** — pre-scripted user turns vs LLM playing the user? Latter is more realistic but variance-heavy.
5. **Refinement-quality metric** — how do we score whether each turn improved vs oscillated? Pairwise judge?
6. **Cross-locale routing** — does the same 100 work across en/zh/etc., or do we need per-locale query sets? (Likely yes for top-2 locales.)

---

## Where this slots vs current work

This is **not P0**. Currently P0 is:
- Daily content drops (recurring)
- Daily WC recap (manual paste each morning)
- WC schedule TZ fix before knockouts (#82)

VIR work belongs to the **post-WC strategic window** (mid-July onwards), alongside the visual-search eval. The two are planned together as a single benchmark workstream:

| Track | Doc | Lead question |
|---|---|---|
| Search axis | `eval-framework-visual-search-benchmark-2026-06-14.md` | Which queries should we win, and have we? |
| Routing axis (this) | `eval-framework-visual-intent-routing-2026-06-15.md` | Does our routing layer pick the right visual format? |

Pickup signal: after WC traffic relaxes (post knockouts ~2026-07-19), or earlier if a fundraising / positioning conversation needs the routing-evidence story.
