import nanoTemplates from "@/public/data/nano_templates.json";
import { nanoTemplateI18nKey, type TranslateFn } from "@/lib/nano_utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface NanoTemplate {
  id: string;
  locales: {
    [locale: string]:
      | {
          // NOTE: `category` and `description` have moved to messages/[locale]/nano.json
          base_prompt: string;
          parameters: Array<{
            name: string;
            label: string;
            type: string;
            placeholder: string[];
          }>;
        }
      | undefined;
  };
}

export interface TemplateLink {
  id: string;
  /**
   * Resolved from i18n — the caller must supply a `translate` function.
   * Falls back to the template `id` when no translator is provided.
   */
  title: string;
  /** Resolved from i18n — empty string when no translator is provided. */
  category: string;
  url: string;
  locale: string;
}

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Returns all nano templates available for `locale`, with `title` and
 * `category` resolved via the supplied `translate` function.
 *
 * Pass `t` from `useTranslations('nano')` (client) or
 * `await getTranslations('nano')` (server).
 *
 * If `translate` is omitted, `title` falls back to the template id and
 * `category` is an empty string — useful for structural/data-only use.
 */
export function getNanoTemplates(
  locale: string = "en",
  translate?: TranslateFn
): TemplateLink[] {
  return (nanoTemplates as NanoTemplate[])
    .filter((template) => template.locales[locale] != null)
    .map((template) => {
      const title = translate
        ? translate(nanoTemplateI18nKey(template.id, "description"))
            .split(".")[0] // first sentence as title, mirrors old behaviour
        : template.id;

      const category = translate
        ? translate(nanoTemplateI18nKey(template.id, "category"))
        : "";

      return {
        id: template.id,
        title,
        category,
        url: `/${locale}/nano-template/${template.id.replace(/^template-/, "")}`,
        locale,
      } satisfies TemplateLink;
    });
}

/**
 * Returns templates filtered by category for the given locale.
 */
export function getTemplatesByCategory(
  category: string,
  locale: string = "en",
  translate?: TranslateFn
): TemplateLink[] {
  return getNanoTemplates(locale, translate).filter((t) =>
    t.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Full-text search across `title` and `category`.
 */
export function searchTemplates(
  keyword: string,
  locale: string = "en",
  translate?: TranslateFn
): TemplateLink[] {
  const q = keyword.toLowerCase();
  return getNanoTemplates(locale, translate).filter(
    (t) =>
      t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q)
  );
}

// ---------------------------------------------------------------------------
// Blog content parser
// ---------------------------------------------------------------------------

/**
 * Replaces `{{template-id}}` or `[[template-name]]` tokens inside a blog
 * content string with HTML anchor tags pointing to the template detail page.
 *
 * Pass `translate` so that link labels use the real i18n title rather than
 * the raw template id.
 *
 * @example
 * // In a React Server Component:
 * const t = await getTranslations('nano');
 * const html = parseTemplateLinks(rawContent, 'en', t);
 */
export function parseTemplateLinks(
  content: string,
  locale: string = "en",
  translate?: TranslateFn
): string {
  const templates = getNanoTemplates(locale, translate);

  // Matches {{template-id}} or [[template-name]]
  const templatePattern = /\{\{([^}]+)\}\}|\[\[([^\]]+)\]\]/g;

  return content.replace(
    templatePattern,
    (_match, templateId?: string, templateName?: string) => {
      if (templateId) {
        const tpl = templates.find((t) => t.id === templateId.trim());
        if (tpl) {
          return `<a href="${tpl.url}" class="template-link" data-template-id="${tpl.id}">${tpl.title}</a>`;
        }
      } else if (templateName) {
        const tpl = templates.find((t) =>
          t.title.toLowerCase().includes(templateName.trim().toLowerCase())
        );
        if (tpl) {
          return `<a href="${tpl.url}" class="template-link" data-template-id="${tpl.id}">${tpl.title}</a>`;
        }
      }

      return _match; // no match → keep original token
    }
  );
}
