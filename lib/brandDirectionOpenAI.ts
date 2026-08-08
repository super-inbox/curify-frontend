// lib/brandDirectionOpenAI.ts
//
// Server-only. `import "server-only"` below makes any client component that
// imports this module fail the Next.js build (same enforcement mechanism as
// lib/topicRegistry.ts) — the OpenAI key and prompt logic here must never
// reach the browser bundle.
//
// This is the ONLY module that calls OpenAI for the Brand Direction
// Explorer's Stage 1 (creative-direction generation). It is called
// exclusively from app/api/brand-direction-explorer/directions/route.ts.
// Stage 2 (final image generation) is unrelated and untouched — it calls a
// separate, Gemini-backed external backend via services/useFreeformGenerate.ts.
//
// There is no static/hardcoded direction content anywhere that this module
// (or anything it imports) can fall back to on failure — the failure branch
// of generateCreativeDirections carries only a sanitized error string.

import "server-only";

import OpenAI from "openai";
import {
  buildProjectBrief,
  type BrandDirectionCase,
  type GeneratedCreativeDirection,
} from "./brand_direction_explorer";

const MODEL = "gpt-4o-mini";
const TIMEOUT_MS = 20_000;
const MAX_ATTEMPTS = 3;
const MAX_TOKENS = 2200;

const MIN_PROMPT_MODIFIER_LEN = 40;
const MAX_PROMPT_MODIFIER_LEN = 1200;
const MAX_STYLE_TAGS = 8;

// Case-agnostic style exemplar for the system prompt only — lives here, not
// in lib/brand_direction_explorer.ts, and is never exported or returned to a
// caller. Illustrative only; the model is explicitly told not to reuse it.
const STYLE_EXEMPLAR =
  'Composition: centered flat-lay or studio product shot on a plain backdrop, generous negative space, strict ' +
  'grid alignment. Palette: cream-white background, deep espresso-brown accents, at most one extra accent color. ' +
  'Materials/texture: matte paper, a subtle concrete or micro-cement texture panel, precise hard drop shadows. ' +
  'Typography: bold modern geometric sans-serif headline; a small-caps subhead carries the key date or label. ' +
  'Mood: confident, minimal, design-forward, premium.';

const SYSTEM_PROMPT = `You are a senior creative director generating distinct visual creative directions for a design brief.

Respond with strict JSON only, no markdown code fences, no commentary, in exactly this shape:
{"directions":[{"id":"...","title":{"en":"...","zh":"..."},"subtitle":{"en":"...","zh":"..."},"description":{"en":"...","zh":"..."},"styleTags":["...","..."],"promptModifier":"..."}, ...]}

Style-writing example for the "promptModifier" field (illustrative only — do not reuse this content verbatim; produce a new concept for the given brief):
${STYLE_EXEMPLAR}

Rules:
- Return EXACTLY 3 directions in the "directions" array.
- The 3 directions must be meaningfully different from each other in composition, palette, materials, and mood — not the same concept with a color swap.
- Every "id" must be a short unique kebab-case slug (e.g. "warm-neighborhood") and all 3 ids must be distinct.
- "title", "subtitle", and "description" must each have non-empty "en" and "zh" (Simplified Chinese) strings.
- "styleTags" is an array of 1-${MAX_STYLE_TAGS} short lowercase English style keywords.
- "promptModifier" must be a single paragraph of ${MIN_PROMPT_MODIFIER_LEN}-${MAX_PROMPT_MODIFIER_LEN} characters, written in the Composition/Palette/Materials/Typography/Mood style shown above, describing one concrete image concept — not a list of bare adjectives.
- Do not invent facts (names, dates, places, claims) beyond what the project brief provides.
- Output valid JSON only — no markdown fences, no text before or after the JSON object.`;

function outputFormatContext(brandCase: BrandDirectionCase): string {
  const surfaceLabel =
    brandCase.outputFormat.surface === "poster" ? "poster" : "moodboard";
  return (
    `Output surface: a ${brandCase.outputFormat.aspectRatio} vertical ${surfaceLabel}. ` +
    `Directions should be composable at that aspect ratio.`
  );
}

