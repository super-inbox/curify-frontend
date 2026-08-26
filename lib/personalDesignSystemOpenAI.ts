// lib/personalDesignSystemOpenAI.ts
//
// Server-only. `import "server-only"` below makes any client component that
// imports this module fail the Next.js build (same enforcement mechanism as
// lib/brandDirectionOpenAI.ts) — the OpenAI key and prompt logic here must
// never reach the browser bundle.
//
// This is the ONLY module that calls OpenAI for the Personal Design System
// Generator. It is called exclusively from
// app/api/personal-design-system/generate/route.ts.
//
// IMPORTANT — what this tool actually does: the designer types a free-text
// description of their own portfolio (mediums, recurring choices, a project
// they're proud of, etc). This module asks OpenAI to synthesize that
// description into a structured "personal design system". There is no
// portfolio-URL crawler and no image-analysis/vision pipeline behind this —
// the model never sees an actual Behance/ZCOOL link or an uploaded image, it
// only sees the text the designer wrote. Do not add copy anywhere upstream
// that implies otherwise.
//
// There is no static/hardcoded design-system content anywhere this module
// (or anything it imports) can fall back to on failure — the failure branch
// of generatePersonalDesignSystem carries only a sanitized error string.

import "server-only";

import OpenAI from "openai";
import {
  getDisciplineById,
  type ColorSwatch,
  type PersonalDesignSystemInput,
  type PersonalDesignSystemResult,
} from "./personal_design_system";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 25_000;
const MAX_ATTEMPTS = 3;
const MAX_TOKENS = 2400;

const MIN_SECTION_LEN = 20;
const MAX_SECTION_LEN = 900;
const MIN_PALETTE = 4;
const MAX_PALETTE = 6;
const MAX_STYLE_TAGS = 8;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const SYSTEM_PROMPT = `You are a senior design director who synthesizes a designer's own description of their portfolio into a structured "Personal Design System" — a reusable summary of their visual language.

The terminology must work for ANY visual design discipline the designer names (graphic design, branding/identity, packaging, illustration, editorial/print, UI/product, or a mix) — never assume UI/product design specifically unless that is what they described.

Respond with strict JSON only, no markdown code fences, no commentary, in exactly this shape:
{"summary":{"en":"...","zh":"..."},"styleTags":["...","..."],"visualStyle":{"en":"...","zh":"..."},"colorSystem":{"en":"...","zh":"...","palette":[{"hex":"#RRGGBB","name":{"en":"...","zh":"..."}}, ...]},"typography":{"en":"...","zh":"..."},"composition":{"en":"...","zh":"..."},"signatureMotifs":{"en":"...","zh":"..."},"imageLanguage":{"en":"...","zh":"..."},"designPrinciples":{"en":"...","zh":"..."}}

Rules:
- "summary" is a single confident sentence naming the core of this designer's visual identity (both languages).
- "styleTags" is an array of 3-${MAX_STYLE_TAGS} short lowercase English keywords.
- Every other section ("visualStyle", "colorSystem", "typography", "composition", "signatureMotifs", "imageLanguage", "designPrinciples") must have non-empty "en" and "zh" (Simplified Chinese) prose, each ${MIN_SECTION_LEN}-${MAX_SECTION_LEN} characters, written as a confident description of THIS designer's habits and choices — not generic design-theory text a textbook would say about anyone.
  - "visualStyle": the overall aesthetic in one connected description.
  - "colorSystem": how they use color — plus a "palette" array of ${MIN_PALETTE}-${MAX_PALETTE} representative hex swatches (each a valid 6-digit "#RRGGBB" value) with a short bilingual name for each swatch, all grounded in colors the description actually implies.
  - "typography": type choices and habits (or, if the description gives no typography signal, the most reasonable inference from the described medium — state it as an inference, not invented specifics like real typeface names that were never mentioned).
  - "composition": layout, spacing, grid, and structural habits.
  - "signatureMotifs": recurring visual devices, shapes, or details that recur across their work.
  - "imageLanguage": how they use image, illustration, or photography — texture, rendering style, subject treatment.
  - "designPrinciples": 2-4 underlying principles that seem to guide their decisions, stated as principles, not a re-list of the other sections.
- Ground every section in details the designer's own text actually gives or clearly implies. Do not invent specific client names, brand names, dates, or awards that were not mentioned.
- Do not imitate, reproduce, or attribute the style to a specific named living artist, studio, or existing brand's identifiable identity — describe the designer's own visual language in its own terms.
- Output valid JSON only — no markdown fences, no text before or after the JSON object.`;

