"use client";

import { type ReactNode } from "react";

import ReproduceWorkbench from "@/app/[locale]/_components/ReproduceWorkbench";
import type { TemplateParameter } from "@/lib/nano_pure";
import type { ExistingExampleRef } from "@/lib/editDistance";

// Thin wrapper over the shared 3-column ReproduceWorkbench. The example page's
// column 1 is the example image ("source" mode) — the reference-image upload
// (for image2image templates) stays in column 2. The template-detail page and
// the ecommerce-photo tool render the same workbench in "upload" mode instead.
type Props = {
  locale: string;
  templateId: string;
  slug: string;
  title: string;
  description?: string;
  image: ReactNode;
  sourceReferenceUrl: string;
  parameters: TemplateParameter[];
  initialParams: Record<string, string>;
  basePrompt: string;
  allowGeneration: boolean;
  requiresImageUpload?: boolean;
  batchEnabled?: boolean;
  exampleId: string;
  examplePageUrl: string;
  existingExamples?: ExistingExampleRef[];
  useCaseFilter?: readonly string[];
  copyText: string;
  shareUrl: string;
};

export default function ExampleReproduceSurface({
  locale,
  templateId,
  title,
  description,
  image,
  sourceReferenceUrl,
  parameters,
  initialParams,
  basePrompt,
  allowGeneration,
  requiresImageUpload = false,
  batchEnabled = false,
  exampleId,
  existingExamples = [],
  useCaseFilter,
  copyText,
  shareUrl,
}: Props) {
  return (
    <ReproduceWorkbench
      locale={locale}
      templateId={templateId}
      description={description}
      parameters={parameters}
      initialParams={initialParams}
      basePrompt={basePrompt}
      allowGeneration={allowGeneration}
      requiresImageUpload={requiresImageUpload}
      existingExamples={existingExamples}
      useCaseFilter={useCaseFilter}
      trackingContentId={`${templateId}:${exampleId}`}
      col1={{
        mode: "source",
        image,
        sourceReferenceUrl,
        copyText,
        shareUrl,
        title,
        batchEnabled,
      }}
    />
  );
}
