'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.f5TtsVsElevenlabs')

  return (
    <>
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
              src="/images/voicedubtran.webp" 
              className="w-full rounded-lg shadow-lg"
              alt={t('altText')}
            />
          </div>
        </header>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('ultimateShowdown')}</h2>
          <p className="mb-4 text-lg">
            {t('ultimateShowdownIntro')}
          </p>
          <p className="mb-4">
            {t('whyVoiceCloningIntro')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('quickComparisonTable')}</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-300 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('feature')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('f5Tts')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('elevenLabs')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('costModel')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsCost')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsCost')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('voiceQuality')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsQuality')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsQuality')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('emotionRendering')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsEmotion')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsEmotion')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('latency')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsLatency')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsLatency')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('setupComplexity')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsSetup')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsSetup')}</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{t('commercialRights')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('f5TtsRights')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{t('elevenLabsRights')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('f5TtsChampion')}</h2>
          
          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('technicalArchitecture')}</h3>
          <p className="mb-4">
            {t('f5TtsDescription')}
          </p>
          
          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('keyStrengths')}</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>{t('zeroCostOperation')}</strong> {t('zeroCostDesc')}</li>
            <li><strong>{t('flowMatchingTech')}</strong> {t('flowMatchingDesc')}</li>
            <li><strong>{t('zeroShotCloning')}</strong> {t('zeroShotDesc')}</li>
            <li><strong>{t('fullControl')}</strong> {t('fullControlDesc')}</li>
            <li><strong>{t('noUsageLimits')}</strong> {t('noUsageDesc')}</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('limitationsDubbing')}</h3>
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg my-6">
            <h4 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">{t('criticalConsiderations')}</h4>
            <ul className="list-disc pl-6">
              <li><strong>{t('higherLatency')}</strong> {t('higherLatencyDesc')}</li>
              <li><strong>{t('technicalSetup')}</strong> {t('technicalSetupDesc')}</li>
              <li><strong>{t('limitedMultilingual')}</strong> {t('limitedMultilingualDesc')}</li>
              <li><strong>{t('artifactingIssues')}</strong> {t('artifactingDesc')}</li>
              <li><strong>{t('noDubbingFeatures')}</strong> {t('noDubbingDesc')}</li>
            </ul>
          </div>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('bestUseCases')}</h3>
          <p className="mb-4">
            {t('f5TtsUseCases')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('elevenLabsPowerhouse')}</h2>
          
          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('technicalExcellence')}</h3>
          <p className="mb-4">
            {t('elevenLabsDescription')}
          </p>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('keyStrengths')}</h3>
          <ul className="list-disc pl-6 mb-4">
            <li><strong>{t('superiorQuality')}</strong> {t('superiorQualityDesc')}</li>
            <li><strong>{t('advancedEmotion')}</strong> {t('advancedEmotionDesc')}</li>
            <li><strong>{t('subSecondLatency')}</strong> {t('subSecondDesc')}</li>
            <li><strong>{t('comprehensiveLanguage')}</strong> {t('comprehensiveLanguageDesc')}</li>
            <li><strong>{t('integratedDubbing')}</strong> {t('integratedDubbingDesc')}</li>
            <li><strong>{t('professionalCloning')}</strong> {t('professionalCloningDesc')}</li>
          </ul>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('pricingBreakdown')}</h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
            <h4 className="text-xl font-semibold mb-3">{t('costAnalysis')}</h4>
            <ul className="space-y-2">
              <li><strong>{t('starterPlan')}</strong> {t('starterDesc')}</li>
              <li><strong>{t('creatorPlan')}</strong> {t('creatorDesc')}</li>
              <li><strong>{t('proPlan')}</strong> {t('proDesc')}</li>
              <li><strong>{t('scalePlan')}</strong> {t('scaleDesc')}</li>
            </ul>
            <p className="mt-3 text-sm">{t('creditNote')}</p>
          </div>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('bestUseCases')}</h3>
          <p className="mb-4">
            {t('elevenLabsUseCases')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('headToHead')}</h2>
          
          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('emotionQuality')}</h3>
          <p className="mb-4">
            <strong>{t('elevenLabsWins')}</strong> {t('emotionControlDesc')}
          </p>
          <p className="mb-4">
            {t('f5TtsEmotionDesc')}
          </p>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('latencyPerformance')}</h3>
          <p className="mb-4">
            <strong>{t('elevenLabsFlash')}</strong> {t('flashDesc')}
          </p>
          <p className="mb-4">
            {t('f5TtsLatencyDesc')}
          </p>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('audioArtifacting')}</h3>
          <p className="mb-4">
            {t('elevenLabsArtifacting')}
          </p>
          <p className="mb-4">
            {t('f5TtsArtifacting')}
          </p>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('multilingualCapabilities')}</h3>
          <p className="mb-4">
            <strong>{t('elevenLabsDominates')}</strong> {t('multilingualDesc')}
          </p>
          <p className="mb-4">
            {t('f5TtsMultilingualDesc')}
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('bottomLine')}</h2>
          
          <div className="grid md:grid-cols-2 gap-6 my-8">
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">{t('chooseF5Tts')}</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('f5TtsReason1')}</li>
                <li>{t('f5TtsReason2')}</li>
                <li>{t('f5TtsReason3')}</li>
                <li>{t('f5TtsReason4')}</li>
                <li>{t('f5TtsReason5')}</li>
                <li>{t('f5TtsReason6')}</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">{t('chooseElevenLabs')}</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>{t('elevenLabsReason1')}</li>
                <li>{t('elevenLabsReason2')}</li>
                <li>{t('elevenLabsReason3')}</li>
                <li>{t('elevenLabsReason4')}</li>
                <li>{t('elevenLabsReason5')}</li>
                <li>{t('elevenLabsReason6')}</li>
              </ul>
            </div>
          </div>

          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('hybridApproach')}</h3>
          <p className="mb-4">
            {t('hybridApproachDesc')}
          </p>
        </section>

        <section className="mb-8">
          <p className="mb-4">
            {t('decisionFactors')}
          </p>
        </section>

        <section className="mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
          <h3 className="text-2xl font-semibold mb-3 mt-6">{t('f5TtsSetupTitle')}</h3>
              <ul className="list-disc pl-6">
                <li><a href={t('f5TtsGithub')} className="text-blue-600 hover:underline">{t('f5TtsGithub')}</a></li>
                <li>{t('f5TtsRequirements')}</li>
                <li>{t('f5TtsInstallation')}</li>
                <li>{t('f5TtsInterface')}</li>
              </ul>
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-3">{t('elevenLabsSetupTitle')}</h3>
              <ul className="list-disc pl-6">
                <li><a href={t('elevenLabsWebsite')} className="text-blue-600 hover:underline">{t('elevenLabsWebsite')}</a></li>
                <li>{t('elevenLabsFreeTier')}</li>
                <li>{t('elevenLabsWebApi')}</li>
                <li>{t('elevenLabsProfessionalPlan')}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-3xl font-semibold mb-4">{t('finalRecommendation')}</h2>
          <p className="mb-4 text-lg">
            {t('f5TtsFinalNote')}
          </p>
          <p className="mb-4">
            {t('decisionFactors')}
          </p>
        </section>

        <footer className="mt-12">
          <p className="text-gray-600 text-center">
            {t('comparisonNote')}
          </p>
        </footer>
      </article>
      
      <RelatedBlogs currentSlug="f5-tts-vs-elevenlabs" locale="en" maxRelated={2} />
    </>
  )
}
