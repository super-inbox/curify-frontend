import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ToolGenericClient from "./tool-generic-client";
import { resolveToolNamespaceOr404 } from "@/lib/tool-page-guard";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";
import type { EcommercePhotoData } from "@/app/[locale]/_components/EcommercePhotoGenerate";
import type { TemplateParameter, NanoInspirationCardType } from "@/lib/nano_pure";
import {
  buildNanoRegistry,
  type RawTemplate,
  type RawNanoImageRecord,
} from "@/lib/nano_utils";
import { buildNanoFeedCards } from "@/lib/nano_page_data";
import { resolveContentLocale } from "@/lib/locale_utils";
import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";

// Curated, intent-matched related templates per image-gen tool. Rendered as a
// 1-2 row strip directly below the inline workflow to deepen the landing page
// and lift conversion. Hand-picked (not topic-auto) so each tool surfaces
// on-intent templates; excludes the tool's own backing template.
const TOOL_RELATED_TEMPLATE_IDS: Record<string, string[]> = {
  "character-sticker-sheet": [
    "template-football-star-chibi-sticker-set",
    "template-ip-character-sprite-emoji-sheet",
    "template-celebrity-meme-sticker-merchandise-collection-poster",
    "template-food-photo-doodle-sticker-overlay",
    "template-city-landmark-fridge-magnet-collection",
    "template-ip-creative-cultural-goods-mockup-set",
    "template-ip-gift-box-stationery-set-mockup",
    "template-brand-ip-mascot-design-board",
  ],
  mockup: [
    "template-ip-creative-cultural-goods-mockup-set",
    "template-ip-gift-box-stationery-set-mockup",
    "template-brand-vi-full-visual-pack-mockup",
    "template-brand-ip-mascot-design-board",
    "template-brand-identity-moodboard-visual-system-poster",
    "template-vintage-collage-fashion-collection-poster",
    "template-mbti-nba",
    "template-football-star-chibi-sticker-set",
  ],
  "ecommerce-photo": [
    "template-fruit-commercial-lifestyle-infographic-poster",
    "template-amazon-long-scroll-product-infographic-template",
    "template-eco-farm-food-uniform-product-label",
    "template-luxury-vintage-gem-necklace-design-sheet",
    "template-fashion-shape-guide-infographic",
    "template-ip-gift-box-stationery-set-mockup",
    "template-ip-creative-cultural-goods-mockup-set",
    "template-brand-identity-moodboard-visual-system-poster",
  ],
};

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
  const { locale, slug } = await params;

  const { tool, hasNamespace } = await resolveToolNamespaceOr404(slug);
  if (!tool || !hasNamespace) notFound();

  // "generate"-action tools (ecommerce-photo) render the inline image2image
  // workbench, which needs the backing template's base_prompt + parameters.
  // Load them SERVER-SIDE here (never import nano_templates.json into a client
  // component — client-bundle-data-leak). product-poster has empty parameters.
  let generateData: EcommercePhotoData | undefined;
  if (tool.action?.type === "generate") {
    const templateId = tool.action.templateId;
    const mod = (await import("@/public/data/nano_templates.json")) as unknown as {
      default: Array<Record<string, any>>;
    };
    const tpl = mod.default.find((x) => x.id === templateId);
    const loc = tpl?.locales?.[locale] ?? tpl?.locales?.en ?? tpl;
    generateData = {
      templateId,
      basePrompt: loc?.base_prompt || "",
      parameters: (Array.isArray(loc?.parameters) ? loc.parameters : []) as TemplateParameter[],
      allowGeneration: !!tpl?.allow_generation,
    };
  }

  // Curated related-templates strip (rendered below the workbench) for the 3
  // image-gen tools. Built SERVER-SIDE from the registry — the client receives
  // only the small serialized card array, never the templates JSON.
  let relatedTemplateCards: NanoInspirationCardType[] | undefined;
  const curatedIds = TOOL_RELATED_TEMPLATE_IDS[slug];
  if (curatedIds?.length) {
    const tNano = await getTranslations({ locale, namespace: "nano" });
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
    relatedTemplateCards = buildNanoFeedCards(reg, resolveContentLocale(locale), {
      templateIds: curatedIds,
      translate: translateNano,
      perTemplateMaxImages: 1,
      strictLocale: false,
      limit: 8,
    });
  }

  return (
    <ToolGenericClient
      slug={slug}
      generateData={generateData}
      relatedTemplateCards={relatedTemplateCards}
    />
  );
}