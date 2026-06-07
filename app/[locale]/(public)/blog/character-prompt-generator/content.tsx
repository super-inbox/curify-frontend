'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import NanoBananaExamples from '@/app/[locale]/(public)/blog/[slug]/NanoBananaExamples'
import BlogInlineClickTracker from '@/app/[locale]/(public)/blog/[slug]/components/BlogInlineClickTracker'
import BlogCodeBlockCopyTracker from '@/app/[locale]/(public)/blog/[slug]/components/BlogCodeBlockCopyTracker'

import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
type TemplateEntry = { name: string; slug: string; params: string }
type WorkedCharacter = { name: string; mbti: string; blurb: string }
type WorkedUniverse = {
  name: string
  slug: string
  heading: string
  description: string
  characters: WorkedCharacter[]
}
type MbtiIndexRow = { type: string; label: string; character: string; slug: string }

export default function BlogContent() {
  const t = useTranslations('blog.characterPromptGenerator')
  const locale = useLocale()
  const localePrefix = locale === 'en' ? '' : `/${locale}`

  const templateLink = (slug: string) => `${localePrefix}/nano-template/${slug}`

  return (
    <article className="mx-auto max-w-6xl px-4 py-8">
      <BlogInlineClickTracker blogSlug="character-prompt-generator">
      <BlogCodeBlockCopyTracker blogSlug="character-prompt-generator">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <header className="mb-8">
          <BlogCategoryLabel slug="character-prompt-generator" />
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
            <span>{t('publishedDate')}</span>
            <span>•</span>
            <span>{t('readTime')}</span>
            <span>•</span>
            <span>{t('category')}</span>
          </div>
          <section className="mt-6 mb-6 not-prose">
            <a
              href={`${localePrefix}${t('heroCtaHref')}`}
              className="block group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-white dark:bg-gray-800"
            >
              <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-gray-900">
                <CdnImage
                  src="/images/nano_insp_preview/template-mbti-marvel-en-marvel-hulk-prev.jpg"
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
                <div className="flex-shrink-0 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold group-hover:bg-blue-700 transition">
                  Try it →
                </div>
              </div>
            </a>
          </section>
          <p className="mt-2 text-lg text-gray-800 dark:text-gray-200">{t('intro')}</p>
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

        {/* Worked Examples — MBTI by Universe */}
        <section id="universes" className="mb-10 not-prose">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">{t('workedExamples.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{t('workedExamples.intro')}</p>
          <div className="space-y-8">
            {(t.raw('workedExamples.universes') as WorkedUniverse[]).map((u) => (
              <div key={u.slug} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">{u.heading}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-5">{u.description}</p>
                <div className="space-y-3 mb-5">
                  {u.characters.map((c) => (
                    <div key={c.name} className="border-l-4 border-blue-400 pl-4 py-1">
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                        {c.name} — <span className="text-blue-700 dark:text-blue-300 font-mono">{c.mbti}</span>
                      </h4>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.blurb}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={templateLink(u.slug)}
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded transition"
                >
                  Generate a {u.name} MBTI card →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* MBTI Quick Reference */}
        <section id="mbti-index" className="mb-10 not-prose">
          <h2 className="text-3xl font-semibold mb-2 text-gray-900 dark:text-white">{t('mbtiIndex.title')}</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{t('mbtiIndex.intro')}</p>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full border border-gray-200 dark:border-gray-700 text-sm">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Type</th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Label</th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Featured Character</th>
                  <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-left">Template</th>
                </tr>
              </thead>
              <tbody>
                {(t.raw('mbtiIndex.rows') as MbtiIndexRow[]).map((row) => (
                  <tr key={row.type} className="even:bg-gray-50 dark:even:bg-gray-900/30">
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2 font-mono font-semibold">{row.type}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">{row.label}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">{row.character}</td>
                    <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                      <Link href={templateLink(row.slug)} className="text-blue-600 dark:text-blue-300 hover:underline">
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">{t('mbtiIndex.note')}</p>
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
      </BlogCodeBlockCopyTracker>
      </BlogInlineClickTracker>
    </article>
  )
}
