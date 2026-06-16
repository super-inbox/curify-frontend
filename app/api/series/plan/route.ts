import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { planSeries } from "@/lib/series/planner";

// node:crypto + openai SDK require the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingBody = {
  template_id?: unknown;
  params?: unknown;
  locale?: unknown;
};

// Plan-only: returns the series spec without rendering any images, so the
// client can paint a card grid with per-card spinners and then render each
// card in parallel via /api/series/render-card.
export async function POST(req: NextRequest) {
  let body: IncomingBody;
  try {
    body = (await req.json()) as IncomingBody;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (
    typeof body.template_id !== "string" ||
    typeof body.locale !== "string" ||
    typeof body.params !== "object" ||
    body.params === null ||
    Array.isArray(body.params)
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "Expected { template_id: string, params: object, locale: string }",
      },
      { status: 400 },
    );
  }

  const stringParams: Record<string, string> = Object.fromEntries(
    Object.entries(body.params as Record<string, unknown>).map(([k, v]) => [
      k,
      String(v ?? ""),
    ]),
  );

  const result = await planSeries({
    templateId: body.template_id,
    locale: body.locale,
    params: stringParams,
  });

  if (!result.ok) {
    // attempts === 0 means input was rejected before any LLM call → client error.
    const status = result.attempts === 0 ? 400 : 502;
    return NextResponse.json(
      { success: false, message: result.reason },
      { status },
    );
  }

  return NextResponse.json({
    success: true,
    series_id: result.spec.series_id,
    plan: result.spec,
  });
}
