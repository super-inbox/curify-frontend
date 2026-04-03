'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'

export default function BlogContent() {
  const t = useTranslations('blog.characterPromptGenerator')

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
          <img 
            src="/images/templatepage.webp" 
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatWeHave.title')}</h2>
        <p className="mb-4">
          {t('whatWeHave.description')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎨 {t('whatWeHave.characterDesign.title')}</h3>
            <ul className="space-y-2">
              {t.raw('whatWeHave.characterDesign.items').map((item: string, index: number) => (
                <li key={index}>• <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">⚔️ {t('whatWeHave.interactiveScenarios.title')}</h3>
            <ul className="space-y-2">
              {t.raw('whatWeHave.interactiveScenarios.items').map((item: string, index: number) => (
                <li key={index}>• <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whoCanBenefit.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📝 {t('whoCanBenefit.writers.title')}</h3>
            <p className="mb-3">
              {t('whoCanBenefit.writers.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('whoCanBenefit.writers.perfectFor')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('whoCanBenefit.writers.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('whoCanBenefit.artists.title')}</h3>
            <p className="mb-3">
              {t('whoCanBenefit.artists.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('whoCanBenefit.artists.perfectFor')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('whoCanBenefit.artists.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎮 {t('whoCanBenefit.gameDevelopers.title')}</h3>
            <p className="mb-3">
              {t('whoCanBenefit.gameDevelopers.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('whoCanBenefit.gameDevelopers.perfectFor')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('whoCanBenefit.gameDevelopers.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎭 {t('whoCanBenefit.creators.title')}</h3>
            <p className="mb-3">
              {t('whoCanBenefit.creators.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('whoCanBenefit.creators.perfectFor')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('whoCanBenefit.creators.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howToUse.title')}</h2>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🚀 {t('howToUse.step1.title')}</h3>
            <p className="mb-4">
              {t('howToUse.step1.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">{t('howToUse.step1.templates.character.name')}</h4>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.character.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.character.parameters')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">{t('howToUse.step1.templates.analysis.name')}</h4>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.analysis.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.analysis.parameters')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">{t('howToUse.step1.templates.comparison.name')}</h4>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.comparison.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.comparison.parameters')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">{t('howToUse.step1.templates.mbti.name')}</h4>
                <p className="text-sm mb-2">{t('howToUse.step1.templates.mbti.description')}</p>
                <p className="text-xs text-gray-600">{t('howToUse.step1.templates.mbti.parameters')}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">⚙️ {t('howToUse.step2.title')}</h3>
            <p className="mb-4">
              {t('howToUse.step2.description')}
            </p>
            <div className="space-y-3">
              {t.raw('howToUse.step2.options').map((option: any, index: number) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-2xl">{option.icon}</span>
                  <div>
                    <strong>{option.title}</strong> {option.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">✨ {t('howToUse.step3.title')}</h3>
            <p className="mb-4">
              {t('howToUse.step3.description')}
            </p>
            <ul className="space-y-2">
              {t.raw('howToUse.step3.features').map((feature: string, index: number) => (
                <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('advancedFeatures.title')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎯 {t('advancedFeatures.proTips.title')}</h3>
            <ul className="space-y-2 text-sm">
              {t.raw('advancedFeatures.proTips.tips').map((tip: string, index: number) => (
                <li key={index}>• {tip}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🔧 {t('advancedFeatures.integration.title')}</h3>
            <ul className="space-y-2 text-sm">
              {t.raw('advancedFeatures.integration.possibilities').map((possibility: string, index: number) => (
                <li key={index}>• {possibility}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('realWorldApplications.title')}</h2>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📚 {t('realWorldApplications.novelWriting.title')}</h3>
            <p className="text-sm">
              {t('realWorldApplications.novelWriting.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.novelWriting.attribution')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎮 {t('realWorldApplications.gameDevelopment.title')}</h3>
            <p className="text-sm">
              {t('realWorldApplications.gameDevelopment.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.gameDevelopment.attribution')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">🎭 {t('realWorldApplications.cosplay.title')}</h3>
            <p className="text-sm">
              {t('realWorldApplications.cosplay.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('realWorldApplications.cosplay.attribution')}</p>
          </div>
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

      <RelatedBlogs currentSlug="character-prompt-generator" locale="en" maxRelated={2} />
    </article>
  )
}
