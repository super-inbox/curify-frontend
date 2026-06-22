import { Images, LayoutGrid, Printer, Shapes, type LucideIcon } from "lucide-react";
import { PRODUCTION_TILES } from "./gallery_production_tiles";

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
  kind: "transform" | "soon";
  /** Preset image2image prompt — present for kind "transform". */
  prompt?: string;
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
const IG_GRID = wf(
  "ig-grid", "Instagram 9-grid", "Sliced for feed", LayoutGrid,
  "Render the attached image as a single picture divided into a 3x3 grid (9 equal square tiles) with thin even gutters between tiles, so it reads as one image split into 9 Instagram carousel posts. Preserve the original content across the tiles.",
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
    workflows: [PRINT_POSTER, IG_GRID, VECTOR_ICONS],
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
    test: /poster|infographic|chart|board/i,
    workflows: [PRINT_POSTER, IG_GRID, VECTOR_ICONS],
  },
];

export function getTemplateWorkflows(templateId: string): TemplateWorkflow[] {
  if (OVERRIDES_EXACT[templateId]) return OVERRIDES_EXACT[templateId];
  for (const rule of PATTERN_RULES) {
    if (rule.test.test(templateId)) return rule.workflows;
  }
  return DEFAULT_WORKFLOWS;
}
