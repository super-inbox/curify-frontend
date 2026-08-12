/**
 * Design-agent tool registry.
 *
 * ⚠️ NOT CANONICAL. `agentic-adhoc/design-agent-v0/curify-integration/
 * curify_background/app/agent_runtime/{registry,tools}.py` is the real registry
 * and is further along: capability lanes with an analyze → render → verify →
 * store quartet per lane, a bounded runtime, and typed schemas. This module
 * exists so the /design-agent demo can run entirely in the frontend; it should
 * migrate to calling the backend runtime rather than growing.
 * See design-agent-v0-spec.md §7h.
 *
 * One uniform schema over every capability the agent can invoke — templates,
 * freeform generation, programmatic composition, and the production pipelines
 * that still live as local Python. This is the layer the agent selects on, so
 * `description` is prompt real estate, not documentation.
 *
 * `mode` comes from the capability map in `curify-studio/docs/design-agent-v0-spec.md`
 * §7d. It is not a completeness rating — it tells the agent what it must DO and
 * whether the result can be checked deterministically:
 *
 *   direct        one call is the deliverable
 *   adjust        call with non-default params (only possible if the template
 *                 exposes them — several bake counts/labels into base_prompt)
 *   post_process  generate, then hand to a deterministic pipeline (cutline,
 *                 transparency, CMYK, bleed). Generation is never the deliverable.
 *   compose       decompose into N generations + programmatic layout. Never ask
 *                 one generation for an N-cell grid.
 *
 * Tools with `status: "gap"` are declared anyway, on purpose: the agent should
 * plan the correct step and say which tool would execute it, rather than
 * silently skipping it or faking the artifact.
 */

export type ExecutionMode = "direct" | "adjust" | "post_process" | "compose";
export type ToolStatus = "available" | "gap";
export type ImageNeed = "required" | "optional" | "none";

export type AgentTool = {
  id: string;
  label: string;
  /** Agent-legible: what it does and when to pick it. */
  description: string;
  mode: ExecutionMode;
  acceptsImage: ImageNeed;
  produces: "candidates" | "image" | "image_set" | "package" | "document" | "video";
  status: ToolStatus;
  /** Deterministically checkable output (drives the verify node). */
  checkable: boolean;
  /** For gaps: what already implements this, and why it isn't wired yet. */
  gap?: { implementedBy: string; blocker: string };
};

export const AGENT_TOOLS: AgentTool[] = [
  {
    id: "search_templates",
    label: "Find matching templates",
    description:
      "Search the 227-entry template capability KB for templates that can carry this request. " +
      "Returns ranked candidates with the generation parameters already filled. Always run first " +
      "unless the user explicitly asked for freeform generation.",
    mode: "direct",
    acceptsImage: "none",
    produces: "candidates",
    status: "available",
    checkable: true,
  },
  {
    id: "generate_from_template",
    label: "Generate from a template",
    description:
      "Run a chosen template with filled parameters. Use when a template matched with real " +
      "confidence — output is far more consistent than freeform. Pass a reference image for " +
      "templates that require one.",
    mode: "direct",
    acceptsImage: "optional",
    produces: "image",
    status: "available",
    checkable: false,
  },
  {
    id: "generate_freeform",
    label: "Generate freeform",
    description:
      "Text-to-image, or image-to-image when a reference image is supplied. Use when no template " +
      "matched, or the user wants something the catalog does not cover. Weaker layout control " +
      "than a template — do not use it for anything with strict structure.",
    mode: "direct",
    acceptsImage: "optional",
    produces: "image",
    status: "available",
    checkable: false,
  },
  {
    id: "compose_grid",
    label: "Compose a grid programmatically",
    description:
      "Lay N already-generated images into an exact R×C grid. Use whenever the user asks for a " +
      "specific number of cells (a 20-SKU sheet, a 3×3 set). Generate the cells separately and " +
      "compose here — a single generation cannot be trusted to emit an exact cell count.",
    mode: "compose",
    acceptsImage: "none",
    produces: "image_set",
    status: "available",
    checkable: true,
  },
  {
    id: "export_print_package",
    label: "Export a print/production package",
    description:
      "Turn artwork into a factory-ready package: transparent artwork, mm-accurate die-cut line, " +
      "CMYK PDF, spec sheet. Required for stickers/merch — a generated PNG is not a production file.",
    mode: "post_process",
    acceptsImage: "required",
    produces: "package",
    status: "gap",
    checkable: true,
    gap: {
      implementedBy: "curify-studio/dev/jayw/design-agent-v0/factory/sticker_exporter.py",
      blocker: "local Python, not exposed as a service. Needs an HTTP wrapper or a job type.",
    },
  },
  {
    id: "fold_dieline_3d",
    label: "Fold a dieline into a 3D proof",
    description:
      "Take a flat dieline (.ai/PDF) and render the folded box at true width × height × depth. " +
      "Use for any packaging request before print — a flat layout misrepresents the folded result.",
    mode: "post_process",
    acceptsImage: "required",
    produces: "image",
    status: "gap",
    checkable: true,
    gap: {
      implementedBy: "/tools/packaging-mockup",
      blocker: "shipped as a demo page, no callable endpoint yet.",
    },
  },
  {
    id: "assemble_pdf",
    label: "Assemble a print-ready PDF",
    description:
      "Bundle an ordered set of pages into a US-Letter, 200 DPI, print-safe PDF with captions. " +
      "Use as the final step of any multi-page pack (learning packs, brand decks).",
    mode: "post_process",
    acceptsImage: "none",
    produces: "document",
    status: "gap",
    checkable: true,
    gap: {
      implementedBy: "curify-frontend/scripts/images_to_pdf.py",
      blocker: "local Python script, no endpoint.",
    },
  },
  {
    id: "build_workflow_video",
    label: "Build a workflow demo video",
    description:
      "Render an asset set into a narrated 9:16 workflow video. Use only when the user explicitly " +
      "asks for a video — it is slow and expensive relative to the image steps.",
    mode: "compose",
    acceptsImage: "none",
    produces: "video",
    status: "gap",
    checkable: false,
    gap: {
      implementedBy: "curify-studio/dev/jayw/video_pipelines/*",
      blocker: "local ffmpeg pipeline; needs a worker job type.",
    },
  },
];

export const TOOLS_BY_ID: Record<string, AgentTool> = Object.fromEntries(
  AGENT_TOOLS.map((t) => [t.id, t]),
);

/** Compact catalog for the planner prompt — id, mode, image need, availability. */
export function toolCatalogForPrompt(): string {
  return AGENT_TOOLS.map(
    (t) =>
      `- ${t.id} [${t.mode}${t.status === "gap" ? ", NOT_YET_EXECUTABLE" : ""}` +
      `${t.acceptsImage !== "none" ? `, image:${t.acceptsImage}` : ""}]: ${t.description}`,
  ).join("\n");
}
