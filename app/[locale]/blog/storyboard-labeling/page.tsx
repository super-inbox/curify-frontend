'use client';


/**
 * 🎬 AI-Powered Scene Detection & Storyboard Generation
 * 
 * Transform raw video into professional storyboards with our advanced AI pipeline.
 * This comprehensive guide showcases how we analyze video content, detect scenes,
 * and generate structured storyboards automatically.
 * 
 * Features:
 * - 🎥 Frame-by-frame video analysis
 * - 🖼️ Automatic scene boundary detection
 * - 🏷️ AI-powered scene labeling
 * - 📊 Structured JSON output
 * - ⚡ Real-time processing capabilities
 * " add some human envaluation "

 */

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import CdnImage from '@/app/[locale]/_components/CdnImage';
import CdnVideo from "../../_components/CdnVideo";

// Import scene analysis data from JSON file
import dreamScenes from '@/public/data/dream-scene-analysis.json';

// Use the imported scenes data
const inceptionScenes = dreamScenes;
        

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

// Main component for the Scene Detection blog post
export default function SceneDetectionPage() {
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);
  const t = useTranslations('SceneDetection');
  
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pt-20">
      <article className="prose prose-base md:prose-lg">
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
          <p className="text-lg text-gray-600 mb-4">
            {t.rich('introduction.paragraph1', {
              strong: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <p className="text-lg text-gray-700 mb-4">
            {t('introduction.paragraph2')}
          </p>
          <div className="flex flex-wrap gap-4 mt-6">
  <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
    {t('tags.computerVision')}
  </span>
  <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
    {t('tags.deepLearning')}
  </span>
  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
    {t('tags.realTimeAnalysis')}
  </span>
</div>
        </div>
        
        <div className="relative w-full h-96 rounded-xl overflow-hidden mb-12">
          <CdnImage
            src="/blog/storyboard-labeling-hero.jpg"
            alt="AI analyzing video scenes and generating storyboards"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
            <p className="text-white/80 text-sm">
              {t('imageAlt')}
            </p>
          </div>
        </div>
      </div>

      {/* Pro Tip Section */}
      <ProTip>
        {t('protip')}
      </ProTip>

      {/* Technical Implementation */}
      <section className="my-16">
        <div className="text-center mb-10">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-4">TECHNICAL DEEP DIVE</span>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">{t('Technical.steps.step1')}</h2>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold mr-4">1</div>
              <h3 className="text-2xl font-bold text-gray-900">{t('Technical.steps.step2')}</h3>
            </div>
            <p className="text-gray-700 mb-4 text-lg">{t('Technical.steps.step2Text')}</p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('features1')}</h4>
                  <p className="text-sm text-gray-600">{t('features1Text')}</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <svg className="w-6 h-6 text-purple-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('features5')}</h4>
                  <p className="text-sm text-gray-600">{t('features5Text')}</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <svg className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('features4')}</h4>
                  <p className="text-sm text-gray-600">{t('features4Text')}</p>
                </div>
              </div>
              <div className="flex items-start p-4 bg-gray-50 rounded-lg">
                <svg className="w-6 h-6 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-gray-900">{t('features3')}</h4>
                  <p className="text-sm text-gray-600">{t('features3Text')}</p>
                </div>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-gray-200">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
              <div className="relative p-6 bg-white/80 backdrop-blur-sm">
                <div className="flex items-center mb-4">
                  <div className="flex space-x-2 mr-4">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                 
                </div>
                
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-lg border border-blue-100">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 text-xl font-bold mr-4">2</div>
              <h3 className="text-2xl font-bold text-gray-900">{t('featuresTitle')}</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{t('features1')}</h4>
                <p className="text-gray-600 text-sm">{t('features1Text')}</p>
              </div>
              
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{t('features2')}</h4>
                <p className="text-gray-600 text-sm">{t('features2Text')}</p>
              </div>
              
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{t('features4')}</h4>
                <p className="text-gray-600 text-sm">{t('features4Text')}</p>
              </div>
              
              <div className="group p-5 bg-white rounded-xl border border-gray-100 hover:border-yellow-200 hover:shadow-md transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-4 group-hover:bg-yellow-100 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-gray-900">{t('features5')}</h4>
<p className="text-gray-600 text-sm">{t('features5Text')}</p>
              </div>
            </div>
            
            <div className="mt-8 p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {t('performance.title')}
              </h4>
              <div className="flex flex-wrap gap-3">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                  ⚡ {t('performance.features.speed')}
                </div>
                <div className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                  🖥️ {t('performance.features.memory')}
                </div>
                <div className="px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                  🔄 {t('performance.features.parallel')}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center mb-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 text-xl font-bold mr-4">3</div>
              <h3 className="text-2xl font-bold text-gray-900">{t('richStructuredOutput')}</h3>
            </div>
            
            <p className="text-gray-700 mb-6 text-lg">{t('richStructuredOutputText')}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">storyboard.json</span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-xs text-gray-300 overflow-x-auto">
                    <code>
                      {`{
  "scenes": [
    {
      "scene_id": 1,
      "start_time": 0.0,
      "end_time": 5.2,
      "key_frame": "path/to/keyframe.jpg",
      "shot_type": "establishing",
      "camera_move": "static",
      "detected_objects": ["person", "car", "building"]
    }
  ],
  "metadata": {
    "duration": 120.5,
    "resolution": "1920x1080",
    "fps": 30
  }
}`.split('\n').map((line, i) => {
                      // Apply syntax highlighting
                      const keyMatch = line.match(/"([^"]+)":/);
                      const stringMatch = line.match(/: "([^"]+)"/);
                      const numberMatch = line.match(/:\s*([0-9.]+)/);
                      
                      return (
                        <div key={i} className="whitespace-pre">
                          {line.split('"').map((part, j, arr) => {
                            if (j % 2 === 1) {
                              // Inside a string
                              if (keyMatch && keyMatch[1] === part) {
                                return <span key={j} className="text-blue-400">"{part}"</span>;
                              } else if (stringMatch && stringMatch[1] === part) {
                                return <span key={j} className="text-green-400">"{part}"</span>;
                              } else {
                                return `"${part}"`;
                              }
                            } else {
                              // Outside a string
                              if (numberMatch && numberMatch[1]) {
                                const [before, after] = part.split(numberMatch[1]);
                                return (
                                  <span key={j}>
                                    {before}
                                    <span className="text-yellow-300">{numberMatch[1]}</span>
                                    {after}
                                  </span>
                                );
                              }
                              return part;
                            }
                          })}
                        </div>
                      );
                    })}
                    </code>
                  </pre>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-5 bg-indigo-50 rounded-xl border border-indigo-100">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {t('features10.export.title')}
                  </h4>
                  <ul className="text-sm text-gray-700 space-y-1.5">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('features10.export.title')}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('features10.export.title')}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('features10.export.title')}</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{t('features10.export.title')}</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-5 bg-blue-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                    </svg>
                    {t('features10.export.title')}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    <div className="text-center p-2 bg-white rounded-lg border border-gray-200">
                      <div className="text-xs font-mono font-medium text-gray-500">JSON</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-100 mt-6">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4m-8-8l-4 4 4 4" />
                </svg>
                {t('integration.title')}
              </h4>
              <p className="text-sm text-gray-700 mb-3"> {(t('integration.description'))}:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">Python</span>
                <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">JavaScript</span>
                <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">Node.js</span>
                <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">React</span>
                <span className="px-2.5 py-1 bg-white text-xs font-medium text-gray-700 rounded-full border border-gray-200">Vue</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
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
        title: t('features.modularArchitecture.title'),
        description: t('features.modularArchitecture.description')
      },
      {
        title: t('features.performance.title'),
        description: t('features.performance.description')
      },
      {
        title: t('features.aiEnhanced.title'),
        description: t('features.aiEnhanced.description')
      }
    ].map((feature, index) => (
      <li key={index} className="flex items-start">
        <svg className="h-6 w-6 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <strong>{feature.title}</strong> - {feature.description}
        </div>
      </li>
    ))}
  </ul>
