"use client";

import React, { useState } from 'react';

interface PipelineWorkflowDiagramProps {
  translations: {
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
  };
}

export default function PipelineWorkflowDiagram({ translations }: PipelineWorkflowDiagramProps) {
  const [activeStep, setActiveStep] = useState<number | null>(1);

  const steps = [
    {
      id: 1,
      title: translations.step1Title,
      description: "Visual Identity",
      icon: "🎨",
      color: "purple"
    },
    {
      id: 2,
      title: translations.step2Title,
      description: "Script Generation",
      icon: "📝",
      color: "blue"
    },
    {
      id: 3,
      title: translations.step3Title,
      description: "Voice Production",
      icon: "🎙️",
      color: "green"
    },
    {
      id: 4,
      title: translations.step4Title,
      description: "Video Assembly",
      icon: "🎬",
      color: "orange"
    },
    {
      id: 5,
      title: translations.step5Title,
      description: "Distribution",
      icon: "📤",
      color: "red"
    }
  ];

  return (
    <div className="my-12 mb-24">
      <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
        Interactive Pipeline Workflow
      </h3>
      
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-purple-200 via-blue-200 via-green-200 via-orange-200 to-red-200 transform -translate-y-1/2 hidden lg:block"></div>
        
        <div className="flex flex-col lg:flex-row justify-between items-center space-y-8 lg:space-y-0 lg:space-x-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`relative z-10 cursor-pointer transition-all duration-300 ${
                activeStep === step.id
                  ? 'transform scale-110'
                  : 'hover:transform hover:scale-105'
              }`}
              onClick={() => setActiveStep(activeStep === step.id ? null : step.id)}
            >
              {/* Step Circle */}
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg transition-all duration-300 ${
                  activeStep === step.id
                    ? `bg-${step.color}-600 ring-4 ring-${step.color}-200`
                    : `bg-${step.color}-400 hover:bg-${step.color}-500`
                }`}
              >
                {step.icon}
              </div>
              
              {/* Step Label */}
              <div className="mt-4 text-center">
                <div className={`font-bold text-sm ${
                  activeStep === step.id ? `text-${step.color}-700` : 'text-gray-600'
                }`}>
                  Step {step.id}
                </div>
                <div className={`text-xs mt-1 ${
                  activeStep === step.id ? `text-${step.color}-600` : 'text-gray-500'
                }`}>
                  {step.description}
                </div>
              </div>
              
              {/* Active Step Details */}
              {activeStep === step.id && (
                <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 w-64 z-20">
                  <div className={`bg-white p-4 rounded-lg shadow-xl border-2 border-${step.color}-200`}>
                    <h4 className={`font-bold text-${step.color}-900 mb-2`}>
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {translations[`step${step.id}Content` as keyof typeof translations]}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Progress Indicator */}
      <div className="mt-12 bg-gray-100 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Pipeline Progress</span>
          <span className="text-sm font-bold text-purple-600">{activeStep || 0}/5 Complete</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-600 to-red-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((activeStep || 0) / 5) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
