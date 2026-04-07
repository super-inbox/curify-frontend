// app/[locale]/(public)/use-cases/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { USE_CASES, getUseCaseBySlug } from "@/lib/use-cases";
import { getToolBySlug } from "@/lib/tools-registry";
import {
  type RawTemplate,
  type RawNanoImageRecord,
  buildNanoRegistry,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import { resolveContentLocale } from "@/lib/locale_utils";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

import UseCaseClient from "./UseCaseClient";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return USE_CASES.map((uc) => ({ slug: uc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const useCase = getUseCaseBySlug(slug);
  if (!useCase) return {};

  const t = await getTranslations({ locale, namespace: "useCasePage" });
  const safeT = (key: string) => { try { return t(key as never) ?? ""; } catch { return ""; } };

  const title = safeT(`${slug}.title`);
  const description = safeT(`${slug}.description`);
  const subtitle = safeT(`${slug}.subtitle`);

  const canonical = getCanonicalUrl(locale, `/use-cases/${slug}`);
  const languages = getLanguagesMap(`/use-cases/${slug}`);

  return {
    title: `${title} — Curify AI`,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title: `${title} | Curify AI`,
      description: subtitle,
      url: canonical,
    },
  };
}

export default async function UseCasePage({ params }: Props) {
  const { locale: localeStr, slug } = await params;

  const useCase = getUseCaseBySlug(slug);
  if (!useCase) notFound();

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
    perTemplateMaxImages: 4,
    strictLocale: false,
    translate: translateNano,
    useCaseSlugs: [useCase.slug],
  });

  const t = await getTranslations({ locale: localeStr });
  const safeT = (key: string) => {
    try { return t(key as never) ?? key; } catch { return key; }
  };

  const toolCards = useCase.toolSlugs
    .map((toolSlug) => getToolBySlug(toolSlug))
    .filter(Boolean)
    .map((tool) => ({
      slug: tool!.slug,
      title: safeT(tool!.i18n.titleKey),
      description: safeT(tool!.i18n.descKey),
      href: localeStr === "en" ? `/tools/${tool!.slug}` : `/${localeStr}/tools/${tool!.slug}`,
    }));

  return (
    <UseCaseClient
      slug={useCase.slug}
      nanoCards={nanoCards}
      toolCards={toolCards}
    />
  );
}
