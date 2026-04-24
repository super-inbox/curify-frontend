import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.UltimateDirectoryOfNanoBananaPrompts" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default function UltimateDirectoryOfNanoBananaPromptsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
