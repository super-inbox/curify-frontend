// app/[locale]/(public)/nano-template/[slug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  TemplateDetailPage,
  Template,
  TemplateCardWithImages,
} from "../../../_components/TemplateDetailsPage";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoCards from "@/public/data/nano_inspiration.json";

type RouteParams = {
  locale: string;
  slug: string;
};

interface PageProps {
  // ✅ Next.js sync-dynamic-apis: params must be awaited
  params: Promise<RouteParams>;
}

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

export default async function TemplatePage({ params }: PageProps) {
  const { locale, slug } = await params;

  const templateId = slugToTemplateId(slug);

  const templates = nanoTemplates as Template[];
  const template = templates.find((t) => t.id === templateId);
  if (!template) notFound();

  const cards = nanoCards as TemplateCardWithImages[];

  const templateCards: TemplateCardWithImages[] = cards
    .filter((card) => card.template_id === templateId)
    .map((card) => ({
      ...card,
      // Ensure template parameters exist in parameters object
      parameters: Object.fromEntries(
        template.parameters.map((param) => [
          param.name,
          card.parameters?.[param.name] ?? "",
        ])
      ),
    }));

  return (
    <TemplateDetailPage
      template={template}
      templateCards={templateCards}
      allTemplates={templates}
      locale={locale}
    />
  );
}

export async function generateStaticParams() {
  const locales = ["zh", "en"];
  const templates = nanoTemplates as Template[];

  const params: Array<{ locale: string; slug: string }> = [];
  for (const locale of locales) {
    for (const t of templates) {
      const slug = t.id.replace(/^template-/, "");
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const templateId = slugToTemplateId(slug);
  const template = (nanoTemplates as Template[]).find((t) => t.id === templateId);

  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.category} - Nano Banana Template`,
    description: template.description,
  };
}
