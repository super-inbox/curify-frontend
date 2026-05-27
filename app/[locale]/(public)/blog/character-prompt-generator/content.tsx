'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import NanoBananaExamples from '@/app/[locale]/(public)/blog/[slug]/NanoBananaExamples'

import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
type TemplateEntry = { name: string; slug: string; params: string }

export default function BlogContent() {
  const t = useTranslations('blog.characterPromptGenerator')
  const locale = useLocale()
  const localePrefix = locale === 'en' ? '' : `/${locale}`

  const templateLink = (slug: string) => `${localePrefix}/nano-template/${slug}`

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
            <span>{t('publishedDate')}</span>
            <span>•</span>
            <span>{t('readTime')}</span>
            <span>•</span>
            <span>{t('category')}</span>
          </div>
          <div className="mt-6 max-w-xs">
            <CdnImage
              src="/images/nano_insp_preview/template-mbti-marvel-en-marvel-hulk-prev.jpg"
              width={320}
              height={400}
              className="w-full rounded-lg shadow-md"
              alt={t('heroImageAlt')}
            />
          </div>
          <p className="mt-6 text-lg text-gray-800 dark:text-gray-200">{t('intro')}</p>
        </header>

        {/* What We Ship — three grounded groups */}
        <section className="mb-10 not-prose">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">{t('whatWeShip.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{t('whatWeShip.intro')}</p>

          {/* Group: Build from Scratch */}
          <div className="mb-8 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('whatWeShip.buildFromScratch.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('whatWeShip.buildFromScratch.description')}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(t.raw('whatWeShip.buildFromScratch.templates') as TemplateEntry[]).map((tpl) => (
                <Link
                  key={tpl.slug}
                  href={templateLink(tpl.slug)}
                  className="block rounded border border-neutral-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 hover:border-blue-400 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-blue-700 dark:text-blue-300">{tpl.name} →</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">{tpl.params}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Group: Re-imagine Known */}
          <div className="mb-8 bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🌌 {t('whatWeShip.reimagineKnown.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('whatWeShip.reimagineKnown.description')}</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {(t.raw('whatWeShip.reimagineKnown.templates') as TemplateEntry[]).map((tpl) => (
                <Link
                  key={tpl.slug}
                  href={templateLink(tpl.slug)}
                  className="block rounded border border-neutral-200 bg-white dark:bg-gray-800 dark:border-gray-700 px-3 py-2 hover:border-purple-400 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-purple-700 dark:text-purple-300 text-sm">{tpl.name} →</div>
                  {tpl.params && (
                    <div className="mt-0.5 text-[11px] text-gray-600 dark:text-gray-400 font-mono truncate">
                      {tpl.params}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Group: Multi-character */}
          <div className="mb-2 bg-amber-50 dark:bg-amber-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">👥 {t('whatWeShip.multiCharacter.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('whatWeShip.multiCharacter.description')}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {(t.raw('whatWeShip.multiCharacter.templates') as TemplateEntry[]).map((tpl) => (
                <Link
                  key={tpl.slug}
                  href={templateLink(tpl.slug)}
                  className="block rounded border border-neutral-200 bg-white dark:bg-gray-800 dark:border-gray-700 p-4 hover:border-amber-400 hover:shadow-sm transition"
                >
                  <div className="font-semibold text-amber-700 dark:text-amber-300">{tpl.name} →</div>
                  <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 font-mono">{tpl.params}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How to Use — three recipes */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-4">{t('howToUse.title')}</h2>
          <div className="space-y-6">
            {(['recipe1', 'recipe2', 'recipe3'] as const).map((key) => (
              <div key={key} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold mb-3">{t(`howToUse.${key}.title`)}</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  {(t.raw(`howToUse.${key}.steps`) as string[]).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* Live template cards */}
        <section className="mb-10 not-prose">
          <NanoBananaExamples locale={locale} blogSlug="character-prompt-generator" />
        </section>

        {/* Who can benefit */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-4">{t('whoCanBenefit.title')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {(['writers', 'artists', 'gameDevelopers', 'creators'] as const).map((seg, i) => (
              <div key={seg} className={`border-l-4 pl-5 py-2 ${['border-green-500', 'border-orange-500', 'border-blue-500', 'border-purple-500'][i]}`}>
                <h3 className="text-lg font-semibold mb-1">{t(`whoCanBenefit.${seg}.title`)}</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{t(`whoCanBenefit.${seg}.description`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pro tips */}
        <section className="mb-10">
          <h2 className="text-3xl font-semibold mb-4">{t('proTips.title')}</h2>
          <ul className="space-y-2 text-gray-800 dark:text-gray-200">
            {(t.raw('proTips.tips') as string[]).map((tip, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {(t.raw('footer.tags') as string[]).map((tag, i) => (
              <span
                key={i}
                className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-xs text-blue-800 dark:text-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{t('footer.questions')}</p>

        <BlogCTACard
          category="creator-tools"
          slug="character-prompt-generator"
          locale={locale}
        />

        </footer>

        <RelatedBlogs currentSlug="character-prompt-generator" locale={locale} maxRelated={2} />
      </div>
    </article>
  )
}
