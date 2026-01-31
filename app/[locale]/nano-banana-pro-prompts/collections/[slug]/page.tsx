import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import NanoBananaProPromptsClient from "../../NanoBananaProPromptsClient"; // 你按实际路径改

type Prompt = any;

// 这里把 slug 映射到你数据里的 domainCategory 或 layoutCategory（按你的数据字段来）
const COLLECTIONS: Record<
  string,
  {
    title: string;
    description: string;
    // choose ONE of them (or both)
    domainCategory?: string;
    layoutCategory?: string;
  }
> = {
  "product-photography": {
    title: "Product Photography Prompts",
    description:
      "Curated Nano Banana prompts for studio lighting, ecommerce product shots, and clean commercial visuals.",
    domainCategory: "Product", // 这里要改成你数据里真实的 domainCategory 值
  },
  "cinematic-scenes": {
    title: "Cinematic Scene Prompts",
    description:
      "Film-grade composition, dramatic lighting, and storytelling frames. Hand-picked for cinematic outputs.",
    layoutCategory: "Cinematic", // 改成你 layoutCategory 的真实值
  },
  "character-illustration": {
    title: "Character Illustration Prompts",
    description:
      "Stylized portraits and characters across different aesthetics. Great for IP design and storytelling.",
    domainCategory: "Character",
  },
  "3d-render": {
    title: "3D Render Prompts",
    description:
      "Prompts optimized for 3D materials, realistic lighting, and product render aesthetics.",
    domainCategory: "3D",
  },
  "poster-and-branding": {
    title: "Poster & Branding Prompts",
    description:
      "Marketing posters, brand visuals, typography-focused compositions, and campaign creatives.",
    domainCategory: "Branding",
  },
  "ui-and-app": {
    title: "UI & App Prompts",
    description:
      "UI mockups, app screens, product UI visuals—curated prompts for interface-oriented generations.",
    domainCategory: "UI",
  },
};

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const cfg = COLLECTIONS[params.slug];
  if (!cfg) return { robots: { index: false, follow: false } };

  return {
    title: cfg.title,
    description: cfg.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/nano-banana-pro-prompts/collections/${params.slug}`,
    },
  };
}

function loadPrompts(): Prompt[] {
  const jsonPath = path.join(process.cwd(), "public", "data", "nanobanana.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data?.prompts) ? data.prompts : [];
}

export default function CollectionPage({ params }: { params: { slug: string } }) {
  const cfg = COLLECTIONS[params.slug];
  if (!cfg) {
    // 404 也行，这里简化
    return <div className="p-8">Collection not found.</div>;
  }

  const prompts = loadPrompts();

  // 传给 client 组件，让它自动套 preset filter
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">{cfg.title}</h1>
        <p className="mt-2 text-gray-600 max-w-3xl">{cfg.description}</p>

        <div className="mt-8">
          <NanoBananaProPromptsClient
            initialData={prompts}
            error={null}
            initialDomainFilter={cfg.domainCategory}
            showCategoryFilters={false}
          />
        </div>
      </div>
    </div>
  );
}
