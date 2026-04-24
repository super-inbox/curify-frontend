'use client';

/**
 * The Ultimate AI MBTI Character Generator Guide (Featuring Yellowstone Examples)
 * 
 * Transform your creative process with AI-powered MBTI character generation.
 * This comprehensive guide shows creators, writers, and RPG players how to use
 * Curify's Nano Banana to generate highly accurate, context-aware character 
 * personas based on MBTI types, using Yellowstone characters as practical examples.
 * 
 * Features:
 * - Detailed MBTI type analysis and prompts aligned with specific user intent
 * - Yellowstone character case studies (Beth Dutton as ENTJ, Rip Wheeler as ISTP)
 * - Step-by-step AI character generation tutorials for applied character modeling
 * - Advanced prompting techniques for realistic character development
 * - Focus on reverse-engineering personalities users already understand
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
import FAQSection from "@/app/[locale]/(public)/blog/[slug]/components/FAQSection";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";

// Helper function to decode HTML entities (server-safe)
function decodeHTMLEntities(text: string): string {
  return text
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Helper component for rendering lists from translations
function ListPoints({ points }: { points: string[] }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-gray-700">
      {points.map((point, index) => (
        <li key={index} dangerouslySetInnerHTML={{ __html: point }} />
      ))}
    </ul>
  );
}

// Helper component for the pro tip section
function ProTip({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-l-4 border-blue-500 pl-4 py-2 my-6">
      <p className="font-semibold text-blue-700">Pro Tip</p>
      <div className="text-gray-700">{children}</div>
    </div>
  );
}

// MBTI Character Card Component
function MBTICharacterCard({ character, type, traits, prompt }: { 
  character: string; 
  type: string; 
  traits: string[]; 
  prompt: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-3">
          {type}
        </div>
        <h3 className="text-xl font-bold text-gray-900">{character}</h3>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Key Traits:</h4>
        <div className="flex flex-wrap gap-2">
          {traits.map((trait, index) => (
            <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
              {trait}
            </span>
          ))}
        </div>
      </div>
      
      <PromptBox 
        title={`${character} (${type}) Prompt`}
        promptText={prompt}
      >
        <div className="text-sm text-gray-600">Use this prompt to generate a character with similar personality traits</div>
        <div className="mt-2 p-3 bg-gray-50 rounded font-mono text-xs">{prompt}</div>
      </PromptBox>
    </div>
  );
}

// Main component
export default function MBTICharacterGeneratorPage() {
  const [activeTab, setActiveTab] = useState('basics');
  const t = useTranslations('MBTICharacterGeneratorGuide');
  const locale = useLocale();

  return (
    <div className="pt-10 pb-8">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: t('hero.title'), href: `/blog/mbti-character-generator` }
        ]}
      />
      
      <article className="prose prose-base md:prose-lg">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
          <h1 className="relative text-3xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Author info */}
        <div className="flex items-center mb-8">
          <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
            <CdnImage
              src="/images/team/author.jpg"
              alt="AI Research Team"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">Curify AI Team</p>
            <p className="text-sm text-gray-500">AI Research Team</p>
          </div>
        </div>

        {/* Introduction */}
        <div className="prose prose-lg max-w-none mb-12">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100 mb-8">
            <p className="text-lg text-gray-600 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph1')) }}
            />
            <p className="text-lg text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph2')) }}
            />
            <div className="flex flex-wrap gap-4 mt-6">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                {t('tags.mbtiGenerator')}
              </span>
              <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                {t('tags.yellowstoneMBTI')}
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                {t('tags.characterDevelopment')}
              </span>
            </div>
          </div>
        </div>

        {/* SEO Keywords Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-yellow-800 mb-3">Target Keywords</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-yellow-700">mbti generator:</span>
              <span className="text-yellow-600 ml-2">(SV: 110, KD: 9%)</span>
            </div>
            <div>
              <span className="font-semibold text-yellow-700">yellowstone mbti:</span>
              <span className="text-yellow-600 ml-2">(SV: 40, KD: 5%)</span>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <TableOfContents 
          headings={[
            { level: "2", text: t('tabs.basics'), id: "basics" },
            { level: "2", text: t('tabs.yellowstone'), id: "yellowstone" },
            { level: "2", text: t('tabs.techniques'), id: "techniques" },
            { level: "2", text: t('tabs.advanced'), id: "advanced" },
            { level: "2", text: t('benefits.title'), id: "benefits" },
            { level: "2", text: t('tabs.faq'), id: "faq" },
            { level: "2", text: t('conclusion.title'), id: "conclusion" }
          ]}
        />

        {/* Social Share */}
        <SocialShare 
          title={t('hero.title')}
          description={t('hero.subtitle')}
          url={`/blog/mbti-character-generator`}
        />

        {/* Pro Tip Section */}
        <ProTip>
          {t('protip')}
        </ProTip>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['basics', 'yellowstone', 'techniques', 'advanced'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Basics Tab */}
        {activeTab === 'basics' && (
          <section className="my-16">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                GETTING STARTED
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('basics.title')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('basics.whatIsMBTI.title')}</h3>
                <p className="text-gray-700 mb-6 text-lg">{t('basics.whatIsMBTI.description')}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    { type: 'E/I', label: 'Extraversion/Introversion', desc: 'How you direct and receive energy' },
                    { type: 'S/N', label: 'Sensing/Intuition', desc: 'How you take in information' },
                    { type: 'T/F', label: 'Thinking/Feeling', desc: 'How you make decisions' },
                    { type: 'J/P', label: 'Judging/Perceiving', desc: 'How you approach the outside world' }
                  ].map((dimension, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-bold text-gray-900">{dimension.type}</h4>
                      <h5 className="font-semibold text-gray-800 mb-1">{dimension.label}</h5>
                      <p className="text-sm text-gray-600">{dimension.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('basics.aiGeneration.title')}</h3>
                <p className="text-gray-700 mb-6 text-lg">{t('basics.aiGeneration.description')}</p>
                
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('basics.aiGeneration.basicPrompt.title')}</h4>
                  <PromptBox 
                    title="Basic MBTI Character Prompt"
                    promptText={t('basics.aiGeneration.basicPrompt.example')}
                  >
                    <div className="text-sm text-gray-600 mb-2">{t('basics.aiGeneration.basicPrompt.explanation')}</div>
                    <div className="p-3 bg-gray-50 rounded font-mono text-xs">{t('basics.aiGeneration.basicPrompt.example')}</div>
                  </PromptBox>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Yellowstone Tab */}
        {activeTab === 'yellowstone' && (
          <section className="my-16">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full mb-4">
                YELLOWSTONE CASE STUDIES
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('yellowstone.title')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8">
              <MBTICharacterCard
                character="Beth Dutton"
                type="ENTJ"
                traits={t.raw('yellowstone.beth.traits')}
                prompt={t('yellowstone.beth.prompt')}
              />
              
              <MBTICharacterCard
                character="Rip Wheeler"
                type="ISTP"
                traits={t.raw('yellowstone.rip.traits')}
                prompt={t('yellowstone.rip.prompt')}
              />
              
              <MBTICharacterCard
                character="John Dutton"
                type="ENTJ"
                traits={t.raw('yellowstone.john.traits')}
                prompt={t('yellowstone.john.prompt')}
              />
              
              <MBTICharacterCard
                character="Kayce Dutton"
                type="ISFP"
                traits={t.raw('yellowstone.kayce.traits')}
                prompt={t('yellowstone.kayce.prompt')}
              />
            </div>

            <div className="mt-12 bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-bold text-purple-800 mb-3">{t('yellowstone.analysis.title')}</h3>
              <p className="text-purple-700 mb-4">{t('yellowstone.analysis.description')}</p>
              <ListPoints points={t.raw('yellowstone.analysis.points')} />
            </div>
          </section>
        )}

        {/* Techniques Tab */}
        {activeTab === 'techniques' && (
          <section className="my-16">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full mb-4">
                ADVANCED TECHNIQUES
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('techniques.title')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('techniques.detailedPrompts.title')}</h3>
                <p className="text-gray-700 mb-6 text-lg">{t('techniques.detailedPrompts.description')}</p>
                
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{t('techniques.detailedPrompts.structure.title')}</h4>
                  <ListPoints points={t.raw('techniques.detailedPrompts.structure.elements')} />
                  
                  <PromptBox 
                    title="Advanced ENFP Character Prompt"
                    promptText={t('techniques.detailedPrompts.example')}
                  >
                    <div className="text-sm text-gray-600 mb-2">This comprehensive prompt demonstrates how to create detailed, multi-dimensional characters</div>
                    <div className="p-3 bg-gray-50 rounded font-mono text-xs">{t('techniques.detailedPrompts.example')}</div>
                  </PromptBox>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-teal-50 p-8 rounded-2xl shadow-lg border border-green-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('techniques.iterativeRefinement.title')}</h3>
                <p className="text-gray-700 mb-6 text-lg">{t('techniques.iterativeRefinement.description')}</p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { step: '1', title: t('techniques.iterativeRefinement.steps.step1.title'), desc: t('techniques.iterativeRefinement.steps.step1.description') },
                    { step: '2', title: t('techniques.iterativeRefinement.steps.step2.title'), desc: t('techniques.iterativeRefinement.steps.step2.description') },
                    { step: '3', title: t('techniques.iterativeRefinement.steps.step3.title'), desc: t('techniques.iterativeRefinement.steps.step3.description') }
                  ].map((step, index) => (
                    <div key={index} className="bg-white rounded-xl p-4 border border-gray-100">
                      <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold mb-3">
                        {step.step}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Advanced Tab */}
        {activeTab === 'advanced' && (
          <section className="my-16">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full mb-4">
                PROFESSIONAL APPLICATIONS
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('advanced.title')}</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('advanced.useCases.title')}</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: t('advanced.useCases.writers.title'),
                      description: t('advanced.useCases.writers.description'),
                      icon: 'pen'
                    },
                    {
                      title: t('advanced.useCases.rpg.title'),
                      description: t('advanced.useCases.rpg.description'),
                      icon: 'gamepad'
                    },
                    {
                      title: t('advanced.useCases.marketing.title'),
                      description: t('advanced.useCases.marketing.description'),
                      icon: 'megaphone'
                    },
                    {
                      title: t('advanced.useCases.psychology.title'),
                      description: t('advanced.useCases.psychology.description'),
                      icon: 'brain'
                    }
                  ].map((useCase, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-gray-900">{useCase.title}</h4>
                      <p className="text-gray-600 text-sm">{useCase.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-8 rounded-2xl shadow-lg border border-red-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('advanced.bestPractices.title')}</h3>
                <ListPoints points={t.raw('advanced.bestPractices.points')} />
              </div>
            </div>
          </section>
        )}

        {/* Benefits Section */}
        <section className="my-16 bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-6 rounded-3xl">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                {t('benefits.subtitle')}
              </span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                {t('benefits.title')}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </div>
            <div className="space-y-6">
              <ul className="space-y-4">
                {[
                  {
                    title: t('benefits.accuracy.title'),
                    description: t('benefits.accuracy.description')
                  },
                  {
                    title: t('benefits.efficiency.title'),
                    description: t('benefits.efficiency.description')
                  },
                  {
                    title: t('benefits.consistency.title'),
                    description: t('benefits.consistency.description')
                  },
                  {
                    title: t('benefits.creativity.title'),
                    description: t('benefits.creativity.description')
                  }
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <strong>{benefit.title}</strong> - {benefit.description}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="my-16">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full mb-4">
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>
          
          <FAQSection 
            faqs={[
              {
                question: "What is the accuracy of AI-generated MBTI characters?",
                answer: "AI-generated MBTI characters can achieve high accuracy when provided with detailed prompts and specific contexts. The key is to include clear personality traits, behavioral patterns, and situational responses in your prompts."
              },
              {
                question: "Can I use these characters for commercial projects?",
                answer: "Yes, characters generated using Curify's Nano Banana can be used for commercial projects, including novels, games, and marketing campaigns. However, ensure your characters are original and not direct copies of copyrighted material."
              },
              {
                question: "How do I ensure character consistency across different scenes?",
                answer: "Use iterative refinement by testing your character in various scenarios and maintaining consistent personality traits. Reference the core MBTI characteristics and decision-making patterns throughout your story."
              },
              {
                question: "What MBTI types work best for protagonists?",
                answer: "While any MBTI type can make a compelling protagonist, ENFP, ISTJ, ENTJ, and ISFP types often provide good balance of relatability and dramatic potential for storytelling."
              },
              {
                question: "Can I combine multiple MBTI traits for complex characters?",
                answer: "Yes, real people often exhibit traits from multiple MBTI types. You can create more nuanced characters by blending cognitive functions or showing character development that shifts emphasis between different traits."
              }
            ]}
          />
        </section>

        {/* Conclusion */}
        <section className="my-16">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">{t('conclusion.title')}</h2>
            <p className="text-lg">{t('conclusion.description')}</p>
          </div>
        </section>
      </article>

      {/* Related Blogs */}
      <RelatedBlogs currentSlug="mbti-character-generator" locale={locale} />
      
      {/* Structured Data for SEO */}
      <StructuredData
        title={t('hero.title')}
        description={t('hero.subtitle')}
        publishDate="2026-04-20"
        author="Curify AI Team"
        image="/images/advi.webp"
        url="/blog/mbti-character-generator"
        readTime="12 min read"
      />
    </div>
  );
}
