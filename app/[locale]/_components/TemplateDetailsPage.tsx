"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import CdnImage from "@/app/[locale]/_components/CdnImage";

// Updated types matching new schema
export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type TemplateCard = {
  image_id: string;
  [key: string]: any; // Parameters like herb_name, theme, etc.
};

export type Template = {
  id: string;
  description: string;
  category: string;
  language: "zh" | "en";
  base_prompt: string;
  parameters: TemplateParameter[];
  images: Array<{ image_id: string; [key: string]: any }>;
};

export type TemplateCardWithImages = TemplateCard & {
  template_id: string;
  language: string;
  category: string;
  parameters: Record<string, any>;
  image_url: string;
  preview_image_url: string;
};

interface TemplateDetailPageProps {
  template: Template;
  templateCards: TemplateCardWithImages[];
  allTemplates: Template[];
  locale: string;
}

export function TemplateDetailPage({ template, templateCards, allTemplates, locale }: TemplateDetailPageProps) {
  const router = useRouter();
  const [selectedParams, setSelectedParams] = useState<Record<string, string>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // Generate prompt with current parameters
  const generatedPrompt = useMemo(() => {
    let prompt = template.base_prompt;
    Object.entries(selectedParams).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      prompt = prompt.replace(regex, value);
    });
    return prompt;
  }, [template.base_prompt, selectedParams]);

  const isValid = useMemo(() => {
    return template.parameters.every((param) => selectedParams[param.name]?.trim());
  }, [template.parameters, selectedParams]);

  const handleParamChange = (paramName: string, value: string) => {
    setSelectedParams((prev) => ({ ...prev, [paramName]: value }));
    setSelectedCardId(null); // Clear card selection when manually editing
  };

  const handleCardSelect = (card: TemplateCard) => {
    // Extract parameters from card (excluding card_id)
    const params: Record<string, string> = {};
    template.parameters.forEach((param) => {
      if (card[param.name]) {
        params[param.name] = card[param.name];
      }
    });
    setSelectedParams(params);
    setSelectedCardId(card.card_id);
  };

  const handleGenerate = async () => {
    if (!isValid) return;
    
    // TODO: Call your generation API
    console.log("Generating with prompt:", generatedPrompt);
    console.log("Parameters:", selectedParams);
    
    // Example API call:
    // const result = await fetch('/api/generate-image', {
    //   method: 'POST',
    //   body: JSON.stringify({ prompt: generatedPrompt, template_id: template.id, parameters: selectedParams })
    // });
  };

  const otherTemplates = allTemplates.filter((t) => t.id !== template.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-purple-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => router.back()}
            className="mb-4 inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            返回
          </button>
          <div className="flex items-center gap-4 mb-3">
            <span className="text-5xl">💡</span>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                {template.category}
              </h1>
              <p className="mt-2 text-lg text-neutral-600">{template.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Creation Section */}
        <div className="mb-12">
          <div className="rounded-3xl bg-white border-2 border-purple-200 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
              创作参数
            </h2>

            {/* Parameter Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {template.parameters.map((param) => (
                <div key={param.name}>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">
                    {param.label}
                  </label>
                  {param.type === "textarea" ? (
                    <textarea
                      value={selectedParams[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  ) : param.type === "select" ? (
                    <select
                      value={selectedParams[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    >
                      <option value="">选择 {param.label}</option>
                      {param.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={selectedParams[param.name] || ""}
                      onChange={(e) => handleParamChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Prompt Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-neutral-700 mb-2">提示词预览</h3>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100 max-h-48 overflow-y-auto">
                <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">{generatedPrompt}</pre>
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!isValid}
              className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                isValid
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">✨</span>
                生成图片
              </span>
            </button>
          </div>
        </div>

        {/* Template Cards Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
            模板示例 ({templateCards.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {templateCards.map((card) => (
              <button
                key={card.image_id}
                onClick={() => handleCardSelect(card)}
                className={`group relative overflow-hidden rounded-2xl transition-all ${
                  selectedCardId === card.image_id
                    ? "ring-4 ring-purple-500 shadow-2xl scale-105"
                    : "hover:shadow-xl hover:scale-105"
                }`}
              >
                <div className="aspect-[3/4] relative">
                  <CdnImage
                    src={card.preview_image_url || card.image_url}
                    alt={Object.values(card.parameters).join(" ")}
                    fill
                    className="object-cover"
                  />
                  {selectedCardId === card.card_id && (
                    <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                      <div className="bg-white rounded-full p-3 shadow-lg">
                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-medium line-clamp-2">
                    {Object.values(card.parameters).join(" · ")}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Other Templates Section */}
        {otherTemplates.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-8 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
              其他模板
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => router.push(`/${locale}/nano-template/${t.id}`)}
                  className="group text-left rounded-2xl bg-white border-2 border-purple-200 p-6 hover:border-purple-400 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <span className="text-3xl">💡</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-purple-900 mb-1 group-hover:text-purple-600 transition-colors">
                        {t.category}
                      </h3>
                      <p className="text-sm text-neutral-600 line-clamp-2">{t.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-neutral-500">                    
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
