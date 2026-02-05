import { notFound } from "next/navigation";
import {
  TemplateDetailPage,
  Template,
  TemplateCardWithImages,
} from "../../../_components/TemplateDetailsPage";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoCards from "@/public/data/nano_inspiration.json";

interface PageProps {
  params: {
    locale: string;
    slug: string; // folder is [slug]
  };
}

function slugToTemplateId(slug: string) {
  return slug.startsWith("template-") ? slug : `template-${slug}`;
}

export default function TemplatePage({ params }: PageProps) {
  const { locale, slug } = params;
  const templateId = slugToTemplateId(slug);

  // nanoTemplates is Template[] now
  const template = (nanoTemplates as Template[]).find((t) => t.id === templateId);
  if (!template) notFound();

  // nanoCards is TemplateCardWithImages[] now
  const templateCards: TemplateCardWithImages[] = (nanoCards as TemplateCardWithImages[])
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
      allTemplates={nanoTemplates as Template[]}
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
      // generate slug from template id
      const slug = t.id.replace(/^template-/, "");
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const templateId = slugToTemplateId(params.slug);
  const template = (nanoTemplates as Template[]).find((t) => t.id === templateId);

  if (!template) return { title: "Template Not Found" };

  return {
    title: `${template.category} - Nano Banana Template`,
    description: template.description,
  };
}
