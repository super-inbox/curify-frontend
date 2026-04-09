interface AiContentDistributionSystemContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function AiContentDistributionSystemContent({ slug, t, locale }: AiContentDistributionSystemContentProps) {
  const formatContent = (content: string) => {
    return content
      .replace(/\n/g, '<br />')
      .replace(/&lt;b&gt;/g, '<strong>')
      .replace(/&lt;\/b&gt;/g, '</strong>')
      .replace(/&lt;strong&gt;/g, '<strong>')
      .replace(/&lt;\/strong&gt;/g, '</strong>')
      .replace(/<b>/g, '<strong>')
      .replace(/<\/b>/g, '</strong>')
      .replace(/\{strong\}/g, '<strong>')
      .replace(/\{\/strong\}/g, '</strong>')
      .replace(/❌/g, '<span class="text-red-500">❌</span>')
      .replace(/✅/g, '<span class="text-green-500">✅</span>')
      .replace(/👉/g, '<span class="text-blue-500">👉</span>');
  };

  const renderRichContent = (key: string) => {
    // Get the translation - now that we use HTML tags, this should work without errors
    const content = t(key);
    
    return (
      <div 
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ 
          __html: formatContent(content)
        }} 
      />
    );
  };

  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-blue-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("problemTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("problemContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("approachTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("approachContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("step1Title")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("step1Content")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("step2Title")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("step2Content")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("step3Title")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("step3Content")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("step4Title")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("step4Content")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("learningsTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("learningsContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("automationTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("automationContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("feedbackTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("feedbackContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("tryItTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("tryItContent")}
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 Ready to transform your content distribution? <a href="https://www.curify-ai.com/tools/bilingual-subtitles" className="text-blue-600 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">Try Curify's AI Distribution Tools</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("bonusTitle")}</h2>
        <div className="prose prose-lg max-w-none mb-4">
          {renderRichContent("bonusContent")}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div className="prose prose-lg max-w-none">
          {renderRichContent("conclusionContent")}
        </div>
      </section>

      <section className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔍 SEO Keywords</h3>
        <p className="text-sm text-gray-600">{t("seoKeywords")}</p>
      </section>
    </div>
  );
}
