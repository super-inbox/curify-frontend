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
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import BlogCTACard from "@/app/[locale]/_components/BlogCTACard";
import ShareButton from "@/app/[locale]/_components/ShareButton";
import StructuredData from "@/app/[locale]/(public)/blog/[slug]/components/StructuredData";
import PromptBox from "@/app/[locale]/(public)/blog/[slug]/components/PromptBox";
import NanoBananaExamples from "@/app/[locale]/(public)/blog/[slug]/NanoBananaExamples";
import BlogCategoryLabel from "@/app/[locale]/_components/BlogCategoryLabel";
import AutoTableOfContents from "@/app/[locale]/_components/AutoTableOfContents";

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
  const t = useTranslations('MBTICharacterGeneratorGuide');
  const locale = useLocale();

  return (
    <div className="mx-auto max-w-7xl pt-10 pb-8 px-4 md:px-6">
      <article className="prose prose-base md:prose-lg max-w-none">
        {/* Hero — plain bold heading + subtitle (was a gradient-blur halo
            + gradient-clip title, dropped per docs/blog-quality.md polish
            pass). */}
        <header className="mb-10">
          <AutoTableOfContents />
          <BlogCategoryLabel slug="mbti-character-generator" />
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3 text-gray-900">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('hero.subtitle')}
          </p>
        </header>

        {/* Introduction — plain prose paragraphs (was a gradient card with
            three decorative tag chips, dropped per polish pass). */}
        <div className="mb-12 space-y-4">
          <p className="text-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph1')) }}
          />
          <p className="text-lg text-gray-700"
            dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph2')) }}
          />
        </div>

        {/* Universe Templates — moved up to replace TOC (2026-06-07).
            10 universe MBTI templates (trimmed from 12) — 2 rows on lg
            (5 cols × 2). Pulls cards from blogs.json via groupKey prefix
            mbti-character-generator-universe-*. */}
        <section id="universes" className="my-12">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-3">
              UNIVERSE TEMPLATES
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('universes.title')}</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">{t('universes.description')}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full mt-3"></div>
          </div>
          <NanoBananaExamples locale={locale} blogSlug="mbti-character-generator-universe" />
        </section>

        {/* Social Share */}
        <ShareButton
          url="/blog/mbti-character-generator"
          title={t('hero.title')}
        />

        {/* Pro Tip Section */}
        <ProTip>
          {t('protip')}
        </ProTip>

        {/* Basics Section */}
        <section id="basics" className="my-16">
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

        {/* Yellowstone Section — kept as a deep-dive case study */}
        <section id="yellowstone" className="my-16">
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
            </div>

            <div className="mt-12 bg-purple-50 p-6 rounded-xl border border-purple-100">
              <h3 className="text-xl font-bold text-purple-800 mb-3">{t('yellowstone.analysis.title')}</h3>
              <p className="text-purple-700 mb-4">{t('yellowstone.analysis.description')}</p>
              <ListPoints points={t.raw('yellowstone.analysis.points')} />
            </div>
          </section>

        {/* Beyond Single Characters — grid / contrast / relationship / stereotype / animal */}
        <section id="beyond" className="my-16">
          <div className="text-center mb-10">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-amber-700 bg-amber-100 rounded-full mb-4">
              BEYOND SINGLE CHARACTERS
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('beyond.title')}</h2>
            <p className="text-gray-700 max-w-2xl mx-auto">{t('beyond.description')}</p>
            <div className="w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mx-auto rounded-full mt-4"></div>
          </div>
          <NanoBananaExamples locale={locale} blogSlug="mbti-character-generator-beyond" />
        </section>

        {/* Techniques Section */}
        <section id="techniques" className="my-16">
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

        {/* Advanced / Professional Use Section */}
        <section id="advanced" className="my-16">
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

        {/* Conclusion — plain close, no gradient banner. The
            BlogCTACard below carries the next-step action. */}
        <section id="conclusion" className="my-16">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t('conclusion.title')}
          </h2>
          <p className="text-lg text-gray-700">
            {t('conclusion.description')}
          </p>
        </section>
      </article>

      {/* CTA — slug-level override in BlogCTACard.tsx points at /topics/character
          + creators playbook (per the 22-click reader-intent finding). */}
      <BlogCTACard
        category="nano-template"
        slug="mbti-character-generator"
        locale={locale}
      />

      {/* Related Blogs */}
      <RelatedBlogs currentSlug="mbti-character-generator" locale={locale} />

      {/* Structured Data for SEO */}
      <StructuredData
        title={t('hero.title')}
        description={t('hero.subtitle')}
        publishDate="2026-04-20"
        image="/images/advi.webp"
        url="/blog/mbti-character-generator"
        readTime="12 min read"
      />
    </div>
  );
}
