"use client";

import React, { useState } from 'react';

interface ToolsComparisonTableProps {
  translations: {
    toolsTitle: string;
    toolsContent: string;
  };
}

export default function ToolsComparisonTable({ translations }: ToolsComparisonTableProps) {
  const [selectedCategory, setSelectedCategory] = useState('visual');

  const categories = [
    { id: 'visual', label: 'Visual Generation', icon: '🎨' },
    { id: 'scripting', label: 'Script & Narrative', icon: '📝' },
    { id: 'voice', label: 'Voice & Audio', icon: '🎙️' },
    { id: 'video', label: 'Video Assembly', icon: '🎬' },
    { id: 'distribution', label: 'Distribution', icon: '📤' }
  ];

  const tools = {
    visual: [
      { name: 'Nano Banana', description: 'AI visual generation with consistent branding', price: 'Free tier', integration: '✅ Native' },
      { name: 'Midjourney', description: 'High-quality image generation', price: '$10-30/mo', integration: '⚠️ API only' },
      { name: 'DALL-E 3', description: 'OpenAI image generation', price: '$20/mo', integration: '⚠️ API only' }
    ],
    scripting: [
      { name: 'Curify Narrative', description: 'AI-powered storytelling and script generation', price: 'Included', integration: '✅ Native' },
      { name: 'ChatGPT', description: 'General purpose AI writing', price: '$20/mo', integration: '⚠️ Manual' },
      { name: 'Claude', description: 'Advanced reasoning and writing', price: '$20/mo', integration: '⚠️ Manual' }
    ],
    voice: [
      { name: 'Curify TTS', description: 'Natural text-to-speech with emotion', price: 'Included', integration: '✅ Native' },
      { name: 'ElevenLabs', description: 'Premium voice cloning', price: '$5-25/mo', integration: '⚠️ API only' },
      { name: 'Play.ht', description: 'Voice generation and cloning', price: '$39/mo', integration: '⚠️ API only' }
    ],
    video: [
      { name: 'Curify Video Editor', description: 'Automated video assembly', price: 'Included', integration: '✅ Native' },
      { name: 'Runway ML', description: 'AI video generation', price: '$12-35/mo', integration: '⚠️ Manual' },
      { name: 'Pika Labs', description: 'Text-to-video generation', price: '$10/mo', integration: '⚠️ Manual' }
    ],
    distribution: [
      { name: 'Curify Scheduler', description: 'Multi-platform automated posting', price: 'Included', integration: '✅ Native' },
      { name: 'Buffer', description: 'Social media management', price: '$6-120/mo', integration: '⚠️ Limited' },
      { name: 'Hootsuite', description: 'Enterprise social scheduling', price: '$49-739/mo', integration: '⚠️ Limited' }
    ]
  };

  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        🛠️ Complete Tools Comparison
      </h3>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === category.id
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Tools Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 border-b border-purple-200">
                  Tool
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 border-b border-purple-200">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 border-b border-purple-200">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-purple-900 border-b border-purple-200">
                  Integration
                </th>
              </tr>
            </thead>
            <tbody>
              {tools[selectedCategory as keyof typeof tools].map((tool, index) => (
                <tr
                  key={tool.name}
                  className={`border-b transition-colors hover:bg-purple-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    <div className="flex items-center">
                      {tool.integration === '✅ Native' && (
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      )}
                      {tool.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {tool.description}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-medium ${
                      tool.price === 'Included' || tool.price.includes('Free')
                        ? 'text-green-600'
                        : 'text-gray-900'
                    }`}>
                      {tool.price}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-medium ${
                      tool.integration === '✅ Native' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {tool.integration}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-8 bg-gradient-to-r from-purple-100 to-blue-100 p-6 rounded-xl border-2 border-purple-300">
        <h4 className="text-lg font-bold text-purple-900 mb-3">
          💡 Curify Recommendation
        </h4>
        <p className="text-gray-700 leading-relaxed">
          While individual tools work, <strong>Curify's integrated ecosystem</strong> eliminates tool-switching overhead and provides seamless workflow automation. Start with Nano Banana for visuals, add narrative tools for scripting, then integrate TTS and distribution for complete pipeline automation.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✅ Unified Workflow
          </span>
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✅ Cost Effective
          </span>
          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
            ✅ Native Integration
          </span>
        </div>
      </div>
    </div>
  );
}
