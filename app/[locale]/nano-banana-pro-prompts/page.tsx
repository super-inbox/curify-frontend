import { Metadata } from 'next';
import NanoBananaProPromptsClient from './NanoBananaProPromptsClient';

// Generate metadata for SEO
export async function generateMetadata(): Promise<Metadata> {
  // Fetch prompt count for dynamic metadata
  let totalPrompts = 0;
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/data/nanobanana.json`, {
      cache: 'no-store'
    });
    const data = await response.json();
    totalPrompts = data?.prompts?.length || 0;
  } catch (error) {
    console.error('Error fetching prompts for metadata:', error);
  }

  const title = 'Nano Banana Pro Prompts - Discover Creative AI Prompts';
  const description = `Explore ${totalPrompts}+ curated AI prompts from top creators. Find inspiration for your next project with prompts for image generation, text creation, and more.`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/nano-banana-pro-prompts`;

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
      'creative AI'
    ],
    authors: [{ name: 'Nano Banana' }],
    creator: 'Nano Banana',
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      title,
      description,
      siteName: 'Nano Banana Pro Prompts',
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/og-prompts.jpg`,
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
      images: [`${process.env.NEXT_PUBLIC_SITE_URL}/images/og-prompts.jpg`],
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

// Server component that fetches initial data
export default async function NanoBananaProPromptsPage() {
  let initialData = null;
  let error = null;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/data/nanobanana.json`, {
      cache: 'no-store', // Use 'force-cache' if data doesn't change often
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    initialData = responseData?.prompts || [];
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
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/nano-banana-pro-prompts`,
    publisher: {
      '@type': 'Organization',
      name: 'Nano Banana',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/images/logo.png`,
      },
    },
    numberOfItems: initialData?.length || 0,
    itemListElement: initialData?.slice(0, 10).map((prompt: any, index: number) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'CreativeWork',
        name: prompt.title,
        description: prompt.description || 'AI creative prompt',
        author: {
          '@type': 'Person',
          name: prompt.author || 'Unknown',
        },
        datePublished: prompt.date,
        image: prompt.imageUrl ? `${process.env.NEXT_PUBLIC_SITE_URL}${prompt.imageUrl}` : undefined,
      },
    })) || [],
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
