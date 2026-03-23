/** 
 * Video Transcription Technical Deep Dive Blog Post
 * 
 * This component renders a comprehensive technical guide about advanced video transcription,
 * covering WhisperX, audio separation, speaker diarization, and production-grade
 * pipeline architecture with code examples and implementation details.
 */

// Core Next.js and component imports
import Image from "next/image";
import { Metadata } from "next";
import { useTranslations, useLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import CdnImage from "../../../_components/CdnImage";
import RelatedBlogs from "../../../_components/RelatedBlogs";

/**
 * Helper function to convert markdown to HTML
 */
function markdownToHtml(markdown: string): string {
  let html = markdown;
  
  // Handle markdown tables first - simpler and more robust approach
  const tableLines = html.split('\n');
  let inTable = false;
  let tableHtml = '';
  let resultHtml = '';
  
  for (let i = 0; i < tableLines.length; i++) {
    const line = tableLines[i].trim();
    
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        // Start of a new table
        inTable = true;
        const nextLine = tableLines[i + 1]?.trim();
        if (nextLine && nextLine.startsWith('|') && nextLine.includes('-')) {
          // This is a header row
          const headerCells = line.split('|').slice(1, -1).map(cell => cell.trim());
          const headerHtml = headerCells.map((cell: string) => `<th class="px-4 py-2 text-left font-semibold text-gray-800 border-b border-gray-200">${cell}</th>`).join('');
          tableHtml = `<table class="w-full border-collapse border border-gray-300 my-4"><thead><tr>${headerHtml}</tr></thead><tbody>`;
          i++; // Skip the separator line
        } else {
          // Not a proper table header, treat as regular text
          if (tableHtml) {
            tableHtml += '</tbody></table>';
            resultHtml += tableHtml;
            tableHtml = '';
          }
          inTable = false;
          resultHtml += line + '\n';
        }
      } else if (inTable) {
        // Table body row
        const bodyCells = line.split('|').slice(1, -1).map(cell => cell.trim());
        const bodyHtml = bodyCells.map((cell: string) => `<td class="px-4 py-2 text-gray-700 border-b border-gray-100">${cell}</td>`).join('');
        tableHtml += `<tr>${bodyHtml}</tr>`;
      }
    } else if (inTable) {
      // End of table
      inTable = false;
      tableHtml += '</tbody></table>';
      resultHtml += tableHtml + '\n' + line + '\n';
      tableHtml = '';
    } else {
      // Regular text
      resultHtml += line + '\n';
    }
  }
  
  // Handle case where table is at the end
  if (inTable && tableHtml) {
    tableHtml += '</tbody></table>';
    resultHtml += tableHtml;
  }
  
  html = resultHtml.trim();
  
  // Convert **bold** to <strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Convert *italic* to <em>
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Convert newlines to <br> (but not within tables)
  html = html.replace(/\n(?!<)/g, '<br/>');
  
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

// SEO metadata for the blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog.videoTranscriptionTechnicalDeepDive" });

  return {
    title: t("title"),
    description: t("metaDescription"),
    keywords: t("seoKeywords"),
  };
}

/**
 * Helper component to render code blocks with proper styling
 */
function CodeBlock({ children, language = "python" }: { children: string; language?: string }) {
  return (
    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm my-4">
      <code className={`language-${language}`}>
        {children}
      </code>
    </pre>
  );
}

/**
 * Main component for the Video Transcription Technical Deep Dive blog post
 * Uses next-intl for internationalization support
 */
export default function VideoTranscriptionTechnicalDeepDivePost() {
  // Initialize translations for the 'videoTranscriptionTechnicalDeepDive' namespace
  const t = useTranslations("blog.videoTranscriptionTechnicalDeepDive");
  const locale = useLocale();

  return (
    <article className="pt-10 pb-8">
      <h1 className="text-3xl md:text-4xl font-bold mb-6">{t("title")}</h1>
      
      {/* Featured image with floating layout */}
      <div className="float-right ml-6 mb-4 w-1/2">
        <CdnImage
          src="/images/TechicalTranslayion.png"
          alt={t("title")}
          width={600}
          height={400}
          className="rounded-lg shadow-lg"
        />
      </div>

      {/* Introduction */}
      <p className="text-gray-700 mb-6 text-lg">
        {t("intro")}
      </p>

      {/* Evolution of Video Transcription Technology */}
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

      {/* Technical Advantages */}
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

      {/* Advanced Pipeline Architecture */}
      <section className="my-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("howTitle")}
        </h2>
        
        {/* Stage 1 */}
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

        {/* Stage 2 */}
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

        {/* Stage 3 */}
        <div className="mb-6 p-6 bg-pink-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step3Title")}
          </h3>
          <div className="prose prose-lg max-w-none text-gray-700 mb-4">
            {(() => {
              const content = t("step3Content");
              return content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: markdownToHtml(paragraph)
                  }}
                >
                </p>
              ));
            })()}
          </div>
        </div>

        {/* Stage 4 */}
        <div className="mb-6 p-6 bg-indigo-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step4Title")}
          </h3>
          <div className="prose prose-lg max-w-none text-gray-700 mb-4">
            {(() => {
              const content = t("step4Content");
              return content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: markdownToHtml(paragraph)
                  }}
                >
                </p>
              ));
            })()}
          </div>
        </div>

        {/* Stage 5 */}
        <div className="mb-6 p-6 bg-orange-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("step5Title")}
          </h3>
          <div className="prose prose-lg max-w-none text-gray-700 mb-4">
            {(() => {
              const content = t("step5Content");
              return content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: markdownToHtml(paragraph)
                  }}
                >
                </p>
              ));
            })()}
          </div>
        </div>

        {/* Technical Challenges */}
        <div className="mb-6 p-6 bg-red-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("challengesTitle")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("challengesContent"))
            }} 
          />
        </div>

        {/* Production System Design */}
        <div className="mb-6 p-6 bg-cyan-50 rounded-lg">
          <h3 className="text-xl font-bold mb-3 text-gray-800">
            {t("productionTitle")}
          </h3>
          <div 
            className="prose prose-lg max-w-none text-gray-700 mb-4"
            dangerouslySetInnerHTML={{ 
              __html: processContent(t("productionContent"))
            }} 
          />
        </div>
      </section>

      {/* Technical Comparison */}
      <section className="my-8 p-6 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("toolsTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ 
            __html: markdownToHtml(t("toolsContent"))
          }} 
        />
      </section>

      {/* Curify Technical Architecture */}
      <section className="my-8 p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {t("curifyTitle")}
        </h2>
        <div 
          className="prose prose-lg max-w-none text-gray-700 mb-6"
          dangerouslySetInnerHTML={{ 
            __html: processContent(t("curifyContent"))
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
      <RelatedBlogs currentSlug="video-transcription-technical-deep-dive" locale={locale} />
    </article>
  );
}
