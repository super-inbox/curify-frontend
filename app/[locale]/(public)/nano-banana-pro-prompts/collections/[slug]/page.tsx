import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import NanoBananaProPromptsClient from "../../NanoBananaProPromptsClient";

type Prompt = any;

/**
 * slug → collection config
 * 注意：domainCategory / layoutCategory 的值
 * 要与你 nanobanana.json 里的真实字段值一致
 */
const COLLECTIONS: Record<
  string,
  {
    title: string;
    description: string;
    domainCategory?: string;
    layoutCategory?: string;
  }
> = {
  "product-photography": {
    title: "Product Photography Prompts",
    description:
      "Curated Nano Banana prompts for studio lighting, ecommerce product shots, and clean commercial visuals.",
    domainCategory: "Product",
  },
  "cinematic-scenes": {
    title: "Cinematic Scene Prompts",
    description:
      "Film-grade composition, dramatic lighting, and storytelling frames. Hand-picked for cinematic outputs.",
    layoutCategory: "Cinematic",
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

/**
 * Static params for SSG
 */
export async function generateStaticParams() {
  return Object.keys(COLLECTIONS).map((slug) => ({ slug }));
}

/**
 * ✅ FIXED: params is Promise
 */
type PageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Metadata (SEO only for curated collections)
 */
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const { slug } = await params;
  const cfg = COLLECTIONS[slug];

  if (!cfg) {
    return {
      robots: { index: false, follow: false },
    };
  }

  return {
    title: cfg.title,
    description: cfg.description,
    robots: { index: true, follow: true },
    alternates: {
      canonical: `/nano-banana-pro-prompts/collections/${slug}`,
    },
  };
}

function loadPrompts(): Prompt[] {
  const jsonPath = path.join(process.cwd(), "public", "data", "nanobanana.json");
  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);
  return Array.isArray(data?.prompts) ? data.prompts : [];
}

/**
 * ✅ FIXED: params is Promise and awaited
 */
export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const cfg = COLLECTIONS[slug];

  if (!cfg) {
    return <div className="p-8">Collection not found.</div>;
  }

  const prompts = loadPrompts();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {cfg.title}
        </h1>
        <p className="mt-2 text-gray-600 max-w-3xl">
          {cfg.description}
        </p>

        <div className="mt-8">
          <NanoBananaProPromptsClient
            initialData={prompts}
            error={null}            
          />
        </div>
      </div>
    </div>
  );
}
