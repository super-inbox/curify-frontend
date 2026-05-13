import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HowToDubVideosNaturally" });

  // Prefer SEO-tuned metaDescription when present so we can iterate
  // on ad copy without touching body content (description is also
  // shown in the hero subtitle). Falls back to description for
  // backwards compatibility.
  return {
    title: t("title"),
    description: t.has("metaDescription") ? t("metaDescription") : t("description"),
    keywords: t.has("seoKeywords") ? t("seoKeywords") : undefined,
  };
}

export default function HowToDubVideosNaturallyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
