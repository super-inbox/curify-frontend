import type { Metadata } from "next";
import { TemplatePageClient } from "./TemplatePageClient";

type Template = {
  id: string;
  category: string;
  language: "zh" | "en";
  description: string;
  base_prompt: string;
  parameters: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "select";
    placeholder?: string;
    options?: string[];
  }>;
  candidates: Record<string, any>[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
};

async function getTemplate(slug: string, locale: string): Promise<Template | null> {
  const templates: Record<string, Template> = {
    "中草药类": {
      id: "template-herbal-zh",
      category: "中草药类",
      language: "zh",
      description: "生成单味中药材的全景式知识分解图...",
      base_prompt: "（Medica Concept Artist）你是一位顶尖本草插画概念设计师...",
      parameters: [{ name: "herb_name", label: "中药材名称", type: "text", placeholder: "例如：人参、当归、黄芪" }],
      candidates: [{ herb_name: "人参" }],
      seo: {
        title: "中草药科普图生成器 - AI中药材知识图谱创作工具",
        description: "使用AI生成专业的中草药科普知识图谱...",
        keywords: ["中草药", "中药材", "AI生成"],
      },
    },
  };

  return templates[slug] || null;
}

// ✅ params should be awaited in this Next.js version
type Props = {
  params: Promise<{ slug: string; locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, locale } = await params;

  const template = await getTemplate(slug, locale);

  if (!template) {
    return {
      title: "Template Not Found",
      description: "The requested template could not be found.",
    };
  }

  return {
    title: template.seo.title,
    description: template.seo.description,
    keywords: template.seo.keywords,
    alternates: {
      canonical: `/${locale}/template/${slug}`,
    },
  };
}

export default async function TemplatePage({ params }: Props) {
  const { slug, locale } = await params;

  const template = await getTemplate(slug, locale);

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Template Not Found</h1>
          <p className="text-lg text-neutral-600">The template you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <TemplatePageClient template={template} locale={locale} />;
}
