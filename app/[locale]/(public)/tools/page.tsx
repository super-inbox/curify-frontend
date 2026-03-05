// app/[locale]/tools/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = t("tools.meta.title");
  const description = t("tools.meta.description");

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://www.curify-ai.com";
  const url = `${base}/${locale}/tools`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${base}/en/tools`,
        zh: `${base}/zh/tools`,
        es: `${base}/es/tools`,
        // add other locales you support here
        // "x-default": `${base}/en/tools`,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Curify",
      type: "website",
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function Page() {
  return (
    <main className="min-h-screen">
      <ToolsClient />
    </main>
  );
}