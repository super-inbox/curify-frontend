# Workstream: Multi-modal Commercial Agent Pipeline (Rong)

> _Also indexed as the "Agentic Image Generation, Editing & Translation" workstream — internal naming. The public / academic framing per the 2026-06-27 Gemini discussion is **Multi-modal Commercial Agent Pipeline**: a strongly-constrained, business-purpose agent that orchestrates production APIs (CV / NLP), not an open-ended exploratory agent._

> Filed 2026-06-23. **Reframed 2026-06-27** with the production-workflow framing from `raw/search-discovery-06-27/Gemini-discussion.txt`. Owner: **Rong** (UMD Stats PhD). Sits under **Tooling & Engineering**
> ([`workstream-tooling-and-engineering.md`](workstream-tooling-and-engineering.md))
> and is the execution arm of the **Visual Intent Routing / Generative Retrieval** thesis
> ([`curify-frontend/docs/eval-framework-visual-intent-routing-2026-06-15.md`](../../curify-frontend/docs/eval-framework-visual-intent-routing-2026-06-15.md)).
> Living doc.

---

## 0. Reframing note (2026-06-27)

The earlier framing of "open-ended agentic image research" was the wrong target for our stage. **Industry's working AI agents are 80% `if/else` over hand-curated tool calls** — what looks like "agentic" in product is in practice a strongly-typed router over a small set of production APIs. So the project is reshaped:

- ❌ Don't build: open-ended autonomous agents, exploratory tool-use research, custom CV model training.
- ✅ Do build: a **probabilistic intent router** that decides which production API gets called for each user query, plus the orchestration that wires the calls together into a deliverable artifact.

**Externally** (resume / paper / LinkedIn): _"Designed a probabilistic Intent Routing mechanism and an orchestration Agent that dynamically calls multi-modal tools (CV / NLP APIs) to automate e-commerce and merch workflows."_ Reads as PhD-level systems work — appropriate for a Stats PhD.

**Internally**: an MVP that takes a user upload + a merch intent, calls Photoroom-style segmentation (or Segment Anything), adds 3mm white border, calls an LLM to draft 3 caption slogans, typesets them onto the cutout. One concrete user-visible artifact per cycle. Strongly-constrained, strongly-typed. No vague "agent thinks" steps.

---

## 1. Thesis

The agent is one strongly-typed loop. No vague "agent thinks" steps — every node is either a router (decides which next call) or a tool call (executes a deterministic action). Conditionals are observable in logs; failures point to the responsible node.

```
user query / image / intent
        │
        ▼
  ① INTENT ROUTING ──▶ pick the right visual format(s) + tool(s)
        │                (template · image2image workflow · translation tool)
        ▼
  ② GENERATION / EDITING ──▶ run the tool (text→image, image2image, translate)
        │
        ▼
  ③ INTERACTIVE EDITING ──▶ multi-turn refine (re-route, swap workflow, re-run)
```

### Worked example: from query to merch artifact (one loop, ~6 calls)

This is the concrete shape Rong's agent should hit by end of Phase 4. Each step is a single API call against an existing tool — orchestration, not reasoning.

```
USER:  "make a sticker pack from this anime character image"
              │
              │  [INTENT ROUTING — probabilistic classifier]
              ▼
   Slot extraction:  subject = "anime character"
                     intent = "merch"
                     format = "sticker pack"
                     transparent_bg = TRUE
                     count = 6-12 emotions
              │
              │  [TOOL CALL — segmentation API]
              ▼
   Segment-Anything / Photoroom  →  cutout PNG (alpha channel)
              │
              │  [TOOL CALL — border + padding]
              ▼
   ImageMagick  →  add 3mm white border, square padding
              │
              │  [TOOL CALL — emotion variation via template]
              ▼
   template-ip-character-sprite-emoji-sheet  →  9-cell emotion grid
              │
              │  [TOOL CALL — print spec sheet]
              ▼
   PDF assembly  →  CMYK + bleed marks + die-cut outline
              │
              ▼
   RETURN:  6-up sticker sheet + print-ready PDF + tagged transparent PNGs
```

Every node is either a router (line 1) or a deterministic tool call. The "agent" intelligence lives in the routing decision (which path to take given the intent) — NOT in any kind of free-form reasoning. That keeps it debuggable, cheap, fast, and resume-worthy without exposing the team to open-ended agent research risk.

### What the agent is and isn't

| ✅ The agent IS | ❌ The agent IS NOT |
|---|---|
| A probabilistic intent router with ~12 well-typed slots | An exploratory LLM running open-ended reasoning |
| An orchestration layer over 6-10 known production APIs | A net-new CV/NLP model we train ourselves |
| Strongly conditioned on observable user inputs | Implicitly conditioned on hidden "agent state" |
| Logged at every routing decision + tool call | A black-box "the agent did this and we don't know why" |

We already have most of the **building blocks** (bucket A) and the **surfaces**
that run them. What's weak is the **brain** (bucket B — routing + the data it
routes over) and the **inputs/coverage** (bucket C — task set, crawl, tool gaps).
The Multi-modal Commercial Agent Pipeline = wire the brain to orchestrate the building blocks, fed by a real task set. Routing accuracy is the load-bearing metric — get it wrong and everything downstream is rearranging deck chairs (per the VIR eval doc).

