'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
export default function BlogContent() {
  const t = useTranslations('blog.redCarpetAiLooks')
  const locale = useLocale()

  return (
    <article className="max-w-5xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {t('title')}
        </h1>
        <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400">
          <span>{t('publishedDate')}</span>
          <span>•</span>
          <span>{t('readTime')}</span>
          <span>•</span>
          <span>{t('category')}</span>
        </div>
        <div className="mt-4 mb-4 mx-auto max-w-lg md:max-w-xl md:float-right md:ml-6 md:mx-0 flex items-center justify-center">
          <CdnImage
            src="/images/2b234839e1161a6d57af43e828efd3ec_thumb_1764263264241.jpg"
            width={672}
            height={448}
            className="block max-w-full max-h-96 w-auto h-auto rounded-lg shadow-lg"
            alt="Red Carpet AI Fashion Looks"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('intro.title')}</h2>
        <p className="mb-4">
          {t('intro.content1')}
        </p>
        <p className="mb-4">
          {t('intro.content2')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('corePromptRecipe.title')}</h2>
        <p className="mb-4">
          {t('corePromptRecipe.content')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('styleArchetypes.title')}</h2>
        <p className="mb-4">
          {t('styleArchetypes.intro')}
        </p>

        {t.raw('styleArchetypes.list').map((archetype: any, index: number) => (
          <div key={archetype.id} className="mb-8">
            <h3 className="text-2xl font-semibold mb-3 mt-6">{archetype.title}</h3>
            <p className="mb-4">
              {archetype.description}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {archetype.prompt}
              </pre>
            </div>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('promptAnatomy.title')}</h2>
        <p className="mb-4">
          {t('promptAnatomy.content')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('pitfallsAndSafety.title')}</h2>
        <p className="mb-4">
          {t('pitfallsAndSafety.intro')}
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-semibold">Issue</th>
                <th className="text-left p-4 font-semibold">Fix</th>
              </tr>
            </thead>
            <tbody>
              {t.raw('pitfallsAndSafety.table').map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-4">{item.issue}</td>
                  <td className="p-4">{item.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <BlogCTACard
        category="nano-template"
        slug="red-carpet-ai-looks"
        locale={locale}
      />

      <RelatedBlogs currentSlug="red-carpet-ai-looks" locale={locale} maxRelated={2} />
      
    </article>
  )
}
