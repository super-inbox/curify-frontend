'use client'

import { useTranslations } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.imageToNarrativeVideo')

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
            src="/images/iran.webp" 
            className="w-full rounded-lg shadow-lg"
            alt="Image to Narrative Video Tool"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('introTitle')}</h2>
        <p className="mb-4 text-lg">
          {t('introContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatItDoes.title')}</h2>
        <p className="mb-4">
          {t('whatItDoes.content')}
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg my-6">
          <h3 className="text-xl font-semibold mb-3">🚀 {t('whatItDoes.coreFeatures.title')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {t.raw('whatItDoes.coreFeatures.items').map((item: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-2xl">{item.split(':')[0]}</span>
                <div>
                  <strong>{item.split(':')[1].split(' - ')[0]}</strong> - {item.split(':')[1].split(' - ')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('howItWorks.title')}</h2>
        <p className="mb-4">
          {t('howItWorks.intro')}
        </p>
        
        <div className="space-y-6">
          {t.raw('howItWorks.steps').map((step: any, index: number) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-3">
                <span className="text-2xl mr-2">{step.icon}</span>
                {step.title}
              </h3>
              <p className="mb-4">{step.description}</p>
              <div className="bg-white dark:bg-gray-700 p-4 rounded border">
                <h4 className="font-semibold mb-2">{step.technical.title}</h4>
                <p className="text-sm mb-2">{step.technical.description}</p>
                <div className="bg-gray-100 dark:bg-gray-600 p-3 rounded text-xs font-mono">
                  {step.technical.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('technicalBreakdown.title')}</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">🧠 {t('technicalBreakdown.aiComponents.title')}</h3>
            <ul className="space-y-2">
              {t.raw('technicalBreakdown.aiComponents.items').map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-purple-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-3">⚙️ {t('technicalBreakdown.pipeline.title')}</h3>
            <ul className="space-y-2">
              {t.raw('technicalBreakdown.pipeline.items').map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('useCases.title')}</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">📚 {t('useCases.educational.title')}</h3>
            <p className="mb-3">{t('useCases.educational.description')}</p>
            <ul className="space-y-2">
              {t.raw('useCases.educational.examples').map((example: string, index: number) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-green-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎯 {t('useCases.marketing.title')}</h3>
            <p className="mb-3">{t('useCases.marketing.description')}</p>
            <ul className="space-y-2">
              {t.raw('useCases.marketing.examples').map((example: string, index: number) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>

          <div className="border-l-4 border-purple-500 pl-6">
            <h3 className="text-xl font-semibold mb-2">🎨 {t('useCases.creative.title')}</h3>
            <p className="mb-3">{t('useCases.creative.description')}</p>
            <ul className="space-y-2">
              {t.raw('useCases.creative.examples').map((example: string, index: number) => (
                <li key={index}>• {example}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('codeExample.title')}</h2>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <p className="mb-4">{t('codeExample.intro')}</p>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm">
              <code>{`const result = await imageToNarrativeVideo({ 
  imageUrl: "path/to/image.jpg", 
  narrationStyle: "educational", 
  outputFormat: "mp4" 
});`}</code>
            </pre>
          </div>
          
          <div className="mt-4 space-y-3">
            {t.raw('codeExample.explanations').map((explanation: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </div>
                <div>
                  <strong>{explanation.split(':')[0]}</strong> - {explanation.split(':')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('advantages.title')}</h2>
        
        <div className="grid md:grid-cols-3 gap-6 my-6">
          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">10x</div>
            <div className="font-semibold">{t('advantages.speed.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('advantages.speed.description')}</div>
          </div>
          
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">AI</div>
            <div className="font-semibold">{t('advantages.intelligence.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('advantages.intelligence.description')}</div>
          </div>
          
          <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">∞</div>
            <div className="font-semibold">{t('advantages.scalability.title')}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('advantages.scalability.description')}</div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('advantages.keyBenefits.title')}</h3>
          <ul className="space-y-2">
            {t.raw('advantages.keyBenefits.items').map((benefit: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-yellow-500">✓</span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('gettingStarted.title')}</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('gettingStarted.stepsTitle')}</h3>
          <div className="space-y-4">
            {t.raw('gettingStarted.steps').map((step: string, index: number) => (
              <div key={index} className="flex items-start gap-3">
                <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <div>
                  <strong>{step.split(':')[0]}</strong> - {step.split(':')[1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 bg-red-50 dark:bg-red-900/20 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">⚠️ {t('gettingStarted.prerequisites.title')}</h3>
          <ul className="space-y-2">
            {t.raw('gettingStarted.prerequisites.items').map((prereq: string, index: number) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500">•</span>
                <span>{prereq}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('results.title')}</h2>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <p className="mb-4">{t('results.intro')}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎬 {t('results.output1.title')}</h3>
              <p className="text-sm mb-2">{t('results.output1.description')}</p>
              <p className="text-xs text-gray-600">{t('results.output1.specs')}</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">🎵 {t('results.output2.title')}</h3>
              <p className="text-sm mb-2">{t('results.output2.description')}</p>
              <p className="text-xs text-gray-600">{t('results.output2.specs')}</p>
            </div>
          </div>

          <div className="mt-6 text-center">
            <img 
              src="/images/iran.webp" 
              className="rounded-lg shadow-lg max-w-md mx-auto"
              title="Sample output from Image to Narrative Video tool"
            />
            <p className="text-sm text-gray-600 mt-2">{t('results.caption')}</p>
          </div>
          
          <div className="mt-8 text-center">
            <h3 className="text-xl font-semibold mb-4">🎬 Video Demo</h3>
            <video 
              src="/videos/inception.mp4" 
              className="rounded-lg shadow-lg max-w-md mx-auto"
              controls
              title="Video demonstration of Image to Narrative Video tool"
            />
            <p className="text-sm text-gray-600 mt-2">See the Image to Narrative Video tool in action</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('future.title')}</h2>
        <p className="mb-4">
          {t('future.content')}
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-3">{t('future.roadmap.title')}</h3>
          <div className="space-y-3">
            {t.raw('future.roadmap.items').map((item: string, index: number) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-green-500">🚀</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t pt-8">
        <div className="flex flex-wrap gap-4 mb-6">
          {t.raw('footer.tags').map((tag: string, index: number) => (
            <span key={index} className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-sm text-blue-800 dark:text-blue-100">{tag}</span>
          ))}
        </div>
        
        <div className="text-center">
          <p className="mb-4">{t('footer.questions')}</p>
          <a 
            href={t('footer.contactLink')} 
            className="inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            {t('footer.contactText')}
          </a>
        </div>
      </footer>

      <RelatedBlogs currentSlug="image-to-narrative-video" locale="en" maxRelated={3} />
    </article>
  )
}
