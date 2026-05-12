'use client'

import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import RelatedBlogs from '@/app/[locale]/_components/RelatedBlogs'
import CdnImage from '@/app/[locale]/_components/CdnImage'

export default function BlogContent() {
  const t = useTranslations('blog.gridCollageAiPrompts')
  const locale = useLocale()

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
            src="/images/29e3bb3f943ce4c0a4265552e0132d4c_thumb_1767877380079.jpg" 
            className="w-full rounded-lg shadow-lg"
            alt="3x3 Grid Photo Collage Examples"
          />
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whatIsTitle')}</h2>
        <p className="mb-4">
          {t('whatIsContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('whyAiTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('consistencyTitle')}</h3>
        <p className="mb-4">
          {t('consistencyContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('timeEfficiencyTitle')}</h3>
        <p className="mb-4">
          {t('timeEfficiencyContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('creativeFreedomTitle')}</h3>
        <p className="mb-4">
          {t('creativeFreedomContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('costEffectiveTitle')}</h3>
        <p className="mb-4">
          {t('costEffectiveContent')}
        </p>
      </section>

      <blockquote className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
        <p className="font-semibold">Consistency Note:</p>
        <p>For best results, use the same AI model and settings for all images in your grid. Small variations in temperature or seed values can create noticeable inconsistencies across the nine panels.</p>
      </blockquote>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('winterForestTitle')}</h2>
        <p className="mb-4">
          {t('winterForestDescription')}
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('winterForestGridTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{t('winterForestPrompt')}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('minimalistWinterTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{`3x3 grid collage of minimalist winter forest scenes. Each panel focuses on simple winter elements with negative space. Panel 1: Single snow-covered branch. Panel 2: Frozen lake surface. Panel 3: Bare tree silhouette. Panel 4: Snow falling on evergreen. Panel 5: Ice patterns on window. Panel 6: Winter berries on branch. Panel 7: Footprints in fresh snow. Panel 8: Steam from hot drink in forest. Panel 9: Winter moon through trees. Monochromatic blue and white palette, minimalist photography style, clean composition, high contrast.`}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('summerBeachTitle')}</h2>
        <p className="mb-4">
          {t('summerBeachDescription')}
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('tropicalBeachTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{t('summerBeachPrompt')}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('nauticalBeachTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{`3x3 grid of nautical-themed beach scenes. Each panel features maritime elements. Panel 1: Lighthouse on cliff. Panel 2: Sailing boats at anchor. Panel 3: Rope and fishing nets. Panel 4: Anchor in sand. Panel 5: Seagulls in flight. Panel 6: Nautical flags on pier. Panel 7: Wooden pier extending to sea. Panel 8: Buoy floating in water. Panel 9: Ship's wheel on beach. Navy blue and white color scheme, crisp coastal photography, clean compositions, nautical aesthetic, professional marine photography.`}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('neonUrbanTitle')}</h2>
        <p className="mb-4">
          {t('neonUrbanDescription')}
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('streetFashionTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{`3x3 grid of urban street fashion photography. Each panel shows different city fashion moments. Panel 1: Model crossing street in trench coat. Panel 2: Coffee shop window reflection. Panel 3: Sneakers on pavement. Panel 4: City bus blurred background. Panel 5: Fashion accessories on bench. Panel 6: Street art backdrop. Panel 7: Umbrella in rain. Panel 8: Metro station entrance. Panel 9: Rooftop city view. Muted color palette with pops of red, urban grunge aesthetic, editorial photography style, cinematic lighting, fashion magazine quality.`}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('nightCityTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{`Create a 3x3 grid of night city scenes with neon lights. Each panel captures urban nightlife. Panel 1: Neon sign reflection in puddle. Panel 2: City lights from rooftop. Panel 3: Traffic light trails. Panel 4: Restaurant window at night. Panel 5: Street performer silhouette. Panel 6: Lit-up storefront displays. Panel 7: Taxi lights in rain. Panel 8: Bridge illumination. Panel 9: Bar entrance with neon. Deep blues and vibrant neon colors, night photography style, urban exploration theme, moody atmosphere, professional cityscape photography.`}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('seasonalTitle')}</h2>
        <p className="mb-4">
          {t('seasonalDescription')}
        </p>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('springGardenTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{t('springGardenPrompt')}
          </pre>
        </div>

        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg my-6">
          <h4 className="text-xl font-semibold mb-3">{t('autumnCafeTitle')}</h4>
          <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
{t('autumnCafePrompt')}
          </pre>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('templateTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('consistencyTipsTitle')}</h3>
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mb-4">
          {t.raw('consistencyTips').map((tip: string, index: number) => (
          <div key={index} className="mb-2 text-gray-700 dark:text-gray-300">
            • {tip}
          </div>
        ))}
        </div>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('cohesiveColorPalettesTitle')}</h3>
        <p className="mb-4">
          {t('cohesiveColorPalettesContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('planCompositionTitle')}</h3>
        <p className="mb-4">
          {t('planCompositionContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('testIndividualPanelsTitle')}</h3>
        <p className="mb-4">
          {t('testIndividualPanelsContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('faqTitle')}</h2>
        {/* 1. Get the raw array from your JSON */}
        {t.raw('faq').map((item: { question: string; answer: string }, index: number) => (
          <div key={index} className="mb-6">
            <h3 className="text-2xl font-semibold mb-3 mt-6">
              {item.question}
            </h3>
            <p className="mb-4">
              {item.answer}
            </p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('platformTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('instagramTitle')}</h3>
        <p className="mb-4">
          {t('instagramContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('pinterestTitle')}</h3>
        <p className="mb-4">
          {t('pinterestContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('websiteTitle')}</h3>
        <p className="mb-4">
          {t('websiteContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('advancedTitle')}</h2>
        
        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('narrativeTitle')}</h3>
        <p className="mb-4">
          {t('narrativeContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('colorProgressionTitle')}</h3>
        <p className="mb-4">
          {t('colorProgressionContent')}
        </p>

        <h3 className="text-2xl font-semibold mb-3 mt-6">{t('thematicTitle')}</h3>
        <p className="mb-4">
          {t('thematicContent')}
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('platformTitle')}</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('platformTableHeader')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('gridSupportHeader')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">{t('bestForHeader')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('midjourneyName')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('midjourneySupport')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('midjourneyBest')}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('dalleName')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('dalleSupport')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('dalleBest')}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">{t('stableDiffusionName')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('stableDiffusionSupport')}</td>
                <td className="px-6 py-4 whitespace-nowrap">{t('stableDiffusionBest')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-3xl font-semibold mb-4">{t('conclusionTitle')}</h2>
        <p className="mb-4">
          {t('conclusionContent1')}
        </p>
        <p className="mb-4">
          {t('conclusionContent2')}
        </p>
        <p className="mb-4">
          {t('conclusionContent3')}
        </p>
        <p className="mb-4">
          {t('conclusionContent4')}
        </p>
      </section>

    <RelatedBlogs currentSlug="how-to-dub-videos-naturally" locale={locale} />
    </article>
  )
}
