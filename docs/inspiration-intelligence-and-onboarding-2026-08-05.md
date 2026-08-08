# Inspiration Intelligence & Designer / Merch Onboarding — Strategy Spec

**Status:** strategy / roadmap (2026-08-05). Digested from `raw/inspiration-onboarding-08-05/discussion.txt`.
**Owner:** growth / platform. **Linked from:** [`docs/search-and-content.md`](./search-and-content.md) Thread d.

---

## 0. Thesis — Inspiration → Understanding → Production

Users don't lack prompts. They lack **a visual AI brain that understands design language, commercial use, and production flow.** That is the wedge:

```
Pinterest  →  inspiration        (find references)
Canva      →  execution          (lay it out yourself)
Curify     →  the middle          Inspiration → Understanding → Production
```

Curify's job is the middle layer that turns a reference into *understood, generatable, producible* design work. This is the same core as the "**no prompt needed — still get designer-grade output**" thesis (see memory `project_zero_prompt_workflow`) and the demand behind the Design Agent (`project_design_agent_v0`).

## 1. Three layers — related but NOT one thing

The earlier "designer入驻 marketplace" framing failed because it fused four things (community / creator marketplace / content library / affiliate). Separated, there are **three distinct layers**, to be sequenced, not merged:

| # | Layer | What it is | Phase |
| --- | --- | --- | --- |
| 1 | **Inspiration Intelligence** | content acquisition + design-knowledge extraction (supply of *understanding*) | **now** |
| 2 | **Designer / Studio onboarding** | supply-side creator graph | next |
| 3 | **Affiliate / Monetization** | distribution + revenue | later |

The mistake to avoid is treating them as one product. Layer 1 is the moat and the cold-start-free entry point; Layers 2–3 compound on top of it.

---

## 2. Phase 1 (now) — AI-curated Inspiration Engine

### 2.1 Don't scrape Pinterest — Pinterest is a visual *index*, not an asset source

Most pins sit in front of a higher-authority source: a designer portfolio, an Etsy shop, a Shopify store, Behance / Dribbble, a studio website, a blog/tutorial. Caching Pinterest images is a copyright + technical dead end. The correct link is:

```
Visual query
      ↓
Find high-authority sources        (portfolio / Etsy / Shopify / Behance / studio / blog)
      ↓
Extract visual knowledge
      ↓
Curify creative-intelligence layer
```

= **Google Search + Pinterest + AI**, not a Pinterest clone.

### 2.2 The moat is "extract design knowledge," NOT "cache images"

Caching website images → just another Pinterest. The asset is the **structured design understanding** distilled from each reference. Example — one tea-packaging image becomes:

```
Object:      tea package, botanical illustration
Style:       oriental minimalism
Color:       sage green, beige, gold
Typography:  serif, vertical Chinese text
Material:    matte paper, foil stamping
Use case:    premium tea brand, gift packaging
Workflow:    packaging → poster → ecommerce banner
```

That ontology — not the pixels — is what compounds. It maps directly onto the existing 3-tier ontology + format axis in [`docs/search-and-content.md`](./search-and-content.md) Thread b (subject × information-type × layout, plus `content_shapes` / `content_styles`), extended with **material**, **commercial use case**, and **downstream workflow** dimensions the current taxonomy doesn't yet carry.

### 2.3 Pipeline

```
Query
  ↓
Search engine                  (discover, don't crawl a walled garden)
  ↓
Source discovery               (rank high-authority origins per query)
  ↓
Scrape metadata / images       (from the SOURCE, with provenance + attribution)
  ↓
Vision model                   (gemini-3-pro-image-preview / vision) → describe
  ↓
Extract ontology               (object/style/color/type/material/use-case/workflow)
  ↓
Store embedding                (+ structured attributes + source link)
  ↓
Curify search                  (retrieval over understanding, not just tags)
```

### 2.4 Scope — 100 query clusters × ~100 sources

Seed clusters (aligned to the priority topics now leading the entry bar — merch, product, education, branding, packaging):

- **Branding:** tea packaging · coffee branding · skincare packaging · luxury candle branding
- **Merch:** cat sticker design · anime merch · cute character design
- **Education:** Chinese flashcards · Montessori worksheet · …

Each query → ~100 high-quality sources → extracted into the knowledge base.

### 2.5 Why this unblocks the Design Agent

The Design Agent's real gap isn't the model — it's the **missing design knowledge base** (which is also why the eval set is hard to assemble). With Phase 1, a request like *"Create a premium Chinese tea brand"* stops relying on LLM imagination and instead retrieves:

```
5000 tea-packaging examples  +  design attributes  +  successful commercial patterns  +  factory constraints
```

…then generates. This is the retrieval substrate for `project_design_agent_v0` and the pre-press moat (`project_designer_copilot_prepress_moat`), and it doubles as the visual-search eval corpus (`project_visual_search_eval_framework`).

