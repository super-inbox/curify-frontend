'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.mbtiCharacterGenerator')

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
            src="/images/nano_insp_preview/template-mbti-nba-kevendurant-prev.jpg" 
            className="w-full rounded-lg shadow-lg"
            alt="MBTI Character Generator Preview"
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
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg mb-6">
          <h3 className="text-xl font-semibold mb-3">👉 {t('intro.example.title')}</h3>
          <a 
            href="https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant"
            className="text-blue-600 hover:text-blue-800 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant
          </a>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatIs.title')}</h2>
        <p className="mb-4">
          {t('whatIs.description1')}
        </p>
        <p className="mb-4">
          {t('whatIs.description2')}
        </p>
        
        <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">🧠 {t('whatIs.thinkOfItAs')}</h3>
          <p>{t('whatIs.thinkOfItAsDescription')}</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('examples.title')}</h2>
        <p className="mb-6">
          {t('examples.description')}
        </p>

        <div className="space-y-8">
          <div className="border-l-4 border-orange-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">🏀 {t('examples.nba.title')}</h3>
            <p className="mb-4">
              {t('examples.nba.description')}
            </p>
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant"
                className="text-orange-600 hover:text-orange-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>INTJ</strong> • {t('examples.nba.intj')}</p>
                <p><strong>ESFP</strong> • {t('examples.nba.esfp')}</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">ð¾ {t('examples.animals.title')}</h3>
            <p className="mb-4">
              {t('examples.animals.description')}
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-animal/example/template-mbti-animal-amusement-park%206"
                className="text-green-600 hover:text-green-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-animal/example/template-mbti-animal-amusement-park%206
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>INFP</strong> • {t('examples.animals.infp')}</p>
                <p><strong>ESTP</strong> • {t('examples.animals.estp')}</p>
              </div>
            </div>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-2xl font-semibold mb-3">ð {t('examples.movies.title')}</h3>
            <p className="mb-4">
              {t('examples.movies.description')}
            </p>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded">
              <a 
                href="https://www.curify-ai.com/nano-template/mbti-generic/example/template-mbti-generic-friends-rachel"
                className="text-purple-600 hover:text-purple-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://www.curify-ai.com/nano-template/mbti-generic/example/template-mbti-generic-friends-rachel
              </a>
              <div className="mt-3 space-y-2">
                <p><strong>ENFP</strong> • {t('examples.movies.enfp')}</p>
                <p><strong>ISTJ</strong> • {t('examples.movies.istj')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howItWorks.title')}</h2>
        <p className="mb-6">
          {t('howItWorks.description')}
        </p>

        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('howItWorks.behindTheScenes')}</h3>
          <p className="mb-4">
            {t('howItWorks.systemDescription')}
          </p>
          
          <div className="space-y-3">
            {t.raw('howItWorks.components').map((component: any, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{component.icon}</span>
                <div>
                  <strong>{component.title}</strong> - {component.description}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded">
            <h4 className="font-semibold mb-2">{t('howItWorks.ensures.title')}</h4>
            <ul className="space-y-1">
              {t.raw('howItWorks.ensures.items').map((item: string, index: number) => (
                <li key={index}>• <strong>{item.split(' - ')[0]}</strong> - {item.split(' - ')[1]}</li>
              ))}
            </ul>
          </div>

          <p className="mt-4 italic">
            {t('howItWorks.conclusion')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyNotRegular.title')}</h2>
        <p className="mb-6">
          {t('whyNotRegular.description')}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">â {t('whyNotRegular.traditional.title')}</h3>
            <ul className="space-y-2">
              {t.raw('whyNotRegular.traditional.items').map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">â {t('whyNotRegular.nanoBanana.title')}</h3>
            <ul className="space-y-2">
              {t.raw('whyNotRegular.nanoBanana.items').map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
          <p className="text-center font-semibold">
            {t('whyNotRegular.conclusion')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('useCases.title')}</h2>
        <p className="mb-6">
          {t('useCases.description')}
        </p>

        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🧠 {t('useCases.socialMedia.title')}</h3>
            <ul className="space-y-1">
              {t.raw('useCases.socialMedia.items').map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('useCases.creative.title')}</h3>
            <ul className="space-y-1">
              {t.raw('useCases.creative.items').map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📊 {t('useCases.marketing.title')}</h3>
            <ul className="space-y-1">
              {t.raw('useCases.marketing.items').map((item: string, index: number) => (
                <li key={index}>• {item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('tryNow.title')}</h2>
        <p className="mb-6">
          {t('tryNow.description')}
        </p>

        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">👉 {t('tryNow.explore.title')}</h3>
            <a 
              href="https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant"
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.curify-ai.com/nano-template/mbti-nba/example/template-mbti-nba-kevendurant
            </a>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">👉 {t('tryNow.browse.title')}</h3>
            <a 
              href="https://www.curify-ai.com/nano-banana-pro-prompts"
              className="text-green-600 hover:text-green-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://www.curify-ai.com/nano-banana-pro-prompts
            </a>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('customize.title')}</h2>
        <p className="mb-6">
          {t('customize.description')}
        </p>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">💡 {t('customize.bonus.title')}</h3>
          <p className="mb-4">
            {t('customize.bonus.description')}
          </p>
          <ul className="space-y-2">
            {t.raw('customize.bonus.features').map((feature: string, index: number) => (
              <li key={index}>• <strong>{feature.split(' - ')[0]}</strong> - {feature.split(' - ')[1]}</li>
            ))}
          </ul>
          <p className="mt-4 italic">
            {t('customize.bonus.conclusion')}
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('finalThoughts.title')}</h2>
        <p className="mb-6">
          {t('finalThoughts.description')}
        </p>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-lg text-center">
          <p className="font-semibold text-lg">
            {t('finalThoughts.formula')}
          </p>
        </div>

        <p className="mt-6">
          {t('finalThoughts.conclusion')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('relatedReads.title')}</h2>
        <ul className="space-y-2">
          {t.raw('relatedReads.items').map((item: string, index: number) => (
            <li key={index}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('faq.title')}</h2>
        <div className="space-y-4">
          {t.raw('faq.questions').map((faq: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">{faq.question}</h3>
              <p className="text-gray-700 dark:text-gray-300">{faq.answer}</p>
            </div>
          ))}
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

      <RelatedBlogs currentSlug="mbti-character-generator" locale="en" maxRelated={2} />
    </article>
  )
}
