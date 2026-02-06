"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Template = {
  id: string;
  category: string;
  language: "zh" | "en";
  description: string;
  base_prompt: string;
  parameters: Array<{
    name: string;
    label: string;
    type: "text" | "textarea" | "select";
    placeholder?: string;
    options?: string[];
  }>;
  candidates: Record<string, any>[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
};

interface TemplatePageClientProps {
  template: Template;
  locale: string;
}

export function TemplatePageClient({ template, locale }: TemplatePageClientProps) {
  const router = useRouter();
  const [selectedCandidate, setSelectedCandidate] = useState<number>(0);
  const [customParams, setCustomParams] = useState<Record<string, string>>(template.candidates[0] || {});
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCandidateSelect = (index: number) => {
    setSelectedCandidate(index);
    setCustomParams(template.candidates[index]);
  };

  const handleParamChange = (paramName: string, value: string) => {
    setCustomParams(prev => ({ ...prev, [paramName]: value }));
  };

  const generatePrompt = (): string => {
    let prompt = template.base_prompt;
    Object.entries(customParams).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      prompt = prompt.replace(regex, value);
    });
    return prompt;
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate API call - replace with actual generation logic
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const prompt = generatePrompt();
    console.log("Generated prompt:", prompt);
    
    // Here you would call your actual image generation API
    // const result = await generateImage({ prompt, template_id: template.id });
    
    setIsGenerating(false);
  };

  const isValid = template.parameters.every(param => customParams[param.name]?.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="border-b-2 border-purple-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="rounded-xl p-2 hover:bg-purple-50 transition-colors"
                aria-label="Go back"
              >
                <svg className="w-6 h-6 text-neutral-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">💡</span>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {template.category}
                  </h1>
                </div>
                <p className="text-neutral-600">{template.description}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Candidates Selection */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
              <h2 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-7 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                快速选择示例
              </h2>
              <p className="text-sm text-neutral-600 mb-6">
                从 {template.candidates.length} 个预设示例中选择，或自定义参数生成
              </p>
              
              <div className="grid grid-cols-2 gap-3 max-h-[600px] overflow-y-auto">
                {template.candidates.map((candidate, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCandidateSelect(idx)}
                    className={`text-left p-4 rounded-2xl transition-all border-2 ${
                      selectedCandidate === idx
                        ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 shadow-lg scale-105"
                        : "bg-white border-purple-100 hover:bg-purple-50 hover:border-purple-200"
                    }`}
                  >
                    <div className="space-y-2">
                      {Object.entries(candidate).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-semibold text-purple-700 block mb-1">{key}:</span>
                          <span className="text-neutral-700 font-medium">{value as string}</span>
                        </div>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Parameters */}
            <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4">自定义参数</h3>
              <div className="space-y-4">
                {template.parameters.map(param => (
                  <div key={param.name}>
                    <label className="block text-sm font-semibold text-neutral-700 mb-2">
                      {param.label}
                    </label>
                    {param.type === "textarea" ? (
                      <textarea
                        value={customParams[param.name] || ""}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                    ) : param.type === "select" ? (
                      <select
                        value={customParams[param.name] || ""}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      >
                        <option value="">选择 {param.label}</option>
                        {param.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={customParams[param.name] || ""}
                        onChange={(e) => handleParamChange(param.name, e.target.value)}
                        placeholder={param.placeholder}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Prompt Preview & Generate */}
          <div className="space-y-6">
            {/* Prompt Preview */}
            <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6 shadow-lg sticky top-28">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                生成提示词预览
              </h3>
              
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 border-2 border-purple-100 max-h-96 overflow-y-auto">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono leading-relaxed">
                  {generatePrompt()}
                </pre>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={!isValid || isGenerating}
                className={`w-full px-6 py-4 rounded-2xl font-bold text-lg transition-all shadow-lg ${
                  isValid && !isGenerating
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                    : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    生成中...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span className="text-2xl">✨</span>
                    生成图片
                  </span>
                )}
              </button>

              {/* Info Text */}
              <p className="mt-4 text-xs text-center text-neutral-500">
                点击生成后，AI将根据提示词创建专业的{template.category}图片
              </p>
            </div>

            {/* Example Images (if available) */}
            <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
              <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                示例效果
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Placeholder for example images */}
                {[1, 2].map(idx => (
                  <div key={idx} className="aspect-square rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 flex items-center justify-center">
                    <span className="text-4xl">💡</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Content Section */}
        <section className="mt-12 rounded-3xl bg-white border-2 border-purple-200 p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">关于{template.category}</h2>
          <div className="prose max-w-none text-neutral-700">
            <p className="text-lg leading-relaxed mb-4">{template.description}</p>
            
            <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">使用场景</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>教育教学：制作精美的教学课件和科普材料</li>
              <li>内容创作：为文章、视频、社交媒体创作配图</li>
              <li>专业设计：用于海报、宣传册、展板等设计项目</li>
              <li>个人学习：整理知识点，制作学习笔记</li>
            </ul>

            <h3 className="text-xl font-semibold text-neutral-900 mt-6 mb-3">特色功能</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>专业模板：基于实践优化的高质量提示词</li>
              <li>快速生成：{template.candidates.length}个预设示例，一键生成</li>
              <li>自定义参数：灵活调整，满足个性化需求</li>
              <li>SEO优化：每个模板页面都经过搜索引擎优化</li>
            </ul>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-purple-200 bg-white/80 backdrop-blur-xl mt-12">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="text-center text-sm text-neutral-600">
            <p>© 2026 Nano Banana Templates. All rights reserved.</p>
            <div className="mt-2 flex items-center justify-center gap-4 flex-wrap">
              {template.seo.keywords.map(keyword => (
                <span key={keyword} className="text-xs text-neutral-500">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
