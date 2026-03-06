import nanoTemplates from '@/public/data/nano_templates.json';

export interface NanoTemplate {
  id: string;
  locales: {
    [locale: string]: {
      category: string;
      description: string;
      base_prompt: string;
      parameters: Array<{
        name: string;
        label: string;
        type: string;
        placeholder: string[];
      }>;
    } | undefined;
  };
}

export interface TemplateLink {
  id: string;
  title: string;
  category: string;
  url: string;
  locale: string;
}

// Get all nano templates for a specific locale
export function getNanoTemplates(locale: string = 'en'): TemplateLink[] {
  return nanoTemplates
    .filter((template: NanoTemplate) => template.locales[locale])
    .map((template: NanoTemplate) => {
      const localeData = template.locales[locale];
      if (!localeData) return null;
      
      return {
        id: template.id,
        title: localeData.description.split('.')[0], // Use first sentence as title
        category: localeData.category,
        url: `/nano-template/${template.id}`,
        locale: locale
      };
    })
    .filter((item): item is TemplateLink => item !== null);
}

// Get templates by category
export function getTemplatesByCategory(category: string, locale: string = 'en'): TemplateLink[] {
  return getNanoTemplates(locale).filter(template => 
    template.category.toLowerCase().includes(category.toLowerCase())
  );
}

// Search templates by keyword
export function searchTemplates(keyword: string, locale: string = 'en'): TemplateLink[] {
  const searchTerm = keyword.toLowerCase();
  return getNanoTemplates(locale).filter(template =>
    template.title.toLowerCase().includes(searchTerm) ||
    template.category.toLowerCase().includes(searchTerm)
  );
}

// Parse blog content and replace template references with links
export function parseTemplateLinks(content: string, locale: string = 'en'): string {
  // Pattern to match template references like {{template-id}} or [[template-name]]
  const templatePattern = /\{\{([^}]+)\}\}|\[\[([^\]]+)\]\]/g;
  
  return content.replace(templatePattern, (match, templateId, templateName) => {
    const templates = getNanoTemplates(locale);
    
    if (templateId) {
      // Try to find by ID
      const template = templates.find(t => t.id === templateId.trim());
      if (template) {
        return `<a href="${template.url}" class="template-link" data-template-id="${template.id}">${template.title}</a>`;
      }
    } else if (templateName) {
      // Try to find by name/title
      const template = templates.find(t => 
        t.title.toLowerCase().includes(templateName.trim().toLowerCase())
      );
      if (template) {
        return `<a href="${template.url}" class="template-link" data-template-id="${template.id}">${template.title}</a>`;
      }
    }
    
    return match; // Return original if no match found
  });
}
