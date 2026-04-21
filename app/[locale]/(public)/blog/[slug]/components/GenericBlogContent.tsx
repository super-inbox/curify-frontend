interface GenericBlogContentProps {
  hasKey: (key: string) => boolean;
  safeT: (key: string, defaultValue?: string) => string;
  formatContent: (content: string) => string;
  getVideoDubbingUrl: (locale: string) => string;
  locale: string;
}

export default function GenericBlogContent({ 
  hasKey, 
  safeT, 
  formatContent, 
  getVideoDubbingUrl, 
  locale 
}: GenericBlogContentProps) {
  return (
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
            ð¯ {hasKey("ctaText") ? safeT("ctaText") : "Ready to get started?"} <a href={getVideoDubbingUrl(locale)} className="text-blue-600 hover:underline font-semibold">{hasKey("ctaLink") ? safeT("ctaLink") : "Try Curify's Tools"}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{hasKey("conclusionTitle") ? safeT("conclusionTitle") : "Conclusion"}</h2>
        <p>{hasKey("conclusionContent") ? safeT("conclusionContent") : "Start your journey with AI-powered content creation tools today."}</p>
      </section>
    </div>
  );
}