</div>
        </div>
      </section>


      {/* Advanced Usage */}
      <section className="my-16">
  <div className="relative">
    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl opacity-10 blur"></div>
    <div className="relative bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
      <h2 className="text-3xl font-bold mb-4 text-gray-900">
        {t('advancedUsage.title')}
      </h2>
      
      <p className="text-gray-600 mb-8 text-lg">
        {t('advancedUsage.description')}
      </p>

      <div className="space-y-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            {t('advancedUsage.features.thresholds.title')}
          </h3>
          <p className="text-gray-700 mb-3">
            {t('advancedUsage.features.thresholds.description')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            {t('advancedUsage.features.aiAnalysis.title')}
          </h3>
          <p className="text-gray-700 mb-3">
            {t('advancedUsage.features.aiAnalysis.description')}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-blue-700 mb-3">
            {t('advancedUsage.features.outputCustomization.title')}
          </h3>
          <p className="text-gray-700 mb-3">
            {t('advancedUsage.features.outputCustomization.description')}
          </p>
        </div>
      </div>

      <div className="mt-12 bg-blue-50 p-6 rounded-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          {t('advancedUsage.integration.title')}
        </h3>
        <p className="text-gray-700 mb-6">
          {t('advancedUsage.integration.description')}
        </p>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">1</span>
            <div>
              <strong>{t('advancedUsage.integration.tools.editingSoftware.title')}</strong> - {t('advancedUsage.integration.tools.editingSoftware.description')}
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">2</span>
            <div>
              <strong>{t('advancedUsage.integration.tools.cms.title')}</strong> - {t('advancedUsage.integration.tools.cms.description')}
            </div>
          </li>
          <li className="flex items-start">
            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-full">3</span>
            <div>
              <strong>{t('advancedUsage.integration.tools.aiTraining.title')}</strong> - {t('advancedUsage.integration.tools.aiTraining.description')}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>


    

<div className="mt-10">
  <h4 className="text-xl font-semibold mb-4 text-gray-800">{t('inceptionExample.title')}</h4>
  <p className="text-gray-600 mb-4">
    {t('inceptionExample.description')}
  </p>
  <div className="rounded-xl overflow-hidden border border-gray-200">
    <CdnVideo
      src="/videos/dream.mp4"
      controls
      className="w-full"
    />
    <div className="bg-gray-50 p-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        <span className="font-medium">{t('inceptionExample.analysis')}: </span> {t('inceptionExample.analysisText')}
      </p>
    </div>
  </div>
</div>

<div className="mt-8">
  <h5 className="text-lg font-semibold mb-3 text-gray-700">{t('inceptionExample.breakdownTitle')}</h5>
  <div className="space-y-6">
    {inceptionScenes.scenes.slice(0, 5).map((scene, index) => (
      <div key={index} className="bg-white rounded-lg border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div>
  <h6 className="font-medium text-gray-900">
    {t('Scene')} {scene.scene_id} ({scene.scene_metadata.duration.toFixed(2)}s)
  </h6>
  <p className="text-sm text-gray-600 mt-1">{scene.scene_metadata.description}</p>
  <div className="mt-2 flex items-center text-xs text-gray-500">
    <span className="mr-3">
      {t('inceptionExample.sceneCard.mood')}: {scene.scene_metadata.mood}
    </span>
    <span>
      {t('inceptionExample.sceneCard.environment')}: {scene.scene_metadata.environment}
    </span>
  </div>
</div>
          <div className="flex space-x-1">
            {scene.scene_metadata.color_palette.slice(0, 5).map((color, i) => (
              <div 
                key={i} 
                className="w-4 h-4 rounded-full border border-gray-200" 
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
        {scene.shots?.[0]?.shot.notes && (
          <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-medium">{t('inceptionExample.sceneCard.shotNotes')}:</span> {scene.shots[0].shot.notes}
          </div>
        )}
      </div>
    ))}
  </div>
  <div className="mt-6 text-center">
    <button 
      onClick={() => setShowFullAnalysis(!showFullAnalysis)}
      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
    >
      {showFullAnalysis ? t('inceptionExample.hideFullAnalysis') : t('inceptionExample.showFullAnalysis')}
    </button>
    {showFullAnalysis && (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
        <pre className="text-xs text-gray-700 overflow-x-auto max-h-96">
          {JSON.stringify(inceptionScenes, null, 2)}
        </pre>
      </div>
    )}
  </div>
</div>

<div className="mt-10">
  <h4 className="text-xl font-semibold mb-4 text-gray-800">{t('titanicExample.title')}</h4>
  <p className="text-gray-600 mb-4">
    {t('titanicExample.description')}
  </p>
  <div className="rounded-xl overflow-hidden border border-gray-200">
    <CdnVideo
      src="/videos/titan.mp4"
      controls
      className="w-full"
    />
    <div className="bg-gray-50 p-4 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        <span className="font-medium">{t('titanicExample.analysis')}</span> {t('titanicExample.analysisText')}
      </p>
    </div>
  </div>
</div>
    
    </section>

      {/* Scene Breakdown Section */}
    <section className="my-16">
        <h2 className="text-3xl font-bold mb-8 text-gray-900">
          {t('sceneBreakdown.title')}
        </h2>
        
        <p className="text-gray-600 mb-8 text-lg">
          {t('sceneBreakdown.introduction')}
        </p>

        <div className="space-y-12">
          {((t.raw('sceneBreakdown.scenes') as any[]) || []).map((scene: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-xl font-semibold text-blue-700 mb-3">
                {scene.title}
              </h3>
              <p className="text-gray-700 mb-3">{scene.content}</p>
              <div className="space-y-4 mt-3">
                <div className="bg-gray-50 p-3 rounded-md text-sm text-gray-600 font-mono">
                  {scene.example}
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">JSON Structure:</p>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
                    <code>{JSON.stringify(scene.jsonExample, null, 2)}</code>
                  </pre>
                  <p className="text-xs text-gray-500 mt-1">{scene.jsonDescription}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 p-6 rounded-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            {t('sceneBreakdown.analysisTitle')}
          </h3>
          <p className="text-gray-700 mb-6">
            {t('sceneBreakdown.analysisContent')}
          </p>
          
          <div className="mt-6">
            <h4 className="text-xl font-semibold text-gray-800 mb-3">
              {t('sceneBreakdown.fullExampleTitle')}
            </h4>
            <p className="text-gray-700 mb-4">
              {t('sceneBreakdown.fullExampleDescription')}
            </p>
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
              <code>{JSON.stringify(t.raw('sceneBreakdown.fullExample'), null, 2)}</code>
            </pre>
          </div>
          
          <h4 className="text-xl font-semibold text-gray-800 mb-3">
            {t('sceneBreakdown.benefitsTitle')}
          </h4>
          <ul className="space-y-2">
            {(t.raw('sceneBreakdown.benefits') as string[]).map((benefit: string, index: number) => (
              <li key={index} className="flex items-start" dangerouslySetInnerHTML={{ __html: benefit }} />
            ))}
          </ul>
        </div>
      </section>

{/* Conclusion Section */}
      <section className="prose prose-lg max-w-none mt-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('conclusion.title')}
        </h2>
        <p className="text-gray-600 mb-4">
          {t.rich('conclusion.p1', {
            strong: (chunks) => <strong>{chunks}</strong>
          })}
        </p>
        <p className="text-gray-600">
          {t.rich('conclusion.p2', {
            strong: (chunks) => <strong>{chunks}</strong>
          })}
        </p>
      </section>
    </article>
  </div>
  );
}

