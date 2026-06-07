'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";
export default function BlogContent() {
  const t = useTranslations('blog.preserveFacialFeaturesAiGeneration')

  const locale = useLocale()
  return (
    <article className="xl:ml-16 xl:mr-64 max-w-5xl mx-auto px-4 py-8 prose prose-lg dark:prose-invert">
      <header className="mb-8">
        <AutoTableOfContents />
        <BlogCategoryLabel slug="preserve-facial-features-ai-generation" />
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
        <div className="mt-6 mb-4 mx-auto max-w-lg md:max-w-xl md:float-right md:ml-6 md:mx-0 flex items-center justify-center">
          <CdnImage
            src="/image_text_layout/4214_3_city-story-haunting-gaze.png"
            width={672}
            height={448}
            className="block max-w-full max-h-96 w-auto h-auto rounded-lg shadow-lg"
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
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {t('coreTemplateDesc')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('uniqueIdentifiers')}</h3>
        <p className="mb-4">
          {t('uniqueIdentifiersDesc')}
        </p>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {t('uniqueTemplateDesc')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('expressionConsistencyRulesTitle')}</h3>
        <p className="mb-4">
          {t('expressionConsistencyRulesDesc')}
        </p>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          {t('expressionTemplateDesc')}
        </p>
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
            <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm whitespace-pre-wrap break-words">
{t.raw('wrongApproachExample')}
            </pre>
            <p className="text-sm text-red-600 mt-2">{t('wrongApproachNote')}</p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-2">{t('nanoBananaMethod')}</h4>
            <pre className="bg-green-50 dark:bg-green-900/20 p-4 rounded text-sm whitespace-pre-wrap break-words">
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
        <h2 className="text-3xl font-semibold mb-4">{t('missingMechanicsTitle')}</h2>
        <p className="mb-6 text-lg">
          {t('missingMechanicsIntro')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('seedAnchoringTitle')}</h3>
        <p className="mb-4">
          {t('seedAnchoringDesc')}
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto my-4">
          <pre className="whitespace-pre-wrap">
{`# Gemini API — pin a seed across every face generation
client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[face_prompt],
    config={"seed": 42, "image_config": {"aspect_ratio": "3:4"}},
)`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('seedAnchoringNote')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('tokenWeightingTitle')}</h3>
        <p className="mb-4">
          {t('tokenWeightingDesc')}
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto my-4">
          <pre className="whitespace-pre-wrap">
{`Sarah, sharp square jawline, (deep-set hazel eyes:1.3), aquiline nose, (mole on left cheekbone:1.2), collarbone-length dark brown hair, three-quarter angle, soft window light.`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t('tokenWeightingNote')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('surgicalNegativesTitle')}</h3>
        <p className="mb-4">
          {t('surgicalNegativesDesc')}
        </p>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto my-4">
          <pre className="whitespace-pre-wrap">
{`Negative: no rounded jawline, no light-blue eyes, no symmetric face (right cheekbone mole must remain), no glasses, no aged-up skin.`}
          </pre>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('surgicalNegativesNote')}
        </p>
      </section>

      <section className="mb-8 not-prose">
        <h2 className="text-3xl font-semibold mb-4">{t('galleryDemosTitle')}</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {t('galleryDemosIntro')} The <Link href="/nano-template/lifestyle-photo-grid" className="text-blue-600 hover:underline font-medium">lifestyle-photo-grid</Link> template renders a 9-image grid — the same face across nine scenes — so it&apos;s the cleanest live demo of every technique in this post.
        </p>
        <div className="grid md:grid-cols-3 gap-6 my-8">
          <Link
            href="/nano-template/lifestyle-photo-grid/example/template-lifestyle-photo-grid-met-gala-red-carpet"
            className="block group"
          >
            <CdnImage
              src="/images/nano_insp/template-lifestyle-photo-grid-met-gala-red-carpet.jpg"
              alt="Same face across 9 Met Gala red-carpet scenes"
              width={480}
              height={320}
              className="w-full h-auto rounded-lg shadow group-hover:shadow-xl transition"
            />
            <div className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">Met Gala red-carpet grid</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Same subject, 9 poses, identity locked.</div>
          </Link>
          <Link
            href="/nano-template/lifestyle-photo-grid/example/template-lifestyle-photo-grid-paris-fashion-week"
            className="block group"
          >
            <CdnImage
              src="/images/nano_insp/template-lifestyle-photo-grid-paris-fashion-week.jpg"
              alt="Same face across 9 Paris Fashion Week scenes"
              width={480}
              height={320}
              className="w-full h-auto rounded-lg shadow group-hover:shadow-xl transition"
            />
            <div className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">Paris Fashion Week grid</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Wardrobe + setting vary; face holds.</div>
          </Link>
          <Link
            href="/nano-template/lifestyle-photo-grid/example/template-lifestyle-photo-grid-wedding-day-ceremony"
            className="block group"
          >
            <CdnImage
              src="/images/nano_insp/template-lifestyle-photo-grid-wedding-day-ceremony.jpg"
              alt="Same face across 9 wedding-day scenes"
              width={480}
              height={320}
              className="w-full h-auto rounded-lg shadow group-hover:shadow-xl transition"
            />
            <div className="mt-3 text-sm font-medium text-gray-800 dark:text-gray-200">Wedding-day grid</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Veil, lighting, angle — features intact.</div>
          </Link>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Open any grid and you can copy the exact template prompt, swap the subject, and ship a 9-image identity-locked set in under five minutes. The four techniques below are what the template bakes in.
        </p>

      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('advancedConsistencyTechniques')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('styleTransferMethod')}</h3>
        <p className="mb-4">
          {t('styleTransferMethodDesc')}
        </p>
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('styleTransferFormula')}</h4>
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
{`28-year-old woman, sharp square jawline, deep-set hazel eyes, aquiline nose, mole on left cheekbone, collarbone-length dark brown hair parted down the middle, rendered in cel-shaded anime, line art emphasizes the same jaw and nose geometry, hazel eyes kept as one of the two anchor colors, vibrant flat-shaded palette, three-quarter angle.`}
          </pre>
          <p className="text-sm mt-2">{t('styleTransferExample')}</p>
        </div>

      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('readyToBuild')}</h2>
        <p className="mb-4 text-lg">
          {t('readyToBuildDesc')}
        </p>
        <p className="mb-4">
          The fastest path from this article to a working identity-locked set: open <Link href="/nano-template/lifestyle-photo-grid" className="text-blue-600 hover:underline font-medium">lifestyle-photo-grid</Link>, pick the scene closest to yours, copy the template prompt, and substitute your subject blueprint for the one already in there. For style transfer across illustrated formats, the <Link href="/nano-template/fashion-inspired-gown-design-sheet" className="text-blue-600 hover:underline font-medium">fashion-inspired-gown-design-sheet</Link> template ships the angle + lighting scaffold pre-baked; you swap the subject and aesthetic tag.
        </p>
        <p className="mb-4">
          For browsing more identity-locked references first, the <Link href="/nano-banana-pro-prompts/tag/portrait" className="text-blue-600 hover:underline font-medium">portrait</Link> and <Link href="/nano-banana-pro-prompts/tag/photorealistic" className="text-blue-600 hover:underline font-medium">photorealistic</Link> tag pages collect prompts that hold a face well across variations.
        </p>
      </section>

      <footer className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-gray-600 text-center">
          {t('footer')}
        </p>

      <BlogCTACard
        category="creator-tools"
        slug="preserve-facial-features-ai-generation"
        locale={locale}
      />

      </footer>

      <RelatedBlogs currentSlug="preserve-facial-features-ai-generation" locale="en" maxRelated={2} />
    </article>
  )
}
