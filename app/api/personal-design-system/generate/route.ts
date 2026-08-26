import { NextResponse } from "next/server";
import {
  getDisciplineById,
  MAX_DESIGNER_NAME_LEN,
  MAX_PORTFOLIO_DESCRIPTION_LEN,
  MIN_PORTFOLIO_DESCRIPTION_LEN,
  normalizePersonalDesignSystemInput,
  type PersonalDesignSystemInput,
} from "@/lib/personal_design_system";
import {
  generatePersonalDesignSystem,
  type GeneratePersonalDesignSystemFailureKind,
} from "@/lib/personalDesignSystemOpenAI";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/personal-design-system/generate
//
// Inputs:  { designerName?: string; discipline?: string; portfolioDescription: string }
// Effect:  validates the request, then calls the server-only OpenAI module
//          to synthesize one Personal Design System from the designer's own
//          free-text description of their portfolio. There is no portfolio
//          URL/image ingestion here — see the note at the top of
//          lib/personalDesignSystemOpenAI.ts.
// Returns: { success: true; result: PersonalDesignSystemResult }
//       or { success: false; error: string } with an appropriate status.
//
// Does not gate on login/product-credits — same pre-login-content posture as
// /api/brand-direction-explorer/directions. This route is text-only (no
// image generation) and never enters the image-generation credit flow, but
// the underlying OpenAI text call still has its own real API cost.

const STATUS_BY_FAILURE_KIND: Record<GeneratePersonalDesignSystemFailureKind, number> = {
  missing_api_key: 500,
  invalid_input: 400,
  rate_limited: 503,
  timeout: 504,
  upstream_error: 502,
};

function validateBody(body: unknown): { error: string } | { input: PersonalDesignSystemInput } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "request body must be an object" };
  }
  const obj = body as Record<string, unknown>;

  if (typeof obj.portfolioDescription !== "string") {
    return { error: "portfolioDescription is required" };
  }
  if (obj.portfolioDescription.trim().length < MIN_PORTFOLIO_DESCRIPTION_LEN) {
    return { error: `portfolioDescription must be at least ${MIN_PORTFOLIO_DESCRIPTION_LEN} characters` };
  }
  if (obj.portfolioDescription.length > MAX_PORTFOLIO_DESCRIPTION_LEN) {
    return { error: `portfolioDescription exceeds max length of ${MAX_PORTFOLIO_DESCRIPTION_LEN}` };
  }

  if (obj.designerName !== undefined) {
    if (typeof obj.designerName !== "string") {
      return { error: "designerName must be a string" };
    }
    if (obj.designerName.length > MAX_DESIGNER_NAME_LEN) {
      return { error: `designerName exceeds max length of ${MAX_DESIGNER_NAME_LEN}` };
    }
  }

  if (obj.discipline !== undefined) {
    if (typeof obj.discipline !== "string") {
      return { error: "discipline must be a string" };
    }
    if (obj.discipline && !getDisciplineById(obj.discipline)) {
      return { error: `unknown discipline: ${obj.discipline}` };
    }
  }

  return {
    input: {
      designerName: typeof obj.designerName === "string" ? obj.designerName : "",
      discipline: typeof obj.discipline === "string" ? obj.discipline : "",
      portfolioDescription: obj.portfolioDescription,
    },
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
  }

  const validated = validateBody(body);
  if ("error" in validated) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  let input: PersonalDesignSystemInput;
  try {
    input = normalizePersonalDesignSystemInput(validated.input);
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e instanceof Error ? e.message : "invalid input" },
      { status: 400 },
    );
  }

  const result = await generatePersonalDesignSystem(input);

  if (result.success) {
    return NextResponse.json({ success: true, result: result.result }, { status: 200 });
  }

  const status = STATUS_BY_FAILURE_KIND[result.kind] ?? 502;
  return NextResponse.json({ success: false, error: result.error }, { status });
}
