// app/[locale]/tools/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";
import { SITE_URL } from "@/lib/constants";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { resolveContentLocale } from "@/lib/locale_utils";

export const dynamic = "force-dynamic";

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

export default async function Page({ params }: Props) {
  const { locale: localeStr } = await params;

  const tNano = await getTranslations({ locale: localeStr, namespace: "nano" });
  const translateNano = (key: string): string => {
    try {
      return tNano(key as never) ?? "";
    } catch {
      return "";
    }
  };

  const reg = buildNanoRegistry(
    nanoTemplates as unknown as RawTemplate[],
    nanoImages as unknown as RawNanoImageRecord[]
  );

  const nanoCards = buildNanoFeedCards(reg, resolveContentLocale(localeStr), {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  });

  return (
    <main className="min-h-screen">
      <ToolsClient />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <NanoTemplateDetailClient
          locale={localeStr}          
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </div>
    </main>
  );
}