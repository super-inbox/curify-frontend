"use client";

import React from 'react';
import Link from 'next/link';
import PipelineWorkflowDiagram from './PipelineWorkflowDiagram';
import ToolsComparisonTable from './ToolsComparisonTable';

interface AIFacelessChannelPipelineContentProps {
  slug: string;
  translations: {
    whatIsTitle: string;
    whatIsContent: string;
    whyTitle: string;
    whyContent: string;
    howTitle: string;
    step1Title: string;
    step1Content: string;
    step2Title: string;
    step2Content: string;
    step3Title: string;
    step3Content: string;
    step4Title: string;
    step4Content: string;
    step5Title: string;
    step5Content: string;
    toolsTitle: string;
    toolsContent: string;
    curifyTitle: string;
    curifyContent: string;
    ctaLink: string;
    ctaText: string;
    monetizationTitle: string;
    monetizationContent: string;
    examplesTitle: string;
    examplesContent: string;
    metricsTitle: string;
    metricsContent: string;
    scalingTitle: string;
    scalingContent: string;
    conclusionTitle: string;
    conclusionContent: string;
  };
  locale: string;
}

export default function AIFacelessChannelPipelineContent({ slug, translations, locale }: AIFacelessChannelPipelineContentProps) {
  return (
    <div className="prose prose-lg max-w-none">
      {/* Hero Section */}
      <section className="mb-12 p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
        <h2 className="text-3xl font-bold text-purple-900 mb-4">
          {translations.whatIsTitle}
        </h2>
        <p className="text-lg text-gray-700 leading-relaxed">
          {translations.whatIsContent}
        </p>
      </section>

      {/* Why Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🚀</span>
          {translations.whyTitle}
        </h2>
        <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
          <p className="text-lg text-gray-700 leading-relaxed">
            {translations.whyContent}
          </p>
        </div>
      </section>

      {/* Interactive Pipeline Workflow */}
      <PipelineWorkflowDiagram translations={translations} />
      
      {/* Pipeline Steps */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <span className="text-2xl mr-3">⚡</span>
          {translations.howTitle}
        </h2>
        
        <div className="space-y-8">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <h3 className="text-xl font-bold text-purple-900">
                {translations.step1Title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {translations.step1Content}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <h3 className="text-xl font-bold text-blue-900">
                {translations.step2Title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {translations.step2Content}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-6 rounded-xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <h3 className="text-xl font-bold text-green-900">
                {translations.step3Title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {translations.step3Content}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-orange-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <h3 className="text-xl font-bold text-orange-900">
                {translations.step4Title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {translations.step4Content}
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white p-6 rounded-xl border-2 border-red-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-start mb-4">
              <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                5
              </div>
              <h3 className="text-xl font-bold text-red-900">
                {translations.step5Title}
              </h3>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {translations.step5Content}
            </p>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🛠️</span>
          {translations.toolsTitle}
        </h2>
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            {translations.toolsContent}
          </p>
        </div>
        
        {/* Interactive Tools Comparison */}
        <ToolsComparisonTable translations={translations} />
      </section>

      {/* Curify Section */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 rounded-2xl text-white">
          <h2 className="text-3xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-3">⭐</span>
            {translations.curifyTitle}
          </h2>
          <p className="text-lg leading-relaxed">
            {translations.curifyContent}
          </p>
        </div>
      </section>

      {/* Monetization Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">💰</span>
          {translations.monetizationTitle}
        </h2>
        <div className="bg-green-50 p-6 rounded-xl border border-green-200">
          <p className="text-lg text-gray-700 leading-relaxed">
            {translations.monetizationContent}
          </p>
        </div>
      </section>

      {/* Examples Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🎯</span>
          {translations.examplesTitle}
        </h2>
        <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
          <p className="text-lg text-gray-700 leading-relaxed">
            {translations.examplesContent}
          </p>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">📊</span>
          {translations.metricsTitle}
        </h2>
        <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-200">
          <p className="text-lg text-gray-700 leading-relaxed">
            {translations.metricsContent}
          </p>
        </div>
      </section>

      {/* Scaling Section */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">📈</span>
          {translations.scalingTitle}
        </h2>
        <div className="bg-pink-50 p-6 rounded-xl border border-pink-200">
          <p className="text-lg text-gray-700 leading-relaxed">
            {translations.scalingContent}
          </p>
        </div>
      </section>

      {/* Conclusion */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
          <span className="text-2xl mr-3">🎉</span>
          {translations.conclusionTitle}
        </h2>
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-8 rounded-2xl border-2 border-purple-300">
          <p className="text-lg text-gray-800 leading-relaxed font-medium">
            {translations.conclusionContent}
          </p>
        </div>
      </section>
    </div>
  );
}
