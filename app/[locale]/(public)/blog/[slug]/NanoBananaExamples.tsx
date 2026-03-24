"use client";

import { NanoInspirationRow } from "@/app/[locale]/_components/NanoInspirationCard";
import type { NanoInspirationCardType } from "@/lib/nano_utils";

interface NanoBananaExamplesProps {
  locale: string;
}

export default function NanoBananaExamples({ locale }: NanoBananaExamplesProps) {
  const requireAuth = () => true;
  const onViewClick = () => {};

  const exampleCards: NanoInspirationCardType[] = [
    {
      id: "template-herbal-dragon's-blood",
      template_id: "template-herbal",
      language: "en" as const,
      category: "Herbal Category",
      description: "Generate a 4K vertical 'Herb Exploded Sheet' infographic poster for a single Chinese herb with labeled parts, properties, and modern forms.",
      image_urls: ["/images/nano_insp/template-herbal-zh-dragon's-blood.jpg"],
      preview_image_urls: ["/images/nano_insp_preview/template-herbal-zh-dragon's-blood-prev.jpg"],
      sample_parameters: { herb_name: "dragon's blood" },
      base_prompt: "",
      topics: ["learning"]
    },
    {
      id: "template-evolution-currency-forms",
      template_id: "template-evolution", 
      language: "en" as const,
      category: "Evolution Timeline Category",
      description: "Create an isometric pixel-art 'evolution museum' timeline scene that maps time progression to spatial progression with bilingual titles.",
      image_urls: ["/images/nano_insp/template-evolution-zh-currency-forms.jpg"],
      preview_image_urls: ["/images/nano_insp_preview/template-evolution-zh-currency-forms-prev.jpg"],
      sample_parameters: {},
      base_prompt: "",
      topics: ["learning"]
    },
    {
      id: "template-travel-beijing",
      template_id: "template-travel",
      language: "en" as const,
      category: "Travel Planning Map", 
      description: "Draw a cute hand-drawn travel map with daily route blocks, landmarks, food, lodging, and transport labeled in Simplified Chinese.",
      image_urls: ["/images/nano_insp/template-travel-zh-beijing.jpg"],
      preview_image_urls: ["/images/nano_insp_preview/template-travel-zh-beijing-prev.jpg"],
      sample_parameters: {},
      base_prompt: "",
      topics: ["travel"]
    }
  ];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Popular Template Examples</h2>
      <div className="mb-6">
        <p className="text-gray-600 mb-6">Explore our most popular Nano Banana prompt templates to see what's possible:</p>
        
        <NanoInspirationRow 
          cards={exampleCards}
          requireAuth={requireAuth}
          onViewClick={onViewClick}
        />
      </div>
    </section>
  );
}
