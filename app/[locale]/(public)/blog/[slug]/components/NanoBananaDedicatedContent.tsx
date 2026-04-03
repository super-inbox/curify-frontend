'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'


export default function NanoBananaDedicatedContent() {
  const t = useTranslations('blog.nanoBananaDedicated')

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {t('positioning.title')}
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
            src="/images/banna.webp" 
            alt={t('heroImageAlt')}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        <div className="mt-6 p-6 bg-blue-50 dark:bg-black-900/20 rounded-lg">
          <p className="text-lg font-semibold text-black-900 dark:text-black-200 mb-2">
            {t('positioning.description')}
          </p>
          <p className="text-blue-900 dark:text-black-300">
            {t('positioning.subtitle')}
          </p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatNanoBananaCanDo.title')}</h2>
        <p className="mb-6">
          {t('whatNanoBananaCanDo.description')}
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {t.raw('whatNanoBananaCanDo.capabilities').map((capability: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition">
              <div className="text-3xl mb-3">{capability.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{capability.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{capability.description}</p>
            </div>
          ))}
        </div>
        
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('comparisonSection.title')}</h2>
        <p className="mb-6">
          {t('comparisonSection.description')}
        </p>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {t.raw('comparisonSection.comparisonTable.headers').map((header: string, index: number) => (
                    <th key={index} className="text-left p-3 font-semibold">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.raw('comparisonSection.comparisonTable.rows').map((row: string[], index: number) => (
                  <tr key={index} className="border-b">
                    {row.map((cell: string, cellIndex: number) => (
                      <td key={cellIndex} className="p-3">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-black-900/20 p-4 rounded-lg">
          <p className="text-yellow-800 dark:text-black-200 font-medium">
            🔑 {t('comparisonSection.keyDifferentiator')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('useCases.title')}</h2>
        <p className="mb-6">
          {t('useCases.description')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          {t.raw('useCases.cases').map((useCase: any, index: number) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <div className="text-2xl mb-3">{useCase.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{useCase.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">{useCase.description}</p>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Keywords: {useCase.keywords}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('beginnerFriendly.title')}</h2>
        <p className="mb-6">
          {t('beginnerFriendly.description')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-green-50 dark:bg-black-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-green-800 dark:text-black-200">
              {t('beginnerFriendly.beginnerFeatures.title')}
            </h3>
            <p className="text-sm text-green-700 dark:text-black-300 mb-4">
              {t('beginnerFriendly.beginnerFeatures.description')}
            </p>
            <ul className="space-y-2">
              {t.raw('beginnerFriendly.beginnerFeatures.features').map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 text-purple-800 dark:text-black-200">
              {t('beginnerFriendly.advancedFeatures.title')}
            </h3>
            <p className="text-sm text-purple-700 dark:text-black-300 mb-4">
              {t('beginnerFriendly.advancedFeatures.description')}
            </p>
            <ul className="space-y-2">
              {t.raw('beginnerFriendly.advancedFeatures.features').map((feature: string, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-600 mt-1">⚡</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('speedWorkflow.title')}</h2>
        <p className="mb-6">
          {t('speedWorkflow.description')}
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {t.raw('speedWorkflow.metrics').map((metric: any, index: number) => (
            <div key={index} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">{metric.icon}</div>
              <h3 className="font-semibold mb-1">{metric.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{metric.description}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg">
          <h3 className="font-semibold mb-3">Simple Workflow</h3>
          <div className="space-y-2">
            {t.raw('speedWorkflow.workflowSteps').map((step: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <span className="text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('tryNanoBanana.title')}</h2>
        <p className="mb-6">
          {t('tryNanoBanana.description')}
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {t.raw('tryNanoBanana.actions').map((action: any, index: number) => (
            <a 
              key={index} 
              href={action.url}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition block"
            >
              <div className="text-2xl mb-3">{action.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{action.description}</p>
            </a>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">{t('tryNanoBanana.gptIntegration.title')}</h3>
          <p className="mb-4">{t('tryNanoBanana.gptIntegration.description')}</p>
          <a 
            href={t('tryNanoBanana.gptIntegration.url')}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            {t('tryNanoBanana.gptIntegration.button')}
          </a>
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {t.raw('footer.tags').map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-xs text-blue-800 dark:text-blue-100">{tag}</span>
          ))}
        </div>
        
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">{t('footer.categoryCreation.title')}</h3>
          <p className="text-sm">{t('footer.categoryCreation.description')}</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 text-xs text-gray-600 dark:text-gray-400">
          <div>
            <strong>Core Keywords:</strong>
            <ul className="mt-1 space-y-1">
              {t.raw('footer.seoKeywords.core').map((keyword: string, index: number) => (
                <li key={index}>• {keyword}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Comparison Keywords:</strong>
            <ul className="mt-1 space-y-1">
              {t.raw('footer.seoKeywords.comparison').map((keyword: string, index: number) => (
                <li key={index}>• {keyword}</li>
              ))}
            </ul>
          </div>
          <div>
            <strong>Use Case Keywords:</strong>
            <ul className="mt-1 space-y-1">
              {t.raw('footer.seoKeywords.useCase').map((keyword: string, index: number) => (
                <li key={index}>• {keyword}</li>
              ))}
            </ul>
          </div>
        </div>
      </footer>

      <RelatedBlogs currentSlug="nano-banana-dedicated" locale="en" maxRelated={3} />
    </article>
  )
}
