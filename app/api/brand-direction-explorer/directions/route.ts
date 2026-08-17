import { NextResponse } from "next/server";
import {
  getBrandDirectionCase,
  MAX_PREFERENCE_FIELD_LEN,
  type BrandDirectionInputField,
  type PreferenceProfile,
} from "@/lib/brand_direction_explorer";
import {
  generateCreativeDirections,
  type GenerateDirectionsFailureKind,
} from "@/lib/brandDirectionOpenAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/brand-direction-explorer/directions
//
// Inputs:  { caseId: string; fieldValues: Record<string, string>; preferenceProfile?: { likes?: string; dislikes?: string } }
// Effect:  validates the request against the case's own inputFields (no
//          separate validation schema — reuses lib/brand_direction_explorer.ts
//          metadata) plus the optional preferenceProfile's shape, then calls
//          the server-only OpenAI module for exactly 3 creative directions.
// Returns: { success: true; directions: GeneratedCreativeDirection[] }
//       or { success: false; error: string } with an appropriate status.
//
// This is the only caller of lib/brandDirectionOpenAI.ts. It does not gate
// on login/credits — direction browsing has always been pre-login content;
// only Stage 2 (final image generation, unrelated to this route) is gated.
//
// preferenceProfile is entirely optional and backward-compatible: a request
// with no preferenceProfile field behaves identically to before this field
// existed (see lib/brandDirectionOpenAI.ts's buildUserMessage, which omits
// the VISUAL PREFERENCE section entirely when there is nothing to add).

const STATUS_BY_FAILURE_KIND: Record<GenerateDirectionsFailureKind, number> = {
  missing_api_key: 500,
  invalid_input: 400,
  rate_limited: 503,
  timeout: 504,
  upstream_error: 502,
};

function validateFieldValues(
  inputFields: BrandDirectionInputField[],
  fieldValues: unknown,
): { error: string } | null {
  if (!fieldValues || typeof fieldValues !== "object" || Array.isArray(fieldValues)) {
    return { error: "fieldValues must be an object" };
  }
  const values = fieldValues as Record<string, unknown>;

  for (const field of inputFields) {
    const raw = values[field.id];

    if (field.required) {
      if (typeof raw !== "string" || raw.trim().length === 0) {
        return { error: `Missing required field: ${field.id}` };
      }
    } else if (raw !== undefined && typeof raw !== "string") {
      return { error: `Field ${field.id} must be a string` };
    }

    if (typeof raw === "string" && raw.length > field.maxLength) {
      return { error: `Field ${field.id} exceeds max length of ${field.maxLength}` };
    }
  }

  return null;
}

const ALLOWED_PREFERENCE_KEYS = new Set(["likes", "dislikes"]);

// Strict shape check only (object, no unexpected keys, string values within
// the shared length cap) — this rejects arbitrary nested objects rather than
// silently accepting them. Content normalization (whitespace collapse, trim,
// empty→undefined) happens downstream in normalizePreferenceProfile, which
// this function does not duplicate.
function validatePreferenceProfile(preferenceProfile: unknown): { error: string } | null {
  if (preferenceProfile === undefined) return null;
  if (!preferenceProfile || typeof preferenceProfile !== "object" || Array.isArray(preferenceProfile)) {
    return { error: "preferenceProfile must be an object" };
  }
  const obj = preferenceProfile as Record<string, unknown>;

  for (const key of Object.keys(obj)) {
    if (!ALLOWED_PREFERENCE_KEYS.has(key)) {
      return { error: `preferenceProfile has unsupported field: ${key}` };
    }
  }

  for (const key of ["likes", "dislikes"] as const) {
    const value = obj[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      return { error: `preferenceProfile.${key} must be a string` };
    }
    if (value.length > MAX_PREFERENCE_FIELD_LEN) {
      return { error: `preferenceProfile.${key} exceeds max length of ${MAX_PREFERENCE_FIELD_LEN}` };
    }
  }

  return null;
}

export async function POST(req: Request) {
  let body: { caseId?: unknown; fieldValues?: unknown; preferenceProfile?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
  }

  const { caseId, fieldValues, preferenceProfile } = body;
  if (typeof caseId !== "string" || !caseId) {
    return NextResponse.json({ success: false, error: "caseId is required" }, { status: 400 });
  }

  const brandCase = getBrandDirectionCase(caseId);
  if (!brandCase) {
    return NextResponse.json({ success: false, error: `unknown caseId: ${caseId}` }, { status: 400 });
  }

  const validationError = validateFieldValues(brandCase.inputFields, fieldValues);
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError.error }, { status: 400 });
  }

  const preferenceValidationError = validatePreferenceProfile(preferenceProfile);
  if (preferenceValidationError) {
    return NextResponse.json({ success: false, error: preferenceValidationError.error }, { status: 400 });
  }

  const result = await generateCreativeDirections(
    brandCase,
    fieldValues as Record<string, string>,
    preferenceProfile as PreferenceProfile | undefined,
  );

  if (result.success) {
    return NextResponse.json({ success: true, directions: result.directions }, { status: 200 });
  }

  const status = STATUS_BY_FAILURE_KIND[result.kind] ?? 502;
  return NextResponse.json({ success: false, error: result.error }, { status });
}
