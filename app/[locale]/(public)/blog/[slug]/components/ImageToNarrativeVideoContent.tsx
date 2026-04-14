import React from 'react';

interface ImageToNarrativeVideoContentProps {
  slug: string;
  t: (key: string, defaultValue?: string) => string;
  locale: string;
}

export default function ImageToNarrativeVideoContent({ slug, t, locale }: ImageToNarrativeVideoContentProps) {
  const tools = [
    {
      name: t('curifyToolTitle', 'Curify Image-to-Video AI'),
      description: t('curifyToolDesc', 'Advanced narrative generation, multi-language support, perfect timing synchronization. Best for professional content creators.'),
      features: t('curifyFeatures', 'AI-powered storytelling, automatic scene detection, emotion-aware narration, customizable output formats'),
      useCases: t('curifyUseCases', 'Educational content, marketing videos, brand storytelling, professional presentations'),
      pricing: t('curifyPricing', 'Professional tier with API access and custom enterprise solutions'),
      badge: 'Professional'
    },
    {
      name: t('runwayToolTitle', 'RunwayML Gen-2'),
      description: t('runwayToolDesc', 'State-of-the-art video generation, text-to-video capabilities. Best for creative professionals.'),
      features: t('runwayFeatures', 'Text-to-video generation, image-to-video conversion, advanced motion controls, cinematic effects'),
      useCases: t('runwayUseCases', 'Film production, creative projects, artistic content, experimental media'),
      pricing: t('runwayPricing', 'Subscription-based with credits system, free tier available'),
      badge: 'Creative'
    },
    {
      name: t('pikaToolTitle', 'Pika Labs'),
      description: t('pikaToolDesc', 'User-friendly interface, high-quality output. Best for quick projects and social media content.'),
      features: t('pikaFeatures', 'Intuitive interface, rapid generation, social media optimization, template library'),
      useCases: t('pikaUseCases', 'Social media content, quick marketing videos, personal projects, content creation'),
      pricing: t('pikaPricing', 'Freemium model with affordable paid plans'),
      badge: 'Beginner-Friendly'
    },
    {
      name: t('stableToolTitle', 'Stable Video Diffusion'),
      description: t('stableToolDesc', 'Open-source solution, customizable models. Best for developers and researchers.'),
      features: t('stableFeatures', 'Open-source codebase, model customization, community support, research capabilities'),
      useCases: t('stableUseCases', 'Research projects, custom applications, development, academic studies'),
      pricing: t('stablePricing', 'Free and open-source with optional commercial licenses'),
      badge: 'Open Source'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Intro */}
      {t('intro') && (
        <p className="text-lg font-semibold text-blue-600 mb-4">
          {t('intro')}
        </p>
      )}

      {/* What Is Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('whatIsTitle', 'Introduction')}</h2>
        <p className="mb-4">{t('whatIsContent')}</p>
      </section>

      {/* Technical Implementation */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('technicalTitle', 'Technical Implementation')}</h2>
        <p className="mb-4">{t('technicalIntro')}</p>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('step1Title')}</h3>
            <p>{t('step1Content')}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('step2Title')}</h3>
            <p>{t('step2Content')}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('step3Title')}</h3>
            <p>{t('step3Content')}</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('step4Title')}</h3>
            <p>{t('step4Content')}</p>
          </div>
        </div>
      </section>

      {/* Business Use Cases */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('businessTitle', 'Business Use Cases')}</h2>
        
        {/* Education */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('educationTitle')}</h3>
          <p className="mb-3">{t('educationContent')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('educationExample1')}</li>
            <li>{t('educationExample2')}</li>
            <li>{t('educationExample3')}</li>
          </ul>
        </div>

        {/* Marketing */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('marketingTitle')}</h3>
          <p className="mb-3">{t('marketingContent')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('marketingExample1')}</li>
            <li>{t('marketingExample2')}</li>
            <li>{t('marketingExample3')}</li>
          </ul>
        </div>

        {/* Training */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('trainingTitle')}</h3>
          <p className="mb-3">{t('trainingContent')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('trainingExample1')}</li>
            <li>{t('trainingExample2')}</li>
            <li>{t('trainingExample3')}</li>
          </ul>
        </div>

        {/* Entertainment */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('entertainmentTitle')}</h3>
          <p className="mb-3">{t('entertainmentContent')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('entertainmentExample1')}</li>
            <li>{t('entertainmentExample2')}</li>
            <li>{t('entertainmentExample3')}</li>
          </ul>
        </div>
      </section>

      {/* Tools and Technologies - Improved Card Layout */}
      <section>
        <h2 className="text-2xl font-bold mb-6">{t('toolsTitle', 'Tools and Technologies')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tools.map((tool, index) => (
            <div key={index} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">{tool.name}</h3>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {tool.badge}
                </span>
              </div>
              
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                {tool.description}
              </p>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Key Features</h4>
                  <p className="text-sm text-gray-600">{tool.features}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Best For</h4>
                  <p className="text-sm text-gray-600">{tool.useCases}</p>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Pricing</h4>
                  <p className="text-sm text-gray-600">{tool.pricing}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('examplesTitle', 'Real-World Examples')}</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('iranExampleTitle')}</h3>
          <p className="mb-3">{t('iranExampleDescription')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('iranFeature1')}</li>
            <li>{t('iranFeature2')}</li>
            <li>{t('iranFeature3')}</li>
            <li>{t('iranFeature4')}</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('vocabularyExampleTitle')}</h3>
          <p className="mb-3">{t('vocabularyExampleDescription')}</p>
          <p className="mb-3 text-sm text-gray-600">{t('vocabularyImages')}</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('vocabularyFeature1')}</li>
            <li>{t('vocabularyFeature2')}</li>
            <li>{t('vocabularyFeature3')}</li>
            <li>{t('vocabularyFeature4')}</li>
          </ul>
        </div>
      </section>

      {/* Curify Platform */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('curifyTitle')}</h2>
        <p className="mb-4">{t('curifyContent')}</p>
      </section>

      {/* Key Insights */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('insightsTitle', 'Key Insights & Observations')}</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <h3 className="font-semibold mb-2">{t('insight1Title')}</h3>
            <p>{t('insight1Content')}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <h3 className="font-semibold mb-2">{t('insight2Title')}</h3>
            <p>{t('insight2Content')}</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <h3 className="font-semibold mb-2">{t('insight3Title')}</h3>
            <p>{t('insight3Content')}</p>
          </div>
        </div>
      </section>

      {/* Prompt Examples */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('promptExamplesTitle', 'AI Prompt Examples')}</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('educationalPromptTitle')}</h3>
            <p className="text-sm text-gray-600 mb-2">{t('educationalPromptDesc')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('marketingPromptTitle')}</h3>
            <p className="text-sm text-gray-600 mb-2">{t('marketingPromptDesc')}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('storytellingPromptTitle')}</h3>
            <p className="text-sm text-gray-600 mb-2">{t('storytellingPromptDesc')}</p>
          </div>
        </div>
      </section>

      {/* Future */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('futureTitle', 'The Future of Image-to-Narrative Videos')}</h2>
        
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('trendsTitle', 'Emerging Trends')}</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('trend1')}</li>
            <li>{t('trend2')}</li>
            <li>{t('trend3')}</li>
            <li>{t('trend4')}</li>
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3">{t('opportunitiesTitle', 'Growth Opportunities')}</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>{t('opportunity1')}</li>
            <li>{t('opportunity2')}</li>
            <li>{t('opportunity3')}</li>
            <li>{t('opportunity4')}</li>
          </ul>
        </div>
      </section>

      {/* Best Practices */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('bestPracticesTitle', 'Best Practices')}</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('practice1Title')}</h3>
            <p>{t('practice1Content')}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('practice2Title')}</h3>
            <p>{t('practice2Content')}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-semibold mb-2">{t('practice3Title')}</h3>
            <p>{t('practice3Content')}</p>
          </div>
        </div>
      </section>

      {/* Conclusion */}
      <section>
        <h2 className="text-2xl font-bold mb-4">{t('conclusionTitle', 'Conclusion')}</h2>
        <p>{t('conclusionContent')}</p>
      </section>

      {/* CTA */}
      
    </div>
  );
}
