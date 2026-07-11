# Design — Centralized 3-Column Image Workflow Page

> Filed 2026-07-11. Frontend architecture design. Status: **design (not yet built)** —
> the plan-first deliverable before implementation. Related: the Omni-Input Launcher
> front-door (agentic doc `curify-studio/docs/workstream-agentic-image-rong.md` §P0-6).

## Goal

Collapse the 3-column image workbench — today **embedded inline in three separate
surfaces** — into **one canonical image workflow page** that every entry point funnels
into. The page is a *surface of the unified project route* (chosen 2026-07-11: "unify
under the project route, different surfaces by `job_type`"), so it reuses the existing
project-load infrastructure and sits next to the video project surface.

**One-liner:** _a source (upload · template preset · a finished result) opens in the same
3-column workbench, no matter where the user came from._

## Current state (what we're consolidating)

- **The 3-column layout** = `app/[locale]/_components/ReproduceWorkbench.tsx`
  (Source · Make-it-yours · Production/designer-pack). `col1` has two variants today:
  - `mode: "source"` — a static/existing image is column 1 (example page).
  - `mode: "upload"` — column 1 IS the reference-image upload (tool / detail page).
  It is **embedded inline** in 3 places:
  - `EcommercePhotoGenerate.tsx` (the image tool pages — `ecommerce-photo`, `ai-product-photo-generator`),
  - `ReproduceTemplateSection.tsx` (nano template detail page),
  - `ExampleReproduceSurface.tsx` (nano example page).
  There is **no standalone workbench page**.
- **Project views are split by type** under `app/[locale]/(app)/`:
  - `project_details/[id]` — the **video** project view (tabbed segments / export dialog).
  - `image-project/[id]` — a **flat** image view (shows the result + download; no workbench).
  - `magic/[id]` — another variant.
  `WorkspaceClientPage.tsx` already routes clicks to different ones by type (lines ~220/266/268).
- **Omni-Input Launcher** (homepage "Start a workflow", shipped `jwang/vercel`) — the
  common front-door that detects a source and routes to a pipeline.

## Target architecture

### 1. The unified project route with surfaces
The project detail route renders a **surface chosen by `job_type`**:
- `NANO_TEMPLATE_GENERATION` / `NANO_FREEFORM_GENERATION` (image) → **the 3-column workbench surface** (new).
- video job types → the existing tabbed segment/export surface.
- (others keep their current surface.)

The **image surface = `ReproduceWorkbench` promoted to a full-page surface**, loading its
`col1` from the project. Net-new `col1` variant needed:
- `mode: "result"` — column 1 is the project's **generated result** (so the user continues
  producing from it: resize bundle, mockups, print-ready, stickers — the column-3 pack).

So `col1` variants after this work: `source` (example) · `upload` (fresh) · **`result`** (a project's output).

### 2. Entry points all funnel in
| Entry | Today | After |
|---|---|---|
| **Image SEO tool pages** (`/tools/ecommerce-photo`, `ai-product-photo-generator`, …) | embed the workbench inline | stay as **SEO landing + CTA** → deep-link into the workflow page seeded with the tool's **template preset** (`col1: upload`) |
| **Workspace image clicks** | → `image-project/[id]` (flat view) | → the workflow page (project **result** loaded, `col1: result`) so the user can keep iterating |
| **Home "Start a workflow" (Omni-Input)** | routes to tool pages | **common entry for image + video**: image source → workflow page; video source → video flow |
| **Nano example / template pages** | embed the workbench inline | (Phase 2+) may keep inline for SEO, or add "Open full workflow" — decide by SEO impact |

### 3. Parameterization (how each entry seeds the page)
The workflow page needs to accept a **seed** describing what fills column 1 + which template/preset drives production:
- `projectId` → load the project, `col1: result` (workspace / re-open).
- `templateId` (+ optional pre-uploaded `ref` blob_url) → `col1: upload` with the template's prompt/params (tool CTA / Omni-Input image).
- `exampleId` → `col1: source` (from a gallery example).

These map to the seed the Omni-Input already wants to pass (`?src=` / `?ref=` / `?template=`),
closing the "source-carry" follow-up noted in P0-6.

## Key tensions / decisions to resolve during build

1. **CREATE surface vs POST-generation page.** `ReproduceWorkbench` is today a *pre-generation
   create* surface; a project page is *post-generation*. The unified page must do both — the
   `col1: result` variant is exactly the bridge (start from an output, keep producing). Column 3
   (designer pack) already operates on "the latest result or the source", so this is a natural fit.
2. **Tool-page SEO.** The image tool pages **rank** (lever #1, `project_why_no_image_gen`). Moving
   the workbench off them risks inline-conversion loss. Mitigation: keep the SEO body + a prominent
   CTA into the workflow page; optionally keep a lightweight inline try. **Decide per tool with the
   growth signal — do not strip the inline workbench blindly.**
3. **Auth.** The workflow page lives under `(app)` (authed). Tool/example pages are public. The
   CTA hand-off must carry the seed through sign-in (the ReferenceImageUpload sign-in gate pattern).
4. **Deep-link/source-carry.** Requires the page to read `projectId` / `templateId` / `ref` and
   seed the workbench — the same wiring deferred in the Omni-Input v1.

## Phasing (implementation plan)

1. **Phase 1 — the page.** Add the image surface to the unified project route: render
   `ReproduceWorkbench` for image `job_type`, with a new `col1: "result"` variant that loads a
   project's output via `projectService`. Ship behind the existing `image-project/[id]` route first
   (smallest blast radius) or the unified route per the decision above.
2. **Phase 2 — workspace.** Re-point image-project clicks in `WorkspaceClientPage` to the workflow
   page (result loaded).
3. **Phase 3 — tools as entry points.** Convert the image tool pages to SEO-landing + CTA that
   deep-links into the workflow page with the template preset (guarding SEO per tension #2).
4. **Phase 4 — Omni-Input.** Wire the launcher's image path (and the `?ref=`/`?template=` carry)
   to open the workflow page seeded with the dropped source — the common image+video front-door.

## Out of scope (v1)
- The video surface stays as-is (only the routing/unification touches it).
- No backend changes — this is a frontend consolidation over existing `projectService` + `ReproduceWorkbench`.
- The pre-press / sticker production tools themselves (separate roadmap) — the workflow page just
  hosts them as column-3 actions when they exist.
