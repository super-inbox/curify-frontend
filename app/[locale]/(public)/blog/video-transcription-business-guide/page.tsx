/** 
 * Video Transcription Business Guide Blog Post
 * 
 * This component renders a comprehensive business guide about video transcription,
 * covering use cases, benefits, and implementation strategies for content creators,
 * businesses, and organizations.
 */

// Core Next.js and component imports
import Image from "next/image";
import { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CdnImage from "../../../_components/CdnImage";
import RelatedBlogs from "../../../_components/RelatedBlogs";
import { VideoTranscriptionBusinessMermaid } from "./VideoTranscriptionBusinessMermaid";

/**
 * Helper function to convert markdown to HTML
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert newlines to <br>
  html = html.replace(/\n/g, '<br/>');
  
  return html;
}

/**
 * Helper function to process content with markdown and paragraphs
 */
function processContent(content: string): string {
  return content
    .split(/\n\n/) // Split by double newlines for paragraphs
    .map(paragraph => `<p class="mb-4">${markdownToHtml(paragraph)}</p>`)
    .join('');
}

// SEO metadata for blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.videoTranscriptionBusinessGuide" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    keywords: t("seoKeywords"),
  };
}

/**
 * Main component for Video Transcription Business Guide blog post
 * Uses next-intl for internationalization support
 */
export default function VideoTranscriptionBusinessGuidePost() {
  // Initialize translations for 'videoTranscriptionBusinessGuide' namespace
  const t = useTranslations("blog.videoTranscriptionBusinessGuide");
  const locale = useLocale();

  return (
    <article className="pt-10 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h1>
      
      {/* Featured Mermaid diagram with floating layout */}
      <div className="float-right ml-6 mb-4 w-1/2">
        <div className="rounded-lg shadow-lg overflow-hidden">
          <VideoTranscriptionBusinessMermaid />
        </div>
      </div>

      {/* Introduction */}
      <p className="text-gray-700 mb-6 text-lg">
        {t("intro")}
      </p>

      {/* What is Video Transcription */}
      <section className="my-8 p-6 bg-blue-50 rounded-lg clear-both">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whatIsTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("whatIsContent"))
          }} 
        />
      </section>

      {/* Business Benefits */}
      <section className="my-8 p-6 bg-green-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whyTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("whyContent"))
          }} 
        />
      </section>

      {/* Implementation Steps */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("howTitle")}
        </h2>
        
        {/* Step 1 */}
        <div className="mb-6 p-6 bg-purple-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step1Title")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("step1Content"))
            }} 
          />
        </div>

        {/* Step 2 */}
        <div className="mb-6 p-6 bg-yellow-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step2Title")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("step2Content"))
            }} 
          />
        </div>

        {/* Step 3 */}
        <div className="mb-6 p-6 bg-pink-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step3Title")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("step3Content"))
            }} 
          />
        </div>

        {/* Step 4 */}
        <div className="mb-6 p-6 bg-indigo-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step4Title")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("step4Content"))
            }} 
          />
        </div>
      </section>

      {/* Use Cases */}
      <section className="my-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("useCasesTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("useCasesContent"))
          }} 
        />
      </section>

      {/* Tools and Technologies */}
      <section className="my-8 p-6 bg-orange-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("toolsTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("toolsContent"))
          }} 
        />
      </section>

      {/* ROI and Upsell */}
      <section className="my-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("upsellTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("upsellContent"))
          }} 
        />
        
        {/* Call to Action */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">
            🎯 {t("ctaText")}{" "}
            <Link href={`/${locale}/tools`} className="text-blue-600 hover:underline font-semibold">
              {t("ctaLink")}
            </Link>
          </p>
        </div>
      </section>

      {/* Curify Solution */}
      <section className="my-8 p-6 bg-cyan-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("curifyTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700 mb-4"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("curifyContent"))
          }} 
        />
      </section>

      {/* Conclusion */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("conclusionTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("conclusionContent"))
          }} 
        />
      </section>

      {/* Related Articles */}
      <RelatedBlogs currentSlug="video-transcription-business-guide" locale={locale} />
    </article>
  );
}
