import {
  Sticker,
  Paintbrush,
  BookOpen,
  PenLine,
  Shirt,
  Frame,
  type LucideIcon,
} from "lucide-react";

/**
 * Production tiles for the gallery reproduce surface — one-click image2image
 * transforms that turn the source image into "useful design work".
 *
 * Each tile is just a freeform generation (NANO_FREEFORM_GENERATION) with a
 * preset transform prompt and the source image auto-attached as the reference,
 * so there is NO new backend — it rides the same pipeline as the custom remix
 * (services/useFreeformGenerate). Outputs land in the user's workspace.
 *
 * Per the Curify-Translate roadmap (raw/reproduction-surface-06-19): ship the
 * easy buttons first, watch CTR / generation-rate / download-rate, then promote
 * the high-frequency ones to dedicated models. So this list is intentionally
 * cheap to edit/reorder — it's the experiment surface, not a fixed contract.
 *
 * Prompts are written as explicit image-edit instructions ("the attached
 * image") because the backend sends the reference image first and these prompts
 * verbatim (see imagen_service._call_gemini_sync).
 */
export type ProductionTile = {
  key: string;
  label: string;
  /** Short helper shown under the label. */
  hint: string;
  icon: LucideIcon;
  /** Preset transform prompt applied to the source/reference image. */
  prompt: string;
};

export const PRODUCTION_TILES: ProductionTile[] = [
  {
    key: "sticker",
    label: "Sticker pack",
    hint: "Die-cut, white border",
    icon: Sticker,
    prompt:
      "Turn the attached image into a die-cut sticker: isolate the main subject as a clean cutout with a thick white border and a subtle drop shadow, bold vibrant flat colors, plain light background. Preserve the subject's identity, pose, and key features.",
  },
  {
    key: "watercolor",
    label: "Watercolor",
    hint: "Soft painted style",
    icon: Paintbrush,
    prompt:
      "Repaint the attached image as a soft watercolor illustration: visible brush textures, gentle color bleeds, subtle paper grain, light airy palette. Keep the same subject, composition, and proportions.",
  },
  {
    key: "comic",
    label: "Comic / manga",
    hint: "Inked, cel-shaded",
    icon: BookOpen,
    prompt:
      "Redraw the attached image as a bold comic / manga panel: clean black ink outlines, cel shading, halftone dot textures, dynamic high-contrast colors. Keep the subject clearly recognizable.",
  },
  {
    key: "lineart",
    label: "Coloring page",
    hint: "Clean line art",
    icon: PenLine,
    prompt:
      "Convert the attached image into clean black-and-white line art suitable for a printable coloring page: crisp even outlines, no shading or fills, pure white background. Preserve the subject's shapes and main details.",
  },
  {
    key: "merch",
    label: "Merch mockup",
    hint: "Tee · mug · tote",
    icon: Shirt,
    prompt:
      "Use the design from the attached image as artwork placed on realistic product mockups: a t-shirt, a ceramic mug, and a tote bag arranged together, soft studio lighting, clean neutral background, e-commerce catalog style.",
  },
  {
    key: "poster",
    label: "Poster / wallpaper",
    hint: "Print-ready framing",
    icon: Frame,
    prompt:
      "Turn the attached image into a polished poster / wallpaper: balanced composition, rich lighting, tasteful negative space for typography, high-resolution print-ready framing. Keep the main subject as the focal point.",
  },
];
