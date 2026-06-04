import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { GoogleGenAI, Modality } from "@google/genai";
import { getStyleById } from "@/lib/illustrator_demo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Demo-only illustrator generation endpoint.
//
// Inputs:  POST { style_id, slug }
// Effect:  reads public/illustrator-demo/hand-draw.jpg as the structural
//          reference, calls Gemini 3 image-preview with the style's
//          full prompt, writes the resulting PNG to
//          /tmp/illustrator-demo/<slug>.png.
// Returns: { url } pointing at GET /api/illustrator-demo/image/<slug>.png
//
// Not metered. Not authed. Mirror of progseo-demo/generate/route.ts but
// image-conditioned (reference image + text prompt) instead of pure
// text-to-image, since the illustrator pipeline requires Gemini to
// preserve the sketch's pose and topology.

const DEMO_TMP_DIR = path.join(os.tmpdir(), "illustrator-demo");
const MODEL = "gemini-3-pro-image-preview";
const REFERENCE_FS_PATH = path.join(process.cwd(), "public", "illustrator-demo", "hand-draw.jpg");

const STRUCTURAL_INSTRUCTION =
  "\n\nReference image 1 is the structural source — use the requested sketch's pose, topology, and which-creature-is-fused-with-which-vessel relationship. Do NOT copy its hand-drawn pencil aesthetic; render in the finished style described above.";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  let body: { style_id?: string; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { style_id, slug } = body;
  if (!style_id || !slug) {
    return NextResponse.json(
      { error: "style_id and slug are required" },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug must match /^[a-z0-9-]+$/" },
      { status: 400 },
    );
  }

  const style = getStyleById(style_id);
  if (!style) {
    return NextResponse.json(
      { error: `unknown style_id: ${style_id}` },
      { status: 404 },
    );
  }

  let referenceB64: string;
  try {
    const buf = await fs.readFile(REFERENCE_FS_PATH);
    referenceB64 = buf.toString("base64");
  } catch (err) {
    return NextResponse.json(
      { error: `reference image not found at ${REFERENCE_FS_PATH}: ${err instanceof Error ? err.message : err}` },
      { status: 500 },
    );
  }

  let imageBuffer: Buffer;
  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: referenceB64 } },
            { text: style.prompt + STRUCTURAL_INSTRUCTION },
          ],
        },
      ],
      generationConfig: { responseModalities: [Modality.IMAGE, Modality.TEXT] },
    } as Parameters<typeof client.models.generateContent>[0]);

    const parts =
      (response as { candidates?: { content?: { parts?: Array<{ inlineData?: { data?: string }; text?: string }> } }[] })
        ?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p?.inlineData?.data);
    if (!imagePart?.inlineData?.data) {
      const text = parts.map((p) => p?.text || "").join("\n");
      return NextResponse.json(
        { error: `Gemini returned no image. Text: ${text.slice(0, 200) || "[none]"}` },
        { status: 502 },
      );
    }
    imageBuffer = Buffer.from(imagePart.inlineData.data, "base64");
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gemini call failed" },
      { status: 502 },
    );
  }

  await fs.mkdir(DEMO_TMP_DIR, { recursive: true });
  const outPath = path.join(DEMO_TMP_DIR, `${slug}.png`);
  await fs.writeFile(outPath, imageBuffer);

  return NextResponse.json({
    url: `/api/illustrator-demo/image/${slug}.png`,
    path: outPath,
    bytes: imageBuffer.length,
  });
}
