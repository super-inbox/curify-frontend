import { NextResponse } from "next/server";
import { getBrandDirectionCase } from "@/lib/brand_direction_explorer";
import { generateCreativeDirections } from "@/lib/brandDirectionOpenAI";
import { directionCaseFor } from "@/lib/agent/direction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/design-agent/directions
//
// The agent's creative-direction step. Deliberately NOT a second direction
// generator: it adapts a free-text brief onto an existing
// brand-direction-explorer case and calls the same generateCreativeDirections
// the /brand-direction-explorer tool uses, so directions stay consistent
// wherever they are produced and there is one prompt to improve, not two.
//
// The adapter exists because that tool is form-driven (a case with required
// fields) while the agent has one sentence. Mapping the sentence onto the
// case's fields is the whole job here.
//
// Inputs:  { query: string; domain: string; locale?: string }
// Returns: { success, directions } | { success: false, error }

const MAX_QUERY = 400;

/**
 * Pre-fill what the brief can honestly supply; the client collects the rest.
 *
 * Every field is `required: true` and the generator rejects blanks — correctly:
 * it will not invent a brand name, and we must not either, because an invented
 * name gets rendered into the artwork as if the user had chosen it. So the
 * descriptive fields come from the brief and identity fields (name, date,
 * venue) are asked for. That is the "provide a few required facts" step the
 * zero-prompt exploration prescribes, arrived at from the other direction.
 */
function fieldValuesFor(caseId: string, query: string): Record<string, string> {
  const brief = query.slice(0, MAX_QUERY);
  if (caseId === "tea-brand-exploration") {
    return {
      brandName: "",                       // unknown — the model must not print one
      productType: brief,
      brandDescription: brief,
      applications: "logo, packaging, signage, social",
      desiredTone: brief,
    };
  }
  if (caseId === "coffee-opening") {
    return { shopName: "", openingDate: "", location: "", offerDetails: brief };
  }
  return { eventName: "", eventDate: "", venue: "", details: brief };
}

export async function POST(req: Request) {
  let body: { query?: unknown; domain?: unknown; fieldValues?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const domain = typeof body.domain === "string" ? body.domain : "";
  if (!query || query.length > MAX_QUERY) {
    return NextResponse.json(
      { success: false, error: `query must contain 1-${MAX_QUERY} characters` },
      { status: 400 },
    );
  }

  const caseId = directionCaseFor(domain);
  const brandCase = caseId ? getBrandDirectionCase(caseId) : undefined;
  if (!brandCase) {
    return NextResponse.json(
      { success: false, error: `no direction case is mapped for "${domain}"` },
      { status: 400 },
    );
  }

  // Client-supplied facts win; derived brief values fill the rest.
  const supplied =
    body.fieldValues && typeof body.fieldValues === "object" && !Array.isArray(body.fieldValues)
      ? (body.fieldValues as Record<string, unknown>)
      : {};
  const values = fieldValuesFor(brandCase.id, query);
  for (const [k, v] of Object.entries(supplied)) {
    if (typeof v === "string" && v.trim()) values[k] = v.trim().slice(0, 200);
  }

  const missing = brandCase.inputFields
    .filter((f) => f.required && !values[f.id]?.trim())
    .map((f) => ({ id: f.id, label: f.label.en, placeholder: f.placeholder?.en ?? "" }));
  if (missing.length) {
    // Not an error — the agent needs these before it can propose anything.
    return NextResponse.json({ success: false, needFields: missing, caseId: brandCase.id }, { status: 200 });
  }
  // Blank the placeholders the adapter could not fill, so the generator sees an
  // empty string rather than a required-field validation error.
  for (const f of brandCase.inputFields) {
    if (!(f.id in values)) values[f.id] = "";
  }

  try {
    const result = await generateCreativeDirections(brandCase, values);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 502 });
    }
    return NextResponse.json({ success: true, directions: result.directions });
  } catch (error) {
    console.error("[design-agent/directions]", error);
    return NextResponse.json(
      { success: false, error: "Could not generate directions." },
      { status: 500 },
    );
  }
}
