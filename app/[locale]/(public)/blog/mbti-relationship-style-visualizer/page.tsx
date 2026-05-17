'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";
import { makeNanoTemplateUrl } from "@/lib/nano_utils";
import { resolveContentLocale } from "@/lib/locale_utils";

export default function MBTIRelationshipStyleVisualizer() {
  const t = useTranslations('blog.mbiRelationshipStyleVisualizer');
  const locale = useLocale();

  const tableOfContents = [
    { id: 'what-is-mbti-relationships', title: t('whatIsTitle') },
    { id: 'why-mbti-style-matters', title: t('whyTitle') },
    { id: 'couple-dynamics-method', title: t('coupleTitle') },
    { id: 'outfit-breakdown-technique', title: t('outfitTitle') },
    { id: 'popular-type-combinations', title: t('combinationsTitle') },
    { id: 'fashion-applications', title: t('fashionTitle') },
  ];

  return (
    <article className="pt-20 pb-12 text-[18px] leading-8 lg:pr-12 lg:pl-8 pl-4 pr-4 md:pl-8 md:pr-8">
      <StructuredData 
        title={t('title')}
        description={t('metaDescription')}
        publishDate={t('date')}
        url="/blog/mbti-relationship-style-visualizer"
        readTime={t('readTime')}
        image="/images/nano_insp/template-friends-character-mbti-chandler-bing.jpg"
      />
      
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src="/images/nano_insp/template-friends-character-mbti-chandler-bing.jpg"
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

        <section id="what-is-mbti-relationships" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whatIsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whatIsContent') }} />
        </section>

        <section id="why-mbti-style-matters" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whyTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whyContent') }} />
        </section>

        <section id="couple-dynamics-method" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('coupleTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('coupleContent') }} />
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">{t('relationshipTemplateTitle')}</h3>
            <PromptBox 
              title={t('relationshipTemplateTitle')}
              promptText={t('relationshipTemplatePrompt')}
            >
              <div>{t('relationshipTemplateDescription')}</div>
              <div className="mt-2 font-mono text-sm">{t('relationshipTemplatePrompt')}</div>
            </PromptBox>
          </div>
        </section>

        <section id="outfit-breakdown-technique" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('outfitTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('outfitContent') }} />
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('intjTechwearTitle')}</h3>
              <PromptBox 
                title={t('intjTechwearTitle')}
                promptText={t('intjTechwearPrompt')}
              >
                <div>{t('intjTechwearDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('intjTechwearPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('esfpFestivalTitle')}</h3>
              <PromptBox 
                title={t('esfpFestivalTitle')}
                promptText={t('esfpFestivalPrompt')}
              >
                <div>{t('esfpFestivalDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('esfpFestivalPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('infjAcademicTitle')}</h3>
              <PromptBox 
                title={t('infjAcademicTitle')}
                promptText={t('infjAcademicPrompt')}
              >
                <div>{t('infjAcademicDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('infjAcademicPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('estpAthleticTitle')}</h3>
              <PromptBox 
                title={t('estpAthleticTitle')}
                promptText={t('estpAthleticPrompt')}
              >
                <div>{t('estpAthleticDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('estpAthleticPrompt')}</div>
              </PromptBox>
            </div>
          </div>
        </section>

        <section id="popular-type-combinations" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('combinationsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('combinationsContent') }} />
        </section>

        <section id="fashion-applications" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('fashionTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('fashionContent') }} />
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
            href={makeNanoTemplateUrl("template-friends-character-mbti", resolveContentLocale(locale))}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </div>

      <RelatedBlogs currentSlug="mbti-relationship-style-visualizer" locale={locale} />
    </article>
  );
}
