import Image from "next/image";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import CdnImage from "@/app/[locale]/_components/CdnImage";
import { notFound } from "next/navigation";
import RelatedBlogs from "@/app/[locale]/_components/RelatedBlogs";
import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import WorldCupCalendarCard from "@/app/[locale]/_components/WorldCupCalendarCard";
import NanoBananaExamples from "./NanoBananaExamples";
import CodeBlockCopyButtons from "./components/CodeBlockCopyButtons";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";

// WC-themed blog posts that surface the calendar widget between the
// body and the bottom CTA. Reader-mindset placement — the reader has
// finished the post and is in a "what next" moment; calendar drives
// to /topics/world-cup. Auto-hides via the widget's own
// tournamentPhase("after") guard once the tournament ends.
const WC_BLOG_SLUGS = new Set([
  "world-cup-2026-top-contenders",
  "world-cup-2026-ai-prompt-hub",
  "fifa-2026-host-city-travel-guide",
  "argentina-france-2022-world-cup-final",
  "brazil-argentina-soccer-poster-prompts",
  "france-soccer-poster-prompts",
  "portugal-soccer-poster-prompts",
  "ai-1v1-soccer-rivalry-prompts",
]);

// Per-WC-slug → topic page slug. Country-specific posts route to their
// country-WC topic page; multi-country / generic posts route to the
// parent /topics/world-cup hub. Added 2026-06-09 to make WC blog hero
// images clickable through to the topic page (deeper-conversion
// surface — the topic has gallery + templates + cross-blog links).
const WC_BLOG_HERO_TOPIC: Record<string, string> = {
  "world-cup-2026-top-contenders": "world-cup",
  "world-cup-2026-ai-prompt-hub": "world-cup",
  "fifa-2026-host-city-travel-guide": "world-cup",
  "argentina-france-2022-world-cup-final": "world-cup",
  "brazil-argentina-soccer-poster-prompts": "world-cup",
  "france-soccer-poster-prompts": "france-world-cup",
  "portugal-soccer-poster-prompts": "portugal-world-cup",
  "ai-1v1-soccer-rivalry-prompts": "world-cup",
};
import { blogPosts, availableKeys } from "./utils/blog-config";
import { formatContent } from "./utils/content-formatters";
import { getVideoDubbingUrl, getSubtitleGeneratorUrl } from "./utils/blog-helpers";
import { DynamicThumbnail } from "./components/DynamicThumbnail";
import YoutubeTranslationContent from "./components/YoutubeTranslationContent";
import VoiceCloningContent from "./components/VoiceCloningContent";
import VoiceCloningToolsContent from "./components/VoiceCloningToolsContent";
import AslTranslationContent from "./components/AslTranslationContent";
import NanoTemplateContent from "./components/NanoTemplateContent";
import NanoBananaContent from "./components/NanoBananaContent";
import VideoTranscriptionContent from "./components/VideoTranscriptionContent";
import TenPromptingTipsNanoBananaContent from "./components/TenPromptingTipsNanoBananaContent";
import TenPromptingTipsVideoGenerationContent from "./components/TenPromptingTipsVideoGenerationContent";
import LipSyncContent from "./components/LipSyncContent";
import LipSyncTechnicalContent from "./components/LipSyncTechnicalContent";
import ImageGenerationModelComparisonContent from "./components/ImageGenerationModelComparisonContent";
import AiContentDistributionSystemContent from "./components/AiContentDistributionSystemContent";
import InfographicContent from "./components/InfographicContent";
import ImageToNarrativeVideoContent from "./components/ImageToNarrativeVideoContent";
import SeriesInfographicVsNotebookLMContent from "./components/SeriesInfographicVsNotebookLMContent";
import GenericBlogContent from "./components/GenericBlogContent";
import MBTICharacterGeneratorContent from "./components/MBTICharacterGeneratorContent";
import ContentTaggingSystemContent from "./components/ContentTaggingSystemContent";
import BilingualFlashcardsContent from "./components/BilingualFlashcardsContent";
import UGCVideoTranslationContent from "./components/UGCVideoTranslationContent";
import AIFacelessChannelPipelineWrapper from './components/AIFacelessChannelPipelineWrapper';
import blogsData from "@/public/data/blogs.json";
import nanoInspirationData from "@/public/data/nano_inspiration.json";

