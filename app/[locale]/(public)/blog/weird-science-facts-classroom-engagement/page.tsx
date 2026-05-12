'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";

export default function WeirdScienceFactsClassroomEngagement() {
  const t = useTranslations('blog.weirdScienceFactsClassroomEngagement');
  const locale = useLocale();

  const tableOfContents = [
    { id: 'what-are-weird-science-facts', title: t('whatIsTitle') },
    { id: 'why-visual-science-works', title: t('whyTitle') },
    { id: 'bilingual-flashcard-method', title: t('bilingualTitle') },
    { id: 'top-10-weird-facts', title: t('topFactsTitle') },
    { id: 'classroom-applications', title: t('classroomTitle') },
    { id: 'assessment-strategies', title: t('assessmentTitle') },
  ];

  return (
    <article className="pt-20 pb-12 text-[18px] leading-8 lg:pr-12 lg:pl-8 pl-4 pr-4 md:pl-8 md:pr-8">
      <StructuredData 
        title={t('title')}
        description={t('metaDescription')}
        publishDate={t('date')}
        url="/blog/weird-science-facts-classroom-engagement"
        readTime={t('readTime')}
        image="/images/nano_insp/template-weird-cold-knowledge-popular-science-card-blue-whale.jpg"
      />
      
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src="/images/nano_insp/template-weird-cold-knowledge-popular-science-card-blue-whale.jpg"
            alt={t('title')}
            width={400}
            height={250}
            className="rounded-lg object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        
        <div className="text-gray-600 mb-4">
          {t('date')} • {t('readTime')}
        </div>
      </div>

      <div className="clear-both">
        <TableOfContents headings={tableOfContents.map(item => ({ level: 'H2', text: item.title, id: item.id }))} />
        
        <section className="mb-8">
          <p className="text-lg font-semibold text-blue-600 mb-4">{t('intro')}</p>
        </section>

        <section id="what-are-weird-science-facts" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whatIsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whatIsContent') }} />
        </section>

        <section id="why-visual-science-works" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whyTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whyContent') }} />
        </section>

        <section id="bilingual-flashcard-method" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('bilingualTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('bilingualContent') }} />
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">{t('templateTitle')}</h3>
            <PromptBox 
              title={t('templateTitle')}
              promptText={t('templatePrompt')}
            >
              <div>{t('templateDescription')}</div>
              <div className="mt-2 font-mono text-sm">{t('templatePrompt')}</div>
            </PromptBox>
          </div>
        </section>

        <section id="top-10-weird-facts" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('topFactsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('topFactsContent') }} />
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('jupiterDiamondsTitle')}</h3>
              <PromptBox 
                title={t('jupiterDiamondsTitle')}
                promptText={t('jupiterDiamondsPrompt')}
              >
                <div>{t('jupiterDiamondsDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('jupiterDiamondsPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('octopusThreeHeartsTitle')}</h3>
              <PromptBox 
                title={t('octopusThreeHeartsTitle')}
                promptText={t('octopusThreeHeartsPrompt')}
              >
                <div>{t('octopusThreeHeartsDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('octopusThreeHeartsPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('honeyNeverSpoilsTitle')}</h3>
              <PromptBox 
                title={t('honeyNeverSpoilsTitle')}
                promptText={t('honeyNeverSpoilsPrompt')}
              >
                <div>{t('honeyNeverSpoilsDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('honeyNeverSpoilsPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('lightningHotterSunTitle')}</h3>
              <PromptBox 
                title={t('lightningHotterSunTitle')}
                promptText={t('lightningHotterSunPrompt')}
              >
                <div>{t('lightningHotterSunDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('lightningHotterSunPrompt')}</div>
              </PromptBox>
            </div>
          </div>
        </section>

        <section id="classroom-applications" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('classroomTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('classroomContent') }} />
        </section>

        <section id="assessment-strategies" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('assessmentTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('assessmentContent') }} />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('toolsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('toolsContent') }} />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('conclusionTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('conclusionContent') }} />
        </section>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">{t('ctaTitle')}</h3>
          <p className="mb-4">{t('ctaDescription')}</p>
          <Link 
            href="/tools"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </div>

      <RelatedBlogs currentSlug="weird-science-facts-classroom-engagement" locale={locale} />
    </article>
  );
}
