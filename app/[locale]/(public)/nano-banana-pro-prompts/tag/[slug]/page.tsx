import { Metadata } from 'next';
import { getMessages, getTranslations } from 'next-intl/server';
import { getCanonicalUrl, getLanguagesMap } from '@/lib/canonical';
import { SITE_URL } from '@/lib/constants';
import PromptCard from '../../PromptCard';
import { nanoPromptsService } from '@/services/nanoPrompts';
import type { NanoPromptBase } from '@/types/nanoPrompts';
import { toOgLocale, resolveContentLocale, makeSafeTranslator } from '@/lib/locale_utils';
import nanoMetadata from '@/lib/generated/nanobanana_prompts_metadata.json';
import CategoriesSection from "@/app/[locale]/_components/NanoBananaPromptsTags";
import { getTopicsForTag, getTemplatesForTopic } from '@/lib/topicRegistry';
import { nanoRegistry } from '@/lib/nano_utils';
import { buildNanoFeedCards } from '@/lib/nano_page_data';
import NanoTemplateDetailClient from '@/app/[locale]/(public)/nano-template/[slug]/NanoTemplateDetailClient';

const PROMPTS_VISIBLE_CAP = 30;
const TEMPLATE_CARDS_CAP = 30;

// Cache tag listing pages for 4 hours with ISR — listings rarely
// change and bot crawls hit these often.
export const revalidate = 14400;

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

  const path = `/nano-banana-pro-prompts/tag/${encodeURIComponent(tag)}`;

  // Tag pages list prompts that are en-only — non-en locales differ
  // only in a 1-line title/description while the rest of the body is
  // identical. Google treated those as duplicates ("Crawled - currently
  // not indexed"). Keep only the en page indexable and canonical the
  // others to en.
  const isCanonicalLocale = locale === "en";
  const canonicalUrl = isCanonicalLocale
    ? getCanonicalUrl(locale, path)
    : getCanonicalUrl("en", path);

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
    robots: isCanonicalLocale
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : { index: false, follow: true },
    alternates: {
      canonical: canonicalUrl,
      // Only en is indexable; hreflang only references en.
      languages: {
        en: getCanonicalUrl("en", path),
        "x-default": getCanonicalUrl("en", path),
      },
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
  // Cap visible prompt cards so the page has room for the template
  // section below without scrolling 100+ images first.
  const visiblePrompts = prompts.slice(0, PROMPTS_VISIBLE_CAP);

  // Reverse-map: which Tier-1 topics roll up from this gallery tag? If
  // any, surface a "Templates exploring [tag]" row below the prompt grid
  // using the same NanoInspirationRow shape topics pages use. Tags not in
  // the mapping (≈half of the 151 gallery tags as of today) skip the
  // section entirely.
  const contentLocale = resolveContentLocale(locale);
  const mappedTopics = getTopicsForTag(tag);
  let templateCards: ReturnType<typeof buildNanoFeedCards> = [];
  if (mappedTopics.length > 0) {
    const allowed = new Set<string>();
    for (const topicId of mappedTopics) {
      for (const t of getTemplatesForTopic(topicId)) allowed.add(t.id);
    }
    if (allowed.size > 0) {
      const tNano = await getTranslations({ locale, namespace: 'nano' });
      const translateNano = makeSafeTranslator(tNano);
      const all = buildNanoFeedCards(nanoRegistry, contentLocale, {
        perTemplateMaxImages: 2,
        strictLocale: false,
        translate: translateNano,
        limit: 200, // generous pre-filter; we filter by template_id next
      });
      templateCards = all
        .filter((c) => allowed.has(c.template_id))
        .slice(0, TEMPLATE_CARDS_CAP);
    }
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
              {visiblePrompts.map((prompt, i) => (
                <PromptCard key={`${prompt.id}-${i}`} prompt={prompt} openInCarousel />
              ))}
            </div>
          )}

          {templateCards.length > 0 && (
            <section className="mt-12">
              <div className="mb-3">
                <h2 className="text-lg font-bold text-neutral-900">
                  Templates exploring &ldquo;{title}&rdquo;
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Generate your own prompts in these template formats.
                </p>
              </div>
              <NanoTemplateDetailClient
                locale={locale}
                otherNanoCards={templateCards}
                showReproduce={false}
                showOtherTemplates={true}
                showOtherTemplateTitle={false}
              />
            </section>
          )}
        </div>
      </div>
    </>
  );
}