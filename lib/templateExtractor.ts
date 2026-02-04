/**
 * Template Extractor
 * Converts nano_inspiration.json into a structured template system
 */

import nanoInspirations from '../public/data/nano_inspiration.json';

// Extract unique categories and their prompts
export function extractTemplatesFromNanoData() {
  const templateMap = new Map();

  nanoInspirations.forEach((item) => {
    const key = `${item.category}-${item.language}`;
    
    if (!templateMap.has(key)) {
      templateMap.set(key, {
        id: `template-${item.id}`,
        category: item.category,
        language: item.language,
        base_prompt: item.prompt,
        // For now, mark as requiring manual parameter extraction
        parameters: [],
        candidates: [],
        // Store original item for reference
        source_id: item.id
      });
    }
  });

  return Array.from(templateMap.values());
}

// Analyze a prompt to suggest parameter extraction
export function analyzePromptForParameters(prompt: string) {
  const suggestions = [];
  
  // Look for common patterns that indicate parameters
  const patterns = [
    { regex: /【([^】]+)】/g, type: 'bracket' },
    { regex: /\{([^}]+)\}/g, type: 'brace' },
    { regex: /\[([^\]]+)\]/g, type: 'square' },
  ];

  patterns.forEach(({ regex, type }) => {
    const matches = prompt.matchAll(regex);
    for (const match of matches) {
      suggestions.push({
        pattern: match[0],
        content: match[1],
        type,
        suggestedParameter: match[1].toLowerCase().replace(/\s+/g, '_')
      });
    }
  });

  return suggestions;
}

// Example usage:
// const templates = extractTemplatesFromNanoData();
// templates.forEach(template => {
//   const params = analyzePromptForParameters(template.base_prompt);
//   console.log(`Template: ${template.category}`, params);
// });
