// SERVER-ONLY data registry over nano_templates.json + nano_inspiration.json
// (~4MB combined). The `server-only` import makes any client component that
// imports this module fail the build — that's intentional. Client components
// must import pure helpers/types from "@/lib/nano_pure" (which carries no JSON)
// so the registry never ships in the client bundle. Pure helpers + all types
// are re-exported below for back-compat with server callers.
import "server-only";

import nanoTemplates from "@/public/data/nano_templates.json";
import nanoImages from "@/public/data/nano_inspiration.json";
import { PageLocale } from "@/lib/locale_utils";
import { getUseCasesForTopics } from "./topicRegistry";
import {
  toSlug,
  nanoTemplateI18nKey,
  type RawTemplate,
  type RawNanoImageRecord,
  type NanoRegistry,
  type TemplateView,
  type TranslateFn,
} from "./nano_pure";

// Re-export every client-safe helper + type so existing server imports from
// "@/lib/nano_utils" keep working unchanged.
export * from "./nano_pure";

function normalizeTopicValues(value: unknown): string[] {
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim().toLowerCase())
      .filter(Boolean);
  }

  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim().toLowerCase())
      .filter(Boolean);
  }

  return [];
}

function dedupeStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

export function getTemplateTopics(template: RawTemplate): string[] {
  return dedupeStrings(normalizeTopicValues(template.topics));
}

function pickLocale<T>(
  locales: Partial<Record<PageLocale, T>> | undefined,
  locale: PageLocale
): { value: T; resolved: PageLocale } | null {
  if (!locales) return null;

  const v = locales[locale];
  if (v) return { value: v, resolved: locale };
  if (locales.zh) return { value: locales.zh, resolved: "zh" };
  if (locales.en) return { value: locales.en, resolved: "en" };

  return null;
}

export function buildNanoRegistry(
  templates: RawTemplate[],
  images: RawNanoImageRecord[]
): NanoRegistry {
  const templateById = new Map<string, RawTemplate>();
  const imagesByTemplateId = new Map<string, RawNanoImageRecord[]>();
  const imageById = new Map<string, RawNanoImageRecord>();

  for (const t of templates) {
    templateById.set(t.id, t);
  }

  for (const img of images) {
    imageById.set(img.id, img);
    const arr = imagesByTemplateId.get(img.template_id) ?? [];
    arr.push(img);
    imagesByTemplateId.set(img.template_id, arr);
  }

  return { templates, images, templateById, imagesByTemplateId, imageById };
}

export const nanoRegistry: NanoRegistry = buildNanoRegistry(
  nanoTemplates as unknown as RawTemplate[],
  nanoImages as unknown as RawNanoImageRecord[]
);

export function getTemplateView(
  reg: NanoRegistry,
  templateId: string,
  locale: PageLocale
): TemplateView | null {
  const raw = reg.templateById.get(templateId);
  if (!raw) return null;

  const picked = pickLocale(raw.locales, locale);
  if (!picked) return null;

  const { value, resolved } = picked;

  return {
    template_id: raw.id,
    slug: toSlug(raw.id),
    locale: resolved,
    category: "",
    description: "",
    topics: getTemplateTopics(raw),
    // Respect the explicit `use_cases` tag in nano_templates.json when
    // present — that's the curated editorial intent ("this template
    // belongs on persona X's page"). Fall back to topic-derived
    // surfacing only for untagged templates so existing coverage
    // doesn't regress. Pre-fix, the explicit tag was parsed but
    // silently overwritten — DTC + designer + agency + creator pages
    // were all over-surfacing 40-100+ off-topic templates per page
    // (e.g. template-recipe on /use-cases/for-dtc-brands).
    use_cases: raw.use_cases?.length
      ? raw.use_cases
      : getUseCasesForTopics(getTemplateTopics(raw)),
    rank_score: raw.rank_score,
    batch: raw.batch,
    allow_generation: raw.allow_generation,
    requires_image_upload: raw.requires_image_upload,
    archetype: raw.archetype,
    intro_video_url: raw.intro_video_url,
    base_prompt: value.base_prompt,
    parameters: value.parameters,
    cards: raw.cards ?? [],
  };
}

export function getTemplateViewWithTranslations(
  reg: NanoRegistry,
  templateId: string,
  locale: PageLocale,
  t: TranslateFn
): TemplateView | null {
  const view = getTemplateView(reg, templateId, locale);
  if (!view) return null;

  return {
    ...view,
    category: t(nanoTemplateI18nKey(templateId, "category")),
    description: t(nanoTemplateI18nKey(templateId, "description")),
  };
}
