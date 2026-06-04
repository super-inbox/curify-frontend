import BlogInlineClickTracker from "./BlogInlineClickTracker";
import BlogCodeBlockCopyTracker from "./BlogCodeBlockCopyTracker";
import CdnImage from "@/app/[locale]/_components/CdnImage";

interface GenericBlogContentProps {
  hasKey: (key: string) => boolean;
  safeT: (key: string, defaultValue?: string) => string;
  formatContent: (content: string) => string;
  getVideoDubbingUrl: (locale: string) => string;
  locale: string;
  slug: string;  // added 2026-05-30 — needed by BlogInlineClickTracker for per-blog click attribution
}

export default function GenericBlogContent({
  hasKey,
  safeT,
  formatContent,
  getVideoDubbingUrl,
  locale,
  slug,
}: GenericBlogContentProps) {
  // Optional hero + CTA block activates when i18n provides heroImage + heroCtaText + heroCtaHref.
  // Pattern ported from mbti-character-generator (33% engagement vs 0% for plain GenericBlogContent).
  const hasHero = hasKey("heroImage") && hasKey("heroCtaText") && hasKey("heroCtaHref");

  return (
    <BlogInlineClickTracker blogSlug={slug}>
    <BlogCodeBlockCopyTracker blogSlug={slug}>
    <div className="space-y-6">
      {hasHero && (
        <section className="mb-8 not-prose">
          <a
            href={safeT("heroCtaHref")}
            className="block group rounded-xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
          >
            <div className="aspect-[16/9] w-full overflow-hidden bg-gray-100">
              <CdnImage
                src={safeT("heroImage")}
                alt={hasKey("heroImageAlt") ? safeT("heroImageAlt") : safeT("title")}
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
              />
            </div>
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                {hasKey("heroCtaLabel") && (
                  <div className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">
                    {safeT("heroCtaLabel")}
                  </div>
                )}
                <div className="text-base font-semibold text-gray-900 truncate">
                  {safeT("heroCtaText")}
                </div>
              </div>
              <div className="flex-shrink-0 rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-semibold group-hover:bg-blue-700 transition">
                {hasKey("heroCtaButton") ? safeT("heroCtaButton") : "Try it →"}
              </div>
            </div>
          </a>
        </section>
      )}

      <p className="text-lg font-semibold text-blue-600 mb-4">
        {hasKey("intro") ? safeT("intro") : "Introduction"}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{hasKey("whatIsTitle") ? safeT("whatIsTitle") : "What is this?"}</h2>
        <div
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{
            __html: hasKey("whatIsContent") ? formatContent(safeT("whatIsContent")) : "<p>Content description...</p>",
          }}
        />
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
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(safeT("step1Content")) }} />
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{safeT("step2Title")}</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(safeT("step2Content")) }} />
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">{safeT("step3Title")}</h3>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(safeT("step3Content")) }} />
              </div>
              {hasKey("step4Title") && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{safeT("step4Title")}</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(safeT("step4Content")) }} />
                </div>
              )}
              {hasKey("step5Title") && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">{safeT("step5Title")}</h3>
                  <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatContent(safeT("step5Content")) }} />
                </div>
              )}
            </div>
          ) : (
            <div
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{
                __html: hasKey("howContent") ? formatContent(safeT("howContent")) : "<p>Step-by-step process...</p>",
              }}
            />
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
          <div
            className="prose prose-lg max-w-none mb-4"
            dangerouslySetInnerHTML={{
              __html: hasKey("challengesContent") ? formatContent(safeT("challengesContent")) : "<p>Challenges and solutions...</p>",
            }}
          />
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
      </section>

      {(hasKey("conclusionTitle") || hasKey("conclusionContent")) && (
        <section>
          <h2 className="text-2xl font-bold mb-4">{hasKey("conclusionTitle") ? safeT("conclusionTitle") : "Conclusion"}</h2>
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{
              __html: hasKey("conclusionContent") ? formatContent(safeT("conclusionContent")) : "<p>Start your journey with AI-powered content creation tools today.</p>",
            }}
          />
        </section>
      )}
    </div>
    </BlogCodeBlockCopyTracker>
    </BlogInlineClickTracker>
  );
}
