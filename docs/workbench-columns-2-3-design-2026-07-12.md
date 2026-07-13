# Design — Workbench Columns 2 & 3 (variation controls + context-aware designer pack)

> Filed 2026-07-12. Frontend design for the shared 3-column `ReproduceWorkbench`.
> Builds on the image-workflow-page design (`image-workflow-page-design-2026-07-11.md`)
> + the Output-Intent axis (`lib/output_intent.ts`). Column 3 tiling lives in
> `lib/template_workflows.tsx`.
>
> **Status (2026-07-12):**
> - ✅ **Column 3 quick wins SHIPPED** (jwang/vercel `fb42b733`): dedupe poster tiles,
>   moodboards ≠ Instagram 3×3, "Read this" vs "Watch video" for vocab.
> - ✅ **Flashcard "Print PDF" SHIPPED** (frontend `03bcfe95`; backend `jwang/pack-pdf`
>   — `format=pdf` on `/template-packs/download`, needs merge+deploy).
> - ✅ **"Make print-ready" (bleed) SHIPPED** (jwang/vercel `037313c4`): poster-output
>   results add a bleed margin instead of recomposing (`makePrintReady`).
> - ⏸️ **TODO — HELD: Column 2 style + layout variation** (the large item below). Not
>   started; deferred by the user 2026-07-12. Resume from the "Column 2" section.

## Problem

Columns 2 (Make it yours) and 3 (designer pack) are one-size-fits-all:
- **Column 2** only exposes a template's text params — no way to vary *style* or
  *layout* (single vs 3×3) even when a template supports it.
- **Column 3** shows a coarse, intent-derived tile set that produces redundant or
  nonsensical actions (two near-identical poster tiles; an Instagram 3×3 offered on
  a brand moodboard; "Print poster" offered on something that is *already* a poster).

---

## Column 2 — style + layout variation (advanced, opt-in per template)

**Concept.** A template/tool has a **default style** and a **default layout**
(single vs 3×3 / grid). Some templates support *variations* of each; advanced users
can change both **before** generation. Not all templates allow this — it's tag-gated.

**New tagging (template-level, `nano_templates.json`).** No `style`/`layout` field
exists today (only `batch`, `topics`, `use_cases`). Add optional:
```jsonc
"style_variations": ["default", "watercolor", "flat-vector", "vintage"],  // omit = no style control
"layout_variations": ["single", "grid-3x3"],                              // omit = fixed layout
"default_style": "default",
"default_layout": "single"
```
- `layout` connects to the existing **`batch`** flag (batch templates = grid-capable);
  reconcile the two so we don't tag the same thing twice.
- Keep it opt-in: a template with neither field renders column 2 exactly as today.

**UI (column 2).** Under the params, an **"Advanced"** disclosure (collapsed by
default) with a Style picker + a Layout toggle — rendered only when the template
carries the tags. Selection feeds the generate call as prompt modifiers / params.

**Generation.** Style + layout become suffixes/params the backend appends to the
template's `base_prompt` (e.g. layout `grid-3x3` → a 3×3 sheet directive; style
`watercolor` → a style directive). Prefer a small server-side modifier map keyed by
tag value over free-text so output stays controlled (image2image hygiene rule).

**Effort:** large (tagging schema + a curated style/layout registry + col-2 UI +
generation wiring + validation). Phase on its own.

---

## Column 3 — context-aware designer pack

The tile set must react to **(a) the template's output type** and **(b) whether the
current result is already that artifact**. Concrete fixes to `template_workflows.tsx`:

1. **Dedupe the two poster tiles.** `DEFAULT_WORKFLOWS` includes "Poster / wallpaper"
   (`D.poster`) *and* there's a separate `PRINT_POSTER` — on a poster result both show
   and read as duplicates (seen on travel posters). Rule: never show `D.poster` and
   `PRINT_POSTER` together; pick one by intent.

2. **"Print poster" is wrong when the result is ALREADY a poster.** Recomposing a
   poster into a poster is circular. When the source/result is a poster (poster intent,
   or `content_shape`=poster), swap `PRINT_POSTER`'s action from *recompose* to
   **"Make print-ready"** = add **bleed margin** + safe-area (a print-prep pass, not a
   re-gen). This is the on-ramp to the pre-press pipeline (`project_designer_copilot_prepress_moat`).

3. **Narrow the `/board/` pattern.** `PATTERN_RULES` matches `/poster|infographic|chart|board/`
   → offers `IG_GRID`. A **brand moodboard** (`brand-identity-moodboard-visual-system-poster`)
   doesn't want an Instagram 3×3. Drop `board`/`moodboard` from the IG-grid pattern (or
   route moodboards to a moodboard-appropriate set: resize, print-ready, palette/icon extract).

4. **Icon-set from a poster.** `VECTOR_ICONS` ("extract subjects → flat icon set")
   already does this; ensure it's offered for poster/travel results (it is for travel via
   PATTERN_RULES — keep it, just dedupe the poster tiles around it).

5. **Travel poster specifically.** Today travel → `[PRINT_POSTER, IG_GRID, VECTOR_ICONS]`.
   Good set; the redundancy the user sees is `D.poster` (from DEFAULT) vs `PRINT_POSTER`
   when a travel template falls to the `remix`/DEFAULT path. Fix by (1) above.

**Effort:** items 1/3/5 are quick rule edits; item 2 (print-ready/bleed) is medium
(needs the print-prep action — client-side bleed/safe-area or a backend pass).

---

## Column 3 — per-category action LABELS

**"Read this" vs "Watch video".** The `video-show` tile currently always says
"Watch video". For **vocabulary / education templates** whose asset is a
narrative/reading piece (not the `intro_video_url` used by visual templates), label it
**"Read this"** to distinguish. Ties into the narrative-vs-intro video split already
logged in `project_image_to_video_tile` (per-example narrative `video_url` for the 4
language templates vs template `intro_video_url`). Rule: label by template category —
education/vocab → "Read this"; visual/social → "Watch video".

**Effort:** small (conditional label in `videoShowWorkflow` / the tile, keyed on intent
or a `content_type`).

---

## Flashcards — "Print PDF" as the strong action

Education/flashcard templates should lead column 3 with **"Print PDF"**: bundle the
whole pack into a **print-ready PDF** the user can print at once. We already have
**download packs** (`batchDownload` in `UnifiedActionBar`/`ReproduceWorkbench`) — the
pieces exist; convert the pack images into a single multi-page (or N-up) PDF client-side
(a pdf lib like `jspdf`/`pdf-lib`) and expose it as the primary education CTA.

**Effort:** medium (pack→PDF assembly + wire as the `education`-intent lead tile).

---

## Phasing

- **Quick wins (rule/label edits in `template_workflows.tsx`):** dedupe poster tiles (1),
  narrow `/board/` (3), keep icon-set for travel (5), "Read this" label for vocab.
- **Medium:** "Print poster → Make print-ready (bleed)" when already a poster (2);
  flashcard "Print PDF" from packs.
- **Large (own phase):** column-2 style + layout variation — tagging schema + registry +
  UI + generation + validation.

## Non-goals (v1)
- Backend style/layout prompt-modifier service (design the tags first; wire generation after).
- The full pre-press bleed pipeline (item 2 starts with a simple client-side bleed/safe-area).
