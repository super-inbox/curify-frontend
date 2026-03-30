'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

export default function FAQSection({ faqs }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openItems.includes(index);
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                    isOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-3">
                  <div className="text-gray-600 prose prose-sm max-w-none">
                    {faq.answer}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
