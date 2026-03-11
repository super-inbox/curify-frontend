// app/[locale]/tools/page.tsx

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolsClient from "./ToolsClient";
import NanoTemplateDetailClient from "@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient";

import {
  type RawTemplate,
  type RawNanoImageRecord,
  normalizeLocale,
  buildNanoRegistry,
  buildNanoFeedCards,
  type Locale,
} from "@/lib/nano_utils";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

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
  const locale = normalizeLocale(localeStr);

  const tNano = await getTranslations({ locale: localeStr, namespace: "nano" });
  const translateNano = (key: string): string => {
    try {
      return tNano(key as any) ?? "";
    } catch {
      return "";
    }
  };

  const reg = buildNanoRegistry(
    nanoTemplates as unknown as RawTemplate[],
    nanoImages as unknown as RawNanoImageRecord[]
  );

  const nanoCards = buildNanoFeedCards(reg, locale as Locale, {
    perTemplateMaxImages: 2,
    strictLocale: false,
    translate: translateNano,
  });

  return (
    <main className="min-h-screen">
      <ToolsClient />

      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <NanoTemplateDetailClient
          locale={locale}
          template={{ template_id: "", base_prompt: "", parameters: [] }}
          otherNanoCards={nanoCards}
          showReproduce={false}
          showOtherTemplates={true}
        />
      </div>
    </main>
  );
}
