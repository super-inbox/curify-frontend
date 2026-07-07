"use client";

import ReproduceWorkbench from "@/app/[locale]/_components/ReproduceWorkbench";
import type { TemplateParameter } from "@/lib/nano_pure";

// Template data threaded from the /tools/[slug] SERVER page (base_prompt +
// parameters loaded from nano_templates.json server-side — never import that
// JSON into a client component; see project_client_bundle_data_leak).
export type EcommercePhotoData = {
  templateId: string;
  basePrompt: string;
  parameters: TemplateParameter[];
  allowGeneration: boolean;
};

/**
 * Inline image2image generate surface for the /tools/ecommerce-photo page.
 * Renders the shared 3-column ReproduceWorkbench in "upload" mode: column 1 =
 * drop a product photo, column 2 = prompt preview + generate, column 3 = the
 * designer pack (getTemplateWorkflows). Same workbench the example page and the
 * image2image template-detail pages use.
 */
export default function EcommercePhotoGenerate({
  locale,
  data,
}: {
  locale: string;
  data: EcommercePhotoData;
}) {
  return (
    <ReproduceWorkbench
      locale={locale}
      templateId={data.templateId}
      parameters={data.parameters}
      initialParams={{}}
      basePrompt={data.basePrompt}
      allowGeneration={data.allowGeneration}
      requiresImageUpload
      trackingContentId={data.templateId}
      col1={{
        mode: "upload",
        label: "Your product photo",
        hint: "Drop or select a product photo — JPEG, PNG, or WebP.",
      }}
    />
  );
}
