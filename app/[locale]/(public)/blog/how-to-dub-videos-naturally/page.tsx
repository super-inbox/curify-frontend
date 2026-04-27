'use client';

/**
 * How to Dub Videos Naturally in 2026: Fixing AI Voice Cloning Artifacts
 * 
 * A comprehensive guide to solving common dubbing challenges with AI tools.
 * Focus on pain points like robotic pacing, lack of emotion, and lip-sync issues.
 * Provides practical solutions using MuseTalk, Emotion TTS, and other advanced tools.
 * 
 * Features:
 * - Problem-solving approach to AI dubbing artifacts
 * - Step-by-step workflow for natural voice dubbing
 * - Tool recommendations and integration strategies
 * - Reference to existing Curify content for internal linking
 */

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import RelatedBlogs from "../../../_components/RelatedBlogs";
import TableOfContents from "@/app/[locale]/(public)/blog/[slug]/components/TableOfContents";
import ShareButton from "@/app/[locale]/_components/ShareButton";
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

// Main component
export default function HowToDubVideosNaturallyPage() {
  const [activeTab, setActiveTab] = useState('problems');
  const t = useTranslations('HowToDubVideosNaturally');
  const locale = useLocale();

  return (
    <div className="pt-10 pb-8">
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation 
        items={[
          { name: "Home", href: "/" },
          { name: "Blog", href: "/blog" },
          { name: t('hero.title'), href: `/blog/how-to-dub-videos-naturally` }
        ]}
      />
      
      <article className="prose prose-base md:prose-lg">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl blur opacity-20"></div>
          <h1 className="relative text-3xl md:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            {t('hero.title')}
          </h1>
          <p className="text-xl text-gray-600 mt-4">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Blog Post Image */}
        <div className="mb-8">
          <CdnImage
            src="/images/photoshoot.webp"
            alt={t('hero.title')}
            width={1200}
            height={675}
            className="rounded-lg shadow-lg"
          />
        </div>

        {/* Introduction */}
        <section className="prose prose-lg max-w-none mb-12">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100 mb-8">
            <p className="text-lg text-gray-700 mb-4"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph1')) }}
            />
            <p className="text-lg text-gray-700"
              dangerouslySetInnerHTML={{ __html: decodeHTMLEntities(t('introduction.paragraph2')) }}
            />
          </div>
        </section>

        {/* Table of Contents */}
        <TableOfContents 
          headings={[
            { level: "2", text: t('tabs.problems'), id: "problems" },
            { level: "2", text: t('tabs.solutions'), id: "solutions" },
            { level: "2", text: t('tabs.tools'), id: "tools" },
            { level: "2", text: t('tabs.workflow'), id: "workflow" },
            { level: "2", text: t('tabs.advanced'), id: "advanced" },
            { level: "2", text: t('tabs.automation'), id: "automation" },
            { level: "2", text: t('tabs.conclusion'), id: "conclusion" }
          ]}
        />

        {/* Social Share */}
        <ShareButton
          url="/blog/how-to-dub-videos-naturally"
          title={t('hero.title')}
        />

        {/* Pro Tip Section */}
        <ProTip>
          {t('protip')}
        </ProTip>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['problems', 'solutions', 'tools', 'workflow', 'advanced', 'automation'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  ${activeTab === tab
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                `}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'problems' && (
            <section id="problems" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full mb-4">
                  COMMON DUBBING PROBLEMS
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('problems.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-orange-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {t.raw('problems.issues').map((issue: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {issue.icon} {issue.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{issue.description}</p>
                    <div className="bg-red-50 border-l-4 border-red-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">{issue.impact}</h4>
                      <p className="text-red-700">{issue.impactDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'solutions' && (
            <section id="solutions" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-green-700 bg-green-100 rounded-full mb-4">
                  PRACTICAL SOLUTIONS
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('solutions.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-green-500 to-teal-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {t.raw('solutions.methods').map((solution: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {solution.icon} {solution.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{solution.description}</p>
                    <div className="bg-green-50 border-l-4 border-green-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">{solution.benefit}</h4>
                      <p className="text-green-700">{solution.benefitDescription}</p>
                    </div>
                    <PromptBox 
                      title={solution.promptTitle}
                      promptText={solution.prompt}
                    >
                      <div className="text-sm text-gray-600 mb-2">{solution.promptDescription}</div>
                      <div className="p-3 bg-gray-50 rounded font-mono text-xs">{solution.prompt}</div>
                    </PromptBox>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'tools' && (
            <section id="tools" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">
                  RECOMMENDED TOOLS
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('tools.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 mx-auto rounded-full"></div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {t.raw('tools.recommendations').map((tool: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {tool.icon} {tool.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{tool.description}</p>
                    <div className="bg-blue-50 border-l-4 border-blue-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">{tool.useCase}</h4>
                      <p className="text-blue-700">{tool.useCaseDescription}</p>
                    </div>
                    <div className="mt-4">
                      <Link
                        href={tool.link}
                        className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('tools.cta')}
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'workflow' && (
            <section id="workflow" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-purple-700 bg-purple-100 rounded-full mb-4">
                  STEP-BY-STEP WORKFLOW
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('workflow.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-purple-500 to-indigo-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {t.raw('workflow.steps').map((step: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold mr-3">
                        {index + 1}
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{step.description}</p>
                    <div className="bg-purple-50 border-l-4 border-purple-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">{step.action}</h4>
                      <p className="text-purple-700">{step.actionDescription}</p>
                    </div>
                    <PromptBox 
                      title={step.promptTitle}
                      promptText={step.prompt}
                    >
                      <div className="text-sm text-gray-600 mb-2">{step.promptDescription}</div>
                      <div className="p-3 bg-gray-50 rounded font-mono text-xs">{step.prompt}</div>
                    </PromptBox>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'advanced' && (
            <section id="advanced" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-indigo-700 bg-indigo-100 rounded-full mb-4">
                  ADVANCED TECHNIQUES
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('advanced.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {t.raw('advanced.techniques').map((technique: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {technique.icon} {technique.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{technique.description}</p>
                    <div className="bg-indigo-50 border-l-4 border-indigo-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-2">{technique.benefit}</h4>
                      <p className="text-indigo-700">{technique.benefitDescription}</p>
                    </div>
                    <PromptBox 
                      title={technique.promptTitle}
                      promptText={technique.prompt}
                    >
                      <div className="text-sm text-gray-600 mb-2">{technique.promptDescription}</div>
                      <div className="p-3 bg-gray-50 rounded font-mono text-xs">{technique.prompt}</div>
                    </PromptBox>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'automation' && (
            <section id="automation" className="my-16">
              <div className="text-center mb-10">
                <span className="inline-block px-3 py-1 text-sm font-semibold text-orange-700 bg-orange-100 rounded-full mb-4">
                  AUTOMATION STRATEGIES
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('automation.title')}</h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
              </div>

              <div className="space-y-8">
                {t.raw('automation.strategies').map((strategy: any, index: number) => (
                  <div key={index} className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                      {strategy.icon} {strategy.title}
                    </h3>
                    <p className="text-gray-700 mb-4">{strategy.description}</p>
                    <div className="bg-orange-50 border-l-4 border-orange-200 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 mb-2">{strategy.result}</h4>
                      <p className="text-orange-700">{strategy.resultDescription}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Conclusion */}
        <section className="my-16">
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">{t('conclusion.title')}</h2>
            <p className="text-lg">{t('conclusion.description')}</p>
          </div>
        </section>
      </article>

      {/* Related Blogs */}
      <RelatedBlogs currentSlug="how-to-dub-videos-naturally" locale={locale} />
      
      {/* Structured Data for SEO */}
      <StructuredData
        title={t('hero.title')}
        description={t('hero.subtitle')}
        publishDate="2026-04-20"
        author="Curify AI Team"
        image="/images/photoshoot.webp"
        url="/blog/how-to-dub-videos-naturally"
        readTime="15 min read"
      />
    </div>
  );
}