---

## 3. Phase 2 (next) — Designer AI Workspace (supply-side)

This is the real creator onboarding — but **not** framed as "Upload your portfolio" (nobody does that; Behance / Dribbble / 小红书 / personal sites already exist). Frame it as **"Create your AI-powered portfolio / workspace."**

A designer uploads ~10 cases → Curify auto-generates:

```
Designer profile
  + Style fingerprint  (their "design DNA", e.g. "minimal Japanese poster")
  + Portfolio website
  + AI remix examples  (generate-similar in their style)
  + Lead-generation page
```

**Value exchange:** the designer gets exposure + inbound leads; Curify gets *content + a creator graph*. The hook that actually pulls: **"your work becomes an AI-searchable, generatable, commercializable design asset."** Not a new social network to maintain — an amplifier of work they already have.

---

## 4. Phase 3 (later) — Affiliate / Monetization

Affiliate ≠ designer marketplace. They monetize different sides:

- **Etsy / POD (affiliate fits):** a design (e.g. "Halloween cat sticker") → "Make this into: sticker / mug / hoodie" → "Buy materials: Printful · Gelato · StickerMule" → affiliate revenue. Natural, because the intent is already commercial.
- **Designer (affiliate does NOT fit):** designers monetize via **leads / commission / marketplace fee**, not affiliate links.

---

## 5. The Creative Graph + revenue map

```
                 Curify Creative Graph

              Content Intelligence          ← Phase 1 (the substrate)
                     │
   Designer ──────  Curify  ────── Merch / Ecommerce
                     │
                 Workflows                   ← what we just shipped (topic workbenches)

Revenue:
  Designer   → leads / marketplace fee
  Ecommerce  → affiliate / SaaS
  Content    → SEO traffic
```

Content Intelligence is the hub; Designer (supply) and Merch/Ecommerce (demand) attach to it; Workflows are the production surface (the merch/product/brand 3-column workbenches + brand 5-step ladder shipped 2026-08-05, see `project_topics_nav_workbench`).

---

## 6. Sequencing & anti-patterns

**Do Phase 1 first — it has no cold-start.** Designer partnerships are a cold-start problem (they need a reason to join). What we lack today is *content intelligence*, not a *creator network*, so build the intelligence layer first; designer contribution comes later, once there's a graph worth joining.

**Explicitly avoid (all later-stage, do NOT start now):**

- ❌ Pinterest clone
- ❌ Designer social network
- ❌ Affiliate marketplace
- ❌ Creator marketplace

**Shortest path:**

```
Google/Pinterest-style discovery → AI design understanding → Workflow generation → Designer contribution later
```

---

## 7. Relationship to existing work

- **Elevates Thread d** (`docs/search-and-content.md` — Upstream inspiration / demand sensing): today Thread d senses demand (search-no-result / template-gap / reddit / GSC) to feed content generation. This spec reframes the same inspiration surface as a **design-knowledge intelligence layer** — the output isn't just "what to generate next," it's a reusable, retrievable understanding corpus.
- **Feeds Thread b** (tagging + taxonomy): the extracted ontology extends the 3-tier + format axis with material / commercial-use / workflow dimensions. Reconcile with `project_taxonomy_competitor_reverse_engineering` (mining Pinterest/Freepik/Canva/Getty trees).
- **Substrate for the Design Agent** (`project_design_agent_v0`) and pre-press moat (`project_designer_copilot_prepress_moat`); doubles as the visual-search eval corpus (`project_visual_search_eval_framework`).
- **Production surface already exists:** the topic workbenches + brand workflow (`project_topics_nav_workbench`).

## 8. Legal / copyright guardrail

The whole point is to **extract knowledge/attributes and link back to the source**, not cache or republish others' images. Store: the structured ontology + embedding + a canonical source URL (for attribution and click-through). This is the same reason we route "Visual query → high-authority source," not "scrape Pinterest."

## 9. Open questions / next steps

1. **Source-discovery ranking:** how to score "high-authority source" per query (domain authority + visual quality + commercial signal). Start manual on the first 5 clusters, then learn.
2. **Knowledge store:** JS/BM25 over structured blobs (like today's search) vs a real vector store — same open question flagged for the recommendation layer in Thread b, item 2. Decide once corpus > ~5k records.
3. **Extraction schema v0:** lock the ontology fields (object / style / color / typography / material / use-case / workflow) as a versioned schema before bulk extraction, so re-extraction is cheap.
4. **Eval tie-in:** wire the first cluster's corpus into `project_visual_search_eval_framework` as retrieval ground truth.
5. **Phase-2 gating:** define the "10 cases → workspace" MVP only after Phase 1 has a non-trivial corpus (the designer hook depends on the graph already being valuable).
