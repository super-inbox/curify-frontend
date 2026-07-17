import { NextResponse } from "next/server";
import { buildSearchGenerationPlan } from "@/lib/searchGenerationPlan";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_QUERY_LENGTH = 200;

export async function POST(request: Request) {
  let body: { query?: unknown; locale?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const query = typeof body.query === "string" ? body.query.trim() : "";
  const locale = typeof body.locale === "string" ? body.locale : "en";
  if (!query || query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: "query must contain 1-200 characters" },
      { status: 400 },
    );
  }

  try {
    const plan = await buildSearchGenerationPlan(query, locale);
    return NextResponse.json(plan);
  } catch (error) {
    console.error("[search-generation-plan]", error);
    return NextResponse.json(
      { error: "unable to build generation plan" },
      { status: 500 },
    );
  }
}