function disciplineContext(disciplineId: string): string {
  const discipline = getDisciplineById(disciplineId);
  if (!discipline) return "";
  return `Primary discipline: ${discipline.label.en}.`;
}

function buildUserMessage(input: PersonalDesignSystemInput): string {
  const sections = [
    `PORTFOLIO DESCRIPTION (written by the designer, in their own words)\n"${input.portfolioDescription}"`,
  ];
  const discipline = disciplineContext(input.discipline);
  if (discipline) sections.push(discipline);
  if (input.designerName) {
    sections.push(`Designer / studio name (for context only, do not invent facts about them beyond this): "${input.designerName}"`);
  }
  return sections.join("\n\n");
}

let _client: OpenAI | null | undefined;
function getClient(): OpenAI | null {
  if (_client !== undefined) return _client;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    _client = null;
    return null;
  }
  try {
    _client = new OpenAI({ apiKey: key, timeout: TIMEOUT_MS });
  } catch {
    _client = null;
  }
  return _client;
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isBilingual(v: unknown): v is { en: string; zh: string } {
  if (!v || typeof v !== "object") return false;
  const obj = v as Record<string, unknown>;
  return isNonEmptyString(obj.en) && isNonEmptyString(obj.zh);
}

function isValidSection(v: unknown): v is { en: string; zh: string } {
  if (!isBilingual(v)) return false;
  const obj = v as { en: string; zh: string };
  return (
    obj.en.trim().length >= MIN_SECTION_LEN &&
    obj.en.trim().length <= MAX_SECTION_LEN &&
    obj.zh.trim().length >= MIN_SECTION_LEN &&
    obj.zh.trim().length <= MAX_SECTION_LEN
  );
}

function parsePalette(v: unknown): ColorSwatch[] | null {
  if (!Array.isArray(v) || v.length < MIN_PALETTE || v.length > MAX_PALETTE) return null;
  const palette: ColorSwatch[] = [];
  for (const entry of v) {
    if (!entry || typeof entry !== "object") return null;
    const obj = entry as Record<string, unknown>;
    if (typeof obj.hex !== "string" || !HEX_RE.test(obj.hex.trim())) return null;
    if (!isBilingual(obj.name)) return null;
    palette.push({
      hex: obj.hex.trim().toUpperCase(),
      name: { en: (obj.name as { en: string }).en.trim(), zh: (obj.name as { zh: string }).zh.trim() },
    });
  }
  return palette;
}

/**
 * Pure — no network. Parses and validates one raw model response string
 * against the required PersonalDesignSystemResult shape. Never throws;
 * returns a discriminated result instead.
 */
export function parseAndValidatePersonalDesignSystem(
  raw: string,
): { ok: true; result: PersonalDesignSystemResult } | { ok: false; reason: string } {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, reason: "malformed_json" };
  }
  if (!parsed || typeof parsed !== "object") {
    return { ok: false, reason: "not_an_object" };
  }
  const d = parsed as Record<string, unknown>;

  if (!isBilingual(d.summary)) return { ok: false, reason: "invalid_summary" };
  if (
    !Array.isArray(d.styleTags) ||
    d.styleTags.length < 1 ||
    d.styleTags.length > MAX_STYLE_TAGS ||
    !d.styleTags.every((t) => isNonEmptyString(t))
  ) {
    return { ok: false, reason: "invalid_styleTags" };
  }

  for (const key of [
    "visualStyle",
    "typography",
    "composition",
    "signatureMotifs",
    "imageLanguage",
    "designPrinciples",
  ] as const) {
    if (!isValidSection(d[key])) return { ok: false, reason: `invalid_${key}` };
  }

  if (!d.colorSystem || typeof d.colorSystem !== "object") {
    return { ok: false, reason: "invalid_colorSystem" };
  }
  const colorSystem = d.colorSystem as Record<string, unknown>;
  if (!isValidSection({ en: colorSystem.en, zh: colorSystem.zh })) {
    return { ok: false, reason: "invalid_colorSystem_text" };
  }
  const palette = parsePalette(colorSystem.palette);
  if (!palette) return { ok: false, reason: "invalid_colorSystem_palette" };

  const result: PersonalDesignSystemResult = {
    summary: {
      en: (d.summary as { en: string }).en.trim(),
      zh: (d.summary as { zh: string }).zh.trim(),
    },
    styleTags: (d.styleTags as string[]).map((t) => t.trim()),
    visualStyle: sectionOf(d.visualStyle),
    colorSystem: { en: String(colorSystem.en).trim(), zh: String(colorSystem.zh).trim(), palette },
    typography: sectionOf(d.typography),
    composition: sectionOf(d.composition),
    signatureMotifs: sectionOf(d.signatureMotifs),
    imageLanguage: sectionOf(d.imageLanguage),
    designPrinciples: sectionOf(d.designPrinciples),
  };
  return { ok: true, result };
}

