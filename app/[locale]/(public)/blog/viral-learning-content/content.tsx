'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
export default function BlogContent() {
  const t = useTranslations('blog.viralLearningContent')

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
            src="images/learnContent.webp" 
            className="w-full rounded-lg shadow-lg"
            alt="Viral Learning Content"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('target.title')}</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="mb-4 text-lg font-medium">{t('target.description')}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🎓</div>
              <h3 className="font-semibold">{t('target.eslCreators.title')}</h3>
              <p className="text-sm text-gray-600">{t('target.eslCreators.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold">{t('target.educationalCreators.title')}</h3>
              <p className="text-sm text-gray-600">{t('target.educationalCreators.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">👨‍🏫</div>
              <h3 className="font-semibold">{t('target.teachers.title')}</h3>
              <p className="text-sm text-gray-600">{t('target.teachers.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyMatters.title')}</h2>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">
                {t('whyMatters.alignment.title')}
              </h3>
              <p className="mb-4">{t('whyMatters.alignment.description')}</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">
                {t('whyMatters.searchIntent.title')}
              </h3>
              <div className="space-y-2">
                {t.raw('whyMatters.searchIntent.keywords').map((keyword: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-green-600">🔍</span>
                    <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded text-sm">
                      {keyword}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('coreAngle.title')}</h2>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-purple-800 dark:text-purple-200">
            {t('coreAngle.headline')}
          </h3>
          <p className="mb-6 text-lg">
            {t('coreAngle.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
            <p className="font-medium text-purple-700 dark:text-purple-300">
              {t('coreAngle.insight')}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('structure.title')}</h2>
        
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">
              {t('structure.problem.title')}
            </h3>
            <p className="text-lg mb-4">{t('structure.problem.description')}</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500">
              <p className="italic">"{t('structure.problem.quote')}"</p>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-green-800 dark:text-green-200">
              {t('structure.solution.title')}
            </h3>
            <p className="mb-4 text-lg">{t('structure.solution.description')}</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>🎴</span> {t('structure.solution.visualCards.title')}
                </h4>
                <p className="text-sm">{t('structure.solution.visualCards.description')}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <span>📋</span> {t('structure.solution.structuredTemplates.title')}
                </h4>
                <p className="text-sm">{t('structure.solution.structuredTemplates.description')}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-blue-800 dark:text-blue-200">
              {t('structure.examples.title')}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">📚 {t('structure.examples.vocabularyCards.title')}</h4>
                <p className="text-sm mb-3">{t('structure.examples.vocabularyCards.description')}</p>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-blue-100 dark:bg-blue-800 p-2 rounded text-center text-xs">
                      {t('structure.examples.vocabularyCards.card')} {i}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">💬 {t('structure.examples.dialogueScenes.title')}</h4>
                <p className="text-sm mb-3">{t('structure.examples.dialogueScenes.description')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="bg-blue-100 dark:bg-blue-800 p-2 rounded text-center text-xs">
                      {t('structure.examples.dialogueScenes.scene')} {i}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3 text-yellow-800 dark:text-yellow-200">
              {t('structure.scaling.title')}
            </h3>
            <p className="mb-4 text-lg">{t('structure.scaling.description')}</p>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <strong>{t('structure.scaling.batchGeneration.title')}</strong>
                  <p className="text-sm">{t('structure.scaling.batchGeneration.description')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatNotToDo.title')}</h2>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <p className="mb-6 text-lg font-medium text-red-700 dark:text-red-300">
            {t('whatNotToDo.warning')}
          </p>
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>❌</span> {t('whatNotToDo.genericPosts.title')}
              </h4>
              <p className="text-sm">{t('whatNotToDo.genericPosts.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>❌</span> {t('whatNotToDo.broadInspiration.title')}
              </h4>
              <p className="text-sm">{t('whatNotToDo.broadInspiration.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-red-500">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <span>❌</span> {t('whatNotToDo.unrelatedContent.title')}
              </h4>
              <p className="text-sm">{t('whatNotToDo.unrelatedContent.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('finalRecommendation.title')}</h2>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-indigo-800 dark:text-indigo-200">
            {t('finalRecommendation.subtitle')}
          </h3>
          <p className="mb-6 text-lg">{t('finalRecommendation.description')}</p>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-indigo-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <h4 className="font-semibold">{t('finalRecommendation.priority1.title')}</h4>
                  <p className="text-sm mb-2">{t('finalRecommendation.priority1.description')}</p>
                  <div className="flex gap-2">
                    <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">🚀 Traffic + SEO</span>
                    <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">📈 Templates + Batching</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <h4 className="font-semibold">{t('finalRecommendation.priority2.title')}</h4>
                  <p className="text-sm mb-2">{t('finalRecommendation.priority2.description')}</p>
                  <div className="flex gap-2">
                    <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">💰 Conversion + Differentiation</span>
                    <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">🎥 Bilingual Video</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-yellow-500">
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <h4 className="font-semibold">{t('finalRecommendation.priority3.title')}</h4>
                  <p className="text-sm mb-2">{t('finalRecommendation.priority3.description')}</p>
                  <div className="flex gap-2">
                    <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs">🎓 ESL Creators</span>
                    <span className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded text-xs">📚 Learning Content</span>
                  </div>
                </div>
              </div>
            </div>
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

      <RelatedBlogs currentSlug="viral-learning-content" locale="en" maxRelated={3} />
    </article>
  )
}