function buildUserMessage(brandCase: BrandDirectionCase, brief: string): string {
  return [
    `PROJECT BRIEF\n${brief}`,
    outputFormatContext(brandCase),
  ].join("\n\n");
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

/**
 * Pure — no network. Parses and validates one raw model response string
 * against the required GeneratedCreativeDirection[] shape: strict JSON,
 * exactly 3 entries, every required field present and well-formed, unique
 * ids. Never throws; returns a discriminated result instead.
 */
export function parseAndValidateDirections(
  raw: string,
): { ok: true; directions: GeneratedCreativeDirection[] } | { ok: false; reason: string } {
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

  if (!parsed || typeof parsed !== "object" || !Array.isArray((parsed as Record<string, unknown>).directions)) {
    return { ok: false, reason: "missing_directions_array" };
  }

  const rawDirections = (parsed as { directions: unknown[] }).directions;
  if (rawDirections.length !== 3) {
    return { ok: false, reason: `expected_3_directions_got_${rawDirections.length}` };
  }

  const directions: GeneratedCreativeDirection[] = [];
  const seenIds = new Set<string>();

  for (let i = 0; i < rawDirections.length; i += 1) {
    const entry = rawDirections[i];
    if (!entry || typeof entry !== "object") {
      return { ok: false, reason: `direction_${i}_not_an_object` };
    }
    const d = entry as Record<string, unknown>;

    if (!isNonEmptyString(d.id)) {
      return { ok: false, reason: `direction_${i}_missing_id` };
    }
    const id = d.id.trim();
    if (seenIds.has(id)) {
      return { ok: false, reason: `duplicate_direction_id_${id}` };
    }

    if (!isBilingual(d.title)) {
      return { ok: false, reason: `direction_${i}_invalid_title` };
    }
    if (!isBilingual(d.subtitle)) {
      return { ok: false, reason: `direction_${i}_invalid_subtitle` };
    }
    if (!isBilingual(d.description)) {
      return { ok: false, reason: `direction_${i}_invalid_description` };
    }

    if (
      !Array.isArray(d.styleTags) ||
      d.styleTags.length < 1 ||
      d.styleTags.length > MAX_STYLE_TAGS ||
      !d.styleTags.every((t) => isNonEmptyString(t))
    ) {
      return { ok: false, reason: `direction_${i}_invalid_styleTags` };
    }

    if (
      !isNonEmptyString(d.promptModifier) ||
      d.promptModifier.trim().length < MIN_PROMPT_MODIFIER_LEN ||
      d.promptModifier.trim().length > MAX_PROMPT_MODIFIER_LEN
    ) {
      return { ok: false, reason: `direction_${i}_invalid_promptModifier` };
    }

    seenIds.add(id);
    directions.push({
      id,
      title: { en: (d.title as { en: string }).en.trim(), zh: (d.title as { zh: string }).zh.trim() },
      subtitle: { en: (d.subtitle as { en: string }).en.trim(), zh: (d.subtitle as { zh: string }).zh.trim() },
      description: {
        en: (d.description as { en: string }).en.trim(),
        zh: (d.description as { zh: string }).zh.trim(),
      },
      styleTags: (d.styleTags as string[]).map((t) => t.trim()),
      promptModifier: d.promptModifier.trim(),
    });
  }

  return { ok: true, directions };
}

/**
 * Calls OpenAI to generate exactly 3 creative directions for the given case
 * and (already-validated-by-the-caller) field values. Retries on transient
 * errors and on malformed/invalid model output, up to MAX_ATTEMPTS. Returns
 * a sanitized error string on failure — never the raw SDK error, never the
 * API key, and never any static/hardcoded direction content (there is none
 * in this module or its imports to fall back to).
 */
export type GenerateDirectionsFailureKind =
  | "missing_api_key"
  | "invalid_input"
  | "rate_limited"
  | "timeout"
  | "upstream_error";

export async function generateCreativeDirections(
  brandCase: BrandDirectionCase,
  fieldValues: Record<string, string>,
): Promise<
  | { success: true; directions: GeneratedCreativeDirection[] }
  | { success: false; error: string; kind: GenerateDirectionsFailureKind }
> {
  const client = getClient();
  if (!client) {
    console.error(`[brandDirectionOpenAI] caseId=${brandCase.id} error=missing_api_key`);
    return {
      success: false,
      error: "Direction generation is temporarily unavailable.",
      kind: "missing_api_key",
    };
  }

  let brief: string;
  try {
    brief = buildProjectBrief(brandCase, fieldValues);
  } catch (e) {
    console.error(
      `[brandDirectionOpenAI] caseId=${brandCase.id} error=invalid_brief message=${e instanceof Error ? e.message : String(e)}`,
    );
    return {
      success: false,
      error: "Could not generate directions right now. Please try again.",
      kind: "invalid_input",
    };
  }

  const userMessage = buildUserMessage(brandCase, brief);

  let lastFailureReason = "unknown";
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const t0 = Date.now();
    try {
      const res = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.9,
        max_tokens: MAX_TOKENS,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      });
      const elapsedMs = Date.now() - t0;
      const raw = res.choices?.[0]?.message?.content?.trim() ?? "";
      const result = parseAndValidateDirections(raw);
      if (result.ok) {
        return { success: true, directions: result.directions };
      }
      lastFailureReason = "invalid_response";
      console.error(
        `[brandDirectionOpenAI] caseId=${brandCase.id} attempt=${attempt} elapsedMs=${elapsedMs} error=invalid_response reason=${result.reason}`,
      );
    } catch (err) {
      const elapsedMs = Date.now() - t0;
      if (err instanceof OpenAI.RateLimitError) {
        console.error(`[brandDirectionOpenAI] caseId=${brandCase.id} attempt=${attempt} elapsedMs=${elapsedMs} error=rate_limited`);
        return {
          success: false,
          error: "Direction generation is busy right now. Please try again in a moment.",
          kind: "rate_limited",
        };
      }
      if (err instanceof OpenAI.APIConnectionTimeoutError) {
        lastFailureReason = "timeout";
        console.error(`[brandDirectionOpenAI] caseId=${brandCase.id} attempt=${attempt} elapsedMs=${elapsedMs} error=timeout`);
        continue;
      }
      if (err instanceof OpenAI.APIError) {
        lastFailureReason = "api_error";
        console.error(
          `[brandDirectionOpenAI] caseId=${brandCase.id} attempt=${attempt} elapsedMs=${elapsedMs} error=api_error status=${err.status} message=${err.message}`,
        );
        continue;
      }
      lastFailureReason = "unexpected";
      console.error(
        `[brandDirectionOpenAI] caseId=${brandCase.id} attempt=${attempt} elapsedMs=${elapsedMs} error=unexpected message=${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  if (lastFailureReason === "timeout") {
    return {
      success: false,
      error: "Direction generation is taking too long. Please try again.",
      kind: "timeout",
    };
  }
  return {
    success: false,
    error: "Could not generate directions right now. Please try again.",
    kind: "upstream_error",
  };
}
