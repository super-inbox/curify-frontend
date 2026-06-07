// app/[locale]/tools/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";
import { SITE_URL } from "@/lib/constants";
import { routing } from "@/i18n/routing";

// Prerender per locale (bundled/i18n-only page) -> edge-cached, no per-request
// render. generateMetadata sets the correct per-locale canonical + hreflang.
export const revalidate = false;
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = t("tools.meta.title");
  const description = t("tools.meta.description");

  const pathPrefix = locale === "en" ? "" : `/${locale}`;
  const url = `${SITE_URL}${pathPrefix}/tools`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${SITE_URL}/tools`,
        zh: `${SITE_URL}/zh/tools`,
        es: `${SITE_URL}/es/tools`,
        de: `${SITE_URL}/de/tools`,
        fr: `${SITE_URL}/fr/tools`,
        hi: `${SITE_URL}/hi/tools`,
        ja: `${SITE_URL}/ja/tools`,
        ko: `${SITE_URL}/ko/tools`,
        tr: `${SITE_URL}/tr/tools`,
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

export default async function Page(_props: Props) {
  // Visual nano-templates block at the bottom was dropped 2026-05-19:
  // /tools focuses on tools; /nano-template and /nano-banana-pro-prompts
  // are the canonical surfaces for the visual template catalog. ToolsClient
  // now stacks tools grid → latest blogs → use-case persona chips.
  return (
    <main className="min-h-screen">
      <ToolsClient />
    </main>
  );
}