---

## 2. What we have

### A. Tools & workflows (the building blocks)
- **Tool registry** — `curify-frontend/lib/tools-registry.ts` (`TOOL_REGISTRY`):
  video + image tools, each with `groupId`, backend `job_type`, demo. Inventory
  + maturity table in [`tool-inventory.md`](tool-inventory.md).
- **Manga translation** — HF Space `https://huggingface.co/spaces/Curify/manga_translation`.
  Script works with minor tweaks; **not yet in the tool registry / backend
  pipeline**. This is the "translation" leg of the triad and the closest-to-ready
  net-new tool.
- **image2image + design workflows** — all implemented as **preset prompts →
  one freeform endpoint** (`POST /nano-freeform/generate` →
  `NANO_FREEFORM_GENERATION`, image as reference). Two registries:
  - `curify-frontend/lib/gallery_production_tiles.tsx` — the 6 gallery design tiles.
  - `curify-frontend/lib/template_workflows.tsx` — template-specific workflows.
  - Shared reference-image upload: `app/[locale]/_components/ReferenceImageUpload.tsx`.
  Key property: **adding a workflow = adding a prompt; no backend work.** This is
  the agent's action space for generation + editing.
- **Reproduce/workbench surfaces** (where a human runs the loop today):
  `GalleryReproduceSurface.tsx`, `ExampleReproduceSurface.tsx`,
  `ReproduceTemplateSection.tsx` — Source · Make-it-yours · Production columns
  (see [`reproduction-surface-review-2026-06-21.md`](reproduction-surface-review-2026-06-21.md)).

### B. Intent routing V0 + eval (the brain — preliminary)
- **Router V0** — `curify-frontend/lib/searchTemplateMatch.ts`: gpt-4o-mini,
  served via `/api/search-template-match`, rendered in `GenerableTemplatesSection`.
  **Two known weaknesses (stated 2026-06-23):**
  1. **Recall** — misses valid templates for a query.
  2. **Foundational data** — the model only sees `CATALOG_BLOB`, built from
     `allow_generation=true` templates' EN description + param names. That's a
     thin, lossy description of *what each template can actually generate* —
     image2image workflows and tools aren't represented at all. The router can't
     route to capabilities it can't see.
- **Multi-intent V0 design** —
  [`curify-frontend/docs/progress_report_baobao/6.17/multi-intent-v0-design_副本.md`](../../curify-frontend/docs/progress_report_baobao/6.17/multi-intent-v0-design_副本.md)
  (design, not built). Companion eval set `docs/multi-intent-eval-v0.md` is
  **empty — to be populated**.
- **Intent taxonomy** — `curify-frontend/docs/progress_report_baobao/6.18/intent_taxonomy.ts`
  (8 creation-intent clusters: learning-materials, visual-art, merch-commerce,
  social-personal, storytelling-identity, travel-place, events-hot-now, diy-guides).
- **Eval framing** —
  [`eval-framework-visual-intent-routing-2026-06-15.md`](../../curify-frontend/docs/eval-framework-visual-intent-routing-2026-06-15.md)
  (routing accuracy = load-bearing) + the search benchmark
  [`eval-framework-visual-search-benchmark-2026-06-14.md`](../../curify-frontend/docs/eval-framework-visual-search-benchmark-2026-06-14.md)
  + seed set [`search-eval-set.md`](../../curify-frontend/docs/search-eval-set.md).

### C. Inputs & coverage (ad-hoc / thin)
- **WC daily recap** crawls news but **ad-hoc** — `scripts/oneoff_wc_daily_recap_test.cjs`
  + hand-authored `scripts/configs/wc_daily_recap_*.json` per day, template
  `template-wc-daily-recap-poster`. Maps to the `events-hot-now` intent cluster;
  the "hot now → generate" loop is currently a manual ritual.
- **Liblib** (`liblib.art`) exposes many image tools/workflows we don't have —
  an external map of the action space we're missing.
- **Task set** — there is no sizeable, domain-grounded task set. Routing recall
  can't be measured or improved without one; the eval is blocked on it.

---

## 3. Gaps → why agentic needs each P0

| Gap | Symptom | Fix |
|---|---|---|
| No capability index | router recall low; can't see image2image/tool actions | **P0-1** |
| No task set | eval empty; recall unmeasurable | **P0-2** |
| Translation tool not productized | manga-translation stuck in a HF Space | **P0-3** |
| Hot-now is hand-cranked | WC recap ad-hoc, doesn't generalize | **P0-4** |

---

## 4. P0 items (Rong)

### P0-1 — Build the capability index (foundational routing data) ⭐ load-bearing
A single structured registry of **what each action can generate** — spanning
templates, image2image/design workflows, and tools (manga translation, dubbing,
etc.) — keyed for the router/agent to route over. For each entry: id, kind
(template / workflow / tool), input modes (text / image / image+text), output
description, example outputs, intent-cluster tags, params/capabilities.
- **Why:** directly fixes both routing weaknesses (recall + foundational data) —
  `searchTemplateMatch`'s `CATALOG_BLOB` is the thin precursor to replace.
