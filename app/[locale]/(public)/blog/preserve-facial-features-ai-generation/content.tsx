'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.preserveFacialFeaturesAiGeneration')

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
            src="/images/face3.webp" 
            className="w-full rounded-lg shadow-lg"
            alt={t('altText')}
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('biggestChallenge')}</h2>
        <p className="mb-4 text-lg">
          {t('biggestChallengeIntro')}
        </p>
        <p className="mb-4 text-lg">
          {t('biggestChallengeOutro')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyConsistencyFails')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('rootProblem')}</h3>
        <p className="mb-4">
          {t('rootProblemDesc')}
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">⚠️ {t('consistencyKillers')}</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>{t('vagueDescriptions')}:</strong> {t('vagueExample')}</li>
            <li><strong>{t('missingAnchors')}:</strong> {t('missingAnchorsDesc')}</li>
            <li><strong>{t('inconsistentStyling')}:</strong> {t('inconsistentStylingDesc')}</li>
            <li><strong>{t('modelDrift')}:</strong> {t('modelDriftDesc')}</li>
          </ul>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('nanoBananaSolution')}</h3>
        <p className="mb-4">
          {t('nanoBananaSolutionDesc')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('facialFeatureLockFramework')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('coreArchitecture')}</h3>
        <p className="mb-4">
          {t('coreArchitectureDesc')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">🔧 {t('coreTemplate')}</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{t.raw('coreTemplate')}
          </pre>
          <p className="text-sm mt-2">{t('coreTemplateDesc')}</p>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('uniqueIdentifiers')}</h3>
        <p className="mb-4">
          {t('uniqueIdentifiersDesc')}
        </p>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">✨ {t('uniqueTemplate')}</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{t.raw('uniqueTemplate')}
          </pre>
          <p className="text-sm mt-2">{t('uniqueTemplateDesc')}</p>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('expressionConsistencyRulesTitle')}</h3>
        <p className="mb-4">
          {t('expressionConsistencyRulesDesc')}
        </p>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">😊 {t('expressionTemplate')}</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{t.raw('expressionTemplate')}
          </pre>
          <p className="text-sm mt-2">{t('expressionTemplateDesc')}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('nanoBananaPromptingTechniques')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('layerMethod')}</h3>
        <p className="mb-4">
          {t('layerMethodDesc')}
        </p>

        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div>
            <h4 className="text-lg font-semibold mb-2">{t('wrongApproach')}</h4>
            <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm">
{t.raw('wrongApproachExample')}
            </pre>
            <p className="text-sm text-red-600 mt-2">{t('wrongApproachNote')}</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-2">{t('nanoBananaMethod')}</h4>
            <pre className="bg-green-50 dark:bg-green-900/20 p-4 rounded text-sm">
{t.raw('nanoBananaMethodExample')}
            </pre>
            <p className="text-sm text-green-600 mt-2">{t('nanoBananaMethodNote')}</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('referenceImageChain')}</h3>
        <p className="mb-4">
          {t('referenceImageChainDesc')}
        </p>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">🔗 {t('referenceChainProcess')}</h4>
          <ol className="list-decimal pl-6 space-y-2">
            <li><strong>{t('referenceChainStep1')}</strong></li>
            <li><strong>{t('referenceChainStep2')}</strong></li>
            <li><strong>{t('referenceChainStep3')}</strong></li>
            <li><strong>{t('referenceChainStep4')}</strong></li>
          </ol>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('angleAdaptationFormula')}</h3>
        <p className="mb-4">
          {t('angleAdaptationDesc')}
        </p>

        <div className="overflow-x-auto my-6">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium">{t.raw('angleTable.angle')}</th>
                <th className="px-4 py-2 text-left text-sm font-medium">{t.raw('angleTable.adjustments')}</th>
                <th className="px-4 py-2 text-left text-sm font-medium">{t.raw('angleTable.priority')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-2 text-sm">{t.raw('frontView')}</td>
                <td className="px-4 py-2 text-sm">{t.raw('frontViewAdjustments')}</td>
                <td className="px-4 py-2 text-sm">{t.raw('frontViewPriority')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">{t.raw('profileView')}</td>
                <td className="px-4 py-2 text-sm">{t.raw('profileViewAdjustments')}</td>
                <td className="px-4 py-2 text-sm">{t.raw('profileViewPriority')}</td>
              </tr>
              <tr>
                <td className="px-4 py-2 text-sm">{t('threeQuarterView')}</td>
                <td className="px-4 py-2 text-sm">{t('threeQuarterViewAdjustments')}</td>
                <td className="px-4 py-2 text-sm">{t('threeQuarterViewPriority')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('visualExamples')}</h2>
        
        <div className="grid md:grid-cols-3 gap-4 my-8">
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-gray-500">{t('characterBasePortrait')}</span>
            </div>
            <p className="text-sm font-medium">{t('referenceImage')}</p>
            <p className="text-xs text-gray-600">{t('referenceImageDesc')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-gray-500">{t('characterInCoffeeShop')}</span>
            </div>
            <p className="text-sm font-medium">{t('environmentScene')}</p>
            <p className="text-xs text-gray-600">{t('environmentSceneDesc')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg mb-2 flex items-center justify-center">
              <span className="text-gray-500">{t('characterActionScene')}</span>
            </div>
            <p className="text-sm font-medium">{t('dynamicPose')}</p>
            <p className="text-xs text-gray-600">{t('dynamicPoseDesc')}</p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('whatMakesTheseWork')}</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>{t('consistentEyeShape')}</strong> {t('consistentEyeShapeDesc')}</li>
          <li><strong>{t('noseRecognition')}</strong> {t('noseRecognitionDesc')}</li>
          <li><strong>{t('jawlineContinuity')}</strong> {t('jawlineContinuityDesc')}</li>
          <li><strong>{t('expressionRules')}</strong> {t('expressionRulesDesc')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('advancedConsistencyTechniques')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('styleTransferMethod')}</h3>
        <p className="mb-4">
          {t('styleTransferMethodDesc')}
        </p>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('styleTransferFormula')}</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto">
{`"[CHARACTER_FACE_BLUEPRINT],
rendered in [art_style],
maintaining [key_feature_1], [key_feature_2],
with [style_specific_elements]"`}
          </pre>
          <p className="text-sm mt-2">{t('styleTransferExample')}</p>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('ageProgressionSystem')}</h3>
        <p className="mb-4">
          {t('ageProgressionSystemDesc')}
        </p>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('ageProgressionRules')}</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>{t('ageChildToTeen')}</strong></li>
            <li><strong>{t('ageTeenToAdult')}</strong></li>
            <li><strong>{t('ageAdultToElder')}</strong></li>
          </ul>
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('emotionalRangeLibrary')}</h3>
        <p className="mb-4">
          {t('emotionalRangeLibraryDesc')}
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 my-6">
          <div>
            <h4 className="text-lg font-semibold mb-2">{t('basicExpressions')}</h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>{t('neutral')}</li>
              <li>{t('happy')}</li>
              <li>{t('sad')}</li>
              <li>{t('angry')}</li>
              <li>{t('surprised')}</li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-2">{t('complexExpressions')}</h4>
            <ul className="list-disc pl-6 text-sm space-y-1">
              <li>{t('confident')}</li>
              <li>{t('thoughtful')}</li>
              <li>{t('amused')}</li>
              <li>{t('determined')}</li>
              <li>{t('worried')}</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('commonPitfallsSolutions')}</h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200">{t('featureDrift')}</h4>
            <p className="text-sm mb-2">{t('featureDriftDesc')}</p>
            <p className="text-sm"><strong>{t('featureDriftSolution')}</strong></p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200">{t('styleOverwriting')}</h4>
            <p className="text-sm mb-2">{t('styleOverwritingDesc')}</p>
            <p className="text-sm"><strong>{t('styleOverwritingSolution')}</strong></p>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <h4 className="font-semibold text-red-800 dark:text-red-200">{t('lightingConfusion')}</h4>
            <p className="text-sm mb-2">{t('lightingConfusionDesc')}</p>
            <p className="text-sm"><strong>{t('lightingConfusionSolution')}</strong></p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('characterConsistencyChecklist')}</h2>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('preGenerationChecklistTitle')}</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2">{t('facialBlueprint')}</h5>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>{t('faceShapeDefined')}</li>
                <li>{t('eyeShapeColorSpecified')}</li>
                <li>{t('noseShapeDetailed')}</li>
                <li>{t('mouthLipCharacteristics')}</li>
                <li>{t('uniqueMarksScarsIdentified')}</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-2">{t('expressionRules2')}</h5>
              <ul className="list-disc pl-6 text-sm space-y-1">
                <li>{t('smilePatternDefined')}</li>
                <li>{t('eyeMovementCharacteristics')}</li>
                <li>{t('browBehaviorSpecified')}</li>
                <li>{t('jawTensionPatterns')}</li>
                <li>{t('asymmetricalDetailsNoted')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('postGenerationValidationTitle')}</h4>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>{t('eyeDistanceCheck')}</strong></li>
            <li><strong>{t('noseBridgeTest')}</strong></li>
            <li><strong>{t('jawlineComparison')}</strong> {t('jawlineComparisonDesc')}</li>
            <li><strong>{t('uniqueFeatureVerification')}</strong> {t('uniqueFeatureVerificationDesc')}</li>
            <li><strong>{t('expressionConsistencyValidation')}</strong> {t('expressionConsistencyValidationDesc')}</li>
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('readyToBuild')}</h2>
        <p className="mb-4 text-lg">
          {t('readyToBuildDesc')}
        </p>
        
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8 rounded-lg text-center my-8">
          <h3 className="text-2xl font-bold mb-4">{t('useTemplateTitle')}</h3>
          <p className="text-lg mb-6">
            {t('useTemplateDesc')}
          </p>
          <div className="space-y-4">
            <div className="bg-white/20 backdrop-blur p-4 rounded">
              <h4 className="font-semibold mb-2">{t('whatYouGet')}</h4>
              <ul className="text-left max-w-md mx-auto">
                <li>{t('completeBlueprints')}</li>
                <li>{t('expressionLibraries')}</li>
                <li>{t('adaptationFormulas')}</li>
                <li>{t('transferMethods')}</li>
                <li>{t('validationChecklists')}</li>
              </ul>
            </div>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              {t('useTemplateButton')}
            </button>
          </div>
        </div>

        <p className="mb-4">
          {t('stopStruggling')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('nextStepsCharacterJourney')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6 my-8">
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">{t('characterExpressionMastery')}</h3>
            <p className="mb-3">{t('characterExpressionMasteryDesc')}</p>
            <a href="#" className="text-blue-600 hover:underline">{t('readExpressionGuide')}</a>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-3">{t('styleTransferSecrets')}</h3>
            <p className="mb-3">{t('styleTransferSecretsDesc')}</p>
            <a href="#" className="text-blue-600 hover:underline">{t('exploreStyleTransfer')}</a>
          </div>
        </div>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-600 text-center">
          {t('footer')}
        </p>
      </footer>
    </article>
  )
}
