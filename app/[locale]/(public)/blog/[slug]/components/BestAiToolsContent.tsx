'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BestAiToolsContent() {
  const t = useTranslations('blog.bestAiTools')

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
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
        <div className="mt-6">
          <CdnImage
            src="/images/bestools.webp" 
            alt={t('heroImageAlt')}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('introduction.title')}</h2>
        <p className="mb-4">
          {t('introduction.description')}
        </p>
        <p className="mb-4">
          {t('introduction.subtitle')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-6">{t('tools.title')}</h2>
        <div className="space-y-8">
          {t.raw('tools.list').map((tool: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{tool.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{tool.name}</h3>
                  <p className="text-white-600 dark:text-gray-400 mb-3">{tool.category}</p>
                  <p className="mb-4">{tool.description}</p>
                  
                  <div className="bg-white-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded mb-4">
                    <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">{t('features.title')}</h4>
                    <ul className="space-y-1 text-gray-700 dark:text-white">
                      {tool.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-sm">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm text-gray-500">{t('pricing.title')}: </span>
                      <span className="font-medium">{tool.pricing}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">{t('bestFor.title')}: </span>
                      <span className="font-medium">{tool.bestFor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('comparison.title')}</h2>
        <p className="mb-4">
          {t('comparison.description')}
        </p>
        
        <div className="bg-white-50 dark:bg-white-900 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('comparison.tableTitle')}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('comparison.toolColumn')}</th>
                  <th className="text-left p-2">{t('comparison.categoryColumn')}</th>
                  <th className="text-left p-2">{t('comparison.pricingColumn')}</th>
                  <th className="text-left p-2">{t('comparison.difficultyColumn')}</th>
                </tr>
              </thead>
              <tbody>
                {t.raw('comparison.tableData').map((row: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{row.tool}</td>
                    <td className="p-2">{row.category}</td>
                    <td className="p-2">{row.pricing}</td>
                    <td className="p-2">{row.difficulty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howToChoose.title')}</h2>
        <p className="mb-4">
          {t('howToChoose.description')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {t.raw('howToChoose.factors').map((factor: any, index: number) => (
            <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{factor.title}</h3>
              <p className="text-sm">{factor.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('workflow.title')}</h2>
        <p className="mb-4">
          {t('workflow.description')}
        </p>
        
        <div className="space-y-4">
          {t.raw('workflow.steps').map((step: any, index: number) => (
            <div key={index} className="flex items-start gap-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                {index + 1}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('tips.title')}</h2>
        <p className="mb-4">
          {t('tips.description')}
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <ul className="space-y-2">
            {t.raw('tips.list').map((tip: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-600">💡</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('future.title')}</h2>
        <p className="mb-4">
          {t('future.description')}
        </p>
        
        <div className="grid md:grid-cols-3 gap-4">
          {t.raw('future.trends').map((trend: any, index: number) => (
            <div key={index} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">{trend.title}</h3>
              <p className="text-sm">{trend.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {t.raw('footer.tags').map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm text-blue-800 dark:text-blue-100">{tag}</span>
          ))}
        </div>
        
        <div className="text-white">
          <p>{t('footer.questions')}</p>
        </div>
      </footer>

      <RelatedBlogs currentSlug="best-ai-tools" locale="en" maxRelated={3} />
    </article>
  )
}
