import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolGenericClient from "./tool-generic-client";
import { resolveToolNamespaceOr404 } from "@/lib/tool-page-guard";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

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
  const { slug } = await params;

  const { tool, hasNamespace } = await resolveToolNamespaceOr404(slug);
  if (!tool || !hasNamespace) notFound();

  return <ToolGenericClient slug={slug} />;
}