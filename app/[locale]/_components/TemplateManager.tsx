"use client";

import { useState, useMemo } from "react";
import { NanoInspirationCardType } from "./NanoInspirationCard";

// Template system types
export type TemplateParameter = {
  name: string;
  label: string;
  type: "text" | "textarea" | "select";
  placeholder?: string;
  options?: string[];
};

export type Template = {
  id: string;
  category: string;
  language: "zh" | "en";
  base_prompt: string;
  parameters: TemplateParameter[];
  candidates: Record<string, any>[];
};

interface TemplateManagerProps {
  templates: Template[];
  onGenerate: (prompt: string, templateId: string, params: Record<string, string>) => void;
  onClose?: () => void;
}

export function TemplateManager({ templates, onGenerate, onClose }: TemplateManagerProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);
  const [customParams, setCustomParams] = useState<Record<string, string>>({});
  const [showCandidates, setShowCandidates] = useState(true);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const groups: Record<string, Template[]> = {};
    templates.forEach((template) => {
      if (!groups[template.category]) {
        groups[template.category] = [];
      }
      groups[template.category].push(template);
    });
    return groups;
  }, [templates]);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedCandidate(-1);
    setCustomParams({});
  };

  const handleCandidateSelect = (index: number) => {
    if (!selectedTemplate) return;
    setSelectedCandidate(index);
    const candidate = selectedTemplate.candidates[index];
    setCustomParams(candidate);
  };

  const handleParamChange = (paramName: string, value: string) => {
    setCustomParams((prev) => ({ ...prev, [paramName]: value }));
  };

  const generatePrompt = () => {
    if (!selectedTemplate) return "";
    let prompt = selectedTemplate.base_prompt;
    
    // Replace all parameters in the prompt
    Object.entries(customParams).forEach(([key, value]) => {
      const regex = new RegExp(`\\{${key}\\}`, "g");
      prompt = prompt.replace(regex, value);
    });

    return prompt;
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    const prompt = generatePrompt();
    onGenerate(prompt, selectedTemplate.id, customParams);
  };

  const isValid = useMemo(() => {
    if (!selectedTemplate) return false;
    return selectedTemplate.parameters.every((param) => customParams[param.name]?.trim());
  }, [selectedTemplate, customParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute right-0 top-0 rounded-full p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-all"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-3">
            Nano Banana Template Generator
          </h1>
          <p className="text-lg text-neutral-600">Select a template and fill in parameters to generate custom prompts</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Template Selection */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 rounded-full bg-gradient-to-b from-purple-500 to-pink-500"></span>
                Templates
              </h2>
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {Object.entries(groupedTemplates).map(([category, temps]) => (
                  <div key={category}>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">{category}</div>
                    <div className="space-y-2">
                      {temps.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleTemplateSelect(template)}
                          className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all ${
                            selectedTemplate?.id === template.id
                              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                              : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm">{template.category}</span>
                            <span className="text-xs opacity-70">{template.language.toUpperCase()}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Middle: Parameters & Candidates */}
          <div className="lg:col-span-2 space-y-6">
            {selectedTemplate ? (
              <>
                {/* Toggle View */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-purple-200">
                  <button
                    onClick={() => setShowCandidates(true)}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      showCandidates
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Pre-filled Candidates ({selectedTemplate.candidates.length})
                  </button>
                  <button
                    onClick={() => setShowCandidates(false)}
                    className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                      !showCandidates
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    Custom Parameters
                  </button>
                </div>

                {showCandidates ? (
                  // Candidates View
                  <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-purple-900 mb-4">Select a Pre-filled Candidate</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto">
                      {selectedTemplate.candidates.map((candidate, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleCandidateSelect(idx)}
                          className={`text-left p-4 rounded-xl transition-all border-2 ${
                            selectedCandidate === idx
                              ? "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 shadow-md"
                              : "bg-neutral-50 border-neutral-200 hover:bg-neutral-100 hover:border-neutral-300"
                          }`}
                        >
                          <div className="space-y-1">
                            {Object.entries(candidate).map(([key, value]) => (
                              <div key={key} className="text-sm">
                                <span className="font-semibold text-purple-700">{key}:</span>
                                <span className="ml-2 text-neutral-700">{value as string}</span>
                              </div>
                            ))}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Custom Parameters View
                  <div className="rounded-3xl bg-white border-2 border-purple-200 p-6 shadow-lg">
                    <h3 className="text-lg font-bold text-purple-900 mb-4">Customize Parameters</h3>
                    <div className="space-y-4">
                      {selectedTemplate.parameters.map((param) => (
                        <div key={param.name}>
                          <label className="block text-sm font-semibold text-neutral-700 mb-2">{param.label}</label>
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
                              <option value="">Select {param.label}</option>
                              {param.options?.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
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
                )}

                {/* Preview & Generate */}
                <div className="rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-purple-900 mb-4">Generated Prompt Preview</h3>
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-4 border-2 border-purple-100 max-h-64 overflow-y-auto">
                    <pre className="text-sm text-neutral-700 whitespace-pre-wrap font-mono">{generatePrompt()}</pre>
                  </div>
                  <button
                    onClick={handleGenerate}
                    disabled={!isValid}
                    className={`w-full px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                      isValid
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 active:scale-95 cursor-pointer"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-3">
                      <span className="text-2xl">✨</span>
                      Generate Image
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-3xl bg-white border-2 border-purple-200 p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">💡</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Select a Template</h3>
                <p className="text-neutral-600">Choose a template from the left to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to load templates from JSON
export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  // Load templates from nano_templates.json
  // In a real app, this would fetch from an API or import the JSON
  // For now, you would import and use the nano_templates.json file

  return { templates, loading };
}
