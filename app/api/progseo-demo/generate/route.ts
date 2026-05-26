import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { GoogleGenAI, Modality } from "@google/genai";
import nanoTemplates from "@/public/data/nano_templates.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Demo-only image generation endpoint.
//
// Inputs:  POST { template_id, params, slug }
// Effect:  calls Gemini with the template's base_prompt + params filled
//          in, writes the resulting JPEG to /tmp/progseo-demo/<slug>.jpg.
// Returns: { url } pointing to GET /api/progseo-demo/image/<slug>.jpg
//
// Not metered. Not authed. Don't expose under a public marketing URL.

const DEMO_TMP_DIR = path.join(os.tmpdir(), "progseo-demo");
const MODEL = "gemini-3-pro-image-preview";

function fillPrompt(base: string, params: Record<string, string>): string {
  return base.replace(/\{(\w+)\}/g, (_, k) =>
    Object.prototype.hasOwnProperty.call(params, k) ? params[k] : `{${k}}`,
  );
}

type TemplateShape = {
  id: string;
  locales?: Record<string, { base_prompt?: string } | undefined>;
};

function findTemplate(template_id: string): TemplateShape | undefined {
  return (nanoTemplates as TemplateShape[]).find((t) => t.id === template_id);
}

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY missing" }, { status: 500 });
  }

  let body: { template_id?: string; params?: Record<string, string>; slug?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { template_id, params = {}, slug } = body;
  if (!template_id || !slug) {
    return NextResponse.json(
      { error: "template_id and slug are required" },
      { status: 400 },
    );
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "slug must match /^[a-z0-9-]+$/" },
      { status: 400 },
    );
  }

  const tpl = findTemplate(template_id);
  const basePrompt =
    tpl?.locales?.en?.base_prompt ?? tpl?.locales?.zh?.base_prompt;
  if (!basePrompt) {
    return NextResponse.json(
      { error: `template not found or has no base_prompt: ${template_id}` },
      { status: 404 },
    );
  }

  const prompt = fillPrompt(basePrompt, params);

  let imageBuffer: Buffer;
  try {
    const client = new GoogleGenAI({ apiKey });
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
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
  const outPath = path.join(DEMO_TMP_DIR, `${slug}.jpg`);
  await fs.writeFile(outPath, imageBuffer);

  return NextResponse.json({
    url: `/api/progseo-demo/image/${slug}.jpg`,
    path: outPath,
    bytes: imageBuffer.length,
  });
}
