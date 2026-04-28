import { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { getCanonicalUrl, getLanguagesMap } from '@/lib/canonical';
import { SITE_URL } from '@/lib/constants';
import PromptCard from '../../PromptCard';
import { nanoPromptsService } from '@/services/nanoPrompts';
import type { NanoPromptBase } from '@/types/nanoPrompts';
import { toOgLocale } from '@/lib/locale_utils';
import nanoMetadata from '@/lib/generated/nanobanana_prompts_metadata.json';
import CategoriesSection from "@/app/[locale]/_components/NanoBananaPromptsTags";
type TagEntry = {
  title?: string;
  description?: string;
  introText?: string;
  keywords?: string[];
};

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};


async function getTagEntry(tag: string): Promise<TagEntry> {
  const messages = await getMessages();
  const tagsData = messages.nanoPromptsTags as Record<string, TagEntry> | undefined;
  return tagsData?.[tag] ?? tagsData?.[tag.toLowerCase()] ?? {};
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = decodeURIComponent(slug);
  const entry = await getTagEntry(tag);

  const title = entry.title ?? tag;
  const description =
    entry.description ?? `Browse AI prompts tagged with ${tag}.`;

  const keywords = entry.keywords?.length
    ? entry.keywords
    : [tag, 'AI prompt', 'Nano Banana', 'prompt library'];

  const canonicalUrl = getCanonicalUrl(
    locale,
    `/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`
  );

  return {
    title,
    description,
    keywords,
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
          alt: title,
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
      languages: getLanguagesMap(
        `/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`
      ),
    },
  };
}

export default async function TagPage({ params }: Props) {
  const { locale, slug } = await params;
  const tag = decodeURIComponent(slug);
  const entry = await getTagEntry(tag);

  const title = entry.title ?? tag;
  const description = entry.description ?? null;
  const introText = entry.introText ?? null;

  let prompts: NanoPromptBase[] = [];
  try {
    prompts = await nanoPromptsService.getNanoPromptsByTag(tag);
  } catch (err) {
    console.error('Error fetching prompts for tag:', tag, err);
  }

  const categories = nanoMetadata.metadata.tags.map((t) => ({
    category: t.tag,
    count: t.count,
  }));

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description: description ?? `AI prompts tagged with ${tag}`,
    url: `${SITE_URL}/${locale}/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <header className="mb-8">
            {description && (
              <p className="mb-3 text-lg text-gray-600">
                {description}
              </p>
            )}

            {introText && (
              <p className="text-base text-gray-500">
                {introText}
              </p>
            )}

            <p className="mt-2 text-sm text-gray-400">
              {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
            </p>
          </header>

          <CategoriesSection categories={categories} currentTag={tag} />

          {prompts.length === 0 ? (
            <div className="rounded-lg bg-white py-12 text-center shadow">
              <h3 className="text-sm font-medium text-gray-900">
                No prompts found for &quot;{title}&quot;
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {prompts.map((prompt, i) => (
                <PromptCard key={`${prompt.id}-${i}`} prompt={prompt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}