'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import BlogCTACard from '@/app/[locale]/_components/BlogCTACard'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import BlogInlineClickTracker from '@/app/[locale]/(public)/blog/[slug]/components/BlogInlineClickTracker'
import BlogCodeBlockCopyTracker from '@/app/[locale]/(public)/blog/[slug]/components/BlogCodeBlockCopyTracker'
import { formatVoiceCloningContent } from '@/app/[locale]/(public)/blog/[slug]/utils/content-formatters'
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";

const TOOLS = [
  {
    idx: 1,
    color: 'blue',
    image: '/images/best-ai-tools-video-descript.webp',
    href: 'https://www.descript.com/',
  },
  {
    idx: 2,
    color: 'green',
    image: '/images/best-ai-tools-video-elevenlabs.webp',
    href: 'https://elevenlabs.io/',
  },
  {
    idx: 3,
    color: 'purple',
    image: '/images/best-ai-tools-video-runway.webp',
    href: 'https://runwayml.com/',
  },
] as const

const COLOR_CLASSES: Record<string, string> = {
  blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
}

export default function BestAiToolsContent() {
  const t = useTranslations('blog.bestAiTools')
  const locale = useLocale()

  return (
    <article className="max-w-5xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <BlogInlineClickTracker blogSlug="best-ai-tools">
      <BlogCodeBlockCopyTracker blogSlug="best-ai-tools">
      <header className="mb-8">
        <BlogCategoryLabel slug="best-ai-tools" />
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
          <span>{t('publishedDate')}</span>
          <span>•</span>
          <span>{t('readTime')}</span>
          <span>•</span>
          <span>{t('category')}</span>
        </div>
        <section className="mt-6 mb-6 not-prose">
          <a
            href={t('heroCtaHref')}
            className="block group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-gray-800"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
              <CdnImage
                src={t('heroImage')}
                alt={t('heroImageAlt')}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
              />
            </div>
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base font-semibold text-gray-900 dark:text-white">
                  {t('heroCtaText')}
                </div>
              </div>
              <div className="flex-shrink-0 rounded-lg bg-purple-600 text-white px-4 py-2 text-sm font-semibold group-hover:bg-purple-700 transition">
                Try it →
              </div>
            </div>
          </a>
        </section>
      </header>

      <div className="space-y-6">
        <p className="text-lg font-semibold text-purple-600 mb-4">{t('intro')}</p>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('whoThisIsForTitle')}</h2>
          <div
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('whoThisIsForContent')) }}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('buyersGuideTitle')}</h2>
          <div
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('buyersGuideContent')) }}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('methodologyTitle')}</h2>
          <div
            className="prose prose-lg max-w-none mb-4 italic text-gray-700 dark:text-gray-300 border-l-4 border-gray-300 dark:border-gray-700 pl-4"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('methodologyContent')) }}
          />
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('toolsTitle')}</h2>
          <p className="mb-6">{t('toolsIntro')}</p>

          {TOOLS.map(({ idx, color, image, href }) => (
            <div
              key={idx}
              className={`${COLOR_CLASSES[color]} border-l-4 rounded-lg my-6 not-prose overflow-hidden`}
            >
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700"
              >
                <CdnImage
                  src={image}
                  alt={`${t(`tool${idx}Name`).replace(/^\d+\.\s*/, '')} homepage`}
                  width={1200}
                  height={600}
                  className="w-full h-auto max-h-64 object-contain"
                />
              </a>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">
                  <a href={href} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {t(`tool${idx}Name`)}
                  </a>
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 italic">
                  {t(`tool${idx}Tagline`)}
                </p>
                <ul className="text-sm space-y-1 mb-4">
                  <li><strong>Best for:</strong> {t(`tool${idx}BestFor`)}</li>
                  <li><strong>Pricing:</strong> {t(`tool${idx}Pricing`)}</li>
                  <li><strong>Languages:</strong> {t(`tool${idx}Languages`)}</li>
                  <li><strong>Notable limitation:</strong> {t(`tool${idx}Limitation`)}</li>
                </ul>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t(`tool${idx}WhenToPick`)) }}
                />
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('comparisonTitle')}</h2>
          <p className="mb-4">{t('comparisonIntro')}</p>
          <div className="overflow-x-auto my-6 not-prose">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left"></th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Descript</th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">ElevenLabs</th>
                  <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">Runway</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Best for</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool1BestFor')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool2BestFor')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool3BestFor')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Pricing</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool1Pricing')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool2Pricing')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool3Pricing')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Languages</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool1Languages')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool2Languages')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool3Languages')}</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 font-semibold">Limitation</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool1Limitation')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool2Limitation')}</td>
                  <td className="border border-gray-300 dark:border-gray-700 px-4 py-2">{t('tool3Limitation')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('decisionRubricTitle')}</h2>
          <div
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('decisionRubricContent')) }}
          />
        </section>

        <section
          id="curify-callout"
          className="border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 p-8 rounded-lg my-8 not-prose"
        >
          <h2 className="text-2xl font-bold mb-4">{t('curifyCalloutTitle')}</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('curifyCalloutContent')) }}
          />
          <div className="mt-6">
            <Link
              href="/tools/video-dubbing"
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              Try Curify Video Dubbing →
            </Link>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('faqTitle')}</h2>
          <div className="space-y-6 mb-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0"
              >
                <h3 className="text-lg font-semibold mb-2">{t(`faq${idx}Q`)}</h3>
                <div
                  className="prose prose-base max-w-none text-gray-700 dark:text-gray-300"
                  dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t(`faq${idx}A`)) }}
                />
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('conclusionTitle')}</h2>
          <div
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{ __html: formatVoiceCloningContent(t('conclusionContent')) }}
          />
        </section>

        <BlogCTACard category="creator-tools" slug="best-ai-tools" locale={locale} />

        <RelatedBlogs currentSlug="best-ai-tools" locale={locale} maxRelated={2} />
      </div>
      </BlogCodeBlockCopyTracker>
      </BlogInlineClickTracker>
    </article>
  )
}
