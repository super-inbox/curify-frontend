'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import NanoBananaExamples from '@/app/[locale]/(public)/blog/[slug]/NanoBananaExamples'

export default function BlogContent() {
  const locale = useLocale()
  const t = useTranslations('blog.aiVideoDubbingTutorial')
  const localePrefix = locale === 'en' ? '' : `/${locale}`

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
            src="/images/055fcb6de6feb319ff89ee8a63957028_thumb_1764265719958.jpg" 
            className="w-full rounded-lg shadow-lg"
            alt="AI Video Dubbing Tutorial"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('tldrTitle')}</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
          <p className="mb-4">{t('tldrIntro')}</p>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>{t('tldrStep1')}</strong></li>
            <li><strong>{t('tldrStep2')}</strong></li>
            <li><strong>{t('tldrStep3')}</strong></li>
            <li><strong>{t('tldrStep4')}</strong></li>
            <li><strong>{t('tldrStep5')}</strong></li>
          </ol>
          <p className="mt-4 font-semibold">
            🚀 <a href="/tools/video-dubbing" className="text-blue-600 hover:underline">{t('tldrCta')}</a>
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatIsTitle')}</h2>
        <p className="mb-4">
          {t('whatIsPara1')}
        </p>
        <p className="mb-4">
          {t('whatIsPara2')}
        </p>
      </section>

      <section className="mb-8 not-prose">
        <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">{t('whyUseTitle')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">⚡ {t('speedTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t('speedContent')}</p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">💰 {t('costTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t('costContent')}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎙️ {t('voiceTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t('voiceContent')}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📈 {t('scalabilityTitle')}</h3>
            <p className="text-gray-700 dark:text-gray-300">{t('scalabilityContent')}</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('tutorialTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step1Title')}</h3>
        <p className="mb-4">
          {t('step1Content')}
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('step1ProTip')}</h4>
          <p>{t('step1ProTipContent')}</p>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step2Title')}</h3>
        <p className="mb-4">
          {t('step2Content')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step3Title')}</h3>
        <p className="mb-4">
          {t('step3Content')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step4Title')}</h3>
        <p className="mb-4">
          {t('step4Content')}
        </p>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('step4Critical')}</h4>
          <p>{t('step4CriticalContent')}</p>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step5Title')}</h3>
        <p className="mb-4">
          {t('step5Para1')}
        </p>
        <p className="mb-4">
          {t('step5Para2')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('step6Title')}</h3>
        <p className="mb-4">
          {t('step6Content')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('bestPracticesTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('audioQualityTitle')}</h3>
        <p className="mb-4">
          {t('audioQualityContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('culturalTitle')}</h3>
        <p className="mb-4">
          {t('culturalContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('voiceStyleTitle')}</h3>
        <p className="mb-4">
          {t('voiceStyleContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('challengesTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('roboticTitle')}</h3>
        <p className="mb-4">
          <strong>{t('roboticSolution')}</strong>
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('lipsyncTitle')}</h3>
        <p className="mb-4">
          <strong>{t('lipsyncSolution')}</strong>
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('speakersTitle')}</h3>
        <p className="mb-4">
          <strong>{t('speakersSolution')}</strong>
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('comparisonTitle')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('platformHeader')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('languagesHeader')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('cloningHeader')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('pricingHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('curifyRow')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('curifyLanguages')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('curifyCloning')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('curifyPricing')}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('elevenlabsRow')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('elevenlabsLanguages')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('elevenlabsCloning')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('elevenlabsPricing')}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('dubverseRow')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('dubverseLanguages')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('dubverseCloning')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('dubversePricing')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8 not-prose">
        <h2 className="text-3xl font-semibold mb-4 text-gray-900 dark:text-white">{t('useCasesTitle')}</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border-l-4 border-blue-500 pl-5 py-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-1">🎬 {t('creatorsTitle')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('creatorsContent')}</p>
          </div>

          <div className="border-l-4 border-purple-500 pl-5 py-2 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-1">🏢 {t('corporateTitle')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('corporateContent')}</p>
          </div>

          <div className="border-l-4 border-green-500 pl-5 py-2 bg-green-50 dark:bg-green-900/20 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-1">📚 {t('elearningTitle')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('elearningContent')}</p>
          </div>

          <div className="border-l-4 border-orange-500 pl-5 py-2 bg-orange-50 dark:bg-orange-900/20 p-4 rounded-r-lg">
            <h3 className="text-lg font-semibold mb-1">📢 {t('marketingTitle')}</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">{t('marketingContent')}</p>
          </div>
        </div>
      </section>

      {/* Live template cards */}
      <section className="mb-10 not-prose">
        <NanoBananaExamples locale={locale} blogSlug="ai-video-dubbing-tutorial" />
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('futureTitle')}</h2>
        <p className="mb-4">
          {t('futurePara1')}
        </p>
        <p className="mb-4">
          {t('futurePara2')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('gettingStartedTitle')}</h2>
        <p className="mb-4">
          {t('gettingStartedPara1')}
        </p>
        <p className="mb-4">
          {t('gettingStartedPara2')}
        </p>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('gettingStartedCtaTitle')}</h4>
          <p>{t('gettingStartedCtaContent')}</p>
          <a href="/tools/video-dubbing" className="inline-block mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            {t('gettingStartedCtaButton')}
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('conclusionTitle')}</h2>
        <p className="mb-4">
          {t('conclusionPara1')}
        </p>
        <p className="mb-4">
          {t('conclusionPara2')}
        </p>
      </section>
      <RelatedBlogs currentSlug="ai-video-dubbing-tutorial" locale={locale} />
    </article>
  )
}
