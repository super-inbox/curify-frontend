'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.contentTaggingSystem')

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
            src="/images/content-tagging-system-preview.jpg" 
            className="w-full rounded-lg shadow-lg"
            alt="Content Tagging System Preview"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('intro.title')}</h2>
        <p className="mb-4">
          {t('intro.description1')}
        </p>
        <p className="mb-6">
          {t('intro.description2')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">ð {t('intro.productProblem.title')}</h3>
          <p>{t('intro.productProblem.description')}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyTagsMatter.title')}</h2>
        <p className="mb-6">
          {t('whyTagsMatter.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">ð {t('whyTagsMatter.searchability.title')}</h3>
            <p>{t('whyTagsMatter.searchability.description')}</p>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">ð {t('whyTagsMatter.discoverability.title')}</h3>
            <p>{t('whyTagsMatter.discoverability.description')}</p>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">ð {t('whyTagsMatter.contentReuse.title')}</h3>
            <p>{t('whyTagsMatter.contentReuse.description')}</p>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold">
            {t('whyTagsMatter.landingPageValue')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('coreChallenges.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-red-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">1. {t('coreChallenges.nonDescriptive.title')}</h3>
            <p className="mb-3">
              {t('coreChallenges.nonDescriptive.description')}
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded">
              <p className="font-mono text-sm">
                "{t('coreChallenges.nonDescriptive.examples.tag1')}"<br/>
                "{t('coreChallenges.nonDescriptive.examples.tag2')}"<br/>
                "{t('coreChallenges.nonDescriptive.examples.tag3')}"
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {t('coreChallenges.nonDescriptive.conclusion')}
              </p>
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">2. {t('coreChallenges.overlySpecific.title')}</h3>
            <p className="mb-3">
              {t('coreChallenges.overlySpecific.description')}
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded">
              <p className="font-mono text-sm">
                "{t('coreChallenges.overlySpecific.example')}"
              </p>
              <div className="mt-3 space-y-1">
                <p>â {t('coreChallenges.overlySpecific.issues.issue1')}</p>
                <p>â {t('coreChallenges.overlySpecific.issues.issue2')}</p>
                <p>â {t('coreChallenges.overlySpecific.issues.issue3')}</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">3. {t('coreChallenges.promptVsLanguage.title')}</h3>
            <p className="mb-3">
              {t('coreChallenges.promptVsLanguage.description')}
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">{t('coreChallenges.promptVsLanguage.promptTitle')}</h4>
                  <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    "{t('coreChallenges.promptVsLanguage.promptExample')}"
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">{t('coreChallenges.promptVsLanguage.searchTitle')}</h4>
                  <p className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    "{t('coreChallenges.promptVsLanguage.searchExample')}"
                  </p>
                </div>
              </div>
              <p className="mt-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                {t('coreChallenges.promptVsLanguage.conclusion')}
              </p>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">4. {t('coreChallenges.traditionalMethods.title')}</h3>
            <p className="mb-3">
              {t('coreChallenges.traditionalMethods.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                <h4 className="font-semibold mb-2">{t('coreChallenges.traditionalMethods.tfIdf.title')}</h4>
                <p className="text-sm mb-2">{t('coreChallenges.traditionalMethods.tfIdf.good')}</p>
                <p className="text-sm text-red-600 dark:text-red-400">{t('coreChallenges.traditionalMethods.tfIdf.bad')}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
                <h4 className="font-semibold mb-2">{t('coreChallenges.traditionalMethods.imageClustering.title')}</h4>
                <p className="text-sm mb-2">{t('coreChallenges.traditionalMethods.imageClustering.good')}</p>
                <p className="text-sm text-red-600 dark:text-red-400">{t('coreChallenges.traditionalMethods.imageClustering.bad')}</p>
              </div>
            </div>
            <div className="mt-4 bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="text-center font-semibold">
                {t('coreChallenges.traditionalMethods.summary')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('threeLayerApproach.title')}</h2>
        <p className="mb-6">
          {t('threeLayerApproach.description')}
        </p>

        <div className="space-y-8">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('threeLayerApproach.layer1.title')}</h3>
            <p className="mb-4">
              {t('threeLayerApproach.layer1.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>â {t('threeLayerApproach.layer1.metadata.prompt')}</strong> - {t('threeLayerApproach.layer1.metadata.promptDesc')}</p>
                <p><strong>â {t('threeLayerApproach.layer1.metadata.caption')}</strong> - {t('threeLayerApproach.layer1.metadata.captionDesc')}</p>
                <p><strong>â {t('threeLayerApproach.layer1.metadata.objects')}</strong> - {t('threeLayerApproach.layer1.metadata.objectsDesc')}</p>
              </div>
              <div className="space-y-2">
                <p><strong>â {t('threeLayerApproach.layer1.metadata.style')}</strong> - {t('threeLayerApproach.layer1.metadata.styleDesc')}</p>
                <p><strong>â {t('threeLayerApproach.layer1.metadata.embeddings')}</strong> - {t('threeLayerApproach.layer1.metadata.embeddingsDesc')}</p>
              </div>
            </div>
            <p className="mt-4 text-center font-semibold text-green-600 dark:text-green-400">
              {t('threeLayerApproach.layer1.conclusion')}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('threeLayerApproach.layer2.title')}</h3>
            <p className="mb-4">
              {t('threeLayerApproach.layer2.description')}
            </p>
            <div className="space-y-3">
              <p><strong>â {t('threeLayerApproach.layer2.candidates.nounPhrases')}</strong> - {t('threeLayerApproach.layer2.candidates.nounPhrasesDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer2.candidates.styleTerms')}</strong> - {t('threeLayerApproach.layer2.candidates.styleTermsDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer2.candidates.themes')}</strong> - {t('threeLayerApproach.layer2.candidates.themesDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer2.candidates.clusterLabels')}</strong> - {t('threeLayerApproach.layer2.candidates.clusterLabelsDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer2.candidates.llmNormalized')}</strong> - {t('threeLayerApproach.layer2.candidates.llmNormalizedDesc')}</p>
            </div>
            <p className="mt-4 text-center font-semibold text-blue-600 dark:text-blue-400">
              {t('threeLayerApproach.layer2.conclusion')}
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-orange-50 dark:from-purple-900/20 dark:to-orange-900/20 p-6 rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{t('threeLayerApproach.layer3.title')}</h3>
            <p className="mb-4">
              {t('threeLayerApproach.layer3.description')}
            </p>
            <div className="space-y-3">
              <p><strong>â {t('threeLayerApproach.layer3.criteria.coverage')}</strong> - {t('threeLayerApproach.layer3.criteria.coverageDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer3.criteria.clarity')}</strong> - {t('threeLayerApproach.layer3.criteria.clarityDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer3.criteria.distinctiveness')}</strong> - {t('threeLayerApproach.layer3.criteria.distinctivenessDesc')}</p>
              <p><strong>â {t('threeLayerApproach.layer3.criteria.searchIntent')}</strong> - {t('threeLayerApproach.layer3.criteria.searchIntentDesc')}</p>
            </div>
            
            <div className="mt-6 bg-white dark:bg-gray-800 p-4 rounded border">
              <h4 className="font-semibold mb-3">{t('threeLayerApproach.layer3.organization.title')}</h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p><strong>â {t('threeLayerApproach.layer3.organization.subject')}</strong> - {t('threeLayerApproach.layer3.organization.subjectDesc')}</p>
                  <p><strong>â {t('threeLayerApproach.layer3.organization.style')}</strong> - {t('threeLayerApproach.layer3.organization.styleDesc')}</p>
                  <p><strong>â {t('threeLayerApproach.layer3.organization.theme')}</strong> - {t('threeLayerApproach.layer3.organization.themeDesc')}</p>
                </div>
                <div className="space-y-2">
                  <p><strong>â {t('threeLayerApproach.layer3.organization.useCase')}</strong> - {t('threeLayerApproach.layer3.organization.useCaseDesc')}</p>
                  <p><strong>â {t('threeLayerApproach.layer3.organization.mood')}</strong> - {t('threeLayerApproach.layer3.organization.moodDesc')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('keyInsight.title')}</h2>
        <p className="mb-6">
          {t('keyInsight.description')}
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-3">{t('keyInsight.methods.nlp.title')}</h3>
            <p className="text-sm">{t('keyInsight.methods.nlp.description')}</p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-3">{t('keyInsight.methods.vision.title')}</h3>
            <p className="text-sm">{t('keyInsight.methods.vision.description')}</p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-3">{t('keyInsight.methods.clustering.title')}</h3>
            <p className="text-sm">{t('keyInsight.methods.clustering.description')}</p>
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold text-lg">
            {t('keyInsight.solution')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('pinterestPlatform.title')}</h2>
        <p className="mb-6">
          {t('pinterestPlatform.description')}
        </p>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">ð {t('pinterestPlatform.galleryTags.title')}</h3>
            <p className="mb-4">
              {t('pinterestPlatform.galleryTags.description')}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.subject')}</strong> - {t('pinterestPlatform.galleryTags.examples.subjectDesc')}</p>
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.style')}</strong> - {t('pinterestPlatform.galleryTags.examples.styleDesc')}</p>
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.medium')}</strong> - {t('pinterestPlatform.galleryTags.examples.mediumDesc')}</p>
              </div>
              <div className="space-y-2">
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.mood')}</strong> - {t('pinterestPlatform.galleryTags.examples.moodDesc')}</p>
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.composition')}</strong> - {t('pinterestPlatform.galleryTags.examples.compositionDesc')}</p>
                <p><strong>â {t('pinterestPlatform.galleryTags.examples.color')}</strong> - {t('pinterestPlatform.galleryTags.examples.colorDesc')}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">ð {t('pinterestPlatform.templateTags.title')}</h3>
            <p className="mb-4">
              {t('pinterestPlatform.templateTags.description')}
            </p>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">ð {t('pinterestPlatform.templateTags.geoTags.title')}</h4>
                <p className="text-sm mb-2">{t('pinterestPlatform.templateTags.geoTags.description')}</p>
                <div className="flex flex-wrap gap-2">
                  {t.raw('pinterestPlatform.templateTags.geoTags.examples').map((tag: string, index: number) => (
                    <span key={index} className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-xs">{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded border">
                <h4 className="font-semibold mb-2">ð {t('pinterestPlatform.templateTags.languageTags.title')}</h4>
                <p className="text-sm mb-2">{t('pinterestPlatform.templateTags.languageTags.description')}</p>
                <div className="flex flex-wrap gap-2">
                  {t.raw('pinterestPlatform.templateTags.languageTags.examples').map((tag: string, index: number) => (
                    <span key={index} className="bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('ruleOfThumb.title')}</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('ruleOfThumb.question')}</h3>
          <p className="mb-4">
            {t('ruleOfThumb.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded border text-center">
            <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
              {t('ruleOfThumb.action')}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('finalThought.title')}</h2>
        <p className="mb-6">
          {t('finalThought.description')}
        </p>
        
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg">
          <div className="space-y-3">
            <p>â {t('finalThought.systems.match')}</p>
            <p>â {t('finalThought.systems.group')}</p>
            <p>â {t('finalThought.systems.scale')}</p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">
            {t('finalThought.conclusion')}
          </p>
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

      <RelatedBlogs currentSlug="content-tagging-system" locale="en" maxRelated={2} />
    </article>
  )
}
