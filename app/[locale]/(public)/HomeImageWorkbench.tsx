"use client";

import ImageWorkbench from "@/app/[locale]/_components/ImageWorkbench";

/**
 * Homepage "Start a workflow" — thin wrapper over the reusable ImageWorkbench
 * (preset "home"). The workflow presets + workbench live in ImageWorkbench so the
 * merch / product topic pages can open the same 3-column workbench scoped to their
 * own use case. See docs/image-workflow-page-design-2026-07-11.md.
 */
export default function HomeImageWorkbench({ locale }: { locale: string }) {
  return <ImageWorkbench locale={locale} preset="home" />;
}
