"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Image as ImageIcon,
  ShoppingBag,
  Sticker,
  Package,
  Shirt,
  LayoutGrid,
  Sparkles,
  Palette,
  Scissors,
  Smile,
  type LucideIcon,
} from "lucide-react";
import ReproduceWorkbench from "@/app/[locale]/_components/ReproduceWorkbench";
import type { TemplateParameter } from "@/lib/nano_prompt_utils";

/**
 * Reusable 3-column image2image workbench: Upload → pick a workflow → generate →
 * design work. Drives the shared `ReproduceWorkbench` in upload mode and swaps its
 * `templateId` per the selected workflow (column 1 = upload, column 2 = the
 * workflow's generate, column 3 = the designer pack).
 *
 * Each preset is a curated set of shipped `requires_image_upload` templates scoped
 * to a use case, so the homepage and the merch / product topic pages can each open
 * a workbench restricted to their own workflows. Workflow lists live here (client)
 * rather than being passed from a server page, so the LucideIcon components don't
 * have to cross the server→client boundary.
 */

type Workflow = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  params: TemplateParameter[];
};

const P = (
  name: string,
  label: string,
  placeholder: string
): TemplateParameter =>
  ({ name, label, placeholder, type: "text" } as TemplateParameter);

const PRODUCT_POSTER: Workflow = {
  id: "template-product-poster",
  label: "Product → Poster",
  hint: "Promotional poster from your product photo",
  icon: ImageIcon,
  params: [],
};
const PRODUCT_LISTING: Workflow = {
  id: "template-fashion-ecommerce",
  label: "Product → Listing",
  hint: "Marketplace listing image",
  icon: ShoppingBag,
  params: [P("core_selling_point", "Core selling point", "e.g. lightweight & waterproof")],
};
const PRODUCT_TRYON: Workflow = {
  id: "template-ai-outfit-try-on-poster",
  label: "Product → Try-on",
  hint: "On-model try-on poster from your apparel photo",
  icon: Shirt,
  params: [],
};
const IP_STICKERS: Workflow = {
  id: "template-ip-character-expression-sheet",
  label: "IP → Sticker pack",
  hint: "Expression / sticker sheet from your character",
  icon: Sticker,
  params: [],
};
const IP_MOCKUPS: Workflow = {
  id: "template-ip-creative-cultural-goods-mockup-set",
  label: "IP → Merch mockups",
  hint: "Merch mockups from your character",
  icon: Package,
  params: [],
};

// --- Selfie workflows: transform the USER'S OWN photo (image_input:required,
// prompts operate on "the attached/uploaded photo" & preserve identity). ---
const SELFIE_STICKERS: Workflow = {
  id: "template-ip-character-expression-sheet",
  label: "Selfie → Sticker pack",
  hint: "A 9-expression sticker sheet from your photo",
  icon: Smile,
  params: [],
};
const SELFIE_ART: Workflow = {
  id: "template-figure-to-abstract-portrait-series",
  label: "Selfie → Art portrait",
  hint: "An artistic portrait series from your photo",
  icon: Palette,
  params: [],
};
const SELFIE_RETOUCH: Workflow = {
  id: "template-portrait-retouching-blueprint",
  label: "Selfie → Retouch",
  hint: "A pro before/after headshot retouch",
  icon: Sparkles,
  params: [],
};
const SELFIE_HAIR: Workflow = {
  id: "template-hairstyle-color-recommendation",
  label: "Selfie → New hairstyle",
  hint: "Try new hairstyles & hair colors on your photo",
  icon: Scissors,
  params: [],
};
const SELFIE_TRYON: Workflow = {
  id: "template-ai-outfit-try-on-poster",
  label: "Selfie → Outfit try-on",
  hint: "See yourself in a new outfit",
  icon: Shirt,
  params: [],
};
const SELFIE_MERCH: Workflow = {
  id: "template-ip-creative-cultural-goods-mockup-set",
  label: "Selfie → Merch",
  hint: "Your photo on stickers, totes & mugs",
  icon: Package,
  params: [],
};

/** Curated workflow sets, keyed by preset (home + use-case-scoped topics). */
const PRESETS: Record<string, Workflow[]> = {
  home: [PRODUCT_POSTER, PRODUCT_LISTING, IP_STICKERS, IP_MOCKUPS],
  // merch = for-merch-operators: turn an IP/character into sellable goods.
  merch: [IP_STICKERS, IP_MOCKUPS, PRODUCT_POSTER],
  // product / ecommerce = turn a product photo into listing-ready visuals.
  product: [PRODUCT_POSTER, PRODUCT_LISTING, PRODUCT_TRYON],
  // selfie = restyle your own photo (drives /topics/portrait workbench).
  selfie: [
    SELFIE_STICKERS,
    SELFIE_ART,
    SELFIE_RETOUCH,
    SELFIE_HAIR,
    SELFIE_TRYON,
    SELFIE_MERCH,
  ],
};

const FALLBACK_HEADING = "Start a workflow";
const HEADINGS: Record<string, string> = {
  selfie: "Turn your selfie into…",
};
const SUBTITLE: Record<string, string> = {
  home: "Upload a product or character image, pick a workflow, and turn it into finished design work.",
  merch: "Upload your character or IP, pick a workflow, and turn it into sellable merch.",
  product: "Upload your product photo, pick a workflow, and turn it into listing-ready visuals.",
  selfie: "Upload your photo, pick a style, and turn your selfie into stickers, art, a new look, and more.",
};

export function hasImageWorkbench(preset: string): boolean {
  return preset in PRESETS && preset !== "home";
}

export default function ImageWorkbench({
  locale,
  preset = "home",
  heading,
  trackPrefix,
}: {
  locale: string;
  preset?: string;
  heading?: string;
  trackPrefix?: string;
}) {
  const t = useTranslations("home.omni");
  const workflows = PRESETS[preset] ?? PRESETS.home;
  const [wf, setWf] = useState<Workflow>(workflows[0]);
  const prefix = trackPrefix ?? (preset === "home" ? "home-workflow" : `${preset}-workflow`);
  const title = heading ?? HEADINGS[preset] ?? (preset === "home" ? t("heading") : FALLBACK_HEADING);
  const subtitle = SUBTITLE[preset] ?? SUBTITLE.home;
  const Grid = LayoutGrid;

  return (
    <section className="mt-2">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-neutral-900">
          <Grid className="h-5 w-5 text-purple-500" /> {title}
        </h2>
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>

        {/* Workflow selector — drives what column 2 generates. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {workflows.map((w) => {
            const Icon = w.icon;
            const active = w.id === wf.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => setWf(w)}
                title={w.hint}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold shadow-sm transition ${
                  active
                    ? "border-purple-400 bg-purple-50 text-purple-700"
                    : "border-neutral-200 bg-white text-neutral-700 hover:border-purple-300 hover:text-purple-700"
                }`}
              >
                <Icon className="h-4 w-4" /> {w.label}
              </button>
            );
          })}
        </div>

        {/* The shared 3-column workbench. NOT re-keyed on workflow switch, so the
            uploaded image + results persist as the user tries different workflows
            (only column 2's template + params and column 3's designer pack swap). */}
        <div className="mt-4">
          <ReproduceWorkbench
            locale={locale}
            templateId={wf.id}
            parameters={wf.params}
            initialParams={{}}
            basePrompt=""
            allowGeneration={false}
            requiresImageUpload
            trackingContentId={`${prefix}:${wf.id}`}
            col1={{
              mode: "upload",
              label: "Upload your image",
              hideUploadLabel: true,
              hint: `Drop your image, then Generate — ${wf.hint}.`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
