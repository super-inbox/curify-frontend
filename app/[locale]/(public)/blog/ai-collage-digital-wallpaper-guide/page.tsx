'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";
import NanoBananaExamples from "@/app/[locale]/(public)/blog/[slug]/NanoBananaExamples";
import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";

export default function AICollageWallpaperGuide() {
  const t = useTranslations('blog.aiCollageDigitalWallpaperGuide');
  const locale = useLocale();

  const tableOfContents = [
    { id: 'what-is-3x3-grid', title: t('whatIsTitle') },
    { id: 'why-grid-collages', title: t('whyTitle') },
    { id: 'nano-banana-grid-method', title: t('nanoBananaTitle') },
    { id: 'seasonal-templates', title: t('seasonalTitle') },
    { id: 'wallpaper-optimization', title: t('wallpaperTitle') },
    { id: 'advanced-techniques', title: t('advancedTitle') },
  ];

  return (
    <article className="xl:pr-72 pt-20 pb-12 text-[18px] leading-8 lg:pr-12 lg:pl-8 pl-4 pr-4 md:pl-8 md:pr-8">
      <StructuredData 
        title={t('title')}
        description={t('metaDescription')}
        publishDate={t('date')}
        url="/blog/ai-collage-digital-wallpaper-guide"
        readTime={t('readTime')}
        image="/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg"
      />
      
      <div className="mb-8">
        <div className="mb-4 mx-auto max-w-lg md:max-w-xl md:float-left md:mr-6 md:mx-0 flex items-center justify-center">
          <CdnImage
            src="/images/45658b99d089618b244c024b1ea93cc9_thumb_1762921242171.jpg"
            alt={t('title')}
            width={672}
            height={448}
            className="block max-w-full max-h-96 w-auto h-auto rounded-lg shadow"
          />
        </div>
        
        <AutoTableOfContents />
        <BlogCategoryLabel slug="ai-collage-digital-wallpaper-guide" />
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

        <section id="what-is-3x3-grid" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whatIsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whatIsContent') }} />
        </section>

        <section id="why-grid-collages" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('whyTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('whyContent') }} />
        </section>

        <section id="nano-banana-grid-method" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('nanoBananaTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('nanoBananaContent') }} />
          
          <div className="mt-6">
            <h3 className="text-xl font-semibold mb-4">{t('basicTemplateTitle')}</h3>
            <PromptBox 
              title={t('basicTemplateTitle')}
              promptText={t('basicTemplatePrompt')}
            >
              <div>{t('basicTemplateDescription')}</div>
              <div className="mt-2 font-mono text-sm">{t('basicTemplatePrompt')}</div>
            </PromptBox>
          </div>
        </section>

        <section id="seasonal-templates" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('seasonalTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('seasonalContent') }} />
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('winterForestTitle')}</h3>
              <PromptBox 
                title={t('winterForestTitle')}
                promptText={t('winterForestPrompt')}
              >
                <div>{t('winterForestDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('winterForestPrompt')}</div>
              </PromptBox>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">{t('autumnVibesTitle')}</h3>
              <PromptBox 
                title={t('autumnVibesTitle')}
                promptText={t('autumnVibesPrompt')}
              >
                <div>{t('autumnVibesDescription')}</div>
                <div className="mt-2 font-mono text-sm">{t('autumnVibesPrompt')}</div>
              </PromptBox>
            </div>
          </div>
        </section>

        <section id="wallpaper-optimization" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('wallpaperTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('wallpaperContent') }} />
        </section>

        <section id="advanced-techniques" className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('advancedTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('advancedContent') }} />
        </section>

        <section className="mb-8">
          <NanoBananaExamples locale={locale} blogSlug="ai-collage-digital-wallpaper-guide" />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('toolsTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('toolsContent') }} />
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">{t('conclusionTitle')}</h2>
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: t('conclusionContent') }} />
        </section>

      </div>

      <BlogCTACard
        category="nano-template"
        slug="ai-collage-digital-wallpaper-guide"
        locale={locale}
      />

      <RelatedBlogs currentSlug="ai-collage-digital-wallpaper-guide" locale={locale} />
    </article>
  );
}
