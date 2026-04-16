'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.curifyAiGrowthEngine')

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
            src="/images/growthengine.webp" 
            className="w-full rounded-lg shadow-lg"
            alt="Curify AI Growth Engine"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('introTitle')}</h2>
        <p className="mb-4 text-lg">
          {t('introContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatIsGrowthEngine.title')}</h2>
        <p className="mb-4">
          {t('whatIsGrowthEngine.content')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
          <h3 className="text-xl font-semibold mb-3">🚀 {t('whatIsGrowthEngine.coreComponents.title')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {t.raw('whatIsGrowthEngine.coreComponents.items').map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{item.split(':')[0]}</span>
                <div>
                  <strong>{item.split(':')[1].split(' - ')[0]}</strong> - {item.split(':')[1].split(' - ')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('forUgcCreators.title')}</h2>
        <p className="mb-4">
          {t('forUgcCreators.intro')}
        </p>
        
        <div className="space-y-6">
          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📱 {t('forUgcCreators.contentScaling.title')}</h3>
            <p className="mb-3">{t('forUgcCreators.contentScaling.description')}</p>
            <ul className="space-y-2">
              {t.raw('forUgcCreators.contentScaling.benefits').map((benefit: string, index: number) => (
                <li key={index}>• {benefit}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('forUgcCreators.creativeEnhancement.title')}</h3>
            <p className="mb-3">{t('forUgcCreators.creativeEnhancement.description')}</p>
            <ul className="space-y-2">
              {t.raw('forUgcCreators.creativeEnhancement.features').map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">💰 {t('forUgcCreators.monetization.title')}</h3>
            <p className="mb-3">{t('forUgcCreators.monetization.description')}</p>
            <ul className="space-y-2">
              {t.raw('forUgcCreators.monetization.opportunities').map((opportunity: string, index: number) => (
                <li key={index}>• {opportunity}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('forMarketers.title')}</h2>
        <p className="mb-4">
          {t('forMarketers.intro')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📊 {t('forMarketers.dataDriven.title')}</h3>
            <p className="mb-3">{t('forMarketers.dataDriven.description')}</p>
            <ul className="space-y-2 text-sm">
              {t.raw('forMarketers.dataDriven.capabilities').map((capability: string, index: number) => (
                <li key={index}>• {capability}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">⚡ {t('forMarketers.automation.title')}</h3>
            <p className="mb-3">{t('forMarketers.automation.description')}</p>
            <ul className="space-y-2 text-sm">
              {t.raw('forMarketers.automation.features').map((feature: string, index: number) => (
                <li key={index}>• {feature}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">🎯 {t('forMarketers.personalization.title')}</h3>
          <p className="mb-3">{t('forMarketers.personalization.description')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            {t.raw('forMarketers.personalization.examples').map((example: string, index: number) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">{example.split(':')[0]}</h4>
                <p className="text-sm">{example.split(':')[1]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howItWorks.title')}</h2>
        
        <div className="space-y-6">
          {t.raw('howItWorks.steps').map((step: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-2xl mr-2">{step.icon}</span>
                {step.title}
              </h3>
              <p className="mb-4">{step.description}</p>
              <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                <h4 className="font-semibold mb-2">{step.example.title}</h4>
                <p className="text-sm">{step.example.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('realWorldResults.title')}</h2>
        
        <div className="grid md:grid-cols-3 gap-6 my-6">
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">10x</div>
            <div className="font-semibold">{t('realWorldResults.metric1.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('realWorldResults.metric1.description')}</div>
          </div>
          
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">75%</div>
            <div className="font-semibold">{t('realWorldResults.metric2.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('realWorldResults.metric2.description')}</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">50%</div>
            <div className="font-semibold">{t('realWorldResults.metric3.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('realWorldResults.metric3.description')}</div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📱 {t('realWorldResults.case1.title')}</h3>
            <p className="text-sm mb-2">{t('realWorldResults.case1.description')}</p>
            <p className="text-xs text-gray-600">{t('realWorldResults.case1.result')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎯 {t('realWorldResults.case2.title')}</h3>
            <p className="text-sm mb-2">{t('realWorldResults.case2.description')}</p>
            <p className="text-xs text-gray-600">{t('realWorldResults.case2.result')}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('gettingStarted.title')}</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('gettingStarted.stepsTitle')}</h3>
          <div className="space-y-4">
            {t.raw('gettingStarted.steps').map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <strong>{step.split(':')[0]}</strong> - {step.split(':')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href={t('gettingStarted.ctaLink')} 
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('gettingStarted.ctaText')}
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('future.title')}</h2>
        <p className="mb-4">
          {t('future.content')}
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('future.roadmap.title')}</h3>
          <div className="space-y-3">
            {t.raw('future.roadmap.items').map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-green-500">✓</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {t.raw('footer.tags').map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm text-blue-800 dark:text-blue-100">{tag}</span>
          ))}
        </div>
        
        <div className="text-center">
          <p className="mb-4">{t('footer.questions')}</p>
          <a 
            href={t('footer.contactLink')} 
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('footer.contactText')}
          </a>
        </div>
      </footer>

      <RelatedBlogs currentSlug="curify-ai-growth-engine" locale="en" maxRelated={3} />
    </article>
  )
}
