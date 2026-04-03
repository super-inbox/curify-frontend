'use client'

import { useTranslations } from 'next-intl'
import CdnImage from '@/app/[locale]/_components/CdnImage'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'

export default function BlogContent() {
  const t = useTranslations('blog.visualLearningTools')

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
            src="/images/visuallearningtool.webp" 
            alt={t('heroImageAlt')}
            width={800}
            height={400}
            className="w-full rounded-lg shadow-lg"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('introduction.title')}</h2>
        <p className="mb-4">
          {t('introduction.description')}
        </p>
        <p className="mb-4">
          {t('introduction.description2')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatWeOffer.title')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6 my-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎨 {t('whatWeOffer.visualMindMaps.title')}</h3>
            <p className="mb-3">{t('whatWeOffer.visualMindMaps.description')}</p>
            <ul className="space-y-2">
              {t.raw('whatWeOffer.visualMindMaps.features').map((feature: string, index: number) => (
                <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">📊 {t('whatWeOffer.infographicGenerator.title')}</h3>
            <p className="mb-3">{t('whatWeOffer.infographicGenerator.description')}</p>
            <ul className="space-y-2">
              {t.raw('whatWeOffer.infographicGenerator.features').map((feature: string, index: number) => (
                <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🧠 {t('whatWeOffer.studyCards.title')}</h3>
            <p className="mb-3">{t('whatWeOffer.studyCards.description')}</p>
            <ul className="space-y-2">
              {t.raw('whatWeOffer.studyCards.features').map((feature: string, index: number) => (
                <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎯 {t('whatWeOffer.interactiveDiagrams.title')}</h3>
            <p className="mb-3">{t('whatWeOffer.interactiveDiagrams.description')}</p>
            <ul className="space-y-2">
              {t.raw('whatWeOffer.interactiveDiagrams.features').map((feature: string, index: number) => (
                <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('forStudents.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📚 {t('forStudents.enhancedComprehension.title')}</h3>
            <p className="mb-3">
              {t('forStudents.enhancedComprehension.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forStudents.enhancedComprehension.benefits')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forStudents.enhancedComprehension.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">⏰ {t('forStudents.efficientStudy.title')}</h3>
            <p className="mb-3">
              {t('forStudents.efficientStudy.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forStudents.efficientStudy.benefits')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forStudents.efficientStudy.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('forStudents.creativeLearning.title')}</h3>
            <p className="mb-3">
              {t('forStudents.creativeLearning.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forStudents.creativeLearning.benefits')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forStudents.creativeLearning.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('forParents.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">👁️ {t('forParents.visualSupport.title')}</h3>
            <p className="mb-3">
              {t('forParents.visualSupport.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forParents.visualSupport.features')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forParents.visualSupport.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-pink-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📈 {t('forParents.progressTracking.title')}</h3>
            <p className="mb-3">
              {t('forParents.progressTracking.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forParents.progressTracking.features')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forParents.progressTracking.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('forTeachers.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-indigo-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎭 {t('forTeachers.engagingLessons.title')}</h3>
            <p className="mb-3">
              {t('forTeachers.engagingLessons.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forTeachers.engagingLessons.tools')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forTeachers.engagingLessons.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-teal-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📋 {t('forTeachers.assessmentTools.title')}</h3>
            <p className="mb-3">
              {t('forTeachers.assessmentTools.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forTeachers.assessmentTools.tools')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forTeachers.assessmentTools.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-l-4 border-red-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🔄 {t('forTeachers.differentiatedInstruction.title')}</h3>
            <p className="mb-3">
              {t('forTeachers.differentiatedInstruction.description')}
            </p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
              <p className="font-medium text-gray-900 dark:text-white">{t('forTeachers.differentiatedInstruction.tools')}</p>
              <ul className="mt-2 space-y-1 text-gray-700 dark:text-gray-300">
                {t.raw('forTeachers.differentiatedInstruction.items').map((item: string, index: number) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howToGetStarted.title')}</h2>
        
        <div className="space-y-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🚀 {t('howToGetStarted.step1.title')}</h3>
            <p className="mb-4">
              {t('howToGetStarted.step1.description')}
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🎯 {t('howToGetStarted.step2.title')}</h3>
            <p className="mb-4">
              {t('howToGetStarted.step2.description')}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">✨ {t('howToGetStarted.step3.title')}</h3>
            <p className="mb-4">
              {t('howToGetStarted.step3.description')}
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('successStories.title')}</h2>
        
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">📚 {t('successStories.studentStory.title')}</h3>
            <p className="text-sm">
              {t('successStories.studentStory.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('successStories.studentStory.attribution')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">👨‍🏫 {t('successStories.teacherStory.title')}</h3>
            <p className="text-sm">
              {t('successStories.teacherStory.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('successStories.teacherStory.attribution')}</p>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">👩‍👦 {t('successStories.parentStory.title')}</h3>
            <p className="text-sm">
              {t('successStories.parentStory.quote')}
            </p>
            <p className="text-xs text-gray-600 mt-2">— {t('successStories.parentStory.attribution')}</p>
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
          <p>{t('footer.callToAction')}</p>
        </div>
      </footer>

      <RelatedBlogs currentSlug="visual-learning-tools" locale="en" maxRelated={2} />
    </article>
  )
}
