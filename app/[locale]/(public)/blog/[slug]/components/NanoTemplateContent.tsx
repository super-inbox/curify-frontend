import { getTemplateUrl } from "../utils/blog-helpers";
import { formatNanoTemplateContent } from "../utils/content-formatters";

interface NanoTemplateContentProps {
  slug: string;
  t: any;
  locale: string;
}

export default function NanoTemplateContent({ slug, t, locale }: NanoTemplateContentProps) {
  return (
    <div className="space-y-6">
      <p className="text-lg font-semibold text-green-600 mb-4">
        {t("intro")}
      </p>
      
      <section>
        <h2 className="text-2xl font-bold mb-4">{t("whatIsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoTemplateContent(t("whatIsContent"))
          }} 
        />
      </section>

      {(slug === 'chinese-herbal-medicine-visual-guide') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("historyTitle")}</h2>
            <p className="mb-4">{t("historyContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("benefitsTitle")}</h2>
            <p className="mb-4">{t("benefitsContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("popularTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("popularContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("usageTitle")}</h2>
            <p className="mb-4">{t("usageContent")}</p>
          </section>
        </>
      )}

      {(slug === 'evolution-timelines-visualization') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("importanceTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("importanceContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("techniquesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("techniquesContent"))
              }} 
            />
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("examplesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("examplesContent"))
              }} 
            />
          </section>
        </>
      )}

      {(slug === 'chinese-costume-history-infographic') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("dynastiesTitle")}</h2>
            <p className="mb-4">{t("dynastiesContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("characteristicsTitle")}</h2>
            <p className="mb-4">{t("characteristicsContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("modernTitle")}</h2>
            <p className="mb-4">{t("modernContent")}</p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("culturalTitle")}</h2>
            <p className="mb-4">{t("culturalContent")}</p>
          </section>
        </>
      )}

      {(slug === 'nano-banana-prompt-ecosystem') && (
        <>
          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptFirstTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptFirstContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("bestImagePromptsTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("bestImagePromptsContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptsByCategoryTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptsByCategoryContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("howToWritePromptsTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("howToWritePromptsContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("ecosystemTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("ecosystemContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("seoTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("seoContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("generatorTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("generatorContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("useCasesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("useCasesContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("integrationTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("integrationContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("communityTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("communityContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptGuideTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptGuideContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptStructureTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptStructureContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptExamplesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptExamplesContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptTemplatesTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptTemplatesContent"))
              }} 
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">{t("promptGenerationTitle")}</h2>
            <div 
              className="prose prose-lg max-w-none mb-4"
              dangerouslySetInnerHTML={{ 
                __html: formatNanoTemplateContent(t("promptGenerationContent"))
              }} 
            />
          </section>
        </>
      )}

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("toolsTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none mb-4"
          dangerouslySetInnerHTML={{ 
            __html: formatNanoTemplateContent(t("toolsContent"))
          }} 
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("curifyTitle")}</h2>
        <p className="mb-4">{t("curifyContent")}</p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText")} <a href={getTemplateUrl(slug, locale)} className="text-blue-600 hover:underline font-semibold">{t("ctaLink")}</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ 
            __html: t("conclusionContent")
              .replace(/## (.+)/g, '<h3 class="text-xl font-semibold mt-6 mb-3">$1</h3>')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/- \*\*Individual Herb Resources\*\*:/g, '<li><strong>Individual Herb Resources:</strong><ul class="list-disc pl-6 ml-4 mt-2 mb-2">')
              .replace(/- \*\*Research Reviews\*\*:/g, '<li><strong>Research Reviews:</strong><ul class="list-disc pl-6 ml-4 mt-2 mb-2">')
              .replace(/    - (.+)/g, '<li class="ml-6 text-sm">$1</li>')
              .replace(/^- (.+)(?!\n    -)/gm, '<li class="mb-1">$1</li></ul>')
              .replace(/\n\n/g, '<br /><br />')
          }}
        />
      </section>
    </div>
  );
}
