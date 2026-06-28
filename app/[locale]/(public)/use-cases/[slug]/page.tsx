// app/[locale]/(public)/use-cases/[slug]/page.tsx

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { USE_CASES, getUseCaseBySlug } from "@/lib/use-cases";
import { getToolBySlug, type ToolDef } from "@/lib/tools-registry";
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
import { routing } from "@/i18n/routing";

// Prerender every locale x use-case (bundled data, bounded set) -> edge-cached
// instead of a per-request render. Must enumerate BOTH params so all locales
// prerender (returning slug-only would leave non-default locales on-demand).
// generateMetadata sets the correct per-locale canonical + hreflang.
export const revalidate = false;
export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    USE_CASES.map((uc) => ({ locale, slug: uc.slug })),
  );
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

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

  const contentLocale = resolveContentLocale(localeStr);
  const nanoCards = buildNanoFeedCards(reg, contentLocale, {
    perTemplateMaxImages: 4,
    strictLocale: false,
    translate: translateNano,
    useCaseSlugs: [useCase.slug],
  });

  // Flatten the template-grouped nanoCards into individual examples
  // for the ExampleImagesGrid (per the 2026-06-29 swap from template-
  // list UI to example-grid UI). Each card carries up to 4 examples
  // already filtered+ordered by use-case + parent rank_score — flatten
  // 1:1 here so the grid shows individual creations the user can
  // click straight into the example detail page.
  const exampleItems = nanoCards.flatMap((card) => {
    const previews =
      card.preview_image_urls?.length
        ? card.preview_image_urls
        : card.image_urls ?? [];
    const ids = card.example_ids ?? [];
    return previews.map((preview, i) => ({
      id: ids[i] ?? `${card.template_id}-${i}`,
      title: card.category || "",
      preview,
      templateId: card.template_id,
    }));
  });

  const t = await getTranslations({ locale: localeStr });
  const safeT = (key: string) => {
    try { return t(key as never) ?? key; } catch { return key; }
  };

  const tools: ToolDef[] = useCase.toolSlugs
    .map((toolSlug) => getToolBySlug(toolSlug))
    .filter((t): t is ToolDef => Boolean(t));

  // Build a templateId -> first preview_image_url map once so each
  // learningMaterial card can render a cover thumbnail without falling
  // back to the un-illustrated "title + description + button" layout
  // (user feedback: download cards looked blank).
  const firstPreviewByTemplate = new Map<string, string>();
  for (const img of nanoImages as unknown as RawNanoImageRecord[]) {
    if (!firstPreviewByTemplate.has(img.template_id) && img.asset?.preview_image_url) {
      firstPreviewByTemplate.set(img.template_id, img.asset.preview_image_url);
    }
  }

  const learningMaterials =
    slug === "for-parents"
      ? (nanoTemplates as unknown as RawTemplate[])
          .filter((t) => {
            const topics = Array.isArray(t.topics)
              ? t.topics
              : (t.topics ?? "").split(",").map((x: string) => x.trim());
            return t.batch === true && topics.includes("language");
          })
          .map((t) => ({
            templateId: t.id,
            title: translateNano(`${t.id}.category`),
            description: translateNano(`${t.id}.description`),
            coverImage: firstPreviewByTemplate.get(t.id),
          }))
      : undefined;

  return (
    <UseCaseClient
      slug={useCase.slug}
      exampleItems={exampleItems}
      tools={tools}
      learningMaterials={learningMaterials}
    />
  );
}
