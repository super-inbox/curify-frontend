import PromptBox from './PromptBox';

interface SeriesInfographicVsNotebookLMContentProps {
  slug: string;
  t: (key: string, defaultValue?: string) => string;
  locale: string;
}

export default function SeriesInfographicVsNotebookLMContent({ slug, t, locale }: SeriesInfographicVsNotebookLMContentProps) {
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

  const comparisonData = [
    {
      category: t("category1", "Content Format"),
      infographic: t("infographic1", "Visual cards with structured information"),
      notebooklm: t("notebooklm1", "Audio overviews and text summaries")
    },
    {
      category: t("category2", "Learning Style"),
      infographic: t("infographic2", "Visual learners - scanable, bite-sized"),
      notebooklm: t("notebooklm2", "Auditory/text learners - narrative format")
    },
    {
      category: t("category3", "Information Density"),
      infographic: t("infographic3", "High density, visually organized"),
      notebooklm: t("notebooklm3", "Medium density, linear narrative")
    },
    {
      category: t("category4", "Use Case"),
      infographic: t("infographic4", "Quick reference, social sharing, posters"),
      notebooklm: t("notebooklm4", "Deep research, study sessions, podcasts")
    },
    {
      category: t("category5", "Production Speed"),
      infographic: t("infographic5", "Fast with AI templates (Nano Banana)"),
      notebooklm: t("notebooklm5", "Fast for audio, slower for complex visuals")
    },
    {
      category: t("category6", "Customization"),
      infographic: t("infographic6", "Highly customizable design and layout"),
      notebooklm: t("notebooklm6", "Limited customization, AI-generated format")
    }
  ];

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {t("introTitle", "Series Infographics vs Google NotebookLM: A Visual vs Narrative Approach")}
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {t("introContent", "When it comes to transforming complex information into digestible formats, two powerful approaches have emerged: series infographics (powered by tools like Nano Banana) and Google NotebookLM's AI-generated audio overviews. Both serve the same fundamental purpose—making complex information accessible—but they take radically different paths. Let's explore when to use each, and how they can complement each other in your content strategy.")}
        </p>
      </section>

      {/* What is Series Infographics */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whatIsInfographicTitle", "What Are Series Infographics?")}
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-700 mb-4">
            {t("whatIsInfographicContent", "Series infographics are structured visual presentations that break down complex topics into a sequence of related visual cards. Each card focuses on a specific aspect, creating a coherent narrative through visual design. Think of them as visual storyboards or educational comic strips that can be shared digitally (social media, blogs) or printed (posters, exhibitions).")}
          </p>
          <div className="bg-blue-50 p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t("exampleTitle", "Example: Microsoft AI Dilemma Series")}
            </h4>
            <p className="text-blue-700">
              {t("exampleContent", "A series infographic exploring Microsoft's AI strategy might include: Card 1 (Cover), Card 2 (Performance vs Stock), Card 3 (Market Position), Card 4 (Future Outlook). Each card is visually consistent but tells a specific part of the story.")}
            </p>
          </div>
        </div>
      </section>

      {/* What is Google NotebookLM */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whatIsNotebookLMTitle", "What is Google NotebookLM?")}
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-700 mb-4">
            {t("whatIsNotebookLMContent", "Google NotebookLM is an AI-powered research assistant that takes your documents, notes, and sources and generates audio overviews (podcast-style conversations) and text summaries. It uses AI to synthesize information and present it in a conversational, narrative format—like having two experts discuss your topic.")}
          </p>
          <div className="bg-green-50 p-4 rounded-lg mt-4">
            <h4 className="font-semibold text-green-800 mb-2">
              {t("notebookLMExampleTitle", "Example: AI Research Paper Overview")}
            </h4>
            <p className="text-green-700">
              {t("notebookLMExampleContent", "Upload a research paper about AI ethics, and NotebookLM generates a 10-minute audio overview where two AI hosts discuss the key findings, implications, and takeaways in natural conversation.")}
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("comparisonTitle", "Head-to-Head Comparison")}
        </h3>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("categoryHeader", "Category")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("infographicHeader", "Series Infographics")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("notebookLMHeader", "Google NotebookLM")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {comparisonData.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.infographic}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {row.notebooklm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* When to Use Series Infographics */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whenUseInfographicTitle", "When to Use Series Infographics")}
        </h3>
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("useCase1Title", "Social Media Content")}</h4>
            <p className="text-gray-600">{t("useCase1Content", "Perfect for Instagram carousels, Twitter threads, and LinkedIn posts where visual impact and shareability matter.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("useCase2Title", "Educational Materials")}</h4>
            <p className="text-gray-600">{t("useCase2Content", "Ideal for classroom posters, study guides, and educational content where students need to scan and review information quickly.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("useCase3Title", "Business Presentations")}</h4>
            <p className="text-gray-600">{t("useCase3Content", "Great for slide decks, annual reports, and marketing materials where visual hierarchy and professional design are crucial.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-orange-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("useCase4Title", "Physical Artifacts")}</h4>
            <p className="text-gray-600">{t("useCase4Content", "Excellent for posters, exhibition displays, and printed materials that need to work in physical spaces.")}</p>
          </div>
        </div>
      </section>

      {/* When to Use NotebookLM */}
      <section className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("whenUseNotebookLMTitle", "When to Use Google NotebookLM")}
        </h3>
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("notebookUseCase1Title", "Research Deep Dives")}</h4>
            <p className="text-gray-600">{t("notebookUseCase1Content", "Perfect for academic research, literature reviews, and complex topic exploration where narrative explanation helps understanding.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("notebookUseCase2Title", "Audio Learning")}</h4>
            <p className="text-gray-600">{t("notebookUseCase2Content", "Ideal for podcast-style learning, commutes, and situations where listening is more convenient than reading.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("notebookUseCase3Title", "Quick Summaries")}</h4>
            <p className="text-gray-600">{t("notebookUseCase3Content", "Great for getting the gist of long documents, meeting notes, or reports without reading every word.")}</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-teal-200">
            <h4 className="font-semibold text-lg mb-2 text-gray-800">{t("notebookUseCase4Title", "Study Sessions")}</h4>
            <p className="text-gray-600">{t("notebookUseCase4Content", "Excellent for students reviewing materials through audio, reinforcing learning through different modalities.")}</p>
          </div>
        </div>
      </section>

      {/* Combining Both */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("combineTitle", "The Power of Combining Both Approaches")}
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-700 mb-4">
            {t("combineContent", "The real magic happens when you use both approaches together. Here's a workflow that leverages the strengths of each:")}
          </p>
          <div className="space-y-3">
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">1</span>
              <p className="text-gray-700">{t("step1", "Start with NotebookLM to generate an audio overview and understand the key points of your source material.")}</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">2</span>
              <p className="text-gray-700">{t("step2", "Extract the main themes and structure from the NotebookLM output to plan your infographic series.")}</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">3</span>
              <p className="text-gray-700">{t("step3", "Use Nano Banana prompts to create visually stunning series infographics based on that structure.")}</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">4</span>
              <p className="text-gray-700">{t("step4", "Distribute both formats: audio for podcasts and deep learners, infographics for social media and visual learners.")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Prompt Example */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("promptExampleTitle", "Nano Banana Prompt for Series Infographics")}
        </h3>
        <PromptBox
          title={t("promptTitle", "Series Infographic: Microsoft AI Dilemma")}
          promptText={`Create a series infographic about [TOPIC] with the following cards:

Card 1 - Cover:
- Eye-catching title and subtitle
- Key visual representing the core theme
- Author/source attribution
- Professional color scheme

Card 2 - Problem Statement:
- Clear definition of the issue
- Data visualization showing scale
- Key statistics and metrics
- Visual hierarchy for easy scanning

Card 3 - Analysis/Comparison:
- Side-by-side comparison layout
- Performance metrics visualization
- Market position indicators
- Trend lines or charts

Card 4 - Implications:
- Future outlook visualization
- Impact assessment
- Key takeaways
- Call to action

Style: Professional, data-driven, consistent across all cards with cohesive branding`}
        >
          <div>
            <p>{t("promptDesc", "Use this prompt template to create series infographics for any complex topic, adapting the card structure to your specific needs.")}</p>
          </div>
        </PromptBox>
      </section>

      {/* Conclusion */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("conclusionTitle", "Conclusion: Choose the Right Tool for the Right Audience")}
        </h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          {t("conclusionContent", "Series infographics and Google NotebookLM aren't competitors—they're complementary tools in your content arsenal. Infographics excel at visual communication, social sharing, and physical applications. NotebookLM shines at narrative explanation, audio learning, and deep research synthesis.")}
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          {t("conclusionContent2", "The key is understanding your audience and distribution channels. Visual learners scrolling through Instagram? Go with infographics. Commuters listening to podcasts? NotebookLM is your answer. And for maximum impact? Use both.")}
        </p>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            🎯 {t("ctaText", "Ready to create stunning series infographics?")} <a href="https://www.curify-ai.com/nano-template/series-infographic" className="text-blue-600 hover:underline font-semibold" target="_blank" rel="noopener noreferrer">{t("ctaLink", "Try Nano Banana Series Infographic Generator")}</a>
          </p>
        </div>
      </section>

      {/* SEO Keywords */}
      <section className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">🔍 SEO Keywords</h3>
        <p className="text-sm text-gray-600">{t("seoKeywords", "series infographics, Google NotebookLM, visual learning, audio learning, content creation, AI tools, educational content, infographic design, podcast generation, content strategy")}</p>
      </section>
    </div>
  );
}
