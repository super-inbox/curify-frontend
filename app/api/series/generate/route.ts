import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { planSeries } from "@/lib/series/planner";
import { renderCard } from "@/lib/series/renderer";

// node:crypto + openai SDK require the Node runtime, not Edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingBody = {
  template_id?: unknown;
  params?: unknown;
  locale?: unknown;
};

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

  const renders = await Promise.all(
    result.spec.cards.map((c) => renderCard(c.image_prompt)),
  );

  return NextResponse.json({
    success: true,
    series_id: result.spec.series_id,
    cards: result.spec.cards.map((c, i) => {
      const r = renders[i];
      return {
        card_id: c.card_id,
        order: c.order,
        role: c.role,
        title: c.title,
        image_url: r.ok ? r.image_url : undefined,
        status: r.ok ? ("done" as const) : ("failed" as const),
        error: r.ok ? undefined : r.reason,
      };
    }),
    plan: result.spec,
  });
}
