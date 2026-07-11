"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Image as ImageIcon, ShoppingBag, Sticker, Package, type LucideIcon } from "lucide-react";
import ReproduceWorkbench from "@/app/[locale]/_components/ReproduceWorkbench";
import type { TemplateParameter } from "@/lib/nano_prompt_utils";

/**
 * Homepage "Start a workflow" — a 3-column image2image workbench (replaces the
 * router-style Omni-Input v1). Upload → pick a workflow → generate → design work.
 *
 * Reuses the shared 3-column `ReproduceWorkbench` in upload mode (exactly how the
 * image tool pages drive it) and just switches its `templateId` per the selected
 * workflow — so column 1 = upload, column 2 = the selected workflow's generate,
 * column 3 = the designer pack. Each workflow is a shipped `requires_image_upload`
 * template; params are minimal (mostly upload-and-go). See
 * docs/image-workflow-page-design-2026-07-11.md.
 */

type Workflow = {
  id: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  params: TemplateParameter[];
};

const WORKFLOWS: Workflow[] = [
  {
    id: "template-product-poster",
    label: "Product → Poster",
    hint: "Promotional poster from your product photo",
    icon: ImageIcon,
    params: [],
  },
  {
    id: "template-fashion-ecommerce",
    label: "Product → Listing",
    hint: "Marketplace listing image",
    icon: ShoppingBag,
    params: [
      {
        name: "core_selling_point",
        label: "Core selling point",
        placeholder: "e.g. lightweight & waterproof",
        type: "text",
      } as TemplateParameter,
    ],
  },
  {
    id: "template-ip-character-expression-sheet",
    label: "IP → Sticker pack",
    hint: "Expression / sticker sheet from your character",
    icon: Sticker,
    params: [],
  },
  {
    id: "template-ip-creative-cultural-goods-mockup-set",
    label: "IP → Mockup set",
    hint: "Merch mockups from your character",
    icon: Package,
    params: [],
  },
];

export default function HomeImageWorkbench({ locale }: { locale: string }) {
  const t = useTranslations("home.omni");
  const [wf, setWf] = useState<Workflow>(WORKFLOWS[0]);

  return (
    <section className="mt-2">
      <div className="rounded-3xl border border-neutral-200 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
        <h2 className="text-lg font-bold text-neutral-900">{t("heading")}</h2>
        <p className="mt-1 text-sm text-neutral-600">
          Upload a product or character image, pick a workflow, and turn it into finished design work.
        </p>

        {/* Workflow selector — drives what column 2 generates. */}
        <div className="mt-4 flex flex-wrap gap-2">
          {WORKFLOWS.map((w) => {
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
            trackingContentId={`home-workflow:${wf.id}`}
            col1={{
              mode: "upload",
              label: "Upload your image",
              hint: `Drop your image, then Generate — ${wf.hint}.`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
