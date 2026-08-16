import { NextResponse } from "next/server";
import { buildAgentPlan } from "@/lib/agent/plan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Design-agent planning endpoint. Reasoning stays server-side (it needs the
// capability KB + matcher); EXECUTION stays client-side so generation reuses the
// existing authed services and long image jobs never hit a serverless timeout.
// See curify-studio/docs/design-agent-v0-spec.md §7c/§7d.

const MAX_QUERY_LEN = 400;

export async function POST(req: Request) {
  let body: { query?: unknown; hasImage?: unknown; locale?: unknown; workflowDomain?: unknown; direction?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const hasImage = body.hasImage === true;
  const locale = typeof body.locale === "string" ? body.locale : "en";
  // Stated by a workflow entry point; validated against the ladder registry
  // in buildAgentPlan, so an unknown value falls back to normal classification.
  const workflowDomain =
    typeof body.workflowDomain === "string" ? body.workflowDomain : undefined;
  // Present once the user has confirmed a direction — until then the planner
  // returns a single gate step rather than the full ladder.
  const direction = typeof body.direction === "string" ? body.direction : undefined;

  if (!query || query.length > MAX_QUERY_LEN) {
    return NextResponse.json(
      { error: `query must contain 1-${MAX_QUERY_LEN} characters` },
      { status: 400 },
    );
  }

  try {
    const plan = await buildAgentPlan(query, { hasImage, locale, workflowDomain, direction });
    return NextResponse.json(plan);
  } catch (error) {
    console.error("[design-agent/plan]", error);
    return NextResponse.json({ error: "unable to build a plan" }, { status: 500 });
  }
}
