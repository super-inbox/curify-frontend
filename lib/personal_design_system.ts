// lib/personal_design_system.ts
//
// Pure metadata + prompt-input shape for the Personal Design System
// Generator. No React, no browser APIs, no env vars, no network — this
// module must be importable from both a Next.js client component and a
// plain vitest run, and it must never import anything server-only (see
// lib/personalDesignSystemOpenAI.ts for the actual OpenAI call, which is
// guarded by `import "server-only"`).
//
// The product: a designer describes their own portfolio/style in plain
// language (there is no portfolio-URL crawler or image-analysis backend to
// ingest a Behance/ZCOOL link or uploaded images — see the note in
// lib/personalDesignSystemOpenAI.ts), and the model synthesizes a
// structured, reusable "personal design system" from that description.
// Terminology is deliberately discipline-neutral so it reads correctly for
// graphic, branding, packaging, illustration, and other visual designers —
// not just UI/product designers.

export type SupportedPersonalDesignSystemLocale = "en" | "zh";

export type Bilingual = { en: string; zh: string };

// A single discipline chip, purely to steer the model's vocabulary — never
// changes the input shape or the request/response contract.
export type DesignDiscipline = {
  id: string;
  label: Bilingual;
};

export const DESIGN_DISCIPLINES: DesignDiscipline[] = [
  { id: "graphic", label: { en: "Graphic design", zh: "平面设计" } },
  { id: "branding", label: { en: "Branding / identity", zh: "品牌 / VI设计" } },
  { id: "packaging", label: { en: "Packaging", zh: "包装设计" } },
  { id: "illustration", label: { en: "Illustration", zh: "插画" } },
  { id: "editorial", label: { en: "Editorial / print", zh: "编辑 / 印刷" } },
  { id: "ui", label: { en: "UI / product", zh: "UI / 产品设计" } },
  { id: "other", label: { en: "Other / mixed", zh: "其他 / 多领域" } },
];

export const MIN_PORTFOLIO_DESCRIPTION_LEN = 40;
export const MAX_PORTFOLIO_DESCRIPTION_LEN = 2000;
export const MAX_DESIGNER_NAME_LEN = 80;

export type PersonalDesignSystemInput = {
  designerName: string; // optional; "" when not provided
  discipline: string; // one of DESIGN_DISCIPLINES[].id, or "" for unspecified
  portfolioDescription: string;
};

// One prose section of the generated design system — every section is
// bilingual, matching the rest of the codebase's en/zh convention.
export type DesignSystemSection = Bilingual;

export type ColorSwatch = {
  hex: string; // e.g. "#2B2118" — validated server-side
  name: Bilingual;
};

// The shape the model is asked to return, and the shape rendered on the
// result screen. Every field is real model output for the description the
// designer typed in — there is no static/hardcoded fallback content
// anywhere this type is produced.
export type PersonalDesignSystemResult = {
  summary: Bilingual; // one-line "personal design system statement"
  styleTags: string[];
  visualStyle: DesignSystemSection;
  colorSystem: DesignSystemSection & { palette: ColorSwatch[] };
  typography: DesignSystemSection;
  composition: DesignSystemSection;
  signatureMotifs: DesignSystemSection;
  imageLanguage: DesignSystemSection; // image / illustration / photography language
  designPrinciples: DesignSystemSection;
};

export function getDisciplineById(id: string): DesignDiscipline | undefined {
  return DESIGN_DISCIPLINES.find((d) => d.id === id);
}

function normalizeFieldValue(value: string): string {
  return value.replace(/[\r\n\t]/g, " ").replace(/\s+/g, " ").trim();
}

// Portfolio descriptions are the one field that benefits from preserved line
// breaks (designers often paste a short list of mediums/projects) — collapse
// \r and \t only, and collapse runs of blank lines, but keep single newlines.
function normalizeDescription(value: string): string {
  return value
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \u00A0]{2,}/g, " ")
    .trim();
}

/**
 * Validates and normalizes the raw form input before it is sent to the API
 * route. Pure — no network. Throws on invalid input so callers can surface a
 * single error message; mirrors buildProjectBrief's validate-then-throw shape
 * in lib/brand_direction_explorer.ts.
 */
export function normalizePersonalDesignSystemInput(
  raw: PersonalDesignSystemInput,
): PersonalDesignSystemInput {
  const portfolioDescription = normalizeDescription(raw.portfolioDescription ?? "");
  if (portfolioDescription.length < MIN_PORTFOLIO_DESCRIPTION_LEN) {
    throw new Error(
      `normalizePersonalDesignSystemInput: portfolioDescription must be at least ${MIN_PORTFOLIO_DESCRIPTION_LEN} characters`,
    );
  }
  if (portfolioDescription.length > MAX_PORTFOLIO_DESCRIPTION_LEN) {
    throw new Error(
      `normalizePersonalDesignSystemInput: portfolioDescription exceeds ${MAX_PORTFOLIO_DESCRIPTION_LEN} characters`,
    );
  }

  const designerName = normalizeFieldValue(raw.designerName ?? "").slice(0, MAX_DESIGNER_NAME_LEN);
  const discipline = getDisciplineById(raw.discipline ?? "") ? raw.discipline : "";

  return { designerName, discipline, portfolioDescription };
}
