import Link from 'next/link';
import { ExternalLink, Sparkles } from 'lucide-react';

interface TemplateLinkProps {
  href: string;
  title: string;
  category?: string;
  showIcon?: boolean;
  className?: string;
}

export default function TemplateLink({ 
  href, 
  title, 
  category, 
  showIcon = true,
  className = "" 
}: TemplateLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 underline decoration-2 decoration-blue-200 hover:decoration-blue-400 transition-all duration-200 ${className}`}
      title={category ? `${title} - ${category}` : title}
    >
      {showIcon && <Sparkles className="w-3 h-3" />}
      <span className="font-medium">{title}</span>
      {category && (
        <span className="text-xs text-gray-500 ml-1">({category})</span>
      )}
      <ExternalLink className="w-3 h-3 opacity-60" />
    </Link>
  );
}

// Component for rendering multiple template suggestions
interface TemplateSuggestionsProps {
  templates: Array<{
    id: string;
    title: string;
    category: string;
    url: string;
  }>;
  maxItems?: number;
  className?: string;
}

export function TemplateSuggestions({ 
  templates, 
  maxItems = 3, 
  className = "" 
}: TemplateSuggestionsProps) {
  const displayTemplates = templates.slice(0, maxItems);

  if (displayTemplates.length === 0) return null;

  return (
    <div className={`mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 ${className}`}>
      <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Related Nano Templates
      </h4>
      <div className="space-y-2">
        {displayTemplates.map((template) => (
          <TemplateLink
            key={template.id}
            href={template.url}
            title={template.title}
            category={template.category}
            className="block text-sm"
          />
        ))}
      </div>
      {templates.length > maxItems && (
        <p className="text-xs text-blue-600 mt-2">
          +{templates.length - maxItems} more templates available
        </p>
      )}
    </div>
  );
}
