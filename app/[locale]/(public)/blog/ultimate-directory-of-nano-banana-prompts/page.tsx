'use client';

/**
 * Ultimate Directory of Nano Banana Prompts
 * 
 * A curated digital lookbook showcasing the power of Nano Banana's image-to-image generation.
 * This page demonstrates the platform's versatility across different creative domains
 * from character design to architectural visualization and lifestyle content.
 * 
 * Features:
 * - Lookbook-style visual presentation with high-quality examples
 * - Three-tier categorization system (Tier 2/Tier 3)
 * - Exact prompt examples with copy-paste functionality
 * - Visual comparison between different artistic styles
 * - Seamless integration with Curify platform
 * - Responsive design optimized for mobile and desktop
 */

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import BreadcrumbNavigation from "@/app/[locale]/(public)/blog/[slug]/components/BreadcrumbNavigation";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";
import nanoTemplatesData from '../../../../../public/data/nano_templates.json';

// Helper function to decode HTML entities (server-safe)
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Helper component for rendering prompt examples
function PromptExample({ 
  title, 
  prompt, 
  tier,
  style,
  tags,
  children 
}: { 
  title: string;
  prompt: string;
  tier: 'Tier 2' | 'Tier 3';
  style: 'Anime' | 'Film' | 'Ink' | 'Photorealistic' | 'Isometric' | 'Product';
  tags: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="relative p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4 flex-wrap justify-center">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${tier === 'Tier 2' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {tier}
              </span>
              {tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors cursor-pointer">
                  [{tag}]
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{title}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gray-200 to-gray-300 mx-auto rounded-full"></div>
          </div>

          <div className="flex flex-col items-center gap-8 mb-12">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to extract real templates from nano templates data
function getRealTemplates(locale: string) {
  const templates = nanoTemplatesData as any[];
  
  // Define category mappings based on template topics
  const categoryMappings = {
    character: ['character', 'mbti', 'film', 'psychology'],
    lifestyle: ['lifestyle', 'travel', 'food', 'fashion'],
    learning: ['learning', 'science', 'education', 'history'],
    design: ['design', 'architecture', 'product', 'commerce']
  };

  // Function to determine style from template
  function determineStyle(template: any): 'Anime' | 'Film' | 'Ink' | 'Photorealistic' | 'Isometric' | 'Product' {
    const topics = template.topics || [];
    const id = template.id || '';
    
    if (topics.includes('film') || id.includes('film') || id.includes('character')) return 'Film';
    if (topics.includes('design') || id.includes('product') || id.includes('fashion')) return 'Product';
    if (topics.includes('learning') || topics.includes('education') || id.includes('evolution') || id.includes('education-card')) return 'Isometric';
    if (topics.includes('history') || id.includes('heritage') || id.includes('costume')) return 'Ink';
    return 'Anime'; // Default style
  }

  // Function to determine tier from template
  function determineTier(template: any): 'Tier 2' | 'Tier 3' {
    const rankScore = template.rank_score || 0;
    return rankScore >= 81 ? 'Tier 2' : 'Tier 3';
  }

  // Function to generate tags from template
  function generateTags(template: any): string[] {
    const tags: string[] = [];
    const topics = template.topics || [];
    const id = template.id || '';
    
    // Add topic-based tags
    if (topics.includes('mbti')) tags.push('MBTI', 'Personality');
    if (topics.includes('character')) tags.push('Character-Design');
    if (topics.includes('learning')) tags.push('Education');
    if (topics.includes('history')) tags.push('Historical');
    if (topics.includes('design')) tags.push('Design');
    if (topics.includes('film')) tags.push('Film');
    if (id.includes('zh') || id.includes('chinese')) tags.push('Chinese');
    if (id.includes('anime')) tags.push('Anime');
    
    return tags.slice(0, 3); // Limit to 3 tags
  }

  // Function to extract example prompt from template
  function extractExamplePrompt(template: any): string {
    const localeData = template.locales?.[locale] || template.locales?.en || template.locales?.zh;
    if (!localeData?.base_prompt) return 'Template prompt not available';
    
    // Extract a cleaner version of the prompt for display
    let prompt = localeData.base_prompt;
    
    // Replace parameter placeholders with example values
    if (localeData.parameters) {
      localeData.parameters.forEach((param: any) => {
        const placeholder = param.placeholder?.[0] || param.name;
        prompt = prompt.replace(new RegExp(`{${param.name}}`, 'g'), placeholder);
      });
    }
    
    // Truncate very long prompts
    if (prompt.length > 300) {
      prompt = prompt.substring(0, 297) + '...';
    }
    
    return prompt;
  }

  // Build categories from real templates
  const categories = [
    {
      id: 'character' as const,
      name: 'Character & Persona (High Engagement)',
      description: 'Characters drive massive emotional connection and shareability. Start directory here to grab attention immediately.',
      examples: templates
        .filter(template => 
          categoryMappings.character.some(topic => 
            template.topics?.includes(topic) || template.id?.includes(topic)
          )
        )
        .slice(0, 8)
        .map(template => ({
          title: template.id?.replace('template-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Character Template',
          prompt: extractExamplePrompt(template),
          style: determineStyle(template),
          tier: determineTier(template),
          tags: generateTags(template)
        }))
    },
    {
      id: 'lifestyle' as const,
      name: 'Lifestyle & Global Aesthetics (The "Pinterest" Scroll)',
      description: 'This taps directly into aspiration and nostalgia markets. It demonstrates Nano Banana\'s ability to handle highly specific cultural and geographical nuances.',
      examples: templates
        .filter(template => 
          categoryMappings.lifestyle.some(topic => 
            template.topics?.includes(topic) || template.id?.includes(topic)
          )
        )
        .slice(0, 8)
        .map(template => ({
          title: template.id?.replace('template-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Lifestyle Template',
          prompt: extractExamplePrompt(template),
          style: determineStyle(template),
          tier: determineTier(template),
          tags: generateTags(template)
        }))
    },
    {
      id: 'learning' as const,
      name: 'Learning & Language (The Viral Utility)',
      description: 'Transition from pure aesthetics to practical, viral content creation. This proves to educators and creators that Curify is a serious production engine.',
      examples: templates
        .filter(template => 
          categoryMappings.learning.some(topic => 
            template.topics?.includes(topic) || template.id?.includes(topic)
          )
        )
        .slice(0, 8)
        .map(template => ({
          title: template.id?.replace('template-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Learning Template',
          prompt: extractExamplePrompt(template),
          style: determineStyle(template),
          tier: determineTier(template),
          tags: generateTags(template)
        }))
    },
    {
      id: 'design' as const,
      name: 'Design & Product (The Professional Edge)',
      description: 'Close the directory with high-intent professional use cases. This attracts industrial designers, marketers, and product managers.',
      examples: templates
        .filter(template => 
          categoryMappings.design.some(topic => 
            template.topics?.includes(topic) || template.id?.includes(topic)
          )
        )
        .slice(0, 8)
        .map(template => ({
          title: template.id?.replace('template-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Design Template',
          prompt: extractExamplePrompt(template),
          style: determineStyle(template),
          tier: determineTier(template),
          tags: generateTags(template)
        }))
    }
  ];

  return categories;
}

// Main component
export default function UltimateDirectoryOfNanoBananaPromptsPage() {
  const [activeCategory, setActiveCategory] = useState<'character' | 'lifestyle' | 'learning' | 'design'>('character');
  const t = useTranslations('blog.UltimateDirectoryOfNanoBananaPrompts');
  const locale = useLocale();

  // Get real templates from data
  const categories = useMemo(() => getRealTemplates(locale), [locale]);

  const filteredExamples = categories.find(cat => cat.id === activeCategory)?.examples || [];

  return (
    <div className="pt-10 pb-8">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: t('hero.title'), href: `/blog/ultimate-directory-of-nano-banana-prompts` }
        ]}
      />
      
      <article className="prose prose-base md:prose-lg max-w-none mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative mb-12">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur opacity-20"></div>
          <div className="relative text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-gray-600 mt-4 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>
        </div>

        {/* Blog Post Image */}
        <div className="mb-8">
          <CdnImage
            src="/images/logbook.webp"
            alt={t('hero.title')}
            width={1200}
            height={675}
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Table of Contents */}
        <section className="prose prose-lg max-w-none mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('tableOfContents.title')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{category.description}</p>
                  <div className="text-xs text-blue-600 font-medium">
                    {category.examples.length} examples
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('introduction.title')}</h2>
            <p className="text-lg text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph1', { strong: '<strong>' })) }}
            />
            <p className="text-lg text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph2', { strong: '<strong>' })) }}
            />
            <p className="text-lg text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph3')) }}
            />
          </div>
        </section>

        {/* Category Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  ${activeCategory === category.id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                `}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Examples Grid */}
        <div className="space-y-12">
          {filteredExamples.map((example, index) => (
            <PromptExample
              key={index}
              title={example.title}
              prompt={example.prompt}
              tier={example.tier}
              style={example.style}
              tags={example.tags}
            >
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('examples.description')} <strong>{example.title}</strong>
                </p>
                <div className="bg-gray-50 border-l-4 border-gray-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">{t('examples.promptTitle')}</h4>
                  <p className="text-gray-700 mb-4">{t('examples.promptDescription')}</p>
                </div>
                <PromptBox 
                  title={t('examples.promptBoxTitle')}
                  promptText={example.prompt}
                >
                  <div className="text-sm text-gray-600 mb-2">{t('examples.promptBoxDescription')}</div>
                  <div className="p-3 bg-gray-50 rounded font-mono text-xs">{example.prompt}</div>
                </PromptBox>
              </div>
            </PromptExample>
          ))}
        </div>

              </article>

      {/* Related Tools & Resources */}
        <section className="my-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl border border-blue-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Related Tools & Resources</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">MBTI Character Generator</h3>
                <p className="text-sm text-gray-600 mb-4">Generate detailed MBTI character profiles with AI-powered personality analysis.</p>
                <Link
                  href="/blog/mbti-character-generator"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explore Tool
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">Visual Learning Tools</h3>
                <p className="text-sm text-gray-600 mb-4">Create educational infographics and visual learning content.</p>
                <Link
                  href="/blog/visual-learning-tools"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Learn More
                </Link>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-900 mb-2">What is Infographics</h3>
                <p className="text-sm text-gray-600 mb-4">Master infographic creation for educational and marketing content.</p>
                <Link
                  href="/blog/what-is-infographics"
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Read Guide
                </Link>
              </div>
            </div>
          </div>
        </section>

      {/* Related Blogs */}
      <RelatedBlogs currentSlug="ultimate-directory-of-nano-banana-prompts" locale={locale} />
      
      {/* Structured Data for SEO */}
      <StructuredData
        title={t('hero.title')}
        description={t('hero.subtitle')}
        publishDate="2026-04-20"
        author="Curify AI Team"
        image="/images/logbook.webp"
        url="/blog/ultimate-directory-of-nano-banana-prompts"
        readTime="20 min read"
      />
    </div>
  );
}
