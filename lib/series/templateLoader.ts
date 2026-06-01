import nanoTemplates from "@/public/data/nano_templates.json";

import {
  SERIES_LOCALES,
  SERIES_TEMPLATE_IDS,
  type SeriesLocale,
  type SeriesTemplateId,
} from "./types";

export type SeriesTemplateParameter = {
  name: string;
  label?: string;
  type?: string;
  placeholder?: string | string[];
};

export type SeriesTemplateData = {
  template_id: SeriesTemplateId;
  locale: SeriesLocale;
  base_prompt: string;
  parameters: SeriesTemplateParameter[];
};

export type LoadSeriesTemplateResult =
  | { ok: true; data: SeriesTemplateData }
  | { ok: false; reason: string };

type RawLocaleEntry = {
  base_prompt?: string;
  parameters?: SeriesTemplateParameter[];
};

type RawTemplate = {
  id: string;
  locales?: Partial<Record<SeriesLocale, RawLocaleEntry>>;
};

export function isSeriesTemplateId(id: string): id is SeriesTemplateId {
  return (SERIES_TEMPLATE_IDS as readonly string[]).includes(id);
}

export function isSeriesLocale(locale: string): locale is SeriesLocale {
  return (SERIES_LOCALES as readonly string[]).includes(locale);
}

// Strict locale lookup — unlike getTemplateView in lib/nano_utils.ts, this
// does NOT fall back across locales. A planner request for "zh" must fail
// loudly if the template only ships "en", since we'd otherwise feed the
// model an English base_prompt while telling it to write Chinese.
export function loadSeriesTemplate(
  templateId: string,
  locale: string,
): LoadSeriesTemplateResult {
  if (!isSeriesTemplateId(templateId)) {
    return {
      ok: false,
      reason: `"${templateId}" is not a series template. Allowed: ${SERIES_TEMPLATE_IDS.join(", ")}`,
    };
  }
  if (!isSeriesLocale(locale)) {
    return {
      ok: false,
      reason: `Unsupported locale "${locale}". Supported: ${SERIES_LOCALES.join(", ")}`,
    };
  }

  const templates = nanoTemplates as unknown as RawTemplate[];
  const raw = templates.find((t) => t.id === templateId);
  if (!raw) {
    return {
      ok: false,
      reason: `Template "${templateId}" not found in nano_templates.json`,
    };
  }

  const entry = raw.locales?.[locale];
  if (!entry?.base_prompt) {
    const available = Object.keys(raw.locales ?? {}).join(", ") || "(none)";
    return {
      ok: false,
      reason: `Template "${templateId}" has no base_prompt for locale "${locale}". Available: ${available}`,
    };
  }

  return {
    ok: true,
    data: {
      template_id: templateId,
      locale,
      base_prompt: entry.base_prompt,
      parameters: entry.parameters ?? [],
    },
  };
}
