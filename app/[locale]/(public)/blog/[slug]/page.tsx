import Image from "next/image";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/app/[locale]/_components/RelatedBlogs";
import NanoBananaExamples from "./NanoBananaExamples";
import { blogPosts, availableKeys } from "./utils/blog-config";
import { formatContent } from "./utils/content-formatters";
import { getVideoDubbingUrl, getSubtitleGeneratorUrl } from "./utils/blog-helpers";
import YoutubeTranslationContent from "./components/YoutubeTranslationContent";
import VoiceCloningContent from "./components/VoiceCloningContent";
import AslTranslationContent from "./components/AslTranslationContent";
import NanoTemplateContent from "./components/NanoTemplateContent";
import NanoBananaContent from "./components/NanoBananaContent";
import VideoTranscriptionContent from "./components/VideoTranscriptionContent";

// Force dynamic rendering to avoid static generation issues
export const dynamic = 'force-dynamic';


export async function generateStaticParams() {
  return Object.keys(blogPosts).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    return { title: "Blog Post Not Found" };
  }

  try {
    const t = await getTranslations({ locale, namespace: `blog.${blogConfig.namespace}` });
    
    console.log('Namespace:', `blog.${blogConfig.namespace}`);
    console.log('TitleKey:', blogConfig.titleKey);
    console.log('DescriptionKey:', blogConfig.descriptionKey);
    console.log('Available keys:', Object.keys(t));
    
    const metadata: Metadata = {
      title: t(blogConfig.titleKey),
      description: t(blogConfig.descriptionKey),
    };
    
    // Add SEO keywords if available
    if (t.has('seoKeywords')) {
      metadata.keywords = t('seoKeywords');
    }
    
    // Add custom meta description if available (overrides the default description)
    if (t.has('metaDescription')) {
      metadata.description = t('metaDescription');
    }
    
    return metadata;
  } catch (error) {
    // Fallback to English translations if locale translations not found
    try {
      const t = await getTranslations({ locale: 'en', namespace: `blog.${blogConfig.namespace}` });
      
      const metadata: Metadata = {
        title: t(blogConfig.titleKey),
        description: t(blogConfig.descriptionKey),
      };
      
      // Add SEO keywords if available
      if (t.has('seoKeywords')) {
        metadata.keywords = t('seoKeywords');
      }
      
      // Add custom meta description if available (overrides the default description)
      if (t.has('metaDescription')) {
        metadata.description = t('metaDescription');
      }
      
      return metadata;
    } catch (fallbackError) {
      // Final fallback if even English fails
      return {
        title: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: "Learn more about AI-powered content creation tools",
      };
    }
  }
}


