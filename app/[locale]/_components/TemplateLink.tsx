"use client";

import Link from "next/link";
import { Sparkles, ArrowUpRight } from "lucide-react";

// ---------------------------------------------------------------------------
// TemplateLink
// ---------------------------------------------------------------------------

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
  className = "",
}: TemplateLinkProps) {
  return (
    <Link
      href={href}
      title={category ? `${title} — ${category}` : title}
      className={[
        // Base layout
        "group inline-flex items-center gap-1.5",
        // Typography
        "text-[13px] font-medium leading-snug",
        // Color + underline
        "text-violet-700 underline decoration-violet-200 underline-offset-2",
        "hover:text-violet-900 hover:decoration-violet-500",
        // Transition
        "transition-all duration-150",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {showIcon && (
        <Sparkles
          className="w-3 h-3 shrink-0 text-violet-400 group-hover:text-violet-600 transition-colors duration-150"
          aria-hidden
        />
      )}

      <span>{title}</span>

      {category && (
        <span className="text-[11px] font-normal text-neutral-400 group-hover:text-neutral-500 transition-colors duration-150 ml-0.5">
          ({category})
        </span>
      )}

      <ArrowUpRight
        className="w-3 h-3 shrink-0 opacity-40 group-hover:opacity-70 group-hover:translate-x-px group-hover:-translate-y-px transition-all duration-150"
        aria-hidden
      />
    </Link>
  );
}

// ---------------------------------------------------------------------------
// TemplateSuggestions
// ---------------------------------------------------------------------------

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
  className = "",
}: TemplateSuggestionsProps) {
  const visible = templates.slice(0, maxItems);
  const overflow = templates.length - maxItems;

  if (visible.length === 0) return null;

  return (
    <aside
      className={[
        "mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 px-4 py-3.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Related Nano Templates"
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-1.5">
        <Sparkles
          className="h-3.5 w-3.5 shrink-0 text-violet-500"
          aria-hidden
        />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-violet-600">
          Related Nano Templates
        </span>
      </div>

      {/* Links */}
      <ul className="space-y-2">
        {visible.map((tpl, i) => (
          <li key={`${tpl.id}-${i}`}>
            <TemplateLink
              href={tpl.url}
              title={tpl.title}
              category={tpl.category}
              className="block"
            />
          </li>
        ))}
      </ul>

      {/* Overflow badge */}
      {overflow > 0 && (
        <p className="mt-2.5 text-[11px] text-violet-500 font-medium">
          +{overflow} more template{overflow === 1 ? "" : "s"} available
        </p>
      )}
    </aside>
  );
}
