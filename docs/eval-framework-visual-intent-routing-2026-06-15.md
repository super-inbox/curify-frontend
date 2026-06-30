# Visual Intent Routing — eval framework
### (a.k.a. Generative Retrieval for Template Recommendation)

**Date filed:** 2026-06-15  ·  **Renamed from "Agentic Evaluation" 2026-06-17** (the agentic framing was too undefined; this name captures the actual problem). · **Reframed 2026-06-27** with the GPT-discussion paradigm split (Constrained Generative / Multi-path / KB / Hybrid) and intern-attached deliverables.
**Status:** Strategic framing — not yet executed. Parallel companion to `docs/eval-framework-visual-search-benchmark-2026-06-14.md` (External Signals for Visual Search Evaluation, Baobao's track). **Owner: Rong** (UMD Stats PhD).

---

## TL;DR

Curify's core decision is **visual intent routing** — equivalent in CS terms to **Generative Retrieval over a finite (~300) Template Label Space**. Given a user query, which visual format best serves it?

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

We had earlier framed this as "Agentic Evaluation" — that name was buzzy and undefined. "Visual Intent Routing" is sharper: it names the actual problem. The complementary academic framing — **"Generative Retrieval for Template Recommendation"** (per the 2026-06-27 GPT discussion) — captures the same thing in terms a CS reviewer recognizes:

```
Open-domain natural-language query  →  finite Template ID set (~300)
```

The key structural fact is the **small label space**. Industrial recommendation systems wrestle with millions of items; Curify has 300. Almost every algorithmic shortcut that's impractical at millions becomes practical at 300 — constrained generation with a trie, exhaustive multi-path retrieval, full-graph KB lookup. **That's the research wedge.**

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

### Comparators — three retrieval paradigms + hybrid

Reframed 2026-06-27 per the GPT discussion. Each is a distinct **retrieval paradigm**, not just a variant of "the same approach with more polish." Two intern-quarters of work can credibly build all four because the label space is 300, not 3M.

| ID | Paradigm | Pipeline | Why it might win |
|---|---|---|---|
| **A — Embedding baseline** | Dense retrieval | Query embedding → cosine vs precomputed template embeddings → top-k | Fast, no training; calibrates the floor |
| **B — Multi-path Retrieval** | Decomposed sparse | Query → LLM rewrite + decomposition slots (subject/style/scene/output) → parallel scoring against `topics ∪ tags` → re-rank by hit-count-across-paths | Already partly shipped as P0.2 (`docs/search-retrieval-improvement-plan-2026-06-25.md`). Best for compound queries (`青铜打工小兽`) where no single embedding match exists |
| **C — Knowledge-Based Retrieval** | Symbolic graph | Concept graph (Subject × Info-type × Layout) → graph walk → template at the cell | Best for canonical, semantically-named queries (`MBTI Marvel` → `mbti-marvel` cell, single hop). Trivially explainable |
| **D — Constrained Generative Retrieval** | LLM-as-router | LLM generates Template IDs directly, output constrained by a trie over the 300 valid IDs | Best for novel / specific queries (`Generate a watercolor map poster of Kyoto` — composes three facets the catalog has separately). End-to-end + reasoning |
| **E — Hybrid (Retriever → Reranker)** | RAG-style | KB pre-filter + Multi-path → LLM re-ranker over the union | Industrial mainline (Perplexity, OpenAI, Claude). Best overall, but masks where the lift comes from — only fair after A-D are individually measured |

Plus two **non-Curify baselines** to keep the routing-layer claim honest — without these the experiment can't distinguish "good routing" from "good image model":

| ID | Baseline | Pipeline |
|---|---|---|
| **0a — Raw image model** | User intent → image model directly. No routing, no template. |
| **0b — Skilled prompt engineering** | User intent → hand-crafted detailed prompt → image model. Skilled-user ceiling for "do we even need templates?" |

### The meta-routing observation

The most interesting research finding wouldn't be "Approach X wins overall." It would be **"different query types are won by different paradigms":**

| Query | Best paradigm | Why |
|---|---|---|
| `MBTI Marvel` | C (KB) | Single edge: `MBTI × Marvel` → `mbti-marvel`. Embedding under-uses the structure |
| `青铜打工小兽` | B (Multi-path) | Compound; no single match exists; decomposition is the only signal |
| `Generate a watercolor map poster of Kyoto` | D (Constrained Gen) | Three facets to compose; LLM reasoning excels |
| `messi wallpaper` | A (Embedding) | Direct single-template match — embedding is the cheap floor |

So the real product question becomes:

```
Query  →  Query-type classifier  →  Retriever choice  →  Templates
```

That's a tractable two-month research project for one Stats PhD with end-to-end value to the product.

### Judge + scoring

LLM jury (GPT-4o + Gemini + Claude, 2-of-3 agreement) on each rendered output: Visual / Instruction / Commercial / Consistency (0-5 each). Success = all four ≥ 3. Aggregate as TSR per approach.

### Product-aligned metrics (alongside Recall / NDCG)

Traditional IR metrics (Recall@K, NDCG@K) ask "did we find the labeled gold." Curify needs additional metrics that ask "did the user *get a usable creation:*"

| Metric | Definition | Why it matters here |
|---|---|---|
| **Template Coverage** | % of queries that hit ≥ 1 *usable* template (route exists AND `allow_generation=true`) | Catches the "we have a template for this in principle but the router can't see it" failure mode |
| **Generation Success Rate** | Conditional on Coverage, % of routes that yield a TSR-passing render | Closes the loop from "route picked" → "thing actually generated well." Decouples routing errors from generation errors |
| **Template Diversity (Top-K)** | Distinct (subject × info-type × layout) cells covered by the top-K returns | Catches the "5 different MBTI templates returned for one query" failure — top-K should cover the creation-direction tree, not pile up in one cell |
| **Cold-start Robustness** | TSR on queries that introduce concepts post-cutoff (`青铜打工小兽`, last-week's viral compound) | Tests whether the system generalizes vs only retrieves what it's seen labeled |

These four are the gates Curify cares about; Recall/NDCG remain on the dashboard for academic comparability with retrieval literature.

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

## The founder's question — why Curify isn't GPT-with-extra-steps

Filed 2026-07-01. Every AI app-layer founder needs to be able to answer in one sentence: *"Why don't I get killed by OpenAI's next release?"* Caught myself thinking "I'll just generate a blog illustration in GPT" — and that's a useful tell. It means for **low-effort, low-stakes content consumption** (a one-off meme), Curify isn't irreplaceable. Good. Cuts through the noise and exposes where the actual moat lives.

This section names the three moats and ties each one back to a measurable hypothesis in **this** eval. If any moat fails to show up in the VIR results, that's a signal to invest harder in that surface — not to retreat from it.

### Moat 1 — Deterministic typography vs probabilistic pixels

**Frontier-model behavior:** prompt → DALL-E / Imagen → an RGB raster. Text spelling is often wrong, fonts are randomized, kerning is inconsistent. To ship the asset you re-open Canva or Figma and re-layer the text by hand.

**Curify behavior:** the template layer carries the typography contract — vector positions, font choices, character-accurate text, brand-safe sizing. The diffusion model is delegated to *only* the background or stylized illustration; the words are rendered by the template layer.

**Frontier output = unedited pixels. Curify output = production-ready asset.** The value isn't "we generate images" — it's filling the last mile between AI generation and shipping.

> **Eval hypothesis:** Layer 3 (Task Success Rate) on the rubric dimension **"commercial usability / design consistency"** should be significantly higher for Curify routes than for prompt-only frontier-model outputs on the same query. If TSR shows no gap here, the typography moat is theoretical — we should invest in the template-layer rendering quality before anything else.

### Moat 2 — Visual discovery / routing vs the blank canvas

**Frontier-model behavior:** a textbox. Assumes the user knows what they want *and* knows how to describe it. Most people — including operators and pros — have blank-canvas paralysis. They don't know what meme compositions exist; they can't describe the humor in words.

**Curify behavior:** a visual catalog. Browse the gallery, see a finished "FDE pushing-car" poster, click [Run], swap a slot. The user doesn't write prompts — they pick from best-practices that already work.

**Frontier model = terminal. Curify = GUI with pre-installed templates.** The product is the *catalog plus routing*, not the generator.

> **Eval hypothesis:** Layer 1 (Routing Accuracy) — for **underspecified queries** (single noun, single name) Curify's routing layer should outperform prompt-only frontier models. The frontier model can only render what you describe; we can show what you didn't know to ask for. If Curify's routing top-3 ≤ frontier's top-3 on the underspecified-query slice, the visual-discovery moat is just packaging — invest in the routing layer (KB, multi-path, hybrid — all four of paradigms A/B/C/D/E).

### Moat 3 — Workflow / asset bundling vs single-shot generation

**Frontier-model behavior:** one prompt = one image. A real blog post needs a 16:9 banner, a 1:1 social-card, a 9:16 short-video cover — three prompts, three styles, zero coherence.

**Curify behavior:** one input (`Theme: FDE engineer's daily life`) → coordinated bundle: banner + meme + LinkedIn card, all on the same style spine.

**Frontier model = generation. Curify = orchestration.** The customer doesn't pay for pixels; they pay for the 30 minutes they would have spent in Canva and Photoshop stitching aspect ratios together.

> **Eval hypothesis (extension to VIR v2):** add a **bundle-success** metric to Layer 3 — for the subset of intents that have a natural multi-asset deliverable (blog, launch, listing), measure whether the system returns a coherent multi-aspect set vs N disjoint singles. This isn't in v1 of the VIRB schema; it's the natural Phase-5 extension once single-asset routing is stable.

### Synthesis — engine vs chassis

GPT / Gemini = **engine.** Raw horsepower for generation.
Curify = **chassis + steering + assembly line.** Wraps the engine in templates (chassis), font rendering + size control (steering), and multi-aspect packaging (assembly line) — outputs a car the customer can drive without knowing how engines work.

**Founder's directive:** do not optimize for prompt-tuning over the engine. The R&D leverage is in the template layer (typography, layout-as-code), the routing layer (this eval), and the workflow layer (bundling). Frontier-model improvement is a tailwind, not a threat — *as long as the moat is here and not in our prompting prowess*.

This is **why the VIR eval matters more than search-eval-vs-Pinterest**: search-eval asks *"do we have the content?"* (a content claim); VIR asks *"does our layer add value the engine can't"* (a product claim). The latter is what survives the next OpenAI keynote.

---

## Phased plan — 8 weeks, Rong-owned

The Phase split below is the 2026-06-27 reframe: build the benchmark first, then implement the three retrieval paradigms as separate baselines, then the constrained-generation prototype, then the hybrid. Each phase ships a deliverable on its own — no big-bang.

| Phase | Effort | Deliverable |
|---|---|---|
| **Phase 1 — Benchmark** | 2 weeks | 200 (query → gold template ID[s]) pairs labeled in the admin dashboard. Top-1 / Top-3 / Top-5 metrics + the four product-aligned metrics above. Doubles as the seed for the Section A / Section B current matcher's regression baseline. |
| **Phase 2 — Three baselines (A, B, C)** | 2 weeks | Implement Embedding baseline (A), Multi-path Retrieval (B, mostly already shipped as P0.2), and KB-based retrieval (C) as independent endpoints. Score each against the benchmark; produce the by-paradigm × by-query-type win-rate table. |
| **Phase 3 — Constrained Generative Retrieval (D)** | 2 weeks | Prototype only — LLM (GPT-4 / Claude) with a trie constraint over the 300 template IDs. Not training; pure inference. Compare against the baselines on the same benchmark. |
| **Phase 4 — Hybrid (E) + meta-routing** | 2 weeks | (a) Hybrid retriever → reranker over the union of A/B/C. (b) Meta-router: train a lightweight query-type classifier that picks among A/B/C/D per query. Final report = the win-rate table + the LinkedIn / technical post. |

**Out of scope (deliberately):**
- Custom judge model — use frontier APIs for v1.
- Real-time benchmark dashboard.
- Comparison against other agent products (Manus, GenSpark, etc.) — first prove the routing layer adds value vs its absence.
- Heavy model training. The label space is 300 — anything that needs a million-example fine-tune is the wrong tool.

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

---

## Appendix A — Series structure (combined with Baobao's track)

Per the GPT framing, the two intern tracks compose into a three-post sequence — Baobao's "find the gaps" track and Rong's "close the gaps" track converge into the same Search & Discovery story:

| # | Title | Lead | Source doc |
|---|---|---|---|
| 1 | **External Signals for Visual Search Evaluation** | Baobao | `docs/eval-framework-visual-search-benchmark-2026-06-14.md` |
| 2 | **Generative Retrieval for Template Recommendation** | Rong | this doc |
| 3 | **Self-improving Visual Search** | both | (planned — written after #1 + #2 ship) |

This positions the interns as co-authors on a unified Search & Discovery thesis (Baobao = "discover gaps," Rong = "solve gaps"), without forcing them onto the same task.

---

## Appendix B — Draft LinkedIn / technical post (deliverable for Phase 4)

> **Working title:** *Generative Retrieval for Template Recommendation: When the Label Space Is Only 300, You Don't Need a Big Model*

```
Most retrieval research is set in the million-item regime — billions of
products, infinite docs. The hard part is "how do we find the needle."

Curify's catalog has 300 templates.

That single fact flips which algorithms make sense. Approaches that are
impractical at scale — exhaustive multi-path retrieval, trie-constrained
generative routing, full graph walks — become trivially practical. And
the question stops being "how do we find the needle" and becomes "which
visual format should the user have used in the first place?"

We tested four retrieval paradigms over 200 labeled queries against a
catalog of 300 image-generation templates:

  A. Embedding baseline (dense retrieval)
  B. Multi-path retrieval (query decomposition into subject/style/scene)
  C. Knowledge-base retrieval (Subject × Info-type × Layout graph)
  D. Constrained Generative Retrieval (LLM with trie over template IDs)

The headline finding wasn't "X wins." It was:

  Different query types are won by different paradigms.

  - Canonical queries (`MBTI Marvel`) → KB wins
  - Compound queries (`bronze worker mythical beast`) → Multi-path wins
  - Compositional queries (`watercolor map poster of Kyoto`) → ConstrGen wins
  - Direct queries (`messi wallpaper`) → Embedding wins

So the right architecture is a query-type-aware meta-router that picks
the retrieval paradigm per query, not a single algorithm. We measured
[XX]% top-3 routing accuracy with the meta-router vs [YY]% with any
single paradigm.

The product metric we cared most about wasn't NDCG — it was
"Generation Success Rate" (did the user actually walk away with a
usable rendered image). The meta-router lifted GSR from [ZZ]% to
[AA]% over our prior single-LLM-matcher baseline.

If your label space is small and the user wants to *make* something
rather than *find* something, the standard recommender-system playbook
underweights everything except the embedding baseline. Worth questioning.

— Rong, Curify Labs
```

The bracketed numbers fill in after Phase 4. Drafting it now so the experiments are framed against a known publication target — keeps the work from drifting into pure exploration.
