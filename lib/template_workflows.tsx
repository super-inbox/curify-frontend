import { Crop, Images, LayoutGrid, PlayCircle, Printer, Scissors, Shapes, type LucideIcon } from "lucide-react";
import { PRODUCTION_TILES } from "./gallery_production_tiles";
import { getOutputIntent, type OutputIntent } from "./output_intent";

/**
 * Template-specific "Production" workflows for the example-page workbench
 * (Column 3).
 *
 * Implementation mirrors the gallery surface exactly (decided 2026-06-21):
 * EVERY design workflow is just a preset prompt sent through the freeform
 * pipeline (POST /nano-freeform/generate → NANO_FREEFORM_GENERATION) with the
 * current result / example image as the reference. There is NO dedicated
 * "design workflow" backend — the gallery's 6 tiles are preset prompts, and we
 * emulate that here. So even deliverable-style workflows (print poster, IG
 * 9-grid, vector icons, flyer set) are expressed as image-gen prompts that
 * produce the visual equivalent, not as a separate export backend. Labels avoid
 * literal file-spec claims (no "300DPI/CMYK") since the output is a rendered
 * image, not a true print file.
 *
 * Sourcing: DEFAULT = the same 6 workflows the gallery uses (reused verbatim) +
 * hand-curated OVERRIDES for flagship templates (exact id) + broad PATTERN rules
 * (by id substring). Cheap to expand.
 *
 * The `soon` kind is retained in the type for any genuinely un-promptable future
 * deliverable, but nothing uses it today — every workflow is a live transform.
 */
export type TemplateWorkflow = {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  // "transform"  = preset image2image prompt through the freeform pipeline;
  // "resize"     = client-side canvas export (no backend, no credits);
  // "video-show" = reveal an already-rendered template intro video (free, instant);
  // "soon"       = un-promptable future deliverable (placeholder).
  kind: "transform" | "resize" | "soon" | "video-show" | "print-ready";
  /** Preset image2image prompt — present for kind "transform". */
  prompt?: string;
  /** Relative CDN video path — present for kind "video-show". */
  videoUrl?: string;
};

// "Watch video" tile for the ~109 templates that already ship a rendered intro
// video (nano_templates.json `intro_video_url`). Clicking it just reveals the
// existing MP4 — zero credits, no backend call. The video URL is threaded in
// from the server page (never import the template JSON into the client surface;
// see memory project_client_bundle_data_leak). Prepended to the workflow list
// so image→video is the first thing a B2B user sees in column 3.
export function videoShowWorkflow(
  videoUrl: string,
  opts?: { label?: string; hint?: string },
): TemplateWorkflow {
  // Vocabulary / education templates carry a readable narrative asset, so the
  // caller labels it "Read this" to distinguish from the visual templates'
  // "Watch video" intro (see project_image_to_video_tile).
  return {
    key: "video-show",
    label: opts?.label ?? "Watch video",
    hint: opts?.hint ?? "See this template in motion",
    icon: PlayCircle,
    kind: "video-show",
    videoUrl,
  };
}

// P0-4: One-Click Resize Bundle — the first real "Completion" deliverable.
// Handled client-side (canvas cover-crop to the 3 social aspect ratios) by the
// surface, not the freeform backend — see lib/resize_bundle.ts.
const RESIZE_BUNDLE: TemplateWorkflow = {
  key: "resize-bundle",
  label: "Resize for socials",
  hint: "9:16 · 1:1 · 16:9",
  icon: Crop,
  kind: "resize",
};

const wf = (
  key: string,
  label: string,
  hint: string,
  icon: LucideIcon,
  prompt: string,
): TemplateWorkflow => ({ key, label, hint, icon, kind: "transform", prompt });

// DEFAULT = the gallery's 6 design workflows, reused verbatim (emulate the
// gallery). Same preset prompts, same freeform pipeline.
const DEFAULT_WORKFLOWS: TemplateWorkflow[] = PRODUCTION_TILES.map((tile) => ({
  key: tile.key,
  label: tile.label,
  hint: tile.hint,
  icon: tile.icon,
  kind: "transform" as const,
  prompt: tile.prompt,
}));

// Reusable template-specific deliverable workflows (all real preset prompts).
const PRINT_POSTER = wf(
  "print-poster", "Print poster", "Print-ready layout", Printer,
  "Recompose the attached image as a print-ready poster: the artwork as a large central hero, balanced margins, clean space reserved for a title and a short caption, crisp high detail, portrait orientation. Keep the original subject and style.",
);
// When the result is ALREADY a poster, "Print poster" (recompose) is circular —
// use this client-side print-prep pass instead: add a bleed margin so the poster
// can be trimmed without white edges. No re-gen, no credits (lib/resize_bundle
// makePrintReady). The on-ramp to the pre-press pipeline.
const PRINT_READY: TemplateWorkflow = {
  key: "print-ready",
  label: "Make print-ready",
  hint: "Add bleed margin for printing",
  icon: Scissors,
  kind: "print-ready",
};
const IG_GRID = wf(
  "ig-grid", "Instagram 9-grid", "9 separate tiles", LayoutGrid,
  "Render the attached image as a single edge-to-edge composition arranged as a 3x3 grid of 9 equal square tiles with NO gutters, borders, or gaps between tiles, so it can be cleanly sliced into 9 separate square images that together reconstruct the whole. Preserve the original content across the tiles.",
);
const VECTOR_ICONS = wf(
  "vector-icons", "Vector icon set", "Flat minimalist icons", Shapes,
  "Extract the key subjects/landmarks from the attached image and render them as a clean set of flat, minimalist vector-style icons arranged on a plain neutral background — consistent line weight, limited cohesive color palette, evenly spaced.",
);

