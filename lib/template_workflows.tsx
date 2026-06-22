import {
  Sticker,
  Shirt,
  Frame,
  Images,
  LayoutGrid,
  Printer,
  Shapes,
  type LucideIcon,
} from "lucide-react";

/**
 * Template-specific "Production" workflows for the example-page workbench
 * (Column 3). Unlike the gallery surface — whose source image is loosely
 * defined, so it gets the generic transform tiles — a template is highly
 * determined, so its Column 3 should offer template-appropriate deliverables.
 *
 * Sourcing (decided 2026-06-21): a sensible DEFAULT set for every template +
 * hand-curated OVERRIDES for flagship templates (exact id) and broad PATTERN
 * rules (by id substring). Cheap to expand — add ids/patterns over time. No
 * per-template metadata exists in nano_templates.json, so this registry is the
 * single source of truth.
 *
 * Two kinds:
 *  - `transform`: a real image2image generation on the current result (or the
 *    example image) via the freeform pipeline — same mechanism as the gallery
 *    tiles. The prompt is written as an explicit image-edit instruction.
 *  - `soon`: a deliverable we don't produce yet (PDF / A3 print / IG 9-grid /
 *    vector extract). Rendered visible-but-disabled so we capture demand-signal
 *    clicks without faking output. Wire to a real pipeline later.
 */
export type TemplateWorkflow = {
  key: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  kind: "transform" | "soon";
  /** Preset image2image prompt — required for kind "transform". */
  prompt?: string;
};

const transform = (
  key: string,
  label: string,
  hint: string,
  icon: LucideIcon,
  prompt: string,
): TemplateWorkflow => ({ key, label, hint, icon, kind: "transform", prompt });

const soon = (
  key: string,
  label: string,
  hint: string,
  icon: LucideIcon,
): TemplateWorkflow => ({ key, label, hint, icon, kind: "soon" });

// Shared transforms (mirror the gallery production tiles; prompts say "the
// attached image" because the backend sends the reference image first).
const STICKER = transform(
  "sticker", "Sticker pack", "Die-cut, white border", Sticker,
  "Turn the attached image into a die-cut sticker: isolate the main subject as a clean cutout with a thick white border and a subtle drop shadow, bold vibrant flat colors, plain light background. Preserve the subject's identity and key features.",
);
const MERCH = transform(
  "merch", "Merch mockup", "Tee · mug · tote", Shirt,
  "Use the design from the attached image as artwork placed on realistic product mockups: a t-shirt, a ceramic mug, and a tote bag arranged together, soft studio lighting, clean neutral background, e-commerce catalog style.",
);
const POSTER = transform(
  "poster", "Poster / wallpaper", "Print-ready framing", Frame,
  "Turn the attached image into a polished poster / wallpaper: balanced composition, rich lighting, tasteful negative space for typography, high-resolution print-ready framing. Keep the main subject as the focal point.",
);

const DEFAULT_WORKFLOWS: TemplateWorkflow[] = [
  STICKER,
  MERCH,
  POSTER,
  soon("a4-pdf", "A4 print PDF", "High-res export", Printer),
];

// Exact-id overrides for flagship templates.
const OVERRIDES_EXACT: Record<string, TemplateWorkflow[]> = {
  "template-portrait-retouching-blueprint": [
    transform(
      "before-after", "Before / After collage", "小红书-ready split", Images,
      "Create a clean before-and-after collage from the attached image: left panel the original, right panel the retouched/enhanced version of the same person, with subtle 'BEFORE' and 'AFTER' labels, social-ready vertical layout. Preserve the person's identity.",
    ),
    soon("beauty-poster", "医美海报排版", "Clinic poster layout", LayoutGrid),
    soon("a4-print", "A4 print PDF", "High-res export", Printer),
  ],
};

// Broad pattern rules (matched against the template id, after exact overrides).
const PATTERN_RULES: { test: RegExp; workflows: TemplateWorkflow[] }[] = [
  {
    test: /travel.*map|map.*travel|itinerary|city-?guide/i,
    workflows: [
      soon("a3-print", "A3 300DPI print", "High-res export", Printer),
      soon("ig-grid", "Instagram 9-grid", "Sliced for feed", LayoutGrid),
      soon("vector-icons", "Vector landmark icons", "Extract as SVG", Shapes),
    ],
  },
  {
    test: /health|wellness|clinic|medical|nutrition/i,
    workflows: [
      soon("flyer-set", "Clinic flyer set", "Multi-size pack", LayoutGrid),
      soon("a4-print", "A4 print PDF", "High-res export", Printer),
      POSTER,
    ],
  },
  {
    test: /poster|infographic|chart|board/i,
    workflows: [POSTER, MERCH, soon("a3-print", "A3 300DPI print", "High-res export", Printer)],
  },
];

export function getTemplateWorkflows(templateId: string): TemplateWorkflow[] {
  if (OVERRIDES_EXACT[templateId]) return OVERRIDES_EXACT[templateId];
  for (const rule of PATTERN_RULES) {
    if (rule.test.test(templateId)) return rule.workflows;
  }
  return DEFAULT_WORKFLOWS;
}
