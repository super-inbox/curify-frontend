import { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { getCanonicalUrl, getLanguagesMap } from '@/lib/canonical';
import { SITE_URL } from '@/lib/constants';
import PromptCard from '../../PromptCard';
import { nanoPromptsService } from '@/services/nanoPrompts';
import type { NanoPromptBase } from '@/types/nanoPrompts';
import nanoMetadata from '@/lib/generated/nanobanana_prompts_metadata.json';

type TagEntry = { title?: string; description?: string; introText?: string };                                                                               

type MetadataEntry = { category: string; keywords?: string[] };
const keywordsMap = Object.fromEntries(
  (nanoMetadata.metadata.domainCategories as MetadataEntry[]).map((c) => [c.category, c.keywords ?? []])
);

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

function toOgLocale(locale: string) {
  const map: Record<string, string> = {
    en: 'en_US', zh: 'zh_CN', es: 'es_ES', fr: 'fr_FR',
    de: 'de_DE', ja: 'ja_JP', ko: 'ko_KR', hi: 'hi_IN',
    tr: 'tr_TR', ru: 'ru_RU',
  };
  return map[locale] || 'en_US';
}


async function getTagEntry(tag: string): Promise<TagEntry> {
  const messages = await getMessages();
  const tagsData = messages.nanoPromptsTags as Record<string, TagEntry> | undefined;
  return tagsData?.[tag] ?? tagsData?.[tag.toLowerCase()] ?? {};
}

function mapPrompt(p: NanoPromptBase) {
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    promptText: p.prompt,
    imageUrl: p.imageURL,
    category: p.tags?.[0] ?? null,
    sourceType: null,
    domainCategory: p.tags?.[0] ?? null,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const tag = decodeURIComponent(slug);
  const entry = await getTagEntry(tag);

  const title = entry.title ?? tag;
  const description = entry.description ?? `Browse AI prompts tagged with ${tag}.`;
  const keywords = keywordsMap[tag] ?? [tag];

  const canonicalUrl = getCanonicalUrl(locale, `/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`);

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
      images: [{ url: `${SITE_URL}/images/og-prompts.jpg`, width: 1200, height: 630, alt: title }],
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
      googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    alternates: {
      canonical: canonicalUrl,
      languages: getLanguagesMap(`/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`),
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

  let prompts: ReturnType<typeof mapPrompt>[] = [];
  try {
    const data = await nanoPromptsService.getNanoPromptsByTag(tag);
    prompts = data.map(mapPrompt);
  } catch (err) {
    console.error('Error fetching prompts for tag:', tag, err);
  }

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
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
            {description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">{description}</p>
            )}
            {introText && (
              <p className="text-base text-gray-500 max-w-2xl mx-auto">{introText}</p>
            )}
            <p className="text-sm text-gray-400 mt-3">
              {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
            </p>
          </header>

          {prompts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-900">No prompts found for &quot;{title}&quot;</h3>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
