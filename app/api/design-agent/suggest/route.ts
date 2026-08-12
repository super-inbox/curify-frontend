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
    imageRef?: unknown;
    query?: unknown;
    completedToolIds?: unknown;
    producedKeys?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  // Accept either the uploaded blob_url (ReferenceImageUpload) or a data: URL.
  const imageRef =
    typeof body.imageRef === "string" &&
    (body.imageRef.startsWith("data:image/") || /^https?:\/\//.test(body.imageRef))
      ? body.imageRef
      : undefined;
  if (imageRef && imageRef.length > MAX_IMAGE_CHARS) {
    return NextResponse.json({ error: "image too large" }, { status: 413 });
  }

  try {
    const result = await buildSuggestions({
      imageRef,
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
