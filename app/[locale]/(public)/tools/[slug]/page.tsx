import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolGenericClient from "./tool-generic-client";
import { resolveToolNamespaceOr404 } from "@/lib/tool-page-guard";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import type { EcommercePhotoData } from "@/app/[locale]/_components/EcommercePhotoGenerate";
import type { TemplateParameter } from "@/lib/nano_pure";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const { tool, hasNamespace } = await resolveToolNamespaceOr404(slug);
  if (!tool || !hasNamespace) return {}; // no metadata for non-existent pages

  const t = await getTranslations({ locale, namespace: tool.namespace });

  const title = t("metadata.title");
  const description = t("metadata.description");

  const path = `/tools/${slug}`;

  // ✅ EN is unprefixed
  const canonical = getCanonicalUrl(locale, path);

  // ✅ hreflang map for SEO (includes x-default)
  const languages = getLanguagesMap(path);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
    },
  };
}

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const { tool, hasNamespace } = await resolveToolNamespaceOr404(slug);
  if (!tool || !hasNamespace) notFound();

  // "generate"-action tools (ecommerce-photo) render the inline image2image
  // workbench, which needs the backing template's base_prompt + parameters.
  // Load them SERVER-SIDE here (never import nano_templates.json into a client
  // component — client-bundle-data-leak). product-poster has empty parameters.
  let generateData: EcommercePhotoData | undefined;
  if (tool.action?.type === "generate") {
    const templateId = tool.action.templateId;
    const mod = (await import("@/public/data/nano_templates.json")) as unknown as {
      default: Array<Record<string, any>>;
    };
    const tpl = mod.default.find((x) => x.id === templateId);
    const loc = tpl?.locales?.[locale] ?? tpl?.locales?.en ?? tpl;
    generateData = {
      templateId,
      basePrompt: loc?.base_prompt || "",
      parameters: (Array.isArray(loc?.parameters) ? loc.parameters : []) as TemplateParameter[],
      allowGeneration: !!tpl?.allow_generation,
    };
  }

  return <ToolGenericClient slug={slug} generateData={generateData} />;
}