function sectionOf(v: unknown): { en: string; zh: string } {
  const obj = v as { en: string; zh: string };
  return { en: obj.en.trim(), zh: obj.zh.trim() };
}

export type GeneratePersonalDesignSystemFailureKind =
  | "missing_api_key"
  | "invalid_input"
  | "rate_limited"
  | "timeout"
  | "upstream_error";

/**
 * Calls OpenAI to generate one Personal Design System for the given
 * (already-validated-by-the-caller) input. Retries on transient errors and
 * on malformed/invalid model output, up to MAX_ATTEMPTS. Returns a sanitized
 * error string on failure — never the raw SDK error, never the API key, and
 * never any static/hardcoded design-system content (there is none in this
 * module or its imports to fall back to).
 */
export async function generatePersonalDesignSystem(
  input: PersonalDesignSystemInput,
): Promise<
  | { success: true; result: PersonalDesignSystemResult }
  | { success: false; error: string; kind: GeneratePersonalDesignSystemFailureKind }
> {
  const client = getClient();
  if (!client) {
    console.error("[personalDesignSystemOpenAI] error=missing_api_key");
    return {
      success: false,
      error: "Design system generation is temporarily unavailable.",
      kind: "missing_api_key",
    };
  }

  const userMessage = buildUserMessage(input);

  let lastFailureReason = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const t0 = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });
      const elapsedMs = Date.now() - t0;
      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
      const result = parseAndValidatePersonalDesignSystem(raw);
      if (result.ok) {
        return { success: true, result: result.result };
      }
      lastFailureReason = "invalid_response";
      console.error(
        `[personalDesignSystemOpenAI] attempt=${attempt} elapsedMs=${elapsedMs} error=invalid_response reason=${result.reason}`,
      );
    } catch (err) {
      const elapsedMs = Date.now() - t0;
      if (err instanceof OpenAI.RateLimitError) {
        console.error(`[personalDesignSystemOpenAI] attempt=${attempt} elapsedMs=${elapsedMs} error=rate_limited`);
        return {
          success: false,
          error: "Design system generation is busy right now. Please try again in a moment.",
          kind: "rate_limited",
        };
      }
      if (err instanceof OpenAI.APIConnectionTimeoutError) {
        lastFailureReason = "timeout";
        console.error(`[personalDesignSystemOpenAI] attempt=${attempt} elapsedMs=${elapsedMs} error=timeout`);
        continue;
      }
      if (err instanceof OpenAI.APIError) {
        lastFailureReason = "api_error";
        console.error(
          `[personalDesignSystemOpenAI] attempt=${attempt} elapsedMs=${elapsedMs} error=api_error status=${err.status} message=${err.message}`,
        );
        continue;
      }
      lastFailureReason = "unexpected";
      console.error(
        `[personalDesignSystemOpenAI] attempt=${attempt} elapsedMs=${elapsedMs} error=unexpected message=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (lastFailureReason === "timeout") {
    return {
      success: false,
      error: "Design system generation is taking too long. Please try again.",
      kind: "timeout",
    };
  }
  return {
    success: false,
    error: "Could not generate your design system right now. Please try again.",
    kind: "upstream_error",
  };
}
