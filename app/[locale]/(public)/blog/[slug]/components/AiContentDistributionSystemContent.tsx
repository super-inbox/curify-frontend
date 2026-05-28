import { MermaidChart } from './MermaidChart';

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
        
        <div className="bg-gray-50 p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-4">Four stages, one loop</h3>
          <MermaidChart
            chart={`flowchart LR
    A[1. Format Adaptation] --> B[2. Niche-First Distribution]
    B --> C[3. Performance Instrumentation]
    C --> D[4. Feedback into Next Batch]
    D --> A
    style A fill:#e0e7ff,stroke:#6366f1
    style B fill:#dbeafe,stroke:#3b82f6
    style C fill:#fce7f3,stroke:#ec4899
    style D fill:#dcfce7,stroke:#16a34a`}
            id="ai-content-distribution-pipeline"
          />
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
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 Ready to ship the same pipeline at agency scale? <a href={`/${locale}/use-cases/for-marketers`} className="text-blue-600 hover:underline font-semibold">Read the Growth Agencies playbook →</a>
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">{t("conclusionTitle")}</h2>
        <div className="prose prose-lg max-w-none">
          {renderRichContent("conclusionContent")}
        </div>
      </section>
    </div>
  );
}