// Exact-id overrides for flagship templates.
const OVERRIDES_EXACT: Record<string, TemplateWorkflow[]> = {
  "template-portrait-retouching-blueprint": [
    wf(
      "before-after", "Before / After collage", "小红书-ready split", Images,
      "Create a clean before-and-after collage from the attached image: left panel the original, right panel the retouched/enhanced version of the SAME person, with subtle 'BEFORE' and 'AFTER' labels, social-ready vertical layout. Preserve the person's identity and features.",
    ),
    wf(
      "beauty-poster", "Beauty poster", "Aesthetic-clinic promo", LayoutGrid,
      "Compose the attached portrait into a polished aesthetic-clinic promotional poster: the person as the hero image, elegant typographic space for a headline and three short service bullets, soft premium color palette, vertical poster format. Keep the person's identity.",
    ),
    PRINT_POSTER,
  ],
};

// Broad pattern rules (matched against the template id, after exact overrides).
const PATTERN_RULES: { test: RegExp; workflows: TemplateWorkflow[] }[] = [
  {
    test: /travel.*map|map.*travel|itinerary|city-?guide/i,
    workflows: [PRINT_READY, IG_GRID, VECTOR_ICONS],
  },
  {
    test: /health|wellness|clinic|medical|nutrition/i,
    workflows: [
      wf(
        "flyer-set", "Clinic flyer", "Wellness flyer layout", LayoutGrid,
        "Lay out the attached image as a professional clinic/wellness flyer: a clear headline area at the top, the image as the hero, two or three short caption blocks with small icons, clean medical aesthetic, vertical flyer format.",
      ),
      PRINT_POSTER,
      IG_GRID,
    ],
  },
  {
    // Brand moodboards / design boards / VI packs / spec sheets: a print-ready
    // presentation + element-extraction + resize. NOT an Instagram 3x3 — a board
    // isn't a feed post (per the 2026-07-12 column-3 review). Must precede the
    // broad poster rule since these ids also end in "-poster".
    test: /moodboard|mood-board|visual-system|brand-identity|design-board|design-specification|vi-full|visual-pack/i,
    workflows: [PRINT_READY, VECTOR_ICONS, RESIZE_BUNDLE],
  },
  {
    // "board" dropped from this pattern — moodboards/design-boards handled above;
    // it was over-matching them into the Instagram-grid set.
    test: /poster|infographic|chart/i,
    workflows: [PRINT_READY, IG_GRID, VECTOR_ICONS],
  },
];

// P0-3: column-3 ordered by the template's Output Intent, so the FIRST tile is
// the intent's "completion" action. Reuses existing tiles (all real transforms)
// + the client-side resize bundle. Looked up by key from the gallery defaults.
const D = Object.fromEntries(DEFAULT_WORKFLOWS.map((w) => [w.key, w])) as Record<string, TemplateWorkflow>;

const INTENT_WORKFLOWS: Record<OutputIntent, TemplateWorkflow[]> = {
  // post-ready sizes first, then feed grid + poster
  social: [RESIZE_BUNDLE, IG_GRID, D.poster],
  // printable material first, then a coloring/line-art printable + share
  education: [PRINT_POSTER, D.lineart, IG_GRID],
  // product mockup + die-cut sticker + print-ready
  merch: [D.merch, D.sticker, PRINT_POSTER],
  // wall-art deliverables — print-ready poster + a watercolor render + an icon
  // set extracted from it (dropped the gallery "Poster / wallpaper" tile: it
  // overlapped "Print poster"; dedupe below also guards this globally).
  "print-art": [PRINT_READY, D.watercolor, VECTOR_ICONS],
  // infographic-style deliverables
  presentation: [PRINT_POSTER, IG_GRID, VECTOR_ICONS],
  // riffing / style exploration — the original 6 style tiles
  remix: DEFAULT_WORKFLOWS,
};

// "Print poster" and the gallery "Poster / wallpaper" tile overlap — never show
// both (keep the more actionable print-poster). Also collapse any repeated key.
function dedupeWorkflows(list: TemplateWorkflow[]): TemplateWorkflow[] {
  const hasPosterTile = list.some((w) => w.key === "print-poster" || w.key === "print-ready");
  const seen = new Set<string>();
  const out: TemplateWorkflow[] = [];
  for (const w of list) {
    if (hasPosterTile && w.key === "poster") continue;
    if (seen.has(w.key)) continue;
    seen.add(w.key);
    out.push(w);
  }
  return out;
}

export function getTemplateWorkflows(templateId: string): TemplateWorkflow[] {
  // Exact overrides and specific pattern rules win over the broad intent layer.
  const base =
    OVERRIDES_EXACT[templateId] ??
    PATTERN_RULES.find((rule) => rule.test.test(templateId))?.workflows ??
    INTENT_WORKFLOWS[getOutputIntent(templateId)] ??
    DEFAULT_WORKFLOWS;
  return dedupeWorkflows(base);
}
