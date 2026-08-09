import { NextResponse } from "next/server";
import { getBrandDirectionCase, type BrandDirectionInputField } from "@/lib/brand_direction_explorer";
import {
  generateCreativeDirections,
  type GenerateDirectionsFailureKind,
} from "@/lib/brandDirectionOpenAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/brand-direction-explorer/directions
//
// Inputs:  { caseId: string; fieldValues: Record<string, string> }
// Effect:  validates the request against the case's own inputFields (no
//          separate validation schema — reuses lib/brand_direction_explorer.ts
//          metadata), then calls the server-only OpenAI module for exactly 3
//          creative directions.
// Returns: { success: true; directions: GeneratedCreativeDirection[] }
//       or { success: false; error: string } with an appropriate status.
//
// This is the only caller of lib/brandDirectionOpenAI.ts. It does not gate
// on login/credits — direction browsing has always been pre-login content;
// only Stage 2 (final image generation, unrelated to this route) is gated.

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

export async function POST(req: Request) {
  let body: { caseId?: unknown; fieldValues?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
  }

  const { caseId, fieldValues } = body;
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

  const result = await generateCreativeDirections(brandCase, fieldValues as Record<string, string>);

  if (result.success) {
    return NextResponse.json({ success: true, directions: result.directions }, { status: 200 });
  }

  const status = STATUS_BY_FAILURE_KIND[result.kind] ?? 502;
  return NextResponse.json({ success: false, error: result.error }, { status });
}