// Build example_id → template_id lookup at module init (server-component
// load = once per deploy). Lets the hero auto-deriver below resolve any
// /images/nano_insp/<example-id>.jpg URL to /nano-template/<slug>/example/
// <example-id> with no per-blog config. Catalog is ~2,900 entries today
// so the Map is small.
const NANO_EXAMPLE_TO_TEMPLATE: Map<string, string> = new Map(
  (nanoInspirationData as Array<{ id?: string; template_id?: string }>)
    .filter((e) => !!e?.id && !!e?.template_id)
    .map((e) => [e.id as string, e.template_id as string]),
);
function deriveHeroLinkFromImage(imageSrc: string | undefined): string | null {
  if (!imageSrc) return null;
  const m = imageSrc.match(/^\/images\/nano_insp\/(template-[^/]+)\.jpg$/);
  if (!m) return null;
  const exampleId = m[1];
  const templateId = NANO_EXAMPLE_TO_TEMPLATE.get(exampleId);
  if (!templateId) return null;
  const templateSlug = templateId.replace(/^template-/, "");
  return `/nano-template/${templateSlug}/example/${exampleId}`;
}
import { routing } from "@/i18n/routing";
import { getCanonicalUrl, getLanguagesMap } from "@/lib/canonical";

// Bundled-data page (blogPosts/blogsData + i18n) -> prerender per locale x slug
// and serve from the edge cache instead of re-rendering on every hit. Must
// enumerate BOTH params so all locales prerender (slug-only would leave non-en
// locales on-demand). Cached until next deploy. Previously force-dynamic.
// NOTE: this page sets its own canonical + hreflang below (it didn't before —
// it relied on the shared layout, which only produces a correct canonical when
// rendered dynamically). The values match what the layout emitted, so SEO is
// unchanged.
export const revalidate = false;
export async function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    Object.keys(blogPosts).map((slug) => ({ locale, slug })),
  );
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

  // Per-locale canonical + hreflang, derived from params (NOT request headers),
  // so the output is identical whether this page is prerendered or dynamic.
  // Matches what the shared layout previously emitted for /blog/<slug>.
  const alternates = {
    canonical: getCanonicalUrl(locale, `/blog/${slug}`),
    languages: getLanguagesMap(`/blog/${slug}`),
  };

  try {
    const t = await getTranslations({ locale, namespace: `blog.${blogConfig.namespace}` });
    
    // Check if the namespace actually has the expected keys
    const hasTitle = t.has(blogConfig.titleKey);
    const hasDescription = t.has(blogConfig.descriptionKey);
    
    if (!hasTitle || !hasDescription) {
      console.warn(`Missing translation keys in namespace blog.${blogConfig.namespace}:`, {
        hasTitle,
        hasDescription,
        availableKeys: Object.keys(t).filter(k => !['rich', 'markup', 'raw', 'has'].includes(k))
      });
    }
    
    const metadata: Metadata = {
      title: t(blogConfig.titleKey),
      description: t(blogConfig.descriptionKey),
      alternates,
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
        alternates,
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
        alternates,
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

  // Find the full blog data to check for useMermaidThumbnail
  const blogData = blogsData.find((blog: any) => blog.slug === slug) as any;
  const useMermaidThumbnail = blogData?.useMermaidThumbnail || false;
  const thumbnailType = blogData?.thumbnailType || '';

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

  // Safe translation helper that only accesses known keys. Accepts either a
  // plain string default (legacy callers) or a next-intl-style options object
  // `{ defaultValue: ... }`. Content components in this directory commonly use
  // the options-object form to gate conditional rendering — e.g.
  // `t("step4Title", { defaultValue: null }) && <Card />`. Without the unwrap
  // below, missing keys returned the entire options object (truthy), causing
  // empty step/section cards to render on posts that didn't define those keys.
  const safeT = (key: string, defaultValueOrOptions: string | { defaultValue: unknown } = ""): string => {
    const resolvedDefault =
      defaultValueOrOptions && typeof defaultValueOrOptions === "object" && "defaultValue" in defaultValueOrOptions
        ? defaultValueOrOptions.defaultValue
        : defaultValueOrOptions;

    if (!currentKeys.includes(key)) {
      // Cast preserves the consumer prop signature `(key, default?) => string`.
      // When callers passed `{ defaultValue: null }` for conditional gating,
      // the unwrapped null returns and is still falsy in JSX truthiness checks.
      return resolvedDefault as string;
    }

    // Use namespace-specific translations if available
    if (tNamespace) {
      try {
        const result = tNamespace(key);
        // If the result is the same as the key, it means translation wasn't found
        if (result === key) {
          return resolvedDefault as string;
        }
        return result;
      } catch (error) {
        return resolvedDefault as string;
      }
    }

    return resolvedDefault as string;
  };

  // Helper to check if a translation key exists
  const hasKey = (key: string) => {
    return currentKeys.includes(key);
  };

  // Pre-load array data for the component
  let arrayData: Record<string, any> = {};
  try {
    // Try to load the current locale data
    const currentLocaleData = await import(`@/messages/${locale}/blog.json`) as { default: Record<string, any> };
    const currentNamespace = currentLocaleData.default[blogConfig.namespace];
    if (currentNamespace) {
      // Extract only array keys and special HTML content keys
      const arrayKeys = currentKeys.filter(key => 
        key.includes('Steps') || 
        key.includes('Features') || 
        key.includes('Checklist') || 
        key.includes('Tasks') || 
        key.includes('Content') || 
        key.includes('Table') ||
        key.includes('TemplateDisplay')
      );
      arrayKeys.forEach(key => {
        if (currentNamespace[key]) {
          arrayData[key] = currentNamespace[key];
        }
      });
    }
  } catch (error) {
    // If loading current locale fails, try English fallback
    try {
      const englishData = await import(`@/messages/en/blog.json`) as { default: Record<string, any> };
      const englishNamespace = englishData.default[blogConfig.namespace];
      if (englishNamespace) {
        // Extract only array keys and special HTML content keys
        const arrayKeys = currentKeys.filter(key => 
          key.includes('Steps') || 
          key.includes('Features') || 
          key.includes('Checklist') || 
          key.includes('Tasks') || 
          key.includes('Content') || 
          key.includes('Table') ||
          key.includes('TemplateDisplay')
        );
        arrayKeys.forEach(key => {
          if (englishNamespace[key]) {
            arrayData[key] = englishNamespace[key];
          }
        });
      }
    } catch (fallbackError) {
      // If even English fails, arrayData remains empty
    }
  }

  return (
    <article className="mx-auto xl:ml-16 xl:mr-64 max-w-6xl pt-4 pb-12 text-[18px] leading-8 px-4 md:px-8 lg:px-10">
      <AutoTableOfContents />

      <header className="mb-6">
        <BlogCategoryLabel category={blogConfig.category} />
        <h1 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
          {tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h1>

        <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
          <div>
            {tNamespace ? tNamespace(slug === 'mbti-character-generator' || slug === 'content-tagging-system' ? "publishedDate" : "date", { defaultValue: "Latest Article" }) : "Latest Article"} • {" "}
            {tNamespace ? tNamespace("readTime", { defaultValue: "5 min read" }) : "5 min read"}
          </div>
          <ShareButton url={`/blog/${slug}`} compact />
        </div>
      </header>

      {/* Examples surfaced near the TOP for WC poster posts — visual-first,
          with a generate path above the fold. These posts are ~70% of blog DAU
          and ~88% bounce; the example cards otherwise render only at the bottom
          after ~2,000 words. Moved here (not duplicated) — the bottom render
          skips these slugs. See docs/dau-activation-analysis-2026-06-12.md. */}
      {blogData?.nanoTemplates?.length > 0 && WC_BLOG_SLUGS.has(slug) && (
        <div className="mb-8">
          <NanoBananaExamples locale={locale} blogSlug={slug} />
        </div>
      )}

      {/* Body region with hero image floated right on desktop so text
          wraps around it. On mobile the image renders centered above the
          body in normal block flow. overflow-hidden on the wrapper acts
          as a clearfix for the float. */}
      <div className="overflow-hidden">
        {/* Hero is adaptive to source aspect ratio — no forced shape,
            no cropping. Wrapper provides max width (max-w-lg/xl) +
            max height (max-h-96 = 384px) constraints. The image renders
            at its natural aspect, shrinking proportionally whichever
            constraint hits first:
              - horizontal 16:9 → fills width (576px × 324px on desktop)
              - 3:4 vertical → fills height (288px × 384px on desktop)
              - 1:1 square → fills height (384px × 384px on desktop)
            Visual area roughly matched across orientations; nothing is
            cropped. */}
        <div className="mb-4 mx-auto max-w-lg md:max-w-xl md:float-right md:ml-6 md:mx-0 flex items-center justify-center">
          {/* WC blogs: wrap hero in a link to the most relevant WC topic
              page (parent /topics/world-cup or country-specific). Hero is
              the largest clickable surface on the article, so this
              promotes the topic page as the natural next step. Added
              2026-06-09. */}
          {(() => {
            const heroNode = useMermaidThumbnail ? (
              <DynamicThumbnail
                slug={thumbnailType || slug}
                title={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                category={blogConfig.category}
                existingImage={blogConfig.image}
                forceType="mermaid"
              />
            ) : (
              <CdnImage
                src={blogConfig.image}
                alt={tNamespace ? tNamespace(blogConfig.titleKey) : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                width={672}
                height={448}
                className="block max-w-full max-h-96 w-auto h-auto rounded-lg shadow hover:opacity-90 transition-opacity"
              />
            );
            const wcTopic = WC_BLOG_HERO_TOPIC[slug];
            // Hero link resolution order (2026-06-12):
            // 1. WC blog → /topics/<wcTopic> (high-CVR jump to the topic page)
            // 2. blogs.json entry has an explicit heroLink field — use it
            // 3. Auto-derive from blogConfig.image when it points at
            //    /images/nano_insp/<example-id>.jpg — lookup the template
            //    via NANO_EXAMPLE_TO_TEMPLATE and route to the example page.
            //    Covers the existing catalog retroactively with no per-blog
            //    blogs.json edits.
            // 4. Fall through to non-linked hero.
            const explicitHero = (blogData as { heroLink?: string } | undefined)?.heroLink;
            const autoHero = deriveHeroLinkFromImage(blogConfig.image);
            const heroHref = wcTopic
              ? `/${locale}/topics/${wcTopic}`
              : (explicitHero ? `/${locale}${explicitHero}`
                 : (autoHero ? `/${locale}${autoHero}` : null));
            if (heroHref) {
              return (
                <a href={heroHref} className="relative block group">
                  {heroNode}
                  {/* Hover affordance — corner arrow badge fades in on
                      hover. Universal "click to navigate" cue, no
                      translation needed. pointer-events-none so it
                      doesn't intercept the link click. */}
                  <span
                    className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-200 pointer-events-none"
                    aria-hidden="true"
                  >
                    <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </span>
                </a>
              );
            }
            return heroNode;
          })()}
        </div>

        {/* Dynamic content rendering based on slug */}
        {(slug.startsWith('translate-youtube-video') || slug === 'ai-youtube-video-translator' || slug === 'translate-youtube-video-to-english') && (
          <YoutubeTranslationContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'voice-cloning-tools' && (
          <VoiceCloningToolsContent slug={slug} t={safeT} locale={locale} />
        )}
        {((slug.startsWith('voice-cloning') && slug !== 'voice-cloning-tools') || slug === 'what-is-voice-cloning' || slug === 'f5-tts-voice-cloning') && (
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
        {slug === '10-prompting-tips-nano-banana' && (
          <TenPromptingTipsNanoBananaContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'curify-nano-banana-template-tips' && (
          <TenPromptingTipsNanoBananaContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === '10-prompting-tips-video-generation' && (
          <TenPromptingTipsVideoGenerationContent slug={slug} t={safeT} arrayData={arrayData} locale={locale} />
        )}
        {slug === 'lip-sync-business-guide' && (
          <LipSyncContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'lip-sync-technical-deep-dive' && (
          <LipSyncTechnicalContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'image-generation-model-comparison' && (
          <ImageGenerationModelComparisonContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'ai-content-distribution-system' && (
          <AiContentDistributionSystemContent slug={slug} t={tNamespace || safeT} locale={locale} />
        )}
        {slug === 'what-is-infographics' && (
          <InfographicContent slug={slug} t={safeT} locale={locale} arrayData={arrayData} />
        )}
        {slug === 'image-to-narrative-video' && (
          <ImageToNarrativeVideoContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'series-infographic-vs-notebooklm' && (
          <SeriesInfographicVsNotebookLMContent slug={slug} t={safeT} locale={locale} />
        )}
        {slug === 'mbti-character-generator' && (
          <MBTICharacterGeneratorContent tNamespace={tNamespace} />
        )}
        {slug === 'content-tagging-system' && (
          <ContentTaggingSystemContent tNamespace={tNamespace} />
        )}
        {slug === 'bilingual-ai-flashcards-early-childhood-education' && (
          <BilingualFlashcardsContent 
            hasKey={hasKey}
            safeT={safeT}
            formatContent={formatContent}
            getVideoDubbingUrl={getVideoDubbingUrl}
            locale={locale}
          />
        )}
        {slug === 'ugc-video-translation-scaling-tiktoks-shorts-global-markets' && (
          <UGCVideoTranslationContent
            hasKey={hasKey}
            safeT={safeT}
            formatContent={formatContent}
            getVideoDubbingUrl={getVideoDubbingUrl}
            locale={locale}
          />
        )}
        {slug === 'ai-faceless-channel-pipeline' && (
          <AIFacelessChannelPipelineWrapper slug={slug} t={safeT} locale={locale} />
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
         slug !== 'video-transcription-business-guide' &&
         slug !== '10-prompting-tips-nano-banana' &&
         slug !== '10-prompting-tips-video-generation' &&
         slug !== 'ai-faceless-channel-pipeline' &&
         slug !== 'bilingual-ai-flashcards-early-childhood-education' &&
         slug !== 'ugc-video-translation-scaling-tiktoks-shorts-global-markets' &&
         slug !== 'lip-sync-business-guide' &&
         slug !== 'lip-sync-technical-deep-dive' &&
         slug !== 'image-generation-model-comparison' &&
         slug !== 'ai-content-distribution-system' &&
         slug !== 'what-is-infographics' &&
         slug !== 'image-to-narrative-video' &&
         slug !== 'series-infographic-vs-notebooklm' &&
         slug !== 'mbti-character-generator' &&
         slug !== 'content-tagging-system' && (
          <GenericBlogContent
            hasKey={hasKey}
            safeT={safeT}
            formatContent={formatContent}
            getVideoDubbingUrl={getVideoDubbingUrl}
            locale={locale}
            slug={slug}
          />
        )}
      </div>

      {/* Adds a "Copy prompt" button to each <pre> prompt block (client-side,
          post-hydration) — the copy-prompt escape hatch for blog readers. */}
      <CodeBlockCopyButtons />

      {/* Optional template row — renders when the catalog entry has
          `nanoTemplates`. Filters by groupKey prefix so each post only
          surfaces the cards keyed to its own slug. WC poster posts render this
          near the top instead (above), so skip the bottom copy for them. */}
      {blogData?.nanoTemplates?.length > 0 && !WC_BLOG_SLUGS.has(slug) && (
        <NanoBananaExamples locale={locale} blogSlug={slug} />
      )}

      {/* WC 2026 calendar widget — surfaced on WC-themed blog posts
          (8 slugs in WC_BLOG_SLUGS) between the body and the bottom
          CTA. Wrapped at max-w-md to match blog reading column;
          card-sized otherwise. Auto-hides after July 19, 2026. */}
      {WC_BLOG_SLUGS.has(slug) && (
        <div className="my-8 max-w-md mx-auto px-4">
          <WorldCupCalendarCard locale={locale} />
        </div>
      )}

      {/* Unified CTA — picks the right tool / coaching / contact target based
          on the post's category, with a per-slug override for creator-tools
          posts that map to a specific tool. Single source of truth for the
          bottom-of-post CTA; the duplicate in-body strips that used to sit
          right above this have been stripped from the content components. */}
      {blogConfig.category && (
        <BlogCTACard
          category={blogConfig.category}
          slug={slug}
          locale={locale}
        />
      )}

      {/* Related Blogs */}
      <RelatedBlogs currentSlug={slug} locale={locale} />

    </article>
  );
}

