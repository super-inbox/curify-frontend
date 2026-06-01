import OpenAI from "openai";

const IMAGE_MODEL = process.env.SERIES_IMAGE_MODEL ?? "gpt-image-1";
const IMAGE_SIZE = (process.env.SERIES_IMAGE_SIZE ?? "1024x1536") as
  | "1024x1024"
  | "1024x1536"
  | "1536x1024"
  | "auto";
const IMAGE_QUALITY = (process.env.SERIES_IMAGE_QUALITY ?? "low") as
  | "low"
  | "medium"
  | "high"
  | "auto";

export type RenderCardResult =
  | { ok: true; image_url: string }
  | { ok: false; reason: string };

export async function renderCard(
  prompt: string,
  client?: OpenAI,
): Promise<RenderCardResult> {
  const openai = client ?? new OpenAI();
  try {
    const res = await openai.images.generate({
      model: IMAGE_MODEL,
      prompt,
      size: IMAGE_SIZE,
      quality: IMAGE_QUALITY,
      n: 1,
    });
    const b64 = res.data?.[0]?.b64_json;
    if (!b64) {
      return { ok: false, reason: "Image API returned no image data" };
    }
    return { ok: true, image_url: `data:image/png;base64,${b64}` };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