export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  
  const blogConfig = blogPosts[slug as keyof typeof blogPosts];
  if (!blogConfig) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: `blog` });

  // Get English fallback translations if current locale is not English
  let tEn = null;
  if (locale !== 'en') {
    try {
      tEn = await getTranslations({ locale: 'en', namespace: `blog` });
    } catch (error) {
      // If English translations fail, we'll use defaults
    }
  }

  // Try to get namespace-specific translations with fallback
  let tNamespace = null;
  try {
    tNamespace = await getTranslations({ locale, namespace: `blog.${blogConfig.namespace}` });
  } catch (error) {
    // Fallback to English if locale translations not found
    try {
      tNamespace = await getTranslations({ locale: 'en', namespace: `blog.${blogConfig.namespace}` });
    } catch (fallbackError) {
      // If even English fails, tNamespace will remain null and we'll use defaults
    }
  }

  const currentKeys = availableKeys[blogConfig.namespace] || [];

  // Safe translation helper that only accesses known keys
  const safeT = (key: string, defaultValue = "") => {
    if (!currentKeys.includes(key)) {
      return defaultValue;
    }
    
    // Use namespace-specific translations if available
    if (tNamespace) {
      try {
        const result = tNamespace(key);
        // If the result is the same as the key, it means translation wasn't found
        if (result === key) {
          return defaultValue;
        }
        return result;
      } catch (error) {
        return defaultValue;
      }
    }
    
    return defaultValue;
  };

  // Helper to check if a translation key exists
  const hasKey = (key: string) => {
    return currentKeys.includes(key);
  };

  return (
    <article className="max-w-5xl pt-20 mx-auto px-6 pb-12 text-[18px] leading-8">
      <div className="mb-8">
        <div className="float-left mr-6 mb-4 max-w-sm rounded-lg overflow-hidden shadow">
          <CdnImage
            src={blogConfig.image}
            alt={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            width={400}
            height={250}
            className="rounded-lg object-cover"
          />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">
          {tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>
        
        <div className="text-gray-600 mb-4">
          {tNamespace ? tNamespace("date", { defaultValue: "Latest Article" }) : "Latest Article"} • {" "}
          {tNamespace ? tNamespace("readTime", { defaultValue: "5 min read" }) : "5 min read"}
        </div>
      </div>

      <div className="clear-both">
        {/* Dynamic content rendering based on slug */}
        {(slug.startsWith('translate-youtube-video') || slug === 'ai-youtube-video-translator' || slug === 'translate-youtube-video-to-english') && (
          <YoutubeTranslationContent slug={slug} t={safeT} locale={locale} />
        )}
        {(slug.startsWith('voice-cloning') || slug === 'what-is-voice-cloning' || slug === 'f5-tts-voice-cloning') && (
          <VoiceCloningContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug.includes('asl') && (
          <AslTranslationContent slug={slug} t={t} tEn={tEn} locale={locale} />
        )}
        {(slug === 'chinese-herbal-medicine-visual-guide' || slug === 'evolution-timelines-visualization' || slug === 'chinese-costume-history-infographic') && (
          <NanoTemplateContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'nano-banana-prompt-ecosystem' && (
          <NanoBananaContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'video-transcription-business-guide' && (
          <VideoTranscriptionContent slug={slug} t={safeT} locale={locale} />
        )}
        
        
        {/* Original blog posts - use generic content renderer */}
        {!slug.startsWith('translate-youtube-video') && 
         slug !== 'ai-youtube-video-translator' && 
         !slug.startsWith('voice-cloning') && 
         slug !== 'what-is-voice-cloning' && 
         slug !== 'f5-tts-voice-cloning' && 
         !slug.includes('asl') &&
         slug !== 'chinese-herbal-medicine-visual-guide' &&
         slug !== 'evolution-timelines-visualization' &&
         slug !== 'chinese-costume-history-infographic' &&
         slug !== 'nano-banana-prompt-ecosystem' &&
         slug !== 'video-transcription-business-guide' && (
          <div className="space-y-6">
            <p className="text-lg font-semibold text-blue-600 mb-4">
              {hasKey("intro") ? safeT("intro") : "Introduction"}
            </p>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("whatIsTitle") ? safeT("whatIsTitle") : "What is this?"}</h2>
              <p className="mb-4">{hasKey("whatIsContent") ? safeT("whatIsContent") : "Content description..."}</p>
            </section>

            {(hasKey("whyTitle") || hasKey("whyContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("whyTitle") ? safeT("whyTitle") : "Why This Matters"}</h2>
                <p className="mb-4">{hasKey("whyContent") ? safeT("whyContent") : "Learn why this topic is important..."}</p>
              </section>
            )}

            {(hasKey("howTitle") || hasKey("howContent") || hasKey("step1Title")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("howTitle") ? safeT("howTitle") : "How It Works"}</h2>
                {hasKey("step1Title") ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step1Title")}</h3>
                      <p>{safeT("step1Content")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
                      <p>{safeT("step2Content")}</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
                      <p>{safeT("step3Content")}</p>
                    </div>
                    {hasKey("step4Title") && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">{safeT("step4Title")}</h3>
                        <p>{safeT("step4Content")}</p>
                      </div>
                    )}
                    {hasKey("step5Title") && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-semibold mb-2">{safeT("step5Title")}</h3>
                        <p>{safeT("step5Content")}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mb-4">{hasKey("howContent") ? safeT("howContent") : "Step-by-step process..."}</p>
                )}
              </section>
            )}

            {(hasKey("howWorksTitle") || hasKey("howWorksContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("howWorksTitle") ? safeT("howWorksTitle") : "How It Works"}</h2>
                <p className="mb-4">{hasKey("howWorksContent") ? safeT("howWorksContent") : "Technical explanation..."}</p>
              </section>
            )}

            {(hasKey("inspirationTitle") || hasKey("inspirationContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("inspirationTitle") ? safeT("inspirationTitle") : "Creative Inspiration"}</h2>
                <p className="mb-4">{hasKey("inspirationContent") ? safeT("inspirationContent") : "Inspiration content..."}</p>
              </section>
            )}

            {(hasKey("featuredTitle") || hasKey("featuredContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("featuredTitle") ? safeT("featuredTitle") : "Featured Inspiration Tools"}</h2>
                <div 
                  className="prose prose-lg max-w-none mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: hasKey("featuredContent") ? `<p>${safeT("featuredContent").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p class="mb-4">').replace(/\n/g, '<br/>')}</p>` : "<p>Featured tools content...</p>"
                  }} 
                />
              </section>
            )}

            {(hasKey("aiTitle") || hasKey("aiContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("aiTitle") ? safeT("aiTitle") : "AI Generation Tools"}</h2>
                <p className="mb-4">{hasKey("aiContent") ? safeT("aiContent") : "AI tools content..."}</p>
              </section>
            )}

            {(hasKey("aiFeaturedTitle") || hasKey("aiFeaturedContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("aiFeaturedTitle") ? safeT("aiFeaturedTitle") : "Featured AI Tools"}</h2>
                <div 
                  className="prose prose-lg max-w-none mb-4"
                  dangerouslySetInnerHTML={{ 
                    __html: hasKey("aiFeaturedContent") ? `<p>${safeT("aiFeaturedContent").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n\n/g, '</p><p class="mb-4">').replace(/\n/g, '<br/>')}</p>` : "<p>Featured AI tools content...</p>"
                  }} 
                />
              </section>
            )}

            {(hasKey("ecosystemTitle") || hasKey("ecosystemContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("ecosystemTitle") ? safeT("ecosystemTitle") : "Ecosystem"}</h2>
                <p className="mb-4">{hasKey("ecosystemContent") ? safeT("ecosystemContent") : "Ecosystem content..."}</p>
              </section>
            )}

            {(hasKey("seoTitle") || hasKey("seoContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("seoTitle") ? safeT("seoTitle") : "SEO & Optimization"}</h2>
                <p className="mb-4">{hasKey("seoContent") ? safeT("seoContent") : "SEO content..."}</p>
              </section>
            )}

            {(hasKey("generatorTitle") || hasKey("generatorContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("generatorTitle") ? safeT("generatorTitle") : "Generator"}</h2>
                <p className="mb-4">{hasKey("generatorContent") ? safeT("generatorContent") : "Generator content..."}</p>
              </section>
            )}

            {(hasKey("useCasesTitle") || hasKey("useCasesContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("useCasesTitle") ? safeT("useCasesTitle") : "Use Cases"}</h2>
                <p className="mb-4">{hasKey("useCasesContent") ? safeT("useCasesContent") : "Common applications..."}</p>
              </section>
            )}

            {(hasKey("ethicalTitle") || hasKey("ethicalContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("ethicalTitle") ? safeT("ethicalTitle") : "Ethical Considerations"}</h2>
                <p className="mb-4">{hasKey("ethicalContent") ? safeT("ethicalContent") : "Important ethical guidelines..."}</p>
              </section>
            )}

            {(hasKey("challengesTitle") || hasKey("challengesContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("challengesTitle") ? safeT("challengesTitle") : "Technical Challenges"}</h2>
                <p className="mb-4">{hasKey("challengesContent") ? safeT("challengesContent") : "Challenges and solutions..."}</p>
              </section>
            )}

            {(hasKey("productionTitle") || hasKey("productionContent")) && (
              <section>
                <h2 className="text-2xl font-bold mb-4">{hasKey("productionTitle") ? safeT("productionTitle") : "Production System Design"}</h2>
                <p className="mb-4">{hasKey("productionContent") ? safeT("productionContent") : "Production considerations..."}</p>
              </section>
            )}

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("toolsTitle") ? safeT("toolsTitle") : "Tools & Resources"}</h2>
              <div 
                className="prose prose-lg max-w-none mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: hasKey("toolsContent") ? formatContent(safeT("toolsContent")) : "<p>Learn about the best tools available...</p>"
                }} 
              />
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("curifyTitle") ? safeT("curifyTitle") : "How Curify Can Help"}</h2>
              <div 
                className="prose prose-lg max-w-none mb-4"
                dangerouslySetInnerHTML={{ 
                  __html: hasKey("curifyContent") ? formatContent(safeT("curifyContent")) : "<p>Curify offers comprehensive solutions for content creators...</p>"
                }} 
              />
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  🎯 {hasKey("ctaText") ? safeT("ctaText") : "Ready to get started?"} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{hasKey("ctaLink") ? safeT("ctaLink") : "Try Curify's Tools"}</a>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">{hasKey("conclusionTitle") ? safeT("conclusionTitle") : "Conclusion"}</h2>
              <p>{hasKey("conclusionContent") ? safeT("conclusionContent") : "Start your journey with AI-powered content creation tools today."}</p>
            </section>
          </div>
        )}
      </div>

      {/* Related Blogs */}
      <RelatedBlogs currentSlug={slug} locale={locale} />

    </article>
  );
}

