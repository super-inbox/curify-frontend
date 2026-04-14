import Image from 'next/image';
import PromptBox from './PromptBox';

interface InfographicContentProps {
  slug: string;
  t: (key: string, defaultValue?: string) => string;
  locale: string;
  arrayData?: Record<string, any>;
}

export default function InfographicContent({ slug, t, locale, arrayData }: InfographicContentProps) {

  const digitalUseCases = [
    {
      title: t("digitalCase1Title", "Technical Blog Posts"),
      description: t("digitalCase1Desc", "Transform complex technical concepts into visually digestible infographics that enhance reader understanding and engagement."),
      example: t("digitalCase1Example", "API documentation, software architecture diagrams, data flow visualizations")
    },
    {
      title: t("digitalCase2Title", "Social Media Content"), 
      description: t("digitalCase2Desc", "Create shareable infographic cards that communicate key information quickly and drive engagement across platforms."),
      example: t("digitalCase2Example", "Statistics, industry insights, quick tips, educational content")
    },
    {
      title: t("digitalCase3Title", "Educational Materials"),
      description: t("digitalCase3Desc", "Develop comprehensive learning materials that combine visual elements with structured information for better retention."),
      example: t("digitalCase3Example", "Course summaries, study guides, concept explanations")
    },
    {
      title: t("digitalCase4Title", "Business Presentations"),
      description: t("digitalCase4Desc", "Enhance presentations with professional infographics that communicate data and concepts more effectively than text alone."),
      example: t("digitalCase4Example", "Annual reports, market analysis, project updates")
    }
  ];

  const physicalUseCases = [
    {
      title: t("physicalCase1Title", "Traditional Medicine Posters"),
      description: t("physicalCase1Desc", "Create culturally relevant posters that blend traditional knowledge with modern infographic design principles."),
      example: t("physicalCase1Example", "Herbal medicine guides, acupuncture charts, wellness posters")
    },
    {
      title: t("physicalCase2Title", "Movie-Style Posters"),
      description: t("physicalCase2Desc", "Design promotional materials that combine cinematic aesthetics with informational infographics for events and exhibitions."),
      example: t("physicalCase2Example", "Film festival posters, cultural event promotions, exhibition displays")
    },
    {
      title: t("physicalCase3Title", "Educational Posters"),
      description: t("physicalCase3Desc", "Print large-format educational infographics for classrooms, museums, and public spaces."),
      example: t("physicalCase3Example", "Historical timelines, scientific diagrams, health awareness campaigns")
    },
    {
      title: t("physicalCase4Title", "Cultural Exhibitions"),
      description: t("physicalCase4Desc", "Design exhibition materials that tell stories through visual information and cultural narratives."),
      example: t("physicalCase4Example", "Museum displays, cultural heritage presentations, art exhibitions")
    }
  ];

  const nanoBananaExamples = [
    {
      title: t("nanoExample1Title", "Chinese Herbal Medicine Guide"),
      description: t("nanoExample1Desc", "Structured visual guide combining traditional medicine knowledge with modern infographic design"),
      template: t("nanoExample1Template", "Traditional medicine layout with herbal illustrations and dosage information")
    },
    {
      title: t("nanoExample2Title", "Evolution Timeline Visualization"),
      description: t("nanoExample2Desc", "Historical progression displayed through connected visual elements and chronological data"),
      template: t("nanoExample2Template", "Timeline-based design with milestone markers and visual progression indicators")
    },
    {
      title: t("nanoExample3Title", "Cultural Costume History"),
      description: t("nanoExample3Desc", "Fashion evolution presented through cultural context and visual transformation"),
      template: t("nanoExample3Template", "Comparison layout showing historical changes with cultural annotations")
    }
  ];

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <section className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">
          {t("whatIsTitle", "What is Infographics and How Can Infographic Cards Be Used?")}
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {t("introContent", "Infographics are not limited to education—they are a cross-medium way of structuring and distributing information, spanning both digital content and physical artifacts. They operate across two dimensions: digital-native usage for blogs, social media, and knowledge sharing, and physical-world usage for posters, exhibitions, and cultural visuals.")}
        </p>
      </section>

      {/* Core Definition */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("definitionTitle", "Understanding Infographics")}
        </h3>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <p className="text-gray-700 mb-4">
            {t("definitionContent", "Infographics are visual representations of information, data, or knowledge intended to present complex information quickly and clearly. They combine design, writing, and analysis to create engaging visual content that tells a story or explains a concept.")}
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-semibold text-gray-800">{t("visualElement", "Visual Elements")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("visualElementDesc", "Icons, charts, images, and illustrations")}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl mb-2">📝</div>
              <h4 className="font-semibold text-gray-800">{t("contentElement", "Content Elements")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("contentElementDesc", "Text, statistics, facts, and explanations")}</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl mb-2">🎨</div>
              <h4 className="font-semibold text-gray-800">{t("designElement", "Design Elements")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("designElementDesc", "Layout, color, typography, and hierarchy")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Digital Use Cases */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("digitalTab", "Digital-Native Usage")}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {digitalUseCases.map((useCase, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">{useCase.title}</h4>
              <p className="text-gray-600 mb-3">{useCase.description}</p>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <strong>{t("examplesLabel", "Examples:")} </strong> {useCase.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Physical Use Cases */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("physicalTab", "Physical-World Usage")}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {physicalUseCases.map((useCase, index) => (
            <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h4 className="text-lg font-semibold mb-2 text-gray-800">{useCase.title}</h4>
              <p className="text-gray-600 mb-3">{useCase.description}</p>
              <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <strong>{t("examplesLabel", "Examples:")} </strong> {useCase.example}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Nano Banana Integration */}
      <section className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("nanoBananaTitle", "Connecting with Nano Banana Prompts & Templates")}
        </h3>
        <p className="text-gray-700 mb-6">
          {t("nanoBananaIntro", "Nano Banana prompts and templates provide a structured approach to creating infographics that bridge both digital and physical applications. Our ecosystem offers specialized templates for various infographic use cases.")}
        </p>
        
        <div className="space-y-4">
          {nanoBananaExamples.map((example, index) => (
            <div key={index} className="bg-white p-5 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-lg mb-2 text-gray-800">{example.title}</h4>
              <p className="text-gray-600 mb-3">{example.description}</p>
              <div className="bg-orange-50 p-3 rounded text-sm">
                <strong>{t("templateType", "Template Type:")} </strong> {example.template}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Key Insights */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("insightsTitle", "Key Insights & Observations")}
        </h3>
        <div className="space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h4 className="font-semibold text-blue-800 mb-2">
              {t("insight1Title", "Educational Dominance")}
            </h4>
            <p className="text-blue-700">
              {t("insight1Content", "Educational and research-related scenarios are indeed the dominant use case for infographics, but the space is still under-explored and evolving rapidly.")}
            </p>
          </div>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <h4 className="font-semibold text-green-800 mb-2">
              {t("insight2Title", "Cross-Medium Potential")}
            </h4>
            <p className="text-green-700">
              {t("insight2Content", "The most successful infographic applications recognize that digital and physical are not the same product problem—they require different approaches and considerations.")}
            </p>
          </div>
          
          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <h4 className="font-semibold text-purple-800 mb-2">
              {t("insight3Title", "Structured Information")}
            </h4>
            <p className="text-purple-700">
              {t("insight3Content", "Infographics excel at making complex information accessible through visual hierarchy, structured layouts, and the strategic use of color and typography.")}
            </p>
          </div>
        </div>
      </section>

      {/* Prompt Examples */}
      <section>
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("promptExamplesTitle", "Nano Banana Prompt Examples for Infographics")}
        </h3>
        <div className="space-y-4">
          <PromptBox
            title={t("technicalPromptTitle", "Technical Blog Post Infographic")}
            promptText={`Create a technical infographic explaining [TOPIC] with:
- Clear hierarchical structure
- Technical diagrams and flowcharts
- Step-by-step process visualization
- Professional color scheme suitable for tech audience
- Data visualization for statistics and metrics
- Code snippets or API examples where applicable

Style: Clean, modern, technical documentation aesthetic`}
          >
            <div>
              <p>{t("technicalPromptDesc", "Use this prompt to create technical infographics for blog posts, documentation, or educational content.")}</p>
            </div>
          </PromptBox>
          
          <PromptBox
            title={t("culturalPromptTitle", "Cultural Heritage Infographic")}
            promptText={`Design a cultural infographic about [CULTURAL_TOPIC] featuring:
- Traditional design elements and patterns
- Historical timeline progression
- Cultural context and significance
- Authentic imagery and illustrations
- Educational information layout
- Color palette reflecting cultural aesthetics

Style: Culturally authentic, educational, visually rich with traditional elements`}
          >
            <div>
              <p>{t("culturalPromptDesc", "Perfect for creating cultural education materials, museum displays, or heritage preservation content.")}</p>
            </div>
          </PromptBox>
          
          <PromptBox
            title={t("businessPromptTitle", "Business Data Infographic")}
            promptText={`Generate a business infographic for [BUSINESS_TOPIC] including:
- Executive summary section
- Key metrics and KPIs visualization
- Market analysis charts
- Growth trajectory visualization
- Competitive comparison
- Professional corporate styling

Style: Corporate professional, data-driven, clean layout with business-appropriate imagery`}
          >
            <div>
              <p>{t("businessPromptDesc", "Ideal for business presentations, annual reports, or corporate communications.")}</p>
            </div>
          </PromptBox>
        </div>
      </section>

      {/* Future of Infographics */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("futureTitle", "The Future of Infographics")}
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-lg mb-3 text-gray-800">
              {t("trendsTitle", "Emerging Trends")}
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {t("trend1", "Interactive infographics with dynamic data visualization")}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {t("trend2", "AI-powered infographic generation and customization")}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {t("trend3", "AR/VR integration for immersive infographic experiences")}
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                {t("trend4", "Real-time data integration for live infographic updates")}
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-lg mb-3 text-gray-800">
              {t("opportunitiesTitle", "Growth Opportunities")}
            </h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t("opportunity1", "Educational technology and e-learning platforms")}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t("opportunity2", "Content marketing and brand storytelling")}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t("opportunity3", "Data journalism and news media visualization")}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                {t("opportunity4", "Corporate training and internal communications")}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-2xl font-bold mb-4 text-gray-800">
          {t("conclusionTitle", "Conclusion")}
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {t("conclusionContent", "Infographics represent a powerful medium for information communication that transcends traditional boundaries between digital and physical applications. By leveraging structured visual design and the power of Nano Banana prompts and templates, creators can develop compelling infographics that serve diverse purposes—from technical documentation to cultural preservation. As the field continues to evolve with new technologies and applications, the fundamental principle remains clear: effective infographics make complex information accessible, engaging, and memorable across all mediums.")}
        </p>
      </section>
    </div>
  );
}
