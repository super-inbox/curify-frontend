import { Metadata } from 'next';
import NanoBananaProPromptsClient from './NanoBananaProPromptsClient';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs'; // required for fs

type JsonData = {
  prompts?: any[];
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://curify-ai.com';
const CDN_BASE = process.env.NEXT_PUBLIC_CDN_BASE || 'https://cdn.curify-ai.com';

function toOgLocale(locale: string) {
  const map: Record<string, string> = {
    en: 'en_US',
    zh: 'zh_CN',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    ja: 'ja_JP',
    ko: 'ko_KR',
    hi: 'hi_IN',
    tr: 'tr_TR',
    ru: 'ru_RU',
  };

  return map[locale] || 'en_US';
}

function readNanoBananaJson(): JsonData {
  const jsonPath = path.join(process.cwd(), 'public', 'data', 'nanobanana.json');
  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(fileContent);
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  let totalPrompts = 0;

  try {
    const data = readNanoBananaJson();
    totalPrompts = Array.isArray(data?.prompts) ? data!.prompts!.length : 0;
  } catch (error) {
    console.error('Error reading prompts for metadata:', error);
  }

  const title = 'Nano Banana Pro Prompts - Discover Creative AI Prompts';
  const description = `Explore ${totalPrompts}+ curated AI prompts from top creators. Find inspiration for your next project with prompts for image generation, text creation, and more.`;
  const url = `${SITE_URL}/${locale}/nano-banana-pro-prompts`;

  return {
    title,
    description,
    keywords: [
      'AI prompts',
      'creative prompts',
      'prompt engineering',
      'AI image generation',
      'ChatGPT prompts',
      'stable diffusion prompts',
      'midjourney prompts',
      'prompt library',
      'AI tools',
      'creative AI',
    ],
    authors: [{ name: 'Nano Banana' }],
    creator: 'Nano Banana',
    openGraph: {
      type: 'website',
      locale: toOgLocale(locale),
      url,
      title,
      description,
      siteName: 'Nano Banana Pro Prompts',
      images: [
        {
          url: `${SITE_URL}/images/og-prompts.jpg`,
          width: 1200,
          height: 630,
          alt: 'Nano Banana Pro Prompts - AI Prompt Library',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/og-prompts.jpg`],
      creator: '@nanobanana',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
  };
}

// Server component that fetches initial data (from filesystem, not HTTP)
export default async function NanoBananaProPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  let initialData: any[] = [];
  let error: string | null = null;

  try {
    const data = readNanoBananaJson();
    initialData = Array.isArray(data?.prompts) ? data.prompts! : [];
  } catch (err) {
    console.error('Error loading initial prompts:', err);
    error = err instanceof Error ? err.message : 'Failed to load prompts';
  }

  // Generate JSON-LD structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nano Banana Pro Prompts',
    description: 'A curated collection of creative AI prompts for image generation, text creation, and more',
    url: `${SITE_URL}/${locale}/nano-banana-pro-prompts`,
    publisher: {
      '@type': 'Organization',
      name: 'Nano Banana',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    numberOfItems: initialData.length,
    itemListElement: initialData.slice(0, 10).map((prompt: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: prompt?.title || 'Untitled Prompt',
        description: prompt?.description || 'AI creative prompt',
        author: {
          '@type': 'Person',
          name: prompt?.author || 'Unknown',
        },
        datePublished: prompt?.date || undefined,
        // Use absolute, valid image URL for SEO
        image: prompt?.imageUrl,
      },
    })),
  };

  return (
    <>
      {/* Add structured data for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Client component with initial data */}
      <NanoBananaProPromptsClient initialData={initialData} error={error} />
    </>
  );
}
