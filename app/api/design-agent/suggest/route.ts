import { NextResponse } from "next/server";
import { buildSuggestions } from "@/lib/agent/suggest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Next-action suggestions. Called on image pick (before upload, so anonymous
// users get suggestions without hitting the authed upload path) and again after
// a run completes, with the produced deliverables as state.

const MAX_IMAGE_CHARS = 1_500_000; // ~1MB of base64; client downsizes to 512px

export async function POST(req: Request) {
  let body: {
    imageDataUrl?: unknown;
    query?: unknown;
    completedToolIds?: unknown;
    producedKeys?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const imageDataUrl =
    typeof body.imageDataUrl === "string" && body.imageDataUrl.startsWith("data:image/")
      ? body.imageDataUrl
      : undefined;
  if (imageDataUrl && imageDataUrl.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "image too large" }, { status: 413 });
  }

  try {
    const result = await buildSuggestions({
      imageDataUrl,
      query: typeof body.query === "string" ? body.query : undefined,
      completedToolIds: Array.isArray(body.completedToolIds)
        ? (body.completedToolIds as string[])
        : undefined,
      producedKeys: Array.isArray(body.producedKeys)
        ? (body.producedKeys as string[])
        : undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("[design-agent/suggest]", error);
    return NextResponse.json({ error: "unable to suggest" }, { status: 500 });
  }
}
