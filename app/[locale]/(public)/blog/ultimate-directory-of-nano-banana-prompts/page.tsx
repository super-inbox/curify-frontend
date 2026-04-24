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
import { useState } from 'react';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import SocialShare from "@/app/[locale]/(public)/blog/[slug]/components/SocialShare";
import BreadcrumbNavigation from "@/app/[locale]/(public)/blog/[slug]/components/BreadcrumbNavigation";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";

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

// Main component
export default function UltimateDirectoryOfNanoBananaPromptsPage() {
  const [activeCategory, setActiveCategory] = useState<'character' | 'lifestyle' | 'learning' | 'design'>('character');
  const t = useTranslations('blog.UltimateDirectoryOfNanoBananaPrompts');
  const locale = useLocale();

  const categories: Array<{
    id: 'character' | 'lifestyle' | 'learning' | 'design';
    name: string;
    description: string;
    examples: Array<{
      title: string;
      prompt: string;
      style: 'Anime' | 'Film' | 'Ink' | 'Photorealistic' | 'Isometric' | 'Product';
      tier: 'Tier 2' | 'Tier 3';
      tags: string[];
    }>;
  }> = [
    {
      id: 'character',
      name: 'Character & Persona (High Engagement)',
      description: 'Characters drive massive emotional connection and shareability. Start directory here to grab attention immediately.',
      examples: [
        {
          title: 'MBTI Character Archetypes',
          prompt: 'Generate a detailed character profile for an INTJ architect CEO type. Include career background, personality traits, decision-making patterns, and how they handle stress situations.',
          style: 'Anime',
          tier: 'Tier 2',
          tags: ['Anime', 'Kawaii', 'English-Japanese']
        },
        {
          title: 'Style Comparisons',
          prompt: 'Create the same INTJ architect character rendered in both Anime and Film styles to showcase artistic versatility.',
          style: 'Film',
          tier: 'Tier 2',
          tags: ['Film', 'Realism', 'Character-Design']
        },
        {
          title: 'Group Dynamics',
          prompt: 'Generate a cohesive team of 5 professionals with different MBTI types working in a modern office environment.',
          style: 'Photorealistic',
          tier: 'Tier 2',
          tags: ['Professional', 'Team-Dynamics', 'Office-Scene']
        },
        {
          title: 'Fantasy Character Parties',
          prompt: 'Create a diverse party of 5 fantasy characters with different MBTI types. Show how they interact and complement each other in social settings.',
          style: 'Anime',
          tier: 'Tier 2',
          tags: ['Fantasy', 'Party', 'Social-Interaction']
        },
        {
          title: 'Sports Team Roster',
          prompt: 'Design a complete sports team roster with players of different MBTI types. Include their positions, playing styles, and team chemistry.',
          style: 'Photorealistic',
          tier: 'Tier 2',
          tags: ['Sports', 'Team', 'Roster', 'Athletic']
        }
      ]
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Global Aesthetics (The "Pinterest" Scroll)',
      description: 'This taps directly into aspiration and nostalgia markets. It demonstrates Nano Banana\'s ability to handle highly specific cultural and geographical nuances.',
      examples: [
        {
          title: 'Retro Tokyo Street Scene',
          prompt: 'Generate a nostalgic 1990s Tokyo street scene at sunset. Include detailed environmental descriptions, fashion elements, and cultural atmosphere.',
          style: 'Anime',
          tier: 'Tier 3',
          tags: ['Nostalgia', 'Japan', 'Urban', '90s']
        },
        {
          title: 'Parisian Cafe Interior',
          prompt: 'Create an elegant Parisian cafe with ornate decor, soft ambient lighting, and patrons enjoying coffee and pastries.',
          style: 'Ink',
          tier: 'Tier 3',
          tags: ['Paris', 'Cafe', 'Elegant', 'European']
        },
        {
          title: 'Mexican Food Market',
          prompt: 'Design a vibrant Mexican food market scene with colorful displays, traditional elements, and rich cultural details. Emphasize authenticity and sensory appeal.',
          style: 'Photorealistic',
          tier: 'Tier 3',
          tags: ['Mexico', 'Food', 'Cultural', 'Market']
        },
        {
          title: 'Spanish Architecture Tour',
          prompt: 'Generate a comprehensive architectural tour of Spanish landmarks. Include historical context, lighting conditions, and cultural significance.',
          style: 'Photorealistic',
          tier: 'Tier 3',
          tags: ['Spain', 'Architecture', 'Historical', 'Culture']
        },
        {
          title: 'Moroccan Souk',
          prompt: 'Create a bustling Moroccan souk with intricate textiles, spices, traditional lanterns, and merchants negotiating prices.',
          style: 'Photorealistic',
          tier: 'Tier 3',
          tags: ['Morocco', 'Souk', 'Textiles', 'Cultural']
        }
      ]
    },
    {
      id: 'learning',
      name: 'Learning & Language (The Viral Utility)',
      description: 'Transition from pure aesthetics to practical, viral content creation. This proves to educators and creators that Curify is a serious production engine.',
      examples: [
        {
          title: 'Language Learning Cards',
          prompt: 'Create visual vocabulary cards showing English-Spanish word pairs with contextual images and pronunciation guides.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['Education', 'Bilingual', 'English-Spanish', 'Vocabulary']
        },
        {
          title: 'Historical Timeline',
          prompt: 'Generate an illustrated timeline showing major events from World War II with dates, key figures, and historical context.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['History', 'Timeline', 'Education', 'World-War-II']
        },
        {
          title: 'Science Infographic',
          prompt: 'Generate an infographic showing the water cycle with detailed labels, scientific accuracy, and educational clarity.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['Science', 'Education', 'Infographic', 'Environment']
        },
        {
          title: 'Mathematical Concepts',
          prompt: 'Create visual explanations of calculus concepts including derivatives, integrals, and real-world applications.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['Mathematics', 'Calculus', 'Education', 'STEM']
        }
      ]
    },
    {
      id: 'design',
      name: 'Design & Product (The Professional Edge)',
      description: 'Close the directory with high-intent professional use cases. This attracts industrial designers, marketers, and product managers.',
      examples: [
        {
          title: 'Product Mockups',
          prompt: 'Create clean, minimalist product mockups for a luxury smartwatch with multiple angles and studio lighting.',
          style: 'Product',
          tier: 'Tier 3',
          tags: ['Product', 'Mockup', 'Minimalist', 'Luxury']
        },
        {
          title: 'Interior Design Styles',
          prompt: 'Show the same modern living room rendered in Isometric vector, Ink sketch, and Photorealistic 3D styles.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['Interior-Design', 'Style-Comparison', 'Isometric', '3D']
        },
        {
          title: 'Fashion Collection',
          prompt: 'Design a complete fashion collection lookbook with runway models, fabric textures, and seasonal color palettes.',
          style: 'Photorealistic',
          tier: 'Tier 3',
          tags: ['Fashion', 'Collection', 'Runway', 'Style-Book']
        },
        {
          title: 'Architectural Blueprints',
          prompt: 'Create detailed architectural blueprints for a sustainable eco-home with technical specifications and material annotations.',
          style: 'Isometric',
          tier: 'Tier 3',
          tags: ['Architecture', 'Blueprints', 'Sustainable', 'Technical']
        }
      ]
    }
  ];

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
            <p className="text-lg text-gray-700 mb-4">
              {t.rich('introduction.paragraph1', {
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              {t.rich('introduction.paragraph2', {
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              {t.rich('introduction.paragraph3', {
                strong: (chunks) => <strong>{chunks}</strong>
              })}
            </p>
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
