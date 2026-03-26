import type { Metadata } from 'next';

import NanoBananaProPromptsClient from './NanoBananaProPromptsClient';
import { getCanonicalUrl, getLanguagesMap } from '@/lib/canonical';
import { SITE_URL } from '@/lib/constants';
import { nanoPromptsService } from '@/services/nanoPrompts';
import type { NanoPromptBase } from '@/types/nanoPrompts';
import { toOgLocale } from '@/lib/locale_utils';

export const runtime = 'nodejs';


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Nano Banana Pro Prompts - Discover Creative AI Prompts';
  const description =
    'Explore curated AI prompts from top creators. Find inspiration for your next project with prompts for image generation, text creation, and more.';
  const canonicalUrl = getCanonicalUrl(locale, '/nano-banana-pro-prompts');

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
      url: canonicalUrl,
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
      canonical: canonicalUrl,
      languages: getLanguagesMap('/nano-banana-pro-prompts'),
    },
  };
}

export default async function NanoBananaProPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  let initialData: NanoPromptBase[] | null = null;
  let error: string | null = null;

  try {
    initialData = await nanoPromptsService.getMostPopularNanoPrompts();
  } catch (err) {
    console.error('Error loading initial prompts:', err);
    error = err instanceof Error ? err.message : 'Failed to load prompts';
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Nano Banana Pro Prompts',
    description:
      'A curated collection of creative AI prompts for image generation, text creation, and more',
    url: `${SITE_URL}/${locale}/nano-banana-pro-prompts`,
    publisher: {
      '@type': 'Organization',
      name: 'Nano Banana',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/images/logo.png`,
      },
    },
    numberOfItems: initialData?.length ?? 0,
    itemListElement: (initialData ?? []).slice(0, 10).map((prompt, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: prompt.title || 'Untitled Prompt',
        description: prompt.description || 'AI creative prompt',
        image: prompt.imageURL,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <NanoBananaProPromptsClient
        initialData={initialData}
        error={error}
      />
    </>
  );
}