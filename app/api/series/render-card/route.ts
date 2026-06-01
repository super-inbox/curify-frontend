import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { renderCard } from "@/lib/series/renderer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingBody = {
  image_prompt?: unknown;
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

  if (typeof body.image_prompt !== "string" || body.image_prompt.length === 0) {
    return NextResponse.json(
      { success: false, message: "Expected { image_prompt: string }" },
      { status: 400 },
    );
  }

  const r = await renderCard(body.image_prompt);
  if (!r.ok) {
    return NextResponse.json(
      { success: false, message: r.reason },
      { status: 502 },
    );
  }

  return NextResponse.json({ success: true, image_url: r.image_url });
}
