'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";
export default function BlogContent() {
  const locale = useLocale()
  const t = useTranslations('blog.aiVideoDubbingTutorial')

  return (
    <article className="xl:ml-8 xl:mr-72 max-w-4xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <header className="mb-8">
        <AutoTableOfContents />
        <BlogCategoryLabel slug="ai-video-dubbing-tutorial" />
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
            src="/images/055fcb6de6feb319ff89ee8a63957028_thumb_1764265719958.jpg"
            width={672}
            height={448}
            className="block max-w-full max-h-96 w-auto h-auto rounded-lg shadow-lg"
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

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyUseTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('speedTitle')}</h3>
        <p className="mb-4">
          {t('speedContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('costTitle')}</h3>
        <p className="mb-4">
          {t('costContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('voiceTitle')}</h3>
        <p className="mb-4">
          {t('voiceContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('scalabilityTitle')}</h3>
        <p className="mb-4">
          {t('scalabilityContent')}
        </p>
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

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('useCasesTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('creatorsTitle')}</h3>
        <p className="mb-4">
          {t('creatorsContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('corporateTitle')}</h3>
        <p className="mb-4">
          {t('corporateContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('elearningTitle')}</h3>
        <p className="mb-4">
          {t('elearningContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('marketingTitle')}</h3>
        <p className="mb-4">
          {t('marketingContent')}
        </p>
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

      <BlogCTACard
        category="video-dubbing"
        slug="ai-video-dubbing-tutorial"
        locale={locale}
      />

      </section>

      <RelatedBlogs currentSlug="ai-video-dubbing-tutorial" locale={locale} />
    </article>
  )
}
