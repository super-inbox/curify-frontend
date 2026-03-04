import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolGenericClient from "./tool-generic-client";
import { resolveToolNamespaceOr404 } from "@/lib/tool-page-guard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  const { tool, hasNamespace } = await resolveToolNamespaceOr404(slug);
  if (!tool || !hasNamespace) return {}; // no metadata for non-existent pages

  // if it exists in EN home.json, render metadata from actual locale namespace
  const t = await getTranslations({ locale, namespace: tool.namespace });

  // these keys follow your bilingual structure
  const title = t("metadata.title");
  const description = t("metadata.description");

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.curify-ai.com";
  const url = `${base}/${locale}/tools/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
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