'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'
export default function BlogContent() {
  const t = useTranslations('blog.contentMultiplicationSystem')

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
            src="/images/thirtyday.webp" 
            className="w-full rounded-lg shadow-lg"
            alt="Content Multiplication System"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('introduction.title')}</h2>
        <p className="mb-4 text-lg">
          {t('introduction.description')}
        </p>
        <p className="mb-4 italic">
          {t('introduction.quote')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('problem.title')}</h2>
        <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-3 text-red-800 dark:text-red-200">
            {t('problem.manualTreadmill.title')}
          </h3>
          <p className="mb-4">
            {t('problem.manualTreadmill.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded border-l-4 border-red-500">
            <p className="font-medium mb-2">{t('problem.manualTreadmill.approach')}</p>
            <ol className="space-y-2">
              {t.raw('problem.manualTreadmill.steps').map((step: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="font-bold text-red-600">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <p className="mt-4 text-red-700 dark:text-red-300 font-medium">
            {t('problem.manualTreadmill.conclusion')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('newWay.title')}</h2>
        <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
          <h3 className="text-2xl font-bold mb-4 text-green-800 dark:text-green-200">
            {t('newWay.formula')}
          </h3>
          <p className="mb-6">
            {t('newWay.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
              <div className="font-semibold">{t('newWay.idea.title')}</div>
              <div className="text-sm text-gray-600">{t('newWay.idea.description')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">10</div>
              <div className="font-semibold">{t('newWay.cards.title')}</div>
              <div className="text-sm text-gray-600">{t('newWay.cards.description')}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">30</div>
              <div className="font-semibold">{t('newWay.posts.title')}</div>
              <div className="text-sm text-gray-600">{t('newWay.posts.description')}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('step1.title')}</h2>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('step1.subtitle')}</h3>
          <p className="mb-4">
            {t('step1.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-500">
            <p className="font-medium mb-2">{t('step1.example.title')}</p>
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              "{t('step1.example.content')}"
            </p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('step2.title')}</h2>
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('step2.subtitle')}</h3>
          <p className="mb-6">
            {t('step2.description')}
          </p>
          
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold mb-2">📚 {t('step2.vocabularyCards.title')}</h4>
              <p className="text-sm mb-2">{t('step2.vocabularyCards.description')}</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="bg-purple-100 dark:bg-purple-800 p-2 rounded text-center text-xs">
                    Card {i}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold mb-2">📝 {t('step2.sentenceCards.title')}</h4>
              <p className="text-sm mb-2">{t('step2.sentenceCards.description')}</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-purple-100 dark:bg-purple-800 p-2 rounded text-center text-xs">
                    Context {i}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-purple-500">
              <h4 className="font-semibold mb-2">🎬 {t('step2.sceneCards.title')}</h4>
              <p className="text-sm mb-2">{t('step2.sceneCards.description')}</p>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-purple-100 dark:bg-purple-800 p-2 rounded text-center text-xs">
                    Scene {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('step3.title')}</h2>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('step3.subtitle')}</h3>
          <p className="mb-6">
            {t('step3.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🖼️</div>
              <h4 className="font-semibold mb-2">{t('step3.formats.staticImages.title')}</h4>
              <p className="text-sm">{t('step3.formats.staticImages.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🎥</div>
              <h4 className="font-semibold mb-2">{t('step3.formats.bilingualVideos.title')}</h4>
              <p className="text-sm">{t('step3.formats.bilingualVideos.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg text-center">
              <div className="text-2xl mb-2">🎠</div>
              <h4 className="font-semibold mb-2">{t('step3.formats.carouselPosts.title')}</h4>
              <p className="text-sm">{t('step3.formats.carouselPosts.description')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('demo.title')}</h2>
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <p className="mb-4">
            {t('demo.description')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
            <div className="text-6xl mb-4">🎬</div>
            <h4 className="font-semibold mb-2">{t('demo.placeholder.title')}</h4>
            <p className="text-sm text-gray-600">{t('demo.placeholder.description')}</p>
          </div>
          <blockquote className="mt-6 border-l-4 border-purple-500 pl-6 italic">
            "{t('demo.quote')}"
          </blockquote>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('conclusion.title')}</h2>
        <div className="bg-gray-50 dark:bg-gray-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('conclusion.subtitle')}</h3>
          <p className="mb-4">
            {t('conclusion.description1')}
          </p>
          <p className="mb-4">
            {t('conclusion.description2')}
          </p>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border-l-4 border-gray-500">
            <p className="font-medium">
              {t('conclusion.finalThought')}
            </p>
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

      <RelatedBlogs currentSlug="content-multiplication-system" locale="en" maxRelated={3} />
    </article>
  )
}