- **Reuse, don't reinvent:** derive from `nano_templates.json` topics/params,
  the two workflow registries, `TOOL_REGISTRY`, and the taxonomy — auto-derived,
  not hand-curated (see the `template_subjects` / taxonomy patterns).
- **Output:** a generated `capability_index.json` + the builder; the router
  consumes it instead of `CATALOG_BLOB`.

### P0-2 — Assemble the task / eval set from open-source data
Populate the empty `multi-intent-eval-v0.md` (and the VIR benchmark) with a real,
sizeable task set drawn from open-source data in the problem domain (query →
intended visual format(s); image-in → desired edit; text → translation). Large
enough to measure recall meaningfully.
- **Why:** unblocks the eval — recall/routing accuracy is unmeasurable today.
- **Anchor:** the VIR eval's layered metrics (routing → slot → task-success →
  multi-turn); reuse `search-eval-set.md` as the seed format.

### P0-3 — Productize manga translation into the tool registry
Take the working HF Space script (minor tweaks), extract logic into
`curify_background/app/utils/*`, add a thin `app/pipelines/*` wrapper, wire
`dispatch` + `JobType` + `tools-registry.ts` (per the pipeline-wrapper
architecture). It's the translation leg of the triad and the nearest-ready
net-new tool — also the agent's first non-generation action.

### P0-4 — Generalize the WC recap crawl → a reusable event→generation pipeline
Turn the ad-hoc WC news crawl into a parameterized "hot-now" pipeline (source →
extract → structured config → template render) that any `events-hot-now` topic
can drive, not just the World Cup. This is the first end-to-end *agentic* loop
(detect hot topic → route to format → generate) and removes a manual ritual.

### P0-5 — Ship the worked-example merch loop end-to-end (the demo artifact) ⭐
The thesis worked-example above ("anime character image → 6-up sticker pack PDF") **as a single user-facing flow.** Stitches P0-1 (capability index) + P0-2 (task set) + the existing freeform pipeline + a segmentation API call into one button. **Deliberately scoped narrow** — one input mode, one output mode, one routing decision — so the orchestration logic is provable end-to-end before generalizing.

- **Why now:** every Rong-track artifact for resume / LinkedIn / fundraising boils down to "show the loop running." This is that. Without it, the work is a stack of unhooked modules.
- **Concrete acceptance:** an authenticated user uploads an image, picks "make sticker pack," and within ~60s receives (a) the 6-up sticker sheet + (b) a print-ready PDF + (c) the underlying transparent PNGs. Every routing decision visible in admin logs.
- **External framing:** the demo IS the deliverable. Used as the LinkedIn-post hero (per the VIR doc Appendix B) and as the "what the agent does" panel in the next fundraising deck.

---

## 5. P1 / backlog
- **Liblib tool-gap mining** — map `liblib.art`'s tool/workflow taxonomy, diff
  against our registries, file the high-value missing workflows (each is a preset
  prompt → freeform; cheap to add).
- **Router recall upgrade** — re-implement `searchTemplateMatch` over the P0-1
  capability index; measure against the P0-2 task set.
- **Multi-intent V0 build** — implement the baobao design (3–5 sub-intent chips)
  once the capability index + task set exist.
- **Interactive editing agent loop** — multi-turn refine on the freeform
  substrate (re-route / swap workflow / re-run) layered on the workbench surfaces.
- **Agent orchestration layer** — the loop runner that ties routing → tool call →
  result → next-turn over the capability index.

---

## 6. References
- Tool registry: `curify-frontend/lib/tools-registry.ts` · inventory: [`tool-inventory.md`](tool-inventory.md)
- Manga translation: `https://huggingface.co/spaces/Curify/manga_translation`
- Workflows: `curify-frontend/lib/gallery_production_tiles.tsx`, `lib/template_workflows.tsx`; freeform pipeline `curify_background/app/pipelines/nano_freeform_pipeline.py`
- Router V0: `curify-frontend/lib/searchTemplateMatch.ts`
- Intent routing eval: `curify-frontend/docs/eval-framework-visual-intent-routing-2026-06-15.md`
- Search benchmark: `curify-frontend/docs/eval-framework-visual-search-benchmark-2026-06-14.md` · seed set `docs/search-eval-set.md`
- Multi-intent design: `curify-frontend/docs/progress_report_baobao/6.17/multi-intent-v0-design_副本.md` · taxonomy `…/6.18/intent_taxonomy.ts`
- WC recap: `curify-frontend/scripts/oneoff_wc_daily_recap_test.cjs` + `scripts/configs/wc_daily_recap_*.json`
- Reproduce surfaces review: [`reproduction-surface-review-2026-06-21.md`](reproduction-surface-review-2026-06-21.md)
- Pipeline architecture: [`workstream-tooling-and-engineering.md`](workstream-tooling-and-engineering.md) → Productization
